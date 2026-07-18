import { NextResponse } from "next/server";
import { displayName, toObjectKey } from "@/lib/r2";

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
}

export async function GET(request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  try {
    const { key: segments } = await params;
    const publicKey = segments.join("/");
    toObjectKey(publicKey);
    const filename = displayName(publicKey);
    const extension = filename.split(".").pop()?.toLowerCase();
    const origin = new URL(request.url).origin;
    const rawUrl = `${origin}/api/files/content?key=${encodeURIComponent(publicKey)}`;

    if (extension !== "pdf") return NextResponse.redirect(`${rawUrl}&download=1`);

    // Native browser PDF viewers are substantially more reliable on iPhone than PDFs embedded in an iframe.
    const response = NextResponse.redirect(rawUrl);
    const response.headers.set("Cache-Control", "no-store");
    return const response;
  } catch (error) {
    console.error(error);
    return new NextResponse("File not found.", { status: 404 });
  }
}