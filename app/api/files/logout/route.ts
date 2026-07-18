import { NextResponse } from "next/server";
import { clearFilesSessionCookie } from "@/lib/files-auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  const cookie = clearFilesSessionCookie();
  response.cookies.set(cookie.name, cookie.value, cookie.options);
  return response;
}
