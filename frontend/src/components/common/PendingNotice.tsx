import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function PendingNotice({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p role="note" className={cn("flex items-start gap-2 rounded-lg border border-dashed border-brand-golddeep/50 bg-brand-gold/10 px-3.5 py-2.5 text-xs leading-relaxed text-brand-golddeep", className)}>
      <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <span>{children}</span>
    </p>
  );
}
