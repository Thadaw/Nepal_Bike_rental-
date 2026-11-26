import { Flame, Star } from "lucide-react";
import { cn } from "@/lib/utils";

/** Small label pinned on a vehicle photo. "Most Popular" is gold, others are dark. */
export function VehicleBadge({ label, className }: { label?: string; className?: string }) {
  if (!label) return null;
  const popular = label === "Most Popular";
  const Icon = popular ? Flame : Star;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold shadow-sm", popular ? "bg-brand-gold text-brand-charcoal" : "bg-brand-charcoal text-brand-warm", className)}>
      <Icon className="h-3 w-3" aria-hidden /> {label}
    </span>
  );
}
