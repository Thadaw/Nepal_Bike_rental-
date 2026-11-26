import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, queryKeys } from "@/api";
import { useAdminStore } from "@/store/adminStore";
import type { Vehicle } from "@/types";

export function useVehicles() {
  return useQuery({
    queryKey: queryKeys.vehicles.list(),
    queryFn: () => api.vehicles.list(),
    placeholderData: () => structuredClone(useAdminStore.getState().vehicles),
  });
}

export function useVehicle(slug: string) {
  return useQuery({
    queryKey: queryKeys.vehicles.detail(slug),
    queryFn: () => api.vehicles.get(slug),
    placeholderData: () => structuredClone(useAdminStore.getState().vehicles.find((v) => v.slug === slug) ?? null),
    enabled: slug.length > 0,
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vehicle: Vehicle) => api.vehicles.create(vehicle),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, patch }: { slug: string; patch: Partial<Vehicle> }) => api.vehicles.update(slug, patch),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
  });
}

export interface SaveVehicleInput {
  vehicle: Vehicle;
  isNew: boolean;
}

export function useSaveVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ vehicle, isNew }: SaveVehicleInput) =>
      isNew ? api.vehicles.create(vehicle) : api.vehicles.update(vehicle.slug, vehicle),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => api.vehicles.remove(slug),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
  });
}
