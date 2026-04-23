import type { Category } from "./types";

export const react: Category = {
  slug: "react",
  title: "React",
  description:
    "React from components and hooks to reconciliation, concurrent rendering, server components, and performance patterns.",
  icon: "⚛️",
  questions: [
    // ───────── EASY ─────────
    {
      id: "what-is-react",
      title: "What is React?",
      difficulty: "easy",
      question: "What is React and what problems does it solve?",
      answer: `**React** is a JavaScript library for building user interfaces around **components** — reusable pieces of UI that describe what should appear on screen for a given state.

**Core ideas:**
- **Declarative** — you describe *what* the UI should look like; React figures out *how* to update the DOM.
- **Component model** — compose UIs from small functions that return JSX.
- **Unidirectional data flow** — data flows from parent to child via props; children signal back via callbacks.
- **Virtual DOM + reconciliation** — React builds an in-memory tree of elements, diffs it against the previous tree, and applies the minimum set of DOM changes.

\`\`\`jsx
function Greeting({ name }) {
  return <h1>Hello, {name}</h1>;
}
\`\`\`

**Why not just the DOM API?** Manually keeping \`textContent\`, classes, and child nodes in sync with state gets unmanageable fast. React's model is "re-render your view from state, I'll diff" — so UI bugs caused by forgetting to update some DOM field largely go away.`,
      tags: ["fundamentals"],
    },
    {
      id: "jsx",
      title: "JSX",
      difficulty: "easy",
      question: "What is JSX, and what does it compile to?",
      answer: `**JSX** is a syntax extension that lets you write HTML-like markup inside JavaScript. It is **not** HTML — attributes are camelCase (\`className\`, \`onClick\`), children can be any expression, and elements are JavaScript.

\`\`\`jsx
const el = <button className="primary" onClick={handleClick}>Save</button>;
\`\`\`

Compiles (via Babel / SWC) to a call to the JSX runtime:

\`\`\`js
import { jsx as _jsx } from "react/jsx-runtime";
const el = _jsx("button", { className: "primary", onClick: handleClick, children: "Save" });
\`\`\`

**Rules worth knowing:**
- **Only one root element** (use a \`<Fragment>\` or \`<>...</>\` to group siblings).
- \`class\` → \`className\`, \`for\` → \`htmlFor\`.
- **Expressions in braces**: \`{value}\`, \`{cond && <X/>}\`, \`{items.map(i => <li key={i.id}/>)}\`.
- **Components start with uppercase** — lowercase names are treated as DOM tags.
- JSX is an *expression* — you can return it, store it in a variable, or pass it as a prop.`,
      tags: ["fundamentals", "syntax"],
    },
    {
      id: "components-props",
      title: "Components and props",
      difficulty: "easy",
      question: "What are props and how do they work?",
      answer: `A **component** is a function that takes **props** (its inputs) and returns React elements describing its UI.

\`\`\`jsx
function Avatar({ name, src, size = 48 }) {
  return <img src={src} alt={name} width={size} height={size} />;
}

<Avatar name="Ada" src="/ada.jpg" size={64} />
\`\`\`

**Key points:**
- Props are **read-only** inside the component. Never mutate them. If a child needs its own state, use \`useState\`.
- Data flows **one way** — parent → child via props. Children talk back via callback props: \`onSelect={id => ...}\`.
- \`children\` is a reserved prop — the content between \`<X>...</X>\`. It can be any node, including other components.
- Use **destructuring** for readability and to set **default values** (\`{ size = 48 }\`).
- Prefer many small components over one giant one — React's strength is composition.`,
      tags: ["fundamentals", "components"],
    },
    {
      id: "state-usestate",
      title: "State with useState",
      difficulty: "easy",
      question: "How does useState work?",
      answer: `\`useState\` adds local state to a function component. It returns a pair: the current value and a setter.

\`\`\`jsx
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
\`\`\`

**Important behaviors:**
- Calling the setter with a new value **schedules a re-render**. State updates are asynchronous in the sense that the new value is not visible in the same tick.
- **Functional updates** are safer when the new state depends on the previous:
  \`\`\`jsx
  setCount(c => c + 1);   // works even if called multiple times in one handler
  \`\`\`
- **Bailout**: if you set state to the *same* value (\`Object.is\` compare), React skips the re-render.
- **State is per-component-instance** — rendering two \`<Counter/>\`s gives each its own state.
- Don't put derived values in state that you can compute from props or other state during render.`,
      tags: ["fundamentals", "hooks"],
    },
    {
      id: "conditional-lists",
      title: "Conditional rendering and lists (keys)",
      difficulty: "easy",
      question: "How do you render conditionally and render lists correctly?",
      answer: `**Conditionals** use regular JS — \`&&\`, ternaries, or early returns:
\`\`\`jsx
{isLoading && <Spinner/>}
{user ? <Welcome name={user.name}/> : <SignIn/>}
\`\`\`

**Lists** use \`.map\` and each item needs a stable, unique **\`key\`**:
\`\`\`jsx
<ul>
  {users.map(u => <li key={u.id}>{u.name}</li>)}
</ul>
\`\`\`

**Why keys matter:** React uses keys to match list items across renders. With stable keys, React can tell "this row is the same row, just moved" and preserve its DOM/state. Without good keys, state (like focus or \`<input>\` values) jumps around.

**Rules:**
- Keys should be **unique among siblings** and **stable** across renders.
- **Don't use the array index** as a key unless the list never reorders or changes.
- Don't generate keys at render time (\`key={Math.random()}\`) — every render creates new keys and React recreates every DOM node.

**Gotcha:** the falsy value \`0\` renders as "0" in JSX, but \`false\` / \`null\` render nothing. Guard with \`x && <X/>\` carefully when \`x\` can be 0.`,
      tags: ["fundamentals", "rendering"],
    },
    {
      id: "events",
      title: "Handling events",
      difficulty: "easy",
      question: "How do React event handlers differ from DOM events?",
      answer: `React wraps native DOM events in **SyntheticEvent** for cross-browser consistency.

\`\`\`jsx
<button onClick={e => {
  e.preventDefault();
  console.log(e.currentTarget);
}}>Click</button>
\`\`\`

**Key differences from addEventListener:**
- camelCase names: \`onClick\`, \`onChange\`, \`onKeyDown\`.
- The handler receives a \`SyntheticEvent\` with the same API as native events.
- **Event delegation** — React attaches a single listener at the root and dispatches synthetically. Since React 17 this is the app's root container, not \`document\`.
- \`e.stopPropagation()\` stops React's propagation, not necessarily native listeners attached elsewhere. Use \`e.nativeEvent.stopImmediatePropagation()\` to reach the underlying event.

**Common pitfalls:**
- Don't call the handler: \`onClick={handleClick}\` ✅, \`onClick={handleClick()}\` ❌ (calls immediately during render).
- Inline arrow functions create new references every render — fine for most cases, but can break \`React.memo\` optimizations.
- \`onChange\` fires on every keystroke (like native \`input\`), not only on blur like native \`change\`.`,
      tags: ["fundamentals", "events"],
    },
    {
      id: "controlled-uncontrolled",
      title: "Controlled vs uncontrolled inputs",
      difficulty: "easy",
      question: "What's the difference between a controlled and uncontrolled input?",
      answer: `- **Controlled** — React state is the source of truth. Value is driven by state; changes go through an \`onChange\` handler.
- **Uncontrolled** — the DOM holds the value. You read it via a \`ref\` (or on submit).

\`\`\`jsx
// Controlled
const [email, setEmail] = useState("");
<input value={email} onChange={e => setEmail(e.target.value)} />

// Uncontrolled
const inputRef = useRef(null);
<input defaultValue="" ref={inputRef} />
// later: inputRef.current.value
\`\`\`

**When to use which:**
- **Controlled** — when you need to validate, format, conditionally disable, or reflect the value elsewhere.
- **Uncontrolled** — for simple forms where you only need values on submit; file inputs (always uncontrolled); when performance matters on huge forms.

**Common bug:** passing \`value\` without \`onChange\` silently makes the input **read-only** (React warns in dev). Either provide an onChange or use \`defaultValue\`.`,
      tags: ["forms", "fundamentals"],
    },
    {
      id: "children",
      title: "The children prop",
      difficulty: "easy",
      question: "What is the children prop and how do you use it?",
      answer: `\`children\` is whatever JSX you put between a component's opening and closing tags. It's a prop like any other, just named \`children\`.

\`\`\`jsx
function Card({ title, children }) {
  return (
    <section className="card">
      <h2>{title}</h2>
      <div className="body">{children}</div>
    </section>
  );
}

<Card title="Hello">
  <p>Anything here becomes the children prop.</p>
</Card>
\`\`\`

**Patterns:**
- **Composition over props** — instead of a huge prop API, accept \`children\` and let callers pass whatever.
- **Render prop via function children**:
  \`\`\`jsx
  <Mouse>{({ x, y }) => <p>{x}, {y}</p>}</Mouse>
  \`\`\`
- **Multiple slots** — accept specific props instead of relying on \`children.filter\`:
  \`\`\`jsx
  <Layout header={<Nav/>} footer={<Footer/>}>...</Layout>
  \`\`\`

**\`React.Children\` utilities** (\`map\`, \`count\`, \`only\`, \`toArray\`) exist but are usually overkill — prefer accepting arrays directly or using \`children\` as an opaque node.`,
      tags: ["fundamentals", "composition"],
    },

    // ───────── MEDIUM ─────────
    {
      id: "useeffect",
      title: "useEffect: what, when, cleanup",
      difficulty: "medium",
      question: "How does useEffect work, and when does cleanup run?",
      answer: `\`useEffect\` runs **after** the component renders and the DOM is committed. It's how you synchronize React with external systems (network, subscriptions, timers, DOM APIs).

\`\`\`jsx
useEffect(() => {
  const id = setInterval(() => setNow(Date.now()), 1000);
  return () => clearInterval(id);           // cleanup
}, []);                                     // [] = run once after mount
\`\`\`

**Dependencies:**
- \`[a, b]\` — re-run when \`a\` or \`b\` changes (referential equality).
- \`[]\` — run once (after mount).
- *no array* — run after **every** render (rarely what you want).

**Cleanup runs:**
1. Before every re-run of the effect (to tear down the previous subscription).
2. When the component unmounts.

**Common mistakes:**
- **Missing dependencies** → stale closures. The ESLint rule \`react-hooks/exhaustive-deps\` catches this.
- **Infinite loops** — setting state unconditionally in an effect that depends on that state.
- **Race conditions** in async effects — guard with a \`cancelled\` flag or \`AbortController\`:
  \`\`\`jsx
  useEffect(() => {
    const ac = new AbortController();
    fetch(url, { signal: ac.signal }).then(...);
    return () => ac.abort();
  }, [url]);
  \`\`\`

**Strict Mode** double-invokes effects in development to surface cleanup bugs — a feature, not a bug.`,
      tags: ["hooks", "core"],
    },
    {
      id: "usememo-usecallback",
      title: "useMemo and useCallback",
      difficulty: "medium",
      question: "When should you use useMemo and useCallback?",
      answer: `Both memoize between renders:

- **\`useMemo(fn, deps)\`** — caches the *return value* of \`fn\` while \`deps\` are equal.
- **\`useCallback(fn, deps)\`** — caches the *function itself*. Equivalent to \`useMemo(() => fn, deps)\`.

\`\`\`jsx
const sorted = useMemo(() => items.slice().sort(cmp), [items]);
const handleClick = useCallback((id) => select(id), [select]);
\`\`\`

**When they actually help:**
1. **Expensive computations** — heavy sort/filter/compute whose result you want to skip re-calculating.
2. **Stable identity for downstream memoization** — passing a function or object as a prop to a \`React.memo\` child, or as a dependency to another \`useEffect\` / \`useMemo\`.

**When they hurt:**
- On *cheap* values, the memoization overhead (comparing deps) is wasted.
- Wrapping every callback/value creates code noise without measurable wins.
- **\`useCallback\` alone does not prevent re-renders** — the child must be wrapped in \`React.memo\` for the stable reference to matter.

**Rule of thumb:** profile first. Don't pre-optimize. React's new compiler (React Compiler / "Forget") automates much of this.`,
      tags: ["hooks", "performance"],
    },
    {
      id: "useref",
      title: "useRef: values and DOM refs",
      difficulty: "medium",
      question: "What are the two roles of useRef?",
      answer: `\`useRef(initial)\` returns an object \`{ current: initial }\` that **persists across renders** and does **not** trigger re-renders when you mutate it.

**Two uses:**

1. **Access a DOM node** (ref forwarding):
\`\`\`jsx
const inputRef = useRef(null);
useEffect(() => inputRef.current.focus(), []);
return <input ref={inputRef} />;
\`\`\`

2. **Store mutable instance-like values** without re-rendering:
\`\`\`jsx
const timerId = useRef(null);
const startTimer = () => { timerId.current = setInterval(...); };
\`\`\`

**Use cases beyond the DOM:**
- Previous-value tracking: \`const prevCount = useRef(count); useEffect(() => { prevCount.current = count; });\`
- Cache of latest callback in custom hooks.
- Avoid closures capturing stale values inside long-lived intervals.

**Don't:**
- Rely on ref values for rendering — changes won't cause updates.
- Read \`ref.current\` during render for data that affects output — the timing is not guaranteed; use state instead.

**forwardRef + useImperativeHandle** expose a custom imperative API from a child to its parent. Use sparingly — prefer declarative props.`,
      tags: ["hooks", "refs"],
    },
    {
      id: "context",
      title: "React Context",
      difficulty: "medium",
      question: "What is Context and when should you use it?",
      answer: `**Context** passes a value down the component tree without prop-drilling. Create a context, wrap a subtree in a provider, read it anywhere with \`useContext\`.

\`\`\`jsx
const ThemeContext = createContext("light");

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Toolbar />
    </ThemeContext.Provider>
  );
}

function ThemedButton() {
  const theme = useContext(ThemeContext);
  return <button className={theme}>Click</button>;
}
\`\`\`

**Good for:**
- Theme, locale, auth user — low-frequency, app-wide values.
- Decoupling deeply nested components from the root.

**Not great for:**
- **High-frequency updates** (mouse position, form field-level state) — every consumer re-renders on every change.
- **General state management** at scale — Context has no built-in selectors; every consumer re-renders on any change.

**Optimization patterns:**
- **Split contexts** by update frequency (static config vs. frequently-changing state).
- **Memoize the provider's value**: \`<Ctx.Provider value={useMemo(() => ({a, b}), [a, b])}>\`.
- For selective subscriptions at scale, reach for Zustand, Jotai, Redux, or \`useSyncExternalStore\`.`,
      tags: ["state", "patterns"],
    },
    {
      id: "lifting-state",
      title: "Lifting state up",
      difficulty: "medium",
      question: "What does 'lifting state up' mean?",
      answer: `When two sibling components need to share or synchronize state, **move the state to their nearest common ancestor**. Pass the value down as props, and pass a setter (or callback) to update it.

\`\`\`jsx
function Parent() {
  const [filter, setFilter] = useState("");
  return (
    <>
      <SearchBox value={filter} onChange={setFilter} />
      <ResultsList query={filter} />
    </>
  );
}
\`\`\`

**Why:**
- React is unidirectional. Siblings can't directly see each other's state.
- Lifting gives you a **single source of truth** per piece of state.
- Makes the data flow obvious — you can read the tree top-down.

**How far up?**
- Move state up exactly as far as necessary — no further. Over-hoisting couples unrelated components and bloats re-render scope.

**When lifting hurts:**
- When the shared state is truly global (theme, auth), use Context instead of threading through 10 layers.
- When you find yourself passing the same 5 props through 4 levels, introduce a Context or a dedicated hook.`,
      tags: ["patterns", "state"],
    },
    {
      id: "reconciliation",
      title: "Reconciliation and the virtual DOM",
      difficulty: "medium",
      question: "How does React reconcile updates?",
      answer: `When state changes, React re-runs the component to produce a new element tree, then **reconciles** (diffs) it against the previous tree and applies the minimum set of DOM changes.

**Heuristics:**
- **Different element types** → React unmounts the old subtree and mounts the new one fresh. Changing \`<div>\` to \`<span>\` loses any state below.
- **Same type** → React updates the existing DOM node in place (props diff), and recurses into children.
- **List children** use **keys** to match elements across renders. Stable keys preserve state; changing or missing keys destroy and recreate.

**Implications:**
- **Don't define components inside other components.** The new component is a *different* function each render, so React mounts a fresh subtree every time — all state is lost.
  \`\`\`jsx
  function Parent() {
    const Inner = () => <input/>;   // ❌ new component identity each render
    return <Inner/>;
  }
  \`\`\`
- **Conditional wrapping** (sometimes wrap in \`<div>\`, sometimes not) will cause remounts on toggle — use the same wrapper with conditional props.
- React uses a **Fiber** architecture internally, allowing it to split work into chunks and pause/resume (the basis for concurrent rendering).`,
      tags: ["internals", "rendering"],
    },
    {
      id: "hooks-rules",
      title: "Rules of hooks",
      difficulty: "medium",
      question: "What are the rules of hooks and why?",
      answer: `**Two rules:**
1. **Only call hooks at the top level.** Not inside conditionals, loops, or nested functions.
2. **Only call hooks from React functions** (components, custom hooks). Not from regular JS functions or class methods.

\`\`\`jsx
// ❌ wrong
if (someCondition) useEffect(() => {});
for (let x of arr) useState(x);

// ✅ right — consistent order each render
const [name, setName] = useState("");
useEffect(() => {}, []);
\`\`\`

**Why:** React tracks hooks by **call order**, not name. If you call hooks conditionally, their positions shift between renders, and React mixes up which hook is which — leading to silent data corruption.

**Consequences:**
- Early return before all hooks have run → bug.
- Conditionally choose which hook to use based on props → bug. Instead, always call the same hooks and conditionally use their results.

**Custom hooks** are just functions starting with \`use\`. The linter enforces the rules by detecting \`use\`-prefixed functions. They compose hooks for reuse — any shared, hook-based logic goes here.`,
      tags: ["hooks", "fundamentals"],
    },
    {
      id: "react-memo",
      title: "React.memo",
      difficulty: "medium",
      question: "What is React.memo and when does it actually help?",
      answer: `\`React.memo(Component)\` skips re-rendering a component if its props are shallow-equal to the previous render.

\`\`\`jsx
const Row = React.memo(function Row({ user, onSelect }) {
  return <li onClick={() => onSelect(user.id)}>{user.name}</li>;
});
\`\`\`

**When it helps:**
- The component is moderately expensive to render.
- Its props are stable across most re-renders of its parent (primitives, memoized objects/functions).
- It renders inside a list that re-renders often.

**When it hurts or does nothing:**
- Parent passes a new inline object/function each render → shallow compare fails every time → memoization is useless.
- The component is cheap; comparing props costs more than rendering.
- Children below are expensive anyway — React still re-renders them unless they're individually memoized.

**Gotchas:**
- Children in \`children\` often change references (JSX creates a new object each render). Wrapping a component with \`children\` prop in \`memo\` rarely helps.
- \`React.memo\` accepts a custom compare function, but an incorrect one (missing a real dep) leads to bugs.

**Modern alternative:** the React Compiler (a.k.a. React Forget) auto-memoizes components and hooks based on dep analysis — goal is to remove the need to reach for \`React.memo\` / \`useMemo\` / \`useCallback\` by hand.`,
      tags: ["performance", "optimization"],
    },
    {
      id: "custom-hooks",
      title: "Custom hooks",
      difficulty: "medium",
      question: "What are custom hooks and when do you write one?",
      answer: `A **custom hook** is a function starting with \`use\` that calls other hooks. It's how you extract stateful, reusable logic out of a component.

\`\`\`jsx
function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key)) ?? initial; }
    catch { return initial; }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }, [key, value]);
  return [value, setValue];
}

function Settings() {
  const [theme, setTheme] = useLocalStorage("theme", "light");
  ...
}
\`\`\`

**Benefits:**
- **Reuse** of logic without the render-prop / HOC ceremony.
- **Encapsulation** — keep component bodies focused on UI, custom hooks focused on behavior.
- **Composable** — hooks call other hooks naturally.

**Rules still apply:** custom hooks obey the Rules of Hooks. The linter treats any \`use*\`-named function as a hook.

**Common patterns:** \`useDebouncedValue\`, \`useIntersectionObserver\`, \`useMediaQuery\`, \`useFetch\`, \`useKeyboardShortcut\`. Resist the urge to pack unrelated logic into one giant \`useEverything\` hook — keep them small and single-purpose.`,
      tags: ["hooks", "patterns"],
    },
    {
      id: "batching",
      title: "State update batching",
      difficulty: "medium",
      question: "How does React batch state updates?",
      answer: `When you call setState multiple times inside an event handler (or effect), React **batches** them into a single re-render.

\`\`\`jsx
function onClick() {
  setA(1);      // doesn't re-render yet
  setB(2);      // batched
  setC(3);      // batched
}
// ... one re-render with A=1, B=2, C=3
\`\`\`

**React 18+ automatic batching** extends this to **every** source — timers, promises, native event handlers. Pre-18 only React-synthesized events batched; code inside \`setTimeout\`/\`fetch.then\` caused multiple renders.

**Functional updates** are still crucial when the next state depends on the previous:
\`\`\`jsx
function onClick() {
  setCount(c => c + 1);
  setCount(c => c + 1);   // both apply → +2
  // vs setCount(count+1); setCount(count+1) → +1 (stale closure)
}
\`\`\`

**Opt out with \`flushSync\`** when you *need* a synchronous commit (e.g. before measuring a DOM element):
\`\`\`jsx
flushSync(() => setValue("new"));
node.scrollIntoView();   // reflects the new value
\`\`\`

Use rarely; defeats concurrent rendering optimizations.`,
      tags: ["performance", "hooks"],
    },

    // ───────── HARD ─────────
    {
      id: "usereducer",
      title: "useReducer",
      difficulty: "hard",
      question: "When should you use useReducer instead of useState?",
      answer: `\`useReducer\` is like \`useState\`, but updates go through a **reducer function** \`(state, action) => newState\`.

\`\`\`jsx
const initial = { count: 0, step: 1 };
function reducer(state, action) {
  switch (action.type) {
    case "inc":      return { ...state, count: state.count + state.step };
    case "set-step": return { ...state, step: action.value };
    default: throw new Error();
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initial);
  return <button onClick={() => dispatch({ type: "inc" })}>{state.count}</button>;
}
\`\`\`

**Prefer \`useReducer\` when:**
- State has **multiple sub-values** that change together.
- Next state often depends on previous state in non-trivial ways.
- Update logic is getting complex — centralizing it in a reducer keeps components readable and testable.
- You want to pass a **stable \`dispatch\`** through context (its identity never changes), avoiding re-render cascades.

**\`dispatch\` is stable** — you can safely include it in effect dependencies without retriggering.

**\`useReducer\` + Context** is often a lightweight alternative to Redux for app-level state, though for high-frequency updates you still want a store with selectors.`,
      tags: ["hooks", "state"],
    },
    {
      id: "uselayouteffect",
      title: "useEffect vs useLayoutEffect",
      difficulty: "hard",
      question: "When do you use useLayoutEffect?",
      answer: `Both run after the component renders, but:

| Hook               | Timing                                                                 |
|--------------------|------------------------------------------------------------------------|
| \`useEffect\`         | After commit, **after** the browser paints (async, doesn't block)     |
| \`useLayoutEffect\`   | After commit, **before** the browser paints (synchronous, blocks)    |

**Use \`useLayoutEffect\` when** you must **read** layout and **synchronously** re-render before the user sees the intermediate state:

\`\`\`jsx
function Tooltip({ anchorRef, children }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useLayoutEffect(() => {
    const r = anchorRef.current.getBoundingClientRect();
    setPos({ x: r.x, y: r.bottom });
  }, [anchorRef]);
  return <div style={{ position: "absolute", ...pos }}>{children}</div>;
}
\`\`\`

Using \`useEffect\` here would flash the tooltip at (0,0) for a frame before repositioning.

**Caveats:**
- Blocks painting → heavier. Don't overuse.
- Not supported during SSR — produces a warning. Use a \`useIsomorphicLayoutEffect\` that falls back to \`useEffect\` on the server, or gate behind \`typeof window !== 'undefined'\`.`,
      tags: ["hooks", "advanced"],
    },
    {
      id: "suspense-lazy",
      title: "Suspense and React.lazy",
      difficulty: "hard",
      question: "What is Suspense and how does React.lazy use it?",
      answer: `**Suspense** lets components "suspend" — pause rendering until something (data, code, image) is ready, while showing a fallback.

\`\`\`jsx
const UserProfile = React.lazy(() => import("./UserProfile"));

<Suspense fallback={<Spinner/>}>
  <UserProfile userId="u1" />
</Suspense>
\`\`\`

**How it works:** when a component throws a **Promise**, React catches it, renders the nearest \`<Suspense>\` fallback, and retries after the promise resolves. \`React.lazy\` implements this for **code splitting** — the import returns a promise; the fallback shows while the chunk loads.

**Suspense is also for data** in frameworks / libraries that integrate with it (TanStack Query, Relay, Next.js App Router). A data fetch suspends until the data is available.

**Benefits:**
- **Coordinated loading states** — nested Suspense boundaries let you choose what "loads together" vs. separately.
- **No loading flicker** for already-cached data.
- Combined with **streaming SSR**, the server sends HTML incrementally; the client progressively hydrates as data arrives.

**Limits:**
- Raw \`fetch\` + \`useEffect\` doesn't integrate with Suspense; you need a library that throws a promise.
- Error handling requires **Error Boundaries** around Suspense.`,
      tags: ["advanced", "rendering"],
    },
    {
      id: "error-boundaries",
      title: "Error boundaries",
      difficulty: "hard",
      question: "What are error boundaries and how do you create one?",
      answer: `An **error boundary** is a component that **catches errors in its descendants' render, lifecycle methods, and constructors**, preventing the whole tree from unmounting.

**Only class components can be error boundaries** (no hook version yet):

\`\`\`jsx
class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info)          { logToService(error, info); }

  render() {
    if (this.state.error) return <Fallback error={this.state.error} />;
    return this.props.children;
  }
}

<ErrorBoundary>
  <Dashboard />
</ErrorBoundary>
\`\`\`

**What they catch:**
- Errors thrown during render.
- Errors in lifecycle methods.
- Errors in constructors.

**What they don't catch:**
- Event handlers — wrap with \`try/catch\` yourself.
- Async code (setTimeout, promises).
- Server-side rendering errors (framework handles separately).
- Errors in the boundary itself.

**Strategy:** place multiple boundaries — one at the app root, one per feature/route — so a bug in one section doesn't blank the whole UI.

**Libraries:** \`react-error-boundary\` provides a hook-friendly API and reset mechanisms without writing a class.`,
      tags: ["advanced", "errors"],
    },
    {
      id: "concurrent-rendering",
      title: "Concurrent rendering, useTransition, useDeferredValue",
      difficulty: "hard",
      question: "What is concurrent rendering and what hooks come with it?",
      answer: `**Concurrent rendering** (React 18+) lets React **interrupt** a render to prioritize something more urgent, then resume. The user never sees the half-finished render — React commits only completed trees.

**\`useTransition\`** marks an update as non-urgent (low priority). Urgent updates (typing) stay snappy even while a heavy update (filtering 10k rows) is in flight.

\`\`\`jsx
const [isPending, startTransition] = useTransition();

function onChange(e) {
  setQuery(e.target.value);                        // urgent (typing)
  startTransition(() => setFiltered(filter(...))); // non-urgent
}
{isPending && <Spinner/>}
\`\`\`

**\`useDeferredValue\`** returns a debounced-ish copy of a value that updates with lower priority. Useful when you can't control where the state is set.

\`\`\`jsx
const deferred = useDeferredValue(query);
<HeavyList query={deferred}/>
\`\`\`

**What concurrent enables:**
- Suspense data fetching without blocking the UI.
- \`useTransition\` for "stay responsive while computing."
- Automatic batching across async boundaries.
- Time-sliced rendering of long lists.

**Strict Mode in React 18** double-mounts components in development to surface improper cleanup — preparing code for future "reusable state" features that may mount/unmount rapidly.`,
      tags: ["advanced", "performance"],
    },
    {
      id: "usesyncexternalstore",
      title: "useSyncExternalStore",
      difficulty: "hard",
      question: "What is useSyncExternalStore for?",
      answer: `\`useSyncExternalStore\` is the official primitive for subscribing to **external stores** (Redux, Zustand, browser APIs) safely under concurrent rendering.

\`\`\`jsx
const width = useSyncExternalStore(
  callback => { window.addEventListener("resize", callback); return () => window.removeEventListener("resize", callback); },
  () => window.innerWidth,     // client snapshot
  () => 1024                   // server snapshot (SSR)
);
\`\`\`

**Three arguments:**
1. \`subscribe(callback)\` — register listener, return unsubscribe.
2. \`getSnapshot()\` — return the current value. Must be cheap and consistent.
3. (optional) \`getServerSnapshot()\` — value to use during SSR.

**Why it exists:** without it, external stores can produce **torn** UI under concurrent rendering — different parts of the tree reading different versions of the store during a single render. This hook guarantees a consistent snapshot.

**Who uses it:**
- \`react-redux\` (hooks version), Zustand, Jotai, Valtio — all internally via this.
- Custom subscribers to DOM APIs (online status, media queries, scroll position, localStorage) where a fresh value per render matters.

You rarely call it directly in application code; it's mostly a library primitive. But knowing it exists explains why many stores now ship updated React adapters.`,
      tags: ["advanced", "state"],
    },
    {
      id: "rsc",
      title: "Server Components",
      difficulty: "hard",
      question: "What are React Server Components and how do they differ from SSR?",
      answer: `**React Server Components (RSC)** run on the **server only**. They have zero JS bundle footprint on the client. They can \`await\` directly in the component body and access backend resources (DB, filesystem, secret env vars).

\`\`\`jsx
// UserPage.server.jsx — runs on server
async function UserPage({ id }) {
  const user = await db.user.findOne({ id });
  return <UserCard user={user} />;
}
\`\`\`

**Key distinction from classic SSR:**
- SSR renders a **full React tree** to HTML, sends it, then hydrates on the client with the **same JS**.
- RSC produces a **serialized UI payload** (not HTML) that the client merges into its React tree. Components marked server-only **never ship to the client**.

**Client components** (marked \`"use client"\` at the top of the file) are the interactive parts — state, effects, event handlers. They can be imported from server components but not vice versa.

\`\`\`jsx
// search.client.jsx
"use client";
export function Search() { const [q, setQ] = useState(""); ... }
\`\`\`

**Benefits:**
- Smaller client bundles — heavy deps (markdown parsers, ORMs) stay on the server.
- Direct data access — no separate API layer for simple reads.
- Automatic streaming and Suspense integration.

**Trade-offs:**
- Two component "worlds" to reason about.
- Third-party libraries need to be RSC-aware to use them in server components.
- The mental model is still maturing; frameworks (Next.js App Router, Remix, Expo Router) implement it differently in places.`,
      tags: ["advanced", "ssr"],
    },
    {
      id: "forwardref-useimperative",
      title: "forwardRef and useImperativeHandle",
      difficulty: "hard",
      question: "When do you reach for forwardRef and useImperativeHandle?",
      answer: `By default, \`ref\` on a function component is \`null\` — refs only attach to DOM nodes or class components.

**\`forwardRef\`** lets a function component **accept a ref** and forward it to a child (usually a DOM node):

\`\`\`jsx
const Input = React.forwardRef(function Input(props, ref) {
  return <input ref={ref} {...props} />;
});

const ref = useRef(null);
<Input ref={ref} />;
ref.current.focus();
\`\`\`

**\`useImperativeHandle\`** lets the component **customize what the ref exposes** — an imperative API tailored to consumers:

\`\`\`jsx
const VideoPlayer = forwardRef(function VideoPlayer(props, ref) {
  const videoRef = useRef();
  useImperativeHandle(ref, () => ({
    play()  { videoRef.current.play(); },
    pause() { videoRef.current.pause(); },
    seek(t) { videoRef.current.currentTime = t; },
  }), []);
  return <video ref={videoRef} src={props.src} />;
});
\`\`\`

**When to use:**
- Exposing focus(), scrollIntoView(), or play/pause APIs in reusable components.
- Bridging to non-React libraries (maps, charts).
- Testing: expose imperative helpers for testing internals.

**When not to:**
- Anything you can model declaratively with props. Refs escape the React data flow — if two places mutate the same node imperatively, bugs compound quickly. Reach for imperative APIs only when declarative ones don't fit.

**React 19+ simplifies this:** \`ref\` is becoming a regular prop — no more \`forwardRef\` wrapper needed.`,
      tags: ["advanced", "refs"],
    },
    {
      id: "portals",
      title: "Portals",
      difficulty: "hard",
      question: "What are React portals and when are they useful?",
      answer: `A **portal** renders children into a DOM node **outside** the parent's DOM hierarchy, while keeping them inside the React tree for events, context, and state.

\`\`\`jsx
import { createPortal } from "react-dom";

function Modal({ children }) {
  return createPortal(
    <div className="modal">{children}</div>,
    document.getElementById("modal-root")
  );
}
\`\`\`

**Why it matters:**
- **CSS escape hatch.** \`overflow: hidden\`, \`z-index\`, \`transform\` on ancestors can clip or hide a child. Rendering into \`<body>\` sidesteps all of that.
- **Modals, toasts, tooltips, dropdowns** — UI that should visually float above everything but logically belongs to a deep component.

**What stays "React-connected":**
- Event bubbling — a click inside a portal still bubbles up the *React* tree, not the DOM tree. Parent handlers still fire.
- Context, state, and lifecycle are unchanged.
- Focus management works across the portal boundary.

**Considerations:**
- The target DOM node must exist before render. SSR frameworks typically expose a slot for this.
- Accessibility: portals for modals need **focus trap + aria-modal + inert background** — easy to get wrong. Prefer native \`<dialog>\` or a vetted library (Radix, Headless UI) that handles this.

**Native \`<dialog>\`** is increasingly the right choice — it handles backdrop, focus, and top-layer rendering natively, often removing the need for a portal.`,
      tags: ["advanced", "dom"],
    },
  ],
};
