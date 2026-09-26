import type { Metadata } from "next";
import { getPublished } from "@/lib/cv/store";
import CvPaper from "@/components/cv/CvPaper";
import CvToolbar from "@/components/cv/CvToolbar";
import HueDrift from "@/components/cv/HueDrift";

// always read the latest published CV — a Publish in the editor is live instantly
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hari · CV",
  description:
    "Curriculum vitae of Harihara Subramanian Ganesh (Hari) — data engineering, full-stack and architecture.",
};

export default async function CvPage() {
  const cv = await getPublished();
  return (
    <div className="cvp-page">
      <div className="ambient" />
      <HueDrift />
      <CvToolbar />
      <div className="cvp-wrap">
        <CvPaper data={cv} />
      </div>
    </div>
  );
}
