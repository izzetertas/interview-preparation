import type { Category } from "./types";

export const javaConcurrency: Category = {
  slug: "java-concurrency",
  title: "Java Concurrency",
  description:
    "Threads, synchronization, java.util.concurrent, CompletableFuture, reactive programming, and virtual threads",
  icon: "⚡",
  questions: [
    // ───── EASY ─────
    {
      id: "java-thread-lifecycle",
      title: "Thread lifecycle",
      difficulty: "easy",
      question: "What are the states in a Java thread's lifecycle?",
      answer: `A Java thread moves through six states defined in 'Thread.State':

**NEW** — Thread object created but 'start()' not yet called.
**RUNNABLE** — Running on CPU or ready to run, waiting for CPU time. Includes what the OS calls 'running' and 'ready'.
**BLOCKED** — Waiting to acquire an intrinsic (synchronized) monitor lock held by another thread.
**WAITING** — Indefinitely waiting for another thread's signal; entered via 'Object.wait()', 'Thread.join()', or 'LockSupport.park()'.
**TIMED_WAITING** — Waiting with a timeout; entered via 'Thread.sleep(ms)', 'Object.wait(ms)', 'Thread.join(ms)', or 'LockSupport.parkNanos()'.
**TERMINATED** — 'run()' has completed (normally or via exception).

Key transitions:
- 'start()' moves NEW → RUNNABLE
- A thread that was BLOCKED acquires the lock → RUNNABLE
- 'Object.notify()' moves WAITING → BLOCKED (must re-acquire the lock)
- TERMINATED is final — a terminated thread cannot be restarted

You can inspect the state of any thread at runtime: 'thread.getState()'.`,
      tags: ["threads", "lifecycle", "fundamentals"],
    },
    {
      id: "runnable-vs-callable",
      title: "Runnable vs Callable",
      difficulty: "easy",
      question: "What is the difference between Runnable and Callable?",
      answer: `Both 'Runnable' and 'Callable' represent tasks to be executed, but they differ in return type and exception handling:

| Feature | Runnable | Callable<V> |
|---|---|---|
| Return type | void | V (generic) |
| Checked exceptions | Cannot throw | Can throw any checked exception |
| Functional interface | Yes | Yes |
| Use with ExecutorService | 'submit(Runnable)' returns 'Future<?' | 'submit(Callable<V>)' returns 'Future<V>' |

**Runnable example:**
'Runnable r = () -> System.out.println("hello from thread");'

**Callable example:**
'Callable<Integer> c = () -> { return 42; };'

When you submit a 'Runnable' to an 'ExecutorService', the returned 'Future<?>' holds 'null' on success. When a 'Callable' throws, the exception is wrapped and re-thrown when you call 'future.get()' as an 'ExecutionException'.

Prefer 'Callable' whenever you need a result or must propagate checked exceptions from the task.`,
      tags: ["runnable", "callable", "fundamentals"],
    },
    {
      id: "synchronized-keyword",
      title: "synchronized keyword",
      difficulty: "easy",
      question: "How does the synchronized keyword work in Java?",
      answer: `'synchronized' provides mutual exclusion and memory visibility using the object's **intrinsic (monitor) lock**.

**Synchronized method — locks 'this' (or the Class object for static methods):**
'public synchronized void increment() { count++; }'

**Synchronized block — locks on an explicit object (preferred for finer granularity):**
'synchronized (lock) { count++; }'

**What it guarantees:**
1. **Mutual exclusion** — only one thread can hold the monitor at a time. Others block (enter BLOCKED state) until the lock is released.
2. **Memory visibility** — on entry, the thread reads fresh values from main memory; on exit, all writes are flushed to main memory. This establishes a **happens-before** relationship.

**Reentrancy** — a thread that already holds a lock can re-enter the same synchronized block without deadlocking. The JVM tracks a hold count.

**Limitations compared to 'ReentrantLock':**
- Cannot try to acquire with a timeout
- Cannot interrupt a thread waiting for the lock
- Cannot have separate condition queues per object`,
      tags: ["synchronized", "monitor", "fundamentals"],
    },
    {
      id: "volatile-keyword",
      title: "volatile keyword",
      difficulty: "easy",
      question: "What does volatile do and when is it sufficient?",
      answer: `The 'volatile' keyword gives a variable two guarantees:

1. **Visibility** — every read of a volatile variable sees the most recent write by any thread (no caching in CPU registers or L1/L2).
2. **Atomicity of reads and writes** — reads and writes of 'volatile long' and 'volatile double' are atomic (without 'volatile', 64-bit writes on 32-bit JVMs can be torn).

'volatile' does **not** provide atomicity for compound operations like 'i++' (which is read-modify-write).

**When volatile is sufficient:**
- A single writer thread sets a flag that multiple readers poll: 'volatile boolean stop = false;'
- Publishing an immutable object reference to other threads
- Implementing a simple state flag or configuration reload trigger

**When volatile is NOT sufficient:**
- Counter increments — use 'AtomicInteger' or 'synchronized'
- Check-then-act — use 'synchronized' or 'AtomicReference.compareAndSet'

**Happens-before rule:** a write to a volatile variable happens-before every subsequent read of that same variable by any thread.`,
      tags: ["volatile", "visibility", "memory-model"],
    },
    {
      id: "happens-before",
      title: "Happens-before relationship",
      difficulty: "easy",
      question: "What is the happens-before relationship in the Java Memory Model?",
      answer: `The **Java Memory Model (JMM)** uses the happens-before (HB) relation to define when one action's result is guaranteed to be visible to another.

**If action A happens-before action B, then:**
- All writes performed by A (and transitively by actions that happened-before A) are visible to B.

**Built-in happens-before edges:**
| Rule | Description |
|---|---|
| **Monitor lock** | Unlock of a monitor HB every subsequent lock of the same monitor |
| **volatile write** | Write to volatile field HB every subsequent read of that field |
| **Thread start** | 'Thread.start()' HB all actions in the started thread |
| **Thread join** | All actions in a thread HB the return from 'Thread.join()' on that thread |
| **Program order** | Each action in a thread HB the next action in that thread |
| **Transitivity** | If A HB B and B HB C, then A HB C |

**Why it matters:** the CPU and JIT compiler are allowed to reorder instructions as long as HB is not violated. Without proper synchronisation, reordering can make writes invisible to other threads — even if they appear in the "right" order in source code.`,
      tags: ["memory-model", "happens-before", "jmm"],
    },
    {
      id: "threadlocal",
      title: "ThreadLocal",
      difficulty: "easy",
      question: "What is ThreadLocal and when should you use it?",
      answer: `'ThreadLocal<T>' provides a variable where each thread has its own independent copy. Reads and writes to the variable are confined to the current thread — no synchronisation needed.

**Basic usage:**
'static final ThreadLocal<SimpleDateFormat> formatter =
    ThreadLocal.withInitial(() -> new SimpleDateFormat("yyyy-MM-dd"));'

Every thread calling 'formatter.get()' receives its own 'SimpleDateFormat' instance, making an otherwise non-thread-safe class safe to use concurrently.

**Common use cases:**
- Per-thread database connections or JDBC connections
- Per-thread 'SimpleDateFormat' or 'Random' instances
- Storing request context in web frameworks (e.g., Spring's 'RequestContextHolder')
- Passing implicit context (user ID, transaction ID) through a call stack without parameters

**Memory leak warning:** in thread pools, threads are reused. If you do not call 'threadLocal.remove()' at the end of a task, the value stays attached to the thread indefinitely. Always remove in a 'try-finally' block:
'try { threadLocal.set(value); doWork(); } finally { threadLocal.remove(); }'

**Java 21 — ScopedValue:** for virtual threads and structured concurrency, prefer 'ScopedValue' (JEP 446, preview) over 'ThreadLocal'. It is immutable within a scope, safer, and more efficient for short-lived tasks.`,
      tags: ["threadlocal", "thread-safety", "fundamentals"],
    },

    // ───── MEDIUM ─────
    {
      id: "executorservice",
      title: "ExecutorService and ThreadPoolExecutor",
      difficulty: "medium",
      question:
        "How do you create and tune a thread pool with ExecutorService and ThreadPoolExecutor?",
      answer: `'ExecutorService' decouples task submission from thread management. 'Executors' factory methods cover common cases; 'ThreadPoolExecutor' gives full control.

**Factory shortcuts:**
- 'Executors.newFixedThreadPool(n)' — fixed-size pool, unbounded queue
- 'Executors.newCachedThreadPool()' — grows as needed, idle threads expire after 60 s
- 'Executors.newSingleThreadExecutor()' — serialises tasks
- 'Executors.newScheduledThreadPool(n)' — supports delayed/periodic tasks

**Direct ThreadPoolExecutor construction:**
'new ThreadPoolExecutor(
    corePoolSize,      // threads always kept alive
    maximumPoolSize,   // max threads (used when queue full)
    keepAliveTime, TimeUnit.SECONDS,
    new ArrayBlockingQueue<>(capacity),   // bounded queue
    new ThreadPoolExecutor.CallerRunsPolicy() // saturation policy
);'

**Saturation policies when queue is full:**
| Policy | Behaviour |
|---|---|
| AbortPolicy (default) | Throws RejectedExecutionException |
| CallerRunsPolicy | Caller thread runs the task (natural back-pressure) |
| DiscardPolicy | Silently drops the task |
| DiscardOldestPolicy | Drops the oldest queued task, retries submit |

**Tuning rules of thumb:**
- CPU-bound: 'corePoolSize = Runtime.getRuntime().availableProcessors()'
- I/O-bound: larger pools are fine — threads spend most time waiting
- Always use a **bounded** queue in production to avoid OOM

**Graceful shutdown:**
'executor.shutdown();                  // no new tasks accepted'
'executor.awaitTermination(30, SECONDS); // wait for in-flight tasks'
'executor.shutdownNow();               // interrupt running tasks if still going'`,
      tags: ["executorservice", "threadpoolexecutor", "thread-pool"],
    },
    {
      id: "countdownlatch-cyclic-barrier",
      title: "CountDownLatch, CyclicBarrier, Semaphore, Phaser",
      difficulty: "medium",
      question:
        "What are CountDownLatch, CyclicBarrier, Semaphore, and Phaser, and when do you use each?",
      answer: `All four are synchronisers in 'java.util.concurrent'.

**CountDownLatch** — one-shot: a thread waits for N other threads to complete.
'CountDownLatch latch = new CountDownLatch(3);
// Worker threads: latch.countDown();
// Coordinator:   latch.await();  // blocks until count reaches 0'
Use it: "start after all services are ready"; "wait until all workers finish". Cannot be reset.

**CyclicBarrier** — reusable: N threads wait for each other at a barrier point, then all proceed together.
'CyclicBarrier barrier = new CyclicBarrier(3, () -> System.out.println("phase done"));
// Each worker: barrier.await();'
Use it: iterative parallel algorithms (parallel merge sort phases), simulation rounds. Resets automatically for the next cycle.

**Semaphore** — controls access to a limited number of permits (resources).
'Semaphore sem = new Semaphore(5);  // max 5 concurrent DB connections
sem.acquire();
try { useResource(); } finally { sem.release(); }'
Use it: connection pools, rate limiting, bounded access to shared resources.

**Phaser** — flexible multi-phase barrier; threads can register/deregister dynamically.
'Phaser phaser = new Phaser(3);
phaser.arriveAndAwaitAdvance();   // wait for all at each phase'
Use it: multi-phase pipelines where the set of participants varies between phases.

**Summary:**
| Synchroniser | Reusable | Parties | Typical use |
|---|---|---|---|
| CountDownLatch | No | Any | Wait for N events |
| CyclicBarrier | Yes | Fixed | Rendezvous at a point |
| Semaphore | Yes | N/A | Limit concurrent access |
| Phaser | Yes | Dynamic | Multi-phase pipelines |`,
      tags: ["countdownlatch", "cyclicbarrier", "semaphore", "phaser"],
    },
    {
      id: "blocking-queue",
      title: "BlockingQueue implementations",
      difficulty: "medium",
      question:
        "What BlockingQueue implementations does Java provide, and how do they differ?",
      answer: `'BlockingQueue<E>' (in 'java.util.concurrent') blocks producers when full and consumers when empty — perfect for producer/consumer pipelines.

**Core methods:**
| Operation | Throws | Returns special value | Blocks | Times out |
|---|---|---|---|---|
| Insert | add() | offer() | put() | offer(e, t, u) |
| Remove | remove() | poll() | take() | poll(t, u) |
| Examine | element() | peek() | — | — |

**Implementations:**
| Class | Bounded? | Order | Notes |
|---|---|---|---|
| ArrayBlockingQueue | Yes (fixed) | FIFO | Single lock for put and take; fair option |
| LinkedBlockingQueue | Optional | FIFO | Separate locks for head/tail; higher throughput |
| PriorityBlockingQueue | Unbounded | Priority | Tasks ordered by Comparator/natural order |
| SynchronousQueue | 0 capacity | N/A | Direct handoff; each put waits for a matching take |
| DelayQueue | Unbounded | Delay expiry | Elements retrieved only after their delay expires |
| LinkedTransferQueue | Unbounded | FIFO | transferTo() hands off directly to waiting consumer |

**Choosing:**
- Fixed capacity with back-pressure → 'ArrayBlockingQueue'
- High-throughput producer/consumer → 'LinkedBlockingQueue'
- Scheduled/delayed tasks → 'DelayQueue'
- Handoff channel (no buffering) → 'SynchronousQueue' (used internally by 'Executors.newCachedThreadPool()')
- Priority-ordered processing → 'PriorityBlockingQueue'`,
      tags: ["blockingqueue", "producer-consumer", "concurrent-collections"],
    },
    {
      id: "concurrenthashmap",
      title: "ConcurrentHashMap internals",
      difficulty: "medium",
      question:
        "How does ConcurrentHashMap achieve thread safety without a global lock?",
      answer: `'ConcurrentHashMap' (CHM) is a thread-safe map designed for high concurrency.

**Java 8+ internals:**
- The backing array ('table') consists of **bins** (array slots).
- Each bin is independently synchronised: a write to bin N locks **only that bin** using 'synchronized' on the first node.
- Reads are **lock-free** — they use volatile reads of 'table' and node fields.
- When a bin grows past a threshold (8 entries) it is converted from a linked list to a **red-black tree** — same as 'HashMap'.

**Key operations:**
- 'get(key)' — fully lock-free; safe to call concurrently with puts.
- 'put(key, value)' — CAS to insert the first node; 'synchronized' on the head node for subsequent insertions into the same bin.
- 'size()' — approximate; maintained via distributed 'LongAdder'-style cells for scalability. For an exact count at a point-in-time, use 'mappingCount()'.

**Atomic compound operations:**
'map.putIfAbsent(key, value);'
'map.computeIfAbsent(key, k -> new ArrayList<>());'
'map.merge(key, 1, Integer::sum);'

These are individually atomic but are NOT collectively atomic across two operations. For multi-step logic, use 'compute()' or 'synchronized' externally.

**Null not allowed:** unlike 'HashMap', CHM rejects null keys and null values to avoid ambiguity between "key absent" and "key maps to null" in concurrent code.`,
      tags: ["concurrenthashmap", "thread-safety", "concurrent-collections"],
    },
    {
      id: "reentrantlock-vs-synchronized",
      title: "ReentrantLock vs synchronized",
      difficulty: "medium",
      question:
        "When should you prefer ReentrantLock over the synchronized keyword?",
      answer: `Both provide mutual exclusion and memory visibility guarantees, but 'ReentrantLock' (in 'java.util.concurrent.locks') offers extra capabilities.

**Use ReentrantLock when you need:**
- **Timed lock acquisition:** 'lock.tryLock(500, TimeUnit.MILLISECONDS)' — avoid deadlock by giving up.
- **Interruptible acquisition:** 'lock.lockInterruptibly()' — a thread waiting for the lock can be interrupted.
- **Fairness:** 'new ReentrantLock(true)' — longest-waiting thread gets the lock first (slightly lower throughput, prevents starvation).
- **Multiple condition variables:** 'Condition a = lock.newCondition(); Condition b = lock.newCondition();' — 'synchronized' gives only one implicit condition per object.
- **Diagnostic introspection:** 'lock.getQueueLength()', 'lock.isHeldByCurrentThread()'.

**Always use try-finally with ReentrantLock:**
'lock.lock();
try {
    // critical section
} finally {
    lock.unlock();   // MUST unlock even if exception is thrown
}'

**When synchronized is fine (and simpler):**
- Simple critical sections with no timeout/interruption needs
- No multiple condition variables needed
- Code clarity and less boilerplate matter more than flexibility

**Performance:** in modern JVMs (HotSpot JDK 21+) biased locking and lock elision make uncontended 'synchronized' very fast. Prefer 'synchronized' by default and reach for 'ReentrantLock' only when its features are needed.`,
      tags: ["reentrantlock", "synchronized", "locking"],
    },
    {
      id: "readwritelock",
      title: "ReadWriteLock",
      difficulty: "medium",
      question: "How does ReadWriteLock improve concurrency for read-heavy workloads?",
      answer: `'ReadWriteLock' (implemented by 'ReentrantReadWriteLock') maintains two locks:
- **Read lock** — shared: multiple threads may hold it simultaneously, as long as no writer holds the write lock.
- **Write lock** — exclusive: only one thread may hold it, and only when no readers are active.

This is ideal when reads far outnumber writes.

'ReadWriteLock rwLock = new ReentrantReadWriteLock();
Lock readLock  = rwLock.readLock();
Lock writeLock = rwLock.writeLock();

// Reader:
readLock.lock();
try { return cache.get(key); }
finally { readLock.unlock(); }

// Writer:
writeLock.lock();
try { cache.put(key, value); }
finally { writeLock.unlock(); }'

**Caveats:**
- Writer starvation can occur if readers continuously hold the lock. The fair constructor ('new ReentrantReadWriteLock(true)') mitigates this.
- Lock downgrading (write → read) is allowed without releasing; lock upgrading (read → write) is NOT allowed.
- Overhead of tracking lock state makes it slower than a plain 'ReentrantLock' for low-concurrency cases.

**Java 8+ alternative — StampedLock:**
'StampedLock' adds an **optimistic read** mode: read without acquiring a lock, then validate. If validation fails (a write occurred), fall back to a real read lock. This can significantly reduce contention:
'long stamp = sl.tryOptimisticRead();
double v = field;
if (!sl.validate(stamp)) {
    stamp = sl.readLock();
    try { v = field; } finally { sl.unlockRead(stamp); }
}'`,
      tags: ["readwritelock", "stampedlock", "locking"],
    },
    {
      id: "atomic-classes",
      title: "AtomicInteger, AtomicReference, and LongAdder",
      difficulty: "medium",
      question:
        "When should you use AtomicInteger vs LongAdder vs synchronized for counters?",
      answer: `All three are in 'java.util.concurrent.atomic' (except 'synchronized').

**AtomicInteger / AtomicLong:**
- Uses a single CAS (compare-and-swap) hardware instruction.
- Lock-free; excellent for low-to-medium contention.
- Supports 'get()', 'set()', 'getAndIncrement()', 'compareAndSet(expected, update)'.

'AtomicInteger counter = new AtomicInteger(0);
counter.incrementAndGet();'

**LongAdder (Java 8+):**
- Maintains an array of cells; each thread updates its own cell (Striped64 design).
- Dramatically reduces CAS contention under high thread counts.
- 'sum()' aggregates all cells — not a consistent snapshot if updates are ongoing.
- Use when you only need the final total, not the intermediate values.

'LongAdder adder = new LongAdder();
adder.increment();
long total = adder.sum();'

**AtomicReference / AtomicStampedReference:**
- CAS on object references — enables lock-free linked structures.
- 'AtomicStampedReference' adds a version stamp to prevent the ABA problem.

**Choosing:**
| Scenario | Best choice |
|---|---|
| Low contention counter | AtomicInteger |
| High contention counter, final sum only | LongAdder |
| Conditional update / CAS loop | AtomicInteger.compareAndSet |
| Reference swap | AtomicReference |
| ABA-sensitive algorithm | AtomicStampedReference |
| Compound multi-field atomicity | synchronized or a single AtomicReference<ImmutableRecord> |`,
      tags: ["atomicinteger", "longadder", "cas", "lock-free"],
    },
    {
      id: "completablefuture-api",
      title: "CompletableFuture API",
      difficulty: "medium",
      question:
        "How do you compose async operations with CompletableFuture (thenApply, thenCompose, thenCombine, allOf)?",
      answer: `'CompletableFuture<T>' (Java 8+) represents an asynchronous computation that can be explicitly completed and composed.

**Creation:**
'CompletableFuture<String> cf = CompletableFuture.supplyAsync(() -> fetchData(), executor);'

**Transformation:**
- 'thenApply(fn)' — transform the result (like map); runs on the completing thread or common pool.
- 'thenApplyAsync(fn, executor)' — force async execution on a specific executor.
- 'thenAccept(consumer)' — consume result, returns 'CompletableFuture<Void>'.
- 'thenRun(runnable)' — run after completion, ignores result.

**Flat-mapping (avoid nested futures):**
- 'thenCompose(fn)' — fn returns another 'CompletableFuture'; result is flattened (like flatMap).

'CompletableFuture<Order> future = fetchUserId()
    .thenCompose(id -> fetchUser(id))
    .thenCompose(user -> fetchOrder(user));'

**Combining two futures:**
- 'thenCombine(other, biFunction)' — waits for both, combines results.
- 'thenAcceptBoth(other, biConsumer)' — waits for both, consumes both results.
- 'applyToEither(other, fn)' — uses whichever completes first.

**Fan-out:**
- 'CompletableFuture.allOf(cf1, cf2, cf3).thenRun(...)' — waits for all; no combined result.
- 'CompletableFuture.anyOf(cf1, cf2, cf3)' — completes with the first result.

**Error handling:**
- 'exceptionally(ex -> fallback)' — recover from exception.
- 'handle((result, ex) -> ...)' — like 'thenApply' but also receives the exception.
- 'whenComplete((result, ex) -> ...)' — side-effect; does not change the result.

**Default executor:** unless you specify one, 'supplyAsync' uses 'ForkJoinPool.commonPool()'. Always supply your own executor in production.`,
      tags: ["completablefuture", "async", "composition"],
    },
    {
      id: "forkjoinpool",
      title: "ForkJoinPool and work-stealing",
      difficulty: "medium",
      question: "What is ForkJoinPool and how does work-stealing work?",
      answer: `'ForkJoinPool' is a special thread pool optimised for divide-and-conquer (recursive decomposition) tasks. It powers parallel streams and 'CompletableFuture.supplyAsync()' by default.

**Core idea — work-stealing:**
- Each worker thread has its own **deque** (double-ended queue) of tasks.
- A thread pushes and pops tasks from the **head** of its deque (LIFO — good cache locality).
- When a thread runs out of work it **steals** tasks from the **tail** of another thread's deque (FIFO — reduces contention).

**RecursiveTask and RecursiveAction:**
'class SumTask extends RecursiveTask<Long> {
    long[] arr; int lo, hi;

    @Override protected Long compute() {
        if (hi - lo <= THRESHOLD) {
            long sum = 0;
            for (int i = lo; i < hi; i++) sum += arr[i];
            return sum;
        }
        int mid = (lo + hi) >>> 1;
        SumTask left  = new SumTask(arr, lo, mid);
        SumTask right = new SumTask(arr, mid, hi);
        left.fork();                    // submit left to pool asynchronously
        return right.compute()          // compute right on current thread
             + left.join();             // retrieve left result
    }
}'

**Common pool:**
'ForkJoinPool.commonPool()' — shared across the JVM; parallelism = CPU count - 1.

Set via: '-Djava.util.concurrent.ForkJoinPool.common.parallelism=N'

**When to use ForkJoinPool directly:**
- CPU-bound recursive tasks (parallel sort, tree traversal)
- Custom pool with dedicated parallelism to avoid hogging the common pool for blocking I/O work`,
      tags: ["forkjoinpool", "work-stealing", "parallelism"],
    },

    // ───── HARD ─────
    {
      id: "deadlock-livelock-starvation",
      title: "Deadlock, livelock, and starvation",
      difficulty: "hard",
      question:
        "How do deadlock, livelock, and starvation occur in Java, and how do you prevent them?",
      answer: `**Deadlock** — two or more threads wait for each other's locks indefinitely.
Classic example:
- Thread A holds Lock-1, waits for Lock-2
- Thread B holds Lock-2, waits for Lock-1

**Prevention strategies:**
1. **Consistent lock ordering** — always acquire locks in the same global order.
2. **Timed lock acquisition** — 'lock.tryLock(timeout, unit)'; release and retry if timed out.
3. **Lock-free data structures** — avoid shared mutable state.
4. **Single lock** — merge the two into one when possible.
5. **Deadlock detection** — thread dumps ('jstack', 'jcmd <pid> Thread.print'); modern JVMs detect deadlocks in thread dumps automatically.

**Livelock** — threads are not blocked but keep responding to each other's actions, making no progress (e.g., two threads keep backing off simultaneously).
Prevention: add randomised back-off (exponential backoff with jitter).

**Starvation** — a low-priority thread never gets CPU/lock because high-priority threads always win.
Prevention:
- Fair locks: 'new ReentrantLock(true)'
- Fair semaphores, fair queues
- Avoid 'synchronized' in hot paths if fairness matters
- Avoid priority inversion — use priority inheritance-aware constructs

**Diagnosing deadlocks at runtime:**
'ThreadMXBean mxBean = ManagementFactory.getThreadMXBean();
long[] ids = mxBean.findDeadlockedThreads();
if (ids != null) {
    ThreadInfo[] info = mxBean.getThreadInfo(ids, true, true);
    // log or alert
}'`,
      tags: ["deadlock", "livelock", "starvation", "concurrency-bugs"],
    },
    {
      id: "java-memory-model-advanced",
      title: "Java Memory Model — reordering and safe publication",
      difficulty: "hard",
      question:
        "How can instruction reordering cause bugs, and what is safe publication?",
      answer: `The JMM allows both the **compiler** and the **CPU** to reorder instructions as long as the within-thread result is unchanged. This can expose other threads to unexpected orderings.

**Classic broken double-checked locking (pre-Java 5):**
'// BROKEN without volatile
private static Singleton instance;
public static Singleton getInstance() {
    if (instance == null) {
        synchronized (Singleton.class) {
            if (instance == null)
                instance = new Singleton();  // reordering: reference published before constructor finishes
        }
    }
    return instance;
}'

Object construction is effectively:
1. Allocate memory
2. Write reference to 'instance'  ← CPU may publish step 2 before step 3
3. Invoke constructor

Another thread can see a non-null but partially constructed object.

**Fix — declare 'instance' as 'volatile':**
A volatile write happens-before any subsequent volatile read, so step 3 is always visible before the reference is seen.

**Safe publication rules (an object is safely published when):**
- Initialised in a 'static' field ('static final' is always safe — class loading guarantees).
- Stored in a 'volatile' field.
- Stored after 'synchronized' exit.
- Stored in a 'final' field set in the constructor (JMM freeze guarantee).
- Placed in a 'ConcurrentHashMap', 'CopyOnWriteArrayList', or other concurrent collection.

**Effectively immutable objects** (no mutations after publication) are safe to share without synchronisation — but only if they were safely published in the first place.`,
      tags: ["jmm", "reordering", "safe-publication", "double-checked-locking"],
    },
    {
      id: "virtual-threads-project-loom",
      title: "Virtual threads (Project Loom)",
      difficulty: "hard",
      question:
        "What are virtual threads in Java 21, and how do they differ from platform threads?",
      answer: `**Virtual threads** (JEP 444, GA in Java 21) are lightweight threads managed by the JVM, not the OS.

**Platform thread vs virtual thread:**
| Aspect | Platform thread | Virtual thread |
|---|---|---|
| Backed by | OS thread (1:1) | JVM-managed (M:N) |
| Memory | ~1 MB stack | ~few KB heap allocation |
| Creation cost | High (syscall) | Very low |
| Practical limit | Thousands | Millions |
| Blocking I/O | Blocks OS thread | JVM unmounts, OS thread free |

**Creating virtual threads:**
'Thread vt = Thread.ofVirtual().start(() -> {
    System.out.println("virtual: " + Thread.currentThread().isVirtual());
});

// With an ExecutorService:
try (ExecutorService ex = Executors.newVirtualThreadPerTaskExecutor()) {
    ex.submit(() -> doWork());
}'

**How they work — mount/unmount:**
Virtual threads are scheduled onto **carrier threads** (a small ForkJoinPool). When a virtual thread blocks on I/O or a blocking queue operation, the JVM **unmounts** it from the carrier thread (saves its stack to heap) and parks it. When I/O completes, the virtual thread is **remounted** on an available carrier thread.

**When virtual threads help:**
- High-concurrency I/O-bound code (HTTP handlers, DB queries) — replace thread-per-request with virtual-thread-per-request without pool management.
- Migrating thread-per-request servers without rewriting to async/reactive.

**When they do NOT help:**
- CPU-bound tasks — the number of carriers equals CPU count; pinning CPU is the bottleneck, not thread count.
- Code that holds platform-level locks while blocking (pinning). Avoid 'synchronized' inside virtual threads for operations that block; use 'ReentrantLock' instead.

**Pinning:** a virtual thread is pinned to its carrier (cannot unmount) when it blocks while inside a 'synchronized' block or native method. JDK 24+ progressively fixes synchronised pinning.`,
      tags: ["virtual-threads", "project-loom", "java-21"],
    },
    {
      id: "structured-concurrency",
      title: "Structured concurrency",
      difficulty: "hard",
      question:
        "What is structured concurrency in Java (JEP 453) and why does it matter?",
      answer: `**Structured concurrency** (JEP 453, preview in Java 21; in preview in 22-23; API-stable in 24) treats a group of concurrent tasks as a single unit of work — similar to how structured programming treats blocks of code.

**Core API — StructuredTaskScope:**
'try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
    Subtask<String> userTask  = scope.fork(() -> fetchUser(id));
    Subtask<Order>  orderTask = scope.fork(() -> fetchOrder(id));

    scope.join();           // wait for all subtasks
    scope.throwIfFailed();  // propagate any exception

    return new Response(userTask.get(), orderTask.get());
}'

**Why it matters:**
1. **Lifetime control** — subtasks cannot outlive their enclosing scope. No orphaned tasks.
2. **Error propagation** — if any subtask fails, 'ShutdownOnFailure' cancels siblings and propagates the exception.
3. **Cancellation** — when the enclosing scope is cancelled (e.g., the HTTP request times out), all subtasks are cancelled automatically.
4. **Observability** — thread dumps show the parent-child relationship of virtual threads, making debugging trivial.

**ShutdownOnSuccess** variant — take the first successful result, cancel the rest:
'try (var scope = new StructuredTaskScope.ShutdownOnSuccess<String>()) {
    scope.fork(() -> callServiceA());
    scope.fork(() -> callServiceB());
    scope.join();
    return scope.result();   // fastest result wins
}'

**Contrast with CompletableFuture:**
'CompletableFuture.allOf(...)' does not enforce lifetime boundaries — tasks can outlive the code that spawned them. 'StructuredTaskScope' makes the boundary explicit and enforced by the JVM.`,
      tags: ["structured-concurrency", "virtual-threads", "java-21"],
    },
    {
      id: "concurrenthashmap-advanced",
      title: "ConcurrentHashMap — advanced operations and pitfalls",
      difficulty: "hard",
      question:
        "What are the atomicity guarantees of ConcurrentHashMap.compute() and common misuse patterns?",
      answer: `CHM's read methods ('get', 'containsKey') are fully lock-free. Single-entry write methods ('put', 'remove', 'replace') are individually atomic. But compound operations require special care.

**Atomic compound operations:**
'// Increment a counter — atomic with compute():
map.compute(key, (k, v) -> v == null ? 1 : v + 1);

// Only insert if absent — atomic:
map.computeIfAbsent(key, k -> new CopyOnWriteArrayList<>());

// Merge — atomic:
map.merge(key, 1, Integer::sum);'

**Common pitfall — non-atomic compound check-then-act:**
'// BROKEN: another thread may insert between get() and put()
if (!map.containsKey(key)) {
    map.put(key, createValue(key));   // race condition
}
// CORRECT:
map.computeIfAbsent(key, k -> createValue(k));'

**Another pitfall — long-running lambdas inside compute():**
The bin is locked for the duration of the 'compute()' lambda. Never do I/O, acquire external locks, or perform expensive work inside the lambda — it serialises all threads that hash to the same bin.

**Size semantics:**
'map.size()' may be approximate during concurrent mutations. For a more accurate count:
'map.mappingCount()' — returns 'long' (size can exceed Integer.MAX_VALUE).

**Iteration consistency:** CHM iterators and forEach use snapshot semantics per segment — they will not throw 'ConcurrentModificationException', but may or may not reflect concurrent puts/removes.

**Bulk operations (Java 8+):**
'map.forEach(parallelismThreshold, (k, v) -> process(k, v));
map.reduceValues(parallelismThreshold, Double::sum);
map.search(parallelismThreshold, (k, v) -> v > 100 ? v : null);'
Pass a 'parallelismThreshold' of '1L' to use the common 'ForkJoinPool'; a very large threshold to stay single-threaded.`,
      tags: ["concurrenthashmap", "atomicity", "pitfalls"],
    },
    {
      id: "completablefuture-advanced",
      title: "CompletableFuture — advanced patterns and pitfalls",
      difficulty: "hard",
      question:
        "What are common pitfalls and advanced patterns with CompletableFuture?",
      answer: `**Pitfall 1 — blocking in async callbacks:**
'future.thenApply(result -> {
    return jdbcTemplate.queryForObject(...);  // blocks a common-pool thread!
});'
Fix: use 'thenApplyAsync(fn, jdbcExecutor)' to offload blocking work to a dedicated executor.

**Pitfall 2 — swallowing exceptions:**
'future.thenApply(r -> transform(r));  // if transform() throws, the exception is silently captured in the returned future'
Always attach 'exceptionally()' or 'handle()' at the end of a chain.

**Pitfall 3 — allOf returns Void:**
'CompletableFuture.allOf(cf1, cf2)' returns 'CompletableFuture<Void>'. To collect results:
'List<CompletableFuture<String>> cfs = ...;
CompletableFuture.allOf(cfs.toArray(new CompletableFuture[0]))
    .thenApply(v -> cfs.stream().map(CompletableFuture::join).collect(Collectors.toList()));'

**Pitfall 4 — join() in reactive/async context:**
Calling 'cf.get()' or 'cf.join()' inside a ForkJoinPool-managed thread (e.g., another 'thenApply') can cause thread starvation. Use composition instead.

**Advanced pattern — timeout with fallback (Java 9+):**
'cf.orTimeout(5, TimeUnit.SECONDS)           // completes with TimeoutException after 5 s
   .exceptionally(ex -> "default value");   // fallback

// Or provide a value without exception:
cf.completeOnTimeout("default", 5, TimeUnit.SECONDS);'

**Advanced pattern — retry with CompletableFuture:**
'static <T> CompletableFuture<T> retry(
        Supplier<CompletableFuture<T>> task, int remaining) {
    return task.get().exceptionallyCompose(ex ->
        remaining > 0 ? retry(task, remaining - 1)
                      : CompletableFuture.failedFuture(ex));
}'

**Advanced pattern — bulkhead (limit concurrency):**
Use a 'Semaphore' around task submission to avoid overwhelming downstream services.`,
      tags: ["completablefuture", "async", "pitfalls", "advanced"],
    },
    {
      id: "lock-free-algorithms",
      title: "Lock-free algorithms and the ABA problem",
      difficulty: "hard",
      question: "How do CAS-based lock-free algorithms work, and what is the ABA problem?",
      answer: `**Compare-and-Swap (CAS):** an atomic CPU instruction that updates a memory location only if it currently holds an expected value.
'AtomicInteger ai = new AtomicInteger(0);
boolean updated = ai.compareAndSet(0, 1);  // succeeds; now ai == 1'

**Lock-free stack using CAS:**
'class LockFreeStack<T> {
    private final AtomicReference<Node<T>> top = new AtomicReference<>();

    public void push(T val) {
        Node<T> newNode = new Node<>(val);
        Node<T> current;
        do {
            current = top.get();
            newNode.next = current;
        } while (!top.compareAndSet(current, newNode));  // retry if top changed
    }

    public T pop() {
        Node<T> current, next;
        do {
            current = top.get();
            if (current == null) return null;
            next = current.next;
        } while (!top.compareAndSet(current, next));
        return current.val;
    }
}'

**The ABA problem:**
1. Thread 1 reads top == A, gets preempted.
2. Thread 2 pops A, pushes B, pops B, pushes A again.
3. Thread 1 resumes: CAS sees top == A (expected), succeeds — but the structure has changed. The 'next' pointer Thread 1 captured is now stale.

**Solutions:**
- **AtomicStampedReference<T>** — pairs the reference with an integer stamp (version counter). CAS checks both the reference AND the stamp.
'AtomicStampedReference<Node<T>> top = new AtomicStampedReference<>(null, 0);
int[] stamp = new int[1];
Node<T> current = top.get(stamp);
top.compareAndSet(current, next, stamp[0], stamp[0] + 1);'
- **AtomicMarkableReference<T>** — uses a boolean mark instead of an int stamp (sufficient for some algorithms).
- **Hazard pointers / epoch-based reclamation** — used in production lock-free libraries to avoid reusing pointers while any thread might reference them.`,
      tags: ["cas", "lock-free", "aba-problem", "atomic"],
    },
    {
      id: "reactive-programming",
      title: "Reactive programming — Project Reactor and RxJava",
      difficulty: "hard",
      question:
        "What is reactive programming in Java, and how do Flux/Mono differ from CompletableFuture?",
      answer: `**Reactive programming** models asynchronous data flows as **streams** with built-in back-pressure. The Reactive Streams specification (JDK 9: 'java.util.concurrent.Flow') defines four interfaces: 'Publisher', 'Subscriber', 'Subscription', 'Processor'.

**Project Reactor (used by Spring WebFlux):**
- 'Mono<T>' — 0 or 1 element (analogous to 'CompletableFuture<T>').
- 'Flux<T>' — 0 to N elements (a stream).

'Flux<String> flux = Flux.fromIterable(List.of("a","b","c"))
    .map(String::toUpperCase)
    .filter(s -> !s.equals("B"))
    .flatMap(s -> fetchRemote(s))    // async, concurrent
    .onErrorResume(ex -> Flux.just("fallback"));

flux.subscribe(
    item  -> System.out.println("next: " + item),
    error -> System.err.println("error: " + error),
    ()    -> System.out.println("complete")
);'

**Back-pressure:** the subscriber signals how many elements it can handle. The publisher pauses if the subscriber is overwhelmed — preventing OOM without explicit coordination.

**CompletableFuture vs Mono:**
| Aspect | CompletableFuture<T> | Mono<T> / Flux<T> |
|---|---|---|
| Cardinality | Exactly 1 | 0-1 (Mono) / 0-N (Flux) |
| Back-pressure | No | Yes |
| Laziness | Eagerly computed | Cold by default (lazy) |
| Cancellation | cancel() | Disposable.dispose() |
| Ecosystem | Java standard library | Spring WebFlux, R2DBC, etc. |

**Schedulers — where operators run:**
- 'Schedulers.boundedElastic()' — blocking I/O (equivalent to a cached thread pool).
- 'Schedulers.parallel()' — CPU work (parallelism = CPU count).
- 'Schedulers.single()' — single thread.

'Mono.fromCallable(() -> blockingDbCall())
    .subscribeOn(Schedulers.boundedElastic())'

**Key pitfall:** never call blocking code ('Thread.sleep()', JDBC) on a 'Schedulers.parallel()' thread — it stalls the entire reactor thread pool. Use 'subscribeOn(Schedulers.boundedElastic())'.`,
      tags: ["reactive", "reactor", "flux", "mono", "back-pressure"],
    },
    {
      id: "scheduledexecutorservice",
      title: "ScheduledExecutorService — delayed and periodic tasks",
      difficulty: "hard",
      question:
        "How does ScheduledExecutorService work, and how does it compare to Timer?",
      answer: `'ScheduledExecutorService' (Java 5+) replaces the legacy 'Timer' class for delayed and periodic task scheduling.

**Creating one:**
'ScheduledExecutorService scheduler =
    Executors.newScheduledThreadPool(4);'

**One-shot delayed task:**
'ScheduledFuture<?> future = scheduler.schedule(
    () -> System.out.println("fired"), 5, TimeUnit.SECONDS);
future.cancel(false);   // cancel if not yet run'

**Fixed-rate scheduling (wall-clock rhythm):**
'scheduler.scheduleAtFixedRate(
    this::doWork,
    initialDelay, period, TimeUnit.MILLISECONDS);'
If 'doWork()' takes longer than 'period', the next run starts immediately after the previous finishes (no overlap — still single-threaded per task).

**Fixed-delay scheduling (gap between runs):**
'scheduler.scheduleWithFixedDelay(
    this::doWork,
    initialDelay, delay, TimeUnit.MILLISECONDS);'
'delay' is measured from the end of the previous execution.

**Timer vs ScheduledExecutorService:**
| Aspect | Timer | ScheduledExecutorService |
|---|---|---|
| Thread count | Single | Configurable |
| Task isolation | One exception kills all tasks | Each task independent |
| Thread safety | Partially | Fully thread-safe |
| Precision | Poor on some JVMs | Better |
| Deprecation | Effectively deprecated | Recommended |

**Proper shutdown:**
'scheduler.shutdown();
if (!scheduler.awaitTermination(10, TimeUnit.SECONDS)) {
    scheduler.shutdownNow();
}'

**Spring @Scheduled** and Quartz are higher-level alternatives for production scheduling with cron expressions, persistence, and clustering.`,
      tags: ["scheduledexecutorservice", "timer", "scheduling"],
    },
  ],
};
