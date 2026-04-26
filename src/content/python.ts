import type { Category } from "./types";

export const python: Category = {
  slug: "python",
  title: "Python",
  description:
    "Core Python from the ground up: types, data structures, functions, OOP, generators, decorators, type hints, and modern language features through Python 3.12+.",
  icon: "🐍",
  questions: [
    // ───── EASY ─────
    {
      id: "py-mutable-vs-immutable",
      title: "Mutable vs immutable types",
      difficulty: "easy",
      question: "What is the difference between mutable and immutable types in Python? Give examples of each.",
      answer: `**Immutable** objects cannot be changed after creation. Attempting to change them creates a new object.
**Mutable** objects can be modified in place.

| Type | Mutable? |
|------|----------|
| \`int\`, \`float\`, \`complex\` | Immutable |
| \`str\` | Immutable |
| \`bytes\` | Immutable |
| \`tuple\` | Immutable |
| \`frozenset\` | Immutable |
| \`list\` | **Mutable** |
| \`dict\` | **Mutable** |
| \`set\` | **Mutable** |
| \`bytearray\` | **Mutable** |

\`\`\`python
# Immutable — reassignment creates a new object
s = "hello"
id_before = id(s)
s += " world"
print(id(s) == id_before)  # False — new string object

# Mutable — mutation happens in place
lst = [1, 2, 3]
id_before = id(lst)
lst.append(4)
print(id(lst) == id_before)  # True — same object
\`\`\`

**Why it matters:**
- Only hashable (immutable) types can be dict keys or set members.
- Using a mutable default argument is a classic bug (see: default argument trap).
- Immutability makes objects safe to use as dictionary keys and in multithreaded contexts.`,
      tags: ["fundamentals", "types"],
    },
    {
      id: "py-list-dict-set-tuple",
      title: "list, dict, set, and tuple",
      difficulty: "easy",
      question: "Describe Python's four main built-in collection types and when to use each.",
      answer: `| Type | Ordered | Mutable | Duplicates | Syntax |
|------|---------|---------|------------|--------|
| \`list\` | Yes | Yes | Yes | \`[1, 2]\` |
| \`tuple\` | Yes | No | Yes | \`(1, 2)\` |
| \`dict\` | Yes (insertion order, 3.7+) | Yes | Keys: No, Values: Yes | \`{"a": 1}\` |
| \`set\` | No | Yes | No | \`{1, 2}\` |

\`\`\`python
# list — general-purpose ordered sequence
nums = [3, 1, 2]
nums.sort()                  # [1, 2, 3]

# tuple — lightweight immutable record; unpacking
point = (10, 20)
x, y = point

# dict — key→value mapping (O(1) lookup)
user = {"name": "Alice", "age": 30}
user.get("missing", "default")

# set — membership tests, deduplication, set algebra
tags = {"python", "async", "python"}  # {"python", "async"}
tags & {"async", "js"}               # {"async"}
\`\`\`

**Rule of thumb:**
- Use \`list\` when order matters and you need mutation.
- Use \`tuple\` for fixed records (coordinates, RGB).
- Use \`dict\` for labeled data / fast lookup.
- Use \`set\` when uniqueness or O(1) membership test matters.`,
      tags: ["fundamentals", "data-structures"],
    },
    {
      id: "py-comprehensions",
      title: "List, dict, and set comprehensions",
      difficulty: "easy",
      question: "How do Python comprehensions work? Show list, dict, and set examples including filtering.",
      answer: `Comprehensions provide a concise, Pythonic way to build collections from iterables.

**List comprehension**
\`\`\`python
squares = [x**2 for x in range(10) if x % 2 == 0]
# [0, 4, 16, 36, 64]
\`\`\`

**Dict comprehension**
\`\`\`python
word_lengths = {word: len(word) for word in ["hello", "world"]}
# {"hello": 5, "world": 5}
\`\`\`

**Set comprehension**
\`\`\`python
unique_mods = {x % 3 for x in range(10)}
# {0, 1, 2}
\`\`\`

**Generator expression** (lazy, no brackets)
\`\`\`python
total = sum(x**2 for x in range(1_000_000))  # no list built in memory
\`\`\`

**Nested comprehension**
\`\`\`python
flat = [n for row in [[1,2],[3,4]] for n in row]
# [1, 2, 3, 4]
\`\`\`

Comprehensions are generally faster than equivalent \`for\` loops with \`.append()\` because the loop runs at C speed internally. Keep them readable — if the logic is complex, prefer a regular loop.`,
      tags: ["fundamentals", "comprehensions"],
    },
    {
      id: "py-args-kwargs",
      title: "*args and **kwargs",
      difficulty: "easy",
      question: "What are *args and **kwargs? How do positional-only and keyword-only parameters work?",
      answer: `\`*args\` collects extra positional arguments into a tuple; \`**kwargs\` collects extra keyword arguments into a dict.

\`\`\`python
def show(*args, **kwargs):
    print(args)    # tuple
    print(kwargs)  # dict

show(1, 2, a=3, b=4)
# (1, 2)
# {'a': 3, 'b': 4}
\`\`\`

**Full parameter order:**
\`\`\`python
def f(pos_only, /, normal, *, kw_only):
    ...
\`\`\`

- Parameters before \`/\` are **positional-only** (cannot be passed by name).
- Parameters after \`*\` or \`*args\` are **keyword-only**.

\`\`\`python
def greet(name, /, greeting="Hi", *, punctuation="!"):
    return f"{greeting}, {name}{punctuation}"

greet("Alice")                     # "Hi, Alice!"
greet("Alice", greeting="Hello")   # "Hello, Alice!"
greet("Alice", punctuation=".")    # "Hi, Alice."
# greet(name="Alice")              # TypeError — name is positional-only
\`\`\`

**Unpacking at call site:**
\`\`\`python
args = (1, 2)
kwargs = {"c": 3}
f(*args, **kwargs)   # equivalent to f(1, 2, c=3)
\`\`\``,
      tags: ["functions", "fundamentals"],
    },
    {
      id: "py-lambda",
      title: "Lambda functions",
      difficulty: "easy",
      question: "What is a lambda in Python and when should (and shouldn't) you use one?",
      answer: `A **lambda** is an anonymous function defined with a single expression. It cannot contain statements or annotations.

\`\`\`python
double = lambda x: x * 2
double(5)  # 10

# Common use: as a key function
pairs = [(1, "b"), (2, "a"), (3, "c")]
pairs.sort(key=lambda pair: pair[1])
# [(2, 'a'), (1, 'b'), (3, 'c')]
\`\`\`

**When to use:**
- Short, one-off callbacks (\`sorted\`, \`map\`, \`filter\`, \`min\`/\`max\` key).
- When defining a named function would be needlessly verbose.

**When NOT to use:**
- Logic that spans more than one expression — write a named \`def\`.
- Assigning a lambda to a variable and reusing it — just use \`def\` (better tracebacks, docstrings).

\`\`\`python
# Prefer this:
def square(x):
    return x ** 2

# Over this:
square = lambda x: x ** 2  # PEP 8 discourages it
\`\`\``,
      tags: ["functions", "fundamentals"],
    },
    {
      id: "py-fstrings",
      title: "f-strings and string formatting",
      difficulty: "easy",
      question: "What are f-strings and what formatting features do they support in Python 3.12+?",
      answer: `**f-strings** (formatted string literals, PEP 498) embed expressions directly in strings, evaluated at runtime.

\`\`\`python
name = "Alice"
age  = 30
print(f"Hello, {name}! You are {age} years old.")
\`\`\`

**Format spec after \`:\`**
\`\`\`python
pi = 3.14159
f"{pi:.2f}"          # "3.14"
f"{1_000_000:,}"     # "1,000,000"
f"{42:#010x}"        # "0x0000002a"
f"{'left':<10}"      # "left      "
f"{'right':>10}"     # "     right"
f"{'center':^10}"    # "  center  "
\`\`\`

**Debug shorthand \`=\` (3.8+)**
\`\`\`python
x = 42
f"{x = }"   # "x = 42"
\`\`\`

**Nested expressions and calls (3.12+ loosened restrictions)**
\`\`\`python
# Python 3.12 allows any valid expression inside {}
data = [3, 1, 2]
f"Sorted: {sorted(data)}"
f"{'yes' if x > 0 else 'no'}"
f"Result: {(lambda v: v**2)(x)}"  # lambdas now allowed
\`\`\`

**Multi-line f-strings**
\`\`\`python
msg = (
    f"Name:  {name}\n"
    f"Age:   {age}\n"
)
\`\`\`

f-strings are the fastest Python string formatting mechanism — faster than \`%\` formatting and \`str.format()\`.`,
      tags: ["fundamentals", "strings"],
    },
    {
      id: "py-error-handling-basics",
      title: "try / except / else / finally",
      difficulty: "easy",
      question: "Explain all four clauses of a Python try block and when each runs.",
      answer: `\`\`\`python
try:
    result = 10 / int(input("Divisor: "))
except ZeroDivisionError:
    print("Cannot divide by zero")
except ValueError as e:
    print(f"Bad input: {e}")
else:
    print(f"Result: {result}")   # runs only if NO exception was raised
finally:
    print("Done")                # always runs
\`\`\`

| Clause | When it runs |
|--------|-------------|
| \`try\` | Always — this is the guarded block |
| \`except\` | Only when a matching exception is raised in \`try\` |
| \`else\` | Only when \`try\` completed **without** an exception |
| \`finally\` | **Always**, even after \`return\` or unhandled exception |

**Multiple exceptions in one clause:**
\`\`\`python
except (TypeError, ValueError) as e:
    ...
\`\`\`

**Re-raise:**
\`\`\`python
except Exception:
    log_error()
    raise   # re-raises the current exception
\`\`\`

Use \`else\` instead of putting success code at the end of \`try\` — it makes clear that code only runs when no error occurred.`,
      tags: ["error-handling", "fundamentals"],
    },

    // ───── MEDIUM ─────
    {
      id: "py-closures",
      title: "Closures and the LEGB rule",
      difficulty: "medium",
      question: "How do closures work in Python? Explain the LEGB scope rule and the nonlocal keyword.",
      answer: `A **closure** is a function that retains references to free variables from its enclosing scope, even after that scope has finished executing.

**LEGB lookup order:**
1. **L**ocal — inside the current function
2. **E**nclosing — enclosing function scopes (inner → outer)
3. **G**lobal — module level
4. **B**uilt-in — Python builtins (\`len\`, \`range\`, …)

\`\`\`python
def make_counter(start=0):
    count = start               # enclosing variable

    def increment(step=1):
        nonlocal count          # declare intent to mutate enclosing var
        count += step
        return count

    return increment

counter = make_counter(10)
counter()    # 11
counter(5)   # 16
\`\`\`

**Without \`nonlocal\`** Python treats \`count += step\` as creating a *local* variable, causing an \`UnboundLocalError\`.

**Common gotcha — late binding:**
\`\`\`python
funcs = [lambda: i for i in range(3)]
[f() for f in funcs]   # [2, 2, 2] — all capture the same \`i\`

# Fix: bind at definition time
funcs = [lambda i=i: i for i in range(3)]
[f() for f in funcs]   # [0, 1, 2]
\`\`\`

Closures power decorators, factory functions, and callback-heavy async code.`,
      tags: ["functions", "scope", "closures"],
    },
    {
      id: "py-decorators",
      title: "Decorators",
      difficulty: "medium",
      question: "How do Python decorators work? Write a decorator that logs call time and preserves the wrapped function's metadata.",
      answer: `A decorator is a callable that takes a function and returns a replacement. The \`@\` syntax is sugar for \`f = decorator(f)\`.

\`\`\`python
import time
import functools

def timed(func):
    @functools.wraps(func)          # preserves __name__, __doc__, etc.
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"{func.__name__} took {elapsed:.4f}s")
        return result
    return wrapper

@timed
def slow_sum(n):
    """Sum 0..n."""
    return sum(range(n))

slow_sum(10_000_000)
# slow_sum took 0.1823s
print(slow_sum.__name__)   # "slow_sum" — not "wrapper"
\`\`\`

**Decorator with arguments** — requires an extra factory layer:
\`\`\`python
def retry(times=3):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(times):
                try:
                    return func(*args, **kwargs)
                except Exception:
                    if attempt == times - 1:
                        raise
        return wrapper
    return decorator

@retry(times=5)
def flaky_request(): ...
\`\`\`

**Stacking decorators** — applied bottom-up:
\`\`\`python
@timed
@retry(3)
def fetch(): ...
# equivalent to: fetch = timed(retry(3)(fetch))
\`\`\`

Always use \`@functools.wraps\` to avoid hiding the original function's identity in introspection and stack traces.`,
      tags: ["functions", "decorators", "meta-programming"],
    },
    {
      id: "py-generators",
      title: "Generators and iterators",
      difficulty: "medium",
      question: "Explain the iterator protocol, how generators implement it, and what yield, yield from, and send() do.",
      answer: `**Iterator protocol:** an object implements \`__iter__()\` (returns self) and \`__next__()\` (returns next value or raises \`StopIteration\`).

**Generator function** — any function containing \`yield\` returns a generator object that implements the protocol lazily:

\`\`\`python
def countdown(n):
    while n > 0:
        yield n
        n -= 1

for x in countdown(3):
    print(x)   # 3, 2, 1
\`\`\`

**\`yield from\`** — delegates to a sub-iterable, forwarding values and exceptions:
\`\`\`python
def chain(*iterables):
    for it in iterables:
        yield from it

list(chain([1, 2], [3, 4]))  # [1, 2, 3, 4]
\`\`\`

**\`send()\`** — resumes the generator and injects a value as the result of the \`yield\` expression:
\`\`\`python
def accumulator():
    total = 0
    while True:
        value = yield total   # yield sends total out; receives next value
        if value is None:
            break
        total += value

gen = accumulator()
next(gen)       # prime the generator → 0
gen.send(10)    # → 10
gen.send(20)    # → 30
\`\`\`

**Generator expressions** are the lazy equivalent of list comprehensions:
\`\`\`python
# reads the file one line at a time, no full load into memory
long_lines = (line for line in open("big.log") if len(line) > 100)
\`\`\`

Generators shine for large data pipelines, infinite sequences, and cooperative coroutines.`,
      tags: ["generators", "iterators", "fundamentals"],
    },
    {
      id: "py-context-managers",
      title: "Context managers",
      difficulty: "medium",
      question: "How do context managers work? Implement one using a class and one using contextlib.contextmanager.",
      answer: `Context managers implement the **context manager protocol**: \`__enter__\` (setup, returns value bound to \`as\`) and \`__exit__\` (teardown, receives exception info).

**Class-based:**
\`\`\`python
class ManagedFile:
    def __init__(self, path, mode="r"):
        self.path, self.mode = path, mode

    def __enter__(self):
        self.file = open(self.path, self.mode)
        return self.file            # → bound to \`as f\`

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.file.close()
        return False                # False → don't suppress exceptions

with ManagedFile("data.txt") as f:
    content = f.read()
\`\`\`

**Generator-based with \`contextlib.contextmanager\`:**
\`\`\`python
from contextlib import contextmanager

@contextmanager
def timer(label: str):
    import time
    start = time.perf_counter()
    try:
        yield                        # body of \`with\` block runs here
    finally:
        elapsed = time.perf_counter() - start
        print(f"{label}: {elapsed:.4f}s")

with timer("computation"):
    total = sum(range(10_000_000))
\`\`\`

**\`__exit__\` return value:**
- Return \`True\` (or truthy) to **suppress** the exception.
- Return \`False\`/\`None\` to let it propagate.

**Useful stdlib context managers:**
- \`contextlib.suppress(*exceptions)\` — silently swallow specific errors.
- \`contextlib.ExitStack\` — compose a dynamic number of context managers.
- \`contextlib.asynccontextmanager\` — async version.`,
      tags: ["context-managers", "fundamentals"],
    },
    {
      id: "py-oop-dunder",
      title: "OOP and dunder methods",
      difficulty: "medium",
      question: "Explain Python's data model. What are dunder methods and how do __repr__, __str__, __eq__, and __hash__ behave?",
      answer: `**Dunder (double-underscore) methods** hook into Python's built-in operations, making custom objects behave like built-ins.

\`\`\`python
class Vector:
    def __init__(self, x: float, y: float) -> None:
        self.x, self.y = x, y

    def __repr__(self) -> str:
        # unambiguous; used by repr() and in the REPL
        return f"Vector({self.x!r}, {self.y!r})"

    def __str__(self) -> str:
        # human-friendly; used by str() and print()
        return f"({self.x}, {self.y})"

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Vector):
            return NotImplemented
        return self.x == other.x and self.y == other.y

    def __hash__(self) -> int:
        return hash((self.x, self.y))

    def __add__(self, other: "Vector") -> "Vector":
        return Vector(self.x + other.x, self.y + other.y)

    def __abs__(self) -> float:
        return (self.x**2 + self.y**2) ** 0.5

    def __bool__(self) -> bool:
        return bool(self.x or self.y)

    def __len__(self) -> int:   # enables len(v)
        return 2
\`\`\`

| Method | Hook |
|--------|------|
| \`__repr__\` | \`repr(obj)\`, REPL display |
| \`__str__\` | \`str(obj)\`, \`print()\` |
| \`__eq__\` | \`==\` |
| \`__hash__\` | \`hash()\`, dict keys, set members |
| \`__add__\`, \`__mul__\` | \`+\`, \`*\` |
| \`__len__\` | \`len()\` |
| \`__contains__\` | \`in\` operator |
| \`__getitem__\` | \`obj[key]\` |
| \`__iter__\` | \`for x in obj\` |
| \`__call__\` | \`obj(...)\` |

**Rule:** if you define \`__eq__\`, Python sets \`__hash__\` to \`None\` (making the object unhashable) unless you also define \`__hash__\`.`,
      tags: ["oop", "dunder", "data-model"],
    },
    {
      id: "py-property-classmethod-staticmethod",
      title: "@property, @classmethod, @staticmethod",
      difficulty: "medium",
      question: "What are the differences between @property, @classmethod, and @staticmethod?",
      answer: `\`\`\`python
class Temperature:
    def __init__(self, celsius: float) -> None:
        self._celsius = celsius

    # @property — computed attribute; getter/setter/deleter
    @property
    def celsius(self) -> float:
        return self._celsius

    @celsius.setter
    def celsius(self, value: float) -> None:
        if value < -273.15:
            raise ValueError("Below absolute zero")
        self._celsius = value

    @property
    def fahrenheit(self) -> float:
        return self._celsius * 9 / 5 + 32

    # @classmethod — receives the class (cls) not instance; factory pattern
    @classmethod
    def from_fahrenheit(cls, f: float) -> "Temperature":
        return cls((f - 32) * 5 / 9)

    # @staticmethod — no implicit first arg; utility function in class namespace
    @staticmethod
    def is_valid(celsius: float) -> bool:
        return celsius >= -273.15
\`\`\`

| Decorator | First param | Access | Typical use |
|-----------|-------------|--------|-------------|
| \`@property\` | \`self\` (instance) | \`obj.attr\` | Computed attributes, validation |
| \`@classmethod\` | \`cls\` (class) | \`Cls.method()\` or \`obj.method()\` | Alternative constructors |
| \`@staticmethod\` | None | \`Cls.method()\` or \`obj.method()\` | Utility/helper that doesn't need self or cls |

\`\`\`python
t = Temperature(100)
t.fahrenheit            # 212.0 — property
t.celsius = 200         # setter called
Temperature.from_fahrenheit(212)     # classmethod
Temperature.is_valid(-300)           # staticmethod → False
\`\`\``,
      tags: ["oop", "descriptors"],
    },
    {
      id: "py-inheritance-mro",
      title: "Inheritance and MRO (C3 linearization)",
      difficulty: "medium",
      question: "How does Python resolve method lookup in multiple inheritance? Explain the C3 linearization algorithm and super().",
      answer: `Python uses **C3 linearization** to compute the **Method Resolution Order (MRO)** — the order in which base classes are searched during attribute lookup.

\`\`\`python
class A:
    def who(self): return "A"

class B(A):
    def who(self): return "B"

class C(A):
    def who(self): return "C"

class D(B, C):
    pass

print(D.__mro__)
# (<class 'D'>, <class 'B'>, <class 'C'>, <class 'A'>, <class 'object'>)
D().who()   # "B"
\`\`\`

**C3 rule (simplified):** depth-first, left-to-right, but a class never appears before its subclass.

\`\`\`python
class D(B, C):
    def who(self):
        return f"D → {super().who()}"   # follows MRO: next is B
\`\`\`

**\`super()\`** does NOT mean "call the parent class" — it means "call the next class in the MRO". This is critical for cooperative multiple inheritance:

\`\`\`python
class B(A):
    def who(self):
        return f"B → {super().who()}"   # next in D's MRO is C, not A

class C(A):
    def who(self):
        return f"C → {super().who()}"   # next is A

class D(B, C):
    def who(self):
        return f"D → {super().who()}"

D().who()   # "D → B → C → A"
\`\`\`

Inspect the MRO with \`ClassName.__mro__\` or \`ClassName.mro()\`. Python raises \`TypeError\` if a consistent MRO cannot be computed (linearization failure).`,
      tags: ["oop", "inheritance", "mro"],
    },
    {
      id: "py-dataclasses",
      title: "Dataclasses",
      difficulty: "medium",
      question: "What do Python dataclasses provide and how do field(), __post_init__, and frozen=True work?",
      answer: `\`@dataclass\` (PEP 557) auto-generates boilerplate (\`__init__\`, \`__repr__\`, \`__eq__\`) from annotated class-level fields.

\`\`\`python
from dataclasses import dataclass, field
from typing import ClassVar

@dataclass(order=True, frozen=True)
class Point:
    x: float
    y: float = 0.0

p1 = Point(1.0, 2.0)
p2 = Point(1.0, 2.0)
p1 == p2   # True
p1 < Point(2.0)  # True (order=True generates __lt__ etc.)
# p1.x = 3     # FrozenInstanceError (frozen=True)
hash(p1)     # hashable because frozen
\`\`\`

**\`field()\`** for advanced configuration:
\`\`\`python
@dataclass
class Inventory:
    name: str
    tags: list[str] = field(default_factory=list)  # mutable default
    _cache: dict = field(default_factory=dict, repr=False, compare=False)
    MAX_ITEMS: ClassVar[int] = 100                  # not a field
\`\`\`

**\`__post_init__\`** — runs after the generated \`__init__\`:
\`\`\`python
@dataclass
class Circle:
    radius: float

    def __post_init__(self):
        if self.radius <= 0:
            raise ValueError("radius must be positive")
        self.area = 3.14159 * self.radius ** 2
\`\`\`

**Key \`@dataclass\` flags:**

| Flag | Effect |
|------|--------|
| \`eq=True\` (default) | generate \`__eq__\` |
| \`order=True\` | generate \`__lt__\`, \`__le__\` etc. |
| \`frozen=True\` | immutable + hashable |
| \`slots=True\` (3.10+) | use \`__slots__\` for memory efficiency |
| \`kw_only=True\` (3.10+) | all fields keyword-only |`,
      tags: ["oop", "dataclasses"],
    },
    {
      id: "py-type-hints",
      title: "Type hints and the typing module",
      difficulty: "medium",
      question: "How do Python type hints work? Explain TypeVar, Generic, Protocol, and Annotated.",
      answer: `Python type hints are **annotations only** — the interpreter ignores them at runtime (unless you use \`from __future__ import annotations\` or introspect \`__annotations__\`). Type checkers like mypy/pyright enforce them statically.

**Built-in generics (3.9+):**
\`\`\`python
def first(items: list[int]) -> int | None:
    return items[0] if items else None
\`\`\`

**TypeVar — generic functions:**
\`\`\`python
from typing import TypeVar
T = TypeVar("T")

def identity(x: T) -> T:
    return x
\`\`\`

**Generic classes:**
\`\`\`python
from typing import Generic

class Stack(Generic[T]):
    def __init__(self) -> None:
        self._items: list[T] = []

    def push(self, item: T) -> None:
        self._items.append(item)

    def pop(self) -> T:
        return self._items.pop()
\`\`\`

**Protocol — structural subtyping (duck typing with types):**
\`\`\`python
from typing import Protocol

class Drawable(Protocol):
    def draw(self) -> None: ...

class Circle:               # no explicit inheritance needed
    def draw(self) -> None:
        print("O")

def render(shape: Drawable) -> None:
    shape.draw()

render(Circle())    # type-checks ✓
\`\`\`

**Annotated — attach metadata to a type:**
\`\`\`python
from typing import Annotated

Positive = Annotated[float, "must be > 0"]

def area(radius: Positive) -> float: ...
\`\`\`

**New in 3.12 — \`type\` statement for type aliases:**
\`\`\`python
type Vector2D = tuple[float, float]
type Matrix[T] = list[list[T]]    # generic alias
\`\`\``,
      tags: ["type-hints", "typing"],
    },
    {
      id: "py-walrus-operator",
      title: "Walrus operator (:=)",
      difficulty: "medium",
      question: "What is the walrus operator and what problems does it solve?",
      answer: `The **walrus operator** \`:=\` (PEP 572, Python 3.8+) is the **assignment expression** — it assigns a value to a variable *and* returns that value, allowing assignment inside expressions where \`=\` is not allowed.

**Reading from a stream while loop:**
\`\`\`python
import io
buf = io.BytesIO(b"hello world")

while chunk := buf.read(4):
    process(chunk)
# Without walrus:
while True:
    chunk = buf.read(4)
    if not chunk:
        break
    process(chunk)
\`\`\`

**Comprehension with a shared intermediate result:**
\`\`\`python
results = [
    cleaned
    for raw in data
    if (cleaned := raw.strip()) != ""
]
\`\`\`

**Re-using a regex match:**
\`\`\`python
import re
if m := re.search(r"(\d+)", text):
    print(m.group(1))
\`\`\`

**Scope:** variables assigned by \`:=\` inside a comprehension leak into the enclosing function scope (unlike the comprehension's loop variable). This is intentional.

Use the walrus operator when it eliminates a redundant assignment and makes intent clearer. Avoid it when it obfuscates logic — readability comes first.`,
      tags: ["fundamentals", "expressions"],
    },

    // ───── HARD ─────
    {
      id: "py-generators-advanced",
      title: "Generator-based coroutines and throw/close",
      difficulty: "hard",
      question: "Explain the full generator protocol: send(), throw(), close(), and how generators underpin async/await.",
      answer: `Beyond \`next()\`, generators expose three more methods that make them full coroutines:

| Method | Effect |
|--------|--------|
| \`gen.send(value)\` | Resume; inject *value* as result of \`yield\` |
| \`gen.throw(exc)\` | Resume by raising *exc* at the \`yield\` point |
| \`gen.close()\` | Inject \`GeneratorExit\`; triggers cleanup in \`finally\` |

\`\`\`python
def managed():
    print("start")
    try:
        value = yield "ready"
        print(f"received: {value}")
        yield "done"
    except ValueError as e:
        print(f"caught: {e}")
        yield "error-handled"
    finally:
        print("cleanup")   # called on close()

g = managed()
print(next(g))          # "start" → "ready"
print(g.send("hello"))  # "received: hello" → "done"

g2 = managed()
next(g2)
print(g2.throw(ValueError("oops")))  # "caught: oops" → "error-handled"
g2.close()              # "cleanup"
\`\`\`

**How \`async/await\` is built on this:**
\`\`\`python
# CPython's event loop essentially does:
coro = my_async_function()
try:
    future = coro.send(None)       # run until first await
    future.add_done_callback(lambda f: coro.send(f.result()))
except StopIteration as e:
    result = e.value               # coroutine returned
\`\`\`

\`async def\` functions are **coroutines** (\`types.CoroutineType\`), which implement the same send/throw/close protocol as generators but also expose \`__await__\`. \`await expr\` is syntactic sugar for \`yield from expr.__await__()\`.

**\`return\` in a generator** sets \`StopIteration.value\`, which \`yield from\` propagates as its expression result — the mechanism by which sub-coroutines return values.`,
      tags: ["generators", "async", "coroutines"],
    },
    {
      id: "py-descriptors",
      title: "Descriptors",
      difficulty: "hard",
      question: "What are Python descriptors? Explain the descriptor protocol and how @property is implemented with it.",
      answer: `A **descriptor** is any object that defines at least one of \`__get__\`, \`__set__\`, or \`__delete__\`. When an attribute is a descriptor defined on a *class*, Python calls these methods instead of performing normal attribute lookup.

**Data descriptor** — defines \`__set__\` (and/or \`__delete__\`); takes priority over instance \`__dict__\`.
**Non-data descriptor** — only \`__get__\`; instance \`__dict__\` takes priority.

\`\`\`python
class Validated:
    """Descriptor that enforces a type."""

    def __set_name__(self, owner, name):
        self.name = name
        self.private = f"_{name}"

    def __get__(self, obj, objtype=None):
        if obj is None:
            return self          # class access returns descriptor itself
        return getattr(obj, self.private, None)

    def __set__(self, obj, value):
        if not isinstance(value, (int, float)):
            raise TypeError(f"{self.name} must be numeric, got {type(value)}")
        setattr(obj, self.private, value)

class Circle:
    radius = Validated()
    area   = Validated()

c = Circle()
c.radius = 5.0    # __set__ called
c.radius          # __get__ called → 5.0
c.radius = "big"  # TypeError
\`\`\`

**\`property\` is a built-in descriptor:**
\`\`\`python
# property is roughly equivalent to:
class property:
    def __init__(self, fget=None, fset=None, fdel=None):
        self.fget, self.fset, self.fdel = fget, fset, fdel

    def __get__(self, obj, objtype=None):
        if obj is None: return self
        return self.fget(obj)

    def __set__(self, obj, value):
        self.fset(obj, value)
\`\`\`

Descriptors power \`@property\`, \`@classmethod\`, \`@staticmethod\`, \`functools.cached_property\`, and ORMs like SQLAlchemy.`,
      tags: ["oop", "descriptors", "meta-programming"],
    },
    {
      id: "py-abc-protocols",
      title: "ABCs and Protocols",
      difficulty: "hard",
      question: "What is the difference between ABCs (abstract base classes) and Protocols? When should you use each?",
      answer: `Both enforce interfaces, but through different mechanisms:

**ABC (abstract base class)** — *nominal* typing. Subclasses must explicitly inherit and implement abstract methods; checked at instantiation time.

\`\`\`python
from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self) -> float: ...

    @abstractmethod
    def perimeter(self) -> float: ...

    def describe(self) -> str:        # concrete method, inherited
        return f"area={self.area():.2f}"

class Circle(Shape):
    def __init__(self, r: float): self.r = r
    def area(self)      -> float: return 3.14159 * self.r ** 2
    def perimeter(self) -> float: return 2 * 3.14159 * self.r

# Shape()   → TypeError: Can't instantiate abstract class
\`\`\`

ABCs can also use \`register()\` for virtual subclassing — without inheritance:
\`\`\`python
from collections.abc import Sequence
Sequence.register(MyCustomList)
isinstance(MyCustomList(), Sequence)   # True
\`\`\`

**Protocol** — *structural* (duck) typing. No inheritance needed; checked statically by type checkers (mypy/pyright), not at runtime (unless \`@runtime_checkable\`).

\`\`\`python
from typing import Protocol, runtime_checkable

@runtime_checkable
class Drawable(Protocol):
    def draw(self) -> None: ...
    def resize(self, factor: float) -> None: ...

class Sprite:                   # no inheritance of Drawable
    def draw(self) -> None: print("drawing")
    def resize(self, factor: float) -> None: print(f"resize {factor}")

def render(obj: Drawable) -> None:
    obj.draw()

render(Sprite())                # type-checks ✓
isinstance(Sprite(), Drawable)  # True (runtime_checkable)
\`\`\`

| | ABC | Protocol |
|--|-----|---------|
| Subtyping | Nominal (explicit) | Structural (duck) |
| Runtime check | \`isinstance\` always | \`isinstance\` only with \`@runtime_checkable\` |
| Enforcement | At instantiation | By static type checker |
| Best for | Shared implementation, class hierarchies | Third-party types, duck typing |`,
      tags: ["oop", "abc", "protocols", "type-hints"],
    },
    {
      id: "py-memory-model",
      title: "Python memory model: reference counting and GC",
      difficulty: "hard",
      question: "How does Python manage memory? Explain reference counting, the cyclic garbage collector, __slots__, and weak references.",
      answer: `**Reference counting (CPython):**
Every object tracks how many references point to it (\`sys.getrefcount\`). When the count reaches zero the object is immediately deallocated.

\`\`\`python
import sys
x = []
sys.getrefcount(x)   # 2 (x + getrefcount arg)
y = x
sys.getrefcount(x)   # 3
del y
sys.getrefcount(x)   # 2
\`\`\`

**Cyclic garbage collector:**
Reference counting cannot handle reference cycles. CPython's \`gc\` module runs a generational collector (three generations) to detect and collect cycles.

\`\`\`python
import gc
class Node:
    def __init__(self): self.ref = None

a = Node(); b = Node()
a.ref = b; b.ref = a   # cycle
del a, b               # refcounts > 0, not freed yet
gc.collect()           # cycle detected and freed
\`\`\`

**\`__slots__\`** — replace the per-instance \`__dict__\` with a fixed-layout C struct, saving memory and speeding up attribute access:

\`\`\`python
class Point:
    __slots__ = ("x", "y")
    def __init__(self, x, y): self.x, self.y = x, y

# No __dict__, no dynamic attributes
p = Point(1, 2)
# p.z = 3   → AttributeError
\`\`\`

Memory saving: ~200 bytes per instance (no dict overhead). Critical for classes instantiated millions of times.

**Weak references** — reference that doesn't increment the refcount; useful for caches:

\`\`\`python
import weakref

class Expensive: ...

obj = Expensive()
ref = weakref.ref(obj)
ref()          # <__main__.Expensive object>
del obj
ref()          # None — object was freed
\`\`\`

\`weakref.WeakValueDictionary\` is the standard pattern for object caches that don't prevent GC.`,
      tags: ["memory", "internals", "slots"],
    },
    {
      id: "py-structural-pattern-matching",
      title: "Structural pattern matching (match / case)",
      difficulty: "hard",
      question: "Explain Python's structural pattern matching. Cover literal, capture, class, sequence, mapping, OR, and guard patterns.",
      answer: `Structural pattern matching (PEP 634, Python 3.10+) matches the *structure* of a value, not just equality.

\`\`\`python
def process(command):
    match command:
        # Literal pattern
        case "quit":
            return "exiting"

        # Sequence pattern — binds variables
        case ["go", direction]:
            return f"going {direction}"

        # Sequence with arbitrary tail
        case ["go", direction, *rest]:
            return f"going {direction} with extras: {rest}"

        # Mapping pattern
        case {"action": action, "target": target}:
            return f"{action} → {target}"

        # Class pattern
        case int(n) if n > 0:          # guard condition
            return f"positive int: {n}"

        # OR pattern
        case "north" | "south" | "east" | "west" as direction:
            return f"compass: {direction}"

        # Wildcard
        case _:
            return "unknown"
\`\`\`

**Dataclass / class pattern:**
\`\`\`python
from dataclasses import dataclass

@dataclass
class Point:
    x: float
    y: float

def where(p):
    match p:
        case Point(x=0, y=0):
            return "origin"
        case Point(x=0, y=y):
            return f"y-axis at {y}"
        case Point(x=x, y=0):
            return f"x-axis at {x}"
        case Point(x=x, y=y):
            return f"({x}, {y})"
\`\`\`

**Key rules:**
- Patterns are **not** evaluated as expressions — \`case x\` always captures, never compares.
- Use a **dotted name** (\`case Status.OK\`) to match against a constant.
- Guards (\`if condition\`) can reference captured names.
- Patterns are tried top-to-bottom; first match wins.`,
      tags: ["pattern-matching", "control-flow"],
    },
    {
      id: "py-exception-chaining-custom",
      title: "Exception chaining and custom exceptions",
      difficulty: "hard",
      question: "How does Python exception chaining work? How should you design a custom exception hierarchy?",
      answer: `**Exception chaining** preserves the original cause when re-raising from an exception handler.

\`\`\`python
# Implicit chaining — Python sets __context__ automatically
try:
    int("oops")
except ValueError as e:
    raise RuntimeError("conversion failed")
# RuntimeError: conversion failed
# During handling of the above exception, another exception occurred:
# ValueError: invalid literal ...

# Explicit chaining — set __cause__ with \`raise ... from ...\`
try:
    connect_to_db()
except ConnectionError as e:
    raise DatabaseError("unavailable") from e
# DatabaseError: unavailable
# The above exception was the direct cause of:
# ConnectionError: ...

# Suppress context — \`raise ... from None\`
try:
    int("x")
except ValueError:
    raise ValueError("bad input") from None  # hides original
\`\`\`

**Custom exception hierarchy:**
\`\`\`python
class AppError(Exception):
    """Base for all application errors — catch this to handle any app error."""

class ConfigError(AppError):
    """Bad configuration."""
    def __init__(self, key: str, message: str = "") -> None:
        self.key = key
        super().__init__(f"Config error for '{key}': {message}")

class NetworkError(AppError):
    """Network-level failure."""

class TimeoutError(NetworkError):
    """Connection or read timeout."""
    def __init__(self, timeout_s: float) -> None:
        self.timeout_s = timeout_s
        super().__init__(f"Timed out after {timeout_s}s")
\`\`\`

**Design guidelines:**
- Always inherit from \`Exception\` (not \`BaseException\`) for application errors.
- Create a single base class per library/module so callers can \`except MyLibError\`.
- Attach structured data as attributes, not just message strings.
- Never silence exceptions without logging (\`except Exception: pass\` is an antipattern).
- Use \`raise ... from original\` to preserve the causal chain for debugging.`,
      tags: ["error-handling", "oop"],
    },
    {
      id: "py-modules-packages",
      title: "Modules, packages, __init__.py, and __all__",
      difficulty: "hard",
      question: "How does Python's import system work? Explain packages, __init__.py, __all__, relative imports, and namespace packages.",
      answer: `**Module** — a single \`.py\` file. **Package** — a directory containing an \`__init__.py\` (regular package) or no \`__init__.py\` (namespace package, PEP 420).

\`\`\`
mylib/
├── __init__.py        # makes it a package; runs on import
├── core.py
├── utils.py
└── sub/
    ├── __init__.py
    └── helpers.py
\`\`\`

**\`__init__.py\`** controls the package's public interface:
\`\`\`python
# mylib/__init__.py
from .core import Engine        # re-export for convenience
from .utils import format_date

__all__ = ["Engine", "format_date"]  # controls \`from mylib import *\`
\`\`\`

**\`__all__\`** — list of strings naming public symbols. Without it, \`from pkg import *\` imports everything not starting with \`_\`.

**Relative imports** — use \`.\` to refer to the current package:
\`\`\`python
# mylib/sub/helpers.py
from ..core import Engine        # go up one level → mylib.core
from . import sibling_module     # same package
\`\`\`

Relative imports only work inside packages, not in scripts run directly.

**Import system internals:**
1. Check \`sys.modules\` cache — if found, return it (no re-execution).
2. Find the module using finders in \`sys.meta_path\`.
3. Load and execute the module, cache in \`sys.modules\`.

\`\`\`python
import sys
import mylib
"mylib" in sys.modules   # True
sys.modules["mylib"] is mylib   # True
\`\`\`

**Namespace packages (PEP 420):** directories without \`__init__.py\` that can span multiple directories/zip files on \`sys.path\`. Used by large monorepos and plugin systems to split a package across multiple install locations.`,
      tags: ["modules", "packages", "import-system"],
    },
  ],
};
