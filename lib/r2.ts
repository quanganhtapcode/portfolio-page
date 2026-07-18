import { S3Client } from "@aws-sdk/client-s3";

export const FILES_PREFIX = "portfolio-files/";
export const FOLDER_MARKER = ".folder";

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export function getR2Client() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${required("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: required("R2_ACCESS_KEY_ID"), secretAccessKey: required("R2_SECRET_ACCESS_KEY") },
  });
}

export function getBucketName() { return required("R2_BUCKET_NAME"); }

function safeSegment(value: string) {
  return value.normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

export function normalizeFolder(value: string) {
  const folder = value.split("/").map(safeSegment).filter(Boolean).join("/");
  if (value && !folder) throw new Error("A folder name is required.");
  return folder;
}

export function createFileKey(filename: string, folder = "") {
  const safeName = safeSegment(filename).slice(0, 120) || "file";
  const safeFolder = normalizeFolder(folder);
  return `${FILES_PREFIX}${safeFolder ? `${safeFolder}/` : ""}${crypto.randomUUID()}--${safeName}`;
}

export function folderMarkerKey(folder: string) {
  const safeFolder = normalizeFolder(folder);
  if (!safeFolder) throw new Error("A folder name is required.");
  return `${FILES_PREFIX}${safeFolder}/${FOLDER_MARKER}`;
}

export function toPublicKey(objectKey: string) { return objectKey.startsWith(FILES_PREFIX) ? objectKey.slice(FILES_PREFIX.length) : objectKey; }

export function toObjectKey(publicKey: string) {
  const clean = publicKey.replace(/^\/+/, "");
  if (!clean || clean.includes("..") || clean.includes("\\")) throw new Error("Invalid file key");
  return `${FILES_PREFIX}${clean}`;
}

export function displayName(publicKey: string) {
  const filename = publicKey.split("/").pop() || publicKey;
  const delimiter = filename.indexOf("--");
  return delimiter >= 0 ? filename.slice(delimiter + 2) : filename;
}