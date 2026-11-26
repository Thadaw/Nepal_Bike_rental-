import type { Request, Response } from "express";
import { prisma } from "../config/prisma";
import {
  vehicleSchema,
  updateVehicleSchema,
} from "../schemas/vehicle.schema";

// Extract and validate the vehicle slug from request parameters.
function getSlug(req: Request): string | null {
  const slug = req.params.slug;
  return typeof slug === "string" ? slug : null;
}

// GET /api/vehicles
export async function getVehicles(_req: Request, res: Response) {
  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      data: vehicles,
    });
  } catch (error) {
    console.error("Get vehicles error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch vehicles",
    });
  }
}

// GET /api/vehicles/:slug
export async function getVehicleBySlug(req: Request, res: Response) {
  try {
    const slug = getSlug(req);

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Invalid vehicle slug",
      });
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: { slug },
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    console.error("Get vehicle error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch vehicle",
    });
  }
}

// POST /api/vehicles
export async function createVehicle(req: Request, res: Response) {
  try {
    const parsed = vehicleSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid vehicle details",
        errors: parsed.error.issues,
      });
    }

    const existing = await prisma.vehicle.findUnique({
      where: { slug: parsed.data.slug },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "A vehicle with this slug already exists",
      });
    }

    const vehicle = await prisma.vehicle.create({
      data: parsed.data,
    });

    return res.status(201).json({
      success: true,
      message: "Vehicle created successfully",
      data: vehicle,
    });
  } catch (error) {
    console.error("Create vehicle error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create vehicle",
    });
  }
}

// PATCH /api/vehicles/:slug
export async function updateVehicle(req: Request, res: Response) {
  try {
    const slug = getSlug(req);

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Invalid vehicle slug",
      });
    }

    const parsed = updateVehicleSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid vehicle details",
        errors: parsed.error.issues,
      });
    }

    const existing = await prisma.vehicle.findUnique({
      where: { slug },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    const vehicle = await prisma.vehicle.update({
      where: { slug },
      data: parsed.data,
    });

    return res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      data: vehicle,
    });
  } catch (error) {
    console.error("Update vehicle error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update vehicle",
    });
  }
}

// DELETE /api/vehicles/:slug
export async function deleteVehicle(req: Request, res: Response) {
  try {
    const slug = getSlug(req);

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Invalid vehicle slug",
      });
    }

    const existing = await prisma.vehicle.findUnique({
      where: { slug },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    await prisma.vehicle.delete({
      where: { slug },
    });

    return res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully",
    });
  } catch (error) {
    console.error("Delete vehicle error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete vehicle. It may have existing bookings.",
    });
  }
}
