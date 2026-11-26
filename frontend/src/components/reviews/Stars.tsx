import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/** Read-only stars. Whole stars are filled, based on the rounded rating. */
export function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span className={cn("inline-flex gap-0.5 text-brand-gold", className)} role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => <Star key={n} className={cn("h-4 w-4", n <= Math.round(rating) ? "fill-current" : "text-border")} aria-hidden />)}
    </span>
  );
}

/** Tap-to-rate stars as a radio group, so it also works with a keyboard and screen readers. */
export function StarInput({ value, onChange, id }: { value: number; onChange: (n: number) => void; id?: string }) {
  return (
    <div id={id} role="radiogroup" aria-label="Your rating" className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n === 1 ? "" : "s"}`}
          onClick={() => onChange(n)}
          className="rounded-md p-1 text-brand-gold transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Star className={cn("h-9 w-9", n <= value ? "fill-current" : "text-border")} aria-hidden />
        </button>
      ))}
    </div>
  );
}
