import type { Vehicle } from "@/types";
import { presetQuotes, formatNpr } from "@/lib/pricing";
import { pricingConfig } from "@/config/pricing";
import { usePricing } from "@/features/pricing/hooks";
import { PendingNotice } from "@/components/common/PendingNotice";

export function DurationPriceTable({ vehicle }: { vehicle: Vehicle }) {
  const { data: pricing } = usePricing();
  const config = pricing ?? pricingConfig;
  const rows = presetQuotes({ category: vehicle.category, baseDailyRate: vehicle.dailyRateOverride, offRoadEligible: vehicle.offRoadEligible, tripType: "city" }, config);
  return (
    <div>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[420px] text-sm">
          <caption className="sr-only">City rental prices by duration</caption>
          <thead className="bg-secondary/60 text-left"><tr><th className="p-3 font-semibold">Duration</th><th className="p-3 font-semibold">Total</th><th className="p-3 font-semibold">Discount</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-t">
                <td className="p-3">{r.label}</td>
                <td className="p-3 font-heading font-semibold">{r.quote.status === "estimate" ? formatNpr(r.quote.finalTotal, config) : "On request"}</td>
                <td className="p-3 text-muted-foreground">{r.quote.status === "estimate" ? (r.quote.discountPercent ? `${r.quote.discountPercent}%` : "None") : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!config.discountsConfirmed && <PendingNotice className="mt-3">Discount percentages are demo values.</PendingNotice>}
      <p className="mt-3 text-xs text-muted-foreground">City rental prices. Adventure trips are priced in the booking panel.</p>
    </div>
  );
}
