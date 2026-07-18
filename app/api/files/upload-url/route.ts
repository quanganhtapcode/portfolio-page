import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { isFilesAdmin } from "@/lib/files-auth";
import { createFileKey, getBucketName, getR2Client, toPublicKey } from "@/lib/r2";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await isFilesAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { filename, contentType, folder } = await request.json();
    if (typeof filename !== "string" || !filename.trim()) return NextResponse.json({ error: "A file name is required." }, { status: 400 });
    const key = createFileKey(filename, typeof folder === "string" ? folder : "");
    const type = typeof contentType === "string" && contentType ? contentType : "application/octet-stream";
    const uploadUrl = await getSignedUrl(
      getR2Client(),
      new PutObjectCommand({ Bucket: getBucketName(), Key: key, ContentType: type }),
      { expiresIn: 300 },
    );
    const publicKey = toPublicKey(key);
    return NextResponse.json({ uploadUrl, key: publicKey, publicUrl: `/files/${publicKey}?view=1`, headers: { "Content-Type": type } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not prepare the upload. Check the R2 configuration." }, { status: 500 });
  }
}
