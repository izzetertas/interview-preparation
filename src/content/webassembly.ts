import type { Category } from "./types";

export const webassembly: Category = {
  slug: "webassembly",
  title: "WebAssembly",
  description:
    "WebAssembly in depth: binary format, .wat text format, JS interop (WebAssembly JS API, memory, imports/exports), compilation from Rust/C/AssemblyScript, WASI, streaming instantiation, threads, the Component Model, and performance characteristics in browser and server runtimes.",
  icon: "🔧",
  questions: [
    // ───── EASY ─────
    {
      id: "what-is-webassembly",
      title: "What is WebAssembly?",
      difficulty: "easy",
      question: "What is WebAssembly and why was it created?",
      answer: `**WebAssembly (Wasm)** is a portable binary instruction format designed as a compilation target for high-level languages. It executes at near-native speed inside a safe, sandboxed virtual machine.

**Key design goals:**

| Goal | Description |
|------|-------------|
| **Fast** | Decodes and compiles much faster than parsing JS; runs at near-native speed |
| **Safe** | Memory-isolated sandbox; no arbitrary system access without explicit imports |
| **Portable** | Same binary runs on x86, ARM, RISC-V — in browser and outside it |
| **Open** | W3C standard; implemented by all major browsers and many runtimes |

**Why it was created:**

The web needed a way to run compute-heavy workloads (games, codecs, simulations, AI inference) without shipping native executables. asm.js proved the concept but was a hack. Wasm provides a proper, compact binary format with well-defined semantics.

**Quick mental model:**

\`\`\`
Source (Rust / C / C++ / AssemblyScript / …)
        │
        ▼ compiler (clang / rustc / etc.)
   .wasm binary   ◄──  type-checked, validated on load
        │
        ▼
  Wasm VM (browser / Node / Deno / Bun / Wasmtime / …)
        │
        ▼
  JIT/AOT native code
\`\`\`

> In 2026 the Wasm ecosystem extends far beyond the browser: WASI gives Wasm POSIX-like capabilities, and the Component Model enables cross-language interoperability at the module boundary.`,
      tags: ["fundamentals"],
    },
    {
      id: "wasm-vs-javascript",
      title: "WebAssembly vs JavaScript",
      difficulty: "easy",
      question: "How does WebAssembly compare to JavaScript in terms of performance, use cases, and workflow?",
      answer: `WebAssembly and JavaScript are **complementary**, not competitors. Browsers run both in the same JS engine.

**Comparison table:**

| Dimension | JavaScript | WebAssembly |
|-----------|-----------|-------------|
| **Parsing** | Text → AST (slow on cold start) | Binary decode (fast) |
| **Type system** | Dynamic | Statically typed (i32, i64, f32, f64, v128, …) |
| **JIT warm-up** | Needs profiling runs | AOT-compiled on decode; near-peak from first run |
| **Peak throughput** | ~50–80 % native | ~70–95 % native (depends on workload) |
| **GC pressure** | High (managed heap) | None in linear-memory modules; opt-in with WasmGC |
| **DOM access** | Native | Via JS glue (imported functions) |
| **Startup** | Fast (V8 parses lazily) | Slightly heavier per-byte but compresses better |
| **Ecosystem** | Enormous | Growing fast; Wasmtime, WASI P2, Component Model |

**When to reach for Wasm:**
- CPU-intensive algorithms (image/video codecs, crypto, physics engines, ML inference)
- Porting an existing native codebase (SQLite, ffmpeg, Opus)
- Sandboxing untrusted code safely

**When to stay with JS:**
- DOM manipulation, event handling, most UI logic
- Small utilities — the JS engine is already excellent for those
- Rapid prototyping (no compilation step)

> The sweet spot is a **JS orchestration layer + Wasm hot paths**: JS calls Wasm for the heavy lifting, JS handles the rest.`,
      tags: ["fundamentals", "performance"],
    },
    {
      id: "wasm-use-cases",
      title: "WebAssembly use cases",
      difficulty: "easy",
      question: "What are the most common real-world use cases for WebAssembly?",
      answer: `**Browser-side use cases:**

| Use case | Examples |
|----------|---------|
| Media codecs | AV1 decode, ffmpeg.wasm, Opus encoder |
| Image processing | Squoosh (WebP/AVIF encode), Photopea |
| Games / 3D | Unity WebGL, Unreal Engine, Babylon.js physics |
      | Cryptography | libsodium.js, age encryption |
| Scientific computing | NumPy-like libs, simulations, ML inference (ONNX Runtime Web) |
| Legacy code ports | AutoCAD, Google Earth, SQLite (wa-sqlite) |

**Server / edge use cases (WASI, 2026):**

| Use case | Examples |
|----------|---------|
| Serverless / edge functions | Fastly Compute, Cloudflare Workers (Wasm), Fermyon Spin |
| Plugin systems | Extism, Zed editor extensions, Envoy filters |
| Sandboxed user code | Code execution platforms, CI runners |
| Cross-language libraries | Shared business logic compiled once, used from many hosts |

**Key reasons Wasm wins in these scenarios:**
- **Isolation** — each module instance has its own linear memory; a crash cannot corrupt the host.
- **Portability** — one \`.wasm\` file runs everywhere without recompilation.
- **Predictable performance** — no GC pauses in linear-memory modules.`,
      tags: ["use-cases"],
    },
    {
      id: "wat-text-format",
      title: "The .wat text format",
      difficulty: "easy",
      question: "What is the WebAssembly Text Format (.wat) and when would you use it?",
      answer: `**WebAssembly Text Format (WAT)** is the human-readable S-expression representation of a Wasm binary. Every \`.wasm\` file has a 1-to-1 textual equivalent in \`.wat\`.

**Anatomy of a minimal WAT module:**

\`\`\`wat
(module
  ;; Import the host's log function
  (import "env" "log" (func $log (param i32)))

  ;; Declare a function that adds two integers
  (func $add (export "add") (param $a i32) (param $b i32) (result i32)
    local.get $a
    local.get $b
    i32.add
  )

  ;; A simple memory (1 page = 64 KiB)
  (memory (export "memory") 1)

  ;; A data segment placed at offset 0
  (data (i32.const 0) "Hello, Wasm!\x00")
)
\`\`\`

**When to use WAT:**

| Scenario | Reason |
|----------|--------|
| Learning Wasm internals | Closest to the actual instruction set |
| Debugging compiled output | \`wasm2wat\` (wabt) converts binaries back to WAT |
| Writing tiny hand-optimised routines | Avoid compiler overhead for trivial functions |
| Reading error messages | Wasm engines report errors using WAT identifiers |

**Tooling:**
- \`wat2wasm\` / \`wasm2wat\` — part of the [wabt](https://github.com/WebAssembly/wabt) toolkit
- \`wasm-objdump -d module.wasm\` — disassemble without a full conversion

> WAT is a debugging and learning tool; production Wasm is always generated by a compiler.`,
      tags: ["wat", "fundamentals"],
    },
    {
      id: "wasm-binary-structure",
      title: "Wasm module structure",
      difficulty: "easy",
      question: "What are the main sections of a WebAssembly binary module?",
      answer: `A \`.wasm\` file starts with a **4-byte magic** (\`\\0asm\`) and a **4-byte version** (\`1 0 0 0\`), followed by a sequence of typed sections.

**Core sections (in order):**

| Section | ID | Purpose |
|---------|----|---------|
| Type | 1 | Function signatures (parameter/result types) |
| Import | 2 | Functions, memories, tables, globals from the host |
| Function | 3 | Maps each local function to a type index |
| Table | 4 | Indirect call tables (e.g., function pointers) |
| Memory | 5 | Linear memory declarations |
| Global | 6 | Mutable/immutable global values |
| Export | 7 | Names exported to the host |
| Start | 8 | Optional initialiser function called after instantiation |
| Element | 9 | Initialises table entries |
| Code | 10 | Actual function bodies (locals + instructions) |
| Data | 11 | Initialises memory regions |
| Custom | 0 | Debug info (\`name\` section), DWARF, source maps |

**Key insight:** Wasm is a **streaming** format — sections are ordered so a runtime can begin compiling functions while still downloading the module (see \`WebAssembly.instantiateStreaming\`).

**Inspect a binary:**
\`\`\`bash
wasm-objdump -h module.wasm   # section headers
wasm-objdump -x module.wasm   # full details
\`\`\``,
      tags: ["internals", "binary-format"],
    },
    {
      id: "wasm-value-types",
      title: "Wasm value types",
      difficulty: "easy",
      question: "What primitive value types does WebAssembly support?",
      answer: `WebAssembly has a small, machine-friendly type system.

**Numeric types:**

| Type | Width | Notes |
|------|-------|-------|
| \`i32\` | 32-bit integer | Default for booleans, pointers in 32-bit modules |
| \`i64\` | 64-bit integer | Used for 64-bit arithmetic |
| \`f32\` | 32-bit float | IEEE 754 single precision |
| \`f64\` | 64-bit float | IEEE 754 double precision |

**SIMD type (Wasm SIMD proposal, widely shipped):**

| Type | Width | Notes |
|------|-------|-------|
| \`v128\` | 128-bit vector | Wraps 4×f32, 2×f64, 8×i16, 16×i8, etc. |

**Reference types:**

| Type | Notes |
|------|-------|
| \`funcref\` | Opaque reference to a Wasm function (used in tables) |
| \`externref\` | Opaque host object (e.g., a JS value) |

**WasmGC types (fully shipped 2024+):**

\`struct\`, \`array\`, and typed function references — enabling managed-language runtimes (Kotlin, Dart, OCaml) to compile to Wasm without a custom GC in linear memory.

> **Note:** There is no native string, boolean, or pointer type. Strings are passed as (pointer, length) pairs into linear memory, or as \`externref\` when using WasmGC / JS interop.`,
      tags: ["types", "fundamentals"],
    },
    {
      id: "wasm-js-api-basics",
      title: "WebAssembly JS API basics",
      difficulty: "easy",
      question: "How do you load and instantiate a .wasm module from JavaScript?",
      answer: `The **WebAssembly JavaScript API** lives on the global \`WebAssembly\` object.

**Streaming instantiation (preferred):**
\`\`\`js
const { instance, module } = await WebAssembly.instantiateStreaming(
  fetch("/math.wasm"),
  { env: { memory: new WebAssembly.Memory({ initial: 1 }) } }
);

// Call an exported function
const result = instance.exports.add(3, 4); // 7
\`\`\`

**Buffer-based instantiation (when you already have an ArrayBuffer):**
\`\`\`js
const buffer = await fetch("/math.wasm").then((r) => r.arrayBuffer());
const { instance } = await WebAssembly.instantiate(buffer, importObject);
\`\`\`

**Key objects:**

| Object | Purpose |
|--------|---------|
| \`WebAssembly.Module\` | Compiled, transferable module (can be postMessage'd) |
| \`WebAssembly.Instance\` | Running instance with live \`exports\` |
| \`WebAssembly.Memory\` | Growable \`ArrayBuffer\` backing linear memory |
| \`WebAssembly.Table\` | Array of \`funcref\` / \`externref\` values |
| \`WebAssembly.Global\` | Mutable or immutable shared global |
| \`WebAssembly.Tag\` / \`WebAssembly.Exception\` | Exception handling proposal |

**Streaming requires correct MIME type:** the server must respond with \`Content-Type: application/wasm\`; otherwise use the buffer path.`,
      tags: ["js-api", "interop"],
    },
    {
      id: "wasm-linear-memory",
      title: "Linear memory",
      difficulty: "easy",
      question: "What is WebAssembly linear memory and how is it shared with JavaScript?",
      answer: `**Linear memory** is a contiguous, byte-addressable region that a Wasm instance uses as its heap and stack. It is exposed to JS as an \`ArrayBuffer\`.

**Characteristics:**
- Starts at byte offset 0.
- Grows in **pages** of exactly 64 KiB. Initial size and an optional maximum are declared in the module.
- Wasm instructions address memory with \`i32\` (or \`i64\` in memory64) byte offsets.
- Memory **cannot shrink** (only grow via \`memory.grow\`).

**Creating and sharing memory from JS:**
\`\`\`js
// Allocate 1 page (64 KiB), allow up to 10 pages
const memory = new WebAssembly.Memory({ initial: 1, maximum: 10 });

const { instance } = await WebAssembly.instantiateStreaming(
  fetch("/lib.wasm"),
  { env: { memory } }
);

// JS and Wasm share the same buffer
const view = new Uint8Array(memory.buffer);
view[0] = 42; // Wasm can read this at address 0

// After memory.grow(), memory.buffer is a NEW ArrayBuffer!
// Always re-read memory.buffer after a grow.
memory.grow(1);
const fresh = new Uint8Array(memory.buffer); // re-acquire
\`\`\`

**Passing strings through linear memory:**
\`\`\`js
function writeString(memory, ptr, str) {
  const bytes = new TextEncoder().encode(str + "\\0");
  new Uint8Array(memory.buffer).set(bytes, ptr);
}
\`\`\`

> Memory is the primary channel for passing complex data between JS and Wasm. High-level toolchains (wasm-bindgen, Emscripten) generate the glue automatically.`,
      tags: ["memory", "interop"],
    },
    // ───── MEDIUM ─────
    {
      id: "rust-to-wasm",
      title: "Compiling Rust to WebAssembly",
      difficulty: "medium",
      question: "Walk through compiling a Rust function to WebAssembly and calling it from JavaScript.",
      answer: `**Toolchain setup:**
\`\`\`bash
rustup target add wasm32-unknown-unknown
cargo install wasm-pack wasm-bindgen-cli
\`\`\`

**Rust library (\`src/lib.rs\`):**
\`\`\`rust
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn fibonacci(n: u32) -> u32 {
    if n <= 1 { return n; }
    let (mut a, mut b) = (0u32, 1u32);
    for _ in 2..=n {
        let c = a + b;
        a = b;
        b = c;
    }
    b
}

#[wasm_bindgen]
pub fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}
\`\`\`

**\`Cargo.toml\` additions:**
\`\`\`toml
[lib]
crate-type = ["cdylib"]

[dependencies]
wasm-bindgen = "0.2"
\`\`\`

**Build:**
\`\`\`bash
wasm-pack build --target web   # outputs pkg/ with .wasm + JS glue + .d.ts
\`\`\`

**Consume in JS/TS:**
\`\`\`js
import init, { fibonacci, greet } from "./pkg/my_crate.js";

await init(); // instantiates the .wasm
console.log(fibonacci(40)); // 102334155
console.log(greet("World")); // "Hello, World!"
\`\`\`

**What wasm-bindgen does:**
- Generates JS glue that marshals strings, slices, and JS values across the Wasm boundary.
- Emits TypeScript declarations for type safety.
- Handles linear-memory lifetime for heap-allocated types (Box, Vec, String).

**Optimise the binary:**
\`\`\`toml
[profile.release]
opt-level = "z"   # size-optimise
lto = true
\`\`\`
\`\`\`bash
wasm-opt -Oz pkg/my_crate_bg.wasm -o pkg/my_crate_bg.wasm
\`\`\``,
      tags: ["rust", "compilation", "wasm-bindgen"],
    },
    {
      id: "assemblyscript",
      title: "AssemblyScript",
      difficulty: "medium",
      question: "What is AssemblyScript and how does it differ from compiling Rust or C to WebAssembly?",
      answer: `**AssemblyScript** is a TypeScript-like language that compiles directly to WebAssembly. It is designed specifically for Wasm — not a general-purpose language being retargeted.

**Hello World:**
\`\`\`typescript
// assembly/index.ts
export function add(a: i32, b: i32): i32 {
  return a + b;
}

export function factorial(n: i64): i64 {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}
\`\`\`

**Build:**
\`\`\`bash
npm install --save-dev assemblyscript
npx asc assembly/index.ts --outFile build/release.wasm --optimize
\`\`\`

**Comparison:**

| Dimension | AssemblyScript | Rust + wasm-bindgen | C/C++ + Emscripten |
|-----------|---------------|--------------------|--------------------|
| Learning curve | Low (TS devs) | Medium–High | High |
| Binary size | Very small | Small (with wz opt) | Large (runtime) |
| Ecosystem | Growing | Mature (crates.io) | Large (C libs) |
| GC | Manual (no GC by default) | Manual | Manual |
| JS interop glue | Minimal | wasm-bindgen | Emscripten JS |
| Use case | Custom Wasm modules, edge | Systems code | Porting C codebases |

**Calling from JS:**
\`\`\`js
const { instance } = await WebAssembly.instantiateStreaming(fetch("build/release.wasm"));
const { add, factorial } = instance.exports;
console.log(add(3, 4));         // 7
console.log(factorial(10n));    // 3628800n  (i64 → BigInt)
\`\`\`

> AssemblyScript is ideal when you want Wasm without learning a systems language — common for edge compute plugins, algorithmic hot paths in a JS project, or Wasm-native tooling.`,
      tags: ["assemblyscript", "compilation"],
    },
    {
      id: "imports-exports",
      title: "Wasm imports and exports",
      difficulty: "medium",
      question: "How do Wasm module imports and exports work? Give examples of importing JS functions and exporting Wasm functions.",
      answer: `Wasm modules communicate with their host through **imports** (what the module needs) and **exports** (what the module provides).

**WAT example — importing a JS log and exporting a function:**
\`\`\`wat
(module
  ;; Import: module "env", name "consoleLog", takes an i32
  (import "env" "consoleLog" (func $log (param i32)))

  (func (export "double") (param $x i32) (result i32)
    local.get $x
    i32.const 2
    i32.mul
  )

  (func (export "logAndDouble") (param $x i32) (result i32)
    local.get $x
    call $log          ;; call the imported JS function
    local.get $x
    i32.const 2
    i32.mul
  )
)
\`\`\`

**Matching JS import object:**
\`\`\`js
const importObject = {
  env: {
    consoleLog: (value) => console.log("Wasm says:", value),
  },
};

const { instance } = await WebAssembly.instantiateStreaming(
  fetch("module.wasm"),
  importObject
);

instance.exports.logAndDouble(21); // logs "Wasm says: 21", returns 42
\`\`\`

**What can be imported/exported:**

| Item | Import | Export |
|------|--------|--------|
| Functions | Yes | Yes |
| Memory | Yes | Yes |
| Table | Yes | Yes |
| Global | Yes | Yes |

**Rust/wasm-bindgen example — importing a JS function:**
\`\`\`rust
#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);           // imports window.alert
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);             // imports console.log
}

#[wasm_bindgen]
pub fn greet(name: &str) {
    alert(&format!("Hello, {}!", name));
}
\`\`\``,
      tags: ["interop", "imports", "exports"],
    },
    {
      id: "wasm-memory-management",
      title: "Memory management patterns",
      difficulty: "medium",
      question: "How is heap memory managed in a WebAssembly module, and what are common pitfalls when passing data between JS and Wasm?",
      answer: `Wasm linear memory has **no built-in allocator** — the toolchain provides one (wee_alloc, dlmalloc, Rust's global allocator, etc.). JS and Wasm share the same \`ArrayBuffer\`, so discipline is required.

**Common patterns:**

**1. Pass scalars directly (zero-copy):**
\`\`\`js
// i32 / f64 are passed by value — no memory involved
const result = instance.exports.add(3, 4);
\`\`\`

**2. Write a buffer, pass pointer + length:**
\`\`\`js
// Allocate inside Wasm (exposed by the module)
const len = 13;
const ptr = instance.exports.malloc(len);

const view = new Uint8Array(instance.exports.memory.buffer);
const encoded = new TextEncoder().encode("Hello, Wasm!");
view.set(encoded, ptr);

const outPtr = instance.exports.process(ptr, len);
// read result back from outPtr, then free both
instance.exports.free(ptr);
instance.exports.free(outPtr);
\`\`\`

**3. wasm-bindgen handles this automatically:**
\`\`\`js
// Rust: pub fn shout(s: &str) -> String
// JS after wasm-pack:
const result = exports.shout("hello"); // string in, string out — no manual ptr
\`\`\`

**Pitfalls:**

| Pitfall | Effect | Fix |
|---------|--------|-----|
| Reading \`memory.buffer\` after \`memory.grow\` | Detached buffer → RangeError | Re-read \`memory.buffer\` after any grow |
| Not freeing Wasm-allocated memory | Memory leak inside linear memory | Call \`free()\` or use RAII wrappers |
| Passing JS objects directly | Wasm only sees \`i32\` — illegal | Use \`externref\` or serialize to memory |
| Off-by-one in pointer arithmetic | Corruption / reads garbage | Use high-level glue (wasm-bindgen) |`,
      tags: ["memory", "interop", "pitfalls"],
    },
    {
      id: "streaming-compilation",
      title: "Streaming compilation",
      difficulty: "medium",
      question: "What is streaming compilation and why is WebAssembly.instantiateStreaming preferred over WebAssembly.instantiate?",
      answer: `**Streaming compilation** means the browser can **compile Wasm bytecode as bytes arrive over the network**, rather than waiting for the full download.

**Traditional path (two round-trips through JS heap):**
\`\`\`js
const buffer = await fetch("/app.wasm").then(r => r.arrayBuffer());
// ↑ entire file buffered in JS memory first
const { instance } = await WebAssembly.instantiate(buffer, imports);
\`\`\`

**Streaming path (compile while downloading):**
\`\`\`js
const { instance } = await WebAssembly.instantiateStreaming(
  fetch("/app.wasm"), // pass the Response promise directly
  imports
);
\`\`\`

**Why it matters:**

| Metric | \`instantiate\` (buffer) | \`instantiateStreaming\` |
|--------|--------------------------|-------------------------|
| Memory peak | 2× binary size (network + buffer) | ~1× (compile from stream) |
| Time to first execution | download + compile | download ≈ compile (overlapped) |
| Server requirement | Any | \`Content-Type: application/wasm\` |

**Compile once, instantiate many times:**
\`\`\`js
// Compile the module once (e.g., in a Service Worker)
const module = await WebAssembly.compileStreaming(fetch("/lib.wasm"));

// Transfer to a Worker (modules are transferable)
worker.postMessage({ module }, [module]);

// In the Worker:
self.onmessage = async ({ data: { module } }) => {
  const instance = await WebAssembly.instantiate(module, imports);
  // ...
};
\`\`\`

> Always prefer \`instantiateStreaming\`. Fall back to the buffer path only when you cannot set the correct MIME type.`,
      tags: ["performance", "loading"],
    },
    {
      id: "wasi",
      title: "WASI — WebAssembly System Interface",
      difficulty: "medium",
      question: "What is WASI and how does it enable WebAssembly outside the browser?",
      answer: `**WASI (WebAssembly System Interface)** is a standardised API that gives Wasm modules controlled access to operating-system capabilities — filesystem, sockets, clocks, environment variables — without requiring a browser.

**Design principles:**
- **Capability-based security:** A module only gets access to resources explicitly granted by the host. No ambient authority.
- **Portable:** The same \`.wasm\` binary runs on any WASI-compliant runtime (Wasmtime, WasmEdge, wasm-micro-runtime, Node's \`--experimental-wasi-unstable-preview1\`, Deno, Bun).

**WASI Preview 2 (stable since 2024)** is the current target:
- Defined using the **Component Model** and WIT (Wasm Interface Types).
- Key worlds: \`wasi:cli/command\`, \`wasi:http/proxy\`, \`wasi:filesystem\`, \`wasi:sockets\`.

**Hello World in Rust targeting WASI:**
\`\`\`rust
// No special deps needed — std::io works
fn main() {
    println!("Hello from WASI!");
}
\`\`\`
\`\`\`bash
rustup target add wasm32-wasip2
cargo build --target wasm32-wasip2 --release
wasmtime target/wasm32-wasip2/release/hello.wasm
\`\`\`

**Granting capabilities with Wasmtime:**
\`\`\`bash
# Grant read access to a specific directory only
wasmtime --dir /tmp/data my-module.wasm
\`\`\`

**WASI vs bare Wasm:**

| | Bare Wasm (\`wasm32-unknown-unknown\`) | WASI (\`wasm32-wasip2\`) |
|-|--------------------------------------|------------------------|
| Filesystem | No | Yes (granted) |
| Stdout | Import from host | \`wasi:io/streams\` |
| Networking | No | \`wasi:sockets\` (P2) |
| Use case | Browser / embedded | CLI tools, servers, edge |`,
      tags: ["wasi", "server", "runtime"],
    },
    {
      id: "wasm-in-nodejs",
      title: "Wasm in Node.js, Deno, and Bun",
      difficulty: "medium",
      question: "How do you use WebAssembly modules in Node.js, Deno, and Bun server-side runtimes?",
      answer: `All three runtimes expose the standard \`WebAssembly\` global, so the JS API is identical. Differences lie in WASI support, ESM integration, and built-in helpers.

**Node.js (v22+):**
\`\`\`js
// ESM — import .wasm directly (experimental flag needed until Node 24)
// or use the standard API:
import { readFile } from "node:fs/promises";
import { WASI } from "node:wasi";

const wasi = new WASI({ version: "preview1", args: process.argv, env: process.env });
const buffer = await readFile("./module.wasm");
const { instance } = await WebAssembly.instantiate(buffer, wasi.getImportObject());
wasi.start(instance);
\`\`\`

**Deno (v2+):**
\`\`\`js
// Deno supports WASI natively and can import .wasm as ESM modules
import { WASI } from "jsr:@nicolo-ribaudo/wasi@0.1";

// Or use the standard API with fetch():
const { instance } = await WebAssembly.instantiateStreaming(
  fetch(new URL("./module.wasm", import.meta.url)),
  {}
);
\`\`\`

**Bun:**
\`\`\`js
// Bun supports direct .wasm imports as of 1.x
import module from "./module.wasm"; // resolves to a WebAssembly.Module
const instance = await WebAssembly.instantiate(module, {});
\`\`\`

**Comparison table:**

| Feature | Node.js | Deno | Bun |
|---------|---------|------|-----|
| \`WebAssembly\` global | Yes | Yes | Yes |
| WASI support | \`node:wasi\` (Preview 1) | Via jsr / built-in | Partial (Preview 1) |
| \`.wasm\` ESM import | Experimental | Yes | Yes |
| Streaming instantiation | Yes (fetch polyfill) | Yes | Yes |`,
      tags: ["node", "deno", "bun", "server"],
    },
    {
      id: "wasm-tables",
      title: "Wasm tables and indirect calls",
      difficulty: "medium",
      question: "What are WebAssembly tables and how do indirect calls work?",
      answer: `A **Wasm table** is a resizable, typed array of opaque references — most commonly \`funcref\` values (references to functions). Tables are used to implement **indirect calls**, which are the Wasm equivalent of function pointers.

**Why indirect calls?**
- C's function pointers and virtual dispatch (C++ vtables) both lower to \`call_indirect\`.
- Dynamic dispatch without tables would require embedding raw addresses — a security risk.

**WAT example:**
\`\`\`wat
(module
  (type $fn-type (func (param i32) (result i32)))

  (func $double (param i32) (result i32)
    local.get 0
    i32.const 2
    i32.mul)

  (func $triple (param i32) (result i32)
    local.get 0
    i32.const 3
    i32.mul)

  ;; Table with 2 function slots
  (table 2 funcref)
  (elem (i32.const 0) $double $triple)  ;; populate slots 0 and 1

  ;; Call whichever function is at index 'idx'
  (func (export "callByIndex") (param $x i32) (param $idx i32) (result i32)
    local.get $x
    local.get $idx
    call_indirect (type $fn-type))   ;; runtime type check, then dispatch
)
\`\`\`

**JS side:**
\`\`\`js
const { instance } = await WebAssembly.instantiateStreaming(fetch("module.wasm"));
instance.exports.callByIndex(5, 0); // 10 — calls $double
instance.exports.callByIndex(5, 1); // 15 — calls $triple
\`\`\`

**Manipulating tables from JS:**
\`\`\`js
const table = new WebAssembly.Table({ initial: 4, element: "anyfunc" });
// Or access an exported table:
const tbl = instance.exports.table;
console.log(tbl.get(0)); // the $double function as a JS Function
\`\`\`

> \`call_indirect\` performs a **runtime type check** — if the element's signature does not match the expected type, a trap is thrown. This is intentional: it prevents type-confusion exploits.`,
      tags: ["tables", "internals"],
    },
    {
      id: "debugging-wasm",
      title: "Debugging WebAssembly",
      difficulty: "medium",
      question: "What are the main techniques for debugging WebAssembly in the browser and in server runtimes?",
      answer: `**Browser DevTools (Chrome/Firefox/Safari):**

1. **Source maps / DWARF** — Emscripten and Rust (wasm-bindgen in dev mode) emit DWARF debug info inside the \`custom\` section. Chrome DevTools (via the C/C++ DevTools Extension) maps Wasm addresses back to source lines.

2. **WAT disassembly view** — DevTools automatically shows the \`.wat\` form of a loaded \`.wasm\` file. You can set breakpoints on WAT instructions.

3. **Memory inspector** — Chrome's Memory Inspector panel lets you inspect raw linear memory bytes with typed views.

**Build with debug info:**
\`\`\`bash
# Rust
wasm-pack build --dev    # debug symbols, no opt
# Emscripten
emcc -g -O0 src.c -o out.wasm
\`\`\`

**wasm-bindgen console_error_panic_hook:**
\`\`\`rust
// In lib.rs
#[wasm_bindgen(start)]
pub fn start() {
    console_error_panic_hook::set_once();
}
\`\`\`
Panics become readable \`console.error\` messages instead of opaque traps.

**Wasmtime CLI (server):**
\`\`\`bash
wasmtime --trap-on-interrupt --debug-info module.wasm
WASMTIME_LOG=debug wasmtime module.wasm
\`\`\`

**wasm-tools for static analysis:**
\`\`\`bash
wasm-tools validate module.wasm       # validate structure
wasm-tools print module.wasm          # disassemble to WAT
wasm-tools strip -o stripped.wasm module.wasm  # remove debug sections for prod
\`\`\`

**Common trap messages and causes:**

| Trap | Common cause |
|------|-------------|
| \`out of bounds memory access\` | Bad pointer arithmetic or uninitialised allocation |
| \`indirect call type mismatch\` | Function pointer signature mismatch |
| \`integer divide by zero\` | Unchecked division |
| \`unreachable\` | Rust panic / C abort |`,
      tags: ["debugging", "devtools"],
    },
    // ───── HARD ─────
    {
      id: "wasm-threads-shared-memory",
      title: "Wasm threads and shared memory",
      difficulty: "hard",
      question: "How do WebAssembly threads work? Explain SharedArrayBuffer, atomics, and the cross-origin isolation requirement.",
      answer: `**Wasm Threads** is a proposal (shipped in all major browsers) that lets multiple Wasm instances share the same linear memory and synchronise with atomic instructions.

**How it works:**

1. Allocate a \`SharedArrayBuffer\`-backed \`WebAssembly.Memory\`.
2. Transfer the \`WebAssembly.Module\` and the shared \`Memory\` to Web Workers.
3. Each Worker instantiates its own \`Instance\` pointing at the shared memory.
4. Wasm atomic instructions (\`i32.atomic.wait\`, \`i32.atomic.notify\`, \`i32.atomic.rmw.add\`, etc.) coordinate access.

**JS setup:**
\`\`\`js
// main thread
const memory = new WebAssembly.Memory({
  initial: 16,
  maximum: 256,
  shared: true,       // backed by SharedArrayBuffer
});

const module = await WebAssembly.compileStreaming(fetch("threads.wasm"));

for (let i = 0; i < navigator.hardwareConcurrency; i++) {
  const worker = new Worker("worker.js");
  worker.postMessage({ module, memory, threadId: i }, []);
}
\`\`\`

\`\`\`js
// worker.js
self.onmessage = async ({ data: { module, memory, threadId } }) => {
  const instance = await WebAssembly.instantiate(module, {
    env: { memory, thread_id: threadId },
  });
  instance.exports.run();
};
\`\`\`

**Cross-Origin Isolation (COOP/COEP) requirement:**

\`SharedArrayBuffer\` requires the page to be served with:
\`\`\`http
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
\`\`\`
These headers re-enable \`SharedArrayBuffer\` after the Spectre mitigations that disabled it in 2018.

**Wasm atomics (WAT):**
\`\`\`wat
;; Atomic add — fetch-and-add the i32 at memory[ptr]
(i32.atomic.rmw.add (local.get $ptr) (local.get $val))

;; Park thread until notified or timeout (μs)
(memory.atomic.wait32 (local.get $ptr) (local.get $expected) (i64.const -1))

;; Wake up to N waiting threads
(memory.atomic.notify (local.get $ptr) (i32.const 1))
\`\`\`

**pthread emulation:** Emscripten maps pthreads to Web Workers + Wasm threads automatically when built with \`-pthread\`.

> Wasm threads do **not** use the JS event loop — blocking \`memory.atomic.wait32\` is legal inside a Worker but illegal on the main thread (throws \`TypeError\`).`,
      tags: ["threads", "shared-memory", "atomics"],
    },
    {
      id: "component-model-wit",
      title: "Component Model and WIT",
      difficulty: "hard",
      question: "What is the WebAssembly Component Model and WIT (Wasm Interface Types)? How do they improve cross-language interoperability?",
      answer: `**The Component Model** is a W3C Wasm proposal (stable in WASI Preview 2) that lifts Wasm from a *core module* (functions that exchange integers and floats) to a *component* (modules that exchange rich types across language boundaries).

**Problems it solves:**

| Problem | Core Wasm | Component Model |
|---------|-----------|----------------|
| String passing | Manual ptr/len dance | First-class \`string\` type |
| Cross-language calls | Fragile ABI conventions | Canonical ABI — generated by tooling |
| Composition | Hard-coded import names | Typed interfaces defined in WIT |
| Sandboxing | Per-instance memory | Components are capability-isolated |

**WIT (Wasm Interface Types) — IDL for components:**
\`\`\`wit
// greet.wit
package example:greet@0.1.0;

interface greeter {
  greet: func(name: string) -> string;
}

world greet-world {
  export greeter;
}
\`\`\`

**Rust implementation:**
\`\`\`rust
// src/lib.rs
wit_bindgen::generate!({ world: "greet-world" });

struct Greeter;
impl Guest for Greeter {
    fn greet(name: String) -> String {
        format!("Hello, {}!", name)
    }
}
export!(Greeter);
\`\`\`
\`\`\`bash
cargo build --target wasm32-wasip2 --release
wasm-tools component new target/wasm32-wasip2/release/greet.wasm -o greet.component.wasm
\`\`\`

**Composition:** Components declare \`import\`ed interfaces and \`export\`ed interfaces. \`wasm-tools compose\` links them without any shared memory — each component is isolated.

**Host consumption (JavaScript via jco):**
\`\`\`bash
npx jco transpile greet.component.wasm -o dist/
\`\`\`
\`\`\`js
import { greet } from "./dist/greet.js";
console.log(greet("Alice")); // "Hello, Alice!"
\`\`\`

**Canonical ABI:** The Component Model defines precise rules for encoding strings, lists, records, variants, options, and results into core Wasm function calls — making the ABI deterministic and tooling-generated.

> In 2026 the Component Model is production-ready in Wasmtime, WAMR, and via jco in JS. It is the foundation of WASI Preview 2 and the recommended interop story for new multi-language projects.`,
      tags: ["component-model", "wit", "wasi", "interop"],
    },
    {
      id: "wasm-performance-deep",
      title: "WebAssembly performance characteristics",
      difficulty: "hard",
      question: "What are the detailed performance characteristics of WebAssembly — where does it win, where does it lose, and what are the hidden costs?",
      answer: `**Where Wasm wins:**

| Scenario | Why |
|----------|-----|
| Tight numeric loops | No dynamic type checks; SIMD via \`v128\`; predictable register allocation |
| Cold-start decode | Binary format is ~10× faster to parse than equivalent JS source |
| Deterministic latency | No GC pauses in linear-memory modules |
| Porting existing native code | Reuse battle-tested algorithms without rewriting |

**Where Wasm loses or is neutral:**

| Scenario | Why |
|----------|-----|
| DOM manipulation | Must cross the Wasm↔JS boundary per call; JS wins here |
| Small utility functions | JS JIT is already near-optimal; Wasm overhead from glue |
| Startup (large modules) | Streaming helps but large \`.wasm\` still takes time to compile |
| Memory-heavy workloads | No virtual memory tricks; manual allocator overhead |

**Hidden costs:**

1. **JS↔Wasm boundary crossings** — Each call has overhead (argument marshaling, stack switching). Batch operations when possible.

2. **String and GC-type marshaling** — Without WasmGC, strings require encoding/decoding through linear memory on every crossing.

3. **Memory growth traps** — \`memory.grow\` is synchronous and can pause execution. Pre-allocate or grow conservatively.

4. **Code size** — Wasm with a Rust/C runtime can be large. Use \`wasm-opt\`, \`wasm-strip\`, and Brotli compression.

**Measurement approach:**
\`\`\`js
// Use performance.now() around Wasm calls — not console.time (too coarse)
const t0 = performance.now();
const result = instance.exports.heavyCompute(input);
const t1 = performance.now();
console.log("Wasm: " + (t1 - t0) + " ms");

// Chrome DevTools Performance panel shows Wasm frames labelled separately
// Flamegraph shows "wasm-function[N]" — use the name section or DWARF for readable names
\`\`\`

**SIMD example (Rust → Wasm):**
\`\`\`rust
#[cfg(target_arch = "wasm32")]
use std::arch::wasm32::*;

pub unsafe fn dot_product_simd(a: &[f32], b: &[f32]) -> f32 {
    let mut acc = f32x4_splat(0.0);
    for (chunk_a, chunk_b) in a.chunks_exact(4).zip(b.chunks_exact(4)) {
        let va = v128_load(chunk_a.as_ptr() as *const v128);
        let vb = v128_load(chunk_b.as_ptr() as *const v128);
        acc = f32x4_add(acc, f32x4_mul(va, vb));
    }
    f32x4_extract_lane::<0>(acc) + f32x4_extract_lane::<1>(acc)
        + f32x4_extract_lane::<2>(acc) + f32x4_extract_lane::<3>(acc)
}
\`\`\``,
      tags: ["performance", "simd", "optimization"],
    },
    {
      id: "wasm-security",
      title: "WebAssembly security model",
      difficulty: "hard",
      question: "Explain the WebAssembly security model — what does the sandbox guarantee, what are the attack surfaces, and what are the known limitations?",
      answer: `**What the Wasm sandbox guarantees:**

| Guarantee | Mechanism |
|-----------|-----------|
| Memory isolation | Each instance has its own linear memory; no raw pointer to host memory |
| Control-flow integrity | \`call_indirect\` validates type at runtime; no arbitrary jumps |
| No ambient authority | Module can only do what imported functions allow |
| Validation before execution | The runtime validates the binary before running a single instruction |
| Deterministic execution | No undefined behaviour (UB) at the Wasm level |

**Attack surfaces:**

1. **Import functions** — The host exposes JS functions as imports. A malicious module can call them with arbitrary arguments. Always validate arguments inside imported functions.

2. **Linear memory as a shared buffer** — If you pass a \`Memory\` to an untrusted module, that module can write arbitrary bytes into it. Use separate memory instances for untrusted code.

3. **Side-channel attacks** — Wasm runs in the same process as other JS; Spectre/Meltdown exploits can leak memory across boundaries. This is why COOP/COEP are required for \`SharedArrayBuffer\`.

4. **Confused deputy via imports** — A module imported with broad permissions (e.g., filesystem access via WASI) can abuse those permissions. Apply the principle of least privilege at the import boundary.

5. **Supply chain** — \`.wasm\` binaries are opaque; verify checksums and provenance. \`wasm-tools validate\` checks structural correctness but not semantic intent.

**WASI capability model (best practice for server Wasm):**
\`\`\`bash
# Only grant access to /tmp/data, not the whole filesystem
wasmtime --dir /tmp/data::/ plugin.wasm
# Grant specific env vars only
wasmtime --env API_KEY=xyz plugin.wasm
\`\`\`

**Sandbox escape history:**
- 2019 JIT-spray in V8 (fixed via speculative-execution mitigations).
- Theoretical: malformed DWARF in custom sections can crash some tooling (not the Wasm runtime itself).

**Best practices:**
- Never share a \`Memory\` instance between trusted and untrusted modules.
- Run untrusted Wasm in a separate Worker (OS-level process isolation on some platforms).
- Use WASI's capability model; avoid granting broad filesystem/network access.
- Validate all data flowing from a Wasm module as you would any untrusted input.`,
      tags: ["security", "sandbox"],
    },
    {
      id: "wasm-gc",
      title: "WasmGC — garbage collection in WebAssembly",
      difficulty: "hard",
      question: "What is the WasmGC proposal, why does it exist, and how does it change the compilation story for managed languages?",
      answer: `**WasmGC** (Garbage Collection proposal) adds first-class reference types — structs, arrays, and typed function references — to the Wasm type system, backed by the host runtime's GC.

**Why it exists:**

Before WasmGC, managed languages (Kotlin, Dart, Java, OCaml, Haskell…) had to ship their *entire GC runtime* compiled into the \`.wasm\` binary, running inside linear memory. This meant:
- Large binary sizes (Dart hello world: ~800 KB before WasmGC).
- Double GC pressure (host JS GC + embedded Wasm GC).
- Objects invisible to browser DevTools memory profiler.

**What WasmGC provides:**

| Feature | Description |
|---------|-------------|
| \`struct\` | Fixed-field heap object, traced by host GC |
| \`array\` | Variable-length typed array, traced by host GC |
| \`ref\` types | Nullable and non-nullable typed references |
| Subtyping | Struct/array inheritance for OO dispatch |
| Cast / type test | \`ref.cast\`, \`ref.test\` for safe downcasts |

**Kotlin/Wasm example (conceptual lowering):**
\`\`\`kotlin
// Kotlin source
data class Point(val x: Double, val y: Double)
fun distance(p: Point): Double = Math.sqrt(p.x * p.x + p.y * p.y)
\`\`\`

Compiled to WasmGC, \`Point\` becomes a Wasm \`struct\` — allocated on the host GC heap, no linear memory needed.

**Impact on binary size:**
- Dart hello world: ~800 KB (linear-memory GC) → ~160 KB (WasmGC).
- Kotlin multiplatform targets \`wasm32-unknown-wasm-gc\` as of Kotlin 2.0.

**Status (2026):** WasmGC is shipped in V8 (Chrome), SpiderMonkey (Firefox), and JavaScriptCore (Safari). Wasmtime support is in progress. It is stable for production browser targets.

**Interop with JS:**
\`\`\`js
// WasmGC structs are opaque externref-like values in JS
// Access requires exported accessor functions or WIT bindings
const point = instance.exports.newPoint(3.0, 4.0);
const dist  = instance.exports.distance(point); // 5.0
\`\`\`

> WasmGC does **not** replace linear memory for languages like C and Rust that manage their own heap. It is specifically for managed-language runtimes.`,
      tags: ["wasmgc", "gc", "managed-languages"],
    },
    {
      id: "wasm-exception-handling",
      title: "Wasm exception handling",
      difficulty: "hard",
      question: "How does the WebAssembly Exception Handling proposal work, and how does it integrate with JavaScript exceptions?",
      answer: `The **Exception Handling proposal** (shipped in V8/SpiderMonkey/JSC, enabled by default in wasm-bindgen and Emscripten) adds first-class exceptions to Wasm, replacing the older Emscripten setjmp/longjmp emulation.

**Core concepts:**

| Concept | Description |
|---------|-------------|
| \`tag\` | A typed exception tag — declares what values an exception carries |
| \`throw\` | Throws an exception of a given tag |
| \`try...catch...end\` | Structured handler block |
| \`rethrow\` | Re-throws the caught exception |

**WAT example:**
\`\`\`wat
(module
  (type $err-type (func (param i32)))
  (tag $myError (param i32))   ;; tag carrying one i32

  (func (export "mayThrow") (param $x i32)
    block $b
      local.get $x
      i32.const 0
      i32.eq
      br_if $b
      local.get $x
      throw $myError            ;; throw with the i32 payload
    end)

  (func (export "safeDivide") (param $a i32) (param $b i32) (result i32)
    try (result i32)
      local.get $a
      local.get $b
      i32.div_s
    catch_all
      i32.const -1              ;; return sentinel on any exception
    end)
)
\`\`\`

**JS↔Wasm exception interop:**
\`\`\`js
const tag = new WebAssembly.Tag({ parameters: ["i32"] });

const { instance } = await WebAssembly.instantiateStreaming(fetch("exc.wasm"), {
  env: { myTag: tag },
});

try {
  instance.exports.throwSomething();
} catch (e) {
  if (e instanceof WebAssembly.Exception && e.is(tag)) {
    console.log("Wasm threw with value:", e.getArg(tag, 0));
  } else {
    throw e; // re-throw unknown exceptions
  }
}
\`\`\`

**Rust (wasm-bindgen unwinding):**
\`\`\`toml
# Cargo.toml
[profile.release]
panic = "unwind"   # instead of "abort" — requires exception-handling proposal
\`\`\`
\`\`\`bash
RUSTFLAGS="-C target-feature=+exception-handling" wasm-pack build
\`\`\`

**Why this matters for performance:** The old Emscripten setjmp emulation required checking an error flag after every call. Native Wasm exceptions have **zero overhead on the non-throwing path**.`,
      tags: ["exceptions", "error-handling", "interop"],
    },
  ],
};
