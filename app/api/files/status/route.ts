import { NextResponse } from "next/server";
import { isFilesAdmin } from "@/lib/files-auth";

export async function GET() {
  return NextResponse.json({ authenticated: await isFilesAdmin() });
}
