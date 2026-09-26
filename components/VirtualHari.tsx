"use client";

import { useEffect, useRef, useState } from "react";

type Nav = {
  open: (id: string) => void;
  close: () => void;
};

type Topic = {
  key: string;
  label: string;
  talk: string;
  prompt: string;
  say: string; // scripted fallback when the LLM is unavailable
};

type Msg = { role: "user" | "assistant"; content: string };

const TOPICS: Record<string, Topic> = {
  about: {
    key: "about",
    label: "About Hari",
    talk: "who Hari is",
    prompt: "Tell me about Hari — who he is and what he does.",
    say: "Meet Hari — a data engineer with eleven years behind him, now stepping into architecture and team leadership. Six times Microsoft Azure certified, and based in the Netherlands.",
  },
  arch: {
    key: "arch",
    label: "Architecture",
    talk: "his architecture",
    prompt: "Walk me through Hari's architecture and how he designs systems.",
    say: "Hari designs complete systems — an event driven data platform on Azure, orchestrated and secured end to end, and he adapts it to whatever stack you already run.",
  },
  stack: {
    key: "stack",
    label: "Tech Stack",
    talk: "his tech stack",
    prompt: "What is Hari's tech stack across data, full-stack and AI?",
    say: "Three layers, one engineer — data pipelines in Python and SQL, full stack products in React and Fast A P I, and A I systems with retrieval, embeddings and agents.",
  },
  lead: {
    key: "lead",
    label: "Leadership",
    talk: "his leadership",
    prompt: "Tell me about Hari's leadership and how he works with teams.",
    say: "He leads by lifting others — mentoring engineers, turning ambiguity into roadmaps, and raising the bar on how a team builds.",
  },
  work: {
    key: "work",
    label: "Featured Work",
    talk: "his featured work",
    prompt: "Tell me about Hari's featured products.",
    say: "He builds for the love of it — Resuviq, an A I resume optimizer on live jobs, and Foliq, a research library that answers across all your papers with citations.",
  },
  contact: {
    key: "contact",
    label: "Get in touch",
    talk: "getting in touch",
    prompt: "How can I get in touch with Hari, and is he open to roles?",
    say: "Hari is open to architect and lead roles, and quick to reply. You can email him directly whenever you like.",
  },
};

const TOUR = ["about", "arch", "stack", "lead", "work", "contact"];

const ROBOT = (
  <svg className="vh-robot" viewBox="0 0 84 84" aria-hidden="true">
    <line x1="42" y1="7" x2="42" y2="17" stroke="var(--accent)" strokeWidth="2" />
    <circle className="vh-antdot" cx="42" cy="5" r="3.5" />
    <rect x="9" y="31" width="8" height="18" rx="4" fill="hsla(230,28%,22%,.95)" stroke="hsla(var(--hue),80%,62%,.45)" strokeWidth="1.2" />
    <rect x="67" y="31" width="8" height="18" rx="4" fill="hsla(230,28%,22%,.95)" stroke="hsla(var(--hue),80%,62%,.45)" strokeWidth="1.2" />
    <rect x="17" y="17" width="50" height="43" rx="15" fill="hsla(230,28%,20%,.96)" stroke="hsla(var(--hue),80%,62%,.55)" strokeWidth="1.6" />
    <rect x="24" y="26" width="36" height="23" rx="10" fill="#05080f" stroke="hsla(var(--hue),70%,60%,.25)" strokeWidth="1" />
    <circle className="vh-eye" cx="35" cy="37" r="4.1" />
    <circle className="vh-eye" cx="49" cy="37" r="4.1" />
    <g className="vh-mouth">
      <rect x="35" y="52" width="3" height="5" rx="1.5" />
      <rect x="40.5" y="52" width="3" height="5" rx="1.5" />
      <rect x="46" y="52" width="3" height="5" rx="1.5" />
    </g>
  </svg>
);

