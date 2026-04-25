import type { Category } from "./types";

export const serverState: Category = {
  slug: "server-state",
  title: "Server State / Data Fetching",
  description:
    "Modern client-side data fetching: TanStack Query, SWR, caching, invalidation, optimistic updates, and the difference from client state.",
  icon: "🔄",
  questions: [
    // ───── EASY ─────
    {
      id: "what-is-server-state",
      title: "What is server state?",
      difficulty: "easy",
      question: "What is 'server state' and why is it different from client state?",
      answer: `**Server state** = data persisted remotely, fetched asynchronously.
**Client state** = local UI / app state owned by the browser.

| Aspect              | Client state               | Server state                              |
|---------------------|----------------------------|-------------------------------------------|
| Source              | Owned by app               | Owned by remote source                     |
| Sync                | Always in sync             | Stale by default; needs refetch            |
| Async               | Synchronous                | Async (fetch, error states)                |
| Update              | \`setState\`                  | Mutate + refetch / invalidate            |
| Sharing             | Component / store          | All clients see same source                |
| Caching             | None (state is the cache)  | Critical                                    |
| Tools               | Zustand, Redux, useState   | TanStack Query, SWR, RTK Query, Apollo     |

**Why a separate tool:**
Server state has unique problems:
- **Stale data** — data on server changes; client cache is out of date.
- **Caching** — avoid re-fetching same data on every component mount.
- **Loading / error states** — every request can fail.
- **Refetching** — on focus, on network reconnect, on interval.
- **Optimistic updates** — show changes before server confirms.
- **Pagination / infinite scroll**.
- **Background refetching**.

Hand-rolling these in a client store (Redux) is tedious and error-prone. Dedicated server-state libraries solve them once.`,
      tags: ["fundamentals"],
    },
    {
      id: "tanstack-query",
      title: "TanStack Query basics",
      difficulty: "easy",
      question: "What is TanStack Query and why use it?",
      answer: `**TanStack Query** (formerly React Query) is the leading server-state library for React (also Vue, Svelte, Solid via packages).

\`\`\`tsx
import { useQuery } from "@tanstack/react-query";

function Users() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: () => fetch("/api/users").then(r => r.json()),
  });

  if (isLoading) return <Spinner />;
  if (error) return <Error />;
  return <ul>{data.map(u => <li>{u.name}</li>)}</ul>;
}
\`\`\`

**What you get for free:**
- **Caching** — same query key shares data across components.
- **Loading / error states**.
- **Automatic refetching** on window focus, network reconnect, interval.
- **Background updates** — show stale data while fetching fresh.
- **Deduping** — concurrent identical requests merged.
- **Pagination, infinite queries, prefetching**.
- **Optimistic updates**, mutation flow.
- **Devtools** — inspect cache, queries, mutations.

**Setup:**
\`\`\`tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
\`\`\`

**Why it dominated:**
- Solves "every app reinventing fetch + cache + retry."
- Excellent docs.
- Framework-agnostic (Vue / Solid / Svelte versions).
- Devtools that make debugging easy.

For most React apps in 2024+, TanStack Query is the modern default for fetching.`,
      tags: ["tanstack"],
    },
    {
      id: "swr",
      title: "SWR",
      difficulty: "easy",
      question: "What is SWR and how does it differ from TanStack Query?",
      answer: `**SWR** ("stale-while-revalidate") is Vercel's data-fetching library. Smaller, simpler API than TanStack Query.

\`\`\`tsx
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(r => r.json());

function Users() {
  const { data, error, isLoading } = useSWR("/api/users", fetcher);
  if (error) return <Error />;
  if (isLoading) return <Spinner />;
  return <ul>{data.map(u => <li>{u.name}</li>)}</ul>;
}
\`\`\`

**Strategy: Stale-While-Revalidate:**
- Show cached data immediately.
- Re-fetch in background.
- Update UI when fresh data arrives.

**Vs TanStack Query:**
| Feature            | SWR                  | TanStack Query           |
|--------------------|----------------------|--------------------------|
| Bundle size        | Tiny (~5 KB)         | Larger (~14 KB)          |
| Devtools           | Basic                | Excellent                 |
| Query key          | URL string           | Array (more flexible)    |
| Mutations          | Manual (mutate)      | Built-in useMutation     |
| Pagination         | useSWRInfinite       | useInfiniteQuery         |
| Optimistic updates | Manual               | Built-in                 |
| Garbage collection | Less aggressive      | Configurable             |
| Vercel integration | Native               | Generic                  |

**Pick SWR when:**
- Smaller bundle matters.
- Simple GET-heavy apps.
- Already using Next.js / Vercel ecosystem.

**Pick TanStack Query when:**
- Complex caching / mutations.
- Need full devtools.
- Optimistic updates / pagination heavy.

**Migration between them is moderate** — APIs are similar but not identical.

**Both are massively better than \`useEffect + fetch\` for anything beyond a one-shot demo.**`,
      tags: ["swr"],
    },
    {
      id: "use-effect-fetch-bad",
      title: "Why useEffect + fetch is risky",
      difficulty: "easy",
      question: "What's wrong with fetching in useEffect?",
      answer: `\`\`\`tsx
function Users() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch("/api/users").then(r => r.json()).then(setData);
  }, []);
  return <ul>{data?.map(...)}</ul>;
}
\`\`\`

**Problems:**

**1. No loading/error state** — you have to add \`useState\` for both, manually.

**2. Race conditions** — if \`useEffect\` re-runs (e.g. user changes), the older request can resolve **after** the newer, overwriting fresh data with stale.
\`\`\`tsx
useEffect(() => {
  let cancelled = false;
  fetch(\`/api/users/\${id}\`).then(r => r.json()).then(d => { if (!cancelled) setData(d); });
  return () => { cancelled = true; };
}, [id]);
\`\`\`
Or use \`AbortController\`. Either way, manual.

**3. No caching** — every component mount re-fetches. Visiting page A → B → A re-fetches.

**4. No refetch on focus / reconnect** — stale data when user comes back.

**5. No deduplication** — two components both fetch \`/api/users\` → 2 network requests.

**6. No retry on transient failures**.

**7. No background refresh** — must manually re-trigger.

**8. SSR support** — hydration mismatch if server has data but client re-fetches.

**9. Strict Mode in React 18** double-runs effects in dev — fetches happen twice.

**Solution:** use TanStack Query / SWR. They solve every one of these for you.

\`useEffect + fetch\` is fine for **one-shot, throwaway** code. Production apps almost always need a server-state library.`,
      tags: ["antipatterns"],
    },
    {
      id: "query-keys",
      title: "Query keys",
      difficulty: "easy",
      question: "How do you design query keys in TanStack Query?",
      answer: `**Query keys** are arrays that uniquely identify a query. Same key = same cache entry.

\`\`\`ts
useQuery({ queryKey: ["todos"], queryFn: ... });
useQuery({ queryKey: ["todos", todoId], queryFn: ... });
useQuery({ queryKey: ["todos", { status: "active", page }], queryFn: ... });
\`\`\`

**Convention:**
- **Domain → entity → params** structure.
- Stable serialization — TanStack Query stringifies array elements.

**Hierarchy patterns:**
\`\`\`ts
['todos']                          // all todos
['todos', 'list']                   // todo list endpoints
['todos', 'list', { status: 'done' }]  // specific filter
['todos', 'detail']                  // todo detail endpoints
['todos', 'detail', todoId]         // specific todo
\`\`\`

**Invalidation by prefix:**
\`\`\`ts
queryClient.invalidateQueries({ queryKey: ['todos'] });
// invalidates ALL keys starting with ['todos']
\`\`\`

**Query factories** for type safety:
\`\`\`ts
export const todoKeys = {
  all: ['todos'] as const,
  lists: () => [...todoKeys.all, 'list'] as const,
  list: (filter: TodoFilter) => [...todoKeys.lists(), filter] as const,
  details: () => [...todoKeys.all, 'detail'] as const,
  detail: (id: string) => [...todoKeys.details(), id] as const,
};
\`\`\`
Then \`queryKey: todoKeys.detail(id)\`.

**Tip:** include all dependencies in the key. If query function uses \`userId\`, include it. Otherwise stale data shows after switching users.`,
      tags: ["tanstack"],
    },
    {
      id: "mutations",
      title: "Mutations",
      difficulty: "easy",
      question: "How do you write data with TanStack Query?",
      answer: `**\`useMutation\`** for non-GET requests.

\`\`\`tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";

function CreateTodo() {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: (newTodo: { title: string }) =>
      fetch("/api/todos", { method: "POST", body: JSON.stringify(newTodo) }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["todos"] });   // refetch list
    },
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); mutation.mutate({ title: "new" }); }}>
      <button disabled={mutation.isPending}>Add</button>
    </form>
  );
}
\`\`\`

**States:**
- \`mutation.isPending\` — request in flight.
- \`mutation.isError\`, \`mutation.error\` — failed.
- \`mutation.isSuccess\`, \`mutation.data\` — succeeded.

**Lifecycle callbacks:**
- \`onMutate\` — fires before mutation; great for optimistic updates.
- \`onSuccess\` — after success.
- \`onError\` — after failure.
- \`onSettled\` — after either.

**Invalidation patterns:**
- **Invalidate broad** — \`["todos"]\` invalidates all todos queries.
- **Optimistic update** — modify cache immediately; rollback on error.
- **Set query data directly**:
  \`\`\`ts
  qc.setQueryData(["todo", id], updatedTodo);
  \`\`\`

**Multiple mutations:**
- Each call to \`mutate()\` creates a new mutation instance.
- For sequence, await each:
  \`\`\`ts
  await mutation.mutateAsync(data);
  \`\`\`

**Error handling:**
- Toast on error.
- Form errors via \`onError\` callback.
- Retry: \`useMutation({ retry: 3 })\`.`,
      tags: ["tanstack", "mutations"],
    },
    {
      id: "refetch-strategies",
      title: "Refetching strategies",
      difficulty: "easy",
      question: "When does TanStack Query refetch data?",
      answer: `**Default refetch triggers:**
- **Window focus** (\`refetchOnWindowFocus: true\`) — when user returns to tab.
- **Network reconnect** (\`refetchOnReconnect: true\`).
- **Component mount** if data is stale (\`refetchOnMount: true\`).
- **Query invalidation** — \`queryClient.invalidateQueries(...)\`.
- **Manual** — \`refetch()\` from \`useQuery\` result.

**Stale time:** how long fresh data stays "fresh" (no background refetch).
\`\`\`ts
useQuery({ queryKey: ['todos'], queryFn, staleTime: 60_000 });
\`\`\`
- \`0\` (default) — always considered stale; refetch on focus/mount.
- \`Infinity\` — never refetch unless invalidated.

**Garbage collection time** (\`gcTime\`, formerly \`cacheTime\`):
- Inactive query data evicted after this time.
- Default: 5 minutes.
- \`Infinity\` to keep forever.

**Polling:**
\`\`\`ts
useQuery({ queryKey: [...], queryFn, refetchInterval: 5000 });
\`\`\`

**Disable refetch on focus:**
\`\`\`ts
useQuery({ queryKey: [...], queryFn, refetchOnWindowFocus: false });
\`\`\`

**Per-query vs global config:**
\`\`\`tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, refetchOnWindowFocus: false },
  },
});
\`\`\`

**Best practices:**
- Tune \`staleTime\` per query type — auth user might be \`Infinity\`; live dashboard \`0\`.
- Disable focus refetch for slow / expensive queries.
- Polling for true real-time? Consider WebSockets / SSE instead.`,
      tags: ["caching"],
    },
    {
      id: "optimistic-updates",
      title: "Optimistic updates",
      difficulty: "easy",
      question: "What are optimistic updates?",
      answer: `**Optimistic update** = update the UI immediately, before the server confirms. If the request fails, roll back.

**Why:** instant feedback feels better than waiting for round-trip.

**TanStack Query example:**
\`\`\`tsx
const qc = useQueryClient();

const mutation = useMutation({
  mutationFn: updateTodo,
  onMutate: async (newTodo) => {
    // 1. Cancel in-flight queries to avoid overwriting optimistic update
    await qc.cancelQueries({ queryKey: ['todos'] });
    // 2. Snapshot previous value
    const previous = qc.getQueryData(['todos']);
    // 3. Optimistically update cache
    qc.setQueryData(['todos'], (old) => old.map(t => t.id === newTodo.id ? newTodo : t));
    return { previous };   // context for rollback
  },
  onError: (err, newTodo, context) => {
    // 4. Roll back on error
    qc.setQueryData(['todos'], context.previous);
  },
  onSettled: () => {
    // 5. Refetch to sync with server (success or failure)
    qc.invalidateQueries({ queryKey: ['todos'] });
  },
});
\`\`\`

**When to optimistic:**
- High-success-rate operations (toggling like, marking todo done).
- Latency-sensitive UX.
- User wants instant response.

**When not to:**
- Operations that often fail (form validation, payment).
- Operations with critical visual outcome (account deletion).
- Long-running operations (better to show progress).

**SWR pattern:**
\`\`\`ts
mutate('/api/todos', newData, { optimisticData: ..., rollbackOnError: true });
\`\`\`

**React 19 \`useOptimistic\`:**
\`\`\`tsx
const [optimistic, addOptimistic] = useOptimistic(state, (s, n) => [...s, n]);
\`\`\`
Built-in for Server Actions; less ceremony.

**Pitfalls:**
- Forgetting rollback on error.
- Optimistic update + race condition with concurrent mutations.
- Stale optimistic data after refetch.`,
      tags: ["patterns"],
    },

    // ───── MEDIUM ─────
    {
      id: "infinite-queries",
      title: "Pagination and infinite queries",
      difficulty: "medium",
      question: "How do you implement infinite scroll with TanStack Query?",
      answer: `**\`useInfiniteQuery\`** for cursor-based pagination.

\`\`\`tsx
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useInfiniteQuery({
  queryKey: ['posts'],
  queryFn: ({ pageParam = null }) => fetchPosts({ cursor: pageParam, limit: 20 }),
  initialPageParam: null,
  getNextPageParam: (lastPage) => lastPage.nextCursor,
});

const allPosts = data?.pages.flatMap(p => p.items) ?? [];

return (
  <>
    {allPosts.map(post => <Post key={post.id} {...post} />)}
    <button onClick={() => fetchNextPage()} disabled={!hasNextPage || isFetchingNextPage}>
      {isFetchingNextPage ? "Loading…" : hasNextPage ? "Load more" : "No more"}
    </button>
  </>
);
\`\`\`

**Trigger on scroll** with IntersectionObserver:
\`\`\`tsx
import { useInView } from "react-intersection-observer";

const { ref, inView } = useInView();
useEffect(() => { if (inView && hasNextPage) fetchNextPage(); }, [inView]);
\`\`\`

**Bidirectional** (newer pages):
- \`getPreviousPageParam\` + \`fetchPreviousPage\`.

**Page-based** (offset/limit):
- \`pageParam\` is the page number.
- \`getNextPageParam: (lastPage, allPages) => lastPage.length === 20 ? allPages.length + 1 : undefined\`.

**Virtual scrolling** for huge lists:
- TanStack Virtual / react-window.
- Only render visible rows.

**Cursor vs offset:**
- **Cursor** (recommended) — stable across inserts/deletes, scales infinitely.
- **Offset/limit** — simple but inconsistent if data changes mid-scroll.

**Cache:**
- All loaded pages live in cache.
- Refetch refreshes all loaded pages.
- Deep scrolls hold lots of memory; consider trimming.

**SWR's equivalent:** \`useSWRInfinite\`.`,
      tags: ["pagination"],
    },
    {
      id: "prefetching",
      title: "Prefetching",
      difficulty: "medium",
      question: "How do you prefetch data?",
      answer: `**Prefetching** = load data before the user needs it. Improves perceived performance.

**Manual prefetch:**
\`\`\`ts
const qc = useQueryClient();

await qc.prefetchQuery({
  queryKey: ['user', id],
  queryFn: () => fetchUser(id),
  staleTime: 60_000,
});
\`\`\`

**Common patterns:**

**1. Hover-prefetch** — load on link hover, instant when clicked.
\`\`\`tsx
<Link
  to={\`/users/\${id}\`}
  onMouseEnter={() => qc.prefetchQuery({ queryKey: ['user', id], queryFn: () => fetchUser(id) })}
>
  {name}
</Link>
\`\`\`

**2. Route prefetch** — prefetch all data needed for the next route on navigation hint.

**3. Sibling prefetch** — when viewing item N, prefetch N+1.

**4. SSR prefetch:**
\`\`\`tsx
// Next.js / Remix
export async function getServerSideProps() {
  const qc = new QueryClient();
  await qc.prefetchQuery({ queryKey: ['users'], queryFn: fetchUsers });
  return { props: { dehydratedState: dehydrate(qc) } };
}

// In _app.tsx
<HydrationBoundary state={pageProps.dehydratedState}>
  <App />
</HydrationBoundary>
\`\`\`
- Server renders with data; client hydrates without re-fetching.

**5. Background prefetch** — refresh data while user is idle.

**Trade-offs:**
- Prefetching too aggressively wastes bandwidth.
- Prefetch only what user is likely to access.

**SWR equivalent:**
\`\`\`ts
useSWR.preload(key, fetcher);
\`\`\`

**Modern Next.js:** \`<Link prefetch>\` does data prefetching on App Router automatically (RSC payloads).`,
      tags: ["performance"],
    },
    {
      id: "error-handling",
      title: "Error handling",
      difficulty: "medium",
      question: "How do you handle errors in queries and mutations?",
      answer: `**Per-query error state:**
\`\`\`tsx
const { data, error, isError } = useQuery({ queryKey: [...], queryFn });
if (isError) return <p>Error: {error.message}</p>;
\`\`\`

**Throw to nearest Error Boundary:**
\`\`\`tsx
useQuery({ queryKey: [...], queryFn, throwOnError: true });
\`\`\`
Then use React Error Boundaries:
\`\`\`tsx
<ErrorBoundary fallback={<ErrorPage />}>
  <Users />
</ErrorBoundary>
\`\`\`

**Throw conditionally:**
\`\`\`ts
throwOnError: (error) => error.status >= 500
\`\`\`

**Retry:**
\`\`\`ts
useQuery({ queryKey: [...], queryFn, retry: 3, retryDelay: 1000 });
\`\`\`
- Default: 3 retries with exponential backoff.
- Disable: \`retry: false\`.
- Custom: \`retry: (failureCount, error) => error.status !== 404\`.

**Mutation errors:**
\`\`\`tsx
const mutation = useMutation({
  mutationFn: ...,
  onError: (error) => toast.error(error.message),
});
\`\`\`

**Global error handler:**
\`\`\`ts
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.meta?.errorMessage) toast.error(query.meta.errorMessage);
    },
  }),
});
\`\`\`

**Pattern: typed errors:**
\`\`\`ts
class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

const queryFn = async () => {
  const res = await fetch(url);
  if (!res.ok) throw new ApiError(res.status, "Failed");
  return res.json();
};
\`\`\`

**Suspense + Error Boundary** is the modern React pattern: data loading → \`<Suspense>\`, errors → \`<ErrorBoundary>\`.`,
      tags: ["errors"],
    },
    {
      id: "ssr-hydration-tquery",
      title: "SSR with TanStack Query",
      difficulty: "medium",
      question: "How does TanStack Query work with SSR?",
      answer: `**Goal:** server fetches data, sends HTML + serialized cache; client hydrates without re-fetching.

**Next.js App Router pattern:**

\`\`\`tsx
// app/users/page.tsx (Server Component)
import { dehydrate, QueryClient, HydrationBoundary } from "@tanstack/react-query";

export default async function Page() {
  const qc = new QueryClient();
  await qc.prefetchQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });
  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <UsersClient />
    </HydrationBoundary>
  );
}

// Client component
"use client";
function UsersClient() {
  const { data } = useQuery({ queryKey: ['users'], queryFn: fetchUsers });
  return <ul>{data.map(u => <li>{u.name}</li>)}</ul>;
}
\`\`\`

**Setup:**
\`\`\`tsx
// app/providers.tsx
"use client";
const [queryClient] = useState(() => new QueryClient({
  defaultOptions: { queries: { staleTime: 60 * 1000 } },
}));
return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
\`\`\`

**Why important:**
- No flash of loading on first render.
- SEO-friendly HTML.
- Faster perceived performance.

**Pages Router** (older Next):
\`\`\`tsx
export async function getServerSideProps() {
  const qc = new QueryClient();
  await qc.prefetchQuery({ queryKey: [...], queryFn });
  return { props: { dehydratedState: dehydrate(qc) } };
}
\`\`\`

**Streaming SSR:**
- \`<Suspense>\` boundary lets parts stream as they're ready.
- TanStack Query plays well with Suspense via \`useSuspenseQuery\`.

**Pitfalls:**
- New QueryClient per request server-side (don't share across requests).
- Stale time should be > 0 to avoid immediate refetch on hydrate.`,
      tags: ["ssr"],
    },
    {
      id: "select-transform",
      title: "Selecting and transforming data",
      difficulty: "medium",
      question: "How do you transform query data efficiently?",
      answer: `**\`select\` option** lets you transform data before returning to component.

\`\`\`tsx
const { data: count } = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  select: (data) => data.length,    // only re-renders when length changes
});
\`\`\`

**Why use select:**
- **Subscribe to a slice** — component only re-renders when that derived value changes.
- **Decouple component from API shape** — API change doesn't break component.
- **Memoize** automatically — TanStack Query caches the select result by data identity.

**Multiple components, different shapes:**
\`\`\`tsx
const { data: ids } = useQuery({ queryKey: ['todos'], queryFn, select: (d) => d.map(t => t.id) });
const { data: count } = useQuery({ queryKey: ['todos'], queryFn, select: (d) => d.length });
\`\`\`
Both share the same cached data; each re-renders only when its slice changes.

**Stable references:**
- Return the same array reference if input unchanged — use Reselect or memoization.
- Otherwise component re-renders even if "value" looks same.

**Custom hooks:**
\`\`\`ts
function useTodoCount() {
  return useQuery({ queryKey: ['todos'], queryFn, select: (d) => d.length });
}
\`\`\`

**Don't over-select:**
- \`select\` runs on every component render that uses the query. Keep it cheap.
- For expensive computations, memoize:
\`\`\`ts
const select = useCallback((data) => expensiveTransform(data), []);
\`\`\`

**Pattern:** thin queries + thin selects + components that consume specific slices. Avoids prop drilling and unnecessary re-renders.`,
      tags: ["tanstack", "performance"],
    },
    {
      id: "graphql-clients",
      title: "Apollo Client vs TanStack Query for GraphQL",
      difficulty: "medium",
      question: "What client should you use for a GraphQL backend?",
      answer: `**Apollo Client** — historically the de facto GraphQL client.

\`\`\`tsx
const { data, loading, error } = useQuery(GET_USERS);
\`\`\`

**Strengths:**
- **Normalized cache** — entities stored by ID; mutation auto-updates relevant queries.
- **Subscriptions** built in.
- **Field policies, type policies, cache redirects**.
- Code generation (graphql-codegen) for typed hooks.
- Dev tools.

**Weaknesses:**
- Large (~30 KB).
- Normalization is powerful but complex.
- Cache configuration can get hairy.

**Alternatives:**

**urql** — lighter, simpler. Same hooks API. Less normalized; pluggable.

**TanStack Query + graphql-request** — use TanStack Query as the cache + a thin GraphQL fetch:
\`\`\`tsx
useQuery({
  queryKey: ['users'],
  queryFn: () => request(endpoint, GET_USERS_QUERY),
});
\`\`\`
- Lighter than Apollo.
- Loses Apollo's normalization but gains TanStack Query's broader features.
- Good when GraphQL is just transport, not a graph navigation use case.

**Relay** (Meta) — heavyweight, opinionated, used at scale. \`@argumentDefinitions\`, fragments-driven, sophisticated cache.

**For new projects:**
- Simple GraphQL → urql or TanStack Query.
- Heavy GraphQL ecosystem → Apollo.
- Massive scale + Meta-style fragments → Relay.

**REST + GraphQL hybrid:**
- TanStack Query handles both naturally.
- Apollo's strength is the normalized GraphQL cache.

**Codegen:**
- \`graphql-codegen\` generates typed hooks from your schema + operations.
- Worth setting up for any GraphQL project.`,
      tags: ["graphql"],
    },
    {
      id: "websocket-realtime",
      title: "Realtime data",
      difficulty: "medium",
      question: "How do you handle realtime data?",
      answer: `Server state libs are pull-based (refetch). For realtime, combine with push channels.

**Polling** — simple but inefficient.
\`\`\`ts
useQuery({ queryKey: [...], queryFn, refetchInterval: 5000 });
\`\`\`
- Fine for moderate freshness.
- Wasted requests when nothing changes.

**WebSockets:**
- Long-lived connection, server pushes.
- Libraries: native WebSocket, Socket.IO, ably, pusher.
- Pattern: WebSocket message → \`queryClient.setQueryData\` to update cache.
\`\`\`ts
ws.onmessage = (e) => {
  const update = JSON.parse(e.data);
  queryClient.setQueryData(['todos'], (old) => [...old, update]);
};
\`\`\`

**Server-Sent Events (SSE):**
- One-way (server → client).
- Simpler than WebSocket for one-way streams.
- HTTP-based; works with proxies.
\`\`\`ts
const sse = new EventSource('/api/events');
sse.onmessage = (e) => { ... };
\`\`\`

**Supabase Realtime:**
- WebSocket-based; subscribes to Postgres changes.
\`\`\`ts
supabase.channel('todos').on('postgres_changes', { event: '*', table: 'todos' }, (payload) => {
  queryClient.setQueryData(['todos'], (old) => updateTodos(old, payload));
}).subscribe();
\`\`\`

**Firebase / Firestore** — built-in real-time queries.

**WebRTC** — peer-to-peer; usually for media.

**Hybrid pattern:**
- Initial fetch via TanStack Query.
- WebSocket pushes invalidate or directly update cache.
- TanStack Query handles loading/error states + caching.

**Trade-offs:**
- WebSocket = instant but stateful; load balancing harder.
- Polling = simple, scales better, but wasteful + delayed.
- Pick based on freshness requirements.`,
      tags: ["realtime"],
    },

    // ───── HARD ─────
    {
      id: "cache-invalidation",
      title: "Cache invalidation strategies",
      difficulty: "hard",
      question: "What are different cache invalidation strategies?",
      answer: `**The two hardest things in computing:** cache invalidation, naming things, and off-by-one errors.

**Invalidation strategies:**

**1. Time-based (TTL):**
- Set \`staleTime\` per query.
- Stale data refetches on next focus/mount.
- Simple but coarse.

**2. Manual invalidation:**
- Call \`queryClient.invalidateQueries(...)\` after mutations.
- Most common pattern.
- Invalidates by exact key or prefix.

**3. Optimistic + invalidate:**
- Update cache directly with \`setQueryData\`.
- Then invalidate to confirm with server.

**4. Tag-based** (RTK Query / SWR):
- Queries declare tags they provide.
- Mutations declare tags they invalidate.
- Library handles refetch.

**5. Real-time push:**
- Server pushes invalidation events via WebSocket / SSE.
- Client invalidates immediately.

**6. Cache-and-network:**
- Always show cache, always refetch.
- Default behavior in many libs.

**Patterns:**

**Broad vs surgical:**
\`\`\`ts
qc.invalidateQueries({ queryKey: ['todos'] });           // all todo queries
qc.invalidateQueries({ queryKey: ['todos', { status: 'active' }] }); // just one
\`\`\`

**Refetch on focus** for short stale times:
- Good UX: user returns to tab, sees fresh data.

**Background refetch:**
- Show stale immediately; update when fresh arrives.
- TanStack Query default behavior.

**Exact vs prefix matching:**
- \`exact: true\` — only invalidate exact key match.
- Default — prefix match (broader).

**Hard reset:**
\`\`\`ts
qc.removeQueries({ queryKey: ['todos'] });   // clear from cache entirely
qc.resetQueries({ queryKey: ['todos'] });    // back to initial state
\`\`\`

**Common mistake:**
- Not invalidating after mutation → users see stale data.
- Over-invalidating → too many refetches → poor performance.`,
      tags: ["caching"],
    },
    {
      id: "race-conditions",
      title: "Race conditions",
      difficulty: "hard",
      question: "How do data fetching libraries handle race conditions?",
      answer: `**Race condition:** an older request resolves after a newer one, overwriting fresh data with stale.

**Classic example:**
- User types "ab" — fetch \`/search?q=ab\`.
- User types "abc" — fetch \`/search?q=abc\`.
- "abc" response arrives first.
- "ab" response arrives later → UI shows stale "ab" results.

**TanStack Query handles this:**
- Each query keyed by params. \`['search', 'ab']\` and \`['search', 'abc']\` are different.
- Old query result still goes to cache — but the new key is what's selected.

**Within a single key:**
- TanStack Query cancels in-flight requests when refetching.
- The "latest queryFn invocation" wins.

**With \`useEffect + fetch\`** (manual):
\`\`\`ts
useEffect(() => {
  const ac = new AbortController();
  fetch(url, { signal: ac.signal }).then(setData);
  return () => ac.abort();
}, [url]);
\`\`\`
- AbortController cancels old requests.
- React's cleanup function fires before the next effect.

**Async patterns:**
- **\`useTransition\`** — mark non-urgent updates so React keeps UI responsive.
- **\`useDeferredValue\`** — debounce-like for derived values.

**Mutations:**
- Concurrent mutations to same data — last-write-wins by default.
- For critical operations, use sequential queue or compare-and-set.

**Optimistic updates** + race:
- \`onMutate\` cancels in-flight queries before applying optimistic update — TanStack Query handles this.

**Server-side:**
- Idempotency keys for safe retries.
- Versioning / optimistic concurrency control.

**Pattern:**
- Whenever a request is keyed by user input, ensure the **latest input wins** in UI.
- Use libraries that handle this; don't roll your own with \`useEffect + fetch\`.`,
      tags: ["concurrency"],
    },
    {
      id: "trpc",
      title: "tRPC",
      difficulty: "hard",
      question: "What is tRPC?",
      answer: `**tRPC** = end-to-end typesafe APIs over HTTP. Define server procedures; client gets typed hooks automatically.

**Server:**
\`\`\`ts
import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();

export const appRouter = t.router({
  getUsers: t.procedure.query(() => db.user.findMany()),
  createUser: t.procedure
    .input(z.object({ name: z.string(), email: z.string().email() }))
    .mutation(async ({ input }) => db.user.create({ data: input })),
});

export type AppRouter = typeof appRouter;
\`\`\`

**Client:**
\`\`\`tsx
import { trpc } from "./trpc";

const { data } = trpc.getUsers.useQuery();        // typed!
const mutation = trpc.createUser.useMutation();
mutation.mutate({ name: "Ada", email: "ada@x.com" });
\`\`\`

**Magic:**
- Server types **automatically** flow to client.
- No code generation.
- No schema language.
- Just TypeScript.

**Built on TanStack Query** — the hooks ARE TanStack Query hooks under the hood.

**Pros:**
- **Zero schema duplication** — server is the source of truth.
- **Refactor freely** — rename a procedure, types break in client immediately.
- **Lightweight** — no GraphQL machinery.
- **Validation** with Zod (or other schemas).

**Cons:**
- **TypeScript-only** stack.
- Server and client must share types — usually monorepo.
- Less universal than REST/GraphQL.
- Growing pains: subscriptions, advanced cache features.

**When to pick tRPC:**
- Full-stack TS app, ideally a monorepo.
- Solo dev / small team that values DX.
- No need to expose API to non-TS consumers.

**When NOT to:**
- Public API for external clients.
- Polyglot stack.
- Heavily GraphQL-oriented frontend.

**Stack:** Next.js + tRPC + Prisma + Tailwind = "T3 stack" — popular full-stack TS template.`,
      tags: ["trpc"],
    },
    {
      id: "perf-tquery",
      title: "Performance tuning data fetching",
      difficulty: "hard",
      question: "How do you optimize data fetching performance?",
      answer: `**1. Reduce request count.**
- Cache aggressively — \`staleTime\` longer than default 0.
- Dedupe identical requests (TanStack Query does automatically).
- Batch requests (combine multiple endpoint calls).

**2. Reduce payload size.**
- Pagination / virtual scrolling.
- GraphQL field selection.
- HTTP \`If-None-Match\` (ETag) — server returns 304 if unchanged.
- Compression (gzip/brotli) at transport layer.

**3. Prefetch strategically.**
- Hover prefetch on links.
- Sibling prefetch on lists.
- SSR prefetch for first-load.

**4. Use \`select\` to subscribe to slices.**
- Components only re-render on relevant changes.

**5. Background updates.**
- Show stale data immediately.
- Refresh in background.
- Avoids blocking UI on every fetch.

**6. Window focus refetch tuning.**
- Default ON — refresh when user returns.
- For slow / expensive queries: turn off, use polling or manual refresh.

**7. Garbage collection.**
- Default 5min. For huge datasets, lower it to free memory.
- For long-lived state, raise it.

**8. Suspense for parallel loading.**
\`\`\`tsx
<Suspense fallback={<Spinner/>}>
  <UserData />
  <Stats />
  <Activity />
</Suspense>
\`\`\`
- All three fetch in parallel.
- One suspense fallback.

**9. Network layer:**
- HTTP/2 / HTTP/3 — multiplexing.
- CDN for static API responses.
- Edge caching (Cloudflare KV, Vercel Cache).

**10. Server-side optimization.**
- Database indexes on filtered/sorted columns.
- N+1 query elimination (DataLoader for GraphQL).
- Cache layer (Redis) on slow endpoints.

**11. Devtools.**
- TanStack Query Devtools — see what's fetching, when, why.
- Chrome DevTools Network — find slow / duplicate requests.
- Lighthouse — find blocking resources.

**Premature optimization** is real here too — measure with realistic data first.`,
      tags: ["performance"],
    },
  ],
};
