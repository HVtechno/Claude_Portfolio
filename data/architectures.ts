// -----------------------------------------------------------------------------
// architectures.ts — reference architectures shown in the 3D Architecture Explorer.
// Add a new ArchDiagram to ARCHITECTURES and it appears as a new tab automatically.
// Each node carries desktop (x,y) and mobile/portrait (mx,my) coordinates as %.
// -----------------------------------------------------------------------------

export interface ArchNode {
  id: string;
  label: string;
  sub: string;
  x: number; // desktop %
  y: number;
  mx: number; // mobile / portrait %
  my: number;
  desc: string;
  tech: string[];
}

export interface ArchGroup {
  id: string;
  label: string;
  nodeIds: string[]; // the box is computed to wrap these nodes
}

export interface ArchDiagram {
  id: string;
  name: string;
  overview: string;
  nodes: ArchNode[];
  edges: [string, string][];
  groups?: ArchGroup[]; // optional "faces" drawn as dotted labeled blocks
}

export const ARCH_INTRO = {
  lead:
    "I architect complete systems — from the data platform underneath to the full-stack product on top.",
  cert: "Microsoft-certified Azure Solutions Architect Expert.",
};

const dataPlatform: ArchDiagram = {
  id: "data-platform",
  name: "Data Platform",
  overview:
    "The exact blueprint I work on in my current role — an event-driven ELT pipeline on Azure that I engineer, orchestrate, monitor and secure end to end. This is one blueprint, not the only one: every environment is different, so I adapt the flow, tooling and patterns to whatever stack a team already runs. Tap any component to explore it.",
  nodes: [
    {
      id: "src",
      label: "Data Sources",
      sub: "ingress",
      x: 8,
      y: 50,
      mx: 50,
      my: 8,
      desc:
        "Event-driven and file-based ingress — Kafka topics stream real-time events, while SFTP/XFB delivers scheduled file drops.",
      tech: ["Kafka Topics", "SFTP / XFB"],
    },
    {
      id: "ext",
      label: "Extract",
      sub: "ELT · E",
      x: 27,
      y: 50,
      mx: 50,
      my: 24,
      desc:
        "Pulling and shaping raw data with Python and Pandas and a toolbox of libraries — the extract stage of ELT.",
      tech: ["Python", "Pandas", "Libraries"],
    },
    {
      id: "load",
      label: "Load",
      sub: "ELT · L",
      x: 46,
      y: 50,
      mx: 50,
      my: 40,
      desc:
        "Landing raw data straight into Azure SQL — fast, reliable, and ready to transform in place.",
      tech: ["Azure SQL"],
    },
    {
      id: "tr",
      label: "Transform",
      sub: "ELT · T",
      x: 65,
      y: 50,
      mx: 50,
      my: 56,
      desc:
        "Modeling in the warehouse with SQL — stored procedures and views put business logic where the data already lives.",
      tech: ["SQL", "Stored Procedures", "Views"],
    },
    {
      id: "bi",
      label: "Power BI",
      sub: "serve",
      x: 88,
      y: 50,
      mx: 50,
      my: 90,
      desc:
        "Curated, trusted data surfaced to users through Power BI reports and dashboards.",
      tech: ["Power BI"],
    },
    {
      id: "orch",
      label: "Orchestration",
      sub: "schedule",
      x: 35,
      y: 15,
      mx: 18,
      my: 20,
      desc:
        "Every job scheduled, sequenced and retried — coordinated end to end through UAC and Airflow.",
      tech: ["UAC", "Airflow"],
    },
    {
      id: "cicd",
      label: "CI/CD",
      sub: "deploy",
      x: 73,
      y: 15,
      mx: 82,
      my: 20,
      desc:
        "Code versioned in Azure Repos and shipped through Azure Pipelines — automated, repeatable deployments.",
      tech: ["Azure Repos", "Azure Pipelines"],
    },
    {
      id: "mon",
      label: "Monitoring",
      sub: "observe",
      x: 40,
      y: 86,
      mx: 18,
      my: 72,
      desc:
        "Custom Flask dashboards for live logs, audit trails and troubleshooting — full visibility into pipeline health.",
      tech: ["Flask", "Live Logs", "Audit"],
    },
    {
      id: "sec",
      label: "Security",
      sub: "protect",
      x: 70,
      y: 86,
      mx: 82,
      my: 72,
      desc:
        "Secrets and credentials held in Azure Key Vault, with incident tracking to stay compliant and auditable.",
      tech: ["Azure Key Vault", "Incident Tracking"],
    },
  ],
  edges: [
    ["src", "ext"],
    ["ext", "load"],
    ["load", "tr"],
    ["tr", "bi"],
    ["orch", "ext"],
    ["orch", "tr"],
    ["cicd", "orch"],
    ["tr", "mon"],
    ["load", "mon"],
    ["sec", "ext"],
    ["sec", "load"],
  ],
};

