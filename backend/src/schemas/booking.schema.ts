import { z } from "zod";

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must use YYYY-MM-DD format")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return (
      !Number.isNaN(date.getTime()) &&
      date.toISOString().slice(0, 10) === value
    );
  }, "Invalid calendar date");

export const createBookingSchema = z.object({
  reference: z.string().trim().min(1).max(50).optional(),

  source: z.enum(["website", "whatsapp"]).default("website"),

  pickupTime: z.string().trim().max(50).optional(),

  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(7).max(30),
  email: z.string().trim().email().max(254).or(z.literal("")).default(""),

  vehicleSlug: z.string().trim().min(1),

  startDate: dateSchema,
  returnDate: dateSchema,

  tripType: z.enum(["city", "adventure"]),
  destination: z.string().trim().min(1).max(150),

  message: z.string().trim().max(2000).default(""),

  days: z.number().int().positive().max(365),

  estimateStatus: z.enum(["estimate", "quote", "incomplete"]),
  estimateTotal: z.number().nonnegative().max(999999999),
}).refine(
  (booking) => booking.returnDate >= booking.startDate,
  {
    message: "Return date must be on or after the start date",
    path: ["returnDate"],
  }
);

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export const updateBookingStatusSchema = z.object({
  status: z.enum(["new", "confirmed", "declined", "completed"]),
});

export type UpdateBookingStatusInput = z.infer<
  typeof updateBookingStatusSchema
>;
