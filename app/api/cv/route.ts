// Owner-only CV API. Every method requires the signed session cookie.
//   GET                          -> { draft, published, versions }
//   PUT  { draft }               -> save the private draft (autosave)
//   POST { action: "publish", draft }   -> make the draft live
//   POST { action: "restore", id }      -> fetch an older version (into the draft)
import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/cv/auth";
import { validateCv } from "@/lib/cv/types";
import {
  getEditorState,
  publishCv,
  restoreVersion,
  saveDraft,
} from "@/lib/cv/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 300_000;
const deny = () => NextResponse.json({ error: "unauthorized" }, { status: 401 });

async function readBody(req: Request) {
  if (Number(req.headers.get("content-length") || 0) > MAX_BYTES) return null;
  if (!(req.headers.get("content-type") || "").includes("application/json")) return null;
  try {
    const text = await req.text();
    if (text.length > MAX_BYTES) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function GET() {
  if (!isAuthed()) return deny();
  try {
    return NextResponse.json(await getEditorState());
  } catch (e) {
    console.error("[cv] storage error:", e);
    return NextResponse.json({ error: "storage", detail: String(e) }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  if (!isAuthed()) return deny();
  const body = await readBody(req);
  const draft = validateCv(body?.draft);
  if (!draft) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  try {
    await saveDraft(draft);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[cv] storage error:", e);
    return NextResponse.json({ error: "storage", detail: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!isAuthed()) return deny();
  const body = await readBody(req);
  if (!body) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  try {
    if (body.action === "publish") {
      const draft = validateCv(body.draft);
      if (!draft) return NextResponse.json({ error: "bad_request" }, { status: 400 });
      const versions = await publishCv(draft);
      return NextResponse.json({ ok: true, published: draft, versions });
    }
    if (body.action === "restore") {
      const data = await restoreVersion(String(body.id ?? ""));
      if (!data) return NextResponse.json({ error: "not_found" }, { status: 404 });
      return NextResponse.json({ ok: true, data });
    }
    return NextResponse.json({ error: "bad_action" }, { status: 400 });
  } catch (e) {
    console.error("[cv] storage error:", e);
    return NextResponse.json({ error: "storage", detail: String(e) }, { status: 500 });
  }
}
