"use client";

import { useEffect, useRef, useState } from "react";
import styles from "../../files/files.module.css";
import { targetKey, type EditTarget as Target } from "@/lib/portfolio-editor";

type ResearchItem = { status: string; meta: string; title: string; description: string; doi: string; linkLabel: string; link: string };
type ExperienceItem = { dates: string; role: string; company: string; description: string };
type SiteSettings = { heroScale: number; headingScale: number; bodyScale: number; aboutEyebrowScale: number; sectionLabelScale: number; metaScale: number; aboutEyebrowTracking: number; researchTitleScale: number; experienceTitleScale: number; customLinks?: Record<string, string>; heroGreeting: string; heroDescription: string; aboutEyebrow: string; aboutHeadingPrimary: string; aboutHeadingAccent: string; aboutDescription: string; workLabel: string; workRange: string; workTag: string; workTitlePrimary: string; workTitleAccent: string; workDescription: string; workLinkLabel: string; workLink: string; researchLabel: string; researchHeadingPrimary: string; researchHeadingAccent: string; experienceLabel: string; educationLabel: string; educationHeadingPrimary: string; educationHeadingAccent: string; footerHeading: string };
type PortfolioContent = { research: ResearchItem[]; experience: ExperienceItem[]; settings: SiteSettings };

const blankResearch: ResearchItem = { status: "Under review", meta: "Journal / year", title: "", description: "", doi: "", linkLabel: "Read more", link: "" };
const blankExperience: ExperienceItem = { dates: "", role: "", company: "", description: "" };

