import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { isDayBooked, pickDate, type BookedRange } from "@/lib/availability";
import { MONTH_NAMES, monthCells, shiftMonth } from "@/lib/calendar";
import { formatDate, todayISO } from "@/lib/dates";
import { cn } from "@/lib/utils";

interface Props {
  /** Days already taken (confirmed bookings and blocked dates). */
  ranges: BookedRange[];
  start: string;
  end: string;
  /** Called with the pickup day and the return day ("" until the second tap). */
  onSelect: (start: string, end: string) => void;
}

/** Month calendar. Booked days are greyed out and cannot be picked; tap pickup day, then return day. */
export function AvailabilityCalendar({ ranges, start, end, onSelect }: Props) {
  const today = todayISO();
  const seed = start || today;
  const [view, setView] = useState({ y: Number(seed.slice(0, 4)), m: Number(seed.slice(5, 7)) - 1 });
  const [note, setNote] = useState("");
  const thisMonth = { y: Number(today.slice(0, 4)), m: Number(today.slice(5, 7)) - 1 };
  const atStart = view.y === thisMonth.y && view.m === thisMonth.m;

  const click = (iso: string) => {
    const next = pickDate(iso, start, end, ranges);
    setNote(next.clashed ? "That range includes days that are already booked, so we started again from the day you tapped." : "");
    onSelect(next.start, next.end);
  };

  return (
    <div className="rounded-xl border bg-card p-3 sm:p-4">
      <div className="mb-2 flex items-center justify-between">
        <button type="button" aria-label="Previous month" disabled={atStart} onClick={() => setView((v) => shiftMonth(v.y, v.m, -1))} className="rounded-full p-1.5 hover:bg-secondary disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
        <p className="font-heading text-sm font-bold" aria-live="polite">{MONTH_NAMES[view.m]} {view.y}</p>
        <button type="button" aria-label="Next month" onClick={() => setView((v) => shiftMonth(v.y, v.m, 1))} className="rounded-full p-1.5 hover:bg-secondary"><ChevronRight className="h-4 w-4" /></button>
      </div>
      <div className="grid grid-cols-7 text-center text-[11px] font-medium text-muted-foreground" aria-hidden>
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <span key={i} className="py-1">{d}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {monthCells(view.y, view.m).map((iso, i) => {
          if (!iso) return <span key={`b${i}`} />;
          const past = iso < today;
          const booked = isDayBooked(iso, ranges);
          const isEdge = iso === start || iso === end;
          const inRange = !!start && !!end && iso > start && iso < end;
          return (
            <button
              key={iso}
              type="button"
              disabled={past || booked}
              onClick={() => click(iso)}
              aria-pressed={isEdge}
              aria-label={`${formatDate(iso)}${booked ? ", booked" : past ? ", past" : ""}`}
              className={cn(
                "mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm tabular-nums transition",
                booked ? "cursor-not-allowed bg-secondary text-muted-foreground/70 line-through" : past ? "cursor-not-allowed text-muted-foreground/40" : "hover:bg-brand-gold/30",
                inRange && "rounded-none bg-brand-gold/25",
                isEdge && "bg-brand-charcoal font-bold text-brand-warm hover:bg-brand-charcoal",
                iso === today && !isEdge && "ring-1 ring-brand-golddeep",
              )}
            >
              {Number(iso.slice(8))}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-secondary" /> Booked</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-brand-charcoal" /> Your dates</span>
        <span>{!start ? "Tap your pickup day" : !end ? "Now tap your return day" : ""}</span>
      </div>
      {note && <p role="status" className="mt-2 text-xs text-amber-700">{note}</p>}
    </div>
  );
}
