import { NextResponse } from "next/server";
import { createSessionValue, filesSessionCookie, passwordMatches } from "@/lib/files-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    if (typeof password !== "string" || !passwordMatches(password)) {
      return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
    }
    const response = NextResponse.json({ ok: true });
    const cookie = filesSessionCookie(createSessionValue());
    response.cookies.set(cookie.name, cookie.value, cookie.options);
    return response;
  } catch {
    return NextResponse.json({ error: "Unable to sign in." }, { status: 500 });
  }
}
