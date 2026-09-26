// -----------------------------------------------------------------------------
// nodes.ts  —  the "master profile" seed for the living-system portfolio.
// Everything the graph and (later) the AI features read comes from here.
// Placeholder metrics are marked; swap in your real numbers.
// -----------------------------------------------------------------------------

export interface Metric {
  value: string;
  label: string;
}

/** A sub-section inside a node's drawer (e.g. the three disciplines under Craft). */
export interface Section {
  title: string;
  body: string;
  chips?: string[];
}

export interface SystemNode {
  id: string;
  label: string;
  /** short caption under the node */
  sub?: string;
  /** fraction of viewport width (0..1) */
  x: number;
  /** fraction of viewport height (0..1) */
  y: number;
  /** the core node = you */
  center?: boolean;
  /** initial shown inside the core ring */
  initial?: string;
  // drawer content ----------------------------------------------------------
  kicker?: string; // e.g. "Component 01"
  drawerSub?: string;
  body?: string;
  metrics?: Metric[];
  chips?: string[];
  /** optional multi-section body (used by the Craft node) */
  sections?: Section[];
  /** contact channels — clickable rows rendered in the Contact node's drawer */
  channels?: { label: string; value: string; href?: string; note?: string }[];
}

// Career began in 2015 (ATOS). Experience is computed live from this so it
// auto-increments every year — "{{years}}" tokens in copy are filled at render.
export const CAREER_START_YEAR = 2015;

export const IDENTITY = {
  name: "HARI",
  role: "DATA ENGINEER → SOFTWARE ENGINEER → DATA ARCHITECT",
  email: "hganesh0786@gmail.com",
  github: "github.com/HVtechno",
  status: [
    ["SYSTEM", "OPERATIONAL"],
    ["ROLE", "TEAM LEAD / DATA ARCHITECT"],
    ["EXPERIENCE", "{{years}} YRS"],
    ["DOMAIN", "DATA · DISTRIBUTED SYSTEMS"],
    ["MODE", "SCALING"],
  ] as [string, string][],
};

