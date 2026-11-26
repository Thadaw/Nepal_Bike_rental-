import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, queryKeys } from "@/api";
import { useAdminStore } from "@/store/adminStore";
import type { PricingConfig } from "@/config/pricing";

export function usePricing() {
  return useQuery({
    queryKey: queryKeys.pricing.detail(),
    queryFn: () => api.pricing.get(),
    placeholderData: () => structuredClone(useAdminStore.getState().pricing),
  });
}

export function useUpdatePricing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pricing: PricingConfig) => api.pricing.update(pricing),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.pricing.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
  });
}
