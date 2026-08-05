# CONTINUE_HERE — Hari's Portfolio Project (session handoff)

> Paste the "Resume prompt" (bottom of this file) into a new Cowork session, with the
> `D:\Claude_Portfolio` folder mounted. Then Claude reads this file and continues.

---

## 1. What this project is

An interactive personal portfolio for **Harihara Subramanian Ganesh ("Hari")** — a
data engineer (11 yrs) moving toward **Solution / Data Architect & Team Lead** roles.

**Concept:** the portfolio is presented as a **living system architecture**. Hari is
the CORE node in the centre; his domains (Architecture, Data Engineering, Leadership,
Selected Work, About, Contact) orbit as connected nodes, with animated "data packets"
flowing along the edges like a pipeline. A dynamic accent hue drifts continuously so the
whole scene shifts colour over time. The message ("I design and orchestrate systems, and
lead the teams that build them") is carried by the *view itself*, not by bragging copy.

Design principle: **elegant, legible, senior** — 2.5D canvas graph, NOT heavy WebGL.
Legibility signals seniority more than spectacle.

---

## 2. Tech stack & where things live

- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **Canvas 2D** for the animated edges/packets; **Web Audio API** (synthesized, no files)
  for intro sound; **CSS** for the dynamic background + animations
- Planned later: **Python / FastAPI** backend (AI features + the admin edit/publish CMS)

**Repo:** `D:\Claude_Portfolio` (GitHub: `https://github.com/HVtechno/Claude_Portfolio`)
Nothing has been git-committed yet — all work is uncommitted files on disk.

**File map:**
```
app/
  layout.tsx      # metadata / SEO / OpenGraph / Inter font
  page.tsx        # renders <SystemScene/>
  globals.css     # full design system + all component styles + mobile media query
components/
  SystemScene.tsx           # THE interactive scene (client component): canvas graph, intro,
                            # audio, drawers, parallax, responsive logic. Opens the two
                            # explorers: arch node → ArchitectureExplorer, work node → FeaturedWork.
  ArchitectureExplorer.tsx  # full-screen 2.5D diagram explorer (arch node). Renders dotted
                            # "face" group blocks + nodes + animated packets. Hybrid nav:
                            # labelled tabs (desktop) + swipe/dots (mobile) + arrow keys.
  FeaturedWork.tsx          # full-screen product explorer (work node). Card per product:
                            # problem → flow strip → outcome → metrics → tech → Live/Get-in-touch.
                            # arrow keys + dots + swipe(mobile).
  VirtualHari.tsx           # ***AI VOICE ASSISTANT*** — branded "VeXa" in the UI (Hari's personal
                            # assistant); file/component name stays VirtualHari.tsx. Launcher + panel. Speaks (Web Speech
                            # TTS) + listens (webkitSpeechRecognition), types captions, and
                            # DRIVES the scene via nav callbacks: focus(id) glows a node,
                            # openArch()/openWork() open the explorers. "Walk me through his
                            # portfolio" = auto voice tour across all nodes. Guided/scripted
                            # (no LLM yet) — content in the TOPICS map inside the file.
data/
  nodes.ts          # ***CONTENT SOURCE / "master profile"*** — NODES[], IDENTITY, MOBILE_POS.
  architectures.ts  # ARCHITECTURES[] diagrams for the Architecture Explorer (add one = new tab).
                    # ArchNode has desktop (x,y) + mobile (mx,my) coords; ArchGroup wraps nodes
                    # into dotted "faces". Diagrams: Data Platform, Full-Stack (DMS).
  featured.ts       # FEATURED[] products for Featured Work + CONTACT{email,line}. Each product:
                    # problem, flow[], outcome, metrics[], tech[], live?, repo?, reachOut?.
README.md, CONTINUE_HERE.md, package.json, tsconfig.json, next.config.mjs, .gitignore
```

**Run locally:** `cd D:\Claude_Portfolio` → `npm install` → `npm run dev` → http://localhost:3000

---

## 3. Current UX state (do NOT redo — it's approved)

- **Landing:** an elegant animated "reactor core" (rotating rings, orbiting dot, pulsing
  centre), kicker "// interactive portfolio · 2026", role line, and a "click anywhere to
  begin" pill. All colour-drifts. (User rejected earlier versions: a boot-log list, and a
  bare blinking cursor. Do not go back to those.)
