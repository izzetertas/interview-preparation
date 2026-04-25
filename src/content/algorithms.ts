import type { Category } from "./types";

export const algorithms: Category = {
  slug: "algorithms",
  title: "Algorithms",
  description:
    "Algorithms from Big-O and sorting to graph traversals, dynamic programming, divide and conquer, two pointers, sliding windows, and bit manipulation.",
  icon: "🧮",
  questions: [
    // ───── EASY ─────
    {
      id: "big-o",
      title: "Big-O notation",
      difficulty: "easy",
      question: "What is Big-O and why does it matter?",
      answer: `**Big-O** describes how an algorithm's resource use (time or memory) grows as input size **n** grows. Captures the worst-case asymptotic upper bound — ignoring constants and lower-order terms.

**Common complexities (sorted from fastest to slowest):**

| Notation       | Name              | Example                                |
|----------------|-------------------|----------------------------------------|
| O(1)           | Constant          | Hash map lookup                        |
| O(log n)       | Logarithmic       | Binary search                          |
| O(n)           | Linear            | Single pass through array              |
| O(n log n)     | Linearithmic      | Merge sort, heap sort                  |
| O(n²)          | Quadratic         | Bubble sort, naive nested loop         |
| O(n³)          | Cubic             | Floyd-Warshall, naive matrix multiply  |
| O(2ⁿ)          | Exponential       | Subset enumeration, naive Fibonacci    |
| O(n!)          | Factorial         | Permutations                           |

**Related notations:**
- **Big-Ω** — best case (lower bound).
- **Big-Θ** — tight bound (both upper and lower).
- **Amortized** — average over many operations (e.g. dynamic array \`push\` is amortized O(1)).

**Practical implications:**
- O(n²) on n = 10,000 → 10⁸ operations → ~seconds.
- O(n log n) on n = 1,000,000 → ~20M ops → milliseconds.
- O(2ⁿ) on n = 30 → already 10⁹ ops; n = 50 → 10¹⁵; n = 100 → unimaginable.

**Watch out for:**
- **Constants matter** for small n. O(n²) with small constant can beat O(n log n) for n < 100.
- **Cache behavior** — Big-O ignores it; in practice, it can dominate.
- **Hidden complexity** — \`arr.includes\` is O(n) inside a loop becomes O(n²).`,
      tags: ["fundamentals"],
    },
    {
      id: "sorting",
      title: "Sorting algorithms",
      difficulty: "easy",
      question: "What are the main sorting algorithms?",
      answer: `| Algorithm     | Best        | Average     | Worst       | Space     | Stable | In-place |
|---------------|-------------|-------------|-------------|-----------|--------|----------|
| Bubble        | O(n)        | O(n²)       | O(n²)       | O(1)      | ✅      | ✅        |
| Insertion     | O(n)        | O(n²)       | O(n²)       | O(1)      | ✅      | ✅        |
| Selection     | O(n²)       | O(n²)       | O(n²)       | O(1)      | ❌      | ✅        |
| Merge sort    | O(n log n)  | O(n log n)  | O(n log n)  | O(n)      | ✅      | ❌        |
| Quick sort    | O(n log n)  | O(n log n)  | O(n²)       | O(log n)  | ❌      | ✅        |
| Heap sort     | O(n log n)  | O(n log n)  | O(n log n)  | O(1)      | ❌      | ✅        |
| Counting sort | O(n + k)    | O(n + k)    | O(n + k)    | O(k)      | ✅      | ❌        |
| Radix sort    | O(d(n + k)) | O(d(n + k)) | O(d(n + k)) | O(n + k)  | ✅      | ❌        |
| Tim sort      | O(n)        | O(n log n)  | O(n log n)  | O(n)      | ✅      | ❌        |

**Tim sort** (hybrid of merge + insertion) is the default in **JavaScript V8, Python, Java**. Optimized for real-world data with partial order.

**Quick sort** is fastest in practice on random data despite the O(n²) worst case (with good pivot selection — random or median-of-three).

**Counting sort** beats comparison sorts when keys are integers in a small range (k = O(n)). Used inside radix sort.

**Sort isn't always optimal:**
- For top-K, use a heap — O(n log k).
- For kth element, use **quickselect** — O(n) average.
- For nearly-sorted data, insertion sort is fast.
- For external sorting (data > memory), use external merge sort with disk runs.

**Stable sort** preserves order of equal elements — important when sorting by multiple keys.`,
      tags: ["fundamentals"],
    },
    {
      id: "binary-search",
      title: "Binary search",
      difficulty: "easy",
      question: "How does binary search work, and where can you apply it beyond sorted arrays?",
      answer: `**Binary search** finds a target in a sorted array in O(log n).

\`\`\`js
function bsearch(arr, target) {
  let lo = 0, hi = arr.length - 1;
  while (lo <= hi) {
    const mid = lo + ((hi - lo) >> 1);    // avoids overflow
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}
\`\`\`

**Key invariants:**
- Loop ends when \`lo > hi\`.
- Use \`mid = lo + (hi - lo) / 2\` instead of \`(lo + hi) / 2\` to avoid integer overflow on large arrays.

**Beyond sorted arrays — "binary search on the answer":**

Whenever the answer space is monotonic (\`f(x)\` is true for all x ≥ k, false for x < k), you can binary-search for k.

**Examples:**
- **Find first / last occurrence** in sorted array with duplicates.
- **Square root** by binary search.
- **Capacity to ship within D days** — binary search on minimum capacity that fits all packages within D days.
- **Allocation problems** — binary search on max allowed value.
- **Speed eating bananas** — Koko's banana eating speed.
- **Find peak element**.

**Discretized search spaces:**
- **\`bsearch.lower_bound\` / \`upper_bound\`** style — find first index where condition flips.
- Off-by-one bugs are notorious — write the condition deliberately and test boundary cases.

**Time complexity:** O(log n) — but each iteration may do O(k) work to test the predicate, so total can be O(k log n).

**Sorted set / map equivalents:** Java's \`TreeMap.floorKey/ceilingKey\`, C++'s \`lower_bound/upper_bound\`.`,
      tags: ["fundamentals"],
    },
    {
      id: "two-pointers",
      title: "Two pointers",
      difficulty: "easy",
      question: "What is the two-pointer technique?",
      answer: `**Two pointers** uses two indices (often \`left\` and \`right\`) to traverse a structure together — usually in O(n) where naive solutions would be O(n²).

**Variants:**

**1. Opposite-end (converging):**
- Often on sorted arrays.
- \`left\` starts at 0, \`right\` at \`n-1\`; move toward each other.

\`\`\`js
function twoSum(arr, target) {   // sorted array
  let l = 0, r = arr.length - 1;
  while (l < r) {
    const sum = arr[l] + arr[r];
    if (sum === target) return [l, r];
    if (sum < target) l++; else r--;
  }
  return null;
}
\`\`\`

**2. Same direction (fast/slow):**
- One moves faster than the other.
- Floyd's tortoise + hare for cycle detection.
- Removing duplicates in-place.

\`\`\`js
function removeDuplicates(arr) {
  let slow = 0;
  for (let fast = 1; fast < arr.length; fast++) {
    if (arr[fast] !== arr[slow]) {
      slow++;
      arr[slow] = arr[fast];
    }
  }
  return slow + 1;
}
\`\`\`

**Common problems:**
- Two-sum / three-sum on sorted arrays.
- Container with most water.
- Reverse string in-place.
- Palindrome check.
- Linked list cycle detection.
- Move zeros / partition arrays.

**When to recognize the pattern:**
- Sorted input + searching for pairs/triples.
- Finding subarrays / substrings with specific property.
- In-place array manipulation.

**Variants:** **sliding window** is a related technique — left/right boundaries of a window grow/shrink based on conditions.`,
      tags: ["patterns"],
    },
    {
      id: "sliding-window",
      title: "Sliding window",
      difficulty: "easy",
      question: "What is the sliding window technique?",
      answer: `**Sliding window** maintains a sub-range of an array/string and slides it forward, expanding or contracting based on conditions.

**Two flavors:**

**1. Fixed-size window:**
- e.g. "max sum of any contiguous k elements."
- Window of size k slides; update sum by adding incoming and subtracting outgoing.
- O(n) instead of O(nk).

**2. Variable-size window:**
- Two pointers (\`left\`, \`right\`).
- Expand right; shrink left when condition violated.
- e.g. "longest substring with at most 2 distinct characters."

\`\`\`js
function longestSubstringKDistinct(s, k) {
  let left = 0, maxLen = 0;
  const count = new Map();
  for (let right = 0; right < s.length; right++) {
    count.set(s[right], (count.get(s[right]) ?? 0) + 1);
    while (count.size > k) {
      count.set(s[left], count.get(s[left]) - 1);
      if (count.get(s[left]) === 0) count.delete(s[left]);
      left++;
    }
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}
\`\`\`

**Common problems:**
- Longest substring without repeating characters.
- Minimum window substring containing all chars of T.
- Subarray sum equals target (with prefix sums + map).
- Find all anagrams of pattern in text.
- Maximum sum subarray of size k.
- Sliding window maximum (using a deque).

**Recognize when:**
- Looking for contiguous subarrays / substrings.
- "Longest" / "shortest" / "max" / "min" sub-range.
- Counting / frequency conditions on contiguous segments.

**vs two pointers:**
- Two pointers usually converge from opposite ends.
- Sliding window expands/contracts in the same direction.`,
      tags: ["patterns"],
    },
    {
      id: "recursion",
      title: "Recursion vs iteration",
      difficulty: "easy",
      question: "When should you use recursion?",
      answer: `**Recursion:** function calls itself with smaller subproblems. Two parts:
1. **Base case** — terminating condition.
2. **Recursive case** — call itself on smaller input.

\`\`\`js
function factorial(n) {
  if (n <= 1) return 1;          // base
  return n * factorial(n - 1);   // recursive
}
\`\`\`

**Use recursion when:**
- The problem has natural recursive structure (trees, graphs, divide & conquer).
- The recursive solution is much clearer than iterative (e.g. DFS, parsing).
- Backtracking (try, recurse, undo).
- Functional decomposition into pure subproblems.

**Concerns:**
- **Stack overflow** — each call adds a frame. Deep recursion crashes (typical limit ~10k frames).
- **Performance** — function calls have overhead; iteration usually faster for hot paths.
- **Tail call optimization (TCO)** — some languages (Scheme, OCaml, Scala) reuse stack frames for tail calls; JS spec has it but engines mostly don't implement it.

**Convert to iteration when:**
- Stack overflow is a real risk.
- The recursion is essentially a loop (linear recursion, accumulator).

**Convert recursion to iteration patterns:**
- **Linear recursion** → loop with accumulator.
- **Tail recursion** → trivial loop.
- **Tree recursion** (DFS) → explicit stack.
- **BFS-style** → explicit queue.

**Memoization for overlapping subproblems:**
- Recursive Fibonacci is O(2ⁿ); memoized is O(n).
- DP problems are often "recursion + memoization" or equivalent bottom-up loop.`,
      tags: ["fundamentals"],
    },
    {
      id: "bfs",
      title: "BFS (Breadth-First Search)",
      difficulty: "easy",
      question: "How does BFS work?",
      answer: `**BFS** explores a graph level by level — visits all neighbors of the start before going deeper.

\`\`\`js
function bfs(start, graph) {
  const visited = new Set([start]);
  const queue = [start];
  while (queue.length > 0) {
    const node = queue.shift();
    visit(node);
    for (const nb of graph[node]) {
      if (!visited.has(nb)) {
        visited.add(nb);
        queue.push(nb);
      }
    }
  }
}
\`\`\`

**Properties:**
- Time: O(V + E).
- Space: O(V) for queue + visited.
- **Finds shortest path in unweighted graphs** (fewest edges).

**Use cases:**
- Shortest path in unweighted graph.
- Level-order traversal of a tree.
- Find connected components.
- Bipartite check.
- Word ladder (BFS over word transformations).
- Shortest path on a grid (matrix as implicit graph).
- Network broadcast simulation.

**Variants:**
- **Bidirectional BFS** — search from both ends meet in the middle. O(b^(d/2)) instead of O(b^d).
- **0-1 BFS** — for graphs with edge weights 0 or 1; use deque.
- **Multi-source BFS** — start from multiple nodes simultaneously (rotting oranges, fire spread).

**vs DFS:**
- BFS finds shortest path; DFS doesn't.
- BFS uses queue; DFS uses stack (or recursion).
- BFS uses more memory in dense graphs (whole frontier in queue).
- DFS uses less memory but recurses deep.

**Implementation note:** \`queue.shift()\` is O(n) in JS arrays. For real performance, use a deque or circular buffer.`,
      tags: ["graphs", "fundamentals"],
    },
    {
      id: "dfs",
      title: "DFS (Depth-First Search)",
      difficulty: "easy",
      question: "How does DFS work?",
      answer: `**DFS** explores as deep as possible before backtracking. Implemented with recursion or explicit stack.

\`\`\`js
function dfs(node, graph, visited = new Set()) {
  if (visited.has(node)) return;
  visited.add(node);
  visit(node);
  for (const nb of graph[node]) {
    dfs(nb, graph, visited);
  }
}
\`\`\`

**Iterative version:**
\`\`\`js
function dfsIterative(start, graph) {
  const visited = new Set();
  const stack = [start];
  while (stack.length > 0) {
    const node = stack.pop();
    if (visited.has(node)) continue;
    visited.add(node);
    visit(node);
    for (const nb of graph[node]) stack.push(nb);
  }
}
\`\`\`

**Properties:**
- Time: O(V + E).
- Space: O(V) for stack + visited.

**Use cases:**
- Detect cycles in directed/undirected graphs.
- Topological sort (post-order).
- Find connected components.
- Articulation points / bridges (Tarjan's).
- Strongly connected components (Kosaraju, Tarjan).
- Maze solving / pathfinding when shortest is irrelevant.
- Tree traversals (in-order, pre-order, post-order).
- Backtracking puzzles (sudoku, n-queens).

**Tree traversals (DFS variants):**
- **Pre-order** — visit, recurse left, recurse right.
- **In-order** — recurse left, visit, recurse right (sorted on BST).
- **Post-order** — recurse left, recurse right, visit (delete trees, evaluate expressions).

**Cycle detection in directed graph:**
- Three colors: white (unvisited), gray (in stack), black (done).
- Edge to gray node → cycle.

**Pitfall:** stack overflow on deep graphs. Switch to iterative version when depth > ~10k.`,
      tags: ["graphs", "fundamentals"],
    },

    // ───── MEDIUM ─────
    {
      id: "dynamic-programming",
      title: "Dynamic programming",
      difficulty: "medium",
      question: "What is dynamic programming?",
      answer: `**Dynamic programming (DP)** solves problems by breaking them into overlapping subproblems and reusing solutions.

**Two requirements:**
1. **Optimal substructure** — optimal solution composed of optimal sub-solutions.
2. **Overlapping subproblems** — same subproblem solved multiple times.

**Two implementations:**

**Top-down (memoization):**
- Recursive solution + cache.
- Easier to write from a recursive definition.
- May have stack-depth issues.

\`\`\`js
function fib(n, memo = {}) {
  if (n in memo) return memo[n];
  if (n <= 1) return n;
  return memo[n] = fib(n - 1, memo) + fib(n - 2, memo);
}
\`\`\`

**Bottom-up (tabulation):**
- Iterative; build solutions from smaller to larger.
- Often more space-efficient (rolling arrays).

\`\`\`js
function fib(n) {
  let prev = 0, curr = 1;
  for (let i = 2; i <= n; i++) [prev, curr] = [curr, prev + curr];
  return curr;
}
\`\`\`

**Classic DP problems:**
- Fibonacci, climbing stairs.
- 0/1 knapsack.
- Longest common subsequence (LCS).
- Edit distance (Levenshtein).
- Coin change (unbounded knapsack).
- Longest increasing subsequence.
- Matrix chain multiplication.
- Shortest path (Bellman-Ford).
- Counting paths in grid.

**Recognizing DP:**
- "Find optimal" / "count ways" / "longest" / "shortest".
- Naive recursion has overlapping calls.
- Decisions at each step (take / skip).

**State design:**
- What does \`dp[i]\` (or \`dp[i][j]\`) represent?
- How does \`dp[i]\` relate to smaller indices?
- Order of filling matters in bottom-up.

**Space optimization:**
- If dp[i] only depends on dp[i-1], you don't need the whole array.

DP is the algorithmic equivalent of "remember what you've already done." Most exam-style algorithm questions involve some DP variant.`,
      tags: ["paradigm"],
    },
    {
      id: "greedy",
      title: "Greedy algorithms",
      difficulty: "medium",
      question: "What is the greedy algorithm approach?",
      answer: `**Greedy** makes the **locally best choice at each step**, hoping for a globally optimal solution.

**Works when:**
- Problem has a **greedy choice property** — local optimum leads to global optimum.
- **Optimal substructure** — solution after a greedy choice is also optimal.

**Classic greedy problems:**
- **Activity selection** — pick non-overlapping activities (sort by end time, take earliest-ending).
- **Coin change with canonical coins** — take largest coin ≤ remaining (only works for some coin systems!).
- **Huffman coding** — merge two smallest frequencies.
- **Minimum spanning tree** — Kruskal's (smallest edge first), Prim's (closest neighbor).
- **Dijkstra's shortest path** — pick closest unvisited node.
- **Fractional knapsack** — sort by value/weight ratio, take greedily.
- **Job scheduling with deadlines** — sort by deadline.
- **Interval scheduling**.

**Greedy fails on:**
- 0/1 knapsack — item sizes don't divide evenly. Need DP.
- Coin change with weird denominations (1, 3, 4 → greedy gives 6 = 4+1+1; optimal is 3+3).
- Many graph problems (shortest path with negative edges).

**How to verify greedy works:**
1. **Greedy choice property** — show local choice doesn't preclude optimal.
2. **Inductive argument** — assume greedy is optimal up to step k; show it stays optimal at k+1.
3. **Exchange argument** — show any non-greedy solution can be rearranged to greedy without getting worse.

**Recognize:**
- Sorted input often hints at greedy.
- "Always pick smallest/largest/earliest" patterns.
- DP-like problems where you can prove local choice works.

**vs DP:**
- Greedy: O(n log n) typically; doesn't backtrack.
- DP: O(n²) or worse; tries all combinations.
- Both have optimal substructure; only DP needs overlapping subproblems.`,
      tags: ["paradigm"],
    },
    {
      id: "divide-conquer",
      title: "Divide and conquer",
      difficulty: "medium",
      question: "What is divide and conquer?",
      answer: `**Divide and conquer** breaks a problem into smaller independent subproblems, solves each recursively, and combines results.

**Three steps:**
1. **Divide** — split into smaller subproblems.
2. **Conquer** — solve subproblems recursively.
3. **Combine** — merge their results.

**Classic algorithms:**
- **Merge sort** — split in half, sort each, merge.
- **Quick sort** — partition around pivot, sort halves.
- **Binary search** — discard half each step.
- **Strassen's matrix multiplication** — O(n^2.81) instead of O(n³).
- **Karatsuba multiplication** — O(n^1.58) instead of O(n²).
- **FFT** — polynomial multiplication in O(n log n).
- **Closest pair of points** in 2D — O(n log n).
- **Maximum subarray** (Kadane is faster but D&C version is instructive).

**Time complexity (Master theorem):**
- For T(n) = a·T(n/b) + O(n^d):
  - If d > log_b(a): O(n^d).
  - If d = log_b(a): O(n^d log n).
  - If d < log_b(a): O(n^(log_b a)).

**Examples:**
- Merge sort: T(n) = 2T(n/2) + O(n) → O(n log n).
- Binary search: T(n) = T(n/2) + O(1) → O(log n).

**Parallelism:**
- Subproblems are **independent** → naturally parallel.
- Used in fork-join frameworks, MapReduce.
- ParallelStream in Java, Rayon in Rust.

**vs DP:**
- D&C: subproblems **don't overlap**.
- DP: subproblems **overlap** → memoize.

**Recognize:**
- Problem can be cleanly split.
- Subproblems are similar to original.
- Combining results is straightforward.`,
      tags: ["paradigm"],
    },
    {
      id: "backtracking",
      title: "Backtracking",
      difficulty: "medium",
      question: "What is backtracking?",
      answer: `**Backtracking** explores all possibilities by **trying, recursing, and undoing** when a path fails. Like brute force but pruned.

**General template:**
\`\`\`js
function backtrack(state) {
  if (isSolution(state)) {
    record(state);
    return;
  }
  for (const choice of candidates(state)) {
    if (!isValid(state, choice)) continue;     // prune
    apply(state, choice);
    backtrack(state);
    undo(state, choice);                       // backtrack
  }
}
\`\`\`

**Classic problems:**
- **N-queens** — place queens row by row, prune if conflict.
- **Sudoku** — fill cells, undo if invalid.
- **Permutations / combinations / subsets**.
- **Word search** in a grid.
- **Generate parentheses**.
- **Restore IP addresses**.
- **Hamiltonian path / cycle**.
- **Graph coloring**.
- **Crossword puzzles**.

**Pruning is the key:**
- Without pruning, exponential blowup.
- Smart constraint propagation (sudoku → narrow possible digits per cell).
- Branch ordering (try most-constrained variables first).

**Examples:**

**Generate subsets:**
\`\`\`js
function subsets(nums) {
  const out = [];
  const path = [];
  function bt(idx) {
    out.push([...path]);
    for (let i = idx; i < nums.length; i++) {
      path.push(nums[i]);
      bt(i + 1);
      path.pop();
    }
  }
  bt(0);
  return out;
}
\`\`\`

**Time complexity:**
- Often **O(b^d)** — branching factor b, depth d.
- Pruning can make practical times much better.

**vs DP:**
- Backtracking: explore all; cannot share work between subproblems.
- DP: cache results; great for overlapping subproblems.

**vs Brute force:**
- Brute force: enumerate everything.
- Backtracking: enumerate, prune early.`,
      tags: ["paradigm"],
    },
    {
      id: "dijkstra",
      title: "Dijkstra's shortest path",
      difficulty: "medium",
      question: "How does Dijkstra's algorithm work?",
      answer: `**Dijkstra's algorithm** finds shortest paths from a source to all nodes in a graph with **non-negative edge weights**.

**Algorithm:**
1. Initialize \`dist[source] = 0\`, others = ∞.
2. Min-heap of (dist, node), starting with (0, source).
3. Pop smallest. If already visited, skip.
4. For each neighbor: if going through current is shorter, update its dist and push.
5. Repeat until heap empty or destination popped.

\`\`\`js
function dijkstra(graph, source) {
  const dist = new Map();
  const heap = new MinHeap([[0, source]]);
  while (!heap.empty()) {
    const [d, u] = heap.pop();
    if (dist.has(u)) continue;
    dist.set(u, d);
    for (const [v, w] of graph[u]) {
      if (!dist.has(v)) heap.push([d + w, v]);
    }
  }
  return dist;
}
\`\`\`

**Complexity:**
- **O((V + E) log V)** with binary heap.
- **O(E + V log V)** with Fibonacci heap (theoretically better; rarely used in practice).

**Why no negative edges:**
- Algorithm assumes once a node is visited, its distance is final.
- A negative edge could later create a shorter path → invariant broken.
- For negative edges, use **Bellman-Ford** (O(VE)) — slower but handles negatives.

**Variants:**
- **Single-source single-destination** — stop when destination popped (early exit).
- **A\\*** — Dijkstra with heuristic; faster for grid pathfinding.

**Use cases:**
- Routing (network packets, GPS).
- Game pathfinding (often A* with grid heuristic).
- Network analysis.
- Currency arbitrage (with Bellman-Ford for negative edges).

**Common pitfalls:**
- Using regular array as priority queue → O(V²); use a heap.
- Updating distance in the heap is O(n) — instead, push duplicates and skip if already visited.
- Forgetting non-negative edge requirement.`,
      tags: ["graphs"],
    },
    {
      id: "topological-sort",
      title: "Topological sort",
      difficulty: "medium",
      question: "What is topological sort?",
      answer: `**Topological sort** orders the nodes of a **Directed Acyclic Graph (DAG)** such that for every edge u → v, u comes before v.

**Use cases:**
- Build systems (compile order).
- Course prerequisites.
- Task scheduling with dependencies.
- Package managers (install order).
- Dataflow processing.

**Two algorithms:**

**1. Kahn's algorithm (BFS-based):**
- Count **in-degree** of every node.
- Add all 0-in-degree nodes to a queue.
- Pop, append to order, decrement neighbors' in-degrees; add new 0-in-degree to queue.
- If order has fewer nodes than V → cycle exists.

\`\`\`js
function topoSort(graph) {
  const inDeg = new Map();
  for (const u in graph) {
    inDeg.set(u, inDeg.get(u) ?? 0);
    for (const v of graph[u]) inDeg.set(v, (inDeg.get(v) ?? 0) + 1);
  }
  const queue = [...inDeg.keys()].filter(u => inDeg.get(u) === 0);
  const order = [];
  while (queue.length > 0) {
    const u = queue.shift();
    order.push(u);
    for (const v of graph[u] ?? []) {
      inDeg.set(v, inDeg.get(v) - 1);
      if (inDeg.get(v) === 0) queue.push(v);
    }
  }
  return order.length === inDeg.size ? order : null;
}
\`\`\`

**2. DFS-based:**
- DFS from each unvisited node.
- Append node to result on **post-order** (after recursion).
- Reverse result.

**Cycle detection:**
- DFS variant: track gray (in-stack) nodes; edge to gray → cycle.

**Complexity:** O(V + E).

**Multiple valid orders:** any valid topological order is acceptable. Use lexicographic order if a unique answer is required.

**Common interview question:** "Course Schedule II" on LeetCode.`,
      tags: ["graphs"],
    },
    {
      id: "bit-manipulation",
      title: "Bit manipulation",
      difficulty: "medium",
      question: "What are common bit manipulation tricks?",
      answer: `**Bitwise operators:**
- \`&\` AND, \`|\` OR, \`^\` XOR, \`~\` NOT, \`<<\` left shift, \`>>\` right shift.

**Common idioms:**

**Check / set / clear / toggle bit i:**
\`\`\`js
n & (1 << i)            // check
n | (1 << i)            // set
n & ~(1 << i)           // clear
n ^ (1 << i)            // toggle
\`\`\`

**Get lowest set bit:**
\`\`\`js
n & -n                  // isolates lowest 1
n & (n - 1)             // clears lowest 1 — used in Brian Kernighan's count
\`\`\`

**Power of two:**
\`\`\`js
n > 0 && (n & (n - 1)) === 0
\`\`\`

**XOR tricks:**
- \`a ^ a = 0\`, \`a ^ 0 = a\`.
- Find single non-duplicate in array of duplicates: XOR all → result.
- Swap two variables: \`a ^= b; b ^= a; a ^= b;\` (rarely better than temp).
- Find missing number 0..n: XOR indices with values; missing pops out.

**Population count (count set bits):**
\`\`\`js
function popcount(n) {
  let c = 0;
  while (n) { n &= n - 1; c++; }
  return c;
}
// Or built-in: bits.PopCount in Go, Integer.bitCount in Java
\`\`\`

**Subsets enumeration:**
- For \`n\` items, iterate \`mask\` from 0 to \`(1<<n)-1\`. Bit i set in \`mask\` ↔ item i in subset.
- Subset DP: \`mask\` represents state.

**Bit DP problems:**
- Traveling salesman (small n).
- Bitmask subset enumeration.
- "Cheapest flights with at most K stops".

**Modular tricks:**
- \`n & 1\` checks even/odd.
- \`n >> 1\` is integer division by 2.
- Multiply by 2: \`n << 1\`.

**Caveat in JS:** bitwise ops are 32-bit signed. Beyond 2³¹, results break. Use BigInt for 64-bit work.`,
      tags: ["techniques"],
    },
    {
      id: "string-matching",
      title: "String matching algorithms",
      difficulty: "medium",
      question: "How do efficient string matching algorithms work?",
      answer: `**Naive:** check pattern at every position. O(nm).

**KMP (Knuth-Morris-Pratt):** O(n + m).
- Precompute **failure function** — for each prefix, the longest proper prefix that's also a suffix.
- On mismatch, jump using failure table instead of restarting.

**Boyer-Moore:** O(n/m) best case.
- Compare from **right to left**.
- **Bad character** rule: shift to align mismatched char.
- **Good suffix** rule: shift based on matched suffix.
- Faster in practice for natural-language text. Used in \`grep\`.

**Rabin-Karp:** O(n + m) average, O(nm) worst.
- **Rolling hash** of pattern; slide over text recomputing hash in O(1).
- Hash match → verify with character compare.
- Great for **multi-pattern** search (hash all patterns).

**Z-algorithm:** O(n + m).
- Z-array: for each position, longest substring starting there matching the start.
- Find pattern in \`pattern + "#" + text\` looking for Z = m.

**Aho-Corasick:** O(n + m + z).
- **Multi-pattern** search.
- Build trie of patterns + failure links.
- Used in \`grep -F\`, virus scanners, network IDS.

**When to use what:**
- Single pattern, simple needs → built-in \`indexOf\` (often Boyer-Moore-Horspool internally).
- **Search engine indexing** → suffix arrays / inverted indexes.
- **Many patterns** → Aho-Corasick.
- **Approximate matching / typos** → Levenshtein automata, fuzzy hashing.
- **Bioinformatics** (DNA matching) → BWT, FM-index.

**Real-world:**
- \`grep\` uses Boyer-Moore-Horspool.
- Java \`String.indexOf\` uses naive (was Two-Way for a while).
- ElasticSearch / Lucene use inverted indexes, not direct matching.`,
      tags: ["strings", "patterns"],
    },
    {
      id: "graph-shortest-paths",
      title: "Shortest path algorithms",
      difficulty: "medium",
      question: "Compare BFS, Dijkstra, Bellman-Ford, Floyd-Warshall, and A*.",
      answer: `| Algorithm        | Edge weights         | Source(s)        | Complexity              |
|------------------|----------------------|------------------|-------------------------|
| **BFS**          | Unweighted (or all 1)| Single           | O(V + E)                |
| **0-1 BFS**      | 0 or 1               | Single           | O(V + E)                |
| **Dijkstra**     | Non-negative          | Single           | O((V + E) log V)        |
| **Bellman-Ford** | Any (handles negative)| Single           | O(VE)                   |
| **SPFA**         | Any (often faster)   | Single           | O(VE) worst, faster avg |
| **Floyd-Warshall** | Any                | All pairs        | O(V³)                   |
| **Johnson's**    | Any                  | All pairs        | O(V² log V + VE)        |
| **A\\***         | Non-negative + heuristic | Single        | Depends on heuristic    |

**Pick BFS when:** all edges equal weight; minimum hops.

**Pick Dijkstra when:** non-negative weights, single source. Most common.

**Pick Bellman-Ford when:** negative weights present, or you need to detect negative cycles.

**Pick Floyd-Warshall when:** small graph (V ≤ ~500), need all-pairs distances.

**Pick A\\* when:** you have a heuristic estimating distance to goal (geographic distance for maps). Cuts search space dramatically.

**Negative cycles:**
- A path through a negative cycle has no minimum.
- Bellman-Ford detects: after V-1 iterations, if any distance still decreases → negative cycle.

**Why Dijkstra fails with negative edges:**
- Once a node's distance is finalized, the algorithm doesn't revisit it.
- A later negative edge could have offered a shorter route.

**Practical tips:**
- For routing on map data, **A\\*** with great-circle distance heuristic is the standard.
- For currency arbitrage detection: Bellman-Ford for negative cycles.
- Pre-compute all-pairs only if graph is small or queries are very frequent.`,
      tags: ["graphs"],
    },

    // ───── HARD ─────
    {
      id: "dp-patterns",
      title: "DP patterns and state design",
      difficulty: "hard",
      question: "What are the common DP patterns?",
      answer: `**1. Linear DP** (1D state):
- \`dp[i]\` = optimal answer considering first i elements.
- Examples: Climbing stairs, House robber, Longest increasing subsequence.

**2. 2D / Grid DP:**
- \`dp[i][j]\` = answer for cell or pair (i, j).
- Examples: Unique paths, edit distance, longest common subsequence.

**3. Interval DP:**
- \`dp[i][j]\` = answer over interval [i, j].
- Build up by interval length.
- Examples: Matrix chain multiplication, palindrome partitioning, burst balloons.

**4. Knapsack family:**
- **0/1 knapsack** — each item taken once. \`dp[i][w]\` = max value using first i items with weight ≤ w.
- **Unbounded knapsack** — items reusable. \`dp[w]\` = max value with budget w.
- **Coin change** is unbounded knapsack.

**5. Tree DP:**
- \`dp[node]\` = answer for subtree rooted at node.
- Often one or two values per node (with/without taking node).
- Examples: House robber III, max path sum.

**6. Bitmask DP:**
- \`dp[mask]\` or \`dp[mask][i]\` for state subsets.
- Examples: TSP for small n, subset sum problems.

**7. Digit DP:**
- Count numbers in [L, R] satisfying digit-related property.
- State: position, tight (still bounded), some digit constraints.

**8. State compression:**
- Roll the DP array — keep only what you need (last 1-2 rows).

**Designing DP:**
1. Define **state** clearly: what does \`dp[i]\` (or [i][j]) mean?
2. Write **transition** — how does it depend on smaller states?
3. Identify **base case**.
4. Order of evaluation — bottom-up or top-down with memoization.
5. **Reconstruct path** if needed (track choices).

**Common pitfalls:**
- Wrong state definition leading to exponential blowup.
- Forgetting initial conditions.
- Wrong loop order in bottom-up (knapsack uses inner reverse loop for 0/1).
- Off-by-one boundary errors.`,
      tags: ["paradigm", "advanced"],
    },
    {
      id: "graph-mst",
      title: "Minimum spanning tree",
      difficulty: "hard",
      question: "How do Kruskal's and Prim's algorithms find an MST?",
      answer: `**Minimum Spanning Tree (MST):** subset of edges connecting all vertices with minimum total weight, no cycles.

**Kruskal's algorithm (edge-based):**
1. Sort edges by weight.
2. Use **Union-Find** to track connected components.
3. For each edge in order: if endpoints in different components, add to MST and union.
4. Stop when V-1 edges added.

\`\`\`js
function kruskal(V, edges) {
  edges.sort((a, b) => a[2] - b[2]);
  const uf = new UnionFind(V);
  const mst = [];
  for (const [u, v, w] of edges) {
    if (uf.find(u) !== uf.find(v)) {
      uf.union(u, v);
      mst.push([u, v, w]);
    }
  }
  return mst;
}
\`\`\`

Complexity: **O(E log E)** for sort, **O(E α(V))** for Union-Find. Total: **O(E log E)**.

**Prim's algorithm (vertex-based):**
1. Start from any vertex.
2. Maintain a min-heap of edges crossing from MST to outside.
3. Pop smallest edge whose other endpoint isn't in MST.
4. Add to MST; push its outgoing edges.
5. Repeat.

Complexity: **O((V + E) log V)** with binary heap.

**Pick:**
- **Kruskal** for sparse graphs (sorted edge list, Union-Find).
- **Prim** for dense graphs (with Fibonacci heap, O(E + V log V)).
- Both are typical in practice; difference in performance is small.

**Use cases:**
- **Network design** — connecting nodes with minimum cable.
- **Cluster analysis** — single-linkage clustering uses MST.
- **Approximation algorithms** — MST is part of TSP approximation (1.5× MST + matching).
- **Image segmentation**.

**Properties:**
- A graph can have **multiple valid MSTs** if equal-weight edges exist.
- All MSTs have the same total weight.
- **Cycle property** — heaviest edge in any cycle is not in MST.
- **Cut property** — lightest edge crossing any cut is in some MST.`,
      tags: ["graphs"],
    },
    {
      id: "approximation",
      title: "Approximation algorithms",
      difficulty: "hard",
      question: "When and how do you use approximation algorithms?",
      answer: `Some problems are **NP-hard** — exact solutions take exponential time. **Approximation algorithms** find provably "near-optimal" solutions in polynomial time.

**Examples:**

**TSP (Traveling Salesman):**
- Exact: O(2ⁿ n²) (Held-Karp DP). Impractical for n > ~25.
- **2-approximation** via MST traversal.
- **1.5-approximation** (Christofides): MST + minimum-weight perfect matching on odd-degree vertices.

**Vertex cover:**
- 2-approximation: pick any edge, add both endpoints, remove all edges they cover.

**Set cover:**
- Greedy gives O(log n)-approximation. Best possible unless P=NP.

**Bin packing:**
- First-fit decreasing — within 11/9 of optimal.

**Knapsack:**
- FPTAS (Fully Polynomial Time Approximation Scheme): for any ε, runs in O(n³/ε), within (1+ε) of optimal.

**Approximation ratios:**
- **2-approximation** = solution at most 2× optimal.
- **PTAS** — for any ε, polynomial time, ratio (1+ε).
- **FPTAS** — polynomial in 1/ε too.
- **Inapproximable** within ratio R unless P=NP — for some problems.

**When to use:**
- Hard problem, exact is impractical.
- "Good enough" answers are acceptable.
- Real-time decisions can't wait.

**Real-world systems:**
- **Routing algorithms** in maps (A* + heuristics).
- **Job scheduling** in batch systems.
- **Compiler register allocation** (graph coloring approximation).
- **VLSI placement and routing**.

**Heuristics vs approximation:**
- **Approximation algorithm** — provable bound on quality.
- **Heuristic** — works well in practice but no guarantee.
- **Local search** — improve random solution iteratively (simulated annealing, hill climbing).
- **Genetic algorithms** / **Ant colony** — bio-inspired heuristics.`,
      tags: ["theory", "advanced"],
    },
    {
      id: "amortized",
      title: "Amortized analysis",
      difficulty: "hard",
      question: "What is amortized analysis?",
      answer: `**Amortized analysis** averages the cost of operations over a sequence — captures the "true" per-operation cost when occasional expensive operations are spread over many cheap ones.

**Three methods:**

**1. Aggregate method:**
- Compute total cost of n operations.
- Divide by n.
- Example: dynamic array. n inserts, with doubling, total work is O(n) (not O(n²)) → O(1) amortized per insert.

**2. Accounting method:**
- Charge "extra" to cheap operations as savings.
- Use savings to pay for expensive operations.
- Example: each insert "charges" 3 units; insertion uses 1; saved 2 units pay for future doubling.

**3. Potential method:**
- Define potential Φ — represents "stored" work.
- Amortized cost = actual cost + ΔΦ.
- Useful for proving complex data structures.

**Classic examples:**

**Dynamic array (resize on full):**
- n inserts: total work = n + (1 + 2 + 4 + ... + n) = O(n).
- Amortized O(1) per insert.

**Stack with multipop:**
- Push O(1), pop O(1), multipop O(k).
- Each item only popped once total → multipop costs amortize to O(1) per push.

**Splay tree:**
- Single operation worst case is O(n).
- Amortized O(log n) — proven via potential function.

**Union-Find (with path compression + union by rank):**
- Single operation worst case is O(log n).
- Amortized O(α(n)) — inverse Ackermann, ≤ 4 in practice.

**Why it matters:**
- Many real data structures are **only good amortized** (dynamic arrays, hash tables).
- For real-time systems where worst-case latency matters, amortized isn't enough — need worst-case analysis or **deamortized** versions.

**vs average case:**
- Amortized: worst case across a *sequence* of operations.
- Average case: assumes a probability distribution on inputs.`,
      tags: ["theory"],
    },
    {
      id: "p-vs-np",
      title: "P, NP, NP-complete, NP-hard",
      difficulty: "hard",
      question: "What are P, NP, NP-complete, and NP-hard?",
      answer: `Complexity classes describing how hard problems are.

**P (Polynomial time):** problems solvable in polynomial time. Tractable.
- Sorting, shortest path, MST, primality testing.

**NP (Nondeterministic Polynomial):** problems whose solutions can be **verified** in polynomial time.
- Includes all of P (if you can solve in poly time, you can verify in poly time).
- Examples: SAT, traveling salesman (decision version), graph coloring.

**NP-hard:** at least as hard as the hardest problem in NP.
- A polynomial-time algorithm for any NP-hard problem implies P = NP.
- Halting problem is NP-hard but **not** in NP (no poly verification).

**NP-complete:** in NP **and** NP-hard.
- The "hardest" problems in NP.
- All NP-complete problems reduce to each other.
- Cook-Levin theorem proved SAT is NP-complete (1971).
- Famous examples: SAT, 3-SAT, traveling salesman, knapsack (decision), Hamilton cycle, graph coloring, vertex cover, subset sum.

**P vs NP:** open since 1971; \$1M Clay Millennium Prize.
- If P = NP: every NP problem is tractable. Crypto breaks. Optimal solutions to many AI problems become possible.
- Most CS theorists believe **P ≠ NP**.

**What to do with NP-hard problems in practice:**
- **Approximation algorithms** — provably-near-optimal in poly time.
- **Heuristics** — work well in practice without formal guarantees.
- **Restricted instances** — small inputs solvable by exact algorithms.
- **Parameterized complexity** — fast if some parameter is small (e.g. tree-width).
- **Quantum algorithms** — Shor's factoring is poly on quantum (impacts crypto).

**For interviews:**
- Recognize NP-hard problems and don't try to find polynomial exact solutions.
- Discuss approximation / heuristic alternatives.
- Mention reductions briefly (proving NP-hardness via reduction from a known NP-complete problem).`,
      tags: ["theory"],
    },
    {
      id: "online-algorithms",
      title: "Online algorithms",
      difficulty: "hard",
      question: "What are online algorithms?",
      answer: `**Online algorithms** make decisions on input as it arrives, without knowing future input. Compared to **offline** algorithms that see everything up front.

**Examples:**
- **Caching / paging** — decide which page to evict without knowing future accesses.
- **Ski rental problem** — rent or buy each day, not knowing how many days you'll ski.
- **k-server problem** — schedule k servers responding to requests as they arrive.
- **Streaming algorithms** — process data one item at a time with limited memory.
- **Online matching** — Adwords-style bidding.

**Competitive ratio:**
- Compare online algorithm's cost to optimal offline cost.
- Algorithm is c-competitive if cost ≤ c × OPT for all inputs.

**Examples of competitive bounds:**
- LRU caching is k-competitive (k = cache size).
- "Buy or rent skis" has 2-competitive deterministic, e/(e-1) ≈ 1.58-competitive randomized.
- Online matching: 1 - 1/e ≈ 0.63-competitive (Karp-Vazirani).

**Streaming algorithms:**
- Process input in one pass with sublinear memory.
- **Reservoir sampling** — keep uniform random sample of size k from a stream.
- **Misra-Gries** — top-k frequent items in a stream.
- **Count-Min sketch** — approximate frequencies.
- **HyperLogLog** — approximate distinct count.
- **Bloom filter** — set membership.

**Real-world:**
- **Ad bidding** — decide on each impression.
- **CDN caching** — evict on each miss.
- **Database query plans** — sometimes adaptive (re-plan on data shape).
- **Reactive systems** — IoT, real-time analytics.

**Trade-offs:**
- Online: faster decisions, less memory, but worse approximation.
- Offline: optimal, but requires batch processing and full knowledge.

**Hybrid:**
- **Mini-batch** — collect for a window, optimize within window.
- Common in machine learning training.`,
      tags: ["theory", "advanced"],
    },
    {
      id: "randomized",
      title: "Randomized algorithms",
      difficulty: "hard",
      question: "When are randomized algorithms useful?",
      answer: `**Randomized algorithms** make random choices during execution. Often simpler, faster, or only known way for some problems.

**Two flavors:**

**Las Vegas:** always correct; running time random.
- **Quicksort with random pivot** — O(n log n) expected, O(n²) worst case (very rare).
- **Randomized BST / treap** — balanced with high probability.

**Monte Carlo:** running time bounded; correctness probabilistic.
- **Miller-Rabin primality** — fast; tiny chance of false positive.
- **Karger's min-cut** — runs many times to boost probability.
- **Randomized matrix multiplication verification** — Freivalds' algorithm, O(n²) per check.

**Advantages:**
- **Simpler than deterministic** — quicksort with random pivot trivially avoids the sorted-input worst case.
- **Faster expected time** — even with same worst case.
- **Robust to adversarial input** — randomization defeats specific bad cases (HashDoS prevention via random hash seeds).
- **Distributed / parallel** — random sampling avoids coordination.

**Examples:**

**Reservoir sampling:** uniform random k-sample from unknown-length stream.
\`\`\`
For each item i:
  if i ≤ k: keep
  else: with probability k/i, replace random kept item
\`\`\`

**Randomized incremental construction** (computational geometry):
- Insert elements in random order.
- Expected O(n log n) instead of O(n²).

**Hash functions with random seed:** prevents attackers from constructing pathological inputs.

**Bloom filter, HyperLogLog, Count-Min:** probabilistic data structures with bounded error.

**Pitfalls:**
- **PRNG quality matters** — predictable randomness is exploitable.
- **Independence assumptions** — don't reuse random bits naively.
- **Adversarial input** — if attacker sees output, they may guess randomness.

**Cryptographic randomness:**
- Use OS-level CSPRNG (\`/dev/urandom\`, \`crypto.randomBytes\`).
- Don't reuse the same seed across security boundaries.`,
      tags: ["techniques", "advanced"],
    },
    {
      id: "geometric-algorithms",
      title: "Computational geometry basics",
      difficulty: "hard",
      question: "What are some classic computational geometry algorithms?",
      answer: `**Computational geometry** studies algorithms for geometric problems — points, lines, polygons in 2D/3D.

**Foundational primitives:**
- **Cross product** — orientation: \`(b - a) × (c - a)\` sign tells if abc is counterclockwise (>0), clockwise (<0), or collinear.
- **Segment intersection** — sweep line with event queue.

**Convex hull:**
- Smallest convex polygon containing all points.
- **Graham scan** — O(n log n).
- **Andrew's monotone chain** — O(n log n), simpler.
- **Quickhull** — O(n log n) average.

**Closest pair of points:**
- Brute force: O(n²).
- Divide and conquer: O(n log n).

**Line segment intersection (n segments):**
- Brute force: O(n²) pairs.
- **Bentley-Ottmann sweep**: O((n + k) log n) where k = number of intersections.

**Voronoi diagrams / Delaunay triangulation:**
- Voronoi: partition plane based on nearest point.
- Delaunay: triangulation maximizing minimum angle.
- Construction: O(n log n) via Fortune's algorithm.
- Used in mesh generation, GIS, motion planning.

**Polygon problems:**
- **Point in polygon** — ray casting (count crossings) or winding number.
- **Polygon area** — shoelace formula. O(n).
- **Polygon clipping** — Sutherland-Hodgman.

**Spatial indexing** (covered in Data Structures):
- **R-tree, Quad-tree, K-d tree**.

**Real-world applications:**
- **Maps / GIS** — routing, region queries, intersection.
- **Computer graphics** — collision detection, ray tracing.
- **Robotics** — motion planning, navigation.
- **GIS / Spatial DBs** — PostGIS.
- **Computational biology** — molecular structures.

**Numerical issues:**
- Floating-point comparisons fail near degenerate cases.
- Use **exact integer arithmetic** when possible (cross products of integer coords).
- Tolerance values for floating-point.`,
      tags: ["geometry", "advanced"],
    },
    {
      id: "parallel-algorithms",
      title: "Parallel and distributed algorithms",
      difficulty: "hard",
      question: "What's special about parallel and distributed algorithms?",
      answer: `**Parallel algorithms:** designed to run on multiple processors with **shared memory**.
**Distributed algorithms:** processes communicate via **messages** over a network — no shared memory.

**Parallel models:**
- **PRAM** (Parallel Random Access Machine) — theoretical multi-processor with shared memory.
- **Work-Span model** — total work + critical path length.

**Common parallel patterns:**
- **Divide and conquer** — naturally parallel (merge sort, FFT).
- **Map-reduce** — process independent chunks, combine.
- **Pipeline** — stages process different inputs in parallel.
- **Stencil / kernel** — apply function to grid cells.
- **Reduce / scan (prefix sum)** — parallelize associative aggregations in O(log n) span.

**Distributed problem set:**
- **Consensus** — Paxos, Raft. Agree on a value despite failures.
- **Leader election** — pick a coordinator (Bully algorithm, Raft).
- **Mutual exclusion** — distributed locks (Lamport, Ricart-Agrawala).
- **Time** — Lamport clocks, vector clocks for ordering events.
- **Replication** — primary/backup, quorum-based.
- **MapReduce** — large-scale data processing.

**Theorems / impossibility:**
- **CAP theorem** — Consistency, Availability, Partition tolerance — pick 2.
- **FLP impossibility** — no asynchronous algorithm guarantees consensus in presence of failures.
- **Two-generals problem** — coordination over unreliable channel impossible.

**Concurrency primitives:**
- **Locks** — mutex, read-write.
- **Atomic operations** — CAS, fetch-and-add.
- **Memory barriers** — order memory operations.
- **Channels / message queues** — communication without shared state.

**Common bugs:**
- **Race conditions** — order-dependent outcomes.
- **Deadlocks** — cycle of waiting.
- **Livelocks** — processes act but make no progress.
- **Starvation** — one process never gets CPU/lock.
- **Cache coherence stalls** — false sharing.

**Tools / frameworks:**
- **OpenMP, MPI, CUDA** — parallel.
- **Akka, Erlang/OTP** — actor-based distributed.
- **Spark, Flink** — distributed data processing.
- **Kubernetes, ZooKeeper, etcd** — coordination.

**Real-world wisdom:**
- "It's easier to make a parallel algorithm correct than fast."
- Performance is dominated by memory access patterns and synchronization, not algorithmic Big-O.
- Test under high concurrency; bugs hide at low parallelism.`,
      tags: ["concurrency", "advanced"],
    },
  ],
};
