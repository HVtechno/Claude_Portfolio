// -----------------------------------------------------------------------------
// Server-generated CV PDF (A4, vector text, selectable + ATS-friendly).
// Built with @react-pdf/renderer so every download looks identical — no browser
// print headers/footers (date, URL, page numbers), no device-dependent layout.
// -----------------------------------------------------------------------------

import { readFileSync } from "fs";
import path from "path";
import {
  Document,
  Font,
  Image,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import { cleanCv, contactHref, type CvData } from "./types";

// never split words with hyphens ("opera-tional")
Font.registerHyphenationCallback((word) => [word]);

const INK = "#0b1220"; // headings
const BODY = "#1f2937"; // body text — high contrast on white
const SUB = "#4b5563"; // dates / meta
const ACCENT = "#1d4ed8"; // one strong accent colour
const TINT = "#eef3ff";

const s = StyleSheet.create({
  page: {
    paddingTop: 34,
    paddingBottom: 30,
    paddingHorizontal: 44,
    fontFamily: "Helvetica",
    fontSize: 9.8,
    color: BODY,
    lineHeight: 1.45,
  },
  head: { flexDirection: "row", alignItems: "center", marginBottom: 18 },
  photo: { width: 66, height: 66, borderRadius: 33, marginRight: 16, objectFit: "cover" },
  name: { fontFamily: "Helvetica-Bold", fontSize: 22, color: INK, lineHeight: 1.15 },
  title: { fontFamily: "Helvetica-Bold", fontSize: 10.5, color: ACCENT, marginTop: 3 },
  contact: { flexDirection: "row", flexWrap: "wrap", marginTop: 6 },
  contactItem: { fontSize: 9, color: BODY, textDecoration: "none", marginRight: 14, marginBottom: 2 },
  sec: { marginTop: 14 },
  secHead: { marginBottom: 8 },
  secTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9.5,
    letterSpacing: 1.6,
    color: ACCENT,
    textTransform: "uppercase",
  },
  secBar: { width: 22, height: 2, backgroundColor: ACCENT, marginTop: 3, borderRadius: 1 },
  summary: { fontSize: 10, lineHeight: 1.55, color: BODY },
  job: { flexDirection: "row", marginBottom: 9 },
  when: { width: 92, fontSize: 8.8, color: SUB, paddingTop: 1.5, paddingRight: 8 },
  jobMain: { flex: 1 },
  role: { fontFamily: "Helvetica-Bold", fontSize: 11, color: INK },
  org: { fontFamily: "Helvetica-Bold", fontSize: 9.5, color: ACCENT, marginTop: 1, marginBottom: 3 },
  loc: { fontFamily: "Helvetica", color: SUB },
  bullet: { flexDirection: "row", marginTop: 1.5 },
  bulletDot: { width: 10, fontSize: 9.8, color: ACCENT },
  bulletText: { flex: 1, fontSize: 9.6, lineHeight: 1.4, color: BODY },
  skillRow: { flexDirection: "row", marginBottom: 3 },
  skillLabel: { width: 92, fontFamily: "Helvetica-Bold", fontSize: 8.8, color: SUB, paddingTop: 2.5, paddingRight: 8 },
  chips: { flex: 1, flexDirection: "row", flexWrap: "wrap" },
  chip: {
    fontSize: 8.8,
    color: "#102a5c",
    backgroundColor: TINT,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 7,
    marginRight: 4,
    marginBottom: 3,
  },
  two: { flexDirection: "row", marginTop: 14 },
  col: { flex: 1, paddingRight: 14 },
  colWide: { flex: 1.45, paddingRight: 14 },
  item: { marginBottom: 6 },
  certRow: { marginBottom: 4 },
  certMeta: { fontFamily: "Helvetica", fontSize: 8.8, color: SUB },
  itemName: { fontFamily: "Helvetica-Bold", fontSize: 9.8, color: INK },
  itemMeta: { fontSize: 8.8, color: SUB, marginTop: 1 },
});