- **Single click** anywhere (or any key) → unlocks audio → **"WELCOME TO H.A.R.I"** types
  out slowly with a synth typing "blip" per character + soft ambient hum → soft chime →
  auto-advances into the system (NO second "Enter" button — user disliked two clicks).
  An optional extra click during the "done" state skips ahead.
  - Browser reality: audio can't play until the first click/keypress. That first click is
    required and cannot be removed. This is why there is exactly ONE click.
  - There is a "sound: on/off" toggle once the greeting starts.
- **System view:** radial node graph (steady — NO cursor parallax/shake; only packets move),
  click a node → detail
  drawer slides in (kicker, title, body, 2 metrics, tag chips). "system notes" toggle
  labels the features. Bottom status "readout" bar shows role/experience.
- **Mobile (≤719px):** graph reflows to a core-at-top **fan** layout (MOBILE_POS), nav
  collapses, status bar compacts to essentials, node rings/fonts shrink, drawer goes
  full-width, parallax disabled, callouts hidden.

---

## 4. Hard requirements / constraints (respect these)

1. **No login anywhere on the public site.** Visitors must never see a login/admin button.
2. **Admin edit-and-publish (future feature):** Hari wants to update all content himself
   by clicking directly on the UI and publishing — WITHOUT editing code. This must live
   behind a **private, hidden route** (e.g. a secret URL) that the public never sees.
   Needs: a small data store (content moves out of `nodes.ts`), private auth for Hari only,
   inline editing, a publish action. NOT built yet — design when we get there.
3. **Truthful content only.** Never invent experience, metrics, or credentials. Draft from
   the resume; where a number/detail is missing, mark it clearly for Hari to confirm.
4. Keep the aesthetic: elegant, senior, legible, 2.5D. Dynamic hue background stays.
5. **NO company names anywhere** (no ING, AB InBev, etc.). The portfolio showcases *who Hari
   is and what he can do/build* — recruiters get employers from the résumé. Keep every screen
   generic/capability-framed ("global enterprises" is fine; specific employer names are not).

---

## 5. Content status & data model

All screen content = fields on each node in `data/nodes.ts`:
`kicker`, `label`, `drawerSub`, `body`, `metrics [{value,label} ×2]`, `chips[]`.
`IDENTITY` holds name/role/email/github + the status-bar items.

**Resume** (source of truth) is uploaded at:
`...\uploads\Harihara_randstad.pdf` (also summarized in §7 below).

Node set (6 satellites + core): **Architecture · Tech Stack · Leadership · Selected Work ·
About · Contact.** (The old "Data Engineering" node became **Tech Stack**, id `stack`.)

Progress:
- [x] **About** — DONE. Punchy, attention-grabbing copy (not resume-style). 6× Azure
      certified. Uses `{{years}}` token (auto-increments).
- [x] **Architecture** — DONE, upgraded to a **3D Architecture Explorer**. Clicking the
      Architecture node opens `components/ArchitectureExplorer.tsx` — a full-screen 3D board
      (CSS-3D: perspective floor, tilt, cursor parallax, animated data-flow packets, click a
      node → info). Diagrams live in `data/architectures.ts` (ARCHITECTURES[], extensible —
      add a diagram = new tab). Currently one diagram: **Data Platform** (Hari's real ELT
      pipeline: Sources[Kafka/SFTP-XFB] → Extract[Python/Pandas] → Load[Azure SQL] →
      Transform[SQL/procs/views] → Power BI, plus Orchestration[UAC/Airflow],
      Monitoring[Flask], CI/CD[Azure Repos/Pipelines], Security[Key Vault]). Compact sizing +
      portrait layout (mx,my coords) for mobile. **NEXT for Architecture:** Hari will provide a
      Full-Stack architecture → add it as a 2nd ArchDiagram (tabs auto-appear when length > 1).
      **The explorer is now steady 2.5D on web AND mobile** — fixed gentle tilt (desktop 6°,
      mobile 8°), NO cursor parallax / shake; only the data packets animate.
      **NEXT for Architecture:** Hari is providing a **Full-Stack architecture (tomorrow)** →
      add it as the 2nd `ArchDiagram` in `data/architectures.ts`; his hint is to add a second
      tab/selector for the full-stack node. Optional future upgrade: true WebGL (R3F) orbit.
