import { QueryClient } from "@tanstack/react-query";

// shared QueryClient instance used by both the Admin component and the auth
// provider (allows auth provider to invalidate permissions cache after
// checkAuth populates local storage)
export const queryClient = new QueryClient();
