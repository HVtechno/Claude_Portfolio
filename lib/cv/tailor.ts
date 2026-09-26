// -----------------------------------------------------------------------------
// Tailor Hari's PUBLISHED /cv to a recruiter's job description — 3 passes:
//
//   1. ANALYZE (model)  — map every JD requirement to real CV evidence:
//                          strong | transferable (+ the real cv_term) | missing
//   2. REWRITE (model)  — evidence-gated rewrite of the text slots only:
//                          summary, each job's bullets (same count), skill order
//   3. VERIFY  (code)   — enforce the rules; anything that breaks one reverts to
//                          the original wording
//
// The model never touches the layout: its text goes back into the same CvData
// that renders /cv and its PDF. Employers, titles, dates, locations,
// certifications and education are copied from the published CV untouched.
// -----------------------------------------------------------------------------

import { cleanCv, cvToText, type CvData } from "./types";

// ---- tunables ----
const ANALYZE_MODEL = () => process.env.OPENAI_ANALYZE_MODEL || "gpt-4o-mini";
const REWRITE_MODEL = () => process.env.OPENAI_TAILOR_MODEL || "gpt-4o";
const BULLET_GROWTH = 1.15; // a bullet may be at most ~15% longer than the original
const SUMMARY_GROWTH = 1.1; // the summary at most ~10% longer
const TRANSFERABLE_CREDIT = 0.6; // "related experience" counts partly in the match %

export type ReqStatus = "strong" | "transferable" | "missing";
export interface Requirement {
  term: string;
  importance: "must" | "nice";
  status: ReqStatus;
  cvTerm?: string;
}

export interface TailorResult {
  cv: CvData;
  role: string;
  requirements: Requirement[];
  matched: string[]; // strong + transferable terms
  related: string[]; // transferable only
  missing: string[];
  coverage: number; // 0..100, weighted (must x2, transferable partial)
  fitNote: string;
  reverted: number; // lines the guard reverted to the original wording
}

type Json = Record<string, unknown>;

// ---------------- text helpers ----------------
// keeps dotted names whole ("Node.js", "Next.js") but drops sentence full stops
const norm = (s: string) =>
  ` ${s
    .toLowerCase()
    .replace(/\.(?![a-z0-9])/g, " ")
    .replace(/[^a-z0-9+#.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()} `;

/** keyword present as a whole word/phrase (case/punctuation-insensitive) */
export function hasKeyword(haystackNorm: string, keyword: string) {
  const k = norm(keyword).trim();
  return k.length > 0 && haystackNorm.includes(` ${k} `);
}

const numbersIn = (s: string) =>
  s.match(/\d+(?:[.,]\d+)?\s*%?/g)?.map((n) => n.replace(/\s+/g, "")) ?? [];

function numbersAllowed(text: string, source: string) {
  const allowed = new Set(numbersIn(source));
  return numbersIn(text).every((n) => allowed.has(n));
}

const asStr = (v: unknown, max = 2000) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const asStrArr = (v: unknown, max = 60) =>
  Array.isArray(v) ? v.map((x) => asStr(x, 400)).filter(Boolean).slice(0, max) : [];
const asObj = (v: unknown) => (v && typeof v === "object" ? v : {}) as Json;

// ---------------- pass 1 result -> checked requirements ----------------
/**
 * Re-check the model's analysis against the real CV text, so a wrong label can
 * never unlock a keyword: "strong" must literally appear in the CV; otherwise
 * it needs a real cv_term (-> transferable) or it's "missing".
 */
const STOP = new Set(
  "a an and or the of for to in on with using use experience experienced knowledge proficiency proficient strong solid hands hands-on ability skills skill tools tool etc years year plus good excellent familiarity familiar understanding working work".split(
    " "
  )
);
/** every meaningful word of the requirement appears somewhere in the CV */
function allKeyWordsIn(cvNorm: string, term: string) {
  const words = norm(term)
    .trim()
    .split(" ")
    .filter((w) => w.length > 1 && !STOP.has(w));
  return words.length > 0 && words.every((w) => cvNorm.includes(` ${w} `));
}

/** the two terms name the same thing ("Apache Spark" ~ "PySpark", "mentoring engineers" ~ "Mentoring") */
function lexicallyRelated(a: string, b: string) {
  const ta = norm(a).trim().split(" ").filter((w) => w.length > 2 && !STOP.has(w));
  const nb = norm(b);
  const tb = nb.trim().split(" ").filter((w) => w.length > 2 && !STOP.has(w));
  return ta.some((w) => nb.includes(w)) || tb.some((w) => norm(a).includes(w));
}

