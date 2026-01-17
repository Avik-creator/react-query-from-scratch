import type { Query, QueryOptions, QueryState, Subscriber } from './types/query.ts';

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const defaultRetryDelay = (attempt: number) =>
  Math.min(1000 * 2 ** (attempt - 1), 30_000);

const normalizeRetry = (retry: number | boolean) => {
  if (retry === true) return 3;
  if (retry === false) return 0;
  return retry;
};

export const createQuery = <TData, TError = unknown>(
  options: QueryOptions<TData>
): Query<TData, TError> => {
  const {
    queryKey,
    queryFn,
    staleTime = 0,
    cacheTime = 5 * 60_000,
    retry = 3,
    retryDelay = defaultRetryDelay,
  } = options;

  const subscribers: Subscriber[] = [];

  let state: QueryState<TData, TError> = {
    status: 'idle',
    isFetching: false,
    data: undefined,
    error: undefined,
    lastUpdated: undefined,
    invalidated: false,
  };

  let fetchPromise: Promise<void> | null = null;

  const notify = () => {
    subscribers.forEach((s) => s());
  };

  const setState = (
    updater:
      | QueryState<TData, TError>
      | ((prev: QueryState<TData, TError>) => QueryState<TData, TError>)
  ) => {
    state = typeof updater === 'function' ? (updater as any)(state) : updater;
    notify();
  };

  const query: Query<TData, TError> = {
    queryKey,
    queryHash: queryKey,

    state,
    subscribers,

    options: {
      staleTime,
      cacheTime,
      retry,
      retryDelay,
    },

    subscribe(subscriber: Subscriber) {
      subscribers.push(subscriber);

      return () => {
        const idx = subscribers.indexOf(subscriber);
        if (idx !== -1) subscribers.splice(idx, 1);
      };
    },

    setState,

    isStale() {
      if (state.invalidated) return true;
      if (!state.lastUpdated) return true;
      return Date.now() - state.lastUpdated > staleTime;
    },

    invalidate() {
      setState((old) => ({
        ...old,
        invalidated: true,
      }));
    },

    async fetch() {
      // dedupe
      if (fetchPromise) return fetchPromise;

      // no need to refetch if fresh
      if (state.status === 'success' && !query.isStale()) return;

      setState((old) => ({
        ...old,
        status: 'pending',
        isFetching: true,
        error: undefined,
      }));

      const maxRetry = normalizeRetry(retry);

      fetchPromise = (async () => {
        let attempt = 0;

        while (true) {
          try {
            attempt++;
            const data = await queryFn();

            setState((old) => ({
              ...old,
              status: 'success',
              data,
              error: undefined,
              lastUpdated: Date.now(),
              invalidated: false,
            }));

            return;
          } catch (err) {
            if (attempt > maxRetry) {
              setState((old) => ({
                ...old,
                status: 'error',
                error: err as TError,
              }));
              return;
            }

            const delay =
              typeof retryDelay === 'function'
                ? retryDelay(attempt)
                : retryDelay;

            await sleep(delay);
          }
        }
      })().finally(() => {
        fetchPromise = null;
        setState((old) => ({
          ...old,
          isFetching: false,
        }));
      });

      return fetchPromise;
    },
  };

  // IMPORTANT: keep query.state always pointing to latest "state"
  // Instead of storing snapshot, expose getter-like behavior:
  Object.defineProperty(query, 'state', {
    get() {
      return state;
    },
  });

  return query;
};
