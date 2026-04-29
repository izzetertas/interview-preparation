import type { Category } from "./types";

export const csharpAsync: Category = {
  slug: "csharp-async",
  title: "C# Async & Concurrency",
  description:
    "Async/await mechanics, Task-based programming, cancellation, thread-safety primitives, parallel patterns, channels, and async streams in modern .NET 9.",
  icon: "⚡",
  questions: [
    // ───── EASY ─────
    {
      id: "task-vs-thread",
      title: "Task vs Thread",
      difficulty: "easy",
      question: "What is the difference between a Task and a Thread in .NET?",
      answer: `**Thread** is an OS-level execution unit. Creating one allocates ~1 MB of stack and involves a kernel call — expensive to spin up, expensive to context-switch.

**Task** is a higher-level abstraction representing a unit of work, backed by the **ThreadPool** by default. The runtime reuses pooled threads, avoiding repeated allocation costs.

\`\`\`csharp
// Low-level — direct thread creation
var t = new Thread(() => Console.WriteLine("Thread"));
t.Start();

// High-level — uses ThreadPool
Task.Run(() => Console.WriteLine("Task"));
\`\`\`

Key differences:

| | Thread | Task |
|---|---|---|
| Backed by | Dedicated OS thread | ThreadPool (by default) |
| Return value | No (use shared state) | Yes — \`Task<T>\` |
| Cancellation | Manual flag | \`CancellationToken\` |
| Composition | Hard | \`WhenAll\`, \`WhenAny\`, \`await\` |
| Overhead | High | Low (reuse) |

**Rule of thumb:** use \`Task\` (or \`async/await\`) for almost everything. Reach for raw \`Thread\` only when you need a dedicated, long-running thread with specific apartment state or priority.`,
      tags: ["fundamentals", "threading"],
    },
    {
      id: "async-await-basics",
      title: "async/await basics",
      difficulty: "easy",
      question: "How does async/await work in C#? What does the compiler generate?",
      answer: `\`async\` and \`await\` are compiler sugar. The compiler transforms an \`async\` method into a **state machine** that captures local variables and resumes execution after each \`await\` point without blocking the calling thread.

\`\`\`csharp
public async Task<string> FetchAsync(string url)
{
    using var client = new HttpClient();
    string content = await client.GetStringAsync(url); // yields thread here
    return content.ToUpper();                          // resumes here
}
\`\`\`

Flow:
1. Caller calls \`FetchAsync\` — runs synchronously until the first \`await\`.
2. \`await\` checks if the awaitable is already complete. If not, the method **suspends**, returning a \`Task\` to the caller.
3. When the I/O finishes, a ThreadPool thread picks up the continuation and resumes after the \`await\`.

**Nothing is blocked** during the wait — the thread is free to do other work.

The generated state machine implements \`IAsyncStateMachine\` and looks roughly like:

\`\`\`csharp
// Compiler-generated pseudo-code
void MoveNext() {
    switch (_state) {
        case 0: goto State0;
        case 1: goto State1;
    }
    State0:
        _state = 1;
        _awaiter = client.GetStringAsync(url).GetAwaiter();
        if (!_awaiter.IsCompleted) { /* schedule continuation */ return; }
    State1:
        content = _awaiter.GetResult();
        _builder.SetResult(content.ToUpper());
}
\`\`\``,
      tags: ["async", "fundamentals"],
    },
    {
      id: "async-void-pitfalls",
      title: "async void pitfalls",
      difficulty: "easy",
      question: "Why is async void dangerous and when is it acceptable?",
      answer: `\`async void\` methods cannot be awaited, so the caller has no way to observe their completion or any exceptions they throw. An unhandled exception inside an \`async void\` method crashes the process (it surfaces on \`AppDomain.UnhandledException\` / \`TaskScheduler.UnobservedTaskException\`).

\`\`\`csharp
// ❌ Dangerous — exception swallowed / process crash
async void LoadDataBad()
{
    await Task.Delay(100);
    throw new Exception("Boom!"); // caller can't catch this
}

// ✅ Correct — caller can await and catch
async Task LoadDataGoodAsync()
{
    await Task.Delay(100);
    throw new Exception("Boom!"); // propagated via Task
}
\`\`\`

Additional problems:
- Unit tests can't await \`async void\` — the test finishes before the body completes.
- \`await\` inside \`async void\` still captures the \`SynchronizationContext\`, which can cause subtle deadlocks.

**The only acceptable use** is event handlers, where the delegate signature is fixed:

\`\`\`csharp
button.Click += async (s, e) =>
{
    await DoWorkAsync(); // OK here — wrap in try/catch to be safe
};
\`\`\`

Even then, wrap the body in a \`try/catch\` to handle exceptions gracefully.`,
      tags: ["async", "pitfalls"],
    },
    {
      id: "configure-await-false",
      title: "ConfigureAwait(false)",
      difficulty: "easy",
      question: "What does ConfigureAwait(false) do and when should you use it?",
      answer: `By default, \`await\` captures the current \`SynchronizationContext\` (e.g. the UI thread context in WinForms/WPF, or the ASP.NET Classic request context) and **marshals the continuation back to it**. This is convenient for UI code but unnecessary overhead for library code.

\`ConfigureAwait(false)\` tells the awaiter **not** to capture the context — the continuation can run on any ThreadPool thread.

\`\`\`csharp
// Library code — no need for UI context
public async Task<string> GetDataAsync(string url)
{
    using var client = new HttpClient();
    // continuation runs on ThreadPool, not the caller's context
    var result = await client.GetStringAsync(url).ConfigureAwait(false);
    return result;
}
\`\`\`

**When to use it:**
- In **library / infrastructure code** — always. Prevents deadlocks and avoids unnecessary context switching.
- In **UI or controller action code** — omit it (you want to stay on the UI thread / request context).

**The classic deadlock** (see the deadlock question) is often caused by calling \`.Result\` or \`.Wait()\` on a task that needs to resume on the captured context, which is blocked waiting for the result. Using \`ConfigureAwait(false)\` in the awaited path breaks the deadlock.

> In ASP.NET Core there is **no SynchronizationContext**, so \`ConfigureAwait(false)\` is a no-op there — but it's still good practice for portability.`,
      tags: ["async", "synchronization-context"],
    },
    {
      id: "cancellation-token-basics",
      title: "CancellationToken basics",
      difficulty: "easy",
      question: "How do you use CancellationToken to cancel async operations?",
      answer: `\`CancellationToken\` is the standard .NET cancellation mechanism. A \`CancellationTokenSource\` creates and controls the token; you pass the token through the call chain and check/observe it inside async methods.

\`\`\`csharp
using var cts = new CancellationTokenSource();
cts.CancelAfter(TimeSpan.FromSeconds(5)); // auto-cancel after 5 s

try
{
    await DoWorkAsync(cts.Token);
}
catch (OperationCanceledException)
{
    Console.WriteLine("Cancelled");
}

async Task DoWorkAsync(CancellationToken ct)
{
    for (int i = 0; i < 100; i++)
    {
        ct.ThrowIfCancellationRequested(); // cooperative check
        await Task.Delay(100, ct);         // built-in support
    }
}
\`\`\`

Key points:
- Pass \`CancellationToken\` as the **last parameter** by convention.
- Propagate it to every async call you make (I/O, \`Task.Delay\`, etc.).
- \`ct.ThrowIfCancellationRequested()\` throws \`OperationCanceledException\` when cancelled — callers should catch this, not \`Exception\`.
- \`OperationCanceledException\` is **not** an error — it's the normal cancellation signal.`,
      tags: ["cancellation", "async"],
    },
    {
      id: "task-when-all-when-any",
      title: "Task.WhenAll vs Task.WhenAny",
      difficulty: "easy",
      question: "What is the difference between Task.WhenAll and Task.WhenAny?",
      answer: `Both methods take a collection of tasks and return a new \`Task\`, but they differ in when the returned task completes:

**\`Task.WhenAll\`** — completes when **all** input tasks complete. If any task faults, the returned task also faults (aggregating all exceptions).

\`\`\`csharp
var t1 = FetchAsync("https://api.example.com/a");
var t2 = FetchAsync("https://api.example.com/b");

string[] results = await Task.WhenAll(t1, t2); // runs concurrently
Console.WriteLine(results[0]); // result of t1
\`\`\`

**\`Task.WhenAny\`** — completes when **any** input task completes. Returns the completed task (not its result directly).

\`\`\`csharp
var t1 = Task.Delay(1000);
var t2 = Task.Delay(500);

Task first = await Task.WhenAny(t1, t2); // completes after ~500 ms
// The other tasks continue running!
\`\`\`

Common use cases:
- \`WhenAll\`: fan-out / parallel I/O where you need all results.
- \`WhenAny\`: timeouts (\`WhenAny(workTask, Task.Delay(timeout))\`), racing, "first success" patterns.

**Caution:** \`WhenAny\` does **not** cancel the remaining tasks — you must propagate a \`CancellationToken\` yourself.`,
      tags: ["async", "task-composition"],
    },

    // ───── MEDIUM ─────
    {
      id: "deadlock-result-wait",
      title: "Classic .Result/.Wait() deadlock",
      difficulty: "medium",
      question: "Explain the classic deadlock caused by calling .Result or .Wait() on a Task in ASP.NET (non-Core).",
      answer: `This deadlock occurs when blocking synchronously on an async method that needs to resume on the same \`SynchronizationContext\` that is already blocked.

**Steps:**
1. ASP.NET Classic has a one-thread-at-a-time \`SynchronizationContext\` per request.
2. You call \`GetResultAsync().Result\` on the request thread — this **blocks** that thread.
3. Inside \`GetResultAsync\`, after the first \`await\`, the continuation is scheduled to resume on the captured context (the request thread).
4. The request thread is blocked waiting for the task, and the task continuation is waiting for the request thread — **deadlock**.

\`\`\`csharp
// In ASP.NET Classic controller — DEADLOCK
public ActionResult Index()
{
    var result = GetDataAsync().Result; // blocks request thread
    return Content(result);
}

async Task<string> GetDataAsync()
{
    await Task.Delay(100); // captures SynchronizationContext
    return "done";         // tries to resume on request thread — blocked!
}
\`\`\`

**Fixes:**
1. **Go async all the way** (best): \`public async Task<ActionResult> Index()\`
2. **Use \`ConfigureAwait(false)\`** in the async path — continuation no longer needs the context:
\`\`\`csharp
async Task<string> GetDataAsync()
{
    await Task.Delay(100).ConfigureAwait(false);
    return "done"; // resumes on ThreadPool, not captured context
}
\`\`\`
3. **\`Task.Run\`** wrapper (last resort): \`Task.Run(() => GetDataAsync()).Result\` — pushes work off the context.

> In **ASP.NET Core** there is no \`SynchronizationContext\`, so \`.Result\` does not deadlock — but it still blocks a ThreadPool thread and hurts scalability.`,
      tags: ["async", "deadlock", "synchronization-context", "pitfalls"],
    },
    {
      id: "synchronization-context",
      title: "SynchronizationContext explained",
      difficulty: "medium",
      question: "What is SynchronizationContext and how does it interact with async/await?",
      answer: `\`SynchronizationContext\` is an abstraction that controls **how continuations are posted** back after an \`await\`. Different runtimes provide different implementations:

| Environment | Context | Behavior |
|---|---|---|
| WinForms / WPF | \`WindowsFormsSynchronizationContext\` / \`DispatcherSynchronizationContext\` | Marshals back to UI thread |
| ASP.NET Classic | \`AspNetSynchronizationContext\` | One thread at a time per request |
| ASP.NET Core | None (null) | ThreadPool continuation |
| Console / tests | None (null) | ThreadPool continuation |

When you \`await\` a task, the compiler captures \`SynchronizationContext.Current\` before suspending and uses it to schedule the continuation. If current is \`null\`, \`TaskScheduler.Current\` is used instead (usually \`TaskScheduler.Default\` = ThreadPool).

\`\`\`csharp
// WPF — safe to update UI after await because context marshals back
private async void Button_Click(object sender, RoutedEventArgs e)
{
    var data = await FetchAsync();   // suspends, frees UI thread
    label.Content = data;            // runs on UI thread — safe!
}
\`\`\`

\`\`\`csharp
// Library code — avoid context capture
async Task<string> LibraryMethodAsync()
{
    var data = await httpClient
        .GetStringAsync(url)
        .ConfigureAwait(false); // no context capture
    return Process(data);
}
\`\`\`

You can also set a custom context:
\`\`\`csharp
SynchronizationContext.SetSynchronizationContext(myContext);
\`\`\`

This is used by test frameworks (like xUnit) to enforce single-threaded execution.`,
      tags: ["synchronization-context", "async", "threading"],
    },
    {
      id: "value-task-vs-task",
      title: "ValueTask vs Task",
      difficulty: "medium",
      question: "When should you use ValueTask<T> instead of Task<T>?",
      answer: `\`Task<T>\` is a **heap-allocated reference type**. Every async method that returns \`Task<T>\` allocates at least one object. For methods that complete synchronously most of the time (e.g. cache hits, pre-computed results), this allocation is wasteful.

\`ValueTask<T>\` is a **struct** that can wrap a result directly when the operation completes synchronously, avoiding the heap allocation. It falls back to a \`Task<T>\` for the truly async path.

\`\`\`csharp
// Hot path — often returns cached value without I/O
public ValueTask<int> GetCountAsync()
{
    if (_cache.TryGetValue("count", out int v))
        return new ValueTask<int>(v); // zero allocation

    return new ValueTask<int>(FetchCountFromDbAsync()); // async path
}
\`\`\`

**Rules:**
- **Consume a \`ValueTask\` only once.** Unlike \`Task\`, it must not be awaited multiple times or stored for later awaiting.
- **Don't use \`ValueTask\` by default.** Prefer \`Task\` unless profiling shows allocation pressure from a high-frequency synchronous-completion path.
- \`ValueTask\` can also use \`IValueTaskSource\` for pooling, enabling zero-allocation async pipelines (used internally by \`SocketsHttpHandler\`, \`PipeReader\`, etc.).

\`\`\`csharp
// ❌ Wrong — awaiting ValueTask twice
var vt = GetCountAsync();
var a = await vt;
var b = await vt; // undefined behavior!

// ✅ Correct — convert to Task if you need multi-consume
var task = GetCountAsync().AsTask();
\`\`\``,
      tags: ["async", "performance", "value-task"],
    },
    {
      id: "semaphore-slim",
      title: "SemaphoreSlim for async locking",
      difficulty: "medium",
      question: "Why is SemaphoreSlim preferred over lock for async code, and how do you use it?",
      answer: `The \`lock\` statement (backed by \`Monitor\`) is **not async-compatible**. You cannot \`await\` inside a \`lock\` block — the compiler forbids it because the thread that releases the lock must be the same thread that acquired it, which breaks when continuations resume on different threads.

\`SemaphoreSlim\` provides an **async-friendly** wait method: \`WaitAsync()\`, which returns a \`Task\` that completes when the semaphore can be entered, without blocking a thread.

\`\`\`csharp
private readonly SemaphoreSlim _sem = new SemaphoreSlim(1, 1); // mutex

public async Task<string> GetOrFetchAsync(string key)
{
    await _sem.WaitAsync();
    try
    {
        if (_cache.TryGetValue(key, out var cached))
            return cached;

        var value = await FetchFromDbAsync(key); // safe to await inside
        _cache[key] = value;
        return value;
    }
    finally
    {
        _sem.Release(); // always release
    }
}
\`\`\`

You can also pass an initial count > 1 to allow N concurrent callers (a rate-limiter pattern):

\`\`\`csharp
// Allow up to 10 concurrent HTTP requests
var throttle = new SemaphoreSlim(10, 10);

await throttle.WaitAsync(cancellationToken);
try   { await httpClient.GetAsync(url, cancellationToken); }
finally { throttle.Release(); }
\`\`\`

\`SemaphoreSlim\` also supports cancellation and timeouts via overloads of \`WaitAsync\`.`,
      tags: ["concurrency", "locking", "async"],
    },
    {
      id: "cancellation-linking",
      title: "CancellationToken linking",
      difficulty: "medium",
      question: "How do you combine multiple CancellationTokens?",
      answer: `\`CancellationTokenSource.CreateLinkedTokenSource\` creates a new \`CancellationTokenSource\` that is cancelled when **any** of the provided tokens is cancelled. This lets you compose timeouts, user requests, and service shutdown signals.

\`\`\`csharp
async Task ProcessRequestAsync(
    CancellationToken requestToken,       // HTTP request aborted
    CancellationToken shutdownToken)      // app shutting down
{
    // Cancel if either fires, or after 10 seconds
    using var timeoutCts = new CancellationTokenSource(TimeSpan.FromSeconds(10));
    using var linkedCts  = CancellationTokenSource.CreateLinkedTokenSource(
        requestToken, shutdownToken, timeoutCts.Token);

    CancellationToken ct = linkedCts.Token;

    await DoWorkAsync(ct);
}
\`\`\`

**Disposal is important:** the linked \`CancellationTokenSource\` registers callbacks on each source token. Failing to dispose it leaks those registrations until the parent tokens are cancelled.

Pattern for propagating cancellation in ASP.NET Core:

\`\`\`csharp
// Controller receives HttpContext.RequestAborted automatically
[HttpGet]
public async Task<IActionResult> GetAsync(CancellationToken ct)
{
    // ct is already linked to request abort
    var data = await _service.GetDataAsync(ct);
    return Ok(data);
}
\`\`\``,
      tags: ["cancellation", "async"],
    },
    {
      id: "concurrent-collections",
      title: "ConcurrentDictionary and ConcurrentQueue",
      difficulty: "medium",
      question: "How do ConcurrentDictionary and ConcurrentQueue work and when should you use them?",
      answer: `Both live in \`System.Collections.Concurrent\` and are designed for **lock-free or fine-grained-lock** multi-threaded access.

**ConcurrentDictionary<TKey,TValue>**

Uses striped locking (multiple internal locks) so reads are mostly lock-free and writes only lock a stripe.

\`\`\`csharp
var dict = new ConcurrentDictionary<string, int>();

// Atomic get-or-add
int count = dict.GetOrAdd("key", _ => ExpensiveCompute());

// Atomic update
dict.AddOrUpdate(
    "key",
    addValue: 1,
    updateValueFactory: (k, old) => old + 1);

// Beware: the factory may be called multiple times; it must be idempotent
\`\`\`

**ConcurrentQueue<T>**

Lock-free FIFO queue; \`Enqueue\` and \`TryDequeue\` are safe from any thread.

\`\`\`csharp
var queue = new ConcurrentQueue<WorkItem>();

// Producer
queue.Enqueue(new WorkItem(payload));

// Consumer
if (queue.TryDequeue(out var item))
    Process(item);
\`\`\`

**When to use:**
- \`ConcurrentDictionary\`: shared caches, counters, per-key state accessed from multiple threads.
- \`ConcurrentQueue\`: work queues, log buffers, producer-consumer pipelines (though \`System.Threading.Channels\` is preferred for back-pressure and async consumption).

**Avoid** regular \`Dictionary\`/\`Queue\` with manual \`lock\` — it's easy to get wrong and slower under contention.`,
      tags: ["concurrency", "collections"],
    },
    {
      id: "interlocked-operations",
      title: "Interlocked operations",
      difficulty: "medium",
      question: "What are Interlocked operations and when should you use them?",
      answer: `The \`Interlocked\` class provides **atomic read-modify-write** operations that are safe across threads without using a \`lock\`. They map to CPU atomic instructions (\`LOCK XADD\`, \`CMPXCHG\`, etc.).

\`\`\`csharp
private int _counter = 0;

// Thread-safe increment — no lock needed
Interlocked.Increment(ref _counter);
Interlocked.Decrement(ref _counter);
Interlocked.Add(ref _counter, 5);

// Atomic compare-and-swap (CAS)
int original = Interlocked.CompareExchange(ref _counter, newValue: 10, comparand: 0);
// Sets _counter to 10 only if it was 0; returns the original value either way

// Atomic exchange
int old = Interlocked.Exchange(ref _counter, 42);

// Works with long, float, double, object references too
private long _bytesProcessed;
Interlocked.Add(ref _bytesProcessed, chunk.Length);
\`\`\`

**When to use:**
- Simple counters, flags, or single-field updates where you'd otherwise lock just for one operation.
- Building lock-free data structures (advanced).

**When NOT to use:**
- When you need to atomically update **multiple related fields** — use \`lock\` or other synchronization.
- \`Interlocked\` guarantees atomicity but not ordering relative to other memory operations — combine with \`volatile\` or \`Volatile.Read/Write\` if needed.`,
      tags: ["concurrency", "threading", "lock-free"],
    },
    {
      id: "parallel-for-foreach",
      title: "Parallel.For and Parallel.ForEach",
      difficulty: "medium",
      question: "How do Parallel.For and Parallel.ForEach work, and what are their pitfalls?",
      answer: `\`Parallel.For\` and \`Parallel.ForEach\` (from \`System.Threading.Tasks\`) partition work and execute iterations on **ThreadPool threads** concurrently. They block until all iterations complete.

\`\`\`csharp
// CPU-bound work — image processing
Parallel.For(0, images.Length, i =>
{
    images[i] = Resize(images[i]); // runs on multiple threads
});

// With options — limit concurrency
var options = new ParallelOptions
{
    MaxDegreeOfParallelism = Environment.ProcessorCount,
    CancellationToken = ct
};
Parallel.ForEach(files, options, file =>
{
    Process(file);
});
\`\`\`

**Aggregating results safely:**

\`\`\`csharp
long total = 0;
Parallel.ForEach(
    source: items,
    localInit: () => 0L,                       // per-thread accumulator
    body: (item, _, localSum) => localSum + item.Value,
    localFinally: localSum => Interlocked.Add(ref total, localSum)
);
\`\`\`

**Pitfalls:**
- **Shared mutable state** — requires locking or \`Interlocked\`; easy to introduce data races.
- **Not for async work** — don't use \`Parallel.ForEach\` with \`async\` lambdas; use \`Task.WhenAll\` instead.
- **Overhead** — for fast, cheap iterations, the partitioning overhead exceeds the gain. Benchmark first.
- **Exception handling** — exceptions are wrapped in \`AggregateException\`.`,
      tags: ["parallelism", "threading"],
    },
    {
      id: "plinq",
      title: "PLINQ",
      difficulty: "medium",
      question: "What is PLINQ and when should you use it?",
      answer: `**PLINQ (Parallel LINQ)** parallelizes LINQ queries across multiple threads using the ThreadPool. You opt in by adding \`.AsParallel()\` to any \`IEnumerable\`.

\`\`\`csharp
// Sequential
var results = data
    .Where(x => x.IsValid)
    .Select(x => HeavyTransform(x))
    .ToList();

// Parallel — same query, just add AsParallel()
var results = data
    .AsParallel()
    .WithDegreeOfParallelism(4)
    .WithCancellation(ct)
    .Where(x => x.IsValid)
    .Select(x => HeavyTransform(x))
    .ToList();
\`\`\`

**Preserving order** (at a performance cost):

\`\`\`csharp
var ordered = data
    .AsParallel()
    .AsOrdered()
    .Select(Transform)
    .ToList();
\`\`\`

**When PLINQ helps:**
- CPU-bound operations with high per-element cost.
- Large collections where parallelism pays back partitioning overhead.

**When it hurts:**
- I/O-bound work — use async/await instead (PLINQ blocks threads).
- Small collections or cheap operations — overhead dominates.
- Order-sensitive operations without \`AsOrdered\` — output order is non-deterministic.
- Side effects — PLINQ assumes pure transforms; shared state requires synchronization.`,
      tags: ["parallelism", "linq"],
    },
    {
      id: "lock-and-monitor",
      title: "lock statement and Monitor",
      difficulty: "medium",
      question: "How does the lock statement work under the hood, and what are Monitor's extra capabilities?",
      answer: `The \`lock\` statement is syntactic sugar over \`Monitor.Enter\` / \`Monitor.Exit\`, guaranteed by a \`try/finally\` so the lock is always released even if an exception occurs.

\`\`\`csharp
lock (obj)
{
    // critical section
}

// Compiles to approximately:
bool taken = false;
try
{
    Monitor.Enter(obj, ref taken);
    // critical section
}
finally
{
    if (taken) Monitor.Exit(obj);
}
\`\`\`

**Monitor extras:**

\`\`\`csharp
// Timed try-enter — non-blocking
if (Monitor.TryEnter(obj, TimeSpan.FromMilliseconds(100)))
{
    try { /* critical section */ }
    finally { Monitor.Exit(obj); }
}

// Wait / Pulse — condition variable pattern
lock (queue)
{
    while (queue.Count == 0)
        Monitor.Wait(queue);   // releases lock and waits for Pulse

    var item = queue.Dequeue();
}

// Producer
lock (queue)
{
    queue.Enqueue(item);
    Monitor.Pulse(queue);      // wakes one waiter
}
\`\`\`

**Best practices:**
- Always lock on a **private, readonly object** — never on \`this\`, \`typeof(T)\`, or strings (shared interned references can cause cross-component deadlocks).
- Keep critical sections **short**.
- Prefer \`SemaphoreSlim.WaitAsync\` over \`lock\` when you need to await inside the critical section.`,
      tags: ["concurrency", "locking"],
    },

    // ───── HARD ─────
    {
      id: "channels-producer-consumer",
      title: "System.Threading.Channels — producer/consumer",
      difficulty: "hard",
      question: "How do you implement a producer/consumer pipeline using System.Threading.Channels?",
      answer: `\`System.Threading.Channels\` (available since .NET Core 3.0, refined in .NET 9) provides a high-performance, async-native bounded or unbounded channel for producer-consumer scenarios with built-in back-pressure.

\`\`\`csharp
using System.Threading.Channels;

// Bounded channel — back-pressure when full
var channel = Channel.CreateBounded<WorkItem>(new BoundedChannelOptions(100)
{
    FullMode = BoundedChannelFullMode.Wait, // producer awaits when full
    SingleWriter = false,
    SingleReader = false
});

// Producer
async Task ProduceAsync(ChannelWriter<WorkItem> writer, CancellationToken ct)
{
    try
    {
        await foreach (var item in GetItemsAsync(ct))
        {
            await writer.WriteAsync(item, ct); // async back-pressure
        }
    }
    finally
    {
        writer.Complete(); // signals no more items
    }
}

// Consumer
async Task ConsumeAsync(ChannelReader<WorkItem> reader, CancellationToken ct)
{
    await foreach (var item in reader.ReadAllAsync(ct))
    {
        await ProcessAsync(item, ct);
    }
}

// Wiring
var writer = channel.Writer;
var reader = channel.Reader;

var producer = ProduceAsync(writer, cts.Token);
var consumer = ConsumeAsync(reader, cts.Token);

await Task.WhenAll(producer, consumer);
\`\`\`

**Multiple consumers** (fan-out):
\`\`\`csharp
var consumers = Enumerable.Range(0, 4)
    .Select(_ => ConsumeAsync(reader, cts.Token));
await Task.WhenAll(consumers);
\`\`\`

**Why prefer Channels over ConcurrentQueue?**
- Channels have built-in async wait — no polling/spinning.
- Back-pressure with \`BoundedChannel\`.
- Clean completion signal via \`Writer.Complete()\`.`,
      tags: ["channels", "concurrency", "producer-consumer"],
    },
    {
      id: "iasync-enumerable",
      title: "IAsyncEnumerable and async streams",
      difficulty: "hard",
      question: "What are IAsyncEnumerable<T> and async streams, and how do you implement and consume them?",
      answer: `\`IAsyncEnumerable<T>\` (C# 8, .NET Core 3.0+) allows you to produce and consume sequences asynchronously using \`yield return\` inside an \`async\` method — **each element is awaited individually**, perfect for streaming data from I/O.

**Producing an async stream:**

\`\`\`csharp
async IAsyncEnumerable<Order> GetOrdersAsync(
    int customerId,
    [EnumeratorCancellation] CancellationToken ct = default)
{
    int page = 0;
    while (true)
    {
        var batch = await _db.Orders
            .Where(o => o.CustomerId == customerId)
            .Skip(page * 100).Take(100)
            .ToListAsync(ct);

        if (batch.Count == 0) yield break;

        foreach (var order in batch)
            yield return order;        // emit one at a time

        page++;
    }
}
\`\`\`

**Consuming:**

\`\`\`csharp
await foreach (var order in GetOrdersAsync(42, ct))
{
    await ProcessOrderAsync(order, ct);
}
\`\`\`

**With LINQ (.NET 9 + \`System.Linq.Async\` or built-in):**

\`\`\`csharp
var total = await GetOrdersAsync(42)
    .Where(o => o.Total > 100)
    .SumAsync(o => o.Total);
\`\`\`

**Key differences from \`IEnumerable<T>\`:**
- Each \`MoveNextAsync\` call is awaitable — no thread blocked between items.
- Supports cancellation via \`[EnumeratorCancellation]\` and \`WithCancellation(ct)\`.
- No buffering — memory usage is bounded regardless of total sequence size.

**vs Channels:** channels are for cross-thread communication; async streams are for sequential pull-based iteration within a single logical flow.`,
      tags: ["async-streams", "async", "enumerable"],
    },
    {
      id: "threadpool-internals",
      title: "ThreadPool internals",
      difficulty: "hard",
      question: "How does the .NET ThreadPool manage threads, and how do its heuristics affect async throughput?",
      answer: `The .NET ThreadPool is the backbone of \`Task.Run\`, \`async\` continuations, and \`Parallel\` APIs. Understanding it helps diagnose throughput and latency issues.

**Architecture (as of .NET 9):**
- **Worker threads** execute queued work items (\`ThreadPool.QueueUserWorkItem\`, \`Task.Run\`).
- **Completion port threads** (Windows) handle I/O callbacks.
- Each worker has a **local work-stealing queue** (deque). A thread pops from its own queue; idle threads steal from others — reduces contention.

**Injection heuristic (hill-climbing):**
The ThreadPool starts with \`Environment.ProcessorCount\` threads. If throughput stagnates (tasks queuing up but existing threads are blocked), it **injects** a new thread roughly **every 500 ms** (the hill-climbing interval). This is catastrophically slow if you block many threads simultaneously.

\`\`\`csharp
// ❌ Blocking on async — starves ThreadPool, triggers slow injection
Parallel.For(0, 500, _ =>
{
    Task.Delay(2000).Wait(); // blocks 500 threads
});

// ✅ Async — returns threads while waiting, no starvation
await Task.WhenAll(Enumerable.Range(0, 500)
    .Select(_ => Task.Delay(2000)));
\`\`\`

**Configuration:**

\`\`\`csharp
// Set minimum threads (avoids injection delay at startup)
ThreadPool.SetMinThreads(workerThreads: 100, completionPortThreads: 100);

// Check current state
ThreadPool.GetAvailableThreads(out int workers, out int io);
\`\`\`

**Practical guidance:**
- Never block ThreadPool threads with synchronous I/O or \`.Result\`/\`.Wait()\`.
- Long-running CPU work should use \`Task.Factory.StartNew(..., TaskCreationOptions.LongRunning)\`, which creates a dedicated thread outside the pool.
- Use \`ThreadPool.SetMinThreads\` to warm up threads for burst workloads (ASP.NET Core servers).`,
      tags: ["threading", "threadpool", "performance"],
    },
    {
      id: "lazy-double-checked-locking",
      title: "Thread-safe lazy initialization: Lazy<T> and double-checked locking",
      difficulty: "hard",
      question: "How do you implement thread-safe lazy initialization in C#? Compare Lazy<T> with double-checked locking.",
      answer: `**Double-checked locking** is a classic pattern to initialize a singleton lazily without locking on every access. Naive implementations are broken on pre-.NET memory models; the correct version uses \`volatile\`:

\`\`\`csharp
private static volatile Singleton _instance;
private static readonly object _lock = new object();

public static Singleton Instance
{
    get
    {
        if (_instance is null)              // first check (no lock)
        {
            lock (_lock)
            {
                if (_instance is null)      // second check (inside lock)
                    _instance = new Singleton();
            }
        }
        return _instance;
    }
}
\`\`\`

The \`volatile\` keyword prevents the compiler/CPU from reordering the write to \`_instance\` before the constructor completes.

**\`Lazy<T>\` — the idiomatic alternative:**

\`\`\`csharp
private static readonly Lazy<Singleton> _lazy =
    new Lazy<Singleton>(() => new Singleton(), LazyThreadSafetyMode.ExecutionAndPublication);

public static Singleton Instance => _lazy.Value;
\`\`\`

\`LazyThreadSafetyMode.ExecutionAndPublication\` (the default) ensures the factory runs exactly once; all other threads block until it completes.

| | Double-checked locking | \`Lazy<T>\` |
|---|---|---|
| Correctness | Requires \`volatile\` — easy to get wrong | Correct by default |
| Readability | Verbose | Concise |
| Exception caching | Manual | Configurable (\`PublicationOnly\` retries) |
| Async support | None | Use \`AsyncLazy<T>\` (community) |

**For async lazy initialization**, a common pattern:

\`\`\`csharp
private readonly Lazy<Task<Connection>> _connection =
    new Lazy<Task<Connection>>(() => ConnectAsync(), LazyThreadSafetyMode.ExecutionAndPublication);

public Task<Connection> GetConnectionAsync() => _connection.Value;
\`\`\`

The \`Task\` is created once and awaited many times — safe because awaiting a completed \`Task\` is always safe.`,
      tags: ["concurrency", "patterns", "lazy-initialization"],
    },
    {
      id: "async-aspnetcore-scalability",
      title: "async in ASP.NET Core — scalability impact",
      difficulty: "hard",
      question: "Why does using async/await throughout an ASP.NET Core application dramatically improve scalability?",
      answer: `ASP.NET Core handles each request with a **ThreadPool thread**. The ThreadPool has a finite number of threads — typically proportional to CPU count. Under high load, if requests block threads synchronously, the pool exhausts and new requests queue up, increasing latency and reducing throughput.

**Synchronous (blocking) handler:**

\`\`\`csharp
[HttpGet("data")]
public IActionResult GetData()
{
    // Thread is blocked for the entire I/O duration
    var data = _db.FetchData(); // synchronous DB call blocks thread ~10 ms
    return Ok(data);
}
// At 1000 concurrent requests × 10 ms = 1000 threads blocked
// ThreadPool injection: ~2 new threads/sec → minutes to scale up
\`\`\`

**Asynchronous handler:**

\`\`\`csharp
[HttpGet("data")]
public async Task<IActionResult> GetDataAsync(CancellationToken ct)
{
    var data = await _db.FetchDataAsync(ct); // thread freed during I/O
    return Ok(data);
}
// At 1000 concurrent requests: ~10 ms × 1000 = 10 thread-seconds of I/O
// But threads are returned during I/O — only CPU time consumes threads
// Throughput: limited by CPU, not thread count
\`\`\`

**The math:** With truly async I/O and 100 ms average latency, a single thread can handle ~10 requests per second "in flight" (returning between awaits). With 16 threads: 160 RPS without starvation.

**ASP.NET Core specifics:**
- No \`SynchronizationContext\` — no context-capture overhead, no deadlock from \`.Result\`.
- \`HttpContext.RequestAborted\` provides a \`CancellationToken\` wired to client disconnect — always propagate it.
- EF Core, \`HttpClient\`, and most .NET 9 libraries are fully async-capable.

**Practical checklist for scalable async ASP.NET Core:**
- \`async Task<IActionResult>\` on all controllers.
- \`await\` all DB, HTTP, and cache calls.
- Propagate \`CancellationToken\` from the action method parameter.
- Never call \`.Result\` or \`.Wait()\` in request handlers.
- Use \`IAsyncEnumerable\` / \`await foreach\` for streaming responses.`,
      tags: ["async", "aspnetcore", "scalability", "performance"],
    },
    {
      id: "cancellation-propagation-patterns",
      title: "Cancellation propagation patterns",
      difficulty: "hard",
      question: "Describe advanced cancellation propagation patterns: cooperative cancellation, registration callbacks, and graceful shutdown.",
      answer: `Cancellation in .NET is **cooperative** — the cancellation source signals intent, but each piece of code must observe the token and act on it. There is no forceful thread abort (deprecated in .NET Core).

**1. ThrowIfCancellationRequested vs IsCancellationRequested**

\`\`\`csharp
// Throws OperationCanceledException — clean exit via exception
ct.ThrowIfCancellationRequested();

// Poll without throwing — for cleanup loops
while (!ct.IsCancellationRequested)
{
    DoChunk();
}
\`\`\`

**2. Register a callback for non-Task code:**

\`\`\`csharp
using var reg = ct.Register(() =>
{
    // Called synchronously on the cancelling thread (or via SyncContext)
    socket.Close(); // unblock a blocking socket call
});
await socket.ReceiveAsync(buffer, ct);
\`\`\`

**3. Graceful shutdown in a hosted service:**

\`\`\`csharp
public class WorkerService : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await foreach (var msg in _channel.Reader.ReadAllAsync(stoppingToken))
        {
            try
            {
                await HandleAsync(msg, stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                // Graceful shutdown — stop processing
                break;
            }
        }

        // Drain remaining work before exit
        await _channel.Reader.Completion;
    }
}
\`\`\`

**4. Timeout + external cancel + shutdown:**

\`\`\`csharp
async Task ProcessWithTimeoutAsync(CancellationToken appShutdown)
{
    using var perOpTimeout = new CancellationTokenSource(TimeSpan.FromSeconds(30));
    using var linked = CancellationTokenSource.CreateLinkedTokenSource(
        appShutdown, perOpTimeout.Token);

    try
    {
        await DoWorkAsync(linked.Token);
    }
    catch (OperationCanceledException ex)
    {
        if (perOpTimeout.Token.IsCancellationRequested)
            Log.Warning("Operation timed out");
        else
            Log.Information("Shutdown requested");
        throw;
    }
}
\`\`\`

**Key rules:**
- Always propagate \`ct\` to every awaitable — never ignore it.
- Distinguish timeout vs user-cancel vs shutdown by checking which token cancelled.
- \`OperationCanceledException.CancellationToken\` tells you which token fired.
- Dispose linked \`CancellationTokenSource\` instances to avoid callback leaks.`,
      tags: ["cancellation", "async", "patterns"],
    },
  ],
};
