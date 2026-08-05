"use client";

import { useEffect, useRef, useState } from "react";
import {
  NODES,
  IDENTITY,
  MOBILE_POS,
  CAREER_START_YEAR,
  SystemNode,
} from "@/data/nodes";
import ArchitectureExplorer from "@/components/ArchitectureExplorer";
import FeaturedWork from "@/components/FeaturedWork";
import VirtualHari from "@/components/VirtualHari";

const HEADING = "WELCOME TO HARI'S WORLD";

export default function SystemScene() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<HTMLDivElement>(null);

  const [entered, setEntered] = useState(false);
  const [phase, setPhase] = useState<"idle" | "typing" | "done">("idle");
  const [typed, setTyped] = useState("");
  const [soundOn, setSoundOn] = useState(true);
  const [active, setActive] = useState<SystemNode | null>(null);
  const [archOpen, setArchOpen] = useState(false);
  const [workOpen, setWorkOpen] = useState(false);
  const [ping, setPing] = useState<{ id: string; k: number }>({ id: "", k: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const mobileRef = useRef(false);

  // track viewport for the responsive (portrait) layout
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 719px)");
    const apply = () => {
      setIsMobile(mq.matches);
      mobileRef.current = mq.matches;
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const posOf = (n: SystemNode) => {
    const m = isMobile ? MOBILE_POS[n.id] : null;
    return { x: m ? m.x : n.x, y: m ? m.y : n.y };
  };

  // clicking a node opens the section (explore on your own) AND nudges the
  // assistant — it blinks red + shakes, then offers "Can I talk about …?".
  const onNodeSelect = (n: SystemNode) => {
    openSection(n.id);
    setPing((p) => ({ id: n.id, k: p.k + 1 }));
  };

  // open a section's real view (node click, or the assistant while narrating)
  const openSection = (id: string) => {
    setActive(null);
    setArchOpen(false);
    setWorkOpen(false);
    if (id === "arch") setArchOpen(true);
    else if (id === "work") setWorkOpen(true);
    else setActive(NODES.find((n) => n.id === id) ?? null);
  };
  const closeSections = () => {
    setActive(null);
    setArchOpen(false);
    setWorkOpen(false);
  };

  // live experience count — fills {{years}} tokens so copy auto-increments yearly
  const years = new Date().getFullYear() - CAREER_START_YEAR;
  const fill = (s?: string) => (s ?? "").split("{{years}}").join(String(years));

  // refs so setInterval/audio closures always read the latest value
  const soundOnRef = useRef(true);
  soundOnRef.current = soundOn;
  const acRef = useRef<AudioContext | null>(null);
  const humGainRef = useRef<GainNode | null>(null);
  const startedRef = useRef(false);
  const enteredRef = useRef(false);

  // -------- Web Audio (all synthesized, no files) --------
  const ensureAudio = () => {
    if (acRef.current) return acRef.current;
    try {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      acRef.current = new AC();
    } catch {
      acRef.current = null;
    }
    return acRef.current;
  };

  const blip = (freq: number) => {
    const ac = acRef.current;
    if (!ac || !soundOnRef.current) return;
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = "square";
    o.frequency.value = freq;
    const t = ac.currentTime;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.04, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
    o.connect(g).connect(ac.destination);
    o.start(t);
    o.stop(t + 0.07);
  };

  const chime = () => {
    const ac = acRef.current;
    if (!ac || !soundOnRef.current) return;
    [523.25, 783.99].forEach((f, i) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = "sine";
      o.frequency.value = f;
      const t = ac.currentTime + i * 0.09;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.06, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
      o.connect(g).connect(ac.destination);
      o.start(t);
      o.stop(t + 0.6);
    });
  };

  const startHum = () => {
    const ac = acRef.current;
    if (!ac || humGainRef.current) return;
    const o1 = ac.createOscillator();
    const o2 = ac.createOscillator();
    const lp = ac.createBiquadFilter();
    const g = ac.createGain();
    lp.type = "lowpass";
    lp.frequency.value = 320;
    o1.type = "sine";
    o1.frequency.value = 55;
    o2.type = "sine";
    o2.frequency.value = 82.5;
    g.gain.value = soundOnRef.current ? 0.03 : 0;
    o1.connect(lp);
    o2.connect(lp);
    lp.connect(g).connect(ac.destination);
    o1.start();
    o2.start();
    humGainRef.current = g;
  };

  // -------- typewriter --------
  const typeNext = (i: number) => {
    setTyped(HEADING.slice(0, i));
    const ch = HEADING[i - 1];
    if (ch && ch !== " ") blip(1150 + Math.random() * 550);
    if (i >= HEADING.length) {
      window.setTimeout(() => {
        setPhase("done");
        // auto-advance into the system — no second click required
        window.setTimeout(enterSystem, 2400);
      }, 300);
      return;
    }
    const next = HEADING[i];
    // slow, smooth "AI announcing itself" cadence
    const delay =
      next === " " ? 300 : next === "." ? 190 : 150 + Math.random() * 90;
    window.setTimeout(() => typeNext(i + 1), delay);
  };

  // first interaction: unlock audio + start the typed greeting
  const begin = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    const ac = ensureAudio();
    if (ac && ac.state === "suspended") ac.resume();
    startHum();
    setPhase("typing");
    typeNext(1);
  };

  const toggleSound = () => {
    const on = !soundOn;
    setSoundOn(on);
    const ac = acRef.current;
    if (humGainRef.current && ac) {
      humGainRef.current.gain.setTargetAtTime(on ? 0.03 : 0, ac.currentTime, 0.05);
    }
  };

  const enterSystem = () => {
    if (enteredRef.current) return;
    enteredRef.current = true;
    const ac = acRef.current;
    if (humGainRef.current && ac) {
      humGainRef.current.gain.setTargetAtTime(0, ac.currentTime, 0.4);
    }
    chime();
    setEntered(true);
  };

  // let a key press also begin (matches click-anywhere); clean up audio on unmount
  useEffect(() => {
    const onKey = () => begin();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      try {
        acRef.current?.close();
      } catch {
        /* noop */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------- canvas edges + packets + hue drift + parallax --------
  useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0;
    let H = 0;
    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const center = NODES.find((n) => n.center) ?? NODES[0];
    const sats = NODES.filter((n) => !n.center);
    const P = (n: SystemNode) => {
      const m = mobileRef.current ? MOBILE_POS[n.id] : null;
      return { x: (m ? m.x : n.x) * W, y: (m ? m.y : n.y) * H };
    };

    let hue = 190;
    const hueTimer = window.setInterval(() => {
      hue = (hue + 0.6) % 360;
      root.style.setProperty("--hue", String(hue));
    }, 60);

    const t0 = performance.now();
    let raf = 0;
    const draw = (now: number) => {
      ctx.clearRect(0, 0, W, H);
      const c = P(center);

      ctx.beginPath();
      sats.forEach((s, i) => {
        const p = P(s);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.strokeStyle = `hsla(${hue},60%,65%,.1)`;
      ctx.lineWidth = 1;
      ctx.stroke();

      sats.forEach((s, j) => {
        const p = P(s);
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = `hsla(${hue},75%,65%,.2)`;
        ctx.lineWidth = 1;
        ctx.stroke();

        for (let k = 0; k < 2; k++) {
          const tt = ((now - t0) / 2600 + j * 0.13 + k * 0.5) % 1;
          const xx = c.x + (p.x - c.x) * tt;
          const yy = c.y + (p.y - c.y) * tt;
          const a = Math.sin(tt * Math.PI);
          ctx.beginPath();
          ctx.arc(xx, yy, 2.6, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${hue},95%,72%,${a * 0.95})`;
          ctx.shadowColor = `hsl(${hue},95%,68%)`;
          ctx.shadowBlur = 12;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    // No cursor parallax — the graph stays steady (no shake); only the data
    // packets flow. Same calm behaviour on web and mobile.

    return () => {
      window.removeEventListener("resize", resize);
      window.clearInterval(hueTimer);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={rootRef}>
      <h1 className="sr-only">
        {IDENTITY.name} — data engineer and systems architect. An interactive
        portfolio presented as a living system architecture.
      </h1>

      <div className="ambient" />
      <canvas ref={canvasRef} className="net" />
      <div className="grid" />
      <div className="vignette" />

      {/* HUD */}
      <div className="hud">
        <div className="bar">
          <div className="brand">
            <div className="name">{IDENTITY.name}</div>
            <div className="role">
              {IDENTITY.role.split("→").map((seg, i, arr) => (
                <span key={i}>
                  <span className="role-seg">{seg.trim()}</span>
                  {i < arr.length - 1 && <span className="role-arrow"> → </span>}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* nodes */}
      <div ref={nodesRef} className={entered ? "nodes live" : "nodes"}>
        {NODES.map((n, i) => {
          const p = posOf(n);
          return (
          <div
            key={n.id}
            className={n.center ? "node center" : "node"}
            style={{
              left: `${p.x * 100}%`,
              top: `${p.y * 100}%`,
              transitionDelay: `${i * 90}ms`,
            }}
            onClick={n.center ? undefined : () => onNodeSelect(n)}
          >
            <div className="ring">
              {n.center ? (
                <img className="corephoto" src="/hari.jpg" alt={IDENTITY.name} />
              ) : (
                <span className="core" />
              )}
            </div>
            <div className="lbl">{n.label}</div>
            {n.sub && <div className="sub">{n.sub}</div>}
          </div>
          );
        })}
      </div>

      {/* status readout */}
      <div className="readout">
        <span className="dotpulse" />
        {IDENTITY.status.map(([k, v]) => (
          <span key={k}>
            {k}: <b>{fill(v)}</b>
          </span>
        ))}
      </div>

      {/* cinematic intro */}
      <div
        className={entered ? "enter gone" : "enter"}
        onClick={
          phase === "idle" ? begin : phase === "done" ? enterSystem : undefined
        }
      >
        {phase === "idle" ? (
          <div className="prompt">
            <div className="lead-kicker">// interactive portfolio · 2026</div>
            <div className="reactor">
              <span className="rr r1" />
              <span className="rr r2" />
              <span className="rr r3" />
              <span className="orbit" />
              <span className="rcore" />
            </div>
            <div className="ptag">
              Not a page you scroll — a living system you explore. Watch the
              nodes connect.
            </div>
            <div className="prole">
              Data Engineer → Software Engineer → Data Architect
            </div>
            <div className="cta">click anywhere to begin</div>
          </div>
        ) : (
          <>
            <button
              className="sound-toggle"
              onClick={(e) => {
                e.stopPropagation();
                toggleSound();
              }}
            >
              {soundOn ? "sound: on" : "sound: off"}
            </button>
            <div className="type-wrap">
              <div className="type-k">// system online</div>
              <h1 className="type-h">
                {typed}
                <span className="caret">▌</span>
              </h1>
              <div className={phase === "done" ? "reveal show" : "reveal"}>
                <p className="tg">
                  A portfolio built as a living system — step inside and explore.
                </p>
                <div className="entering">entering the system…</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* detail drawer */}
      <div className={active ? "drawer open" : "drawer"}>
        <button className="dclose" onClick={() => setActive(null)} aria-label="Close">
          ✕
        </button>
        {active && (
          <>
            <div className="dk">{active.sub}</div>
            <h2>{active.label}</h2>
            <div className="dsub">{fill(active.drawerSub)}</div>
            {active.body && (
              <div className="dbody">
                {fill(active.body)
                  .split("\n\n")
                  .map((para, idx) => (
                    <p key={idx} className={idx === 0 ? "lead" : undefined}>
                      {para}
                    </p>
                  ))}
              </div>
            )}
            {active.channels && active.channels.length > 0 && (
              <div className="dchannels">
                {active.channels.map((c) => (
                  <div className="dchannel" key={c.label}>
                    <div className="dchannel-label">{c.label}</div>
                    {c.href ? (
                      <a
                        className="dchannel-value"
                        href={c.href}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {c.value}
                      </a>
                    ) : (
                      <div className="dchannel-value plain">{c.value}</div>
                    )}
                    {c.note && <div className="dchannel-note">{c.note}</div>}
                  </div>
                ))}
              </div>
            )}
            {active.sections?.map((sec) => (
              <div className="dsection" key={sec.title}>
                <h3>{sec.title}</h3>
                <p>{sec.body}</p>
                {sec.chips && (
                  <div className="chips">
                    {sec.chips.map((c) => (
                      <span className="chip" key={c}>
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {active.metrics && active.metrics.length > 0 && (
              <div className="metrics">
                {active.metrics.map((m) => (
                  <div className="metric" key={m.label}>
                    <div className="mv">{fill(m.value)}</div>
                    <div className="ml">{m.label}</div>
                  </div>
                ))}
              </div>
            )}
            {active.chips && active.chips.length > 0 && (
              <div className="chips">
                {active.chips.map((c) => (
                  <span className="chip" key={c}>
                    {c}
                  </span>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* 3D architecture explorer */}
      {archOpen && (
        <ArchitectureExplorer
          isMobile={isMobile}
          onClose={() => setArchOpen(false)}
        />
      )}

      {/* featured work explorer */}
      {workOpen && (
        <FeaturedWork isMobile={isMobile} onClose={() => setWorkOpen(false)} />
      )}

      {/* virtual hari — voice assistant that guides the scene */}
      {entered && (
        <VirtualHari
          isMobile={isMobile}
          ping={ping}
          nav={{
            open: (id) => openSection(id),
            close: () => closeSections(),
          }}
        />
      )}
    </div>
  );
}