const documentSystem: ArchDiagram = {
  id: "dms",
  name: "Full-Stack",
  overview:
    "A full-stack Document Management System I designed and built end to end on Azure — three faces working as one product: a data-engineering pipeline that ingests and transforms every source, a Python API that serves it, and a React app the operations team lives in. Tuned to move millions of records smoothly for a team of approximately 150. Tap any component to explore it.",
  groups: [
    { id: "de", label: "Data Engineering", nodeIds: ["src", "el", "sql", "tr", "mon"] },
    { id: "be", label: "Backend", nodeIds: ["api", "svc"] },
    { id: "fe", label: "Frontend", nodeIds: ["web", "feat", "pdfout"] },
  ],
  nodes: [
    // ---- Data Engineering face ----
    {
      id: "src",
      label: "Sources",
      sub: "ingress",
      x: 13,
      y: 30,
      mx: 50,
      my: 5,
      desc:
        "Mixed inbound feeds — scheduled SFTP drops from partner organizations, Excel workbooks, SAP data pulled via automated RFC and VBScript, and PDF invoices read with OCR.",
      tech: ["SFTP", "Excel", "SAP · RFC / VBS", "PDF · OCR"],
    },
    {
      id: "el",
      label: "Extract & Load",
      sub: "ELT · EL",
      x: 13,
      y: 56,
      mx: 27,
      my: 15,
      desc:
        "Serverless ingestion — Azure Functions on HTTP, timer and blob triggers run Python / Pandas (and Tesseract OCR) to extract every source and land it straight into Azure SQL.",
      tech: ["Azure Functions", "Python", "Pandas", "Tesseract OCR"],
    },
    {
      id: "sql",
      label: "Azure SQL",
      sub: "store",
      x: 26,
      y: 56,
      mx: 73,
      my: 15,
      desc:
        "One trusted store — raw data lands here and is transformed in place, keeping business logic close to the data.",
      tech: ["Azure SQL"],
    },
    {
      id: "tr",
      label: "Transform",
      sub: "ELT · T",
      x: 39,
      y: 56,
      mx: 50,
      my: 25,
      desc:
        "In-warehouse modeling with SQL — stored procedures and views turn raw records into clean, query-ready data.",
      tech: ["SQL", "Stored Procedures", "Views"],
    },
    {
      id: "mon",
      label: "Command Center",
      sub: "observe",
      x: 26,
      y: 80,
      mx: 50,
      my: 35,
      desc:
        "Every run writes live logs to SQL; a custom Flask dashboard surfaces audit trails in real time to track runs, catch errors fast and troubleshoot.",
      tech: ["Flask", "Live Logs", "Audit Trail"],
    },
    // ---- Backend face ----
    {
      id: "api",
      label: "Data API",
      sub: "serve",
      x: 60,
      y: 42,
      mx: 27,
      my: 53,
      desc:
        "Python Azure Functions expose HTTP GET / POST endpoints that call stored procedures and stream transformed data to the app.",
      tech: ["Azure Functions", "HTTP GET / POST", "Stored Procedures"],
    },
    {
      id: "svc",
      label: "Action Functions",
      sub: "logic",
      x: 60,
      y: 62,
      mx: 73,
      my: 53,
      desc:
        "Feature-specific endpoints behind the UI — powering CRUD writes, per-user bookmarks and on-demand invoice generation.",
      tech: ["Azure Functions", "REST", "CRUD"],
    },
    // ---- Frontend face ----
    {
      id: "web",
      label: "Web App",
      sub: "client",
      x: 84,
      y: 32,
      mx: 50,
      my: 70,
      desc:
        "A React single-page app — component-driven with React Router — that the operations team works in all day.",
      tech: ["React.js", "React Router", "Components"],
    },
    {
      id: "feat",
      label: "Features",
      sub: "experience",
      x: 84,
      y: 56,
      mx: 27,
      my: 85,
      desc:
        "Built for scale and speed — paginating millions of records, CRUD, date filtering and sorting, and per-user bookmarks that remember each person's view.",
      tech: ["Pagination", "Filter / Sort", "Bookmarks", "CRUD"],
    },
    {
      id: "pdfout",
      label: "Invoice Export",
      sub: "egress",
      x: 84,
      y: 80,
      mx: 73,
      my: 85,
      desc:
        "Generates new invoices as PDF on demand and delivers the data onward to external clients.",
      tech: ["PDF Generation", "External Delivery"],
    },
  ],
  edges: [
    ["src", "el"],
    ["el", "sql"],
    ["sql", "tr"],
    ["el", "mon"],
    ["tr", "api"],
    ["api", "web"],
    ["web", "feat"],
    ["feat", "pdfout"],
    ["web", "svc"],
    ["svc", "sql"],
  ],
};

export const ARCHITECTURES: ArchDiagram[] = [dataPlatform, documentSystem];
