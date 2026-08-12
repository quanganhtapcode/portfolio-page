"use client";

import { useEffect, useState } from "react";
import PortfolioPage from "@/components/portfolio-page";
import type { PortfolioContent } from "@/lib/portfolio-content";
import type { EditTarget } from "@/lib/portfolio-editor";

export default function PortfolioPreview() {
  const [content, setContent] = useState<PortfolioContent | null>(null);
  useEffect(() => {
    const receive = (event: MessageEvent) => { if (event.origin === window.location.origin && event.data?.type === "portfolio-preview-content") setContent(event.data.content as PortfolioContent); };
    window.addEventListener("message", receive);
    window.parent.postMessage({ type: "portfolio-preview-ready" }, window.location.origin);
    return () => window.removeEventListener("message", receive);
  }, []);
  if (!content) return <main className="previewLoading">Loading portfolio preview...</main>;
  return <PortfolioPage content={content} edit onSelect={(target: EditTarget) => window.parent.postMessage({ type: "portfolio-preview-select", target }, window.location.origin)} />;
}
