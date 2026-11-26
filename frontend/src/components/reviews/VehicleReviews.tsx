import { usePublicReviews } from "@/features/reviews/hooks";
import { summarize } from "@/features/reviews/summary";
import { ReviewCard } from "./ReviewCard";
import { Stars } from "./Stars";

/** Reviews of one vehicle. Renders nothing until it has an approved review. */
export function VehicleReviews({ vehicleSlug }: { vehicleSlug: string }) {
  const { data = [] } = usePublicReviews();
  const list = data.filter((r) => r.vehicleSlug === vehicleSlug);
  if (list.length === 0) return null;
  const { average, count } = summarize(list);
  return (
    <section aria-labelledby="vehicle-reviews">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h2 id="vehicle-reviews" className="text-2xl font-bold">Customer reviews</h2>
        <span className="flex items-center gap-2 text-sm text-muted-foreground"><Stars rating={average} /> {average} ({count})</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{list.slice(0, 4).map((r) => <ReviewCard key={r.id} review={r} />)}</div>
    </section>
  );
}
