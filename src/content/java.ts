import type { Category } from "./types";

export const java: Category = {
  slug: "java",
  title: "Java",
  description:
    "Core Java fundamentals: OOP, generics, collections, streams, memory model, and more",
  icon: "☕",
  questions: [
    // ───── EASY ─────
    {
      id: "java-oop-principles",
      title: "The four OOP principles",
      difficulty: "easy",
      question: "What are the four core principles of Object-Oriented Programming and how does Java support each one?",
      answer: `**Encapsulation** — bundling state and behaviour in a class and hiding internal details behind access modifiers (private, protected, public). Getters/setters expose only what is needed.

**Abstraction** — exposing *what* an object does, not *how*. Java supports this with abstract classes and interfaces, letting callers depend on contracts rather than implementations.

**Inheritance** — a subclass extends a superclass and reuses or overrides its behaviour. Java uses the 'extends' keyword for classes and 'implements' for interfaces. Only single-class inheritance is allowed, but a class can implement multiple interfaces.

**Polymorphism** — the same method call behaves differently depending on the runtime type of the object.
- *Compile-time (static) polymorphism* — method overloading: same method name, different parameter lists.
- *Runtime (dynamic) polymorphism* — method overriding: a subclass provides its own version of an inherited method; the JVM dispatches to the correct one via virtual method dispatch.

Together these principles promote code reuse, modularity, and the open-closed principle (open for extension, closed for modification).`,
      tags: ["oop", "fundamentals"],
    },
    {
      id: "java-interface-vs-abstract",
      title: "Interface vs abstract class",
      difficulty: "easy",
      question: "What is the difference between an interface and an abstract class in Java? When should you use each?",
      answer: `**Abstract class**
- Can have instance fields, constructors, and concrete methods alongside abstract ones.
- A class may extend only *one* abstract class (single inheritance).
- Use when multiple related classes share state or implementation and belong to a clear 'is-a' hierarchy.

**Interface**
- Prior to Java 8: only abstract method signatures and constants.
- Java 8+: 'default' and 'static' methods with bodies; Java 9+ adds 'private' helper methods.
- A class may implement *many* interfaces.
- Cannot hold mutable instance state (only public static final constants).
- Use to define a *capability* contract that unrelated classes can fulfil (e.g., Comparable, Runnable, Serializable).

**Key decision rule:** if you need shared implementation or state — use an abstract class. If you need a contract that many unrelated types should satisfy — use an interface. In modern Java, interfaces with default methods blur this line, but the inability to hold instance fields remains the hard boundary.

Since Java 8 the recommended style is 'favour interfaces over abstract classes' — they allow more flexibility because the implementing class is still free to extend another class.`,
      tags: ["oop", "interfaces", "fundamentals"],
    },
    {
      id: "java-equals-hashcode",
      title: "equals() and hashCode() contract",
      difficulty: "easy",
      question: "Explain the equals/hashCode contract in Java. What breaks if you violate it?",
      answer: `The contract (specified in java.lang.Object):

1. **Reflexive** — x.equals(x) must be true.
2. **Symmetric** — x.equals(y) == y.equals(x).
3. **Transitive** — if x.equals(y) and y.equals(z), then x.equals(z).
4. **Consistent** — repeated calls return the same result if the objects have not changed.
5. **Null-safe** — x.equals(null) must return false (never throw).

**The hashCode rule:** if x.equals(y), then x.hashCode() == y.hashCode(). The reverse need not hold (hash collisions are allowed).

**What breaks if you violate it:**
- Overriding equals without hashCode means two logically equal objects have different hash codes. HashMaps and HashSets use the hash code to find the bucket first, so they will *never find* the second object even though equals would return true. You get duplicate entries in sets and failed lookups in maps.
- Violating symmetry or transitivity can cause Collections.sort and TreeSet/TreeMap to produce corrupted orderings.

**Best practice:** always override both together. IDEs and libraries like Lombok ('at'EqualsAndHashCode) or Java 16+ records generate correct implementations automatically.`,
      tags: ["oop", "collections", "fundamentals"],
    },
    {
      id: "java-string-pool",
      title: "String pool and immutability",
      difficulty: "easy",
      question: "Why is String immutable in Java? What is the String pool and how does it work?",
      answer: `**Immutability of String**
String is final and its internal char array is private with no mutating methods. Benefits:
- **Safety** — strings passed to security-sensitive APIs (class loaders, network, file paths) cannot be changed after validation.
- **Thread-safety** — immutable objects can be freely shared across threads without synchronisation.
- **Hashability** — the hash code can be cached on first call (lazy, then stored in a field), making String an efficient HashMap key.

**String pool (interning)**
The JVM maintains a pool of String literals in the heap (since Java 7 it moved from PermGen to the regular heap). When the compiler sees a string literal like "hello", it checks the pool first. If "hello" already exists, the reference to the existing object is reused. New literals are added to the pool.

Consequence:
- 'String a = "hello"; String b = "hello"; a == b' evaluates to true because both point to the same interned object.
- 'String c = new String("hello");' forces creation of a new heap object, bypassing the pool — 'c == a' is false.
- 'String.intern()' explicitly places a string into the pool and returns the pooled reference.

**StringBuilder / StringBuffer**
Use StringBuilder (not thread-safe, faster) or StringBuffer (thread-safe) for mutable string building; each '+' concatenation on String literals creates a new object (though the compiler optimises simple '+' chains in non-loop contexts using StringBuilder).`,
      tags: ["strings", "memory", "fundamentals"],
    },
    {
      id: "java-autoboxing",
      title: "Autoboxing and unboxing",
      difficulty: "easy",
      question: "What is autoboxing in Java? What are the performance and correctness pitfalls?",
      answer: `**Autoboxing** is the automatic conversion the compiler inserts between a primitive type (int, double, boolean …) and its corresponding wrapper class (Integer, Double, Boolean …). **Unboxing** is the reverse.

Example: 'List<Integer> list = new ArrayList<>(); list.add(42);' — the compiler rewrites 'add(42)' as 'add(Integer.valueOf(42))'.

**Integer cache**
'Integer.valueOf(n)' caches instances for values in the range -128 to 127. So:
- 'Integer a = 127; Integer b = 127; a == b' → true (same cached instance)
- 'Integer a = 128; Integer b = 128; a == b' → false (two different heap objects)

Always use '.equals()' to compare wrapper objects, never '=='.

**Performance pitfalls**
- Autoboxing in tight loops creates many short-lived objects, pressuring the GC.
- Unboxing a null wrapper throws NullPointerException — easy to miss if the method signature says Integer but you forgot the value might be absent.

**Pitfall summary**

| Situation | Risk |
|-----------|------|
| 'Integer == Integer' | Wrong result above 127 |
| Unboxing null wrapper | NullPointerException |
| Autoboxing in loop | GC pressure |
| Mixed numeric types | Unexpected widening or unboxing |

Use primitives wherever generics are not required (e.g., local variables, method parameters).`,
      tags: ["primitives", "fundamentals", "pitfalls"],
    },
    {
      id: "java-exception-handling",
      title: "Checked vs unchecked exceptions",
      difficulty: "easy",
      question: "What is the difference between checked and unchecked exceptions in Java? When should you use each?",
      answer: `**Class hierarchy**

    Throwable
    ├── Error (JVM-level — OutOfMemoryError, StackOverflowError; do not catch)
    └── Exception
        ├── RuntimeException → unchecked
        └── (all others)    → checked

**Checked exceptions** (e.g., IOException, SQLException)
- The compiler forces callers to either catch them or declare them with 'throws'.
- Represent recoverable, expected failure conditions where callers can meaningfully handle the problem.
- Use when the calling code should be aware of — and be able to recover from — the failure.

**Unchecked exceptions** (RuntimeException subclasses, e.g., NullPointerException, IllegalArgumentException, IndexOutOfBoundsException)
- The compiler does not require explicit handling.
- Represent programming errors or conditions that should not occur in correct code.
- Use for bugs (null dereference, bad arguments) or situations that are too pervasive to declare everywhere.

**Best practices**
- Prefer unchecked exceptions in modern API design (Spring, most popular libraries) to avoid forcing callers into boilerplate try-catch.
- Never swallow exceptions silently — at minimum log them.
- Use 'try-with-resources' (Java 7+) for anything that implements AutoCloseable to guarantee cleanup.
- Chain exceptions with 'throw new HighLevelException("msg", originalCause)' to preserve the root cause.`,
      tags: ["exceptions", "fundamentals"],
    },
    {
      id: "java-var-keyword",
      title: "var (local variable type inference)",
      difficulty: "easy",
      question: "What does the 'var' keyword do in Java? What are its limitations?",
      answer: `Introduced in Java 10 (JEP 286), 'var' lets the compiler **infer the type of a local variable** from the right-hand side initialiser. The variable is still statically typed — 'var' is not dynamic typing.

    var list = new ArrayList<String>();  // inferred as ArrayList<String>
    var map  = Map.of("a", 1, "b", 2);  // inferred as Map<String, Integer>
    for (var entry : map.entrySet()) {   // inferred as Map.Entry<String, Integer>
        System.out.println(entry.getKey());
    }

**Limitations**
- Only valid for **local variables** with an initialiser — not for fields, method parameters, or return types.
- Cannot be used for array initialisers without an explicit type: 'var arr = {1, 2, 3}' does not compile.
- Cannot be assigned null directly (the compiler cannot infer a type from null alone).
- Cannot be used in lambda parameters unless the parameter type is already inferred by context (though 'var' is allowed in lambda parameter lists in Java 11+ for annotation purposes).

**When to use**
- Long generic types where the type is obvious from the right-hand side.
- For-each loop variables.
- Try-with-resources variables.

**When to avoid**
- When the right-hand side makes the type unclear, sacrificing readability.
- In public API signatures (fields, parameters, returns).`,
      tags: ["language-features", "java10+"],
    },

    // ───── MEDIUM ─────
    {
      id: "java-generics",
      title: "Generics and type erasure",
      difficulty: "medium",
      question: "How do Java generics work? Explain type erasure, bounded wildcards (? extends T, ? super T), and the PECS rule.",
      answer: `**Generics** allow classes and methods to be parameterised by type, catching type errors at compile time rather than at runtime.

    List<String> names = new ArrayList<>();
    names.add("Alice");
    String s = names.get(0);  // no cast needed

**Type erasure**
Generic type information exists only at compile time. The compiler:
1. Replaces type parameters with their bounds (or Object if unbounded).
2. Inserts casts where needed.
3. Generates bridge methods to preserve polymorphism.

At runtime 'List<String>' and 'List<Integer>' are both just 'List'. You cannot do 'new T()', 'T.class', or 'instanceof List<String>'.

**Wildcards**

    // Upper-bounded — read from a producer
    void printAll(List<? extends Number> list) {
        for (Number n : list) System.out.println(n);
    }

    // Lower-bounded — write into a consumer
    void addNumbers(List<? super Integer> list) {
        list.add(42);
    }

**PECS — Producer Extends, Consumer Super**
- Use '? extends T' when you only *read* from a data structure (it produces T values).
- Use '? super T' when you only *write* into a data structure (it consumes T values).
- Use the exact type 'T' when you need to both read and write.

**Bounded type parameters on methods**

    <T extends Comparable<T>> T max(List<T> list) {
        return list.stream().max(Comparator.naturalOrder()).orElseThrow();
    }

Generic methods are type-safe without wildcards when the type relationship is fixed within the method.`,
      tags: ["generics", "type-system"],
    },
    {
      id: "java-collections-framework",
      title: "Java Collections Framework — List, Map, Set",
      difficulty: "medium",
      question: "Describe the main List, Map, and Set implementations in Java. How do ArrayList, LinkedList, HashMap, LinkedHashMap, TreeMap, HashSet, and TreeSet differ?",
      answer: `**List**

| Implementation | Backed by | Random access | Insert/delete (mid) | Notes |
|----------------|-----------|---------------|---------------------|-------|
| ArrayList | dynamic array | O(1) | O(n) | Best general-purpose list |
| LinkedList | doubly-linked list | O(n) | O(1) at iterator | Also implements Deque |

Prefer ArrayList for most use cases. Use LinkedList only when you frequently insert/remove at both ends.

**Map**

| Implementation | Order | Get/Put | Notes |
|----------------|-------|---------|-------|
| HashMap | none | O(1) avg | Most common; allows one null key |
| LinkedHashMap | insertion order | O(1) avg | Useful for LRU caches (access-order mode) |
| TreeMap | sorted by key | O(log n) | Implements NavigableMap; keys must be Comparable or use a Comparator |
| ConcurrentHashMap | none | O(1) avg | Thread-safe without full-table locking |

**Set**

| Implementation | Order | Contains | Notes |
|----------------|-------|----------|-------|
| HashSet | none | O(1) avg | Backed by HashMap |
| LinkedHashSet | insertion order | O(1) avg | Backed by LinkedHashMap |
| TreeSet | sorted | O(log n) | Backed by TreeMap; implements NavigableSet |

**HashMap internals (Java 8+)**
- Entries live in an array of buckets. The bucket index is 'hash(key) & (capacity - 1)'.
- Each bucket is a linked list; when a bucket's chain exceeds 8 entries it converts to a Red-Black tree (O(log n) worst case).
- Load factor (default 0.75) triggers resizing when exceeded.`,
      tags: ["collections", "data-structures"],
    },
    {
      id: "java-streams",
      title: "Java 8 Streams API",
      difficulty: "medium",
      question: "How does the Java Streams API work? Explain intermediate vs terminal operations, lazy evaluation, and common operators.",
      answer: `A **Stream** is a lazily evaluated pipeline of operations over a data source. It does not store data; it describes a computation.

**Creating streams**

    Stream.of("a", "b", "c")
    list.stream()
    IntStream.range(0, 10)
    Files.lines(Path.of("file.txt"))

**Operation types**

| Type | Examples | When it runs |
|------|----------|--------------|
| Intermediate (lazy) | filter, map, flatMap, sorted, distinct, limit, peek | Not until a terminal op is called |
| Terminal (eager) | collect, forEach, reduce, count, findFirst, anyMatch | Triggers the pipeline |

**Common pipeline**

    long count = employees.stream()
        .filter(e -> e.getSalary() > 50_000)
        .map(Employee::getDepartment)
        .distinct()
        .count();

**Collectors**

    // Group by department
    Map<String, List<Employee>> byDept =
        employees.stream()
                 .collect(Collectors.groupingBy(Employee::getDepartment));

    // Join strings
    String names = employees.stream()
                            .map(Employee::getName)
                            .collect(Collectors.joining(", "));

**Parallel streams**
Replace '.stream()' with '.parallelStream()' (or '.parallel()') to process elements concurrently using the common ForkJoinPool. Parallel streams help when the work per element is CPU-intensive and the data source can be split easily. Avoid for ordered, IO-bound, or stateful operations.

**Important rules**
- Streams are single-use — a consumed stream cannot be restarted.
- Avoid side effects inside intermediate operations.
- Prefer method references over verbose lambdas for clarity.`,
      tags: ["streams", "java8+", "functional"],
    },
    {
      id: "java-optional",
      title: "Optional<T>",
      difficulty: "medium",
      question: "What is Optional in Java? How and when should you use it?",
      answer: `'Optional<T>' (Java 8) is a container that either holds a non-null value or is empty. Its primary purpose is to make the *possibility of absence explicit in method return types*, eliminating ambiguous null returns.

**Creating**

    Optional<String> present = Optional.of("hello");       // throws NPE if null
    Optional<String> maybe   = Optional.ofNullable(value); // null → empty
    Optional<String> empty   = Optional.empty();

**Consuming safely**

    // Bad — defeats the purpose
    if (opt.isPresent()) { String s = opt.get(); }

    // Good — functional style
    opt.ifPresent(s -> System.out.println(s));
    String val = opt.orElse("default");
    String val = opt.orElseGet(() -> computeDefault());
    String val = opt.orElseThrow(() -> new NoSuchElementException("missing"));

    // Transform
    Optional<Integer> len = opt.map(String::length);
    Optional<String>  up  = opt.filter(s -> s.length() > 3).map(String::toUpperCase);

**When to use**
- Return type of methods that might legitimately not return a value.
- Short pipelines where map/filter/orElse clarify intent.

**When NOT to use**
- Method parameters — use overloading or @Nullable instead.
- Fields — serialisation is broken; use null + documentation.
- Collections — use an empty collection rather than Optional<List<T>>.
- Performance-critical code — Optional is a heap object; avoid in tight loops.`,
      tags: ["optional", "java8+", "functional"],
    },
    {
      id: "java-functional-interfaces",
      title: "Lambdas and functional interfaces",
      difficulty: "medium",
      question: "What is a functional interface? Name the key ones from java.util.function and explain how lambdas and method references relate to them.",
      answer: `A **functional interface** has exactly one abstract method (SAM — Single Abstract Method). The '@FunctionalInterface' annotation enforces this at compile time. Lambdas and method references can be assigned wherever a functional interface type is expected.

**Core interfaces in java.util.function**

| Interface | Signature | Use |
|-----------|-----------|-----|
| Predicate<T> | T → boolean | filter, test |
| Function<T,R> | T → R | map, transform |
| BiFunction<T,U,R> | T, U → R | combine two inputs |
| Consumer<T> | T → void | forEach, side effects |
| Supplier<T> | () → T | lazy value creation |
| UnaryOperator<T> | T → T | transform same type |
| BinaryOperator<T> | T, T → T | reduce |

Primitive specialisations (IntPredicate, IntFunction, ToIntFunction, IntSupplier …) avoid autoboxing.

**Lambda syntax**

    Predicate<String> nonEmpty = s -> !s.isEmpty();
    Function<String, Integer> len = String::length;      // method reference
    BinaryOperator<Integer> add = Integer::sum;          // static method ref
    Comparator<String> cmp = String::compareTo;          // instance method ref
    Supplier<List<String>> makeList = ArrayList::new;    // constructor ref

**Composing functions**

    Function<String, String> trim     = String::trim;
    Function<String, String> toUpper  = String::toUpperCase;
    Function<String, String> pipeline = trim.andThen(toUpper);
    // "  hello  " → "HELLO"

    Predicate<String> longEnough = s -> s.length() > 3;
    Predicate<String> noDigits   = s -> !s.matches(".*\\d.*");
    Predicate<String> valid      = longEnough.and(noDigits);

Lambdas capture effectively-final variables from the enclosing scope. They are not closures over mutable state.`,
      tags: ["lambdas", "functional", "java8+"],
    },
    {
      id: "java-immutability",
      title: "Immutability in Java",
      difficulty: "medium",
      question: "How do you design an immutable class in Java? What are the rules and why does immutability matter?",
      answer: `An **immutable object** cannot change observable state after construction. String, Integer, and all primitive wrappers are immutable.

**Rules for an immutable class**
1. Declare the class 'final' (prevent subclassing that could add mutable state).
2. Make all fields 'private final'.
3. Do not provide setters or any method that modifies fields.
4. If a field holds a mutable object, make a **defensive copy** on the way in (constructor) and on the way out (getter).
5. Ensure the constructor completes initialisation fully before 'this' can escape.

**Example**

    public final class DateRange {
        private final LocalDate start;
        private final LocalDate end;
        private final List<String> labels;

        public DateRange(LocalDate start, LocalDate end, List<String> labels) {
            if (start.isAfter(end)) throw new IllegalArgumentException();
            this.start  = start;                          // LocalDate is immutable
            this.end    = end;
            this.labels = List.copyOf(labels);            // defensive copy → unmodifiable
        }

        public LocalDate getStart()      { return start; }
        public LocalDate getEnd()        { return end; }
        public List<String> getLabels()  { return labels; } // already unmodifiable
    }

**Why immutability matters**
- **Thread safety** — immutable objects can be freely shared across threads with zero synchronisation.
- **Simplicity** — no need to track who modified what; state cannot change unexpectedly.
- **Safe map keys / set members** — hash code cannot change after insertion.
- **Failure atomicity** — if construction fails, no partially-constructed object escapes.

Java 16+ **records** are a concise way to create immutable data carriers automatically.`,
      tags: ["immutability", "oop", "thread-safety"],
    },
    {
      id: "java-memory-model-gc",
      title: "Java Memory Model and garbage collection",
      difficulty: "medium",
      question: "Describe the JVM memory areas (heap, stack, metaspace). How does garbage collection work and what are the main GC algorithms?",
      answer: `**JVM memory areas**

| Area | Contents | GC'd? |
|------|----------|-------|
| Heap | All objects | Yes |
| Stack (per thread) | Stack frames, local primitives, object references | No (auto-reclaimed on return) |
| Metaspace (Java 8+) | Class metadata, bytecode | Yes (class unloading) |
| Code cache | JIT-compiled native code | Managed separately |
| PC Register | Current instruction pointer | N/A |

**Heap generations (in traditional GC)**
- **Young generation** — Eden + two Survivor spaces. Most objects die here (infant mortality). Minor GC is fast and frequent.
- **Old generation (Tenured)** — objects that survive multiple minor GC cycles. Major/Full GC is slower.

**GC algorithms**

| Algorithm | JDK default | Characteristic |
|-----------|-------------|----------------|
| Serial GC | Small apps | Stop-the-world, single thread |
| Parallel GC | JDK 8 default | Throughput-focused, multi-thread STW |
| G1 GC | JDK 9+ default | Region-based, predictable pause targets |
| ZGC | JDK 15+ (prod) | Sub-millisecond pauses, concurrent |
| Shenandoah | JDK 15+ (prod) | Low-pause, concurrent compaction |

**GC roots and reachability**
An object is live if reachable from a GC root (stack references, static fields, JNI references). Unreachable objects are eligible for collection.

**Memory tuning flags**
'-Xms' sets initial heap size; '-Xmx' sets maximum; '-XX:+UseG1GC' selects G1. Inspect GC behaviour with '-Xlog:gc*' or GC log analysis tools.`,
      tags: ["memory", "gc", "jvm"],
    },
    {
      id: "java-concurrency-basics",
      title: "Concurrency basics — synchronized, volatile, and happens-before",
      difficulty: "medium",
      question: "What do synchronized and volatile mean in Java? Explain the happens-before relationship in the Java Memory Model.",
      answer: `**The problem**
Modern CPUs and compilers reorder instructions and cache values in registers. Without memory visibility guarantees, one thread's writes may not be seen by another thread.

**volatile**
- Guarantees **visibility**: writes to a volatile field are immediately flushed to main memory; reads always fetch from main memory.
- Prevents instruction reordering around that field.
- Does NOT make compound operations (check-then-act, read-modify-write) atomic.
- Use for single-flag booleans or status fields read by multiple threads.

    private volatile boolean running = true;
    // safe to read from another thread without synchronisation

**synchronized**
- Ensures **mutual exclusion** (only one thread in the block at a time) AND **visibility** (all changes made inside the block are visible to the next thread that acquires the same monitor).
- Every object has an intrinsic monitor lock. 'synchronized(obj) {}' or 'synchronized' method acquires it.
- Heavier than volatile; can cause contention and deadlocks if used carelessly.

**Happens-before (JMM)**
The Java Memory Model defines when one action is guaranteed to be visible to another:
- Within a single thread: each statement happens-before the next.
- Monitor unlock happens-before every subsequent lock on the same monitor.
- A write to a volatile field happens-before every subsequent read of that field.
- Thread.start() happens-before any action in the started thread.
- All actions in a thread happen-before Thread.join() returns.

If action A happens-before action B, then A's memory writes are guaranteed visible to B.

**Prefer higher-level concurrency utilities** (java.util.concurrent) over raw synchronized:
- 'ReentrantLock' for timed/interruptible locking.
- 'AtomicInteger' etc. for lock-free atomic operations.
- 'ConcurrentHashMap', 'CopyOnWriteArrayList' for thread-safe collections.`,
      tags: ["concurrency", "jvm", "thread-safety"],
    },
    {
      id: "java-records",
      title: "Records (Java 16)",
      difficulty: "medium",
      question: "What are Java records? What do they provide automatically and what are their limitations?",
      answer: `**Records** (JEP 395, Java 16) are a concise, transparent way to declare immutable data carrier classes. They replace the boilerplate of hand-written plain data classes.

    public record Point(double x, double y) {}

The compiler automatically generates:
- A canonical constructor with one parameter per component.
- Private final fields for each component.
- Public accessor methods matching the component names ('x()', 'y()').
- 'equals()' and 'hashCode()' based on all components.
- 'toString()' showing all component values.

**Compact constructor** (for validation)

    public record Range(int min, int max) {
        Range {                                // compact: no parameter list
            if (min > max) throw new IllegalArgumentException();
        }
    }

**Customisation**
- You can add static fields, static methods, and instance methods.
- You can add additional constructors (they must delegate to the canonical one).
- You can override the auto-generated methods.

**Limitations**
- Records are implicitly final — cannot be subclassed.
- Cannot extend any class (implicitly extends java.lang.Record).
- All components are immutable (private final) — no setters.
- Cannot declare additional instance fields outside the component list.
- Cannot be abstract.

Records work well with sealed interfaces for algebraic data types (discriminated unions).`,
      tags: ["records", "java16+", "oop"],
    },

    // ───── HARD ─────
    {
      id: "java-generics-advanced",
      title: "Generics — wildcards, capture, and heap pollution",
      difficulty: "hard",
      question: "Explain wildcard capture, unchecked warnings, heap pollution, and the @SafeVarargs annotation.",
      answer: `**Wildcard capture**
When you pass a 'List<?>' to a helper method, the compiler infers a type parameter to represent the unknown type:

    // The compiler captures '?' as CAP#1
    static <T> void swap(List<T> list, int i, int j) {
        T tmp = list.get(i);
        list.set(i, list.get(j));
        list.set(j, tmp);
    }

    public static void swapFirst(List<?> list) {
        swap(list, 0, 1);  // wildcard capture — type-safe
    }

**Heap pollution**
A variable of a parameterised type refers to an object that is not of that type. This happens when mixing raw types or performing unsafe casts. The 'ClassCastException' appears far from the real cause.

    List rawList = new ArrayList<Integer>();
    List<String> strList = rawList;  // unchecked warning
    strList.get(0);                  // ClassCastException at runtime

**Varargs and generics**
Creating an array of a generic type is not permitted, but varargs do it implicitly:

    @SafeVarargs
    static <T> List<T> listOf(T... elements) {
        return Arrays.asList(elements);
    }

'@SafeVarargs' (Java 7) suppresses the unchecked warning and promises to callers that the method does not pollute the heap through the varargs parameter. It can only be applied to methods that are final, static, or constructors (i.e., cannot be overridden).

**Unchecked warnings**
The compiler issues an unchecked warning whenever it cannot verify that a cast or generic operation is type-safe. Always investigate them; use '@SuppressWarnings("unchecked")' only when you have proven safety with a comment.`,
      tags: ["generics", "type-system", "advanced"],
    },
    {
      id: "java-sealed-classes",
      title: "Sealed classes and pattern matching",
      difficulty: "hard",
      question: "What are sealed classes in Java? How do they interact with pattern matching in switch expressions?",
      answer: `**Sealed classes / interfaces** (JEP 409, Java 17) restrict which classes can extend or implement them. The 'permits' clause lists the only allowed subclasses.

    public sealed interface Shape permits Circle, Rectangle, Triangle {}

    public record Circle(double radius)               implements Shape {}
    public record Rectangle(double w, double h)       implements Shape {}
    public final class Triangle                       implements Shape {
        Triangle(double base, double height) { ... }
    }

Permitted subclasses must be in the same package (or same compilation unit) and must be either 'final', 'sealed', or 'non-sealed'.

**Pattern matching in switch** (Java 21, JEP 441)
The compiler knows all permitted subtypes of a sealed type, so it can verify **exhaustiveness** of switch expressions — no default case needed when all subtypes are covered.

    double area(Shape shape) {
        return switch (shape) {
            case Circle c          -> Math.PI * c.radius() * c.radius();
            case Rectangle r       -> r.w() * r.h();
            case Triangle t        -> 0.5 * t.base() * t.height();
            // No default needed — compiler verifies all cases covered
        };
    }

**Guarded patterns**

    String describe(Shape shape) {
        return switch (shape) {
            case Circle c when c.radius() > 10 -> "large circle";
            case Circle c                      -> "small circle";
            case Rectangle r when r.w() == r.h() -> "square";
            case Rectangle r                   -> "rectangle";
            case Triangle t                    -> "triangle";
        };
    }

Sealed classes + pattern matching together enable safe, compiler-verified algebraic data types, similar to Haskell ADTs or Rust enums.`,
      tags: ["sealed-classes", "pattern-matching", "java17+"],
    },
    {
      id: "java-classloader",
      title: "ClassLoader architecture and class loading",
      difficulty: "hard",
      question: "How does the Java ClassLoader hierarchy work? Explain the delegation model, class loading phases, and when you might write a custom ClassLoader.",
      answer: `**Class loading phases**
When the JVM first uses a class it performs three steps:
1. **Loading** — reads the .class bytecode from a source (filesystem, network, jar).
2. **Linking** — verifies bytecode, prepares static fields, optionally resolves symbolic references.
3. **Initialisation** — runs static initialisers and sets static field values.

**ClassLoader hierarchy (Java 9+ modular)**

    Bootstrap ClassLoader        (built-in C++; loads java.lang, java.util …)
    └── Platform ClassLoader     (formerly Extension CL; loads java.se module set)
        └── Application ClassLoader (loads classpath / module path)
            └── Custom ClassLoaders

**Delegation model (parent-first)**
When a ClassLoader is asked to load a class, it delegates to its parent first. Only if the parent cannot find the class does the child attempt loading. This prevents application code from replacing core classes like java.lang.String.

**Why two classes with the same fully-qualified name can coexist**
The identity of a class in the JVM is '(ClassLoader, fully-qualified name)'. OSGi and application servers (Tomcat, WildFly) exploit this to isolate web applications — each deployment gets its own ClassLoader.

**Custom ClassLoader use cases**
- Hot-reload / dynamic plugin systems (load new versions of a class at runtime).
- Loading classes from non-standard sources (database, encrypted jar, network).
- Isolation between modules with conflicting dependency versions.

**Writing one**

    class MyLoader extends ClassLoader {
        @Override
        protected Class<?> findClass(String name) throws ClassNotFoundException {
            byte[] bytes = loadBytecodeFrom(name);  // your source
            return defineClass(name, bytes, 0, bytes.length);
        }
    }

Override 'findClass', not 'loadClass', to preserve the delegation model.`,
      tags: ["jvm", "classloading", "advanced"],
    },
    {
      id: "java-reflection-and-proxy",
      title: "Reflection and dynamic proxies",
      difficulty: "hard",
      question: "How does Java reflection work? What are dynamic proxies (java.lang.reflect.Proxy) and what are they used for?",
      answer: `**Reflection** lets code inspect and manipulate classes, fields, methods, and constructors at runtime through the java.lang.reflect API.

    Class<?> clazz = Class.forName("com.example.Foo");
    Object instance = clazz.getDeclaredConstructor().newInstance();

    Method m = clazz.getDeclaredMethod("compute", int.class);
    m.setAccessible(true);   // bypasses access control
    Object result = m.invoke(instance, 42);

**Performance:** reflection is slower than direct calls due to security checks, argument boxing, and loss of JIT inlining. Use it sparingly; cache Method/Field references.

**Dynamic proxies (java.lang.reflect.Proxy)**
Creates a proxy object at runtime that implements one or more interfaces. All method calls on the proxy are routed through an 'InvocationHandler'.

    interface UserService {
        User findById(long id);
    }

    UserService proxy = (UserService) Proxy.newProxyInstance(
        UserService.class.getClassLoader(),
        new Class<?>[]{ UserService.class },
        (proxyObj, method, args) -> {
            System.out.println("Before: " + method.getName());
            Object result = realService.findById((Long) args[0]);
            System.out.println("After: " + method.getName());
            return result;
        }
    );

**Use cases**
- **Spring AOP / transaction management** — Spring wraps beans with proxies to apply cross-cutting concerns (logging, transactions, security) transparently.
- **Mocking frameworks** — Mockito creates proxies that record calls and return configured answers.
- **Remote method invocation (RMI)** — network calls disguised as local method calls.
- **Lazy loading in ORMs** — Hibernate creates subclass proxies for entities to defer DB queries.

Limitation: dynamic proxies work only for interfaces. For class-based proxying, libraries like CGLIB or ByteBuddy generate subclasses at runtime.`,
      tags: ["reflection", "proxy", "advanced", "frameworks"],
    },
    {
      id: "java-concurrency-advanced",
      title: "java.util.concurrent — executors, futures, CompletableFuture",
      difficulty: "hard",
      question: "Compare ExecutorService, Future, and CompletableFuture. How do you compose asynchronous tasks with CompletableFuture?",
      answer: `**ExecutorService**
Manages a pool of threads. Submit tasks as Runnable (fire-and-forget) or Callable (returns a result).

    ExecutorService pool = Executors.newFixedThreadPool(4);
    Future<Integer> future = pool.submit(() -> expensiveComputation());
    pool.shutdown();

**Future<T>**
A handle to an async computation's eventual result.
- 'future.get()' blocks the calling thread until the result is ready (or throws ExecutionException).
- 'future.get(timeout, unit)' — bounded block.
- No mechanism to chain callbacks or compose multiple futures.

**CompletableFuture<T>** (Java 8)
A promise that can be completed manually or composed into pipelines without blocking threads.

    CompletableFuture.supplyAsync(() -> fetchUser(id))        // runs in ForkJoinPool
        .thenApply(user -> user.getName().toUpperCase())      // transform result
        .thenCompose(name -> fetchOrdersFor(name))            // flat-map (returns CF)
        .thenAccept(orders -> render(orders))                 // consume
        .exceptionally(ex -> { log(ex); return null; });      // error handling

**Key methods**

| Method | Purpose |
|--------|---------|
| supplyAsync / runAsync | Start async task |
| thenApply | Transform result (like Stream.map) |
| thenCompose | Flat-map to another CompletableFuture |
| thenCombine | Combine two independent futures |
| allOf / anyOf | Wait for all / first of N futures |
| exceptionally | Recover from exception |
| handle | Handle both result and exception |
| completeExceptionally | Fail the future from outside |

**Thread pool**
By default CompletableFuture uses 'ForkJoinPool.commonPool()'. Supply a custom Executor as a second argument to 'supplyAsync' to control which pool handles the work.

    CompletableFuture.supplyAsync(() -> blockingIO(), ioThreadPool)
                     .thenApplyAsync(data -> transform(data), cpuPool);`,
      tags: ["concurrency", "async", "java8+", "advanced"],
    },
    {
      id: "java-virtual-threads",
      title: "Virtual threads (Project Loom, Java 21)",
      difficulty: "hard",
      question: "What are virtual threads? How do they differ from platform threads and when should you use them?",
      answer: `**Project Loom** (JEP 444, Java 21) introduces **virtual threads** — lightweight, JVM-managed threads that are not tied 1:1 to OS threads.

**Platform threads (traditional)**
- Each platform thread wraps one OS thread.
- Creating thousands of threads is expensive (each consumes ~1 MB stack + OS resources).
- Blocked platform threads (on I/O, locks) hold their OS thread idle.

**Virtual threads**
- Very cheap to create and block — the JVM parks them on the heap when blocked.
- Mounted onto a small pool of carrier (platform) threads only when runnable.
- You can create millions of virtual threads without exhausting OS resources.

**Creating virtual threads**

    Thread vt = Thread.ofVirtual().start(() -> handleRequest());
    // Or with an executor:
    try (ExecutorService exec = Executors.newVirtualThreadPerTaskExecutor()) {
        exec.submit(() -> handleRequest());
    }

**When to use**
- **High-concurrency I/O-bound workloads** (HTTP servers, database queries, file reads): virtual threads eliminate the need for reactive/callback style — you write simple blocking code and get non-blocking scalability.
- Thread-per-request servers (Tomcat, Jetty 12, Spring Boot 3.2+) can switch to virtual threads with minimal code change.

**When NOT to use**
- CPU-bound tasks — virtual threads do not run faster; use platform threads with a sized thread pool.
- Tasks holding locks for a long time — a pinned virtual thread (inside a native method or 'synchronized' block in older code) cannot be unmounted, blocking a carrier thread.

**Pinning**
If a virtual thread executes inside a 'synchronized' block or native method, it is pinned to its carrier thread for the duration. Replace 'synchronized' with 'ReentrantLock' to allow unmounting.

Virtual threads are **not faster** than platform threads for CPU work; they are cheaper when *blocked*, enabling simpler, more scalable I/O code without reactive frameworks.`,
      tags: ["virtual-threads", "concurrency", "java21+", "loom"],
    },
    {
      id: "java-hashmap-internals",
      title: "HashMap internals and collision handling",
      difficulty: "hard",
      question: "Describe the internal structure of HashMap in detail. How are collisions handled, when does treeification happen, and what are the resize mechanics?",
      answer: `**Internal structure**
HashMap<K,V> is backed by an array of 'Node<K,V>[]' called the *table*. Each node stores (hash, key, value, next).

- **Bucket index**: 'index = (n - 1) & hash(key)', where 'n' is the table length (always a power of two) and 'hash()' is a spreading function that XORs the key's hashCode with its upper 16 bits to reduce collisions at low capacity.

**Collision handling**
Multiple keys can land in the same bucket:
1. **Linked list** — nodes at the same index are chained via 'next'. Lookup scans the chain with 'key.equals()'. O(n) worst case.
2. **Red-Black tree (treeification)** — when a bucket's chain reaches **TREEIFY_THRESHOLD = 8** entries *and* the table has at least **MIN_TREEIFY_CAPACITY = 64** buckets, the chain converts to a TreeNode red-black tree. Lookup becomes O(log n).
3. **Untreeification** — when entries are removed and the tree shrinks to **UNTREEIFY_THRESHOLD = 6**, it reverts to a linked list.

**Resizing (rehashing)**
- When the number of entries exceeds 'capacity * loadFactor' (default 0.75), the table doubles in size.
- All entries are rehashed into the new table. Because capacity is always a power of two, each entry either stays in the same bucket or moves to 'oldIndex + oldCapacity' — no full hash recomputation needed, just a bit test.
- Resizing is O(n) and should be avoided in hot paths by pre-sizing: 'new HashMap<>(expectedSize / 0.75 + 1)'.

**Thread safety**
HashMap is not thread-safe. Concurrent structural modifications can cause an infinite loop during resize in older JDK versions (fixed in Java 8 but still broken if mutated from multiple threads). Use ConcurrentHashMap or external synchronisation.

**ConcurrentHashMap**
Segments the table into independent buckets. Lock is taken per bucket (bin-level) rather than on the whole map, allowing high read/write parallelism.`,
      tags: ["collections", "internals", "advanced"],
    },
    {
      id: "java-pattern-matching-instanceof",
      title: "Pattern matching — instanceof and switch",
      difficulty: "hard",
      question: "Explain the evolution of pattern matching in Java from instanceof (Java 16) through switch patterns (Java 21). What are deconstruction patterns?",
      answer: `**Pattern matching for instanceof (JEP 394, Java 16)**
Before Java 16 every instanceof check required a redundant cast:

    // Old
    if (obj instanceof String) { String s = (String) obj; use(s); }

    // Java 16+
    if (obj instanceof String s) { use(s); }   // 's' is in scope only where true

The pattern variable 's' is bound only in the true branch and is effectively final.

**Negation and logical operators**

    if (!(obj instanceof Number n)) throw new IllegalArgumentException();
    // n is in scope from here onward (flow-scoping)

    if (obj instanceof Integer i && i > 0) { ... }

**Pattern matching in switch (JEP 441, Java 21)**

    Object obj = ...;
    String result = switch (obj) {
        case Integer i when i < 0 -> "negative int";
        case Integer i            -> "positive int: " + i;
        case String s             -> "string: " + s;
        case null                 -> "null";
        default                   -> "other: " + obj.getClass().getSimpleName();
    };

- **Guarded patterns** ('when' clause) allow additional conditions.
- 'null' can now be a case label.
- Ordering matters: more specific patterns must come before general ones; the compiler enforces this.

**Deconstruction patterns (JEP 440, Java 21)**
Destructures a record (or class with deconstruct support) directly in a pattern:

    record Point(int x, int y) {}
    record Line(Point start, Point end) {}

    void describe(Object obj) {
        if (obj instanceof Line(Point(int x1, int y1), Point(int x2, int y2))) {
            System.out.println("Line from (" + x1 + "," + y1 + ") to (" + x2 + "," + y2 + ")");
        }
    }

Deconstruction patterns compose: you can nest them arbitrarily for deep structural matching. Combined with sealed types they give Java exhaustive, type-safe algebraic pattern matching comparable to Scala or Kotlin.`,
      tags: ["pattern-matching", "java21+", "language-features"],
    },
    {
      id: "java-jit-compilation",
      title: "JIT compilation and performance",
      difficulty: "hard",
      question: "How does the JVM's JIT compiler work? Explain tiered compilation, inlining, escape analysis, and how to interpret JVM warm-up.",
      answer: `**Interpretation vs. compilation**
The JVM starts by interpreting bytecode. As methods are called repeatedly, the JIT compiler translates them to native machine code for subsequent calls — this is why Java performance improves over time ('warm-up').

**Tiered compilation (default since Java 8)**
Five compilation tiers:

| Tier | Action | Cost | Speed |
|------|--------|------|-------|
| 0 | Interpreter | — | Slow |
| 1 | C1 — simple JIT, no profiling | Low | Medium |
| 2 | C1 — limited profiling | Low | Medium |
| 3 | C1 — full profiling | Medium | Medium |
| 4 | C2 — optimising JIT, uses profiling data | High | Fast |

Methods start at tier 0, move through C1 quickly to start collecting profiling data (branch frequencies, type profiles), then hand off to the C2 'server' compiler for aggressive optimisation.

**Key optimisations**

*Method inlining* — the most impactful: replaces a method call with the callee's body, eliminating call overhead and enabling further optimisations. Methods up to ~35 bytecodes are candidates. Excessive class hierarchy depth can block inlining (virtual dispatch requires a type check).

*Escape analysis* — determines if an object allocated inside a method ever 'escapes' (is stored in a field or returned). If not, the JVM can allocate it on the stack (stack allocation) or eliminate it entirely (scalar replacement), avoiding GC pressure.

*Loop unrolling and vectorisation* — the JIT unrolls short loops and uses SIMD instructions for array operations.

*Devirtualisation* — replaces a virtual dispatch with a direct call when profiling shows only one implementation is ever used (with a guard check).

**Diagnosing JIT**
- '-XX:+PrintCompilation' — logs methods as they are compiled.
- '-XX:+UnlockDiagnosticVMOptions -XX:+PrintInlining' — shows inlining decisions.
- JMH (Java Microbenchmark Harness) is the standard tool for reliable micro-benchmarks; it handles warm-up, dead-code elimination, and forking automatically.

**Warm-up implications**
Benchmarks that measure only the first few invocations get interpreter-level timings. In production, containerised apps that restart frequently may never reach peak performance — consider ahead-of-time compilation (GraalVM native-image) or JVM checkpoint/restore (CRaC) for latency-sensitive scenarios.`,
      tags: ["jvm", "performance", "jit", "advanced"],
    },
  ],
};
