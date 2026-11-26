import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  admin?: {
    adminId: string;
    email: string;
  };
}

interface AccessTokenPayload {
  adminId: string;
  email: string;
}

export function authenticateAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const token = authorization.split(" ")[1];
    const secret = process.env.JWT_ACCESS_SECRET;

    if (!secret) {
      throw new Error("JWT_ACCESS_SECRET is missing");
    }

    const decoded = jwt.verify(token, secret);

    if (
      typeof decoded === "string" ||
      !decoded.adminId ||
      !decoded.email
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }

    const payload = decoded as AccessTokenPayload;

    req.admin = {
      adminId: payload.adminId,
      email: payload.email,
    };

    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token",
    });
  }
}
