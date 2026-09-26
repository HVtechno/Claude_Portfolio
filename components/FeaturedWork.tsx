"use client";

import React, { useEffect, useRef, useState } from "react";
import { FEATURED, CONTACT, FeaturedProduct } from "@/data/featured";

export default function FeaturedWork({
  isMobile,
  onClose,
}: {
  isMobile: boolean;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const count = FEATURED.length;
  const touchX = useRef<number | null>(null);
  const p: FeaturedProduct = FEATURED[idx];

  const go = (d: number) => setIdx((i) => (i + d + count) % count);

  // arrow keys cycle products, Escape closes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (count < 2) return;
      else if (e.key === "ArrowRight") setIdx((i) => (i + 1) % count);
      else if (e.key === "ArrowLeft") setIdx((i) => (i - 1 + count) % count);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count, onClose]);

  // swipe on mobile only
  const onTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    touchX.current = e.changedTouches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!isMobile || touchX.current == null || count < 2) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
  };

  return (
    <div className="fw">
      <button className="fw-close" onClick={onClose} aria-label="Close">
        ✕
      </button>

      <div className="fw-head">
        <div className="fw-eyebrow">featured work</div>
        <h2>Featured Work</h2>
        <p className="fw-lead">
          Products I built for the love of it — the problem, how it works, and
          what came out the other side.
        </p>
      </div>

      <div className="fw-stage" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {!isMobile && count > 1 && (
          <button
            className="fw-arrow left"
            onClick={() => go(-1)}
            aria-label="Previous product"
          >
            ‹
          </button>
        )}

        <div className="fw-card">
          <div className="fw-name">
            {p.name}
            {p.badge && <span className="fw-badge">{p.badge}</span>}
          </div>
          <div className="fw-tag">{p.tagline}</div>

          <div className="fw-block">
            <div className="fw-blabel">the problem</div>
            <p className="fw-btext">{p.problem}</p>
          </div>

          <div className="fw-block">
            <div className="fw-blabel">how it works</div>
            <div className="fw-flow">
              {p.flow.map((s, i) => (
                <React.Fragment key={s}>
                  <span className="fw-step">{s}</span>
                  {i < p.flow.length - 1 && (
                    <span className="fw-arrowhead">→</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="fw-block">
            <div className="fw-blabel">outcome</div>
            <p className="fw-btext">{p.outcome}</p>
          </div>

          <div className="fw-metrics">
            {p.metrics.map((m) => (
              <div className="fw-metric" key={m.label}>
                <div className="fw-mval">{m.value}</div>
                <div className="fw-mlabel">{m.label}</div>
              </div>
            ))}
          </div>

          <div className="fw-chips">
            {p.tech.map((t) => (
              <span className="fw-chip" key={t}>
                {t}
              </span>
            ))}
          </div>

          {(p.live || p.repo || p.reachOut) && (
            <div className="fw-actions">
              {p.live && (
                <a
                  className="fw-link"
                  href={p.live}
                  target="_blank"
                  rel="noreferrer"
                >
                  Live ↗
                </a>
              )}
              {p.repo && (
                <a
                  className="fw-link"
                  href={p.repo}
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub ↗
                </a>
              )}
              {p.reachOut && (
                <a
                  className="fw-cta"
                  href={`mailto:${CONTACT.email}?subject=${encodeURIComponent(
                    `Interested in ${p.name}`
                  )}`}
                >
                  ✉ Get in touch
                </a>
              )}
            </div>
          )}
          {/* "Like the live demo? … happy to share the code" only makes sense for a
              live product whose code isn't public — hide it when there's a repo link */}
          {p.reachOut && p.live && !p.repo && <p className="fw-note">{CONTACT.line}</p>}
        </div>

        {!isMobile && count > 1 && (
          <button
            className="fw-arrow right"
            onClick={() => go(1)}
            aria-label="Next product"
          >
            ›
          </button>
        )}
      </div>

      {count > 1 && (
        <div className="fw-dots" role="tablist" aria-label="Products">
          {FEATURED.map((d, i) => (
            <button
              key={d.id}
              className={"fw-dot" + (i === idx ? " on" : "")}
              onClick={() => setIdx(i)}
              aria-label={d.name}
              aria-selected={i === idx}
            />
          ))}
        </div>
      )}
    </div>
  );
}
