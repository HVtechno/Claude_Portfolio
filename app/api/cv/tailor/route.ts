// POST /api/cv/tailor { jd } -> Hari's published /cv, tailored to the job
// description, as a PDF (same design as /cv) + an honest keyword-match summary.
// Used by VeXa's "Hire / work with Hari" flow.
import { getPublished } from "@/lib/cv/store";
import { tailorCv } from "@/lib/cv/tailor";
import { renderCvPdf } from "@/lib/cv/pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// each request costs an OpenAI call — keep it to a few per visitor
const hits = new Map<string, number[]>();
const LIMIT = 6;
const WINDOW = 15 * 60 * 1000;
function limited(ip: string) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < WINDOW);
  if (list.length >= LIMIT) return true;
  list.push(now);
  hits.set(ip, list);
  return false;
}

export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "local";
  if (limited(ip)) return Response.json({ error: "rate_limited" }, { status: 429 });

  let jd = "";
  try {
    jd = String((await req.json())?.jd ?? "").trim().slice(0, 12000);
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  if (jd.length < 30) return Response.json({ error: "jd_too_short" }, { status: 400 });

  try {
    const published = await getPublished();
    const t = await tailorCv(published, jd);
    const pdf = await renderCvPdf(t.cv);
    const slug = (t.role || "role").replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "").slice(0, 40);
    return Response.json({
      pdfBase64: Buffer.from(pdf).toString("base64"),
      fileName: `Hari-CV-${slug || "tailored"}.pdf`,
      summary: {
        role: t.role,
        total: t.requirements.length,
        matched: t.matched,
        related: t.related,
        missing: t.missing,
        coverage: t.coverage,
        fitNote: t.fitNote,
      },
    });
  } catch (e) {
    console.error("[cv] tailor failed:", e);
    return Response.json({ error: "tailor_failed" }, { status: 502 });
  }
}
