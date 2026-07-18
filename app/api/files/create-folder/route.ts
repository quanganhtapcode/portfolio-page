import { PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { isFilesAdmin } from "@/lib/files-auth";
import { folderMarkerKey, getBucketName, getR2Client, normalizeFolder } from "@/lib/r2";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await isFilesAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { folder } = await request.json();
    if (typeof folder !== "string") return NextResponse.json({ error: "A folder name is required." }, { status: 400 });
    const safeFolder = normalizeFolder(folder);
    await getR2Client().send(new PutObjectCommand({ Bucket: getBucketName(), Key: folderMarkerKey(safeFolder), Body: "", ContentType: "application/x-folder" }));
    return NextResponse.json({ ok: true, folder: safeFolder });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not create the folder." }, { status: 400 });
  }
}