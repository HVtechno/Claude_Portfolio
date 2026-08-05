"use client";

import React, { useEffect, useRef, useState } from "react";
import { ARCHITECTURES, ARCH_INTRO, ArchNode } from "@/data/architectures";

export default function ArchitectureExplorer({
  isMobile,
  onClose,
}: {
  isMobile: boolean;
  onClose: () => void;
}) {
  const [tab, setTab] = useState(0);
  const [selected, setSelected] = useState<ArchNode | null>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  const sceneRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);

  const diagram = ARCHITECTURES[tab];
  const count = ARCHITECTURES.length;
  const touchX = useRef<number | null>(null);
  const pos = (n: ArchNode) =>
    isMobile ? { x: n.mx, y: n.my } : { x: n.x, y: n.y };

  // hybrid nav — swipe on touch, arrow keys on desktop, dots below
  const onTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    touchX.current = e.changedTouches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!isMobile || touchX.current == null || count < 2) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 50)
      setTab((t) => (t + (dx < 0 ? 1 : count - 1)) % count);
  };

  // measure the scene so we can lay out edges in pixels
  useEffect(() => {
    const el = sceneRef.current;
    if (!el) return;
    const update = () => setDims({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => setSelected(null), [tab]);

  // left / right arrow keys cycle diagrams
  useEffect(() => {
    if (count < 2) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setTab((t) => (t + 1) % count);
      else if (e.key === "ArrowLeft") setTab((t) => (t - 1 + count) % count);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count]);

  // A steady, static 2.5D tilt on both web and mobile — no cursor shake.
  // Only the data packets move; the board stays still.
  useEffect(() => {
    const world = worldRef.current;
    if (!world) return;
    world.style.transform = `rotateX(${isMobile ? 8 : 6}deg)`;
  }, [isMobile]);

  // edge geometry in pixels
  const byId: Record<string, ArchNode> = {};
  diagram.nodes.forEach((n) => (byId[n.id] = n));
  const edges = diagram.edges.map((e, i) => {
    const a = pos(byId[e[0]]);
    const b = pos(byId[e[1]]);
    const ax = (a.x / 100) * dims.w;
    const ay = (a.y / 100) * dims.h;
    const bx = (b.x / 100) * dims.w;
    const by = (b.y / 100) * dims.h;
    const dx = bx - ax;
    const dy = by - ay;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const pad = isMobile ? 34 : 50;
    return {
      id: `ae${tab}_${i}`,
      d: `M ${ax + ux * 34} ${ay + uy * 34} L ${bx - ux * pad} ${by - uy * pad}`,
      dur: 2 + i * 0.12,
    };
  });

  // group "faces" — dotted boxes computed to wrap their member nodes (in px)
  const nodeHalfW = isMobile ? 50 : 72;
  const nodeHalfH = isMobile ? 18 : 26;
  const padSide = isMobile ? 10 : 16;
  const padTop = isMobile ? 14 : 26;
  const padBot = isMobile ? 8 : 16;
  const groups = (diagram.groups ?? [])
    .map((g) => {
      const pts = g.nodeIds
        .map((id) => byId[id])
        .filter(Boolean)
        .map((n) => pos(n));
      if (!pts.length || !dims.w) return null;
      const xs = pts.map((p) => (p.x / 100) * dims.w);
      const ys = pts.map((p) => (p.y / 100) * dims.h);
      const left = Math.min(...xs) - nodeHalfW - padSide;
      const right = Math.max(...xs) + nodeHalfW + padSide;
      const top = Math.max(14, Math.min(...ys) - nodeHalfH - padTop);
      const bottom = Math.max(...ys) + nodeHalfH + padBot;
      return {
        id: g.id,
        label: g.label,
        left,
        top,
        width: right - left,
        height: bottom - top,
      };
    })
    .filter(Boolean) as {
    id: string;
    label: string;
    left: number;
    top: number;
    width: number;
    height: number;
  }[];

  const marker = `arh${tab}`;

  return (
    <div className="archx">
      <button className="archx-close" onClick={onClose} aria-label="Close">
        ✕
      </button>

      <div className="archx-head">
        <div className="archx-eyebrow">system design</div>
        <h2>Architecture</h2>
        <p className="archx-lead">{ARCH_INTRO.lead}</p>
        <p className="archx-cert">{ARCH_INTRO.cert}</p>
        {ARCHITECTURES.length > 1 && (
          <div className="archx-tabs">
            {ARCHITECTURES.map((d, i) => (
              <button
                key={d.id}
                className={i === tab ? "on" : ""}
                onClick={() => setTab(i)}
              >
                {d.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        className="archx-scene"
        ref={sceneRef}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {!isMobile && <div className="archx-hint">click a node to explore</div>}
        <div className="archx-world" ref={worldRef}>
          <div className="archx-floor" />
          <div className="archx-plane">
            {groups.map((g) => (
              <div
                key={g.id}
                className="archx-group"
                style={{
                  left: g.left,
                  top: g.top,
                  width: g.width,
                  height: g.height,
                }}
              >
                <span className="archx-group-label">{g.label}</span>
              </div>
            ))}
            <svg>
              <defs>
                <marker
                  id={marker}
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path className="arrowhead" d="M0 0 L10 5 L0 10 z" />
                </marker>
              </defs>
              {edges.map((e) => (
                <path
                  key={e.id}
                  id={e.id}
                  className="edge"
                  d={e.d}
                  markerEnd={`url(#${marker})`}
                />
              ))}
              {edges.map((e) => (
                <circle key={`${e.id}c`} className="flow" r={2.8}>
                  <animateMotion dur={`${e.dur}s`} repeatCount="indefinite">
                    <mpath xlinkHref={`#${e.id}`} />
                  </animateMotion>
                </circle>
              ))}
            </svg>
            {diagram.nodes.map((n) => {
              const p = pos(n);
              return (
                <div
                  key={n.id}
                  className={
                    "archx-node" + (selected?.id === n.id ? " sel" : "")
                  }
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                  onClick={() => setSelected(n)}
                >
                  <div className="nlabel">{n.label}</div>
                  <div className="nsub">{n.sub}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {isMobile && count > 1 && (
        <div className="archx-dots" role="tablist" aria-label="Diagrams">
          {ARCHITECTURES.map((d, i) => (
            <button
              key={d.id}
              className={"archx-dot" + (i === tab ? " on" : "")}
              onClick={() => setTab(i)}
              aria-label={d.name}
              aria-selected={i === tab}
            />
          ))}
        </div>
      )}

      <div className="archx-info">
        {selected ? (
          <>
            <h4>{selected.label}</h4>
            <p>{selected.desc}</p>
            <div className="archx-chips">
              {selected.tech.map((t) => (
                <span key={t} className="archx-chip">
                  {t}
                </span>
              ))}
            </div>
          </>
        ) : (
          <>
            <h4>{diagram.name}</h4>
            <p>{diagram.overview}</p>
          </>
        )}
      </div>
    </div>
  );
}
