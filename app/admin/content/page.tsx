"use client";

import { useEffect, useRef, useState } from "react";
import styles from "../../files/files.module.css";
import type { EditTarget as Target } from "@/lib/portfolio-editor";

type ResearchItem = { status: string; meta: string; title: string; description: string; linkLabel: string; link: string };
type ExperienceItem = { dates: string; role: string; company: string; description: string };
type SiteSettings = { heroScale: number; headingScale: number; bodyScale: number; aboutEyebrowScale: number; sectionLabelScale: number; metaScale: number; aboutEyebrowTracking: number; researchTitleScale: number; experienceTitleScale: number; heroGreeting: string; heroDescription: string; aboutEyebrow: string; aboutHeadingPrimary: string; aboutHeadingAccent: string; aboutDescription: string; workLabel: string; workRange: string; workTag: string; workTitlePrimary: string; workTitleAccent: string; workDescription: string; workLinkLabel: string; workLink: string; researchLabel: string; researchHeadingPrimary: string; researchHeadingAccent: string; experienceLabel: string; educationLabel: string; educationHeadingPrimary: string; educationHeadingAccent: string; footerHeading: string };
type PortfolioContent = { research: ResearchItem[]; experience: ExperienceItem[]; settings: SiteSettings };

const blankResearch: ResearchItem = { status: "Under review", meta: "Journal / year", title: "", description: "", linkLabel: "Read more", link: "" };
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
      if (event.origin !== window.location.origin || !event.data || event.data.type !== "portfolio-preview-select") return;
      setSelected(event.data.target as Target);
    }
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, []);

  useEffect(() => {
    if (content) previewFrame.current?.contentWindow?.postMessage({ type: "portfolio-preview-content", content }, window.location.origin);
  }, [content]);

  function updateSettings(field: keyof SiteSettings, value: string | number) { if (content) setContent({ ...content, settings: { ...content.settings, [field]: value } }); }
  function updateResearch(index: number, field: keyof ResearchItem, value: string) { if (content) { const research = [...content.research]; research[index] = { ...research[index], [field]: value }; setContent({ ...content, research }); } }
  function updateExperience(index: number, field: keyof ExperienceItem, value: string) { if (content) { const experience = [...content.experience]; experience[index] = { ...experience[index], [field]: value }; setContent({ ...content, experience }); } }
  function valueOf(target: Target) { if (!content) return ""; if (target.scope === "settings") return String(content.settings[target.field]); if (target.scope === "research") return content.research[target.index]?.[target.field] || ""; return content.experience[target.index]?.[target.field] || ""; }
  function updateTarget(value: string) { if (selected.scope === "settings") updateSettings(selected.field, value); else if (selected.scope === "research") updateResearch(selected.index, selected.field, value); else updateExperience(selected.index, selected.field, value); }
  function setScale(value: number) { if (!content || !selected.scale || !selected.base) return; const min = selected.min ?? 10; const max = selected.max ?? 300; updateSettings(selected.scale, Math.max(min, Math.min(max, value)) / selected.base); }
  function scaleValue() { return content && selected.scale && selected.base ? Math.round(content.settings[selected.scale] * selected.base) : 0; }
  function componentName(target: Target) { if (target.scope === "research") return `Research item ${target.index + 1}`; if (target.scope === "experience") return `Experience item ${target.index + 1}`; if (target.field.startsWith("hero")) return "Hero"; if (target.field.startsWith("about")) return "About"; if (target.field.startsWith("work")) return "Portfolio"; if (target.field.startsWith("research")) return "Research"; if (target.field.startsWith("experience")) return "Experience"; if (target.field.startsWith("education")) return "Education"; return "Footer"; }
  function move<T>(items: T[], index: number, direction: -1 | 1) { const target = index + direction; if (target < 0 || target >= items.length) return items; const copy = [...items]; [copy[index], copy[target]] = [copy[target], copy[index]]; return copy; }
  async function save() { if (!content) return; setSaving(true); setMessage("Publishing..."); try { const response = await fetch("/api/admin/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(content) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Could not publish."); setContent(data); setMessage("Published. Your portfolio is updated."); } catch (error) { setMessage(error instanceof Error ? error.message : "Could not publish."); } finally { setSaving(false); } }
  function editable(target: Target, text: string, className = "") { let active = selected.scope === target.scope && selected.field === target.field; if (active && target.scope !== "settings" && selected.scope !== "settings") active = selected.index === target.index; return <button type="button" className={`${styles.editablePreview} ${active ? styles.editablePreviewActive : ""} ${className}`} onClick={() => setSelected(target)}>{text || "Click to add text"}</button>; }

  if (!content) return <main className={styles.page}><header className={styles.header}><a className={styles.brand} href="/">LA<sup>R</sup></a></header><p className={styles.status}>{message}</p></main>;
  const s = content.settings;
  return <main className={styles.page}>
    <header className={styles.header}><a className={styles.brand} href="/">LA<sup>R</sup></a><div className={styles.headerActions}><a className={styles.adminLink} href="/files/admin">File admin</a><a className={styles.adminLink} href="/">View portfolio</a></div></header>
    <section className={styles.adminIntro}><p className={styles.eyebrow}>Private area</p><h1>Visual editor.</h1><p>Click any text in the portfolio preview. Its content and typography controls will appear beside it, then Publish when you are ready.</p><button className={styles.publishButton} onClick={() => void save()} disabled={saving}>{saving ? "Publishing..." : "Publish changes"}</button>{message && <p className={styles.message}>{message}</p>}</section>
    <section className={styles.visualEditor}>
      <div className={styles.fullPreview}><iframe ref={previewFrame} title="Full portfolio preview" src="/admin/content/preview" onLoad={() => previewFrame.current?.contentWindow?.postMessage({ type: "portfolio-preview-content", content }, window.location.origin)} /></div>
      <aside className={styles.inspector}><p className={styles.eyebrow}>Selected component</p><span className={styles.componentName}>{componentName(selected)}</span><h2>{selected.label}</h2><label>Content{selected.field === "description" || selected.field === "footerHeading" ? <textarea value={valueOf(selected)} onChange={(event) => updateTarget(event.target.value)} /> : <input value={valueOf(selected)} onChange={(event) => updateTarget(event.target.value)} />}</label>{selected.scope === "settings" && selected.field === "workLinkLabel" && <label className={styles.linkControl}>Link destination<input type="url" value={content.settings.workLink} onChange={(event) => updateSettings("workLink", event.target.value)} /></label>}{selected.scope === "research" && selected.field === "linkLabel" && <label className={styles.linkControl}>Link destination<input type="url" value={content.research[selected.index]?.link || ""} onChange={(event) => updateResearch(selected.index, "link", event.target.value)} /></label>}{selected.scale && <div className={styles.inspectorControl}><span>Font size</span><div><button onClick={() => setScale(scaleValue() - 1)}>-</button><input type="number" value={scaleValue()} min={selected.min} max={selected.max} onChange={(event) => setScale(Number(event.target.value) || selected.min || 10)} /><em>px</em><button onClick={() => setScale(scaleValue() + 1)}>+</button></div></div>}{selected.scope === "settings" && selected.tracking && <label className={styles.inspectorTracking}>Letter spacing<input type="number" step="0.01" value={s.aboutEyebrowTracking} onChange={(event) => updateSettings("aboutEyebrowTracking", Math.max(0, Math.min(.25, Number(event.target.value) || 0)))} /><em>em</em></label>}<p className={styles.inspectorNote}>Click a section background to select its component; click individual text for a precise field. Typography ranges are now wider and apply to the rendered website.</p></aside>
    </section>    <section className={styles.editorSection}><div className={styles.editorHead}><h2>Manage entries</h2><div><button onClick={() => setContent({ ...content, research: [...content.research, { ...blankResearch }] })}>Add research</button><button onClick={() => setContent({ ...content, experience: [...content.experience, { ...blankExperience }] })}>Add experience</button></div></div><p className={styles.settingsHint}>Add or remove items here, then click their text in the visual preview to edit it.</p>{content.research.map((item, index) => <article className={styles.editorCard} key={`research-${index}`}><div className={styles.editorCardHead}><span>Research {index + 1}</span><button className={styles.deleteButton} onClick={() => setContent({ ...content, research: content.research.filter((_, itemIndex) => itemIndex !== index) })}>Remove</button></div><div className={styles.editorGrid}><label>Status<input value={item.status} onChange={(event) => updateResearch(index, "status", event.target.value)} /></label><label>Journal / conference / year<input value={item.meta} onChange={(event) => updateResearch(index, "meta", event.target.value)} /></label></div><button onClick={() => setContent({ ...content, research: move(content.research, index, -1) })} disabled={index === 0}>Move up</button><button onClick={() => setContent({ ...content, research: move(content.research, index, 1) })} disabled={index === content.research.length - 1}>Move down</button></article>)}{content.experience.map((item, index) => <article className={styles.editorCard} key={`experience-${index}`}><div className={styles.editorCardHead}><span>Experience {index + 1}</span><button className={styles.deleteButton} onClick={() => setContent({ ...content, experience: content.experience.filter((_, itemIndex) => itemIndex !== index) })}>Remove</button></div><div className={styles.editorGrid}><label>Dates<input value={item.dates} onChange={(event) => updateExperience(index, "dates", event.target.value)} /></label><label>Company<input value={item.company} onChange={(event) => updateExperience(index, "company", event.target.value)} /></label></div><button onClick={() => setContent({ ...content, experience: move(content.experience, index, -1) })} disabled={index === 0}>Move up</button><button onClick={() => setContent({ ...content, experience: move(content.experience, index, 1) })} disabled={index === content.experience.length - 1}>Move down</button></article>)}</section>
  </main>;
}
