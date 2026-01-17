import { createContext } from "react";
import { QueryClient } from "./queryClient";
export const QueryClientContext = createContext<QueryClient | null>(null);

export const QueryClientProvider = ({ children, client }: { children: React.ReactNode; client: QueryClient }) => {
  return (
    <QueryClientContext.Provider value={client}>
      {children}
    </QueryClientContext.Provider>
  );
}