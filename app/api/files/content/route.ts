import { GetObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { displayName, getBucketName, getR2Client, toObjectKey } from "@/lib/r2";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const key = new URL(request.url).searchParams.get("key");
    if (!key) return new NextResponse("File not found.", { status: 404 });
    const object = await getR2Client().send(new GetObjectCommand({ Bucket: getBucketName(), Key: toObjectKey(key) }));
    if (!object.Body) return new NextResponse("File not found.", { status: 404 });
    const filename = encodeURIComponent(displayName(key));
    const download = new URL(request.url).searchParams.get("download") === "1";
    const headers = new Headers({
      "Content-Type": object.ContentType || "application/octet-stream",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename*=UTF-8''${filename}`,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    });
    if (object.ContentLength) headers.set("Content-Length", String(object.ContentLength));
    return new NextResponse(object.Body.transformToWebStream(), { headers });
  } catch (error) {
    console.error(error);
    return new NextResponse("File not found.", { status: 404 });
  }
}