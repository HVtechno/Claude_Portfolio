// -----------------------------------------------------------------------------
// CV data model — shared by the public /cv page, the private editor, the API
// and VeXa's hire flow. Everything is plain text; links are derived safely.
// -----------------------------------------------------------------------------

export interface CvJob {
  when: string;
  role: string;
  org: string;
  /** optional, e.g. "Amsterdam, Netherlands" — shown next to the company */
  location?: string;
  bullets: string[];
}
export interface CvGroup {
  label: string;
  items: string[];
}
export interface CvItem {
  name: string;
  meta: string;
}
export interface CvData {
  name: string;
  title: string;
  /** one line per contact item, e.g. an email, phone, city or URL */
  contact: string[];
  summary: string;
  jobs: CvJob[];
  skills: CvGroup[];
  certs: CvItem[];
  education: CvItem[];
}
export interface CvVersion {
  id: string;
  label: string;
  created_at: string;
}

// ---- validation: coerce anything the client sends into a safe CvData ----
const str = (v: unknown, max = 2000) =>
  (typeof v === "string" ? v : v == null ? "" : String(v)).slice(0, max);
const arr = <T>(v: unknown, max: number, map: (x: unknown) => T): T[] =>
  Array.isArray(v) ? v.slice(0, max).map(map) : [];
const obj = (v: unknown) =>
  (v && typeof v === "object" ? v : {}) as Record<string, unknown>;

export function validateCv(input: unknown): CvData | null {
  if (!input || typeof input !== "object") return null;
  const d = obj(input);
  return {
    name: str(d.name, 200),
    title: str(d.title, 300),
    contact: arr(d.contact, 12, (x) => str(x, 300)),
    summary: str(d.summary, 4000),
    jobs: arr(d.jobs, 40, (x) => {
      const j = obj(x);
      return {
        when: str(j.when, 100),
        role: str(j.role, 200),
        org: str(j.org, 200),
        location: str(j.location, 120),
        bullets: arr(j.bullets, 20, (b) => str(b, 1000)),
      };
    }),
    skills: arr(d.skills, 20, (x) => {
      const g = obj(x);
      return { label: str(g.label, 100), items: arr(g.items, 40, (i) => str(i, 100)) };
    }),
    certs: arr(d.certs, 30, (x) => {
      const c = obj(x);
      return { name: str(c.name, 300), meta: str(c.meta, 300) };
    }),
    education: arr(d.education, 10, (x) => {
      const c = obj(x);
      return { name: str(c.name, 300), meta: str(c.meta, 300) };
    }),
  };
}

/** Turn a contact line into a safe link (mailto / tel / https) or null. */
export function contactHref(text: string): string | null {
  const t = text.trim();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) return `mailto:${t}`;
  if (/^\+?[\d\s().-]{7,}$/.test(t)) return `tel:${t.replace(/[^\d+]/g, "")}`;
  if (/^https?:\/\/\S+$/i.test(t)) return t;
  if (/^(www\.)?[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?$/i.test(t)) return `https://${t}`;
  return null;
}

/** Drop blank lines/items so half-finished edits never show on the public CV or PDF. */
export function cleanCv(raw: CvData): CvData {
  const has = (v: string) => v.trim().length > 0;
  return {
    ...raw,
    contact: raw.contact.filter(has),
    jobs: raw.jobs
      .map((j) => ({ ...j, bullets: j.bullets.filter(has) }))
      .filter((j) => has(j.role) || has(j.org) || j.bullets.length > 0),
    skills: raw.skills
      .map((g) => ({ ...g, items: g.items.filter(has) }))
      .filter((g) => g.items.length > 0),
    certs: raw.certs.filter((c) => has(c.name)),
    education: raw.education.filter((c) => has(c.name)),
  };
}

/** Plain-text CV, used as ground truth for VeXa's hire / resume-tailoring flow. */
export function cvToText(cv: CvData): string {
  const out: string[] = [cv.name.toUpperCase(), cv.contact.join(" | "), ""];
  if (cv.title) out.push(cv.title, "");
  out.push("PROFESSIONAL SUMMARY", cv.summary, "", "PROFESSIONAL EXPERIENCE", "");
  cv.jobs.forEach((j) => {
    out.push(`${j.role} — ${j.org}${j.location ? `, ${j.location}` : ""} (${j.when})`);
    j.bullets.forEach((b) => out.push(`- ${b}`));
    out.push("");
  });
  out.push("SKILLS");
  cv.skills.forEach((g) => out.push(`${g.label}: ${g.items.join(", ")}`));
  out.push("", "EDUCATION");
  cv.education.forEach((e) => out.push(`${e.name} — ${e.meta}`));
  out.push("", "CERTIFICATIONS");
  cv.certs.forEach((c) => out.push(`- ${c.name} (${c.meta})`));
  return out.join("\n");
}
