// Calls Hari's real Resuviq backend to produce a genuinely tailored resume PDF:
//   login -> custom-job (paste JD) -> optimize (4-pass rewrite) -> export PDF.
// Config comes from .env.local (see keys below). If unconfigured, returns
// { error: "not_configured" } so the client can fall back to the LLM tailoring.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API = process.env.RESUVIQ_API_URL; // e.g. http://localhost:8000 or the deployed backend
const EMAIL = process.env.RESUVIQ_EMAIL;
const PASSWORD = process.env.RESUVIQ_PASSWORD;
const RESUME_ID = process.env.RESUVIQ_RESUME_ID;

async function login(): Promise<string> {
  const r = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  if (!r.ok) throw new Error(`login_failed_${r.status}`);
  const d = await r.json();
  if (!d.access_token) throw new Error("no_token");
  return d.access_token as string;
}

export async function POST(req: Request) {
  if (!API || !EMAIL || !PASSWORD || !RESUME_ID) {
    return Response.json({ error: "not_configured" }, { status: 501 });
  }

  let body: { jd?: string; title?: string; company?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  const jd = (body.jd || "").trim();
  if (jd.length < 30) {
    return Response.json({ error: "jd_too_short" }, { status: 400 });
  }

  try {
    const token = await login();
    const auth = { Authorization: `Bearer ${token}` };

    // 1) paste the JD as a custom job (scores it with the real ATS engine)
    const cjForm = new FormData();
    cjForm.append("description", jd);
    if (body.title) cjForm.append("title", body.title);
    if (body.company) cjForm.append("company", body.company);
    const cjRes = await fetch(`${API}/resume-custom-job/${RESUME_ID}`, {
      method: "POST",
      headers: auth,
      body: cjForm,
    });
    if (!cjRes.ok) {
      return Response.json(
        { error: "custom_job", status: cjRes.status, detail: await cjRes.text() },
        { status: 502 }
      );
    }
    const cj = await cjRes.json();
    const jobId = cj.id;

    // 2) optimize (the 4-pass, gap-aware rewrite + re-score)
    const optForm = new FormData();
    optForm.append("job_id", jobId);
    optForm.append("target_language", "English");
    const optRes = await fetch(`${API}/resume-optimize/${RESUME_ID}`, {
      method: "POST",
      headers: auth,
      body: optForm,
    });
    if (!optRes.ok) {
      return Response.json(
        { error: "optimize", status: optRes.status, detail: await optRes.text() },
        { status: 502 }
      );
    }
    const opt = await optRes.json();

    // 3) render the real Resuviq PDF from the optimized HTML
    const pdfRes = await fetch(`${API}/export-pdf-from-html`, {
      method: "POST",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify({ html: opt.html_resume }),
    });
    if (!pdfRes.ok) {
      return Response.json(
        { error: "pdf", status: pdfRes.status, detail: await pdfRes.text() },
        { status: 502 }
      );
    }
    const pdfBase64 = Buffer.from(await pdfRes.arrayBuffer()).toString("base64");

    return Response.json({
      pdfBase64,
      summary: {
        ats_before: opt.ats_score_before ?? null,
        ats_after: opt.ats_score_after ?? null,
        interview_probability_after: opt.interview_probability_after ?? null,
        interview_probability_pct: opt.interview_probability_pct ?? null,
        matched_keywords: opt.matched_keywords ?? [],
        missing_keywords: opt.missing_keywords ?? [],
        strong_skills: opt.strong_skills ?? [],
      },
    });
  } catch (e) {
    return Response.json({ error: "exception", detail: String(e) }, { status: 502 });
  }
}
