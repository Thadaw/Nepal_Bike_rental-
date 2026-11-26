/** Digits for a wa.me link. Adds Nepal's 977 to local numbers such as 98XXXXXXXX or 098XXXXXXXX. */
export function toWhatsAppDigits(phone: string): string {
  let d = phone.replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.length === 10 && d.startsWith("9")) d = `977${d}`;
  else if (d.length === 11 && d.startsWith("09")) d = `977${d.slice(1)}`;
  return d;
}
