import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "portfolio_files_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function sessionSecret() {
  const value = process.env.FILES_SESSION_SECRET;
  if (!value) throw new Error("Missing required environment variable: FILES_SESSION_SECRET");
  return value;
}

function signature(payload: string) {
  return createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

export function createSessionValue() {
  const payload = String(Date.now() + SESSION_MAX_AGE * 1000);
  return `${payload}.${signature(payload)}`;
}

export async function isFilesAdmin() {
  try {
    const value = (await cookies()).get(COOKIE_NAME)?.value;
    if (!value) return false;
    const [expiresAt, receivedSignature] = value.split(".");
    if (!expiresAt || !receivedSignature || Number(expiresAt) < Date.now()) return false;
    const expectedSignature = signature(expiresAt);
    const received = Buffer.from(receivedSignature);
    const expected = Buffer.from(expectedSignature);
    return received.length === expected.length && timingSafeEqual(received, expected);
  } catch {
    return false;
  }
}

export function filesSessionCookie(value: string) {
  return {
    name: COOKIE_NAME,
    value,
    options: {
      httpOnly: true,
      sameSite: "strict" as const,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    },
  };
}

export function clearFilesSessionCookie() {
  return {
    name: COOKIE_NAME,
    value: "",
    options: { httpOnly: true, sameSite: "strict" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 },
  };
}

export function passwordMatches(candidate: string) {
  const expected = process.env.FILES_ADMIN_PASSWORD;
  if (!expected) throw new Error("Missing required environment variable: FILES_ADMIN_PASSWORD");
  const candidateBytes = Buffer.from(candidate);
  const expectedBytes = Buffer.from(expected);
  return candidateBytes.length === expectedBytes.length && timingSafeEqual(candidateBytes, expectedBytes);
}
