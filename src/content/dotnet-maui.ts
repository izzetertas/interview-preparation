import type { Category } from "./types";

export const dotnetMaui: Category = {
  slug: "dotnet-maui",
  title: ".NET MAUI",
  description:
    ".NET MAUI (.NET 9): cross-platform mobile and desktop development with a single project, XAML, MVVM, Shell navigation, handlers, dependency injection, platform-specific code, SQLite, HTTP, Blazor hybrid, and performance.",
  icon: "📱",
  questions: [
    // ───── EASY ─────
    {
      id: "maui-what-is",
      title: "What is .NET MAUI?",
      difficulty: "easy",
      question: "What is .NET MAUI and which platforms does it target?",
      answer: `**.NET MAUI** (Multi-platform App UI) is Microsoft's cross-platform framework for building native mobile and desktop apps from a **single C# and XAML codebase**.

**Supported targets (as of .NET 9)**
| Platform | Notes |
|---|---|
| Android | API 21 + |
| iOS | 15 + |
| macOS | via Mac Catalyst 15 + |
| Windows | WinUI 3 |

**.NET MAUI is the evolution of Xamarin.Forms** — same XAML/MVVM model, but redesigned internals: single project, handlers instead of renderers, and full integration with the .NET 9 SDK.

\`\`\`bash
# Create a new MAUI app (requires .NET 9 SDK + workloads)
dotnet workload install maui
dotnet new maui -n MyApp
dotnet build -t:Run -f net9.0-android
\`\`\`

> **Key differentiator:** one \`.csproj\`, one \`App.xaml\`, one set of business logic — the build system picks the right platform target.`,
      tags: ["fundamentals"],
    },
    {
      id: "maui-vs-xamarin-forms",
      title: ".NET MAUI vs Xamarin.Forms",
      difficulty: "easy",
      question: "What are the main differences between .NET MAUI and Xamarin.Forms?",
      answer: `**.NET MAUI** replaces Xamarin.Forms with a cleaner architecture and better defaults.

| Aspect | Xamarin.Forms | .NET MAUI |
|---|---|---|
| Project structure | Separate iOS/Android/UWP projects | **Single project** (multi-targeting) |
| Platform abstraction | **Custom Renderers** | **Handlers** (lighter, faster) |
| .NET runtime | Mono | **.NET 9** (same CLR as server) |
| Startup | \`App.xaml.cs\` + \`Startup.cs\` | \`MauiProgram.cs\` (DI host) |
| Dependency injection | Manual / Prism | **Built-in** via \`Microsoft.Extensions.DependencyInjection\` |
| Desktop support | Limited UWP | Windows + macOS first-class |
| Asset management | Per-project assets | **Single images folder** (auto-resized) |
| CSS styling | Partial | Supported |

**MauiProgram.cs bootstrap**
\`\`\`csharp
var builder = MauiApp.CreateBuilder();
builder
    .UseMauiApp<App>()
    .ConfigureFonts(fonts =>
    {
        fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
    });

builder.Services.AddSingleton<MainPage>();
builder.Services.AddSingleton<MainViewModel>();

return builder.Build();
\`\`\``,
      tags: ["fundamentals", "xamarin"],
    },
    {
      id: "maui-project-structure",
      title: "MAUI project structure",
      difficulty: "easy",
      question: "Describe the single-project structure of a .NET MAUI application.",
      answer: `A MAUI app lives in **one \`.csproj\`** that multi-targets all platforms.

\`\`\`
MyApp/
├── Platforms/
│   ├── Android/          # AndroidManifest.xml, MainActivity.cs
│   ├── iOS/              # Info.plist, AppDelegate.cs
│   ├── MacCatalyst/      # Info.plist
│   └── Windows/          # Package.appxmanifest, App.xaml
├── Resources/
│   ├── AppIcon/          # Single source icon (auto-resized)
│   ├── Fonts/
│   ├── Images/           # Single-resolution source images
│   ├── Raw/              # Files copied verbatim
│   └── Splash/           # Splash screen
├── App.xaml / App.xaml.cs
├── AppShell.xaml / AppShell.xaml.cs
├── MainPage.xaml / MainPage.xaml.cs
└── MauiProgram.cs         # DI host entry point
\`\`\`

**Key points**
- \`Platforms/\` folders hold anything that **must** differ per platform (manifests, native entry points).
- Everything outside \`Platforms/\` is **shared** code compiled for every target.
- \`Resources/Images\` images are declared once; the build generates all required densities automatically (mdpi, hdpi, xhdpi … for Android; @1x, @2x, @3x for iOS).
- \`MauiProgram.cs\` is the single entry point — the platform-specific \`MainActivity\` / \`AppDelegate\` just call into it.`,
      tags: ["project-structure"],
    },
    {
      id: "maui-xaml-basics",
      title: "XAML basics in MAUI",
      difficulty: "easy",
      question: "What is XAML and how is it used in .NET MAUI?",
      answer: `**XAML** (eXtensible Application Markup Language) is an XML-based language used to declare UI in .NET MAUI. Each \`.xaml\` file has a paired \`.xaml.cs\` **code-behind**.

\`\`\`xml
<!-- MainPage.xaml -->
<?xml version="1.0" encoding="utf-8" ?>
<ContentPage xmlns="http://schemas.microsoft.com/dotnet/2021/maui"
             xmlns:x="http://schemas.microsoft.com/winfx/2009/xaml"
             x:Class="MyApp.MainPage"
             Title="Home">

    <VerticalStackLayout Padding="16" Spacing="12">
        <Label Text="Hello, MAUI!"
               FontSize="24"
               HorizontalOptions="Center" />

        <Entry x:Name="NameEntry"
               Placeholder="Enter your name" />

        <Button Text="Greet"
                Clicked="OnGreetClicked" />
    </VerticalStackLayout>
</ContentPage>
\`\`\`

\`\`\`csharp
// MainPage.xaml.cs
public partial class MainPage : ContentPage
{
    public MainPage() => InitializeComponent();

    private void OnGreetClicked(object sender, EventArgs e)
    {
        DisplayAlert("Hi", $"Hello, {NameEntry.Text}!", "OK");
    }
}
\`\`\`

**XAML namespaces**
| Prefix | URI | Purpose |
|---|---|---|
| *(default)* | \`http://schemas.microsoft.com/dotnet/2021/maui\` | MAUI controls |
| \`x:\` | \`http://schemas.microsoft.com/winfx/2009/xaml\` | XAML language (x:Class, x:Name, x:Key…) |
| \`local:\` | \`clr-namespace:MyApp\` | Your own classes |

> **Tip:** \`InitializeComponent()\` is generated by the XAML build task — always call it first in the constructor.`,
      tags: ["xaml", "fundamentals"],
    },
    {
      id: "maui-data-binding",
      title: "Data binding",
      difficulty: "easy",
      question: "Explain one-way and two-way data binding in .NET MAUI XAML.",
      answer: `Data binding connects a UI property to a source property (usually a ViewModel) so changes propagate automatically.

**Binding modes**
| Mode | Direction | Use case |
|---|---|---|
| \`OneWay\` | Source → Target | Read-only display |
| \`TwoWay\` | Source ↔ Target | Editable inputs |
| \`OneWayToSource\` | Target → Source | Rare; target drives source |
| \`OneTime\` | Source → Target (once) | Static data |

\`\`\`xml
<ContentPage xmlns="http://schemas.microsoft.com/dotnet/2021/maui"
             x:Class="MyApp.MainPage"
             BindingContext="{Binding Source={x:Static local:App.Current},
                                     Path=MainViewModel}">

    <!-- OneWay: ViewModel.UserName → Label.Text -->
    <Label Text="{Binding UserName, Mode=OneWay}" />

    <!-- TwoWay: Entry.Text ↔ ViewModel.SearchQuery -->
    <Entry Text="{Binding SearchQuery, Mode=TwoWay}" />

    <!-- Default: Button.Command is OneWay by default -->
    <Button Text="Search" Command="{Binding SearchCommand}" />
</ContentPage>
\`\`\`

**Setting BindingContext**
\`\`\`csharp
// Code-behind approach
public MainPage(MainViewModel vm)
{
    InitializeComponent();
    BindingContext = vm;
}
\`\`\`

For binding to work the source must implement **\`INotifyPropertyChanged\`** (or use \`CommunityToolkit.Mvvm\`).`,
      tags: ["data-binding", "xaml"],
    },
    {
      id: "maui-inotifyproperty",
      title: "INotifyPropertyChanged",
      difficulty: "easy",
      question: "What is INotifyPropertyChanged and why is it needed in MAUI?",
      answer: `**\`INotifyPropertyChanged\`** is a .NET interface with one event — \`PropertyChanged\` — that signals the UI binding system when a property value changes.

Without it, the UI renders the initial value and never updates even if the backing field changes.

**Manual implementation**
\`\`\`csharp
public class MainViewModel : INotifyPropertyChanged
{
    public event PropertyChangedEventHandler? PropertyChanged;

    private string _name = string.Empty;
    public string Name
    {
        get => _name;
        set
        {
            if (_name == value) return;
            _name = value;
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(Name)));
        }
    }
}
\`\`\`

**CommunityToolkit.Mvvm approach (recommended, .NET 9)**
\`\`\`csharp
using CommunityToolkit.Mvvm.ComponentModel;

[ObservableObject]              // generates INotifyPropertyChanged
public partial class MainViewModel
{
    [ObservableProperty]        // generates Name property + OnNameChanged hook
    private string _name = string.Empty;
}
\`\`\`

The source generator produces identical boilerplate code at compile time — zero runtime overhead.`,
      tags: ["mvvm", "data-binding"],
    },
    {
      id: "maui-shell-navigation",
      title: "Shell navigation",
      difficulty: "easy",
      question: "What is Shell in .NET MAUI and how do you navigate between pages?",
      answer: `**Shell** is MAUI's high-level navigation host that provides flyout menus, tab bars, and URI-based routing with minimal code.

**AppShell.xaml**
\`\`\`xml
<Shell xmlns="http://schemas.microsoft.com/dotnet/2021/maui"
       xmlns:x="http://schemas.microsoft.com/winfx/2009/xaml"
       xmlns:views="clr-namespace:MyApp.Views"
       x:Class="MyApp.AppShell">

    <TabBar>
        <ShellContent Title="Home"
                      Icon="home.png"
                      ContentTemplate="{DataTemplate views:HomePage}" />
        <ShellContent Title="Settings"
                      Icon="settings.png"
                      ContentTemplate="{DataTemplate views:SettingsPage}" />
    </TabBar>
</Shell>
\`\`\`

**Register routes and navigate**
\`\`\`csharp
// AppShell.xaml.cs constructor
Routing.RegisterRoute("details", typeof(DetailsPage));

// Navigate (anywhere in the app)
await Shell.Current.GoToAsync("details");

// Pass parameters
await Shell.Current.GoToAsync($"details?id={item.Id}");

// Receive in target page
[QueryProperty(nameof(ItemId), "id")]
public partial class DetailsPage : ContentPage
{
    public string ItemId { get; set; } = string.Empty;
}

// Go back
await Shell.Current.GoToAsync("..");
\`\`\`

Shell handles the back stack, deep linking, and animated transitions automatically.`,
      tags: ["navigation", "shell"],
    },

    // ───── MEDIUM ─────
    {
      id: "maui-mvvm-toolkit",
      title: "MVVM with CommunityToolkit.Mvvm",
      difficulty: "medium",
      question: "Show how to build a ViewModel using CommunityToolkit.Mvvm with observable properties and relay commands.",
      answer: `**CommunityToolkit.Mvvm** (formerly MVVM Toolkit) ships source generators that eliminate boilerplate for \`INotifyPropertyChanged\` and \`ICommand\`.

\`\`\`bash
dotnet add package CommunityToolkit.Mvvm
\`\`\`

\`\`\`csharp
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;

namespace MyApp.ViewModels;

public partial class SearchViewModel : ObservableObject
{
    // ── Observable properties ────────────────────────────────────
    [ObservableProperty]
    [NotifyCanExecuteChangedFor(nameof(SearchCommand))]  // re-evaluates CanSearch
    private string _query = string.Empty;

    [ObservableProperty]
    private bool _isBusy;

    [ObservableProperty]
    private ObservableCollection<string> _results = [];

    private readonly ISearchService _searchService;

    public SearchViewModel(ISearchService searchService)
    {
        _searchService = searchService;
    }

    // ── Commands ─────────────────────────────────────────────────
    [RelayCommand(CanExecute = nameof(CanSearch))]
    private async Task SearchAsync(CancellationToken ct)
    {
        IsBusy = true;
        try
        {
            Results = new ObservableCollection<string>(
                await _searchService.SearchAsync(Query, ct));
        }
        finally
        {
            IsBusy = false;
        }
    }

    private bool CanSearch() => !string.IsNullOrWhiteSpace(Query);
}
\`\`\`

**Generated code (conceptually)**
- \`[ObservableProperty]\` → public \`Query\` property + \`OnQueryChanged\` partial method hook.
- \`[RelayCommand]\` → \`SearchCommand\` implementing \`IAsyncRelayCommand\`.

**XAML wiring**
\`\`\`xml
<Entry Text="{Binding Query, Mode=TwoWay}" />
<ActivityIndicator IsRunning="{Binding IsBusy}" />
<Button Text="Search"
        Command="{Binding SearchCommand}"
        IsEnabled="{Binding SearchCommand.CanExecute}" />
<CollectionView ItemsSource="{Binding Results}" />
\`\`\``,
      tags: ["mvvm", "community-toolkit"],
    },
    {
      id: "maui-handlers",
      title: "Handlers vs custom renderers",
      difficulty: "medium",
      question: "How do MAUI handlers differ from Xamarin.Forms custom renderers, and how do you customize a handler?",
      answer: `**Custom renderers** (Xamarin.Forms) wrap a native view in a full \`ViewRenderer<TView, TNative>\` subclass — heavy and tightly coupled.

**Handlers** (MAUI) use a **property mapper**: a dictionary that maps each cross-platform property to a small static method that applies it to the native view. Lighter, faster, and easier to override partially.

**Architecture**
\`\`\`
Cross-platform control (Entry)
        ↓
    IEntryHandler
        ↓ PropertyMapper
    MauiTextField (iOS)   |   AppCompatEditText (Android)
\`\`\`

**Customize handler globally (MauiProgram.cs)**
\`\`\`csharp
builder
    .UseMauiApp<App>()
    .ConfigureMauiHandlers(handlers =>
    {
        handlers.AddHandler<Entry, MyCustomEntryHandler>();
    });
\`\`\`

**Partial property override (no subclass needed)**
\`\`\`csharp
Microsoft.Maui.Handlers.EntryHandler.Mapper.AppendToMapping(
    nameof(IEntry.Text),
    (handler, view) =>
    {
#if ANDROID
        // Remove underline on Android
        handler.PlatformView.BackgroundTintList =
            Android.Content.Res.ColorStateList.ValueOf(Android.Graphics.Color.Transparent);
#endif
    });
\`\`\`

**Write a full custom handler**
\`\`\`csharp
#if IOS
using UIKit;
public class MyEntryHandler : EntryHandler
{
    protected override UITextField CreatePlatformView()
    {
        var field = base.CreatePlatformView();
        field.BorderStyle = UITextBorderStyle.RoundedRect;
        return field;
    }
}
#endif
\`\`\``,
      tags: ["handlers", "platform"],
    },
    {
      id: "maui-platform-code",
      title: "Platform-specific code",
      difficulty: "medium",
      question: "What are the three ways to write platform-specific code in .NET MAUI?",
      answer: `**.NET MAUI gives three patterns, each with different granularity.**

---

**1. Conditional compilation (\`#if\`)**
Fastest; use for small, self-contained snippets.
\`\`\`csharp
public void ConfigureStatusBar()
{
#if ANDROID
    Window.SetStatusBarColor(Android.Graphics.Color.Transparent);
#elif IOS
    UIKit.UIApplication.SharedApplication.StatusBarStyle =
        UIKit.UIStatusBarStyle.LightContent;
#endif
}
\`\`\`
Available symbols: \`ANDROID\`, \`IOS\`, \`MACCATALYST\`, \`WINDOWS\`.

---

**2. OnPlatform / OnIdiom (XAML)**
\`\`\`xml
<Label FontSize="{OnPlatform iOS=18, Android=16, Default=14}" />

<StackLayout Padding="{OnIdiom Phone='10,20', Tablet='20,40'}" />
\`\`\`

---

**3. Partial classes / partial methods**
Best for large, structured platform code — keeps files clean.

\`\`\`csharp
// PlatformService.cs  (shared)
public partial class PlatformService
{
    public partial string GetDeviceId();
}

// Platforms/Android/PlatformService.cs
public partial class PlatformService
{
    public partial string GetDeviceId() =>
        Android.Provider.Settings.Secure.GetString(
            Android.App.Application.Context.ContentResolver,
            Android.Provider.Settings.Secure.AndroidId) ?? string.Empty;
}

// Platforms/iOS/PlatformService.cs
public partial class PlatformService
{
    public partial string GetDeviceId() =>
        UIKit.UIDevice.CurrentDevice.IdentifierForVendor?.AsString() ?? string.Empty;
}
\`\`\``,
      tags: ["platform", "conditional-compilation"],
    },
    {
      id: "maui-dependency-injection",
      title: "Dependency injection in MAUI",
      difficulty: "medium",
      question: "How does dependency injection work in .NET MAUI and what lifetimes are available?",
      answer: `MAUI uses the same \`Microsoft.Extensions.DependencyInjection\` container as ASP.NET Core. Register services in **\`MauiProgram.cs\`** before calling \`builder.Build()\`.

**Lifetimes**
| Lifetime | Method | MAUI usage |
|---|---|---|
| Singleton | \`AddSingleton<T>\` | Services that hold global state (DB, HTTP client) |
| Transient | \`AddTransient<T>\` | Lightweight, stateless services |
| Scoped | \`AddScoped<T>\` | Per-navigation-scope (less common in mobile) |

\`\`\`csharp
// MauiProgram.cs
var builder = MauiApp.CreateBuilder();
builder.UseMauiApp<App>();

// Services
builder.Services.AddSingleton<IDatabase, SqliteDatabase>();
builder.Services.AddSingleton<HttpClient>(_ =>
    new HttpClient { BaseAddress = new Uri("https://api.example.com/") });

// ViewModels
builder.Services.AddTransient<MainViewModel>();
builder.Services.AddTransient<DetailsViewModel>();

// Pages — register as Transient so each navigation gets a fresh page
builder.Services.AddTransient<MainPage>();
builder.Services.AddTransient<DetailsPage>();
\`\`\`

**Constructor injection in a page**
\`\`\`csharp
public partial class MainPage : ContentPage
{
    public MainPage(MainViewModel vm)
    {
        InitializeComponent();
        BindingContext = vm;
    }
}
\`\`\`

**Resolve from Shell (navigate with DI)**
\`\`\`csharp
// Register route
Routing.RegisterRoute("details", typeof(DetailsPage));

// MAUI resolves DetailsPage + DetailsViewModel from the container
await Shell.Current.GoToAsync("details");
\`\`\``,
      tags: ["dependency-injection", "architecture"],
    },
    {
      id: "maui-collectionview-vs-listview",
      title: "CollectionView vs ListView",
      difficulty: "medium",
      question: "When should you use CollectionView instead of ListView in .NET MAUI?",
      answer: `**CollectionView** is the modern replacement for **ListView** in MAUI (and Xamarin.Forms 4+). Prefer it for all new code.

| Feature | ListView | CollectionView |
|---|---|---|
| Item separators | Built-in | Manual (via \`ItemSeparatorHeight\` or custom \`ItemTemplate\`) |
| Pull to refresh | \`IsPullToRefreshEnabled\` | Wrap in \`RefreshView\` |
| Header/Footer | \`Header\`/\`Footer\` properties | \`Header\`/\`Footer\` properties |
| Selection | Single only | Single, multiple, or none |
| Layout | Vertical list | Linear (H/V), Grid, custom |
| Context actions | \`ViewCell\` + \`ContextActions\` | SwipeView |
| Performance | ViewCell recycling | Better recycling, no ViewCell overhead |
| Groups | Yes | Yes (better API) |

**CollectionView example**
\`\`\`xml
<RefreshView Command="{Binding RefreshCommand}"
             IsRefreshing="{Binding IsRefreshing}">
    <CollectionView ItemsSource="{Binding Items}"
                    SelectionMode="Single"
                    SelectionChangedCommand="{Binding SelectItemCommand}"
                    SelectionChangedCommandParameter="{Binding SelectedItem, Source={RelativeSource Self}}">
        <CollectionView.ItemsLayout>
            <GridItemsLayout Orientation="Vertical" Span="2" />
        </CollectionView.ItemsLayout>
        <CollectionView.ItemTemplate>
            <DataTemplate x:DataType="model:Product">
                <SwipeView>
                    <SwipeView.RightItems>
                        <SwipeItem Text="Delete"
                                   BackgroundColor="Red"
                                   Command="{Binding Source={RelativeSource AncestorType={x:Type vm:MainViewModel}},
                                             Path=DeleteCommand}"
                                   CommandParameter="{Binding .}" />
                    </SwipeView.RightItems>
                    <Grid Padding="8">
                        <Label Text="{Binding Name}" />
                    </Grid>
                </SwipeView>
            </DataTemplate>
        </CollectionView.ItemTemplate>
    </CollectionView>
</RefreshView>
\`\`\``,
      tags: ["controls", "performance"],
    },
    {
      id: "maui-sqlite",
      title: "SQLite with sqlite-net",
      difficulty: "medium",
      question: "How do you integrate a local SQLite database in a .NET MAUI app using sqlite-net-pcl?",
      answer: `**sqlite-net-pcl** is the standard lightweight ORM for local SQLite storage in MAUI.

\`\`\`bash
dotnet add package sqlite-net-pcl
dotnet add package SQLitePCLRaw.bundle_green
\`\`\`

**Define a model**
\`\`\`csharp
using SQLite;

[Table("notes")]
public class Note
{
    [PrimaryKey, AutoIncrement]
    public int Id { get; set; }

    [MaxLength(100), NotNull]
    public string Title { get; set; } = string.Empty;

    public string Body { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
\`\`\`

**Database service**
\`\`\`csharp
public class NoteDatabase
{
    private readonly SQLiteAsyncConnection _db;

    public NoteDatabase()
    {
        var path = Path.Combine(
            FileSystem.AppDataDirectory, "notes.db3");
        _db = new SQLiteAsyncConnection(path,
            SQLiteOpenFlags.ReadWrite |
            SQLiteOpenFlags.Create |
            SQLiteOpenFlags.SharedCache);
    }

    public async Task InitAsync()
    {
        await _db.CreateTableAsync<Note>();
    }

    public Task<List<Note>> GetNotesAsync() =>
        _db.Table<Note>().OrderByDescending(n => n.CreatedAt).ToListAsync();

    public Task<int> SaveNoteAsync(Note note) =>
        note.Id == 0 ? _db.InsertAsync(note) : _db.UpdateAsync(note);

    public Task<int> DeleteNoteAsync(Note note) =>
        _db.DeleteAsync(note);
}
\`\`\`

**Register as singleton (MauiProgram.cs)**
\`\`\`csharp
builder.Services.AddSingleton<NoteDatabase>();
\`\`\`

> **Path note:** \`FileSystem.AppDataDirectory\` resolves to the platform-correct private app folder (no extra permissions needed).`,
      tags: ["sqlite", "storage"],
    },
    {
      id: "maui-httpclient",
      title: "HTTP calls with HttpClient",
      difficulty: "medium",
      question: "How do you make HTTP API calls in .NET MAUI and what platform-specific setup is needed?",
      answer: `Use \`System.Net.Http.HttpClient\` — the same as in any .NET app — but MAUI requires minor platform setup for **cleartext HTTP** and **SSL inspection**.

**Android: allow cleartext (debug only)**
\`\`\`xml
<!-- Platforms/Android/Resources/xml/network_security_config.xml -->
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">10.0.2.2</domain>
    </domain-config>
</network-security-config>
\`\`\`

**iOS: NSAppTransportSecurity (debug only)**
\`\`\`xml
<!-- Platforms/iOS/Info.plist -->
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsLocalNetworking</key>
    <true/>
</dict>
\`\`\`

**Service implementation**
\`\`\`csharp
public class WeatherService(HttpClient http)
{
    public async Task<WeatherDto?> GetWeatherAsync(string city,
        CancellationToken ct = default)
    {
        var response = await http.GetAsync(
            $"weather?city={Uri.EscapeDataString(city)}", ct);
        response.EnsureSuccessStatusCode();
        return await response.Content
            .ReadFromJsonAsync<WeatherDto>(ct);
    }
}
\`\`\`

**Register (MauiProgram.cs)**
\`\`\`csharp
builder.Services.AddHttpClient<WeatherService>(client =>
{
    client.BaseAddress = new Uri("https://api.weather.example.com/");
    client.DefaultRequestHeaders.Add("Accept", "application/json");
});
\`\`\`

> Use \`IHttpClientFactory\` / \`AddHttpClient<T>\` rather than \`new HttpClient()\` to avoid socket exhaustion.`,
      tags: ["http", "networking"],
    },
    {
      id: "maui-permissions",
      title: "Platform permissions",
      difficulty: "medium",
      question: "How do you request runtime permissions in .NET MAUI?",
      answer: `MAUI provides a cross-platform **\`Permissions\`** API in \`Microsoft.Maui.ApplicationModel\`.

**Common permission types**
\`\`\`csharp
Permissions.Camera
Permissions.Microphone
Permissions.LocationWhenInUse
Permissions.LocationAlways
Permissions.StorageRead / StorageWrite  // Android only
Permissions.Photos                       // iOS gallery
\`\`\`

**Check and request**
\`\`\`csharp
public async Task<bool> RequestCameraAsync()
{
    var status = await Permissions.CheckStatusAsync<Permissions.Camera>();

    if (status == PermissionStatus.Granted)
        return true;

    if (Permissions.ShouldShowRationale<Permissions.Camera>())
    {
        await Shell.Current.DisplayAlert(
            "Camera needed",
            "We need camera access to scan barcodes.",
            "OK");
    }

    status = await Permissions.RequestAsync<Permissions.Camera>();
    return status == PermissionStatus.Granted;
}
\`\`\`

**Platform manifests still required**

Android (\`AndroidManifest.xml\`):
\`\`\`xml
<uses-permission android:name="android.permission.CAMERA" />
\`\`\`

iOS (\`Info.plist\`):
\`\`\`xml
<key>NSCameraUsageDescription</key>
<string>To scan barcodes</string>
\`\`\`

> **Pattern:** always check before requesting; show rationale for permissions that users commonly deny; handle \`Denied\` state gracefully (guide user to Settings).`,
      tags: ["permissions", "platform"],
    },
    {
      id: "maui-app-lifecycle",
      title: "App lifecycle",
      difficulty: "medium",
      question: "Describe the .NET MAUI app lifecycle and how you hook into lifecycle events.",
      answer: `MAUI unifies platform lifecycle events through the **\`ILifecycleBuilder\`** API in \`MauiProgram.cs\`.

**Cross-platform window events (all platforms)**
\`\`\`csharp
// App.xaml.cs — override Window lifecycle
public partial class App : Application
{
    protected override Window CreateWindow(IActivationState? state)
    {
        var window = base.CreateWindow(state);

        window.Created    += (s, e) => Debug.WriteLine("Window created");
        window.Activated  += (s, e) => Debug.WriteLine("App foregrounded");
        window.Deactivated += (s, e) => Debug.WriteLine("App backgrounded");
        window.Stopped    += (s, e) => Debug.WriteLine("App stopped");
        window.Resumed    += (s, e) => Debug.WriteLine("App resumed");
        window.Destroying += (s, e) => Debug.WriteLine("App destroying");

        return window;
    }
}
\`\`\`

**Platform-specific lifecycle (MauiProgram.cs)**
\`\`\`csharp
builder.ConfigureLifecycleEvents(events =>
{
#if ANDROID
    events.AddAndroid(android => android
        .OnCreate((activity, bundle) =>
            Debug.WriteLine("Android OnCreate"))
        .OnResume(activity =>
            Debug.WriteLine("Android OnResume"))
        .OnPause(activity =>
            Debug.WriteLine("Android OnPause")));
#elif IOS
    events.AddIos(ios => ios
        .WillEnterForeground(app =>
            Debug.WriteLine("iOS WillEnterForeground"))
        .DidEnterBackground(app =>
            Debug.WriteLine("iOS DidEnterBackground")));
#endif
});
\`\`\`

**Lifecycle mapping**
| Event | Android | iOS |
|---|---|---|
| App launched | \`OnCreate\` | \`FinishedLaunching\` |
| Foregrounded | \`OnResume\` | \`WillEnterForeground\` |
| Backgrounded | \`OnPause\` | \`DidEnterBackground\` |
| Destroyed | \`OnDestroy\` | \`WillTerminate\` |`,
      tags: ["lifecycle"],
    },

    // ───── HARD ─────
    {
      id: "maui-blazor-hybrid",
      title: "MAUI Blazor Hybrid",
      difficulty: "hard",
      question: "What is a .NET MAUI Blazor Hybrid app, how does it work, and when should you choose it?",
      answer: `A **MAUI Blazor Hybrid** app hosts a **Blazor web UI** (Razor components) inside a \`BlazorWebView\` native control. The HTML renders in the platform's native WebView (WKWebView on iOS, WebView2 on Windows, Chromium on Android), but **Blazor runs on .NET — not in the browser**. There is no WebAssembly; JavaScript is only used for DOM bridging.

**Architecture**
\`\`\`
┌──────────────────────────────────────┐
│  .NET MAUI Shell                     │
│  ┌────────────────────────────────┐  │
│  │  BlazorWebView                 │  │
│  │  ┌──────────────────────────┐  │  │
│  │  │  Razor Components        │  │  │
│  │  │  (Counter.razor, etc.)   │  │  │
│  │  └──────────────────────────┘  │  │
│  │  Blazor runs on .NET runtime   │  │
│  └────────────────────────────────┘  │
│  Native MAUI pages alongside         │
└──────────────────────────────────────┘
\`\`\`

**Setup**
\`\`\`bash
dotnet new maui-blazor -n HybridApp
\`\`\`

\`\`\`csharp
// MauiProgram.cs
builder.Services.AddMauiBlazorWebView();
#if DEBUG
builder.Services.AddBlazorWebViewDeveloperTools();
#endif
\`\`\`

\`\`\`xml
<!-- MainPage.xaml -->
<BlazorWebView HostPage="wwwroot/index.html">
    <BlazorWebView.RootComponents>
        <RootComponent Selector="#app"
                       ComponentType="{x:Type local:Routes}" />
    </BlazorWebView.RootComponents>
</BlazorWebView>
\`\`\`

**Call native APIs from Razor**
\`\`\`razor
@inject IBatteryService Battery

<p>Level: @Battery.ChargeLevel</p>
\`\`\`
Register \`IBatteryService\` using the MAUI DI container — Blazor shares the same \`IServiceProvider\`.

**Choose Hybrid when:**
- You have an existing Blazor web app to reuse across mobile/desktop.
- Your team is stronger in HTML/CSS/Razor than XAML.
- You need rich HTML-based charts or editors in a native shell.

**Avoid when:** performance-critical UI (animations, camera viewfinders), or when offline-first native experience matters most.`,
      tags: ["blazor", "hybrid", "architecture"],
    },
    {
      id: "maui-compiled-bindings",
      title: "Compiled bindings and performance",
      difficulty: "hard",
      question: "What are compiled bindings in .NET MAUI, how do you enable them, and what other performance optimisations matter?",
      answer: `**Standard bindings** resolve property paths at runtime via reflection — slow on first hit and not AOT-friendly.
**Compiled bindings** resolve paths at compile time using generated code — faster, type-safe, and trim-safe.

**Enable with \`x:DataType\`**
\`\`\`xml
<CollectionView ItemsSource="{Binding Products}">
    <CollectionView.ItemTemplate>
        <!-- Declare the compile-time type here -->
        <DataTemplate x:DataType="model:Product">
            <Grid Padding="8">
                <!-- These are now compiled, not reflective -->
                <Label Text="{Binding Name}" />
                <Label Text="{Binding Price, StringFormat='{0:C}'}"
                       Grid.Column="1" />
            </Grid>
        </DataTemplate>
    </CollectionView.ItemTemplate>
</CollectionView>
\`\`\`

\`x:DataType\` can be set at any level; inner templates override outer ones.

**Other key performance tips**

| Tip | Why |
|---|---|
| \`x:DataType\` everywhere | Eliminates reflection in bindings |
| \`Shell ContentTemplate="{DataTemplate …}"\` | Pages are created lazily on first navigation |
| \`CollectionView\` over \`ListView\` | Better recycling, no \`ViewCell\` overhead |
| Keep \`ItemTemplate\` flat | Fewer layout passes; avoid deep nesting |
| \`CachingStrategy\` on image controls | Use \`FFImageLoading\` or \`ImageSource\` caching |
| Reduce \`BindableLayout\` in hot paths | \`CollectionView\` virtualises; \`BindableLayout\` does not |
| Enable NativeAOT / full trimming | \`<PublishAot>true</PublishAot>\` for iOS (requires .NET 9) |
| Avoid \`LayoutOptions.Fill\` overuse | Causes unnecessary measure passes |

**Enabling trimming (.csproj)**
\`\`\`xml
<PropertyGroup>
    <TrimMode>full</TrimMode>
    <PublishTrimmed>true</PublishTrimmed>
</PropertyGroup>
\`\`\`
Compiled bindings are **required** when trimming — reflective bindings break under full trim.`,
      tags: ["performance", "compiled-bindings"],
    },
    {
      id: "maui-push-notifications",
      title: "Push notifications",
      difficulty: "hard",
      question: "How do you implement push notifications in a .NET MAUI app?",
      answer: `Push notifications in MAUI require platform-specific SDKs plus a server-side notification hub. The typical stack is **Azure Notification Hubs** (or Firebase directly) abstracted via **\`Plugin.Firebase.CloudMessaging\`** or the **\`Azure.Messaging.NotificationHubs\`** SDK.

**High-level flow**
\`\`\`
Device ──registers──► FCM / APNs ──token──► Your Backend
                                              │
                        Push payload ◄────────┘
                              │
                        FCM / APNs
                              │
                           Device ──► App receives notification
\`\`\`

**Android setup (Firebase)**
\`\`\`bash
dotnet add package Plugin.Firebase
\`\`\`
\`\`\`csharp
// Platforms/Android/MainApplication.cs
[Application]
public class MainApplication : MauiApplication
{
    protected override MauiApp CreateMauiApp() => MauiProgram.CreateMauiApp();
}
\`\`\`
Place \`google-services.json\` in \`Platforms/Android/\` and set **Build Action → GoogleServicesJson**.

**iOS setup**
Place \`GoogleService-Info.plist\` in \`Platforms/iOS/\` (**Build Action → BundleResource**). Enable Push Notifications and Background Modes (Remote notifications) in the entitlements.

**Cross-platform notification service**
\`\`\`csharp
public interface IPushNotificationService
{
    Task<string> GetTokenAsync();
    event EventHandler<NotificationPayload> NotificationReceived;
}

// Platforms/Android/PushNotificationService.cs
public partial class PushNotificationService : IPushNotificationService
{
    public async Task<string> GetTokenAsync()
    {
        var token = await FirebaseMessaging.Instance.GetToken().AsAsync<Java.Lang.String>();
        return token?.ToString() ?? string.Empty;
    }

    public event EventHandler<NotificationPayload>? NotificationReceived;
    // wire FirebaseMessagingService.OnMessageReceived here
}
\`\`\`

**Register on server**
\`\`\`csharp
// After login, send token to your backend
var token = await _pushService.GetTokenAsync();
await _api.RegisterDeviceAsync(new { Token = token, Platform = DeviceInfo.Platform.ToString() });
\`\`\`

**Best practices**
- Re-register on every app launch (tokens can rotate).
- Handle foreground vs background delivery differently.
- Use **data-only payloads** for full control over display.`,
      tags: ["push-notifications", "firebase"],
    },
    {
      id: "maui-testing",
      title: "Testing MAUI apps",
      difficulty: "hard",
      question: "How do you test a .NET MAUI application — unit tests, integration tests, and UI tests?",
      answer: `Testing MAUI requires different strategies for different layers.

---

**1. Unit-test ViewModels (xUnit + CommunityToolkit.Mvvm)**

ViewModels are plain C# — no MAUI runtime needed. Test them in a standard \`xunit\` project.

\`\`\`bash
dotnet new xunit -n MyApp.Tests
dotnet add MyApp.Tests reference MyApp
\`\`\`

\`\`\`csharp
public class SearchViewModelTests
{
    [Fact]
    public async Task SearchAsync_ReturnsResults_WhenQueryIsValid()
    {
        // Arrange
        var fakeService = Substitute.For<ISearchService>(); // NSubstitute
        fakeService.SearchAsync("maui", Arg.Any<CancellationToken>())
            .Returns(["Result 1", "Result 2"]);

        var vm = new SearchViewModel(fakeService);
        vm.Query = "maui";

        // Act
        await vm.SearchCommand.ExecuteAsync(null);

        // Assert
        Assert.Equal(2, vm.Results.Count);
        Assert.False(vm.IsBusy);
    }
}
\`\`\`

---

**2. Integration-test services**

Use \`Microsoft.Extensions.DependencyInjection\` directly — no MAUI host needed.

\`\`\`csharp
var services = new ServiceCollection();
services.AddSingleton<NoteDatabase>();
var provider = services.BuildServiceProvider();

var db = provider.GetRequiredService<NoteDatabase>();
await db.InitAsync();
var note = new Note { Title = "Test" };
await db.SaveNoteAsync(note);
Assert.NotEqual(0, note.Id);
\`\`\`

---

**3. UI tests with Appium + MAUI UITest**

\`\`\`bash
dotnet add package Appium.WebDriver
dotnet add package Microsoft.Maui.UITest  # preview
\`\`\`

\`\`\`csharp
[TestFixture]
public class MainPageTests : UITest
{
    [Test]
    public void GreetButton_ShowsAlert()
    {
        App.Tap(c => c.Marked("NameEntry"));
        App.EnterText("Alice");
        App.Tap(c => c.Marked("GreetButton"));
        App.WaitForElement(c => c.Marked("Hi"));
    }
}
\`\`\`

---

**Strategy summary**

| Layer | Tool | Speed |
|---|---|---|
| ViewModel / services | xUnit + NSubstitute | Fast (ms) |
| Repository / DB | xUnit + in-memory or SQLite | Medium |
| Full UI flows | Appium / MAUI UITest | Slow (device/emulator) |

> **Tip:** keep as much logic as possible in plain ViewModels and services — they are the easiest and fastest to test.`,
      tags: ["testing", "unit-test", "ui-test"],
    },
    {
      id: "maui-custom-control",
      title: "Building a custom control with a handler",
      difficulty: "hard",
      question: "Walk through creating a custom cross-platform control in .NET MAUI with a dedicated handler.",
      answer: `Creating a custom control involves three steps: **cross-platform interface/view**, **handler wiring**, and **platform implementations**.

---

**Step 1 – Define the cross-platform control**
\`\`\`csharp
// Controls/RoundedEntry.cs  (shared)
using Microsoft.Maui.Controls;

public class RoundedEntry : Entry
{
    public static readonly BindableProperty CornerRadiusProperty =
        BindableProperty.Create(nameof(CornerRadius), typeof(float), typeof(RoundedEntry), 8f);

    public float CornerRadius
    {
        get => (float)GetValue(CornerRadiusProperty);
        set => SetValue(CornerRadiusProperty, value);
    }
}
\`\`\`

---

**Step 2 – Create the handler**
\`\`\`csharp
// Controls/RoundedEntryHandler.cs  (shared)
using Microsoft.Maui.Handlers;

public partial class RoundedEntryHandler : EntryHandler
{
    public static new PropertyMapper<RoundedEntry, RoundedEntryHandler> Mapper = new(EntryHandler.Mapper)
    {
        [nameof(RoundedEntry.CornerRadius)] = MapCornerRadius,
    };

    public RoundedEntryHandler() : base(Mapper) { }

    static partial void MapCornerRadius(RoundedEntryHandler handler, RoundedEntry view);
}
\`\`\`

---

**Step 3 – Platform implementations**

\`\`\`csharp
// Platforms/Android/Controls/RoundedEntryHandler.cs
using Android.Graphics.Drawables;

public partial class RoundedEntryHandler
{
    static partial void MapCornerRadius(RoundedEntryHandler handler, RoundedEntry view)
    {
        var drawable = new GradientDrawable();
        drawable.SetCornerRadius(view.CornerRadius * handler.PlatformView.Resources!.DisplayMetrics!.Density);
        drawable.SetColor(Android.Graphics.Color.White);
        drawable.SetStroke(2, Android.Graphics.Color.LightGray);
        handler.PlatformView.SetBackground(drawable);
    }
}
\`\`\`

\`\`\`csharp
// Platforms/iOS/Controls/RoundedEntryHandler.cs
public partial class RoundedEntryHandler
{
    static partial void MapCornerRadius(RoundedEntryHandler handler, RoundedEntry view)
    {
        handler.PlatformView.Layer.CornerRadius = view.CornerRadius;
        handler.PlatformView.Layer.BorderColor = UIKit.UIColor.LightGray.CGColor;
        handler.PlatformView.Layer.BorderWidth = 1f;
        handler.PlatformView.ClipsToBounds = true;
    }
}
\`\`\`

---

**Step 4 – Register (MauiProgram.cs)**
\`\`\`csharp
builder.ConfigureMauiHandlers(h =>
    h.AddHandler<RoundedEntry, RoundedEntryHandler>());
\`\`\`

**Step 5 – Use in XAML**
\`\`\`xml
<controls:RoundedEntry CornerRadius="12"
                       Placeholder="Search…" />
\`\`\``,
      tags: ["handlers", "custom-control", "platform"],
    },
    {
      id: "maui-mvvm-navigation-params",
      title: "ViewModel-first navigation with parameters",
      difficulty: "hard",
      question: "How do you implement ViewModel-first navigation with query parameters and dependency injection in .NET MAUI Shell?",
      answer: `Shell navigation passes parameters through a URI query string. With DI-resolved pages and the \`[QueryProperty]\` attribute you get ViewModel-first navigation with full constructor injection.

**Register routes in AppShell.xaml.cs**
\`\`\`csharp
public partial class AppShell : Shell
{
    public AppShell()
    {
        InitializeComponent();
        Routing.RegisterRoute("product/details", typeof(ProductDetailPage));
        Routing.RegisterRoute("product/edit", typeof(ProductEditPage));
    }
}
\`\`\`

**Navigate with parameters**
\`\`\`csharp
// ProductListViewModel.cs
[RelayCommand]
private async Task OpenDetailAsync(Product product)
{
    await Shell.Current.GoToAsync($"product/details?id={product.Id}");
}
\`\`\`

**Receive in the target ViewModel**
\`\`\`csharp
// ProductDetailViewModel.cs
[ObservableObject]
[QueryProperty(nameof(ProductId), "id")]   // maps "?id=…" → ProductId setter
public partial class ProductDetailViewModel
{
    private readonly IProductRepository _repo;

    [ObservableProperty]
    private Product? _product;

    public ProductDetailViewModel(IProductRepository repo)
    {
        _repo = repo;
    }

    // Called by Shell when the query param arrives
    public string ProductId
    {
        set => LoadProductCommand.Execute(value);
    }

    [RelayCommand]
    private async Task LoadProductAsync(string id)
    {
        Product = await _repo.GetByIdAsync(int.Parse(id));
    }
}
\`\`\`

**Wire ViewModel to Page via DI**
\`\`\`csharp
// ProductDetailPage.xaml.cs
public partial class ProductDetailPage : ContentPage
{
    public ProductDetailPage(ProductDetailViewModel vm)
    {
        InitializeComponent();
        BindingContext = vm;
    }
}
\`\`\`

**Register both as Transient (MauiProgram.cs)**
\`\`\`csharp
builder.Services.AddTransient<ProductDetailViewModel>();
builder.Services.AddTransient<ProductDetailPage>();
\`\`\`

MAUI's Shell resolves \`ProductDetailPage\` from the DI container, which injects \`ProductDetailViewModel\`, keeping the ViewModel testable and the page thin.`,
      tags: ["navigation", "shell", "mvvm", "dependency-injection"],
    },
  ],
};