- [x] **Craft** — DONE. Replaces Data Engineering. One node, THREE sub-sections via the new
      `sections[]` field: **Data Engineering / Full-Stack Development / AI Engineering**
      (agentic, RAG, embeddings). Caption "data · full-stack · AI". (id renamed data→craft,
      incl. MOBILE_POS.) Name "Craft" is a placeholder-y label — easy one-word swap
      (alternatives: Engineering, The Stack, Capabilities).
- [x] **Architecture — Full-Stack diagram DONE.** `data/architectures.ts` now has a 2nd
      diagram, **"Full-Stack"** (id `dms`, a Document Management System), drawn as three dotted
      **face** groups — Data Engineering / Backend / Frontend — via the new `ArchGroup` model
      (groups wrap member nodes; boxes computed in the component). Explorer got **hybrid nav**:
      labelled tabs on desktop, swipe + dots on mobile, arrow keys on both. Data Platform
      overview reframed to "the exact blueprint I work on in my current role … I adapt to any
      environment" (no company name).
- [x] **Featured Work — DONE (was "Selected Work").** Node `work` renamed to **Featured Work**
      (sub "built out of passion"); clicking it opens `components/FeaturedWork.tsx`. Content in
      `data/featured.ts`: two real passion products — **Resuviq AI** (AI résumé optimizer matched
      to live LinkedIn jobs; FastAPI/OpenAI/MongoDB/React/Stripe; live resuviq-ai.nl) and
      **Foliq** (agentic RAG research library w/ citations, resumable sessions; FastAPI/React/
      Supabase-pgvector/OpenAI/Polar/PWA). Each card = problem → animated-able flow strip →
      outcome → 2 metrics → tech → **Live + "✉ Get in touch"** (mailto, per-product subject).
      `CONTACT{email,line}` global; per-product `reachOut`. GitHub button removed per Hari.
      (repo URLs still in data, unused.)
