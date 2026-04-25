import type { Category } from "./types";

export const dataStructures: Category = {
  slug: "data-structures",
  title: "Data Structures",
  description:
    "Core data structures: arrays, linked lists, hash maps, stacks/queues, trees, heaps, graphs, tries, and specialized structures like Bloom filters and union-find.",
  icon: "🧱",
  questions: [
    // ───── EASY ─────
    {
      id: "arrays",
      title: "Arrays",
      difficulty: "easy",
      question: "What is an array and what are its core properties?",
      answer: `An **array** is a contiguous block of memory holding elements of the same type. Indexing is constant-time because the address of any element is computed: \`base + i × size\`.

| Operation              | Time         |
|------------------------|--------------|
| Index access \`a[i]\`    | O(1)         |
| Update \`a[i] = x\`      | O(1)         |
| Append (dynamic array) | O(1) amortized |
| Insert / delete middle | O(n) (shift) |
| Search (unsorted)      | O(n)         |
| Search (sorted)        | O(log n) (binary) |

**Static vs dynamic:**
- **Static** — fixed size at allocation (C arrays, Java's \`int[]\`).
- **Dynamic** — grows as needed (JS \`Array\`, Python \`list\`, C++ \`vector\`). Underlying buffer doubles when full → amortized O(1) append.

**Trade-offs:**
- ✅ Cache-friendly (contiguous memory).
- ✅ Random access in O(1).
- ❌ Inserting / removing in the middle is O(n).
- ❌ Resizing requires copy.

**Common patterns:**
- Two pointers (start/end converging).
- Sliding window.
- Prefix sums (precompute partial sums for O(1) range queries).`,
      tags: ["fundamentals"],
    },
    {
      id: "linked-list",
      title: "Linked lists",
      difficulty: "easy",
      question: "What is a linked list and when is it preferred over an array?",
      answer: `A **linked list** stores elements in nodes; each node holds a value and a pointer to the next node (and optionally previous in a doubly-linked list).

\`\`\`
[1] -> [2] -> [3] -> [4] -> null
\`\`\`

| Operation                         | Singly | Doubly |
|-----------------------------------|--------|--------|
| Access by index                   | O(n)   | O(n)   |
| Insert / delete at head           | O(1)   | O(1)   |
| Insert / delete at tail (with tail ptr) | O(1) | O(1) |
| Insert / delete given a node      | O(1) (after find) | O(1) |
| Search                            | O(n)   | O(n)   |

**When to prefer over array:**
- Frequent insert/delete in the **middle** when you already hold a reference to the node.
- Don't need random access.
- Implementing **stacks, queues, hash-map buckets, LRU caches**.

**When arrays win:**
- Random access by index.
- Cache locality (linked nodes scatter in memory; arrays are contiguous → much faster in practice for typical use).
- Memory overhead — each node has a pointer (8 bytes per direction).

**Classic problems:** reverse a linked list, detect cycle (Floyd's tortoise + hare), merge two sorted lists, find Nth-from-end (two pointers).`,
      tags: ["fundamentals"],
    },
    {
      id: "stack-queue",
      title: "Stacks and queues",
      difficulty: "easy",
      question: "What are stacks and queues?",
      answer: `**Stack** (LIFO — Last-In-First-Out): \`push\`, \`pop\`, \`peek\`, all O(1).

\`\`\`
push: 1 → 2 → 3   pop: 3 → 2 → 1
\`\`\`

**Queue** (FIFO — First-In-First-Out): \`enqueue\`, \`dequeue\`, all O(1).

\`\`\`
enqueue: A B C   dequeue: A then B then C
\`\`\`

**Implementations:**
- Stack: dynamic array or singly-linked list.
- Queue: linked list with head + tail pointers, or **circular buffer**, or two stacks.

**Variants:**
- **Deque** — double-ended queue (both ends O(1)). Used as the building block for sliding-window problems and \`O(1)\` LRU caches.
- **Priority queue** — not a real queue; usually a heap (covered separately).
- **Monotonic stack/queue** — clever variants for specific problems (next greater element, sliding window max).

**Where they show up:**
- Stack — recursion, expression parsing, undo, DFS, balanced parentheses, RPN.
- Queue — BFS, scheduling, event loops, message buffers, request handling.
- Deque — sliding window problems, LRU caches.`,
      tags: ["fundamentals"],
    },
    {
      id: "hash-map",
      title: "Hash maps and hash sets",
      difficulty: "easy",
      question: "How do hash maps work?",
      answer: `A **hash map** stores \`key → value\` pairs with **average O(1)** insertion, lookup, and deletion. Backed by an array; a **hash function** maps each key to an index.

**Collision handling:**
- **Separate chaining** — each bucket holds a linked list (or balanced tree, e.g. Java 8+).
- **Open addressing** — find the next empty slot (linear probing, quadratic, double hashing).

**Load factor** = elements / buckets.
- Typically resize when load > 0.75; rehash everything (amortized O(1)).

**Worst case:** O(n) when all keys hash to one bucket. Mitigated by:
- Strong hash functions.
- Tree-based buckets (Java/HashMap → red-black tree on a long chain).
- **Hash flooding mitigations** — randomized seeds (HashDoS protection).

**Hash sets:** same structure, only keys (no values). Fast membership check.

**When to use:**
- Counting frequencies.
- Caching computed values.
- Fast lookup by ID.
- Detecting duplicates.

**When NOT to:**
- Need ordering — use a balanced BST (\`TreeMap\`, \`std::map\`).
- Need range queries.
- Memory-constrained — hash maps have overhead.

**Languages:** \`Map\` (JS), \`dict\` (Python), \`HashMap\` (Java), \`std::unordered_map\` (C++).`,
      tags: ["fundamentals"],
    },
    {
      id: "binary-tree",
      title: "Binary trees and BSTs",
      difficulty: "easy",
      question: "What are binary trees and binary search trees?",
      answer: `**Binary tree** — each node has at most 2 children (left, right). General-purpose hierarchy.

**Binary Search Tree (BST)** — binary tree with the invariant: left subtree < node < right subtree. Enables O(h) operations where h is height.

| Operation       | Average BST | Worst (unbalanced) |
|-----------------|-------------|---------------------|
| Search          | O(log n)    | O(n)                |
| Insert          | O(log n)    | O(n)                |
| Delete          | O(log n)    | O(n)                |
| In-order traverse | O(n)      | O(n)                |

**Why "worst O(n)"?** Inserting sorted data into a plain BST → degenerates into a linked list.

**Self-balancing BSTs** keep height O(log n):
- **AVL tree** — strict balance; faster lookups, slower inserts.
- **Red-Black tree** — looser balance; used in many language standard libraries (Java TreeMap, C++ std::map).
- **Treap, Splay tree** — probabilistic alternatives.

**Traversals:**
- **In-order** (left, root, right) — gives sorted sequence on a BST.
- **Pre-order** (root, left, right).
- **Post-order** (left, right, root).
- **Level-order** (BFS).

**Use cases:**
- Sorted set / map with range queries.
- Database indexes (B-trees are an extension).
- Auto-completion (with character-level structure).`,
      tags: ["trees", "fundamentals"],
    },
    {
      id: "heap",
      title: "Heaps and priority queues",
      difficulty: "easy",
      question: "What is a heap?",
      answer: `A **heap** is a complete binary tree with a **heap property**:
- **Min-heap** — every parent ≤ its children (root is the minimum).
- **Max-heap** — every parent ≥ its children (root is the maximum).

Stored as an **array** (no pointers). For node at index \`i\`:
- Parent: \`(i - 1) / 2\`
- Left child: \`2i + 1\`, right: \`2i + 2\`

| Operation             | Time     |
|-----------------------|----------|
| Insert (push)         | O(log n) |
| Get min/max (peek)    | O(1)     |
| Extract min/max (pop) | O(log n) |
| Build from array      | O(n)     |

**Implementation tricks:**
- Insert: append at end, **sift up** until heap property holds.
- Pop: swap root with last, remove last, **sift down**.
- **Heapify** (build heap from array) is O(n) — much better than n inserts of O(log n).

**Used as priority queue:**
- Job scheduling (highest priority first).
- Top-K problems.
- Dijkstra's shortest path.
- A* search.
- Median maintenance (two heaps).
- Merge K sorted lists.

**Languages:**
- JS: no built-in (use libraries or implement).
- Python: \`heapq\` (min-heap; negate for max).
- Java: \`PriorityQueue\`.
- C++: \`std::priority_queue\` (max-heap by default).`,
      tags: ["trees", "fundamentals"],
    },
    {
      id: "graphs",
      title: "Graphs",
      difficulty: "easy",
      question: "How are graphs represented?",
      answer: `A **graph** = a set of **vertices (V)** and **edges (E)** between them. Directed or undirected; weighted or unweighted.

**Two common representations:**

**Adjacency list** (most common):
\`\`\`
{
  A: [B, C],
  B: [C],
  C: [D],
  D: []
}
\`\`\`
- Space: O(V + E).
- Iterate neighbors: O(deg(v)).
- Add edge: O(1).
- Check if edge exists: O(deg(v)).

**Adjacency matrix:**
\`\`\`
   A B C D
A [0 1 1 0]
B [0 0 1 0]
C [0 0 0 1]
D [0 0 0 0]
\`\`\`
- Space: O(V²).
- Edge check: O(1).
- Iterate neighbors: O(V).
- Best for dense graphs.

**Edge list:** \`[(A, B), (B, C), ...]\` — simplest, used as input or for algorithms like Kruskal's.

**Real-world graph types:**
- **DAG** (Directed Acyclic Graph) — dependencies, build systems.
- **Tree** — connected, undirected, no cycles.
- **Bipartite** — two disjoint vertex sets.
- **Weighted** — edges have costs (distance, capacity, time).

**Common operations:**
- Traverse: BFS, DFS.
- Shortest path: BFS (unweighted), Dijkstra (positive weights), Bellman-Ford (negatives), Floyd-Warshall (all pairs).
- Topological sort (DAG ordering).
- Connectivity (Union-Find).
- Cycle detection.`,
      tags: ["fundamentals"],
    },
    {
      id: "string",
      title: "Strings",
      difficulty: "easy",
      question: "What's special about strings as a data structure?",
      answer: `Strings are **arrays of characters** with extra constraints — usually immutable in modern languages.

**Encoding matters:**
- **ASCII** — 1 byte per char, 128 codepoints.
- **UTF-8** — 1-4 bytes per Unicode codepoint. JS/Java strings expose UTF-16, which complicates indexing for emoji and CJK.
- **Indexing into UTF-16 by char index can split a surrogate pair.** Use grapheme-aware libraries when iterating user-visible characters.

**Immutability:**
- JS, Java, Python strings are immutable. Concatenation creates new strings → quadratic for naive loops.
- Use **\`StringBuilder\`** (Java), \`array.push + join\` (JS), \`io.StringIO\` (Python) or list-of-chars + join.

**Common algorithms:**
- **Two pointers** for palindrome / pattern checks.
- **Sliding window** for substring problems.
- **Hashing** for substring search (Rabin-Karp, rolling hash).
- **KMP / Boyer-Moore / Z-algorithm** — fast pattern matching.
- **Trie** — prefix-based lookups.
- **Suffix array / suffix tree** — substring problems at scale.

**Tricks for interviews:**
- 26-element array for lowercase frequency counts (faster than HashMap).
- \`s1 + s1\` contains all rotations of \`s1\` — useful for "rotation of" problems.
- Sorted character set as a key for anagram grouping.`,
      tags: ["fundamentals"],
    },
    {
      id: "matrix",
      title: "2D matrices",
      difficulty: "easy",
      question: "How do you work with 2D arrays?",
      answer: `A **2D matrix** is an array of arrays. Most languages store row-major (one row's elements contiguous).

**Access:** \`m[r][c]\` — O(1).

**Common patterns:**
- **Iterate row by row, col by col**.
- **Spiral traversal** (move right, down, left, up).
- **Diagonals** — \`r + c\` for anti-diagonals; \`r - c\` for main diagonals.
- **Transpose** — swap \`m[i][j]\` with \`m[j][i]\` for i < j.
- **Rotate 90°** — transpose + reverse rows.
- **Flood fill** — BFS/DFS from a cell, treat matrix as graph (4 or 8 neighbors).
- **Prefix sums** — \`prefix[r][c] = sum of submatrix (0,0) to (r,c)\`. O(1) submatrix sum queries.

**In-place tricks:**
- Use a sentinel (negative numbers, special values) to mark cells without extra space.
- Use the matrix's first row/column as bookkeeping.

**Memory layout:**
- Cache-friendly: iterate inner index in inner loop (rows in row-major).
- Cache-unfriendly: column-major access.

**Sparse matrices:**
- Store only non-zero entries: \`Map<(r, c), value>\` or coordinate list.
- Useful when most cells are zero (graphs, large grids).

**Common interview problems:**
- Word search (DFS).
- Number of islands (BFS / Union-Find).
- Rotate image.
- Set zeroes.
- Spiral order.`,
      tags: ["arrays", "fundamentals"],
    },

    // ───── MEDIUM ─────
    {
      id: "trie",
      title: "Tries",
      difficulty: "medium",
      question: "What is a trie?",
      answer: `A **trie** (prefix tree) is a tree where each edge represents a character. Strings are stored along paths from the root.

\`\`\`
       (root)
      /  |   \\
     c   t    a
     |   |    |
     a   o    n
     |   |
     t  (end)
   (end)
\`\`\`

| Operation                  | Time |
|----------------------------|------|
| Insert string of length L  | O(L) |
| Search for string          | O(L) |
| Search for prefix          | O(L) |

**Comparison vs hash map:**
- Trie: O(L) — independent of dictionary size n.
- Hash map: O(L) hash + lookup, but O(L × n) for prefix iteration.

**Space:** O(N × σ) where σ is alphabet size — can be heavy. Use compressed nodes (radix trees) or hash-based children for memory efficiency.

**Use cases:**
- **Autocomplete** — fastest prefix lookup.
- **Spell-checkers** — find words within edit distance.
- **IP routing** — longest-prefix matches.
- **Word games** — Boggle, Scrabble validation.
- **Dictionary problems** — large set of words queried by prefix.

**Variants:**
- **Compressed trie / Radix tree** — collapse single-child paths.
- **Suffix tree** — all suffixes; substring search in O(|pattern|).
- **Aho-Corasick** — multi-pattern matching with failure links.

**Implementation tip:** for lowercase English, use a fixed array of 26 children per node — faster than a hash map for hot paths.`,
      tags: ["trees"],
    },
    {
      id: "balanced-bst",
      title: "Balanced BSTs",
      difficulty: "medium",
      question: "How does a balanced BST stay balanced?",
      answer: `Balanced BSTs maintain **height O(log n)** through automatic rebalancing on insert/delete.

**AVL tree:**
- Strict: left and right subtree heights differ by ≤ 1.
- Rotations after each insert/delete restore balance.
- Faster lookups than red-black; slower inserts.

**Red-Black tree:**
- Looser: longest path is at most 2× shortest.
- Properties: nodes colored red/black; root and leaves black; no two reds in a row; equal black-height on all paths.
- Used in **Java TreeMap, C++ std::map, Linux CFS scheduler**.

**Splay tree:**
- Recently-accessed nodes move toward the root.
- Amortized O(log n).
- Self-adjusting; great for non-uniform access patterns.

**Treap:**
- BST by key + heap by random priority.
- Probabilistic balance — expected O(log n).
- Simpler implementation than AVL/RB.

**Why we have so many:**
- Different operation profiles (read-heavy vs write-heavy).
- Memory overhead (color bits, height, priority).
- Implementation simplicity vs raw performance.

**Modern reality:**
- For sorted set/map: language built-ins (TreeMap, std::map) — almost always red-black.
- For databases: **B-trees** (covered separately) — disk-friendly variants.
- For programming interviews: focus on **concept** (rotations, invariants); rarely asked to implement.`,
      tags: ["trees"],
    },
    {
      id: "btree",
      title: "B-trees",
      difficulty: "medium",
      question: "What is a B-tree and why do databases use it?",
      answer: `A **B-tree** is a self-balancing search tree where each node holds **multiple keys** (typically 100s-1000s). Designed for **block storage** — minimizes disk reads.

**Properties:**
- Each node contains [m/2, m] keys (m = order).
- All leaves at the same depth.
- Searching, insertion, deletion: O(log_m n).

**Why disk-friendly:**
- Each node loaded with one disk page read.
- Wide nodes mean low height — log base 1000 of 1 billion ≈ 3.
- 3 disk reads to find any record in a billion-row table.

**B+ tree** (variant used by most databases):
- All values stored at **leaf level**.
- Leaves linked together → fast range scans.
- Internal nodes hold only keys (more keys per node → wider).

**Operations:**
- **Insert** — find leaf, add key; split if full, propagate splits up.
- **Delete** — remove from leaf; merge or borrow from siblings if underflow.

**Used in:**
- **Postgres, MySQL InnoDB, SQL Server, Oracle** — primary key + secondary indexes.
- **Filesystems** (HFS+, NTFS, ext4 hashes).
- **WiredTiger** (MongoDB) — B+ tree variant.

**Comparison with hash indexes:**
- Hash index: O(1) lookup but no range queries.
- B+ tree: O(log n) lookup, fast range scans, sorted output for free.

**LSM trees** (Cassandra, RocksDB) are the modern alternative for write-heavy workloads.`,
      tags: ["trees", "databases"],
    },
    {
      id: "lru-cache",
      title: "LRU cache",
      difficulty: "medium",
      question: "How do you implement an LRU cache in O(1)?",
      answer: `**LRU (Least Recently Used)** evicts the entry that was accessed longest ago when the cache is full.

**Standard implementation:** **HashMap + doubly-linked list**.

\`\`\`
HashMap<Key, Node>
     ↓
Doubly-linked list:  HEAD ↔ A ↔ B ↔ C ↔ TAIL
                    (most recent)        (least recent)
\`\`\`

- **\`get(k)\`** — HashMap lookup; move node to head; return value. **O(1)**.
- **\`put(k, v)\`** — if exists update value + move to head; else insert at head, evict tail if over capacity. **O(1)**.

**Why both structures:**
- HashMap: O(1) lookup by key.
- Doubly-linked list: O(1) move-to-head and remove.

**Code skeleton (JS):**
\`\`\`js
class LRU {
  constructor(cap) { this.cap = cap; this.map = new Map(); }
  get(k) {
    if (!this.map.has(k)) return -1;
    const v = this.map.get(k);
    this.map.delete(k); this.map.set(k, v);   // re-insert moves to most recent
    return v;
  }
  put(k, v) {
    if (this.map.has(k)) this.map.delete(k);
    else if (this.map.size >= this.cap) this.map.delete(this.map.keys().next().value);
    this.map.set(k, v);
  }
}
\`\`\`

**JavaScript trick:** \`Map\` preserves insertion order, so we can skip the linked list and just delete + re-insert.

**Variants:**
- **LFU** (Least Frequently Used).
- **TinyLFU**, **2Q**, **ARC** — better hit rates than plain LRU under realistic workloads.
- **Redis allkeys-lru / allkeys-lfu** — real-world LRU at scale.`,
      tags: ["caching", "interview-classic"],
    },
    {
      id: "union-find",
      title: "Union-Find (Disjoint Set)",
      difficulty: "medium",
      question: "What is the Union-Find data structure?",
      answer: `**Union-Find** (also Disjoint Set Union, DSU) tracks a partition of elements into disjoint sets, supporting:

- **\`find(x)\`** — return the representative of x's set.
- **\`union(x, y)\`** — merge x's and y's sets.

**Naive:** O(n) per operation. With **two optimizations**, both become **nearly O(1)** (\`α(n)\` — inverse Ackermann, ≤ 4 for any practical n):

**1. Path compression:**
\`\`\`
find(x):
  if parent[x] != x:
    parent[x] = find(parent[x])   // flatten the tree
  return parent[x]
\`\`\`

**2. Union by rank/size:**
- Attach smaller tree under larger.
- Keeps tree shallow.

**Use cases:**
- **Connectivity** in graphs.
- **Kruskal's MST** — adding an edge unions endpoints; reject if same component.
- **Cycle detection** in undirected graphs.
- **Number of islands** (matrix → cells unioned with neighbors).
- **Equivalence classes** (e.g. account merging in databases).
- **Online dynamic connectivity**.

**Why interviewers love it:**
- Elegant, simple to implement (~30 lines).
- Surprisingly powerful for graph problems.
- Often unlocks O(n α(n)) solutions where naive is O(n²).

**Memory:** two arrays of size n (\`parent\`, \`rank\`).

**Implementation note:** path compression alone or union by rank alone gives O(log n); both together give O(α(n)).`,
      tags: ["graphs", "advanced"],
    },
    {
      id: "segment-tree",
      title: "Segment trees and Fenwick trees",
      difficulty: "medium",
      question: "What are segment trees and Fenwick trees?",
      answer: `Both answer **range queries** on arrays — sum, min, max, gcd — in O(log n) after O(n) preprocessing.

**Segment tree:**
- Binary tree where each node represents a range.
- Stored as array of size 4n.
- Supports range queries + point updates **AND range updates with lazy propagation**.

\`\`\`
        [0..7]
       /      \\
   [0..3]    [4..7]
   /    \\    /    \\
 [0..1][2..3][4..5][6..7]
\`\`\`

**Operations:**
- Build: O(n).
- Query: O(log n).
- Update: O(log n).

**Fenwick tree (Binary Indexed Tree, BIT):**
- Compact array-based structure.
- Supports prefix sums + point updates.
- Simpler and faster than segment tree but limited (no range updates without tricks).

\`\`\`
update(i, delta):
  while i < n: tree[i] += delta; i += i & -i
query(i):
  sum = 0; while i > 0: sum += tree[i]; i -= i & -i
  return sum
\`\`\`

**When to use:**
- **Frequent range queries** + point updates.
- **Online algorithms** where data changes between queries.
- **Competitive programming** — these structures appear frequently.

**Practical alternatives:**
- For static range queries: **prefix sums** (O(1) query, O(n) build).
- For min/max queries on static arrays: **sparse table** (O(1) query, O(n log n) build).
- For complex range updates: **segment tree with lazy propagation**.

Rarely needed in production code unless you're building specific systems (database internals, geo systems, time-series engines).`,
      tags: ["advanced"],
    },
    {
      id: "skip-list",
      title: "Skip lists",
      difficulty: "medium",
      question: "What is a skip list?",
      answer: `A **skip list** is a probabilistic alternative to balanced BSTs. It's a sorted linked list with multiple levels — higher levels skip multiple elements, allowing O(log n) search.

\`\`\`
Level 3:  HEAD --------> 30 ------------------> NIL
Level 2:  HEAD ----> 10 -> 30 ----> 50 ------> NIL
Level 1:  HEAD -> 5 -> 10 -> 30 -> 40 -> 50 -> NIL
\`\`\`

Each node has a random number of forward pointers (geometric distribution → expected log n).

**Operations:**
- Search: start at top level; move right while next < target; drop level. O(log n) expected.
- Insert: search position, randomly choose level, splice in.
- Delete: splice out.

**Why skip lists matter:**
- **Simpler implementation** than red-black or AVL trees.
- **Lock-friendly** — used in concurrent data structures (LinkedHashMap variants, ConcurrentSkipListMap in Java).
- **Used in Redis** sorted sets (with hash map for O(1) score lookup).
- **LevelDB / RocksDB** memtable.

**Vs balanced BST:**
- Skip list: probabilistic O(log n), simpler concurrency.
- Balanced BST: deterministic O(log n), more memory-efficient.

**Implementation tip:** randomly promote nodes with p = 0.5 — expected height = log₂ n. Adjust p to trade space for speed.`,
      tags: ["advanced"],
    },
    {
      id: "bloom-filter",
      title: "Bloom filters",
      difficulty: "medium",
      question: "What is a Bloom filter?",
      answer: `A **Bloom filter** is a space-efficient probabilistic structure that tests **set membership**.

- **No false negatives** — if it says "not present", definitely not in the set.
- **False positives** — may say "probably present" when it's not.

**Structure:**
- Bit array of size **m**.
- **k** independent hash functions.

**Operations:**
- **Insert(x):** set bits at indices \`h₁(x), h₂(x), ..., hₖ(x)\`.
- **Contains(x):** check those bits; if all 1 → "probably present"; any 0 → definitely absent.

**False positive rate:**
- Approximately \`(1 - e^(-kn/m))^k\`.
- Optimal k = (m/n) ln 2.
- Tunable: pick m for desired false positive rate, n is expected element count.

**Use cases:**
- **Database query optimization** — Cassandra, HBase, BigTable use Bloom filters per SSTable to skip files that don't contain a key.
- **Caching** — check Bloom filter before expensive cache miss path.
- **CDN cache pre-filtering**.
- **Spell checkers** — quick "is this word in the dictionary?".
- **Network protocols** — duplicate detection.

**Limitations:**
- Cannot delete (use **counting Bloom filters** for that).
- Cannot enumerate elements.
- Need to size m up front; resizing requires rebuilding.

**Variants:**
- **Counting Bloom** — supports deletion at cost of larger size.
- **Cuckoo filter** — supports deletion, similar space efficiency, slightly better lookup performance.
- **HyperLogLog** — different problem (approximate cardinality), often confused.`,
      tags: ["probabilistic", "advanced"],
    },
    {
      id: "graph-representations",
      title: "When to use which graph representation",
      difficulty: "medium",
      question: "Adjacency list vs matrix — when to pick each?",
      answer: `**Adjacency list** (\`Map<V, List<V>>\`):
- Space: **O(V + E)**.
- Edge query: **O(deg(v))**.
- Iterate neighbors: O(deg(v)) — efficient.
- Add edge: O(1).
- Remove edge: O(deg(v)).

**Adjacency matrix** (V × V boolean / weight):
- Space: **O(V²)**.
- Edge query: **O(1)**.
- Iterate neighbors: O(V).
- Add edge: O(1).
- Remove edge: O(1).

**Use list when:**
- **Sparse graphs** (E ≪ V²) — most real-world graphs.
- Need to iterate neighbors fast (BFS/DFS).
- Memory matters.

**Use matrix when:**
- **Dense graphs** (E ≈ V²).
- Need fast edge lookups (e.g. Floyd-Warshall).
- Matrix operations naturally apply (PageRank, transitive closure).

**Edge list:**
- For algorithms processing edges (Kruskal MST).
- Easy to read from input files.

**Hybrid for performance:**
- Compressed Sparse Row (CSR) format: arrays for offsets + neighbors. Cache-friendly, used in graph databases and scientific computing.

**Real systems:**
- **Neo4j** — index-free adjacency (pointers between nodes).
- **GraphX, Spark GraphFrames** — distributed CSR.
- **NetworkX (Python)** — dict-of-sets.

**Specialty:**
- **Inverted lists** for bipartite or hyper-edge graphs.
- **Quad-tree / R-tree** for geometric graphs.`,
      tags: ["graphs"],
    },
    {
      id: "circular-buffer",
      title: "Circular buffers (ring buffers)",
      difficulty: "medium",
      question: "What is a circular buffer?",
      answer: `A **circular buffer** is a fixed-size buffer with two pointers (\`head\`, \`tail\`) that wrap around when reaching the end. Implements a queue or producer-consumer with **O(1) enqueue and dequeue** in fixed memory.

\`\`\`
[_, _, A, B, C, _]   ← linear view
       ↑           ↑
      head        tail
\`\`\`

**Operations:**
- **Enqueue:** write at \`tail\`, advance (\`tail = (tail + 1) % capacity\`).
- **Dequeue:** read at \`head\`, advance.
- **Full** when \`(tail + 1) % cap == head\` (lose 1 slot to distinguish full from empty), or use a separate \`size\` counter.

**Why use it:**
- **Fixed memory** — no allocations after initial setup.
- **No copying** unlike resizing arrays.
- **Cache-friendly** — contiguous memory.
- **Lock-free variants** (single-producer-single-consumer) used in high-perf systems.

**Use cases:**
- **Logging buffers** — keep last N log entries.
- **Audio / video pipelines** — fixed sample buffer.
- **Real-time systems** — predictable performance.
- **Networking** — TCP receive buffers, packet queues.
- **OS kernel** — keyboard buffer, device drivers.

**Producer-consumer (lock-free):**
- One thread writes (advances tail).
- Another reads (advances head).
- Atomic ops on indices.
- Used in **disruptor pattern** (LMAX Disruptor — millions of msgs/sec).

**Vs unbounded queue:**
- Bounded → backpressure → no OOM.
- Unbounded → simpler but risks unbounded memory.

**Variants:**
- **Double-buffer** — write to one, read from other; swap.
- **Multi-producer multi-consumer ring buffers** — much harder; see Disruptor papers.`,
      tags: ["buffers"],
    },
    {
      id: "priority-queue-uses",
      title: "Priority queue applications",
      difficulty: "medium",
      question: "Where do priority queues show up?",
      answer: `**Priority queue** = retrieve element with highest (or lowest) priority in O(log n). Backed by a heap.

**Applications:**

**1. Dijkstra's shortest path:**
- Pop node with smallest known distance.
- Update neighbors, push back if improved.
- O((V + E) log V).

**2. A* pathfinding:**
- Pop node with smallest \`f = g + h\`.
- Same shape as Dijkstra.

**3. Top-K problems:**
- Stream of numbers; want top K largest.
- Maintain min-heap of size K — push everything, pop when > K.
- O(n log K) — much better than O(n log n) sort.

**4. Median maintenance:**
- Two heaps: max-heap of lower half, min-heap of upper half.
- Median is heap top(s).
- Each insert is O(log n).

**5. Task scheduling:**
- OS process scheduler picks highest-priority ready process.
- Job queues (SQS doesn't natively prioritize, but Redis sorted sets do).

**6. Merge K sorted lists:**
- Heap of (value, listIdx) pairs.
- Pop smallest, push next from same list.
- O(N log K).

**7. Event simulation:**
- Process events in chronological order.
- Pop earliest event, advance simulation, push new events.

**8. Huffman coding:**
- Min-heap of frequencies; merge two smallest into a new node; repeat.

**9. Prim's MST:**
- Like Dijkstra but tracks edges added to the tree.

**10. Web request prioritization:**
- VIP traffic, premium customers, critical alerts go first.

**Implementation note:** in Python use \`heapq\`; for max-heap negate values. In Java \`PriorityQueue\` (min-heap by default).`,
      tags: ["heap", "patterns"],
    },

    // ───── HARD ─────
    {
      id: "tries-suffix",
      title: "Suffix arrays and trees",
      difficulty: "hard",
      question: "What are suffix arrays and suffix trees?",
      answer: `Both index **all suffixes** of a string for fast substring queries.

**Suffix tree:**
- Compressed trie of all suffixes.
- O(n) space (with edge compression).
- Build in O(n) using Ukkonen's algorithm (complex).
- **Substring search in O(|pattern|)** — same as a trie of just patterns but built in advance from the text.

**Suffix array:**
- Array of integers — start positions of suffixes in sorted order.
- O(n) space (much less than suffix tree's constant).
- Build in O(n log n) (or O(n) with DC3 algorithm).
- **Substring search in O(|pattern| log n)** with binary search.
- Pair with **LCP array** for richer queries.

**Why two structures:**
- Suffix tree: faster queries, complex implementation, more memory.
- Suffix array: simpler, less memory, slightly slower; production systems prefer it.

**Use cases:**
- **Bioinformatics** — DNA / protein sequence alignment, BWA, BWT.
- **Text indexing** — full-text search engines (sometimes; usually inverted indexes win).
- **Compression** — Burrows-Wheeler Transform (used in bzip2).
- **Plagiarism detection** — find longest common substring.
- **Repeats / palindromes** finding in linear time.

**Languages:**
- Python: \`pysais\`, \`sufarray\`.
- C++: SA-IS algorithms in competitive programming libraries.
- Java: less common; libraries exist.

**Production reality:** rare in app code; common in low-level systems and bioinformatics.`,
      tags: ["strings", "advanced"],
    },
    {
      id: "concurrent-ds",
      title: "Concurrent data structures",
      difficulty: "hard",
      question: "What concurrent data structures should you know?",
      answer: `Multi-threaded code needs **thread-safe** data structures. Locks are simple but slow under contention; **lock-free** variants use atomic operations (\`compare-and-swap\`).

**Common in standard libraries:**
- **\`ConcurrentHashMap\`** (Java) — segmented locking; readers don't block.
- **\`ConcurrentSkipListMap\`** (Java) — sorted, lock-free for reads.
- **\`std::atomic\`** + custom data structures (C++).
- **\`sync.Map\`** (Go) — read-heavy patterns.
- **\`crossbeam\`** (Rust) — lock-free channels, queues.

**Patterns:**
- **Read-write locks** — many readers OR one writer. Good when reads >> writes.
- **Fine-grained locking** — lock per bucket / per shard.
- **Optimistic concurrency** — try to commit; retry on conflict (versioned values).
- **Lock-free** — atomic CAS in a loop. Hard to write correctly.
- **Wait-free** — even stronger; every operation completes in bounded steps.

**Lock-free queues:**
- **Michael-Scott queue** — classic lock-free MPMC queue.
- **Disruptor / LMAX** — ring buffer for high throughput.

**Concurrency hazards:**
- **ABA problem** — pointer reused; CAS thinks nothing changed but value cycled. Solutions: hazard pointers, epochs, double-CAS with version tag.
- **Memory ordering** — different CPUs reorder reads/writes. Use \`memory_order_acquire/release\` in C++, \`volatile\` in Java (different semantics from C).

**For interviews:**
- Know \`ConcurrentHashMap\` is sharded; pick it over \`HashMap + synchronized\`.
- Know **immutable data structures** (persistent data structures) sidestep many concurrency issues.
- Mention CAS, ABA, memory barriers if asked.

**Production:** prefer high-level primitives (queues, channels, actors) over rolling your own lock-free.`,
      tags: ["concurrency", "advanced"],
    },
    {
      id: "persistent-ds",
      title: "Persistent (immutable) data structures",
      difficulty: "hard",
      question: "What are persistent data structures?",
      answer: `**Persistent data structures** keep all previous versions when modified — operations return new versions without mutating the old. Old and new share most of their structure for efficiency.

**Why use them:**
- **Functional programming** — values are immutable, simplifying reasoning.
- **Time-travel debugging** — see every past state.
- **Concurrent reads** — never need locks for readers.
- **Undo/redo** — every state is preserved.
- **Multi-version concurrency control** in databases (MVCC).

**Common types:**
- **Persistent list (cons-list)** — append in O(1), share tail.
- **Persistent vector / array** — Clojure's vector, **HAMT** (hash array mapped trie), 32-way branching → O(log₃₂ n) ≈ effectively O(1).
- **Persistent map** — same HAMT idea.
- **Persistent tree (RB or AVL)** — copy-on-write paths from root to leaf.
- **Finger trees** — efficient deque + concatenation.

**How they share structure:**
\`\`\`
old: A → B → C → D → E
new: A → B → C → D' → E (modified D)
\`\`\`
Path from root to changed leaf is **copied**; other branches **shared**. O(log n) extra memory per modification.

**Languages with first-class persistent:**
- **Clojure** — entire collections library.
- **Scala** — \`immutable.Map\`, \`immutable.Vector\`.
- **OCaml/Haskell** — persistent by default.
- **Immer.js / Immutable.js** — JavaScript libraries (Redux ecosystem).

**Performance trade-off:**
- Slower constant factors than mutable equivalents.
- But **safe to share across threads** with no synchronization.

**Where to use in real apps:**
- **Redux state** — every state transition is a new immutable object; React reconciliation benefits.
- **Functional cores in OO shells** — keep core logic pure; mutate only at boundaries.`,
      tags: ["advanced", "functional"],
    },
    {
      id: "specialized-trees",
      title: "Specialized trees",
      difficulty: "hard",
      question: "What are some specialized tree structures?",
      answer: `Beyond basic BSTs, several tree structures solve specific problems.

**Spatial / geometric:**
- **R-tree** — bounding boxes; geo databases (PostGIS, MongoDB 2dsphere).
- **Quad-tree** — 2D space partition; image processing, collision detection in games.
- **K-d tree** — k-dimensional space; nearest-neighbor search.
- **BSP tree** — binary space partition; 3D rendering (classic Doom engine).

**Search / indexing:**
- **B-tree / B+ tree** — disk-based indexes; databases.
- **Suffix tree / suffix array** — string indexing.
- **Trie / radix tree** — prefix search.
- **Patricia trie** — compressed bit-level trie; IP routing.

**Range / interval:**
- **Segment tree** — range queries with point updates.
- **Fenwick tree** — prefix sums.
- **Interval tree** — overlapping intervals; calendar conflict detection.
- **Range tree** — multi-dimensional range queries.

**Multi-dimensional:**
- **Octree** — 3D analog of quad-tree.
- **Cover tree** — fast nearest-neighbor in metric spaces.
- **HNSW** — hierarchical navigable small world; vector similarity (used by pgvector, Pinecone).

**Probabilistic / approximate:**
- **HyperLogLog** — approximate cardinality (not really a tree, but related).
- **Skip list** — probabilistic balanced tree alternative.

**Niche:**
- **Splay tree** — self-adjusting; recently-accessed at root.
- **Treap** — randomized BST.
- **Finger tree** — efficient deques + monoidal annotations.
- **Merkle tree** — cryptographic hash tree; blockchain, Git.

**Production reality:** most apps use just B-trees (DB), tries (autocomplete), and language-built-in red-black variants (\`TreeMap\`). Specialized trees appear in databases, search engines, games, and bioinformatics — knowing they exist helps you reach for the right tool.`,
      tags: ["advanced"],
    },
    {
      id: "spatial-index",
      title: "Spatial indexes (R-tree, Quad-tree, GeoHash)",
      difficulty: "hard",
      question: "How are spatial queries indexed?",
      answer: `Spatial queries — "find all points within this region", "nearest 5 cafes" — need indexes that respect 2D/3D geometry.

**R-tree:**
- Tree where each node is a **bounding rectangle** (MBR — minimum bounding rectangle).
- Children's MBRs fit inside parent's.
- Query: traverse all subtrees whose MBR intersects the query region.
- O(log n) typical; degraded for high overlap.
- **Used by:** PostGIS GiST, MongoDB 2dsphere, Elasticsearch geo, Lucene.

**Quad-tree:**
- Recursively divide 2D space into 4 quadrants.
- Each leaf holds points in its region; subdivide if too many.
- **Used by:** game collision detection, image compression, GIS rendering.

**Octree:**
- 3D analog of quad-tree (8 octants).
- 3D rendering, medical imaging.

**K-d tree:**
- Alternates split axes (x, then y, then x, ...).
- Good for nearest-neighbor in low dimensions.
- Curse of dimensionality after ~10 dimensions.

**GeoHash:**
- **String encoding** of (lat, lon) — nearby points have similar prefixes.
- Allows range scans on a string-indexed system (Redis, DynamoDB) for spatial proximity queries.
- Less accurate than R-tree but trivial to implement on top of any DB.
- 12-character GeoHash ≈ 1 cm precision.

**S2 / H3 (modern alternatives):**
- **S2** (Google) — sphere-aware cell IDs; better than GeoHash near poles.
- **H3** (Uber) — hexagonal cells; uniform neighbor distances; widely used.

**When to use which:**
- **Database with native spatial support (PostGIS)** — R-tree (GiST).
- **Quick proximity in Redis** — GeoHash or built-in GEO commands (sorted sets under the hood).
- **Real-time games** — Quad-tree.
- **Logistics/ride-sharing** — H3 cells.

**Vector similarity (high-dim):**
- HNSW, IVF — different problem; not spatial in 2D sense.`,
      tags: ["geo", "advanced"],
    },
    {
      id: "memory-vs-perf",
      title: "Memory vs performance trade-offs",
      difficulty: "hard",
      question: "How do you reason about memory vs performance trade-offs?",
      answer: `Most data structure choices are memory-vs-time trade-offs. Worth understanding the levers.

**More memory → faster:**
- **Hash maps** — O(1) lookup at cost of unused buckets (load factor < 1).
- **Indexes** — duplicate data in a sorted structure for fast lookup.
- **Materialized views** — precompute results; trade storage for query speed.
- **Caches** — duplicate hot data in faster storage tier.
- **Bloom filter pre-checks** — avoid expensive lookups for likely-absent items.

**Less memory → slower:**
- **Linked structures vs arrays** — pointers add overhead, but allow gaps.
- **Sparse representations** — hash map of (i, j) → value for mostly-empty matrices.
- **Compressed structures** — Roaring bitmaps, succinct data structures, prefix-coding.

**Cache locality:**
- Often beats Big-O. A cache-friendly O(n²) can outperform a cache-hostile O(n log n) for small n.
- **Arrays > linked lists** for small-to-medium sizes.
- **Struct of arrays** > **array of structs** for column-style access patterns.
- **Cache lines** are 64 bytes; pack hot data within them.

**Concurrent vs sequential:**
- Lock-free structures use atomic operations + retries → use more memory (versions, padding to avoid false sharing).
- **Disruptor** pattern: ring buffer with cache-line padding to avoid threads stepping on each other's caches.

**Real-world trade-off frameworks:**
- **Skyline queries** — pareto-optimal trade-offs.
- **Profile, then optimize.** Don't pre-optimize for cases your code never hits.

**Tools:**
- Memory profilers (heaptrack, Instruments).
- Cache profilers (perf, Cachegrind).
- Allocation tracers — find hot allocators.

**Rule of thumb:** until you measure, both your guess and the textbook complexity are likely wrong by an order of magnitude.`,
      tags: ["performance"],
    },
    {
      id: "merkle-tree",
      title: "Merkle trees",
      difficulty: "hard",
      question: "What is a Merkle tree?",
      answer: `A **Merkle tree** is a binary tree where:
- Leaves contain cryptographic hashes of data blocks.
- Internal nodes contain hashes of their children's hashes.
- The **root hash** is a fingerprint of all data.

\`\`\`
              root = H(H1H2)
            /                \\
       H1 = H(L1L2)        H2 = H(L3L4)
       /        \\          /        \\
   H(L1)    H(L2)      H(L3)      H(L4)
   ↓          ↓          ↓          ↓
   data1     data2     data3      data4
\`\`\`

**Properties:**
- **Tamper-evident** — change any data block → root hash changes.
- **Efficient verification** — to prove a block is in the tree, send the **Merkle path** (siblings on the path to root). O(log n) hashes vs O(n) for the whole dataset.

**Use cases:**
- **Bitcoin / blockchains** — every block has a Merkle root of all transactions.
- **Git** — every commit's tree is essentially a Merkle tree.
- **BitTorrent** — verify chunks against a Merkle root.
- **Database anti-entropy** — Cassandra / DynamoDB use Merkle trees to compare data ranges between replicas. Sync only diverging branches.
- **ZFS, Btrfs** — file system integrity.
- **Certificate Transparency** — append-only logs of public certs.
- **Distributed systems** — efficient comparison of large datasets.

**Anti-entropy example (Cassandra):**
- Two replicas compute Merkle trees over a range.
- Compare roots → if same, no work.
- If different, recurse into mismatched subtrees.
- Identify and ship only differing keys.

**Variants:**
- **Sparse Merkle trees** — efficient when most leaves are empty (state in blockchains).
- **Verkle trees** — newer; smaller proofs using polynomial commitments.`,
      tags: ["distributed", "crypto"],
    },
    {
      id: "lsm-vs-btree",
      title: "LSM trees vs B-trees",
      difficulty: "hard",
      question: "What's the difference between LSM trees and B-trees?",
      answer: `Both are storage engines for databases. Different trade-offs.

**B-tree (Postgres, MySQL InnoDB, SQLite):**
- **In-place updates** — modify pages directly.
- Reads are simple — single tree traversal.
- Writes do random I/O (page modifications scattered).
- Best for **read-heavy** OLTP workloads.

**LSM tree (Cassandra, RocksDB, LevelDB, HBase, ScyllaDB):**
- **Append-only** — writes go to in-memory **memtable**, periodically flushed to immutable **SSTables** on disk.
- Sequential writes → very fast.
- Reads may need to check **multiple SSTables** + memtable → bloom filters help.
- **Compaction** merges SSTables in background → write/space amplification.

| Feature              | B-tree              | LSM tree                    |
|----------------------|---------------------|------------------------------|
| Write latency        | Higher (random)     | Lower (sequential)           |
| Read latency         | Lower (one lookup)  | Higher (multiple SSTs)       |
| Space efficiency     | Higher (no dupes)   | Lower (multiple versions)    |
| Compaction overhead  | None (in-place)     | High (background)            |
| SSD wear             | Higher (random)     | Lower (sequential)           |
| Crash recovery       | WAL replay          | WAL replay + memtable rebuild |

**LSM is great for:**
- **Write-heavy workloads** — IoT, time-series, event logs.
- **Append-mostly** data.
- SSDs (sequential writes are kind to flash).

**B-tree is great for:**
- **Mixed read/write** with predictable latency.
- **Range queries** with sorted reads.
- **Strong consistency** (no compaction delays).

**Hybrid approaches:**
- **Postgres + extensions** like Tile38's hybrid.
- **MyRocks** — MySQL with RocksDB engine.
- **WiredTiger** (MongoDB) supports both LSM and B-tree configs.

**For interviews:** know that NoSQL databases like Cassandra and HBase are LSM-based, while traditional RDBMS are B-tree-based. The choice reflects workload assumptions.`,
      tags: ["databases", "advanced"],
    },
    {
      id: "consistent-hashing",
      title: "Consistent hashing",
      difficulty: "hard",
      question: "What is consistent hashing?",
      answer: `**Consistent hashing** distributes keys across servers so that **adding or removing a server only remaps ~K/N keys** (where K is total keys, N is server count) — instead of remapping nearly all keys with naive modulo hashing.

**The classic ring:**
- Map both keys and servers onto a circular hash ring (e.g. SHA-1 of identifier mod 2³²).
- Each key is owned by the **next server clockwise** on the ring.
- Add a server → only keys between the new server and its predecessor move.
- Remove a server → its keys move to the next server clockwise.

**Virtual nodes:**
- Each physical server registers many positions on the ring (e.g. 100-200 virtual nodes).
- Smooths out the load distribution; one big server can have more vnodes.
- Solves uneven distribution from random hashing.

**Use cases:**
- **DynamoDB, Cassandra, Riak** — key→shard mapping.
- **Memcached/Redis cluster** — client-side sharding.
- **Akamai** — original CDN application.
- **Distributed caches** in load balancers.

**Failures:**
- Server fails → its keys go to the next server (which may overload). Use replication (each key on 3 successive servers).
- Add/remove → minimal rebalancing, key data still mostly stays put.

**Alternatives:**
- **Jump consistent hash** (Google) — simpler, lower memory; harder to handle weighted nodes.
- **Rendezvous hashing (HRW)** — each key picks the server with highest hash(server, key); easier reasoning, slightly slower lookup.
- **Maglev hashing** (Google's load balancer) — pre-computed lookup table; fast and uniform.

**Trade-offs:**
- Consistent ring is widely understood and implemented.
- Modern systems often use Maglev or variants for performance.

**Memory overhead:** virtual nodes add memory but improve load distribution; tune count based on cluster size.`,
      tags: ["distributed", "advanced"],
    },
    {
      id: "data-structure-choice",
      title: "How to pick the right data structure",
      difficulty: "hard",
      question: "How do you pick the right data structure for a problem?",
      answer: `Ask three questions:

**1. What operations dominate?**
- Lookups by key → hash map.
- Lookups by range → sorted set / B-tree.
- Min/max repeatedly → heap.
- LIFO/FIFO → stack/queue.
- Membership only → set; or **Bloom filter** if approximate is OK.
- Prefix search → trie.
- Spatial queries → R-tree / Quad-tree / GeoHash.
- Connectivity → Union-Find.

**2. What are the constraints?**
- Memory tight → compressed structures, sparse representations.
- Concurrent access → ConcurrentHashMap, lock-free queues, persistent structures.
- Disk-based → B+ trees, LSM trees.
- Persistence (immutability) → HAMT-based vectors and maps.
- Streaming / online → reservoir sampling, count-min sketch, HyperLogLog.

**3. What are the query patterns?**
- Top-K → bounded heap.
- Sliding window aggregations → deque, Fenwick tree.
- Recently-accessed → LRU cache.
- Hierarchical / trees → graph + BFS/DFS.
- Time-based → time-bucketed structures, ring buffers.

**Anti-pattern guidance:**
- "Linked list because we modify the middle a lot" — usually arrays beat linked lists in practice (cache locality).
- "Tree because hierarchy" — flat structures with parent pointers often work better.
- "Custom hashing" — use language-built-in unless you have a measured reason.

**Iterate:**
- Start simple. Hash map covers 70% of problems.
- Profile.
- Specialize when measurements demand.
- Pick clarity over cleverness; readers thank you later.

**Books to learn from:**
- *Introduction to Algorithms* (CLRS) — comprehensive.
- *Programming Pearls* (Bentley) — case studies.
- *Algorithms, 4th ed* (Sedgewick) — visual.
- *Designing Data-Intensive Applications* (Kleppmann) — system-level data structures.`,
      tags: ["patterns"],
    },
  ],
};
