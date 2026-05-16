"use client";

import { useEffect } from "react";

/**
 * Mounts a single IntersectionObserver that adds `is-visible` to any
 * `[data-reveal]` element when it scrolls into view. Pairs with the CSS in
 * globals.css. Adds <1 KB to the bundle and is GPU-friendly.
 */
export function ScrollReveal() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("IntersectionObserver" in window)) {
      document
        .querySelectorAll<HTMLElement>("[data-reveal]")
        .forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 },
    );

    document
      .querySelectorAll<HTMLElement>("[data-reveal]")
      .forEach((el) => io.observe(el));

    return () => io.disconnect();
  }, []);

  return null;
}
