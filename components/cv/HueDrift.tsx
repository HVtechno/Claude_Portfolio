"use client";

import { useEffect } from "react";

/** Same slow colour drift as the main scene, for the CV pages. */
export default function HueDrift() {
  useEffect(() => {
    let hue = 190;
    const root = document.documentElement;
    const id = window.setInterval(() => {
      hue = (hue + 0.6) % 360;
      root.style.setProperty("--hue", String(hue));
    }, 60);
    return () => window.clearInterval(id);
  }, []);
  return null;
}
