import React from "react";
import { renderHook as rtlRenderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

export function renderHookWithQuery<Result, Props>(
  renderCallback: (props: Props) => Result,
  options?: any,
) {
  const queryClient = createTestQueryClient();

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return {
    queryClient,
    ...rtlRenderHook(renderCallback, { wrapper, ...options }),
  };
}
