// Pure helpers for "Booked 5-8 Dec" notes and date clashes. ISO dates compare correctly as strings.
export interface BookedRange { start: string; end: string }

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const part = (iso: string) => { const [y, m, d] = iso.split("-").map(Number); return { y, m: m - 1, d }; };

/** "5–8 Dec", "28 Nov–2 Dec", "5 Dec". Adds the year only when the range crosses years. */
export function formatBookedRange(r: BookedRange): string {
  const a = part(r.start);
  const b = part(r.end);
  if (r.start === r.end) return `${a.d} ${MONTHS[a.m]}`;
  if (a.y !== b.y) return `${a.d} ${MONTHS[a.m]} ${a.y}–${b.d} ${MONTHS[b.m]} ${b.y}`;
  if (a.m === b.m) return `${a.d}–${b.d} ${MONTHS[b.m]}`;
  return `${a.d} ${MONTHS[a.m]}–${b.d} ${MONTHS[b.m]}`;
}

/** Ranges that have not ended yet, soonest first. */
export function upcomingRanges(ranges: BookedRange[] | undefined, today: string): BookedRange[] {
  return (ranges ?? []).filter((r) => r.start && r.end && r.end >= today).sort((x, y) => x.start.localeCompare(y.start));
}

export function availabilityNote(ranges: BookedRange[] | undefined, today: string, max = 3): { booked: boolean; text: string } {
  const list = upcomingRanges(ranges, today);
  if (list.length === 0) return { booked: false, text: "Free on all dates" };
  const shown = list.slice(0, max).map(formatBookedRange).join(", ");
  return { booked: true, text: `Booked ${shown}${list.length > max ? ` +${list.length - max} more` : ""}` };
}

/** The first booked range that overlaps the requested dates, if any. */
export function findClash(start: string, end: string, ranges: BookedRange[] | undefined): BookedRange | null {
  if (!start || !end) return null;
  return (ranges ?? []).find((r) => start <= r.end && end >= r.start) ?? null;
}

/** Admin text format: one "YYYY-MM-DD to YYYY-MM-DD" per line. */
export function parseRanges(text: string): BookedRange[] {
  return text.split(/\n/).map((line) => line.match(/(\d{4}-\d{2}-\d{2})\s*(?:to|-|–)?\s*(\d{4}-\d{2}-\d{2})?/)).filter((m): m is RegExpMatchArray => !!m)
    .map((m) => ({ start: m[1], end: m[2] ?? m[1] })).filter((r) => r.end >= r.start);
}
export const rangesToText = (ranges: BookedRange[] | undefined) => (ranges ?? []).map((r) => `${r.start} to ${r.end}`).join("\n");

/** Joins several range lists, drops exact duplicates and sorts by start date. */
export function mergeRanges(...lists: (BookedRange[] | undefined)[]): BookedRange[] {
  const seen = new Set<string>();
  const out: BookedRange[] = [];
  for (const list of lists) for (const r of list ?? []) {
    const k = `${r.start}|${r.end}`;
    if (r.start && r.end && !seen.has(k)) { seen.add(k); out.push(r); }
  }
  return out.sort((a, b) => a.start.localeCompare(b.start));
}

export const isDayBooked = (iso: string, ranges: BookedRange[] | undefined) => (ranges ?? []).some((r) => iso >= r.start && iso <= r.end);

/**
 * Calendar click logic. First click (or a click on/before the start, or after a full range) picks the pickup day.
 * The next click picks the return day, unless a booked day sits in between: then it restarts from the clicked day.
 */
export function pickDate(clicked: string, start: string, end: string, ranges: BookedRange[] | undefined): { start: string; end: string; clashed: boolean } {
  if (!start || end || clicked <= start) return { start: clicked, end: "", clashed: false };
  if (findClash(start, clicked, ranges)) return { start: clicked, end: "", clashed: true };
  return { start, end: clicked, clashed: false };
}
