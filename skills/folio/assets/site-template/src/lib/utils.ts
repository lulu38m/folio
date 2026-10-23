// cn(): merges Tailwind classes. Cult UI and shadcn components import it from "@/lib/utils".
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
