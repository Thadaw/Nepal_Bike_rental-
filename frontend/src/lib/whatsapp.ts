import { isWhatsAppConfigured, shop, whatsappDigits } from "@/config/shop";
import { formatNpr, type Quote } from "@/lib/pricing";
import { formatDate, rentalDays } from "@/lib/dates";
import type { TripType, VehicleCategory } from "@/types";

export interface InquiryContext {
  vehicleName?: string;
  startDate?: string;
  returnDate?: string;
  tripType?: TripType;
  destinationName?: string;
  quote?: Quote;
  reference?: string;
}

export interface BookingMessageInput {
  vehicleName: string;
  category: string;
  customerName: string;
  phone: string;
  startDate: string;
  returnDate: string;
  tripType: TripType;
  days?: number;
  destinationName?: string;
  extraMessage?: string;
  quote?: Quote;
  reference?: string;
  pickupTime?: string;
}

export function buildInquiryMessage(c: InquiryContext = {}): string {
  const lines = [`Hello ${shop.name}, I would like to ask about a rental.`];
  if (c.reference) lines.push(`Reference: ${c.reference}`);
  if (c.vehicleName) lines.push(`Vehicle: ${c.vehicleName}`);
  if (c.startDate && c.returnDate) lines.push(`Dates: ${formatDate(c.startDate)} to ${formatDate(c.returnDate)}`);
  if (c.quote && c.quote.days > 0) lines.push(`Duration: ${c.quote.days} day${c.quote.days > 1 ? "s" : ""}`);
  if (c.tripType) lines.push(`Trip type: ${c.tripType === "adventure" ? "Adventure trip" : "City rental"}`);
  if (c.destinationName && c.tripType === "adventure") lines.push(`Destination: ${c.destinationName}`);
  if (c.quote?.status === "estimate") lines.push(`Estimated amount: ${formatNpr(c.quote.finalTotal)} (estimate, not confirmed)`);
  else if (c.quote?.status === "quote") lines.push("Estimated amount: custom quotation requested");
  lines.push(`Collection and return: ${shop.name} Shop, ${shop.addressOneLine}.`);
  lines.push("Please confirm availability. Thank you.");
  return lines.join("\n");
}

/** Customer-facing category wording used in WhatsApp booking messages. */
export function bookingCategoryLabel(category?: VehicleCategory): string {
  if (category === "motorcycle") return "Bike";
  if (category === "car") return "Car";
  if (category === "jeep") return "Jeep";
  if (category === "scooty") return "Scooty";
  return "Not selected";
}

/** Builds the professional Click-to-Chat booking inquiry. Never invents a price. */
export function buildBookingMessage(input: BookingMessageInput): string {
  const days = input.days && input.days > 0 ? input.days : rentalDays(input.startDate, input.returnDate);
  const shopLine = `${shop.name} Shop, ${shop.addressOneLine}`;
  const lines = [
    `Hello ${shop.name}!`,
    "",
    "I would like to book a rental.",
    "",
    ...(input.reference ? [`Reference: ${input.reference}`, ""] : []),
    "BOOKING DETAILS",
    `Vehicle: ${input.vehicleName.trim() || "Not selected"}`,
    `Category: ${input.category.trim() || "Not selected"}`,
    `Pickup Date: ${input.startDate || "Not selected"}`,
    ...(input.pickupTime ? [`Pickup Time: ${input.pickupTime}`] : []),
    `Return Date: ${input.returnDate || "Not selected"}`,
    `Duration: ${days > 0 ? `${days} day${days > 1 ? "s" : ""}` : "Not calculated"}`,
    ...(input.tripType === "adventure" ? ["Trip Type: Adventure trip"] : []),
    ...(input.destinationName?.trim() ? [`Destination: ${input.destinationName.trim()}`] : []),
    "",
    "CUSTOMER DETAILS",
    `Name: ${input.customerName.trim() || "Not provided"}`,
    `Phone: ${input.phone.trim() || "Not provided"}`,
    "",
    "PICKUP & RETURN",
    `Pickup: ${shopLine}`,
    `Return: ${shopLine}`,
    "",
    input.quote?.status === "estimate"
      ? `Estimated amount: ${formatNpr(input.quote.finalTotal)} (estimate, not confirmed)`
      : "Pricing: please confirm the final rental price.",
    "",
    "Please confirm availability and final rental pricing.",
  ];

  const extra = input.extraMessage?.trim();
  if (extra) lines.push("", "ADDITIONAL MESSAGE", extra);
  lines.push("", "Thank you!");
  return lines.join("\n");
}

/** Returns null until a real number is configured, or when given empty digits. */
export function buildWhatsAppUrl(message: string, digits?: string): string | null {
  const target = digits ?? (isWhatsAppConfigured ? whatsappDigits : "");
  if (!message.trim() || !target) return null;
  return `https://wa.me/${target}?text=${encodeURIComponent(message)}`;
}

/** Link the shop sends after a rental is completed. The key makes it usable only by that customer. */
export function buildReviewLink(origin: string, reference: string, key: string): string {
  return `${origin.replace(/\/+$/, "")}/review?ref=${encodeURIComponent(reference)}&key=${encodeURIComponent(key)}`;
}

export function buildReviewRequestMessage(input: { customerName: string; vehicleName: string; link: string }): string {
  return [
    `Hello ${input.customerName.trim() || "there"}!`,
    "",
    `Thank you for riding with ${shop.name}. We hope you enjoyed the ${input.vehicleName}.`,
    "",
    "Could you share a quick review? It takes one minute:",
    input.link,
    "",
    "This link is only for you. Thank you!",
  ].join("\n");
}
