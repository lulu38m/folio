// The rule every animated island follows: the HTML Astro renders holds the final state (readable with no
// script, by search engines, in screenshots, under reduced motion). On the client, an element that is
// still below the fold is put in its start state, then animated to the final state once, when it enters.
// Anything already on screen when the island hydrates is left alone: no flash, no blank first screen.
// Hydrate such islands with client:idle (not client:visible, which hydrates too late to prepare).
import { useEffect, type RefObject } from "react";

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function useOnView(
  ref: RefObject<Element | null>,
  prepare: (el: Element) => void,
  play: (el: Element) => void,
  margin = "0px 0px -10% 0px",
) {
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !("IntersectionObserver" in window)) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return; // already seen: final state stays
    prepare(el);
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          play(el);
        }
      },
      { rootMargin: margin, threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
}
