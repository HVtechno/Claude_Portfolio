// GET /api/cv/pdf           -> the published CV as a clean A4 PDF (public)
// GET /api/cv/pdf?draft=1   -> your current draft (owner only, from the editor)
import { isAuthed } from "@/lib/cv/auth";
import { getEditorState, getPublished } from "@/lib/cv/store";
import { pdfFileName, renderCvPdf } from "@/lib/cv/pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const wantDraft = new URL(req.url).searchParams.get("draft") === "1";
  try {
    let data;
    if (wantDraft) {
      if (!isAuthed()) return Response.json({ error: "unauthorized" }, { status: 401 });
      data = (await getEditorState()).draft;
    } else {
      data = await getPublished();
    }
    const pdf = await renderCvPdf(data);
    const name = pdfFileName(data);
    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${name}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("[cv] pdf failed:", e);
    return Response.json({ error: "pdf_failed" }, { status: 500 });
  }
}
