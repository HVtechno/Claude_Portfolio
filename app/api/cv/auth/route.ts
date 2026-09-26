// POST  -> log in with the owner password, sets the signed session cookie
// DELETE -> log out
import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  checkPassword,
  clearFailures,
  editorEnabled,
  makeSessionToken,
  recordFailure,
  tooManyAttempts,
} from "@/lib/cv/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ipOf = (req: Request) =>
  (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "local";

export async function POST(req: Request) {
  if (!editorEnabled()) return NextResponse.json({ error: "disabled" }, { status: 503 });
  const ip = ipOf(req);
  if (tooManyAttempts(ip))
    return NextResponse.json({ error: "too_many_attempts" }, { status: 429 });

  let password = "";
  try {
    password = String((await req.json())?.password ?? "");
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  if (!checkPassword(password)) {
    recordFailure(ip);
    await new Promise((r) => setTimeout(r, 500)); // slow down guessing
    return NextResponse.json({ error: "wrong_password" }, { status: 401 });
  }

  clearFailures(ip);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, makeSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
