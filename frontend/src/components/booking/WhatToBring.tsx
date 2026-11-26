import { CheckCircle2 } from "lucide-react";
import { whatToBring } from "@/data/content";
import { cn } from "@/lib/utils";

export function WhatToBring({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border bg-card p-5 sm:p-6", className)}>
      <h2 className="text-lg font-bold">What to bring to the shop</h2>
      <ul className="mt-3 space-y-3">
        {whatToBring.map((i) => (
          <li key={i.title} className="flex gap-3 text-sm">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
            <span><strong className="font-semibold">{i.title}</strong><span className="block text-muted-foreground">{i.text}</span></span>
          </li>
        ))}
      </ul>
    </div>
  );
}
