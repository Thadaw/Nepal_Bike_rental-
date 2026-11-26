import { AlertTriangle, CalendarX2, Check, FileCheck2, Fuel, HardHat, Clock, Route, ShieldCheck, Wallet, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { rentalRules, type RuleId } from "@/data/content";
import { cn } from "@/lib/utils";

const icons: Record<RuleId, LucideIcon> = { id: ShieldCheck, licence: FileCheck2, helmet: HardHat, payment: Wallet, fuel: Fuel, km: Route, late: Clock, cancel: CalendarX2, accident: AlertTriangle, breakdown: Wrench };
const byId = (id: RuleId) => rentalRules.find((r) => r.id === id)!;

function IconBadge({ id, className }: { id: RuleId; className?: string }) {
  const Icon = icons[id];
  return <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-gold/25 text-brand-golddeep", className)}><Icon className="h-5 w-5" aria-hidden /></span>;
}

/** The rules as clean icon cards, grouped under headings. Used on the policies page. */
export function RulesByGroup() {
  const groups = [...new Set(rentalRules.map((r) => r.group))];
  return (
    <div className="space-y-10">
      {groups.map((g) => (
        <section key={g} aria-labelledby={`g-${g.replace(/\W+/g, "-")}`}>
          <h2 id={`g-${g.replace(/\W+/g, "-")}`} className="text-2xl font-bold">{g}</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {rentalRules.filter((r) => r.group === g).map((r) => (
              <li key={r.id} className="flex gap-4 rounded-2xl border bg-card p-5">
                <IconBadge id={r.id} />
                <div><h3 className="font-heading font-bold">{r.title}</h3><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{r.text}</p></div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/** Short one-line version of every rule, for bike pages. */
export function RulesSummary({ ids }: { ids?: RuleId[] }) {
  const list = ids ? ids.map(byId) : rentalRules;
  return (
    <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
      {list.map((r) => (
        <li key={r.id} className="flex items-start gap-3 text-sm">
          <IconBadge id={r.id} className="h-8 w-8 [&_svg]:h-4 [&_svg]:w-4" />
          <span className="pt-1"><strong className="font-semibold">{r.title}</strong><span className="block text-muted-foreground">{r.short}</span></span>
        </li>
      ))}
    </ul>
  );
}

/** "What's included" ticks. The helmet only applies to bikes and scooties. */
export function Included({ category, className }: { category: string; className?: string }) {
  const ids: RuleId[] = [...(category === "motorcycle" || category === "scooty" ? (["helmet"] as RuleId[]) : []), "km", "fuel"];
  return (
    <ul className={cn("flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-medium", className)} aria-label="Included with every rental">
      {ids.map((id) => <li key={id} className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden /> {byId(id).short}</li>)}
    </ul>
  );
}
