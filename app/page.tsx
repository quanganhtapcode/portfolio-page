import PublicPortfolio from "@/components/public-portfolio";
import { loadPortfolioContent } from "@/lib/portfolio-content";

export const dynamic = "force-dynamic";

export default async function Home() {
  return <PublicPortfolio content={await loadPortfolioContent()} />;
}
