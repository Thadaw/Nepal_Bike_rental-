import { describe, expect, it } from "vitest";
import { buildBookingMessage, buildInquiryMessage, buildWhatsAppUrl, bookingCategoryLabel } from "./whatsapp";
import { isWhatsAppConfigured, whatsappDigits } from "../config/shop";
import { calculateQuote, emptyQuote } from "./pricing";

const baseBooking = {
  vehicleName: "Adventure Motorcycle",
  category: "Bike",
  customerName: "Customer Name",
  phone: "98XXXXXXXX",
  startDate: "2026-12-01",
  returnDate: "2026-12-03",
  tripType: "city" as const,
  destinationName: "Pokhara to Mustang",
};

describe("WhatsApp utilities", () => {
  it("encodes the message for the supplied WhatsApp digits", () => {
    expect(buildWhatsAppUrl("Hello there", "9779800000000")).toBe("https://wa.me/9779800000000?text=Hello%20there");
  });

  it("returns null for an empty message or missing digits", () => {
    expect(buildWhatsAppUrl("Hello there", "")).toBeNull();
    expect(buildWhatsAppUrl("   ", "9779800000000")).toBeNull();
  });

  it("normalizes the number configured through .env", () => {
    const configured = (import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined)?.trim() || "";
    if (!configured) {
      expect(isWhatsAppConfigured).toBe(false);
      return;
    }
    expect(whatsappDigits).toBe(configured.replace(/[\s()-]/g, "").replace(/^\+/, ""));
    expect(isWhatsAppConfigured).toBe(true);
  });

  it("builds a general inquiry with the single-shop collection rule", () => {
    const message = buildInquiryMessage({ vehicleName: "City Scooty" });
    expect(message).toContain("Vehicle: City Scooty");
    expect(message).toContain("Nepal Bike Rental Shop, Amarsingh Chowk, Pokhara, Nepal");
  });

  it("maps vehicle categories to customer-facing booking labels", () => {
    expect(bookingCategoryLabel("motorcycle")).toBe("Bike");
    expect(bookingCategoryLabel("car")).toBe("Car");
    expect(bookingCategoryLabel(undefined)).toBe("Not selected");
  });

  it("includes bike booking details, dates, duration, customer and shop in one message", () => {
    const message = buildBookingMessage(baseBooking);
    expect(message).toContain("BOOKING DETAILS");
    expect(message).toContain("Vehicle: Adventure Motorcycle");
    expect(message).toContain("Category: Bike");
    expect(message).toContain("Pickup Date: 2026-12-01");
    expect(message).toContain("Return Date: 2026-12-03");
    expect(message).toContain("Duration: 2 days");
    expect(message).toContain("Destination: Pokhara to Mustang");
    expect(message).toContain("CUSTOMER DETAILS");
    expect(message).toContain("Name: Customer Name");
    expect(message).toContain("Phone: 98XXXXXXXX");
    expect(message).toContain("PICKUP & RETURN");
    expect(message).toContain("Pickup: Nepal Bike Rental Shop, Amarsingh Chowk, Pokhara, Nepal");
    expect(message).toContain("Return: Nepal Bike Rental Shop, Amarsingh Chowk, Pokhara, Nepal");
    expect(message).toContain("Thank you!");
  });

  it("uses a verified estimate only with an explicit not-confirmed note", () => {
    const quote = calculateQuote({ category: "motorcycle", baseDailyRate: 1000, offRoadEligible: false, tripType: "city", days: 2 });
    const message = buildBookingMessage({ ...baseBooking, quote });
    expect(message).toContain("Estimated amount: रु. 2,000 (estimate, not confirmed)");
    expect(message).toContain("Please confirm availability and final rental pricing.");
  });

  it("asks for a price instead of inventing one for car custom quotations", () => {
    const message = buildBookingMessage({ ...baseBooking, category: "Car", vehicleName: "Compact SUV", quote: emptyQuote("quote", "Custom quotation", 2) });
    expect(message).toContain("Pricing: please confirm the final rental price.");
    expect(message).not.toContain("Estimated amount:");
  });
});
