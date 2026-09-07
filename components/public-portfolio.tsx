"use client";

import type { PortfolioContent } from "@/lib/portfolio-content";
import PortfolioPage from "@/components/portfolio-page";

export default function PublicPortfolio({ content }: { content: PortfolioContent }) {
  return <PortfolioPage content={content} />;
}
