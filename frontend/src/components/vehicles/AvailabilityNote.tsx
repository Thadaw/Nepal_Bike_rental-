import { CalendarCheck, CalendarX2 } from "lucide-react";
import type { Vehicle } from "@/types";
import { availabilityNote } from "@/lib/availability";
import { useBookedRanges } from "@/features/availability/hooks";
import { todayISO } from "@/lib/dates";
import { cn } from "@/lib/utils";

export function AvailabilityNote({ vehicle, className }: { vehicle: Pick<Vehicle, "slug" | "bookedRanges">; className?: string }) {
  const ranges = useBookedRanges(vehicle);
  const note = availabilityNote(ranges, todayISO());
  const Icon = note.booked ? CalendarX2 : CalendarCheck;
  return (
    <p className={cn("flex items-start gap-1.5 text-xs font-medium", note.booked ? "text-amber-700" : "text-emerald-700", className)}>
      <Icon className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden /> <span>{note.text}</span>
    </p>
  );
}
