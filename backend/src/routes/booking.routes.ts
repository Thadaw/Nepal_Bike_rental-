import { Router } from "express";
import {
  createBooking,
  getBookings,
  updateBookingStatus,
  deleteBooking,
} from "../controllers/booking.controller";
import { authenticateAdmin } from "../middleware/auth.middleware";

const router = Router();

// Public: guests can submit booking requests.
router.post("/", createBooking);

// Admin only: manage booking requests.
router.get("/", authenticateAdmin, getBookings);
router.patch("/:id", authenticateAdmin, updateBookingStatus);
router.delete("/:id", authenticateAdmin, deleteBooking);

export default router;

