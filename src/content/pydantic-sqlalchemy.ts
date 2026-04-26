import type { Category } from "./types";

export const pydanticSqlalchemy: Category = {
  slug: "pydantic-sqlalchemy",
  title: "Pydantic & SQLAlchemy",
  description:
    "Pydantic v2 and SQLAlchemy 2.x: data validation, serialization, ORM declarative mapping, async sessions, relationship loading strategies, Alembic migrations, and production patterns for Python backends.",
  icon: "🔩",
  questions: [
    // ───── EASY ─────
    {
      id: "pydantic-basemodel-basics",
      title: "What is Pydantic's BaseModel?",
      difficulty: "easy",
      question: "What is Pydantic's `BaseModel` and what does it give you out of the box?",
      answer: `**Pydantic's \`BaseModel\`** is the base class for all data models in Pydantic. It parses, validates, and serializes data automatically using Python type annotations.

**What you get for free**
- **Validation on construction** — invalid data raises \`ValidationError\` with structured error details.
- **Type coercion** — e.g. the string \`"42"\` is coerced to \`int\` where declared.
- **Serialization** — \`model_dump()\` → \`dict\`, \`model_dump_json()\` → JSON string.
- **JSON Schema** — \`Model.model_json_schema()\` returns a JSON Schema dict.
- **IDE support** — full autocomplete and type checking via normal annotations.

\`\`\`python
from pydantic import BaseModel

class User(BaseModel):
    id: int
    name: str
    email: str

u = User(id="1", name="Alice", email="alice@example.com")
print(u.id)          # 1  (coerced from str)
print(u.model_dump()) # {'id': 1, 'name': 'Alice', 'email': 'alice@example.com'}
\`\`\`

In **Pydantic v2** (2023+) the validation core is rewritten in Rust (\`pydantic-core\`), making it 5–50× faster than v1 for most workloads.`,
      tags: ["pydantic", "fundamentals", "validation"],
    },
    {
      id: "pydantic-field",
      title: "Using Field() for metadata and constraints",
      difficulty: "easy",
      question: "How do you use `Field()` in Pydantic v2 to add constraints and metadata to a model field?",
      answer: `**\`Field()\`** from \`pydantic\` lets you attach metadata, default values, and validation constraints directly to a model field.

\`\`\`python
from pydantic import BaseModel, Field

class Product(BaseModel):
    name: str = Field(min_length=1, max_length=100, description="Product name")
    price: float = Field(gt=0, description="Price in USD")
    quantity: int = Field(default=0, ge=0, lt=10_000)
    sku: str = Field(pattern=r"^[A-Z]{3}-\\d{4}$")

# Raises ValidationError: price must be > 0
Product(name="Widget", price=-5.0, sku="WGT-0001")
\`\`\`

**Common \`Field()\` parameters**
| Parameter | Meaning |
|---|---|
| \`default\` / \`default_factory\` | Default value or callable |
| \`gt\`, \`ge\`, \`lt\`, \`le\` | Numeric comparisons |
| \`min_length\`, \`max_length\` | String / list length |
| \`pattern\` | Regex for strings |
| \`description\` | Shown in JSON Schema / docs |
| \`alias\` | Alternative field name for parsing |
| \`exclude\` | Exclude from \`model_dump()\` |

In v2 the numeric constraints use Python's \`annotated_types\` protocol under the hood, so they compose cleanly with \`Annotated[]\`.`,
      tags: ["pydantic", "field", "validation"],
    },
    {
      id: "pydantic-nested-models",
      title: "Nested Pydantic models",
      difficulty: "easy",
      question: "How do you model nested/hierarchical data with Pydantic v2?",
      answer: `Pydantic validates nested models **recursively**. Declare a field's type as another \`BaseModel\` subclass and Pydantic handles coercion, validation, and serialization at every level.

\`\`\`python
from pydantic import BaseModel
from typing import List

class Address(BaseModel):
    street: str
    city: str
    zip_code: str

class Order(BaseModel):
    id: int
    item: str
    quantity: int

class Customer(BaseModel):
    name: str
    address: Address
    orders: List[Order] = []

data = {
    "name": "Alice",
    "address": {"street": "1 Main St", "city": "Springfield", "zip_code": "12345"},
    "orders": [{"id": 1, "item": "Widget", "quantity": 3}],
}

customer = Customer(**data)
print(customer.address.city)           # Springfield
print(customer.model_dump())           # full nested dict
print(customer.model_dump_json())      # full nested JSON string
\`\`\`

**Key behaviours**
- A nested dict is **automatically coerced** into the nested model.
- \`model_dump()\` recursively serializes nested models to dicts.
- \`model_dump(mode="json")\` applies JSON-safe serialization (e.g. \`datetime\` → ISO string).`,
      tags: ["pydantic", "nested", "models"],
    },
    {
      id: "pydantic-model-dump",
      title: "model_dump() and model_dump_json()",
      difficulty: "easy",
      question: "What are `model_dump()` and `model_dump_json()` in Pydantic v2, and how do they differ from v1's `.dict()` and `.json()`?",
      answer: `In **Pydantic v2** the serialisation API was renamed for clarity:

| v1 | v2 | Returns |
|---|---|---|
| \`.dict()\` | \`.model_dump()\` | Python \`dict\` |
| \`.json()\` | \`.model_dump_json()\` | JSON \`str\` (via Rust serialiser) |

\`\`\`python
from pydantic import BaseModel
from datetime import datetime

class Event(BaseModel):
    name: str
    ts: datetime

e = Event(name="launch", ts=datetime(2026, 1, 1, 12, 0))

e.model_dump()
# {'name': 'launch', 'ts': datetime(2026, 1, 1, 12, 0)}

e.model_dump(mode="json")
# {'name': 'launch', 'ts': '2026-01-01T12:00:00'}

e.model_dump_json()
# '{"name":"launch","ts":"2026-01-01T12:00:00"}'
\`\`\`

**Useful keyword args (both methods)**
- \`include\` / \`exclude\` — limit fields returned.
- \`exclude_unset\` — omit fields the caller never set (great for PATCH endpoints).
- \`exclude_none\` — omit \`None\` values.
- \`by_alias\` — use field aliases instead of Python names.

The v1 methods still exist as deprecated shims in v2 for backwards compatibility.`,
      tags: ["pydantic", "serialization", "v2"],
    },
    {
      id: "pydantic-v1-vs-v2",
      title: "Pydantic v1 vs v2 key differences",
      difficulty: "easy",
      question: "What are the most important differences between Pydantic v1 and v2?",
      answer: `**Pydantic v2** (released 2023, stable by 2024) was a near-complete rewrite with several breaking changes.

**Core changes**
| Area | v1 | v2 |
|---|---|---|
| Validation core | Pure Python | **Rust** (\`pydantic-core\`) — 5–50× faster |
| Validator decorator | \`@validator\` | \`@field_validator\`, \`@model_validator\` |
| Config class | \`class Config\` inner class | \`model_config = ConfigDict(…)\` |
| Serialisation | \`.dict()\`, \`.json()\` | \`.model_dump()\`, \`.model_dump_json()\` |
| Custom types | \`__get_validators__\` | \`__get_pydantic_core_schema__\` |
| Schema export | \`.schema()\` | \`.model_json_schema()\` |
| Strict mode | Per-field only | Global or per-field |

\`\`\`python
# v1
class M(BaseModel):
    x: int
    @validator("x")
    def positive(cls, v):
        assert v > 0; return v
    class Config:
        anystr_strip_whitespace = True

# v2 equivalent
from pydantic import BaseModel, field_validator, ConfigDict
class M(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    x: int
    @field_validator("x")
    @classmethod
    def positive(cls, v: int) -> int:
        assert v > 0; return v
\`\`\`

The v1 compat shim (\`from pydantic.v1 import …\`) lets you incrementally migrate libraries.`,
      tags: ["pydantic", "v1", "v2", "migration"],
    },
    {
      id: "sqlalchemy-core-vs-orm",
      title: "SQLAlchemy Core vs ORM",
      difficulty: "easy",
      question: "What is the difference between SQLAlchemy Core and the SQLAlchemy ORM?",
      answer: `**SQLAlchemy** has two distinct layers that can be used independently or together.

**Core**
- A schema-aware SQL expression language.
- You write SQL using Python objects (\`select()\`, \`insert()\`, \`Table\`, \`Column\`).
- Results are \`Row\` objects (tuple-like), not model instances.
- Best for: data pipelines, bulk ops, DBA-level control.

\`\`\`python
from sqlalchemy import create_engine, text, Table, Column, Integer, String, MetaData

engine = create_engine("postgresql+psycopg://user:pw@localhost/db")
meta = MetaData()
users = Table("users", meta, Column("id", Integer), Column("name", String))

with engine.connect() as conn:
    rows = conn.execute(users.select().where(users.c.name == "Alice"))
    for row in rows:
        print(row.id, row.name)
\`\`\`

**ORM**
- Maps Python classes to tables via the **declarative** system.
- A \`Session\` tracks objects and implements the **Unit of Work** pattern.
- Relationships, lazy/eager loading, and identity map are managed automatically.

\`\`\`python
from sqlalchemy.orm import Session
with Session(engine) as session:
    user = session.get(User, 1)
    user.name = "Bob"  # tracked automatically
    session.commit()
\`\`\`

In **SQLAlchemy 2.x** the Core and ORM share the same \`select()\` construct; the distinction is mainly in *how you execute* and *what you get back*.`,
      tags: ["sqlalchemy", "core", "orm", "fundamentals"],
    },
    {
      id: "sqlalchemy-declarative-mapping",
      title: "Declarative mapping with Mapped[] and mapped_column()",
      difficulty: "easy",
      question: "How do you define an ORM model in SQLAlchemy 2.x using the new declarative style?",
      answer: `SQLAlchemy 2.x introduced **typed declarative mapping** with \`Mapped[T]\` and \`mapped_column()\`, replacing the older \`Column()\`-only approach.

\`\`\`python
from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from typing import Optional, List

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255), unique=True)
    bio: Mapped[Optional[str]] = mapped_column(default=None)

    posts: Mapped[List["Post"]] = relationship(back_populates="author")

class Post(Base):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    author: Mapped["User"] = relationship(back_populates="posts")
\`\`\`

**Benefits of the 2.x style**
- \`Mapped[T]\` carries nullability: \`Mapped[str]\` → NOT NULL, \`Mapped[Optional[str]]\` → nullable.
- Full **mypy / pyright** type inference — \`user.name\` is typed as \`str\`, not \`Column\`.
- \`mapped_column()\` accepts all the same \`Column\` kwargs (\`index\`, \`server_default\`, etc.).`,
      tags: ["sqlalchemy", "orm", "declarative", "mapped_column"],
    },

    // ───── MEDIUM ─────
    {
      id: "pydantic-field-validator",
      title: "@field_validator in Pydantic v2",
      difficulty: "medium",
      question: "How does `@field_validator` work in Pydantic v2, and how does it differ from v1's `@validator`?",
      answer: `**\`@field_validator\`** is the v2 replacement for \`@validator\`. It must be a \`@classmethod\` and receives the value after type coercion by default.

\`\`\`python
from pydantic import BaseModel, field_validator, ValidationInfo

class UserCreate(BaseModel):
    username: str
    password: str
    confirm_password: str

    @field_validator("username")
    @classmethod
    def username_alphanumeric(cls, v: str) -> str:
        if not v.isalnum():
            raise ValueError("Username must be alphanumeric")
        return v.lower()

    @field_validator("confirm_password", mode="after")
    @classmethod
    def passwords_match(cls, v: str, info: ValidationInfo) -> str:
        if "password" in info.data and v != info.data["password"]:
            raise ValueError("Passwords do not match")
        return v
\`\`\`

**Key differences from v1 \`@validator\`**
| | v1 \`@validator\` | v2 \`@field_validator\` |
|---|---|---|
| Must be classmethod | Optional | **Required** |
| Receives value | Raw (pre-coercion by default) | Post-coercion by default |
| Access other fields | via \`values\` dict kwarg | via \`ValidationInfo.data\` |
| Mode | \`pre=True/False\` | \`mode="before"\` / \`"after"\` / \`"wrap"\` |
| Multiple fields | One decorator | Pass multiple field names |

\`mode="before"\` runs before type coercion; \`mode="wrap"\` lets you call the inner validator yourself and inspect/override the result.`,
      tags: ["pydantic", "validation", "field_validator", "v2"],
    },
    {
      id: "pydantic-model-validator",
      title: "@model_validator for cross-field validation",
      difficulty: "medium",
      question: "When would you use `@model_validator` in Pydantic v2, and what are the `mode` options?",
      answer: `**\`@model_validator\`** validates or transforms the entire model — useful when validation logic spans multiple fields.

\`\`\`python
from pydantic import BaseModel, model_validator
from typing import Self

class DateRange(BaseModel):
    start: int   # year
    end: int

    @model_validator(mode="after")
    def check_range(self) -> Self:
        if self.end <= self.start:
            raise ValueError("end must be after start")
        return self

class RawInput(BaseModel):
    payload: dict

    @model_validator(mode="before")
    @classmethod
    def flatten(cls, data: dict) -> dict:
        # transform raw dict before individual field validation
        if "nested" in data:
            data["payload"] = data.pop("nested")
        return data
\`\`\`

**Mode comparison**
| \`mode\` | Receives | When it runs |
|---|---|---|
| \`"before"\` | Raw input (\`dict\` / \`Any\`) | Before field parsing; must be \`@classmethod\` |
| \`"after"\` | Fully validated model instance | After all fields are set; returns \`Self\` |
| \`"wrap"\` | Raw input + \`ModelWrapValidator\` | Manual control; call handler yourself |

Use \`"after"\` for the common cross-field check pattern. Use \`"before"\` to reshape incoming data (e.g. camelCase → snake_case, envelope unwrapping).`,
      tags: ["pydantic", "model_validator", "validation"],
    },
    {
      id: "pydantic-model-config",
      title: "model_config and ConfigDict",
      difficulty: "medium",
      question: "How do you configure Pydantic v2 model behaviour with `model_config` and `ConfigDict`?",
      answer: `In Pydantic v2 the inner \`class Config\` was replaced by the class variable \`model_config\` set to a \`ConfigDict\` instance.

\`\`\`python
from pydantic import BaseModel, ConfigDict

class APIResponse(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,    # accept both alias and field name
        str_strip_whitespace=True,
        frozen=True,              # immutable; enables hashing
        extra="forbid",           # raise on unknown fields
        use_enum_values=True,     # store .value, not the enum member
        json_schema_extra={"examples": [{"user_id": 1}]},
    )

    user_id: int
    display_name: str
\`\`\`

**Frequently used options**
| Option | Effect |
|---|---|
| \`extra="forbid"\` | Raises on unknown fields (good for strict APIs) |
| \`extra="ignore"\` | Silently drops unknown fields (default) |
| \`frozen=True\` | Model is immutable; \`__hash__\` is generated |
| \`populate_by_name=True\` | Allow either alias or field name during parsing |
| \`validate_default=True\` | Run validators on default values |
| \`arbitrary_types_allowed=True\` | Allow non-Pydantic types (e.g. numpy arrays) |
| \`from_attributes=True\` | Allow constructing from ORM objects (\`orm_mode\` in v1) |

The \`from_attributes=True\` option is especially important when combining Pydantic with SQLAlchemy ORM objects (the v1 \`orm_mode = True\`).`,
      tags: ["pydantic", "config", "model_config"],
    },
    {
      id: "pydantic-computed-fields",
      title: "Computed fields and @computed_field",
      difficulty: "medium",
      question: "How do you add computed/derived fields to a Pydantic v2 model?",
      answer: `**\`@computed_field\`** (new in Pydantic v2.0) turns a \`@property\` into a field that is included in \`model_dump()\`, \`model_dump_json()\`, and the JSON Schema.

\`\`\`python
from pydantic import BaseModel, computed_field
from typing import Annotated

class Rectangle(BaseModel):
    width: float
    height: float

    @computed_field
    @property
    def area(self) -> float:
        return self.width * self.height

    @computed_field(repr=False)          # hide from __repr__
    @property
    def perimeter(self) -> float:
        return 2 * (self.width + self.height)

r = Rectangle(width=3.0, height=4.0)
print(r.area)                    # 12.0
print(r.model_dump())            # {'width': 3.0, 'height': 4.0, 'area': 12.0, 'perimeter': 14.0}
\`\`\`

**Notes**
- The return type annotation is **required** so Pydantic can build the JSON Schema.
- Computed fields are **read-only** — setting them raises \`AttributeError\`.
- Use \`@computed_field(alias="...")\` to control the serialised key name.
- They appear in \`model_json_schema()\` under \`"properties"\`.

Before \`@computed_field\` existed, people used \`@validator\` / root validators or \`__init__\` overrides, all of which were more fragile.`,
      tags: ["pydantic", "computed_field", "serialization"],
    },
    {
      id: "pydantic-discriminated-unions",
      title: "Discriminated unions in Pydantic v2",
      difficulty: "medium",
      question: "What are discriminated unions in Pydantic and when should you use them?",
      answer: `A **discriminated union** (also called a tagged union) is a \`Union\` type where a literal field (the *discriminator*) tells Pydantic which concrete model to use, making validation faster and error messages clearer.

\`\`\`python
from typing import Literal, Union, Annotated
from pydantic import BaseModel, Field

class Cat(BaseModel):
    type: Literal["cat"]
    meows_per_day: int

class Dog(BaseModel):
    type: Literal["dog"]
    breed: str

class Bird(BaseModel):
    type: Literal["bird"]
    wingspan_cm: float

Pet = Annotated[Union[Cat, Dog, Bird], Field(discriminator="type")]

class Owner(BaseModel):
    name: str
    pet: Pet

owner = Owner(name="Alice", pet={"type": "dog", "breed": "Labrador"})
print(type(owner.pet))   # <class 'Dog'>
\`\`\`

**Why use them?**
- **Performance**: Pydantic jumps directly to the correct model instead of trying each branch.
- **Clear errors**: "value is not a valid Cat" instead of a cascade of failures.
- **JSON Schema**: generates \`oneOf\` with the discriminator documented.

**Alternative with \`Annotated\` and \`__discriminator__\`**
You can also use a class-level discriminator for Pydantic dataclasses or models that don't share a common literal field, using \`Field(discriminator=...)\` pointing to a custom \`Discriminator\` callable in v2.8+.`,
      tags: ["pydantic", "discriminated-union", "typing"],
    },
    {
      id: "pydantic-settings",
      title: "pydantic-settings for configuration management",
      difficulty: "medium",
      question: "How do you manage application configuration with `pydantic-settings`?",
      answer: `**\`pydantic-settings\`** (a separate package, formerly \`pydantic.BaseSettings\`) provides \`BaseSettings\`, which loads configuration from environment variables and \`.env\` files with full Pydantic validation.

\`\`\`python
# pip install pydantic-settings
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import PostgresDsn, RedisDsn, SecretStr

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        env_prefix="APP_",          # reads APP_DATABASE_URL, etc.
        case_sensitive=False,
    )

    database_url: PostgresDsn
    redis_url: RedisDsn = "redis://localhost:6379/0"
    secret_key: SecretStr           # never appears in repr/logs
    debug: bool = False
    allowed_hosts: list[str] = ["localhost"]

settings = Settings()               # reads env / .env automatically
print(settings.database_url)
print(settings.secret_key.get_secret_value())   # explicit reveal
\`\`\`

**Loading priority (highest to lowest)**
1. Values passed directly at instantiation
2. Environment variables
3. \`.env\` file
4. Field defaults

**Tips**
- Use \`@lru_cache\` on a \`get_settings()\` factory for FastAPI dependency injection.
- \`SecretStr\` prevents accidental logging of passwords.
- Supports multiple \`.env\` files via \`env_file=(".env", ".env.local")\`.`,
      tags: ["pydantic", "settings", "configuration", "environment"],
    },
    {
      id: "sqlalchemy-session-unit-of-work",
      title: "Session and the Unit of Work pattern",
      difficulty: "medium",
      question: "How does SQLAlchemy's `Session` implement the Unit of Work pattern?",
      answer: `The **Unit of Work** (UoW) pattern tracks all changes to objects in memory and flushes them to the database in a single batch — usually at commit time.

\`\`\`python
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

engine = create_engine("postgresql+psycopg://user:pw@localhost/db")

with Session(engine) as session:
    # 1. Load objects — tracked in the identity map
    user = session.get(User, 1)

    # 2. Mutate — Session marks object as "dirty"
    user.name = "Bob"

    # 3. Add new objects
    post = Post(title="Hello World", author=user)
    session.add(post)

    # 4. Delete
    old_post = session.get(Post, 99)
    session.delete(old_post)

    # 5. Flush + commit — ONE round-trip with all changes
    session.commit()
\`\`\`

**Key concepts**
| Concept | Description |
|---|---|
| **Identity map** | One Python object per primary key per session — prevents duplicate fetches |
| **Dirty tracking** | SQLAlchemy instruments attribute access; changes are detected automatically |
| **Flush** | Sends pending SQL to the DB *within the transaction* (can query the flushed state) |
| **Commit** | Flushes + commits the transaction |
| **Rollback** | Reverts all unflushed / uncommitted changes |

**Always use the context manager** (\`with Session(engine) as s\`) to ensure the session is closed and connections are returned to the pool.`,
      tags: ["sqlalchemy", "session", "unit-of-work", "orm"],
    },
    {
      id: "sqlalchemy-lazy-eager-loading",
      title: "Lazy vs eager loading — selectinload and joinedload",
      difficulty: "medium",
      question: "What is lazy loading in SQLAlchemy ORM and how do you switch to eager loading with `selectinload` or `joinedload`?",
      answer: `**Lazy loading** means SQLAlchemy issues a separate SQL query *on first attribute access* of a relationship. This is convenient but causes the **N+1 problem**.

\`\`\`python
# Lazy (default) — N+1 problem: 1 query for users + N queries for posts
users = session.scalars(select(User)).all()
for u in users:
    print(u.posts)   # triggers a new SELECT per user
\`\`\`

**Eager loading strategies**

\`selectinload\` — issues a single \`SELECT … WHERE id IN (…)\` for the related objects:
\`\`\`python
from sqlalchemy.orm import selectinload

users = session.scalars(
    select(User).options(selectinload(User.posts))
).all()
# 2 queries total: one for users, one for all their posts
\`\`\`

\`joinedload\` — uses a SQL JOIN to load related objects in the same query:
\`\`\`python
from sqlalchemy.orm import joinedload

user = session.scalar(
    select(User)
    .where(User.id == 1)
    .options(joinedload(User.posts))
)
# 1 query with LEFT OUTER JOIN
\`\`\`

**When to use which**
| Strategy | Best for |
|---|---|
| \`selectinload\` | Collections (one-to-many); avoids row duplication |
| \`joinedload\` | Many-to-one / single related object; or when JOIN is cheap |
| \`subqueryload\` | Legacy; prefer \`selectinload\` in SQLAlchemy 2.x |

You can also set \`lazy="selectin"\` on the \`relationship()\` definition to make it the default for that relationship.`,
      tags: ["sqlalchemy", "loading", "n+1", "selectinload", "joinedload"],
    },
    {
      id: "sqlalchemy-async-session",
      title: "Async sessions with AsyncSession",
      difficulty: "medium",
      question: "How do you use SQLAlchemy's async ORM with `AsyncSession`?",
      answer: `SQLAlchemy 2.x has first-class \`asyncio\` support via \`AsyncEngine\` and \`AsyncSession\`, backed by async drivers such as \`asyncpg\` (Postgres) or \`aiosqlite\` (SQLite).

\`\`\`python
from sqlalchemy.ext.asyncio import (
    create_async_engine, AsyncSession, async_sessionmaker
)
from sqlalchemy.orm import selectinload
from sqlalchemy import select

engine = create_async_engine(
    "postgresql+asyncpg://user:pw@localhost/db",
    pool_size=10,
    echo=False,
)

AsyncSessionLocal = async_sessionmaker(
    engine, expire_on_commit=False, class_=AsyncSession
)

async def get_user_with_posts(user_id: int) -> User | None:
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(User)
            .where(User.id == user_id)
            .options(selectinload(User.posts))
        )
        return result.scalar_one_or_none()
\`\`\`

**Important caveats**
- **Lazy loading is forbidden** with \`AsyncSession\` by default — accessing \`user.posts\` without eager loading raises \`MissingGreenlet\`. Always eager-load what you need.
- Use \`expire_on_commit=False\` so object attributes remain accessible after commit without re-querying.
- Pair with \`async_scoped_session\` for per-request session scoping in web frameworks.

**FastAPI integration pattern**
\`\`\`python
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

@router.get("/users/{id}")
async def read_user(id: int, db: AsyncSession = Depends(get_db)):
    return await get_user_with_posts(id)
\`\`\``,
      tags: ["sqlalchemy", "async", "asyncio", "asyncsession"],
    },

    // ───── HARD ─────
    {
      id: "pydantic-custom-types",
      title: "Custom Pydantic v2 types with __get_pydantic_core_schema__",
      difficulty: "hard",
      question: "How do you create a fully custom type for Pydantic v2, including validation and serialization, using `__get_pydantic_core_schema__`?",
      answer: `In Pydantic v2 every type ultimately compiles down to a **pydantic-core schema** (Rust struct). To plug in a custom type you implement \`__get_pydantic_core_schema__\` as a classmethod (or via an \`Annotated\` marker).

\`\`\`python
from __future__ import annotations
from typing import Any
from pydantic import GetCoreSchemaHandler
from pydantic_core import core_schema

class PositiveEven(int):
    """An integer that must be positive and even."""

    @classmethod
    def __get_pydantic_core_schema__(
        cls, source_type: Any, handler: GetCoreSchemaHandler
    ) -> core_schema.CoreSchema:
        return core_schema.no_info_plain_validator_function(
            cls._validate,
            serialization=core_schema.plain_serializer_function_ser_schema(int),
        )

    @classmethod
    def _validate(cls, value: Any) -> "PositiveEven":
        v = int(value)
        if v <= 0:
            raise ValueError(f"{v} is not positive")
        if v % 2 != 0:
            raise ValueError(f"{v} is not even")
        return cls(v)

# Usage
from pydantic import BaseModel

class Config(BaseModel):
    batch_size: PositiveEven

Config(batch_size="8")    # ok — PositiveEven(8)
Config(batch_size=7)      # ValidationError: not even
Config(batch_size=-2)     # ValidationError: not positive
\`\`\`

**Schema building blocks (core_schema.*)**
- \`int_schema()\`, \`str_schema()\`, \`float_schema()\` — primitive schemas.
- \`no_info_plain_validator_function(fn)\` — arbitrary Python callable.
- \`with_info_plain_validator_function(fn)\` — receives \`ValidationInfo\`.
- \`union_schema([...])\` — try each schema in order.

This approach integrates fully with JSON Schema generation, \`model_dump()\`, and Pydantic's error formatting.`,
      tags: ["pydantic", "custom-types", "core_schema", "advanced"],
    },
    {
      id: "pydantic-typeadapter",
      title: "TypeAdapter for validating non-model types",
      difficulty: "hard",
      question: "What is `TypeAdapter` in Pydantic v2 and when would you use it instead of `BaseModel`?",
      answer: `**\`TypeAdapter\`** lets you apply Pydantic validation and serialization to *any* Python type — not just \`BaseModel\` subclasses. It is useful for validating lists, dicts, primitives, or arbitrary generics at the call site without defining a wrapper model.

\`\`\`python
from pydantic import TypeAdapter
from typing import List
from datetime import datetime

# Validate a list of datetimes
ta = TypeAdapter(List[datetime])
result = ta.validate_python(["2026-01-01T00:00:00", "2026-06-15T12:30:00"])
# [datetime(2026, 1, 1, 0, 0), datetime(2026, 6, 15, 12, 30)]

# Validate JSON bytes directly
raw = b'["2026-01-01T00:00:00"]'
ta.validate_json(raw)

# Serialise
ta.dump_python(result, mode="json")
# ['2026-01-01T00:00:00', '2026-06-15T12:30:00']

# JSON Schema
ta.json_schema()
# {'type': 'array', 'items': {'type': 'string', 'format': 'date-time'}}
\`\`\`

**Common use cases**
- Validating request body items that are not top-level models (e.g. \`list[int]\`).
- Using Pydantic in a framework that supplies its own base class.
- Reusing validation logic without constructing a full model class.
- Building generic utility functions: \`def parse_env_var(t: type[T], raw: str) -> T: return TypeAdapter(t).validate_python(raw)\`.

**Performance tip**: instantiate \`TypeAdapter\` once (module-level or cached) — it compiles the schema on construction.`,
      tags: ["pydantic", "typeadapter", "validation", "advanced"],
    },
    {
      id: "sqlalchemy-n-plus-one",
      title: "Diagnosing and fixing the N+1 problem",
      difficulty: "hard",
      question: "What is the N+1 query problem in SQLAlchemy ORM and what are the strategies to fix it?",
      answer: `The **N+1 problem** occurs when you load N parent objects and then trigger one additional query *per parent* to load a related collection, resulting in N+1 round-trips to the database.

**Reproducing the problem**
\`\`\`python
# 1 query: SELECT * FROM users
users = session.scalars(select(User)).all()

# N queries: SELECT * FROM posts WHERE author_id = ?  (one per user)
for user in users:
    for post in user.posts:      # lazy load fires here
        print(post.title)
\`\`\`

**Fix 1 — selectinload (recommended for collections)**
\`\`\`python
users = session.scalars(
    select(User).options(selectinload(User.posts))
).all()
# Total: 2 queries regardless of N
\`\`\`

**Fix 2 — joinedload (good for many-to-one)**
\`\`\`python
posts = session.scalars(
    select(Post).options(joinedload(Post.author))
).unique().all()
\`\`\`

**Fix 3 — contains_eager (when you write the JOIN yourself)**
\`\`\`python
from sqlalchemy.orm import contains_eager

posts = session.scalars(
    select(Post)
    .join(Post.author)
    .options(contains_eager(Post.author))
    .where(User.name == "Alice")
).all()
\`\`\`

**Fix 4 — Set lazy="selectin" on the relationship**
\`\`\`python
class User(Base):
    posts: Mapped[List["Post"]] = relationship(lazy="selectin")
\`\`\`

**Detecting N+1 in production**
- Log all SQL: \`create_engine(..., echo=True)\`.
- Use \`sqlalchemy-query-count\` middleware or OpenTelemetry tracing to surface query counts per request.
- Profile with \`sqlalchemy.event.listen(engine, "after_cursor_execute", callback)\`.`,
      tags: ["sqlalchemy", "n+1", "performance", "eager-loading"],
    },
    {
      id: "alembic-migrations",
      title: "Alembic migrations with SQLAlchemy 2.x",
      difficulty: "hard",
      question: "How do you set up and use Alembic for database migrations with a SQLAlchemy 2.x declarative model?",
      answer: `**Alembic** is the de-facto migration tool for SQLAlchemy. It tracks schema history in a \`alembic_version\` table and generates migration scripts from model diffs.

**Setup**
\`\`\`bash
pip install alembic
alembic init alembic          # creates alembic.ini and alembic/ directory
\`\`\`

**\`alembic/env.py\` — point at your models and engine**
\`\`\`python
from myapp.db import Base, engine   # your DeclarativeBase and engine

target_metadata = Base.metadata

def run_migrations_online():
    with engine.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()
\`\`\`

**Workflow**
\`\`\`bash
# Auto-generate a migration from model changes
alembic revision --autogenerate -m "add users table"

# Review the generated script in alembic/versions/
# Then apply
alembic upgrade head

# Roll back one step
alembic downgrade -1

# Show current state
alembic current

# Show history
alembic history --verbose
\`\`\`

**Generated migration script example**
\`\`\`python
def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )

def downgrade() -> None:
    op.drop_table("users")
\`\`\`

**Caveats**
- Autogenerate **does not detect** column renames, certain constraint changes, or data migrations — always review generated scripts.
- For async engines wrap the connection in a synchronous context via \`run_sync\` in env.py.
- Use \`alembic check\` in CI to fail the build if unapplied model changes exist.`,
      tags: ["alembic", "migrations", "sqlalchemy", "devops"],
    },
    {
      id: "sqlalchemy-hybrid-properties",
      title: "Hybrid properties and SQL expressions",
      difficulty: "hard",
      question: "What are SQLAlchemy hybrid properties and how do they let you use the same logic in Python and SQL?",
      answer: `A **hybrid property** is a descriptor that behaves differently at the instance level (Python) and the class level (SQL expression). This lets you write business logic once and use it both in Python code and in SQLAlchemy \`WHERE\` clauses.

\`\`\`python
from sqlalchemy.ext.hybrid import hybrid_property, hybrid_method
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, func, select

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    first_name: Mapped[str] = mapped_column(String(50))
    last_name: Mapped[str] = mapped_column(String(50))

    @hybrid_property
    def full_name(self) -> str:
        """Python-level: string concat."""
        return f"{self.first_name} {self.last_name}"

    @full_name.expression
    @classmethod
    def full_name(cls):
        """SQL-level: database string concat."""
        return func.concat(cls.first_name, " ", cls.last_name)

    @hybrid_method
    def name_starts_with(self, prefix: str) -> bool:
        return self.first_name.startswith(prefix)

    @name_starts_with.expression
    @classmethod
    def name_starts_with(cls, prefix: str):
        return cls.first_name.like(f"{prefix}%")
\`\`\`

**Usage**
\`\`\`python
# Instance level (Python)
user = session.get(User, 1)
print(user.full_name)          # "Alice Smith"

# Query level (SQL)
users = session.scalars(
    select(User).where(User.full_name == "Alice Smith")
).all()
# WHERE concat(first_name, ' ', last_name) = 'Alice Smith'

users = session.scalars(
    select(User).where(User.name_starts_with("Al"))
).all()
# WHERE first_name LIKE 'Al%'
\`\`\`

Hybrid properties are ideal for computed columns that should be filterable without database-level generated columns.`,
      tags: ["sqlalchemy", "hybrid-property", "orm", "advanced"],
    },
    {
      id: "sqlalchemy-connection-pooling",
      title: "Connection pooling and async pool configuration",
      difficulty: "hard",
      question: "How does SQLAlchemy's connection pooling work and what parameters matter most in production?",
      answer: `SQLAlchemy manages a **connection pool** so your application reuses database connections rather than opening a new TCP connection per query.

**Default pool: \`QueuePool\`**
\`\`\`python
from sqlalchemy import create_engine
from sqlalchemy.pool import NullPool, AsyncAdaptedQueuePool

engine = create_engine(
    "postgresql+psycopg://user:pw@localhost/db",
    pool_size=10,            # max persistent connections
    max_overflow=20,         # extra connections allowed when pool is full
    pool_timeout=30,         # seconds to wait for a free connection
    pool_recycle=1800,       # recycle connections older than 30 min (avoids stale TCP)
    pool_pre_ping=True,      # test connection with SELECT 1 before using it
)
\`\`\`

**Async engine**
\`\`\`python
from sqlalchemy.ext.asyncio import create_async_engine

async_engine = create_async_engine(
    "postgresql+asyncpg://user:pw@localhost/db",
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True,
)
\`\`\`

**Pool classes**
| Class | Use case |
|---|---|
| \`QueuePool\` | Default; FIFO queue of connections |
| \`NullPool\` | No pooling; new connection per request (serverless/Lambda) |
| \`StaticPool\` | Single shared connection (in-memory SQLite tests) |
| \`AsyncAdaptedQueuePool\` | Async version of QueuePool |

**Production tips**
- Set \`pool_pre_ping=True\` to handle connections dropped by firewalls (especially on RDS with idle timeouts).
- \`pool_recycle\` should be less than the DB/firewall idle timeout (e.g. < 8h for MySQL default, < 10m for some cloud proxies).
- For PgBouncer (transaction-mode pooling) set \`NullPool\` or \`pool_size=1\` per worker since PgBouncer handles pooling itself.
- Monitor \`pool.size()\`, \`pool.checkedin()\`, and \`pool.overflow()\` with your observability stack.`,
      tags: ["sqlalchemy", "connection-pool", "production", "performance"],
    },
    {
      id: "sqlalchemy-events-and-hooks",
      title: "SQLAlchemy events and the event system",
      difficulty: "hard",
      question: "How do SQLAlchemy events work and what are practical use cases for `listen()` and `listens_for()`?",
      answer: `SQLAlchemy has a comprehensive **event system** covering the connection, engine, session, mapper, and instance lifecycle. You hook into it with \`event.listen()\` or the \`@event.listens_for()\` decorator.

**Engine-level events — audit logging**
\`\`\`python
from sqlalchemy import event

@event.listens_for(engine, "before_cursor_execute")
def log_query(conn, cursor, statement, parameters, context, executemany):
    import logging
    logging.debug("SQL: %s | PARAMS: %s", statement, parameters)
\`\`\`

**Session events — soft delete**
\`\`\`python
from sqlalchemy import event
from datetime import datetime, timezone

@event.listens_for(Session, "before_flush")
def soft_delete_on_flush(session, flush_context, instances):
    for obj in list(session.deleted):
        if hasattr(obj, "deleted_at"):
            obj.deleted_at = datetime.now(timezone.utc)
            session.expunge(obj)   # remove from deleted set
            session.add(obj)       # re-add as dirty (UPDATE not DELETE)
\`\`\`

**Mapper events — automatic timestamps**
\`\`\`python
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import event
from datetime import datetime, timezone

class Base(DeclarativeBase):
    pass

class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now(timezone.utc))

@event.listens_for(TimestampMixin, "before_update", propagate=True)
def update_timestamp(mapper, connection, target):
    target.updated_at = datetime.now(timezone.utc)
\`\`\`

**Other useful events**
| Target | Event | Use case |
|---|---|---|
| \`Engine\` | \`"connect"\` | Set session variables (\`SET timezone\`) |
| \`Session\` | \`"after_commit"\` | Invalidate cache after writes |
| \`Mapper\` | \`"before_insert"\` | Generate slugs or UUIDs |
| \`Connection\` | \`"begin"\` | Multi-tenant schema switching |`,
      tags: ["sqlalchemy", "events", "hooks", "advanced"],
    },
    {
      id: "pydantic-sqlalchemy-integration",
      title: "Integrating Pydantic v2 with SQLAlchemy 2.x",
      difficulty: "hard",
      question: "What is the recommended pattern for integrating Pydantic v2 schemas with SQLAlchemy 2.x ORM models in a FastAPI application?",
      answer: `The cleanest pattern maintains a **strict separation** between SQLAlchemy ORM models (persistence) and Pydantic schemas (API contract), connected by \`from_attributes=True\` and explicit mapping.

**Layer structure**
\`\`\`
models/     SQLAlchemy ORM classes (source of truth for DB schema)
schemas/    Pydantic models (request/response shapes)
services/   business logic; maps between the two
\`\`\`

**SQLAlchemy model**
\`\`\`python
# models/user.py
class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    posts: Mapped[List["Post"]] = relationship(lazy="selectin")
\`\`\`

**Pydantic schemas**
\`\`\`python
# schemas/user.py
from pydantic import BaseModel, ConfigDict, EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    password: str             # plain text — never stored as-is

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)  # replaces orm_mode

    id: int
    email: EmailStr
    post_count: int = 0

    @classmethod
    def from_orm(cls, user: "User") -> "UserOut":
        return cls(id=user.id, email=user.email, post_count=len(user.posts))
\`\`\`

**FastAPI endpoint**
\`\`\`python
@router.post("/users", response_model=UserOut, status_code=201)
async def create_user(body: UserCreate, db: AsyncSession = Depends(get_db)):
    user = User(
        email=body.email,
        hashed_password=hash_password(body.password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return UserOut.from_orm(user)
\`\`\`

**Key rules**
- Never expose \`hashed_password\` in output schemas — separation of models prevents leakage.
- Use \`model_config = ConfigDict(from_attributes=True)\` on all response schemas.
- \`await db.refresh(user)\` reloads server-generated columns (e.g. \`created_at\`, sequences) after commit.
- Validate at the boundary (Pydantic on input, Pydantic on output); keep ORM models free of validation logic.`,
      tags: ["pydantic", "sqlalchemy", "fastapi", "integration", "architecture"],
    },
  ],
};
