// -----------------------------------------------------------------------------
// featured.ts — passion-built products shown in the Featured Work explorer.
// Add a FeaturedProduct to FEATURED and it appears automatically (arrows + dots).
// Each product is told as: problem → workflow → outcome, with tech + links.
// -----------------------------------------------------------------------------

export interface FeaturedMetric {
  value: string;
  label: string;
}

export interface FeaturedProduct {
  id: string;
  name: string;
  tagline: string;
  badge?: string;
  problem: string;
  /** left-to-right workflow steps, rendered as a connected flow strip */
  flow: string[];
  outcome: string;
  metrics: FeaturedMetric[];
  tech: string[];
  live?: string; // public URL, if deployed
  repo?: string; // source
  /** show the "like the demo? get in touch" invite on this product */
  reachOut?: boolean;
}

// Global contact invite, shown on every product with reachOut.
// A friendly, direct email CTA — like the demo, email me, get the code.
export const CONTACT = {
  email: "hganesh0786@gmail.com",
  line: "Like the live demo? Drop me a line — I'm happy to share the code directly and take the conversation further.",
};

export const FEATURED: FeaturedProduct[] = [
  {
    id: "resuviq",
    name: "Resuviq AI",
    tagline: "AI resume optimizer matched to live LinkedIn jobs",
    badge: "full-stack SaaS",
    problem:
      "Job seekers burn hours tailoring a resume to every posting — and still can't tell whether it will clear an ATS or whether they even stand a chance. I wanted a system that surfaces the live jobs that actually fit your profile, gives a recruiter-ready read on your real interview odds, and rewrites the resume to pass.",
    flow: ["Upload resume", "Match live jobs", "ATS + interview %", "Rewrite", "Export"],
    outcome:
      "Upload a resume and Resuviq matches it against live LinkedIn jobs — returning exactly the roles your profile fits and would clear an ATS for, each with an explainable score and a recruiter-ready read on your interview probability for that specific position. Prefer a role of your own? Paste any job description and get a tailored, optimized resume back. Under the hood: a 4-pass, gap-aware GPT-4o rewrite that re-scores to show the before/after lift, plus cover and motivation letters and PDF / LaTeX export — all wrapped in a freemium SaaS with Stripe billing and verified accounts.",
    metrics: [
      { value: "live", label: "LinkedIn jobs + ATS" },
      { value: "interview %", label: "recruiter-ready read" },
    ],
    tech: [
      "FastAPI",
      "OpenAI GPT-4o",
      "Embeddings",
      "MongoDB Atlas",
      "React + Vite",
      "Stripe",
      "WeasyPrint",
      "JWT Auth",
    ],
    live: "https://resuviq-ai.nl",
    reachOut: true,
  },
  {
    id: "foliq",
    name: "Foliq",
    tagline: "A research library that thinks — agentic RAG with citations",
    badge: "agentic RAG",
    problem:
      "Researchers live in dozens of papers at once, but a general chatbot forgets them between chats and reasons over one at a time. I wanted to upload my PDFs, ask a question, get the exact grounded content back — each point cited to its page — and pick the conversation up later right where I left off.",
    flow: ["Upload docs", "Chunk + embed", "Route", "Retrieve", "Synthesize + cite"],
    outcome:
      "Built for researchers first, but open to anyone — students, professionals, the plain curious — who wants the exact answer buried in their own PDFs. Upload documents and Foliq runs an agentic RAG pipeline over Supabase (Postgres + pgvector): a router decides whether a message needs your documents, a planner expands the query, retrieval spans the whole library, and the answerer replies grounded only in retrieved chunks, every claim cited to its source page. It behaves like a normal AI chatbot — persistent sessions you can leave and continue anytime — with profession-aware actions, multilingual answers, billing, admin analytics and an installable PWA.",
    metrics: [
      { value: "cross-paper", label: "cited synthesis" },
      { value: "resumable", label: "persistent sessions" },
    ],
    tech: [
      "FastAPI",
      "React + Tailwind",
      "Supabase · pgvector",
      "OpenAI",
      "Agentic RAG",
      "Polar",
      "PWA",
    ],
    repo: "https://github.com/HVtechno/MLDocuChat",
    reachOut: true,
  },
  {
    id: "mantra-sangraha",
    name: "Mantra Sangraha",
    tagline: "An ad-free, offline book of Hindu mantras — built on demand from public-domain sources",
    badge: "full-stack PWA",
    problem:
      "Finding a clean, correctly spelled mantra usually means ad-heavy websites, apps that bundle copyrighted translations, or text in the wrong script — and the elders in my family found typing and searching hard. I wanted a personal book that builds itself on demand, reads offline, respects copyright, and is easy for anyone to use.",
    flow: ["Search / speak", "Resolve aliases", "Fetch sources", "Parse verses", "Read offline"],
    outcome:
      "Search a mantra by name, by deity or by voice, and a server-side pipeline resolves spellings and aliases, pulls the clean text through a chain of source adapters (Vaidika Vignanam → sanskritdocuments → Wikisource → web search), parses it into numbered verses in any of 9 Indic scripts, and caches the result. Each reader's book lives on their own device and reads offline in a 3D flip-book with a table of contents, sourced meanings, and recitation audio whose lines light up as they're chanted — aligned entirely in the browser. The UI speaks 7 languages, installs as a PWA and ships as an Android app (TWA), with an unlinked admin dashboard for feedback and a pre-built audio index that took live search out of the request path.",
    metrics: [
      { value: "85", label: "mantras in the catalog" },
      { value: "9 scripts", label: "7 UI languages" },
    ],
    tech: [
      "Next.js 14",
      "React",
      "Node.js API routes",
      "Source adapters + parsing",
      "Web Audio API",
      "PWA · Service Worker",
      "Android TWA",
      "Upstash Redis",
    ],
    repo: "https://github.com/HVtechno/mantra_sangraha",
    reachOut: true,
  },
];
