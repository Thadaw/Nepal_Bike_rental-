import { Router } from "express";
import { getBlockedRanges } from "../controllers/availability.controller";

const router = Router();

// Public: fetch blocked dates for all vehicles.
router.get("/", getBlockedRanges);

export default router;
