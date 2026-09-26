"use client";

import { useState } from "react";

export default function CvToolbar() {
  const [toast, setToast] = useState("");
  const flash = (t: string) => {
    setToast(t);
    window.setTimeout(() => setToast(""), 1800);
  };
  const copy = async () => {
    const url = `${window.location.origin}/cv`;
    try {
      await navigator.clipboard.writeText(url);
      flash("Link copied");
    } catch {
      flash(url);
    }
  };
  return (
    <>
      <div className="cvp-bar">
        <a className="cvp-btn ghost" href="/">
          ← Back<span className="cvp-lg"> to the system</span>
        </a>
        <div className="cvp-wm">HARI</div>
        <button className="cvp-btn" onClick={copy}>
          ⧉ Copy<span className="cvp-lg"> link</span>
        </button>
        <a className="cvp-btn primary" href="/api/cv/pdf">
          ⬇ <span className="cvp-lg">Download </span>PDF
        </a>
      </div>
      <div className={"cvp-toast" + (toast ? " show" : "")}>{toast}</div>
    </>
  );
}
