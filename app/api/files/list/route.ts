import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { displayName, FILES_PREFIX, FOLDER_MARKER, getBucketName, getR2Client, normalizeFolder, toPublicKey } from "@/lib/r2";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const requestedFolder = new URL(request.url).searchParams.get("folder") || "";
    const folder = normalizeFolder(requestedFolder);
    const prefix = `${FILES_PREFIX}${folder ? `${folder}/` : ""}`;
    const result = await getR2Client().send(new ListObjectsV2Command({ Bucket: getBucketName(), Prefix: prefix, Delimiter: "/" }));
    const folders = (result.CommonPrefixes ?? []).flatMap(({ Prefix }) => {
      if (!Prefix) return [];
      const path = Prefix.slice(FILES_PREFIX.length).replace(/\/$/, "");
      const name = path.split("/").pop() || path;
      return [{ name, path, url: `/files?folder=${encodeURIComponent(path)}` }];
    }).sort((a, b) => a.name.localeCompare(b.name));
    const files = (result.Contents ?? []).filter((file) => file.Key && file.Key !== prefix && !file.Key.endsWith(`/${FOLDER_MARKER}`)).map((file) => {
      const key = toPublicKey(file.Key!);
      return { key, name: displayName(key), size: file.Size ?? 0, updatedAt: file.LastModified?.toISOString() ?? null, url: `/files/${key}` };
    }).sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""));
    return NextResponse.json({ folder, folders, files });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ folders: [], files: [], error: "File library is not connected yet." }, { status: 503 });
  }
}