import type { Request, Response } from "express";
import { randomBytes } from "node:crypto";
import { prisma } from "../config/prisma";
import { createBookingSchema } from "../schemas/booking.schema";

// Convert YYYY-MM-DD into UTC midnight.
function toUtcDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

// Calculate rental days using calendar dates.
function calculateRentalDays(start: Date, end: Date): number {
  return Math.round(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;
}

// Generate a booking reference.
function generateBookingReference(): string {
  return `NBR-${randomBytes(4).toString("hex").toUpperCase()}`;
}

// POST /api/booking-requests
export async function createBooking(req: Request, res: Response) {
  try {
    const parsed = createBookingSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking details",
        errors: parsed.error.issues,
      });
    }

    const input = parsed.data;

    const vehicle = await prisma.vehicle.findUnique({
      where: { slug: input.vehicleSlug },
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Selected vehicle not found",
      });
    }

    const startDate = toUtcDate(input.startDate);
    const returnDate = toUtcDate(input.returnDate);

    const days = calculateRentalDays(startDate, returnDate);

    if (days < 1 || days > 365) {
      return res.status(400).json({
        success: false,
        message: "Invalid rental duration",
      });
    }

    const reference = input.reference || generateBookingReference();

    const booking = await prisma.bookingRequest.create({
      data: {
        reference,
        source: input.source,
        pickupTime: input.pickupTime || null,
        name: input.name,
        phone: input.phone,
        email: input.email,
        vehicleSlug: input.vehicleSlug,
        startDate,
        returnDate,
        tripType: input.tripType,
        destination: input.destination,
        message: input.message,
        days,
        estimateStatus: input.estimateStatus,
        estimateTotal: input.estimateTotal,
        status: "new",
      },
    });

    return res.status(201).json({
      success: true,
      message: "Booking request submitted successfully",
      data: {
        reference: booking.reference,
        status: "awaiting_confirmation",
      },
    });
  } catch (error) {
    console.error("Create booking error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to submit booking request",
    });
  }
}


// GET /api/booking-requests
export async function getBookings(_req: Request, res: Response) {
  try {
    const bookings = await prisma.bookingRequest.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        vehicle: {
          select: {
            name: true,
            slug: true,
            category: true,
          },
        },
        payments: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("Get bookings error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch bookings",
    });
  }
}


import { updateBookingStatusSchema } from "../schemas/booking.schema";

// PATCH /api/booking-requests/:id
export async function updateBookingStatus(req: Request, res: Response) {
  try {
    const id = req.params.id;

    if (typeof id !== "string" || !id) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const parsed = updateBookingStatusSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status",
        errors: parsed.error.issues,
      });
    }

    const existing = await prisma.bookingRequest.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const { status } = parsed.data;

    if (status === "confirmed") {
      const conflict = await prisma.bookingRequest.findFirst({
        where: {
          vehicleSlug: existing.vehicleSlug,
          id: { not: id },
          status: "confirmed",
          startDate: { lte: existing.returnDate },
          returnDate: { gte: existing.startDate },
        },
      });

      if (conflict) {
        return res.status(409).json({
          success: false,
          message: "This vehicle already has a confirmed booking during these dates",
        });
      }
    }

    const booking = await prisma.bookingRequest.update({
      where: { id },
      data: { status },
    });

    return res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Update booking status error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update booking status",
    });
  }
}


// DELETE /api/booking-requests/:id
export async function deleteBooking(req: Request, res: Response) {
  try {
    const id = req.params.id;

    if (typeof id !== "string" || !id) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const existing = await prisma.bookingRequest.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    await prisma.bookingRequest.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    console.error("Delete booking error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete booking",
    });
  }
}
