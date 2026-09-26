"use client";

import { useState } from "react";

export default function CvGate({ disabled }: { disabled?: boolean }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pw || busy) return;
    setBusy(true);
    setErr("");
    try {
      const r = await fetch("/api/cv/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      if (r.ok) {
        window.location.reload();
        return;
      }
      setErr(r.status === 429 ? "Too many attempts. Try again in 15 minutes." : "Wrong password.");
    } catch {
      setErr("Couldn't reach the server.");
    }
    setBusy(false);
    setPw("");
  };

  return (
    <div className="cvp-gate">
      <form className="cvp-gate-card" onSubmit={submit}>
        <div className="cvp-lock">🔒</div>
        <h2>Private</h2>
        {disabled ? (
          <p>This page is switched off.</p>
        ) : (
          <>
            <p>This page is for the owner only.</p>
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="Password"
              autoComplete="current-password"
              autoFocus
            />
            <button type="submit" disabled={busy}>
              {busy ? "Checking…" : "Unlock"}
            </button>
            <div className="cvp-err">{err}</div>
          </>
        )}
      </form>
    </div>
  );
}
