export type QueryStatus = 'idle' | 'pending' | 'success' | 'error';

export type QueryState<TData, TError> = {
  status: QueryStatus;
  isFetching: boolean;
  data?: TData;
  error?: TError;
  lastUpdated?: number;
  invalidated: boolean;
};

export type Subscriber = () => void;

export type QueryOptions<TData> = {
  queryKey: string;
  queryFn: () => Promise<TData>;

  staleTime?: number; // ms
  cacheTime?: number; // ms

  retry?: number | boolean; // true=>3 false=>0
  retryDelay?: number | ((attempt: number) => number);
};

export type Query<TData, TError> = {
  queryKey: string;
  queryHash: string;

  state: QueryState<TData, TError>;
  subscribers: Subscriber[];

  options: Required<
    Pick<QueryOptions<TData>, 'staleTime' | 'cacheTime' | 'retry' | 'retryDelay'>
  >;

  subscribe: (subscriber: Subscriber) => () => void;
  setState: (
    updater:
      | QueryState<TData, TError>
      | ((prev: QueryState<TData, TError>) => QueryState<TData, TError>)
  ) => void;

  isStale: () => boolean;
  invalidate: () => void;

  fetch: () => Promise<void>;
};
