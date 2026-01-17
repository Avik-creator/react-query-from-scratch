import type { Query, QueryOptions } from "./types/query";
import { createQuery } from "./createQuery";

export class QueryClient {
  private queries = new Map<string, Query<any, any>>();
  private gcTimers = new Map<string, ReturnType<typeof setTimeout>>();

  ensureQuery<TData, TError = unknown>(options: QueryOptions<TData>): Query<TData, TError> {
    const existing = this.queries.get(options.queryKey);
    if (existing) return existing as Query<TData, TError>;

    const query = createQuery<TData, TError>(options);
    this.queries.set(query.queryHash, query);

    return query;
  }
  getQuery(queryKey: string) {
    return this.queries.get(queryKey)
  }

  async fetchQuery<TData>(options: QueryOptions<TData>): Promise<TData> {
    const q = this.ensureQuery(options);
    await q.fetch();
    return q.state.data as TData;
  }
  invalidateQuery(match?: string | ((key: string) => boolean)) {
    for (const [key, query] of this.queries.entries()) {
      const ok =
        match === undefined
          ? true
          : typeof match === 'string'
            ? key.includes(match)
            : match(key);

      if (ok) query.invalidate();
    }
  }

  removeQueries(match?: string | ((key: string) => boolean)) {
    for (const [key] of this.queries.entries()) {
      const ok =
        match === undefined
          ? true
          : typeof match === 'string'
            ? key.includes(match)
            : match(key);

      if (ok) {
        const timer = this.gcTimers.get(key);
        if (timer) clearTimeout(timer);

        this.gcTimers.delete(key);
        this.queries.delete(key);
      }
    }
  }

  gc() {
    for (const [key, query] of this.queries.entries()) {
      // don't GC active queries
      if (query.subscribers.length > 0) continue;

      // already scheduled
      if (this.gcTimers.has(key)) continue;

      const timer = setTimeout(() => {
        const q = this.queries.get(key);
        if (!q) return;

        // still unused?
        if (q.subscribers.length === 0) {
          this.queries.delete(key);
        }

        this.gcTimers.delete(key);
      }, query.options.cacheTime);

      this.gcTimers.set(key, timer);
    }
  }

}