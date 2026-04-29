import type { Category } from "./types";

export const springData: Category = {
  slug: "spring-data",
  title: "Spring Data & Hibernate",
  description:
    "Spring Data JPA, Hibernate ORM, entity mapping, repositories, transactions, and query optimization",
  icon: "🗃️",
  questions: [
    // ───── EASY ─────
    {
      id: "jpa-vs-hibernate",
      title: "JPA vs Hibernate",
      difficulty: "easy",
      question: "What is the difference between JPA and Hibernate?",
      answer: `**JPA (Jakarta Persistence API)** is a specification — a set of interfaces and annotations defined by the Jakarta EE standard that describes how Java objects should be mapped to relational databases.

**Hibernate** is the most widely used *implementation* of the JPA specification. It provides the actual persistence engine: SQL generation, caching, connection management, and more.

| Aspect | JPA | Hibernate |
|---|---|---|
| Type | Specification (interfaces) | Implementation (concrete classes) |
| Package | 'jakarta.persistence.*' | 'org.hibernate.*' |
| Portability | Code portable across providers | Hibernate-specific features available |
| Extra features | None beyond the spec | Second-level cache, HQL extras, filters |

**Key takeaway:** You code against JPA interfaces ('EntityManager', '@Entity', '@Query') and Hibernate fulfils those contracts at runtime. Spring Boot auto-configures Hibernate as the JPA provider unless you override it.

Other JPA implementations exist (EclipseLink, OpenJPA) but Hibernate dominates in Spring applications.`,
      tags: ["jpa", "hibernate", "fundamentals"],
    },
    {
      id: "entity-annotations",
      title: "@Entity, @Table, @Column annotations",
      difficulty: "easy",
      question: "What do the @Entity, @Table, and @Column annotations do in JPA?",
      answer: `These three annotations control how a Java class and its fields are mapped to database structures.

**@Entity**
Marks a class as a JPA-managed entity. The class must have a no-arg constructor and a field annotated with '@Id'.

    @Entity
    public class Product { ... }

**@Table**
Optional — customises the table name and schema. Without it, the class name is used as the table name.

    @Entity
    @Table(name = "products", schema = "catalog",
           uniqueConstraints = @UniqueConstraint(columnNames = {"sku"}))
    public class Product { ... }

**@Column**
Optional — customises the column mapping. Without it, the field name becomes the column name.

    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

**Common @Column attributes**
| Attribute | Purpose |
|---|---|
| 'name' | Column name in the table |
| 'nullable' | Adds NOT NULL constraint (schema gen) |
| 'unique' | Adds UNIQUE constraint |
| 'length' | VARCHAR length (default 255) |
| 'insertable' / 'updatable' | Exclude from INSERT/UPDATE |
| 'precision' / 'scale' | For DECIMAL types |`,
      tags: ["jpa", "annotations", "mapping"],
    },
    {
      id: "entity-lifecycle",
      title: "Entity lifecycle states",
      difficulty: "easy",
      question: "What are the four lifecycle states of a JPA entity?",
      answer: `A JPA entity moves through four states managed by the 'EntityManager':

**1. Transient**
The object has been created with 'new' but is not associated with any persistence context. Changes are not tracked.

    Product p = new Product(); // transient

**2. Managed (Persistent)**
The entity is associated with an active persistence context. Any changes to its fields are automatically detected and flushed to the database (dirty checking).

    entityManager.persist(p); // now managed
    p.setName("Widget");      // will be saved on flush

**3. Detached**
The persistence context that managed the entity has closed (e.g., the transaction ended or 'detach()' was called). Changes are no longer tracked.

    entityManager.detach(p); // detached
    // or: EntityManager closed at end of @Transactional method

**4. Removed**
'remove()' has been called. The entity will be deleted from the database on the next flush.

    entityManager.remove(p); // scheduled for deletion

**State transitions**
- Transient → Managed: 'persist()'
- Managed → Detached: 'detach()', context close, serialisation
- Detached → Managed: 'merge()' (returns a new managed instance)
- Managed → Removed: 'remove()'`,
      tags: ["jpa", "lifecycle", "fundamentals"],
    },
    {
      id: "spring-data-repositories",
      title: "Spring Data JPA repository interfaces",
      difficulty: "easy",
      question: "What are CrudRepository, JpaRepository, and PagingAndSortingRepository? When would you use each?",
      answer: `Spring Data JPA provides a hierarchy of repository interfaces that progressively add more functionality.

**CrudRepository<T, ID>**
Basic CRUD: 'save()', 'findById()', 'findAll()', 'delete()', 'count()', 'existsById()'.
Use when you need minimal persistence operations and want to keep the dependency surface small.

**PagingAndSortingRepository<T, ID>**
Extends 'CrudRepository' and adds:
- 'findAll(Sort sort)' — sorted results
- 'findAll(Pageable pageable)' — paginated results returning a 'Page<T>'

**JpaRepository<T, ID>**
Extends 'PagingAndSortingRepository' and adds JPA-specific methods:
- 'saveAll()' / 'saveAndFlush()' / 'saveAllAndFlush()'
- 'deleteAllInBatch()' / 'deleteInBatch()'
- 'flush()' / 'getById()' (reference by id without loading)
- 'findAll(Example<S>)' — query by example

**Typical choice:** Use 'JpaRepository' for most Spring Boot applications — it provides the richest API without extra effort.

    public interface ProductRepository extends JpaRepository<Product, Long> {
        List<Product> findByCategoryAndPriceBelow(String category, BigDecimal price);
    }`,
      tags: ["spring-data", "repositories", "fundamentals"],
    },
    {
      id: "fetch-types",
      title: "EAGER vs LAZY fetch types",
      difficulty: "easy",
      question: "What is the difference between FetchType.EAGER and FetchType.LAZY in JPA?",
      answer: `Fetch type controls *when* Hibernate loads associated entities from the database.

**FetchType.EAGER**
The associated data is loaded immediately in the same query (or a follow-up query) whenever the owning entity is loaded.

    @ManyToOne(fetch = FetchType.EAGER) // default for @ManyToOne, @OneToOne
    private Category category;

**FetchType.LAZY**
The associated data is loaded on first access (a proxy object is returned initially). The actual SQL runs only when you call a method on the proxy.

    @OneToMany(fetch = FetchType.LAZY) // default for @OneToMany, @ManyToMany
    private List<OrderItem> items;

**JPA defaults**
| Annotation | Default fetch |
|---|---|
| '@ManyToOne' | EAGER |
| '@OneToOne' | EAGER |
| '@OneToMany' | LAZY |
| '@ManyToMany' | LAZY |

**Recommendation:** Always prefer LAZY loading. EAGER loading can cause unintended queries and performance problems, especially when entities form a deep graph. Override to EAGER only where you can prove a join is always needed. Use 'JOIN FETCH' or 'EntityGraph' to load lazily-mapped associations when you need them.`,
      tags: ["jpa", "fetch", "performance"],
    },
    {
      id: "transactional-basics",
      title: "@Transactional basics",
      difficulty: "easy",
      question: "What does the @Transactional annotation do in Spring?",
      answer: `'@Transactional' tells Spring to wrap the annotated method in a database transaction. Spring uses AOP (a proxy) to begin a transaction before the method runs and commit (or roll back) it when the method returns.

**Default behaviour**
- A transaction is started if one does not already exist.
- The transaction is **committed** on successful return.
- The transaction is **rolled back** automatically on unchecked exceptions ('RuntimeException' and its subclasses).
- Checked exceptions do **not** trigger rollback by default.

**Placement**
- On a service method (recommended): keeps the persistence context open for the entire business operation.
- On a class: applies to all public methods in that class.

**Key attributes**
| Attribute | Purpose |
|---|---|
| 'propagation' | How to handle existing transactions |
| 'isolation' | DB isolation level |
| 'readOnly' | Hint for read-only optimisation |
| 'rollbackFor' | Rollback on specific checked exceptions |
| 'timeout' | Transaction timeout in seconds |

    @Service
    public class OrderService {
        @Transactional
        public Order placeOrder(OrderRequest request) {
            // all DB operations here share one transaction
        }

        @Transactional(readOnly = true)
        public List<Order> findOrdersForUser(Long userId) {
            return orderRepository.findByUserId(userId);
        }
    }`,
      tags: ["spring", "transactions", "fundamentals"],
    },

    // ───── MEDIUM ─────
    {
      id: "relationship-mappings",
      title: "JPA relationship annotations",
      difficulty: "medium",
      question: "Explain @OneToMany, @ManyToOne, and @ManyToMany with bidirectional vs unidirectional mappings.",
      answer: `**@ManyToOne (owning side)**
The most common relationship. The foreign key column lives in the entity with '@ManyToOne'.

    @Entity
    public class Order {
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "customer_id", nullable = false)
        private Customer customer;
    }

**@OneToMany (inverse side)**
Mapped by the foreign key on the child side. Use 'mappedBy' to point to the owning field — this avoids a join table.

    @Entity
    public class Customer {
        @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
        private List<Order> orders = new ArrayList<>();
    }

**Bidirectional vs unidirectional**
- **Bidirectional:** both sides reference each other. You must keep both sides in sync manually.
- **Unidirectional @OneToMany** (without 'mappedBy'): Hibernate creates a join table automatically — usually less efficient; prefer the bidirectional form.

**@ManyToMany**
Requires a join table. Use 'mappedBy' on the inverse side to avoid duplicating join table definition.

    @Entity
    public class Student {
        @ManyToMany
        @JoinTable(name = "student_course",
            joinColumns = @JoinColumn(name = "student_id"),
            inverseJoinColumns = @JoinColumn(name = "course_id"))
        private Set<Course> courses = new HashSet<>();
    }

    @Entity
    public class Course {
        @ManyToMany(mappedBy = "courses")
        private Set<Student> students = new HashSet<>();
    }

**Best practices**
- Always set 'fetch = LAZY' on '@ManyToOne' and '@OneToMany'.
- Use 'Set' instead of 'List' for '@ManyToMany' to avoid Hibernate's duplicate-row bug with EAGER + bags.
- Use 'orphanRemoval = true' on '@OneToMany' when child entities have no independent lifecycle.`,
      tags: ["jpa", "relationships", "mapping"],
    },
    {
      id: "n-plus-one-problem",
      title: "N+1 problem and solutions",
      difficulty: "medium",
      question: "What is the N+1 select problem in Hibernate and what are the main ways to solve it?",
      answer: `**The N+1 problem** occurs when loading a collection triggers one query for the parent list and N additional queries — one per parent — to load an associated collection.

    // 1 query: SELECT * FROM orders
    List<Order> orders = orderRepository.findAll();

    // N queries, one per order:
    orders.forEach(o -> o.getItems().size()); // lazy proxy fires here

Total = N+1 queries. With 500 orders this is 501 round-trips.

---

**Solution 1: JOIN FETCH in JPQL**
Loads the association in a single JOIN query.

    @Query("SELECT o FROM Order o JOIN FETCH o.items WHERE o.status = :status")
    List<Order> findWithItemsByStatus(@Param("status") String status);

Limitation: cannot combine 'JOIN FETCH' with 'Pageable' on a collection (HHH-1523). Use 'countQuery' + two fetches, or switch to EntityGraph + a 'List' approach.

**Solution 2: @EntityGraph**
Declarative — no JPQL required.

    @EntityGraph(attributePaths = {"items", "items.product"})
    List<Order> findByStatus(String status);

**Solution 3: @BatchSize**
Hibernate loads lazy collections in batches of N rather than one-by-one.

    @OneToMany(mappedBy = "order")
    @BatchSize(size = 25)
    private List<OrderItem> items;

Good for small to medium collections; transparent to callers.

**Solution 4: @FetchMode(SUBSELECT)**
Hibernate loads all collections in a single subselect after the parent query.

    @OneToMany(mappedBy = "order")
    @Fetch(FetchMode.SUBSELECT)
    private List<OrderItem> items;

**Solution 5: DTO projections**
Use Spring Data Projections or constructor expressions to fetch only needed columns in one query without loading entities at all.

    @Query("SELECT new com.example.OrderSummary(o.id, o.total, COUNT(i)) " +
           "FROM Order o JOIN o.items i GROUP BY o.id, o.total")
    List<OrderSummary> findSummaries();`,
      tags: ["hibernate", "n+1", "performance", "jpql"],
    },
    {
      id: "jpql-vs-criteria-vs-native",
      title: "JPQL vs Criteria API vs native queries",
      difficulty: "medium",
      question: "Compare JPQL, the Criteria API, and native SQL queries in Spring Data JPA.",
      answer: `**JPQL (Jakarta Persistence Query Language)**
Object-oriented query language that works on entity classes and fields, not tables and columns. Type-unsafe at compile time but very readable.

    @Query("SELECT u FROM User u WHERE u.email = :email AND u.active = true")
    Optional<User> findActiveByEmail(@Param("email") String email);

Pros: readable, database-portable, supports entity relationships naturally.
Cons: string-based (typos caught only at runtime), cannot express all SQL constructs.

**Criteria API**
Programmatic, type-safe query builder — useful for dynamic queries where conditions vary at runtime.

    CriteriaBuilder cb = em.getCriteriaBuilder();
    CriteriaQuery<User> cq = cb.createQuery(User.class);
    Root<User> user = cq.from(User.class);
    List<Predicate> predicates = new ArrayList<>();
    if (nameFilter != null) predicates.add(cb.like(user.get("name"), "%" + nameFilter + "%"));
    cq.where(predicates.toArray(new Predicate[0]));
    return em.createQuery(cq).getResultList();

Use **JPA Metamodel** ('User_') for full compile-time safety.
Pros: dynamic conditions, compile-time field names, database-portable.
Cons: very verbose compared to JPQL.

**Native SQL queries**
Raw SQL — required for DB-specific syntax (window functions, CTEs, stored procedures).

    @Query(value = "SELECT * FROM users WHERE MATCH(name) AGAINST(:term)", nativeQuery = true)
    List<User> fullTextSearch(@Param("term") String term);

Pros: full SQL expressiveness, can use any DB feature.
Cons: not database-portable, no entity mapping by default (use 'SqlResultSetMapping' or projections).

**Choosing between them**
| Scenario | Recommendation |
|---|---|
| Simple filters on known fields | JPQL / derived method names |
| Dynamic filter combinations | Criteria API or Specifications |
| DB-specific features | Native query |
| Read-heavy DTO projections | JPQL constructor / interface projection |`,
      tags: ["jpql", "criteria-api", "native-query", "spring-data"],
    },
    {
      id: "custom-query-methods",
      title: "Spring Data derived query methods and @Query",
      difficulty: "medium",
      question: "How do derived query method names work in Spring Data JPA, and when should you use @Query instead?",
      answer: `**Derived query methods**
Spring Data parses the method name and generates JPQL automatically. No implementation needed.

    public interface UserRepository extends JpaRepository<User, Long> {
        // SELECT u FROM User u WHERE u.email = ?1
        Optional<User> findByEmail(String email);

        // SELECT u FROM User u WHERE u.lastName = ?1 AND u.active = ?2
        List<User> findByLastNameAndActive(String lastName, boolean active);

        // SELECT u FROM User u WHERE u.age > ?1 ORDER BY u.lastName ASC
        List<User> findByAgeGreaterThanOrderByLastNameAsc(int age);

        // JPQL COUNT
        long countByActive(boolean active);

        // DELETE
        void deleteByEmailAndActive(String email, boolean active);
    }

**Supported keywords (partial list)**
| Keyword | JPQL snippet |
|---|---|
| 'findBy' / 'readBy' / 'getBy' | SELECT ... WHERE |
| 'And' / 'Or' | AND / OR |
| 'Between' | BETWEEN ?1 AND ?2 |
| 'LessThan' / 'GreaterThan' | < / > |
| 'Like' / 'Containing' | LIKE |
| 'IgnoreCase' | UPPER() comparison |
| 'OrderBy...Asc/Desc' | ORDER BY |
| 'Top10' / 'First5' | LIMIT |

**When to use @Query instead**
- The method name becomes too long or ambiguous to read.
- You need JOINs, subqueries, aggregations, or GROUP BY.
- You need a native SQL query.
- You want to control the JPQL precisely for performance reasons.

    @Query("SELECT u FROM User u JOIN FETCH u.roles WHERE u.department = :dept")
    List<User> findWithRolesByDepartment(@Param("dept") String department);

    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.active = false WHERE u.lastLoginDate < :cutoff")
    int deactivateInactiveUsers(@Param("cutoff") LocalDate cutoff);

Use '@Modifying' for UPDATE/DELETE queries; always pair with '@Transactional'.`,
      tags: ["spring-data", "repositories", "jpql", "query-methods"],
    },
    {
      id: "transaction-propagation",
      title: "Transaction propagation levels",
      difficulty: "medium",
      question: "Explain the transaction propagation levels available in Spring's @Transactional annotation.",
      answer: `Propagation defines what happens when a '@Transactional' method is called from another method that may already have an active transaction.

| Propagation | Behaviour |
|---|---|
| **REQUIRED** (default) | Join existing transaction; create one if none exists. |
| **REQUIRES_NEW** | Always start a new transaction; suspend the existing one if present. |
| **SUPPORTS** | Join existing transaction if present; run without one if not. |
| **NOT_SUPPORTED** | Always run without a transaction; suspend any existing one. |
| **MANDATORY** | Must run inside an existing transaction; throw if none exists. |
| **NEVER** | Must run without a transaction; throw if one exists. |
| **NESTED** | Execute within a savepoint of the existing transaction (partial rollback possible). |

**Most important in practice**

'REQUIRED': default for almost all service methods. Multiple service calls within one HTTP request share one transaction.

'REQUIRES_NEW': use when the inner operation must commit regardless of the outer transaction result (e.g., audit logging).

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logAudit(AuditEvent event) {
        auditRepository.save(event); // commits even if outer tx rolls back
    }

'NESTED': creates a savepoint — if the inner method rolls back, only the nested portion is undone; the outer transaction continues. Requires JDBC savepoint support (available in most databases).

**Common pitfall**
Self-invocation (calling a '@Transactional' method from another method in the same bean) bypasses Spring's proxy, so propagation rules are not applied. Extract the inner method to a separate Spring bean to fix this.`,
      tags: ["spring", "transactions", "propagation"],
    },
    {
      id: "optimistic-locking",
      title: "Optimistic locking with @Version",
      difficulty: "medium",
      question: "What is optimistic locking in JPA and how do you implement it with @Version?",
      answer: `**Optimistic locking** assumes conflicts between concurrent transactions are rare. Instead of holding database locks, it uses a version counter to detect conflicts at commit time.

**How it works**
1. Each entity has a version column (integer or timestamp).
2. Hibernate includes the version in UPDATE/DELETE WHERE clauses.
3. If another transaction already incremented the version, the update affects 0 rows.
4. Hibernate throws 'OptimisticLockException', which Spring translates to 'ObjectOptimisticLockingFailureException'.

**Implementation**

    @Entity
    public class BankAccount {
        @Id
        private Long id;

        private BigDecimal balance;

        @Version
        private Long version; // Hibernate manages this automatically
    }

Hibernate generates:
    UPDATE bank_account SET balance = ?, version = 2
    WHERE id = ? AND version = 1

If another transaction already set version = 2, this update matches 0 rows — conflict detected.

**Handling the exception**

    @Transactional
    @Retryable(value = OptimisticLockingFailureException.class, maxAttempts = 3)
    public void transferFunds(Long fromId, Long toId, BigDecimal amount) {
        // retry the entire transaction on conflict
    }

Or catch and inform the user to reload and retry.

**When to use**
- High-read, low-write contention (most CRUD applications).
- REST APIs where long-held DB locks are impractical.

**vs Pessimistic locking:** Pessimistic uses actual DB row locks ('SELECT FOR UPDATE'). Choose pessimistic when conflicts are frequent or when you cannot afford to retry (e.g., ticketing systems).`,
      tags: ["jpa", "locking", "concurrency", "version"],
    },
    {
      id: "pessimistic-locking",
      title: "Pessimistic locking in JPA",
      difficulty: "medium",
      question: "How does pessimistic locking work in JPA and when would you use it?",
      answer: `**Pessimistic locking** acquires a database-level lock on rows when they are read, preventing other transactions from modifying them until the lock is released.

**Lock modes**
| LockModeType | SQL issued | Effect |
|---|---|---|
| 'PESSIMISTIC_READ' | 'SELECT ... FOR SHARE' | Others can read but not write |
| 'PESSIMISTIC_WRITE' | 'SELECT ... FOR UPDATE' | Others cannot read or write |
| 'PESSIMISTIC_FORCE_INCREMENT' | 'SELECT ... FOR UPDATE' + version bump | Like WRITE but also increments version |

**Usage in Spring Data**

    // On a repository method:
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM BankAccount a WHERE a.id = :id")
    Optional<BankAccount> findByIdForUpdate(@Param("id") Long id);

    // In EntityManager directly:
    BankAccount account = em.find(BankAccount.class, id, LockModeType.PESSIMISTIC_WRITE);

**Setting a timeout**

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @QueryHints({@QueryHint(name = "jakarta.persistence.lock.timeout", value = "3000")})
    Optional<BankAccount> findByIdForUpdate(@Param("id") Long id);

**When to use pessimistic locking**
- Conflicts are expected frequently (high-contention resources).
- Operations that absolutely cannot be retried.
- Scenarios where partial work must not be wasted (e.g., inventory allocation, seat reservation).
- Short transactions where the lock hold time is minimal.

**Downsides**
- Risk of deadlocks if locks are acquired in different orders.
- Reduced throughput under high concurrency.
- Locks are held for the full transaction duration — keep transactions short.`,
      tags: ["jpa", "locking", "concurrency", "database"],
    },
    {
      id: "second-level-cache",
      title: "Hibernate second-level cache",
      difficulty: "medium",
      question: "What is the Hibernate second-level cache and how does it differ from the first-level cache?",
      answer: `**First-level cache (persistence context / session cache)**
- Built into every Hibernate 'Session' (or JPA 'EntityManager').
- Scoped to a single transaction / session — not shared across requests.
- Automatically enabled; cannot be disabled.
- When you load the same entity twice within one session, Hibernate returns the cached object without hitting the database.

**Second-level cache (L2 cache)**
- Shared across sessions / transactions — cached data is reused by multiple requests.
- Must be explicitly enabled and configured.
- Typically backed by Ehcache, Caffeine, Redis (via Infinispan), or Hazelcast.
- Stores entity data (not entity instances) by primary key.

**Enabling in Spring Boot (Ehcache example)**

    # application.properties
    spring.jpa.properties.hibernate.cache.use_second_level_cache=true
    spring.jpa.properties.hibernate.cache.region.factory_class=org.hibernate.cache.jcache.JCacheRegionFactory
    spring.cache.jcache.config=classpath:ehcache.xml

    @Entity
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    public class Country { ... }

**Cache concurrency strategies**
| Strategy | Use when |
|---|---|
| 'READ_ONLY' | Data never changes (best performance) |
| 'READ_WRITE' | Data changes but soft locks acceptable |
| 'NONSTRICT_READ_WRITE' | Rare updates, slight staleness OK |
| 'TRANSACTIONAL' | JTA environment, full transactional cache |

**Query cache**
Caches JPQL/HQL query results (the list of IDs). Requires L2 cache to be enabled:
    spring.jpa.properties.hibernate.cache.use_query_cache=true

Use L2 cache for reference data (countries, categories, product types) that changes rarely and is read frequently across many requests.`,
      tags: ["hibernate", "cache", "performance"],
    },
    {
      id: "hikaricp-connection-pooling",
      title: "Connection pooling with HikariCP",
      difficulty: "medium",
      question: "How does HikariCP work in Spring Boot and what are the key configuration properties?",
      answer: `**HikariCP** is Spring Boot's default JDBC connection pool since Boot 2.x. It maintains a pool of pre-established database connections so each request borrows one instead of paying the cost of creating a new TCP connection.

**Why it matters**
Creating a database connection typically takes 20–100 ms. With a pool of 10 connections serving 1000 requests/second, each connection handles many requests sequentially — connection creation cost is amortised.

**Key configuration properties**

    spring.datasource.hikari.maximum-pool-size=10
    spring.datasource.hikari.minimum-idle=5
    spring.datasource.hikari.idle-timeout=600000        # 10 min: remove idle connections
    spring.datasource.hikari.connection-timeout=30000   # 30 s: wait before throwing
    spring.datasource.hikari.max-lifetime=1800000       # 30 min: recycle connections
    spring.datasource.hikari.leak-detection-threshold=60000  # warn on long-held connections

**Pool sizing guidance (from HikariCP docs)**

    pool size = (cores * 2) + effective_spindle_count

For a 4-core machine with an SSD: approximately 10. Counter-intuitively, bigger pools can hurt performance due to lock contention at the DB side.

**Monitoring**
Expose pool metrics via Spring Boot Actuator + Micrometer:

    management.endpoints.web.exposure.include=metrics
    # Then check: /actuator/metrics/hikaricp.connections.active

**Common problems**
- Pool exhaustion ('Connection is not available, request timed out'): increase pool size or investigate connection leaks.
- Long-held connections: use 'leak-detection-threshold' to log stack traces of connections held too long.
- Connection gone stale: set 'max-lifetime' below your database's 'wait_timeout'.`,
      tags: ["hikaricp", "connection-pooling", "spring-boot", "performance"],
    },
    {
      id: "cascade-types",
      title: "JPA cascade types",
      difficulty: "medium",
      question: "What are JPA cascade types and when should you use CascadeType.ALL vs specific cascade operations?",
      answer: `**Cascade types** control which lifecycle operations on a parent entity are automatically propagated to its associated child entities.

**Available cascade types**
| Type | Propagated operation |
|---|---|
| 'PERSIST' | 'persist()' — save new child when parent is persisted |
| 'MERGE' | 'merge()' — merge detached child when parent is merged |
| 'REMOVE' | 'remove()' — delete child when parent is deleted |
| 'REFRESH' | 'refresh()' — reload child state from DB when parent is refreshed |
| 'DETACH' | 'detach()' — detach child when parent is detached |
| 'ALL' | All of the above combined |

**Usage example**

    @Entity
    public class Order {
        @OneToMany(mappedBy = "order",
                   cascade = CascadeType.ALL,
                   orphanRemoval = true)
        private List<OrderItem> items = new ArrayList<>();
    }

With 'CascadeType.ALL' and 'orphanRemoval = true':
- Saving an 'Order' automatically persists its 'items'.
- Deleting an 'Order' automatically deletes all its 'items'.
- Removing an item from the 'items' list deletes it from the database.

**When NOT to use CascadeType.ALL**
- On '@ManyToOne' relationships — cascading REMOVE from child to parent would delete the parent when you delete a child, which is almost never intended.
- When the child entity has an independent lifecycle shared with other parents (e.g., a 'Tag' used by many 'Post' entities should not be deleted when one post is deleted).
- On '@ManyToMany' — cascading REMOVE can cause accidental mass deletions.

**Recommended defaults**
- '@OneToMany' with a dependent child (items, line items, addresses): 'CascadeType.ALL' + 'orphanRemoval = true'.
- '@ManyToOne': no cascade, or at most 'PERSIST' and 'MERGE'.
- '@ManyToMany': 'PERSIST' and 'MERGE' only — never 'REMOVE'.`,
      tags: ["jpa", "cascade", "relationships", "hibernate"],
    },

    // ───── HARD ─────
    {
      id: "hibernate-dirty-checking",
      title: "Hibernate dirty checking mechanism",
      difficulty: "hard",
      question: "How does Hibernate's automatic dirty checking work, and what are its performance implications?",
      answer: `**Dirty checking** is Hibernate's mechanism for detecting changes to managed entities and automatically generating UPDATE statements — without you calling 'save()' or 'update()'.

**How it works**
1. When an entity enters the persistence context (via 'find()', 'merge()', or a JPQL query), Hibernate stores a **snapshot** of its field values.
2. At flush time (before a commit or an explicit 'flush()' call), Hibernate compares the current state of each managed entity against its snapshot.
3. If any field differs, Hibernate generates an UPDATE statement for that entity.

    @Transactional
    public void updateName(Long id, String newName) {
        User user = userRepository.findById(id).orElseThrow();
        user.setName(newName); // no save() call needed
        // Hibernate will UPDATE at commit time
    }

**Flush modes**
| Mode | When flush occurs |
|---|---|
| 'AUTO' (default) | Before queries that might read stale data, and before commit |
| 'COMMIT' | Only before commit |
| 'ALWAYS' | Before every query |
| 'MANUAL' | Only on explicit 'flush()' call |

**Performance implications**
- For large sessions with many entities, comparing snapshots for each entity can be expensive — O(n * fields).
- Use 'readOnly = true' on '@Transactional' for read-only operations: Hibernate skips snapshot creation and dirty checking entirely.
- Avoid loading large collections into the persistence context unnecessarily.
- Use DTO projections for read-heavy endpoints — no entities, no dirty checking overhead.
- '@DynamicUpdate' makes Hibernate include only changed columns in the UPDATE (useful for wide tables with many columns).

    @Entity
    @DynamicUpdate
    public class Product { ... }

- Consider 'StatelessSession' for bulk operations — no persistence context, no dirty checking, much faster.`,
      tags: ["hibernate", "dirty-checking", "performance", "internals"],
    },
    {
      id: "open-session-in-view",
      title: "Open Session in View anti-pattern",
      difficulty: "hard",
      question: "What is the Open Session in View pattern, why is it considered an anti-pattern, and how do you disable it?",
      answer: `**Open Session in View (OSIV)** is a pattern (and Spring Boot default) where the Hibernate 'Session' (persistence context) is kept open for the entire HTTP request lifecycle — including the rendering of the view layer.

**Why it exists**
Lazy-loaded associations are accessible from view templates (Thymeleaf, JSP) without 'LazyInitializationException'. Spring Boot enables OSIV by default via 'OpenEntityManagerInViewInterceptor'.

**Why it is an anti-pattern**

1. **Lazy queries fire in the view layer**: business logic, services, and templates are supposed to be separated. Database access from templates is hard to track and reason about.
2. **N+1 queries hidden in templates**: a template iterating a collection silently fires N queries, invisible from the service layer.
3. **Long-held database connections**: the connection is held open from the start of the HTTP request to the end of response rendering — for a slow renderer this means the connection is tied up much longer than needed.
4. **False sense of correctness**: code that "works" in dev with OSIV breaks in prod when OSIV is disabled (e.g., in async workers or batch jobs), causing 'LazyInitializationException'.

**Disabling OSIV in Spring Boot**

    # application.properties
    spring.jpa.open-in-view=false

This will log a warning in Spring Boot if you haven't explicitly set this property.

**Fixing LazyInitializationException without OSIV**
- Use 'JOIN FETCH' or '@EntityGraph' to eagerly load required associations in the service layer.
- Use DTO projections that only contain the data needed by the view.
- Use 'Hibernate.initialize(entity.getCollection())' inside a '@Transactional' service method to force initialisation before returning.

    @Transactional(readOnly = true)
    public OrderDTO getOrderWithItems(Long id) {
        Order order = orderRepository.findWithItemsById(id); // JOIN FETCH
        return OrderDTO.from(order); // map to DTO while session is open
    }`,
      tags: ["hibernate", "spring", "osiv", "anti-pattern", "performance"],
    },
    {
      id: "spring-data-specifications",
      title: "Spring Data Specifications",
      difficulty: "hard",
      question: "What are Spring Data JPA Specifications and how do you use them for dynamic queries?",
      answer: `**Specifications** implement the JPA Criteria API in a composable, reusable way. They are based on the Specification pattern from domain-driven design and use Spring Data's 'JpaSpecificationExecutor' interface.

**Setup**
Your repository must extend 'JpaSpecificationExecutor':

    public interface ProductRepository
            extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    }

**Writing Specifications**

    public class ProductSpecs {

        public static Specification<Product> hasCategory(String category) {
            return (root, query, cb) ->
                category == null ? null : cb.equal(root.get("category"), category);
        }

        public static Specification<Product> isPriceBetween(BigDecimal min, BigDecimal max) {
            return (root, query, cb) -> {
                if (min == null && max == null) return null;
                if (min == null) return cb.lessThanOrEqualTo(root.get("price"), max);
                if (max == null) return cb.greaterThanOrEqualTo(root.get("price"), min);
                return cb.between(root.get("price"), min, max);
            };
        }

        public static Specification<Product> isActive() {
            return (root, query, cb) -> cb.isTrue(root.get("active"));
        }
    }

**Composing and executing**

    Specification<Product> spec = Specification
        .where(ProductSpecs.isActive())
        .and(ProductSpecs.hasCategory(request.getCategory()))
        .and(ProductSpecs.isPriceBetween(request.getMinPrice(), request.getMaxPrice()));

    Page<Product> results = productRepository.findAll(spec,
        PageRequest.of(0, 20, Sort.by("name")));

Returning 'null' from a Specification means "no restriction" — the condition is ignored. This makes building optional filter chains clean.

**Avoiding N+1 with Specifications**
Add 'JOIN FETCH' inside the Specification for associations you always need:

    public static Specification<Product> withCategoryDetails() {
        return (root, query, cb) -> {
            root.fetch("categoryDetails", JoinType.LEFT);
            query.distinct(true);
            return cb.conjunction(); // no WHERE restriction
        };
    }

**JPA Metamodel**
Generate 'Product_' metamodel classes for compile-time field safety:
    root.get(Product_.category) // compile-time safe vs root.get("category")`,
      tags: ["spring-data", "specifications", "criteria-api", "dynamic-query"],
    },
    {
      id: "flyway-liquibase",
      title: "Flyway vs Liquibase for database migrations",
      difficulty: "hard",
      question: "Compare Flyway and Liquibase for managing database schema migrations in a Spring Boot application.",
      answer: `Both tools solve the same problem: tracking and applying database schema changes in a controlled, version-controlled, repeatable way.

**Flyway**
- Migrations are plain SQL (or Java) files with a naming convention: 'V1__create_users.sql', 'V2__add_index.sql'.
- Spring Boot auto-runs Flyway on startup via 'FlywayAutoConfiguration'.
- Migration history tracked in 'flyway_schema_history' table.
- Simple mental model: ordered sequence of scripts, applied once, never modified.

    -- src/main/resources/db/migration/V1__create_product_table.sql
    CREATE TABLE product (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now()
    );

**Liquibase**
- Migrations written in XML, YAML, JSON, or SQL ("changelogs" containing "changesets").
- Each changeset has an 'id' + 'author' identifier (not just a version number).
- History tracked in 'databasechangelog' table.
- Supports rollback definitions, diff generation, and preconditions.

    # db/changelog/001-create-product-table.yaml
    databaseChangeLog:
      - changeSet:
          id: 1
          author: alice
          changes:
            - createTable:
                tableName: product
                columns:
                  - column: { name: id, type: BIGINT, autoIncrement: true, constraints: { primaryKey: true } }
                  - column: { name: name, type: VARCHAR(255), constraints: { nullable: false } }

**Comparison**
| Aspect | Flyway | Liquibase |
|---|---|---|
| Migration format | SQL or Java | XML/YAML/JSON/SQL |
| Rollback support | Community: manual SQL; Teams+: auto | Built-in rollback definitions |
| Repeatable migrations | 'R__' prefix scripts | Via 'runOnChange: true' |
| Diff generation | No (Community) | Yes ('liquibase diff') |
| Complexity | Low | Higher |
| Best for | SQL-first teams, simple flows | Multi-DB portability, enterprise needs |

**Spring Boot integration**

    # Flyway
    spring.flyway.locations=classpath:db/migration
    spring.flyway.baseline-on-migrate=true

    # Liquibase
    spring.liquibase.change-log=classpath:db/changelog/db.changelog-master.yaml

**Rule of thumb:** Choose Flyway for simplicity and SQL-first workflows. Choose Liquibase when you need rollback automation, multi-database portability, or changeset-level granularity.`,
      tags: ["flyway", "liquibase", "migrations", "spring-boot"],
    },
    {
      id: "jpa-inheritance-strategies",
      title: "JPA inheritance mapping strategies",
      difficulty: "hard",
      question: "What are the JPA inheritance mapping strategies and what are the trade-offs of each?",
      answer: `JPA supports four strategies for mapping a Java class hierarchy to relational tables.

**1. SINGLE_TABLE (default)**
All classes in the hierarchy share one table. A discriminator column identifies the subtype.

    @Entity
    @Inheritance(strategy = InheritanceType.SINGLE_TABLE)
    @DiscriminatorColumn(name = "payment_type")
    public abstract class Payment { @Id Long id; BigDecimal amount; }

    @Entity @DiscriminatorValue("CARD")
    public class CardPayment extends Payment { String cardNumber; }

    @Entity @DiscriminatorValue("BANK")
    public class BankTransfer extends Payment { String iban; }

Pros: best query performance (no JOINs), simple schema.
Cons: all subtype columns must be nullable; table grows wide; violates 3NF.

**2. TABLE_PER_CLASS**
Each concrete class has its own table with all fields (including inherited ones) duplicated.

    @Inheritance(strategy = InheritanceType.TABLE_PER_CLASS)

Pros: proper normalisation per class; no nullable columns.
Cons: polymorphic queries use UNION ALL across all tables — very slow; no shared sequence without a global ID generator.

**3. JOINED (table-per-subclass)**
A base table holds shared fields; each subclass has its own table with subtype-specific fields, linked by a shared primary key.

    @Inheritance(strategy = InheritanceType.JOINED)

Pros: fully normalised; clean schema; no wasted nullable columns.
Cons: every query JOINs the base table with the subtype table(s) — more expensive than SINGLE_TABLE.

**4. MappedSuperclass (not a true inheritance strategy)**
No table for the superclass — common fields shared via Java inheritance only. Each subclass has its own complete table. No polymorphic queries possible.

    @MappedSuperclass
    public abstract class BaseEntity { @Id Long id; LocalDateTime createdAt; }

Pros: clean shared field reuse; no JOIN overhead.
Cons: cannot query across all subtypes via the superclass.

**Summary**
| Strategy | Tables | Query performance | Normalisation |
|---|---|---|---|
| SINGLE_TABLE | 1 | Best | Poor |
| TABLE_PER_CLASS | N | Worst (UNION) | Good per table |
| JOINED | N+1 | Medium | Best |
| MappedSuperclass | N | Best per type | Good |`,
      tags: ["jpa", "inheritance", "mapping", "hibernate"],
    },
    {
      id: "entity-graph",
      title: "@EntityGraph for controlling fetch plans",
      difficulty: "hard",
      question: "What is @EntityGraph in JPA, how do you define one, and when should you use it over JOIN FETCH?",
      answer: `**@EntityGraph** provides a declarative way to specify which associations should be eagerly loaded for a specific query — without writing JOIN FETCH in JPQL. It overrides the fetch type for the duration of that query only.

**Named Entity Graph (defined on the entity)**

    @Entity
    @NamedEntityGraph(
        name = "Order.withItemsAndProducts",
        attributeNodes = {
            @NamedAttributeNode(value = "items", subgraph = "items-subgraph")
        },
        subgraphs = {
            @NamedSubgraph(name = "items-subgraph",
                attributeNodes = @NamedAttributeNode("product"))
        }
    )
    public class Order {
        @OneToMany(mappedBy = "order", fetch = FetchType.LAZY)
        private List<OrderItem> items;
    }

**Using in Spring Data**

    @EntityGraph("Order.withItemsAndProducts")
    Optional<Order> findById(Long id);

    // Or inline (ad-hoc entity graph):
    @EntityGraph(attributePaths = {"items", "items.product"})
    List<Order> findByStatus(String status);

**Fetch graph vs Load graph**
- 'EntityGraphType.FETCH' (default): only the explicitly listed attributes are eagerly loaded; all others revert to LAZY regardless of their mapping.
- 'EntityGraphType.LOAD': explicitly listed attributes are eagerly loaded; all others use their declared fetch type.

    @EntityGraph(value = "Order.withItems", type = EntityGraph.EntityGraphType.LOAD)
    List<Order> findRecent();

**@EntityGraph vs JOIN FETCH**
| Aspect | @EntityGraph | JOIN FETCH |
|---|---|---|
| Syntax | Declarative annotation | JPQL keyword |
| Works with Pageable | Yes | No (for collections) |
| Multiple associations | Multiple 'attributePaths' | Multiple JOINs (risks cartesian product) |
| Dynamic | Via 'attributePaths' | Must write separate queries |
| Visibility | Annotation on method | Inside query string |

Use @EntityGraph when you need clean, reusable, annotation-driven fetch plans — especially with 'Pageable'. Use JOIN FETCH for one-off complex queries where you need precise control over the JOIN type and conditions.`,
      tags: ["jpa", "entity-graph", "performance", "fetch"],
    },
    {
      id: "bulk-operations",
      title: "Bulk updates and deletes in Spring Data JPA",
      difficulty: "hard",
      question: "How do you perform efficient bulk updates and deletes in Spring Data JPA, and what pitfalls should you watch for?",
      answer: `**The naive approach (entity-by-entity) is extremely slow**
Loading each entity, modifying it, and relying on dirty checking generates N individual UPDATE statements.

---

**JPQL bulk UPDATE / DELETE**
Executes a single SQL statement without loading entities into the persistence context.

    @Modifying
    @Transactional
    @Query("UPDATE Product p SET p.price = p.price * :factor WHERE p.category = :cat")
    int applyPriceIncrease(@Param("factor") BigDecimal factor, @Param("cat") String cat);

    @Modifying
    @Transactional
    @Query("DELETE FROM AuditLog a WHERE a.createdAt < :cutoff")
    int deleteOldAuditLogs(@Param("cutoff") LocalDateTime cutoff);

'@Modifying' is required; without it Spring Data throws an exception.

**Pitfall: stale persistence context**
Bulk JPQL goes directly to the database, bypassing the persistence context. Entities already loaded in the same session will now be stale.

Solution: use 'clearAutomatically = true' to clear the persistence context after the bulk operation:

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    @Query("UPDATE Product p SET p.active = false WHERE p.stock = 0")
    int deactivateOutOfStock();

**Native SQL for very large datasets**

    @Modifying
    @Query(value = "UPDATE product SET active = false WHERE stock = 0", nativeQuery = true)
    int deactivateOutOfStockNative();

**'deleteAllInBatch()' and 'deleteInBatch()'**
'JpaRepository' provides these methods which generate 'DELETE FROM x WHERE id IN (...)' — far more efficient than 'deleteAll()' which loads then deletes one by one.

    productRepository.deleteAllInBatch(productList);
    productRepository.deleteAllByIdInBatch(idList);

**StatelessSession for high-volume ETL**
For millions of rows, use Hibernate's 'StatelessSession' — it has no persistence context, no dirty checking, no caching:

    StatelessSession session = sessionFactory.openStatelessSession();
    Transaction tx = session.beginTransaction();
    // scroll and update/insert in batches
    tx.commit();
    session.close();

**JDBC batch inserts via Spring Data**
Enable Hibernate JDBC batching for bulk inserts:

    spring.jpa.properties.hibernate.jdbc.batch_size=50
    spring.jpa.properties.hibernate.order_inserts=true
    spring.jpa.properties.hibernate.order_updates=true

With 'GenerationType.SEQUENCE' (not IDENTITY) this reduces 1000 inserts to ~20 round-trips.`,
      tags: ["spring-data", "bulk-operations", "performance", "hibernate"],
    },
    {
      id: "projection-types",
      title: "Spring Data projections",
      difficulty: "hard",
      question: "What types of projections does Spring Data JPA support and when would you use each?",
      answer: `Spring Data JPA provides three projection mechanisms to fetch partial data without loading full entities.

**1. Interface-based projections (closed)**
Define an interface with getter methods matching entity field names. Spring generates a proxy at runtime.

    public interface UserSummary {
        Long getId();
        String getEmail();
        String getFirstName();
    }

    List<UserSummary> findByActive(boolean active);

Pros: simple, type-safe, Spring generates the SELECT automatically.
Cons: always fetches the declared fields from the entity (no custom SELECT control with complex expressions).

**2. Interface-based projections (open / with SpEL)**
Use '@Value' with Spring Expression Language for computed or combined fields.

    public interface FullName {
        @Value("#{target.firstName + ' ' + target.lastName}")
        String getFullName();
        String getEmail();
    }

Caveat: SpEL projections load the full entity first, then compute the expression — not a SQL-level optimisation.

**3. Class-based projections (DTO projections)**
Plain Java classes (or records) with a matching constructor. Spring generates a JPQL constructor expression.

    public record UserDTO(Long id, String email, String fullName) {}

    @Query("SELECT new com.example.UserDTO(u.id, u.email, CONCAT(u.firstName, ' ', u.lastName)) " +
           "FROM User u WHERE u.active = true")
    List<UserDTO> findActiveUserDTOs();

Pros: full control over SQL/JPQL; works with aggregations and computed columns; no proxy overhead.
Cons: requires explicit '@Query'; constructor must match exactly.

**4. Dynamic projections**
The return type is parameterised — the caller specifies the projection type at call time.

    <T> List<T> findByActive(boolean active, Class<T> type);

    // Usage:
    List<UserSummary> summaries = repo.findByActive(true, UserSummary.class);
    List<User> full = repo.findByActive(true, User.class);

**Choosing a projection**
| Scenario | Recommendation |
|---|---|
| Simple subset of fields, no computation | Closed interface projection |
| Computed/combined field | DTO with JPQL constructor |
| REST API response DTO | DTO record (clean, serialisable) |
| Flexible API with multiple consumers | Dynamic projection |
| Aggregation query result | DTO with constructor expression |

Using projections instead of full entities eliminates unnecessary column fetches and avoids dirty-checking overhead for read-only endpoints.`,
      tags: ["spring-data", "projections", "dto", "performance"],
    },
    {
      id: "transaction-isolation",
      title: "Transaction isolation levels",
      difficulty: "hard",
      question: "Explain the four SQL transaction isolation levels and the concurrency anomalies they prevent.",
      answer: `Isolation levels define how visible the changes of one transaction are to other concurrent transactions. Higher isolation = fewer anomalies = more locking = lower throughput.

**Concurrency anomalies**
| Anomaly | Description |
|---|---|
| **Dirty read** | Read uncommitted data from another transaction that may roll back |
| **Non-repeatable read** | Re-reading a row within a transaction yields different values (another tx committed between reads) |
| **Phantom read** | Re-executing a range query yields different rows (another tx inserted/deleted matching rows) |
| **Lost update** | Two transactions read-then-write the same row; one overwrites the other's change |

**Isolation levels (ANSI SQL)**

| Level | Dirty read | Non-repeatable read | Phantom read |
|---|---|---|---|
| READ UNCOMMITTED | Possible | Possible | Possible |
| READ COMMITTED | Prevented | Possible | Possible |
| REPEATABLE READ | Prevented | Prevented | Possible (prevented in MySQL InnoDB) |
| SERIALIZABLE | Prevented | Prevented | Prevented |

**Setting in Spring**

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public List<Order> getPendingOrders() { ... }

**Database defaults**
- PostgreSQL: READ COMMITTED
- MySQL InnoDB: REPEATABLE READ (with MVCC that also prevents phantoms)
- Oracle: READ COMMITTED
- SQL Server: READ COMMITTED

**Practical guidance**
- **READ COMMITTED**: suitable for most OLTP applications. Use with optimistic locking (@Version) to handle lost updates.
- **REPEATABLE READ**: use when a transaction must read the same row multiple times and get consistent results (e.g., report generation, complex business rules spanning multiple reads).
- **SERIALIZABLE**: use only when correctness is critical and throughput can be sacrificed (e.g., financial reconciliation). Expect significant lock contention.
- **READ UNCOMMITTED**: almost never correct for production use.

**MVCC note**: PostgreSQL and MySQL InnoDB use Multi-Version Concurrency Control — readers do not block writers. This makes READ COMMITTED practical for very high read concurrency without excessive locking.`,
      tags: ["transactions", "isolation", "database", "concurrency"],
    },
  ],
};
