import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { displayName, FILES_PREFIX, getBucketName, getR2Client, toPublicKey } from "@/lib/r2";

export const runtime = "nodejs";

export async function GET() {
  try {
    const result = await getR2Client().send(new ListObjectsV2Command({ Bucket: getBucketName(), Prefix: FILES_PREFIX }));
    const files = (result.Contents ?? [])
      .filter((file) => file.Key && file.Key !== FILES_PREFIX)
      .map((file) => {
        const key = toPublicKey(file.Key!);
        return { key, name: displayName(key), size: file.Size ?? 0, updatedAt: file.LastModified?.toISOString() ?? null, url: `/files/${key}` };
      })
      .sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""));
    return NextResponse.json({ files });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ files: [], error: "File library is not connected yet." }, { status: 503 });
  }
}
