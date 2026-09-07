import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { isFilesAdmin } from "@/lib/files-auth";
import { loadPortfolioContentUncached, savePortfolioContent } from "@/lib/portfolio-content";

export const runtime = "nodejs";

export async function GET() {
  if (!(await isFilesAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await loadPortfolioContentUncached(), { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: Request) {
  if (!(await isFilesAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const content = await savePortfolioContent(await request.json());
    revalidateTag("portfolio-content", { expire: 0 });
    revalidatePath("/");
    return NextResponse.json(content);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not save content. Check every field." }, { status: 400 });
  }
}
