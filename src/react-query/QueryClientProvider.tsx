import { createContext } from "react";

export const QueryClientContext = createContext(null);

export const QueryClientProvider = ({ children, client }: { children: React.ReactNode; client: any }) => {
  return (
    <QueryClientContext.Provider value={client}>
      {children}
    </QueryClientContext.Provider>
  );
}