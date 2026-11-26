// Month grid helpers. Dates are plain YYYY-MM-DD strings; no time zones involved.
const pad = (n: number) => `${n}`.padStart(2, "0");
export const isoOf = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

export const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** Cells for one month, Sunday first. null = blank cell before the 1st / after the last day. */
export function monthCells(y: number, m: number): (string | null)[] {
  const first = new Date(Date.UTC(y, m, 1)).getUTCDay();
  const days = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const cells: (string | null)[] = Array(first).fill(null);
  for (let d = 1; d <= days; d++) cells.push(isoOf(y, m, d));
  while (cells.length % 7) cells.push(null);
  return cells;
}

export function shiftMonth(y: number, m: number, by: number): { y: number; m: number } {
  const t = y * 12 + m + by;
  return { y: Math.floor(t / 12), m: ((t % 12) + 12) % 12 };
}
