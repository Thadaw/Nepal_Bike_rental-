import type { PublicReview } from "./types";

export function summarize(reviews: Pick<PublicReview, "rating">[]): { count: number; average: number } {
  if (reviews.length === 0) return { count: 0, average: 0 };
  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  return { count: reviews.length, average: Math.round((total / reviews.length) * 10) / 10 };
}
