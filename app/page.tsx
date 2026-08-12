import PortfolioPage from "@/components/portfolio-page";
import { loadPortfolioContent } from "@/lib/portfolio-content";

export const dynamic = "force-dynamic";

export default async function Home() {
  return <PortfolioPage content={await loadPortfolioContent()} />;
}
