# Hari — Portfolio as a Living System

An interactive personal portfolio for **Harihara Subramanian Ganesh ("Hari")** — a data
engineer of 11+ years moving toward **Team Lead / Data Architect** roles.

Instead of a page you scroll, the portfolio is a **living system architecture**: Hari is
the CORE node in the centre (with his photo), and his domains orbit as connected nodes —
Architecture, Tech Stack, Leadership, Featured Work, About, Contact — with animated data
packets flowing along the edges and a dynamic accent hue that drifts continuously.

At the heart of it is **VeXa**, an AI voice assistant that represents Hari: it greets
visitors, tours the portfolio, answers questions grounded in Hari's real profile, and —
for recruiters — tailors his resume to a pasted job description using his own
[Resuviq AI](https://github.com/HVtechno/ai_cv_optimizer_job_search) engine.

---

## Highlights

- **2.5D node graph** — a canvas-drawn constellation of connected nodes with flowing
  packets and a drifting accent hue. Steady and legible (no cursor shake).
- **Architecture Explorer** — full-screen 2.5D board with dotted "face" groups
  (Data Engineering / Backend / Frontend), swipeable tabs and animated flow.
- **Featured Work Explorer** — passion-project case studies (Resuviq AI, Foliq) as
  problem → workflow → outcome cards.
- **VeXa, the AI assistant** — speaks aloud (Web Speech), listens (speech recognition),
  types captions, and pilots the scene on a guided tour. Powered by OpenAI, grounded in
  a truthful "master profile" so it never invents experience.
- **Hire flow** — a recruiter pastes a job description and VeXa runs Hari's real Resuviq
  pipeline (custom-job → 4-pass optimize → PDF) to return a genuinely tailored resume PDF.
- **Fully responsive** — the graph reflows to a core-at-top fan on phones; the assistant
  becomes a compact launcher.

---

## Tech stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **Canvas 2D** for the node edges/packets; **CSS** for the design system and animations
- **Web Speech API** for VeXa's voice + microphone
- **OpenAI** (`gpt-4o-mini` by default) via a server-side API route
- **Resuviq AI backend** (separate FastAPI service) for the real tailored-resume engine

---

## Project structure

```
app/
  layout.tsx            # metadata / SEO / fonts
  page.tsx              # renders <SystemScene/>
  globals.css           # full design system + all component styles
  api/
    chat/route.ts       # VeXa's brain — OpenAI chat, grounded system prompt
    tailor/route.ts     # Resuviq integration — tailored-resume PDF for the hire flow
components/
  SystemScene.tsx           # the interactive scene: intro, node graph, drawers, HUD
  ArchitectureExplorer.tsx  # full-screen diagram explorer
  FeaturedWork.tsx          # full-screen product/case-study explorer
  VirtualHari.tsx           # VeXa — the AI voice assistant (launcher + panel)
data/
  nodes.ts              # master profile: NODES[], IDENTITY, contact channels
  architectures.ts      # ARCHITECTURES[] diagrams (Data Platform, Full-Stack)
  featured.ts           # FEATURED[] products + CONTACT
  profile.ts            # assembles the grounded profile string for VeXa (no employers)
  resume.ts             # Hari's full CV — used server-side for hire-flow tailoring only
public/
  hari.jpg              # core-node portrait
```

To change content, edit the files in `data/` — everything the scene and VeXa show reads
from there.

---

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

Build for production:

```bash
npm run build
npm start
```

### Environment variables

Create `.env.local` in the project root (it is git-ignored):

```bash
# VeXa's AI brain (required for real conversation; falls back to scripted lines if unset)
OPENAI_API_KEY=sk-...
# optional model override (default: gpt-4o-mini)
# OPENAI_CHAT_MODEL=gpt-4o-mini

# Resuviq backend — the real tailored-resume engine for the Hire flow.
# If any of these are unset, the Hire flow falls back to LLM text tailoring.
RESUVIQ_API_URL=https://your-resuviq-backend
RESUVIQ_EMAIL=service-account@example.com
RESUVIQ_PASSWORD=...
RESUVIQ_RESUME_ID=the-resume_id-of-Hari's-resume-in-Resuviq
```

Notes:

- `OPENAI_API_KEY` and the Resuviq credentials are used **only server-side** (in the API
  routes) and never reach the browser.
- The Resuviq account should be **verified** and on a plan with enough quota (Enterprise /
  unlimited is ideal) for `custom-job` + `optimize`. Get `RESUVIQ_RESUME_ID` by uploading
  Hari's resume to that Resuviq account once, then `GET /resumes`.

---

## Deployment (Render)

This is a server-rendered Next.js app (it has API routes), so deploy it as a **Node web
service**, not a static site. A `render.yaml` blueprint is included.

1. Push this repo to GitHub.
2. In Render: **New → Blueprint** and point it at the repo (it reads `render.yaml`), **or**
   create a **Web Service** manually with:
   - Build command: `npm install && npm run build`
   - Start command: `npm start`
3. Add the environment variables above in the Render dashboard (they're marked
   `sync: false` in the blueprint so you set them privately).
4. Deploy. The Resuviq backend runs as its own separate service — point `RESUVIQ_API_URL`
   at it.

`next start` binds to the port Render provides via `$PORT` automatically.

---

## Credits

Design, content and engineering: Hari. AI assistant (VeXa) and resume tailoring powered by
OpenAI and Hari's own Resuviq AI engine.
