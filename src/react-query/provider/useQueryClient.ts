import { useContext } from "react";
import { QueryClientContext } from "./QueryClientProvider";
import type { QueryClient } from "../client/queryClient";

export function useQueryClient(): QueryClient {
  const client = useContext(QueryClientContext);

  if (!client) {
    throw new Error("useQueryClient must be used inside QueryClientProvider");
  }

  return client as QueryClient;

}