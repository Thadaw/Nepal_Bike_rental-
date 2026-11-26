import { cn } from "@/lib/utils";
import { formatNpr, type Quote } from "@/lib/pricing";
import { pricingConfig } from "@/config/pricing";
import { usePricing } from "@/features/pricing/hooks";
import { PendingNotice } from "@/components/common/PendingNotice";

function Row({ label, value, strong, accent }: { label: string; value: string; strong?: boolean; accent?: boolean }) {
  return (
    <div className={cn("flex items-baseline justify-between gap-4 py-1.5 text-sm", strong && "border-t pt-3 text-base font-bold", accent && "text-emerald-700")}>
      <dt className={cn(!strong && "text-muted-foreground")}>{label}</dt>
      <dd className="font-heading font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

export function PriceBreakdown({ quote, className }: { quote: Quote; className?: string }) {
  const { data: pricing } = usePricing();
  const discountsConfirmed = pricing?.discountsConfirmed ?? pricingConfig.discountsConfirmed;
  if (quote.status !== "estimate") {
    return (
      <div className={cn("rounded-xl bg-secondary/70 p-4 text-sm", className)} aria-live="polite">
        <p className="font-heading font-semibold">{quote.status === "quote" ? "Custom quotation" : "Estimate"}</p>
        <p className="mt-1 text-muted-foreground">{quote.reason}</p>
      </div>
    );
  }
  return (
    <div className={cn("rounded-xl bg-secondary/70 p-4", className)} aria-live="polite">
      <dl>
        <Row label="Daily rate" value={formatNpr(quote.baseRate)} />
        {quote.offRoadPerDay > 0 && <Row label="Off-road adventure, per day" value={`+ ${formatNpr(quote.offRoadPerDay)}`} />}
        {quote.destinationPerDay > 0 && <Row label="Destination charge, per day" value={`+ ${formatNpr(quote.destinationPerDay)}`} />}
        <Row label={`Original total (${quote.days} day${quote.days > 1 ? "s" : ""})`} value={formatNpr(quote.originalTotal)} />
        <Row label={`Discount (${quote.discountPercent}%)`} value={quote.savings > 0 ? `- ${formatNpr(quote.savings)}` : formatNpr(0)} accent={quote.savings > 0} />
        <Row label="Final estimated price" value={formatNpr(quote.finalTotal)} strong />
      </dl>
      {quote.discountPercent > 0 && !discountsConfirmed && (
        <PendingNotice className="mt-3">Discount percentages are demo values.</PendingNotice>
      )}
      <p className="mt-3 text-xs text-muted-foreground">Estimated total at current rates.</p>
    </div>
  );
}
