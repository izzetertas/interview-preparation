import type { Category } from "./types";

export const typescript: Category = {
  slug: "typescript",
  title: "TypeScript",
  description:
    "TypeScript from the type system's basics to advanced patterns: generics, utility types, narrowing, conditional and mapped types, and idioms for real-world code.",
  icon: "🔷",
  questions: [
    // ───────── EASY ─────────
    {
      id: "what-is-typescript",
      title: "What is TypeScript?",
      difficulty: "easy",
      question: "What is TypeScript and what does it add to JavaScript?",
      answer: `**TypeScript** is a typed superset of JavaScript developed by Microsoft. It compiles ("transpiles") to plain JS and adds:

- **Static type checking** at edit and build time
- **Type inference** so you don't annotate everything
- **Advanced type system** — generics, unions, intersections, conditional and mapped types
- **Tooling**: autocomplete, refactoring, go-to-definition, safe renames across large codebases

TypeScript **does not** change runtime behavior — the output is JavaScript with types stripped. No runtime checks are added automatically.

\`\`\`ts
function greet(name: string): string {
  return \`Hello, \${name}\`;
}
greet(42);   // ❌ Argument of type 'number' is not assignable to parameter of type 'string'.
\`\`\`

**Pay-off:** large refactors become safe, API misuse is caught before commit, and IDEs become much more helpful.`,
      tags: ["fundamentals"],
    },
    {
      id: "basic-types",
      title: "Basic types",
      difficulty: "easy",
      question: "What are the core built-in types in TypeScript?",
      answer: `| Type        | Example                             |
|-------------|-------------------------------------|
| \`string\`     | \`"hi"\`                           |
| \`number\`     | \`42\`, \`3.14\`, \`NaN\`            |
| \`boolean\`    | \`true\`, \`false\`                  |
| \`bigint\`     | \`1n\`                             |
| \`symbol\`     | \`Symbol("id")\`                    |
| \`null\` / \`undefined\` | \`null\`, \`undefined\`        |
| \`any\`        | opt out of type checking (avoid)    |
| \`unknown\`    | "something, but I must narrow before using" |
| \`never\`      | a value that cannot exist (e.g. thrown/returning never) |
| \`void\`       | function returns nothing useful    |
| Arrays      | \`number[]\` or \`Array<number>\`    |
| Tuples      | \`[string, number]\`                |
| Object literal | \`{ name: string; age: number }\` |

**Prefer \`unknown\` over \`any\`** — it's safe by default and forces you to narrow before using the value.

**Inference** often removes the need for annotations:
\`\`\`ts
const pi = 3.14;           // inferred: number
const fruits = ["a", "b"]; // inferred: string[]
\`\`\``,
      tags: ["fundamentals", "types"],
    },
    {
      id: "interface-vs-type",
      title: "interface vs type",
      difficulty: "easy",
      question: "What's the difference between interface and type alias?",
      answer: `Both describe object shapes. 95% of the time they're interchangeable; the differences are at the edges.

| Feature                         | \`interface\`       | \`type\`                     |
|---------------------------------|-------------------|-----------------------------|
| Object shapes                   | ✅                 | ✅                           |
| Unions / intersections          | ❌                 | ✅                           |
| Primitives, tuples, mapped types | ❌                 | ✅                           |
| **Declaration merging**         | ✅                 | ❌                           |
| Extends                         | \`extends\`         | \`&\` intersection          |
| Implements on class             | ✅                 | ✅                           |
| Auto-named in errors            | ✅ (nicer)         | Expanded                    |

\`\`\`ts
interface User { id: string; name: string; }
interface User { email: string; }         // merges!
// User now has id, name, email

type ID = string | number;                // only \`type\` can union
type Point = [number, number];            // only \`type\` can tuple-alias
\`\`\`

**Rule of thumb:** use \`interface\` for public object shapes (esp. if consumers may extend via merging), use \`type\` for everything else (unions, aliases, computed types).`,
      tags: ["fundamentals"],
    },
    {
      id: "optional-readonly",
      title: "Optional and readonly properties",
      difficulty: "easy",
      question: "How do optional (?) and readonly modifiers work?",
      answer: `- **\`?\` (optional)** — the property may be absent; its type includes \`undefined\`.
- **\`readonly\`** — the property cannot be reassigned after initialization (at the type level; no runtime enforcement).

\`\`\`ts
interface User {
  id: string;
  name: string;
  email?: string;              // optional
  readonly createdAt: Date;    // cannot be reassigned
}

const u: User = { id: "u1", name: "Ada", createdAt: new Date() };
u.createdAt = new Date();      // ❌ Cannot assign to 'createdAt'
\`\`\`

**Nuances:**
- \`foo?: T\` differs from \`foo: T | undefined\` — with the latter the key *must* be present. Under \`exactOptionalPropertyTypes\` this distinction is enforced.
- \`readonly\` is shallow; nested objects can still be mutated.
- \`readonly T[]\` / \`ReadonlyArray<T>\` blocks \`.push\`, \`.sort\` etc.
- Function parameters marked \`readonly\` are a strong signal of intent even if callers don't have to respect it.`,
      tags: ["fundamentals"],
    },
    {
      id: "union-intersection",
      title: "Union and intersection types",
      difficulty: "easy",
      question: "What are union and intersection types?",
      answer: `- **Union (\`|\`)** — value can be one of several types ("or"). You must narrow before using type-specific members.
- **Intersection (\`&\`)** — value has all properties of the combined types ("and").

\`\`\`ts
type Status = "idle" | "loading" | "error";   // string literal union
function fmt(x: string | number) {
  if (typeof x === "number") return x.toFixed(2);  // narrowed to number
  return x.toUpperCase();                           // narrowed to string
}

type Named = { name: string };
type Aged  = { age: number };
type Person = Named & Aged;        // must have both
const p: Person = { name: "Ada", age: 30 };
\`\`\`

**Common gotcha:** intersections of **incompatible** primitives collapse to \`never\`:
\`\`\`ts
type X = string & number;  // never
\`\`\`

**Discriminated unions** combine unions with a literal tag for exhaustive type narrowing — one of TypeScript's most powerful patterns (covered separately).`,
      tags: ["fundamentals", "types"],
    },
    {
      id: "literal-types",
      title: "Literal types",
      difficulty: "easy",
      question: "What are literal types and why are they useful?",
      answer: `A **literal type** is a type whose only allowed value is a specific constant — a particular string, number, or boolean.

\`\`\`ts
type Direction = "up" | "down" | "left" | "right";
type HttpCode  = 200 | 201 | 204 | 400 | 401 | 404 | 500;

function move(dir: Direction) { /* ... */ }
move("up");    // ✅
move("north"); // ❌ Type '"north"' is not assignable to type 'Direction'.
\`\`\`

**Widening:** \`let s = "hi"\` is inferred as \`string\` (widened). Use \`as const\` to preserve literals:
\`\`\`ts
const dirs = ["up", "down"];                    // string[]
const dirs2 = ["up", "down"] as const;          // readonly ["up", "down"]
type Dir = (typeof dirs2)[number];              // "up" | "down"
\`\`\`

Literal unions replace \`enum\` in most modern code: zero runtime cost, better inference, and compatible with \`JSON\`.`,
      tags: ["fundamentals", "types"],
    },
    {
      id: "type-inference",
      title: "Type inference basics",
      difficulty: "easy",
      question: "How does TypeScript infer types?",
      answer: `TypeScript infers types at **declaration**, from **return values**, and by **contextual typing**.

\`\`\`ts
const n = 42;          // number (widened from 42)
const n2 = 42 as const; // 42

const arr = [1, 2, 3]; // number[]

function double(x: number) { return x * 2; }  // return inferred: number

// Contextual typing: parameter 'u' inferred from the array type
["Ada", "Bob"].map(u => u.toUpperCase());
\`\`\`

**When to annotate:**
- **Public API surfaces** (exported functions, modules). Protects callers from accidental inference changes.
- **Function arguments** — can't be inferred from a declaration.
- When inference gives \`any\` or a too-wide type.

**Don't annotate** locals and return types that are obvious from the implementation — redundant noise.`,
      tags: ["fundamentals"],
    },
    {
      id: "tuple-types",
      title: "Tuple types",
      difficulty: "easy",
      question: "What are tuple types in TypeScript?",
      answer: `A **tuple** is a fixed-length array where each position has its own type.

\`\`\`ts
type Point = [number, number];
const p: Point = [1, 2];
const bad: Point = [1, 2, 3];   // ❌ source has 3 elements, target allows 2

// Named tuple elements (for docs / hints)
type HttpResponse = [status: number, body: string];

// Rest elements
type StringThenNumbers = [string, ...number[]];

// Optional tuple element
type MaybePair = [string, number?];
\`\`\`

**Spread + tuple magic** — used heavily in variadic generics:
\`\`\`ts
type Prepend<T, U extends unknown[]> = [T, ...U];
type Nums = Prepend<0, [1, 2, 3]>; // [0, 1, 2, 3]
\`\`\`

React's \`useState\` returns a tuple (\`[value, setter]\`) so destructuring works naturally with independent variable names.`,
      tags: ["fundamentals", "types"],
    },

    // ───────── MEDIUM ─────────
    {
      id: "generics",
      title: "Generics",
      difficulty: "medium",
      question: "What are generics and when do you use them?",
      answer: `**Generics** let you write code that works over many types while preserving type relationships.

\`\`\`ts
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}
first([1, 2, 3]);      // number | undefined
first(["a", "b"]);     // string | undefined
\`\`\`

**Constraints** restrict what the type parameter can be:
\`\`\`ts
function pluck<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
pluck({ name: "Ada", age: 30 }, "name");  // inferred: string
\`\`\`

**Default generic parameters:**
\`\`\`ts
type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };
\`\`\`

**When to use generics:**
- Functions and classes whose behavior is identical for many types.
- Collection-like APIs (Map, Repository, Cache).
- API clients where request and response types are related.

**When not to:** avoid \`<T>\` when the function only uses \`T\` in one place — prefer a concrete type.`,
      tags: ["core", "generics"],
    },
    {
      id: "utility-types",
      title: "Built-in utility types",
      difficulty: "medium",
      question: "What are the common built-in utility types?",
      answer: `| Utility          | What it does                                     |
|------------------|-------------------------------------------------|
| \`Partial<T>\`      | All properties optional                          |
| \`Required<T>\`     | All properties required (strip \`?\`)             |
| \`Readonly<T>\`     | All properties readonly                          |
| \`Pick<T, K>\`      | Keep only keys K                                 |
| \`Omit<T, K>\`      | Remove keys K                                    |
| \`Record<K, V>\`    | Build \`{ [key in K]: V }\`                      |
| \`Exclude<T, U>\`   | Remove types in U from union T                   |
| \`Extract<T, U>\`   | Keep types in U from union T                     |
| \`NonNullable<T>\`  | Remove \`null\` and \`undefined\`                   |
| \`ReturnType<F>\`   | Type of F's return                               |
| \`Parameters<F>\`   | Tuple of F's params                              |
| \`Awaited<P>\`      | Unwrap \`Promise<T>\` → T (recursive)             |
| \`InstanceType<C>\` | Instance type of a class constructor             |

\`\`\`ts
interface User { id: string; name: string; email?: string; }

type UserDraft   = Partial<User>;           // all optional
type PublicUser  = Omit<User, "email">;
type UserLookup  = Record<string, User>;
type UserFetcher = ReturnType<typeof fetchUser>;   // infers the return type
\`\`\`

These compose: \`Readonly<Partial<User>>\`, \`Required<Pick<User, "email">>\`.`,
      tags: ["core", "utility"],
    },
    {
      id: "narrowing-type-guards",
      title: "Narrowing and type guards",
      difficulty: "medium",
      question: "How does type narrowing work? How do you write custom type guards?",
      answer: `**Narrowing** is how TypeScript refines a value's type inside a block based on control flow. Built-in narrowers:

- **\`typeof\`** — primitives
- **\`instanceof\`** — classes
- **\`in\`** operator — property existence
- **Equality** — \`===\`, \`!==\` with literals
- **Truthiness** — \`if (x)\` removes \`null\` / \`undefined\` / falsy literals

\`\`\`ts
function len(x: string | string[]) {
  if (typeof x === "string") return x.length;  // x: string
  return x.length;                              // x: string[]
}
\`\`\`

**Custom type guards** — a function whose return type is \`x is T\`:

\`\`\`ts
interface Cat { meow(): void }
interface Dog { bark(): void }

function isCat(a: Cat | Dog): a is Cat {
  return (a as Cat).meow !== undefined;
}

function speak(a: Cat | Dog) {
  if (isCat(a)) a.meow();   // a: Cat
  else a.bark();            // a: Dog
}
\`\`\`

**Assertion functions** — return \`void\` but guarantee a condition via \`asserts\`:
\`\`\`ts
function assertString(x: unknown): asserts x is string {
  if (typeof x !== "string") throw new Error();
}
\`\`\``,
      tags: ["core", "narrowing"],
    },
    {
      id: "discriminated-unions",
      title: "Discriminated unions",
      difficulty: "medium",
      question: "What are discriminated unions and why are they so useful?",
      answer: `A **discriminated (tagged) union** is a union of object types that all share a **literal property** used to distinguish them. TypeScript narrows based on that tag.

\`\`\`ts
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; size: number }
  | { kind: "rect"; w: number; h: number };

function area(s: Shape): number {
  switch (s.kind) {
    case "circle": return Math.PI * s.radius ** 2;
    case "square": return s.size ** 2;
    case "rect":   return s.w * s.h;
  }
}
\`\`\`

**Exhaustiveness checking** — use \`never\` to guarantee you handled every case:
\`\`\`ts
function area(s: Shape): number {
  switch (s.kind) {
    case "circle": return ...;
    case "square": return ...;
    case "rect":   return ...;
    default: { const _never: never = s; return _never; }
  }
}
\`\`\`

Perfect fit for state machines, API responses, Redux actions, and anywhere you'd otherwise use a tag + optional fields.`,
      tags: ["core", "patterns"],
    },
    {
      id: "keyof-typeof",
      title: "keyof and typeof operators",
      difficulty: "medium",
      question: "How do the keyof and typeof operators work in the type system?",
      answer: `- **\`keyof T\`** — a union of T's property names (as literal types).
- **\`typeof x\`** (in type position) — the *type* of a value \`x\`.

\`\`\`ts
interface User { id: string; name: string; age: number }

type UserKey = keyof User;          // "id" | "name" | "age"

const defaults = { page: 1, limit: 10 };
type Defaults = typeof defaults;    // { page: number; limit: number }
\`\`\`

**Idiomatic combo:**
\`\`\`ts
function prop<T, K extends keyof T>(obj: T, k: K): T[K] {
  return obj[k];
}
\`\`\`

**\`typeof\` of a \`const\` array with \`as const\`** to turn values into a union:
\`\`\`ts
const ROLES = ["admin", "editor", "viewer"] as const;
type Role = (typeof ROLES)[number];   // "admin" | "editor" | "viewer"
\`\`\`

This pattern is how you keep a single source of truth for runtime arrays and their compile-time types.`,
      tags: ["core", "types"],
    },
    {
      id: "unknown-vs-any",
      title: "unknown vs any",
      difficulty: "medium",
      question: "What's the difference between unknown and any?",
      answer: `Both accept any value, but they behave oppositely at the read site.

- **\`any\`** — opts out of type checking. You can call anything on it; nothing is checked.
- **\`unknown\`** — accepts any value safely. You must **narrow** before using it.

\`\`\`ts
let a: any = 1;
a.toUpperCase();     // no error, crashes at runtime

let u: unknown = 1;
u.toUpperCase();     // ❌ 'u' is of type 'unknown'
if (typeof u === "string") u.toUpperCase();   // ✅ narrowed
\`\`\`

**Rule of thumb:**
- External input (\`JSON.parse\`, \`fetch\` response) → type as \`unknown\`, then validate.
- When migrating legacy JS, \`any\` is a temporary band-aid.
- **Avoid \`any\` in exported APIs** — it silently infects callers.

**Linters:** the rule \`@typescript-eslint/no-explicit-any\` catches most cases.`,
      tags: ["core", "safety"],
    },
    {
      id: "never-type",
      title: "The never type",
      difficulty: "medium",
      question: "What is the never type used for?",
      answer: `\`never\` is the type of values that **never happen**. It has no valid value.

**Where it appears:**
- A function that **always throws** or **loops forever** has return type \`never\`.
  \`\`\`ts
  function fail(msg: string): never { throw new Error(msg); }
  \`\`\`
- The **empty union** \`never\` — impossible combinations reduce to it:
  \`\`\`ts
  type X = string & number;   // never
  \`\`\`
- The **unreachable branch** in narrowing:
  \`\`\`ts
  switch (shape.kind) {
    ...
    default: { const _: never = shape; /* exhaustive check */ }
  }
  \`\`\`

**Distributive trick in conditional types:**
\`\`\`ts
type NonEmpty<T> = T extends "" ? never : T;
type A = NonEmpty<"a" | "" | "b">;  // "a" | "b"  (never is absorbed in unions)
\`\`\`

**Assignability:** \`never\` is assignable to every type; no type (except \`never\` itself and \`any\`) is assignable to \`never\`. That makes it the bottom type.`,
      tags: ["core", "types"],
    },
    {
      id: "overloads",
      title: "Function overloads",
      difficulty: "medium",
      question: "How do function overloads work in TypeScript?",
      answer: `**Overloads** declare multiple call signatures for a single implementation. The implementation signature is hidden from callers.

\`\`\`ts
function parse(input: string): object;
function parse(input: string, reviver: (k: string, v: unknown) => unknown): object;
function parse(input: string, reviver?: (k: string, v: unknown) => unknown): object {
  return JSON.parse(input, reviver as any);
}
\`\`\`

**When to prefer overloads:**
- The return type depends on which arguments are passed.
- Different argument shapes produce different results.
- You want clear, separate call signatures in tooltips.

**Often overloads are replaceable by generics or conditional types**, which is usually cleaner:
\`\`\`ts
// Instead of overloading 5 cases:
function wrap<T>(x: T): { value: T } { return { value: x }; }
\`\`\`

**Gotcha:** overload signatures from *most specific to least specific*. Callers match the first compatible one.`,
      tags: ["core", "functions"],
    },
    {
      id: "index-signatures",
      title: "Index signatures and Record",
      difficulty: "medium",
      question: "What are index signatures and when should you use Record instead?",
      answer: `**Index signature** — declares that unknown keys have a specific value type.

\`\`\`ts
interface StringDict { [key: string]: string; }

const d: StringDict = { name: "Ada" };
d.age = "30";   // ✅ key is any string
\`\`\`

**Limitations:**
- All declared keys must extend the index signature's type.
- No autocomplete for specific keys.
- \`dict.foo\` returns the signature type — never \`undefined\` — even when the key is missing. Enable \`noUncheckedIndexedAccess\` to make reads \`T | undefined\` for safety.

**\`Record\`** is usually clearer when keys are a known union:

\`\`\`ts
type Role = "admin" | "editor" | "viewer";
const perms: Record<Role, string[]> = {
  admin: ["read", "write", "delete"],
  editor: ["read", "write"],
  viewer: ["read"],
};
// Missing a key is a compile error — way safer than an index signature.
\`\`\`

**Rule:** dynamic/unknown keys → index signature. Known, fixed set of keys → \`Record<Key, Value>\`.`,
      tags: ["core", "types"],
    },
    {
      id: "as-const-satisfies",
      title: "as const and satisfies",
      difficulty: "medium",
      question: "What do `as const` and `satisfies` do, and when should you use each?",
      answer: `**\`as const\`** prevents widening and makes everything deeply readonly, preserving literal types.

\`\`\`ts
const colors = ["red", "green"] as const;
// readonly ["red", "green"]
type Color = (typeof colors)[number];  // "red" | "green"
\`\`\`

**\`satisfies\`** (TS 4.9+) verifies that a value conforms to a type **without** widening the inferred type.

\`\`\`ts
const routes = {
  home: "/",
  about: "/about",
} satisfies Record<string, \`/\${string}\`>;
// inferred: { home: "/"; about: "/about"; }  ← narrow values preserved
routes.home.toUpperCase();  // still narrow "/"

// Without satisfies:
const routes2: Record<string, \`/\${string}\`> = { home: "/", about: "/about" };
// routes2.home is just \`/\${string}\` — we lost the literal.
\`\`\`

**Rule of thumb:**
- \`as const\` — freeze values and get literals. Works great with enum-like arrays.
- \`satisfies\` — *typecheck* a value against a type while keeping the inferred narrow shape.`,
      tags: ["core", "patterns"],
    },

    // ───────── HARD ─────────
    {
      id: "conditional-types",
      title: "Conditional types",
      difficulty: "hard",
      question: "What are conditional types and how do they work?",
      answer: `A **conditional type** is a type-level \`if\`:

\`\`\`ts
type IsString<T> = T extends string ? true : false;
type A = IsString<"hi">;    // true
type B = IsString<42>;      // false
\`\`\`

**Distribution over unions:** when the checked type is a "naked" type parameter, the conditional distributes:

\`\`\`ts
type ToArray<T> = T extends any ? T[] : never;
type X = ToArray<string | number>;   // string[] | number[]
\`\`\`

Wrap in a tuple to **disable** distribution:
\`\`\`ts
type ToArray2<T> = [T] extends [any] ? T[] : never;
type Y = ToArray2<string | number>;  // (string | number)[]
\`\`\`

**\`infer\` keyword** — pattern-match to extract a type:
\`\`\`ts
type ReturnType2<F> = F extends (...a: any[]) => infer R ? R : never;
type A = ReturnType2<() => number>;  // number

type First<T extends any[]> = T extends [infer H, ...any[]] ? H : never;
type F = First<[string, number]>;   // string
\`\`\`

Most built-in utilities (\`Parameters\`, \`ReturnType\`, \`Awaited\`) are conditional types with \`infer\`.`,
      tags: ["advanced", "types"],
    },
    {
      id: "mapped-types",
      title: "Mapped types",
      difficulty: "hard",
      question: "What are mapped types and how do they work?",
      answer: `A **mapped type** iterates over the keys of a type and produces a new type. Syntax mirrors index signatures but with a \`keyof\`-style iteration.

\`\`\`ts
type Readonly2<T> = { readonly [K in keyof T]: T[K] };
type Partial2<T>  = { [K in keyof T]?: T[K] };
type Nullable<T>  = { [K in keyof T]: T[K] | null };
\`\`\`

**Modifiers**:
- \`readonly\` and \`?\` can be **added** (default) or **removed** with \`-readonly\` / \`-?\`.
\`\`\`ts
type MutableRequired<T> = { -readonly [K in keyof T]-?: T[K] };
\`\`\`

**Key remapping (\`as\`)** lets you transform the key:
\`\`\`ts
type Getters<T> = {
  [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K];
};
type X = Getters<{ name: string; age: number }>;
// { getName: () => string; getAge: () => number }
\`\`\`

Mapped types compose with conditional types for very expressive transforms (e.g. "make all string fields optional" or "prefix all keys with 'on'").`,
      tags: ["advanced", "types"],
    },
    {
      id: "template-literal-types",
      title: "Template literal types",
      difficulty: "hard",
      question: "What are template literal types?",
      answer: `A **template literal type** is a type whose value is a string pattern built from other types — the type-level mirror of JS template literals.

\`\`\`ts
type Greeting = \`hello, \${string}\`;
const g1: Greeting = "hello, Ada";    // ✅
const g2: Greeting = "hey";           // ❌

type ID = \`user_\${number}\`;
const id: ID = \`user_42\`;             // ✅
\`\`\`

**Built-in helpers:** \`Uppercase\`, \`Lowercase\`, \`Capitalize\`, \`Uncapitalize\`.

**Pattern-extraction via \`infer\`:**
\`\`\`ts
type Split<S extends string, D extends string> =
  S extends \`\${infer A}\${D}\${infer B}\` ? [A, ...Split<B, D>] : [S];
type Parts = Split<"a.b.c", ".">;   // ["a", "b", "c"]
\`\`\`

**Real uses:**
- Type-safe route params: \`/users/:id\` → extract \`id\` as a string key.
- CSS-in-TS: enforce color format \`#\${string}\`.
- Event names in an API: \`on\${Capitalize<EventName>}\`.

Combined with mapped types, template literal types make it possible to encode surprising amounts of string-shape logic at the type level.`,
      tags: ["advanced", "types"],
    },
    {
      id: "branded-types",
      title: "Branded / nominal types",
      difficulty: "hard",
      question: "What are branded types and why do you want them?",
      answer: `TypeScript is **structural** — two types with the same shape are assignable. That's usually helpful, but occasionally you want a **nominal** distinction: \`UserId\` and \`OrderId\` are both strings, but mixing them should be an error.

\`\`\`ts
type Brand<T, B> = T & { __brand: B };

type UserId  = Brand<string, "UserId">;
type OrderId = Brand<string, "OrderId">;

function userIdOf(raw: string): UserId { return raw as UserId; }

function fetchOrder(id: OrderId) { ... }

const u: UserId = userIdOf("u_1");
fetchOrder(u);    // ❌ Argument of type 'UserId' is not assignable to 'OrderId'.
\`\`\`

**Zero runtime cost** — the brand is a phantom property that disappears in the output. Assignment is gated by a single constructor function per brand.

**Common uses:**
- IDs of different entities
- Units (\`Meters\`, \`Seconds\`, \`Cents\`)
- Validated values (\`Email\`, \`NonEmptyString\`, \`SanitizedHtml\`)

Runtime validators (Zod, io-ts) often produce branded types automatically when they parse.`,
      tags: ["advanced", "patterns"],
    },
    {
      id: "variance",
      title: "Variance: covariance, contravariance, bivariance",
      difficulty: "hard",
      question: "What is variance in TypeScript and why does it matter?",
      answer: `**Variance** describes how subtype relationships propagate through type constructors.

- **Covariant** — subtype flows through. \`Dog[]\` is a subtype of \`Animal[]\`.
- **Contravariant** — subtype flows *backwards*. Function parameter positions: a function taking \`Animal\` is a subtype of one taking \`Dog\` (it accepts fewer inputs... wait, more. Think: a handler that takes any Animal can be used where a Dog handler is expected.).
- **Bivariant** — works both ways (unsound). TS allows it for method parameters for ergonomic reasons unless \`strictFunctionTypes\` is on.
- **Invariant** — no subtype flow.

\`\`\`ts
class Animal { name = "" }
class Dog extends Animal { bark() {} }

// Covariance on arrays (allowed, though technically unsound for mutation)
const dogs: Dog[] = [new Dog()];
const animals: Animal[] = dogs;       // ✅

// Contravariance on function parameters (with strictFunctionTypes)
type Handler<T> = (x: T) => void;
let h: Handler<Dog> = (d) => d.bark();
const h2: Handler<Animal> = (a) => console.log(a.name);
h = h2;   // ✅ a handler of Animal can handle any Dog
\`\`\`

**Why it matters:** bugs like "I stored a Dog in an Animal[] and later pulled out what I assumed was a Cat" are real. Enable \`strictFunctionTypes\` and prefer \`readonly\` arrays when you don't need mutation — \`ReadonlyArray\` is covariant and safe.`,
      tags: ["advanced", "theory"],
    },
    {
      id: "recursive-types",
      title: "Recursive types",
      difficulty: "hard",
      question: "How do you model recursive data types?",
      answer: `Types can refer to themselves — directly or through helpers — to model trees, linked lists, JSON, and more.

\`\`\`ts
type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [k: string]: JSONValue };

type TreeNode<T> = { value: T; children: TreeNode<T>[] };
\`\`\`

**Recursive conditional types** power structural transforms:
\`\`\`ts
type DeepReadonly<T> =
  T extends (...args: any[]) => any ? T
  : T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;

type Paths<T, Prefix extends string = ""> =
  T extends object
    ? { [K in keyof T & string]:
          | \`\${Prefix}\${K}\`
          | Paths<T[K], \`\${Prefix}\${K}.\`>;
      }[keyof T & string]
    : never;
type P = Paths<{ user: { id: string; name: string } }>;
// "user" | "user.id" | "user.name"
\`\`\`

**Limits:** TS enforces a **recursion depth** (~50 by default). Deeply nested types may hit "Type instantiation is excessively deep." Use tail-recursive conditional types and break chains into helpers to avoid it.`,
      tags: ["advanced", "types"],
    },
    {
      id: "declaration-merging",
      title: "Declaration merging and module augmentation",
      difficulty: "hard",
      question: "What is declaration merging and when do you use module augmentation?",
      answer: `**Declaration merging** — multiple declarations of the same name are combined by TS. Works for:

- **Interfaces** — fields are unioned.
- **Namespaces** — members are merged.
- **Classes + namespaces** — static and instance combined.

\`\`\`ts
interface Window { myApp: { version: string } }
interface Window { myApp: { env: "dev" | "prod" } }
// Both fields exist on Window.myApp
\`\`\`

**Module augmentation** adds to types declared in another module:

\`\`\`ts
// add a method to Array in a .d.ts or ambient file
declare global {
  interface Array<T> {
    last(): T | undefined;
  }
}
Array.prototype.last = function () { return this[this.length - 1]; };

// Add a field to a third-party library's type
declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}
\`\`\`

**Uses:** typing plugins that mutate globals, extending framework types (Express Request, Vue component options), adding test matchers.

**Caveat:** types don't check runtime behavior. Merging a field doesn't mean it exists at runtime.`,
      tags: ["advanced", "modules"],
    },
    {
      id: "strict-mode-flags",
      title: "Strict mode flags",
      difficulty: "hard",
      question: 'What does "strict": true enable, and which flags really matter?',
      answer: `\`"strict": true\` in \`tsconfig.json\` is a shortcut for a bundle of flags. Each catches a specific class of bugs.

| Flag                           | What it does                                                     |
|--------------------------------|------------------------------------------------------------------|
| \`strictNullChecks\`           | \`null\`/\`undefined\` are their own types; you must narrow         |
| \`noImplicitAny\`              | No variable/argument silently typed as \`any\`                    |
| \`strictFunctionTypes\`        | Function parameters are contravariant (safer)                    |
| \`strictBindCallApply\`        | Typecheck \`.bind\`, \`.call\`, \`.apply\` arguments                |
| \`strictPropertyInitialization\` | Class fields must be initialized or marked optional              |
| \`alwaysStrict\`               | Emits \`"use strict"\` in every file                              |
| \`useUnknownInCatchVariables\` | \`catch (err)\` → \`err: unknown\` instead of \`any\`               |

**Beyond strict — very useful extras:**
- \`noUncheckedIndexedAccess\` — \`arr[i]\` and \`dict[key]\` return \`T | undefined\`.
- \`exactOptionalPropertyTypes\` — distinguishes \`foo?: string\` from \`foo: string | undefined\`.
- \`noImplicitOverride\` — require \`override\` keyword on subclass methods.
- \`noFallthroughCasesInSwitch\`, \`noImplicitReturns\` — control-flow safety.

**Recommendation:** turn on all strict flags in new projects; migrate incrementally with \`@ts-expect-error\` in old ones.`,
      tags: ["config", "safety"],
    },
  ],
};
