"use client";

// Private CV editor (/cv/edit) — edit directly on the paper, autosave a private
// draft, then Publish to make it live on /cv. Only rendered for the owner.

import {
  createElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { CvData, CvVersion } from "@/lib/cv/types";
import CvPaper from "@/components/cv/CvPaper";

type SaveState = "idle" | "saving" | "saved" | "error" | "expired";

// ---- a plain-text contentEditable that stays uncontrolled while you type ----
function Editable({
  value,
  onChange,
  as = "span",
  className,
  fk,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  as?: string;
  className?: string;
  fk: string;
  placeholder?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (el && el.innerText !== value && document.activeElement !== el) el.innerText = value;
  }, [value]);
  const clean = (s: string) => s.replace(/ /g, " ").replace(/\s*\n+\s*/g, " ");
  return createElement(as, {
    ref,
    className: "cvp-ed" + (className ? ` ${className}` : ""),
    contentEditable: true,
    suppressContentEditableWarning: true,
    spellCheck: true,
    "data-fk": fk,
    "data-ph": placeholder || "Type here…",
    onInput: (e: React.FormEvent<HTMLElement>) => onChange(clean(e.currentTarget.innerText)),
    onPaste: (e: React.ClipboardEvent<HTMLElement>) => {
      e.preventDefault();
      document.execCommand("insertText", false, clean(e.clipboardData.getData("text/plain")));
    },
    onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        e.currentTarget.blur();
      }
    },
  });
}

const fmt = (iso: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  return (
    d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) +
    ", " +
    d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
  );
};

