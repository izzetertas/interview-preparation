import type { Category } from "./types";

export const aspnetCore: Category = {
  slug: "aspnet-core",
  title: "ASP.NET Core",
  description:
    "ASP.NET Core 9: middleware pipeline, dependency injection, minimal APIs, routing, model binding, filters, Web API, authentication, authorization, background services, SignalR, Blazor, configuration, OpenAPI, error handling, and testing.",
  icon: "🔷",
  questions: [
    // ───── EASY ─────
    {
      id: "aspnet-core-pipeline-overview",
      title: "ASP.NET Core request pipeline",
      difficulty: "easy",
      question: "Describe the ASP.NET Core request pipeline and how a request flows through it.",
      answer: `Every ASP.NET Core application is built around a **middleware pipeline** — a chain of components that each inspect or transform an HTTP request and response.

**Basic flow**
\`\`\`
Client → Kestrel → Middleware 1 → Middleware 2 → ... → Endpoint handler
                                                          ↓
Client ← Kestrel ← Middleware 1 ← Middleware 2 ← ... ← Response
\`\`\`

Each middleware can:
1. Do work **before** calling the next component.
2. Call \`next(context)\` to pass control downstream.
3. Do work **after** the next component returns (on the way back up).

**Minimal API bootstrap (ASP.NET Core 9)**
\`\`\`csharp
var builder = WebApplication.CreateBuilder(args);

// Register services
builder.Services.AddAuthentication().AddJwtBearer();
builder.Services.AddAuthorization();

var app = builder.Build();

// Register middleware — ORDER MATTERS
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/", () => "Hello, .NET 9!");

app.Run();
\`\`\`

**Key built-in middleware (typical order)**
| Order | Middleware | Purpose |
|---|---|---|
| 1 | \`UseExceptionHandler\` | Global error handling |
| 2 | \`UseHsts\` / \`UseHttpsRedirection\` | HTTPS enforcement |
| 3 | \`UseStaticFiles\` | Static file serving |
| 4 | \`UseRouting\` | Route matching |
| 5 | \`UseCors\` | CORS headers |
| 6 | \`UseAuthentication\` | Identify the user |
| 7 | \`UseAuthorization\` | Enforce policies |
| 8 | \`UseEndpoints\` / \`MapControllers\` | Execute handlers |

**Host** (\`IHost\`) wraps the whole server: Kestrel (or IIS integration) + DI container + configuration + logging.`,
      tags: ["pipeline", "middleware", "fundamentals"],
    },
    {
      id: "middleware-use-run-map",
      title: "Use vs Run vs Map",
      difficulty: "easy",
      question: "What is the difference between Use, Run, and Map when building middleware in ASP.NET Core?",
      answer: `These three extension methods on \`IApplicationBuilder\` / \`WebApplication\` control how middleware is wired together.

**\`Use\` — inline middleware with next**
\`\`\`csharp
app.Use(async (context, next) =>
{
    // Before downstream
    Console.WriteLine($"Request: {context.Request.Path}");
    await next(context);              // call next in pipeline
    // After downstream
    Console.WriteLine($"Response: {context.Response.StatusCode}");
});
\`\`\`

**\`Run\` — terminal middleware (no next)**
\`\`\`csharp
app.Run(async context =>
{
    // Pipeline ends here — nothing downstream is called
    await context.Response.WriteAsync("Short-circuit response");
});
\`\`\`

**\`Map\` — branch on path prefix**
\`\`\`csharp
app.Map("/admin", adminApp =>
{
    adminApp.Run(async context =>
    {
        await context.Response.WriteAsync("Admin area");
    });
});
// Requests NOT starting with /admin continue to the main pipeline
\`\`\`

**\`MapWhen\` — branch on arbitrary predicate**
\`\`\`csharp
app.MapWhen(
    ctx => ctx.Request.Query.ContainsKey("debug"),
    debugApp => debugApp.Run(async ctx =>
        await ctx.Response.WriteAsync("Debug mode"))
);
\`\`\`

**Convention-based class middleware**
\`\`\`csharp
public class TimingMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var sw = Stopwatch.StartNew();
        await next(context);
        Console.WriteLine($"Elapsed: {sw.ElapsedMilliseconds}ms");
    }
}

// Registration
app.UseMiddleware<TimingMiddleware>();
\`\`\`

**Rule of thumb:** always use \`Use\` for non-terminal steps, \`Run\` for terminal branches, and \`Map\`/\`MapWhen\` for path-based routing at the middleware level.`,
      tags: ["middleware", "pipeline"],
    },
    {
      id: "dependency-injection-lifetimes",
      title: "DI lifetimes: Transient / Scoped / Singleton",
      difficulty: "easy",
      question: "Explain the three dependency injection lifetimes in ASP.NET Core and when to use each.",
      answer: `ASP.NET Core ships a built-in IoC container (\`Microsoft.Extensions.DependencyInjection\`). Every registered service has a **lifetime** that controls how long an instance lives.

| Lifetime | Created | Shared | Disposed |
|---|---|---|---|
| **Transient** | Every injection / resolution | Never | End of scope |
| **Scoped** | Once per HTTP request (or scope) | Within same request | End of request |
| **Singleton** | First resolution | App-wide | App shutdown |

\`\`\`csharp
builder.Services.AddTransient<IEmailSender, SmtpEmailSender>();  // lightweight, stateless
builder.Services.AddScoped<IOrderService, OrderService>();       // per-request (e.g. DbContext)
builder.Services.AddSingleton<IMemoryCache, MemoryCache>();      // shared, thread-safe
\`\`\`

**Captive dependency (common bug):** injecting a Scoped or Transient service into a Singleton causes it to be held alive for the app lifetime.

\`\`\`csharp
// BAD — OrderService (Scoped) captured inside Singleton
public class BadSingleton(IOrderService orders) { }  // runtime exception in dev mode

// FIX — use IServiceScopeFactory
public class GoodSingleton(IServiceScopeFactory factory)
{
    public async Task DoWork()
    {
        using var scope = factory.CreateScope();
        var orders = scope.ServiceProvider.GetRequiredService<IOrderService>();
        await orders.ProcessAsync();
    }
}
\`\`\`

**Development guard:** \`builder.Services.AddScoped\` + \`ValidateScopes = true\` (default in dev) will throw on captive dependencies at startup.

**Keyed services (.NET 8+)**
\`\`\`csharp
builder.Services.AddKeyedSingleton<IPaymentGateway, StripeGateway>("stripe");
builder.Services.AddKeyedSingleton<IPaymentGateway, PayPalGateway>("paypal");

app.MapPost("/pay/{provider}", (
    [FromRoute] string provider,
    [FromKeyedServices("stripe")] IPaymentGateway stripe) => ...);
\`\`\``,
      tags: ["dependency-injection", "di", "lifetimes"],
    },
    {
      id: "minimal-api-vs-controllers",
      title: "Minimal API vs controller-based API",
      difficulty: "easy",
      question: "When would you choose Minimal APIs over controller-based APIs in ASP.NET Core?",
      answer: `Both approaches are first-class in .NET 9. Minimal APIs are now mainstream for new projects.

**Minimal API**
\`\`\`csharp
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddScoped<IProductService, ProductService>();

var app = builder.Build();

var products = app.MapGroup("/products").RequireAuthorization();

products.MapGet("/", async (IProductService svc) =>
    TypedResults.Ok(await svc.GetAllAsync()));

products.MapGet("/{id:int}", async (int id, IProductService svc) =>
    await svc.FindAsync(id) is { } p
        ? TypedResults.Ok(p)
        : TypedResults.NotFound());

products.MapPost("/", async (CreateProductDto dto, IProductService svc) =>
{
    var created = await svc.CreateAsync(dto);
    return TypedResults.Created(\`/products/{created.Id}\`, created);
});

app.Run();
\`\`\`

**Controller-based API**
\`\`\`csharp
[ApiController]
[Route("[controller]")]
public class ProductsController(IProductService svc) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Product>>> GetAll() =>
        Ok(await svc.GetAllAsync());

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Product>> Get(int id) =>
        await svc.FindAsync(id) is { } p ? Ok(p) : NotFound();
}
\`\`\`

**Comparison**
| | Minimal API | Controller |
|---|---|---|
| Boilerplate | Low | Higher |
| Testability | Route-level | Action-level |
| Filters | Endpoint filters | Action/resource/result filters |
| Grouping | \`MapGroup\` | Controller class |
| Model binding | Parameter binding | \`[FromBody]\`, \`[FromRoute]\`, etc. |
| Best for | Microservices, simple APIs | Complex apps, large teams |

**Rule:** prefer Minimal APIs for new services. Use controllers when you need rich filter pipelines, model-level validation attributes on DTOs consumed across multiple actions, or need to support an existing codebase.`,
      tags: ["minimal-api", "controllers", "routing"],
    },
    {
      id: "routing-attribute-constraints-groups",
      title: "Routing: attribute routing, constraints, route groups",
      difficulty: "easy",
      question: "How does routing work in ASP.NET Core? Cover attribute routing, route constraints, and route groups.",
      answer: `**Attribute routing (controllers)**
\`\`\`csharp
[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class OrdersController : ControllerBase
{
    [HttpGet("{id:int:min(1)}")]          // route constraint: int, min value 1
    public IActionResult Get(int id) => Ok();

    [HttpGet("search/{term:alpha}")]      // alpha = letters only
    public IActionResult Search(string term) => Ok();

    [HttpGet("date/{date:datetime}")]
    public IActionResult ByDate(DateTime date) => Ok();
}
\`\`\`

**Common route constraints**
| Constraint | Example | Matches |
|---|---|---|
| \`int\` | \`{id:int}\` | 32-bit integer |
| \`guid\` | \`{id:guid}\` | GUID |
| \`alpha\` | \`{name:alpha}\` | a-z, A-Z only |
| \`minlength(n)\` | \`{s:minlength(3)}\` | Min string length |
| \`range(a,b)\` | \`{age:range(1,120)}\` | Numeric range |
| \`regex\` | \`{zip:regex(^\\\\d{{5}}$)}\` | Regex match |

**Minimal API route groups (.NET 7+)**
\`\`\`csharp
var api = app.MapGroup("/api/v1");

var orders = api.MapGroup("/orders")
    .RequireAuthorization()
    .WithTags("Orders")
    .WithOpenApi();

orders.MapGet("/", GetAllOrders);
orders.MapGet("/{id:guid}", GetOrder);
orders.MapPost("/", CreateOrder);
orders.MapDelete("/{id:guid}", DeleteOrder)
    .RequireAuthorization("AdminPolicy");
\`\`\`

Groups allow you to apply metadata (authorization, tags, rate-limiting, CORS) once to a whole set of endpoints instead of repeating decorators everywhere.`,
      tags: ["routing", "attribute-routing", "route-groups", "constraints"],
    },
    {
      id: "model-binding-validation",
      title: "Model binding and validation",
      difficulty: "easy",
      question: "How does model binding work in ASP.NET Core and how do you validate incoming data?",
      answer: `**Model binding** automatically maps HTTP request data (route, query string, headers, body) to action method parameters.

**Binding sources (controllers)**
\`\`\`csharp
[HttpPost("{id:int}")]
public IActionResult Update(
    [FromRoute]  int id,
    [FromBody]   UpdateProductDto dto,
    [FromQuery]  bool notify,
    [FromHeader(Name = "X-Correlation-Id")] string correlationId,
    [FromForm]   IFormFile? image)
{ ... }
\`\`\`

**DataAnnotations validation**
\`\`\`csharp
public record CreateProductDto(
    [Required, MaxLength(100)] string Name,
    [Range(0.01, 999_999.99)]  decimal Price,
    [Url]                       string? ImageUrl
);

// [ApiController] automatically returns 400 + ProblemDetails on invalid model
[HttpPost]
public async Task<IActionResult> Create(CreateProductDto dto)
{
    // ModelState.IsValid is always true here when [ApiController] is present
    var product = await _svc.CreateAsync(dto);
    return CreatedAtAction(nameof(Get), new { id = product.Id }, product);
}
\`\`\`

**FluentValidation (.NET 9)**
\`\`\`csharp
// NuGet: FluentValidation.AspNetCore
public class CreateProductValidator : AbstractValidator<CreateProductDto>
{
    public CreateProductValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Price).GreaterThan(0).LessThanOrEqualTo(999_999.99m);
        RuleFor(x => x.ImageUrl).Must(uri =>
            Uri.TryCreate(uri, UriKind.Absolute, out _)).When(x => x.ImageUrl is not null);
    }
}

// Registration
builder.Services.AddValidatorsFromAssemblyContaining<CreateProductValidator>();
// Auto-validate: builder.Services.AddFluentValidationAutoValidation();
\`\`\`

**Minimal API validation (.NET 9 built-in)**
\`\`\`csharp
// Microsoft.AspNetCore.Http.Validation (preview in .NET 9)
app.MapPost("/products", async (
    [AsParameters] CreateProductDto dto,
    IValidator<CreateProductDto> validator) =>
{
    var result = await validator.ValidateAsync(dto);
    if (!result.IsValid)
        return Results.ValidationProblem(result.ToDictionary());
    // ...
    return Results.Created(\`/products/1\`, dto);
});
\`\`\``,
      tags: ["model-binding", "validation", "data-annotations", "fluent-validation"],
    },
    {
      id: "configuration-system",
      title: "Configuration system",
      difficulty: "easy",
      question: "How does the ASP.NET Core configuration system work? Explain appsettings, environment variables, and IOptions<T>.",
      answer: `ASP.NET Core uses a **layered configuration** system: later sources override earlier ones.

**Default source priority (lowest → highest)**
1. \`appsettings.json\`
2. \`appsettings.{Environment}.json\`
3. User secrets (dev only)
4. Environment variables
5. Command-line arguments

**appsettings.json**
\`\`\`json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=.;Database=MyDb;Trusted_Connection=true"
  },
  "Email": {
    "SmtpHost": "smtp.example.com",
    "Port": 587,
    "UseSsl": true
  }
}
\`\`\`

**Environment variable override**
\`\`\`bash
# Colon (:) replaced by __ in env vars
Email__SmtpHost=smtp.prod.com
Email__Port=465
\`\`\`

**Strongly-typed options with IOptions<T>**
\`\`\`csharp
public class EmailOptions
{
    public const string Section = "Email";
    public string SmtpHost { get; init; } = string.Empty;
    public int Port { get; init; } = 587;
    public bool UseSsl { get; init; }
}

// Registration
builder.Services.Configure<EmailOptions>(
    builder.Configuration.GetSection(EmailOptions.Section));

// Or with validation
builder.Services
    .AddOptions<EmailOptions>()
    .Bind(builder.Configuration.GetSection(EmailOptions.Section))
    .ValidateDataAnnotations()
    .ValidateOnStart();   // fail-fast at startup if invalid

// Injection
public class EmailService(IOptions<EmailOptions> opts)
{
    private readonly EmailOptions _opts = opts.Value;
}
\`\`\`

**IOptions variants**
| Interface | Reloads on change | Supports named options |
|---|---|---|
| \`IOptions<T>\` | No | No |
| \`IOptionsSnapshot<T>\` | Yes (per request) | Yes |
| \`IOptionsMonitor<T>\` | Yes (real-time) | Yes |`,
      tags: ["configuration", "appsettings", "options-pattern", "IOptions"],
    },
    {
      id: "health-checks",
      title: "Health checks",
      difficulty: "easy",
      question: "How do you implement health checks in ASP.NET Core?",
      answer: `ASP.NET Core has first-class health check support via \`Microsoft.Extensions.Diagnostics.HealthChecks\`.

**Basic setup**
\`\`\`csharp
builder.Services
    .AddHealthChecks()
    .AddSqlServer(builder.Configuration.GetConnectionString("Default")!)
    .AddRedis(builder.Configuration["Redis:ConnectionString"]!)
    .AddCheck<ExternalApiHealthCheck>("external-api", tags: ["ready"])
    .AddCheck("disk-space", () =>
    {
        var drive = new DriveInfo("/");
        return drive.AvailableFreeSpace > 512 * 1024 * 1024   // 512 MB
            ? HealthCheckResult.Healthy()
            : HealthCheckResult.Degraded("Low disk space");
    });

// Expose endpoints
app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = _ => false   // liveness: only confirms app is running
});

app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = hc => hc.Tags.Contains("ready"),
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse  // NuGet: AspNetCore.HealthChecks.UI.Client
});
\`\`\`

**Custom health check**
\`\`\`csharp
public class ExternalApiHealthCheck(HttpClient http) : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken ct = default)
    {
        try
        {
            var resp = await http.GetAsync("/ping", ct);
            return resp.IsSuccessStatusCode
                ? HealthCheckResult.Healthy()
                : HealthCheckResult.Unhealthy(\`Status: {resp.StatusCode}\`);
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy("Request failed", ex);
        }
    }
}
\`\`\`

**Kubernetes probes:** map \`/health/live\` to livenessProbe and \`/health/ready\` to readinessProbe.`,
      tags: ["health-checks", "observability", "kubernetes"],
    },

    // ───── MEDIUM ─────
    {
      id: "filters-pipeline",
      title: "Filters: action, exception, resource, result",
      difficulty: "medium",
      question: "What are the ASP.NET Core filter types and in what order do they execute?",
      answer: `Filters run **within the MVC/controller pipeline** (after routing, before and after the action). They let you factor out cross-cutting concerns.

**Execution order**
\`\`\`
Authorization → Resource → [Model Binding] → Action → Exception → Result → Resource (out)
\`\`\`

**Filter types**
| Type | Interface | Common use |
|---|---|---|
| Authorization | \`IAuthorizationFilter\` | Custom auth checks |
| Resource | \`IResourceFilter\` | Caching, short-circuit before binding |
| Action | \`IActionFilter\` | Logging, validation |
| Exception | \`IExceptionFilter\` | Handle unhandled exceptions |
| Result | \`IResultFilter\` | Modify/wrap responses |

**Action filter example**
\`\`\`csharp
public class LogActionFilter : IActionFilter
{
    private readonly ILogger<LogActionFilter> _log;
    public LogActionFilter(ILogger<LogActionFilter> log) => _log = log;

    public void OnActionExecuting(ActionExecutingContext context)
        => _log.LogInformation("Executing {Action}", context.ActionDescriptor.DisplayName);

    public void OnActionExecuted(ActionExecutedContext context)
        => _log.LogInformation("Executed in {Ms}ms", /* measure */ 0);
}

// Global registration
builder.Services.AddControllers(opts =>
    opts.Filters.Add<LogActionFilter>());

// Or as attribute
[ServiceFilter(typeof(LogActionFilter))]   // resolves from DI
public class ProductsController : ControllerBase { }
\`\`\`

**Exception filter**
\`\`\`csharp
public class ApiExceptionFilter : IExceptionFilter
{
    public void OnException(ExceptionContext context)
    {
        var (status, title) = context.Exception switch
        {
            NotFoundException => (404, "Not Found"),
            ValidationException => (422, "Validation Error"),
            _ => (500, "Internal Server Error")
        };

        context.Result = new ObjectResult(new ProblemDetails
        {
            Status = status,
            Title = title,
            Detail = context.Exception.Message
        }) { StatusCode = status };

        context.ExceptionHandled = true;
    }
}
\`\`\`

**Minimal API endpoint filters** (equivalent for Minimal APIs)
\`\`\`csharp
app.MapPost("/products", CreateProduct)
   .AddEndpointFilter<ValidationFilter<CreateProductDto>>();
\`\`\``,
      tags: ["filters", "action-filter", "exception-filter", "result-filter"],
    },
    {
      id: "web-api-iactionresult",
      title: "IActionResult, ActionResult<T>, ProblemDetails",
      difficulty: "medium",
      question: "Explain IActionResult vs ActionResult<T> and how ProblemDetails is used in Web API responses.",
      answer: `**IActionResult** — non-generic, returns any HTTP response.
**ActionResult<T>** — strongly typed, enables OpenAPI schema inference + implicit conversions.

\`\`\`csharp
// IActionResult — flexible but no schema
[HttpGet("{id}")]
public async Task<IActionResult> Get(int id)
{
    var product = await _svc.FindAsync(id);
    return product is null ? NotFound() : Ok(product);
}

// ActionResult<T> — preferred for APIs
[HttpGet("{id}")]
public async Task<ActionResult<ProductDto>> Get(int id)
{
    var product = await _svc.FindAsync(id);
    if (product is null) return NotFound();   // implicit cast to ActionResult<T>
    return product;                           // implicit cast from T
}

// TypedResults (Minimal API — best for OpenAPI + IResult)
app.MapGet("/products/{id:int}", async (int id, IProductService svc) =>
    await svc.FindAsync(id) is { } p
        ? TypedResults.Ok(p)
        : TypedResults.NotFound());
\`\`\`

**ProblemDetails (RFC 9457)**
\`\`\`csharp
// Enable automatic ProblemDetails for 4xx/5xx
builder.Services.AddProblemDetails();

// Custom ProblemDetails from action
[HttpDelete("{id}")]
public async Task<IActionResult> Delete(int id)
{
    if (!await _svc.ExistsAsync(id))
        return Problem(
            title: "Product not found",
            detail: \`No product with ID {id} exists.\`,
            statusCode: StatusCodes.Status404NotFound,
            type: "https://errors.example.com/not-found");

    await _svc.DeleteAsync(id);
    return NoContent();
}
\`\`\`

**Response shape**
\`\`\`json
{
  "type": "https://errors.example.com/not-found",
  "title": "Product not found",
  "status": 404,
  "detail": "No product with ID 99 exists.",
  "traceId": "00-abc123..."
}
\`\`\`

**\`[ApiController\]** auto-enables:
- Automatic 400 on invalid \`ModelState\` (with ProblemDetails body).
- Binding source inference (\`[FromBody]\` inferred for complex types).
- Multipart / form data inference.`,
      tags: ["web-api", "IActionResult", "ProblemDetails", "TypedResults"],
    },
    {
      id: "authentication-authorization",
      title: "Authentication & authorization: JWT, cookies, policies",
      difficulty: "medium",
      question: "How does authentication and authorization work in ASP.NET Core? Cover JWT bearer, cookie auth, and policy-based authorization.",
      answer: `**Authentication** establishes *who* the user is. **Authorization** decides *what* they can do.

**JWT bearer setup**
\`\`\`csharp
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opts =>
    {
        opts.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidIssuer              = builder.Configuration["Jwt:Issuer"],
            ValidateAudience         = true,
            ValidAudience            = builder.Configuration["Jwt:Audience"],
            ValidateIssuerSigningKey = true,
            IssuerSigningKey         = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"]!)),
            ValidateLifetime         = true,
        };
    });
\`\`\`

**Cookie auth setup**
\`\`\`csharp
builder.Services
    .AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(opts =>
    {
        opts.LoginPath  = "/account/login";
        opts.LogoutPath = "/account/logout";
        opts.ExpireTimeSpan = TimeSpan.FromDays(7);
        opts.SlidingExpiration = true;
    });
\`\`\`

**Policy-based authorization**
\`\`\`csharp
builder.Services.AddAuthorization(opts =>
{
    opts.AddPolicy("AdminOnly",     p => p.RequireRole("Admin"));
    opts.AddPolicy("MinAge18",      p => p.RequireClaim("age", "18", "19", "20"));
    opts.AddPolicy("PremiumUser",   p => p.RequireClaim("subscription", "premium"));
    opts.AddPolicy("SeniorDev",     p => p
        .RequireAuthenticatedUser()
        .RequireRole("Developer")
        .RequireClaim("yearsExperience", v => int.Parse(v) >= 5));
});

// Minimal API
app.MapDelete("/products/{id}", DeleteProduct)
   .RequireAuthorization("AdminOnly");

// Controller
[Authorize(Policy = "PremiumUser")]
[HttpGet("premium-content")]
public IActionResult Premium() => Ok("exclusive");
\`\`\`

**Custom requirement**
\`\`\`csharp
public record MinimumAgeRequirement(int MinAge) : IAuthorizationRequirement;

public class MinimumAgeHandler : AuthorizationHandler<MinimumAgeRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext ctx, MinimumAgeRequirement req)
    {
        var dob = ctx.User.FindFirstValue(ClaimTypes.DateOfBirth);
        if (dob is not null && DateTime.Parse(dob).AddYears(req.MinAge) <= DateTime.Today)
            ctx.Succeed(req);
        return Task.CompletedTask;
    }
}
\`\`\``,
      tags: ["authentication", "authorization", "jwt", "cookies", "policy"],
    },
    {
      id: "cors-configuration",
      title: "CORS configuration",
      difficulty: "medium",
      question: "How do you configure CORS in ASP.NET Core and what are the common pitfalls?",
      answer: `**CORS (Cross-Origin Resource Sharing)** is enforced by browsers — the server adds headers telling the browser which origins are allowed.

**Setup**
\`\`\`csharp
builder.Services.AddCors(opts =>
{
    opts.AddPolicy("AllowFrontend", policy => policy
        .WithOrigins("https://app.example.com", "https://staging.example.com")
        .WithMethods("GET", "POST", "PUT", "DELETE")
        .WithHeaders("Content-Type", "Authorization")
        .AllowCredentials()         // required for cookies/auth headers
        .SetPreflightMaxAge(TimeSpan.FromMinutes(10)));

    opts.AddPolicy("OpenApi", policy => policy
        .AllowAnyOrigin()           // never use AllowAnyOrigin + AllowCredentials together
        .AllowAnyMethod()
        .AllowAnyHeader());
});

// ORDER MATTERS: UseCors must come after UseRouting but before UseAuthorization
app.UseRouting();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
\`\`\`

**Per-endpoint CORS (Minimal API)**
\`\`\`csharp
app.MapGet("/public", () => "open")
   .RequireCors("OpenApi");

app.MapPost("/orders", CreateOrder)
   .RequireCors("AllowFrontend")
   .RequireAuthorization();
\`\`\`

**Controller attribute**
\`\`\`csharp
[EnableCors("AllowFrontend")]
[ApiController]
[Route("[controller]")]
public class OrdersController : ControllerBase { }
\`\`\`

**Common pitfalls**
- \`AllowAnyOrigin()\` + \`AllowCredentials()\` → runtime exception (browser also rejects it).
- Forgetting \`UseCors\` before \`UseAuthorization\` → preflight 401 instead of 200.
- CORS is a browser protection only — Postman / curl ignores it.
- \`OPTIONS\` preflight requests must not require authorization.`,
      tags: ["cors", "security", "middleware"],
    },
    {
      id: "output-caching-rate-limiting",
      title: "Output caching and rate limiting",
      difficulty: "medium",
      question: "How do you configure output caching (ASP.NET Core 7+) and built-in rate limiting (.NET 7+)?",
      answer: `Both features shipped as built-in middleware in .NET 7 and are production-ready in .NET 9.

**Output caching**
\`\`\`csharp
builder.Services.AddOutputCache(opts =>
{
    opts.AddBasePolicy(b => b.Expire(TimeSpan.FromSeconds(10)));

    opts.AddPolicy("Products", b => b
        .Expire(TimeSpan.FromMinutes(5))
        .SetVaryByQuery("category", "page")
        .Tag("products-tag"));
});

app.UseOutputCache();  // after UseRouting, before MapControllers

// Minimal API
app.MapGet("/products", GetProducts)
   .CacheOutput("Products");

// Invalidate by tag from a write endpoint
app.MapPost("/products", async (CreateProductDto dto, IOutputCacheStore store, CancellationToken ct) =>
{
    var product = await CreateProductInDb(dto);
    await store.EvictByTagAsync("products-tag", ct);
    return TypedResults.Created(\`/products/{product.Id}\`, product);
});
\`\`\`

**Rate limiting (.NET 7+)**
\`\`\`csharp
builder.Services.AddRateLimiter(opts =>
{
    opts.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    // Fixed window — 100 req / 1 min per IP
    opts.AddFixedWindowLimiter("fixed", o =>
    {
        o.Window           = TimeSpan.FromMinutes(1);
        o.PermitLimit      = 100;
        o.QueueLimit       = 10;
        o.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
    });

    // Sliding window — smoother
    opts.AddSlidingWindowLimiter("sliding", o =>
    {
        o.Window           = TimeSpan.FromSeconds(30);
        o.SegmentsPerWindow = 3;
        o.PermitLimit      = 50;
    });

    // Token bucket — burst-friendly
    opts.AddTokenBucketLimiter("token", o =>
    {
        o.TokenLimit          = 100;
        o.ReplenishmentPeriod = TimeSpan.FromSeconds(10);
        o.TokensPerPeriod     = 20;
    });

    // Concurrency limiter
    opts.AddConcurrencyLimiter("concurrency", o => o.PermitLimit = 10);
});

app.UseRateLimiter();

app.MapGet("/products", GetProducts)
   .RequireRateLimiting("fixed");
\`\`\``,
      tags: ["output-caching", "rate-limiting", "performance"],
    },
    {
      id: "background-services",
      title: "Background services: IHostedService & BackgroundService",
      difficulty: "medium",
      question: "How do you implement long-running background work in ASP.NET Core using IHostedService and BackgroundService?",
      answer: `**IHostedService** is the low-level interface. **BackgroundService** is an abstract base class that simplifies it.

**BackgroundService (recommended)**
\`\`\`csharp
public class OrderProcessingWorker(
    IServiceScopeFactory scopeFactory,
    ILogger<OrderProcessingWorker> logger,
    IOptions<WorkerOptions> opts) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("Worker started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await using var scope = scopeFactory.CreateAsyncScope();
                var orderService = scope.ServiceProvider.GetRequiredService<IOrderService>();
                await orderService.ProcessPendingAsync(stoppingToken);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                logger.LogError(ex, "Error processing orders");
            }

            await Task.Delay(opts.Value.Interval, stoppingToken);
        }
    }

    public override async Task StopAsync(CancellationToken ct)
    {
        logger.LogInformation("Worker stopping");
        await base.StopAsync(ct);
    }
}

// Registration
builder.Services.AddHostedService<OrderProcessingWorker>();
\`\`\`

**IHostedService (fine-grained control)**
\`\`\`csharp
public class StartupDataSeeder(IServiceScopeFactory factory) : IHostedService
{
    public async Task StartAsync(CancellationToken ct)
    {
        await using var scope = factory.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.Database.MigrateAsync(ct);
        await SeedAsync(db, ct);
    }

    public Task StopAsync(CancellationToken ct) => Task.CompletedTask;
}
\`\`\`

**Key rules**
- Never inject Scoped services directly into a \`BackgroundService\` (Singleton). Use \`IServiceScopeFactory\`.
- Always respect \`stoppingToken\` — pass it to every async call.
- If \`ExecuteAsync\` throws, the host treats it as a fatal error by default (\`BackgroundServiceExceptionBehavior.StopHost\` in .NET 6+).`,
      tags: ["background-services", "IHostedService", "BackgroundService", "workers"],
    },
    {
      id: "global-error-handling",
      title: "Global error handling",
      difficulty: "medium",
      question: "What are the options for global error handling in ASP.NET Core 9?",
      answer: `**Option 1: UseExceptionHandler (middleware)**
\`\`\`csharp
app.UseExceptionHandler(errApp =>
{
    errApp.Run(async ctx =>
    {
        var feature  = ctx.Features.Get<IExceptionHandlerFeature>();
        var ex       = feature?.Error;
        var (status, title) = ex switch
        {
            NotFoundException  => (404, "Not Found"),
            ValidationException => (422, "Unprocessable Entity"),
            _                  => (500, "Internal Server Error")
        };

        ctx.Response.StatusCode  = status;
        ctx.Response.ContentType = "application/problem+json";

        await ctx.Response.WriteAsJsonAsync(new ProblemDetails
        {
            Status = status,
            Title  = title,
            Detail = ex?.Message,
            Extensions = { ["traceId"] = Activity.Current?.Id }
        });
    });
});
\`\`\`

**Option 2: IExceptionHandler (.NET 8+, preferred)**
\`\`\`csharp
public class GlobalExceptionHandler(IProblemDetailsService pd) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext ctx, Exception ex, CancellationToken ct)
    {
        var (status, title) = ex switch
        {
            NotFoundException   => (404, "Not Found"),
            UnauthorizedException => (401, "Unauthorized"),
            _                   => (500, "Unexpected error")
        };

        ctx.Response.StatusCode = status;
        await pd.WriteAsync(new ProblemDetailsContext
        {
            HttpContext = ctx,
            Exception   = ex,
            ProblemDetails = { Title = title, Detail = ex.Message }
        }, ct);

        return true;   // handled — don't propagate
    }
}

// Registration
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();
app.UseExceptionHandler();
\`\`\`

**Option 3: UseStatusCodePages**
\`\`\`csharp
// Adds ProblemDetails body for 4xx responses with no body
app.UseStatusCodePages();
// or
app.UseStatusCodePagesWithReExecute("/error/{0}");
\`\`\`

Chain multiple \`IExceptionHandler\` implementations for priority-ordered handling.`,
      tags: ["error-handling", "exception-handler", "ProblemDetails", "middleware"],
    },
    {
      id: "openapi-swagger",
      title: "OpenAPI / Swagger",
      difficulty: "medium",
      question: "How do you add OpenAPI/Swagger documentation to an ASP.NET Core 9 API?",
      answer: `ASP.NET Core 9 ships **Microsoft.AspNetCore.OpenApi** as the first-party solution. Swashbuckle remains popular.

**Microsoft.AspNetCore.OpenApi (.NET 9 — built-in)**
\`\`\`csharp
// dotnet add package Microsoft.AspNetCore.OpenApi
builder.Services.AddOpenApi(opts =>
{
    opts.AddDocumentTransformer((doc, ctx, ct) =>
    {
        doc.Info.Title   = "My API";
        doc.Info.Version = "v1";
        return Task.CompletedTask;
    });
});

app.MapOpenApi();              // serves /openapi/v1.json
app.MapScalarApiReference();   // dotnet add package Scalar.AspNetCore
\`\`\`

**Swashbuckle (still widely used)**
\`\`\`csharp
// dotnet add package Swashbuckle.AspNetCore
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "My API", Version = "v1" });

    // JWT security scheme
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Type   = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        [new OpenApiSecurityScheme { Reference = new OpenApiReference
            { Type = ReferenceType.SecurityScheme, Id = "Bearer" } }] = []
    });
});

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
\`\`\`

**Decorating Minimal API endpoints**
\`\`\`csharp
app.MapPost("/products", CreateProduct)
   .WithName("CreateProduct")
   .WithSummary("Create a new product")
   .WithDescription("Creates a product and returns its location.")
   .Produces<ProductDto>(201)
   .ProducesValidationProblem()
   .WithOpenApi();
\`\`\`

**XML comments on controllers**
\`\`\`csharp
// In .csproj: <GenerateDocumentationFile>true</GenerateDocumentationFile>
c.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, "MyApi.xml"));
\`\`\``,
      tags: ["openapi", "swagger", "swashbuckle", "documentation"],
    },
    {
      id: "signalr-basics",
      title: "SignalR basics",
      difficulty: "medium",
      question: "What is SignalR and how do you set up a basic real-time hub in ASP.NET Core?",
      answer: `**SignalR** is an ASP.NET Core library for adding real-time, bi-directional communication between server and clients. It abstracts WebSockets, Server-Sent Events, and long-polling — choosing the best transport automatically.

**Server-side hub**
\`\`\`csharp
// Hub — one instance per connection call (transient-like)
public class ChatHub : Hub
{
    // Called by clients
    public async Task SendMessage(string user, string message)
    {
        // Broadcast to all connected clients
        await Clients.All.SendAsync("ReceiveMessage", user, message);
    }

    public async Task JoinGroup(string room)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, room);
        await Clients.Group(room).SendAsync("UserJoined", Context.ConnectionId);
    }

    public override async Task OnConnectedAsync()
    {
        await Clients.Caller.SendAsync("Connected", Context.ConnectionId);
        await base.OnConnectedAsync();
    }
}

// Registration
builder.Services.AddSignalR(opts =>
{
    opts.MaximumReceiveMessageSize = 32 * 1024; // 32 KB
    opts.EnableDetailedErrors      = app.Environment.IsDevelopment();
});

app.MapHub<ChatHub>("/hubs/chat");
\`\`\`

**JavaScript client**
\`\`\`js
const connection = new signalR.HubConnectionBuilder()
    .withUrl("/hubs/chat")
    .withAutomaticReconnect()
    .build();

connection.on("ReceiveMessage", (user, message) =>
    console.log(\`\${user}: \${message}\`));

await connection.start();
await connection.invoke("SendMessage", "Alice", "Hello!");
\`\`\`

**Typed hub (strongly typed clients)**
\`\`\`csharp
public interface IChatClient
{
    Task ReceiveMessage(string user, string message);
}

public class ChatHub : Hub<IChatClient>
{
    public async Task SendMessage(string user, string message)
        => await Clients.All.ReceiveMessage(user, message); // compile-time safe
}
\`\`\`

**Scale-out:** use the Azure SignalR Service backplane or Redis backplane (\`AddStackExchangeRedis\`) to distribute connections across multiple server instances.`,
      tags: ["signalr", "websockets", "real-time"],
    },

    // ───── HARD ─────
    {
      id: "blazor-vs-razor-vs-mvc",
      title: "Blazor vs Razor Pages vs MVC",
      difficulty: "hard",
      question: "Compare Blazor (Server, WebAssembly, Auto), Razor Pages, and MVC. When would you choose each?",
      answer: `ASP.NET Core supports multiple UI paradigms. The right choice depends on team skills, interactivity needs, and SEO requirements.

**MVC (Model-View-Controller)**
- Full server-rendered HTML with clear separation of concerns.
- Best for: complex multi-page apps where teams already know MVC patterns.
- Controller handles request → Model fetches data → View renders HTML.

\`\`\`csharp
public class ProductsController(IProductService svc) : Controller
{
    [HttpGet]
    public async Task<IActionResult> Index()
        => View(await svc.GetAllAsync());

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(CreateProductDto dto)
    {
        if (!ModelState.IsValid) return View(dto);
        await svc.CreateAsync(dto);
        return RedirectToAction(nameof(Index));
    }
}
\`\`\`

**Razor Pages**
- Page-centric (one .cshtml + one PageModel per route). Simpler than MVC for page-focused apps.
- Best for: CRUD-heavy admin sites, content pages.

\`\`\`csharp
// Pages/Products/Index.cshtml.cs
public class IndexModel(IProductService svc) : PageModel
{
    public IEnumerable<Product> Products { get; private set; } = [];

    public async Task OnGetAsync()
        => Products = await svc.GetAllAsync();

    [BindProperty]
    public CreateProductDto NewProduct { get; set; } = new();

    public async Task<IActionResult> OnPostAsync()
    {
        if (!ModelState.IsValid) return Page();
        await svc.CreateAsync(NewProduct);
        return RedirectToPage();
    }
}
\`\`\`

**Blazor modes (.NET 9)**
| Mode | Rendering | JS needed? | Best for |
|---|---|---|---|
| Blazor Server | Server-side, SignalR UI diffs | No | Apps needing server resources, small payloads |
| Blazor WebAssembly | Client-side .NET in browser | No | Offline-capable apps |
| Blazor Auto | Server first, then WASM | No | Best of both: fast first load + offline |
| Blazor Static SSR | Pure server-rendered HTML | No | SEO pages, no interactivity needed |

\`\`\`razor
@* Counter.razor *@
@rendermode InteractiveServer

<h1>Count: @count</h1>
<button @onclick="Increment">+1</button>

@code {
    private int count;
    void Increment() => count++;
}
\`\`\`

**Decision guide**
- **REST/JSON API only** → Minimal API or controller API.
- **Server-rendered CRUD with minimal JS** → Razor Pages.
- **Complex SPA-like interactivity without JavaScript** → Blazor Auto or Server.
- **Offline / PWA** → Blazor WebAssembly.
- **Mixed app (API + server pages)** → Razor Pages + Minimal API for the API surface.`,
      tags: ["blazor", "razor-pages", "mvc", "ui", "architecture"],
    },
    {
      id: "testing-webapplicationfactory",
      title: "Testing with WebApplicationFactory and TestServer",
      difficulty: "hard",
      question: "How do you write integration tests for ASP.NET Core APIs using WebApplicationFactory?",
      answer: `**WebApplicationFactory<TEntryPoint>** spins up the full application in-process — real middleware, DI, routing — without network I/O. This is the gold standard for integration testing ASP.NET Core.

**Basic setup (xUnit)**
\`\`\`csharp
// NuGet: Microsoft.AspNetCore.Mvc.Testing
public class ProductsApiTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public ProductsApiTests(WebApplicationFactory<Program> factory)
    {
        _client = factory
            .WithWebHostBuilder(builder =>
            {
                builder.ConfigureTestServices(services =>
                {
                    // Replace real DB with SQLite in-memory
                    services.RemoveAll<DbContextOptions<AppDbContext>>();
                    services.AddDbContext<AppDbContext>(opts =>
                        opts.UseSqlite("DataSource=:memory:"));

                    // Swap external dependencies
                    services.AddSingleton<IEmailSender, NullEmailSender>();
                });
            })
            .CreateClient(new WebApplicationFactoryClientOptions
            {
                AllowAutoRedirect = false
            });
    }

    [Fact]
    public async Task GetProducts_ReturnsOk()
    {
        var response = await _client.GetAsync("/api/products");
        response.EnsureSuccessStatusCode();
        var products = await response.Content.ReadFromJsonAsync<List<ProductDto>>();
        Assert.NotNull(products);
    }
}
\`\`\`

**Custom factory with auth**
\`\`\`csharp
public class AuthenticatedApiFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureTestServices(services =>
        {
            services.Configure<JwtBearerOptions>(
                JwtBearerDefaults.AuthenticationScheme, opts =>
            {
                opts.TokenValidationParameters.ValidIssuer   = "test-issuer";
                opts.TokenValidationParameters.ValidAudience = "test-audience";
                opts.TokenValidationParameters.IssuerSigningKey =
                    new SymmetricSecurityKey("test-secret-key-32chars!!"u8.ToArray());
            });
        });
    }

    public HttpClient CreateAuthenticatedClient(string role = "User")
    {
        var token = GenerateTestJwt(role);
        var client = CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);
        return client;
    }
}
\`\`\`

**Respawn for DB cleanup**
\`\`\`csharp
// NuGet: Respawn
public async Task InitializeAsync()
{
    _respawner = await Respawner.CreateAsync(_connectionString, new RespawnerOptions
    {
        DbAdapter    = DbAdapter.Postgres,
        SchemasToInclude = ["public"],
    });
}

public async Task ResetAsync() => await _respawner.ResetAsync(_connectionString);
\`\`\`

**Tips**
- Use \`IAsyncLifetime\` (xUnit) or \`IAsyncDisposable\` to seed and reset DB between tests.
- Share a single \`WebApplicationFactory\` instance across a test class with \`IClassFixture<T>\` — spinning it up per test is slow.
- Test the *real* middleware order; don't unit-test controllers in isolation if you want coverage of auth, CORS, and model validation.`,
      tags: ["testing", "integration-testing", "WebApplicationFactory", "TestServer"],
    },
    {
      id: "advanced-di-patterns",
      title: "Advanced DI: decorators, factories, keyed services",
      difficulty: "hard",
      question: "How do you implement advanced dependency injection patterns in ASP.NET Core such as decorators, factory-based registration, and keyed services?",
      answer: `The built-in container is intentionally simple. Complex patterns are achievable natively in .NET 8+ and via Scrutor / other libraries.

**Decorator pattern (Scrutor NuGet)**
\`\`\`csharp
// dotnet add package Scrutor
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.Decorate<IOrderService, CachedOrderService>();
builder.Services.Decorate<IOrderService, LoggingOrderService>();
// Resolution order: LoggingOrderService → CachedOrderService → OrderService

public class CachedOrderService(IOrderService inner, IMemoryCache cache) : IOrderService
{
    public async Task<Order?> FindAsync(int id)
        => await cache.GetOrCreateAsync(\`order-{id}\`,
            entry => { entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5);
                       return inner.FindAsync(id); });
}
\`\`\`

**Factory-based registration**
\`\`\`csharp
// Register using a factory when construction depends on runtime config
builder.Services.AddSingleton<IPaymentGateway>(sp =>
{
    var config  = sp.GetRequiredService<IConfiguration>();
    var logger  = sp.GetRequiredService<ILogger<StripeGateway>>();
    var provider = config["Payment:Provider"];

    return provider switch
    {
        "stripe" => new StripeGateway(config["Stripe:SecretKey"]!, logger),
        "paypal" => new PayPalGateway(config["PayPal:ClientId"]!, logger),
        _        => throw new InvalidOperationException(\`Unknown provider: {provider}\`)
    };
});
\`\`\`

**Keyed services (.NET 8+)**
\`\`\`csharp
builder.Services.AddKeyedScoped<INotifier, EmailNotifier>("email");
builder.Services.AddKeyedScoped<INotifier, SmsNotifier>("sms");
builder.Services.AddKeyedScoped<INotifier, PushNotifier>("push");

// Resolve by key
public class NotificationFacade(
    [FromKeyedServices("email")] INotifier email,
    [FromKeyedServices("sms")]   INotifier sms)
{
    public async Task NotifyAsync(User user, string message)
    {
        await email.SendAsync(user.Email, message);
        if (user.PhoneVerified)
            await sms.SendAsync(user.Phone!, message);
    }
}

// Or resolve dynamically
public class DynamicNotifier(IServiceProvider sp)
{
    public INotifier Get(string channel) =>
        sp.GetRequiredKeyedService<INotifier>(channel);
}
\`\`\`

**Open generics**
\`\`\`csharp
// Register IRepository<T> for any T automatically
builder.Services.AddScoped(typeof(IRepository<>), typeof(EfRepository<>));

// Resolves correctly
var repo = sp.GetRequiredService<IRepository<Order>>();
\`\`\`

**Validation at startup (.NET 8+)**
\`\`\`csharp
builder.Services.AddOptions<DatabaseOptions>()
    .BindConfiguration("Database")
    .ValidateDataAnnotations()
    .ValidateOnStart();   // crashes app immediately if config is invalid
\`\`\``,
      tags: ["dependency-injection", "decorator", "factory", "keyed-services", "advanced"],
    },
    {
      id: "minimal-api-advanced",
      title: "Advanced Minimal API patterns",
      difficulty: "hard",
      question: "What are the advanced patterns for organizing and extending Minimal APIs in large ASP.NET Core 9 applications?",
      answer: `Minimal APIs scale to large codebases with the right organization patterns.

**IEndpointRouteBuilder extension pattern**
\`\`\`csharp
// Feature-based endpoint modules
public interface IEndpointModule
{
    void MapEndpoints(IEndpointRouteBuilder app);
}

public class ProductsModule : IEndpointModule
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/products")
            .RequireAuthorization()
            .WithTags("Products")
            .WithOpenApi();

        group.MapGet("/",        GetAll);
        group.MapGet("/{id:int}", GetById);
        group.MapPost("/",       Create).AddEndpointFilter<ValidationFilter<CreateProductDto>>();
        group.MapPut("/{id:int}", Update);
        group.MapDelete("/{id:int}", Delete).RequireAuthorization("AdminOnly");
    }

    static async Task<Ok<IEnumerable<ProductDto>>> GetAll(IProductService svc)
        => TypedResults.Ok(await svc.GetAllAsync());

    static async Task<Results<Ok<ProductDto>, NotFound>> GetById(int id, IProductService svc)
        => await svc.FindAsync(id) is { } p
            ? TypedResults.Ok(p)
            : TypedResults.NotFound();

    static async Task<Created<ProductDto>> Create(
        CreateProductDto dto, IProductService svc)
    {
        var p = await svc.CreateAsync(dto);
        return TypedResults.Created(\`/api/products/{p.Id}\`, p);
    }
}

// Auto-discover and register all modules
var moduleType = typeof(IEndpointModule);
var modules = Assembly.GetExecutingAssembly().GetTypes()
    .Where(t => t.IsClass && !t.IsAbstract && moduleType.IsAssignableFrom(t))
    .Select(Activator.CreateInstance)
    .Cast<IEndpointModule>();

foreach (var module in modules)
    module.MapEndpoints(app);
\`\`\`

**Endpoint filter pipeline (Minimal API equivalent of action filters)**
\`\`\`csharp
public class ValidationFilter<T>(IValidator<T> validator) : IEndpointFilter
{
    public async ValueTask<object?> InvokeAsync(
        EndpointFilterInvocationContext ctx, EndpointFilterDelegate next)
    {
        if (ctx.Arguments.OfType<T>().FirstOrDefault() is { } model)
        {
            var result = await validator.ValidateAsync(model);
            if (!result.IsValid)
                return TypedResults.ValidationProblem(result.ToDictionary());
        }
        return await next(ctx);
    }
}
\`\`\`

**TypedResults for compile-time OpenAPI**
\`\`\`csharp
// Union return type: OpenAPI knows both possible shapes
static async Task<Results<Ok<ProductDto>, NotFound, ForbidHttpResult>> GetById(
    int id,
    ClaimsPrincipal user,
    IProductService svc)
{
    if (!user.IsInRole("Admin") && !user.HasClaim("tenantId", "acme"))
        return TypedResults.Forbid();

    return await svc.FindAsync(id) is { } p
        ? TypedResults.Ok(p)
        : TypedResults.NotFound();
}
\`\`\`

**Request binding: AsParameters**
\`\`\`csharp
// Bind route, query, and headers into a single struct
record ProductQuery(
    [FromRoute]  int    Id,
    [FromQuery]  string Currency = "USD",
    [FromHeader(Name = "Accept-Language")] string Lang = "en");

app.MapGet("/products/{id}", ([AsParameters] ProductQuery q, IProductService svc)
    => svc.FindAsync(q.Id, q.Currency, q.Lang));
\`\`\``,
      tags: ["minimal-api", "advanced", "organization", "endpoint-filters", "TypedResults"],
    },
    {
      id: "performance-and-low-level",
      title: "Performance: Span<T>, IAsyncEnumerable, HttpContext low-level",
      difficulty: "hard",
      question: "What low-level ASP.NET Core and .NET APIs can you use to maximize throughput in a high-performance API?",
      answer: `High-throughput ASP.NET Core services avoid allocations, stream large payloads, and minimize serialization overhead.

**IAsyncEnumerable streaming**
\`\`\`csharp
// Server streams rows as they arrive from DB — no buffering
app.MapGet("/products/stream", (AppDbContext db) =>
    db.Products.AsAsyncEnumerable());

// System.Text.Json streams IAsyncEnumerable<T> automatically
// Content-Type: application/json, chunked transfer encoding
\`\`\`

**Direct PipeWriter / response body access**
\`\`\`csharp
app.MapGet("/fast", async (HttpContext ctx) =>
{
    ctx.Response.ContentType = "application/octet-stream";
    var writer = ctx.Response.BodyWriter;

    for (int i = 0; i < 1_000; i++)
    {
        var buffer = writer.GetSpan(8);
        BinaryPrimitives.WriteInt64BigEndian(buffer, i);
        writer.Advance(8);
        await writer.FlushAsync();
    }
});
\`\`\`

**Avoid closure allocations in hot-path Minimal APIs**
\`\`\`csharp
// Static lambdas — no implicit captures → no allocations
app.MapGet("/ping", static () => "pong");
app.MapGet("/echo/{msg}", static (string msg) => msg);
\`\`\`

**FrozenDictionary for read-only lookup (NET 8+)**
\`\`\`csharp
// Built once at startup, lookup faster than Dictionary in hot path
private static readonly FrozenDictionary<string, int> _codes =
    new Dictionary<string, int> { ["USD"] = 1, ["EUR"] = 2 }
    .ToFrozenDictionary();
\`\`\`

**Output caching + response compression**
\`\`\`csharp
builder.Services.AddResponseCompression(opts =>
{
    opts.EnableForHttps = true;
    opts.Providers.Add<BrotliCompressionProvider>();
    opts.Providers.Add<GzipCompressionProvider>();
});
builder.Services.Configure<BrotliCompressionProviderOptions>(o =>
    o.Level = CompressionLevel.Fastest);

app.UseResponseCompression();  // before static files and output cache
\`\`\`

**ObjectPool for reuse of expensive objects**
\`\`\`csharp
builder.Services.AddSingleton<ObjectPoolProvider, DefaultObjectPoolProvider>();
builder.Services.AddSingleton(sp =>
    sp.GetRequiredService<ObjectPoolProvider>()
      .Create(new StringBuilderPooledObjectPolicy()));

app.MapGet("/build", (ObjectPool<StringBuilder> pool) =>
{
    var sb = pool.Get();
    try
    {
        sb.Append("Hello, ").Append("World!");
        return sb.ToString();
    }
    finally { pool.Return(sb); }
});
\`\`\`

**Key rules**
- Prefer \`TypedResults\` + \`IAsyncEnumerable\` over \`List<T>\` returns.
- Use \`[ResponseCache]\` or \`CacheOutput\` to avoid re-executing expensive handlers.
- Profile with \`dotnet-trace\` and BenchmarkDotNet before optimizing — measure first.`,
      tags: ["performance", "low-level", "IAsyncEnumerable", "Span", "throughput"],
    },
    {
      id: "middleware-custom-advanced",
      title: "Custom middleware: conventions, DI, short-circuiting",
      difficulty: "hard",
      question: "How do you build robust, production-quality custom middleware in ASP.NET Core including DI integration and short-circuit patterns?",
      answer: `Custom middleware is the right place for cross-cutting concerns that apply *across all routes* (logging, tracing, tenant resolution, feature flags).

**Convention-based middleware with scoped DI**
\`\`\`csharp
public class TenantResolutionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<TenantResolutionMiddleware> _logger;

    // Singleton services injected via constructor
    public TenantResolutionMiddleware(
        RequestDelegate next,
        ILogger<TenantResolutionMiddleware> logger)
    {
        _next  = next;
        _logger = logger;
    }

    // Scoped/transient services injected via InvokeAsync
    public async Task InvokeAsync(HttpContext ctx, ITenantService tenants)
    {
        var tenantId = ctx.Request.Headers["X-Tenant-Id"].FirstOrDefault()
                    ?? ctx.Request.Host.Host.Split('.')[0];

        var tenant = await tenants.ResolveAsync(tenantId);
        if (tenant is null)
        {
            _logger.LogWarning("Unknown tenant: {TenantId}", tenantId);
            ctx.Response.StatusCode = 400;
            await ctx.Response.WriteAsJsonAsync(new { error = "Unknown tenant" });
            return;   // short-circuit — _next is NOT called
        }

        ctx.Items["Tenant"] = tenant;
        ctx.SetTenant(tenant);   // extension method sets feature on HttpContext
        await _next(ctx);
    }
}

// Extension for clean registration
public static class TenantMiddlewareExtensions
{
    public static IApplicationBuilder UseTenantResolution(
        this IApplicationBuilder app) =>
        app.UseMiddleware<TenantResolutionMiddleware>();
}
\`\`\`

**IMiddleware (strongly-typed, DI-friendly)**
\`\`\`csharp
// Registered as a scoped service — no constructor injection quirks
public class CorrelationIdMiddleware(ILogger<CorrelationIdMiddleware> log) : IMiddleware
{
    public async Task InvokeAsync(HttpContext ctx, RequestDelegate next)
    {
        var correlationId = ctx.Request.Headers["X-Correlation-Id"].FirstOrDefault()
                         ?? Activity.Current?.TraceId.ToString()
                         ?? Guid.NewGuid().ToString("N");

        ctx.Response.Headers["X-Correlation-Id"] = correlationId;
        using (log.BeginScope(new { CorrelationId = correlationId }))
            await next(ctx);
    }
}

// Registration — must be explicit (IMiddleware requires DI registration)
builder.Services.AddScoped<CorrelationIdMiddleware>();
app.UseMiddleware<CorrelationIdMiddleware>();
\`\`\`

**Conditional short-circuit with early exit**
\`\`\`csharp
public class ApiKeyMiddleware(RequestDelegate next, IConfiguration config)
{
    private readonly string _apiKey = config["ApiKey"]!;

    public async Task InvokeAsync(HttpContext ctx)
    {
        // Only applies to /api routes
        if (!ctx.Request.Path.StartsWithSegments("/api"))
        {
            await next(ctx);
            return;
        }

        if (!ctx.Request.Headers.TryGetValue("X-Api-Key", out var key)
            || key != _apiKey)
        {
            ctx.Response.StatusCode = 401;
            await ctx.Response.WriteAsJsonAsync(new ProblemDetails
            {
                Status = 401, Title = "Invalid or missing API key"
            });
            return;  // pipeline ends here
        }

        await next(ctx);
    }
}
\`\`\`

**Testing middleware in isolation**
\`\`\`csharp
[Fact]
public async Task TenantMiddleware_UnknownTenant_Returns400()
{
    var ctx = new DefaultHttpContext();
    ctx.Request.Headers["X-Tenant-Id"] = "unknown";
    ctx.Response.Body = new MemoryStream();

    var tenants = Substitute.For<ITenantService>();
    tenants.ResolveAsync("unknown").Returns((Tenant?)null);

    var mw = new TenantResolutionMiddleware(_ => Task.CompletedTask,
        NullLogger<TenantResolutionMiddleware>.Instance);
    await mw.InvokeAsync(ctx, tenants);

    Assert.Equal(400, ctx.Response.StatusCode);
}
\`\`\``,
      tags: ["middleware", "advanced", "DI", "short-circuit", "IMiddleware"],
    },
  ],
};
