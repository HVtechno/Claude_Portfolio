import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "◉ Hari · system online",
  description:
    "A portfolio built as a living system. Data engineering, distributed architecture, and technical leadership — explored as an interactive architecture graph.",
  openGraph: {
    title: "◉ Hari · system online",
    description:
      "A portfolio built as a living system. Explore the architecture.",
    type: "website",
  },
  metadataBase: new URL("https://h2ganesh.com"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
