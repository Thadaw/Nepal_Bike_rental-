import { Router } from "express";
import {
  getVehicles,
  getVehicleBySlug,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from "../controllers/vehicle.controller";
import { authenticateAdmin } from "../middleware/auth.middleware";

const router = Router();

// Public routes
router.get("/", getVehicles);
router.get("/:slug", getVehicleBySlug);

// Admin-only routes
router.post("/", authenticateAdmin, createVehicle);
router.patch("/:slug", authenticateAdmin, updateVehicle);
router.delete("/:slug", authenticateAdmin, deleteVehicle);

export default router;
