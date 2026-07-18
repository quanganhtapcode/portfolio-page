import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { isFilesAdmin } from "@/lib/files-auth";
import { getBucketName, getR2Client, toObjectKey } from "@/lib/r2";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await isFilesAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { key } = await request.json();
    if (typeof key !== "string") return NextResponse.json({ error: "Invalid file key." }, { status: 400 });
    await getR2Client().send(new DeleteObjectCommand({ Bucket: getBucketName(), Key: toObjectKey(key) }));
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not delete the file." }, { status: 500 });
  }
}
