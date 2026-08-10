import { GetObjectCommand, NoSuchKey, PutObjectCommand } from "@aws-sdk/client-s3";
import { getBucketName, getR2Client } from "@/lib/r2";

const CONTENT_KEY = "portfolio-content.json";

export type ResearchItem = { status: string; meta: string; title: string; description: string; linkLabel: string; link: string };
export type ExperienceItem = { dates: string; role: string; company: string; description: string };
export type PortfolioContent = { research: ResearchItem[]; experience: ExperienceItem[] };

export const defaultPortfolioContent: PortfolioContent = {
  research: [
    { status: "Under review", meta: "Finance Research Letters · Journal submission", title: "Beyond Liquidity: Market Design, Contract Lifecycle, and Informed Trading in Decentralized Prediction Markets", description: "Research on how market design and contract lifecycle shape informed trading in decentralized prediction markets, using trade-level evidence from Polymarket.", linkLabel: "Read on SSRN", link: "https://dx.doi.org/10.2139/ssrn.6933527" },
    { status: "Research award", meta: "UEB-SITE Student Research Conference · 2024–2025", title: "Second Prize — Financial Inclusion and Sustainable Development Goals in Asian Countries", description: "Co-authored research with Nguyen Thai Ha on the relationship between financial inclusion and progress toward the SDGs across Asian countries.", linkLabel: "View official announcement", link: "https://cite.ueb.edu.vn/article-chuc-mung-cac-%E2%80%9Cchien-binh%E2%80%9D-dat-giai-tai-hoi-nghi-nghien-cuu-khoa-hoc-cap-vien-dao-tao-quoc-te-(ueb-site)-nam-hoc-2024---2025-22239-1338.html" },
    { status: "International conference", meta: "GPAC 2025 · National Chengchi University, Taiwan", title: "Global Partnership of Asian Colleges: ESG & AI", description: "Represented UEB-SITE alongside students and faculty from University of Economics & Business–VNU, National Chengchi University, Chiba University of Commerce, Waseda University, Seoul National University, and COMAS Israel. Received 4th Prize in Paper Presentation and 3rd Prize in Case Competition.", linkLabel: "Read GPAC 2025 highlight", link: "https://lnkd.in/gNqzE6GG" },
  ],
  experience: [
    { dates: "Jan 2025 — Apr 2025", role: "Equity Research Analyst Intern", company: "DSC Securities Corporation", description: "Produced a full equity-research report on KBC and IDC, covering FDI inflows, China+1 manufacturing dynamics, and Global Minimum Tax impacts. Modelled earnings scenarios using lease-rate trends and macro assumptions." },
    { dates: "Jun 2024 — Aug 2024", role: "Research & Investment Intern", company: "FPT Capital", description: "Authored Vietnam’s 2025 investment outlook and analysed the FUEFCV50 ETF’s structure, index composition, performance attribution, catalysts and risks." },
    { dates: "2022 — 2023", role: "Sales Associate", company: "Cat Hai Oil & Grease", description: "Advised industrial and automotive clients, increasing average transaction value by 15% through consultative selling." },
  ],
};

function isString(value: unknown): value is string { return typeof value === "string" && value.length <= 10000; }

export function sanitizePortfolioContent(value: unknown): PortfolioContent {
  if (!value || typeof value !== "object") throw new Error("Invalid content.");
  const raw = value as { research?: unknown; experience?: unknown };
  if (!Array.isArray(raw.research) || !Array.isArray(raw.experience) || raw.research.length > 30 || raw.experience.length > 30) throw new Error("Invalid content.");
  const research = raw.research.map((item) => {
    const entry = item as Record<string, unknown>;
    const { status, meta, title, description, linkLabel, link } = entry;
    if (![status, meta, title, description, linkLabel, link].every(isString)) throw new Error("Invalid research item.");
    return { status: String(status).trim(), meta: String(meta).trim(), title: String(title).trim(), description: String(description).trim(), linkLabel: String(linkLabel).trim(), link: String(link).trim() };
  });
  const experience = raw.experience.map((item) => {
    const entry = item as Record<string, unknown>;
    const { dates, role, company, description } = entry;
    if (![dates, role, company, description].every(isString)) throw new Error("Invalid experience item.");
    return { dates: String(dates).trim(), role: String(role).trim(), company: String(company).trim(), description: String(description).trim() };
  });
  return { research, experience };
}

export async function loadPortfolioContent(): Promise<PortfolioContent> {
  try {
    const object = await getR2Client().send(new GetObjectCommand({ Bucket: getBucketName(), Key: CONTENT_KEY }));
    return sanitizePortfolioContent(JSON.parse(await object.Body?.transformToString() || "{}"));
  } catch (error) {
    if (error instanceof NoSuchKey || (error as { name?: string }).name === "NoSuchKey") return defaultPortfolioContent;
    console.error("Could not load portfolio content", error);
    return defaultPortfolioContent;
  }
}

export async function savePortfolioContent(value: unknown) {
  const content = sanitizePortfolioContent(value);
  await getR2Client().send(new PutObjectCommand({ Bucket: getBucketName(), Key: CONTENT_KEY, Body: JSON.stringify(content), ContentType: "application/json", CacheControl: "no-store" }));
  return content;
}