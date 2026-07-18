import { GetObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { displayName, getBucketName, getR2Client, toObjectKey } from "@/lib/r2";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  try {
    const { key: segments } = await params;
    const publicKey = segments.join("/");
    const object = await getR2Client().send(new GetObjectCommand({ Bucket: getBucketName(), Key: toObjectKey(publicKey) }));
    if (!object.Body) return new NextResponse("File not found.", { status: 404 });
    const filename = encodeURIComponent(displayName(publicKey));
    return new NextResponse(object.Body.transformToWebStream(), {
      headers: {
        "Content-Type": object.ContentType || "application/octet-stream",
        "Content-Length": String(object.ContentLength || ""),
        "Content-Disposition": `attachment; filename*=UTF-8''${filename}`,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error(error);
    return new NextResponse("File not found.", { status: 404 });
  }
}