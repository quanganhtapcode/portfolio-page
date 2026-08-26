"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import styles from "../../files/files.module.css";
import { targetKey, type EditTarget as Target } from "@/lib/portfolio-editor";
import type { CustomBlock, SectionId, SectionStyle, TextStyle } from "@/lib/portfolio-content";

type ResearchItem = { status: string; meta: string; title: string; description: string; linkLabel: string; link: string; doi?: string };
type ExperienceItem = { dates: string; role: string; company: string; description: string };
type SiteSettings = { heroScale: number; headingScale: number; bodyScale: number; aboutEyebrowScale: number; sectionLabelScale: number; metaScale: number; aboutEyebrowTracking: number; researchTitleScale: number; experienceTitleScale: number; paperColor?: string; inkColor?: string; accentColor?: string; experienceColor?: string; customLinks?: Record<string, string>; sectionStyles?: Partial<Record<SectionId, SectionStyle>>; textStyles?: Record<string, TextStyle>; heroGreeting: string; heroDescription: string; aboutEyebrow: string; aboutHeadingPrimary: string; aboutHeadingAccent: string; aboutDescription: string; workLabel: string; workRange: string; workTag: string; workTitlePrimary: string; workTitleAccent: string; workDescription: string; workLinkLabel: string; workLink: string; researchLabel: string; researchHeadingPrimary: string; researchHeadingAccent: string; experienceLabel: string; educationLabel: string; educationHeadingPrimary: string; educationHeadingAccent: string; footerHeading: string };
type PortfolioContent = { research: ResearchItem[]; experience: ExperienceItem[]; customBlocks: CustomBlock[]; settings: SiteSettings };

const blankResearch: ResearchItem = { status: "Under review", meta: "Journal / year", title: "", description: "", linkLabel: "Read more", link: "" };
const blankExperience: ExperienceItem = { dates: "", role: "", company: "", description: "" };
const blankCustomBlock = (type: CustomBlock["type"]): CustomBlock => ({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, type, label: type === "quote" ? "A point of view" : type === "callout" ? "Let’s connect" : "New component", title: type === "quote" ? "A thought worth sharing." : "New component title", body: "Add your supporting text here.", linkLabel: "Learn more", link: "", background: type === "callout" ? "#0f3d66" : "#ffffff", color: type === "callout" ? "#ffffff" : "#132235", bold: false });

