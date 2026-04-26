import type { Category } from "./types";

export const fastapi: Category = {
  slug: "fastapi",
  title: "FastAPI",
  description:
    "FastAPI fundamentals: path & query parameters, Pydantic v2 models, dependency injection, async handlers, routers, middleware, CORS, authentication (OAuth2/JWT), WebSockets, background tasks, lifespan events, file uploads, exception handling, testing with TestClient, settings management, and async SQLAlchemy integration.",
  icon: "⚡",
  questions: [
    // ───── EASY ─────
    {
      id: "what-is-fastapi",
      title: "What is FastAPI?",
      difficulty: "easy",
      question: "What is FastAPI and what are its key design goals?",
      answer: `**FastAPI** is a modern, high-performance Python web framework for building APIs, built on top of **Starlette** (ASGI) and **Pydantic** (data validation). Created by Sebastián Ramírez and first released in 2018.

**Core design goals:**
- **Fast to run** — on par with NodeJS and Go thanks to async I/O via ASGI (Uvicorn/Hypercorn).
- **Fast to code** — type hints drive validation, serialization, and docs automatically.
- **Fewer bugs** — editor autocompletion and strict typing catch errors early.
- **Intuitive** — minimal boilerplate; sensible defaults.
- **Standards-based** — OpenAPI 3.x and JSON Schema as first-class citizens.

\`\`\`python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello, FastAPI!"}
\`\`\`

Run with: \`uvicorn main:app --reload\`

**Automatic interactive docs** are available at \`/docs\` (Swagger UI) and \`/redoc\` (ReDoc) with zero configuration.

**Underlying stack:**
- **Starlette** — ASGI toolkit (routing, middleware, WebSockets, background tasks)
- **Pydantic v2** — data validation and serialization (Rust-backed, ~5-50× faster than v1)
- **Uvicorn** — lightning-fast ASGI server based on \`uvloop\` and \`httptools\``,
      tags: ["fundamentals"],
    },
    {
      id: "fastapi-vs-flask-django",
      title: "FastAPI vs Flask vs Django",
      difficulty: "easy",
      question: "How does FastAPI compare to Flask and Django?",
      answer: `| Feature | FastAPI | Flask | Django |
|---------|---------|-------|--------|
| **Paradigm** | API-first, async | Micro, sync-first | Full-stack, batteries included |
| **Async support** | Native (ASGI) | Via Quart/extensions | Partial (ASGI in Django 4+) |
| **Validation** | Pydantic v2 built-in | Manual / marshmallow | DRF serializers / forms |
| **Auto docs** | OpenAPI out-of-the-box | Flask-RESTX / Flasgger | drf-spectacular |
| **ORM** | Any (SQLAlchemy, Tortoise) | Any | Built-in Django ORM |
| **Admin panel** | No | No | Yes |
| **Learning curve** | Low-medium | Low | Medium-high |
| **Performance** | Very high | Medium | Medium |

**Choose FastAPI when:** building JSON APIs, microservices, ML model endpoints, or anything that benefits from async I/O and auto-generated docs.

**Choose Flask when:** small apps, prototyping, or when you want maximum flexibility with minimal opinions.

**Choose Django when:** full-stack web apps, projects needing the admin panel, auth system, and ORM out of the box.

\`\`\`python
# FastAPI — validation and docs for free
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    price: float

@app.post("/items/", response_model=Item)
async def create_item(item: Item):
    return item
\`\`\``,
      tags: ["fundamentals", "comparison"],
    },
    {
      id: "path-query-parameters",
      title: "Path & Query Parameters",
      difficulty: "easy",
      question: "How do you declare path parameters and query parameters in FastAPI?",
      answer: `**Path parameters** are declared in the route string and matched by variable name in the function signature.

\`\`\`python
from fastapi import FastAPI

app = FastAPI()

@app.get("/items/{item_id}")
async def read_item(item_id: int):   # auto-converted from string, validated
    return {"item_id": item_id}
\`\`\`

**Query parameters** are any function parameters not present in the path. They are optional by default when given a default value.

\`\`\`python
@app.get("/items/")
async def list_items(
    skip: int = 0,
    limit: int = 10,
    q: str | None = None,   # optional
):
    return {"skip": skip, "limit": limit, "q": q}
# GET /items/?skip=5&limit=20&q=shoes
\`\`\`

**Validation with \`Path\` / \`Query\`:**

\`\`\`python
from fastapi import Path, Query

@app.get("/items/{item_id}")
async def read_item(
    item_id: int = Path(ge=1, le=1000, description="The item ID"),
    q: str = Query(min_length=3, max_length=50, default=None),
):
    return {"item_id": item_id, "q": q}
\`\`\`

FastAPI raises a **422 Unprocessable Entity** with a detailed JSON error body when validation fails.`,
      tags: ["routing", "validation"],
    },
    {
      id: "request-body-pydantic",
      title: "Request Body with Pydantic",
      difficulty: "easy",
      question: "How do you define and validate a request body using Pydantic models?",
      answer: `Declare a **Pydantic \`BaseModel\`** subclass and use it as a type hint on your route function parameter. FastAPI reads the JSON body, validates it, and provides the parsed model.

\`\`\`python
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()

class Item(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str | None = Field(default=None, max_length=500)
    price: float = Field(gt=0)
    tax: float | None = None

    model_config = {"str_strip_whitespace": True}

@app.post("/items/")
async def create_item(item: Item):
    total = item.price + (item.tax or 0)
    return {"name": item.name, "total": total}
\`\`\`

**Pydantic v2 highlights:**
- \`model_config\` dict replaces the inner \`class Config\`.
- \`model_dump()\` replaces \`dict()\`, \`model_validate()\` replaces \`parse_obj()\`.
- Rust-backed core makes validation ~10-50× faster than v1.

**Combining path, query, and body:**

\`\`\`python
@app.put("/items/{item_id}")
async def update_item(
    item_id: int,          # path
    q: str | None = None,  # query
    item: Item | None = None,  # body
):
    return {"item_id": item_id, "q": q, "item": item}
\`\`\``,
      tags: ["pydantic", "validation", "request-body"],
    },
    {
      id: "response-models",
      title: "Response Models",
      difficulty: "easy",
      question: "How do response models work in FastAPI and why are they useful?",
      answer: `Use \`response_model\` on a path operation decorator to declare what the response shape should be. FastAPI will filter and validate the output, and document it in OpenAPI.

\`\`\`python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class UserIn(BaseModel):
    username: str
    password: str
    email: str

class UserOut(BaseModel):
    username: str
    email: str
    # password intentionally absent — never returned

@app.post("/users/", response_model=UserOut)
async def create_user(user: UserIn):
    # Save user... password gets filtered out automatically
    return user   # FastAPI strips 'password' before sending
\`\`\`

**Why use response models:**
1. **Security** — strip sensitive fields (passwords, secrets).
2. **Documentation** — OpenAPI schema shows the exact response shape.
3. **Validation** — ensures your endpoint always returns what it promises.

**Common options:**

\`\`\`python
@app.get(
    "/items/{id}",
    response_model=Item,
    response_model_exclude_unset=True,   # only include fields that were set
    response_model_exclude={"internal_id"},  # exclude specific fields
)
async def get_item(id: int): ...
\`\`\`

**List responses:**

\`\`\`python
@app.get("/items/", response_model=list[Item])
async def list_items(): ...
\`\`\``,
      tags: ["response", "pydantic", "security"],
    },
    {
      id: "status-codes",
      title: "HTTP Status Codes",
      difficulty: "easy",
      question: "How do you set HTTP status codes in FastAPI?",
      answer: `Set the default success status code via \`status_code\` on the decorator. Import constants from \`fastapi\` for readability.

\`\`\`python
from fastapi import FastAPI, status

app = FastAPI()

@app.post("/items/", status_code=status.HTTP_201_CREATED)
async def create_item(name: str):
    return {"name": name}

@app.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(item_id: int):
    return  # 204 has no body
\`\`\`

**Returning a different status code dynamically:**

\`\`\`python
from fastapi import Response

@app.get("/items/{item_id}")
async def get_item(item_id: int, response: Response):
    item = db.get(item_id)
    if item is None:
        response.status_code = status.HTTP_404_NOT_FOUND
        return {"detail": "Not found"}
    return item
\`\`\`

**Common codes:**
| Code | Constant | Meaning |
|------|----------|---------|
| 200 | \`HTTP_200_OK\` | Default success |
| 201 | \`HTTP_201_CREATED\` | Resource created |
| 204 | \`HTTP_204_NO_CONTENT\` | Success, no body |
| 400 | \`HTTP_400_BAD_REQUEST\` | Client error |
| 401 | \`HTTP_401_UNAUTHORIZED\` | Not authenticated |
| 403 | \`HTTP_403_FORBIDDEN\` | Not authorized |
| 404 | \`HTTP_404_NOT_FOUND\` | Not found |
| 422 | \`HTTP_422_UNPROCESSABLE_ENTITY\` | Validation error (auto) |`,
      tags: ["http", "status-codes"],
    },
    {
      id: "async-route-handlers",
      title: "Async Route Handlers",
      difficulty: "easy",
      question: "When should you use async def vs def for route handlers in FastAPI?",
      answer: `FastAPI supports both \`async def\` and regular \`def\` route handlers.

**Use \`async def\` when your handler awaits I/O-bound coroutines** (database queries, HTTP calls, file I/O with async libs):

\`\`\`python
import httpx
from fastapi import FastAPI

app = FastAPI()

@app.get("/github/{user}")
async def get_github_user(user: str):
    async with httpx.AsyncClient() as client:
        r = await client.get(f"https://api.github.com/users/{user}")
    return r.json()
\`\`\`

**Use \`def\` for CPU-bound or blocking code** — FastAPI runs it in a thread-pool executor automatically so it doesn't block the event loop:

\`\`\`python
import time

@app.get("/slow")
def slow_endpoint():
    time.sleep(2)   # blocking — FastAPI offloads to threadpool
    return {"done": True}
\`\`\`

**Rules of thumb:**
| Scenario | Use |
|----------|-----|
| \`await\` async DB/HTTP clients | \`async def\` |
| Sync ORM (SQLAlchemy sync) | \`def\` |
| CPU-intensive (image processing, ML inference) | \`def\` (or offload to ProcessPoolExecutor) |
| Pure logic, no I/O | either; \`async def\` is fine |

> Never call blocking code inside \`async def\` without \`await\` or \`run_in_executor\` — it will stall the entire event loop.`,
      tags: ["async", "performance"],
    },
    {
      id: "http-methods",
      title: "HTTP Methods / Path Operations",
      difficulty: "easy",
      question: "What HTTP methods does FastAPI support and how do you use them?",
      answer: `FastAPI provides decorators for all standard HTTP methods on the \`FastAPI\` app instance (and \`APIRouter\`):

\`\`\`python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    price: float

@app.get("/items/")
async def list_items():
    return [{"id": 1, "name": "Widget"}]

@app.post("/items/", status_code=201)
async def create_item(item: Item):
    return {"id": 99, **item.model_dump()}

@app.get("/items/{item_id}")
async def get_item(item_id: int):
    return {"id": item_id}

@app.put("/items/{item_id}")
async def replace_item(item_id: int, item: Item):
    return {"id": item_id, **item.model_dump()}

@app.patch("/items/{item_id}")
async def partial_update(item_id: int, item: Item):
    # merge with existing record
    return {"id": item_id, **item.model_dump(exclude_unset=True)}

@app.delete("/items/{item_id}", status_code=204)
async def delete_item(item_id: int):
    return
\`\`\`

**Semantic conventions:**
- **GET** — read; idempotent, safe.
- **POST** — create; not idempotent.
- **PUT** — full replace; idempotent.
- **PATCH** — partial update; idempotent per RFC 5789 intent.
- **DELETE** — remove; idempotent.`,
      tags: ["routing", "http"],
    },

    // ───── MEDIUM ─────
    {
      id: "dependency-injection",
      title: "Dependency Injection with Depends",
      difficulty: "medium",
      question: "How does FastAPI's dependency injection system work?",
      answer: `FastAPI's DI system uses \`Depends\`. Any callable (function, class, generator) can be a dependency. FastAPI resolves the dependency graph automatically, caches results per request by default, and shares them across dependants.

**Simple function dependency:**

\`\`\`python
from fastapi import Depends, FastAPI, Query

app = FastAPI()

def common_params(skip: int = 0, limit: int = Query(default=10, le=100)):
    return {"skip": skip, "limit": limit}

@app.get("/items/")
async def list_items(params: dict = Depends(common_params)):
    return params

@app.get("/users/")
async def list_users(params: dict = Depends(common_params)):
    return params
\`\`\`

**Class-based dependency (preferred for complex state):**

\`\`\`python
class Paginator:
    def __init__(self, skip: int = 0, limit: int = 10):
        self.skip = skip
        self.limit = limit

@app.get("/products/")
async def list_products(pager: Paginator = Depends()):
    return {"skip": pager.skip, "limit": pager.limit}
\`\`\`

**Generator dependency (with cleanup):**

\`\`\`python
from sqlalchemy.ext.asyncio import AsyncSession

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise

@app.get("/orders/")
async def list_orders(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Order))
    return result.scalars().all()
\`\`\`

**Dependency caching:** by default each dependency is called once per request. Pass \`use_cache=False\` to \`Depends\` for a fresh call each time.`,
      tags: ["dependency-injection", "architecture"],
    },
    {
      id: "apirouter",
      title: "APIRouter",
      difficulty: "medium",
      question: "How do you structure a large FastAPI app with APIRouter?",
      answer: `\`APIRouter\` lets you split routes across multiple files (similar to Express Router or Flask Blueprints) and then include them in the main app.

**\`routers/items.py\`:**

\`\`\`python
from fastapi import APIRouter, Depends, HTTPException, status
from ..deps import get_db
from ..schemas import Item, ItemCreate

router = APIRouter(
    prefix="/items",
    tags=["items"],           # groups endpoints in Swagger UI
    dependencies=[Depends(get_current_user)],  # applied to all routes
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=list[Item])
async def list_items(db=Depends(get_db)):
    ...

@router.post("/", response_model=Item, status_code=status.HTTP_201_CREATED)
async def create_item(payload: ItemCreate, db=Depends(get_db)):
    ...
\`\`\`

**\`main.py\`:**

\`\`\`python
from fastapi import FastAPI
from .routers import items, users, orders

app = FastAPI()

app.include_router(items.router)
app.include_router(users.router)
app.include_router(orders.router, prefix="/v1")  # override prefix
\`\`\`

**Recommended project layout:**

\`\`\`
app/
├── main.py
├── deps.py          # shared dependencies
├── models.py        # SQLAlchemy models
├── schemas.py       # Pydantic schemas
└── routers/
    ├── items.py
    ├── users.py
    └── orders.py
\`\`\``,
      tags: ["architecture", "routing"],
    },
    {
      id: "middleware-cors",
      title: "Middleware & CORS",
      difficulty: "medium",
      question: "How do you add middleware and configure CORS in FastAPI?",
      answer: `**Custom middleware** using the \`@app.middleware("http")\` decorator or \`BaseHTTPMiddleware\`:

\`\`\`python
import time
from fastapi import FastAPI, Request

app = FastAPI()

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    duration = time.perf_counter() - start
    response.headers["X-Process-Time"] = str(duration)
    return response
\`\`\`

**Starlette \`BaseHTTPMiddleware\` (reusable class):**

\`\`\`python
from starlette.middleware.base import BaseHTTPMiddleware

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        print(f"{request.method} {request.url}")
        response = await call_next(request)
        print(f"Status: {response.status_code}")
        return response

app.add_middleware(LoggingMiddleware)
\`\`\`

**CORS** — add \`CORSMiddleware\` from Starlette:

\`\`\`python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://myapp.com", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Process-Time"],
    max_age=600,        # preflight cache seconds
)
\`\`\`

> \`allow_origins=["*"]\` disables \`allow_credentials\` — browsers reject credentialed requests to wildcard origins (CORS spec).`,
      tags: ["middleware", "cors", "security"],
    },
    {
      id: "exception-handlers",
      title: "Exception Handlers",
      difficulty: "medium",
      question: "How do you raise and handle HTTP exceptions in FastAPI, including custom ones?",
      answer: `**Built-in \`HTTPException\`:**

\`\`\`python
from fastapi import FastAPI, HTTPException, status

app = FastAPI()

@app.get("/items/{item_id}")
async def get_item(item_id: int):
    if item_id not in db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item {item_id} not found",
            headers={"X-Error": "item-missing"},
        )
    return db[item_id]
\`\`\`

**Custom exception class + handler:**

\`\`\`python
from fastapi import Request
from fastapi.responses import JSONResponse

class InsufficientFundsError(Exception):
    def __init__(self, balance: float, required: float):
        self.balance = balance
        self.required = required

@app.exception_handler(InsufficientFundsError)
async def funds_handler(request: Request, exc: InsufficientFundsError):
    return JSONResponse(
        status_code=402,
        content={
            "error": "insufficient_funds",
            "balance": exc.balance,
            "required": exc.required,
        },
    )

@app.post("/purchase/")
async def purchase(amount: float):
    if amount > wallet.balance:
        raise InsufficientFundsError(wallet.balance, amount)
    ...
\`\`\`

**Override the default 422 validation error handler:**

\`\`\`python
from fastapi.exceptions import RequestValidationError

@app.exception_handler(RequestValidationError)
async def validation_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": exc.body},
    )
\`\`\``,
      tags: ["error-handling", "exceptions"],
    },
    {
      id: "background-tasks",
      title: "Background Tasks",
      difficulty: "medium",
      question: "How do background tasks work in FastAPI?",
      answer: `FastAPI provides a \`BackgroundTasks\` parameter that runs functions after the response is sent, without making the client wait.

\`\`\`python
from fastapi import BackgroundTasks, FastAPI
import smtplib

app = FastAPI()

def send_welcome_email(email: str, username: str):
    # Runs AFTER response is returned — client doesn't wait
    print(f"Sending welcome email to {email} for {username}")
    # smtplib.sendmail(...)

@app.post("/register/")
async def register_user(
    username: str,
    email: str,
    background_tasks: BackgroundTasks,
):
    user = create_user(username, email)
    background_tasks.add_task(send_welcome_email, email, username)
    return {"message": "User created", "id": user.id}
\`\`\`

**Background tasks in dependencies:**

\`\`\`python
def log_activity(background_tasks: BackgroundTasks, action: str):
    background_tasks.add_task(write_audit_log, action)
    return action

@app.post("/items/")
async def create_item(
    item: Item,
    background_tasks: BackgroundTasks,
    action: str = Depends(log_activity),
):
    ...
\`\`\`

**Caveats:**
- Background tasks run in the same process/event loop — not suitable for long CPU-bound work.
- For heavy jobs, use a task queue: **Celery**, **ARQ**, **Dramatiq**, or **FastAPI-TaskIQ**.
- Tasks share memory but not the request/response scope.`,
      tags: ["background-tasks", "async"],
    },
    {
      id: "lifespan-events",
      title: "Lifespan Events",
      difficulty: "medium",
      question: "How do you manage startup and shutdown logic in FastAPI using lifespan?",
      answer: `Since FastAPI 0.93 (Starlette 0.27), the recommended approach is the **\`lifespan\` async context manager**, replacing the deprecated \`@app.on_event\` decorators.

\`\`\`python
from contextlib import asynccontextmanager
from fastapi import FastAPI
import httpx
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

engine = None
SessionLocal = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── STARTUP ──────────────────────────────────────────────
    global engine, SessionLocal
    engine = create_async_engine("postgresql+asyncpg://...")
    SessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    app.state.http_client = httpx.AsyncClient()
    print("App started — DB engine and HTTP client ready")

    yield   # <── app runs here

    # ── SHUTDOWN ─────────────────────────────────────────────
    await app.state.http_client.aclose()
    await engine.dispose()
    print("App shut down — connections closed")

app = FastAPI(lifespan=lifespan)

@app.get("/")
async def root():
    return {"status": "ok"}
\`\`\`

**Why \`lifespan\` over \`on_event\`:**
- Single place for both startup and shutdown — easier to reason about.
- Works correctly with pytest's \`TestClient\` and ASGI lifespan protocol.
- Compatible with dependency injection patterns (the \`yield\` makes cleanup symmetric).

> \`@app.on_event("startup")\` still works in FastAPI 0.115 but is **deprecated** — migrate to \`lifespan\`.`,
      tags: ["lifecycle", "startup", "shutdown"],
    },
    {
      id: "authentication-jwt",
      title: "Authentication — OAuth2 & JWT",
      difficulty: "medium",
      question: "How do you implement JWT authentication using OAuth2PasswordBearer in FastAPI?",
      answer: `FastAPI ships with \`OAuth2PasswordBearer\` and \`OAuth2PasswordRequestForm\` to implement a standard OAuth2 password flow with JWT tokens.

\`\`\`python
from datetime import datetime, timedelta, timezone
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import jwt   # PyJWT
from pydantic import BaseModel

SECRET_KEY = "supersecret"   # use env var in production
ALGORITHM = "HS256"

app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

class TokenData(BaseModel):
    sub: str

def create_access_token(sub: str, expires_minutes: int = 30) -> str:
    payload = {
        "sub": sub,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=expires_minutes),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        data = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return TokenData(sub=data["sub"])
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )

@app.post("/auth/token")
async def login(form: OAuth2PasswordRequestForm = Depends()):
    # Verify form.username / form.password against DB
    if not authenticate_user(form.username, form.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    token = create_access_token(sub=form.username)
    return {"access_token": token, "token_type": "bearer"}

@app.get("/me")
async def me(user: TokenData = Depends(get_current_user)):
    return {"username": user.sub}
\`\`\`

Swagger UI at \`/docs\` automatically shows the **Authorize** button using the \`tokenUrl\`.`,
      tags: ["auth", "jwt", "security", "oauth2"],
    },
    {
      id: "settings-management",
      title: "Settings Management with pydantic-settings",
      difficulty: "medium",
      question: "How do you manage application settings in FastAPI using pydantic-settings?",
      answer: `**pydantic-settings** (v2) reads environment variables and \`.env\` files into a strongly-typed Pydantic model — replaces \`python-dotenv\` + manual parsing.

\`\`\`python
# config.py
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import AnyHttpUrl, PostgresDsn

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    app_name: str = "My API"
    debug: bool = False
    database_url: PostgresDsn
    secret_key: str
    allowed_origins: list[AnyHttpUrl] = []
    access_token_expire_minutes: int = 30

from functools import lru_cache

@lru_cache
def get_settings() -> Settings:
    return Settings()   # reads .env once, cached for the app lifetime
\`\`\`

\`\`\`python
# main.py
from fastapi import FastAPI, Depends
from .config import Settings, get_settings

app = FastAPI()

@app.get("/info")
async def info(settings: Settings = Depends(get_settings)):
    return {"app_name": settings.app_name, "debug": settings.debug}
\`\`\`

**\`.env\` file:**
\`\`\`
DATABASE_URL=postgresql+asyncpg://user:pass@localhost/mydb
SECRET_KEY=supersecretkey
DEBUG=false
\`\`\`

**Why \`lru_cache\`:** \`BaseSettings.__init__\` reads disk I/O on every call; caching makes it free after the first call. Pass \`get_settings\` directly to \`Depends()\` — FastAPI calls it once per request but the cache returns the same object.`,
      tags: ["configuration", "pydantic-settings", "env"],
    },
    {
      id: "file-uploads",
      title: "File Uploads",
      difficulty: "medium",
      question: "How do you handle file uploads in FastAPI?",
      answer: `FastAPI supports file uploads via \`File\` and \`UploadFile\`. \`UploadFile\` is preferred — it uses spooled temp files and exposes async methods.

\`\`\`python
from fastapi import FastAPI, File, UploadFile, HTTPException
import aiofiles
import uuid

app = FastAPI()

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_SIZE = 5 * 1024 * 1024  # 5 MB

@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, "Only JPEG/PNG/WebP images allowed")

    contents = await file.read()
    if len(contents) > MAX_SIZE:
        raise HTTPException(413, "File too large (max 5 MB)")

    filename = f"{uuid.uuid4()}{file.filename[file.filename.rfind('.'):]}"
    async with aiofiles.open(f"uploads/{filename}", "wb") as f:
        await f.write(contents)

    return {"filename": filename, "size": len(contents)}
\`\`\`

**Multiple files:**

\`\`\`python
@app.post("/upload-many/")
async def upload_many(files: list[UploadFile] = File(...)):
    results = []
    for file in files:
        content = await file.read()
        results.append({"name": file.filename, "size": len(content)})
    return results
\`\`\`

**Mixed form data + file:**

\`\`\`python
from fastapi import Form

@app.post("/profile/")
async def update_profile(
    username: str = Form(...),
    avatar: UploadFile = File(None),
):
    return {"username": username, "has_avatar": avatar is not None}
\`\`\`

> Remember to \`await file.seek(0)\` if you need to read the file contents more than once.`,
      tags: ["file-upload", "forms"],
    },
    {
      id: "openapi-docs",
      title: "OpenAPI & Swagger Auto-Docs",
      difficulty: "medium",
      question: "How does FastAPI auto-generate OpenAPI documentation and how do you customize it?",
      answer: `FastAPI generates an OpenAPI 3.x schema from your type hints, Pydantic models, and decorator metadata — no extra libraries required.

**Built-in endpoints:**
- \`/openapi.json\` — raw OpenAPI schema.
- \`/docs\` — Swagger UI.
- \`/redoc\` — ReDoc.

**Customize app-level metadata:**

\`\`\`python
app = FastAPI(
    title="My Inventory API",
    description="Manage products and orders",
    version="2.1.0",
    contact={"name": "Support", "email": "api@example.com"},
    license_info={"name": "MIT"},
    openapi_tags=[
        {"name": "items", "description": "CRUD for items"},
        {"name": "users", "description": "User management"},
    ],
)
\`\`\`

**Enrich individual endpoints:**

\`\`\`python
@app.post(
    "/items/",
    summary="Create an item",
    description="Creates a new item. Requires auth.",
    response_description="The created item",
    tags=["items"],
    operation_id="create_item_v2",
    deprecated=False,
)
async def create_item(item: Item):
    ...
\`\`\`

**Pydantic schema examples (v2):**

\`\`\`python
class Item(BaseModel):
    name: str
    price: float

    model_config = {
        "json_schema_extra": {
            "examples": [{"name": "Widget", "price": 9.99}]
        }
    }
\`\`\`

**Disable docs in production:**

\`\`\`python
app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)
\`\`\``,
      tags: ["openapi", "swagger", "documentation"],
    },

    // ───── HARD ─────
    {
      id: "websockets",
      title: "WebSockets",
      difficulty: "hard",
      question: "How do you implement WebSocket endpoints in FastAPI, including connection management?",
      answer: `FastAPI exposes WebSockets via \`@app.websocket\` and the \`WebSocket\` class from Starlette.

**Basic echo endpoint:**

\`\`\`python
from fastapi import FastAPI, WebSocket, WebSocketDisconnect

app = FastAPI()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Echo: {data}")
    except WebSocketDisconnect:
        print("Client disconnected")
\`\`\`

**Connection manager for broadcast (chat room pattern):**

\`\`\`python
class ConnectionManager:
    def __init__(self):
        self.active: list[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)

    def disconnect(self, ws: WebSocket):
        self.active.remove(ws)

    async def broadcast(self, message: str):
        for ws in self.active:
            await ws.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/{client_id}")
async def chat(websocket: WebSocket, client_id: str):
    await manager.connect(websocket)
    await manager.broadcast(f"{client_id} joined")
    try:
        while True:
            msg = await websocket.receive_text()
            await manager.broadcast(f"{client_id}: {msg}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast(f"{client_id} left")
\`\`\`

**Authentication with query parameter:**

\`\`\`python
@app.websocket("/ws/secure")
async def secure_ws(
    websocket: WebSocket,
    token: str = Query(...),
):
    user = verify_token(token)
    if not user:
        await websocket.close(code=1008)  # Policy Violation
        return
    await websocket.accept()
    ...
\`\`\`

**JSON messaging:**

\`\`\`python
data = await websocket.receive_json()
await websocket.send_json({"type": "ack", "id": data["id"]})
\`\`\``,
      tags: ["websockets", "real-time"],
    },
    {
      id: "async-sqlalchemy",
      title: "Async SQLAlchemy Integration",
      difficulty: "hard",
      question: "How do you integrate async SQLAlchemy with FastAPI for database access?",
      answer: `FastAPI works naturally with SQLAlchemy's async extension (\`asyncio\` dialect) using \`AsyncSession\` and \`create_async_engine\`.

**Setup (\`db.py\`):**

\`\`\`python
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

DATABASE_URL = "postgresql+asyncpg://user:pass@localhost/mydb"

engine = create_async_engine(DATABASE_URL, pool_size=10, max_overflow=20, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

class Base(DeclarativeBase):
    pass
\`\`\`

**Model (\`models.py\`):**

\`\`\`python
from sqlalchemy.orm import Mapped, mapped_column
from .db import Base

class Item(Base):
    __tablename__ = "items"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(index=True)
    price: Mapped[float]
\`\`\`

**Dependency (\`deps.py\`):**

\`\`\`python
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from .db import AsyncSessionLocal

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
\`\`\`

**Router using the dependency:**

\`\`\`python
from fastapi import APIRouter, Depends
from sqlalchemy import select
from .models import Item
from .deps import get_db

router = APIRouter(prefix="/items", tags=["items"])

@router.get("/", response_model=list[ItemSchema])
async def list_items(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Item).order_by(Item.id))
    return result.scalars().all()

@router.post("/", response_model=ItemSchema, status_code=201)
async def create_item(payload: ItemCreate, db: AsyncSession = Depends(get_db)):
    item = Item(**payload.model_dump())
    db.add(item)
    await db.flush()        # get the generated id without committing
    await db.refresh(item)
    return item
\`\`\`

**Alembic async migrations:** configure \`env.py\` with \`run_async_migrations()\` using \`AsyncEngine.begin()\`.`,
      tags: ["database", "sqlalchemy", "async", "orm"],
    },
    {
      id: "testing",
      title: "Testing FastAPI with TestClient & pytest",
      difficulty: "hard",
      question: "How do you test FastAPI applications using TestClient and pytest, including dependency overrides?",
      answer: `FastAPI's \`TestClient\` wraps Starlette's test client, which uses \`httpx\` under the hood. It runs the ASGI app synchronously inside tests.

**Basic test:**

\`\`\`python
# tests/test_items.py
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_list_items():
    response = client.get("/items/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_create_item():
    response = client.post("/items/", json={"name": "Gadget", "price": 29.99})
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Gadget"
\`\`\`

**Overriding dependencies (replace DB with test DB):**

\`\`\`python
from app.deps import get_db
from app.db import Base
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

TEST_DB = "sqlite+aiosqlite:///./test.db"
test_engine = create_async_engine(TEST_DB)
TestingSession = async_sessionmaker(test_engine, expire_on_commit=False)

async def override_get_db():
    async with TestingSession() as session:
        yield session

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
async def setup_db():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
\`\`\`

**Testing async with \`AsyncClient\` (httpx):**

\`\`\`python
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.anyio
async def test_async_create():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        r = await ac.post("/items/", json={"name": "X", "price": 1.0})
    assert r.status_code == 201
\`\`\`

**Testing WebSockets:**

\`\`\`python
def test_websocket():
    with client.websocket_connect("/ws") as ws:
        ws.send_text("hello")
        assert ws.receive_text() == "Echo: hello"
\`\`\``,
      tags: ["testing", "pytest", "testclient"],
    },
    {
      id: "advanced-dependency-patterns",
      title: "Advanced Dependency Patterns",
      difficulty: "hard",
      question: "What are advanced patterns for FastAPI's dependency injection — security scopes, sub-dependencies, and yield-based resource management?",
      answer: `**Security scopes** — fine-grained permission model on top of OAuth2:

\`\`\`python
from fastapi.security import OAuth2PasswordBearer, SecurityScopes
from fastapi import Security

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="token",
    scopes={"items:read": "Read items", "items:write": "Write items"},
)

async def get_current_user(
    security_scopes: SecurityScopes,
    token: str = Depends(oauth2_scheme),
):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        token_scopes = payload.get("scopes", [])
        for scope in security_scopes.scopes:
            if scope not in token_scopes:
                raise HTTPException(403, f"Scope {scope!r} required")
        return payload
    except jwt.PyJWTError:
        raise HTTPException(401, "Could not validate credentials")

@app.get("/items/", dependencies=[Security(get_current_user, scopes=["items:read"])])
async def list_items(): ...
\`\`\`

**Sub-dependencies — composing dependency graphs:**

\`\`\`python
async def get_token(authorization: str = Header(...)) -> str:
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer":
        raise HTTPException(401, "Bad scheme")
    return token

async def get_user(token: str = Depends(get_token)) -> User:
    return decode_and_fetch_user(token)

async def require_admin(user: User = Depends(get_user)) -> User:
    if not user.is_admin:
        raise HTTPException(403, "Admins only")
    return user

@app.delete("/users/{id}")
async def delete_user(id: int, admin: User = Depends(require_admin)):
    ...
\`\`\`

**Shared async resources via \`lru_cache\` + lifespan:**

\`\`\`python
@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.redis = await aioredis.from_url("redis://localhost")
    yield
    await app.state.redis.close()

async def get_redis(request: Request) -> Redis:
    return request.app.state.redis

@app.get("/cache/{key}")
async def read_cache(key: str, redis: Redis = Depends(get_redis)):
    return await redis.get(key)
\`\`\`

**Dependency caching control:**
- \`Depends(fn)\` — cached per request (default).
- \`Depends(fn, use_cache=False)\` — fresh call every time.`,
      tags: ["dependency-injection", "security", "advanced"],
    },
    {
      id: "pydantic-v2-advanced",
      title: "Pydantic v2 Advanced Features",
      difficulty: "hard",
      question: "What advanced Pydantic v2 features are most useful in FastAPI applications?",
      answer: `**Custom validators with \`@field_validator\` and \`@model_validator\`:**

\`\`\`python
from pydantic import BaseModel, field_validator, model_validator, Field
from typing import Self

class Order(BaseModel):
    item_count: int = Field(gt=0)
    discount: float = Field(ge=0, le=1)
    total: float

    @field_validator("total")
    @classmethod
    def total_must_be_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("total must be positive")
        return round(v, 2)

    @model_validator(mode="after")
    def check_discount_vs_total(self) -> Self:
        if self.discount > 0.5 and self.total < 100:
            raise ValueError("50%+ discount only on orders ≥ $100")
        return self
\`\`\`

**Computed fields:**

\`\`\`python
from pydantic import computed_field

class Rectangle(BaseModel):
    width: float
    height: float

    @computed_field
    @property
    def area(self) -> float:
        return self.width * self.height
\`\`\`

**Strict mode and coercion:**

\`\`\`python
class StrictItem(BaseModel):
    model_config = {"strict": True}  # "1" won't coerce to int — raises error
    price: int
\`\`\`

**Custom serializers:**

\`\`\`python
from pydantic import field_serializer
from datetime import datetime

class Event(BaseModel):
    occurred_at: datetime

    @field_serializer("occurred_at")
    def serialize_dt(self, dt: datetime) -> str:
        return dt.isoformat()
\`\`\`

**Discriminated unions (type narrowing):**

\`\`\`python
from typing import Annotated, Union
from pydantic import Discriminator, Tag

class Cat(BaseModel):
    type: Literal["cat"]
    meows: bool

class Dog(BaseModel):
    type: Literal["dog"]
    barks: bool

Animal = Annotated[Union[Cat, Dog], Field(discriminator="type")]

class Shelter(BaseModel):
    residents: list[Animal]
\`\`\`

These patterns let you build rich, self-documenting API contracts that are automatically reflected in the OpenAPI schema.`,
      tags: ["pydantic", "validation", "advanced"],
    },
    {
      id: "performance-deployment",
      title: "Performance Tuning & Deployment",
      difficulty: "hard",
      question: "How do you tune FastAPI performance and deploy it to production?",
      answer: `**Server configuration — Uvicorn with Gunicorn:**

\`\`\`bash
# Production: Gunicorn spawns multiple Uvicorn worker processes
gunicorn app.main:app \\
  -w 4 \\                       # workers = 2 × CPU cores + 1
  -k uvicorn.workers.UvicornWorker \\
  --bind 0.0.0.0:8000 \\
  --timeout 30 \\
  --graceful-timeout 10 \\
  --keep-alive 5
\`\`\`

**Connection pool sizing (SQLAlchemy async):**

\`\`\`python
engine = create_async_engine(
    DATABASE_URL,
    pool_size=10,          # persistent connections
    max_overflow=20,       # temporary burst connections
    pool_pre_ping=True,    # discard stale connections
    pool_recycle=3600,     # recycle connections every hour
)
\`\`\`

**Response caching with \`fastapi-cache2\`:**

\`\`\`python
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from fastapi_cache.decorator import cache

@app.get("/expensive/")
@cache(expire=60)
async def expensive_endpoint():
    return await compute_heavy_result()
\`\`\`

**Avoid N+1 queries** — use \`selectinload\` / \`joinedload\`:

\`\`\`python
from sqlalchemy.orm import selectinload

result = await db.execute(
    select(User).options(selectinload(User.orders))
)
\`\`\`

**Dockerfile (multi-stage):**

\`\`\`dockerfile
FROM python:3.12-slim AS builder
WORKDIR /app
COPY pyproject.toml .
RUN pip install --no-cache-dir uv && uv sync --frozen

FROM python:3.12-slim
WORKDIR /app
COPY --from=builder /app/.venv .venv
COPY . .
ENV PATH="/app/.venv/bin:$PATH"
CMD ["gunicorn", "app.main:app", "-k", "uvicorn.workers.UvicornWorker", "-w", "4", "-b", "0.0.0.0:8000"]
\`\`\`

**Key production checklist:**
- Set \`debug=False\` and disable \`/docs\` + \`/redoc\` endpoints.
- Use structured logging (JSON) + correlation IDs via middleware.
- Add Prometheus metrics (\`prometheus-fastapi-instrumentator\`).
- Run behind a reverse proxy (nginx/Caddy) for TLS termination and rate limiting.`,
      tags: ["performance", "deployment", "production"],
    },
  ],
};
