import { useQuery } from "./react-query/useQuery";

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

function App() {
  const { data, status, error, isFetching, refetch } = useQuery({
    queryKey: "todos",
    queryFn: async () => {
      const response = await fetch("https://jsonplaceholder.typicode.com/todos");
      if (!response.ok) {
        throw new Error("Failed to fetch todos");
      }
      return response.json() as Promise<Todo[]>;
    },
    staleTime: 10_000,
    cacheTime: 60_000,
    retry: 2,
  })

  if (status === "pending") return <div>Loading...</div>;
  if (status === "error") return <div>Error: {(error as Error)?.message}</div>;
  return (
    <div>
      <button onClick={refetch} disabled={isFetching}>
        Refetch
      </button>

      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}

export default App