- [x] **Virtual Hari — AI voice assistant DONE (guided / phase 1).** The robot-presenter idea
      grew into a site-wide **voice buddy** (`components/VirtualHari.tsx`), wired into
      SystemScene, shown after entry as a bottom-left "Ask Virtual Hari" launcher. Opens a panel
      that **speaks** (browser TTS, mute toggle), **listens** (mic → keyword routing, Chrome),
      types captions, and **pilots the real scene**: picking a topic glows the matching node
      (SystemScene `focusId` → `.nodes.guiding` dims others, `.vh-focus` highlights); Architecture
      / Featured Work topics offer "Open the … explorer ↗" (opens the real full-screen views);
      **"Walk me through his portfolio"** runs an auto voice tour across every node. Content is
      the scripted `TOPICS` map in the component (truthful, no company names). DECIDED with Hari:
      real voice + captions; narrate-in-words now (screenshots later); it became the whole-site
      buddy. REFINEMENTS (done): **auto-pops open on entry** so the visitor chooses tour-vs-explore
      (greeting offers "Walk me through" + "I'll explore on my own"); **upgraded headset robot icon**
      (inline SVG in VirtualHari — swap for a custom asset later if wanted); and a **blink + shake
      "nudge" + offer bubble** — when the visitor opens a section themselves, SystemScene fires a
      `ping{id,k}` → VirtualHari shakes its icon and pops "Want me to explain <section>?" (opens
      straight into that topic).
      LATEST behavior (current): assistant is now in the **bottom-RIGHT** corner; the detail
      **drawer was flipped to the LEFT** (`.drawer` left:0) so content (left) + robot (right) sit
      side by side. Clicking a node **no longer opens it** — it only nudges the assistant
      (`nudgeFor` → ping → shake + "Can I talk about <talk>?"). The real view opens **only when
      Virtual Hari narrates it**: nav is `{ open(id), close() }` → `openSection(id)` opens the
      drawer (about/stack/lead/contact) or the arch/work explorer, so voice + visual stay in sync
      (incl. the walk-through, which opens each node as it speaks). focusId highlight/dim removed;
      each TOPIC has a `talk` phrase.
      PHASE 2 — **LLM brain DONE (guided → real conversation).** Added `app/api/chat/route.ts`
      (Next API route, `runtime=nodejs`) that calls OpenAI via fetch (model `gpt-4o-mini`, override
      `OPENAI_CHAT_MODEL`) with a grounded system prompt built by `data/profile.ts`
      (`masterProfile()` assembles nodes + featured + architectures into one truthful block).
      Rules baked in: only profile facts, no invented experience, NO employer names, 2-4 spoken
      sentences, and an optional `[[open:<section>]]` directive the client parses to drive the UI.
      `VirtualHari` now has a **text input + LLM `ask()`**; the **mic feeds real questions** (not
      keyword routing); topic chips call `pickTopic` = open section + `ask(prompt)`; thinking dots +
      last-user bubble added. **Scripted `say` lines kept as offline fallback** (used if the API
      errors / no key), so the site still works keyless. REQUIRES: `OPENAI_API_KEY` in
      `D:\Claude_Portfolio\.env.local` (git-ignored). Also enforced: STAY-IN-SCOPE (declines
      off-topic questions in character), professional/persuasive tone, and an ADAPTABILITY message
      (Hari isn't boxed into the listed stack). HIRE FLOW DONE: a "🤝 Hire / work with Hari" button
      → warm recruiter greeting + asks for role/JD (`hireMode`, input placeholder changes) → next
      message posts to `/api/chat` with `mode:"hire"`; the route adds `HIRE_INSTRUCTION` (tailored,
      honest pitch of Hari for THAT role, up to ~6 sentences, ends with email CTA) + higher
      max_tokens. RESUME TAILORING DONE (Resuviq-style): `data/resume.ts` holds Hari's FULL master
      CV (from Harihara_randstad.pdf) and is used ONLY in the hire branch (server-side) — normal chat
      stays on `masterProfile()` (no employer names). In hire mode the route feeds the full CV +
      a resume-tailoring instruction (extract JD keywords → gap analysis → tailored ATS-friendly
      resume; employer names ALLOWED in the resume, overriding the general rule); max_tokens 1100.
      The client renders the hire reply as a scrollable **Tailored resume** block with a **⬇ Download**
      (.txt) button (`resumeText` state) and only speaks a short lead-in (doesn't read the whole
      resume aloud). NOTE: `data/resume.ts` is committed (public repo) — Hari can move it to an env
      var if he wants it private.
      REAL RESUVIQ ENGINE WIRED: `app/api/tailor/route.ts` calls Hari's mounted Resuviq backend
      (D:\ai_cv_optimizer_job_search\Backend) server-to-server: `POST /auth/login` → bearer;
      `POST /resume-custom-job/{resume_id}` (JD) → returns `id`; `POST /resume-optimize/{resume_id}`
      (job_id) → 4-pass rewrite + `html_resume` + ATS before/after + interview prob + matched/missing
      keywords; `POST /export-pdf-from-html` → real PDF. Returns { pdfBase64, summary }. VirtualHari
      hire submit now calls `tailor()` → shows a "Tailored resume · Resuviq" block with ATS before→after,
      interview probability, matched-keyword chips, and a **⬇ PDF** download (real Resuviq PDF). Falls
      back to the LLM text tailoring if Resuviq isn't configured/reachable. CONFIG (in .env.local):
      RESUVIQ_API_URL, RESUVIQ_EMAIL, RESUVIQ_PASSWORD (verified account, ideally Enterprise/unlimited
      so custom-job + optimize quotas don't block), RESUVIQ_RESUME_ID (Hari's resume uploaded to that
      account; get via login → GET /resumes). Backend must be running/reachable. STILL OPTIONAL:
      streaming + neural TTS.
      MOBILE FIX: assistant does NOT auto-open on phones (starts as launcher) and MOBILE_POS fan was
      raised (top ~61%) so middle-row nodes (lead/work) are tappable. Assistant z-index raised to 65
      so it stays visible above the full-screen explorers.
      Reference previews in outputs/:
      `virtual-hari-takeover.html` (full voice-drives-the-site tour), `virtual-hari-preview.html`
      (chat-style buddy), `featured-work-presenter.html`, `featured-work-enhanced.html`.
- [x] **Removed "system notes"** toggle + callouts from SystemScene (Hari didn't want it).
- [x] **Resuviq copy de-accented** — "résumé" → "resume" everywhere in `data/featured.ts`
      (the accents looked like Dutch letters).
- [x] **Contact — DONE.** Rewritten as an inviting "reach me directly" drawer with a new
      `channels[]` field on SystemNode (clickable rows rendered in the drawer + fed to the LLM via
      profile.ts). Channels: Email (mailto), Netherlands +31 6 39262121 (WhatsApp wa.me/31639262121,
      "fastest way in"), India +91 98703 44958 (note: not active, ping the WhatsApp number), GitHub
      github.com/HVtechno, LinkedIn. Also **removed the decorative top-right HUD nav** (SYSTEM/WORK/
      LEADERSHIP/CONTACT) — it was non-functional clutter.
- [x] **Leadership — DONE.** Rewrote the `lead` node: a confident 4-paragraph body (lead line
      "Leadership, for me, is shipping through people — not around them"), covering leading/growing
      teams, mentoring juniors, sitting with product owners on the end-to-end product, writing
      business requirement documents, translating to architecture/roadmap, and Agile delivery.
      New chips (Team Leadership, Mentoring, Product Owners, Business Requirements, Architecture,
      Agile/Scrum, Code Reviews, Roadmapping) + metrics. Truthful (led 2 juniors + small teams,
      Agile, documentation per résumé).
- [x] **Core node photo — DONE.** Hari's professional photo added at `public/hari.jpg`, rendered
      as a circular portrait in the CORE node (`.corephoto`, accent ring + glow, hover intensifies).
      ALL SIX content screens are now done.

Also done: drawer eyebrow now shows the node's own `sub` (NOT "Component 01/02…").
Header title highlights the arc: `.role-seg` (bright) + glowing `.role-arrow`.

Data model note: a node can have `sections?: {title, body, chips}[]` for multi-section
drawers (Craft uses it); the drawer renders body → sections → metrics → chips, all optional.

Order agreed: one screen at a time.

**Dynamic years:** `CAREER_START_YEAR = 2015` in `nodes.ts`; the component computes
`years = currentYear - 2015` and replaces every `{{years}}` token in copy/metrics/status,
so experience auto-increments each year (11 in 2026, 12 in 2027…). Use `{{years}}` in new copy.

**Drawer redesign (DONE):** the component detail panel is now a frosted-glass panel that
shares the drifting hue background, uses the **Space Grotesk** display font for headings,
a bold "lead" first paragraph, hue-tinted metrics/chips, and a **hidden scrollbar**
(swipe/scroll on mobile). Body supports multiple paragraphs via `\n\n`. Tuned for web + mobile.

---

## 6. RESOLVED decisions (were open, now locked)

1. Experience: **"{{years}}"** (dynamic, currently 11) — auto-increments yearly.
2. **Keep ING & AB InBev named** in copy.
3. Header title = **"DATA ENGINEER → SOFTWARE ENGINEER → ARCHITECT"** (Hari's chosen order).
4. **6× Microsoft Azure certifications** (featured in About; Architect Expert also cited in
   Architecture): Solutions Architect **Expert**, Administrator Associate, Security Engineer
   Associate, Data Engineer Associate, Developer Associate, Data Fundamentals.

---

## 7. Hari — key facts from resume (for content)

- **Name:** Harihara Subramanian Ganesh (goes by Hari)
- **Contact:** hganesh0786@gmail.com · +31 6 39262121 · Alphen aan den Rijn, Netherlands
- **LinkedIn:** linkedin.com/in/hariharasubramanian-ganesh-57ba71166
- **GitHub:** github.com/hvtechno
- **Summary:** 10+ yrs software dev, DevOps, DataOps, BI, automation. Targeting Solution
  Architect / Data Architect / Data Team Lead.
- **Experience:**
  - Senior Data Engineer — **ING** Netherlands (Oct 2025–present): Python ETL (XFBs, SFTP,
    Kafka, SQL); Azure ETL deploy/maintain in Security & DevOps; SharePoint automation;
    monitoring dashboards (Python, React.js, Power BI).
  - Senior Python Data Engineer — **Ebicus B.V** (Jan–Sep 2025): Azure end-to-end data;
    reusable Python ETL (+30% speed, −50% manual); Azure Functions (−25% cost, +40%
    throughput); web ETL monitoring tool (40% faster reports).
  - Senior Azure Data Engineer — **Dynamic People B.V** (Jul 2024–): Synapse, Databricks,
    PySpark, 10+ sources, Power BI refresh +30%; **led 2 junior engineers**; CI/CD in Azure
    DevOps; financial reporting −60% manual effort, +40% efficiency.
  - Senior Azure Data Engineer — **AB InBev** (Jul 2022–Dec 2023): full-stack React/Node/
    Flask/SQL; PWAs & REST APIs; Azure DevOps CI/CD; Python ETL (Functions, Databricks,
    Azure SQL).
  - Senior BI Developer — **AB InBev** (Aug 2019–Jul 2022): ETL (Python, VBScript, SAP GUI,
    Oracle, SharePoint, Databricks, Azure SQL); predictive models; Power BI.
  - Process Specialist — **Infosys BPO** (May 2017–Jun 2019): trade message resolution
    (CSV/FPML), +30% integrity/efficiency.
  - Software Engineer — **ATOS** (Sep 2015–Jan 2017): automation (Excel macros, MS Access),
    web app (Python/JS), led small team (+33% efficiency).
- **Skills:** Python, PySpark, SQL, C#, JavaScript, VBScript, ETL, Data Warehousing/Modeling,
  Pipelines, Real-time processing, APIs, Docker, CI/CD. Azure Synapse, Data Lake, Databricks,
  Microsoft Fabric, Functions, DevOps, Data Factory, App Services; GCP, AWS; Power BI,
  Streamlit; Azure SQL, PostgreSQL, MongoDB, Oracle. Agile, Team Leadership, Mentoring.
- **Education:** MSc — VSB Technical University (2017–2020); B.Tech — Crescent Eng. College
  (2011–2015).
- **Certifications (4× Azure):** Security Engineer Associate (2024), Data Engineer Associate
  DP-203 (2023), Developer Associate (2023), Data Fundamentals (2022).

---

## 8. Roadmap (remaining, roughly in order)

1. Finish content for every screen (§5).
2. **Verify build:** run `tsc --noEmit` + `next build`; fix anything; then **git commit** the
   scaffold + content. (NOTE: during the build session the sandbox VM was DOWN, so the latest
   edits were reviewed by eye but NOT yet compiled. Verify before committing.)
3. Per-project **case-study views** with small architecture diagrams (big architect signal).
4. **Admin edit-and-publish** CMS (see §4.2) — hidden route, private auth, inline edit, publish.
5. **AI features** (all read one "master profile"): JD-tailored resume generator, "ask my
   system anything" chat, visitor-mode switch (recruiter/engineer/founder). FastAPI backend.
6. Deploy (Vercel + a Python host); SEO/OG; analytics; accessibility pass.

---

## 9. EXACT next step

**Draft Leadership** — fill the `lead` node in `data/nodes.ts` (currently placeholder metrics
"teams"/"mentor"). Capability-framed, no company names; can draw on: led 2 junior engineers,
mentoring, set technical direction, roadmapping, CI/CD & delivery ownership. Consider giving it
a `sections[]` (like Craft/About) if it needs more than one block. Then also add a Leadership
line to Virtual Hari's `TOPICS.lead` if the copy changes.

After Leadership: **Contact + HUD identity** (real LinkedIn, GitHub hvtechno, email, location,
availability).

Then the big **Phase 2**: give Virtual Hari a real LLM brain (FastAPI or Next API route + OpenAI
key) for free-form Q&A and the "hire → role-tailored resume" generator (mirrors Resuviq).

Still owed on the engineering side: run `tsc --noEmit` + `next build` to verify (the sandbox VM
has been unable to finish `tsc` inside its 45s cap across recent sessions, so the last edits are
reviewed-by-eye, not compiled), then make the first **git commit**. Everything runs locally with
`npm install && npm run dev`.
