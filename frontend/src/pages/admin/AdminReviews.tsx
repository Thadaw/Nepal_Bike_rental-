import { useState } from "react";
import { BadgeCheck, Check, Trash2, X } from "lucide-react";
import { AdminTitle } from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Stars } from "@/components/reviews/Stars";
import { useAdminReviews, useDeleteReview, useUpdateReviewStatus } from "@/features/reviews/hooks";
import type { ReviewStatus } from "@/features/reviews/types";
import { cn } from "@/lib/utils";

const filters: ("pending" | "approved" | "rejected" | "all")[] = ["pending", "approved", "rejected", "all"];
const tone: Record<ReviewStatus, string> = {
  pending: "bg-brand-gold/25 text-brand-golddeep",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
};

export default function AdminReviews() {
  const { data: reviews = [] } = useAdminReviews();
  const update = useUpdateReviewStatus();
  const remove = useDeleteReview();
  const [filter, setFilter] = useState<(typeof filters)[number]>("pending");
  const busy = update.isPending || remove.isPending;
  const rows = reviews.filter((r) => filter === "all" || r.status === filter);

  return (
    <>
      <AdminTitle title="Reviews" text="Only customers you sent a review link to can write one. Approve a review to show it on the website." />
      <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="Filter reviews">
        {filters.map((f) => (
          <button key={f} role="tab" aria-selected={filter === f} onClick={() => setFilter(f)} className={cn("rounded-full border px-4 py-1.5 text-sm font-medium capitalize", filter === f ? "border-brand-charcoal bg-brand-charcoal text-brand-warm" : "hover:border-foreground")}>
            {f}{f !== "all" && ` (${reviews.filter((r) => r.status === f).length})`}
          </button>
        ))}
      </div>
      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
          {filter === "pending" ? "No reviews waiting. After a rental is marked Completed, use Send review link in Booking requests." : "No reviews here."}
        </p>
      ) : (
        <ul className="space-y-4">
          {rows.map((r) => (
            <li key={r.id} className="rounded-2xl border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2"><Stars rating={r.rating} /><Badge className={tone[r.status]}>{r.status}</Badge></div>
                  <p className="mt-2 font-heading font-bold">{r.name} <span className="font-normal text-muted-foreground">· {r.vehicleName}</span></p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground"><BadgeCheck className="h-3.5 w-3.5 text-emerald-700" aria-hidden /> Booking {r.reference} · {new Date(r.createdAt).toLocaleString("en-GB")}</p>
                </div>
                <div className="flex gap-2">
                  {r.status !== "approved" && <Button size="sm" disabled={busy} onClick={() => update.mutate({ id: r.id, status: "approved" })}><Check aria-hidden /> Approve</Button>}
                  {r.status !== "rejected" && <Button size="sm" variant="outline" disabled={busy} onClick={() => update.mutate({ id: r.id, status: "rejected" })}><X aria-hidden /> Reject</Button>}
                  <Button size="icon" variant="ghost" aria-label={`Delete review by ${r.name}`} disabled={busy} onClick={() => { if (window.confirm("Delete this review? That customer's review link will work again. Use Reject instead to keep the one-review limit.")) remove.mutate(r.id); }}><Trash2 /></Button>
                </div>
              </div>
              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed">{r.comment}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
