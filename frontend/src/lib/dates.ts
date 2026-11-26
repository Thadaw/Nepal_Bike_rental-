const DAY = 86_400_000;

function parse(iso: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const t = Date.parse(`${iso}T00:00:00Z`);
  return Number.isNaN(t) ? null : t;
}

/** Local calendar date as YYYY-MM-DD. */
export function todayISO(): string {
  const d = new Date();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function addDaysISO(iso: string, days: number): string {
  const t = parse(iso);
  if (t === null) return iso;
  return new Date(t + days * DAY).toISOString().slice(0, 10);
}

/** Rental days = return date minus start date, minimum 1 day. Returns 0 if dates are missing/invalid. */
export function rentalDays(start: string, end: string): number {
  const a = parse(start);
  const b = parse(end);
  if (a === null || b === null || b < a) return 0;
  return Math.max(1, Math.round((b - a) / DAY));
}

export function formatDate(iso: string): string {
  const t = parse(iso);
  if (t === null) return "";
  return new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

/** Short, readable booking reference (no look-alike characters). */
export function makeReference(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `TR-${out}`;
}

/** Pickup times offered in the booking form. The shop confirms the exact time. */
export const pickupTimes = ["07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
