// -----------------------------------------------------------------------------
// profile.ts — assembles Hari's "master profile" into one grounded text block.
// This is the single source of truth the Virtual Hari LLM is allowed to use, so
// the assistant stays truthful (no invented experience) and on-message.
// -----------------------------------------------------------------------------

import { NODES, IDENTITY, CAREER_START_YEAR } from "./nodes";
import { FEATURED, CONTACT } from "./featured";
import { ARCHITECTURES } from "./architectures";

export function masterProfile(): string {
  const years = new Date().getFullYear() - CAREER_START_YEAR;
  const fill = (s?: string) => (s ?? "").split("{{years}}").join(String(years));
  const out: string[] = [];

  out.push("# HARI — MASTER PROFILE (the only facts you may use)");
  out.push(
    `Name: Harihara Subramanian Ganesh, goes by Hari. Target roles: ${IDENTITY.role}. ` +
      `Experience: ${years} years. Email: ${IDENTITY.email}. GitHub: ${IDENTITY.github}. ` +
      `LinkedIn: linkedin.com/in/harihara-subramanian-ganesh-57ba71166. Based in Alphen aan den Rijn, Netherlands.`
  );

  NODES.filter((n) => !n.center).forEach((n) => {
    out.push(`\n## ${n.label}${n.sub ? ` — ${n.sub}` : ""}`);
    if (n.body) out.push(fill(n.body));
    n.sections?.forEach((s) => {
      out.push(
        `- ${s.title}: ${s.body}${s.chips ? ` (tech: ${s.chips.join(", ")})` : ""}`
      );
    });
    if (n.metrics?.length)
      out.push(
        `Metrics: ${n.metrics.map((m) => `${fill(m.value)} ${m.label}`).join("; ")}`
      );
    if (n.chips?.length) out.push(`Tags: ${n.chips.join(", ")}`);
    if (n.channels?.length)
      out.push(
        `Contact channels: ${n.channels
          .map((c) => `${c.label} — ${c.value}${c.note ? ` (${c.note})` : ""}`)
          .join("; ")}`
      );
  });

  out.push("\n## FEATURED PRODUCTS (Hari's own passion projects)");
  FEATURED.forEach((p) => {
    out.push(`\n### ${p.name} — ${p.tagline}`);
    out.push(`Problem: ${p.problem}`);
    out.push(`How it works: ${p.flow.join(" -> ")}`);
    out.push(`Outcome: ${p.outcome}`);
    out.push(
      `Tech: ${p.tech.join(", ")}.` +
        (p.live ? ` Live: ${p.live}.` : "") +
        (p.repo ? ` Source: ${p.repo}.` : "")
    );
  });

  out.push("\n## ARCHITECTURE DIAGRAMS Hari has designed");
  ARCHITECTURES.forEach((d) => {
    out.push(`\n### ${d.name}: ${d.overview}`);
    out.push(
      `Components: ${d.nodes
        .map((nd) => `${nd.label} [${nd.tech.join(" / ")}]`)
        .join("; ")}`
    );
  });

  out.push("\n## CONTACT");
  out.push(`Email: ${CONTACT.email}. ${CONTACT.line}`);

  return out.join("\n");
}
