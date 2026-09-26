// Read-only "paper" CV. Server-safe (no hooks) — used by the public /cv page and
// by the editor's "Preview" mode, so what Hari previews is exactly what's live.
import { cleanCv, contactHref, type CvData } from "@/lib/cv/types";

export default function CvPaper({ data: raw }: { data: CvData }) {
  const data = cleanCv(raw);
  return (
    <article className="cvp-paper">
      <header className="cvp-head">
        <img src="/hari.jpg" alt={data.name} />
        <div>
          <h1>{data.name}</h1>
          {data.title && <div className="cvp-title">{data.title}</div>}
          <div className="cvp-contact">
            {data.contact.filter(Boolean).map((c, i) => {
              const href = contactHref(c);
              return href ? (
                <a key={i} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                  {c}
                </a>
              ) : (
                <span key={i}>{c}</span>
              );
            })}
          </div>
        </div>
      </header>

      {data.summary && (
        <section className="cvp-sec">
          <h2>Summary</h2>
          <p>{data.summary}</p>
        </section>
      )}

      {data.jobs.length > 0 && (
        <section className="cvp-sec">
          <h2>Experience</h2>
          {data.jobs.map((j, i) => (
            <div className="cvp-job" key={i}>
              <div className="cvp-when">{j.when}</div>
              <div>
                <h3>{j.role}</h3>
                <div className="cvp-org">{j.org}</div>
                {j.bullets.length > 0 && (
                  <ul>
                    {j.bullets.map((b, k) => (
                      <li key={k}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </section>
      )}

      {data.skills.length > 0 && (
        <section className="cvp-sec">
          <h2>Skills</h2>
          <div className="cvp-skills">
            {data.skills.map((g, i) => (
              <div className="cvp-skillrow" key={i}>
                <div className="cvp-k">{g.label}</div>
                <div className="cvp-chips">
                  {g.items.map((c, k) => (
                    <span className="cvp-chip" key={k}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="cvp-sec cvp-two">
        {data.certs.length > 0 && (
          <div>
            <h2>Certifications</h2>
            {data.certs.map((c, i) => (
              <div className="cvp-item" key={i}>
                <b>{c.name}</b>
                <span>{c.meta}</span>
              </div>
            ))}
          </div>
        )}
        {data.education.length > 0 && (
          <div>
            <h2>Education</h2>
            {data.education.map((c, i) => (
              <div className="cvp-item" key={i}>
                <b>{c.name}</b>
                <span>{c.meta}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="cvp-foot">
        Interactive version, with architecture diagrams and VeXa the AI assistant →{" "}
        <a href="/">h2ganesh.com</a>
      </div>
    </article>
  );
}
