"use client";

import { useEffect, useState } from "react";
import PortfolioPage from "@/components/portfolio-page";
import type { PortfolioContent } from "@/lib/portfolio-content";
import type { EditTarget } from "@/lib/portfolio-editor";

export default function PortfolioPreview() {
  const [content, setContent] = useState<PortfolioContent | null>(null);
  const [selected, setSelected] = useState<EditTarget | null>(null);
  useEffect(() => {
    const receive = (event: MessageEvent) => { if (event.origin !== window.location.origin) return; if (event.data?.type === "portfolio-preview-content") setContent(event.data.content as PortfolioContent); if (event.data?.type === "portfolio-preview-selected") setSelected(event.data.target as EditTarget); };
    window.addEventListener("message", receive);
    window.parent.postMessage({ type: "portfolio-preview-ready" }, window.location.origin);
    return () => window.removeEventListener("message", receive);
  }, []);
  if (!content) return <main className="previewLoading">Loading portfolio preview...</main>;
  const size = selected?.scale && selected.base ? Math.round(content.settings[selected.scale] * selected.base) : null;
  function select(target: EditTarget) { setSelected(target); window.parent.postMessage({ type: "portfolio-preview-select", target }, window.location.origin); }
  return <><PortfolioPage content={content} edit selected={selected} onSelect={select} />{selected && <div className="inlineEditorToolbar" role="status"><span className="toolbarType">Editing: {selected.label}</span>{size !== null && <output>{size} px</output>}<span className="toolbarHint">Use the panel on the right to edit</span></div>}</>;
}