function Section({ title, children, first }: { title: string; children: React.ReactNode; first?: boolean }) {
  return (
    <View style={first ? undefined : s.sec}>
      <View style={s.secHead} minPresenceAhead={40}>
        <Text style={s.secTitle}>{title}</Text>
        <View style={s.secBar} />
      </View>
      {children}
    </View>
  );
}

let photo: Buffer | null = null;
function getPhoto() {
  if (photo) return photo;
  try {
    photo = readFileSync(path.join(process.cwd(), "public", "hari.jpg"));
  } catch {
    photo = null;
  }
  return photo;
}

function CvDocument({ data: raw }: { data: CvData }) {
  const cv = cleanCv(raw);
  const img = getPhoto();
  return (
    <Document title={`${cv.name} — CV`} author={cv.name} subject="Curriculum vitae" creator="h2ganesh.com">
      <Page size="A4" style={s.page}>
        <View style={s.head}>
          {img && <Image style={s.photo} src={{ data: img, format: "jpg" }} />}
          <View style={{ flex: 1 }}>
            <Text style={s.name}>{cv.name}</Text>
            {cv.title ? <Text style={s.title}>{cv.title}</Text> : null}
            <View style={s.contact}>
              {cv.contact.map((c, i) => {
                const href = contactHref(c);
                return (
                  <View key={i}>
                    {href ? (
                      <Link src={href} style={s.contactItem}>
                        {c}
                      </Link>
                    ) : (
                      <Text style={s.contactItem}>{c}</Text>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {cv.summary ? (
          <Section title="Summary" first>
            <Text style={s.summary}>{cv.summary}</Text>
          </Section>
        ) : null}

        {cv.jobs.length > 0 && (
          <Section title="Experience">
            {cv.jobs.map((j, i) => (
              <View key={i} style={s.job}>
                <Text style={s.when}>{j.when}</Text>
                <View style={s.jobMain}>
                  <View minPresenceAhead={30}>
                    <Text style={s.role}>{j.role}</Text>
                    {j.org ? (
                      <Text style={s.org}>
                        {j.org}
                        {j.location ? <Text style={s.loc}>{`  ·  ${j.location}`}</Text> : null}
                      </Text>
                    ) : null}
                  </View>
                  {j.bullets.map((b, k) => (
                    <View key={k} style={s.bullet} wrap={false}>
                      <Text style={s.bulletDot}>•</Text>
                      <Text style={s.bulletText}>{b}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </Section>
        )}

        {cv.skills.length > 0 && (
          <Section title="Skills">
            {cv.skills.map((g, i) => (
              <View key={i} style={s.skillRow} wrap={false}>
                <Text style={s.skillLabel}>{g.label}</Text>
                <View style={s.chips}>
                  {g.items.map((c, k) => (
                    <Text key={k} style={s.chip}>
                      {c}
                    </Text>
                  ))}
                </View>
              </View>
            ))}
          </Section>
        )}

        {(cv.certs.length > 0 || cv.education.length > 0) && (
          <View style={s.two}>
            {cv.certs.length > 0 && (
              <View style={s.colWide}>
                <Section title="Certifications" first>
                  {cv.certs.map((c, i) => (
                    <View key={i} style={s.certRow} wrap={false}>
                      <Text style={s.itemName}>
                        {c.name}
                        {c.meta ? <Text style={s.certMeta}>{`  ·  ${c.meta}`}</Text> : null}
                      </Text>
                    </View>
                  ))}
                </Section>
              </View>
            )}
            {cv.education.length > 0 && (
              <View style={s.col}>
                <Section title="Education" first>
                  {cv.education.map((c, i) => (
                    <View key={i} style={s.item}>
                      <Text style={s.itemName}>{c.name}</Text>
                      {c.meta ? <Text style={s.itemMeta}>{c.meta}</Text> : null}
                    </View>
                  ))}
                </Section>
              </View>
            )}
          </View>
        )}
      </Page>
    </Document>
  );
}

export async function renderCvPdf(data: CvData): Promise<Buffer> {
  return renderToBuffer(<CvDocument data={data} />);
}

export function pdfFileName(data: CvData) {
  const base = (data.name || "CV").trim().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");
  return `${base || "CV"}-CV.pdf`;
}
