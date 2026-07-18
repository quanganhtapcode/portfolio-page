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

    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(filename)} | Le Quang Anh</title><style>html,body{height:100%;margin:0;background:#f3f5f6;color:#111;font-family:Manrope,Arial,sans-serif}.bar{height:58px;padding:0 5vw;background:#fff;border-bottom:1px solid #ddd;display:flex;align-items:center;justify-content:space-between;gap:1rem}.name{font-size:.82rem;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.download{color:#111;font-size:.76rem;font-weight:800;text-decoration:none;border-bottom:1px solid #111;padding-bottom:3px;white-space:nowrap}iframe{display:block;border:0;width:100%;height:calc(100% - 59px);background:#fff}@media(max-width:560px){.bar{padding:0 1rem}.name{max-width:65vw}}</style></head><body><header class="bar"><span class="name">${escapeHtml(filename)}</span><a class="download" href="${escapeHtml(rawUrl)}&download=1">Download original</a></header><iframe title="${escapeHtml(filename)}" src="${escapeHtml(rawUrl)}"></iframe></body></html>`;
    return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Content-Security-Policy": "default-src 'self'; frame-src 'self'; style-src 'unsafe-inline'" } });
  } catch (error) {
    console.error(error);
    return new NextResponse("File not found.", { status: 404 });
  }
}