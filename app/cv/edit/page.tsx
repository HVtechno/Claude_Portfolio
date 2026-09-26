import type { Metadata } from "next";
import { editorEnabled, isAuthed } from "@/lib/cv/auth";
import { getEditorState, storageKind } from "@/lib/cv/store";
import CvGate from "@/components/cv/CvGate";
import CvEditor from "@/components/cv/CvEditor";
import HueDrift from "@/components/cv/HueDrift";

export const dynamic = "force-dynamic";

// never indexed, never linked from anywhere
export const metadata: Metadata = {
  title: "Private",
  robots: { index: false, follow: false, nocache: true },
};

export default async function CvEditPage() {
  let content: React.ReactNode;
  if (!editorEnabled()) content = <CvGate disabled />;
  else if (!isAuthed()) content = <CvGate />;
  else {
    try {
      const state = await getEditorState();
      content = <CvEditor initial={state} storage={storageKind()} />;
    } catch (e) {
      content = (
        <div className="cvp-gate">
          <div className="cvp-gate-card">
            <h2>Storage error</h2>
            <p>Couldn&apos;t load the CV from storage. Check the Supabase settings.</p>
            <pre className="cvp-errbox">{String(e)}</pre>
          </div>
        </div>
      );
    }
  }
  return (
    <div className="cvp-page">
      <div className="ambient" />
      <HueDrift />
      {content}
    </div>
  );
}
