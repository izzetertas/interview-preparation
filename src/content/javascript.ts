import type { Category } from "./types";

export const javascript: Category = {
  slug: "javascript",
  title: "JavaScript",
  description:
    "Core JavaScript from the ground up: types, scope, closures, prototypes, this, the event loop, async patterns, and modern language features.",
  icon: "🟨",
  questions: [
    // ───────── EASY ─────────
    {
      id: "data-types",
      title: "Primitive vs reference types",
      difficulty: "easy",
      question: "What are the primitive types in JavaScript and how do they differ from reference types?",
      answer: `JavaScript has **7 primitive types**: \`string\`, \`number\`, \`boolean\`, \`null\`, \`undefined\`, \`symbol\`, \`bigint\`. Everything else is an **object** (arrays, functions, dates, maps — all objects).

**Key difference:** primitives are **copied by value**, objects are **copied by reference**.

\`\`\`js
let a = 1;
let b = a;     // copy of value
b = 2;
console.log(a); // 1 — unaffected

const x = { n: 1 };
const y = x;   // same reference
y.n = 2;
console.log(x.n); // 2 — mutated through y
\`\`\`

**Equality:** \`===\` compares primitives by value, objects by reference identity. Two distinct \`{}\` literals are never \`===\` even if they look identical.`,
      tags: ["fundamentals", "types"],
    },
    {
      id: "var-let-const",
      title: "var vs let vs const",
      difficulty: "easy",
      question: "What's the difference between var, let, and const?",
      answer: `| Feature          | \`var\`                | \`let\`              | \`const\`            |
|------------------|----------------------|--------------------|--------------------|
| **Scope**        | Function-scoped      | Block-scoped       | Block-scoped       |
| **Re-declare**   | ✅                    | ❌                  | ❌                  |
| **Re-assign**    | ✅                    | ✅                  | ❌                  |
| **Hoisting**     | Hoisted, initialized \`undefined\` | Hoisted, **TDZ** | Hoisted, **TDZ**   |

**TDZ (Temporal Dead Zone):** accessing \`let\`/\`const\` before their declaration throws \`ReferenceError\`, unlike \`var\` which would return \`undefined\`.

**\`const\` does NOT mean immutable** — the *binding* is constant, but the value can still be mutated:
\`\`\`js
const arr = [1, 2];
arr.push(3);   // ✅ allowed
arr = [4];     // ❌ TypeError
\`\`\`

**Rule of thumb:** use \`const\` by default, \`let\` when you need re-assignment, avoid \`var\`.`,
      tags: ["fundamentals", "scope"],
    },
    {
      id: "equality",
      title: "== vs === (loose vs strict equality)",
      difficulty: "easy",
      question: "What's the difference between == and ===?",
      answer: `- **\`===\` (strict equality)** — compares both **type** and **value**. No conversion.
- **\`==\` (loose equality)** — performs **type coercion** before comparing. The rules are notoriously surprising.

\`\`\`js
0 == '';        // true  (both coerce to 0)
0 == '0';       // true
'' == '0';      // false
null == undefined; // true  (but null == 0 is false)
[] == false;    // true
[] == ![];      // true  🤯
NaN == NaN;     // false
\`\`\`

**Always use \`===\`** unless you have a specific reason. The only common idiom for \`==\` is \`x == null\` to check for *both* \`null\` and \`undefined\`.`,
      tags: ["fundamentals", "coercion"],
    },
    {
      id: "null-vs-undefined",
      title: "null vs undefined",
      difficulty: "easy",
      question: "What's the difference between null and undefined?",
      answer: `- **\`undefined\`** — "has not been assigned a value yet." Default for uninitialized variables, missing function arguments, and missing object properties.
- **\`null\`** — "intentional absence of a value." Developer-assigned to say "nothing is here."

\`\`\`js
let x;               // undefined
function f(a) { return a; }  f();      // undefined
const o = {};  o.missing;               // undefined

const user = null;   // "there is no user"
\`\`\`

**Quirks:**
- \`typeof undefined === 'undefined'\` but \`typeof null === 'object'\` (historical bug).
- \`null == undefined\` (true), \`null === undefined\` (false).
- \`JSON.stringify\` drops \`undefined\` values but preserves \`null\`.`,
      tags: ["fundamentals", "types"],
    },
    {
      id: "truthy-falsy",
      title: "Truthy and falsy values",
      difficulty: "easy",
      question: "Which values are falsy in JavaScript?",
      answer: `Only **8 values** are falsy. Everything else is truthy.

\`\`\`js
false
0, -0, 0n
""  (empty string)
null
undefined
NaN
document.all   // legacy browser quirk, rarely seen
\`\`\`

**Surprising truthy values:**
- \`"0"\` — non-empty string
- \`"false"\` — non-empty string
- \`[]\` — empty array is truthy (but \`[] == false\` is true — a \`==\` trap)
- \`{}\` — empty object is truthy

**Nullish (\`?? / ??=\`) vs falsy (\`|| / ||=\`):**
\`\`\`js
0  || 'default';  // 'default'  ← treats 0 as missing
0  ?? 'default';  // 0          ← only null/undefined are "missing"
\`\`\`
Use \`??\` when 0, "", or false are valid values.`,
      tags: ["fundamentals", "coercion"],
    },
    {
      id: "hoisting",
      title: "Hoisting",
      difficulty: "easy",
      question: "What is hoisting?",
      answer: `**Hoisting** is JavaScript's behavior of moving **declarations** to the top of their scope before code executes. What gets hoisted differs by declaration type:

| Declaration      | Hoisted? | Initialized before execution? |
|------------------|----------|-------------------------------|
| \`var\`            | ✅        | ✅ as \`undefined\`              |
| \`function\`       | ✅        | ✅ fully (body and all)         |
| \`let\` / \`const\`  | ✅        | ❌ **TDZ** until declaration    |
| \`class\`          | ✅        | ❌ **TDZ** until declaration    |

\`\`\`js
console.log(x);   // undefined  (var hoisted)
var x = 1;

foo();            // works — function declarations are fully hoisted
function foo() { console.log("hi"); }

console.log(y);   // ReferenceError — TDZ
let y = 2;
\`\`\`

**Function expressions** (\`const f = function(){}\`) follow the \`const\` rule — you can't call them before the line.`,
      tags: ["fundamentals", "scope"],
    },
    {
      id: "typeof-instanceof",
      title: "typeof and instanceof",
      difficulty: "easy",
      question: "How do typeof and instanceof work, and when do you use each?",
      answer: `- **\`typeof\`** — returns a string describing the primitive type. Safe on undeclared variables.
- **\`instanceof\`** — checks the prototype chain. For objects only.

\`\`\`js
typeof 1;              // 'number'
typeof 'a';            // 'string'
typeof true;           // 'boolean'
typeof undefined;      // 'undefined'
typeof null;           // 'object'  ← historical bug
typeof function(){};   // 'function'
typeof [];             // 'object'
typeof Symbol();       // 'symbol'

[] instanceof Array;       // true
[] instanceof Object;      // true (Array inherits from Object)
new Date() instanceof Date // true
\`\`\`

**Pitfall:** \`instanceof\` fails across realms (iframes, worker). For cross-realm safety use \`Array.isArray(x)\` for arrays, or \`Object.prototype.toString.call(x)\` as a universal tag check.`,
      tags: ["fundamentals", "types"],
    },
    {
      id: "template-literals",
      title: "Template literals",
      difficulty: "easy",
      question: "What are template literals and tagged templates?",
      answer: `**Template literals** use backticks and support interpolation + multi-line strings:

\`\`\`js
const name = "Ada";
const msg = \`Hello, \${name}!
Welcome.\`;
\`\`\`

**Tagged templates** let a function intercept the literal. The tag receives the static string parts as an array and the interpolated expressions as separate args:

\`\`\`js
function tag(strings, ...values) {
  return strings.reduce((acc, s, i) => acc + s + (values[i] ? \`[\${values[i]}]\` : ""), "");
}
tag\`Hello \${"Ada"}, age \${30}\`;  // "Hello [Ada], age [30]"
\`\`\`

Common real-world uses:
- **\`String.raw\`** — keeps escape sequences literal (useful for Windows paths, regex)
- **\`sql\`\`...\`\`** in libraries that auto-escape to prevent SQL injection
- **\`css\`\`...\`\`** in styled-components
- **i18n** libraries that extract translatable fragments`,
      tags: ["fundamentals", "strings"],
    },
    {
      id: "destructuring",
      title: "Destructuring",
      difficulty: "easy",
      question: "What is destructuring and what patterns are useful?",
      answer: `**Destructuring** unpacks values from arrays or properties from objects into distinct variables.

\`\`\`js
const [a, b, ...rest] = [1, 2, 3, 4];  // a=1, b=2, rest=[3,4]
const { name, age = 18 } = user;       // with default
const { name: userName } = user;       // rename
const { address: { city } } = user;    // nested

function f({ name, email } = {}) {...} // destructure parameter
\`\`\`

**Common patterns:**
- **Swap**: \`[a, b] = [b, a]\`
- **Pick subset**: \`const { id, email } = user\` (similar to Pick in TS)
- **Rename to avoid collision**: \`const { data: users } = response\`
- **Default for missing prop**: \`const { page = 1 } = query\`

Destructuring runs \`[Symbol.iterator]\` for arrays and plain property access for objects, so it works with Maps via entries, NodeLists, and any iterable.`,
      tags: ["fundamentals", "syntax"],
    },

    // ───────── MEDIUM ─────────
    {
      id: "closures",
      title: "Closures",
      difficulty: "medium",
      question: "What is a closure?",
      answer: `A **closure** is a function bundled together with references to the variables from its lexical scope. When the outer function returns, its inner function *keeps a live reference* to those variables — they aren't garbage collected.

\`\`\`js
function counter() {
  let n = 0;
  return () => ++n;   // closes over n
}
const inc = counter();
inc(); inc(); inc();  // 1, 2, 3
\`\`\`

**Uses:**
- **Data privacy** — hide state that only returned functions can access.
- **Factories** — return functions preconfigured with arguments (partial application).
- **Memoization / caches** — private \`Map\` inside a closure.
- **Event handlers & callbacks** that need captured context.

**Gotcha:** in a \`for\` loop with \`var\`, all iterations share the same binding:
\`\`\`js
for (var i = 0; i < 3; i++) setTimeout(() => console.log(i), 0); // 3 3 3
for (let i = 0; i < 3; i++) setTimeout(() => console.log(i), 0); // 0 1 2
\`\`\`
\`let\` creates a new binding each iteration — a common "why closures?" interview riddle.`,
      tags: ["core", "scope"],
    },
    {
      id: "this-keyword",
      title: "The this keyword",
      difficulty: "medium",
      question: "How is `this` determined in JavaScript?",
      answer: `\`this\` is bound at **call time**, not definition time, and follows these rules in priority order:

1. **\`new f()\`** — \`this\` is the newly constructed object.
2. **Explicit binding** via \`.call(obj)\`, \`.apply(obj)\`, or \`.bind(obj)\` — \`this\` is \`obj\`.
3. **Method call** \`obj.f()\` — \`this\` is \`obj\`.
4. **Default / standalone** \`f()\` — \`this\` is \`undefined\` in strict mode, the global object otherwise.

**Arrow functions** break all four: they don't have their own \`this\`. They close over \`this\` from the enclosing lexical scope — perfect for callbacks inside methods:

\`\`\`js
class Timer {
  constructor() { this.count = 0; }
  start() {
    setInterval(() => this.count++, 1000);  // arrow → this = Timer instance
    // setInterval(function() { this.count++ }) would break
  }
}
\`\`\`

**Common traps:**
- Detached methods lose \`this\`: \`const m = obj.method; m()\` → default.
- DOM event handlers: traditional functions get the element as \`this\`; arrow functions get the enclosing \`this\`.`,
      tags: ["core", "this"],
    },
    {
      id: "arrow-vs-function",
      title: "Arrow vs regular functions",
      difficulty: "medium",
      question: "What's different between an arrow function and a regular function?",
      answer: `| Aspect              | \`function()\`             | \`() => {}\`                      |
|---------------------|------------------------|-------------------------------|
| Own \`this\`         | ✅ (call-time bound)    | ❌ (lexical, from outer scope) |
| Own \`arguments\`    | ✅                      | ❌                             |
| Can be \`new\`'d      | ✅                      | ❌ TypeError                   |
| Has \`prototype\`    | ✅                      | ❌                             |
| Generator capable    | ✅ with \`function*\`    | ❌                             |
| Hoisted              | ✅ (declarations)       | ❌                             |
| \`.name\` assigned   | ✅                      | ✅ (from binding)              |

**When to use arrow:**
- Callbacks that should inherit \`this\`
- Short pure transforms: \`arr.map(x => x * 2)\`
- Event handlers inside class methods

**When to use function:**
- Object methods that rely on \`this\`
- Constructors (or use \`class\`)
- When you need \`arguments\` or generator behavior`,
      tags: ["core", "functions"],
    },
    {
      id: "event-loop",
      title: "Event loop: macrotasks vs microtasks",
      difficulty: "medium",
      question: "How does JavaScript's event loop work? What are microtasks and macrotasks?",
      answer: `JavaScript is **single-threaded**. Async work is coordinated by the **event loop**, which pulls from queues in a specific order.

Each loop iteration (roughly):
1. Pop the next **macrotask** off the task queue and run it to completion.
2. Drain the **microtask queue** completely before moving on.
3. Render (in browsers).
4. Repeat.

| Queue type    | Examples                                                   |
|---------------|-----------------------------------------------------------|
| **Macrotask** | \`setTimeout\`, \`setInterval\`, I/O, UI events, \`MessageChannel\` |
| **Microtask** | \`Promise.then\`, \`queueMicrotask\`, \`MutationObserver\`          |

\`\`\`js
console.log("A");
setTimeout(() => console.log("B"), 0);
Promise.resolve().then(() => console.log("C"));
console.log("D");
// Output: A, D, C, B   (microtask drains before next macrotask)
\`\`\`

**Implications:**
- An infinite microtask loop can starve rendering and \`setTimeout\`.
- \`await\` suspends and resumes via a microtask — chained awaits are "fast" between resumes.
- Node.js has additional phases (timers, poll, check, close) and a separate \`process.nextTick\` queue that runs before promises.`,
      tags: ["async", "runtime"],
    },
    {
      id: "prototypes",
      title: "Prototypes and prototypal inheritance",
      difficulty: "medium",
      question: "How does prototypal inheritance work?",
      answer: `Every object has an internal \`[[Prototype]]\` (accessible via \`Object.getPrototypeOf\` or \`__proto__\`). When you read a property, the engine walks the prototype chain until it finds it or hits \`null\`.

\`\`\`js
const animal = { speak() { console.log("..."); } };
const dog = Object.create(animal);
dog.bark = () => console.log("woof");
dog.speak();  // "..."  (found on animal)
\`\`\`

**\`class\` is syntactic sugar over prototypes:**
\`\`\`js
class Dog extends Animal { bark() {} }
// equivalent: Dog.prototype.__proto__ === Animal.prototype
\`\`\`

**Key points:**
- **Methods live on the prototype**, not on each instance — memory-efficient.
- Setting a property **shadows** the prototype's version on that instance.
- \`Object.create(null)\` creates a **bare** object with no prototype (no \`toString\`, no \`hasOwnProperty\`) — useful as a pure dictionary.
- Prefer \`Object.hasOwn(obj, key)\` (modern) over \`obj.hasOwnProperty\` to avoid prototype pollution issues.`,
      tags: ["core", "oop"],
    },
    {
      id: "promises-async-await",
      title: "Promises and async/await",
      difficulty: "medium",
      question: "How do Promises work, and how does async/await relate to them?",
      answer: `A **Promise** represents a value that will be available later. It has three states: **pending → fulfilled** or **pending → rejected**, and transitions exactly once.

\`\`\`js
const p = new Promise((resolve, reject) => {
  setTimeout(() => resolve(42), 100);
});
p.then(x => x + 1).then(console.log);  // 43
\`\`\`

**\`async/await\`** is syntactic sugar:
\`\`\`js
async function load() {
  try {
    const user = await fetchUser();
    const posts = await fetchPosts(user.id);
    return { user, posts };
  } catch (err) { /* network or parse error */ }
}
\`\`\`

**Key points:**
- \`await x\` unwraps a Promise; non-Promises are wrapped via \`Promise.resolve(x)\`.
- An \`async\` function always returns a Promise.
- Sequential \`await\`s are serial; parallelize with **\`Promise.all\`**.
- Error propagation: rejected Promise → \`await\` throws → standard \`try/catch\`.
- **\`Promise.all\`** rejects on first error; **\`Promise.allSettled\`** waits for all; **\`Promise.race\`** resolves/rejects with the first settled; **\`Promise.any\`** resolves with the first fulfillment.`,
      tags: ["async", "promises"],
    },
    {
      id: "array-methods",
      title: "map, filter, reduce",
      difficulty: "medium",
      question: "What do map, filter, and reduce do and when do you pick each?",
      answer: `All three are **non-mutating** — they return a new array (or, for reduce, an accumulated value).

\`\`\`js
// map: transform 1:1
[1, 2, 3].map(x => x * 2);            // [2, 4, 6]

// filter: keep items where predicate is true
[1, 2, 3, 4].filter(x => x % 2 === 0); // [2, 4]

// reduce: fold into a single value
[1, 2, 3].reduce((acc, x) => acc + x, 0); // 6
\`\`\`

**When to use which:**
- **map** when output length = input length and each item maps 1:1
- **filter** when output is a *subset* with no transformation
- **reduce** for aggregations, groupings, or building arbitrary structures:

\`\`\`js
const byDept = employees.reduce((acc, e) => {
  (acc[e.dept] ??= []).push(e);
  return acc;
}, {});
\`\`\`

**Pitfalls:**
- \`reduce\` without an initial value on an empty array throws. Always pass a seed.
- Chained \`filter().map()\` creates two intermediate arrays. For hot paths prefer a \`for\` loop or \`reduce\`.
- Newer \`Array.prototype.group\` / \`Object.groupBy\` can replace many reduce patterns.`,
      tags: ["core", "arrays"],
    },
    {
      id: "spread-rest",
      title: "Spread and rest",
      difficulty: "medium",
      question: "What's the difference between the spread and rest operators?",
      answer: `Same syntax (\`...\`), opposite roles.

**Spread** — *expands* an iterable into individual elements:
\`\`\`js
const merged = [...arr1, ...arr2];
const clone  = { ...obj };
Math.max(...[1, 2, 3]);
\`\`\`

**Rest** — *collects* remaining items into a single variable:
\`\`\`js
function sum(...nums) { return nums.reduce((a,b) => a+b, 0); }
const [head, ...tail] = [1, 2, 3];   // head=1, tail=[2,3]
const { a, ...others } = obj;
\`\`\`

**Gotcha — shallow copy:**
\`\`\`js
const o = { a: { b: 1 } };
const c = { ...o };
c.a.b = 2;
o.a.b;   // 2  ← nested object shared!
\`\`\`
Use \`structuredClone(o)\` (native) for deep copy.`,
      tags: ["syntax", "iterables"],
    },
    {
      id: "modules-esm-cjs",
      title: "ESM vs CommonJS",
      difficulty: "medium",
      question: "What's the difference between ES modules and CommonJS?",
      answer: `| Aspect              | CommonJS (\`require\`)       | ES Modules (\`import\`)         |
|---------------------|-----------------------------|--------------------------------|
| Default runtime     | Node (historical)           | Browser and Node (modern)      |
| Syntax              | \`const x = require('x')\`   | \`import x from 'x'\`           |
| Load timing         | Synchronous, at call time    | Statically analyzed, async-capable |
| Exports             | \`module.exports = {...}\`   | \`export ...\` / \`export default\` |
| Bindings            | Copy of value                | **Live bindings** (read-only)   |
| Top-level \`await\`   | ❌                           | ✅                              |
| Tree-shakable       | ❌ (dynamic require)         | ✅ (static imports)             |

**Live bindings example** (ESM):
\`\`\`js
// counter.mjs
export let count = 0;
export const inc = () => count++;

// main.mjs
import { count, inc } from "./counter.mjs";
inc();
console.log(count); // 1 — updated via the live binding
\`\`\`

Modern Node supports both, but you can't \`require()\` an ESM module synchronously. Use dynamic \`import()\` to bridge.`,
      tags: ["modules"],
    },
    {
      id: "bind-call-apply",
      title: "bind, call, apply",
      difficulty: "medium",
      question: "What do Function.prototype.bind, call, and apply do?",
      answer: `All three control the \`this\` binding of a function.

- **\`.call(thisArg, a, b, c)\`** — invoke now with \`this = thisArg\` and positional args.
- **\`.apply(thisArg, [a, b, c])\`** — same, but args as an **array**.
- **\`.bind(thisArg, a)\`** — returns a *new function* with \`this\` permanently bound (and optionally some args pre-applied — partial application).

\`\`\`js
function greet(greeting, name) { return \`\${greeting}, \${name}, from \${this.city}\`; }

greet.call({ city: "IST" }, "Hi", "Ada");
greet.apply({ city: "IST" }, ["Hi", "Ada"]);

const greetFromIst = greet.bind({ city: "IST" }, "Hi");
greetFromIst("Ada");  // "Hi, Ada, from IST"
\`\`\`

**Modern alternatives:**
- \`fn(...args)\` replaces most \`apply\` cases.
- Arrow functions + closures often replace \`bind\`.
- React class components historically used \`bind\` in constructors — no longer needed with class fields + arrow methods.`,
      tags: ["core", "functions"],
    },
    {
      id: "debounce-throttle",
      title: "Debounce vs throttle",
      difficulty: "medium",
      question: "What's the difference between debounce and throttle?",
      answer: `Both rate-limit a function, but differently:

- **Debounce** — wait for N ms of *silence* before firing. Every new call resets the timer. Good for "fire once the user is done."
- **Throttle** — fire *at most* once every N ms. Good for "fire regularly during continuous activity."

\`\`\`js
// Debounce — run fn only after the user stops typing for 300ms
function debounce(fn, delay) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

// Throttle — run fn at most every 100ms during scroll
function throttle(fn, limit) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= limit) {
      last = now;
      fn(...args);
    }
  };
}
\`\`\`

**Typical uses:**
- Debounce: search-as-you-type, form validation, autosave.
- Throttle: scroll handlers, mousemove, window resize, API rate limiting.`,
      tags: ["patterns", "performance"],
    },

    // ───────── HARD ─────────
    {
      id: "generators",
      title: "Generators and iterators",
      difficulty: "hard",
      question: "What are generators and iterators?",
      answer: `An **iterator** is any object with a \`next()\` method returning \`{ value, done }\`. An **iterable** is an object with \`[Symbol.iterator]\` returning an iterator. \`for...of\`, spread, and destructuring all use this protocol.

A **generator function** (\`function*\`) returns an iterator you can pause and resume with \`yield\`:

\`\`\`js
function* range(start, end) {
  for (let i = start; i < end; i++) yield i;
}

for (const n of range(0, 3)) console.log(n);  // 0, 1, 2
[...range(0, 3)];                              // [0, 1, 2]
\`\`\`

**Power features:**
- Bidirectional: \`iterator.next(value)\` sends a value back into the \`yield\` expression.
- **Lazy sequences** — generate infinite streams and stop whenever you want.
- **Cooperative control flow** — used historically to implement async (Redux-Saga still does).

\`\`\`js
async function* lines(reader) {
  const decoder = new TextDecoder();
  let buf = "";
  for await (const chunk of reader) {
    buf += decoder.decode(chunk);
    let idx;
    while ((idx = buf.indexOf("\\n")) >= 0) {
      yield buf.slice(0, idx);
      buf = buf.slice(idx + 1);
    }
  }
}
\`\`\`

Async generators (\`async function*\`) + \`for await ... of\` let you stream anything.`,
      tags: ["advanced", "iterables"],
    },
    {
      id: "proxy-reflect",
      title: "Proxy and Reflect",
      difficulty: "hard",
      question: "What are Proxy and Reflect and what problems do they solve?",
      answer: `A **Proxy** wraps an object and lets you intercept fundamental operations — \`get\`, \`set\`, \`has\`, \`deleteProperty\`, \`apply\`, \`construct\`, etc. — via **traps**.

\`\`\`js
const target = { count: 0 };
const handler = {
  get(obj, prop) { console.log("read", prop); return Reflect.get(obj, prop); },
  set(obj, prop, value) {
    if (prop === "count" && typeof value !== "number") throw new TypeError();
    return Reflect.set(obj, prop, value);
  },
};
const proxy = new Proxy(target, handler);
proxy.count = 5;       // logs set via default Reflect
proxy.count = "nope";  // TypeError
\`\`\`

**\`Reflect\`** mirrors each proxy trap as a default implementation — use it inside traps to forward to the real behavior.

**Real-world uses:**
- **Vue 3 reactivity** — Proxies dependency-track reads and invalidate on writes.
- **ORM-style lazy loading** — intercept property access to fetch on demand.
- **Validation / contracts** — throw on invalid assignments.
- **Observable state** (MobX, Signals).
- **Mocks / spies** in tests.

**Caveats:** Proxies have overhead; don't wrap hot-path objects. Some operations (e.g. internal slots on built-ins like \`Date\`, \`Map\`) can't be intercepted fully.`,
      tags: ["advanced", "meta"],
    },
    {
      id: "memory-leaks",
      title: "Memory leaks in JavaScript",
      difficulty: "hard",
      question: "What causes memory leaks in JavaScript and how do you avoid them?",
      answer: `A **leak** is a live reference the engine can't garbage-collect because it's still reachable from a root (global, DOM, closures). Common causes:

- **Accidental globals** — assigning to undeclared variables (\`foo = 1\` in sloppy mode) hangs them off \`window\`.
- **Forgotten timers / listeners** — \`setInterval\` that captures a closure keeps its scope alive forever. \`element.addEventListener\` without \`removeEventListener\`.
- **Detached DOM nodes** — removing an element from the DOM but keeping a JS reference (e.g. in an array, in React state).
- **Closures holding large objects** — returned functions that close over huge arrays keep them alive.
- **Caches with no eviction** — \`const cache = new Map()\` that grows forever.
- **Circular references** — modern engines handle cycles fine; the leak happens when *something else* keeps them reachable.

**Tools to find leaks:**
- Chrome DevTools **Memory** tab: heap snapshots, comparison, allocation timeline
- Node: \`--inspect\`, \`heapdump\`, \`clinic.js\`
- \`process.memoryUsage()\` / \`performance.memory\`

**Prevention:**
- Use \`WeakMap\` / \`WeakSet\` for metadata keyed by object — entries disappear when keys are GC'd.
- Bound cache sizes (LRU).
- Clean up effects / listeners in framework teardown (\`useEffect\` cleanup, Vue \`onUnmounted\`).`,
      tags: ["advanced", "performance"],
    },
    {
      id: "weakmap-weakset",
      title: "WeakMap and WeakSet",
      difficulty: "hard",
      question: "What are WeakMap and WeakSet, and when should you use them?",
      answer: `**\`WeakMap\`** is a map whose **keys must be objects** (or symbols) and are held **weakly** — if nothing else references a key, the entry is garbage-collected automatically. \`WeakSet\` is the analogous set.

\`\`\`js
const metadata = new WeakMap();
function tag(element) { metadata.set(element, { createdAt: Date.now() }); }
// When element is removed from DOM and nothing else holds it,
// the entry silently disappears from metadata.
\`\`\`

**Restrictions:**
- **Not iterable** — no \`.keys()\`, \`.values()\`, or \`.size\`. Enumeration would expose GC timing.
- Keys must be objects/symbols; primitives aren't allowed.

**Typical uses:**
- **Private data** for objects you don't own (e.g. DOM nodes): stash state without polluting the node.
- **Memoization** keyed by argument identity.
- **Event listener bookkeeping** tied to the element's lifetime.
- **Class-like private state** before \`#private\` fields existed.

If you need enumeration, use \`Map\` with explicit cleanup. If you just want values tied to an object's lifetime, \`WeakMap\` is the right tool.`,
      tags: ["advanced", "memory"],
    },
    {
      id: "deep-clone",
      title: "Deep clone",
      difficulty: "hard",
      question: "How do you correctly deep-clone an object in JavaScript?",
      answer: `**Shallow clone** (\`{...obj}\`, \`Object.assign\`, \`Array.from\`) only copies the top level. Nested objects are shared.

**Deep clone options:**

1. **\`structuredClone()\`** — native, supports \`Date\`, \`Map\`, \`Set\`, \`RegExp\`, typed arrays, circular refs. Doesn't clone functions, DOM nodes, or class instances (loses prototype).
   \`\`\`js
   const deep = structuredClone(obj);
   \`\`\`
2. **\`JSON.parse(JSON.stringify(obj))\`** — old trick. Fast but drops \`undefined\`, functions, \`Date\` (becomes string), \`Map\`/\`Set\`, and fails on circular refs.
3. **Library**: Lodash's \`cloneDeep\` handles more edge cases at a cost.
4. **Hand-written recursive clone** when you need to preserve class identity (copy prototype, handle special types manually).

**Guidelines:**
- For plain data: \`structuredClone\` is the right default.
- For React/Redux: prefer **immutable updates** (\`{...obj, field: v}\`) — cheaper and cleaner than deep cloning.
- For configuration/serialization: if the object is already JSON-compatible, \`JSON.parse(JSON.stringify(...))\` is fine and fast.`,
      tags: ["advanced", "patterns"],
    },
    {
      id: "currying",
      title: "Currying and partial application",
      difficulty: "hard",
      question: "What's the difference between currying and partial application?",
      answer: `Both transform a multi-argument function into a form that takes fewer arguments per call.

- **Partial application** — fix *some* arguments, return a function taking the rest. Usually one step.
- **Currying** — transform \`f(a, b, c)\` into \`f(a)(b)(c)\`. Every call takes exactly one argument.

\`\`\`js
// Partial application with bind
const greet = (greeting, name) => \`\${greeting}, \${name}\`;
const hi = greet.bind(null, "Hi");
hi("Ada");  // "Hi, Ada"

// Curried version
const curriedGreet = greeting => name => \`\${greeting}, \${name}\`;
curriedGreet("Hi")("Ada");
\`\`\`

**Why it matters:**
- Currying composes cleanly with higher-order helpers: \`users.map(formatUser("full"))\`.
- Libraries like Ramda default to curried, data-last APIs for pipelines: \`pipe(filter(isActive), map(toName))\`.
- Partial application is usually more practical in plain JS — less ceremony.

\`\`\`js
const curry = (fn, arity = fn.length) =>
  (...args) => args.length >= arity ? fn(...args) : curry(fn.bind(null, ...args), arity - args.length);
\`\`\``,
      tags: ["patterns", "functional"],
    },
    {
      id: "symbols",
      title: "Symbols and well-known symbols",
      difficulty: "hard",
      question: "What are Symbols and why do they exist?",
      answer: `A **Symbol** is a primitive whose every value is unique. They're mostly used as **non-colliding object keys**.

\`\`\`js
const s1 = Symbol("id");
const s2 = Symbol("id");
s1 === s2;          // false, even with same description

const obj = { [s1]: 42 };
obj[s1];            // 42
Object.keys(obj);   // []  — symbols are invisible to normal iteration
\`\`\`

**Uses:**
- **Hidden metadata** on objects you don't fully control — no risk of stepping on user fields.
- **Library-private protocols** — e.g. \`React.Element\` uses a symbol to mark elements.
- **Well-known symbols** — protocol hooks like \`Symbol.iterator\`, \`Symbol.asyncIterator\`, \`Symbol.toPrimitive\`, \`Symbol.hasInstance\`.

\`\`\`js
class Range {
  constructor(a, b) { this.a = a; this.b = b; }
  *[Symbol.iterator]() {
    for (let i = this.a; i < this.b; i++) yield i;
  }
}
[...new Range(0, 3)];  // [0, 1, 2]
\`\`\`

**Symbol.for / keyFor:** opt-in to a cross-realm global registry (sharable across iframes/workers). Regular \`Symbol()\` is always unique per creation.`,
      tags: ["advanced", "types"],
    },
    {
      id: "gc",
      title: "Garbage collection",
      difficulty: "hard",
      question: "How does JavaScript's garbage collector work?",
      answer: `Modern JS engines (V8, SpiderMonkey, JavaScriptCore) use **tracing garbage collection**. Core idea: starting from **roots** (the global object, call stack, etc.), mark everything reachable; sweep everything else.

**V8 specifics:**
- **Generational.** The heap is split into *young* (new) and *old* generations.
  - New objects go to the young generation. Most die quickly (generational hypothesis).
  - Survivors are promoted to the old generation after a couple of minor GCs.
- **Scavenger** — fast, copying collector for the young generation. Moves live objects to a new space, reclaims the old space wholesale.
- **Mark-Compact** — major GC for the old generation. Mark reachable, compact to eliminate fragmentation. Uses incremental, concurrent, and parallel techniques to minimize pauses.
- **Orinoco** — V8's modern GC design with concurrent marking off the main thread.

**Implications for app code:**
- **Short-lived allocations are cheap** — the young gen handles them fast. Don't prematurely optimize by pooling objects.
- **Large long-lived objects** cost more (old-gen collection is heavier). Avoid giant maps you never clear.
- **Weak references** (\`WeakMap\`, \`WeakSet\`, \`WeakRef\`) let you keep caches that don't pin memory.
- GC pauses can cause jank; measure with DevTools → Performance → GC events.`,
      tags: ["advanced", "runtime"],
    },
    {
      id: "micro-macro-ordering",
      title: "Microtask timing puzzles",
      difficulty: "hard",
      question: "Work through the output order of a mixed setTimeout/Promise/async snippet.",
      answer: `\`\`\`js
console.log("1");

setTimeout(() => console.log("2"), 0);

Promise.resolve()
  .then(() => console.log("3"))
  .then(() => console.log("4"));

(async () => {
  console.log("5");
  await null;
  console.log("6");
})();

console.log("7");
\`\`\`

**Output:** \`1 5 7 3 6 4 2\`

**Walkthrough:**
1. Synchronous run: \`1\`, then the IIFE starts, prints \`5\`. The \`await null\` suspends the IIFE and schedules the rest as a **microtask**. Sync continues, prints \`7\`.
2. Current task done → drain microtasks in order:
   - First \`.then\` callback → \`3\`
   - The suspended async resumes → \`6\`
   - Second \`.then\` → \`4\`
3. All microtasks done → render (if browser) → next macrotask: \`setTimeout\` callback → \`2\`.

**Lessons:**
- \`await\` on a non-Promise (\`null\`) still schedules a microtask — always at least one "tick" delay.
- Microtasks **always drain fully** before the next macrotask, no matter how many chained \`.then\`s.
- In browsers, rendering happens *after* the microtask drain, *before* the next task.`,
      tags: ["async", "advanced"],
    },
  ],
};