export default function CvEditor({
  initial,
  storage,
}: {
  initial: { draft: CvData; published: CvData; versions: CvVersion[] };
  storage: "supabase" | "file";
}) {
  const [draft, setDraft] = useState<CvData>(initial.draft);
  const [published, setPublished] = useState<CvData>(initial.published);
  const [versions, setVersions] = useState<CvVersion[]>(initial.versions);
  const [save, setSave] = useState<SaveState>("idle");
  const [preview, setPreview] = useState(false);
  const [histOpen, setHistOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const first = useRef(true);

  const dirty = JSON.stringify(draft) !== JSON.stringify(published);

  const flash = (t: string, ms = 2200) => {
    setToast(t);
    window.setTimeout(() => setToast(""), ms);
  };

  const update = useCallback((fn: (d: CvData) => void) => {
    setDraft((prev) => {
      const next: CvData = JSON.parse(JSON.stringify(prev));
      fn(next);
      return next;
    });
  }, []);

  // ---- autosave the private draft ----
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setSave("saving");
    const id = window.setTimeout(async () => {
      try {
        const r = await fetch("/api/cv", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ draft }),
        });
        setSave(r.ok ? "saved" : r.status === 401 ? "expired" : "error");
      } catch {
        setSave("error");
      }
    }, 900);
    return () => window.clearTimeout(id);
  }, [draft]);

  // warn before leaving with an unsaved draft
  useEffect(() => {
    const onLeave = (e: BeforeUnloadEvent) => {
      if (save === "saving") {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [save]);

  // focus a freshly added field
  useEffect(() => {
    if (!focusKey) return;
    const el = document.querySelector<HTMLElement>(`[data-fk="${focusKey}"]`);
    if (el) {
      el.focus();
      const sel = window.getSelection();
      sel?.selectAllChildren(el);
    }
    setFocusKey(null);
  }, [focusKey, draft]);

  // close the history menu on outside click
  useEffect(() => {
    if (!histOpen) return;
    const close = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".cvp-hist")) setHistOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [histOpen]);

  // ---- actions ----
  const publish = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const r = await fetch("/api/cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "publish", draft }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error === "storage" && d.detail ? d.detail : d.error || `HTTP ${r.status}`);
      setPublished(d.published);
      setVersions(d.versions);
      setSave("saved");
      flash("Published · live on /cv");
    } catch (e) {
      const msg = String(e instanceof Error ? e.message : e);
      console.error("[cv] publish failed:", msg);
      flash(
        msg.includes("unauthorized")
          ? "Session expired — reload and log in"
          : `Publish failed: ${msg.replace(/^Error:\s*/, "").slice(0, 220)}`,
        12000
      );
    }
    setBusy(false);
  };

  const discard = () => {
    setDraft(published);
    flash("Draft discarded");
  };

  const restore = async (id: string) => {
    setHistOpen(false);
    try {
      const r = await fetch("/api/cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore", id }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setDraft(d.data);
      setPreview(false);
      flash("Restored into your draft. Publish to make it live.");
    } catch {
      flash("Couldn't restore that version");
    }
  };

  const logout = async () => {
    await fetch("/api/cv/auth", { method: "DELETE" });
    window.location.reload();
  };

  // ---- list helpers ----
  const moveJob = (i: number, d: number) =>
    update((x) => {
      const j = i + d;
      if (j < 0 || j >= x.jobs.length) return;
      [x.jobs[i], x.jobs[j]] = [x.jobs[j], x.jobs[i]];
    });

  const statusText = {
    idle: dirty ? "Unpublished changes (private draft)" : "Published · in sync",
    saving: "Saving draft…",
    saved: dirty ? "Draft saved · not published yet" : "Published · in sync",
    error: "Couldn't save the draft — check your connection",
    expired: "Session expired — reload and log in again",
  }[save];

  const X = ({ onClick, title = "Remove" }: { onClick: () => void; title?: string }) => (
    <button className="cvp-x" onClick={onClick} title={title} aria-label={title}>
      ✕
    </button>
  );

  return (
    <>
      <div className="cvp-bar cvp-edbar">
        <span className="cvp-badge">Editing · only you</span>
        <span className={"cvp-status" + (dirty || save === "saving" ? " dirty" : "") + (save === "error" || save === "expired" ? " bad" : "")}>
          <i />
          {statusText}
        </span>
        <span className="cvp-sp" />
        <button className="cvp-btn ghost" onClick={discard} disabled={!dirty}>
          Discard
        </button>
        <div className="cvp-hist">
          <button className="cvp-btn ghost" onClick={() => setHistOpen((o) => !o)}>
            ↺ History
          </button>
          {histOpen && (
            <div className="cvp-hist-menu">
              {versions.map((v, i) => (
                <div className="cvp-hist-row" key={v.id}>
                  <div>
                    {v.label}
                    <small>
                      {v.id === "seed" ? "the CV you started with" : fmt(v.created_at)}
                      {i === 0 && v.id !== "seed" ? " · live now" : ""}
                    </small>
                  </div>
                  <button onClick={() => restore(v.id)}>Restore</button>
                </div>
              ))}
            </div>
          )}
        </div>
        <button className="cvp-btn" onClick={() => setPreview((p) => !p)}>
          {preview ? "✎ Edit" : "👁 Preview"}
        </button>
        <a className="cvp-btn ghost" href="/api/cv/pdf?draft=1" title="Download your draft as PDF">
          ⬇ PDF
        </a>
        <a className="cvp-btn ghost" href="/cv" target="_blank" rel="noreferrer">
          Live ↗
        </a>
        <button className="cvp-btn primary" onClick={publish} disabled={!dirty || busy}>
          {busy ? "Publishing…" : "Publish"}
        </button>
        <button className="cvp-btn ghost" onClick={logout} title="Log out" aria-label="Log out">
          ⏻
        </button>
      </div>

      <div className="cvp-wrap">
        {storage === "file" && (
          <div className="cvp-note warn">
            Saving to a local file (<code>.data/cv.json</code>). Fine on your computer — on
            Render, connect Supabase or your edits disappear on the next deploy.
          </div>
        )}
        <div className="cvp-note">
          {preview ? (
            <>👁 <span><b>Preview:</b> exactly what recruiters will see after you publish.</span></>
          ) : (
            <>✎ <span><b>Click any text to edit it.</b> Hover a job to move or delete it. Changes are a private draft until you press Publish.</span></>
          )}
        </div>

        {preview ? (
          <CvPaper data={draft} />
        ) : (
          <article className="cvp-paper cvp-editing">
            <header className="cvp-head">
              <img src="/hari.jpg" alt="" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <Editable as="h1" fk="name" value={draft.name} onChange={(v) => update((x) => { x.name = v; })} placeholder="Your name" />
                <Editable as="div" className="cvp-title" fk="title" value={draft.title} onChange={(v) => update((x) => { x.title = v; })} placeholder="Headline" />
                <div className="cvp-contact">
                  {draft.contact.map((c, i) => (
                    <span className="cvp-row" key={i}>
                      <Editable fk={`contact.${i}`} value={c} onChange={(v) => update((x) => { x.contact[i] = v; })} placeholder="email / phone / link" />
                      <X onClick={() => update((x) => { x.contact.splice(i, 1); })} />
                    </span>
                  ))}
                  <button className="cvp-addinline" onClick={() => { update((x) => { x.contact.push(""); }); setFocusKey(`contact.${draft.contact.length}`); }}>
                    + contact
                  </button>
                </div>
              </div>
            </header>

            <section className="cvp-sec">
              <h2>Summary</h2>
              <Editable as="p" fk="summary" value={draft.summary} onChange={(v) => update((x) => { x.summary = v; })} placeholder="A short professional summary" />
            </section>

            <section className="cvp-sec">
              <div className="cvp-sechead">
                <h2>Experience</h2>
                <button
                  className="cvp-add cvp-add-top"
                  onClick={() => {
                    update((x) => {
                      x.jobs.unshift({ when: "Mon YYYY – Present", role: "", org: "", bullets: [""] });
                    });
                    setFocusKey("jobs.0.role");
                  }}
                >
                  + Add new role
                </button>
              </div>
              {draft.jobs.map((j, i) => (
                <div className="cvp-job" key={i}>
                  <div className="cvp-jobctl">
                    <button className="cvp-mini" title="Move up" onClick={() => moveJob(i, -1)} disabled={i === 0}>↑</button>
                    <button className="cvp-mini" title="Move down" onClick={() => moveJob(i, 1)} disabled={i === draft.jobs.length - 1}>↓</button>
                    <button className="cvp-mini del" title="Delete this job" onClick={() => { update((x) => { x.jobs.splice(i, 1); }); flash("Job removed (draft only)"); }}>✕</button>
                  </div>
                  <Editable as="div" className="cvp-when" fk={`jobs.${i}.when`} value={j.when} onChange={(v) => update((x) => { x.jobs[i].when = v; })} placeholder="Mon YYYY – Present" />
                  <div>
                    <Editable as="h3" fk={`jobs.${i}.role`} value={j.role} onChange={(v) => update((x) => { x.jobs[i].role = v; })} placeholder="Role" />
                    <div className="cvp-org cvp-orgrow">
                      <Editable fk={`jobs.${i}.org`} value={j.org} onChange={(v) => update((x) => { x.jobs[i].org = v; })} placeholder="Company" />
                      <span className="cvp-loc">·</span>
                      <Editable className="cvp-loc" fk={`jobs.${i}.location`} value={j.location || ""} onChange={(v) => update((x) => { x.jobs[i].location = v; })} placeholder="City, Country" />
                    </div>
                    <ul>
                      {j.bullets.map((b, k) => (
                        <li key={k}>
                          <span className="cvp-row">
                            <Editable fk={`jobs.${i}.b.${k}`} value={b} onChange={(v) => update((x) => { x.jobs[i].bullets[k] = v; })} placeholder="What you did and the impact" />
                            <X onClick={() => update((x) => { x.jobs[i].bullets.splice(k, 1); })} />
                          </span>
                        </li>
                      ))}
                    </ul>
                    <button className="cvp-addinline" onClick={() => { update((x) => { x.jobs[i].bullets.push(""); }); setFocusKey(`jobs.${i}.b.${j.bullets.length}`); }}>
                      + bullet
                    </button>
                  </div>
                </div>
              ))}
              <button className="cvp-add" onClick={() => { update((x) => { x.jobs.push({ when: "", role: "", org: "", bullets: [""] }); }); setFocusKey(`jobs.${draft.jobs.length}.role`); }}>
                + Add an older role (at the end)
              </button>
            </section>

            <section className="cvp-sec">
              <h2>Skills</h2>
              <div className="cvp-skills">
                {draft.skills.map((g, i) => (
                  <div className="cvp-skillrow" key={i}>
                    <span className="cvp-row cvp-k">
                      <Editable fk={`skills.${i}.label`} value={g.label} onChange={(v) => update((x) => { x.skills[i].label = v; })} placeholder="Group" />
                      <X title="Remove group" onClick={() => update((x) => { x.skills.splice(i, 1); })} />
                    </span>
                    <div className="cvp-chips">
                      {g.items.map((c, k) => (
                        <span className="cvp-chip" key={k}>
                          <Editable fk={`skills.${i}.${k}`} value={c} onChange={(v) => update((x) => { x.skills[i].items[k] = v; })} placeholder="Skill" />
                          <X onClick={() => update((x) => { x.skills[i].items.splice(k, 1); })} />
                        </span>
                      ))}
                      <button className="cvp-chipadd" onClick={() => { update((x) => { x.skills[i].items.push(""); }); setFocusKey(`skills.${i}.${g.items.length}`); }}>
                        + add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button className="cvp-add" onClick={() => { update((x) => { x.skills.push({ label: "", items: [] }); }); setFocusKey(`skills.${draft.skills.length}.label`); }}>
                + Add skill group
              </button>
            </section>

            <section className="cvp-sec cvp-two">
              {(["certs", "education"] as const).map((key) => (
                <div key={key}>
                  <h2>{key === "certs" ? "Certifications" : "Education"}</h2>
                  {draft[key].map((c, i) => (
                    <div className="cvp-item" key={i}>
                      <span className="cvp-row">
                        <Editable as="b" fk={`${key}.${i}.name`} value={c.name} onChange={(v) => update((x) => { x[key][i].name = v; })} placeholder="Name" />
                        <X onClick={() => update((x) => { x[key].splice(i, 1); })} />
                      </span>
                      <Editable as="span" className="cvp-meta" fk={`${key}.${i}.meta`} value={c.meta} onChange={(v) => update((x) => { x[key][i].meta = v; })} placeholder="Issuer · date" />
                    </div>
                  ))}
                  <button className="cvp-add" onClick={() => { update((x) => { x[key].unshift({ name: "", meta: "" }); }); setFocusKey(`${key}.0.name`); }}>
                    + Add {key === "certs" ? "certification" : "education"}
                  </button>
                </div>
              ))}
            </section>

          </article>
        )}
      </div>

      <div className={"cvp-toast" + (toast ? " show" : "")}>{toast}</div>
    </>
  );
}
