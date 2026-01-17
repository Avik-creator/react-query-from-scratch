import { useEffect, useMemo, useSyncExternalStore } from "react";
import type { QueryOptions, QueryState } from "./types/query";
import { useQueryClient } from "./provider/useQueryClient";

type UseQueryResult<TData, TError> = QueryState<TData, TError> & {
  refetch: () => Promise<void>;
};

export function useQuery<TData, TError = unknown>(
  options: QueryOptions<TData>
): UseQueryResult<TData, TError> {
  const client = useQueryClient();

  const query = useMemo(() => {
    return client.ensureQuery(options);
  }, [client, options.queryKey]);

  const state = useSyncExternalStore(
    query.subscribe,
    () => query.state,
    () => query.state
  );

  useEffect(() => {
    let cancelled = false;

    const maybeFetch = async () => {
      // if already fetching, let dedupe handle it
      if (query.state.isFetching) return;

      // Only fetch if stale OR never fetched
      if (query.state.status === "idle" || query.isStale()) {
        try {
          await query.fetch();
        } catch {
          // query.fetch already sets error state
        }
      }
    };

    // avoid double fetch in strict mode by relying on dedupe
    maybeFetch();

    return () => {
      cancelled = true;
      void cancelled;

      // schedule garbage collection cleanup for unused queries
      client.gc();
    };
  }, [client, query]);

  return {
    ...state,
    refetch: query.fetch,
  } as UseQueryResult<TData, TError>;
}