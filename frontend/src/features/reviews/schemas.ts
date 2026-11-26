import { z } from "zod";

export const reviewSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(60, "Keep your name under 60 characters."),
  rating: z.number({ invalid_type_error: "Choose a star rating." }).int().min(1, "Choose a star rating.").max(5),
  comment: z.string().trim().min(10, "Tell us a little more (at least 10 characters).").max(600, "Keep it under 600 characters."),
});

export type ReviewFormValues = z.infer<typeof reviewSchema>;