export const NODES: SystemNode[] = [
  { id: "core", center: true, initial: "H", label: "CORE", x: 0.5, y: 0.52 },
  {
    id: "arch",
    label: "Architecture",
    sub: "system design",
    x: 0.5,
    y: 0.15,
    drawerSub: "data platforms · full-stack · ci/cd",
    body:
      "I architect complete systems — from the data platform underneath to the full-stack product on top.\n\n" +
      "A Microsoft-certified Azure Solutions Architect Expert, I design with production in mind from day one: cost, reliability, and the engineer who's on call at 3am.",
    sections: [
      {
        title: "Data Platform Architecture",
        body:
          "End-to-end Azure data platforms designed to last — ingestion, transformation and serving across Databricks, Data Factory, Functions and Azure SQL. Event-driven where it earns its keep (Kafka, SFTP, real-time), batch where that's enough, all wired into CI/CD so releases stay boring and reliable.",
        chips: ["Databricks", "Data Factory", "Azure Functions", "Azure SQL", "Kafka", "CI/CD"],
      },
      {
        title: "Full-Stack Architecture",
        body:
          "Complete web products architected and shipped front to back — React, Node.js and Flask, plus conversational chatbots — under enterprise security standards. Two apps I designed and built doubled user engagement and cut integration issues by 95%.",
        chips: ["React", "Node.js", "Flask", "Chatbots", "Azure DevOps", "REST APIs"],
      },
    ],
  },
  {
    id: "stack",
    label: "Tech Stack",
    sub: "data · full-stack · AI",
    x: 0.83,
    y: 0.33,
    drawerSub: "three layers, one engineer",
    body:
      "I don't stop at the data layer — I build the whole thing, from the pipeline, to the pixels, to the model.",
    sections: [
      {
        title: "Data Engineering",
        body:
          "Batch and streaming pipelines and ETL/ELT on Azure — Python and Pandas, SQL, Azure Functions, Data Factory, Databricks and Kafka topics, surfaced through Streamlit and Power BI. The trustworthy foundation everything else stands on.",
        chips: [
          "Python / Pandas",
          "SQL",
          "Azure Functions",
          "Kafka",
          "Databricks",
          "Azure Data Factory",
          "ETL / ELT",
          "Streamlit / Power BI",
        ],
      },
      {
        title: "Full-Stack Development",
        body:
          "End-to-end web apps and internal tools — React, Vite and Next.js on the front, Python (FastAPI / Flask) and Node.js behind, with MongoDB and REST APIs. I ship the product, not just the pipeline.",
        chips: ["Python (FastAPI / Flask)", "React", "Vite", "Next.js", "Node.js", "MongoDB"],
      },
      {
        title: "AI Engineering",
        body:
          "LLM-powered systems that actually ship — built on OpenAI, Claude and Gemini. Agentic workflows and tool-calling (MCP), RAG and vector embeddings over private data, and chatbots hardened against prompt injection. Turning models into products.",
        chips: [
          "OpenAI / Claude / Gemini",
          "LLMs",
          "RAG",
          "Vector Embeddings",
          "Agentic / MCP",
          "Prompt Security",
          "Python",
        ],
      },
    ],
  },
  {
    id: "lead",
    label: "Leadership",
    sub: "teams · delivery",
    x: 0.83,
    y: 0.72,
    kicker: "Component 03",
    drawerSub: "teams · product owners · agile delivery",
    body:
      "Leadership, for me, is shipping through people — not around them.\n\n" +
      "I've led and grown engineering teams and mentored junior developers from their very first pull request to owning features end to end — setting the technical direction, running the reviews, and quietly raising the bar on how the team builds, so the work is fast today and still makes sense a year from now.\n\n" +
      "I'm just as at home on the business side of the table. I sit with product owners to understand the whole product end to end, turn fuzzy ideas into clear business requirement documents, and translate them into an architecture and a roadmap the team can actually execute.\n\n" +
      "And I run it the Agile way — breaking big ambitions into shippable increments, keeping the feedback loop tight, and making sure everyone always knows what we're building, and why.",
    metrics: [
      { value: "teams", label: "led & mentored" },
      { value: "end-to-end", label: "product to delivery" },
    ],
    chips: [
      "Team Leadership",
      "Mentoring",
      "Product Owners",
      "Business Requirements",
      "Architecture",
      "Agile / Scrum",
      "Code Reviews",
      "Roadmapping",
    ],
  },
  {
    id: "work",
    label: "Featured Work",
    sub: "built out of passion",
    x: 0.5,
    y: 0.89,
    kicker: "Component 04",
    drawerSub: "products I built for the love of it",
    body:
      "A curated set of systems I've designed and delivered — each told as problem, architecture, and measurable outcome. The proof behind the components.",
    metrics: [
      { value: "3", label: "products built" },
      { value: "end-to-end", label: "ownership" },
    ],
    chips: ["Case Studies", "Diagrams", "Outcomes"],
  },
  {
    id: "about",
    label: "About",
    sub: "the engineer",
    x: 0.17,
    y: 0.72,
    drawerSub: "{{years}} years · data engineering → architecture · Netherlands",
    body:
      "From a single automation script to the data backbone of global enterprises.\n\n" +
      "Over {{years}} years I've grown from software engineer, to data engineer, to the threshold of architecture — designing the Azure platforms that global enterprises trust to run their reporting and their operations. Streaming pipelines, lakehouses, and the invisible plumbing that simply has to work.\n\n" +
      "Six-times Microsoft Azure certified — up to Solutions Architect Expert. Fluent from Python, Pandas and SQL to React, Next.js and FastAPI, I turn tangled requirements into systems that stay simple as they scale — and make the engineers around me sharper while doing it.\n\n" +
      "Now I'm building toward Solution & Data Architecture, where the hardest and most interesting problems live.",
    sections: [
      {
        title: "Microsoft Azure Certifications",
        body:
          "Six certifications across the Azure stack — capped by the Solutions Architect Expert.",
        chips: [
          "Solutions Architect Expert",
          "Azure Administrator Associate",
          "Security Engineer Associate",
          "Data Engineer Associate",
          "Developer Associate",
          "Data Fundamentals",
        ],
      },
    ],
    metrics: [
      { value: "{{years}}", label: "years in data & software" },
      { value: "6×", label: "Azure certified" },
    ],
    chips: ["MSc", "Netherlands", "Data → Architecture"],
  },
  {
    id: "contact",
    label: "Contact",
    sub: "let's build",
    x: 0.17,
    y: 0.33,
    kicker: "Component 06",
    drawerSub: "reach me directly · quick to reply",
    body:
      "Let's build something that lasts. Whether you're hiring, weighing a collaboration, or just want to talk architecture — I'm quick to reply and always up for a good problem.\n\nReach me directly through any of these. The Netherlands number is on WhatsApp and the fastest way in.",
    channels: [
      {
        label: "Email",
        value: "hganesh0786@gmail.com",
        href: "mailto:hganesh0786@gmail.com",
      },
      {
        label: "Netherlands · WhatsApp",
        value: "+31 6 39262121",
        href: "https://wa.me/31639262121",
        note: "Call or WhatsApp — fastest way to reach me.",
      },
      {
        label: "India",
        value: "+91 98703 44958",
        note: "Not active while I'm in the Netherlands — please ping the WhatsApp number above.",
      },
      {
        label: "GitHub",
        value: "github.com/HVtechno",
        href: "https://github.com/HVtechno",
      },
      {
        label: "LinkedIn",
        value: "in/harihara-subramanian-ganesh",
        href: "https://www.linkedin.com/in/harihara-subramanian-ganesh-57ba71166/",
      },
    ],
    metrics: [
      { value: "open", label: "to opportunities" },
      { value: "fast", label: "to reply" },
    ],
  },
];

// Portrait / mobile layout — core at top, satellites as a fan below,
// so the "orchestrated from one core" metaphor still reads on a phone.
export const MOBILE_POS: Record<string, { x: number; y: number }> = {
  core: { x: 0.5, y: 0.21 },
  arch: { x: 0.27, y: 0.4 },
  stack: { x: 0.73, y: 0.4 },
  lead: { x: 0.27, y: 0.57 },
  work: { x: 0.73, y: 0.57 },
  about: { x: 0.27, y: 0.74 },
  contact: { x: 0.73, y: 0.74 },
};
