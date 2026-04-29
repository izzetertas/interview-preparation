import type { Category } from "./types";

export const blazor: Category = {
  slug: "blazor",
  title: "Blazor",
  description:
    "Blazor in .NET 9: Blazor United / Auto render modes, component model, lifecycle, data binding, routing, forms, dependency injection, JavaScript interop, authentication, state management, streaming rendering, WASM performance, SignalR, and testing with bUnit.",
  icon: "🔥",
  questions: [
    // ───── EASY ─────
    {
      id: "blazor-what-is",
      title: "What is Blazor?",
      difficulty: "easy",
      question: "What is Blazor and how does it fit into the .NET ecosystem?",
      answer: `**Blazor** is Microsoft's framework for building interactive web UIs using C# and Razor syntax instead of (or alongside) JavaScript. It ships as part of ASP.NET Core and targets .NET 9+.

**Core idea**
- Write UI components in \`.razor\` files using HTML markup + C# logic.
- The framework handles rendering, diffing, and event handling.
- You get the full .NET BCL (LINQ, collections, async, etc.) in the browser or on the server.

**A minimal component**
\`\`\`razor
@* Counter.razor *@
<h1>Count: @count</h1>
<button @onclick="Increment">+1</button>

@code {
    private int count = 0;
    private void Increment() => count++;
}
\`\`\`

**Why Blazor in 2026?**
| Feature | Benefit |
|---|---|
| Full-stack C# | One language, shared models, no DTO mapping between front/back |
| .NET 9 performance | AOT compilation, trimming, fast SSR |
| Blazor United | Mix render modes per component in one app |
| Strong typing | Catch UI bugs at compile time |

Blazor integrates with ASP.NET Core middleware, SignalR, Entity Framework Core, and the entire NuGet ecosystem.`,
      tags: ["fundamentals", "overview"],
    },
    {
      id: "blazor-server-vs-wasm",
      title: "Blazor Server vs Blazor WebAssembly",
      difficulty: "easy",
      question: "What are the differences between Blazor Server and Blazor WebAssembly?",
      answer: `**Blazor Server** runs all C# on the server. A persistent **SignalR** WebSocket connection carries UI diffs to the browser and DOM events back to the server.

**Blazor WebAssembly (WASM)** compiles the .NET runtime and app DLLs to WebAssembly and runs them entirely in the browser — no server round-trips for UI updates.

| Concern | Blazor Server | Blazor WASM |
|---|---|---|
| Where C# runs | Server | Browser (via WASM) |
| Initial load | Fast (small download) | Slower (runtime + DLLs) |
| Latency | Every event = round-trip | Zero round-trips |
| Offline support | No | Yes (PWA mode) |
| Scalability | One SignalR circuit per user | Stateless CDN hosting |
| Secret access | Full (runs on server) | None (runs in browser) |
| DB access | Direct (EF Core etc.) | Via API calls only |

**Blazor Server setup (Program.cs)**
\`\`\`csharp
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode();
\`\`\`

**Blazor WASM setup**
\`\`\`csharp
builder.Services.AddRazorComponents()
    .AddInteractiveWebAssemblyComponents();

app.MapRazorComponents<App>()
    .AddInteractiveWebAssemblyRenderMode();
\`\`\`

In .NET 8+ both can coexist in a single **Blazor United** app using Auto render mode.`,
      tags: ["server", "wasm", "architecture"],
    },
    {
      id: "blazor-auto-render-mode",
      title: "Blazor United / Auto render mode",
      difficulty: "easy",
      question: "What is Blazor United and what does the Auto render mode do in .NET 8/.NET 9?",
      answer: `**Blazor United** (the marketing name for the unified model introduced in .NET 8) allows a single app to use multiple render modes — Static SSR, Interactive Server, Interactive WASM, and Auto — mixed freely at the component level.

**Four render modes**
| Mode | Attribute | Behaviour |
|---|---|---|
| Static SSR | *(none / default)* | HTML rendered on server, no interactivity |
| Interactive Server | \`@rendermode InteractiveServer\` | SignalR circuit, C# runs on server |
| Interactive WASM | \`@rendermode InteractiveWebAssembly\` | C# runs in browser via WASM |
| **Auto** | \`@rendermode InteractiveAuto\` | Server on first visit, WASM after runtime cached |

**Auto mode workflow**
1. First request → renders as Interactive Server (fast, no big download).
2. Blazor WASM runtime downloads in background.
3. Subsequent visits → switches to Interactive WASM (offline-capable, no server circuit).

**Applying a render mode**
\`\`\`razor
@* Per-component *@
<Counter @rendermode="InteractiveAuto" />

@* Per-page *@
@page "/dashboard"
@rendermode InteractiveServer
\`\`\`

\`\`\`csharp
// Program.cs — enable all modes
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents()
    .AddInteractiveWebAssemblyComponents();

app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode()
    .AddInteractiveWebAssemblyRenderMode()
    .AddAdditionalAssemblies(typeof(Client.App).Assembly);
\`\`\`

This is the **mainstream** pattern in 2026 — one solution, one codebase, optimal UX.`,
      tags: ["render-mode", "blazor-united", "dotnet8", "dotnet9"],
    },
    {
      id: "blazor-component-model",
      title: "Blazor component model",
      difficulty: "easy",
      question: "Describe the Blazor component model: what goes in a .razor file, and how do @code, @inject, and parameters work?",
      answer: `Every Blazor component is a \`.razor\` file that compiles to a C# class derived from \`ComponentBase\`.

**Anatomy of a component**
\`\`\`razor
@page "/product/{Id:int}"          @* Makes it a routable page *@
@inject IProductService Products   @* DI — injects a service *@

<h2>@product?.Name</h2>
<ChildComponent Label="Details" OnSelected="HandleSelected" />

@code {
    [Parameter] public int Id { get; set; }          // route or attribute parameter
    [Parameter] public EventCallback<int> OnPicked { get; set; }  // event out

    private Product? product;

    protected override async Task OnParametersSetAsync()
    {
        product = await Products.GetByIdAsync(Id);
    }

    private async Task HandleSelected(int selectedId)
    {
        await OnPicked.InvokeAsync(selectedId);
    }
}
\`\`\`

**Key directives**
| Directive | Purpose |
|---|---|
| \`@page\` | Adds a route; can appear multiple times |
| \`@inject\` | Constructor-injection shorthand |
| \`@code { }\` | C# class body (fields, methods, lifecycle) |
| \`@using\` | Namespace import (usually in \`_Imports.razor\`) |

**Parameters**
- \`[Parameter]\` — value passed from parent in markup.
- \`[CascadingParameter]\` — flows down the tree without explicit pass-through.
- \`[SupplyParameterFromQuery]\` — bound from URL query string.
- \`[SupplyParameterFromForm]\` — bound from a posted form (SSR).

Code-behind style (\`Counter.razor.cs\`) is also supported for larger components.`,
      tags: ["component", "parameters", "inject", "code-behind"],
    },
    {
      id: "blazor-lifecycle",
      title: "Component lifecycle methods",
      difficulty: "easy",
      question: "What are the main Blazor component lifecycle methods and when is each called?",
      answer: `Blazor components go through a well-defined lifecycle from creation to disposal.

**Lifecycle sequence (first render)**
\`\`\`
SetParametersAsync
  → OnInitialized / OnInitializedAsync
  → OnParametersSet / OnParametersSetAsync
  → ShouldRender          ← returns bool (skip render if false)
  → BuildRenderTree        ← actual render
  → OnAfterRender / OnAfterRenderAsync (firstRender = true)
\`\`\`

**On subsequent parameter changes**
\`\`\`
SetParametersAsync
  → OnParametersSet / OnParametersSetAsync
  → ShouldRender
  → BuildRenderTree (if ShouldRender returned true)
  → OnAfterRender / OnAfterRenderAsync (firstRender = false)
\`\`\`

**Common usage patterns**
\`\`\`csharp
@implements IAsyncDisposable

@code {
    [Parameter] public int UserId { get; set; }

    private UserDto? user;
    private int previousUserId;

    // Runs once on first load
    protected override async Task OnInitializedAsync()
    {
        user = await UserService.GetAsync(UserId);
        previousUserId = UserId;
    }

    // Runs every time parameters change
    protected override async Task OnParametersSetAsync()
    {
        if (UserId != previousUserId)
        {
            user = await UserService.GetAsync(UserId);
            previousUserId = UserId;
        }
    }

    // Prevent unnecessary re-renders
    protected override bool ShouldRender() => user is not null;

    // DOM is available here (good place for JS interop)
    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (firstRender)
            await JS.InvokeVoidAsync("initChart", chartRef);
    }

    public async ValueTask DisposeAsync()
    {
        await someResource.DisposeAsync();
    }
}
\`\`\`

**Key rules**
- Prefer \`OnInitializedAsync\` over \`OnInitialized\` for async data fetching.
- Never call \`StateHasChanged\` inside \`OnParametersSet\` without guarding — it causes loops.
- \`IAsyncDisposable\` / \`IDisposable\` are honoured automatically by the framework.`,
      tags: ["lifecycle", "OnInitializedAsync", "OnParametersSetAsync", "ShouldRender"],
    },
    {
      id: "blazor-data-binding",
      title: "Data binding in Blazor",
      difficulty: "easy",
      question: "How does data binding work in Blazor? What is the difference between one-way and two-way binding?",
      answer: `**One-way binding** renders a C# expression into the DOM; changes in the DOM do not flow back.

\`\`\`razor
<p>Hello, @name!</p>   @* expression rendered once *@
<input value="@name" /> @* attribute set, but changes ignored *@
\`\`\`

**Two-way binding** with \`@bind\` wires both directions: the property sets the value attribute, and the \`onchange\` event updates the property.

\`\`\`razor
<input @bind="name" />           @* updates on blur (onchange) *@
<input @bind="name" @bind:event="oninput" />  @* updates on every keystroke *@

@code {
    private string name = "Alice";
}
\`\`\`

**\`@bind\` on a custom component** requires a \`Value\` parameter + \`ValueChanged\` EventCallback (the "bind pattern"):

\`\`\`razor
@* Parent *@
<MyInput @bind-Value="searchText" />

@* MyInput.razor *@
<input value="@Value" @oninput="e => ValueChanged.InvokeAsync(e.Value?.ToString())" />

@code {
    [Parameter] public string? Value { get; set; }
    [Parameter] public EventCallback<string?> ValueChanged { get; set; }
}
\`\`\`

**Format strings**
\`\`\`razor
<input @bind="price" @bind:format="F2" type="number" />
\`\`\`

**Culture** — use \`@bind:culture\` to control number/date parsing:
\`\`\`razor
<input @bind="date" @bind:culture="CultureInfo.InvariantCulture" type="date" />
\`\`\``,
      tags: ["data-binding", "bind", "two-way", "one-way"],
    },
    {
      id: "blazor-routing",
      title: "Routing and NavigationManager",
      difficulty: "easy",
      question: "How does routing work in Blazor? Explain @page, route parameters, and NavigationManager.",
      answer: `**Declaring routes** — add one or more \`@page\` directives at the top of a component:

\`\`\`razor
@page "/products"
@page "/products/{CategoryId:int}"   @* typed route parameter *@
\`\`\`

**Route parameter types**
| Constraint | Example |
|---|---|
| \`{Id}\` | string (default) |
| \`{Id:int}\` | 32-bit integer |
| \`{Id:guid}\` | GUID |
| \`{Slug:alpha}\` | letters only |
| \`{Id:int?}\` | optional |

\`\`\`razor
@code {
    [Parameter] public int CategoryId { get; set; }
    [SupplyParameterFromQuery] public string? Search { get; set; }  // ?search=foo
}
\`\`\`

**NavigationManager** — inject for programmatic navigation:

\`\`\`razor
@inject NavigationManager Nav

<button @onclick="Go">Go to Dashboard</button>

@code {
    void Go()
    {
        Nav.NavigateTo("/dashboard");
        // Nav.NavigateTo("/dashboard", forceLoad: true);  // full page reload
        // Nav.NavigateTo("/dashboard", replace: true);    // replace history entry
    }

    void ReadQuery()
    {
        var uri = new Uri(Nav.Uri);
        var qs = Microsoft.AspNetCore.WebUtilities.QueryHelpers
                          .ParseQuery(uri.Query);
    }
}
\`\`\`

**Router component** (\`App.razor\`)
\`\`\`razor
<Router AppAssembly="typeof(App).Assembly">
    <Found Context="routeData">
        <RouteView RouteData="routeData" DefaultLayout="typeof(MainLayout)" />
    </Found>
    <NotFound>
        <p>Page not found.</p>
    </NotFound>
</Router>
\`\`\``,
      tags: ["routing", "NavigationManager", "page", "route-parameters"],
    },

    // ───── MEDIUM ─────
    {
      id: "blazor-component-communication",
      title: "Component communication patterns",
      difficulty: "medium",
      question: "What are the different ways components can communicate in Blazor? Compare Parameters, EventCallback, CascadingValue, and state containers.",
      answer: `**1. Parameters (parent → child)**
\`\`\`razor
@* Parent *@
<ProductCard Product="selectedProduct" />

@* ProductCard.razor *@
@code {
    [Parameter, EditorRequired] public Product Product { get; set; } = default!;
}
\`\`\`

**2. EventCallback (child → parent)**
\`\`\`razor
@* Child *@
<button @onclick="() => OnDelete.InvokeAsync(Product.Id)">Delete</button>

@code {
    [Parameter] public EventCallback<int> OnDelete { get; set; }
}

@* Parent *@
<ProductCard Product="p" OnDelete="HandleDelete" />
@code {
    async Task HandleDelete(int id) { /* ... */ }
}
\`\`\`
\`EventCallback\` automatically calls \`StateHasChanged\` on the parent after invocation.

**3. CascadingValue / CascadingParameter (ancestor → deep descendants)**
\`\`\`razor
@* Top-level layout or page *@
<CascadingValue Value="currentUser">
    @Body
</CascadingValue>

@* Deep child — no prop drilling needed *@
@code {
    [CascadingParameter] public UserDto? CurrentUser { get; set; }
}
\`\`\`
Use \`IsFixed="true"\` when the value never changes — avoids re-rendering the whole subtree.

**4. State container (scoped service)**
\`\`\`csharp
// AppState.cs
public class AppState
{
    public int CartCount { get; private set; }
    public event Action? OnChange;

    public void AddToCart()
    {
        CartCount++;
        OnChange?.Invoke();
    }
}

// Program.cs
builder.Services.AddScoped<AppState>();
\`\`\`
\`\`\`razor
@* Any component *@
@inject AppState State
@implements IDisposable

@code {
    protected override void OnInitialized()
        => State.OnChange += StateHasChanged;

    public void Dispose()
        => State.OnChange -= StateHasChanged;
}
\`\`\`

**Comparison**
| Pattern | Direction | Best for |
|---|---|---|
| Parameters | Down | Simple values |
| EventCallback | Up | User actions |
| CascadingValue | Down (skip levels) | Theme, auth, locale |
| State container | Any | Cross-tree, global state |`,
      tags: ["EventCallback", "CascadingValue", "state-container", "parameters"],
    },
    {
      id: "blazor-forms-validation",
      title: "Forms and validation",
      difficulty: "medium",
      question: "How do you build a validated form in Blazor using EditForm, DataAnnotationsValidator, and ValidationSummary?",
      answer: `Blazor's form system is built around \`EditForm\`, which wraps an **edit context** that tracks field state and validation messages.

**Model with annotations**
\`\`\`csharp
public class RegisterModel
{
    [Required, StringLength(50, MinimumLength = 2)]
    public string Name { get; set; } = "";

    [Required, EmailAddress]
    public string Email { get; set; } = "";

    [Required, MinLength(8)]
    public string Password { get; set; } = "";
}
\`\`\`

**Form component**
\`\`\`razor
@inject IAccountService Accounts
@inject NavigationManager Nav

<EditForm Model="model" OnValidSubmit="Submit" FormName="register">
    <DataAnnotationsValidator />
    <ValidationSummary />          @* lists all errors at top *@

    <div>
        <label>Name</label>
        <InputText @bind-Value="model.Name" />
        <ValidationMessage For="() => model.Name" />   @* inline field error *@
    </div>

    <div>
        <label>Email</label>
        <InputText @bind-Value="model.Email" type="email" />
        <ValidationMessage For="() => model.Email" />
    </div>

    <div>
        <label>Password</label>
        <InputText @bind-Value="model.Password" type="password" />
        <ValidationMessage For="() => model.Password" />
    </div>

    <button type="submit">Register</button>
</EditForm>

@code {
    [SupplyParameterFromForm] private RegisterModel model { get; set; } = new();

    private async Task Submit()
    {
        await Accounts.RegisterAsync(model);
        Nav.NavigateTo("/");
    }
}
\`\`\`

**Built-in input components**
| Component | HTML equivalent |
|---|---|
| \`InputText\` | \`<input type="text">\` |
| \`InputNumber<T>\` | \`<input type="number">\` |
| \`InputDate<T>\` | \`<input type="date">\` |
| \`InputCheckbox\` | \`<input type="checkbox">\` |
| \`InputSelect<T>\` | \`<select>\` |
| \`InputRadioGroup<T>\` | radio group |
| \`InputFile\` | \`<input type="file">\` |

**SSR forms (.NET 8+)**
\`\`\`razor
@* Static SSR — uses POST, no SignalR circuit needed *@
@rendermode @RenderMode.Static
\`\`\`
Add \`FormName\` and use \`[SupplyParameterFromForm]\` for SSR anti-forgery-aware binding.

**Custom validation** — implement \`IValidatableObject\` on the model, or create a custom validator attribute, or use \`FluentValidation\` with the community \`Blazored.FluentValidation\` adapter.`,
      tags: ["forms", "validation", "EditForm", "DataAnnotationsValidator"],
    },
    {
      id: "blazor-di",
      title: "Dependency injection in Blazor",
      difficulty: "medium",
      question: "How does dependency injection work in Blazor? What service lifetimes are available and which should you use?",
      answer: `Blazor uses the same \`Microsoft.Extensions.DependencyInjection\` container as ASP.NET Core, but lifetime semantics differ between Server and WASM.

**Registering services**
\`\`\`csharp
// Program.cs
builder.Services.AddSingleton<ICacheService, MemoryCacheService>();
builder.Services.AddScoped<IShoppingCart, ShoppingCartService>();
builder.Services.AddTransient<IEmailSender, SmtpEmailSender>();
\`\`\`

**Injecting into components**
\`\`\`razor
@inject IShoppingCart Cart         @* directive (preferred) *@
@inject ILogger<MyPage> Logger

@* Or via property injection with [Inject] in @code / code-behind *@
@code {
    [Inject] private IShoppingCart Cart2 { get; set; } = default!;
}
\`\`\`

**Lifetime semantics by host**
| Lifetime | Blazor Server | Blazor WASM |
|---|---|---|
| **Singleton** | Shared across all users (app lifetime) | Shared within one browser tab |
| **Scoped** | One per SignalR circuit (one per user session) | Same as Singleton (single circuit) |
| **Transient** | New instance per injection point | Same |

\`\`\`
Prefer Scoped for per-user state in Blazor Server — it lives as long as the circuit.
Avoid heavy Singleton state holding user data (concurrency bugs).
\`\`\`

**Keyed services (.NET 8+)**
\`\`\`csharp
builder.Services.AddKeyedScoped<IStorageProvider, S3Storage>("s3");
builder.Services.AddKeyedScoped<IStorageProvider, AzureBlobStorage>("azure");
\`\`\`
\`\`\`razor
@inject [FromKeyedServices("s3")] IStorageProvider Storage
\`\`\`

**HttpClient in WASM**
\`\`\`csharp
builder.Services.AddHttpClient<IProductApi, ProductApiClient>(
    client => client.BaseAddress = new Uri(builder.HostEnvironment.BaseAddress));
\`\`\``,
      tags: ["dependency-injection", "scoped", "singleton", "transient"],
    },
    {
      id: "blazor-js-interop",
      title: "JavaScript interop",
      difficulty: "medium",
      question: "How does JavaScript interop work in Blazor? How do you call JS from C# and C# from JS?",
      answer: `**IJSRuntime** is Blazor's bridge between C# and the browser's JS engine.

**C# → JS: \`InvokeAsync\` / \`InvokeVoidAsync\`**
\`\`\`csharp
@inject IJSRuntime JS

// Call a global function
await JS.InvokeVoidAsync("console.log", "Hello from C#");

// Call and get a return value
string text = await JS.InvokeAsync<string>("navigator.clipboard.readText");

// Call a module-exported function
await using var module = await JS.InvokeAsync<IJSObjectReference>(
    "import", "./js/charts.js");
await module.InvokeVoidAsync("initChart", canvasRef, options);
\`\`\`

**Passing DOM element references**
\`\`\`razor
<canvas @ref="canvasRef"></canvas>

@code {
    private ElementReference canvasRef;

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (firstRender)
            await JS.InvokeVoidAsync("Charts.init", canvasRef);
    }
}
\`\`\`

**JS → C#: \`DotNetObjectReference\`**
\`\`\`csharp
// Component exposes a method to JS
[JSInvokable]
public void ReceiveMessage(string message)
{
    Console.WriteLine(message);
    StateHasChanged();
}

protected override async Task OnAfterRenderAsync(bool firstRender)
{
    if (firstRender)
    {
        var dotNetRef = DotNetObjectReference.Create(this);
        await JS.InvokeVoidAsync("registerCallback", dotNetRef);
    }
}
\`\`\`
\`\`\`js
// charts.js
let dotNetHelper;
function registerCallback(ref) { dotNetHelper = ref; }
function notifyBlazor(msg) { dotNetHelper.invokeMethodAsync("ReceiveMessage", msg); }
\`\`\`

**\`IJSUnmarshalledRuntime\`** — synchronous, zero-serialisation interop for performance-critical WASM paths (avoids JSON round-trip).

**Best practices**
- Always call JS interop in \`OnAfterRenderAsync\` — the DOM doesn't exist before first render.
- Dispose \`IJSObjectReference\` and \`DotNetObjectReference\` to prevent memory leaks.
- Use JS isolation (ES modules) rather than global functions.`,
      tags: ["js-interop", "IJSRuntime", "DotNetObjectReference", "ElementReference"],
    },
    {
      id: "blazor-auth",
      title: "Authentication in Blazor",
      difficulty: "medium",
      question: "How is authentication implemented in Blazor? Explain AuthenticationStateProvider, AuthorizeView, and the differences between Server and WASM auth.",
      answer: `**AuthenticationStateProvider** is the abstraction the framework uses to determine who the current user is.

\`\`\`csharp
// Custom provider (e.g. for WASM with stored JWT)
public class JwtAuthStateProvider : AuthenticationStateProvider
{
    private readonly ITokenStorage _storage;

    public override async Task<AuthenticationState> GetAuthenticationStateAsync()
    {
        var token = await _storage.GetTokenAsync();
        if (string.IsNullOrEmpty(token))
            return new AuthenticationState(new ClaimsPrincipal());

        var identity = new ClaimsIdentity(ParseClaims(token), "jwt");
        return new AuthenticationState(new ClaimsPrincipal(identity));
    }

    public void NotifyLogin(string token)
    {
        _storage.SaveToken(token);
        var identity = new ClaimsIdentity(ParseClaims(token), "jwt");
        NotifyAuthenticationStateChanged(
            Task.FromResult(new AuthenticationState(new ClaimsPrincipal(identity))));
    }
}
\`\`\`

**Registration**
\`\`\`csharp
builder.Services.AddAuthorizationCore();
builder.Services.AddScoped<AuthenticationStateProvider, JwtAuthStateProvider>();
\`\`\`

**\`<AuthorizeView>\` in Razor**
\`\`\`razor
<AuthorizeView>
    <Authorized>
        <p>Welcome, @context.User.Identity?.Name!</p>
    </Authorized>
    <NotAuthorized>
        <a href="/login">Sign in</a>
    </NotAuthorized>
</AuthorizeView>

<AuthorizeView Roles="Admin">
    <AdminPanel />
</AuthorizeView>

<AuthorizeView Policy="PremiumUser">
    <PremiumContent />
</AuthorizeView>
\`\`\`

**\`[Authorize]\` on pages**
\`\`\`razor
@page "/account"
@attribute [Authorize]
@attribute [Authorize(Roles = "Admin,Manager")]
\`\`\`

**Blazor Server vs WASM auth**
| | Server | WASM |
|---|---|---|
| Cookie auth | Works natively | Needs CORS or BFF pattern |
| JWT | Works via HttpContext | Store in memory (not localStorage) |
| Provider | \`ServerAuthenticationStateProvider\` | Custom / MSAL / Oidc |
| Security | Server-side (trustworthy) | Client-side (never trust alone) |

**.NET 9 OIDC for WASM**
\`\`\`csharp
builder.Services.AddOidcAuthentication(options =>
{
    builder.Configuration.Bind("Oidc", options.ProviderOptions);
});
\`\`\``,
      tags: ["auth", "AuthenticationStateProvider", "AuthorizeView", "jwt"],
    },
    {
      id: "blazor-streaming-rendering",
      title: "Streaming rendering",
      difficulty: "medium",
      question: "What is streaming rendering in Blazor and when should you use it?",
      answer: `**Streaming rendering** (introduced in .NET 8) allows a Static SSR page to flush placeholder HTML to the browser immediately, then stream in updated content as async work completes — without a JS framework or WebSocket.

**How it works**
1. Server starts rendering the page.
2. Blazor immediately sends the static shell to the browser (fast TTFB).
3. While async operations run (DB queries, HTTP calls), the browser shows a loading state.
4. When each \`await\` completes, the updated HTML is streamed and swapped in.

**Enabling it**
\`\`\`razor
@page "/products"
@attribute [StreamRendering]       @* opt-in attribute *@

@if (products is null)
{
    <p>Loading products...</p>     @* shown immediately *@
}
else
{
    <ProductGrid Items="products" />
}

@code {
    private List<Product>? products;

    protected override async Task OnInitializedAsync()
    {
        // Page flushes while this runs
        products = await ProductService.GetAllAsync();
    }
}
\`\`\`

**What gets streamed**
- After each \`await\` the render tree is diffed and the delta is written as a \`<blazor-ssr>\` script tag that the Blazor JS bootstrapper applies to the live DOM.

**vs. Interactive render modes**
| | Streaming SSR | Interactive Server |
|---|---|---|
| JS overhead | Minimal (no circuit) | SignalR circuit |
| Post-load interactivity | None | Full |
| SEO friendly | Yes | Yes |
| Use case | Read-heavy pages, e-commerce listings | CRUD, dashboards |

**Combining patterns**
\`\`\`razor
@* Static page streams fast, then embeds an interactive island *@
@attribute [StreamRendering]

<h1>@pageTitle</h1>
<AddToCartButton ProductId="@Id" @rendermode="InteractiveServer" />
\`\`\``,
      tags: ["streaming-rendering", "SSR", "performance", "dotnet8"],
    },
    {
      id: "blazor-state-management",
      title: "State management patterns",
      difficulty: "medium",
      question: "What are the recommended state management patterns in Blazor and how does state survive navigation or reconnect?",
      answer: `**State lifetime challenges**
- Blazor Server: state lives in the SignalR circuit. If the circuit drops, state is lost.
- Blazor WASM: state lives in memory. Navigating away from a page destroys the component.

**Pattern 1 — Scoped service (in-memory, per-circuit/tab)**
\`\`\`csharp
public class CartState
{
    public List<CartItem> Items { get; } = new();
    public event Action? Changed;
    public void Add(CartItem item) { Items.Add(item); Changed?.Invoke(); }
}
builder.Services.AddScoped<CartState>();
\`\`\`

**Pattern 2 — ProtectedBrowserStorage (Blazor Server)**
\`\`\`razor
@inject ProtectedSessionStorage Session

@code {
    protected override async Task OnInitializedAsync()
    {
        var result = await Session.GetAsync<int>("count");
        count = result.Success ? result.Value : 0;
    }

    async Task Save() => await Session.SetAsync("count", count);
}
\`\`\`
Data is encrypted server-side, stored in browser sessionStorage.

**Pattern 3 — localStorage via JS interop (WASM)**
\`\`\`csharp
await JS.InvokeVoidAsync("localStorage.setItem", "theme", "dark");
var theme = await JS.InvokeAsync<string>("localStorage.getItem", "theme");
\`\`\`
Libraries like **Blazored.LocalStorage** wrap this cleanly.

**Pattern 4 — URL / query string state**
\`\`\`razor
@inject NavigationManager Nav

[SupplyParameterFromQuery] public string? Filter { get; set; }

void ApplyFilter(string f)
    => Nav.NavigateTo(Nav.GetUriWithQueryParameter("filter", f));
\`\`\`
Shareable, survives refresh.

**Pattern 5 — Fluxor / Redux-style**
\`\`\`csharp
// Fluxor NuGet: unidirectional data flow
builder.Services.AddFluxor(o => o.ScanAssemblies(typeof(Program).Assembly));
\`\`\`
Best for large apps with complex cross-component state.

**Reconnect state (Server)** — store critical state in ProtectedBrowserStorage or server-side cache keyed on a circuit/user token so a reconnected circuit can restore it.`,
      tags: ["state-management", "Fluxor", "localStorage", "scoped-service"],
    },
    {
      id: "blazor-signalr-circuit",
      title: "SignalR circuit in Blazor Server",
      difficulty: "medium",
      question: "What is a Blazor Server circuit and what are the implications of the SignalR connection for scalability and reliability?",
      answer: `**Circuit** — a Blazor Server circuit is the stateful session between the browser and the server maintained over a **SignalR WebSocket**. It stores the component tree, DI scope, and event handlers for one user.

**How it works**
\`\`\`
Browser  ←──── SignalR WebSocket ────→  Server
   UI events (onclick, oninput)      →  C# event handlers run
   DOM diffs (HTML patches)          ←  Updated render tree
\`\`\`

**Circuit lifecycle**
1. Page load → JS bootstrapper opens WebSocket → circuit created.
2. All interactions transit the circuit in real time.
3. Idle timeout (default 3 min of disconnection) → circuit destroyed, state lost.
4. Reconnect within timeout → circuit resumed (state intact).

**Scalability implications**
| Factor | Detail |
|---|---|
| Memory | Each circuit ≈ 250–500 KB server RAM + your component state |
| Connections | 5 000 users = 5 000 open WebSockets |
| Sticky sessions | Required for scale-out (Azure SignalR Service removes this need) |
| Cold disconnect | State lost; implement reconnect UI + storage fallback |

**Configuring circuit options**
\`\`\`csharp
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents(options =>
    {
        options.DisconnectedCircuitRetentionPeriod = TimeSpan.FromMinutes(5);
        options.MaxBufferedUnacknowledgedRenderBatches = 10;
    });

// Azure SignalR Service for scale-out
builder.Services.AddSignalR().AddAzureSignalR(connectionString);
\`\`\`

**Circuit events / handlers**
\`\`\`csharp
public class TelemetryCircuitHandler : CircuitHandler
{
    public override Task OnCircuitOpenedAsync(Circuit circuit, CancellationToken ct)
    {
        Console.WriteLine($"Circuit opened: {circuit.Id}");
        return Task.CompletedTask;
    }

    public override Task OnCircuitClosedAsync(Circuit circuit, CancellationToken ct)
    {
        Console.WriteLine($"Circuit closed: {circuit.Id}");
        return Task.CompletedTask;
    }
}

builder.Services.AddScoped<CircuitHandler, TelemetryCircuitHandler>();
\`\`\`

**Best practices**
- Offload long-running work to background services or queues.
- Keep circuit memory low — avoid storing large objects in components.
- Use Azure SignalR Service or Redis backplane for multi-instance deployments.`,
      tags: ["SignalR", "circuit", "scalability", "server"],
    },

    // ───── HARD ─────
    {
      id: "blazor-wasm-performance",
      title: "Blazor WASM performance: AOT and lazy loading",
      difficulty: "hard",
      question: "What techniques are available to improve Blazor WebAssembly startup and runtime performance? Cover AOT compilation and lazy assembly loading.",
      answer: `Blazor WASM performance is a multi-layer problem: **download size**, **startup time**, and **runtime throughput**.

---
### 1. AOT (Ahead-of-Time) compilation

Without AOT, the .NET interpreter runs IL inside WASM — ~2–3× slower than native code.
AOT compiles IL → WASM ahead of time, trading larger download for faster execution.

\`\`\`xml
<!-- .csproj -->
<PropertyGroup>
    <RunAOTCompilation>true</RunAOTCompilation>
</PropertyGroup>
\`\`\`

| | Interpreter | AOT |
|---|---|---|
| Publish size | ~2 MB compressed | ~10 MB+ compressed |
| Startup | Faster | Slightly slower (more WASM to parse) |
| Runtime | Slower | 2–10× faster |

Use AOT for compute-heavy apps (image processing, simulations). Avoid for CRUD apps where download size matters more.

---
### 2. Lazy loading assemblies

Split assemblies into groups, download only what the user navigates to.

\`\`\`xml
<!-- .csproj — mark assemblies as lazy -->
<ItemGroup>
    <BlazorWebAssemblyLazyLoad Include="HeavyFeature.dll" />
    <BlazorWebAssemblyLazyLoad Include="ChartLibrary.dll" />
</ItemGroup>
\`\`\`

\`\`\`csharp
// Program.cs
builder.Services.AddScoped<LazyAssemblyLoader>();

// Router in App.razor
@inject LazyAssemblyLoader Loader

<Router AppAssembly="typeof(App).Assembly"
        AdditionalAssemblies="lazyAssemblies"
        OnNavigateAsync="OnNavigateAsync">
    ...
</Router>

@code {
    private List<Assembly> lazyAssemblies = new();

    async Task OnNavigateAsync(NavigationContext ctx)
    {
        if (ctx.Path.StartsWith("charts"))
        {
            var loaded = await Loader.LoadAssembliesAsync(
                new[] { "ChartLibrary.dll" });
            lazyAssemblies.AddRange(loaded);
        }
    }
}
\`\`\`

---
### 3. Trimming and compression

\`\`\`xml
<PublishTrimmed>true</PublishTrimmed>
<TrimMode>link</TrimMode>
\`\`\`
Enable Brotli static compression on the CDN/server — Blazor WASM assets ship pre-compressed.

---
### 4. Runtime configuration

\`\`\`json
// wwwroot/appsettings.json
{
  "Blazor": {
    "startupMemory": "small"   // reduces initial heap
  }
}
\`\`\`

---
### 5. Component-level rendering discipline

\`\`\`csharp
// Prevent re-render when inputs unchanged
protected override bool ShouldRender() => isDirty;

// Virtualize large lists
<Virtualize Items="bigList" Context="item">
    <ItemContent><Row Item="item" /></ItemContent>
</Virtualize>
\`\`\`

---
### Checklist
- [ ] Enable Brotli compression on server
- [ ] Lazy-load large feature assemblies
- [ ] AOT only for compute-heavy workloads
- [ ] Use \`Virtualize\` for long lists
- [ ] \`ShouldRender\` overrides on hot components
- [ ] Measure with browser DevTools → WASM tab`,
      tags: ["performance", "AOT", "lazy-loading", "wasm", "trimming"],
    },
    {
      id: "blazor-render-modes-deep",
      title: "Render mode selection strategy",
      difficulty: "hard",
      question: "How do you decide which render mode to use for each part of a .NET 9 Blazor app? Walk through the trade-offs and show how to mix modes in one app.",
      answer: `In .NET 9 Blazor United you can set the render mode **globally** (on \`MapRazorComponents\`) or **per-component/page** using the \`@rendermode\` directive. Getting the mix right is key to performance and UX.

---
### Decision tree

\`\`\`
Does the component need interactivity?
├─ No  → Static SSR (default) — fastest, SEO-perfect, no JS overhead
└─ Yes → Does it need real-time server events / direct DB?
    ├─ Yes → Interactive Server (SignalR)
    └─ No  → Is initial load time critical?
        ├─ Yes → Interactive WASM (cached runtime, offline)
        └─ Both matter → Auto (Server first, WASM after cache)
\`\`\`

---
### App.razor — enable all modes
\`\`\`csharp
// Program.cs
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents()
    .AddInteractiveWebAssemblyComponents();

app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode()
    .AddInteractiveWebAssemblyRenderMode()
    .AddAdditionalAssemblies(typeof(Client.App).Assembly);
\`\`\`

---
### Page-level assignment
\`\`\`razor
@* Marketing home page — static, SEO, fast *@
@page "/"
@* No @rendermode = Static SSR *@

@* Dashboard — needs live data, charts *@
@page "/dashboard"
@rendermode InteractiveServer

@* Offline-capable tool *@
@page "/calculator"
@rendermode InteractiveWebAssembly

@* Best of both worlds *@
@page "/editor"
@rendermode InteractiveAuto
\`\`\`

---
### Island architecture — static page + interactive component
\`\`\`razor
@* /products — Static SSR for SEO, fast first paint *@
@page "/products/{id:int}"
@attribute [StreamRendering]

<ProductDetails Product="product" />   @* pure HTML, no circuit *@

@* Just this widget is interactive *@
<AddToCartWidget ProductId="@Id" @rendermode="InteractiveServer" />

@code {
    [Parameter] public int Id { get; set; }
    private Product? product;
    protected override async Task OnInitializedAsync()
        => product = await Products.GetAsync(Id);
}
\`\`\`

---
### Constraints when mixing modes
- A child component **cannot** have a more-capable render mode than its parent (e.g., an Interactive Server child inside a Static SSR parent requires a render mode boundary).
- Render mode boundaries create independent component subtrees; they cannot share object references across the boundary — only serialisable parameters.
- Services shared between Server and WASM must be available in both the server project and the Client (WASM) project.

---
### Render mode boundaries and prerendering
\`\`\`csharp
// Disable prerendering for a component (avoids double-execution)
@rendermode @(new InteractiveServerRenderMode(prerender: false))
\`\`\`
Prerendering is enabled by default and produces static HTML for fast perceived load; the interactive circuit then hydrates it.`,
      tags: ["render-modes", "island-architecture", "SSR", "auto", "prerendering"],
    },
    {
      id: "blazor-testing-bunit",
      title: "Testing Blazor components with bUnit",
      difficulty: "hard",
      question: "How do you unit-test Blazor components with bUnit? Show how to render components, supply parameters and services, trigger events, and assert output.",
      answer: `**bUnit** is the standard testing library for Blazor components. It renders components in a simulated Blazor environment using \`xUnit\`, \`NUnit\`, or \`MSTest\`.

---
### Setup
\`\`\`xml
<!-- test .csproj -->
<PackageReference Include="bunit" Version="1.*" />
<PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.*" />
<PackageReference Include="xunit" Version="2.*" />
\`\`\`

---
### Basic render and assert
\`\`\`csharp
using Bunit;
using Xunit;

public class CounterTests : TestContext   // TestContext is bUnit's base
{
    [Fact]
    public void Counter_StartsAtZero()
    {
        var cut = RenderComponent<Counter>();
        cut.Find("h1").TextContent.Should().Be("Count: 0");
    }

    [Fact]
    public void Counter_IncrementsOnClick()
    {
        var cut = RenderComponent<Counter>();
        cut.Find("button").Click();
        cut.Find("h1").TextContent.Should().Be("Count: 1");
    }
}
\`\`\`

---
### Supplying parameters
\`\`\`csharp
[Fact]
public void ProductCard_ShowsName()
{
    var product = new Product { Id = 1, Name = "Widget" };

    var cut = RenderComponent<ProductCard>(p =>
        p.Add(c => c.Product, product)
         .Add(c => c.OnSelected, EventCallback.Empty));

    cut.Find(".product-name").TextContent.Should().Be("Widget");
}
\`\`\`

---
### Mocking services
\`\`\`csharp
[Fact]
public async Task ProductList_LoadsAndRendersItems()
{
    // Arrange — register mock service
    var mockService = Substitute.For<IProductService>();  // NSubstitute
    mockService.GetAllAsync().Returns(new List<Product>
    {
        new() { Id = 1, Name = "Alpha" },
        new() { Id = 2, Name = "Beta" },
    });
    Services.AddSingleton(mockService);

    // Act
    var cut = RenderComponent<ProductList>();
    await cut.InvokeAsync(() => Task.CompletedTask);  // let async complete

    // Assert
    cut.FindAll(".product-item").Count.Should().Be(2);
}
\`\`\`

---
### Testing EventCallback
\`\`\`csharp
[Fact]
public void DeleteButton_RaisesEvent()
{
    int deletedId = 0;
    var cut = RenderComponent<ProductRow>(p =>
        p.Add(c => c.ProductId, 42)
         .Add(c => c.OnDelete, id => deletedId = id));

    cut.Find("[data-action='delete']").Click();

    deletedId.Should().Be(42);
}
\`\`\`

---
### Testing with AuthenticationState
\`\`\`csharp
[Fact]
public void AdminPanel_VisibleForAdmin()
{
    var authContext = this.AddTestAuthorization();
    authContext.SetAuthorized("Alice", AuthorizationState.Authorized);
    authContext.SetRoles("Admin");

    var cut = RenderComponent<AdminPanel>();
    cut.Find(".admin-only").Should().NotBeNull();
}
\`\`\`

---
### Best practices
- Prefer **white-box** tests (assert on rendered HTML, not component internals).
- Use \`WaitForAssertion\` for async state changes: \`cut.WaitForAssertion(() => cut.Find(".loaded").Should().NotBeNull());\`
- Test components in isolation; mock all external services via \`Services\`.
- Snapshot tests (\`cut.MarkupMatches(...)\`) catch regressions.`,
      tags: ["testing", "bUnit", "xUnit", "mocking", "components"],
    },
    {
      id: "blazor-advanced-patterns",
      title: "Advanced component patterns",
      difficulty: "hard",
      question: "Describe advanced Blazor component patterns: generic components, RenderFragment, templated components, and dynamic component rendering.",
      answer: `---
### 1. RenderFragment — slot-based composition
\`\`\`razor
@* Card.razor — accepts child content and a header slot *@
<div class="card">
    <div class="card-header">@Header</div>
    <div class="card-body">@ChildContent</div>
</div>

@code {
    [Parameter] public RenderFragment? Header { get; set; }
    [Parameter] public RenderFragment? ChildContent { get; set; }
}

@* Usage *@
<Card>
    <Header><h2>Title</h2></Header>
    Widget body here.
</Card>
\`\`\`

---
### 2. Templated (generic) components
\`\`\`razor
@* DataGrid.razor *@
@typeparam TItem

<table>
    @foreach (var item in Items)
    {
        <tr>@RowTemplate(item)</tr>
    }
</table>

@code {
    [Parameter, EditorRequired] public IReadOnlyList<TItem> Items { get; set; } = [];
    [Parameter, EditorRequired] public RenderFragment<TItem> RowTemplate { get; set; } = default!;
}

@* Usage *@
<DataGrid Items="products">
    <RowTemplate Context="p">
        <td>@p.Name</td><td>@p.Price</td>
    </RowTemplate>
</DataGrid>
\`\`\`
The compiler infers \`TItem = Product\` from the \`Items\` parameter.

---
### 3. DynamicComponent — runtime component selection
\`\`\`razor
@* Renders a component type chosen at runtime *@
<DynamicComponent Type="currentWidgetType"
                  Parameters="widgetParams" />

@code {
    private Type currentWidgetType = typeof(BarChart);

    private Dictionary<string, object?> widgetParams = new()
    {
        [nameof(BarChart.Data)] = myData,
        [nameof(BarChart.Title)] = "Sales",
    };

    void SwitchToLine()
    {
        currentWidgetType = typeof(LineChart);
        widgetParams[nameof(LineChart.Data)] = myData;
    }
}
\`\`\`

---
### 4. Component references and public API
\`\`\`razor
<DataGrid @ref="gridRef" Items="items" />
<button @onclick="() => gridRef!.Refresh()">Reload</button>

@code {
    private DataGrid<Product>? gridRef;
}
\`\`\`
\`@ref\` gives you a typed reference to call public methods on child components.

---
### 5. Custom render modes as components
\`\`\`csharp
// Define a named render mode constant
public static class RenderModes
{
    public static readonly IComponentRenderMode InteractiveAutoNoPrerender
        = new InteractiveAutoRenderMode(prerender: false);
}
\`\`\`
\`\`\`razor
<HeavyWidget @rendermode="RenderModes.InteractiveAutoNoPrerender" />
\`\`\`

---
### 6. ErrorBoundary — isolate rendering failures
\`\`\`razor
<ErrorBoundary>
    <ChildContent>
        <RiskyComponent />
    </ChildContent>
    <ErrorContent Context="ex">
        <p>Something went wrong: @ex.Message</p>
    </ErrorContent>
</ErrorBoundary>
\`\`\`

---
### Key rules
- Generic components need \`@typeparam T\` and may add constraints: \`@typeparam T where T : IEntity\`.
- \`RenderFragment<T>\` is a \`Func<T, RenderFragment>\` — call it like a method in C# code.
- Avoid \`RenderFragment\` parameters marked \`[Parameter]\` being stored and called outside the render cycle — it violates Blazor's threading model.`,
      tags: ["RenderFragment", "generic-components", "DynamicComponent", "ErrorBoundary", "patterns"],
    },
    {
      id: "blazor-ssr-hybrid-architecture",
      title: "Full-stack Blazor United architecture",
      difficulty: "hard",
      question: "How do you architect a production .NET 9 Blazor United app that shares code between server and WASM, handles render-mode boundaries correctly, and integrates EF Core with SSR forms?",
      answer: `A production Blazor United solution typically uses a **three-project layout**:

\`\`\`
Solution/
├── MyApp.Web/          ← ASP.NET Core host (Server-side rendering + API)
├── MyApp.Client/       ← Blazor WASM project (interactive client components)
└── MyApp.Shared/       ← DTOs, interfaces, data annotations (shared by both)
\`\`\`

---
### Program.cs (Web host)
\`\`\`csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(o =>
    o.UseNpgsql(builder.Configuration.GetConnectionString("Db")));

builder.Services.AddScoped<IProductService, ProductService>();  // server-side

builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents()
    .AddInteractiveWebAssemblyComponents();

var app = builder.Build();

app.UseStaticFiles();
app.UseAntiforgery();

app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode()
    .AddInteractiveWebAssemblyRenderMode()
    .AddAdditionalAssemblies(typeof(MyApp.Client.App).Assembly);

// Minimal API for WASM to call
app.MapGroup("/api/products").MapProductEndpoints();

app.Run();
\`\`\`

---
### Sharing interfaces across projects
\`\`\`csharp
// MyApp.Shared/IProductService.cs
public interface IProductService
{
    Task<List<ProductDto>> GetAllAsync();
    Task<ProductDto?> GetAsync(int id);
}

// MyApp.Web — real EF Core implementation
public class ProductService(AppDbContext db) : IProductService { ... }

// MyApp.Client — HTTP implementation
public class ProductApiClient(HttpClient http) : IProductService
{
    public Task<List<ProductDto>> GetAllAsync()
        => http.GetFromJsonAsync<List<ProductDto>>("/api/products")!;
}
\`\`\`

Register differently per project:
\`\`\`csharp
// Web/Program.cs
builder.Services.AddScoped<IProductService, ProductService>();

// Client/Program.cs
builder.Services.AddScoped<IProductService, ProductApiClient>();
\`\`\`

---
### SSR form with EF Core (no circuit needed)
\`\`\`razor
@* CreateProduct.razor — Web project *@
@page "/admin/products/new"
@inject AppDbContext Db
@inject NavigationManager Nav

<EditForm Model="model" OnValidSubmit="Save" FormName="create-product" method="post">
    <DataAnnotationsValidator />
    <InputText @bind-Value="model.Name" />
    <InputNumber @bind-Value="model.Price" />
    <button type="submit">Save</button>
</EditForm>

@code {
    [SupplyParameterFromForm] private CreateProductModel model { get; set; } = new();

    private async Task Save()
    {
        Db.Products.Add(new Product { Name = model.Name, Price = model.Price });
        await Db.SaveChangesAsync();
        Nav.NavigateTo("/admin/products");
    }
}
\`\`\`
This is pure HTTP POST — no WebSocket, no WASM. The anti-forgery token is automatically validated by \`UseAntiforgery()\`.

---
### Render-mode boundaries and serialisation
Parameters crossing a render-mode boundary **must be serialisable** (JSON):
\`\`\`razor
@* Static SSR parent passes primitive to interactive child *@
<InteractiveChart ProductId="@product.Id" @rendermode="InteractiveServer" />
@*                ^^^^^^^^^^^^^^^^^^^^^ int — serialisable ✓ *@

@* WRONG — passes object reference across boundary *@
<InteractiveChart Product="@product" @rendermode="InteractiveServer" />
@*                ^^^^^^^^^^^^^^^ complex object — may work but avoid it *@
\`\`\`

---
### Deployment topology
\`\`\`
CDN  →  Static assets (WASM DLLs, css, js)
     →  ASP.NET Core app (Kestrel behind nginx / Azure App Service)
         ├── Static SSR pages
         ├── SignalR circuits
         ├── Minimal API (/api/**)
         └── Azure SignalR Service (scale-out)
\`\`\`

Key concerns: sticky sessions (or Azure SignalR Service), EF Core connection pooling under circuit load, antiforgery middleware ordering (\`UseAntiforgery\` must come before \`MapRazorComponents\`).`,
      tags: ["architecture", "blazor-united", "EF-Core", "SSR-forms", "shared-project"],
    },
    {
      id: "blazor-custom-auth-state",
      title: "Custom AuthenticationStateProvider deep dive",
      difficulty: "hard",
      question: "Implement a robust custom AuthenticationStateProvider for a Blazor WASM app that reads a JWT from memory, refreshes tokens proactively, and integrates with PersistentComponentState for SSR prerendering.",
      answer: `A production-grade WASM auth provider must handle: token storage, proactive refresh, SSR→WASM state hand-off, and reactive UI updates.

---
### Token storage (in-memory for security)
\`\`\`csharp
// TokenStore.cs — Scoped, lives in WASM memory only
public class TokenStore
{
    public string? AccessToken { get; private set; }
    public DateTimeOffset Expiry { get; private set; }

    public void Set(string token, DateTimeOffset expiry)
    {
        AccessToken = token;
        Expiry = expiry;
    }

    public bool IsExpiringSoon()
        => AccessToken is not null && Expiry - DateTimeOffset.UtcNow < TimeSpan.FromMinutes(1);

    public void Clear() { AccessToken = null; Expiry = default; }
}
\`\`\`

---
### AuthenticationStateProvider
\`\`\`csharp
public class JwtAuthStateProvider : AuthenticationStateProvider, IDisposable
{
    private readonly TokenStore _store;
    private readonly IAuthApi _authApi;
    private readonly ILogger<JwtAuthStateProvider> _log;
    private Timer? _refreshTimer;

    public JwtAuthStateProvider(TokenStore store, IAuthApi authApi,
        ILogger<JwtAuthStateProvider> log)
    {
        _store = store; _authApi = authApi; _log = log;
    }

    public override Task<AuthenticationState> GetAuthenticationStateAsync()
    {
        if (string.IsNullOrEmpty(_store.AccessToken))
            return Task.FromResult(Anonymous());

        ClaimsIdentity identity;
        try
        {
            var claims = JwtParser.Parse(_store.AccessToken);
            identity = new ClaimsIdentity(claims, "jwt");
        }
        catch
        {
            return Task.FromResult(Anonymous());
        }

        return Task.FromResult(new AuthenticationState(new ClaimsPrincipal(identity)));
    }

    public async Task LoginAsync(string username, string password)
    {
        var response = await _authApi.LoginAsync(new LoginRequest(username, password));
        _store.Set(response.AccessToken, response.Expiry);
        ScheduleRefresh(response.Expiry);
        NotifyAuthenticationStateChanged(GetAuthenticationStateAsync());
    }

    public void Logout()
    {
        _store.Clear();
        _refreshTimer?.Dispose();
        NotifyAuthenticationStateChanged(Task.FromResult(Anonymous()));
    }

    private void ScheduleRefresh(DateTimeOffset expiry)
    {
        _refreshTimer?.Dispose();
        var delay = expiry - DateTimeOffset.UtcNow - TimeSpan.FromMinutes(1);
        if (delay <= TimeSpan.Zero) delay = TimeSpan.Zero;

        _refreshTimer = new Timer(async _ =>
        {
            try
            {
                var response = await _authApi.RefreshAsync();
                _store.Set(response.AccessToken, response.Expiry);
                ScheduleRefresh(response.Expiry);
                NotifyAuthenticationStateChanged(GetAuthenticationStateAsync());
            }
            catch (Exception ex)
            {
                _log.LogWarning(ex, "Token refresh failed — logging out");
                Logout();
            }
        }, null, delay, Timeout.InfiniteTimeSpan);
    }

    private static AuthenticationState Anonymous()
        => new(new ClaimsPrincipal(new ClaimsIdentity()));

    public void Dispose() => _refreshTimer?.Dispose();
}
\`\`\`

---
### SSR → WASM state hand-off with PersistentComponentState
\`\`\`razor
@* PersistAuth.razor — rendered on server, persists claims for WASM *@
@inject PersistentComponentState State
@inject AuthenticationStateProvider AuthProvider
@implements IDisposable

@code {
    private PersistingComponentStateSubscription _sub;

    protected override async Task OnInitializedAsync()
    {
        _sub = State.RegisterOnPersisting(Persist);
        var authState = await AuthProvider.GetAuthenticationStateAsync();
        // We persist minimal claims only
    }

    private Task Persist()
    {
        // Store serialisable user info
        State.PersistAsJson("auth-user", currentUserDto);
        return Task.CompletedTask;
    }

    public void Dispose() => _sub.Dispose();
}
\`\`\`

\`\`\`csharp
// On WASM startup — read persisted state before first render
protected override async Task OnInitializedAsync()
{
    if (State.TryTakeFromJson<UserDto>("auth-user", out var user) && user is not null)
    {
        // Restore auth state from SSR-persisted data without a login round-trip
        _store.Set(user.Token, user.Expiry);
        NotifyAuthenticationStateChanged(GetAuthenticationStateAsync());
    }
}
\`\`\`

---
### Registration
\`\`\`csharp
// Client/Program.cs
builder.Services.AddAuthorizationCore();
builder.Services.AddCascadingAuthenticationState();
builder.Services.AddSingleton<TokenStore>();
builder.Services.AddScoped<JwtAuthStateProvider>();
builder.Services.AddScoped<AuthenticationStateProvider>(
    sp => sp.GetRequiredService<JwtAuthStateProvider>());
\`\`\`

\`AddCascadingAuthenticationState()\` (.NET 8+) replaces the manual \`<CascadingAuthenticationState>\` wrapper in \`App.razor\`.`,
      tags: ["auth", "JWT", "AuthenticationStateProvider", "PersistentComponentState", "token-refresh"],
    },
  ],
};
