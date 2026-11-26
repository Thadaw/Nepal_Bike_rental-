import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, queryKeys } from "@/api";
import type { CreateBookingInput, UpdateBookingStatusInput } from "@/features/bookings/types";
import { useAdminStore } from "@/store/adminStore";

export function useBookingRequests() {
  return useQuery({
    queryKey: queryKeys.bookings.list(),
    queryFn: () => api.bookings.list(),
    placeholderData: () => structuredClone(useAdminStore.getState().requests),
  });
}

function invalidateBookings(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.availability.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.destinations.all });
}

export function useCreateBookingRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBookingInput) => api.bookings.create(input),
    onSuccess: () => invalidateBookings(queryClient),
  });
}

export function useUpdateBookingRequestStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateBookingStatusInput) => api.bookings.updateStatus(input),
    onSuccess: () => invalidateBookings(queryClient),
  });
}

export function useIssueReviewKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.bookings.issueReviewKey(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all }),
  });
}

export function useDeleteBookingRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.bookings.remove(id),
    onSuccess: () => invalidateBookings(queryClient),
  });
}
