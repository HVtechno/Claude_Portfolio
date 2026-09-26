// -----------------------------------------------------------------------------
// CV storage (server-side only).
//  - Supabase (production): set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY and run
//    supabase/cv.sql once. The service key never reaches the browser.
//  - Local file (fallback): .data/cv.json — handy for local dev. NOT durable on
//    Render (the disk is wiped on every deploy), so use Supabase in production.
// -----------------------------------------------------------------------------

import { promises as fs } from "fs";
import path from "path";
import { CV_SEED } from "@/data/cv";
import { validateCv, type CvData, type CvVersion } from "./types";

type DocId = "draft" | "published";

const SB_URL = process.env.SUPABASE_URL?.replace(/\/+$/, "");
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const storageKind = (): "supabase" | "file" =>
  SB_URL && SB_KEY ? "supabase" : "file";

const SEED_VERSION: CvVersion = {
  id: "seed",
  label: "Original from resume",
  created_at: "",
};
const MAX_VERSIONS = 30;

// ---------------- Supabase (PostgREST over fetch, no SDK needed) ----------------
async function sb(p: string, init: RequestInit = {}) {
  const res = await fetch(`${SB_URL}/rest/v1/${p}`, {
    ...init,
    cache: "no-store",
    headers: {
      apikey: SB_KEY as string,
      Authorization: `Bearer ${SB_KEY}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`supabase ${res.status}: ${await res.text()}`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// ---------------- local JSON file ----------------
const FILE = path.join(process.cwd(), ".data", "cv.json");
type FileDb = {
  docs: Partial<Record<DocId, CvData>>;
  versions: (CvVersion & { data: CvData })[];
};
async function readFile(): Promise<FileDb> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8"));
  } catch {
    return { docs: {}, versions: [] };
  }
}
async function writeFile(db: FileDb) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(db, null, 2), "utf8");
}

// ---------------- primitives ----------------
async function getDoc(id: DocId): Promise<CvData | null> {
  if (storageKind() === "supabase") {
    const rows = await sb(`cv_documents?id=eq.${id}&select=data`);
    return rows?.[0]?.data ? validateCv(rows[0].data) : null;
  }
  const d = (await readFile()).docs[id];
  return d ? validateCv(d) : null;
}

async function putDoc(id: DocId, data: CvData) {
  if (storageKind() === "supabase") {
    await sb("cv_documents", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify([{ id, data, updated_at: new Date().toISOString() }]),
    });
    return;
  }
  const db = await readFile();
  db.docs[id] = data;
  await writeFile(db);
}

async function addVersion(label: string, data: CvData) {
  if (storageKind() === "supabase") {
    await sb("cv_versions", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify([{ label, data }]),
    });
    return;
  }
  const db = await readFile();
  db.versions.unshift({
    id: String(Date.now()),
    label,
    created_at: new Date().toISOString(),
    data,
  });
  db.versions = db.versions.slice(0, MAX_VERSIONS);
  await writeFile(db);
}

async function listVersions(): Promise<CvVersion[]> {
  let list: CvVersion[];
  if (storageKind() === "supabase") {
    const rows = await sb(
      `cv_versions?select=id,label,created_at&order=created_at.desc&limit=${MAX_VERSIONS}`
    );
    list = (rows || []).map((r: { id: number; label: string; created_at: string }) => ({
      id: String(r.id),
      label: r.label,
      created_at: r.created_at,
    }));
  } else {
    list = (await readFile()).versions.map(({ id, label, created_at }) => ({
      id,
      label,
      created_at,
    }));
  }
  return [...list, SEED_VERSION];
}

async function getVersion(id: string): Promise<CvData | null> {
  if (id === "seed") return CV_SEED;
  if (storageKind() === "supabase") {
    if (!/^\d+$/.test(id)) return null;
    const rows = await sb(`cv_versions?id=eq.${id}&select=data`);
    return rows?.[0]?.data ? validateCv(rows[0].data) : null;
  }
  const v = (await readFile()).versions.find((x) => x.id === id);
  return v ? validateCv(v.data) : null;
}

// ---------------- public API ----------------

/** The live CV everyone sees. Falls back to the seed if nothing is published yet. */
export async function getPublished(): Promise<CvData> {
  try {
    return (await getDoc("published")) ?? CV_SEED;
  } catch (e) {
    console.error("[cv] getPublished failed, serving seed:", e);
    return CV_SEED;
  }
}

export async function getEditorState() {
  const published = (await getDoc("published")) ?? CV_SEED;
  const draft = (await getDoc("draft")) ?? published;
  const versions = await listVersions();
  return { draft, published, versions };
}

export async function saveDraft(data: CvData) {
  await putDoc("draft", data);
}

export async function publishCv(data: CvData) {
  await putDoc("draft", data);
  await putDoc("published", data);
  await addVersion("Published", data);
  return listVersions();
}

export async function restoreVersion(id: string) {
  return getVersion(id);
}