/**
 * Named products/tools in the requirement that are NOT on the CV
 * ("Kubernetes", "Snowflake", "Apache Airflow", "GCP"). Capitalised words other
 * than a phrase's first word, or a single capitalised/acronym term, count as names.
 */
function unknownProductNames(cvNorm: string, term: string) {
  const words = term.split(/\s+/).filter(Boolean);
  const names = words.filter((w, i) => /[A-Z]/.test(w) && (i > 0 || words.length === 1 || /^[A-Z0-9/+#.-]{2,}$/.test(w)));
  return names.filter((w) => !hasKeyword(cvNorm, w.replace(/[(),:;]/g, "")));
}

export function checkRequirements(base: CvData, analysis: Json): Requirement[] {
  const cvNorm = norm(cvToText(base));
  const seen = new Set<string>();
  const out: Requirement[] = [];
  const list = Array.isArray(analysis.requirements) ? analysis.requirements : [];
  for (const raw of list.slice(0, 24)) {
    const r = asObj(raw);
    const term = asStr(r.term, 80);
    if (!term || seen.has(term.toLowerCase())) continue;
    seen.add(term.toLowerCase());
    const importance = r.importance === "nice" ? "nice" : "must";
    const cvTerm = asStr(r.cv_term, 80);
    // the model's cv_term only counts if those exact words really are on the CV
    const realCvTerm =
      cvTerm && cvTerm.toLowerCase() !== term.toLowerCase() && hasKeyword(cvNorm, cvTerm) ? cvTerm : "";
    let status: ReqStatus;
    let evidence = "";
    const products = unknownProductNames(cvNorm, term);
    const related = realCvTerm && lexicallyRelated(term, realCvTerm);
    if (hasKeyword(cvNorm, term) || allKeyWordsIn(cvNorm, term)) status = "strong";
    else if (r.status !== "missing" && realCvTerm && related) {
      status = "strong"; // same thing, CV words differ (e.g. JD "Spark" <-> CV "PySpark")
      evidence = realCvTerm;
    } else if (r.status !== "missing" && realCvTerm && products.length === 0) {
      status = "transferable"; // a general ability shown with a different tool
      evidence = realCvTerm;
    } else status = "missing"; // incl. a different product (Kubernetes is not Docker)
    out.push({ term, importance, status, ...(evidence ? { cvTerm: evidence } : {}) });
  }
  return out;
}

export function coverageOf(reqs: Requirement[]) {
  let got = 0;
  let total = 0;
  for (const r of reqs) {
    const w = r.importance === "must" ? 2 : 1;
    total += w;
    if (r.status === "strong") got += w;
    else if (r.status === "transferable") got += w * TRANSFERABLE_CREDIT;
  }
  return total ? Math.round((got / total) * 100) : 0;
}

// ---------------- pass 3: verify + merge ----------------
export function applyTailoring(
  published: CvData,
  rewrite: Json,
  reqs: Requirement[],
  blocked: string[] = [] // hiring company / job location — never allowed into the CV
): TailorResult {
  const base = cleanCv(published);
  const cv: CvData = JSON.parse(JSON.stringify(base));
  const originalText = cvToText(base);
  let reverted = 0;

  const missing = reqs.filter((r) => r.status === "missing");
  const originalNorm = norm(originalText);
  // only block names that aren't legitimately on the CV already (e.g. "Amsterdam")
  const banned = blocked.filter((b) => b.trim().length > 1 && !hasKeyword(originalNorm, b));
  const transferable = reqs.filter((r) => r.status === "transferable");
  // requirements whose JD wording isn't literally on the CV (transferable, or strong
  // via a different CV term) may only be used alongside that real CV term
  const needsEvidence = reqs.filter((r) => r.status !== "missing" && r.cvTerm);

  /** accept `candidate` only if it keeps every rule; otherwise keep `original` */
  const guard = (candidate: string, original: string, numberSource: string, maxLen: number) => {
    if (!candidate) return original;
    const cNorm = norm(candidate);
    const oNorm = norm(original);
    const ok =
      candidate.length <= maxLen &&
      !banned.some((b) => hasKeyword(cNorm, b)) &&
      numbersAllowed(candidate, numberSource) &&
      // a requirement with no evidence may never be introduced
      !missing.some((r) => hasKeyword(cNorm, r.term) && !hasKeyword(oNorm, r.term)) &&
      // a transferable JD term must sit next to the candidate's real tool
      !needsEvidence.some(
        (r) =>
          hasKeyword(cNorm, r.term) &&
          !hasKeyword(oNorm, r.term) &&
          !(r.cvTerm && hasKeyword(cNorm, r.cvTerm))
      );
    if (!ok) reverted++;
    return ok ? candidate : original;
  };

  // summary
  const summary = asStr(rewrite.summary, 2000);
  if (summary)
    cv.summary = guard(summary, base.summary, originalText, Math.ceil(base.summary.length * SUMMARY_GROWTH) + 10);

  // bullets — same count per job, one rewrite per original bullet
  if (Array.isArray(rewrite.jobs)) {
    for (const raw of rewrite.jobs) {
      const j = asObj(raw);
      const i = Number(j.index);
      if (!Number.isInteger(i) || i < 0 || i >= base.jobs.length) continue;
      const orig = base.jobs[i];
      const jobSource = [orig.role, orig.org, ...orig.bullets].join(" ");
      const used = new Set<number>();
      const next: string[] = [];
      for (const b of Array.isArray(j.bullets) ? j.bullets : []) {
        const bo = asObj(b);
        const from = Number(bo.from);
        if (!Number.isInteger(from) || from < 0 || from >= orig.bullets.length || used.has(from)) continue;
        used.add(from);
        const o = orig.bullets[from];
        next.push(guard(asStr(bo.text, 800), o, jobSource, Math.ceil(o.length * BULLET_GROWTH) + 8));
      }
      orig.bullets.forEach((b, k) => !used.has(k) && next.push(b)); // never lose a bullet
      cv.jobs[i] = { ...orig, bullets: next };
    }
  }

  // skills — reorder only, never add
  if (Array.isArray(rewrite.skills)) {
    const taken = new Set<string>();
    const groups: CvData["skills"] = [];
    for (const raw of rewrite.skills) {
      const g = asObj(raw);
      const orig = base.skills.find((x) => x.label.toLowerCase() === asStr(g.label, 80).toLowerCase());
      if (!orig || groups.some((x) => x.label === orig.label)) continue;
      const byLower = new Map(orig.items.map((s) => [s.toLowerCase(), s]));
      const items = asStrArr(g.items, 40)
        .map((s) => byLower.get(s.toLowerCase()))
        .filter((s): s is string => !!s && !taken.has(s));
      items.forEach((s) => taken.add(s));
      orig.items.forEach((s) => !taken.has(s) && (items.push(s), taken.add(s)));
      groups.push({ label: orig.label, items });
    }
    base.skills.forEach((g) => !groups.some((x) => x.label === g.label) && groups.push(g));
    cv.skills = groups;
  }

  return {
    cv,
    role: "",
    requirements: reqs,
    matched: reqs.filter((r) => r.status !== "missing").map((r) => r.term),
    related: transferable.map((r) => r.term),
    missing: missing.map((r) => r.term),
    coverage: coverageOf(reqs),
    fitNote: asStr(rewrite.fit_note, 700),
    reverted,
  };
}

// ---------------- prompts ----------------
const ANALYZE_SYSTEM = `You are a senior technical recruiter. Compare a job description with a candidate's CV and map every requirement to the candidate's real evidence. You do not write anything for the CV — you only analyse.

For each requirement in the job description (skills, tools, responsibilities, seniority signals), decide:
- "strong": the CV clearly shows it (same tool / skill / responsibility). If the CV words differ (JD "Spark" <-> CV "PySpark"), give the CV's exact words in "cv_term".
- "transferable": the CV shows the same capability under a different name (JD "pipeline orchestration" <-> CV "Azure Data Factory"; JD "cloud data warehouse" <-> CV "Azure Synapse"). Give the candidate's real term, exactly as written in the CV, in "cv_term".
- "missing": no evidence in the CV. Do not stretch — if unsure, it is missing.

Rules:
- Quote the evidence (job index + a short phrase from the CV) for strong/transferable.
- Keep requirement terms SHORT: 1-4 words, in the job description's own wording. Split compound requirements into separate items ("Apache Spark and Airflow" -> "Apache Spark", "Airflow"). No sentences.
- "cv_term" must be copied EXACTLY from the CV text (a tool, skill or short phrase that appears in it).
- Extract 8-18 requirements, most important first. Mark each "must" or "nice".

Return ONLY this JSON:
{
  "role": "job title from the JD",
  "seniority": "e.g. senior / lead / architect",
  "tone": "2-4 words describing the JD's style",
  "company": "hiring company name if stated, else empty",
  "location": "job location if stated, else empty",
  "requirements": [
    { "term": "Azure Data Factory", "importance": "must", "status": "strong | transferable | missing",
      "cv_term": "exact words from the CV that prove it (strong when wording differs, and transferable)",
      "evidence": "job 2: 'Implemented Azure Functions to streamline ETL'" }
  ]
}`;

const rewriteSystem = (tone: string, seniority: string) => `You are an elite resume writer. Goal: the highest HONEST interview probability for this specific job. You rewrite an existing CV; you never add facts.

ABSOLUTE RULES
1. Use ONLY facts in the CV. Every tool, skill, number, place, company and date you write must already appear in the CV.
2. STRONG requirements: use the job description's exact terminology.
3. TRANSFERABLE requirements: pair the JD term with the candidate's real tool (its cv_term) in the same sentence ("pipeline orchestration with Azure Data Factory"). Never name a tool the candidate has not used.
4. MISSING requirements: never put them anywhere in the CV. Mention them only in "fit_note", honestly, with the closest real experience.
5. Keep every real metric exactly (30%, 10+ sources). Never add new numbers.
6. Never mention the hiring company, its location, or any location.
7. Mirror the JD's tone (${tone || "professional"}) and seniority (${seniority || "senior"}): strong action verbs, outcome first, no filler.

STRUCTURE & LENGTH (the layout is fixed — you only fill text slots)
- Summary: 3-4 sentences, no longer than the original summary.
- Every job keeps EXACTLY the same number of bullets. One rewritten bullet per original bullet ("from" = original bullet index). Never merge, split or drop.
- Each bullet at most ~15% longer than its original. Shorter is fine.
- Order each job's bullets most-relevant first.
- Skills: reorder groups and items so the most relevant come first. Only existing items — never add a skill.

Return ONLY this JSON:
{
  "summary": "...",
  "jobs": [ { "index": 0, "bullets": [ { "from": 3, "text": "..." } ] } ],
  "skills": [ { "label": "existing group label", "items": ["existing items"] } ],
  "fit_note": "2-3 sentences for the recruiter: strongest matches, any gap and the closest real experience he'd build on"
}`;

function cvForModel(cv: CvData) {
  return {
    summary: cv.summary,
    jobs: cv.jobs.map((j, index) => ({
      index,
      role: j.role,
      org: j.org,
      when: j.when,
      bullets: j.bullets.map((text, i) => ({ i, text })),
    })),
    skills: cv.skills,
    certifications: cv.certs.map((c) => c.name),
    education: cv.education.map((e) => e.name),
  };
}

async function callJson(model: string, system: string, user: string, maxTokens: number): Promise<Json> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("no_key");
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) throw new Error(`openai_${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  try {
    return JSON.parse(data?.choices?.[0]?.message?.content ?? "");
  } catch {
    throw new Error("bad_json");
  }
}

export async function tailorCv(published: CvData, jd: string): Promise<TailorResult> {
  const base = cleanCv(published);
  const cvJson = JSON.stringify(cvForModel(base));

  // pass 1 — analyze
  const analysis = await callJson(
    ANALYZE_MODEL(),
    ANALYZE_SYSTEM,
    `JOB DESCRIPTION:\n${jd}\n\nCV (JSON):\n${cvJson}`,
    1600
  );
  const reqs = checkRequirements(base, analysis);

  // pass 2 — rewrite, with the CHECKED analysis (never the raw model labels)
  const forModel = reqs.map((r) => ({
    term: r.term,
    importance: r.importance,
    status: r.status,
    ...(r.cvTerm ? { cv_term: r.cvTerm } : {}),
  }));
  const rewrite = await callJson(
    REWRITE_MODEL(),
    rewriteSystem(asStr(analysis.tone, 60), asStr(analysis.seniority, 40)),
    `REQUIREMENTS ANALYSIS (pass 1):\n${JSON.stringify(forModel)}\n\nCV (JSON, with job and bullet indexes):\n${cvJson}\n\nJOB DESCRIPTION:\n${jd}`,
    3000
  );

  // pass 3 — verify in code
  const blocked = [asStr(analysis.company, 80), asStr(analysis.location, 80)]
    .flatMap((x) => x.split(/[,/|]/))
    .map((x) => x.trim())
    .filter(Boolean);
  const result = applyTailoring(base, rewrite, reqs, blocked);
  result.role = asStr(analysis.role, 120);
  return result;
}
