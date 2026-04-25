import type { Category } from "./types";

export const jsEngine: Category = {
  slug: "js-engine",
  title: "JavaScript Engine / V8",
  description:
    "How JS engines work under the hood: V8 internals, parsing, JIT tiers, hidden classes, garbage collection, memory layout, and engine-level performance.",
  icon: "⚙️",
  questions: [
    // ───── EASY ─────
    {
      id: "what-is-js-engine",
      title: "What is a JavaScript engine?",
      difficulty: "easy",
      question: "What is a JavaScript engine and what does it actually do?",
      answer: `A **JavaScript engine** is a program that **parses, compiles, and executes** JavaScript source code. It turns text into running machine instructions.

**Core responsibilities:**
- **Parse** source → **AST** (abstract syntax tree).
- **Compile** AST → **bytecode** (and often **machine code** via JIT).
- **Execute** the resulting code.
- **Manage memory** (allocation + garbage collection).
- **Implement** the ECMAScript spec (built-ins like \`Array\`, \`Promise\`, \`Map\`).
- **Expose** an embedding API so hosts (browsers, Node) can run JS.

**Major engines:**

| Engine          | Vendor    | Used in                     |
|-----------------|-----------|-----------------------------|
| **V8**          | Google    | Chrome, Node.js, Deno, Edge |
| **SpiderMonkey**| Mozilla   | Firefox                     |
| **JavaScriptCore (JSC)** | Apple | Safari, Bun         |
| **Hermes**      | Meta      | React Native                |
| **ChakraCore**  | Microsoft | Old Edge (deprecated)       |

**An engine is NOT:**
- The DOM (provided by the browser).
- The event loop (provided by the host — browser or libuv in Node).
- The standard library beyond ECMAScript (no \`fs\`, no \`fetch\` natively).

> The engine runs JS; the **host environment** wires it up to the outside world (DOM, network, files, timers).`,
      tags: ["fundamentals"],
    },
    {
      id: "v8-pipeline",
      title: "V8 execution pipeline",
      difficulty: "easy",
      question: "What's the high-level pipeline V8 uses to run JS?",
      answer: `V8 uses a **multi-tier pipeline** that progressively optimizes hot code.

\`\`\`
Source ──► Parser ──► AST ──► Ignition ──► Bytecode
                                    │
                                    ▼
                              Sparkplug (baseline machine code)
                                    │
                                    ▼
                                 Maglev (mid-tier optimizer)
                                    │
                                    ▼
                                TurboFan (top-tier optimizer)
\`\`\`

**Stages:**
- **Parser** — tokenizes and builds the AST. V8 does **lazy parsing** for functions not yet called.
- **Ignition** — interpreter that executes **bytecode** directly. Fast startup, low memory.
- **Sparkplug** — non-optimizing baseline JIT; cheap **bytecode → machine code** translation.
- **Maglev** — mid-tier optimizing compiler (added 2023). Faster to compile than TurboFan, faster code than Sparkplug.
- **TurboFan** — top-tier optimizer. Aggressive inlining, type speculation, escape analysis. Slow to compile, fast to run.

**Tiering up:** code starts in Ignition. As it gets hot, V8 promotes it through Sparkplug → Maglev → TurboFan.

**Tiering down (deopt):** if assumptions break, V8 throws away optimized code and drops back to bytecode.

\`\`\`js
function add(a, b) { return a + b; }
for (let i = 0; i < 1e6; i++) add(i, i);  // becomes hot, gets optimized
\`\`\`

**Key idea:** start cheap, optimize what matters.`,
      tags: ["v8"],
    },
    {
      id: "stack-vs-heap",
      title: "Stack vs heap",
      difficulty: "easy",
      question: "Where do primitives and objects live in memory?",
      answer: `JavaScript values live in two main places: the **call stack** and the **heap**.

**Stack:**
- Stores **call frames** (function locals, return addresses).
- LIFO — push on call, pop on return.
- Fast allocation (just bump a pointer).
- Limited size (recursion blows it up: \`RangeError: Maximum call stack size exceeded\`).

**Heap:**
- Stores **objects, closures, arrays, strings**.
- Arbitrary lifetime — managed by the **garbage collector**.
- Slower allocation than stack but flexible.

**Primitives vs objects:**

| Value           | Where it lives                      |
|-----------------|-------------------------------------|
| \`number\` (SMI)| Inline in the stack/object slot     |
| \`number\` (double) | Heap-boxed (HeapNumber)         |
| \`boolean\`, \`null\`, \`undefined\` | Inline (singleton tags) |
| \`string\`      | Heap (with intern table for short)  |
| \`object\` / array / function | Heap                  |
| \`bigint\`      | Heap                                |

**SMI = Small Integer** — V8 optimization where 31-bit (32-bit arch) or 32-bit (64-bit arch) integers are tagged and stored **inline**, no heap allocation. Hugely faster for integer-heavy code.

\`\`\`js
const a = 42;          // SMI — inline
const b = 3.14;        // double — HeapNumber
const c = { x: 1 };    // heap object; reference held on stack
\`\`\`

**Variables on the stack hold references** to heap objects — never the object itself.`,
      tags: ["memory"],
    },
    {
      id: "gc-basics",
      title: "Garbage collection basics",
      difficulty: "easy",
      question: "What is garbage collection in JavaScript?",
      answer: `**Garbage collection (GC)** automatically reclaims memory occupied by **unreachable** objects — anything no longer reachable from a **root** (globals, current call stack, active closures).

**Mark-and-sweep (the canonical algorithm):**
1. **Mark** — start from roots, traverse references, mark live objects.
2. **Sweep** — free everything not marked.

**Reachability, not reference counting:**
- JS engines use reachability — they don't track refcounts.
- Cycles between unreachable objects are still collected.

\`\`\`js
let a = { name: "A" };
let b = { name: "B" };
a.partner = b;
b.partner = a;
a = null;
b = null;
// both objects unreachable → collected, despite the cycle
\`\`\`

**Generational hypothesis:**
- **Most objects die young.** Short-lived temps dominate allocations.
- Engines split the heap into **generations**:

| Generation     | Holds                    | Collected           |
|----------------|--------------------------|---------------------|
| **Young (new)**| Just-allocated objects   | Often, fast         |
| **Old**        | Survived several GCs     | Rarely, more work   |

**Surviving young → old** is called **promotion** or **tenuring**.

**Why care:**
- GC pauses can affect frame rate (animation jank).
- Long-lived references (caches, listeners) extend object lifetime → more work for old-gen GC.
- Allocating a lot in a hot loop creates **GC pressure**.

> You don't free memory manually. You *control reachability* — drop references and GC does the rest.`,
      tags: ["gc"],
    },
    {
      id: "closures-engine",
      title: "Closures at the engine level",
      difficulty: "easy",
      question: "How do closures work inside a JS engine?",
      answer: `A **closure** is a function bundled with its **lexical environment** — the variables it captured from outer scopes.

**Engine view:**
- Each function has a hidden **\`[[Environment]]\`** slot pointing to the scope where it was created.
- When the function is called, a new **execution context** chains to that environment.
- Captured variables live on a **closure record** in the heap, not the stack — so they survive after the outer function returns.

\`\`\`js
function makeCounter() {
  let count = 0;
  return () => ++count;
}
const c = makeCounter();
c(); c(); c();   // 3
\`\`\`

After \`makeCounter\` returns, its activation record would normally be popped from the stack. But V8 sees that \`count\` is captured, so it **allocates a context object on the heap** holding \`count\`. The returned arrow function references it.

**Engine optimizations:**
- **Variable analysis at parse time** — only captured variables get a heap context. Locals that aren't captured stay on the stack.
- **Context flattening** — V8 may collapse multiple nested contexts.
- **Inlining** — small closures may be inlined into call sites by TurboFan.

**Cost of closures:**
- Heap allocation per closure instance.
- Indirection on variable access (one extra pointer hop).
- Usually negligible — but **don't create closures in tight inner loops** when you can hoist.

**Common leak:** a closure accidentally captures a huge object (e.g. an event handler closing over the entire component instance). The object can't be collected as long as the listener is attached.`,
      tags: ["closures"],
    },
    {
      id: "single-threaded",
      title: "Single-threaded JS, multi-threaded engine",
      difficulty: "easy",
      question: "Is JavaScript really single-threaded?",
      answer: `**JavaScript code** runs on **one main thread** per realm. The **engine itself**, however, uses multiple threads.

**What runs on the main thread:**
- Your JS code (functions, callbacks, microtasks).
- Synchronous DOM access (in the browser).
- The event loop driving them.

**What runs off-thread inside the engine:**
- **Background parsing / compiling** — V8 compiles big scripts on worker threads.
- **TurboFan / Maglev optimization** — concurrent compilers.
- **Concurrent garbage collection** — marking happens in parallel with JS.
- **Background sweeping** in old-gen GC.

**Outside the engine:**
- Browser **Web APIs** (network, timers, IndexedDB) run on host threads.
- **Web Workers / Worker Threads** run JS on a separate thread, but each has its **own isolate / realm** — no shared memory except via \`SharedArrayBuffer\`.

\`\`\`js
// Main thread JS
const w = new Worker("worker.js");
w.postMessage({ task: "compute" });
w.onmessage = e => console.log(e.data);
\`\`\`

**Why "single-threaded" still holds:**
- You never see two pieces of JS running at the same time on the main thread.
- No need for locks around regular variables.
- Concurrency is **cooperative** — microtasks/tasks run between turns of the event loop.

> Your JS sees a single thread; the engine quietly parallelizes the boring parts.`,
      tags: ["concurrency"],
    },
    {
      id: "embedders",
      title: "V8 embedders",
      difficulty: "easy",
      question: "What does it mean to embed V8 and what are the major embedders?",
      answer: `**Embedding** = linking V8 (a C++ library) into a host application that wants to run JS. V8 is just an engine; it needs an **embedder** to be useful.

**Major V8 embedders:**

| Embedder        | What it adds                                           |
|-----------------|--------------------------------------------------------|
| **Chrome**      | DOM, CSS, Web APIs, multi-process renderer model       |
| **Node.js**     | libuv event loop, CommonJS/ESM resolver, \`fs\`/\`net\`/etc. |
| **Deno**        | Rust-based runtime, secure-by-default, Web APIs        |
| **Cloudflare Workers** | V8 isolates per request, Workers runtime APIs   |
| **Electron**    | Chromium + Node combined for desktop apps              |

**Each embedder provides:**
- An **event loop** (browser's task queue, libuv in Node).
- **Host objects** beyond ECMAScript (\`document\`, \`process\`, etc.).
- **Module loading** rules.
- **Security boundaries** (origin model, file system permissions).

**JavaScriptCore embedders:** Safari, Bun, GNOME (GJS).
**SpiderMonkey embedders:** Firefox, Thunderbird.
**Hermes embedder:** React Native.

**Implication:**
- The same JS code can behave differently because of embedder APIs (\`fetch\` exists in browsers, was added later to Node 18+, native to Deno/Bun).
- Engine version matters for language features; embedder version matters for APIs.

\`\`\`sh
node -e "console.log(process.versions)"
# { node: '20.x', v8: '11.x', uv: '1.x', ... }
\`\`\`

> V8 is the engine; Node, Chrome, Deno, and Workers are different cars built around it.`,
      tags: ["fundamentals"],
    },

    // ───── MEDIUM ─────
    {
      id: "hidden-classes",
      title: "Hidden classes and shapes",
      difficulty: "medium",
      question: "What are V8 hidden classes (shapes) and why do they matter?",
      answer: `JavaScript objects look dynamic, but V8 fakes a static structure under the hood using **hidden classes** (also called **shapes** or **maps** depending on the engine).

**Why:**
- Dictionary lookup for every property access is slow.
- Engines want to access \`obj.x\` like a C++ struct — at a fixed offset.
- Hidden classes let them.

**How it works:**
\`\`\`js
function Point(x, y) {
  this.x = x;   // transition: empty → {x}
  this.y = y;   // transition: {x} → {x, y}
}

const p1 = new Point(1, 2);
const p2 = new Point(3, 4);
// p1 and p2 share the same hidden class — same property order, same offsets.
\`\`\`

**Property reads** become fixed-offset loads guarded by an **inline cache** keyed on the hidden class.

**What breaks shape sharing:**
- **Adding properties in different order** — \`new Point\` adding \`y\` then \`x\` produces a *different* shape than \`x\` then \`y\`.
- **Adding properties later** — \`p.z = 9\` creates a new transition.
- **\`delete obj.x\`** — usually flips the object into **dictionary mode** (slow).
- **Mixing types** in the same slot.

**Best practices:**
- **Initialize all properties in the constructor**, in the **same order**.
- **Don't \`delete\`** — set to \`null\`/\`undefined\` instead, or restructure data.
- Avoid sparse, ad-hoc objects; prefer consistent shapes.
- Use \`class\` syntax — it nudges you toward consistent construction.

> Two objects with the **same shape** are fast. Diverging shapes is the silent killer of V8 perf.`,
      tags: ["v8", "performance"],
    },
    {
      id: "inline-caches",
      title: "Inline caches and call site polymorphism",
      difficulty: "medium",
      question: "What's the difference between monomorphic, polymorphic, and megamorphic call sites?",
      answer: `Every property access and function call site in V8 has an **inline cache (IC)** that records the shapes seen there. The IC's state determines how fast the site runs.

**States:**

| State          | Shapes seen | Speed             |
|----------------|-------------|-------------------|
| **Uninitialized** | 0       | Slow (first hit)  |
| **Monomorphic**| 1           | **Fastest**       |
| **Polymorphic**| 2-4         | Fast, slower      |
| **Megamorphic**| 5+          | Slow (dictionary) |

**Example:**
\`\`\`js
function getX(o) { return o.x; }

getX({ x: 1, y: 2 });        // shape A — monomorphic on A
getX({ x: 1, y: 2 });        // still A — still mono
getX({ x: 1, y: 2, z: 3 });  // shape B — polymorphic
getX({ x: 1, w: 4 });        // shape C — still poly
// add a few more shapes...   // becomes megamorphic
\`\`\`

**Why poly/mega is slow:**
- Mono: one shape check, one offset load.
- Poly: 2-4 shape checks, then load.
- Mega: fall back to a dictionary lookup; the optimizer often gives up.

**Practical guidance:**
- Pass **objects of the same shape** through hot functions.
- Avoid functions that take "anything" if it's on a hot path.
- For generic helpers, accept the perf hit consciously — most code isn't hot.
- **Class instances** tend to share shapes naturally — good.
- **Mixing array types** through a function (sometimes \`number[]\`, sometimes \`object[]\`) is also megamorphic.

**Tools:** run Node with \`--trace-ic\` to see IC transitions.

> Mono = engine's dream; mega = engine's nightmare.`,
      tags: ["v8", "performance"],
    },
    {
      id: "jit-tiers",
      title: "JIT tiers and deoptimization",
      difficulty: "medium",
      question: "How does V8's tiered JIT compilation work and what triggers deopt?",
      answer: `V8 progressively **promotes** code to faster tiers and can **deoptimize** when its assumptions break.

**Tiers (modern V8):**

| Tier         | Purpose                              | Speed     |
|--------------|--------------------------------------|-----------|
| **Ignition** | Bytecode interpreter, fast start     | Slow      |
| **Sparkplug**| Baseline JIT, no type speculation    | Medium    |
| **Maglev**   | Mid-tier optimizer (since 2023)      | Fast      |
| **TurboFan** | Top-tier optimizer, aggressive       | Fastest   |

**How tier-up works:**
- V8 collects **type feedback** from ICs in Ignition/Sparkplug.
- A function that runs hot gets compiled to Maglev → TurboFan with **type speculation** based on what was observed.
- Optimized code includes **guards**: if a value's shape/type differs from speculation, **bail out**.

**Deoptimization triggers:**
- A property access sees a **new hidden class**.
- A number-typed slot suddenly holds an object.
- Array transitions (PACKED_SMI → HOLEY_DOUBLES, etc.).
- Calling \`arguments\` in a way that wasn't expected.
- \`try/catch/finally\` patterns that block optimization (mostly fixed in modern V8).
- \`with\` and \`eval\` in the function (still kills optimization).

\`\`\`js
function add(a, b) { return a + b; }
for (let i = 0; i < 1e5; i++) add(i, i);     // optimized for SMI+SMI
add("foo", "bar");                            // deopt — string concat
\`\`\`

**Tools:**
\`\`\`sh
node --trace-opt --trace-deopt script.js
node --allow-natives-syntax script.js   # %OptimizeFunctionOnNextCall
\`\`\`

**Bouncing:** if a function deopts and re-optimizes repeatedly, V8 marks it **unoptimizable**. Avoid this by keeping types stable.`,
      tags: ["jit"],
    },
    {
      id: "v8-gc-details",
      title: "V8 garbage collector internals",
      difficulty: "medium",
      question: "What are the parts of V8's garbage collector?",
      answer: `V8's GC (codenamed **Orinoco**) is a **generational, mostly-concurrent** collector.

**Heap layout:**

| Space            | Holds                                | GC                |
|------------------|--------------------------------------|-------------------|
| **New space**    | Young objects                        | Scavenger         |
| **Old space**    | Long-lived objects                   | Mark-Compact      |
| **Large object** | > ~512 KB allocations                | Mark-Sweep        |
| **Code space**   | JIT-compiled code                    | Mark-Compact      |
| **Map space**    | Hidden classes                       | Mark-Compact      |

**Scavenger (young-gen):**
- Cheney's algorithm (semispace copying).
- Two halves: **from-space** and **to-space**.
- Live objects are **copied** to to-space; the rest is bulk-freed.
- Survivors of two scavenges are **promoted** to old space.
- Fast, runs often, only touches young objects.

**Mark-Compact (old-gen):**
- **Mark** — traverse from roots, mark live objects.
- **Compact** — slide live objects together to defragment.
- Slower; runs less often.

**Concurrent / parallel features:**
- **Concurrent marking** — marks while JS runs (since 2018).
- **Parallel scavenging** — multiple GC threads on young-gen.
- **Incremental marking** — split into small chunks to avoid long pauses.
- **Lazy sweeping** — sweep on demand.

**Write barriers:**
- When old-gen objects point to young-gen, V8 records the cross-reference so the scavenger doesn't miss it.

**Pauses:**
- Modern V8 keeps stop-the-world pauses to **a few ms**.
- Long pauses usually indicate a huge old-gen GC — check heap usage.

\`\`\`sh
node --trace-gc app.js
node --inspect app.js   # Chrome DevTools → Memory tab
\`\`\`

> The goal of Orinoco: minimize the time JS is blocked by GC.`,
      tags: ["gc", "v8"],
    },
    {
      id: "v8-arrays",
      title: "V8 array element kinds",
      difficulty: "medium",
      question: "What are V8's element kinds (PACKED_SMI, HOLEY_DOUBLES, etc.)?",
      answer: `V8 represents arrays in different internal **element kinds** based on contents. Element kind affects performance significantly.

**Two axes:**
- **Packed vs Holey** — does the array have any "holes" (missing indices)?
- **SMI vs Double vs Element** — what types do elements have?

**Six common kinds (worst → best is the wrong direction; here's the lattice):**

| Kind                | Contents                              |
|---------------------|---------------------------------------|
| \`PACKED_SMI\`      | Only small integers, no holes         |
| \`PACKED_DOUBLE\`   | Only floats/doubles, no holes         |
| \`PACKED_ELEMENTS\` | Mixed objects, no holes               |
| \`HOLEY_SMI\`       | SMIs with holes                       |
| \`HOLEY_DOUBLE\`    | Doubles with holes                    |
| \`HOLEY_ELEMENTS\`  | Mixed with holes                      |

**Transitions go one-way** — once an array goes holey, it stays holey for its lifetime.

\`\`\`js
const a = [1, 2, 3];           // PACKED_SMI
a.push(4.5);                   // → PACKED_DOUBLE
a.push("hi");                  // → PACKED_ELEMENTS

const b = new Array(3);        // HOLEY_SMI (holes by construction)
b[10] = 1;                     // sparse — also holey

const c = [1, 2, 3];
delete c[1];                   // → HOLEY_SMI
\`\`\`

**Performance impact:**
- **PACKED_SMI** is fastest — no boxing, no hole checks.
- **HOLEY_*** adds a hole check on every access.
- **PACKED_DOUBLE** stores raw doubles inline.
- **PACKED_ELEMENTS** stores tagged pointers.

**Best practices:**
- Build arrays with literals: \`[1, 2, 3]\`, not \`new Array(3)\`.
- Append in order; don't write to high indices.
- Don't \`delete arr[i]\` — \`splice\` or set to a sentinel.
- Keep arrays homogeneous (all SMIs, or all doubles, or all objects).

> Array shape matters as much as object shape for hot paths.`,
      tags: ["v8", "arrays"],
    },
    {
      id: "strings-v8",
      title: "Strings in V8",
      difficulty: "medium",
      question: "How does V8 represent strings internally?",
      answer: `V8 has multiple string representations to make common operations cheap.

**Representations:**

| Type             | Description                                  |
|------------------|----------------------------------------------|
| \`SeqString\`    | Contiguous bytes (one or two bytes per char) |
| \`ConsString\`   | Pair pointing to two child strings (a "rope")|
| \`SlicedString\` | View into a parent string (offset + length)  |
| \`ExternalString\` | Backed by C++ memory outside V8's heap     |
| \`ThinString\`   | Forwarding pointer (used for interning)      |

**Encodings:** **one-byte (Latin-1)** for ASCII-only strings, **two-byte (UTF-16)** otherwise. Switching encodings is expensive — non-ASCII characters force two-byte storage.

**ConsString (concatenation tree):**
\`\`\`js
const a = "hello, ";
const b = "world";
const c = a + b;   // ConsString [a, b] — O(1) concat, no copy
\`\`\`
Actual character data is **lazily flattened** when something needs the bytes (e.g. \`length\` is fine; indexing forces flattening).

**SlicedString:**
\`\`\`js
const big = "x".repeat(1_000_000);
const tiny = big.slice(0, 5);   // SlicedString — points into big
// big is kept alive as long as tiny exists!
\`\`\`
**Memory leak risk:** holding a slice keeps the parent alive. Workaround: \`tiny = (" " + tiny).slice(1)\` or \`tiny = tiny.split("").join("")\` to force a copy.

**ExternalString:**
- Lets the host hand V8 a pointer to externally owned bytes (e.g. mmap'd files in Node).

**Practical implications:**
- Concatenating in a loop is fine — ConsString makes it O(1) per concat, with one flatten at use.
- Slicing is **cheap** but **keeps the parent alive** — beware leaks.
- Mixing ASCII and emoji into one string upgrades to UTF-16 storage.`,
      tags: ["v8", "strings"],
    },
    {
      id: "weakmap-weakref",
      title: "WeakMap, WeakSet, and WeakRef",
      difficulty: "medium",
      question: "How do WeakMap, WeakSet, and WeakRef interact with the GC?",
      answer: `These types let you reference objects **without** keeping them alive — they cooperate with the garbage collector.

**\`WeakMap\` and \`WeakSet\`:**
- Keys must be objects (or symbols in modern engines).
- The reference from map → key is **weak** — doesn't prevent GC.
- When the key is collected, the entry disappears automatically.
- **Not iterable**, **no \`size\`** — observing all entries would expose GC timing.

\`\`\`js
const meta = new WeakMap();
let user = { name: "Ada" };
meta.set(user, { lastSeen: Date.now() });

user = null;
// user object is collectable; meta entry vanishes too
\`\`\`

**Use cases:**
- Per-object metadata without polluting the object.
- Caches keyed by object identity that auto-purge.
- Private data for class instances.

**\`WeakRef\` and \`FinalizationRegistry\`:**
\`\`\`js
let big = { data: new Array(1e6) };
const ref = new WeakRef(big);

big = null;
// later
const obj = ref.deref();   // returns the object OR undefined if collected
\`\`\`

A **\`FinalizationRegistry\`** lets you register a callback that runs *after* an object is collected:
\`\`\`js
const reg = new FinalizationRegistry(token => {
  console.log("collected:", token);
});
reg.register(big, "big-token");
\`\`\`

**Caveats — read the spec warnings:**
- GC is not deterministic. \`WeakRef.deref()\` may return the object indefinitely.
- Finalizers may **never run** (e.g. if the program exits).
- Don't use them for critical cleanup — use \`try/finally\` or explicit lifecycle.

**Use cases:**
- Caching — drop entries when memory is needed.
- Bridging to non-GC resources (file handles, timers) — but \`AbortController\` / explicit \`close()\` is usually safer.

> \`WeakMap\` is everyday; \`WeakRef\` is a specialized tool with sharp edges.`,
      tags: ["gc"],
    },

    // ───── HARD ─────
    {
      id: "turbofan-maglev-sparkplug",
      title: "TurboFan vs Maglev vs Sparkplug",
      difficulty: "hard",
      question: "What are TurboFan, Maglev, and Sparkplug and how do they differ?",
      answer: `Modern V8 has **three JIT tiers** above the Ignition interpreter, each balancing **compile cost** vs **runtime perf**.

| Tier        | Year | Compile cost | Runtime perf | Strategy                      |
|-------------|------|--------------|--------------|-------------------------------|
| **Sparkplug** | 2021 | Very low (~µs) | ~5-15% over Ignition | Bytecode → machine code, no IR |
| **Maglev**    | 2023 | Low-medium   | ~2-3× Ignition | Mid-tier optimizing IR         |
| **TurboFan**  | 2017 | High         | Best (~5-10× Ignition) | Sea-of-nodes IR, deep optimizations |

**Sparkplug:**
- Reads bytecode and emits **straight-line machine code** with little analysis.
- No type speculation; no inlining.
- Goal: avoid interpretation overhead for "warm" code that isn't worth full optimization.

**Maglev:**
- Single-pass SSA-based IR.
- Inlines small callees, basic type speculation.
- Faster compile time than TurboFan, simpler to maintain.
- Bridges the gap between Sparkplug and TurboFan.

**TurboFan:**
- "Sea of nodes" graph-based IR.
- Aggressive inlining, escape analysis, redundancy elimination, range analysis, loop-invariant code motion.
- Speculative type optimization with bailouts.
- Generates the fastest machine code; expensive to compile.

**Tier-up flow:**
\`\`\`
Ignition (interp) → Sparkplug (warm) → Maglev (hot) → TurboFan (very hot)
\`\`\`

V8 monitors execution counters per function/loop. Crossing thresholds triggers compilation **off-thread** so JS keeps running.

**Why three tiers and not one?**
- TurboFan compile time is significant (ms-scale per function).
- Many functions never get hot enough to deserve TurboFan.
- Sparkplug + Maglev fill the long tail cheaply.

**Tools:**
\`\`\`sh
node --trace-opt --trace-deopt --trace-turbo script.js
\`\`\`

> Tiered JIT = "pay only for the optimization you need."`,
      tags: ["jit", "v8"],
    },
    {
      id: "hermes",
      title: "Hermes engine",
      difficulty: "hard",
      question: "What is Hermes and how does it differ from V8?",
      answer: `**Hermes** is Meta's open-source JS engine designed for **React Native** on mobile devices.

**Design priorities:**
- **Fast app startup** on phones.
- **Small APK / IPA size**.
- **Low memory footprint**.

**Key differences from V8:**

| Aspect          | Hermes                            | V8                                  |
|-----------------|-----------------------------------|-------------------------------------|
| Compilation     | **AOT bytecode** (build time)     | JIT at runtime                      |
| JIT             | None by default (some experiments)| Multi-tier JIT                      |
| Bytecode format | Custom, mmap'd from disk          | In-memory, generated at parse       |
| Startup         | Very fast (no parse at runtime)   | Slower (must parse + tier-up)       |
| Peak perf       | Lower (no optimizing JIT)         | Higher                              |
| Binary size     | Smaller engine                    | Larger                              |
| GC              | Generational, Hades concurrent GC | Orinoco                             |

**AOT bytecode:**
- The Hermes compiler runs at **build time** on your bundle.
- Ships as **\`.hbc\`** (Hermes Bytecode) files inside the app.
- Memory-mapped at startup — no parsing on device.
- Result: TTI (time to interactive) drops significantly on mid-range Android.

**Trade-off:**
- No JIT means peak compute throughput is lower than V8.
- For UI-heavy apps where startup matters more than crunching numbers, that's a great trade.

**Other features:**
- **Source maps** generated from bytecode for debug.
- **CommonJS / ES modules** statically resolved at build.
- **Hades GC** — concurrent, low-pause-time generational collector.

**Adoption:**
- Default JS engine in **React Native** since 0.70.
- Optional in some Node-like environments.

**When you'd care:**
- Building React Native apps — Hermes is the default; you might profile with Hermes-specific tools.
- Writing JS that needs to run on Hermes — avoid features that compile to slow bytecode (e.g. heavy use of \`with\`, unusual prototype tricks).

> V8 = throughput at scale. Hermes = startup on tiny devices.`,
      tags: ["engines", "mobile"],
    },
    {
      id: "wasm-integration",
      title: "WebAssembly integration with V8",
      difficulty: "hard",
      question: "How does WebAssembly fit into a JS engine like V8?",
      answer: `**WebAssembly (Wasm)** is a binary instruction format that runs **inside the same engine** as JavaScript, sharing the heap reference but executing through a different pipeline.

**V8's Wasm pipeline:**
\`\`\`
.wasm bytes ──► Liftoff (baseline JIT) ──► TurboFan (optimizing JIT) ──► machine code
\`\`\`

- **Liftoff** — single-pass baseline compiler. Produces decent code in **microseconds per function**. Lets the module start fast.
- **TurboFan** — same backend used for JS optimization. Recompiles hot Wasm functions for peak perf.

**Why Wasm is fast:**
- **Statically typed** at the bytecode level — no type speculation needed.
- **Linear memory** — a single \`ArrayBuffer\`; raw pointer arithmetic.
- **No GC** for the Wasm heap (unless using the new GC proposal).
- **Predictable** — JIT compile output is more uniform than for JS.

**JS ↔ Wasm interop:**
\`\`\`js
const bytes = await fetch("module.wasm").then(r => r.arrayBuffer());
const { instance } = await WebAssembly.instantiate(bytes, {
  env: { log: x => console.log(x) },
});
const result = instance.exports.add(2, 3);
\`\`\`

- **Wasm imports** — JS functions called from Wasm.
- **Wasm exports** — Wasm functions callable from JS.
- **Memory** is a shared \`ArrayBuffer\` — JS can read/write Wasm's heap.

**Calling cost:**
- A few ns per call — much cheaper than a JS function call into FFI.
- But still avoid micro-calls in hot loops; batch work in Wasm.

**Use cases:**
- CPU-bound code (codecs, parsers, simulations, compression).
- Porting C/C++/Rust libraries to the browser (FFmpeg, SQLite, ImageMagick).
- Performance-critical paths in otherwise-JS apps.

**Modern proposals:**
- **Wasm GC** — lets Wasm hold typed managed objects (Java, Kotlin, OCaml on Wasm).
- **Wasm threads** with \`SharedArrayBuffer\`.
- **Component Model** — proper module composition.

> Wasm shares V8's compilers and memory but bypasses JS's dynamism — that's where the speed comes from.`,
      tags: ["wasm"],
    },
    {
      id: "perf-profiling",
      title: "Profiling V8 performance",
      difficulty: "hard",
      question: "How do you profile a V8 program at the engine level?",
      answer: `When app-level profilers aren't enough, V8 exposes flags and tools to see what the engine is doing.

**Sampling profiler:**
\`\`\`sh
node --prof app.js
# generates isolate-*.log
node --prof-process isolate-*.log > profile.txt
\`\`\`
Shows hot functions, optimization status, time spent in JIT vs GC vs C++.

**Tier transitions:**
\`\`\`sh
node --trace-opt --trace-deopt --trace-deopt-verbose app.js
\`\`\`
- Logs every function that gets optimized or deopted.
- Look for repeated deopts ("bailout") → fix the type instability.

**Inline cache transitions:**
\`\`\`sh
node --trace-ic app.js
\`\`\`
- Reveals mono → poly → mega transitions.

**Garbage collection:**
\`\`\`sh
node --trace-gc app.js
node --trace-gc-verbose app.js
\`\`\`
- See pause times, heap sizes, frequency of scavenges vs major GCs.

**Heap snapshot:**
\`\`\`sh
node --inspect app.js
# Chrome DevTools → Memory → Take snapshot
\`\`\`
- Hunt for retained objects, dominators, detached DOM nodes.

**Allocation timeline:**
- Same DevTools panel → "Record allocation timeline".
- See where objects come from in real time.

**\`%OptimizeFunctionOnNextCall\` and friends:**
\`\`\`sh
node --allow-natives-syntax
> %OptimizeFunctionOnNextCall(fn);
> %GetOptimizationStatus(fn);
\`\`\`
- Internal V8 hooks for forcing/inspecting tier states (testing only).

**\`v8.getHeapSnapshot()\`** in Node:
\`\`\`js
const v8 = require("node:v8");
const fs = require("node:fs");
const stream = v8.getHeapSnapshot();
stream.pipe(fs.createWriteStream("heap.heapsnapshot"));
\`\`\`

**Chrome DevTools Performance panel:**
- Records main-thread activity, JIT compile, GC, paint.
- Best UX for general perf work.

**Tools beyond V8:**
- **\`clinic.js\`** (Node) — flame graphs, doctor, bubbleprof.
- **\`0x\`** — Node flame graph generator.
- **\`autocannon\`** — load testing.

> Pick the right tool: hot-path issue → CPU profile; memory growth → heap snapshot; mysterious slowdown → trace-opt/deopt.`,
      tags: ["performance"],
    },
    {
      id: "engine-leaks",
      title: "Memory leaks at the engine level",
      difficulty: "hard",
      question: "What are common engine-level memory leaks in JS apps?",
      answer: `JS engines reclaim everything **unreachable**. Leaks happen when something stays reachable longer than you intended.

**Common patterns:**

**1. Forgotten event listeners:**
\`\`\`js
window.addEventListener("scroll", handler);
// component unmounts; handler still attached → handler closes over component state → leak
\`\`\`
Fix: always remove listeners on unmount; use \`AbortController\`:
\`\`\`js
const ctrl = new AbortController();
window.addEventListener("scroll", handler, { signal: ctrl.signal });
// later
ctrl.abort();
\`\`\`

**2. Detached DOM nodes:**
- A node is removed from the DOM but a JS variable still references it.
- Devtools heap snapshot → "Detached DOM tree" filter.
\`\`\`js
const cache = [];
function show(n) { document.body.appendChild(n); cache.push(n); }
function hide(n) { n.remove(); /* still in cache */ }
\`\`\`

**3. Closures capturing large scopes:**
- A small returned function accidentally keeps a giant outer object alive.
- V8 used to be coarse here; modern V8 captures only what's used, but watch out for explicit references.

**4. Long-lived caches without eviction:**
- \`Map\` keyed by user IDs grows forever.
- Use \`WeakMap\` (object keys) or an LRU cache (\`lru-cache\`) with size bound.

**5. Timers not cleared:**
\`\`\`js
const id = setInterval(tick, 1000);
// component unmounts; interval keeps tick (and its closures) alive
\`\`\`
Always \`clearInterval\` / \`clearTimeout\`.

**6. Unresolved promises:**
- A promise never settled keeps its resolution chain alive.
- Use \`AbortController\` for fetch; reject pending promises on cleanup.

**7. Global state accumulation:**
- Pushing into a top-level array/object that nothing ever drains.

**8. Sliced strings holding parents:**
- See "Strings in V8" — slicing a huge string and keeping the slice retains the original.

**Diagnosis workflow:**
1. Take a heap snapshot.
2. Force GC, take another.
3. Compare retained sizes — what's growing?
4. Look at **retainer paths** — what's keeping it alive?

> Leaks aren't engine bugs — they're missing \`removeEventListener\`, \`clearTimeout\`, or \`abort()\` calls.`,
      tags: ["memory"],
    },
    {
      id: "benchmarking-pitfalls",
      title: "Benchmarking pitfalls",
      difficulty: "hard",
      question: "What are common pitfalls when benchmarking JS code?",
      answer: `Microbenchmarks lie more often than they tell the truth. The JIT, GC, and dead-code elimination conspire against naïve measurements.

**Top pitfalls:**

**1. No warmup.**
- First runs execute in **Ignition**; later runs in **TurboFan**.
- Measuring cold gives interpreter perf; measuring hot gives optimized.
- **Run the function many times before timing.**

**2. Dead code elimination.**
- The JIT may notice your benchmark's result is unused and skip the work.
\`\`\`js
for (let i = 0; i < 1e8; i++) compute(i);   // result discarded → may be eliminated
\`\`\`
Fix: **consume the result** — accumulate, log, or expose globally.

**3. Constant folding.**
- The JIT may compute literal-only operations at compile time.
- Vary inputs to defeat folding.

**4. Deoptimization mid-benchmark.**
- A change in input shape triggers deopt; you measure both tiers averaged.
- Use \`--trace-deopt\` to verify stability.

**5. GC pauses skewing results.**
- Allocate-heavy benchmarks may include random GC pauses.
- Run many iterations; report **median** or trimmed mean, not avg.
- Force GC between rounds (\`--expose-gc\`) for fair comparison.

**6. Inlining changes everything.**
- A function called from one site may be **fully inlined** by TurboFan and disappear.
- Different call patterns produce different optimization decisions.

**7. Inputs that are too small.**
- Sub-microsecond loops are dominated by timer noise.
- Aim for tens of ms per measurement.

**8. CPU frequency scaling and other processes.**
- Laptops throttle.
- Other tabs, browser background tasks add noise.
- Use a quiet machine; pin CPU frequency on Linux.

**Tools that handle most of this:**
- **\`benchmark.js\`** — classic; warmup, statistical analysis.
- **\`mitata\`** — modern, accounts for V8 quirks.
- **\`tinybench\`** — small, reliable.
- Vitest's \`bench\` API uses \`tinybench\`.

\`\`\`js
import { bench } from "vitest";

bench("sum loop", () => {
  let s = 0;
  for (let i = 0; i < 1e6; i++) s += i;
  return s;   // returned → not eliminated
});
\`\`\`

> If your microbenchmark's result is "literally zero ns", the JIT optimized it away. Always sanity-check the numbers.`,
      tags: ["performance"],
    },
  ],
};
