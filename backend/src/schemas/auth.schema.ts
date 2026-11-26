import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .transform((value) => value.toLowerCase().trim()),

  password: z
    .string()
    .min(1, "Password is required")
    .max(128, "Password is too long"),
});

export type LoginInput = z.infer<typeof loginSchema>;
