import { S3Client } from "@aws-sdk/client-s3";

export const FILES_PREFIX = "portfolio-files/";

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export function getR2Client() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${required("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: required("R2_ACCESS_KEY_ID"),
      secretAccessKey: required("R2_SECRET_ACCESS_KEY"),
    },
  });
}

export function getBucketName() {
  return required("R2_BUCKET_NAME");
}

export function createFileKey(filename: string) {
  const safeName = filename
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120) || "file";

  return `${FILES_PREFIX}${crypto.randomUUID()}--${safeName}`;
}

export function toPublicKey(objectKey: string) {
  return objectKey.startsWith(FILES_PREFIX) ? objectKey.slice(FILES_PREFIX.length) : objectKey;
}

export function toObjectKey(publicKey: string) {
  const clean = publicKey.replace(/^\/+/, "");
  if (!clean || clean.includes("..") || clean.includes("\\")) throw new Error("Invalid file key");
  return `${FILES_PREFIX}${clean}`;
}

export function displayName(publicKey: string) {
  const delimiter = publicKey.indexOf("--");
  return delimiter >= 0 ? publicKey.slice(delimiter + 2) : publicKey;
}
