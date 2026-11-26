import { z } from "zod";

const phone = z.string().trim().regex(/^\+?[\d\s-]{7,18}$/, "Enter a valid phone number, e.g. +977 98XXXXXXXX.");
const dates = {
  startDate: z.string().min(1, "Choose a start date."),
  returnDate: z.string().min(1, "Choose a return date."),
};

export const bookingSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name."),
    phone,
    email: z.string().trim().email("Enter a valid email address.").or(z.literal("")),
    vehicleSlug: z.string().min(1, "Choose a vehicle."),
    ...dates,
    tripType: z.enum(["city", "adventure"]),
    destination: z.string(),
    pickupTime: z.string().optional(),
    message: z.string().max(600, "Keep the message under 600 characters.").optional(),
    terms: z.literal(true, { errorMap: () => ({ message: "Please accept to continue." }) }),
  })
  .superRefine((v, ctx) => {
    if (v.startDate && v.returnDate && v.returnDate <= v.startDate)
      ctx.addIssue({ code: "custom", path: ["returnDate"], message: "Return date must be after the start date." });
    if (v.tripType === "adventure" && !v.destination)
      ctx.addIssue({ code: "custom", path: ["destination"], message: "Choose a destination for an adventure trip." });
  });

export type BookingFormValues = z.infer<typeof bookingSchema>;

/** Required fields for the WhatsApp booking CTA. Terms and email are not needed for a chat inquiry. */
export const whatsappBookingSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name."),
    phone,
    vehicleName: z.string().min(1, "Choose a vehicle."),
    ...dates,
    tripType: z.enum(["city", "adventure"]),
    destinationName: z.string(),
  })
  .superRefine((v, ctx) => {
    if (v.startDate && v.returnDate && v.returnDate <= v.startDate)
      ctx.addIssue({ code: "custom", path: ["returnDate"], message: "Return date must be after the start date." });
    if (v.tripType === "adventure" && !v.destinationName.trim())
      ctx.addIssue({ code: "custom", path: ["destinationName"], message: "Choose a destination for an adventure trip." });
  });

export type WhatsAppBookingValues = z.infer<typeof whatsappBookingSchema>;
