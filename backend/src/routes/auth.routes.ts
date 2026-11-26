import { Router } from "express";
import { loginAdmin } from "../controllers/auth.controller";
import { authenticateAdmin, type AuthenticatedRequest } from "../middleware/auth.middleware";

const router = Router();

// Admin login
router.post("/login", loginAdmin);

// Verify logged-in admin
router.get("/me", authenticateAdmin, (req: AuthenticatedRequest, res) => {
  return res.status(200).json({
    success: true,
    message: "Authenticated successfully",
    data: {
      admin: req.admin,
    },
  });
});

export default router;
