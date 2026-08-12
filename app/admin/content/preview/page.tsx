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
  return <><PortfolioPage content={content} edit selected={selected} onSelect={select} onTextChange={(target, value) => window.parent.postMessage({ type: "portfolio-preview-text", target, value }, window.location.origin)} />{selected && <div className="inlineEditorToolbar" role="toolbar" aria-label="Text editor"><span className="toolbarType">{selected.label}</span>{size !== null && <><button onMouseDown={(event) => event.preventDefault()} onClick={() => window.parent.postMessage({ type: "portfolio-preview-font", target: selected, size: size - 1 }, window.location.origin)}>A−</button><output>{size} px</output><button onMouseDown={(event) => event.preventDefault()} onClick={() => window.parent.postMessage({ type: "portfolio-preview-font", target: selected, size: size + 1 }, window.location.origin)}>A+</button></>}<span className="toolbarHint">Type directly, then click outside</span></div>}</>;
}
