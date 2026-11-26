import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/auth.routes";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import vehicleRoutes from "./routes/vehicle.routes";
import bookingRoutes from "./routes/booking.routes";
import availabilityRoutes from "./routes/availability.routes";

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

// Request parsing
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Swagger API documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Authentication routes
app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/booking-requests", bookingRoutes);
app.use("/api/availability", availabilityRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Nepal Bike Rental API is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});

// Global error handler
app.use(
  (
    error: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
);

export default app;
