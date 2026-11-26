import { addDaysISO, rentalDays, todayISO } from "@/lib/dates";
import { cn } from "@/lib/utils";

export const quickDurations = [1, 2, 3, 5, 7, 14, 30];

interface Props {
  startDate: string;
  returnDate: string;
  /** Called with the start date to use (today when none is chosen yet) and the matching return date. */
  onPick: (startDate: string, returnDate: string) => void;
  compact?: boolean;
}

export function DurationChips({ startDate, returnDate, onPick, compact }: Props) {
  const days = rentalDays(startDate, returnDate);
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Rental length">
      {quickDurations.map((n) => (
        <button
          key={n}
          type="button"
          aria-pressed={days === n}
          onClick={() => { const start = startDate || todayISO(); onPick(start, addDaysISO(start, n)); }}
          className={cn("rounded-full border font-semibold transition", compact ? "px-3 py-1.5 text-xs" : "min-w-[4.5rem] px-4 py-2 text-sm", days === n ? "border-brand-charcoal bg-brand-charcoal text-brand-warm" : "hover:border-foreground")}
        >
          {n === 1 ? "1 day" : `${n} days`}
        </button>
      ))}
    </div>
  );
}
