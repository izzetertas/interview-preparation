import type { Category } from "./types";

export const csharp: Category = {
  slug: "csharp",
  title: "C#",
  description:
    "Core C# from the ground up: type system, OOP, generics, LINQ, async/await, pattern matching, records, and modern language features through C# 13 / .NET 9.",
  icon: "💜",
  questions: [
    // ───── EASY ─────
    {
      id: "cs-value-vs-reference-types",
      title: "Value types vs reference types",
      difficulty: "easy",
      question:
        "What is the difference between value types and reference types in C#? Give examples of each.",
      answer: `**Value types** store their data directly on the stack (or inline in containing objects). Assigning copies the value. **Reference types** store a reference (pointer) to heap-allocated data; assignment copies the reference, not the data.

| Characteristic | Value Type | Reference Type |
|---|---|---|
| Storage | Stack / inline | Heap (GC-managed) |
| Assignment | Copies value | Copies reference |
| Default value | Zero/false/null-struct | \`null\` |
| Inheritance | Cannot inherit (except from \`object\`/\`ValueType\`) | Full hierarchy |
| Examples | \`int\`, \`double\`, \`bool\`, \`char\`, \`struct\`, \`enum\` | \`class\`, \`string\`, \`array\`, \`delegate\` |

\`\`\`csharp
// Value type — copy semantics
int a = 10;
int b = a;
b = 99;
Console.WriteLine(a); // 10 — unaffected

// Reference type — shared reference
var list1 = new List<int> { 1, 2, 3 };
var list2 = list1;   // same object
list2.Add(4);
Console.WriteLine(list1.Count); // 4 — both see the change
\`\`\`

**Key nuance:** \`string\` is a reference type but behaves like a value type due to immutability and operator overloads. \`record struct\` gives you value semantics with record syntax.`,
      tags: ["fundamentals", "types", "memory"],
    },
    {
      id: "cs-boxing-unboxing",
      title: "Boxing and unboxing",
      difficulty: "easy",
      question: "What is boxing and unboxing in C#, and why can it hurt performance?",
      answer: `**Boxing** converts a value type to \`object\` (or an interface it implements) by allocating a heap object to wrap it. **Unboxing** extracts the value type back from the box with an explicit cast.

\`\`\`csharp
int x = 42;
object boxed = x;          // boxing  — heap allocation + copy
int unboxed = (int)boxed;  // unboxing — cast check + copy

// Classic pitfall: ArrayList boxes every element
var list = new System.Collections.ArrayList();
list.Add(1);               // boxes int → object
int val = (int)list[0];    // unboxes
\`\`\`

**Performance cost:**
- Each box allocates a new heap object → GC pressure.
- Unboxing requires a type-check and memory copy.
- Hot paths (tight loops) can cause noticeable slowdowns.

**How to avoid:**
- Prefer generic collections (\`List<int>\` instead of \`ArrayList\`).
- Use \`Span<T>\` / \`Memory<T>\` for buffer work.
- Use \`ValueTask<T>\` instead of \`Task<T>\` in high-throughput async paths.
- Interfaces on structs still cause boxing unless the variable is typed as the concrete struct.`,
      tags: ["fundamentals", "performance", "memory"],
    },
    {
      id: "cs-string-immutability",
      title: "String immutability",
      difficulty: "easy",
      question: "Why are strings immutable in C#, and how does StringBuilder help?",
      answer: `Every string operation that appears to modify a string actually creates a **new string object**. The original remains unchanged.

\`\`\`csharp
string s = "hello";
string t = s.ToUpper(); // new object "HELLO"
Console.WriteLine(s);   // "hello" — unchanged
\`\`\`

**Why immutable?**
- Thread-safe by design — no synchronisation needed for reads.
- Enables **string interning**: identical literals share the same heap object.
- Simplifies reasoning (no hidden mutations through shared references).

**The concatenation trap:**
\`\`\`csharp
// O(n²) allocations — each + creates a new string
string result = "";
for (int i = 0; i < 10_000; i++)
    result += i.ToString();

// Use StringBuilder for many mutations — O(n) amortised
var sb = new System.Text.StringBuilder();
for (int i = 0; i < 10_000; i++)
    sb.Append(i);
string result2 = sb.ToString();
\`\`\`

**String interpolation** (\`$"Hello {name}"\`) compiles to \`string.Create\` / \`DefaultInterpolatedStringHandler\` (C# 10+), which avoids redundant allocations for simple cases.`,
      tags: ["fundamentals", "strings", "performance"],
    },
    {
      id: "cs-var-vs-dynamic",
      title: "var vs dynamic",
      difficulty: "easy",
      question: "What is the difference between `var` and `dynamic` in C#?",
      answer: `| Feature | \`var\` | \`dynamic\` |
|---|---|---|
| Type resolution | Compile-time (static) | Runtime |
| IntelliSense | Full support | None |
| Performance | Same as explicit type | Runtime overhead (DLR) |
| Error detection | Compile-time | Runtime |
| Use case | Reduce verbosity (type inferred) | COM interop, reflection, duck-typing |

\`\`\`csharp
// var — compiler infers List<string>; fully type-safe
var names = new List<string>();
names.Add("Alice");
// names.Add(42); // compile error ✓

// dynamic — resolved at runtime via Dynamic Language Runtime
dynamic obj = "hello";
Console.WriteLine(obj.Length); // 5 — works
obj = 42;
// Console.WriteLine(obj.Length); // RuntimeBinderException at runtime ✗
\`\`\`

**Rule of thumb:** always prefer \`var\` for local variable type inference. Reserve \`dynamic\` for genuine interop scenarios (Office COM automation, Python/IronPython, JSON blobs with unknown shape) where the static type is truly unknowable at compile time.`,
      tags: ["fundamentals", "types", "type-system"],
    },
    {
      id: "cs-nullable-types",
      title: "Nullable types and null operators",
      difficulty: "easy",
      question:
        "Explain nullable value types, nullable reference types, and the operators `?`, `??`, `??=`, and `?.` in C#.",
      answer: `**Nullable value types** (\`T?\` / \`Nullable<T>\`) wrap a value type to allow \`null\`:
\`\`\`csharp
int? age = null;
if (age.HasValue) Console.WriteLine(age.Value);
\`\`\`

**Nullable reference types (NRT)** (C# 8+, enabled via \`<Nullable>enable</Nullable>\`) add compile-time flow analysis to reference types. A \`string?\` signals "may be null"; \`string\` promises non-null.

**Null operators:**

| Operator | Name | Behaviour |
|---|---|---|
| \`T?\` | Nullable annotation | Marks type as nullable |
| \`a ?? b\` | Null-coalescing | Returns \`a\` if non-null, else \`b\` |
| \`a ??= b\` | Null-coalescing assignment | Assigns \`b\` to \`a\` only if \`a\` is null |
| \`a?.b\` | Null-conditional | Returns \`null\` if \`a\` is null, else \`a.b\` |
| \`a?[i]\` | Null-conditional index | Same for indexers |

\`\`\`csharp
string? name = GetName(); // may be null

// ?? — provide fallback
string display = name ?? "Anonymous";

// ??= — lazy initialisation
name ??= "Default";

// ?. — safe navigation chain
int? len = name?.Trim()?.Length;

// Combining operators
string result = GetUser()?.Address?.City ?? "Unknown";
\`\`\``,
      tags: ["fundamentals", "null-safety", "operators"],
    },
    {
      id: "cs-properties",
      title: "Properties: auto, expression-bodied, and init",
      difficulty: "easy",
      question:
        "What are auto-properties, expression-bodied members, and init-only setters in C#?",
      answer: `**Auto-properties** let the compiler generate the backing field:
\`\`\`csharp
public class Person
{
    public string Name { get; set; }          // read-write auto-property
    public int Age  { get; private set; }     // externally read-only
}
\`\`\`

**Expression-bodied members** (C# 6+) use \`=>\` for concise single-expression bodies:
\`\`\`csharp
public string FullName => $"{First} {Last}";   // get-only property
public int Double(int x) => x * 2;             // method
\`\`\`

**Init-only setters** (\`init\`, C# 9+) allow setting via object initialiser but make the property immutable afterwards:
\`\`\`csharp
public class Point
{
    public int X { get; init; }
    public int Y { get; init; }
}

var p = new Point { X = 3, Y = 4 }; // OK
// p.X = 10; // compile error — init-only
\`\`\`

**Required properties** (C# 11+) enforce that a property must be set in the object initialiser:
\`\`\`csharp
public class User
{
    public required string Email { get; init; }
}
\`\`\``,
      tags: ["oop", "properties", "syntax"],
    },
    {
      id: "cs-using-idisposable",
      title: "using statement and IDisposable",
      difficulty: "easy",
      question: "How does `IDisposable` work and what does the `using` statement do?",
      answer: `**\`IDisposable\`** defines a \`Dispose()\` method for deterministic cleanup of unmanaged resources (file handles, DB connections, sockets, native memory).

\`\`\`csharp
public class FileWriter : IDisposable
{
    private StreamWriter _writer;
    private bool _disposed;

    public FileWriter(string path) => _writer = new StreamWriter(path);

    public void Write(string text) => _writer.Write(text);

    public void Dispose()
    {
        if (!_disposed)
        {
            _writer.Dispose();
            _disposed = true;
        }
        GC.SuppressFinalize(this);
    }
}
\`\`\`

**\`using\` statement** guarantees \`Dispose()\` is called even if an exception occurs — equivalent to try/finally:
\`\`\`csharp
// Block form
using (var fw = new FileWriter("log.txt"))
{
    fw.Write("hello");
} // Dispose() called here

// Declaration form (C# 8+) — scoped to enclosing block
using var fw2 = new FileWriter("log2.txt");
fw2.Write("world");
// Dispose() called at end of method/block
\`\`\`

**\`IAsyncDisposable\`** (C# 8+) adds \`DisposeAsync()\` for async cleanup, used with \`await using\`.`,
      tags: ["memory", "resources", "best-practices"],
    },

    // ───── MEDIUM ─────
    {
      id: "cs-oop-pillars",
      title: "OOP: classes, interfaces, abstract, sealed, partial",
      difficulty: "medium",
      question:
        "Explain the key OOP building blocks in C#: classes, interfaces, abstract classes, sealed classes, and partial classes.",
      answer: `**Class** — blueprint for objects. Supports single inheritance + multiple interface implementation.

**Interface** — contract (no implementation pre C# 8; default interface methods added in C# 8). A class can implement many interfaces.

**Abstract class** — cannot be instantiated; may have abstract (unimplemented) and concrete members. Use when sharing base logic across related types.

**Sealed class** — cannot be subclassed. Enables JIT devirtualisation optimisations. \`string\` is sealed.

**Partial class** — splits a class across multiple files (useful for generated code + hand-written code).

\`\`\`csharp
public interface IShape
{
    double Area();
    string Describe() => $"Area = {Area():F2}"; // default impl (C# 8+)
}

public abstract class Shape : IShape
{
    public abstract double Area();
    public string Color { get; set; } = "Red";
}

public sealed class Circle : Shape
{
    public double Radius { get; init; }
    public override double Area() => Math.PI * Radius * Radius;
}

// Circle cannot be further subclassed
\`\`\`

| | Class | Abstract class | Interface |
|---|---|---|---|
| Instantiate | Yes | No | No |
| State (fields) | Yes | Yes | No (static only) |
| Multiple inheritance | No | No | Yes (multiple impl) |
| Constructor | Yes | Yes | No |
| Default impl | — | Yes | C# 8+ |`,
      tags: ["oop", "design", "inheritance"],
    },
    {
      id: "cs-generics",
      title: "Generics and constraints",
      difficulty: "medium",
      question:
        "How do generics work in C#? Explain generic classes, generic methods, and `where T:` constraints.",
      answer: `Generics provide **type-safe, reusable** code without runtime boxing for value types. The CLR generates specialised native code per value-type instantiation.

**Generic class:**
\`\`\`csharp
public class Stack<T>
{
    private readonly List<T> _items = new();
    public void Push(T item) => _items.Add(item);
    public T Pop()
    {
        var item = _items[^1];
        _items.RemoveAt(_items.Count - 1);
        return item;
    }
}
\`\`\`

**Generic method:**
\`\`\`csharp
public static T Max<T>(T a, T b) where T : IComparable<T>
    => a.CompareTo(b) >= 0 ? a : b;
\`\`\`

**\`where T:\` constraints:**

| Constraint | Meaning |
|---|---|
| \`where T : class\` | T must be a reference type |
| \`where T : struct\` | T must be a non-nullable value type |
| \`where T : new()\` | T must have a public parameterless constructor |
| \`where T : SomeBase\` | T must inherit from SomeBase |
| \`where T : IFoo\` | T must implement IFoo |
| \`where T : notnull\` | T must be non-nullable (C# 8+) |
| \`where T : unmanaged\` | T must be an unmanaged value type (C# 7.3+) |
| \`where T : allows ref struct\` | T may be a ref struct (C# 13+) |

\`\`\`csharp
public class Repository<T> where T : class, IEntity, new()
{
    public T Create() => new T();
}
\`\`\`

**Variance:** interfaces and delegates support \`out\` (covariance) and \`in\` (contravariance):
\`\`\`csharp
IEnumerable<string> strings = new List<string>();
IEnumerable<object> objects = strings; // covariant — safe read-only
\`\`\``,
      tags: ["generics", "type-system", "performance"],
    },
    {
      id: "cs-linq",
      title: "LINQ: query operators, deferred execution, and pitfalls",
      difficulty: "medium",
      question:
        "Explain LINQ's core operators (Where, Select, GroupBy, Join, Aggregate), deferred execution, and common pitfalls.",
      answer: `LINQ (Language-Integrated Query) provides a uniform querying API over any \`IEnumerable<T>\` or \`IQueryable<T>\`.

**Core operators:**
\`\`\`csharp
var orders = GetOrders(); // IEnumerable<Order>

// Where — filter
var big = orders.Where(o => o.Total > 1000);

// Select — transform / project
var totals = orders.Select(o => o.Total);

// GroupBy — group into key + elements
var byStatus = orders.GroupBy(o => o.Status);

// Join — inner join
var joined = orders.Join(
    customers,
    o => o.CustomerId,
    c => c.Id,
    (o, c) => new { o.Id, c.Name });

// Aggregate — fold/reduce
decimal sum = orders.Aggregate(0m, (acc, o) => acc + o.Total);
// Equivalent: orders.Sum(o => o.Total)
\`\`\`

**Deferred execution:** most LINQ operators return an unevaluated pipeline. Iteration happens on \`foreach\`, \`ToList()\`, \`ToArray()\`, \`Count()\`, etc.

\`\`\`csharp
var query = orders.Where(o => o.Total > 100); // no DB hit yet
orders.Add(new Order { Total = 200 });
// query now includes the new order — evaluated lazily
var list = query.ToList(); // executed here
\`\`\`

**IQueryable<T>** (Entity Framework, etc.) translates the expression tree to SQL; \`IEnumerable<T>\` runs in-process. Mixing them incorrectly pulls all rows into memory.

**Common pitfalls:**
- Calling \`ToList()\` too early or too late.
- Multiple enumeration of the same query (hits DB twice).
- \`Select\` inside \`Where\` causing N+1 in EF (use \`Include\`/\`Join\`).
- Capturing a loop variable in a lambda (closure over mutable variable).`,
      tags: ["linq", "collections", "performance"],
    },
    {
      id: "cs-delegates-events",
      title: "Delegates, Action, Func, and events",
      difficulty: "medium",
      question:
        "What are delegates in C#? How do `Action`, `Func`, and `EventHandler` relate to them?",
      answer: `A **delegate** is a type-safe function pointer — an object that holds a reference to one or more methods with a matching signature.

\`\`\`csharp
// Custom delegate type
delegate int MathOp(int a, int b);

MathOp add = (a, b) => a + b;
Console.WriteLine(add(3, 4)); // 7

// Multicast delegate
MathOp multi = add;
multi += (a, b) => a * b; // both invoked; last return value wins
\`\`\`

**Built-in generic delegates (preferred):**

| Type | Signature | Use case |
|---|---|---|
| \`Action\` | \`void ()\` | Side-effect callback |
| \`Action<T1,…T16>\` | \`void (T1,…)\` | Callback with params |
| \`Func<TResult>\` | \`TResult ()\` | Value-returning callback |
| \`Func<T1,…,TResult>\` | \`TResult (T1,…)\` | Transform / factory |
| \`Predicate<T>\` | \`bool (T)\` | Filter (= \`Func<T,bool>\`) |
| \`EventHandler<TArgs>\` | \`void (object?, TArgs)\` | .NET event pattern |

**Events** wrap a multicast delegate with add/remove accessors, preventing external code from clearing all subscribers:
\`\`\`csharp
public class Button
{
    public event EventHandler<EventArgs>? Clicked;

    protected virtual void OnClicked()
        => Clicked?.Invoke(this, EventArgs.Empty);
}

var btn = new Button();
btn.Clicked += (_, _) => Console.WriteLine("Clicked!");
\`\`\``,
      tags: ["delegates", "events", "functional"],
    },
    {
      id: "cs-async-await",
      title: "async/await, Task, and ConfigureAwait",
      difficulty: "medium",
      question:
        "Explain async/await in C#. What is the difference between Task and ValueTask, and when should you use ConfigureAwait(false)?",
      answer: `**async/await** transforms a method into a state machine that can suspend without blocking a thread.

\`\`\`csharp
public async Task<string> FetchDataAsync(string url)
{
    using var client = new HttpClient();
    string content = await client.GetStringAsync(url);
    return content.ToUpper();
}
\`\`\`

**Task vs ValueTask:**

| | \`Task<T>\` | \`ValueTask<T>\` |
|---|---|---|
| Allocation | Always heap-allocated | Stack-allocated when synchronously completed |
| Reusable | No | No (without \`IValueTaskSource\`) |
| Overhead | Higher | Lower on hot paths |
| Use when | General async work | High-frequency async APIs (frequently synchronous) |

\`\`\`csharp
// ValueTask avoids allocation when result is cached
public ValueTask<int> GetCachedAsync(int id)
{
    if (_cache.TryGetValue(id, out var val))
        return ValueTask.FromResult(val); // no allocation
    return new ValueTask<int>(LoadFromDbAsync(id));
}
\`\`\`

**\`ConfigureAwait(false)\`** tells the awaiter not to capture and resume on the original \`SynchronizationContext\` (e.g., UI thread / ASP.NET request context). Use it in library code to avoid deadlocks and improve throughput.

\`\`\`csharp
// Library code — doesn't need the UI context
var data = await httpClient.GetStringAsync(url).ConfigureAwait(false);
\`\`\`

In ASP.NET Core there is no \`SynchronizationContext\`, so \`ConfigureAwait(false)\` has no effect but remains a best practice for portable libraries.`,
      tags: ["async", "concurrency", "performance"],
    },
    {
      id: "cs-exception-handling",
      title: "Exception handling: try/catch/finally, when, AggregateException",
      difficulty: "medium",
      question:
        "Describe C# exception handling including the `when` clause and AggregateException.",
      answer: `\`\`\`csharp
try
{
    var result = await ProcessAsync();
}
catch (HttpRequestException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
{
    // exception filter — only catches 404s; stack unwinds only if matched
    Console.WriteLine("Not found");
}
catch (Exception ex)
{
    logger.LogError(ex, "Unexpected error");
    throw; // rethrow preserving original stack trace (not 'throw ex')
}
finally
{
    // Always executes — for cleanup
    Cleanup();
}
\`\`\`

**\`when\` clause (exception filters):**
- Evaluated *before* the stack unwinds — useful for logging without catching.
- Avoids swallowing exceptions unintentionally.

\`\`\`csharp
catch (Exception ex) when (Log(ex)) { } // Log returns false → exception propagates
\`\`\`

**\`AggregateException\`** wraps one or more exceptions from \`Task.WhenAll\` or \`Parallel.ForEach\`:
\`\`\`csharp
try
{
    await Task.WhenAll(task1, task2, task3);
}
catch (Exception ex) when (ex is AggregateException or not AggregateException)
{
    // await unwraps the first inner exception automatically
    // To see all: ((AggregateException)task1.Exception!).InnerExceptions
}
\`\`\`

**Best practices:**
- Catch specific exceptions, not bare \`Exception\` in production code.
- Never swallow exceptions silently.
- Use \`ExceptionDispatchInfo.Capture\` to rethrow from a different thread preserving context.`,
      tags: ["exceptions", "async", "best-practices"],
    },
    {
      id: "cs-records",
      title: "Records: record class vs record struct, with expressions",
      difficulty: "medium",
      question:
        "What are records in C#? Compare `record class` and `record struct`, and explain positional records and `with` expressions.",
      answer: `**Records** (C# 9+) are types optimised for immutable data with value-based equality.

**record class** — reference type, heap-allocated:
\`\`\`csharp
public record class Point(int X, int Y); // positional record

var p1 = new Point(1, 2);
var p2 = new Point(1, 2);
Console.WriteLine(p1 == p2); // True — value equality
Console.WriteLine(p1);       // Point { X = 1, Y = 2 } — auto ToString
\`\`\`

**record struct** (C# 10+) — value type, stack-allocated:
\`\`\`csharp
public record struct Size(double Width, double Height);
// Mutable by default; use 'readonly record struct' for full immutability
public readonly record struct Color(byte R, byte G, byte B);
\`\`\`

**with expressions** — non-destructive mutation (creates a copy with changed fields):
\`\`\`csharp
var p3 = p1 with { Y = 99 }; // new Point(1, 99)
Console.WriteLine(p1); // Point { X = 1, Y = 2 } — original unchanged
\`\`\`

**Positional records** auto-generate:
- Primary constructor
- \`init\`-only properties
- Deconstructor (\`void Deconstruct(out T1, …)\`)
- Value equality (\`Equals\`, \`GetHashCode\`, \`==\`, \`!=\`)
- \`ToString()\` with pretty printing
- \`ICloneable\`-like clone used by \`with\`

| | \`record class\` | \`record struct\` | \`class\` |
|---|---|---|---|
| Allocation | Heap | Stack/inline | Heap |
| Equality | Value | Value | Reference |
| Mutable | \`init\` (default) | Yes (default) | Yes |`,
      tags: ["records", "immutability", "oop"],
    },
    {
      id: "cs-extension-methods",
      title: "Extension methods",
      difficulty: "medium",
      question: "What are extension methods in C# and how are they implemented?",
      answer: `**Extension methods** add new methods to existing types without modifying the type or using inheritance. They are static methods in a static class with \`this T\` as the first parameter.

\`\`\`csharp
public static class StringExtensions
{
    // Extends string with .ToTitleCase()
    public static string ToTitleCase(this string value)
    {
        if (string.IsNullOrEmpty(value)) return value;
        return System.Globalization.CultureInfo.CurrentCulture
            .TextInfo.ToTitleCase(value.ToLower());
    }

    // Extends IEnumerable<T> with .IsEmpty()
    public static bool IsEmpty<T>(this IEnumerable<T> source)
        => !source.Any();
}

// Usage — looks like an instance method
"hello world".ToTitleCase();  // "Hello World"
new List<int>().IsEmpty();    // true
\`\`\`

**LINQ itself is built entirely from extension methods** on \`IEnumerable<T>\` defined in \`System.Linq.Enumerable\`.

**Rules:**
- Defined in a non-generic, non-nested static class.
- First parameter prefixed with \`this\`.
- Instance methods always take precedence over extension methods.
- Resolved at compile time (no polymorphism).
- Cannot access private members of the extended type.`,
      tags: ["extension-methods", "linq", "design-patterns"],
    },
    {
      id: "cs-pattern-matching",
      title: "Pattern matching and switch expressions",
      difficulty: "medium",
      question:
        "Explain C# pattern matching: `is` patterns, switch expressions, and property patterns.",
      answer: `Pattern matching lets you test a value against a shape and extract data simultaneously.

**\`is\` patterns:**
\`\`\`csharp
object obj = "hello";

if (obj is string s && s.Length > 3)
    Console.WriteLine(s.ToUpper()); // type pattern + declaration

if (obj is not null)              // negation pattern (C# 9+)
    Console.WriteLine("not null");

if (obj is string { Length: > 3 } str) // property pattern
    Console.WriteLine(str);
\`\`\`

**Switch expressions (C# 8+):**
\`\`\`csharp
string Classify(object shape) => shape switch
{
    Circle { Radius: > 10 } c  => $"Large circle r={c.Radius}",
    Circle c                   => $"Small circle r={c.Radius}",
    Rectangle { Width: var w, Height: var h } when w == h
                               => "Square",
    Rectangle r                => $"Rectangle {r.Width}x{r.Height}",
    null                       => "null",
    _                          => "Unknown"
};
\`\`\`

**Pattern catalogue:**

| Pattern | Example |
|---|---|
| Type | \`obj is Circle c\` |
| Constant | \`x is 42\` |
| Property | \`obj is { Name: "Alice" }\` |
| Positional | \`point is (0, 0)\` |
| Relational | \`x is > 0 and < 100\` |
| Logical | \`obj is int or double\` |
| List (C# 11+) | \`arr is [1, 2, ..]\` |
| Slice (C# 11+) | \`arr is [_, .., last]\` |`,
      tags: ["pattern-matching", "switch", "syntax"],
    },
    {
      id: "cs-tuples",
      title: "Tuples and ValueTuple",
      difficulty: "medium",
      question: "What are C# tuples? How do named tuples and ValueTuple differ from the old Tuple<T> class?",
      answer: `**\`System.Tuple<T1,T2>\`** (pre C# 7) — heap-allocated, reference type, properties named \`Item1\`, \`Item2\`, etc.

**\`ValueTuple\`** (C# 7+) — stack-allocated value type with optional named elements and deconstruction support. The language syntax \`(T1, T2)\` uses \`ValueTuple\` under the hood.

\`\`\`csharp
// Named tuple — names are compile-time aliases only (not stored at runtime)
(string First, string Last) name = ("Alice", "Smith");
Console.WriteLine(name.First); // Alice

// Tuple literal
var point = (X: 10, Y: 20);
Console.WriteLine(point.X);

// Deconstruction
var (x, y) = point;

// Returning multiple values from a method
(int Min, int Max) Bounds(int[] arr) => (arr.Min(), arr.Max());
var (min, max) = Bounds(new[] { 3, 1, 4, 1, 5 });

// Discards — ignore unwanted elements
var (_, last) = ("ignore", "keep");
\`\`\`

**When to use records vs tuples:**
- Use **tuples** for small, short-lived groupings (method return values, local variables).
- Use **records** when the data has a name, travels across API boundaries, or needs methods and XML documentation.`,
      tags: ["tuples", "value-types", "syntax"],
    },

    // ───── HARD ─────
    {
      id: "cs-span-memory",
      title: "Span<T> and Memory<T>",
      difficulty: "hard",
      question:
        "What are `Span<T>` and `Memory<T>` in C#? How do they enable zero-copy buffer operations?",
      answer: `**\`Span<T>\`** is a stack-only (\`ref struct\`) view over a contiguous region of memory — an array slice, stack-allocated buffer, or native pointer — without copying data.

\`\`\`csharp
byte[] buffer = new byte[1024];
Span<byte> span = buffer.AsSpan(0, 512); // slice — no copy

// Stack-allocated buffer (stackalloc)
Span<int> stackSpan = stackalloc int[64];

// Parse without allocating a substring
ReadOnlySpan<char> text = "2026-04-26".AsSpan();
int year  = int.Parse(text[..4]);    // slice [0..4]
int month = int.Parse(text[5..7]);
int day   = int.Parse(text[8..10]);
\`\`\`

**\`Memory<T>\`** is the heap-compatible counterpart — can be stored in fields, captured in lambdas, used across \`await\` boundaries (unlike \`Span<T>\` which cannot cross async suspension points).

\`\`\`csharp
public async Task ProcessAsync(Memory<byte> memory)
{
    await Task.Delay(1);      // await is fine with Memory<T>
    var span = memory.Span;   // get Span only when needed
}
\`\`\`

**Why this matters:**

| Scenario | Before | After (Span) |
|---|---|---|
| Split CSV line | \`string.Split\` → array of strings (heap) | Slice \`ReadOnlySpan<char>\` — zero alloc |
| Parse integers from text | \`Substring\` + \`int.Parse\` | \`int.Parse(ReadOnlySpan<char>)\` |
| Binary protocol | \`byte[]\` copies | \`Span<byte>\` slices |

**\`ref struct\` restrictions on \`Span<T>\`:**
- Cannot be a field in a regular class or struct.
- Cannot be boxed.
- Cannot be used as a generic type argument (unless \`allows ref struct\` constraint, C# 13).
- Cannot cross async/await or \`yield return\` boundaries.`,
      tags: ["performance", "memory", "span", "zero-copy"],
    },
    {
      id: "cs-collections-deep-dive",
      title: "Collections: List, Dictionary, HashSet, IEnumerable, IQueryable",
      difficulty: "hard",
      question:
        "Compare C#'s core collection types and explain the difference between IEnumerable<T> and IQueryable<T>.",
      answer: `**Core generic collections:**

| Type | Underlying Structure | Lookup | Add | Notes |
|---|---|---|---|---|
| \`List<T>\` | Dynamic array | O(n) | O(1) amortised | Indexed access O(1) |
| \`Dictionary<K,V>\` | Hash table | O(1) avg | O(1) avg | No order guarantee |
| \`SortedDictionary<K,V>\` | Red-black tree | O(log n) | O(log n) | Sorted by key |
| \`HashSet<T>\` | Hash table | O(1) avg | O(1) avg | Unique elements only |
| \`SortedSet<T>\` | Red-black tree | O(log n) | O(log n) | Sorted unique elements |
| \`Queue<T>\` | Circular array | — | O(1) | FIFO |
| \`Stack<T>\` | Array | — | O(1) | LIFO |
| \`LinkedList<T>\` | Doubly-linked | O(n) | O(1) | Efficient insert/remove at known node |
| \`PriorityQueue<T,P>\` | Binary heap | O(log n) | O(log n) | Added .NET 6 |

**IEnumerable\<T\> vs IQueryable\<T\>:**

\`\`\`csharp
// IEnumerable<T> — in-process LINQ (executed by CLR)
IEnumerable<Product> local = dbContext.Products.ToList()
    .Where(p => p.Price > 100); // filters in memory

// IQueryable<T> — expression tree, translated to SQL by EF Core
IQueryable<Product> query = dbContext.Products
    .Where(p => p.Price > 100); // WHERE Price > 100 in SQL

// Danger: accidentally pulling into memory
IEnumerable<Product> broken = dbContext.Products; // entire table!
var result = broken.Where(p => p.Price > 100);    // filters in-process
\`\`\`

**Concurrent collections** (\`System.Collections.Concurrent\`):
- \`ConcurrentDictionary<K,V>\` — lock-free reads, fine-grained locking on writes.
- \`ConcurrentQueue<T>\` — lock-free FIFO.
- \`Channel<T>\` (System.Threading.Channels) — async producer/consumer pipeline.`,
      tags: ["collections", "linq", "performance", "data-structures"],
    },
    {
      id: "cs-advanced-async",
      title: "Advanced async: cancellation, progress, and parallel patterns",
      difficulty: "hard",
      question:
        "Explain CancellationToken, IProgress<T>, Task.WhenAll vs Task.WhenAny, and avoiding common async pitfalls like async void and fire-and-forget.",
      answer: `**CancellationToken** — cooperative cancellation propagated through the call chain:
\`\`\`csharp
public async Task<string> FetchAsync(string url, CancellationToken ct = default)
{
    using var client = new HttpClient();
    // Pass token — throws OperationCanceledException if cancelled
    return await client.GetStringAsync(url, ct);
}

// Caller creates and signals the token
using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5)); // timeout
try { await FetchAsync("https://example.com", cts.Token); }
catch (OperationCanceledException) { Console.WriteLine("Timed out"); }
\`\`\`

**IProgress\<T\>** — thread-safe progress reporting back to the UI thread:
\`\`\`csharp
public async Task ProcessFilesAsync(IProgress<int>? progress = null, CancellationToken ct = default)
{
    for (int i = 0; i < 100; i++)
    {
        await Task.Delay(10, ct);
        progress?.Report(i + 1);
    }
}
// Caller
var progress = new Progress<int>(pct => progressBar.Value = pct);
await ProcessFilesAsync(progress, ct);
\`\`\`

**Task.WhenAll vs Task.WhenAny:**
\`\`\`csharp
// WhenAll — waits for all; throws AggregateException if any fail
var (a, b) = await (Task.Run(() => 1), Task.Run(() => 2)); // tuple pattern
string[] pages = await Task.WhenAll(urls.Select(FetchAsync));

// WhenAny — returns the first completed task (racing)
Task<string> winner = await Task.WhenAny(task1, task2, task3);
\`\`\`

**Pitfalls:**

| Anti-pattern | Problem | Fix |
|---|---|---|
| \`async void\` | Exceptions unobservable; fire-and-forget | \`async Task\`; use \`_ = Task.Run(...)\` consciously |
| \`.Result\` / \`.Wait()\` | Deadlocks in UI/ASP.NET classic contexts | \`await\` all the way up |
| Forgetting \`ConfigureAwait\` in libs | Context capture overhead / deadlock risk | \`ConfigureAwait(false)\` in library code |
| Parallel LINQ + async | \`AsParallel()\` does not understand \`Task\` | Use \`Task.WhenAll\` or \`Parallel.ForEachAsync\` |`,
      tags: ["async", "concurrency", "best-practices"],
    },
    {
      id: "cs-advanced-generics-variance",
      title: "Generic variance, constraints, and static abstract members",
      difficulty: "hard",
      question:
        "Explain generic covariance and contravariance in C#, and how static abstract interface members (C# 11+) enable generic math.",
      answer: `**Covariance (\`out\`)** — a generic type can be used where a more general type is expected (safe for outputs):
\`\`\`csharp
IEnumerable<string> strings = new List<string>();
IEnumerable<object> objects = strings; // covariant — OK, read-only
\`\`\`

**Contravariance (\`in\`)** — a generic type can be used where a more specific type is expected (safe for inputs):
\`\`\`csharp
IComparer<object> objComparer = Comparer<object>.Default;
IComparer<string> strComparer = objComparer; // contravariant — OK, write-only position
\`\`\`

Only **interfaces** and **delegate types** support variance. Classes and structs are invariant.

**Static abstract interface members (C# 11 / .NET 7+):**
Enables **generic math** — write algorithms generic over numeric types:
\`\`\`csharp
public interface IAddable<T> where T : IAddable<T>
{
    static abstract T operator +(T left, T right);
}

public static T Sum<T>(IEnumerable<T> source) where T : IAddable<T>, new()
{
    T result = new T(); // or T.AdditiveIdentity if using IAdditiveIdentity
    foreach (var item in source)
        result = result + item;
    return result;
}
\`\`\`

The BCL ships \`INumber<T>\`, \`IAdditionOperators<T,T,T>\`, \`IComparisonOperators\`, etc. in \`System.Numerics\`, replacing hundreds of overloaded methods:
\`\`\`csharp
public static T Average<T>(T[] values)
    where T : INumber<T>
    => values.Aggregate(T.Zero, (a, b) => a + b) / T.CreateChecked(values.Length);

Average(new[] { 1, 2, 3 });          // int
Average(new[] { 1.0, 2.5, 3.5 });   // double
\`\`\``,
      tags: ["generics", "type-system", "advanced", "dotnet9"],
    },
    {
      id: "cs-c13-features",
      title: "C# 12/13 features: primary constructors, collection expressions, params spans",
      difficulty: "hard",
      question:
        "What are the major new features in C# 12 and C# 13? Explain primary constructors, collection expressions, and params spans.",
      answer: `**Primary constructors (C# 12)** — move constructor parameters to the type declaration, available as implicit fields throughout the class body:
\`\`\`csharp
// Before
public class Logger
{
    private readonly ILoggerFactory _factory;
    public Logger(ILoggerFactory factory) => _factory = factory;
}

// After — primary constructor
public class Logger(ILoggerFactory factory)
{
    // 'factory' is in scope everywhere in the class
    private readonly ILogger _log = factory.CreateLogger<Logger>();
    public void Log(string msg) => _log.LogInformation(msg);
}

// Also works on structs and records (extends existing record primary ctors)
\`\`\`

**Collection expressions (C# 12)** — unified literal syntax for arrays, lists, spans, and more via a \`[]\` spread operator:
\`\`\`csharp
int[] arr      = [1, 2, 3];
List<int> list = [4, 5, 6];
Span<int> span = [7, 8, 9];

// Spread operator ..
int[] combined = [..arr, ..list];   // [1,2,3,4,5,6]
\`\`\`

**\`params\` spans / collections (C# 13)** — \`params\` now works with \`ReadOnlySpan<T>\` and other collection types, avoiding array allocation at call sites:
\`\`\`csharp
public static int Sum(params ReadOnlySpan<int> values)
{
    int total = 0;
    foreach (var v in values) total += v;
    return total;
}

Sum(1, 2, 3, 4, 5); // zero-allocation — stack buffer, no int[] created
\`\`\`

**Other C# 12/13 highlights:**

| Feature | Version | Summary |
|---|---|---|
| Inline arrays | 12 | Fixed-size buffer in a struct (\`[System.Runtime.CompilerServices.InlineArray(8)]\`) |
| Interceptors | 12 (preview) | Compile-time method redirection for source generators |
| \`allows ref struct\` | 13 | Generic type constraint permitting \`ref struct\` type args |
| \`ref readonly\` params | 12 | Pass by readonly reference at call sites |
| Lock object | 13 | \`System.Threading.Lock\` — safer, leaner than \`Monitor\` |
| Overload resolution priority | 13 | \`[OverloadResolutionPriority]\` for library authors |`,
      tags: ["csharp13", "csharp12", "new-features", "performance"],
    },
    {
      id: "cs-span-internals-stackalloc",
      title: "stackalloc, fixed buffers, unsafe code, and native interop",
      difficulty: "hard",
      question:
        "When and how do you use `stackalloc`, `fixed`, and `unsafe` code in C# for native interop and high-performance scenarios?",
      answer: `**\`stackalloc\`** allocates a contiguous block on the current call frame's stack — zero GC pressure:
\`\`\`csharp
// Safe context: assigned to Span<T>
Span<byte> buffer = stackalloc byte[256];
buffer.Fill(0);

// Unsafe context: raw pointer
unsafe
{
    byte* ptr = stackalloc byte[256];
    for (int i = 0; i < 256; i++) ptr[i] = (byte)i;
}
\`\`\`

**\`fixed\` statement** — pins a managed object so the GC cannot move it, allowing a raw pointer:
\`\`\`csharp
byte[] managed = new byte[1024];
unsafe
{
    fixed (byte* p = managed)
    {
        NativeMethod(p, managed.Length); // P/Invoke
    }
    // Object unpinned here — GC can compact again
}
\`\`\`

**\`unsafe\` contexts** require the \`<AllowUnsafeBlocks>true</AllowUnsafeBlocks>\` project setting and the \`unsafe\` keyword on the method or class.

**P/Invoke (Platform Invocation Services):**
\`\`\`csharp
using System.Runtime.InteropServices;

[LibraryImport("kernel32.dll", StringMarshalling = StringMarshalling.Utf16)]
internal static partial int GetFileAttributesW(string lpFileName);

// LibraryImport (C# 11+) is source-generated; DllImport is the classic alternative
[DllImport("libc", EntryPoint = "strlen")]
private static extern nint strlen(byte* s);
\`\`\`

**NativeMemory (C# 11+ / .NET 6+):**
\`\`\`csharp
using System.Runtime.InteropServices;

nint size = 1024;
void* ptr = NativeMemory.Alloc((nuint)size);
try   { /* use ptr */ }
finally { NativeMemory.Free(ptr); }
\`\`\`

**Rule of thumb:** prefer \`Span<T>\`/\`Memory<T>\` first; reach for \`unsafe\` / P/Invoke only at system boundaries or inner hot loops where the profiler demands it.`,
      tags: ["unsafe", "performance", "interop", "memory"],
    },
  ],
};
