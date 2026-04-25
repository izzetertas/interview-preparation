import type { Category } from "./types";

export const stateManagement: Category = {
  slug: "state-management",
  title: "State Management",
  description:
    "Client state management: Redux Toolkit, Zustand, Jotai, MobX, Context, immutability, selectors, persistence, and architecture patterns.",
  icon: "🗂️",
  questions: [
    // ───── EASY ─────
    {
      id: "what-is-state",
      title: "What is application state?",
      difficulty: "easy",
      question: "What kinds of state exist in a typical app?",
      answer: `Apps deal with **multiple categories of state**, each with different needs:

- **UI state** — modal open, form input focus, theme. Local, ephemeral.
- **Component state** — internal to a component (toggle, hover). Use \`useState\` / \`ref\`.
- **Shared client state** — cart contents, sidebar collapsed across pages. Lifted to parent or global store.
- **Server state** — data fetched from API. Fetched, cached, refetched. Use TanStack Query / SWR.
- **URL state** — search query, filters, current page. Use search params + router.
- **Form state** — input values, validation, submission. Use react-hook-form / Formik / native.
- **Session state** — auth tokens, user info. Cookies, secure storage.
- **Local persistent state** — user preferences. localStorage / IndexedDB.

**Common mistake:** treating server state like client state — manually syncing fetched data, leading to stale-data bugs and complexity.

**Modern guidance:**
- **Component state** for trivial.
- **TanStack Query / SWR** for server state.
- **URL** for shareable state.
- **Zustand / Jotai / Redux** for *truly global* client state (small subset of app).
- **Context** for theme / locale / current user (low-frequency updates).`,
      tags: ["fundamentals"],
    },
    {
      id: "lifting-state",
      title: "Lifting state up",
      difficulty: "easy",
      question: "What does 'lifting state up' mean?",
      answer: `**Lifting state up** = moving shared state to the **nearest common ancestor** of components that need it.

\`\`\`tsx
// Before — siblings can't share
function Search() { const [q, setQ] = useState(""); ... }
function Results() { ??? where does query come from ??? }

// After — lifted to parent
function Page() {
  const [q, setQ] = useState("");
  return <><Search value={q} onChange={setQ} /><Results query={q} /></>;
}
\`\`\`

**Benefits:**
- **Single source of truth** — no drift between components.
- Predictable data flow (top-down).
- Easy to reason about.

**Costs:**
- **Prop drilling** — passing through intermediate components that don't use the value.
- Can cause unnecessary re-renders if not careful.

**When to stop lifting:**
- If state needs to be shared globally → use Context or store.
- If many sibling components need it but you'd lift to root → consider a store.
- Don't lift just for "future flexibility" — keep state as local as possible.

**Rule of thumb:**
- Component-local first.
- Lift when 2+ siblings need it.
- Promote to global store when 3+ levels deep or many distant consumers.

**Lifting + URL:** for filters/sort/page, lift to URL search params — gives free shareable links + browser history.`,
      tags: ["patterns"],
    },
    {
      id: "context",
      title: "React Context",
      difficulty: "easy",
      question: "When should you use React Context?",
      answer: `**Context** lets you pass data through the component tree without prop drilling.

\`\`\`tsx
const ThemeContext = createContext<"light" | "dark">("light");

function App() {
  return <ThemeContext.Provider value="dark"><Toolbar /></ThemeContext.Provider>;
}

function Button() {
  const theme = useContext(ThemeContext);
  return <button className={theme}>...</button>;
}
\`\`\`

**Good for:**
- **Theme**, locale, current user — low-frequency, app-wide values.
- Decoupling deeply nested components from the root.

**NOT great for:**
- **High-frequency updates** (mouse position, form fields) — every consumer re-renders.
- **General state management at scale** — no built-in selectors.

**Optimization tricks:**
- **Split contexts** by update frequency (static config vs dynamic state).
- **Memoize the Provider value**:
  \`\`\`tsx
  <Ctx.Provider value={useMemo(() => ({a, b}), [a, b])}>
  \`\`\`
- For selective subscriptions, reach for **\`useSyncExternalStore\`** or a real store (Zustand, Jotai).

**Context vs Store:**
- Context — **propagation** mechanism. Doesn't optimize re-renders.
- Store (Zustand, Redux) — **subscription** mechanism. Components only re-render when their slice changes.

**Pattern:** use Context to expose store/hook, but actual state lives in a store with selectors.`,
      tags: ["fundamentals"],
    },
    {
      id: "immutability",
      title: "Immutability",
      difficulty: "easy",
      question: "Why do state libraries require immutability?",
      answer: `**Immutability** = never mutate state in place; always produce a new value.

\`\`\`ts
// ❌ mutation
state.user.name = "Bob";

// ✅ new object
setUser({ ...user, name: "Bob" });
\`\`\`

**Why state libs require it:**
- **Reference equality (===)** to detect changes cheaply.
- React/Redux re-renders when reference changes; mutations confuse this.
- Time-travel debugging — keep history of past states.
- Easier reasoning — old state is still valid; nothing changes underneath you.

**Common immutable updates:**
\`\`\`ts
// Add to array
[...arr, newItem]

// Remove
arr.filter(x => x.id !== id)

// Update one
arr.map(x => x.id === id ? { ...x, name: "new" } : x)

// Object update
{ ...obj, key: value }

// Nested
{ ...obj, user: { ...obj.user, name: "Bob" } }
\`\`\`

**Helpers:**
- **Immer** — write "mutating" code; produces immutable result. Used inside Redux Toolkit.
\`\`\`ts
import { produce } from "immer";
const next = produce(state, draft => { draft.user.name = "Bob"; });
\`\`\`
- **Lodash \`set\`/\`update\`** for deep paths.

**Cost:** copying objects has overhead, but usually negligible vs the bug avoidance + perf optimizations enabled.

**Alternative:** **MobX** — observable mutations + automatic tracking. Different paradigm, valid alternative.`,
      tags: ["patterns"],
    },
    {
      id: "redux-basics",
      title: "Redux basics",
      difficulty: "easy",
      question: "How does Redux work?",
      answer: `**Redux** is a predictable state container:

- **Single store** — one global state tree.
- **Actions** describe events: \`{ type: "ADD_TODO", payload: { ... } }\`.
- **Reducers** are pure functions: \`(state, action) => newState\`.
- Components dispatch actions; reducers compute new state; components re-render based on selected slice.

**Modern Redux Toolkit (RTK):**
\`\`\`ts
import { createSlice, configureStore } from "@reduxjs/toolkit";

const todosSlice = createSlice({
  name: "todos",
  initialState: [],
  reducers: {
    add: (state, { payload }) => { state.push(payload); }, // Immer inside
    remove: (state, { payload }) => state.filter(t => t.id !== payload),
  }
});

export const { add, remove } = todosSlice.actions;
export const store = configureStore({ reducer: { todos: todosSlice.reducer } });
\`\`\`

**Use in React:**
\`\`\`tsx
import { useSelector, useDispatch } from "react-redux";
const todos = useSelector(s => s.todos);
const dispatch = useDispatch();
dispatch(add({ id: 1, text: "Buy milk" }));
\`\`\`

**Strengths:**
- **Devtools** — time travel, action replay.
- **Predictable** — pure reducers.
- Mature ecosystem.
- Strong patterns at scale.

**Weaknesses:**
- Boilerplate (RTK reduces this).
- Overkill for small apps.
- Async patterns require middleware (RTK Query, thunks, sagas).

**Today:** **RTK** (not classic Redux). Start with simpler libs (Zustand, Jotai) for new small apps.`,
      tags: ["redux"],
    },
    {
      id: "zustand",
      title: "Zustand",
      difficulty: "easy",
      question: "What is Zustand and why is it popular?",
      answer: `**Zustand** ("state" in German) is a tiny (~3 KB) state management library. Minimal API, no boilerplate.

\`\`\`ts
import { create } from "zustand";

interface CounterState {
  count: number;
  inc: () => void;
  reset: () => void;
}

export const useCounter = create<CounterState>((set) => ({
  count: 0,
  inc: () => set((s) => ({ count: s.count + 1 })),
  reset: () => set({ count: 0 }),
}));
\`\`\`

**Use:**
\`\`\`tsx
const count = useCounter((s) => s.count);
const inc = useCounter((s) => s.inc);

return <button onClick={inc}>{count}</button>;
\`\`\`

**Selectors prevent re-renders** — components only re-render when their selected slice changes.

**Why popular:**
- **Tiny + zero boilerplate**.
- **No Provider** needed (works without context wrapper).
- **TypeScript-friendly**.
- **Devtools** integration via middleware.
- **Persist middleware** — localStorage sync in 2 lines.
- **Subscribe outside components** — for non-React code.

**Comparison:**
- vs Redux — way less code, similar power.
- vs Jotai — store-based vs atom-based; pick by feel.
- vs Context — proper subscriptions, no re-render-everything.

**Middleware:**
\`\`\`ts
import { persist, devtools } from "zustand/middleware";
const useStore = create(devtools(persist(...)));
\`\`\`

**For most React apps**, Zustand is the modern default.`,
      tags: ["zustand"],
    },
    {
      id: "jotai",
      title: "Jotai (atomic state)",
      difficulty: "easy",
      question: "What is Jotai and how does it differ from Zustand?",
      answer: `**Jotai** ("state" in Japanese) — atomic state management. Each piece of state is an **atom**.

\`\`\`ts
import { atom, useAtom } from "jotai";

const countAtom = atom(0);
const doubledAtom = atom((get) => get(countAtom) * 2);  // derived

function Counter() {
  const [count, setCount] = useAtom(countAtom);
  const [doubled] = useAtom(doubledAtom);
  return <button onClick={() => setCount(c => c + 1)}>{count} (×2 = {doubled})</button>;
}
\`\`\`

**Vs Zustand:**
- **Atom-based** — many small atoms vs one store object.
- **Bottom-up** composition — atoms compose into derived atoms.
- Familiar API to **Recoil** (similar atomic model).
- Great for fine-grained reactivity.

**Atom types:**
- **Primitive atom** — \`atom(initialValue)\`.
- **Derived atom** — \`atom((get) => ...)\` — read-only computed.
- **Writable derived** — \`atom((get) => ..., (get, set, update) => ...)\`.
- **Async atom** — \`atom(async () => fetch(...))\` — combines with Suspense.

**Strengths:**
- **No selectors needed** — each atom is independently subscribed.
- **Suspense + async atoms** built in.
- Tiny (~3 KB).
- TypeScript-first.

**Weaknesses:**
- Many small atoms can be hard to discover/document.
- Less ecosystem than Redux/Zustand.

**Pick Jotai when:**
- Heavy use of derived state.
- Suspense + async data integration.
- Atomic mental model fits your domain.

**Recoil** is similar but Meta has been quieter on it; Jotai is the actively-maintained choice.`,
      tags: ["jotai"],
    },
    {
      id: "mobx",
      title: "MobX",
      difficulty: "easy",
      question: "How does MobX differ from Redux/Zustand?",
      answer: `**MobX** uses **observable mutations** + automatic dependency tracking. Different paradigm from immutable stores.

\`\`\`ts
import { makeAutoObservable } from "mobx";
import { observer } from "mobx-react-lite";

class CounterStore {
  count = 0;
  constructor() { makeAutoObservable(this); }
  inc() { this.count++; }                          // mutate directly!
  get doubled() { return this.count * 2; }
}

const store = new CounterStore();

const Counter = observer(() => (
  <button onClick={() => store.inc()}>{store.count} (×2 = {store.doubled})</button>
));
\`\`\`

**Strengths:**
- **Mutations feel natural** — no spread operators, no immutability ceremony.
- **Automatic dependency tracking** — observer re-renders only when its observed state changes.
- Excellent TypeScript support.
- Class-based (or functional with \`makeAutoObservable\`).
- Vue's reactivity is similar.

**Weaknesses:**
- Different mental model from React's "state is immutable."
- Devtools less polished than Redux.
- Sometimes harder to reason about "where is this state coming from."

**Use cases:**
- Apps with **complex domain models** (CAD tools, editors, dashboards).
- Teams familiar with OOP / observable patterns.
- Vue developers moving to React.

**MobX-State-Tree (MST)** — opinionated extension with snapshots, time travel, and Redux-like patterns on top of MobX.

**Adoption:** smaller than Redux/Zustand but loyal community. Still used in production.`,
      tags: ["mobx"],
    },

    // ───── MEDIUM ─────
    {
      id: "selectors",
      title: "Selectors",
      difficulty: "medium",
      question: "What are selectors and why do they matter?",
      answer: `**Selector** = function that derives a value from state.

\`\`\`ts
const selectActiveTodos = (state) => state.todos.filter(t => !t.done);
\`\`\`

**Why use selectors:**
- **Reusable** — share derivation logic.
- **Encapsulation** — components don't know about state shape.
- **Memoization** — avoid re-computing on every render.

**Memoized selectors with Reselect:**
\`\`\`ts
import { createSelector } from "reselect";

const selectTodos = (state) => state.todos;
const selectActiveTodos = createSelector(
  [selectTodos],
  (todos) => todos.filter(t => !t.done)
);
\`\`\`
- Caches result based on input identity.
- Re-computes only when inputs change.

**RTK comes with \`createSelector\` built in** via \`@reduxjs/toolkit\`.

**Selector hooks:**
- Redux: \`useSelector(selectActiveTodos)\`.
- Zustand: \`useStore((s) => s.todos.filter(t => !t.done))\` — but recompute every render unless memoized.
- Jotai: derived atoms ARE selectors.

**Performance:**
- Selectors that return **new objects/arrays** cause re-renders even if "equal."
- Use **shallow equal** check or pre-memoized selectors.

**Pattern: domain selectors next to slice:**
\`\`\`ts
// todosSlice.ts
export const selectTodos = (s: RootState) => s.todos;
export const selectActiveTodos = createSelector([selectTodos], ts => ts.filter(t => !t.done));
\`\`\`

Selectors are an under-appreciated tool — moving derivations out of components keeps them clean and performant.`,
      tags: ["patterns"],
    },
    {
      id: "redux-thunks-rtk-query",
      title: "Async with thunks and RTK Query",
      difficulty: "medium",
      question: "How do you handle async actions in Redux?",
      answer: `**Thunks** — middleware that lets you dispatch functions instead of plain actions.

\`\`\`ts
import { createAsyncThunk } from "@reduxjs/toolkit";

export const fetchUsers = createAsyncThunk("users/fetch", async () => {
  const res = await fetch("/api/users");
  return await res.json();
});

const slice = createSlice({
  name: "users",
  initialState: { data: [], loading: false, error: null },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (s) => { s.loading = true; })
      .addCase(fetchUsers.fulfilled, (s, a) => { s.loading = false; s.data = a.payload; })
      .addCase(fetchUsers.rejected, (s, a) => { s.loading = false; s.error = a.error.message; });
  },
});
\`\`\`

\`\`\`tsx
useEffect(() => { dispatch(fetchUsers()); }, []);
\`\`\`

**RTK Query** — declarative data fetching layer for Redux. Replaces hand-rolled thunks for most CRUD APIs.

\`\`\`ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["User"],
  endpoints: (b) => ({
    getUsers: b.query<User[], void>({
      query: () => "/users",
      providesTags: ["User"],
    }),
    addUser: b.mutation<User, Partial<User>>({
      query: (body) => ({ url: "/users", method: "POST", body }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const { useGetUsersQuery, useAddUserMutation } = api;
\`\`\`

\`\`\`tsx
const { data, isLoading } = useGetUsersQuery();
const [addUser] = useAddUserMutation();
\`\`\`

**RTK Query gives you:**
- Caching, refetching, polling, invalidation.
- Loading/error states.
- Optimistic updates.
- TypeScript inference.

**vs TanStack Query:**
- RTK Query bundled with Redux.
- TanStack Query is independent, broader features, broader popularity.
- For new projects without Redux, **TanStack Query** is the default.`,
      tags: ["redux", "async"],
    },
    {
      id: "persistence",
      title: "Persisting state",
      difficulty: "medium",
      question: "How do you persist state to localStorage / sync devices?",
      answer: `**localStorage persistence:**

**Zustand:**
\`\`\`ts
import { persist } from "zustand/middleware";

const useStore = create(persist(
  (set) => ({ count: 0, inc: () => set((s) => ({ count: s.count + 1 })) }),
  { name: "counter-store" }
));
\`\`\`

**Redux:**
\`\`\`ts
import { persistReducer, persistStore } from "redux-persist";
const persistedReducer = persistReducer({ key: "root", storage }, reducer);
\`\`\`

**Jotai:**
\`\`\`ts
import { atomWithStorage } from "jotai/utils";
const themeAtom = atomWithStorage("theme", "light");
\`\`\`

**Manual:**
\`\`\`ts
useEffect(() => {
  localStorage.setItem("key", JSON.stringify(state));
}, [state]);
\`\`\`

**Considerations:**
- **Don't persist sensitive data** in localStorage (XSS exposure).
- Watch storage size limits (~5-10 MB).
- Migrate schema between versions:
\`\`\`ts
persist(stateCreator, {
  name: "store",
  version: 2,
  migrate: (persisted, version) => {
    if (version < 2) return migrateFrom1to2(persisted);
    return persisted;
  },
});
\`\`\`

**Cross-device sync** (cloud-backed):
- **Auth + backend** (this site uses Supabase RLS).
- **Firebase Realtime DB / Firestore**.
- **Liveblocks / PartyKit / Yjs** for collaborative state.
- **Replicache / RxDB** for sync engines.

**IndexedDB** for larger / structured data:
- Native API but verbose. Use **idb** wrapper.
- For querying, use **Dexie** or **PouchDB**.
- Or use a sync engine (above).

**Hydration mismatches:** persisted state must wait for client mount before rendering.
- React: use \`useEffect\` to set after mount.
- Next: \`"use client"\` + post-mount initialization.`,
      tags: ["persistence"],
    },
    {
      id: "form-state",
      title: "Form state libraries",
      difficulty: "medium",
      question: "Why use a form library?",
      answer: `Forms are stateful, validated, and async — handcrafting them is tedious.

**Popular libraries:**

**React Hook Form:**
\`\`\`tsx
import { useForm } from "react-hook-form";

function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  return (
    <form onSubmit={handleSubmit(data => api.login(data))}>
      <input {...register("email", { required: true })} />
      {errors.email && <span>Required</span>}
      <button>Submit</button>
    </form>
  );
}
\`\`\`
- **Uncontrolled** by default — minimal re-renders.
- Tiny bundle.
- TypeScript support.
- Resolvers for Zod, Yup, Joi schemas.

**Formik** — older, controlled-by-default, more re-renders. Less common in new code.

**TanStack Form** — newer alternative; framework-agnostic.

**Vue:**
- **VeeValidate** — most popular.
- **FormKit** — opinionated, includes UI.
- **Pinia + composables** for custom approach.

**Validation:**
- **Zod** — TypeScript-first schema validation. Pair with React Hook Form via \`@hookform/resolvers/zod\`.
- **Yup** — older alternative.
- **Valibot** — smaller, modern.

**Server-side validation** is non-negotiable; client validation is UX. Always re-validate on the server.

**Async validation:**
- "Username taken" check while typing.
- Debounce; show loading state.

**Dynamic forms:**
- Fields added/removed at runtime.
- React Hook Form's \`useFieldArray\` handles this.

**Multi-step / wizards:**
- Persist partial state.
- Use a library or roll your own with state lifted to parent.

**Native HTML form** for simple cases — \`<form>\` + browser validation gets you far.`,
      tags: ["forms"],
    },
    {
      id: "url-state",
      title: "URL as state",
      difficulty: "medium",
      question: "When should state live in the URL?",
      answer: `URL search params (\`?q=hello&page=2\`) are perfect for **shareable / bookmarkable** state:

- Search queries.
- Filter selections.
- Pagination cursor.
- Selected tab / view.
- Sort order.

**Why URL:**
- **Shareable links** — copy/paste preserves state.
- **Browser back/forward** — works automatically.
- **No persistence code** needed.
- **SSR-friendly** — server can render initial state.

**APIs:**
- **Web standard:** \`URLSearchParams\`.
- **React Router:** \`useSearchParams()\`.
- **Next.js:** \`searchParams\` prop in pages, \`useSearchParams\` hook in client components.
- **TanStack Router** — typed search params (best DX for typed URLs).

**Patterns:**
\`\`\`ts
const [params, setParams] = useSearchParams();
const q = params.get("q") ?? "";
const setQ = (val: string) => setParams({ q: val });
\`\`\`

**Sync with form:**
\`\`\`tsx
<input value={q} onChange={e => setQ(e.target.value)} />
\`\`\`

**Considerations:**
- **Encode** properly (\`URLSearchParams\` handles).
- **Replace vs push** — typing in search → replace (no history spam); intentional navigation → push.
- **Debounce** updates to avoid history thrashing.
- **Validate** on the server (URL is user-controlled).

**TanStack Router superpower:**
\`\`\`ts
const route = createRoute({
  validateSearch: z.object({ q: z.string().optional(), page: z.number().default(1) }),
});
const { q, page } = route.useSearch();   // typed!
\`\`\`

**Anti-pattern:** putting **everything** in URL. Sensitive or transient state shouldn't be there.`,
      tags: ["patterns"],
    },
    {
      id: "context-vs-store",
      title: "Context vs Store",
      difficulty: "medium",
      question: "When should you reach for a store instead of Context?",
      answer: `**React Context limitations:**
- Every consumer re-renders when **any** value in the Provider changes.
- No selectors — can't subscribe to a slice.
- Multiple Providers nest awkwardly.
- Can become slow with frequent updates.

**Use Context for:**
- **Static or low-frequency** values: theme, locale, current user.
- **Singleton dependency injection**: API client, logger.
- **Wrapping store consumers** (the Provider exposes the store; the store handles selective subscription).

**Use a store for:**
- Frequently updating shared state (cart, notifications, real-time data).
- Need for selectors / fine-grained subscription.
- Cross-component coordination.

**Pattern:** Context-as-store-injection.
\`\`\`tsx
const StoreContext = createContext<MyStore | null>(null);

function Provider({ children }) {
  const [store] = useState(() => createStore());
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

function useMyState<T>(selector: (s: State) => T): T {
  const store = useContext(StoreContext)!;
  return useSyncExternalStore(store.subscribe, () => selector(store.get()));
}
\`\`\`

This pattern is exactly what **Zustand**, **MobX**, and **Redux** do internally.

**Vue equivalent:**
- \`provide\`/\`inject\` for DI.
- Pinia for actual store.

**Quick rule:**
- Theme + lang + user = Context.
- Anything that updates often = store.
- "I'm passing this prop down 3+ levels" = consider Context or store.`,
      tags: ["patterns"],
    },
    {
      id: "global-vs-local",
      title: "Global vs local state",
      difficulty: "medium",
      question: "How do you decide what's global vs local?",
      answer: `**Local state** (component): visible to one component.
**Global state**: visible to many components anywhere.

**Default: keep state local.** Only promote when necessary.

**Promote to shared/global when:**
- **Multiple distant components** need to read or write.
- State needs to **persist across mount/unmount** (modal open, sidebar collapsed).
- Cross-page consistency required (cart, auth user).

**Keep local when:**
- Only one component (or tight subtree) uses it.
- Lifetime tied to the component.
- Form-internal state.

**Anti-patterns:**
- **Putting everything in Redux** — forms, mouse position, hover state. Bloats store; slows app.
- **Avoiding global at all costs** — leads to extreme prop drilling.

**Hierarchy of "where state lives":**
1. **Component state** — defaults; \`useState\` / \`ref\`.
2. **Lifted to common parent** — siblings sharing.
3. **URL** — shareable, bookmarkable.
4. **Server state** — TanStack Query / SWR.
5. **Context** — low-frequency, app-wide singletons.
6. **Store (Zustand/Redux/Jotai)** — high-frequency cross-component.
7. **Persistent storage** — localStorage / IndexedDB / cloud.

**Rule:** start at the lowest level; promote upward only when the next level fails.

**Server state in client store** is an anti-pattern. Use TanStack Query for server data — handles caching, retry, invalidation, much better than rolling your own.`,
      tags: ["architecture"],
    },
    {
      id: "use-sync-external-store",
      title: "useSyncExternalStore",
      difficulty: "medium",
      question: "What is useSyncExternalStore and why does it exist?",
      answer: `\`useSyncExternalStore\` is a React hook for **subscribing to external stores** safely under concurrent rendering.

\`\`\`ts
const value = useSyncExternalStore(
  subscribe,        // (cb) => () => void
  getSnapshot,      // () => T
  getServerSnapshot // () => T (for SSR)
);
\`\`\`

**Why it exists:**
- Pre-React 18, libraries integrated with React via \`useState\` + manual subscription.
- **Concurrent rendering** can interleave reads — a render started before an update may see the new value half-way through, causing **tearing** (different parts of UI showing different state).
- \`useSyncExternalStore\` guarantees a consistent snapshot during a render.

**Library use cases:**
- Redux's \`useSelector\` is implemented via this.
- Zustand uses it internally.
- Custom stores should use it.

**Application use cases:**
- Subscribing to **DOM APIs** (online status, localStorage, media query).
\`\`\`ts
const isOnline = useSyncExternalStore(
  cb => { window.addEventListener("online", cb); window.addEventListener("offline", cb); return () => { ... }; },
  () => navigator.onLine,
  () => true
);
\`\`\`

**Rules:**
- \`getSnapshot\` must be **fast and stable** — same input, same output.
- Returning a new object identity each call causes infinite re-renders.

**For most app developers:** you won't write \`useSyncExternalStore\` directly. You'll use libraries that do — Zustand, Jotai, Redux. Knowing it exists explains how those libraries integrate with React.`,
      tags: ["advanced"],
    },

    // ───── HARD ─────
    {
      id: "store-architecture",
      title: "Store architecture patterns",
      difficulty: "hard",
      question: "How do you organize a large store?",
      answer: `**Single store vs multiple stores:**
- Redux: traditionally one store, sliced via \`combineReducers\`.
- Zustand / Jotai: multiple small stores per domain encouraged.
- Trade-off: discoverability vs decoupling.

**Slice-per-domain pattern (Redux Toolkit):**
\`\`\`ts
const userSlice = createSlice({ name: "user", ... });
const cartSlice = createSlice({ name: "cart", ... });
const productSlice = createSlice({ name: "products", ... });

const store = configureStore({
  reducer: { user: userSlice.reducer, cart: cartSlice.reducer, products: productSlice.reducer }
});
\`\`\`

**Feature folders:**
\`\`\`
src/
  features/
    auth/
      authSlice.ts
      authSelectors.ts
      AuthForm.tsx
    cart/
      cartSlice.ts
      CartItem.tsx
\`\`\`

**Normalized state** (Redux):
- Store entities by ID, references to IDs.
- Avoids duplication; updates one place.
\`\`\`ts
{
  posts: { byId: { 1: {...}, 2: {...} }, allIds: [1, 2] },
  comments: { byId: { ... }, allIds: [...] }
}
\`\`\`
- \`createEntityAdapter\` (RTK) automates this.

**Don't over-architect:**
- Most apps don't need 20 slices.
- Start simple, refactor when you feel pain.

**Cross-slice logic:**
- Selectors that combine slices.
- Async thunks that read/write multiple.
- Event-driven updates via middleware.

**Module separation:**
- Public API per slice — selectors + actions exported, internal state shape hidden.
- Helps refactor without breaking consumers.

**Bad patterns:**
- Components dispatching from random places.
- Selectors duplicated across components.
- Action types as untyped strings.

RTK enforces good patterns by default; freer libs (Zustand, Jotai) require discipline.`,
      tags: ["architecture"],
    },
    {
      id: "tearing-and-concurrency",
      title: "Tearing and concurrent React",
      difficulty: "hard",
      question: "What is tearing and how do state libraries prevent it?",
      answer: `**Tearing** = different components show different versions of the same state in the same render — UI looks "torn."

**Cause:** React 18's concurrent rendering can pause/resume work. If state changes mid-render, components rendered after the change see new state; ones before see old state.

**Example:** counter store updates from \`5\` to \`6\` while React is rendering a list. Some items show 5, some show 6 — tearing.

**Pre-React 18:** rendering was synchronous; not an issue.

**\`useSyncExternalStore\`** prevents tearing:
- React calls \`getSnapshot\` and uses the value consistently for the whole render.
- If the store changes during render, React aborts and re-renders.
- All consumers see the **same snapshot**.

**Affected libraries (now fixed):**
- Pre-React 18 versions of Redux, Zustand, MobX could tear.
- Modern versions use \`useSyncExternalStore\`.

**For library authors:**
- Always use \`useSyncExternalStore\` for store integration.
- \`getSnapshot\` must return the same reference if value hasn't changed (otherwise infinite re-renders).

**For app developers:**
- Use up-to-date library versions.
- Avoid mutating values returned by selectors.
- Avoid expensive computations in selectors (use Reselect / memoization).

**Other concurrency concerns:**
- **Stale closures** in event handlers that reference state captured at mount.
- **Race conditions** between async updates.
- **Suspense transitions** — startTransition makes some updates non-urgent.

These are all part of why the React team built **Suspense, useTransition, useDeferredValue** — to give controlled tools for async UI.`,
      tags: ["advanced"],
    },
    {
      id: "redux-middleware",
      title: "Redux middleware",
      difficulty: "hard",
      question: "How does Redux middleware work?",
      answer: `**Middleware** sits between dispatch and the reducer — wraps actions, can intercept, transform, dispatch new actions, side-effect.

\`\`\`ts
const logger = (store) => (next) => (action) => {
  console.log("dispatching", action);
  const result = next(action);
  console.log("next state", store.getState());
  return result;
};

const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});
\`\`\`

**Common built-in middleware:**
- **redux-thunk** — dispatch functions for async (default in RTK).
- **redux-saga** — generator-based async flows; complex orchestration.
- **redux-observable** — RxJS-based.
- **logger** — console output.
- **immutable check / serializable check** — RTK dev-only.

**Use cases:**
- Logging.
- Async (thunks, sagas).
- Crash reporting (Sentry).
- Routing transitions.
- Throttling / debouncing actions.
- API requests.

**Order matters:** middleware runs in order. Place loggers last so they see post-thunk dispatches.

**Composing:**
\`\`\`ts
applyMiddleware(thunk, logger, sentry)
\`\`\`

**Sagas vs thunks:**
- **Thunks** — simple async; just functions.
- **Sagas** — complex orchestration (race, take, cancel); steeper learning curve.
- For most apps, thunks (or RTK Query) suffice.

**RTK Query is middleware** — adds caching/refetching at the dispatch layer.

**Compared to other libs:**
- Zustand has no middleware concept; you compose with \`set\`/\`get\`.
- MobX uses reactions / autorun for side effects.
- Jotai uses atoms with effects.

Middleware is one of Redux's most flexible features; also a source of complexity. Use sparingly.`,
      tags: ["redux", "advanced"],
    },
    {
      id: "performance",
      title: "State management performance",
      difficulty: "hard",
      question: "What are common state management performance pitfalls?",
      answer: `**1. New object identities causing re-renders.**
- \`useSelector(s => ({ a: s.a, b: s.b }))\` — new object every render.
- Use multiple selectors, or shallowEqual, or memoize:
\`\`\`ts
useSelector(s => ({ a: s.a, b: s.b }), shallowEqual);
\`\`\`

**2. Selectors recomputing.**
- \`useSelector(s => s.todos.filter(...))\` recomputes every render.
- Use **createSelector** (Reselect) to memoize.

**3. Context re-rendering everything.**
- Provider value changes → all consumers re-render.
- Split contexts; memoize value; or move to a store.

**4. Storing derived data in state.**
- Re-derive on each render with computed/selectors.
- Don't store \`fullName\` if you have \`first\` + \`last\`.

**5. Over-globalizing.**
- Forms / hover / mouse position in Redux = constant churn.
- Keep these local.

**6. Frequent updates without batching.**
- 100 updates → 100 renders. React 18 auto-batches in event handlers, but not always async.
- Use \`flushSync\` sparingly; batch where possible.

**7. Subscribing to too much.**
- Component subscribes to root store object → re-renders on any state change.
- Subscribe to specific slices via selectors.

**Tools:**
- **React DevTools Profiler** — see what's re-rendering.
- **Redux DevTools** — action history.
- **Why-did-you-render** library — flags unnecessary re-renders.

**Architecture:**
- Atomic stores (Jotai) often perform better than monolithic stores (Redux) for complex apps because each atom is independently subscribed.
- **Server state in TanStack Query, not in client store** — much better caching/invalidation.

**Premature optimization:**
- Don't memoize everything — adds complexity.
- Profile first, optimize what matters.`,
      tags: ["performance"],
    },
  ],
};
