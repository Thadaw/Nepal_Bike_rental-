import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";

export function useResetCatalog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.catalog.reset(),
    onSuccess: () => {
      void queryClient.invalidateQueries();
    },
  });
}