export default function ContentAdmin() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [content, setContent] = useState<PortfolioContent | null>(null);
  const [message, setMessage] = useState("Loading content...");
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState<{ kind: "research" | "experience"; index: number } | null>(null);
  const [selected, setSelected] = useState<Target>({ scope: "settings", field: "heroGreeting", label: "Hero greeting", scale: "heroScale", base: 224, min: 180, max: 291 });
  const previewFrame = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    fetch("/api/files/status").then((response) => response.json()).then((data) => setAuthenticated(data.authenticated)).catch(() => setAuthenticated(false));
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    fetch("/api/admin/content").then(async (response) => {
      if (response.status === 401) { setAuthenticated(false); throw new Error("Your session has expired."); }
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load content.");
      return data;
    }).then((data) => { setContent(data); setMessage(""); }).catch((error: Error) => setMessage(error.message));
  }, [authenticated]);

  useEffect(() => {
    function receive(event: MessageEvent) {
      if (event.origin !== window.location.origin || !event.data) return;
      if (event.data.type === "portfolio-preview-select") setSelected(event.data.target as Target);
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
  function updateCustom(index: number, field: keyof CustomBlock, value: string | boolean) { if (content) { const customBlocks = [...content.customBlocks]; customBlocks[index] = { ...customBlocks[index], [field]: value }; setContent({ ...content, customBlocks }); } }
  function linkValue(target: Target) {
    if (!content) return "";
    if (target.scope === "settings" && target.field === "workLinkLabel") return content.settings.workLink;
    if (target.scope === "research" && target.field === "linkLabel") return content.research[target.index]?.link || "";
    if (target.scope === "custom" && target.field === "linkLabel") return content.customBlocks[target.index]?.link || "";
    return content.settings.customLinks?.[targetKey(target)] || "";
  }
  function updateLink(target: Target, value: string) {
    if (!content) return;
    if (target.scope === "settings" && target.field === "workLinkLabel") { updateSettings("workLink", value); return; }
    if (target.scope === "research" && target.field === "linkLabel") { updateResearch(target.index, "link", value); return; }
    if (target.scope === "custom" && target.field === "linkLabel") { updateCustom(target.index, "link", value); return; }
    const customLinks = { ...(content.settings.customLinks || {}) };
    if (value.trim()) customLinks[targetKey(target)] = value.trim(); else delete customLinks[targetKey(target)];
    setContent({ ...content, settings: { ...content.settings, customLinks } });
  }
  function valueOf(target: Target) { if (!content) return ""; if (target.scope === "settings") return String(content.settings[target.field]); if (target.scope === "research") return content.research[target.index]?.[target.field] || ""; if (target.scope === "experience") return content.experience[target.index]?.[target.field] || ""; return String(content.customBlocks[target.index]?.[target.field] || ""); }
  function updateTarget(value: string) { if (selected.scope === "settings") updateSettings(selected.field, value); else if (selected.scope === "research") updateResearch(selected.index, selected.field, value); else if (selected.scope === "experience") updateExperience(selected.index, selected.field, value); else updateCustom(selected.index, selected.field, value); }
  const pxToPt = (value: number) => Math.round(value * .75);
  const ptToPx = (value: number) => value / .75;
  function setScale(value: number) { if (!content || !selected.scale || !selected.base) return; const min = pxToPt(selected.min ?? 10); const max = pxToPt(selected.max ?? 300); updateSettings(selected.scale, ptToPx(Math.max(min, Math.min(max, value))) / selected.base); }
  function scaleValue() { return content && selected.scale && selected.base ? pxToPt(content.settings[selected.scale] * selected.base) : 0; }
  function componentName(target: Target) { if (target.scope === "research") return `Research item ${target.index + 1}`; if (target.scope === "experience") return `Experience item ${target.index + 1}`; if (target.scope === "custom") return `Custom component ${target.index + 1}`; if (target.field.startsWith("hero")) return "Hero"; if (target.field.startsWith("about")) return "About"; if (target.field.startsWith("work")) return "Projects"; if (target.field.startsWith("research")) return "Research"; if (target.field.startsWith("experience")) return "Experience"; if (target.field.startsWith("education")) return "Education"; return "Footer"; }
  function sectionFor(target: Target): SectionId { if (target.scope === "research") return "research"; if (target.scope === "experience") return "experience"; if (target.scope === "custom") return "education"; if (target.field.startsWith("hero")) return "hero"; if (target.field.startsWith("about")) return "about"; if (target.field.startsWith("work")) return "work"; if (target.field.startsWith("research")) return "research"; if (target.field.startsWith("experience")) return "experience"; if (target.field.startsWith("education")) return "education"; return "footer"; }
  function updateSectionStyle(field: keyof SectionStyle, value: string | boolean) { if (!content) return; const section = sectionFor(selected); const current = content.settings.sectionStyles?.[section] || { background: "", color: "", bold: false }; setContent({ ...content, settings: { ...content.settings, sectionStyles: { ...(content.settings.sectionStyles || {}), [section]: { ...current, [field]: value } } } }); }
  function updateTextStyle(field: keyof TextStyle, value: string | boolean) { if (!content) return; const key = targetKey(selected); const current = content.settings.textStyles?.[key] || { bold: false, color: "" }; setContent({ ...content, settings: { ...content.settings, textStyles: { ...(content.settings.textStyles || {}), [key]: { ...current, [field]: value } } } }); }
  function move<T>(items: T[], index: number, direction: -1 | 1) { const target = index + direction; if (target < 0 || target >= items.length) return items; const copy = [...items]; [copy[index], copy[target]] = [copy[target], copy[index]]; return copy; }
  function reorder<T>(items: T[], from: number, to: number) { const copy = [...items]; const [item] = copy.splice(from, 1); copy.splice(to, 0, item); return copy; }
  async function persist(value: PortfolioContent) { setSaving(true); setMessage("Publishing..."); try { const response = await fetch("/api/admin/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(value) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Could not publish."); setContent(data); setMessage("Published. Your portfolio is updated."); } catch (error) { setMessage(error instanceof Error ? error.message : "Could not publish."); } finally { setSaving(false); } }
  function save() { if (!content || saving) return; void persist(content); }
  function editable(target: Target, text: string, className = "") { let active = selected.scope === target.scope && selected.field === target.field; if (active && target.scope !== "settings" && selected.scope !== "settings") active = selected.index === target.index; return <button type="button" className={`${styles.editablePreview} ${active ? styles.editablePreviewActive : ""} ${className}`} onClick={() => setSelected(target)}>{text || "Click to add text"}</button>; }

  async function signIn(event: FormEvent) {
    event.preventDefault();
    setSigningIn(true); setMessage("");
    try {
      const response = await fetch("/api/files/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not sign in.");
      setPassword(""); setAuthenticated(true);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not sign in."); }
    finally { setSigningIn(false); }
  }

  if (authenticated === null) return <main className={styles.page}><p className={styles.status}>Checking access...</p></main>;
  if (!authenticated) return <main className={styles.page}><header className={styles.header}><a className={styles.brand} href="/">LA<sup>R</sup></a><div className={styles.headerActions}><a className={styles.adminLink} href="/admin/files">File admin</a><a className={styles.adminLink} href="/">View portfolio</a></div></header><section className={styles.login}><p className={styles.eyebrow}>Private area / portfolio</p><h1>Profile editor.</h1><p>Sign in to update your portfolio, research, experience and design settings.</p><form onSubmit={signIn}><label htmlFor="password">Admin password</label><input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoFocus required /><button disabled={signingIn}>{signingIn ? "Signing in..." : "Sign in"}</button></form>{message && <p className={styles.message}>{message}</p>}</section></main>;
  if (!content) return <main className={styles.page}><header className={styles.header}><a className={styles.brand} href="/">LA<sup>R</sup></a></header><p className={styles.status}>{message}</p></main>;
  const s = content.settings;
  return <main className={styles.page}>
    <header className={styles.header}><a className={styles.brand} href="/">LA<sup>R</sup></a><div className={styles.headerActions}><a className={styles.adminLink} href="/admin/files">File admin</a><a className={styles.adminLink} href="/">View portfolio</a></div></header>
    <section className={styles.adminIntro}><p className={styles.eyebrow}>Private area / portfolio</p><h1>Visual editor.</h1><p>Select a text block in the full preview, then edit its content, link and type settings in the focused panel. Changes are reflected immediately; publish when ready.</p><div className={styles.publishRow}><span className={styles.liveState}>LIVE PREVIEW</span><button className={styles.publishButton} onClick={() => void save()} disabled={saving}>{saving ? "Publishing..." : "Publish changes"}</button></div>{message && <p className={styles.message}>{message}</p>}</section>
    <section className={styles.visualEditor}>
      <div className={styles.fullPreview}><iframe ref={previewFrame} title="Full portfolio preview" src="/admin/content/preview" onLoad={() => { previewFrame.current?.contentWindow?.postMessage({ type: "portfolio-preview-content", content }, window.location.origin); previewFrame.current?.contentWindow?.postMessage({ type: "portfolio-preview-selected", target: selected }, window.location.origin); }} /></div>
      <aside className={styles.inspector}>
        <p className={styles.eyebrow}>Properties</p><span className={styles.componentName}>{componentName(selected)}</span><h2>{selected.label}</h2>
        <label>Content{selected.field === "description" || selected.field === "footerHeading" ? <textarea value={valueOf(selected)} onChange={(event) => updateTarget(event.target.value)} /> : <input value={valueOf(selected)} onChange={(event) => updateTarget(event.target.value)} />}</label>
        <label className={styles.linkControl}>Link destination <small>(optional)</small><input type="url" placeholder="https://example.com" value={linkValue(selected)} onChange={(event) => updateLink(selected, event.target.value)} /></label>
        <div className={styles.textAppearance}><span>Text appearance</span><label className={styles.toggleControl}><input type="checkbox" checked={s.textStyles?.[targetKey(selected)]?.bold || false} onChange={(event) => updateTextStyle("bold", event.target.checked)} /> Bold this text</label><label>Text color<input type="color" value={s.textStyles?.[targetKey(selected)]?.color || "#132235"} onChange={(event) => updateTextStyle("color", event.target.value)} /></label></div>
        {selected.scale && <div className={styles.inspectorControl}><span>Font size</span><div><button onClick={() => setScale(scaleValue() - 1)}>-</button><input type="number" value={scaleValue()} min={pxToPt(selected.min ?? 10)} max={pxToPt(selected.max ?? 300)} onChange={(event) => setScale(Number(event.target.value) || pxToPt(selected.min ?? 10))} /><em>pt</em><button onClick={() => setScale(scaleValue() + 1)}>+</button></div></div>}
        {selected.scope === "settings" && selected.tracking && <label className={styles.inspectorTracking}>Letter spacing<input type="number" step="0.01" value={s.aboutEyebrowTracking} onChange={(event) => updateSettings("aboutEyebrowTracking", Math.max(0, Math.min(.25, Number(event.target.value) || 0)))} /><em>em</em></label>}
        {selected.scope === "custom" ? <div className={styles.sectionAppearance}><span>Component appearance</span><div><label>Background<input type="color" value={content.customBlocks[selected.index]?.background || "#ffffff"} onChange={(event) => updateCustom(selected.index, "background", event.target.value)} /></label><label>Text color<input type="color" value={content.customBlocks[selected.index]?.color || "#132235"} onChange={(event) => updateCustom(selected.index, "color", event.target.value)} /></label></div><label className={styles.toggleControl}><input type="checkbox" checked={content.customBlocks[selected.index]?.bold || false} onChange={(event) => updateCustom(selected.index, "bold", event.target.checked)} /> Bold text in this component</label></div> : <div className={styles.sectionAppearance}><span>Section appearance</span><div><label>Background<input type="color" value={s.sectionStyles?.[sectionFor(selected)]?.background || "#ffffff"} onChange={(event) => updateSectionStyle("background", event.target.value)} /></label><label>Text color<input type="color" value={s.sectionStyles?.[sectionFor(selected)]?.color || "#132235"} onChange={(event) => updateSectionStyle("color", event.target.value)} /></label></div><label className={styles.toggleControl}><input type="checkbox" checked={s.sectionStyles?.[sectionFor(selected)]?.bold || false} onChange={(event) => updateSectionStyle("bold", event.target.checked)} /> Bold text in this section</label></div>}
        <p className={styles.inspectorNote}>The preview is for selecting components. Edit safely here, where every change is controlled and immediately reflected.</p>
      </aside>
    </section>
    <section className={styles.themeSection}>
      <div><p className={styles.eyebrow}>Theme</p><h2>Color system.</h2><p>Adjust the core colors used across the portfolio. The live preview updates immediately.</p></div>
      <div className={styles.colorGrid}>
        <label>Page background<input type="color" value={s.paperColor || "#ffffff"} onChange={(event) => updateSettings("paperColor", event.target.value)} /><code>{s.paperColor || "#ffffff"}</code></label>
        <label>Primary text<input type="color" value={s.inkColor || "#121314"} onChange={(event) => updateSettings("inkColor", event.target.value)} /><code>{s.inkColor || "#121314"}</code></label>
        <label>Accent<input type="color" value={s.accentColor || "#315be9"} onChange={(event) => updateSettings("accentColor", event.target.value)} /><code>{s.accentColor || "#315be9"}</code></label>
        <label>Experience background<input type="color" value={s.experienceColor || "#f1f5f8"} onChange={(event) => updateSettings("experienceColor", event.target.value)} /><code>{s.experienceColor || "#f1f5f8"}</code></label>
      </div>
    </section>
    <section className={styles.editorSection}>
      <div className={styles.editorHead}><h2>Manage entries</h2><div><button onClick={() => setContent({ ...content, research: [...content.research, { ...blankResearch }] })}>Add research</button><button onClick={() => setContent({ ...content, experience: [...content.experience, { ...blankExperience }] })}>Add experience</button><button onClick={() => setContent({ ...content, customBlocks: [...content.customBlocks, blankCustomBlock("text")] })}>Add text</button><button onClick={() => setContent({ ...content, customBlocks: [...content.customBlocks, blankCustomBlock("quote")] })}>Add quote</button><button onClick={() => setContent({ ...content, customBlocks: [...content.customBlocks, blankCustomBlock("callout")] })}>Add callout</button></div></div>
      <p className={styles.settingsHint}>Add a block, then select it in the preview to edit it. Research and experience entries can also be reordered below.</p>
      {content.customBlocks.map((item, index) => <article className={styles.editorCard} key={item.id}><div className={styles.editorCardHead}><span>Custom {index + 1} · {item.type}</span><div><button onClick={() => setContent({ ...content, customBlocks: move(content.customBlocks, index, -1) })} disabled={index === 0}>Move up</button><button onClick={() => setContent({ ...content, customBlocks: move(content.customBlocks, index, 1) })} disabled={index === content.customBlocks.length - 1}>Move down</button><button className={styles.deleteButton} onClick={() => setContent({ ...content, customBlocks: content.customBlocks.filter((_, itemIndex) => itemIndex !== index) })}>Remove</button></div></div><div className={styles.editorGrid}><label>Label<input value={item.label} onChange={(event) => updateCustom(index, "label", event.target.value)} /></label><label>Style<select value={item.type} onChange={(event) => updateCustom(index, "type", event.target.value as CustomBlock["type"])}><option value="text">Text</option><option value="quote">Quote</option><option value="callout">Callout</option></select></label></div><label>Title<input value={item.title} onChange={(event) => updateCustom(index, "title", event.target.value)} /></label><label>Text<textarea value={item.body} onChange={(event) => updateCustom(index, "body", event.target.value)} /></label><div className={styles.editorGrid}><label>Link title<input value={item.linkLabel} onChange={(event) => updateCustom(index, "linkLabel", event.target.value)} /></label><label>Link URL<input type="url" value={item.link} onChange={(event) => updateCustom(index, "link", event.target.value)} /></label></div></article>)}
      {content.research.map((item, index) => <article className={`${styles.editorCard} ${dragging?.kind === "research" && dragging.index === index ? styles.draggingCard : ""}`} key={`research-${index}`} draggable onDragStart={() => setDragging({ kind: "research", index })} onDragEnd={() => setDragging(null)} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (dragging?.kind === "research" && dragging.index !== index) setContent({ ...content, research: reorder(content.research, dragging.index, index) }); setDragging(null); }}>
        <div className={styles.editorCardHead}><span><i className={styles.dragHandle} aria-hidden="true">⠿</i> Research {index + 1}</span><div><button onClick={() => setContent({ ...content, research: move(content.research, index, -1) })} disabled={index === 0}>Move up</button><button onClick={() => setContent({ ...content, research: move(content.research, index, 1) })} disabled={index === content.research.length - 1}>Move down</button><button className={styles.deleteButton} onClick={() => setContent({ ...content, research: content.research.filter((_, itemIndex) => itemIndex !== index) })}>Remove</button></div></div>
        <div className={styles.editorGrid}><label>Status<input value={item.status} onChange={(event) => updateResearch(index, "status", event.target.value)} /></label><label>Journal / conference / year<input value={item.meta} onChange={(event) => updateResearch(index, "meta", event.target.value)} /></label></div>
        <label>Title<input value={item.title} onChange={(event) => updateResearch(index, "title", event.target.value)} /></label>
        <label>Description<textarea value={item.description} onChange={(event) => updateResearch(index, "description", event.target.value)} /></label>
        <label>Link title <small>(for example: DOI, Read paper, View publication)</small><input value={item.linkLabel} onChange={(event) => updateResearch(index, "linkLabel", event.target.value)} /></label>
        <label>Link URL (optional)<input type="url" placeholder="https://..." value={item.link} onChange={(event) => updateResearch(index, "link", event.target.value)} /></label>
      </article>)}
      {content.experience.map((item, index) => <article className={`${styles.editorCard} ${dragging?.kind === "experience" && dragging.index === index ? styles.draggingCard : ""}`} key={`experience-${index}`} draggable onDragStart={() => setDragging({ kind: "experience", index })} onDragEnd={() => setDragging(null)} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (dragging?.kind === "experience" && dragging.index !== index) setContent({ ...content, experience: reorder(content.experience, dragging.index, index) }); setDragging(null); }}>
        <div className={styles.editorCardHead}><span><i className={styles.dragHandle} aria-hidden="true">⠿</i> Experience {index + 1}</span><div><button onClick={() => setContent({ ...content, experience: move(content.experience, index, -1) })} disabled={index === 0}>Move up</button><button onClick={() => setContent({ ...content, experience: move(content.experience, index, 1) })} disabled={index === content.experience.length - 1}>Move down</button><button className={styles.deleteButton} onClick={() => setContent({ ...content, experience: content.experience.filter((_, itemIndex) => itemIndex !== index) })}>Remove</button></div></div>
        <div className={styles.editorGrid}><label>Dates<input value={item.dates} onChange={(event) => updateExperience(index, "dates", event.target.value)} /></label><label>Role<input value={item.role} onChange={(event) => updateExperience(index, "role", event.target.value)} /></label></div>
        <label>Company<input value={item.company} onChange={(event) => updateExperience(index, "company", event.target.value)} /></label>
        <label>Description<textarea value={item.description} onChange={(event) => updateExperience(index, "description", event.target.value)} /></label>
      </article>)}
    </section>
  </main>;
}
