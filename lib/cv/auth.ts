// -----------------------------------------------------------------------------
// Owner-only auth for the private CV editor (/cv/edit).
// One password (CV_ADMIN_PASSWORD, server env only) -> a signed, httpOnly
// session cookie. No user accounts, no login button anywhere on the public site.
// -----------------------------------------------------------------------------

import { createHash, createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "cv_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const PASSWORD = () => process.env.CV_ADMIN_PASSWORD || "";

export const editorEnabled = () => PASSWORD().length > 0;

// sessions are signed with CV_SESSION_SECRET (or, if unset, a key derived from
// the password — so changing the password logs every session out)
function secret(): string {
  return (
    process.env.CV_SESSION_SECRET ||
    createHash("sha256").update(`cv-session:${PASSWORD()}`).digest("hex")
  );
}

const sign = (payload: string) =>
  createHmac("sha256", secret()).update(payload).digest("base64url");

function safeEqual(a: string, b: string) {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function checkPassword(input: string) {
  if (!editorEnabled()) return false;
  return safeEqual(input, PASSWORD());
}

export function makeSessionToken() {
  const exp = String(Date.now() + SESSION_MAX_AGE * 1000);
  return `${exp}.${sign(exp)}`;
}

export function verifySessionToken(token?: string | null) {
  if (!token || !editorEnabled()) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || !/^\d+$/.test(exp) || Number(exp) < Date.now()) return false;
  return safeEqual(sig, sign(exp));
}

/** For server components and route handlers. */
export function isAuthed() {
  return verifySessionToken(cookies().get(SESSION_COOKIE)?.value);
}

// ---- tiny in-memory brute-force guard: 5 wrong tries per IP per 15 minutes ----
const attempts = new Map<string, { n: number; reset: number }>();
const WINDOW = 15 * 60 * 1000;
export function tooManyAttempts(ip: string) {
  const a = attempts.get(ip);
  return !!a && a.reset > Date.now() && a.n >= 5;
}
export function recordFailure(ip: string) {
  const a = attempts.get(ip);
  if (!a || a.reset < Date.now()) attempts.set(ip, { n: 1, reset: Date.now() + WINDOW });
  else a.n++;
}
export function clearFailures(ip: string) {
  attempts.delete(ip);
}
