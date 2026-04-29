import type { Category } from "./types";

export const dotnetArchitecture: Category = {
  slug: "dotnet-architecture",
  title: ".NET Architecture & Design Patterns",
  description:
    "Clean Architecture, SOLID principles, CQRS with MediatR v12, DDD, Repository & Unit of Work, Vertical Slice, Outbox pattern, domain events, Result pattern, FluentValidation pipeline, AutoMapper vs Mapster, Options pattern, feature flags, health checks, and global exception handling in .NET 9.",
  icon: "🏗️",
  questions: [
    // ───── EASY ─────
    {
      id: "solid-single-responsibility",
      title: "S — Single Responsibility Principle",
      difficulty: "easy",
      question: "What is the Single Responsibility Principle (SRP) and how do you apply it in C#?",
      answer: `**Single Responsibility Principle (SRP)**: a class should have only one reason to change — meaning it owns exactly one piece of behaviour.

**Violation**
\`\`\`csharp
public class OrderService
{
    public void PlaceOrder(Order order)
    {
        // business logic
        SaveToDatabase(order);          // persistence concern
        SendConfirmationEmail(order);   // notification concern
        LogOrder(order);               // logging concern
    }
}
\`\`\`

**Fixed** — each concern lives in its own class:
\`\`\`csharp
public class OrderService
{
    private readonly IOrderRepository _repo;
    private readonly IEmailSender _email;
    private readonly ILogger<OrderService> _logger;

    public OrderService(IOrderRepository repo, IEmailSender email, ILogger<OrderService> logger)
        => (_repo, _email, _logger) = (repo, email, logger);

    public async Task PlaceOrderAsync(Order order)
    {
        await _repo.AddAsync(order);
        await _email.SendConfirmationAsync(order);
        _logger.LogInformation("Order {Id} placed", order.Id);
    }
}
\`\`\`

**Why it matters**: smaller classes are easier to test, maintain, and replace independently.`,
      tags: ["solid", "srp", "design-principles"],
    },
    {
      id: "solid-open-closed",
      title: "O — Open/Closed Principle",
      difficulty: "easy",
      question: "What is the Open/Closed Principle and how can you implement it in C#?",
      answer: `**Open/Closed Principle (OCP)**: software entities should be **open for extension** but **closed for modification**. Add new behaviour without changing existing code.

**Violation** — adding a new discount type requires editing the method:
\`\`\`csharp
public decimal CalculateDiscount(Order order)
{
    if (order.CustomerType == "Premium") return order.Total * 0.10m;
    if (order.CustomerType == "VIP")     return order.Total * 0.20m;
    return 0;
}
\`\`\`

**Fixed** — extend via polymorphism:
\`\`\`csharp
public interface IDiscountStrategy
{
    decimal Calculate(Order order);
}

public class PremiumDiscount : IDiscountStrategy
{
    public decimal Calculate(Order order) => order.Total * 0.10m;
}

public class VipDiscount : IDiscountStrategy
{
    public decimal Calculate(Order order) => order.Total * 0.20m;
}

public class OrderPricer(IDiscountStrategy discount)
{
    public decimal FinalPrice(Order order) =>
        order.Total - discount.Calculate(order);
}
\`\`\`

New discount types are added as new classes — no existing code is touched.`,
      tags: ["solid", "ocp", "design-principles"],
    },
    {
      id: "solid-liskov-substitution",
      title: "L — Liskov Substitution Principle",
      difficulty: "easy",
      question: "What is the Liskov Substitution Principle and what is a classic violation?",
      answer: `**Liskov Substitution Principle (LSP)**: subtypes must be substitutable for their base types without altering program correctness.

**Classic violation — the Rectangle/Square problem**:
\`\`\`csharp
public class Rectangle
{
    public virtual int Width  { get; set; }
    public virtual int Height { get; set; }
    public int Area() => Width * Height;
}

public class Square : Rectangle
{
    // Enforces Width == Height — breaks Rectangle's contract
    public override int Width  { set { base.Width = base.Height = value; } }
    public override int Height { set { base.Width = base.Height = value; } }
}

// Caller assumes Width and Height are independent
Rectangle r = new Square();
r.Width = 4;
r.Height = 5;
Console.WriteLine(r.Area()); // 25, not 20 — LSP violated
\`\`\`

**Fix** — prefer composition or a shared interface instead of inheritance when the "is-a" relationship has conflicting contracts:
\`\`\`csharp
public interface IShape { int Area(); }
public class Rectangle(int w, int h) : IShape { public int Area() => w * h; }
public class Square(int side)        : IShape { public int Area() => side * side; }
\`\`\``,
      tags: ["solid", "lsp", "design-principles"],
    },
    {
      id: "solid-interface-segregation",
      title: "I — Interface Segregation Principle",
      difficulty: "easy",
      question: "What is the Interface Segregation Principle and how does it prevent fat interfaces?",
      answer: `**Interface Segregation Principle (ISP)**: clients should not be forced to depend on interfaces they do not use. Prefer many small, focused interfaces over one large one.

**Fat interface violation**:
\`\`\`csharp
public interface IWorker
{
    void Work();
    void Eat();   // robots don't eat!
    void Sleep();
}

public class Robot : IWorker
{
    public void Work() { /* ... */ }
    public void Eat()  => throw new NotImplementedException(); // forced stub
    public void Sleep() => throw new NotImplementedException();
}
\`\`\`

**Fixed** — split into role interfaces:
\`\`\`csharp
public interface IWorkable  { void Work(); }
public interface IFeedable  { void Eat(); }
public interface ISleepable { void Sleep(); }

public class Human  : IWorkable, IFeedable, ISleepable { /* ... */ }
public class Robot  : IWorkable { public void Work() { /* ... */ } }
\`\`\`

In .NET this also aligns with how framework interfaces are designed (e.g., \`IAsyncEnumerable<T>\` vs \`IEnumerable<T>\`).`,
      tags: ["solid", "isp", "design-principles"],
    },
    {
      id: "solid-dependency-inversion",
      title: "D — Dependency Inversion Principle",
      difficulty: "easy",
      question: "What is the Dependency Inversion Principle and how does .NET's DI container enforce it?",
      answer: `**Dependency Inversion Principle (DIP)**:
1. High-level modules should not depend on low-level modules — both should depend on **abstractions**.
2. Abstractions should not depend on details — details depend on abstractions.

**Violation** — high-level service constructs its own dependency:
\`\`\`csharp
public class ReportService
{
    private readonly SqlReportRepository _repo = new SqlReportRepository(); // concrete!
}
\`\`\`

**Fixed** — depend on an abstraction, injected from outside:
\`\`\`csharp
public interface IReportRepository
{
    Task<Report> GetByIdAsync(Guid id);
}

public class ReportService(IReportRepository repo)
{
    public Task<Report> GetAsync(Guid id) => repo.GetByIdAsync(id);
}
\`\`\`

**Registration in .NET 9 DI**:
\`\`\`csharp
builder.Services.AddScoped<IReportRepository, SqlReportRepository>();
builder.Services.AddScoped<ReportService>();
\`\`\`

The DI container acts as the **composition root** — it wires abstractions to concrete implementations at startup so application code never calls \`new\` on infrastructure types.`,
      tags: ["solid", "dip", "dependency-injection", "design-principles"],
    },
    {
      id: "repository-pattern",
      title: "Repository Pattern",
      difficulty: "easy",
      question: "What is the Repository pattern and how do you implement it in .NET?",
      answer: `The **Repository pattern** abstracts data access behind an interface, so the domain/application layer never sees EF Core, Dapper, or any other persistence technology.

**Interface (Application layer)**:
\`\`\`csharp
public interface IOrderRepository
{
    Task<Order?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<Order>> GetAllAsync(CancellationToken ct = default);
    Task AddAsync(Order order, CancellationToken ct = default);
    void Update(Order order);
    void Delete(Order order);
}
\`\`\`

**Implementation (Infrastructure layer)**:
\`\`\`csharp
public class OrderRepository(AppDbContext db) : IOrderRepository
{
    public Task<Order?> GetByIdAsync(Guid id, CancellationToken ct) =>
        db.Orders.FirstOrDefaultAsync(o => o.Id == id, ct);

    public async Task<IReadOnlyList<Order>> GetAllAsync(CancellationToken ct) =>
        await db.Orders.ToListAsync(ct);

    public Task AddAsync(Order order, CancellationToken ct) =>
        db.Orders.AddAsync(order, ct).AsTask();

    public void Update(Order order) => db.Orders.Update(order);
    public void Delete(Order order) => db.Orders.Remove(order);
}
\`\`\`

**Benefits**: testable (swap with in-memory), decoupled (change ORM without touching business logic), queryable via specifications.`,
      tags: ["repository", "pattern", "data-access"],
    },
    {
      id: "options-pattern",
      title: "Options Pattern — IOptions / IOptionsSnapshot / IOptionsMonitor",
      difficulty: "easy",
      question: "What is the Options pattern in .NET and what is the difference between IOptions, IOptionsSnapshot, and IOptionsMonitor?",
      answer: `The **Options pattern** binds configuration sections to strongly-typed POCO classes using the \`Microsoft.Extensions.Options\` infrastructure.

**Define a settings class**:
\`\`\`csharp
public class SmtpSettings
{
    public string Host    { get; init; } = "";
    public int    Port    { get; init; } = 587;
    public bool   UseSsl  { get; init; } = true;
}
\`\`\`

**Register**:
\`\`\`csharp
builder.Services.Configure<SmtpSettings>(
    builder.Configuration.GetSection("Smtp"));
\`\`\`

**Three interfaces**:

| Interface | Lifetime | Reloads on change? | Use case |
|---|---|---|---|
| \`IOptions<T>\` | Singleton | No | Fixed config used throughout app lifetime |
| \`IOptionsSnapshot<T>\` | Scoped | Yes (per request) | Per-request reload (web requests) |
| \`IOptionsMonitor<T>\` | Singleton | Yes (real-time) | Background services, long-lived singletons |

\`\`\`csharp
public class EmailSender(IOptionsMonitor<SmtpSettings> opts)
{
    public void Send(string to, string subject)
    {
        var settings = opts.CurrentValue; // always up-to-date
        // ...
    }
}
\`\`\`

Add validation with \`ValidateDataAnnotations()\` or \`ValidateOnStart()\` to catch bad config at startup.`,
      tags: ["options-pattern", "configuration", "ioptionsmonitor"],
    },

    // ───── MEDIUM ─────
    {
      id: "clean-architecture-layers",
      title: "Clean Architecture — Layers and Dependency Rule",
      difficulty: "medium",
      question: "Describe Clean Architecture's four layers and the dependency rule. Provide a typical .NET folder structure.",
      answer: `**Clean Architecture** (Robert C. Martin) organises code in concentric rings. The **dependency rule**: source code dependencies may only point **inward** — outer layers know about inner layers, never the reverse.

**Layers (inner → outer)**:
1. **Domain** — entities, value objects, domain events, aggregates, repository interfaces, domain services. Zero external dependencies.
2. **Application** — use cases (commands/queries), DTOs, application service interfaces (IEmailSender, IFileStorage), validation. Depends only on Domain.
3. **Infrastructure** — EF Core DbContext, repository implementations, external API clients, email sender. Depends on Application + Domain.
4. **Presentation** — ASP.NET Core controllers / Minimal API endpoints, middleware, request/response models. Depends on Application.

**Typical folder structure**:
\`\`\`
src/
├── MyApp.Domain/
│   ├── Entities/
│   ├── ValueObjects/
│   ├── Events/
│   └── Repositories/          ← interfaces only
├── MyApp.Application/
│   ├── Orders/
│   │   ├── Commands/
│   │   │   └── PlaceOrder/
│   │   │       ├── PlaceOrderCommand.cs
│   │   │       └── PlaceOrderHandler.cs
│   │   └── Queries/
│   ├── Common/
│   │   ├── Behaviours/        ← MediatR pipeline behaviours
│   │   └── Interfaces/
├── MyApp.Infrastructure/
│   ├── Persistence/
│   │   ├── AppDbContext.cs
│   │   └── Repositories/
│   └── Services/
└── MyApp.Api/
    ├── Endpoints/
    └── Program.cs
\`\`\`

**Key benefit**: swapping the database or the web framework touches only the outermost layer; the domain and application remain untouched.`,
      tags: ["clean-architecture", "layers", "dependency-rule"],
    },
    {
      id: "cqrs-pattern",
      title: "CQRS — Command Query Responsibility Segregation",
      difficulty: "medium",
      question: "What is CQRS and how is it different from a traditional service layer?",
      answer: `**CQRS** separates the *write* model (commands that mutate state) from the *read* model (queries that return data). Each side can be optimised, scaled, and tested independently.

**Traditional service (both read & write in one class)**:
\`\`\`csharp
public class OrderService
{
    Task<Order> GetOrderAsync(Guid id) { ... }
    Task PlaceOrderAsync(PlaceOrderDto dto) { ... }
    Task CancelOrderAsync(Guid id) { ... }
}
\`\`\`

**CQRS with MediatR v12**:
\`\`\`csharp
// Command — mutates state, returns a Result
public record PlaceOrderCommand(Guid CustomerId, List<OrderLine> Lines)
    : IRequest<Result<Guid>>;

// Query — read-only, returns a DTO
public record GetOrderQuery(Guid OrderId)
    : IRequest<Result<OrderDto>>;
\`\`\`

**Benefits**:
- Commands and queries scale independently (e.g., read replicas for queries).
- Read models can be denormalised for performance without affecting the write model.
- Each handler has a single responsibility — easy to test in isolation.
- Works naturally with event sourcing but does not require it.

**Trade-off**: more classes and indirection; overkill for simple CRUD apps.`,
      tags: ["cqrs", "commands", "queries", "mediatr"],
    },
    {
      id: "mediatr-handlers-behaviours",
      title: "MediatR v12 — Handlers and Pipeline Behaviours",
      difficulty: "medium",
      question: "Show how to implement a MediatR command handler and a pipeline behaviour in .NET 9 with MediatR v12.",
      answer: `**MediatR v12** uses \`IRequest<TResponse>\`, \`IRequestHandler<TRequest, TResponse>\`, and \`IPipelineBehavior<TRequest, TResponse>\`.

**Command + Handler**:
\`\`\`csharp
// Application/Orders/Commands/PlaceOrder/PlaceOrderCommand.cs
public record PlaceOrderCommand(Guid CustomerId, List<OrderLine> Lines)
    : IRequest<Result<Guid>>;

// Application/Orders/Commands/PlaceOrder/PlaceOrderHandler.cs
public class PlaceOrderHandler(
    IOrderRepository orders,
    IUnitOfWork uow) : IRequestHandler<PlaceOrderCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(
        PlaceOrderCommand cmd, CancellationToken ct)
    {
        var order = Order.Create(cmd.CustomerId, cmd.Lines);
        await orders.AddAsync(order, ct);
        await uow.SaveChangesAsync(ct);
        return Result.Ok(order.Id);
    }
}
\`\`\`

**Logging pipeline behaviour**:
\`\`\`csharp
public class LoggingBehaviour<TRequest, TResponse>(
    ILogger<LoggingBehaviour<TRequest, TResponse>> logger)
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken ct)
    {
        var name = typeof(TRequest).Name;
        logger.LogInformation("Handling {Request}", name);
        var response = await next(ct);  // MediatR v12: delegate accepts CancellationToken
        logger.LogInformation("Handled  {Request}", name);
        return response;
    }
}
\`\`\`

**Registration**:
\`\`\`csharp
builder.Services.AddMediatR(cfg =>
{
    cfg.RegisterServicesFromAssembly(typeof(PlaceOrderCommand).Assembly);
    cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(LoggingBehaviour<,>));
    cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehaviour<,>));
});
\`\`\``,
      tags: ["mediatr", "cqrs", "pipeline-behaviour", "handlers"],
    },
    {
      id: "unit-of-work-pattern",
      title: "Unit of Work Pattern",
      difficulty: "medium",
      question: "What is the Unit of Work pattern and how does it complement the Repository pattern in EF Core?",
      answer: `**Unit of Work (UoW)** tracks all changes made during a business transaction and flushes them to the database in a single commit. In EF Core, \`DbContext\` is already a UoW — you just need a thin wrapper for testability and to avoid exposing \`DbContext\` across layer boundaries.

**Interface**:
\`\`\`csharp
public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
\`\`\`

**Implementation**:
\`\`\`csharp
public class UnitOfWork(AppDbContext db) : IUnitOfWork
{
    public Task<int> SaveChangesAsync(CancellationToken ct) =>
        db.SaveChangesAsync(ct);
}
\`\`\`

**Registration**:
\`\`\`csharp
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
\`\`\`

**Usage in a handler**:
\`\`\`csharp
public async Task<Result<Guid>> Handle(CreateProductCommand cmd, CancellationToken ct)
{
    var product = Product.Create(cmd.Name, cmd.Price);
    await _products.AddAsync(product, ct);  // repository — no SaveChanges yet
    await _uow.SaveChangesAsync(ct);        // single commit
    return Result.Ok(product.Id);
}
\`\`\`

Multiple repositories participate in the same EF Core \`DbContext\` transaction — so either everything commits or nothing does.`,
      tags: ["unit-of-work", "repository", "transactions", "ef-core"],
    },
    {
      id: "ddd-building-blocks",
      title: "DDD Building Blocks — Entities, Value Objects, Aggregates",
      difficulty: "medium",
      question: "What are entities, value objects, aggregates, and bounded contexts in Domain-Driven Design? Show C# examples.",
      answer: `**Entity**: has a unique identity that persists through state changes.
\`\`\`csharp
public class Order : Entity<Guid>
{
    public Guid CustomerId { get; private set; }
    public OrderStatus Status { get; private set; } = OrderStatus.Pending;
    private readonly List<OrderLine> _lines = [];
    public IReadOnlyList<OrderLine> Lines => _lines.AsReadOnly();

    public static Order Create(Guid customerId) => new() { CustomerId = customerId };
}
\`\`\`

**Value Object**: defined entirely by its attributes; no identity; immutable.
\`\`\`csharp
public sealed record Money(decimal Amount, string Currency)
{
    public Money Add(Money other)
    {
        if (Currency != other.Currency)
            throw new InvalidOperationException("Currency mismatch");
        return this with { Amount = Amount + other.Amount };
    }
}
\`\`\`

**Aggregate**: a cluster of entities/value objects with a single **Aggregate Root** that enforces invariants. External code only touches the root.
\`\`\`csharp
// Order is the aggregate root; OrderLine is internal
public class Order : AggregateRoot<Guid>
{
    public void AddLine(Guid productId, int qty, Money unitPrice)
    {
        if (Status != OrderStatus.Pending)
            throw new DomainException("Cannot modify a confirmed order.");
        _lines.Add(new OrderLine(productId, qty, unitPrice));
    }
}
\`\`\`

**Bounded Context**: an explicit boundary within which a domain model applies. "Order" in the Shipping context has different attributes than "Order" in the Billing context — each context owns its own model.`,
      tags: ["ddd", "entities", "value-objects", "aggregates", "bounded-context"],
    },
    {
      id: "domain-events-vs-integration-events",
      title: "Domain Events vs Integration Events",
      difficulty: "medium",
      question: "What is the difference between domain events and integration events, and how are they typically published in .NET?",
      answer: `| Concern | Domain Event | Integration Event |
|---|---|---|
| **Scope** | Within a single bounded context / process | Across bounded contexts / microservices |
| **Transport** | In-process (MediatR \`INotification\`) | Message broker (RabbitMQ, Azure Service Bus) |
| **Timing** | Raised before or during \`SaveChanges\` | Published *after* successful DB commit |
| **Persistence** | Not persisted (or via Outbox) | Persisted via Outbox then relayed to broker |

**Domain event (in-process)**:
\`\`\`csharp
public record OrderPlacedDomainEvent(Guid OrderId, Guid CustomerId)
    : INotification;

// Aggregate raises it
public class Order : AggregateRoot<Guid>
{
    public void Confirm()
    {
        Status = OrderStatus.Confirmed;
        RaiseDomainEvent(new OrderPlacedDomainEvent(Id, CustomerId));
    }
}

// Handler
public class SendWelcomeEmailOnOrderPlaced(IEmailSender email)
    : INotificationHandler<OrderPlacedDomainEvent>
{
    public Task Handle(OrderPlacedDomainEvent evt, CancellationToken ct) =>
        email.SendAsync(evt.CustomerId, "Your order is confirmed!", ct);
}
\`\`\`

**Publishing strategy**: dispatch domain events *after* \`SaveChangesAsync\` (via an EF Core interceptor or overriding \`SaveChangesAsync\` in \`DbContext\`) to ensure consistency — the event is only fired when the state change is durable.`,
      tags: ["domain-events", "integration-events", "ddd", "mediatr"],
    },
    {
      id: "result-pattern",
      title: "Result Pattern — Avoiding Exceptions for Expected Failures",
      difficulty: "medium",
      question: "What is the Result pattern and why is it preferred over throwing exceptions for expected failures in .NET?",
      answer: `The **Result pattern** wraps an operation's outcome (success value *or* error) in a discriminated-union-style type, making failure part of the method signature — callers are forced to handle it.

**Custom lightweight implementation**:
\`\`\`csharp
public class Result<T>
{
    public bool IsSuccess { get; }
    public T?   Value     { get; }
    public Error? Error   { get; }

    private Result(T value)           => (IsSuccess, Value)  = (true,  value);
    private Result(Error error)       => (IsSuccess, Error)  = (false, error);

    public static Result<T> Ok(T value)      => new(value);
    public static Result<T> Fail(Error err)  => new(err);
}

public record Error(string Code, string Description);
\`\`\`

**Usage in a handler**:
\`\`\`csharp
public async Task<Result<Guid>> Handle(PlaceOrderCommand cmd, CancellationToken ct)
{
    var customer = await _customers.GetByIdAsync(cmd.CustomerId, ct);
    if (customer is null)
        return Result<Guid>.Fail(new Error("Customer.NotFound", "Customer does not exist."));

    var order = Order.Create(cmd.CustomerId, cmd.Lines);
    await _orders.AddAsync(order, ct);
    await _uow.SaveChangesAsync(ct);
    return Result<Guid>.Ok(order.Id);
}
\`\`\`

**Endpoint mapping**:
\`\`\`csharp
var result = await mediator.Send(command);
return result.IsSuccess
    ? Results.Created(\`/orders/{result.Value}\`, result.Value)
    : Results.BadRequest(result.Error);
\`\`\`

**Why not exceptions?** Exceptions are slow (stack unwind), invisible in signatures, and reserved for *unexpected* failures. Expected failures (not found, validation) should be modelled as data.`,
      tags: ["result-pattern", "error-handling", "domain"],
    },
    {
      id: "fluent-validation-mediatr-pipeline",
      title: "FluentValidation with MediatR Pipeline",
      difficulty: "medium",
      question: "How do you integrate FluentValidation into the MediatR pipeline to validate all commands automatically?",
      answer: `**Validation behaviour** — runs before every handler:
\`\`\`csharp
public class ValidationBehaviour<TRequest, TResponse>(
    IEnumerable<IValidator<TRequest>> validators)
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken ct)
    {
        if (!validators.Any()) return await next(ct);

        var context = new ValidationContext<TRequest>(request);
        var failures = validators
            .Select(v => v.Validate(context))
            .SelectMany(r => r.Errors)
            .Where(f => f is not null)
            .ToList();

        if (failures.Count > 0)
            throw new ValidationException(failures);

        return await next(ct);
    }
}
\`\`\`

**Validator**:
\`\`\`csharp
public class PlaceOrderCommandValidator : AbstractValidator<PlaceOrderCommand>
{
    public PlaceOrderCommandValidator()
    {
        RuleFor(x => x.CustomerId).NotEmpty();
        RuleFor(x => x.Lines)
            .NotEmpty().WithMessage("Order must have at least one line.")
            .Must(l => l.All(line => line.Quantity > 0))
            .WithMessage("All quantities must be positive.");
    }
}
\`\`\`

**Registration**:
\`\`\`csharp
builder.Services.AddValidatorsFromAssembly(typeof(PlaceOrderCommand).Assembly);
builder.Services.AddMediatR(cfg =>
{
    cfg.RegisterServicesFromAssembly(typeof(PlaceOrderCommand).Assembly);
    cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehaviour<,>));
});
\`\`\`

Every command with a registered validator is automatically validated — no per-handler boilerplate.`,
      tags: ["fluentvalidation", "mediatr", "pipeline", "validation"],
    },
    {
      id: "health-checks",
      title: "Health Checks with Custom Checks",
      difficulty: "medium",
      question: "How do you add health checks in .NET 9, including a custom check for an external dependency?",
      answer: `**Built-in registration**:
\`\`\`csharp
builder.Services.AddHealthChecks()
    .AddDbContextCheck<AppDbContext>()            // EF Core ping
    .AddCheck<RedisHealthCheck>("redis")           // custom
    .AddCheck<PaymentGatewayHealthCheck>("payment-gateway", tags: ["external"]);

app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse // from AspNetCore.HealthChecks.UI
});

app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => !check.Tags.Contains("external")
});
\`\`\`

**Custom check**:
\`\`\`csharp
public class RedisHealthCheck(IConnectionMultiplexer redis)
    : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken ct = default)
    {
        try
        {
            var db = redis.GetDatabase();
            await db.PingAsync();
            return HealthCheckResult.Healthy("Redis is responding.");
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy("Redis is not responding.", ex);
        }
    }
}
\`\`\`

**Endpoints to expose**:
- \`/health\` — full check for monitoring tools.
- \`/health/ready\` — readiness probe (Kubernetes) — excludes non-critical external services.
- \`/health/live\` — liveness probe — typically just returns 200 to confirm the process is alive.`,
      tags: ["health-checks", "aspnetcore", "monitoring"],
    },
    {
      id: "global-exception-handling",
      title: "Global Exception Handling with IExceptionHandler",
      difficulty: "medium",
      question: "How do you implement global exception handling in .NET 9 using IExceptionHandler?",
      answer: `**.NET 8+** introduced \`IExceptionHandler\` as the idiomatic way to handle unhandled exceptions globally — replacing custom middleware for most scenarios.

**Implementation**:
\`\`\`csharp
public class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext ctx,
        Exception exception,
        CancellationToken ct)
    {
        var (statusCode, title) = exception switch
        {
            ValidationException  => (StatusCodes.Status400BadRequest,  "Validation Error"),
            NotFoundException    => (StatusCodes.Status404NotFound,     "Not Found"),
            UnauthorizedException => (StatusCodes.Status401Unauthorized, "Unauthorized"),
            _                    => (StatusCodes.Status500InternalServerError, "Server Error"),
        };

        logger.LogError(exception, "Unhandled exception: {Title}", title);

        ctx.Response.StatusCode = statusCode;
        await ctx.Response.WriteAsJsonAsync(new ProblemDetails
        {
            Status = statusCode,
            Title  = title,
            Detail = exception.Message,
            Instance = ctx.Request.Path,
        }, ct);

        return true; // exception is handled — stop propagation
    }
}
\`\`\`

**Registration**:
\`\`\`csharp
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

app.UseExceptionHandler();
\`\`\`

Return \`false\` from \`TryHandleAsync\` to let another handler (or the default) deal with the exception. Chain multiple handlers for different exception categories.`,
      tags: ["exception-handling", "iexceptionhandler", "aspnetcore", "problem-details"],
    },

    // ───── HARD ─────
    {
      id: "vertical-slice-vs-clean-architecture",
      title: "Vertical Slice Architecture vs Clean Architecture",
      difficulty: "hard",
      question: "Compare Vertical Slice Architecture with Clean Architecture. When would you choose one over the other?",
      answer: `**Clean Architecture** organises code by **layer** (Domain, Application, Infrastructure, Presentation). All order-related code is spread across four projects.

**Vertical Slice Architecture** (Jimmy Bogard) organises code by **feature**. Everything needed to fulfil one use case — HTTP endpoint, handler, validator, DB query — lives in a single folder/file.

**Vertical slice folder example**:
\`\`\`
Features/
└── Orders/
    ├── PlaceOrder/
    │   ├── Endpoint.cs       ← Minimal API route
    │   ├── Command.cs        ← MediatR IRequest
    │   ├── Handler.cs        ← IRequestHandler
    │   ├── Validator.cs      ← FluentValidation
    │   └── Response.cs       ← DTO
    └── GetOrder/
        ├── Endpoint.cs
        ├── Query.cs
        └── Handler.cs
\`\`\`

**Comparison**:

| Dimension | Clean Architecture | Vertical Slice |
|---|---|---|
| **Coupling** | Across layers (interfaces) | Within feature (looser cross-feature) |
| **Duplication** | DRY — shared across features | Some duplication per slice acceptable |
| **Complexity** | High ceremony; good for large domain | Low ceremony; good for API-heavy apps |
| **Testability** | Layer-level unit tests | Feature-level integration tests |
| **Onboarding** | Navigate multiple projects/folders | Find the feature, change one folder |

**Hybrid approach (common in 2026)**: Clean Architecture for the domain core (Domain project with entities, value objects, domain events) + Vertical Slices for the application/API layer using MediatR. This preserves a rich domain model while eliminating per-layer boilerplate.

**Choose Clean Architecture** when: the domain is complex, multiple surfaces (web + background workers + gRPC), long-lived codebase.
**Choose Vertical Slice** when: CRUD-heavy microservice, fast iteration, small team.`,
      tags: ["vertical-slice", "clean-architecture", "architecture"],
    },
    {
      id: "outbox-pattern",
      title: "Outbox Pattern in .NET",
      difficulty: "hard",
      question: "What is the Outbox pattern and how do you implement it in .NET to guarantee at-least-once delivery of integration events?",
      answer: `The **Outbox pattern** solves the dual-write problem: you want to persist a domain change AND publish a message to a broker atomically — but you can't enlist both a relational DB and a message broker in a single distributed transaction.

**Solution**: write the event to an \`OutboxMessages\` table *in the same DB transaction* as the domain change. A background worker polls the table and publishes to the broker, marking rows as processed.

**Outbox message entity**:
\`\`\`csharp
public class OutboxMessage
{
    public Guid      Id          { get; init; } = Guid.NewGuid();
    public string    Type        { get; init; } = "";  // fully-qualified CLR type name
    public string    Payload     { get; init; } = "";  // JSON
    public DateTime  OccurredOn  { get; init; } = DateTime.UtcNow;
    public DateTime? ProcessedOn { get; set; }
    public string?   Error       { get; set; }
}
\`\`\`

**Interceptor — writes domain events to Outbox on SaveChanges**:
\`\`\`csharp
public class OutboxInterceptor : SaveChangesInterceptor
{
    public override async ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData data, InterceptionResult<int> result, CancellationToken ct)
    {
        var db = data.Context!;
        var events = db.ChangeTracker.Entries<AggregateRoot>()
            .SelectMany(e => e.Entity.PopDomainEvents())
            .Select(e => new OutboxMessage
            {
                Type    = e.GetType().AssemblyQualifiedName!,
                Payload = JsonSerializer.Serialize(e, e.GetType()),
            });

        await db.Set<OutboxMessage>().AddRangeAsync(events, ct);
        return await base.SavingChangesAsync(data, result, ct);
    }
}
\`\`\`

**Background worker (Quartz.NET or IHostedService)**:
\`\`\`csharp
var messages = await db.Set<OutboxMessage>()
    .Where(m => m.ProcessedOn == null)
    .OrderBy(m => m.OccurredOn)
    .Take(20)
    .ToListAsync(ct);

foreach (var msg in messages)
{
    var eventType = Type.GetType(msg.Type)!;
    var domainEvent = (INotification)JsonSerializer.Deserialize(msg.Payload, eventType)!;
    await publisher.Publish(domainEvent, ct);
    msg.ProcessedOn = DateTime.UtcNow;
}
await db.SaveChangesAsync(ct);
\`\`\`

**Guarantees**: at-least-once delivery (idempotent consumers required). Use [Wolverine](https://wolverinefx.net/) or MassTransit's outbox for production-grade implementations.`,
      tags: ["outbox-pattern", "integration-events", "reliability", "messaging"],
    },
    {
      id: "specification-pattern",
      title: "Specification Pattern",
      difficulty: "hard",
      question: "What is the Specification pattern and how does it keep query logic out of repositories?",
      answer: `The **Specification pattern** encapsulates a query predicate (and optional ordering/pagination) in a reusable, composable object — keeping repository interfaces generic and query logic testable.

**Base specification**:
\`\`\`csharp
public abstract class Specification<T>
{
    public Expression<Func<T, bool>>? Criteria  { get; protected set; }
    public List<Expression<Func<T, object>>> Includes { get; } = [];
    public Expression<Func<T, object>>? OrderBy { get; protected set; }
    public int? Take { get; protected set; }
    public int? Skip { get; protected set; }
}
\`\`\`

**Concrete specification**:
\`\`\`csharp
public class ActiveOrdersForCustomerSpec : Specification<Order>
{
    public ActiveOrdersForCustomerSpec(Guid customerId)
    {
        Criteria = o => o.CustomerId == customerId
                     && o.Status != OrderStatus.Cancelled;
        Includes.Add(o => o.Lines);
        OrderBy = o => o.CreatedAt;
        Take = 50;
    }
}
\`\`\`

**Generic repository method**:
\`\`\`csharp
public async Task<IReadOnlyList<T>> ListAsync(
    Specification<T> spec, CancellationToken ct)
{
    IQueryable<T> query = _db.Set<T>();

    if (spec.Criteria is not null)
        query = query.Where(spec.Criteria);

    query = spec.Includes.Aggregate(query,
        (q, include) => q.Include(include));

    if (spec.OrderBy is not null)
        query = query.OrderBy(spec.OrderBy);

    if (spec.Skip.HasValue) query = query.Skip(spec.Skip.Value);
    if (spec.Take.HasValue) query = query.Take(spec.Take.Value);

    return await query.ToListAsync(ct);
}
\`\`\`

**Usage**:
\`\`\`csharp
var spec   = new ActiveOrdersForCustomerSpec(customerId);
var orders = await _repo.ListAsync(spec, ct);
\`\`\`

**Libraries**: [Ardalis.Specification](https://github.com/ardalis/Specification) provides a battle-tested base implementation and EF Core evaluator.`,
      tags: ["specification-pattern", "repository", "query", "ef-core"],
    },
    {
      id: "decorator-pattern-dotnet",
      title: "Decorator Pattern in .NET",
      difficulty: "hard",
      question: "How do you implement the Decorator pattern in .NET and use it with the DI container?",
      answer: `The **Decorator pattern** wraps an existing object to add behaviour without modifying the original class — ideal for cross-cutting concerns like caching, logging, and retry.

**Example — caching decorator for a repository**:
\`\`\`csharp
public class CachedProductRepository(
    IProductRepository inner,
    IMemoryCache cache,
    ILogger<CachedProductRepository> logger)
    : IProductRepository
{
    private static string Key(Guid id) => \`product-{id}\`;

    public async Task<Product?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        if (cache.TryGetValue(Key(id), out Product? cached))
        {
            logger.LogDebug("Cache hit for product {Id}", id);
            return cached;
        }

        var product = await inner.GetByIdAsync(id, ct);
        if (product is not null)
            cache.Set(Key(id), product, TimeSpan.FromMinutes(5));
        return product;
    }

    // All other methods delegate to inner
    public Task AddAsync(Product p, CancellationToken ct) => inner.AddAsync(p, ct);
    public void Update(Product p) => inner.Update(p);
    public void Delete(Product p) => inner.Delete(p);
}
\`\`\`

**Registration with Scrutor** (simplest approach):
\`\`\`csharp
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.Decorate<IProductRepository, CachedProductRepository>();
\`\`\`

**Manual registration** (no extra package):
\`\`\`csharp
builder.Services.AddScoped<ProductRepository>();
builder.Services.AddScoped<IProductRepository>(sp =>
    new CachedProductRepository(
        sp.GetRequiredService<ProductRepository>(),
        sp.GetRequiredService<IMemoryCache>(),
        sp.GetRequiredService<ILogger<CachedProductRepository>>()));
\`\`\`

**Comparison with MediatR behaviours**: MediatR's \`IPipelineBehavior\` is the decorator pattern applied to request handlers. Use explicit decorators when decorating non-MediatR services.`,
      tags: ["decorator-pattern", "di", "caching", "scrutor"],
    },
    {
      id: "automapper-vs-mapster-vs-manual",
      title: "AutoMapper vs Mapster vs Manual Mapping",
      difficulty: "hard",
      question: "Compare AutoMapper, Mapster, and manual mapping in .NET. What are the trade-offs and when should you use each?",
      answer: `**AutoMapper** (reflection-based, convention-over-configuration):
\`\`\`csharp
// Profile
public class OrderProfile : Profile
{
    public OrderProfile()
    {
        CreateMap<Order, OrderDto>()
            .ForMember(d => d.CustomerName, o => o.MapFrom(s => s.Customer.FullName));
    }
}

// Usage
var dto = _mapper.Map<OrderDto>(order);
\`\`\`
- Pros: minimal boilerplate for simple mappings, large ecosystem.
- Cons: runtime errors for misconfigured mappings, reflection overhead, "magic" that's hard to trace.

**Mapster** (source-generator-capable, faster):
\`\`\`csharp
// Config
TypeAdapterConfig<Order, OrderDto>.NewConfig()
    .Map(d => d.CustomerName, s => s.Customer.FullName);

// Usage
var dto = order.Adapt<OrderDto>();

// Source-generated (zero reflection at runtime)
[Mapper]
public interface IOrderMapper
{
    OrderDto ToDto(Order order);
}
\`\`\`
- Pros: ~3–5× faster than AutoMapper, source generators eliminate reflection, good for high-throughput paths.
- Cons: smaller community, fewer integrations.

**Manual mapping** (explicit, compile-time safe):
\`\`\`csharp
public static class OrderMapper
{
    public static OrderDto ToDto(this Order order) => new(
        order.Id,
        order.Customer.FullName,
        order.Lines.Select(l => new OrderLineDto(l.ProductId, l.Quantity, l.UnitPrice)).ToList(),
        order.Total
    );
}
\`\`\`
- Pros: maximum clarity, zero overhead, compiler catches mistakes.
- Cons: verbose for large objects; more code to maintain.

**Recommendation (2026)**:
- **Mapster with source generators** for new projects needing automation.
- **Manual mapping** for complex domain-to-DTO conversions with business logic.
- **AutoMapper** only if already in the codebase — migration cost rarely justified.`,
      tags: ["automapper", "mapster", "mapping", "performance"],
    },
    {
      id: "feature-flags-dotnet",
      title: "Feature Flags in .NET",
      difficulty: "hard",
      question: "How do you implement feature flags in .NET 9 using Microsoft.FeatureManagement, and what patterns enable gradual rollouts?",
      answer: `**Microsoft.FeatureManagement** (Azure App Configuration's OSS package) provides first-class feature flag support.

**Installation**:
\`\`\`
dotnet add package Microsoft.FeatureManagement.AspNetCore
\`\`\`

**appsettings.json**:
\`\`\`json
{
  "FeatureManagement": {
    "NewCheckout": true,
    "BetaDashboard": {
      "EnabledFor": [
        {
          "Name": "Percentage",
          "Parameters": { "Value": 20 }
        }
      ]
    }
  }
}
\`\`\`

**Registration**:
\`\`\`csharp
builder.Services.AddFeatureManagement();
// or with Azure App Configuration:
// builder.Configuration.AddAzureAppConfiguration(opts => opts.UseFeatureFlags());
\`\`\`

**Usage in handlers**:
\`\`\`csharp
public class CheckoutHandler(IFeatureManager features) : IRequestHandler<CheckoutCommand, Result>
{
    public async Task<Result> Handle(CheckoutCommand cmd, CancellationToken ct)
    {
        if (await features.IsEnabledAsync("NewCheckout"))
            return await NewCheckoutFlow(cmd, ct);

        return await LegacyCheckoutFlow(cmd, ct);
    }
}
\`\`\`

**Attribute-based for Minimal API / controllers**:
\`\`\`csharp
app.MapPost("/checkout", CheckoutHandler)
   .WithMetadata(new FeatureGateAttribute("NewCheckout"));
\`\`\`

**Built-in filters**:
- \`AlwaysOn\` / \`AlwaysOff\`
- \`Percentage\` — gradual rollout by random user bucket.
- \`TimeWindow\` — enable for a time range.
- \`Targeting\` — per user or group (requires \`ITargetingContextAccessor\`).

**Custom filter**:
\`\`\`csharp
[FilterAlias("BetaUser")]
public class BetaUserFilter(IHttpContextAccessor http) : IFeatureFilter
{
    public Task<bool> EvaluateAsync(FeatureFilterEvaluationContext ctx)
    {
        var isBeta = http.HttpContext?.User.HasClaim("beta", "true") ?? false;
        return Task.FromResult(isBeta);
    }
}
\`\`\``,
      tags: ["feature-flags", "feature-management", "rollout", "aspnetcore"],
    },
  ],
};
