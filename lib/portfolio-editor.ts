import type { ExperienceItem, ResearchItem, SiteSettings } from "@/lib/portfolio-content";

export type ScaleField = "heroScale" | "headingScale" | "bodyScale" | "aboutEyebrowScale" | "sectionLabelScale" | "metaScale" | "researchTitleScale" | "experienceTitleScale";
export type EditTarget =
  | { scope: "settings"; field: keyof SiteSettings; label: string; scale?: ScaleField; base?: number; min?: number; max?: number; tracking?: boolean }
  | { scope: "research"; index: number; field: keyof ResearchItem; label: string; scale?: ScaleField; base?: number; min?: number; max?: number }
  | { scope: "experience"; index: number; field: keyof ExperienceItem; label: string; scale?: ScaleField; base?: number; min?: number; max?: number };

export function targetKey(target: EditTarget) {
  return target.scope === "settings" ? `settings:${target.field}` : `${target.scope}:${target.index}:${target.field}`;
}
