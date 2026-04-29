import type { Category } from "./types";

export const efCore: Category = {
  slug: "ef-core",
  title: "Entity Framework Core",
  description:
    "EF Core 9 essentials: DbContext, migrations, relationships, loading strategies, LINQ queries, raw SQL, transactions, concurrency, global query filters, value converters, owned entities, and performance patterns.",
  icon: "🗃️",
  questions: [
    // ───── EASY ─────
    {
      id: "what-is-ef-core",
      title: "What is Entity Framework Core?",
      difficulty: "easy",
      question: "What is Entity Framework Core and how does it differ from the original Entity Framework?",
      answer: `**Entity Framework Core (EF Core)** is Microsoft's open-source, cross-platform ORM for .NET. It maps .NET classes (entities) to database tables and lets you query and manipulate data using strongly-typed C# instead of raw SQL.

**Key differences from EF 6 (classic EF)**
| Concern | EF 6 | EF Core 9 |
|---|---|---|
| Platform | .NET Framework only | .NET 6+ (cross-platform) |
| Performance | Heavier, slower | Rewritten query pipeline |
| Database providers | SQL Server focus | SQL Server, Postgres, SQLite, MySQL, Cosmos, etc. |
| Features | Mature, stable | New: split queries, compiled queries, JSON columns, bulk ops |
| Lazy loading | Default | Opt-in proxy or lazy-loading proxies package |

**Core components**
- **DbContext** — the unit-of-work and connection to the database.
- **DbSet<T>** — represents a table; supports LINQ queries.
- **Migrations** — track and apply incremental schema changes.
- **Change Tracker** — detects entity mutations for \`SaveChanges\`.

EF Core 9 (released November 2024) added native support for JSON columns, prune-able query translations, and improved bulk update/delete via \`ExecuteUpdate\` / \`ExecuteDelete\`.`,
      tags: ["fundamentals", "ef-core"],
    },
    {
      id: "dbcontext-dbset",
      title: "DbContext and DbSet",
      difficulty: "easy",
      question: "What are DbContext and DbSet<T>, and how do you define them?",
      answer: `**DbContext** is the central class in EF Core. It manages database connections, tracks entity changes, and coordinates queries and saves.

**DbSet<T>** is a typed collection property on \`DbContext\` that maps to a table and exposes LINQ query methods.

\`\`\`csharp
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    public DbSet<Product> Products { get; set; }
    public DbSet<Category> Categories { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Fluent API configuration goes here
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
\`\`\`

**Registration (Program.cs / Startup.cs)**
\`\`\`csharp
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("Default")));
\`\`\`

**Lifecycle:** \`DbContext\` is scoped by default in ASP.NET Core — one instance per HTTP request. Never use it as a singleton.

**Important methods**
- \`SaveChanges()\` / \`SaveChangesAsync()\` — flush tracked changes to the database.
- \`Add\`, \`Update\`, \`Remove\` — change entity state.
- \`Entry(entity)\` — access the change-tracker entry directly.`,
      tags: ["fundamentals", "dbcontext"],
    },
    {
      id: "code-first-vs-database-first",
      title: "Code-First vs Database-First",
      difficulty: "easy",
      question: "What are the code-first and database-first approaches in EF Core, and when would you choose each?",
      answer: `**Code-First**
You define C# entity classes and \`DbContext\`, then generate the database schema via migrations.

\`\`\`csharp
public class Order
{
    public int Id { get; set; }
    public DateTime PlacedAt { get; set; }
    public List<OrderLine> Lines { get; set; } = [];
}
// Then: dotnet ef migrations add InitialCreate
//       dotnet ef database update
\`\`\`

**Database-First (scaffold)**
You start from an existing database and reverse-engineer C# classes.

\`\`\`bash
dotnet ef dbcontext scaffold "Server=.;Database=Shop;Trusted_Connection=True" \
    Microsoft.EntityFrameworkCore.SqlServer \
    --output-dir Models \
    --context ShopDbContext
\`\`\`

**When to choose each**

| Scenario | Recommended approach |
|---|---|
| Green-field project | Code-first (migrations keep schema in version control) |
| Existing legacy database | Database-first (scaffold, then optionally switch to code-first) |
| DBA controls schema | Database-first or hybrid with SQL scripts |
| Microservice owning its DB | Code-first |

Most modern .NET projects use **code-first** because migrations live in git alongside the code.`,
      tags: ["fundamentals", "migrations", "scaffold"],
    },
    {
      id: "data-annotations-vs-fluent-api",
      title: "Data Annotations vs Fluent API",
      difficulty: "easy",
      question: "What are the two ways to configure entities in EF Core, and what are the trade-offs?",
      answer: `EF Core lets you configure entity mappings in two ways: **Data Annotations** (attributes on the class) and the **Fluent API** (code in \`OnModelCreating\`).

**Data Annotations**
\`\`\`csharp
public class Product
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = "";

    [Column("unit_price", TypeName = "decimal(18,2)")]
    public decimal Price { get; set; }
}
\`\`\`

**Fluent API (preferred for complex mappings)**
\`\`\`csharp
public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("Products");
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Name).IsRequired().HasMaxLength(200);
        builder.Property(p => p.Price)
               .HasColumnName("unit_price")
               .HasColumnType("decimal(18,2)");
    }
}
\`\`\`

**Trade-offs**

| | Data Annotations | Fluent API |
|---|---|---|
| Location | On the entity class | Separate configuration class |
| Domain model purity | Pollutes with infra concerns | Keeps entity POCO-clean |
| Power / coverage | Limited | Full EF Core API surface |
| Readability | Inline, visible | Centralised |

**Best practice:** use Fluent API for anything beyond simple constraints; register with \`ApplyConfigurationsFromAssembly\`.`,
      tags: ["configuration", "fluent-api", "data-annotations"],
    },
    {
      id: "migrations-basics",
      title: "EF Core migrations workflow",
      difficulty: "easy",
      question: "How do EF Core migrations work? Walk through the basic commands.",
      answer: `**Migrations** track incremental schema changes as C# files so they can be version-controlled and applied in order.

**Typical workflow**

\`\`\`bash
# 1. Create a migration after changing entities
dotnet ef migrations add AddProductTable

# 2. Review the generated Up() / Down() methods in Migrations/<timestamp>_AddProductTable.cs

# 3. Apply to the database
dotnet ef database update

# 4. Roll back one step
dotnet ef database update PreviousMigrationName

# 5. Remove the last migration (if not yet applied)
dotnet ef migrations remove
\`\`\`

**Generated migration file**
\`\`\`csharp
public partial class AddProductTable : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "Products",
            columns: table => new
            {
                Id    = table.Column<int>(nullable: false)
                             .Annotation("SqlServer:Identity", "1, 1"),
                Name  = table.Column<string>(maxLength: 200, nullable: false),
                Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
            },
            constraints: table => table.PrimaryKey("PK_Products", x => x.Id));
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "Products");
    }
}
\`\`\`

**Generate a SQL script (CI/CD pipelines)**
\`\`\`bash
dotnet ef migrations script --idempotent -o migrate.sql
\`\`\`
The \`--idempotent\` flag wraps each statement in an existence check, safe to run repeatedly.`,
      tags: ["migrations", "cli"],
    },
    {
      id: "async-operations",
      title: "Async EF Core operations",
      difficulty: "easy",
      question: "Why and how should you use async methods with EF Core?",
      answer: `EF Core provides async counterparts for every I/O-bound operation. Using them avoids blocking thread-pool threads in ASP.NET Core, which improves throughput under load.

**Common async methods**
\`\`\`csharp
// Query
var products = await db.Products
    .Where(p => p.Price > 10)
    .ToListAsync(cancellationToken);

var product = await db.Products.FindAsync(id, cancellationToken);

var exists = await db.Products.AnyAsync(p => p.Name == "Widget");

var count = await db.Products.CountAsync();

// Persist
db.Products.Add(newProduct);
await db.SaveChangesAsync(cancellationToken);

// Single result
var first = await db.Products.FirstOrDefaultAsync(p => p.IsActive);
\`\`\`

**Rules**
- Always pass a \`CancellationToken\` from the controller/endpoint so the DB call is cancelled when the client disconnects.
- Never mix \`.Result\` or \`.Wait()\` with async EF Core calls — deadlock risk.
- In background services, create a new \`DbContext\` scope per unit of work (don't reuse a scoped context).

\`\`\`csharp
// ASP.NET Core controller example
[HttpGet("{id}")]
public async Task<IActionResult> GetProduct(int id, CancellationToken ct)
{
    var product = await _db.Products.FindAsync(new object[] { id }, ct);
    return product is null ? NotFound() : Ok(product);
}
\`\`\``,
      tags: ["async", "performance"],
    },

    // ───── MEDIUM ─────
    {
      id: "relationships-one-to-many",
      title: "One-to-many relationships",
      difficulty: "medium",
      question: "How do you model and configure a one-to-many relationship in EF Core?",
      answer: `A one-to-many relationship means one principal entity (e.g. \`Category\`) has many dependent entities (e.g. \`Product\`).

**Entity classes**
\`\`\`csharp
public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public ICollection<Product> Products { get; set; } = [];
}

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";

    public int CategoryId { get; set; }           // FK (required)
    public Category Category { get; set; } = null!; // nav property
}
\`\`\`

**Fluent API configuration**
\`\`\`csharp
builder.Entity<Product>()
    .HasOne(p => p.Category)
    .WithMany(c => c.Products)
    .HasForeignKey(p => p.CategoryId)
    .OnDelete(DeleteBehavior.Restrict); // prevent cascade delete
\`\`\`

EF Core can infer the relationship by convention (property named \`CategoryId\` or \`CategoryFk\`), but explicit Fluent API config is recommended for clarity and delete-behaviour control.

**Delete behaviours**
| Value | Effect |
|---|---|
| \`Cascade\` | Delete dependents when principal is deleted |
| \`Restrict\` | Throw exception if dependents exist |
| \`SetNull\` | Set FK to NULL (FK must be nullable) |
| \`NoAction\` | Leave DB to decide (DB-level constraint) |`,
      tags: ["relationships", "foreign-key"],
    },
    {
      id: "relationships-many-to-many",
      title: "Many-to-many with a join entity",
      difficulty: "medium",
      question: "How do you configure a many-to-many relationship in EF Core, and when do you need an explicit join entity?",
      answer: `**EF Core 5+ implicit many-to-many** (no extra payload on the join table)
\`\`\`csharp
public class Student { public ICollection<Course> Courses { get; set; } = []; }
public class Course  { public ICollection<Student> Students { get; set; } = []; }

// EF Core creates a shadow join table automatically
\`\`\`

**Explicit join entity** (needed when the join table has extra columns)
\`\`\`csharp
public class Enrollment
{
    public int StudentId { get; set; }
    public Student Student { get; set; } = null!;

    public int CourseId { get; set; }
    public Course Course { get; set; } = null!;

    public DateTime EnrolledAt { get; set; }   // payload column
    public Grade? Grade { get; set; }
}
\`\`\`

**Fluent API**
\`\`\`csharp
modelBuilder.Entity<Enrollment>(e =>
{
    e.HasKey(en => new { en.StudentId, en.CourseId }); // composite PK

    e.HasOne(en => en.Student)
     .WithMany(s => s.Enrollments)
     .HasForeignKey(en => en.StudentId);

    e.HasOne(en => en.Course)
     .WithMany(c => c.Enrollments)
     .HasForeignKey(en => en.CourseId);
});
\`\`\`

**Querying**
\`\`\`csharp
var studentCourses = await db.Enrollments
    .Where(e => e.StudentId == studentId)
    .Include(e => e.Course)
    .Select(e => new { e.Course.Name, e.EnrolledAt })
    .ToListAsync();
\`\`\``,
      tags: ["relationships", "many-to-many"],
    },
    {
      id: "loading-strategies",
      title: "Eager, lazy, and explicit loading",
      difficulty: "medium",
      question: "What are the three navigation-property loading strategies in EF Core and how do you use each?",
      answer: `**1. Eager loading** — load related data in the same query using \`Include\` / \`ThenInclude\`.
\`\`\`csharp
var orders = await db.Orders
    .Include(o => o.Customer)
    .Include(o => o.Lines)
        .ThenInclude(l => l.Product)
    .Where(o => o.PlacedAt > DateTime.UtcNow.AddDays(-7))
    .ToListAsync();
\`\`\`
Best for: known access patterns, avoids N+1.

**2. Lazy loading** — navigation properties are loaded on first access (requires proxies).
\`\`\`csharp
// Install: Microsoft.EntityFrameworkCore.Proxies
services.AddDbContext<AppDbContext>(o => o
    .UseSqlServer(connStr)
    .UseLazyLoadingProxies());

// Entity nav properties must be virtual
public virtual ICollection<OrderLine> Lines { get; set; } = [];

// Usage — DB hit happens here transparently
var lineCount = order.Lines.Count; // SELECT issued now
\`\`\`
Best for: exploratory/prototype code. Avoid in hot paths — leads to N+1.

**3. Explicit loading** — manually load a navigation when needed.
\`\`\`csharp
var order = await db.Orders.FindAsync(orderId);

// Load a collection
await db.Entry(order)
    .Collection(o => o.Lines)
    .LoadAsync();

// Load a reference
await db.Entry(order)
    .Reference(o => o.Customer)
    .LoadAsync();
\`\`\`
Best for: conditional loading where you don't always need the related data.`,
      tags: ["loading", "include", "lazy-loading", "performance"],
    },
    {
      id: "n-plus-one-problem",
      title: "N+1 problem and how to avoid it",
      difficulty: "medium",
      question: "What is the N+1 query problem in EF Core and how do you detect and fix it?",
      answer: `**The N+1 problem** occurs when you load N parent entities and then issue one additional query *per entity* to load related data — N+1 total queries.

**Example of the bug**
\`\`\`csharp
// 1 query to load all orders
var orders = await db.Orders.ToListAsync();

foreach (var order in orders)
{
    // 1 query PER order — N extra queries!
    Console.WriteLine(order.Customer.Name);
}
\`\`\`
With 100 orders that's 101 database round trips.

**Fix 1: Eager loading**
\`\`\`csharp
var orders = await db.Orders
    .Include(o => o.Customer)   // JOIN in a single query
    .ToListAsync();
\`\`\`

**Fix 2: Projection (most efficient)**
\`\`\`csharp
var results = await db.Orders
    .Select(o => new { o.Id, CustomerName = o.Customer.Name })
    .ToListAsync();
\`\`\`

**Fix 3: Split queries (EF Core 5+)**
\`\`\`csharp
var orders = await db.Orders
    .Include(o => o.Lines)
    .AsSplitQuery()   // two queries instead of a Cartesian product
    .ToListAsync();
\`\`\`

**Detection tools**
- Enable sensitive logging: \`options.EnableSensitiveDataLogging().LogTo(Console.WriteLine)\`
- MiniProfiler or EF Core diagnostic listeners
- Application Insights SQL telemetry in production`,
      tags: ["performance", "n+1", "loading"],
    },
    {
      id: "linq-queries",
      title: "LINQ queries with EF Core",
      difficulty: "medium",
      question: "Show common LINQ operators used with EF Core and how they translate to SQL.",
      answer: `EF Core translates LINQ method chains into SQL at query execution time (deferred execution).

\`\`\`csharp
// Filtering
var cheap = await db.Products
    .Where(p => p.Price < 50 && p.IsActive)
    .ToListAsync();
// → SELECT ... FROM Products WHERE Price < 50 AND IsActive = 1

// Projection to DTO (avoids SELECT *)
var dtos = await db.Products
    .Select(p => new ProductDto(p.Id, p.Name, p.Price))
    .ToListAsync();

// Single results
var product = await db.Products.FirstOrDefaultAsync(p => p.Id == id);
var product2 = await db.Products.SingleOrDefaultAsync(p => p.Sku == sku); // throws if >1

// Aggregates
var count  = await db.Products.CountAsync(p => p.IsActive);
var total  = await db.Orders.SumAsync(o => o.Total);
var exists = await db.Products.AnyAsync(p => p.StockQty == 0);

// Ordering and paging
var page = await db.Products
    .OrderBy(p => p.Name)
    .Skip((pageIndex - 1) * pageSize)
    .Take(pageSize)
    .ToListAsync();

// Grouping (EF Core 6+)
var salesByMonth = await db.Orders
    .GroupBy(o => new { o.PlacedAt.Year, o.PlacedAt.Month })
    .Select(g => new { g.Key, Total = g.Sum(o => o.Total) })
    .ToListAsync();
\`\`\`

**Key rule:** always call a terminal operator (\`ToListAsync\`, \`FirstOrDefaultAsync\`, \`AnyAsync\`, etc.) to execute the query. Until then it's an \`IQueryable<T>\` — no SQL has run.`,
      tags: ["linq", "queries", "performance"],
    },
    {
      id: "raw-sql",
      title: "Raw SQL with EF Core",
      difficulty: "medium",
      question: "When and how do you execute raw SQL in EF Core?",
      answer: `Use raw SQL when LINQ can't express the query efficiently (CTEs, window functions, stored procedures) or when performance is critical.

**FromSqlRaw / FromSql (EF Core 8+) — for queries returning entities**
\`\`\`csharp
// FromSql (EF Core 8, uses interpolated string safely)
var products = await db.Products
    .FromSql(\$"SELECT * FROM Products WHERE CategoryId = {categoryId}")
    .Include(p => p.Category)       // can chain LINQ!
    .Where(p => p.IsActive)
    .ToListAsync();

// FromSqlRaw — explicit parameterisation (avoids SQL injection)
var products2 = await db.Products
    .FromSqlRaw("SELECT * FROM Products WHERE CategoryId = {0}", categoryId)
    .ToListAsync();
\`\`\`

**ExecuteSqlRaw / ExecuteSql — for non-query commands**
\`\`\`csharp
// Bulk deactivate (before EF Core 7 ExecuteUpdate)
int rows = await db.Database
    .ExecuteSqlRawAsync(
        "UPDATE Products SET IsActive = 0 WHERE ExpiresAt < {0}",
        DateTime.UtcNow);
\`\`\`

**EF Core 7+ bulk operations (preferred over raw SQL for simple cases)**
\`\`\`csharp
// ExecuteUpdate — no entity tracking needed
await db.Products
    .Where(p => p.ExpiresAt < DateTime.UtcNow)
    .ExecuteUpdateAsync(s => s.SetProperty(p => p.IsActive, false));

// ExecuteDelete
await db.AuditLogs
    .Where(l => l.CreatedAt < cutoff)
    .ExecuteDeleteAsync();
\`\`\`

**Security:** never interpolate user input directly into \`FromSqlRaw\` or \`ExecuteSqlRaw\` — always use parameters.`,
      tags: ["raw-sql", "performance", "security"],
    },
    {
      id: "transactions",
      title: "Transactions in EF Core",
      difficulty: "medium",
      question: "How do you manage database transactions in EF Core?",
      answer: `**Implicit transaction (default)**
\`SaveChanges\` wraps all pending changes in a single transaction automatically — either all succeed or all roll back.

**Explicit transaction — multiple SaveChanges calls**
\`\`\`csharp
await using var tx = await db.Database.BeginTransactionAsync();
try
{
    db.Orders.Add(order);
    await db.SaveChangesAsync();

    db.Inventory.Update(inventoryItem);
    await db.SaveChangesAsync();

    await tx.CommitAsync();
}
catch
{
    await tx.RollbackAsync();
    throw;
}
\`\`\`

**Savepoints (EF Core 5+)**
\`\`\`csharp
await tx.CreateSavepointAsync("BeforeOrderLines");
// ... risky work ...
await tx.RollbackToSavepointAsync("BeforeOrderLines");
\`\`\`

**TransactionScope (cross-context / cross-resource)**
\`\`\`csharp
using var scope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled);

await db1.SaveChangesAsync();
await db2.SaveChangesAsync();

scope.Complete(); // promotes to DTC if needed
\`\`\`

**Best practices**
- Keep transactions short — long transactions hold locks.
- Avoid \`TransactionScope\` across HTTP boundaries.
- Prefer \`ExecuteUpdate\`/\`ExecuteDelete\` for bulk ops — they run in their own implicit transaction.`,
      tags: ["transactions", "savechanges"],
    },
    {
      id: "concurrency-tokens",
      title: "Optimistic concurrency with RowVersion",
      difficulty: "medium",
      question: "How does EF Core implement optimistic concurrency, and how do you handle concurrency conflicts?",
      answer: `**Optimistic concurrency** assumes conflicts are rare — it doesn't lock rows but detects conflicts at save time using a **concurrency token**.

**SQL Server — rowversion / timestamp**
\`\`\`csharp
public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public decimal Price { get; set; }

    [Timestamp]              // maps to rowversion in SQL Server
    public byte[] RowVersion { get; set; } = [];
}

// Fluent API alternative
builder.Property(p => p.RowVersion)
       .IsRowVersion()
       .IsConcurrencyToken();
\`\`\`

EF Core includes the token value in \`UPDATE WHERE RowVersion = @original\`. If no rows are affected, it throws \`DbUpdateConcurrencyException\`.

**PostgreSQL — xmin column**
\`\`\`csharp
builder.Property<uint>("xmin")
       .HasColumnName("xmin")
       .HasColumnType("xid")
       .IsRowVersion();
\`\`\`

**Handling the conflict**
\`\`\`csharp
try
{
    await db.SaveChangesAsync();
}
catch (DbUpdateConcurrencyException ex)
{
    var entry = ex.Entries.Single();
    var dbValues  = await entry.GetDatabaseValuesAsync();
    var currValues = entry.CurrentValues;

    // Strategy A: client wins — overwrite DB values
    entry.OriginalValues.SetValues(dbValues!);

    // Strategy B: database wins — discard client changes
    entry.SetValues(dbValues!);

    // Strategy C: merge — present to user
    await db.SaveChangesAsync();
}
\`\`\``,
      tags: ["concurrency", "rowversion", "optimistic-concurrency"],
    },
    {
      id: "global-query-filters",
      title: "Global query filters and soft delete",
      difficulty: "medium",
      question: "What are global query filters in EF Core and how do you implement a soft-delete pattern with them?",
      answer: `**Global query filters** are LINQ predicates applied automatically to every query for a given entity type — useful for multi-tenancy and soft delete.

**Soft-delete entity**
\`\`\`csharp
public interface ISoftDeletable
{
    bool IsDeleted { get; set; }
    DateTime? DeletedAt { get; set; }
}

public class Order : ISoftDeletable
{
    public int Id { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    // ...
}
\`\`\`

**Register the filter**
\`\`\`csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Order>()
        .HasQueryFilter(o => !o.IsDeleted);
}
\`\`\`

Now \`db.Orders.ToListAsync()\` silently appends \`WHERE IsDeleted = 0\`.

**Override SaveChanges to intercept deletes**
\`\`\`csharp
public override Task<int> SaveChangesAsync(CancellationToken ct = default)
{
    foreach (var entry in ChangeTracker.Entries<ISoftDeletable>()
                 .Where(e => e.State == EntityState.Deleted))
    {
        entry.State = EntityState.Modified;
        entry.Entity.IsDeleted  = true;
        entry.Entity.DeletedAt  = DateTime.UtcNow;
    }
    return base.SaveChangesAsync(ct);
}
\`\`\`

**Bypassing the filter when needed**
\`\`\`csharp
var allOrders = await db.Orders
    .IgnoreQueryFilters()   // includes soft-deleted rows
    .ToListAsync();
\`\`\``,
      tags: ["global-query-filters", "soft-delete", "multi-tenancy"],
    },
    {
      id: "owned-entities",
      title: "Owned entities",
      difficulty: "medium",
      question: "What are owned entities in EF Core and when should you use them?",
      answer: `**Owned entities** model value objects — types that have no independent identity and always belong to a parent entity. EF Core maps them to the same table by default (table splitting) or a separate table.

**Example: Address as a value object**
\`\`\`csharp
[Owned]
public class Address
{
    public string Street  { get; set; } = "";
    public string City    { get; set; } = "";
    public string Country { get; set; } = "";
}

public class Customer
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public Address ShippingAddress { get; set; } = new();
    public Address BillingAddress  { get; set; } = new();
}
\`\`\`

**Fluent API (alternative to [Owned])**
\`\`\`csharp
modelBuilder.Entity<Customer>()
    .OwnsOne(c => c.ShippingAddress, a =>
    {
        a.Property(x => x.Street).HasColumnName("ShippingStreet");
        a.Property(x => x.City).HasColumnName("ShippingCity");
    })
    .OwnsOne(c => c.BillingAddress, a =>
    {
        a.Property(x => x.Street).HasColumnName("BillingStreet");
        a.Property(x => x.City).HasColumnName("BillingCity");
    });
\`\`\`

**Separate table (ToTable)**
\`\`\`csharp
modelBuilder.Entity<Customer>()
    .OwnsOne(c => c.ShippingAddress)
    .ToTable("CustomerAddresses");
\`\`\`

**When to use:** DDD value objects, embedded sub-records that logically belong to the parent and are never queried independently.`,
      tags: ["owned-entities", "ddd", "value-objects"],
    },

    // ───── HARD ─────
    {
      id: "split-queries",
      title: "Split queries",
      difficulty: "hard",
      question: "What problem do split queries solve in EF Core and what are their trade-offs?",
      answer: `**The Cartesian explosion problem**
When you \`Include\` multiple collection navigations in a single query, EF Core generates a JOIN that produces a Cartesian product:

\`\`\`csharp
// Could return Orders × Lines × Tags rows
var orders = await db.Orders
    .Include(o => o.Lines)
    .Include(o => o.Tags)
    .ToListAsync();
\`\`\`
With 100 orders × 50 lines × 10 tags = 50,000 rows transferred — mostly duplicated data.

**Split queries fix this**
\`\`\`csharp
var orders = await db.Orders
    .Include(o => o.Lines)
    .Include(o => o.Tags)
    .AsSplitQuery()   // EF Core 5+
    .ToListAsync();
\`\`\`
EF Core issues *three* separate queries and stitches the results in memory:
1. \`SELECT * FROM Orders\`
2. \`SELECT * FROM OrderLines WHERE OrderId IN (...)\`
3. \`SELECT * FROM Tags WHERE OrderId IN (...)\`

**Set as default globally**
\`\`\`csharp
options.UseSqlServer(connStr, o => o.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery));
\`\`\`

**Trade-offs**
| | Single query | Split query |
|---|---|---|
| Round trips | 1 | N (one per Include root) |
| Data duplication | High (Cartesian) | None |
| Consistency | Atomic snapshot | Slight risk if data changes between splits |
| Best for | Few, small collections | Large/multiple collections |

Split queries are not a silver bullet — if the data changes between the sub-queries, you may see inconsistent results. Wrap in a transaction for snapshot isolation.`,
      tags: ["split-queries", "performance", "cartesian-explosion"],
    },
    {
      id: "compiled-queries",
      title: "Compiled queries",
      difficulty: "hard",
      question: "What are compiled queries in EF Core and when should you use them?",
      answer: `Every time EF Core executes a LINQ query it must translate it to SQL — parsing the expression tree, building the SQL AST, and converting it to a SQL string. **Compiled queries** perform this translation once and cache the result.

**How to define**
\`\`\`csharp
public static class CompiledQueries
{
    // EF.CompileAsyncQuery returns a delegate
    public static readonly Func<AppDbContext, int, Task<Product?>> GetProductById =
        EF.CompileAsyncQuery((AppDbContext db, int id) =>
            db.Products.FirstOrDefault(p => p.Id == id));

    public static readonly Func<AppDbContext, decimal, IAsyncEnumerable<Product>> GetCheapProducts =
        EF.CompileAsyncQuery((AppDbContext db, decimal maxPrice) =>
            db.Products.Where(p => p.Price <= maxPrice).OrderBy(p => p.Price));
}
\`\`\`

**Usage**
\`\`\`csharp
var product = await CompiledQueries.GetProductById(db, productId);

await foreach (var p in CompiledQueries.GetCheapProducts(db, 49.99m))
{
    // stream results
}
\`\`\`

**When to use**
- Hot paths called thousands of times per second (e.g. product detail page, auth checks).
- Benchmarks show compiled queries are typically **3–5× faster** than non-compiled equivalents at high frequency.

**Limitations**
- Parameters only — cannot capture closures or vary the query shape.
- Adding \`Include\` / \`ThenInclude\` is supported but the whole shape must be fixed at compile time.
- EF Core already caches query translations internally, so the gain is most visible when the same context instance runs the query many times, or when startup/warm-up cost matters.`,
      tags: ["compiled-queries", "performance"],
    },
    {
      id: "value-converters",
      title: "Value converters",
      difficulty: "hard",
      question: "What are value converters in EF Core and how do you implement one?",
      answer: `**Value converters** let EF Core transform a property value between the .NET type and the database column type — useful for encrypting data, storing enums as strings, or serialising value objects as JSON.

**Built-in converter — enum to string**
\`\`\`csharp
builder.Property(p => p.Status)
    .HasConversion<string>();   // stores "Active", "Inactive" instead of 0, 1
\`\`\`

**Custom converter — encrypt a sensitive field**
\`\`\`csharp
public class EncryptedStringConverter : ValueConverter<string, string>
{
    public EncryptedStringConverter(IEncryptionService enc)
        : base(
            plain   => enc.Encrypt(plain),   // .NET → DB
            cipher  => enc.Decrypt(cipher))  // DB → .NET
    { }
}

// Registration
builder.Property(c => c.TaxNumber)
    .HasConversion(new EncryptedStringConverter(encryptionService));
\`\`\`

**Storing a collection as JSON (EF Core 8 — JSON columns preferred; older: value converter)**
\`\`\`csharp
var converter = new ValueConverter<List<string>, string>(
    v  => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
    v  => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null)!);

builder.Property(p => p.Tags).HasConversion(converter);
\`\`\`

**EF Core 8 native JSON columns (preferred over converter for collections)**
\`\`\`csharp
builder.OwnsMany(p => p.Tags, t => t.ToJson());
\`\`\`

**Limitations**
- Converters are not visible to the database — you can't filter/sort on the converted representation easily.
- Avoid for columns you need to query with predicates in SQL; use computed columns or JSON path queries instead.`,
      tags: ["value-converters", "configuration"],
    },
    {
      id: "ef-core-interceptors",
      title: "EF Core interceptors",
      difficulty: "hard",
      question: "What are EF Core interceptors and what can you do with them?",
      answer: `**Interceptors** let you hook into EF Core's internal pipeline to observe or modify operations: command execution, SaveChanges, connection opening, transaction handling, and more.

**Available interceptor interfaces**
- \`IDbCommandInterceptor\` — before/after SQL execution
- \`ISaveChangesInterceptor\` — before/after \`SaveChanges\`
- \`IDbConnectionInterceptor\` — connection events
- \`IDbTransactionInterceptor\` — transaction events

**Example: audit interceptor (auto-set timestamps)**
\`\`\`csharp
public class AuditInterceptor : SaveChangesInterceptor
{
    public override InterceptionResult<int> SavingChanges(
        DbContextEventData data, InterceptionResult<int> result)
    {
        SetTimestamps(data.Context!);
        return base.SavingChanges(data, result);
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData data, InterceptionResult<int> result, CancellationToken ct = default)
    {
        SetTimestamps(data.Context!);
        return base.SavingChangesAsync(data, result, ct);
    }

    private static void SetTimestamps(DbContext db)
    {
        var now = DateTime.UtcNow;
        foreach (var entry in db.ChangeTracker.Entries<IAuditable>())
        {
            if (entry.State == EntityState.Added)
                entry.Entity.CreatedAt = now;
            if (entry.State is EntityState.Added or EntityState.Modified)
                entry.Entity.UpdatedAt = now;
        }
    }
}
\`\`\`

**Registration**
\`\`\`csharp
builder.Services.AddSingleton<AuditInterceptor>();

builder.Services.AddDbContext<AppDbContext>((sp, options) =>
    options.UseSqlServer(connStr)
           .AddInterceptors(sp.GetRequiredService<AuditInterceptor>()));
\`\`\`

**Example: command interceptor for query tagging / logging**
\`\`\`csharp
public class QueryTagInterceptor : DbCommandInterceptor
{
    public override ValueTask<DbDataReader> ReaderExecutedAsync(
        DbCommand command, CommandExecutedEventData data, DbDataReader result,
        CancellationToken ct = default)
    {
        // Log slow queries
        if (data.Duration > TimeSpan.FromSeconds(1))
            Log.Warning("Slow query ({ms}ms): {sql}", data.Duration.TotalMilliseconds, command.CommandText);

        return new ValueTask<DbDataReader>(result);
    }
}
\`\`\``,
      tags: ["interceptors", "advanced", "audit"],
    },
    {
      id: "connection-resiliency",
      title: "Connection resiliency and retry policies",
      difficulty: "hard",
      question: "How do you configure connection resiliency in EF Core and what are the caveats with transactions?",
      answer: `Transient failures (network blips, connection pool exhaustion, cloud DB failovers) are common. EF Core's **execution strategy** retries failed operations automatically.

**Enabling built-in retry (SQL Server / Azure SQL)**
\`\`\`csharp
options.UseSqlServer(connStr, sqlOptions =>
    sqlOptions.EnableRetryOnFailure(
        maxRetryCount:       5,
        maxRetryDelay:       TimeSpan.FromSeconds(30),
        errorNumbersToAdd:   null));   // null = use default transient error list
\`\`\`

**PostgreSQL (Npgsql)**
\`\`\`csharp
options.UseNpgsql(connStr, o => o.EnableRetryOnFailure(5));
\`\`\`

**The transaction caveat**
Retry strategies require that the entire operation is **idempotent** — if a retry re-runs, it must not double-insert data. This conflicts with explicit transactions (EF Core cannot know whether the first attempt committed before the connection dropped).

**Solution: wrap in \`IExecutionStrategy\`**
\`\`\`csharp
var strategy = db.Database.CreateExecutionStrategy();

await strategy.ExecuteAsync(async () =>
{
    await using var tx = await db.Database.BeginTransactionAsync();

    db.Orders.Add(order);
    await db.SaveChangesAsync();

    db.Inventory.Update(item);
    await db.SaveChangesAsync();

    await tx.CommitAsync();
});
\`\`\`

The lambda is retried as a whole, so the transaction is replayed from scratch on failure — safe because the previous attempt's transaction would have been rolled back.

**Avoid \`TransactionScope\` with retry strategies** — ambient transactions suppress the retry mechanism.`,
      tags: ["resiliency", "retry", "transactions", "cloud"],
    },
    {
      id: "ef-core-vs-dapper",
      title: "EF Core vs Dapper",
      difficulty: "hard",
      question: "When would you choose Dapper over EF Core, and can you use both together?",
      answer: `**EF Core** is a full ORM with change tracking, migrations, LINQ, relationships, and caching. **Dapper** is a micro-ORM — a thin wrapper over ADO.NET that maps SQL results to objects with minimal overhead.

**Trade-offs**

| Concern | EF Core | Dapper |
|---|---|---|
| Productivity (CRUD) | Very high — LINQ, migrations | Lower — write SQL manually |
| Query control | Medium (LINQ limits complex SQL) | Full — any SQL you can write |
| Performance (simple queries) | Good (compiled queries) | Slightly faster (~10–20%) |
| Performance (complex SQL) | Can be slow if LINQ translates poorly | Optimal |
| Change tracking | Automatic | None — you manage state |
| Schema migrations | Built-in | External tool (Flyway, DbUp, etc.) |
| Learning curve | Higher | Very low |

**Using both in the same project (CQRS pattern)**
\`\`\`csharp
// Commands → EF Core (change tracking, validation, domain events)
public class CreateOrderHandler
{
    public async Task Handle(CreateOrderCommand cmd)
    {
        var order = new Order(cmd.CustomerId, cmd.Lines);
        _db.Orders.Add(order);
        await _db.SaveChangesAsync();
    }
}

// Queries → Dapper (raw SQL, projections, performance)
public class OrderSummaryQuery
{
    public async Task<IReadOnlyList<OrderSummaryDto>> Handle(int customerId)
    {
        const string sql = """
            SELECT o.Id, o.PlacedAt, SUM(l.Qty * l.UnitPrice) AS Total
            FROM   Orders o
            JOIN   OrderLines l ON l.OrderId = o.Id
            WHERE  o.CustomerId = @customerId
            GROUP  BY o.Id, o.PlacedAt
            ORDER  BY o.PlacedAt DESC
            """;

        return (await _connection.QueryAsync<OrderSummaryDto>(sql, new { customerId }))
            .AsList();
    }
}
\`\`\`

**Rule of thumb:** use EF Core as the default; drop to Dapper for reporting queries, batch operations, or any query that EF Core translates poorly.`,
      tags: ["ef-core", "dapper", "performance", "cqrs"],
    },
  ],
};
