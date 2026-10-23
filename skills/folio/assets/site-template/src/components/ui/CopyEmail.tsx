// Adapted from Cult UI (MIT, © Jordan Gilliam): copy-button. Changes for folio: a word instead of icons,
// no blur and no scale-from-0.25 (a short vertical swap), tokens instead of its colours, no shadcn Button.
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

function legacyCopy(value: string) {
  const t = document.createElement("textarea");
  t.value = value; t.setAttribute("readonly", ""); t.style.position = "fixed"; t.style.opacity = "0";
  document.body.appendChild(t); t.select();
  let ok = false;
  try { ok = document.execCommand("copy"); } catch { ok = false; }
  document.body.removeChild(t);
  return ok;
}

async function copy(value: string) {
  if (navigator.clipboard?.writeText) {
    try { await navigator.clipboard.writeText(value); return true; } catch { return legacyCopy(value); }
  }
  return legacyCopy(value);
}

type Props = { value: string; label?: string; done?: string; className?: string };

export default function CopyEmail({ value, label = "Copier l’adresse", done = "Adresse copiée", className }: Props) {
  const [copied, setCopied] = useState(false);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);
  const swap = reduce
    ? { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0 } }
    : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.18, ease: [0.23, 1, 0.32, 1] as const } };
  return (
    <button
      type="button"
      className={cn("relative inline-grid min-h-11 cursor-pointer overflow-hidden text-left font-semibold underline underline-offset-4 active:scale-[0.97] transition-transform duration-150", className)}
      onClick={async () => { if (await copy(value)) setCopied(true); else location.href = `mailto:${value}`; }}
    >
      <span aria-live="polite" className="visually-hidden">{copied ? done : ""}</span>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span key={copied ? "done" : "idle"} className="col-start-1 row-start-1 py-2" {...swap}>
          {copied ? done : label}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
