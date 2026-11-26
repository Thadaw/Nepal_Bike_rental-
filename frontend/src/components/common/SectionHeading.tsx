import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props { title: string; text?: string; action?: ReactNode; light?: boolean; className?: string; eyebrow?: string }

export function SectionHeading({ title, text, action, light, className, eyebrow }: Props) {
  return (
    <div className={cn("mb-10 flex flex-col justify-between gap-4 md:mb-14 md:flex-row md:items-end", className)}>
      <div className="max-w-2xl">
        {eyebrow && <p className="mb-3 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-brand-golddeep"><span className="h-px w-8 bg-brand-gold" aria-hidden />{eyebrow}</p>}
        <h2 className={cn("text-balance text-3xl font-extrabold leading-tight md:text-5xl", light && "text-brand-warm")}>{title}</h2>
        {text && <p className={cn("mt-4 max-w-prose text-base md:text-lg", light ? "text-brand-warm/70" : "text-muted-foreground")}>{text}</p>}
      </div>
      {action}
    </div>
  );
}
