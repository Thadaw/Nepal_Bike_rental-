import { describe, expect, it } from "vitest";
import { calculateQuote, getDiscountPercent } from "./pricing";
import { pricingConfig } from "../config/pricing";
import { rentalDays } from "./dates";

const mustang = { name: "Mustang", offRoad: true, extraChargePerDay: 0, customQuoteOnly: false };
const base = { category: "motorcycle" as const, offRoadEligible: true, tripType: "city" as const, days: 3 };

describe("pricing engine", () => {
  it("city rental = daily rate x days", () => {
    const q = calculateQuote(base);
    expect(q.status).toBe("estimate");
    expect(q.finalTotal).toBe(3000);
  });
  it("eligible off-road = (rate + surcharge) x days", () => {
    const q = calculateQuote({ ...base, tripType: "adventure", destination: mustang });
    expect(q.perDay).toBe(2000);
    expect(q.finalTotal).toBe(6000);
  });
  it("ineligible vehicle on off-road route needs a quotation", () => {
    expect(calculateQuote({ ...base, offRoadEligible: false, tripType: "adventure", destination: mustang }).status).toBe("quote");
  });
  it("car pricing is pending -> quotation, never invented", () => {
    expect(calculateQuote({ ...base, category: "car" }).status).toBe("quote");
  });
  it("adventure without destination is incomplete", () => {
    expect(calculateQuote({ ...base, tripType: "adventure" }).status).toBe("incomplete");
  });
  it("applies configurable discount tiers", () => {
    expect(getDiscountPercent(6, pricingConfig.discountTiers)).toBe(0);
    expect(getDiscountPercent(7, pricingConfig.discountTiers)).toBe(5);
    expect(getDiscountPercent(14, pricingConfig.discountTiers)).toBe(8);
    expect(getDiscountPercent(21, pricingConfig.discountTiers)).toBe(12);
    expect(getDiscountPercent(45, pricingConfig.discountTiers)).toBe(18);
    const q = calculateQuote({ ...base, days: 7 });
    expect([q.originalTotal, q.savings, q.finalTotal]).toEqual([7000, 350, 6650]);
  });
  it("counts rental days with a minimum of one", () => {
    expect(rentalDays("2026-12-01", "2026-12-01")).toBe(1);
    expect(rentalDays("2026-12-01", "2026-12-08")).toBe(7);
    expect(rentalDays("2026-12-08", "2026-12-01")).toBe(0);
  });
});
