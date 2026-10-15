import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";

import { apiError, useApi } from "./api.tsx";

/**
 * Ends the session at the API, and only then forgets it here. A failed request keeps the user
 * signed in (the cookie is still valid), so the caller shows the error instead of pretending.
 */
export function useSignOut() {
  const api = useApi();
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: async () => {
      const { response, error } = await api.POST("/v1/auth/sign-out");
      // 401: the session had already ended, which is what signing out wants.
      if (!response.ok && response.status !== 401) throw apiError(response, error);
    },
    onSuccess: async () => {
      queryClient.clear();
      await router.navigate({ to: "/sign-in" });
    },
  });
}
