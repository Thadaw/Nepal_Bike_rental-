import type { Request, Response } from "express";
import { prisma } from "../config/prisma";

// GET /api/availability
export async function getBlockedRanges(_req: Request, res: Response) {
  try {
    // Fetch manually blocked dates for all vehicles.
    const vehicles = await prisma.vehicle.findMany({
      select: {
        slug: true,
        bookedRanges: true,
      },
    });

    // Fetch only confirmed bookings.
    const confirmedBookings = await prisma.bookingRequest.findMany({
      where: {
        status: "confirmed",
      },
      select: {
        vehicleSlug: true,
        startDate: true,
        returnDate: true,
      },
    });

    const blockedRanges: Record<
      string,
      { start: string; end: string }[]
    > = {};

    // Include manually blocked ranges.
    for (const vehicle of vehicles) {
      const manualRanges = Array.isArray(vehicle.bookedRanges)
        ? vehicle.bookedRanges
        : [];

      blockedRanges[vehicle.slug] = manualRanges.filter(
        (range): range is { start: string; end: string } =>
          typeof range === "object" &&
          range !== null &&
          "start" in range &&
          "end" in range &&
          typeof range.start === "string" &&
          typeof range.end === "string"
      );
    }

    // Include confirmed booking ranges.
    for (const booking of confirmedBookings) {
      const range = {
        start: booking.startDate.toISOString().slice(0, 10),
        end: booking.returnDate.toISOString().slice(0, 10),
      };

      if (!blockedRanges[booking.vehicleSlug]) {
        blockedRanges[booking.vehicleSlug] = [];
      }

      blockedRanges[booking.vehicleSlug].push(range);
    }

    return res.status(200).json({
      success: true,
      data: blockedRanges,
    });
  } catch (error) {
    console.error("Get availability error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch vehicle availability",
    });
  }
}
