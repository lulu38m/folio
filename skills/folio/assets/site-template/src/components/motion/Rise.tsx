// Staggered entrance for a group with Motion's springs, when CSS data-reveal is not enough (a list whose
// items rise in sequence, a clip-path wipe). Children render normally in the HTML; only items still below
// the fold are prepared and played. <Rise client:idle> <ul><li data-rise>…</li></ul> </Rise>
import { useRef, type ReactNode } from "react";
import { animate, stagger } from "motion";
import { useOnView } from "./useOnView";

type Props = { children: ReactNode; selector?: string; y?: number; gap?: number; clip?: boolean; className?: string };

export default function Rise({ children, selector = "[data-rise]", y = 16, gap = 0.06, clip = false, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const items = (el: Element) => [...el.querySelectorAll(selector)] as HTMLElement[];
  useOnView(
    ref,
    (el) => items(el).forEach((i) => { i.style.opacity = "0"; i.style.transform = `translateY(${y}px)`; if (clip) i.style.clipPath = "inset(0 0 100% 0)"; }),
    (el) => {
      animate(items(el), clip ? { opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)" } : { opacity: 1, y: 0 },
        { duration: 0.5, ease: [0.23, 1, 0.32, 1], delay: stagger(gap) });
    },
  );
  return <div ref={ref} className={className}>{children}</div>;
}
