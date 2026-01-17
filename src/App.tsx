import { useState } from "react";
import { useQuery } from "./react-query/useQuery";
import { useQueryClient } from "./react-query/provider/useQueryClient";

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

function TodosPage() {
  const client = useQueryClient();

  const { data, status, error, isFetching, refetch, lastUpdated, invalidated } =
    useQuery<Todo[]>({
      queryKey: "todos",
      queryFn: async () => {
        const response = await fetch(
          "https://jsonplaceholder.typicode.com/todos",
          { cache: "no-store" }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch todos");
        }
        return response.json() as Promise<Todo[]>;
      },
      staleTime: 10_000,
      cacheTime: 60_000,
      retry: 2,
    });

  return (
    <div style={{ padding: 20 }}>
      <h2>Todos</h2>

      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <button onClick={refetch} disabled={isFetching}>
          {isFetching ? "Fetching..." : "Refetch"}
        </button>

        <button
          onClick={() => client.invalidateQuery("todos")}
          disabled={isFetching}
        >
          Invalidate
        </button>
      </div>

      <div style={{ fontSize: 14, marginBottom: 12 }}>
        <div>
          <b>Status:</b> {status}
        </div>
        <div>
          <b>Fetching:</b> {String(isFetching)}
        </div>
        <div>
          <b>Invalidated:</b> {String(invalidated)}
        </div>
        <div>
          <b>Last Updated:</b>{" "}
          {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : "Never"}
        </div>
      </div>

      {status === "pending" && <div>Loading...</div>}
      {status === "error" && (
        <div style={{ color: "red" }}>
          Error: {(error as Error)?.message}
        </div>
      )}

      {status === "success" && (
        <ul style={{ paddingLeft: 18 }}>
          {data?.slice(0, 15).map((todo) => (
            <li key={todo.id} style={{ marginBottom: 6 }}>
              <span
                style={{
                  textDecoration: todo.completed ? "line-through" : "none",
                }}
              >
                {todo.title}
              </span>{" "}
              {todo.completed ? "✅" : "⬜"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AboutPage() {
  return (
    <div style={{ padding: 20 }}>
      <h2>About</h2>
      <p>
        This page exists to simulate navigation away from the Todos query.
        Navigate back to see caching + staleTime behavior.
      </p>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState<"todos" | "about">("todos");

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <header
        style={{
          padding: 12,
          borderBottom: "1px solid #ddd",
          display: "flex",
          gap: 10,
        }}
      >
        <button
          onClick={() => setPage("todos")}
          disabled={page === "todos"}
        >
          Todos
        </button>

        <button
          onClick={() => setPage("about")}
          disabled={page === "about"}
        >
          About
        </button>
      </header>

      {page === "todos" ? <TodosPage /> : <AboutPage />}
    </div>
  );
}
