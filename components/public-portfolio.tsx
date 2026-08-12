"use client";

import dynamic from "next/dynamic";
import type { PortfolioContent } from "@/lib/portfolio-content";

const PortfolioPage = dynamic(() => import("@/components/portfolio-page"), {
  ssr: false,
  loading: () => <main className="portfolioLoading" aria-label="Loading portfolio" />,
});

export default function PublicPortfolio({ content }: { content: PortfolioContent }) {
  return <PortfolioPage content={content} />;
}