export default function ContentAdmin() {
  const [content, setContent] = useState<PortfolioContent | null>(null);
  const [message, setMessage] = useState("Loading content...");
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<Target>({ scope: "settings", field: "heroGreeting", label: "Hero greeting", scale: "heroScale", base: 224, min: 180, max: 291 });
  const previewFrame = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    fetch("/api/admin/content").then(async (response) => {
      if (response.status === 401) throw new Error("Sign in at File Admin first.");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load content.");
      return data;
    }).then((data) => { setContent(data); setMessage(""); }).catch((error: Error) => setMessage(error.message));
  }, []);

  useEffect(() => {
    function receive(event: MessageEvent) {
      if (event.origin !== window.location.origin || !event.data) return;
      if (event.data.type === "portfolio-preview-select") setSelected(event.data.target as Target);
      if (event.data.type === "portfolio-preview-font") setScaleFor(event.data.target as Target, Number(event.data.size));
    }
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, []);

  useEffect(() => {
    if (content) previewFrame.current?.contentWindow?.postMessage({ type: "portfolio-preview-content", content }, window.location.origin);
  }, [content]);

  useEffect(() => { previewFrame.current?.contentWindow?.postMessage({ type: "portfolio-preview-selected", target: selected }, window.location.origin); }, [selected]);

  function updateSettings(field: keyof SiteSettings, value: string | number) { if (content) setContent({ ...content, settings: { ...content.settings, [field]: value } }); }
  function updateResearch(index: number, field: keyof ResearchItem, value: string) { if (content) { const research = [...content.research]; research[index] = { ...research[index], [field]: value }; setContent({ ...content, research }); } }
  function updateExperience(index: number, field: keyof ExperienceItem, value: string) { if (content) { const experience = [...content.experience]; experience[index] = { ...experience[index], [field]: value }; setContent({ ...content, experience }); } }
  function linkValue(target: Target) {
    if (!content) return "";
    if (target.scope === "settings" && target.field === "workLinkLabel") return content.settings.workLink;
    if (target.scope === "research" && target.field === "linkLabel") return content.research[target.index]?.link || "";
    return content.settings.customLinks?.[targetKey(target)] || "";
  }
  function updateLink(target: Target, value: string) {
    if (!content) return;
    if (target.scope === "settings" && target.field === "workLinkLabel") { updateSettings("workLink", value); return; }
    if (target.scope === "research" && target.field === "linkLabel") { updateResearch(target.index, "link", value); return; }
    const customLinks = { ...(content.settings.customLinks || {}) };
    if (value.trim()) customLinks[targetKey(target)] = value.trim(); else delete customLinks[targetKey(target)];
    setContent({ ...content, settings: { ...content.settings, customLinks } });
  }
  function valueOf(target: Target) { if (!content) return ""; if (target.scope === "settings") return String(content.settings[target.field]); if (target.scope === "research") return content.research[target.index]?.[target.field] || ""; return content.experience[target.index]?.[target.field] || ""; }
  function updateTarget(value: string) { if (selected.scope === "settings") updateSettings(selected.field, value); else if (selected.scope === "research") updateResearch(selected.index, selected.field, value); else updateExperience(selected.index, selected.field, value); }
  function setScale(value: number) { if (!content || !selected.scale || !selected.base) return; const min = selected.min ?? 10; const max = selected.max ?? 300; updateSettings(selected.scale, Math.max(min, Math.min(max, value)) / selected.base); }
  function setScaleFor(target: Target, value: number) { if (!target.scale || !target.base) return; const min = target.min ?? 10; const max = target.max ?? 300; updateSettings(target.scale as keyof SiteSettings, Math.max(min, Math.min(max, value)) / target.base); }
  function scaleValue() { return content && selected.scale && selected.base ? Math.round(content.settings[selected.scale] * selected.base) : 0; }
  function componentName(target: Target) { if (target.scope === "research") return `Research item ${target.index + 1}`; if (target.scope === "experience") return `Experience item ${target.index + 1}`; if (target.field.startsWith("hero")) return "Hero"; if (target.field.startsWith("about")) return "About"; if (target.field.startsWith("work")) return "Portfolio"; if (target.field.startsWith("research")) return "Research"; if (target.field.startsWith("experience")) return "Experience"; if (target.field.startsWith("education")) return "Education"; return "Footer"; }
  function move<T>(items: T[], index: number, direction: -1 | 1) { const target = index + direction; if (target < 0 || target >= items.length) return items; const copy = [...items]; [copy[index], copy[target]] = [copy[target], copy[index]]; return copy; }
  async function persist(value: PortfolioContent) { setSaving(true); setMessage("Publishing..."); try { const response = await fetch("/api/admin/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(value) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Could not publish."); setContent(data); setMessage("Published. Your portfolio is updated."); } catch (error) { setMessage(error instanceof Error ? error.message : "Could not publish."); } finally { setSaving(false); } }
  function save() { if (!content || saving) return; void persist(content); }
  function editable(target: Target, text: string, className = "") { let active = selected.scope === target.scope && selected.field === target.field; if (active && target.scope !== "settings" && selected.scope !== "settings") active = selected.index === target.index; return <button type="button" className={`${styles.editablePreview} ${active ? styles.editablePreviewActive : ""} ${className}`} onClick={() => setSelected(target)}>{text || "Click to add text"}</button>; }

  if (!content) return <main className={styles.page}><header className={styles.header}><a className={styles.brand} href="/">LA<sup>R</sup></a></header><p className={styles.status}>{message}</p></main>;
  const s = content.settings;
  return <main className={styles.page}>
    <header className={styles.header}><a className={styles.brand} href="/">LA<sup>R</sup></a><div className={styles.headerActions}><a className={styles.adminLink} href="/files/admin">File admin</a><a className={styles.adminLink} href="/">View portfolio</a></div></header>
    <section className={styles.adminIntro}><p className={styles.eyebrow}>Private area / portfolio</p><h1>Visual editor.</h1><p>Select a text block in the full preview, then edit its content, link and type settings in the focused panel. Changes are reflected immediately; publish when ready.</p><div className={styles.publishRow}><span className={styles.liveState}>LIVE PREVIEW</span><button className={styles.publishButton} onClick={() => void save()} disabled={saving}>{saving ? "Publishing..." : "Publish changes"}</button></div>{message && <p className={styles.message}>{message}</p>}</section>
    <section className={styles.visualEditor}>
      <div className={styles.fullPreview}><iframe ref={previewFrame} title="Full portfolio preview" src="/admin/content/preview" onLoad={() => { previewFrame.current?.contentWindow?.postMessage({ type: "portfolio-preview-content", content }, window.location.origin); previewFrame.current?.contentWindow?.postMessage({ type: "portfolio-preview-selected", target: selected }, window.location.origin); }} /></div>
      <aside className={styles.inspector}>
        <p className={styles.eyebrow}>Properties</p><span className={styles.componentName}>{componentName(selected)}</span><h2>{selected.label}</h2>
        <label>Content{selected.field === "description" || selected.field === "footerHeading" ? <textarea value={valueOf(selected)} onChange={(event) => updateTarget(event.target.value)} /> : <input value={valueOf(selected)} onChange={(event) => updateTarget(event.target.value)} />}</label>
        <label className={styles.linkControl}>Link destination <small>(optional)</small><input type="url" placeholder="https://example.com" value={linkValue(selected)} onChange={(event) => updateLink(selected, event.target.value)} /></label>
        {selected.scale && <div className={styles.inspectorControl}><span>Font size</span><div><button onClick={() => setScale(scaleValue() - 1)}>-</button><input type="number" value={scaleValue()} min={selected.min} max={selected.max} onChange={(event) => setScale(Number(event.target.value) || selected.min || 10)} /><em>px</em><button onClick={() => setScale(scaleValue() + 1)}>+</button></div></div>}
        {selected.scope === "settings" && selected.tracking && <label className={styles.inspectorTracking}>Letter spacing<input type="number" step="0.01" value={s.aboutEyebrowTracking} onChange={(event) => updateSettings("aboutEyebrowTracking", Math.max(0, Math.min(.25, Number(event.target.value) || 0)))} /><em>em</em></label>}
        <p className={styles.inspectorNote}>The preview is for selecting components. Edit safely here, where every change is controlled and immediately reflected.</p>
      </aside>
    </section>
    <section className={styles.editorSection}>
      <div className={styles.editorHead}><h2>Manage entries</h2><div><button onClick={() => setContent({ ...content, research: [...content.research, { ...blankResearch }] })}>Add research</button><button onClick={() => setContent({ ...content, experience: [...content.experience, { ...blankExperience }] })}>Add experience</button></div></div>
      <p className={styles.settingsHint}>Use these full forms to add or edit entries. The preview above updates as you type.</p>
      {content.research.map((item, index) => <article className={styles.editorCard} key={`research-${index}`}>
        <div className={styles.editorCardHead}><span>Research {index + 1}</span><div><button onClick={() => setContent({ ...content, research: move(content.research, index, -1) })} disabled={index === 0}>Move up</button><button onClick={() => setContent({ ...content, research: move(content.research, index, 1) })} disabled={index === content.research.length - 1}>Move down</button><button className={styles.deleteButton} onClick={() => setContent({ ...content, research: content.research.filter((_, itemIndex) => itemIndex !== index) })}>Remove</button></div></div>
        <div className={styles.editorGrid}><label>Status<input value={item.status} onChange={(event) => updateResearch(index, "status", event.target.value)} /></label><label>Journal / conference / year<input value={item.meta} onChange={(event) => updateResearch(index, "meta", event.target.value)} /></label></div>
        <label>Title<input value={item.title} onChange={(event) => updateResearch(index, "title", event.target.value)} /></label>
        <label>Description<textarea value={item.description} onChange={(event) => updateResearch(index, "description", event.target.value)} /></label>
        <div className={styles.editorGrid}><label>DOI (optional)<input placeholder="10.xxxx/xxxxx" value={item.doi} onChange={(event) => updateResearch(index, "doi", event.target.value)} /></label><label>Link text<input value={item.linkLabel} onChange={(event) => updateResearch(index, "linkLabel", event.target.value)} /></label></div>
        <label>Link URL (optional)<input type="url" placeholder="https://..." value={item.link} onChange={(event) => updateResearch(index, "link", event.target.value)} /></label>
      </article>)}
      {content.experience.map((item, index) => <article className={styles.editorCard} key={`experience-${index}`}>
        <div className={styles.editorCardHead}><span>Experience {index + 1}</span><div><button onClick={() => setContent({ ...content, experience: move(content.experience, index, -1) })} disabled={index === 0}>Move up</button><button onClick={() => setContent({ ...content, experience: move(content.experience, index, 1) })} disabled={index === content.experience.length - 1}>Move down</button><button className={styles.deleteButton} onClick={() => setContent({ ...content, experience: content.experience.filter((_, itemIndex) => itemIndex !== index) })}>Remove</button></div></div>
        <div className={styles.editorGrid}><label>Dates<input value={item.dates} onChange={(event) => updateExperience(index, "dates", event.target.value)} /></label><label>Role<input value={item.role} onChange={(event) => updateExperience(index, "role", event.target.value)} /></label></div>
        <label>Company<input value={item.company} onChange={(event) => updateExperience(index, "company", event.target.value)} /></label>
        <label>Description<textarea value={item.description} onChange={(event) => updateExperience(index, "description", event.target.value)} /></label>
      </article>)}
    </section>
  </main>;
}
