import { NextResponse } from "next/server";
import { isFilesAdmin } from "@/lib/files-auth";
import { loadPortfolioContent, savePortfolioContent } from "@/lib/portfolio-content";

export const runtime = "nodejs";

export async function GET() {
  if (!(await isFilesAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await loadPortfolioContent(), { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: Request) {
  if (!(await isFilesAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    return NextResponse.json(await savePortfolioContent(await request.json()));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not save content. Check every field." }, { status: 400 });
  }
}