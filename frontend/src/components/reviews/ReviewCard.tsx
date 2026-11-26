import { BadgeCheck } from "lucide-react";
import type { PublicReview } from "@/features/reviews/types";
import { Stars } from "./Stars";

const month = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

export function ReviewCard({ review }: { review: PublicReview }) {
  return (
    <figure className="flex h-full flex-col rounded-2xl border bg-card p-6">
      <Stars rating={review.rating} />
      <blockquote className="mt-4 flex-1 text-sm leading-relaxed">{review.comment}</blockquote>
      <figcaption className="mt-5 border-t pt-4">
        <p className="font-heading font-bold">{review.name}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{review.vehicleName} · {month(review.createdAt)}</p>
        <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700"><BadgeCheck className="h-3.5 w-3.5" aria-hidden /> Verified rental</p>
      </figcaption>
    </figure>
  );
}
