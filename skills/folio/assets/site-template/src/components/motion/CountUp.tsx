// A real figure from the CV that counts up once when it enters. The HTML holds the final value.
// <CountUp client:idle value={112} suffix=" %" />   ·   from={840} counts down to the value.
import { useRef } from "react";
import { animate } from "motion";
import { useOnView } from "./useOnView";

type Props = { value: number; from?: number; decimals?: number; prefix?: string; suffix?: string; locale?: string; duration?: number; className?: string };

export default function CountUp({ value, from = 0, decimals = 0, prefix = "", suffix = "", locale = "fr-FR", duration = 0.9, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const fmt = (n: number) => prefix + n.toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
  useOnView(
    ref,
    (el) => { el.textContent = fmt(from); },
    (el) => { animate(from, value, { duration, ease: [0.23, 1, 0.32, 1], onUpdate: (v) => { el.textContent = fmt(v); } }); },
  );
  return <span ref={ref} className={className} style={{ fontVariantNumeric: "tabular-nums" }}>{fmt(value)}</span>;
}
