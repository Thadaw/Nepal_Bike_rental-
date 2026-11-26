import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, queryKeys } from "@/api";
import { useAdminStore } from "@/store/adminStore";
import type { PublicReview, ReviewStatus, SubmitReviewInput } from "./types";

export function usePublicReviews() {
  return useQuery({
    queryKey: queryKeys.reviews.public(),
    queryFn: () => api.reviews.listPublic(),
    placeholderData: (): PublicReview[] =>
      useAdminStore.getState().reviews.filter((r) => r.status === "approved").map(({ reference: _r, status: _s, ...rest }) => { void _r; void _s; return rest; }),
  });
}

export function useAdminReviews() {
  return useQuery({
    queryKey: queryKeys.reviews.admin(),
    queryFn: () => api.reviews.list(),
    placeholderData: () => structuredClone(useAdminStore.getState().reviews),
  });
}

/** Checks the link from the shop. No placeholder data, so an invalid link never flashes a form. */
export function useReviewLink(reference: string, key: string) {
  return useQuery({
    queryKey: queryKeys.reviews.link(reference, key),
    queryFn: () => api.reviews.getLink(reference, key),
    enabled: reference.length > 0 && key.length > 0,
    retry: false,
    staleTime: Infinity,
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SubmitReviewInput) => api.reviews.submit(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.reviews.admin() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.reviews.public() });
    },
  });
}

export function useUpdateReviewStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; status: ReviewStatus }) => api.reviews.updateStatus(input),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all }),
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.reviews.remove(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all }),
  });
}
