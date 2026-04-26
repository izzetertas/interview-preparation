import type { Category } from "./types";

export const django: Category = {
  slug: "django",
  title: "Django",
  description:
    "Django 5.x: MTV architecture, ORM, class-based views, REST Framework, async views, caching, Celery, authentication, signals, and production best practices.",
  icon: "🎸",
  questions: [
    // ───── EASY ─────
    {
      id: "django-mtv-architecture",
      title: "What is the MTV architecture?",
      difficulty: "easy",
      question: "Explain Django's MTV (Model-Template-View) architecture and how it differs from MVC.",
      answer: `Django follows an **MTV** pattern, which maps closely to the classic MVC pattern but with different naming:

| MTV (Django) | MVC | Responsibility |
|---|---|---|
| **Model** | Model | Data layer — defines schema, handles DB queries via the ORM |
| **Template** | View | Presentation layer — HTML + Django template language |
| **View** | Controller | Business logic — receives a request, queries models, returns a response |

The URL dispatcher (\`urls.py\`) acts as the router, directing incoming requests to the appropriate view.

**Request lifecycle**
\`\`\`
Browser → urls.py → View → Model (ORM) → DB
                  ↓
               Template → HTTP Response → Browser
\`\`\`

\`\`\`python
# models.py
from django.db import models

class Article(models.Model):
    title = models.CharField(max_length=200)
    body  = models.TextField()

# views.py
from django.shortcuts import render
from .models import Article

def article_list(request):
    articles = Article.objects.all()
    return render(request, "articles/list.html", {"articles": articles})

# urls.py
from django.urls import path
from . import views

urlpatterns = [
    path("articles/", views.article_list, name="article-list"),
]
\`\`\`

\`\`\`html
{# articles/list.html #}
{% for article in articles %}
  <h2>{{ article.title }}</h2>
{% endfor %}
\`\`\``,
      tags: ["architecture", "fundamentals", "mtv"],
    },
    {
      id: "django-project-vs-app",
      title: "Project vs app structure",
      difficulty: "easy",
      question: "What is the difference between a Django project and a Django app, and how should you structure them?",
      answer: `**Project** — the top-level container for an entire web application. Created with \`django-admin startproject\`. Contains \`settings.py\`, root \`urls.py\`, \`wsgi.py\`, and \`asgi.py\`.

**App** — a reusable, self-contained module focused on a single responsibility (e.g., \`blog\`, \`accounts\`, \`payments\`). Created with \`python manage.py startapp\`.

\`\`\`
myproject/
├── manage.py
├── myproject/              # project package
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
├── blog/                   # app
│   ├── models.py
│   ├── views.py
│   ├── urls.py
│   ├── admin.py
│   ├── apps.py
│   ├── forms.py
│   ├── migrations/
│   └── templates/blog/
└── accounts/               # app
    ├── models.py
    └── ...
\`\`\`

Apps must be registered in \`INSTALLED_APPS\`:
\`\`\`python
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    # ...
    "blog.apps.BlogConfig",
    "accounts.apps.AccountsConfig",
]
\`\`\`

**Rule of thumb:** if an app can be unplugged from one project and dropped into another with minimal changes, it's well-designed.`,
      tags: ["project-structure", "fundamentals"],
    },
    {
      id: "django-url-routing",
      title: "URL routing with path() and include()",
      difficulty: "easy",
      question: "How does Django's URL routing work? Explain path(), re_path(), and include().",
      answer: `Django maps URLs to views via \`urlpatterns\` lists in \`urls.py\` files.

**\`path()\`** — simple, readable URL patterns using angle-bracket converters.
\`\`\`python
from django.urls import path
from . import views

urlpatterns = [
    path("articles/", views.article_list, name="article-list"),
    path("articles/<int:pk>/", views.article_detail, name="article-detail"),
    path("articles/<slug:slug>/", views.article_by_slug, name="article-slug"),
]
\`\`\`

Built-in converters: \`str\`, \`int\`, \`slug\`, \`uuid\`, \`path\`.

**\`re_path()\`** — regex-based patterns for complex cases.
\`\`\`python
from django.urls import re_path

urlpatterns = [
    re_path(r"^articles/(?P<year>[0-9]{4})/$", views.year_archive),
]
\`\`\`

**\`include()\`** — delegates a URL prefix to another \`urls.py\`, keeping apps modular.
\`\`\`python
# myproject/urls.py
from django.urls import path, include

urlpatterns = [
    path("blog/", include("blog.urls")),
    path("accounts/", include("accounts.urls")),
    path("admin/", admin.site.urls),
]
\`\`\`

**Reverse URL resolution** — use \`reverse()\` or the \`{% url %}\` template tag to avoid hardcoding URLs.
\`\`\`python
from django.urls import reverse
url = reverse("article-detail", kwargs={"pk": 42})
\`\`\``,
      tags: ["urls", "routing", "fundamentals"],
    },
    {
      id: "django-fbv-vs-cbv",
      title: "Function-based vs class-based views",
      difficulty: "easy",
      question: "What are the differences between function-based views (FBVs) and class-based views (CBVs) in Django?",
      answer: `**Function-based views (FBVs)** are plain Python functions that receive a \`request\` and return a response.

\`\`\`python
from django.shortcuts import render, get_object_or_404
from .models import Article

def article_detail(request, pk):
    article = get_object_or_404(Article, pk=pk)
    return render(request, "blog/detail.html", {"article": article})
\`\`\`

**Class-based views (CBVs)** encapsulate views as classes, enabling inheritance and mixins.

\`\`\`python
from django.views.generic import DetailView
from .models import Article

class ArticleDetailView(DetailView):
    model = Article
    template_name = "blog/detail.html"
    context_object_name = "article"
\`\`\`

| | FBV | CBV |
|---|---|---|
| Simplicity | High — easy to read | Medium — requires knowledge of dispatch |
| Reusability | Low — copy-paste | High — inheritance & mixins |
| HTTP method handling | Manual (\`if request.method == "POST"\`) | Automatic (\`get()\`, \`post()\` methods) |
| Generic views | Not applicable | Built-in (ListView, DetailView, CreateView…) |
| Decorators | Direct | \`method_decorator\` or \`dispatch\` override |

**When to use which**
- FBV: simple one-off views, heavy custom logic, or when clarity matters most.
- CBV: CRUD operations, views sharing behaviour via mixins, REST-style endpoints.`,
      tags: ["views", "cbv", "fbv", "fundamentals"],
    },
    {
      id: "django-orm-basics",
      title: "Django ORM basics",
      difficulty: "easy",
      question: "How do you define a model and perform basic CRUD operations with the Django ORM?",
      answer: `**Defining a model**
\`\`\`python
from django.db import models

class Post(models.Model):
    title      = models.CharField(max_length=200)
    body       = models.TextField()
    published  = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title
\`\`\`

**Create migrations and apply them**
\`\`\`bash
python manage.py makemigrations
python manage.py migrate
\`\`\`

**CRUD via the QuerySet API**
\`\`\`python
# Create
post = Post.objects.create(title="Hello Django", body="...")

# Read
Post.objects.all()                          # all records
Post.objects.filter(published=True)         # filter
Post.objects.get(pk=1)                      # single (raises if missing/multiple)
Post.objects.first()                        # first match

# Update
Post.objects.filter(pk=1).update(published=True)

# Delete
Post.objects.filter(published=False).delete()
\`\`\`

**Common field types**
| Field | Use |
|---|---|
| \`CharField\` | Short text (requires \`max_length\`) |
| \`TextField\` | Long text |
| \`IntegerField\` | Integer |
| \`DecimalField\` | Precise decimal |
| \`BooleanField\` | True/False |
| \`DateTimeField\` | Timestamp |
| \`ForeignKey\` | Many-to-one relation |
| \`ManyToManyField\` | Many-to-many relation |`,
      tags: ["orm", "models", "fundamentals"],
    },
    {
      id: "django-admin",
      title: "Django admin site",
      difficulty: "easy",
      question: "How do you register models with the Django admin and customise the list display?",
      answer: `The Django admin provides an auto-generated CRUD interface for your models.

**Basic registration**
\`\`\`python
# blog/admin.py
from django.contrib import admin
from .models import Post

admin.site.register(Post)
\`\`\`

**Customised ModelAdmin**
\`\`\`python
@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display  = ("title", "published", "created_at")  # columns shown
    list_filter   = ("published",)                         # sidebar filters
    search_fields = ("title", "body")                      # search box
    ordering      = ("-created_at",)
    prepopulated_fields = {"slug": ("title",)}             # auto-fill slug
    readonly_fields     = ("created_at", "updated_at")

    # Custom action
    @admin.action(description="Publish selected posts")
    def publish(self, request, queryset):
        queryset.update(published=True)

    actions = ["publish"]
\`\`\`

Create a superuser to access \`/admin/\`:
\`\`\`bash
python manage.py createsuperuser
\`\`\``,
      tags: ["admin", "fundamentals"],
    },
    {
      id: "django-templates",
      title: "Django template language",
      difficulty: "easy",
      question: "How does the Django template language work? Cover variables, tags, filters, and template inheritance.",
      answer: `Django templates are HTML files augmented with a simple templating language.

**Variables** — \`{{ variable }}\`, supports dot-notation for attributes and dict keys.
\`\`\`html
<h1>{{ article.title }}</h1>
<p>By {{ article.author.get_full_name }}</p>
\`\`\`

**Tags** — logic blocks wrapped in \`{% %}\`.
\`\`\`html
{% for article in articles %}
  <li>{{ article.title }}</li>
{% empty %}
  <li>No articles yet.</li>
{% endfor %}

{% if user.is_authenticated %}
  <a href="{% url 'logout' %}">Log out</a>
{% else %}
  <a href="{% url 'login' %}">Log in</a>
{% endif %}
\`\`\`

**Filters** — transform a variable value: \`{{ value|filter_name:arg }}\`.
\`\`\`html
{{ article.title|truncatechars:50 }}
{{ article.created_at|date:"d M Y" }}
{{ article.body|linebreaks }}
{{ price|floatformat:2 }}
\`\`\`

**Template inheritance** — promotes DRY layouts.
\`\`\`html
{# base.html #}
<!DOCTYPE html>
<html>
<head><title>{% block title %}My Site{% endblock %}</title></head>
<body>
  {% block content %}{% endblock %}
</body>
</html>

{# blog/list.html #}
{% extends "base.html" %}

{% block title %}Articles{% endblock %}

{% block content %}
  {% for a in articles %}
    <h2>{{ a.title }}</h2>
  {% endfor %}
{% endblock %}
\`\`\``,
      tags: ["templates", "fundamentals"],
    },
    {
      id: "django-settings-env",
      title: "Environment-based settings with django-environ",
      difficulty: "easy",
      question: "How do you manage environment-based Django settings and keep secrets out of version control?",
      answer: `Use **django-environ** (or \`python-decouple\`) to read settings from environment variables or a \`.env\` file.

\`\`\`bash
pip install django-environ
\`\`\`

\`\`\`python
# settings.py
import environ

env = environ.Env(
    DEBUG=(bool, False),
)

# Reads .env file if present
environ.Env.read_env()

SECRET_KEY = env("SECRET_KEY")
DEBUG       = env("DEBUG")
DATABASES   = {"default": env.db()}          # parses DATABASE_URL
ALLOWED_HOSTS = env.list("ALLOWED_HOSTS")
\`\`\`

\`\`\`bash
# .env  (gitignored)
SECRET_KEY=super-secret-key
DEBUG=True
DATABASE_URL=postgres://user:pass@localhost/mydb
ALLOWED_HOSTS=localhost,127.0.0.1
\`\`\`

**Split settings pattern** for multiple environments:
\`\`\`
settings/
├── base.py      # shared settings
├── local.py     # local dev overrides
└── production.py
\`\`\`

\`\`\`bash
# Select settings module
DJANGO_SETTINGS_MODULE=myproject.settings.production python manage.py runserver
\`\`\`

Add \`.env\` and \`local.py\` to \`.gitignore\`. Never hardcode \`SECRET_KEY\` or credentials in committed files.`,
      tags: ["settings", "security", "environment"],
    },

    // ───── MEDIUM ─────
    {
      id: "django-generic-cbvs",
      title: "Generic class-based views",
      difficulty: "medium",
      question: "What generic class-based views does Django provide, and how do you use CreateView with a ModelForm?",
      answer: `Django's generic CBVs handle common patterns — listing, detail, creating, updating, and deleting objects.

| View class | Purpose |
|---|---|
| \`ListView\` | Render a list of objects |
| \`DetailView\` | Render one object by PK or slug |
| \`CreateView\` | Render and process a create form |
| \`UpdateView\` | Render and process an update form |
| \`DeleteView\` | Confirm and process object deletion |
| \`TemplateView\` | Render a template with no model |
| \`RedirectView\` | Redirect to a URL |

**CreateView example**
\`\`\`python
# forms.py
from django import forms
from .models import Post

class PostForm(forms.ModelForm):
    class Meta:
        model  = Post
        fields = ["title", "body", "published"]

# views.py
from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse_lazy
from django.views.generic import CreateView
from .models import Post

class PostCreateView(LoginRequiredMixin, CreateView):
    model         = Post
    form_class    = PostForm
    template_name = "blog/post_form.html"
    success_url   = reverse_lazy("post-list")

    def form_valid(self, form):
        form.instance.author = self.request.user
        return super().form_valid(form)
\`\`\`

\`\`\`python
# urls.py
path("posts/new/", PostCreateView.as_view(), name="post-create"),
\`\`\`

\`\`\`html
{# blog/post_form.html #}
<form method="post">
  {% csrf_token %}
  {{ form.as_p }}
  <button type="submit">Save</button>
</form>
\`\`\``,
      tags: ["cbv", "views", "forms"],
    },
    {
      id: "django-orm-advanced-queries",
      title: "Advanced ORM: select_related, prefetch_related, Q, F",
      difficulty: "medium",
      question: "Explain select_related, prefetch_related, Q objects, and F expressions with examples.",
      answer: `**\`select_related\`** — performs a SQL JOIN for ForeignKey / OneToOne relations. Reduces queries from N+1 to 1.
\`\`\`python
# Without: 1 + N queries
posts = Post.objects.all()
for p in posts:
    print(p.author.username)  # extra query each time

# With select_related: 1 query (JOIN)
posts = Post.objects.select_related("author").all()
\`\`\`

**\`prefetch_related\`** — uses separate queries + Python-side joining, required for ManyToMany and reverse FK relations.
\`\`\`python
posts = Post.objects.prefetch_related("tags", "comments").all()
\`\`\`

**\`Q\` objects** — composable query conditions with \`|\` (OR), \`&\` (AND), \`~\` (NOT).
\`\`\`python
from django.db.models import Q

Post.objects.filter(Q(published=True) | Q(author__is_staff=True))
Post.objects.filter(Q(title__icontains="django") & ~Q(body=""))
\`\`\`

**\`F\` expressions** — reference model fields inside a query without loading them into Python (atomic, avoids race conditions).
\`\`\`python
from django.db.models import F

# Atomic increment — no race condition
Post.objects.filter(pk=1).update(view_count=F("view_count") + 1)

# Filter comparing two fields
Product.objects.filter(price__lt=F("original_price"))

# Annotate a derived value
from django.db.models import ExpressionWrapper, FloatField

Product.objects.annotate(
    discount=ExpressionWrapper(
        (F("original_price") - F("price")) / F("original_price") * 100,
        output_field=FloatField(),
    )
)
\`\`\``,
      tags: ["orm", "performance", "queries"],
    },
    {
      id: "django-orm-annotations-aggregations",
      title: "ORM annotations and aggregations",
      difficulty: "medium",
      question: "How do you use annotate() and aggregate() in the Django ORM to compute summary data?",
      answer: `**\`aggregate()\`** — computes a single summary value across all rows in a QuerySet.
\`\`\`python
from django.db.models import Count, Avg, Sum, Max, Min

Post.objects.aggregate(total=Count("id"))
# {'total': 42}

Order.objects.aggregate(
    total_revenue=Sum("amount"),
    avg_order=Avg("amount"),
)
\`\`\`

**\`annotate()\`** — adds a computed value to each object in the QuerySet (i.e., GROUP BY per object).
\`\`\`python
from django.db.models import Count, Avg

# Number of posts per author
from myapp.models import User
authors = User.objects.annotate(post_count=Count("post")).order_by("-post_count")

for author in authors:
    print(author.username, author.post_count)

# Average rating per product
products = Product.objects.annotate(avg_rating=Avg("review__rating"))
\`\`\`

**Combining with filters**
\`\`\`python
from django.db.models import Count, Q

# Count only published posts per author
authors = User.objects.annotate(
    published_count=Count("post", filter=Q(post__published=True))
)
\`\`\`

**Subquery** — reference a related QuerySet as a column.
\`\`\`python
from django.db.models import OuterRef, Subquery

latest_comment = Comment.objects.filter(
    post=OuterRef("pk")
).order_by("-created_at").values("body")[:1]

posts = Post.objects.annotate(latest_comment_body=Subquery(latest_comment))
\`\`\``,
      tags: ["orm", "queries", "aggregation"],
    },
    {
      id: "django-middleware",
      title: "Django middleware",
      difficulty: "medium",
      question: "What is Django middleware and how do you write a custom middleware class?",
      answer: `**Middleware** is a framework of hooks that processes requests and responses globally, in the order they are listed in \`MIDDLEWARE\`.

On the way **in** (request): middleware is called top-to-bottom.
On the way **out** (response): middleware is called bottom-to-top.

\`\`\`python
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    # ...
    "myapp.middleware.RequestTimingMiddleware",   # custom
]
\`\`\`

**Writing a custom middleware (new-style callable)**
\`\`\`python
import time
import logging

logger = logging.getLogger(__name__)

class RequestTimingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response  # called once on startup

    def __call__(self, request):
        start = time.monotonic()

        response = self.get_response(request)  # calls the next middleware / view

        duration = time.monotonic() - start
        logger.info("%s %s %.3fs", request.method, request.path, duration)
        response["X-Response-Time"] = f"{duration:.3f}s"

        return response

    def process_exception(self, request, exception):
        # Optional: handle uncaught exceptions
        logger.error("Unhandled exception: %s", exception)
        return None  # returning None lets Django's default handling proceed
\`\`\`

Common uses: authentication, request logging, rate limiting, CORS headers, timezone detection.`,
      tags: ["middleware", "fundamentals"],
    },
    {
      id: "django-authentication",
      title: "Authentication: login, permissions, custom User model",
      difficulty: "medium",
      question: "How does Django's authentication system work? Cover login/logout, @login_required, permission_required, and creating a custom User model.",
      answer: `**Login / logout**
\`\`\`python
# urls.py — use Django's built-in auth views
from django.contrib.auth import views as auth_views

urlpatterns = [
    path("login/",  auth_views.LoginView.as_view(template_name="auth/login.html"), name="login"),
    path("logout/", auth_views.LogoutView.as_view(), name="logout"),
]
\`\`\`

**Protecting views**
\`\`\`python
from django.contrib.auth.decorators import login_required, permission_required

@login_required                           # redirects to settings.LOGIN_URL if not authenticated
def dashboard(request): ...

@permission_required("blog.add_post")     # 403 if missing permission
def create_post(request): ...

# CBV equivalent
from django.contrib.auth.mixins import LoginRequiredMixin, PermissionRequiredMixin

class PostCreateView(LoginRequiredMixin, PermissionRequiredMixin, CreateView):
    permission_required = "blog.add_post"
\`\`\`

**Custom User model** — always set up before the first migration.
\`\`\`python
# accounts/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    bio    = models.TextField(blank=True)
    avatar = models.ImageField(upload_to="avatars/", blank=True)

# settings.py
AUTH_USER_MODEL = "accounts.User"
\`\`\`

\`\`\`python
# Reference the custom user safely
from django.contrib.auth import get_user_model
User = get_user_model()
\`\`\`

Switching \`AUTH_USER_MODEL\` after running migrations requires squashing or a manual migration — set it on day one.`,
      tags: ["authentication", "permissions", "security"],
    },
    {
      id: "django-signals",
      title: "Django signals",
      difficulty: "medium",
      question: "What are Django signals and when should you use them? Show a practical example.",
      answer: `**Signals** allow decoupled parts of an application to be notified when specific events occur. They implement a publisher-subscriber pattern built into Django.

**Built-in signals (common ones)**
| Signal | Fires when |
|---|---|
| \`pre_save\` / \`post_save\` | Before/after a model's \`save()\` |
| \`pre_delete\` / \`post_delete\` | Before/after a model's \`delete()\` |
| \`m2m_changed\` | A ManyToManyField is modified |
| \`request_started\` / \`request_finished\` | HTTP request starts/finishes |

**Example: auto-create a user profile**
\`\`\`python
# accounts/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import Profile

User = get_user_model()

@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_profile(sender, instance, **kwargs):
    instance.profile.save()
\`\`\`

\`\`\`python
# accounts/apps.py
class AccountsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "accounts"

    def ready(self):
        import accounts.signals  # connect signals when app loads
\`\`\`

**When to use signals**
- Decoupling apps (e.g., sending a notification email when an order is placed, without the order app knowing about emails).
- Auditing/logging changes across many models.

**When NOT to use signals**
- Simple, direct calls within the same app — a plain method call is clearer and easier to trace.
- Performance-critical paths — signals add overhead and make call stacks harder to debug.`,
      tags: ["signals", "architecture"],
    },
    {
      id: "django-rest-framework-basics",
      title: "DRF: serializers, ViewSets, and routers",
      difficulty: "medium",
      question: "How do you build a REST API with Django REST Framework using serializers, ViewSets, and routers?",
      answer: `**Install**
\`\`\`bash
pip install djangorestframework
\`\`\`

\`\`\`python
INSTALLED_APPS = [..., "rest_framework"]
\`\`\`

**Serializer**
\`\`\`python
# blog/serializers.py
from rest_framework import serializers
from .models import Post

class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Post
        fields = ["id", "title", "body", "published", "created_at"]
        read_only_fields = ["created_at"]
\`\`\`

**ViewSet**
\`\`\`python
# blog/views.py
from rest_framework import viewsets, permissions
from .models import Post
from .serializers import PostSerializer

class PostViewSet(viewsets.ModelViewSet):
    queryset           = Post.objects.select_related("author").all()
    serializer_class   = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.query_params.get("published"):
            qs = qs.filter(published=True)
        return qs

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
\`\`\`

**Router** — auto-generates URL patterns for all standard actions.
\`\`\`python
# blog/urls.py
from rest_framework.routers import DefaultRouter
from .views import PostViewSet

router = DefaultRouter()
router.register("posts", PostViewSet)

urlpatterns = router.urls
# Generates: GET/POST /posts/, GET/PUT/PATCH/DELETE /posts/{pk}/
\`\`\`

**Permissions**
\`\`\`python
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
\`\`\``,
      tags: ["drf", "api", "rest"],
    },
    {
      id: "django-caching",
      title: "Django caching strategies",
      difficulty: "medium",
      question: "How does Django's cache framework work? Cover per-view caching, low-level cache API, and template fragment caching.",
      answer: `Configure a cache backend in \`settings.py\`:
\`\`\`python
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": "redis://127.0.0.1:6379/1",
    }
}
\`\`\`

**Low-level API**
\`\`\`python
from django.core.cache import cache

cache.set("my_key", {"data": 42}, timeout=300)   # 5 min
value = cache.get("my_key")                       # None if missing
cache.delete("my_key")
cache.get_or_set("key", expensive_call, 60)
\`\`\`

**Per-view caching**
\`\`\`python
from django.views.decorators.cache import cache_page

@cache_page(60 * 15)  # 15 minutes
def article_list(request):
    ...

# CBV
from django.utils.decorators import method_decorator

@method_decorator(cache_page(60 * 15), name="dispatch")
class ArticleListView(ListView): ...
\`\`\`

**Template fragment caching**
\`\`\`html
{% load cache %}
{% cache 300 sidebar user.id %}   {# cached per user for 5 min #}
  <aside>{{ expensive_sidebar }}</aside>
{% endcache %}
\`\`\`

**Cache invalidation pattern**
\`\`\`python
# Use versioned keys or \`cache.delete_many\` after mutations
def update_post(pk, data):
    Post.objects.filter(pk=pk).update(**data)
    cache.delete(f"post_{pk}")
\`\`\`

**Vary on request headers** (e.g., Accept-Language) with \`@vary_on_headers\` or \`@vary_on_cookie\`.`,
      tags: ["caching", "performance", "redis"],
    },
    {
      id: "django-static-media",
      title: "Static and media files",
      difficulty: "medium",
      question: "How does Django handle static files and user-uploaded media files in development and production?",
      answer: `**Static files** — CSS, JS, images shipped with the application.
\`\`\`python
# settings.py
STATIC_URL  = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"   # where collectstatic writes
STATICFILES_DIRS = [BASE_DIR / "static"] # extra dirs to search
\`\`\`

\`\`\`bash
python manage.py collectstatic  # copies all static files to STATIC_ROOT
\`\`\`

In templates:
\`\`\`html
{% load static %}
<link rel="stylesheet" href="{% static 'css/main.css' %}">
\`\`\`

**Media files** — user-uploaded files (images, documents).
\`\`\`python
MEDIA_URL  = "/media/"
MEDIA_ROOT = BASE_DIR / "media"
\`\`\`

\`\`\`python
# Serve media during development (never in production)
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [...] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
\`\`\`

\`\`\`python
class UserProfile(models.Model):
    avatar = models.ImageField(upload_to="avatars/%Y/%m/")
\`\`\`

**Production serving**
- **Static:** CDN (CloudFront, Cloudflare) pointing at \`STATIC_ROOT\`, or serve via nginx.
- **Media:** S3-compatible storage using \`django-storages\`:
\`\`\`python
DEFAULT_FILE_STORAGE = "storages.backends.s3boto3.S3Boto3Storage"
AWS_STORAGE_BUCKET_NAME = env("AWS_BUCKET_NAME")
\`\`\``,
      tags: ["static", "media", "deployment"],
    },

    // ───── HARD ─────
    {
      id: "django-custom-manager-queryset",
      title: "Custom managers and QuerySets",
      difficulty: "hard",
      question: "How do you build a custom Manager and QuerySet in Django to encapsulate reusable query logic?",
      answer: `Encapsulating query logic in custom managers and QuerySets keeps views and serializers thin and makes business rules testable in isolation.

**Custom QuerySet** — chainable query methods.
\`\`\`python
from django.db import models
from django.utils import timezone

class PostQuerySet(models.QuerySet):
    def published(self):
        return self.filter(published=True)

    def draft(self):
        return self.filter(published=False)

    def recent(self, days=7):
        cutoff = timezone.now() - timezone.timedelta(days=days)
        return self.filter(created_at__gte=cutoff)

    def by_author(self, user):
        return self.filter(author=user)
\`\`\`

**Custom Manager** — exposes the custom QuerySet as the default manager.
\`\`\`python
class PostManager(models.Manager):
    def get_queryset(self):
        return PostQuerySet(self.model, using=self._db)

    # Convenience shortcut methods
    def published(self):
        return self.get_queryset().published()

    def recent_published(self):
        return self.get_queryset().published().recent()

class Post(models.Model):
    title     = models.CharField(max_length=200)
    published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    author    = models.ForeignKey("auth.User", on_delete=models.CASCADE)

    objects = PostManager()  # replaces default manager
\`\`\`

**Usage — chains work because QuerySet returns itself**
\`\`\`python
# All chainable
posts = Post.objects.published().recent(days=30).by_author(request.user)
count = Post.objects.published().count()

# Via manager shortcut
Post.objects.recent_published()[:10]
\`\`\`

**Preserving chainability with \`as_manager()\`**
\`\`\`python
# Simpler alternative when you don't need extra manager methods
class Post(models.Model):
    objects = PostQuerySet.as_manager()
\`\`\``,
      tags: ["orm", "managers", "querysets", "patterns"],
    },
    {
      id: "django-celery-integration",
      title: "Celery integration with Django",
      difficulty: "hard",
      question: "How do you integrate Celery with Django for background task processing? Include setup, task definition, and periodic tasks.",
      answer: `**Install**
\`\`\`bash
pip install celery redis django-celery-beat
\`\`\`

**Celery application setup**
\`\`\`python
# myproject/celery.py
import os
from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "myproject.settings")

app = Celery("myproject")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()  # finds tasks.py in each INSTALLED_APP
\`\`\`

\`\`\`python
# myproject/__init__.py
from .celery import app as celery_app
__all__ = ["celery_app"]
\`\`\`

\`\`\`python
# settings.py
CELERY_BROKER_URL     = env("REDIS_URL", default="redis://localhost:6379/0")
CELERY_RESULT_BACKEND = env("REDIS_URL", default="redis://localhost:6379/0")
CELERY_BEAT_SCHEDULER = "django_celery_beat.schedulers:DatabaseScheduler"
\`\`\`

**Defining tasks**
\`\`\`python
# blog/tasks.py
from celery import shared_task
from django.core.mail import send_mail

@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_welcome_email(self, user_id: int):
    from django.contrib.auth import get_user_model
    User = get_user_model()
    try:
        user = User.objects.get(pk=user_id)
        send_mail(
            subject="Welcome!",
            message=f"Hi {user.first_name}, welcome to our site.",
            from_email="noreply@example.com",
            recipient_list=[user.email],
        )
    except Exception as exc:
        raise self.retry(exc=exc)
\`\`\`

**Calling tasks**
\`\`\`python
# Fire-and-forget
send_welcome_email.delay(user_id=user.pk)

# With countdown and explicit queue
send_welcome_email.apply_async(
    args=[user.pk],
    countdown=10,
    queue="emails",
)
\`\`\`

**Periodic tasks (django-celery-beat)**
\`\`\`python
from celery.schedules import crontab

CELERY_BEAT_SCHEDULE = {
    "daily-digest": {
        "task": "blog.tasks.send_daily_digest",
        "schedule": crontab(hour=8, minute=0),
    },
}
\`\`\`

**Start workers**
\`\`\`bash
celery -A myproject worker -l INFO -Q default,emails
celery -A myproject beat -l INFO
\`\`\``,
      tags: ["celery", "async", "background-tasks"],
    },
    {
      id: "django-5x-features",
      title: "Django 5.x features: async views and db_default",
      difficulty: "hard",
      question: "What are the most impactful new features in Django 5.x, specifically async views and the db_default field option?",
      answer: `**Async views (Django 4.1+, matured in 5.x)**

Django 5.x supports fully async request handling when running under ASGI (e.g., Uvicorn or Daphne). Any view can be an \`async def\` coroutine.

\`\`\`python
# asgi.py
from django.core.asgi import get_asgi_application
application = get_asgi_application()
\`\`\`

\`\`\`python
import asyncio
import httpx
from django.http import JsonResponse

async def fetch_external_data(request):
    async with httpx.AsyncClient() as client:
        r = await client.get("https://api.example.com/data", timeout=5)
    return JsonResponse(r.json())

# Combine with async ORM (Django 4.1+)
async def post_list(request):
    posts = [p async for p in Post.objects.filter(published=True).aiterator()]
    return JsonResponse({"posts": [p.title for p in posts]})
\`\`\`

Async ORM methods: \`aget()\`, \`acreate()\`, \`aupdate()\`, \`adelete()\`, \`acount()\`, \`aiterator()\`, \`aget_or_create()\`, etc.

---

**\`db_default\` (Django 5.0)**

Previously, \`default\` was enforced in Python — the DB column had no default. \`db_default\` sets the default at the **database level** using a SQL expression, surviving bulk inserts and direct SQL writes.

\`\`\`python
from django.db import models
from django.db.models.functions import Now

class Post(models.Model):
    title       = models.CharField(max_length=200)
    view_count  = models.IntegerField(db_default=0)
    published   = models.BooleanField(db_default=False)
    created_at  = models.DateTimeField(db_default=Now())  # DB-side NOW()
\`\`\`

\`\`\`sql
-- Generated migration SQL
ALTER TABLE "blog_post" ADD COLUMN "view_count" integer NOT NULL DEFAULT 0;
\`\`\`

This ensures that even \`INSERT INTO blog_post (title) VALUES ('hello')\` executed directly in psql will populate defaults correctly — impossible with Python-only \`default\`.

**Other Django 5.x highlights**
- **Facet filters** in the admin.
- **Field groups** for template rendering.
- **Simplified templates**: \`{% querystring %}\` built-in tag for manipulating query strings.
- **One-to-one field improvements**: reverse accessors no longer require \`try/except\`; \`get_FOO\` returns \`None\` instead of raising \`RelatedObjectDoesNotExist\`.`,
      tags: ["django-5", "async", "orm", "new-features"],
    },
    {
      id: "django-testing",
      title: "Testing Django apps",
      difficulty: "hard",
      question: "How do you test Django applications effectively? Cover TestCase, the test Client, factory_boy, and testing DRF APIs.",
      answer: `**Django TestCase**
\`\`\`python
from django.test import TestCase
from django.contrib.auth import get_user_model
from .models import Post

User = get_user_model()

class PostModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="alice", password="pass")
        self.post = Post.objects.create(
            title="Test Post", body="body", author=self.user, published=True
        )

    def test_str(self):
        self.assertEqual(str(self.post), "Test Post")

    def test_only_published_returns_published(self):
        Post.objects.create(title="Draft", body="x", author=self.user, published=False)
        qs = Post.objects.published()
        self.assertEqual(qs.count(), 1)
        self.assertEqual(qs.first(), self.post)
\`\`\`

**Django test Client** — simulates HTTP requests.
\`\`\`python
from django.test import TestCase
from django.urls import reverse

class ArticleViewTest(TestCase):
    def test_list_view_unauthenticated(self):
        response = self.client.get(reverse("article-list"))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "No articles")

    def test_create_requires_login(self):
        response = self.client.post(reverse("article-create"), {"title": "X", "body": "Y"})
        self.assertRedirects(response, "/accounts/login/?next=/articles/new/")

    def test_authenticated_user_can_create(self):
        self.client.force_login(self.user)
        response = self.client.post(
            reverse("article-create"), {"title": "New", "body": "Body"}
        )
        self.assertEqual(response.status_code, 302)
        self.assertEqual(Article.objects.count(), 1)
\`\`\`

**factory_boy** — replaces verbose \`setUp\` fixtures.
\`\`\`python
import factory
from factory.django import DjangoModelFactory
from .models import Post
from django.contrib.auth import get_user_model

class UserFactory(DjangoModelFactory):
    class Meta:
        model = get_user_model()
    username = factory.Sequence(lambda n: f"user{n}")
    email    = factory.LazyAttribute(lambda o: f"{o.username}@example.com")

class PostFactory(DjangoModelFactory):
    class Meta:
        model = Post
    title     = factory.Faker("sentence", nb_words=4)
    body      = factory.Faker("paragraph")
    author    = factory.SubFactory(UserFactory)
    published = True

# In tests
post = PostFactory()
posts = PostFactory.create_batch(10, published=False)
\`\`\`

**Testing DRF endpoints**
\`\`\`python
from rest_framework.test import APITestCase, APIClient
from django.urls import reverse

class PostAPITest(APITestCase):
    def setUp(self):
        self.user = UserFactory()
        self.client = APIClient()

    def test_list_returns_200(self):
        PostFactory.create_batch(3)
        response = self.client.get(reverse("post-list"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 3)

    def test_create_requires_auth(self):
        r = self.client.post(reverse("post-list"), {"title": "X", "body": "Y"})
        self.assertEqual(r.status_code, 401)

    def test_authenticated_create(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.post(reverse("post-list"), {"title": "X", "body": "Y"})
        self.assertEqual(r.status_code, 201)
        self.assertEqual(Post.objects.count(), 1)
\`\`\`

**Run tests**
\`\`\`bash
python manage.py test --parallel --keepdb
\`\`\``,
      tags: ["testing", "testcase", "factory-boy", "drf"],
    },
    {
      id: "django-drf-permissions-throttling",
      title: "DRF permissions and throttling",
      difficulty: "hard",
      question: "How do you implement custom permissions and throttling in Django REST Framework?",
      answer: `**Built-in permission classes**
\`\`\`python
from rest_framework.permissions import (
    AllowAny, IsAuthenticated, IsAdminUser,
    IsAuthenticatedOrReadOnly, DjangoModelPermissions,
)
\`\`\`

**Custom permission**
\`\`\`python
from rest_framework.permissions import BasePermission

class IsOwnerOrReadOnly(BasePermission):
    """Allow object modification only to the owner."""

    def has_permission(self, request, view):
        # List/create level: must be authenticated to write
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return True
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Object level: read allowed for anyone, write for owner only
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return True
        return obj.author == request.user

class PostViewSet(viewsets.ModelViewSet):
    permission_classes = [IsOwnerOrReadOnly]
\`\`\`

**Throttling** — rate-limiting requests.
\`\`\`python
# settings.py
REST_FRAMEWORK = {
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "100/day",
        "user": "1000/day",
    },
}
\`\`\`

**Custom throttle** — e.g., strict limit on AI-powered endpoints.
\`\`\`python
from rest_framework.throttling import UserRateThrottle

class BurstRateThrottle(UserRateThrottle):
    scope = "burst"

class SustainedRateThrottle(UserRateThrottle):
    scope = "sustained"

# settings.py
REST_FRAMEWORK = {
    "DEFAULT_THROTTLE_CLASSES": [
        "myapp.throttles.BurstRateThrottle",
        "myapp.throttles.SustainedRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "burst":     "10/min",
        "sustained": "500/day",
    },
}
\`\`\`

**Apply per-view**
\`\`\`python
class GenerateView(APIView):
    throttle_classes = [BurstRateThrottle]

    def post(self, request):
        ...
\`\`\``,
      tags: ["drf", "permissions", "throttling", "security"],
    },
    {
      id: "django-select-related-deep",
      title: "Optimising queries: select_related, prefetch_related, and Prefetch objects",
      difficulty: "hard",
      question: "What is the difference between select_related and prefetch_related in terms of SQL, and how do you use the Prefetch object to customise prefetching?",
      answer: `**\`select_related\`** — issues a single SQL query with JOINs. Only works for ForeignKey and OneToOne (single-valued) relations.

\`\`\`python
# 1 SQL query with JOIN
posts = Post.objects.select_related("author", "author__profile").all()
\`\`\`

Generated SQL (simplified):
\`\`\`sql
SELECT post.*, auth_user.*, accounts_profile.*
FROM blog_post post
INNER JOIN auth_user ON post.author_id = auth_user.id
LEFT JOIN accounts_profile ON accounts_profile.user_id = auth_user.id;
\`\`\`

**\`prefetch_related\`** — issues one query per relation, then joins results in Python. Required for ManyToMany, reverse FK, and GenericRelation.

\`\`\`python
# 3 queries total (posts, tags, comments)
posts = Post.objects.prefetch_related("tags", "comments").all()
\`\`\`

**The \`Prefetch\` object** — gives you fine-grained control over the prefetch query.

\`\`\`python
from django.db.models import Prefetch

# Only prefetch approved comments, with their authors, ordered
approved_comments = Comment.objects.filter(approved=True).select_related("author").order_by("-created_at")

posts = Post.objects.prefetch_related(
    Prefetch("comments", queryset=approved_comments, to_attr="approved_comments")
).filter(published=True)

for post in posts:
    # post.approved_comments is a plain list — no extra query
    print(post.approved_comments[:3])
\`\`\`

**Performance comparison**
| | \`select_related\` | \`prefetch_related\` |
|---|---|---|
| SQL queries | 1 (JOIN) | 1 per relation |
| Works with | FK, OneToOne | Any relation |
| Memory | Higher (wide rows) | Lower (narrow rows) |
| Customisable query | No | Yes (Prefetch object) |

**Avoid over-fetching with nested \`only()\` or \`defer()\`**
\`\`\`python
posts = Post.objects.select_related("author").only(
    "title", "published", "author__username"
)
\`\`\``,
      tags: ["orm", "performance", "n+1", "queries"],
    },
  ],
};
