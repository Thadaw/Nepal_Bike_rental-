import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma";
import { loginSchema } from "../schemas/auth.schema";

export async function loginAdmin(req: Request, res: Response) {
  try {
    // Validate login input
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid login details",
        errors: parsed.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const { email, password } = parsed.data;

    // Find admin
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Verify password
    const passwordMatches = await bcrypt.compare(
      password,
      admin.passwordHash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT
    const secret = process.env.JWT_ACCESS_SECRET;

    if (!secret) {
      throw new Error("JWT_ACCESS_SECRET is missing");
    }

    const expiresIn = process.env.JWT_EXPIRES_IN || "1h";

    const accessToken = jwt.sign(
      {
        adminId: admin.id,
        email: admin.email,
      },
      secret,
      {
        expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
      }
    );

    // Update last login
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
        },
        accessToken,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to process login",
    });
  }
}
