/** One CSV cell. Quotes values with commas, quotes or line breaks, and defuses spreadsheet formulas (=, +, -, @). */
export function csvCell(value: unknown): string {
  let s = value === null || value === undefined ? "" : String(value);
  // Plain numbers and phone numbers (+977 98..., 98-...) are safe; anything else starting with a formula character is not.
  if (/^[=+\-@\t\r]/.test(s) && !/^[+-]?\d[\d\s().-]*$/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(header: string[], rows: unknown[][]): string {
  return [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
}

/** Starts a download. The BOM makes Excel read the file as UTF-8. */
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
