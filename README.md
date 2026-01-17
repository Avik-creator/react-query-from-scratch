# React Query From Scratch

A complete, production-ready implementation of React Query built from scratch using TypeScript and React 19. This project demonstrates how to build a powerful data fetching and caching library similar to TanStack Query.

## 🚀 Features

- **Declarative Data Fetching**: Simple `useQuery` hook for fetching and caching data
- **Intelligent Caching**: Automatic caching with configurable `staleTime` and `cacheTime`
- **Background Refetching**: Automatic refetching of stale data
- **Error Handling & Retry**: Built-in retry logic with exponential backoff
- **Query Invalidation**: Manual cache invalidation for updating data
- **Garbage Collection**: Automatic cleanup of unused queries
- **TypeScript Support**: Full TypeScript support with proper type inference
- **React 19 Compatible**: Built with modern React patterns including `useSyncExternalStore`

## 📦 Installation & Setup

```bash
# Clone the repository
git clone <repository-url>
cd react-query-from-scratch

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🏗️ Architecture

### Core Components

- **`QueryClient`**: Central cache and query management
- **`useQuery`**: React hook for data fetching and caching
- **`QueryClientProvider`**: React context provider
- **`createQuery`**: Factory function for creating query instances

### Key Concepts

#### Query States
- `idle`: Query hasn't been fetched yet
- `pending`: Currently fetching data
- `success`: Data fetched successfully
- `error`: Fetch failed

#### Cache Behavior
- **Fresh Data**: Recently fetched data within `staleTime`
- **Stale Data**: Data older than `staleTime` but still in cache
- **Cache Time**: How long to keep data in memory after becoming unused

## 📚 Usage

### Basic Usage

```tsx
import { useQuery } from './react-query/useQuery';

function TodoList() {
  const { data, status, error, refetch } = useQuery({
    queryKey: 'todos',
    queryFn: async () => {
      const response = await fetch('/api/todos');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  if (status === 'pending') return <div>Loading...</div>;
  if (status === 'error') return <div>Error: {error.message}</div>;

  return (
    <div>
      <button onClick={refetch}>Refresh</button>
      {data?.map(todo => (
        <div key={todo.id}>{todo.title}</div>
      ))}
    </div>
  );
}
```

### Query Invalidation

```tsx
import { useQueryClient } from './react-query/provider/useQueryClient';

function TodoActions() {
  const client = useQueryClient();

  const handleCreateTodo = async (title: string) => {
    await fetch('/api/todos', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });

    // Invalidate all queries with key containing 'todos'
    client.invalidateQuery('todos');
  };

  return <button onClick={() => handleCreateTodo('New Todo')}>Add Todo</button>;
}
```

### Provider Setup

```tsx
import { QueryClientProvider } from './react-query/provider/QueryClientProvider';
import { QueryClient } from './react-query/client/queryClient';

function App() {
  const client = new QueryClient();

  return (
    <QueryClientProvider client={client}>
      <YourAppComponents />
    </QueryClientProvider>
  );
}
```

## ⚙️ API Reference

### useQuery Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `queryKey` | `string` | - | Unique identifier for the query |
| `queryFn` | `() => Promise<TData>` | - | Function that returns a promise with data |
| `staleTime` | `number` | `0` | Time in ms after which data is considered stale |
| `cacheTime` | `number` | `5 * 60 * 1000` | Time in ms to keep unused data in cache |
| `retry` | `number \| boolean` | `3` | Number of retries (false = 0, true = 3) |
| `retryDelay` | `number \| ((attempt: number) => number)` | `defaultRetryDelay` | Delay between retries |

### QueryClient Methods

| Method | Description |
|--------|-------------|
| `fetchQuery(options)` | Fetch data for a query |
| `invalidateQuery(match?)` | Invalidate queries by key pattern |
| `removeQueries(match?)` | Remove queries from cache |
| `getQuery(key)` | Get a query by key |

## 🎯 Demo

The included demo app (`src/App.tsx`) showcases:

- Basic data fetching with loading states
- Query invalidation
- Navigation and cache persistence
- Real-time status indicators

Run `npm run dev` to see it in action!

## 🔧 How It Works

### Query Lifecycle

1. **Mount**: `useQuery` creates or retrieves a query from `QueryClient`
2. **Subscribe**: Component subscribes to query state changes
3. **Fetch**: If data is stale or missing, trigger fetch
4. **Cache**: Store successful responses with timestamps
5. **Update**: Notify subscribers of state changes
6. **Cleanup**: Garbage collect unused queries after `cacheTime`

### Caching Strategy

- **Memory Cache**: Fast in-memory storage using `Map`
- **Persistence**: Data survives component unmounts
- **Invalidation**: Manual cache clearing via `invalidateQuery`
- **Garbage Collection**: Automatic cleanup of unused queries

### Deduplication

Multiple components using the same `queryKey` share the same query instance, preventing duplicate requests.

## 🧪 Testing Cache Behavior

1. Load the app and fetch todos
2. Navigate to "About" page (query stays cached)
3. Return to "Todos" page (should show cached data immediately)
4. Wait for `staleTime` to pass, then navigate back (should refetch in background)
5. Use browser dev tools to clear localStorage and refresh (cache should be empty)

## 🤝 Contributing

This is an educational implementation. Key areas for improvement:

- [ ] Mutations (`useMutation`)
- [ ] Query prefetching
- [ ] Infinite queries
- [ ] Background sync
- [ ] Network status detection
- [ ] React Query DevTools integration

## 📄 License

MIT License - feel free to use this code for learning and building your own implementations!

## 🙏 Acknowledgments

Inspired by [TanStack Query](https://tanstack.com/query). This implementation focuses on the core concepts while maintaining simplicity and educational value.
