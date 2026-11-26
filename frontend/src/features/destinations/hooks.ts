import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, queryKeys } from "@/api";
import { useAdminStore } from "@/store/adminStore";
import type { Destination } from "@/types";

export function useDestinations() {
  return useQuery({
    queryKey: queryKeys.destinations.list(),
    queryFn: () => api.destinations.list(),
    placeholderData: () => structuredClone(useAdminStore.getState().destinations),
  });
}

export function useConfirmedDestinations() {
  const query = useDestinations();
  return {
    ...query,
    data: query.data?.filter((d) => d.confirmed) ?? [],
  };
}

export function useDestination(slug: string) {
  return useQuery({
    queryKey: queryKeys.destinations.detail(slug),
    queryFn: () => api.destinations.get(slug),
    placeholderData: () => structuredClone(useAdminStore.getState().destinations.find((d) => d.slug === slug) ?? null),
    enabled: slug.length > 0,
  });
}

export interface SaveDestinationInput {
  destination: Destination;
  isNew: boolean;
}

export function useSaveDestination() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ destination, isNew }: SaveDestinationInput) =>
      isNew ? api.destinations.create(destination) : api.destinations.update(destination.slug, destination),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.destinations.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
  });
}

export function useDeleteDestination() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => api.destinations.remove(slug),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.destinations.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
  });
}
