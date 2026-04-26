import type { Category } from "./types";

export const pythonAsync: Category = {
  slug: "python-async",
  title: "Python Async & Concurrency",
  description:
    "Deep dive into Python concurrency: the GIL, threading, multiprocessing, asyncio, concurrent.futures, and Python 3.12+ no-GIL experimental builds.",
  icon: "🔄",
  questions: [
    // ───── EASY ─────
    {
      id: "what-is-the-gil",
      title: "What is the GIL?",
      difficulty: "easy",
      question: "What is the Global Interpreter Lock (GIL) and why does CPython have one?",
      answer: `The **Global Interpreter Lock (GIL)** is a mutex inside CPython that allows only one thread to execute Python bytecode at a time, even on multi-core hardware.

**Why it exists:**
CPython manages memory with **reference counting**. Without a lock, two threads could simultaneously increment/decrement the same object's reference count, corrupting the count and causing premature garbage collection or memory leaks. The GIL is the simplest way to make reference counting thread-safe without per-object locks.

**Key implications:**
- **CPU-bound** multi-threaded programs do *not* run in true parallel — threads take turns holding the GIL.
- **I/O-bound** programs are largely unaffected: the GIL is *released* while waiting on sockets, files, or subprocess output.
- C extensions (NumPy, Pillow, etc.) can also release the GIL during heavy computation, enabling real parallelism from Python threads.

**As of 2026:** Python 3.12 shipped experimental **no-GIL** builds (PEP 703 / \`--disable-gil\`). Python 3.13 made them officially opt-in. These builds replace reference counting with thread-safe alternatives, at a small (~5-10 %) single-threaded throughput cost.

\`\`\`python
import sys
print(sys._is_gil_enabled())  # True in standard build, False in no-GIL build
\`\`\``,
      tags: ["gil", "cpython", "fundamentals"],
    },
    {
      id: "threading-vs-multiprocessing-vs-asyncio",
      title: "Threading vs multiprocessing vs asyncio — decision matrix",
      difficulty: "easy",
      question: "When should you use threading, multiprocessing, or asyncio?",
      answer: `| Scenario | Best choice | Reason |
|---|---|---|
| Many concurrent **I/O** tasks (HTTP calls, DB queries) | **asyncio** | Cheap coroutines; no OS-thread overhead |
| I/O work with legacy blocking libraries | **threading** | GIL released on I/O; simpler than asyncio for small concurrency |
| **CPU-bound** computation in pure Python | **multiprocessing** | Each process has its own GIL (or use no-GIL Python 3.13+) |
| CPU-bound work in NumPy / C extensions | **threading** (or multiprocessing) | C code can release the GIL |
| Mixed I/O + CPU | asyncio + \`run_in_executor\` for CPU parts | Keep the event loop unblocked |

**Rule of thumb:**
- I/O-bound + high concurrency → asyncio
- I/O-bound + simpler code matters → threading
- CPU-bound pure Python → multiprocessing
- Python 3.13+ no-GIL build → threading becomes viable for CPU-bound too`,
      tags: ["threading", "multiprocessing", "asyncio", "fundamentals"],
    },
    {
      id: "async-await-basics",
      title: "async/await basics",
      difficulty: "easy",
      question: "What are coroutines, async/await, and how does asyncio run them?",
      answer: `A **coroutine** is a function defined with \`async def\`. Calling it returns a coroutine object — it does *not* run immediately.

\`\`\`python
import asyncio

async def fetch(url: str) -> str:
    await asyncio.sleep(1)   # suspends this coroutine, yields control to event loop
    return f"data from {url}"

async def main() -> None:
    result = await fetch("https://example.com")
    print(result)

asyncio.run(main())  # creates event loop, runs main(), closes loop
\`\`\`

**How it works:**
1. \`asyncio.run()\` creates an **event loop** and schedules \`main\` as a task.
2. \`await\` suspends the current coroutine and hands control back to the event loop.
3. The event loop runs other ready tasks; when the awaited work is done it resumes the coroutine.

**Key rule:** you must \`await\` a coroutine — forgetting \`await\` gives you a coroutine object, not its result (Python will warn: *RuntimeWarning: coroutine was never awaited*).`,
      tags: ["asyncio", "coroutines", "fundamentals"],
    },
    {
      id: "asyncio-run-and-event-loop",
      title: "asyncio.run() and event loop management",
      difficulty: "easy",
      question: "How do you start and manage an asyncio event loop?",
      answer: `**Preferred (Python 3.7+):** use \`asyncio.run()\`. It creates a fresh event loop, runs the coroutine to completion, then closes and cleans up the loop.

\`\`\`python
import asyncio

async def main():
    await asyncio.sleep(0.1)
    print("done")

asyncio.run(main())
\`\`\`

**Lower-level (needed in frameworks/tests):**
\`\`\`python
loop = asyncio.new_event_loop()
asyncio.set_event_loop(loop)
try:
    loop.run_until_complete(main())
finally:
    loop.close()
\`\`\`

**Common pitfalls:**
- Calling \`asyncio.run()\` inside an already-running loop raises \`RuntimeError\`. In Jupyter notebooks use \`await main()\` directly or install \`nest_asyncio\`.
- \`asyncio.get_event_loop()\` is deprecated for creating a new loop; prefer \`asyncio.get_running_loop()\` inside async code.
- In production web frameworks (FastAPI, Starlette) the framework manages the loop — never call \`asyncio.run()\` inside a handler.`,
      tags: ["asyncio", "event-loop"],
    },
    {
      id: "threading-thread-and-lock",
      title: "Thread and Lock basics",
      difficulty: "easy",
      question: "How do you create threads and protect shared state with a Lock in Python?",
      answer: `\`\`\`python
import threading

counter = 0
lock = threading.Lock()

def increment(n: int) -> None:
    global counter
    for _ in range(n):
        with lock:           # acquire on enter, release on exit (even on exception)
            counter += 1

threads = [threading.Thread(target=increment, args=(100_000,)) for _ in range(4)]
for t in threads:
    t.start()
for t in threads:
    t.join()    # wait for all threads to finish

print(counter)  # 400000 — correct because of the lock
\`\`\`

**Without the lock** the read-modify-write of \`counter += 1\` is not atomic and the result would be unpredictably less than 400 000.

**Key threading primitives:**
| Primitive | Purpose |
|---|---|
| \`Lock\` | Mutual exclusion — one thread at a time |
| \`RLock\` | Re-entrant lock — same thread can acquire multiple times |
| \`Semaphore\` | Allow up to N threads simultaneously |
| \`Event\` | One thread signals, others wait |
| \`Condition\` | Wait for an arbitrary condition |
| \`Queue\` | Thread-safe producer/consumer queue |`,
      tags: ["threading", "thread-safety"],
    },
    {
      id: "thread-safety-pitfalls",
      title: "Thread-safety pitfalls",
      difficulty: "easy",
      question: "What are common thread-safety bugs in Python and how do you avoid them?",
      answer: `Even with the GIL, Python code is **not automatically thread-safe**. The GIL switches between threads at bytecode boundaries, which can fall in the middle of high-level operations.

**Race condition example:**
\`\`\`python
# ❌ NOT safe — two bytecodes: LOAD_GLOBAL + STORE_GLOBAL
counter += 1

# ✅ Safe alternatives
import threading
lock = threading.Lock()
with lock:
    counter += 1

# or use thread-safe data structures
from queue import Queue
q: Queue[int] = Queue()
\`\`\`

**Common pitfalls:**
- **Mutable default arguments** shared across calls.
- **List/dict operations** that look atomic but aren't (e.g., \`if k not in d: d[k] = []\` — check-then-act race).
- **Lazy initialisation** without a lock (double-checked locking pattern is broken in Python without proper synchronisation).
- **Logging** — Python's \`logging\` module is thread-safe; \`print\` is not (lines can interleave).

**Safer approach:** prefer immutable data, thread-local storage (\`threading.local()\`), or message passing via \`queue.Queue\`.`,
      tags: ["threading", "thread-safety", "pitfalls"],
    },
    {
      id: "asyncio-tasks-gather",
      title: "Tasks and asyncio.gather",
      difficulty: "easy",
      question: "How do you run multiple coroutines concurrently with asyncio?",
      answer: `**asyncio.gather** runs awaitables concurrently and collects results in order:

\`\`\`python
import asyncio
import aiohttp

async def fetch(session: aiohttp.ClientSession, url: str) -> str:
    async with session.get(url) as resp:
        return await resp.text()

async def main() -> None:
    urls = ["https://httpbin.org/get"] * 5
    async with aiohttp.ClientSession() as session:
        results = await asyncio.gather(*(fetch(session, u) for u in urls))
    print(len(results))  # 5

asyncio.run(main())
\`\`\`

**Task vs coroutine:**
- A **coroutine** only runs when you \`await\` it directly — sequential.
- A **Task** (\`asyncio.create_task(coro())\`) is scheduled immediately and runs concurrently with other tasks.

\`\`\`python
async def main():
    # These run SEQUENTIALLY — 2 seconds total
    await asyncio.sleep(1)
    await asyncio.sleep(1)

    # These run CONCURRENTLY — ~1 second total
    t1 = asyncio.create_task(asyncio.sleep(1))
    t2 = asyncio.create_task(asyncio.sleep(1))
    await t1
    await t2
\`\`\`

**gather vs wait:**
- \`gather\` — returns results in input order, propagates first exception by default.
- \`asyncio.wait\` — returns (done, pending) sets; fine-grained timeout/cancellation control.`,
      tags: ["asyncio", "tasks", "gather"],
    },
    {
      id: "multiprocessing-basics",
      title: "multiprocessing basics",
      difficulty: "easy",
      question: "How do you spawn processes and share work with the multiprocessing module?",
      answer: `\`\`\`python
from multiprocessing import Process, Queue

def worker(q: Queue, n: int) -> None:
    q.put(n * n)

if __name__ == "__main__":   # guard required on Windows/macOS (spawn start method)
    q: Queue[int] = Queue()
    processes = [Process(target=worker, args=(q, i)) for i in range(4)]
    for p in processes:
        p.start()
    for p in processes:
        p.join()
    results = [q.get() for _ in processes]
    print(sorted(results))  # [0, 1, 4, 9]
\`\`\`

**Pool** — simpler API for mapping work across processes:
\`\`\`python
from multiprocessing import Pool

def square(x: int) -> int:
    return x * x

if __name__ == "__main__":
    with Pool(processes=4) as pool:
        print(pool.map(square, range(10)))
\`\`\`

**Key points:**
- Each process has its own memory — no shared GIL, true parallelism.
- IPC costs (pickling) make it unsuitable for tiny tasks.
- Always guard the entry point with \`if __name__ == "__main__":\`.`,
      tags: ["multiprocessing", "fundamentals"],
    },

    // ───── MEDIUM ─────
    {
      id: "concurrent-futures",
      title: "concurrent.futures — ThreadPoolExecutor & ProcessPoolExecutor",
      difficulty: "medium",
      question: "How does concurrent.futures simplify thread/process pool usage?",
      answer: `\`concurrent.futures\` provides a high-level, uniform API for both thread and process pools.

\`\`\`python
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor, as_completed
import urllib.request

URLS = [
    "https://httpbin.org/get?a=1",
    "https://httpbin.org/get?a=2",
    "https://httpbin.org/get?a=3",
]

def fetch(url: str) -> tuple[str, int]:
    with urllib.request.urlopen(url) as resp:
        return url, len(resp.read())

# I/O-bound → threads
with ThreadPoolExecutor(max_workers=8) as ex:
    futures = {ex.submit(fetch, url): url for url in URLS}
    for fut in as_completed(futures):
        url, size = fut.result()   # raises if the call raised
        print(f"{url}: {size} bytes")

# CPU-bound pure Python → processes
def cpu_task(n: int) -> int:
    return sum(i * i for i in range(n))

with ProcessPoolExecutor() as ex:
    results = list(ex.map(cpu_task, [10**6, 10**6, 10**6]))
\`\`\`

**Key API:**
| Method | Description |
|---|---|
| \`submit(fn, *args)\` | Schedule one call, returns a \`Future\` |
| \`map(fn, iterable)\` | Like built-in \`map\` but parallel; results in order |
| \`as_completed(futures)\` | Yields futures as they finish (any order) |
| \`future.result(timeout)\` | Block until done; re-raises exceptions |
| \`future.cancel()\` | Cancel if not yet running |

**Choosing max_workers:**
- Threads: \`min(32, os.cpu_count() + 4)\` (Python 3.8+ default for \`ThreadPoolExecutor\`).
- Processes: \`os.cpu_count()\` (Python default for \`ProcessPoolExecutor\`).`,
      tags: ["concurrent.futures", "thread-pool", "process-pool"],
    },
    {
      id: "run-in-executor",
      title: "Running sync code in async context",
      difficulty: "medium",
      question: "How do you call blocking (synchronous) code from an asyncio application without blocking the event loop?",
      answer: `Use \`loop.run_in_executor()\` (or the asyncio convenience wrapper) to offload blocking calls to a thread or process pool.

\`\`\`python
import asyncio
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor
import time

def blocking_io() -> str:
    time.sleep(1)          # simulates a slow DB call / file read
    return "done"

def cpu_heavy(n: int) -> int:
    return sum(i * i for i in range(n))

async def main() -> None:
    loop = asyncio.get_running_loop()

    # Blocking I/O → thread pool (default executor)
    result = await loop.run_in_executor(None, blocking_io)
    print(result)

    # CPU-heavy → process pool
    with ProcessPoolExecutor() as pool:
        result = await loop.run_in_executor(pool, cpu_heavy, 10**7)
        print(result)

asyncio.run(main())
\`\`\`

**asyncio.to_thread (Python 3.9+)** — shorthand for thread-pool offloading:
\`\`\`python
async def main():
    result = await asyncio.to_thread(blocking_io)
\`\`\`

**Why this matters:** a single \`time.sleep(1)\` inside a coroutine (without \`await\`) freezes the *entire* event loop for 1 second — no other tasks run. Always offload blocking calls.`,
      tags: ["asyncio", "run_in_executor", "blocking"],
    },
    {
      id: "asyncio-primitives",
      title: "asyncio synchronisation primitives",
      difficulty: "medium",
      question: "What synchronisation primitives does asyncio provide and how do they differ from threading ones?",
      answer: `asyncio provides coroutine-friendly equivalents to the threading primitives. They are **not thread-safe** — use them only within a single event loop.

| asyncio primitive | threading equivalent | Key difference |
|---|---|---|
| \`asyncio.Lock\` | \`threading.Lock\` | \`await lock.acquire()\` suspends coroutine instead of blocking thread |
| \`asyncio.Event\` | \`threading.Event\` | \`await event.wait()\` |
| \`asyncio.Semaphore\` | \`threading.Semaphore\` | Rate-limit concurrent coroutines |
| \`asyncio.Queue\` | \`queue.Queue\` | \`await q.get()\`, \`await q.put()\` |
| \`asyncio.Condition\` | \`threading.Condition\` | \`async with cond:\` + \`await cond.wait()\` |

\`\`\`python
import asyncio

async def rate_limited_fetch(sem: asyncio.Semaphore, url: str) -> str:
    async with sem:          # at most 5 concurrent fetches
        await asyncio.sleep(0.1)   # simulated HTTP
        return f"ok:{url}"

async def main() -> None:
    sem = asyncio.Semaphore(5)
    tasks = [rate_limited_fetch(sem, f"url/{i}") for i in range(20)]
    results = await asyncio.gather(*tasks)
    print(len(results))

asyncio.run(main())
\`\`\`

**asyncio.Queue** for producer/consumer:
\`\`\`python
async def producer(q: asyncio.Queue[int]) -> None:
    for i in range(5):
        await q.put(i)
    await q.put(None)  # sentinel

async def consumer(q: asyncio.Queue[int]) -> None:
    while (item := await q.get()) is not None:
        print(f"consumed {item}")
        q.task_done()
\`\`\``,
      tags: ["asyncio", "synchronisation", "semaphore", "queue"],
    },
    {
      id: "async-context-managers",
      title: "Async context managers",
      difficulty: "medium",
      question: "How do you write and use async context managers?",
      answer: `An **async context manager** implements \`__aenter__\` and \`__aexit__\` as coroutines. Use \`async with\` to call them.

**Using \`contextlib.asynccontextmanager\` (easiest):**
\`\`\`python
from contextlib import asynccontextmanager
from typing import AsyncGenerator
import asyncio

@asynccontextmanager
async def managed_connection(dsn: str) -> AsyncGenerator[dict, None]:
    print(f"connecting to {dsn}")
    conn = {"dsn": dsn, "open": True}   # pretend DB connection
    try:
        yield conn
    finally:
        conn["open"] = False
        print("connection closed")

async def main() -> None:
    async with managed_connection("postgres://localhost/mydb") as conn:
        print(f"using {conn}")
\`\`\`

**Class-based:**
\`\`\`python
class Timer:
    async def __aenter__(self) -> "Timer":
        self._start = asyncio.get_event_loop().time()
        return self

    async def __aexit__(self, *exc) -> None:
        elapsed = asyncio.get_event_loop().time() - self._start
        print(f"elapsed: {elapsed:.3f}s")

async def main() -> None:
    async with Timer():
        await asyncio.sleep(0.5)
\`\`\`

**Common real-world uses:** database session/connection pools (SQLAlchemy async), aiohttp \`ClientSession\`, file handles (\`aiofiles\`), locks.`,
      tags: ["asyncio", "context-managers"],
    },
    {
      id: "async-generators",
      title: "Async generators and async iteration",
      difficulty: "medium",
      question: "What are async generators and how do you use async for?",
      answer: `An **async generator** is an \`async def\` function that contains \`yield\`. It implements the async iterator protocol — iterate with \`async for\`.

\`\`\`python
import asyncio
from typing import AsyncGenerator

async def paginate(base_url: str, pages: int) -> AsyncGenerator[list[dict], None]:
    """Simulates fetching paginated API results."""
    for page in range(1, pages + 1):
        await asyncio.sleep(0.05)   # simulate network call
        yield [{"page": page, "item": i} for i in range(3)]

async def main() -> None:
    async for batch in paginate("https://api.example.com/items", pages=4):
        print(f"got {len(batch)} items")

asyncio.run(main())
\`\`\`

**asyncio.Queue as an alternative stream:**
\`\`\`python
async def stream_events(q: asyncio.Queue[str | None]) -> None:
    async for event in aiter_queue(q):
        print(event)

async def aiter_queue(q: asyncio.Queue[str | None]):
    while (item := await q.get()) is not None:
        yield item
\`\`\`

**aclose():** always clean up — \`async for\` does this automatically, but if you break early, call \`await gen.aclose()\` to trigger the generator's \`finally\` block.

**asyncio.aiter / asyncio.anext (Python 3.10+):** built-in helpers mirroring \`iter\`/\`next\`.`,
      tags: ["asyncio", "generators", "async-iteration"],
    },
    {
      id: "multiprocessing-shared-memory",
      title: "Shared memory and IPC in multiprocessing",
      difficulty: "medium",
      question: "How do you share data between processes without pickling overhead?",
      answer: `**shared_memory (Python 3.8+)** — zero-copy shared memory block visible to all processes:

\`\`\`python
from multiprocessing import Process
from multiprocessing.shared_memory import SharedMemory
import numpy as np

def worker(shm_name: str, shape: tuple[int, ...]) -> None:
    shm = SharedMemory(name=shm_name)
    arr = np.ndarray(shape, dtype=np.int64, buffer=shm.buf)
    arr[:] *= 2          # modifies shared memory in-place
    shm.close()

if __name__ == "__main__":
    data = np.array([1, 2, 3, 4, 5], dtype=np.int64)
    shm = SharedMemory(create=True, size=data.nbytes)
    shared = np.ndarray(data.shape, dtype=np.int64, buffer=shm.buf)
    shared[:] = data

    p = Process(target=worker, args=(shm.name, data.shape))
    p.start(); p.join()
    print(shared)    # [2, 4, 6, 8, 10]
    shm.close(); shm.unlink()
\`\`\`

**Other IPC mechanisms:**
| Mechanism | Best for |
|---|---|
| \`multiprocessing.Queue\` | General task queues (pickled) |
| \`multiprocessing.Pipe\` | Bidirectional, two endpoints |
| \`multiprocessing.Value / Array\` | Simple scalars/arrays (ctypes-backed) |
| \`multiprocessing.Manager\` | Arbitrary Python objects via proxy; slowest |
| \`SharedMemory\` | Large arrays/buffers — NumPy, images |

**Gotcha:** \`Manager\` objects are convenient but every access goes through a socket, making them ~100× slower than \`SharedMemory\`.`,
      tags: ["multiprocessing", "shared-memory", "ipc"],
    },
    {
      id: "aiohttp-async-http",
      title: "aiohttp for async HTTP",
      difficulty: "medium",
      question: "How do you make concurrent HTTP requests with aiohttp?",
      answer: `\`aiohttp\` is the standard async HTTP client/server for Python. Always reuse a single \`ClientSession\` — creating one per request is an anti-pattern.

\`\`\`python
import asyncio
import aiohttp
from aiohttp import ClientSession

async def fetch_json(session: ClientSession, url: str) -> dict:
    async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as resp:
        resp.raise_for_status()
        return await resp.json()

async def main() -> None:
    urls = [f"https://jsonplaceholder.typicode.com/todos/{i}" for i in range(1, 11)]

    # Single session shared across all requests
    async with ClientSession() as session:
        tasks = [asyncio.create_task(fetch_json(session, url)) for url in urls]
        results = await asyncio.gather(*tasks, return_exceptions=True)

    for r in results:
        if isinstance(r, Exception):
            print(f"Error: {r}")
        else:
            print(r["title"])

asyncio.run(main())
\`\`\`

**Rate-limiting with Semaphore:**
\`\`\`python
async def safe_fetch(session: ClientSession, url: str, sem: asyncio.Semaphore) -> dict:
    async with sem:
        return await fetch_json(session, url)

sem = asyncio.Semaphore(10)  # max 10 concurrent requests
\`\`\`

**Connection pool tuning:**
\`\`\`python
connector = aiohttp.TCPConnector(limit=100, limit_per_host=30)
async with ClientSession(connector=connector) as session:
    ...
\`\`\``,
      tags: ["asyncio", "aiohttp", "http"],
    },
    {
      id: "asyncio-wait-and-timeout",
      title: "asyncio.wait, timeouts, and cancellation",
      difficulty: "medium",
      question: "How do you handle timeouts and cancellation in asyncio?",
      answer: `**asyncio.timeout (Python 3.11+)** — cleanest way to add a deadline:
\`\`\`python
import asyncio

async def slow_op() -> str:
    await asyncio.sleep(5)
    return "done"

async def main() -> None:
    try:
        async with asyncio.timeout(2.0):   # raises TimeoutError after 2 s
            result = await slow_op()
    except TimeoutError:
        print("timed out!")
\`\`\`

**asyncio.wait_for** (older but still common):
\`\`\`python
result = await asyncio.wait_for(slow_op(), timeout=2.0)
\`\`\`

**asyncio.wait** — fine-grained control over done/pending:
\`\`\`python
tasks = {asyncio.create_task(slow_op()) for _ in range(5)}
done, pending = await asyncio.wait(tasks, timeout=2.0, return_when=asyncio.FIRST_COMPLETED)
for task in pending:
    task.cancel()   # cancel remaining tasks
\`\`\`

**Task cancellation:**
\`\`\`python
async def cancellable() -> None:
    try:
        await asyncio.sleep(10)
    except asyncio.CancelledError:
        print("I was cancelled — cleaning up")
        raise   # always re-raise CancelledError

task = asyncio.create_task(cancellable())
await asyncio.sleep(0.1)
task.cancel()
try:
    await task
except asyncio.CancelledError:
    pass
\`\`\`

**Rule:** never swallow \`CancelledError\` — always re-raise it after cleanup so the event loop knows the task is truly done.`,
      tags: ["asyncio", "timeout", "cancellation"],
    },

    // ───── HARD ─────
    {
      id: "async-sqlalchemy",
      title: "Async SQLAlchemy patterns",
      difficulty: "hard",
      question: "How do you use SQLAlchemy's async engine and session correctly?",
      answer: `SQLAlchemy 1.4+ ships an async layer built on \`asyncpg\` / \`aiomysql\`. The key is using \`AsyncEngine\`, \`AsyncSession\`, and \`async_sessionmaker\`.

\`\`\`python
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import select
import asyncio

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]

engine = create_async_engine(
    "postgresql+asyncpg://user:pass@localhost/db",
    pool_size=10,
    max_overflow=20,
    echo=False,
)

# Factory — reuse across requests; never create AsyncSession directly
async_session: async_sessionmaker[AsyncSession] = async_sessionmaker(
    engine, expire_on_commit=False
)

async def get_user(user_id: int) -> User | None:
    async with async_session() as session:
        return await session.get(User, user_id)

async def list_users() -> list[User]:
    async with async_session() as session:
        result = await session.execute(select(User))
        return list(result.scalars())

async def create_user(name: str) -> User:
    async with async_session() as session:
        async with session.begin():   # auto-commit or rollback
            user = User(name=name)
            session.add(user)
        return user   # expire_on_commit=False keeps attrs accessible
\`\`\`

**Lazy-loading gotcha:** related objects are NOT lazy-loaded in async sessions (no implicit IO). Use \`selectinload\` / \`joinedload\` eagerly:
\`\`\`python
from sqlalchemy.orm import selectinload

stmt = select(User).options(selectinload(User.posts))
result = await session.execute(stmt)
\`\`\`

**Connection lifecycle:** \`async_sessionmaker\` draws a connection from the pool only when needed and returns it on \`__aexit__\` — do not hold sessions open across unrelated requests.`,
      tags: ["asyncio", "sqlalchemy", "database"],
    },
    {
      id: "no-gil-python-313",
      title: "Python 3.13+ no-GIL builds and subinterpreters",
      difficulty: "hard",
      question: "What are Python 3.13's no-GIL experimental builds and PEP 703? What do they change?",
      answer: `**PEP 703 (Making the Global Interpreter Lock Optional)** was accepted in 2023. Python 3.12 shipped the first experimental no-GIL build; Python 3.13 made it the official opt-in path.

**How to check / enable:**
\`\`\`python
import sys
print(sys._is_gil_enabled())   # False in --disable-gil build

# At interpreter startup:
# PYTHON_GIL=0 python myscript.py
# or compile CPython with --disable-gil
\`\`\`

**What changed internally:**
- Reference counting is replaced by **biased reference counting** + immortalisation of frequently-used objects.
- A new **deferred reference counting** scheme avoids lock contention on shared objects.
- The object memory allocator is now **thread-safe per-arena**.
- \`sys.settrace\` and \`sys.setprofile\` still work but have per-thread scope.

**Performance trade-offs (as of 2026):**
| Workload | GIL build | no-GIL build |
|---|---|---|
| Single-threaded Python | baseline | ~5-10 % slower |
| CPU-bound 4-thread | ~1× (serialised) | ~3-3.5× speedup |
| I/O-bound asyncio | no change | no change |
| C extensions (NumPy) | already fast | same |

**Practical advice:**
- For most web services (I/O-bound), no-GIL offers no benefit yet.
- For CPU-heavy pure-Python workloads (ML preprocessing, parsers), no-GIL + threads is now competitive with multiprocessing — without pickling overhead.
- Third-party C extensions must be updated to be thread-safe; check \`PYTHON_GIL=0\` compatibility before adopting.

**Subinterpreters (PEP 554):** each subinterpreter has its own GIL in standard builds, enabling per-interpreter parallelism via the \`interpreters\` module (experimental in 3.13).

\`\`\`python
import _interpreters   # experimental API — subject to change

interp = _interpreters.create()
_interpreters.run_string(interp, "import math; print(math.pi)")
_interpreters.destroy(interp)
\`\`\``,
      tags: ["gil", "no-gil", "python-3.13", "subinterpreters"],
    },
    {
      id: "trio-anyio-alternatives",
      title: "trio and anyio as asyncio alternatives",
      difficulty: "hard",
      question: "What are trio and anyio, and when would you choose them over asyncio?",
      answer: `**trio** is an async library built around the concept of **structured concurrency** — every task has an explicit parent scope, making cancellation and error propagation predictable.

\`\`\`python
import trio

async def fetch(url: str) -> str:
    await trio.sleep(0.1)
    return f"data:{url}"

async def main() -> None:
    results: list[str] = []

    async with trio.open_nursery() as nursery:
        # All tasks in the nursery are children of this scope.
        # The nursery exits only when ALL children finish (or one raises).
        async def collect(url: str) -> None:
            results.append(await fetch(url))

        for url in ["a", "b", "c"]:
            nursery.start_soon(collect, url)

    print(results)

trio.run(main)
\`\`\`

**Why trio's model is safer:**
- No "fire-and-forget" tasks that outlive their logical scope.
- If one task raises, the nursery cancels siblings and propagates the exception.
- No \`CancelledError\` swallowing surprises.

**anyio** — compatibility shim that runs on asyncio *or* trio:
\`\`\`python
import anyio

async def main() -> None:
    async with anyio.create_task_group() as tg:
        tg.start_soon(anyio.sleep, 1)
        tg.start_soon(anyio.sleep, 1)
    # Both finish in ~1 s

anyio.run(main)                    # uses asyncio by default
anyio.run(main, backend="trio")    # switch to trio
\`\`\`

**When to choose:**
| Choice | When |
|---|---|
| **asyncio** | Default; integrates with FastAPI, aiohttp, SQLAlchemy, most libraries |
| **trio** | New greenfield service; want strict structured concurrency guarantees |
| **anyio** | Writing a library that should work on both backends; use task groups everywhere |

**asyncio.TaskGroup (Python 3.11+)** brings structured concurrency to asyncio:
\`\`\`python
async with asyncio.TaskGroup() as tg:
    t1 = tg.create_task(asyncio.sleep(1))
    t2 = tg.create_task(asyncio.sleep(1))
# Both done here; any exception is re-raised
\`\`\``,
      tags: ["trio", "anyio", "structured-concurrency"],
    },
    {
      id: "multiprocessing-pool-vs-executor",
      title: "multiprocessing.Pool vs ProcessPoolExecutor — deep comparison",
      difficulty: "hard",
      question: "What are the trade-offs between multiprocessing.Pool and concurrent.futures.ProcessPoolExecutor?",
      answer: `Both manage a pool of worker processes, but they differ in API philosophy and capability.

| Aspect | \`multiprocessing.Pool\` | \`ProcessPoolExecutor\` |
|---|---|---|
| API style | Older, richer (more methods) | Simpler, Future-based |
| \`map\` variants | \`map\`, \`imap\`, \`imap_unordered\`, \`starmap\`, \`map_async\` | \`map\` (lazy iterator), \`submit\` + \`as_completed\` |
| Callbacks | \`apply_async(callback=...)\` | Future callbacks via \`add_done_callback\` |
| asyncio integration | ❌ | ✅ via \`loop.run_in_executor\` |
| Exception handling | Raised on \`.get()\` | Raised on \`future.result()\` |
| Timeout | Per-result timeout on \`.get()\` | Per-result on \`.result(timeout)\` |
| Initialiser | \`initializer=\`, \`initargs=\` | Same |
| Termination | Must call \`.terminate()\` or use context manager | Context manager always recommended |

\`\`\`python
# Pool — fine-grained streaming with imap_unordered
from multiprocessing import Pool

def process(x: int) -> int:
    return x * x

with Pool(processes=4) as pool:
    # imap_unordered yields results as soon as any worker finishes
    for result in pool.imap_unordered(process, range(100), chunksize=10):
        print(result, end=" ")

# ProcessPoolExecutor — asyncio-friendly
import asyncio
from concurrent.futures import ProcessPoolExecutor

async def main() -> None:
    loop = asyncio.get_running_loop()
    with ProcessPoolExecutor(max_workers=4) as ex:
        futures = [loop.run_in_executor(ex, process, i) for i in range(100)]
        results = await asyncio.gather(*futures)
    print(results)
\`\`\`

**Recommendation in 2026:** prefer \`ProcessPoolExecutor\` for new code — cleaner API, asyncio-compatible. Use \`Pool\` only when you need \`imap_unordered\` with chunking or the \`starmap\` shorthand.

**Chunk size tuning:** for \`map\`/\`imap\`, \`chunksize = max(1, len(items) // (4 * n_workers))\` is a good heuristic to balance IPC overhead against granularity.`,
      tags: ["multiprocessing", "concurrent.futures", "performance"],
    },
    {
      id: "asyncio-event-loop-internals",
      title: "asyncio event loop internals and custom loops",
      difficulty: "hard",
      question: "How does the asyncio event loop work internally, and when would you replace it with uvloop?",
      answer: `**The default asyncio event loop (SelectorEventLoop / ProactorEventLoop):**

1. Maintains a **ready queue** of callbacks to fire immediately.
2. Maintains a **scheduled queue** (min-heap by time) for \`call_later\` / \`call_at\`.
3. Each iteration ("tick"):
   a. Run all ready callbacks.
   b. Compute the timeout = time until next scheduled callback.
   c. Call \`select()\` / \`epoll()\` / \`IOCP\` with that timeout — blocks waiting for I/O.
   d. Enqueue I/O completion callbacks.
   e. Fire expired scheduled callbacks.

\`\`\`python
import asyncio

async def peek_loop() -> None:
    loop = asyncio.get_running_loop()
    print(type(loop))        # <class 'asyncio.SelectorEventLoop'>
    print(loop.time())       # monotonic clock used for scheduling

asyncio.run(peek_loop())
\`\`\`

**uvloop** — Cython-based event loop backed by libuv (the same C library Node.js uses):
\`\`\`python
import asyncio
import uvloop

asyncio.set_event_loop_policy(uvloop.EventLoopPolicy())
# or: uvloop.run(main())  — drop-in for asyncio.run()

asyncio.run(main())
\`\`\`

**Performance lift:** uvloop is typically **2-4× faster** than the default loop for TCP-heavy workloads (benchmarks: ~100 k req/s → ~200-400 k req/s for simple echo servers).

**Custom event loop protocol (advanced):**
\`\`\`python
class MyPolicy(asyncio.DefaultEventLoopPolicy):
    def new_event_loop(self) -> asyncio.AbstractEventLoop:
        loop = super().new_event_loop()
        loop.set_exception_handler(my_exception_handler)
        return loop

asyncio.set_event_loop_policy(MyPolicy())
\`\`\`

**When NOT to replace the loop:**
- If your framework (FastAPI/Starlette via anyio) already installs uvloop — don't double-install.
- When running in environments that monkey-patch the loop (gevent, some test runners).

**Debug mode:** \`asyncio.run(main(), debug=True)\` or \`PYTHONASYNCIODEBUG=1\` logs slow callbacks (> 100 ms) and unawaited coroutines.`,
      tags: ["asyncio", "event-loop", "uvloop", "performance"],
    },
    {
      id: "thread-safety-with-asyncio",
      title: "Thread safety when mixing threads and asyncio",
      difficulty: "hard",
      question: "How do you safely communicate between threads and an asyncio event loop?",
      answer: `asyncio primitives (\`asyncio.Queue\`, \`asyncio.Lock\`) are **NOT thread-safe** — calling them from a non-event-loop thread corrupts internal state.

**Correct patterns:**

**1. \`loop.call_soon_threadsafe\`** — schedule a callback from any thread:
\`\`\`python
import asyncio
import threading

def background_thread(loop: asyncio.AbstractEventLoop, queue: asyncio.Queue[int]) -> None:
    for i in range(5):
        # Thread-safe: schedules put() as a coroutine on the loop
        asyncio.run_coroutine_threadsafe(queue.put(i), loop)
    asyncio.run_coroutine_threadsafe(queue.put(None), loop)

async def main() -> None:
    loop = asyncio.get_running_loop()
    queue: asyncio.Queue[int | None] = asyncio.Queue()

    t = threading.Thread(target=background_thread, args=(loop, queue))
    t.start()

    while (item := await queue.get()) is not None:
        print(f"got {item}")

    t.join()

asyncio.run(main())
\`\`\`

**2. \`asyncio.run_coroutine_threadsafe\`** — submit a coroutine from a thread, returns a \`concurrent.futures.Future\`:
\`\`\`python
future = asyncio.run_coroutine_threadsafe(some_coro(), loop)
result = future.result(timeout=5)   # blocks the calling thread
\`\`\`

**3. \`loop.call_soon_threadsafe(callback)\`** — for non-coroutine callbacks:
\`\`\`python
loop.call_soon_threadsafe(loop.stop)   # stop the loop from another thread
\`\`\`

**4. \`janus\` library** — a Queue that is safe from *both* sync and async code:
\`\`\`python
import janus
q: janus.Queue[int] = janus.Queue()
q.sync_q.put(1)         # from thread
await q.async_q.get()   # from coroutine
\`\`\`

**Anti-pattern:** sharing a plain \`asyncio.Queue\` and calling \`queue.put_nowait()\` from a thread — this is technically unsafe; use \`call_soon_threadsafe(queue.put_nowait, item)\` instead.`,
      tags: ["asyncio", "threading", "thread-safety"],
    },
    {
      id: "asyncio-exception-handling-patterns",
      title: "Exception handling in concurrent asyncio tasks",
      difficulty: "hard",
      question: "How do you handle exceptions correctly when running many concurrent asyncio tasks?",
      answer: `**gather with return_exceptions:**
\`\`\`python
import asyncio

async def risky(i: int) -> int:
    if i == 2:
        raise ValueError(f"bad index {i}")
    return i * 10

async def main() -> None:
    results = await asyncio.gather(
        *(risky(i) for i in range(5)),
        return_exceptions=True,   # exceptions become values, not propagated
    )
    for r in results:
        if isinstance(r, BaseException):
            print(f"Error: {r}")
        else:
            print(f"OK: {r}")

asyncio.run(main())
\`\`\`

**TaskGroup (Python 3.11+) — structured, strict:**
\`\`\`python
async def main() -> None:
    try:
        async with asyncio.TaskGroup() as tg:
            tasks = [tg.create_task(risky(i)) for i in range(5)]
    except* ValueError as eg:         # ExceptionGroup — note "except*"
        for exc in eg.exceptions:
            print(f"caught: {exc}")
\`\`\`
\`TaskGroup\` cancels all sibling tasks on first exception and raises an \`ExceptionGroup\` collecting all errors that occurred.

**Unhandled task exceptions:**
\`\`\`python
def handle_exception(loop: asyncio.AbstractEventLoop, ctx: dict) -> None:
    exc = ctx.get("exception", ctx["message"])
    print(f"Unhandled: {exc}")
    loop.default_exception_handler(ctx)

async def main() -> None:
    loop = asyncio.get_running_loop()
    loop.set_exception_handler(handle_exception)
    # Tasks that raise without being awaited would otherwise print a warning
    asyncio.create_task(risky(2))
    await asyncio.sleep(0.1)
\`\`\`

**Best practices:**
- Always \`await\` or \`gather\` every task you create.
- Prefer \`TaskGroup\` for fan-out — it ensures cleanup.
- Use \`return_exceptions=True\` in \`gather\` when partial results are acceptable.
- Set a loop-level exception handler to catch any escaped exceptions in production.`,
      tags: ["asyncio", "exception-handling", "task-group"],
    },
  ],
};