export default function VirtualHari({
  isMobile,
  nav,
  ping,
}: {
  isMobile: boolean;
  nav: Nav;
  ping: { id: string; k: number };
}) {
  const [open, setOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [cap, setCap] = useState("");
  const [thinking, setThinking] = useState(false);
  const [lastUser, setLastUser] = useState("");
  const [micLive, setMicLive] = useState(false);
  const [nudge, setNudge] = useState(false);
  const [pending, setPending] = useState(false);
  const [offer, setOffer] = useState<Topic | null>(null);
  const [input, setInput] = useState("");
  const [hireMode, setHireMode] = useState(false);
  const [resumeText, setResumeText] = useState<string | null>(null);
  const [resumePdf, setResumePdf] = useState<string | null>(null);
  const [resumeSummary, setResumeSummary] = useState<any>(null);
  const [cvCard, setCvCard] = useState(false);

  const tok = useRef(0);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const soundRef = useRef(true);
  soundRef.current = soundOn;
  const touringRef = useRef(false);
  const recRef = useRef<any>(null);
  const msgsRef = useRef<Msg[]>([]);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const pick = () => {
      const v = window.speechSynthesis.getVoices();
      voiceRef.current =
        v.find((x) => /en(-|_)?(GB|US)/i.test(x.lang)) ||
        v.find((x) => /^en/i.test(x.lang)) ||
        v[0] ||
        null;
    };
    pick();
    window.speechSynthesis.onvoiceschanged = pick;
  }, []);

  useEffect(() => {
    return () => {
      try {
        window.speechSynthesis?.cancel();
      } catch {
        /* noop */
      }
    };
  }, []);

  const stopSpeech = () => {
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* noop */
    }
    setSpeaking(false);
  };

  const typeCap = (text: string, myTok: number) => {
    let i = 0;
    const step = () => {
      if (myTok !== tok.current) return;
      if (i <= text.length) {
        setCap(text.slice(0, i));
        i++;
        window.setTimeout(step, 15);
      } else setCap(text);
    };
    step();
  };

  const speak = (text: string, onend?: () => void) => {
    const myTok = ++tok.current;
    setThinking(false);
    typeCap(text, myTok);
    if (!soundRef.current || !("speechSynthesis" in window)) {
      window.setTimeout(() => {
        if (myTok === tok.current && onend) onend();
      }, Math.min(6000, text.length * 34));
      return;
    }
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* noop */
    }
    // captions keep the "VeXa" styling; speech says it as a word, not letters
    const u = new SpeechSynthesisUtterance(text.replace(/vexa/gi, "Vexa"));
    if (voiceRef.current) u.voice = voiceRef.current;
    u.rate = 1;
    u.onstart = () => setSpeaking(true);
    u.onend = () => {
      setSpeaking(false);
      if (myTok === tok.current && onend) onend();
    };
    // small delay lets cancel() flush first (Chrome cancel/speak race),
    // and if a newer action superseded this one, we skip speaking it
    window.setTimeout(() => {
      if (myTok !== tok.current) return;
      try {
        window.speechSynthesis.speak(u);
      } catch {
        /* noop */
      }
    }, 60);
  };

  // --- the real brain: ask the LLM, fall back to the scripted line ---
  const ask = async (
    text: string,
    opts: { fallback?: Topic; hire?: boolean } = {}
  ) => {
    const q = text.trim();
    if (!q) return;
    const { fallback, hire } = opts;
    // "can I see his CV / resume?" -> hand over the /cv page directly
    if (!hire && /\b(cv|resume|résumé|curriculum)\b/i.test(q)) {
      showCv(q);
      return;
    }
    const myTok = ++tok.current;
    stopSpeech(); // cut any current narration instantly
    setOffer(null);
    setResumeText(null);
    setResumePdf(null);
    setResumeSummary(null);
    setCvCard(false);
    touringRef.current = false;
    setLastUser(q);
    setInput("");
    setCap("");
    setThinking(true);
    const history = [...msgsRef.current, { role: "user" as const, content: q }].slice(-10);
    msgsRef.current = history;
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, mode: hire ? "hire" : undefined }),
      });
      const data = await res.json();
      if (!res.ok || !data.reply) throw new Error(data.error || "fail");
      if (myTok !== tok.current) return; // superseded
      // direct questions/picks just answer — no live node opening (that's the
      // tour's job). Strip any stray directive tag the model might add.
      const reply = String(data.reply)
        .replace(/\[\[\s*open\s*:\s*[a-zA-Z]+\s*\]\]/gi, "")
        .trim();
      msgsRef.current = [...history, { role: "assistant" as const, content: reply }].slice(-10);
      setThinking(false);
      if (hire) {
        setResumeText(reply);
        speak(
          "Here's Hari, tailored to that role — take a look below. You can download it, and email him to get the formatted file and start the interview."
        );
      } else {
        speak(reply);
      }
    } catch {
      if (myTok !== tok.current) return;
      setThinking(false);
      if (fallback) speak(fallback.say);
      else if (hire)
        speak(
          "I'd love to help make that happen. Please email Hari directly at hganesh0786@gmail.com with the role and job description, and he'll send a tailored resume right over."
        );
      else
        speak(
          "Sorry — I can't reach my AI brain right now. You can reach Hari directly at hganesh0786@gmail.com."
        );
    }
  };

  // show the full-CV card (the public /cv page)
  const showCv = (q?: string) => {
    touringRef.current = false;
    setHireMode(false);
    setOffer(null);
    setResumeText(null);
    setResumePdf(null);
    setResumeSummary(null);
    setLastUser(q || "Can I see his full CV?");
    setInput("");
    setCvCard(true);
    speak(
      "Of course — here's Hari's complete CV on one clean page. You can print it, save it as a PDF, or send the link straight to your hiring manager."
    );
  };

  const downloadResume = () => {
    if (!resumeText) return;
    const blob = new Blob([resumeText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Hari-tailored-resume.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadResumePdf = () => {
    if (!resumePdf) return;
    const bytes = atob(resumePdf);
    const arr = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    const blob = new Blob([arr], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Hari-tailored-resume.pdf";
    a.click();
    URL.revokeObjectURL(url);
  };

  // run the REAL Resuviq engine on the recruiter's JD; fall back to the LLM
  // tailoring if Resuviq isn't configured/reachable yet.
  const tailor = async (jd: string) => {
    const q = jd.trim();
    if (!q) return;
    const myTok = ++tok.current;
    stopSpeech();
    setOffer(null);
    setResumeText(null);
    setResumePdf(null);
    setResumeSummary(null);
    setCvCard(false);
    touringRef.current = false;
    setLastUser(q);
    setInput("");
    setCap("");
    setThinking(true);
    try {
      const r = await fetch("/api/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jd: q }),
      });
      const d = await r.json();
      if (!r.ok || !d.pdfBase64) throw new Error(d.error || "fail");
      if (myTok !== tok.current) return;
      setThinking(false);
      setResumePdf(d.pdfBase64);
      setResumeSummary(d.summary || null);
      speak(
        "Done — I've tailored Hari's resume to your role. Go ahead and download it just below. Honestly, he already brings the essential tech and experience this role needs, and even where a keyword or two doesn't line up, he adapts fast and would be a genuinely valuable addition to your team. Email him whenever you'd like to take it further."
      );
    } catch {
      if (myTok !== tok.current) return;
      ask(q, { hire: true }); // graceful fallback to the LLM tailoring
    }
  };

  // recruiter flow — warm ask, then the next message is tailored to the JD
  const startHire = () => {
    touringRef.current = false;
    setOffer(null);
    setResumeText(null);
    setResumePdf(null);
    setResumeSummary(null);
    setCvCard(false);
    setHireMode(true);
    setLastUser("");
    speak(
      "So glad to hear you're thinking of hiring Hari — he'd be a real asset to your team. Which role are you hiring for? Paste the job description and details here, and I'll tailor his profile to exactly what you need, so he's your top pick for the interview."
    );
  };

  const openPanel = () => {
    setPending(false);
    setOpen(true);
    if ("speechSynthesis" in window) window.speechSynthesis.resume();
    setLastUser("");
    if (offer) speak(`Looks like you opened ${offer.talk}. Want me to tell you about it?`);
    else
      speak(
        "You're inside Hari's system now — every node around you is a piece of who he is and what he builds. I'm VeXa, and I keep it running. Point me anywhere: tap a node, or just tell me what you're curious about and I'll route you straight to it."
      );
  };

  const closePanel = () => {
    touringRef.current = false;
    tok.current++;
    stopSpeech();
    setOffer(null);
    setPending(false);
    setThinking(false);
    setHireMode(false);
    setResumeText(null);
    setResumePdf(null);
    setResumeSummary(null);
    setCvCard(false);
    setOpen(false);
  };

  // a direct topic pick just speaks about it — no live node opening
  const pickTopic = (t: Topic) => {
    setHireMode(false);
    ask(t.prompt, { fallback: t });
  };

  const startTour = () => {
    touringRef.current = true;
    setHireMode(false);
    setOffer(null);
    setResumeText(null);
    setResumePdf(null);
    setResumeSummary(null);
    setCvCard(false);
    let i = 0;
    const nextStep = () => {
      if (!touringRef.current) return;
      if (i >= TOUR.length) {
        nav.close();
        speak("That's Hari in a nutshell. Ask me anything, or tap a topic to go deeper.");
        touringRef.current = false;
        return;
      }
      const t = TOPICS[TOUR[i]];
      i++;
      nav.open(t.key);
      speak(t.say, () => window.setTimeout(nextStep, 900));
    };
    speak("Great — sit back. I'll take you through Hari's world.", () =>
      window.setTimeout(nextStep, 500)
    );
  };

  const toggleSound = () => {
    const on = !soundOn;
    setSoundOn(on);
    if (!on) stopSpeech();
  };

  const startMic = () => {
    const SR: any =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    if (!recRef.current) {
      const rec = new SR();
      rec.lang = "en-US";
      rec.interimResults = false;
      rec.onresult = (e: any) => ask(e.results[0][0].transcript);
      rec.onend = () => setMicLive(false);
      recRef.current = rec;
    }
    // stop VeXa talking (and any tour) so it listens to you cleanly
    touringRef.current = false;
    tok.current++;
    stopSpeech();
    try {
      recRef.current.start();
      setMicLive(true);
    } catch {
      /* already started */
    }
  };

  // VeXa starts idle (as the launcher) on every device — it only opens and
  // starts narrating when the visitor clicks it.

  // when the visitor opens a section themselves: blink red (until opened) + offer
  useEffect(() => {
    if (!ping || ping.k === 0) return;
    const t = TOPICS[ping.id];
    if (!t) return;
    setNudge(true);
    setOffer(t);
    if (!open) setPending(true);
    const id = window.setTimeout(() => setNudge(false), 1500);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ping?.k]);

  // keep the newest content in view as it types / renders
  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [cap, resumeText, resumePdf, thinking, lastUser, cvCard]);

  const hasSR =
    typeof window !== "undefined" &&
    ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  if (!open) {
    return (
      <button
        className={
          "vh-launch" + (nudge ? " nudge" : "") + (pending ? " pending" : "")
        }
        onClick={openPanel}
        aria-label="Talk to VeXa"
      >
        <span className="vh-launch-ico">{ROBOT}</span>
        <span className="vh-launch-txt">Ask&nbsp;VeXa</span>
      </button>
    );
  }

  return (
    <div className={"vh-panel" + (isMobile ? " mobile" : "")}>
      <div className="vh-head">
        <span className={"vh-ava" + (speaking ? " speaking" : "") + (nudge ? " nudge" : "")}>
          {ROBOT}
        </span>
        <div className="vh-id">
          <div className="vh-name">VeXa</div>
          <div className="vh-st">
            {thinking
              ? "thinking…"
              : speaking
              ? "speaking…"
              : "Hari's assistant · online"}
          </div>
        </div>
        <button className="vh-x" onClick={closePanel} aria-label="Close">
          ✕
        </button>
      </div>

      <div className="vh-body" ref={bodyRef}>
      {lastUser && <div className="vh-you">{lastUser}</div>}

      <div className="vh-cap">
        {thinking ? (
          <span className="vh-dots">
            <i />
            <i />
            <i />
          </span>
        ) : (
          <>
            {cap}
            {speaking && <span className="vh-caret" />}
          </>
        )}
      </div>

      {cvCard && (
        <div className="vh-cvcard">
          <span className="vh-cvcard-pg" />
          <div>
            <div className="vh-cvcard-t">Hari — full CV</div>
            <div className="vh-cvcard-s">printable · shareable link</div>
          </div>
          <a href="/cv" target="_blank" rel="noreferrer">
            Open ↗
          </a>
        </div>
      )}

      {resumeText && (
        <div className="vh-resume">
          <div className="vh-resume-head">
            <span>Tailored resume</span>
            <button className="vh-resume-dl" onClick={downloadResume}>
              ⬇ Download
            </button>
          </div>
          <pre>{resumeText}</pre>
        </div>
      )}

      {offer && (
        <div className="vh-inlineoffer">
          <span>
            Can I tell you about <b>{offer.talk}</b>?
          </span>
          <div>
            <button
              className="vh-offer-yes"
              onClick={() => {
                const t = offer;
                setOffer(null);
                if (t) pickTopic(t);
              }}
            >
              Yes, tell me ↗
            </button>
            <button className="vh-offer-x" onClick={() => setOffer(null)}>
              Not now
            </button>
          </div>
        </div>
      )}
      </div>

      {resumePdf && (
        <div className="vh-resume vh-resume-pinned">
          <div className="vh-resume-head">
            <span>Hari's tailored resume</span>
          </div>
          <button className="vh-resume-dlbig" onClick={downloadResumePdf}>
            ⬇ Download resume (PDF)
          </button>
        </div>
      )}

      <div className="vh-opts">
        <button className="vh-opt primary" onClick={startTour}>
          ▶ Walk me through his portfolio
        </button>
        {Object.values(TOPICS).map((tp) => (
          <button key={tp.key} className="vh-opt" onClick={() => pickTopic(tp)}>
            {tp.label}
          </button>
        ))}
        <button className="vh-opt" onClick={() => showCv()}>
          📄 Full CV
        </button>
        <button className="vh-opt hire" onClick={startHire}>
          🤝 Hire / work with Hari
        </button>
      </div>

      <form
        className="vh-inputrow"
        onSubmit={(e) => {
          e.preventDefault();
          if (hireMode) tailor(input);
          else ask(input);
        }}
      >
        <input
          className="vh-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            hireMode
              ? "Paste the role and job description…"
              : "Ask me anything about Hari…"
          }
          aria-label="Ask VeXa"
        />
        <button className="vh-send" type="submit" aria-label="Send">
          ➤
        </button>
      </form>

      <div className="vh-ctrls">
        {hasSR && (
          <button
            className={"vh-mic" + (micLive ? " live" : "")}
            onClick={startMic}
            aria-label="Talk"
          >
            🎤 {micLive ? "listening…" : "talk"}
          </button>
        )}
        <button className="vh-mute" onClick={toggleSound} aria-label="Toggle voice">
          {soundOn ? "🔊 voice on" : "🔇 muted"}
        </button>
        <button className="vh-mute" onClick={closePanel}>
          explore on my own
        </button>
      </div>
    </div>
  );
}
