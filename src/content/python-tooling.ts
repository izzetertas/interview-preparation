import type { Category } from "./types";

export const pythonTooling: Category = {
  slug: "python-tooling",
  title: "Python Testing & Tooling",
  description:
    "Python testing with pytest, fixtures, mocking, and async; plus modern tooling: uv, ruff, mypy, pyproject.toml, pre-commit, tox, and CI/CD.",
  icon: "🛠️",
  questions: [
    // ───── EASY ─────
    {
      id: "pytest-basics",
      title: "pytest basics",
      difficulty: "easy",
      question: "How does pytest discover and run tests? What does a minimal test look like?",
      answer: `**pytest** is Python's de-facto test runner. It discovers tests automatically and requires no boilerplate classes.

**Discovery rules (defaults):**
- Searches directories matching \`testpaths\` (or cwd).
- Collects files matching \`test_*.py\` or \`*_test.py\`.
- Inside those files: functions named \`test_*\` and methods named \`test_*\` inside \`Test*\` classes.

**Minimal test:**
\`\`\`python
# test_math.py
def add(a, b):
    return a + b

def test_add():
    assert add(2, 3) == 5

def test_add_negative():
    assert add(-1, 1) == 0
\`\`\`

Run with:
\`\`\`sh
pytest               # discover and run all tests
pytest test_math.py  # specific file
pytest -v            # verbose (test names + pass/fail)
pytest -k "add"      # filter by name substring
pytest -x            # stop on first failure
\`\`\`

**Assertions:**
- Use plain \`assert\` — pytest rewrites it to show detailed diffs on failure.
- No need for \`assertEqual\`, \`assertIn\`, etc.

\`\`\`python
def test_list():
    result = [1, 2, 3]
    assert 2 in result
    assert len(result) == 3

def test_raises():
    import pytest
    with pytest.raises(ValueError, match="invalid"):
        int("abc")
\`\`\`

**pytest.ini / pyproject.toml config:**
\`\`\`toml
[tool.pytest.ini_options]
testpaths = ["tests"]
addopts = "-v --tb=short"
\`\`\``,
      tags: ["pytest", "fundamentals"],
    },
    {
      id: "pytest-fixtures",
      title: "pytest fixtures",
      difficulty: "easy",
      question: "What are pytest fixtures and how do you write them?",
      answer: `**Fixtures** provide reusable setup/teardown for tests. They are injected by name into test function parameters.

\`\`\`python
import pytest

@pytest.fixture
def db_connection():
    conn = create_connection("sqlite:///:memory:")
    yield conn          # yield = setup done; code after yield = teardown
    conn.close()

def test_insert(db_connection):
    db_connection.execute("INSERT INTO users VALUES (1, 'Ada')")
    row = db_connection.execute("SELECT * FROM users").fetchone()
    assert row[1] == "Ada"
\`\`\`

**Key points:**
- Fixture name = parameter name — pytest injects automatically.
- \`yield\` separates setup from teardown (preferred over \`return\` when cleanup is needed).
- Fixtures can depend on other fixtures.

\`\`\`python
@pytest.fixture
def user(db_connection):
    db_connection.execute("INSERT INTO users VALUES (1, 'Ada')")
    return {"id": 1, "name": "Ada"}

def test_user_name(user):
    assert user["name"] == "Ada"
\`\`\`

**conftest.py** — place fixtures shared across multiple test files here. pytest automatically loads it.

\`\`\`python
# tests/conftest.py
import pytest

@pytest.fixture
def api_client():
    from myapp import create_app
    app = create_app(testing=True)
    with app.test_client() as client:
        yield client
\`\`\`

Any test file in \`tests/\` can use \`api_client\` without importing it.`,
      tags: ["pytest", "fixtures"],
    },
    {
      id: "fixture-scopes",
      title: "Fixture scopes",
      difficulty: "easy",
      question: "What are pytest fixture scopes and when do you use each?",
      answer: `Fixture scope controls **how often the fixture is set up and torn down**.

| Scope | Created once per… | Use case |
|-------|------------------|----------|
| \`function\` (default) | Each test function | Isolated state — DB rows, mutable objects |
| \`class\` | Each test class | Shared state across methods in one class |
| \`module\` | Each test file | Expensive setup shared across a file (e.g. heavy parse) |
| \`session\` | Entire test run | Very expensive setup (start a server, seed a DB once) |

\`\`\`python
import pytest

@pytest.fixture(scope="session")
def db():
    """Start DB once for the whole test run."""
    conn = create_engine("postgresql://localhost/test_db")
    seed_data(conn)
    yield conn
    conn.dispose()

@pytest.fixture(scope="function")
def transaction(db):
    """Wrap each test in a transaction and roll back."""
    with db.begin() as txn:
        yield db
        txn.rollback()

def test_create_user(transaction):
    transaction.execute("INSERT INTO users ...")
    # rolled back after this test
\`\`\`

**Rule of thumb:**
- Default to \`function\` scope for correctness.
- Use \`session\` for expensive read-only resources (Docker containers, loaded ML models).
- Combine: session-scoped DB + function-scoped transaction rollback = fast + isolated.

**\`autouse=True\`** — apply a fixture to every test in scope without declaring it as a parameter:

\`\`\`python
@pytest.fixture(autouse=True)
def reset_settings():
    yield
    settings.reset()   # always runs after each test
\`\`\``,
      tags: ["pytest", "fixtures"],
    },
    {
      id: "pytest-parametrize",
      title: "Parametrize",
      difficulty: "easy",
      question: "How does pytest.mark.parametrize work?",
      answer: `\`@pytest.mark.parametrize\` runs one test function with multiple inputs, avoiding copy-pasted test functions.

\`\`\`python
import pytest

def is_palindrome(s: str) -> bool:
    return s == s[::-1]

@pytest.mark.parametrize("word,expected", [
    ("racecar", True),
    ("hello",   False),
    ("level",   True),
    ("",        True),
])
def test_is_palindrome(word, expected):
    assert is_palindrome(word) == expected
\`\`\`

pytest reports each combination as a separate test: \`test_is_palindrome[racecar-True]\`, etc.

**Multiple parameters:**
\`\`\`python
@pytest.mark.parametrize("a,b,result", [
    (1, 2, 3),
    (0, 0, 0),
    (-1, 1, 0),
])
def test_add(a, b, result):
    assert a + b == result
\`\`\`

**IDs for readability:**
\`\`\`python
@pytest.mark.parametrize("value", [0, 1, 100], ids=["zero", "one", "big"])
def test_positive(value):
    assert value >= 0
\`\`\`

**Combining with fixtures:**
\`\`\`python
@pytest.fixture
def multiplier():
    return 3

@pytest.mark.parametrize("n", [1, 2, 5])
def test_multiply(n, multiplier):
    assert n * multiplier == n * 3
\`\`\`

**Indirect parametrize** (passes values through a fixture):
\`\`\`python
@pytest.fixture
def user(request):
    return create_user(role=request.param)

@pytest.mark.parametrize("user", ["admin", "guest"], indirect=True)
def test_access(user):
    ...
\`\`\``,
      tags: ["pytest", "parametrize"],
    },
    {
      id: "monkeypatch",
      title: "monkeypatch",
      difficulty: "easy",
      question: "What is pytest's monkeypatch fixture and when do you use it?",
      answer: `**monkeypatch** is a built-in pytest fixture that temporarily replaces attributes, environment variables, or dictionary values during a test — automatically restoring the original after the test.

**Patch an attribute:**
\`\`\`python
def get_user():
    import requests
    return requests.get("https://api.example.com/user").json()

def test_get_user(monkeypatch):
    def fake_get(url):
        class R:
            def json(self): return {"id": 1, "name": "Ada"}
        return R()

    monkeypatch.setattr("requests.get", fake_get)
    result = get_user()
    assert result["name"] == "Ada"
\`\`\`

**Patch environment variables:**
\`\`\`python
def test_env(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "sqlite:///:memory:")
    monkeypatch.delenv("SECRET_KEY", raising=False)
    # test code that reads os.environ
\`\`\`

**Patch dictionary:**
\`\`\`python
def test_config(monkeypatch):
    monkeypatch.setitem(config, "debug", True)
\`\`\`

**Patch sys.path / chdir:**
\`\`\`python
def test_file_lookup(monkeypatch, tmp_path):
    monkeypatch.chdir(tmp_path)
    (tmp_path / "data.json").write_text('{"ok": true}')
    result = load_config()
    assert result["ok"] is True
\`\`\`

**monkeypatch vs unittest.mock.patch:**
- \`monkeypatch\` — simpler for attribute swaps; pytest-native.
- \`unittest.mock.patch\` — more powerful (MagicMock, call assertions, context manager or decorator).
- In practice, use \`pytest-mock\` (\`mocker\` fixture) for mocking; \`monkeypatch\` for env/config patching.`,
      tags: ["pytest", "mocking"],
    },
    {
      id: "venv-uv",
      title: "Virtual environments & uv",
      difficulty: "easy",
      question: "How do Python virtual environments work, and what is uv?",
      answer: `**Virtual environment** isolates a project's Python packages from the system Python and from other projects.

**Built-in venv:**
\`\`\`sh
python -m venv .venv          # create
source .venv/bin/activate     # activate (Linux/Mac)
.venv\\Scripts\\activate        # activate (Windows)
pip install requests          # installs into .venv only
deactivate                    # exit
\`\`\`

**uv** — ultra-fast Python package manager written in Rust (Astral, 2024). In 2026 it is the modern default, replacing pip, venv, and often poetry.

\`\`\`sh
# Install uv
curl -Lsf https://astral.sh/uv/install.sh | sh

# Create project (replaces "poetry new")
uv init myproject
cd myproject

# Create venv + install deps (10-100x faster than pip)
uv sync

# Add a dependency
uv add requests
uv add --dev pytest ruff mypy

# Run in the venv without activating
uv run pytest
uv run python src/main.py

# Lock file (uv.lock) is generated automatically
\`\`\`

**Why uv is fast:**
- Written in Rust; parallel downloads and installs.
- Built-in resolver, no separate pip-compile step.
- Caches wheels globally across projects.

**Comparison:**

| Tool | Speed | Lock file | Virtual env | pyproject.toml |
|------|-------|-----------|-------------|----------------|
| pip | slow | no (pip-tools for this) | manual venv | partial |
| poetry | medium | yes | yes | yes |
| uv | very fast | yes | yes | yes |

**conda** is still used for data science (installs non-Python binary deps like CUDA), but for general Python projects uv is preferred.`,
      tags: ["tooling", "uv", "venv"],
    },
    {
      id: "pyproject-toml",
      title: "pyproject.toml",
      difficulty: "easy",
      question: "What is pyproject.toml and what goes in it?",
      answer: `**pyproject.toml** is the modern single source of truth for Python project metadata, dependencies, and tool configuration (PEP 517/518/621).

\`\`\`toml
[project]
name = "my-app"
version = "0.1.0"
description = "Example Python application"
requires-python = ">=3.12"
dependencies = [
    "fastapi>=0.111",
    "sqlalchemy>=2.0",
    "pydantic>=2.0",
]

[project.optional-dependencies]
dev = ["pytest", "ruff", "mypy"]

# ── uv / pip extras ──
[tool.uv]
dev-dependencies = [
    "pytest>=8",
    "pytest-cov",
    "pytest-asyncio",
    "ruff",
    "mypy",
    "pytest-mock",
]

# ── pytest ──
[tool.pytest.ini_options]
testpaths = ["tests"]
asyncio_mode = "auto"
addopts = "-v --tb=short"

# ── ruff ──
[tool.ruff]
line-length = 100
target-version = "py312"

[tool.ruff.lint]
select = ["E", "F", "I", "UP"]   # pycodestyle, pyflakes, isort, pyupgrade

# ── mypy ──
[tool.mypy]
strict = true
python_version = "3.12"

# ── coverage ──
[tool.coverage.run]
source = ["src"]
omit = ["tests/*"]

[tool.coverage.report]
fail_under = 80
\`\`\`

**Dependency groups** (uv / PEP 735):
- \`dev\` — linting, testing, type checking.
- \`docs\` — Sphinx, mkdocs.
- Groups are installed with \`uv sync --group dev\`.

**Lock file** (\`uv.lock\`) — pinned versions of every transitive dependency. Commit to version control so installs are reproducible.`,
      tags: ["tooling", "pyproject"],
    },
    {
      id: "ruff",
      title: "ruff",
      difficulty: "easy",
      question: "What is ruff and how has it changed Python linting?",
      answer: `**ruff** is an extremely fast Python linter and formatter written in Rust. In 2026 it has largely replaced flake8, black, isort, and pyupgrade.

**Install and run:**
\`\`\`sh
uv add --dev ruff

ruff check .            # lint
ruff check --fix .      # lint + auto-fix safe issues
ruff format .           # format (replaces black)
ruff format --check .   # check formatting without modifying
\`\`\`

**Speed:** ruff checks a 300k-line codebase in under 1 second (flake8 takes 30–60s).

**Config in pyproject.toml:**
\`\`\`toml
[tool.ruff]
line-length = 100
target-version = "py312"

[tool.ruff.lint]
select = [
    "E",   # pycodestyle errors
    "W",   # pycodestyle warnings
    "F",   # pyflakes
    "I",   # isort
    "UP",  # pyupgrade (modernize syntax)
    "B",   # flake8-bugbear
    "SIM", # flake8-simplify
    "RUF", # ruff-specific rules
]
ignore = ["E501"]  # line too long (handled by formatter)

[tool.ruff.lint.isort]
known-first-party = ["myapp"]

[tool.ruff.format]
quote-style = "double"
\`\`\`

**What ruff replaces:**

| Old tool | ruff equivalent |
|----------|----------------|
| flake8 | \`ruff check\` |
| black | \`ruff format\` |
| isort | \`ruff check\` with \`"I"\` rules |
| pyupgrade | \`ruff check\` with \`"UP"\` rules |
| autoflake | \`ruff check --fix\` |

**Editor integration:** VS Code extension, pre-commit hook, CI step — all use the same config.`,
      tags: ["tooling", "ruff", "linting"],
    },

    // ───── MEDIUM ─────
    {
      id: "pytest-mock",
      title: "pytest-mock & MagicMock",
      difficulty: "medium",
      question: "How do you mock objects with pytest-mock? Explain MagicMock, patch, and side_effect.",
      answer: `**pytest-mock** wraps \`unittest.mock\` and exposes it as the \`mocker\` fixture — automatically undoing patches after each test.

**mocker.patch — replace an attribute:**
\`\`\`python
def get_weather(city: str) -> dict:
    import httpx
    return httpx.get(f"https://api.weather.com/{city}").json()

def test_get_weather(mocker):
    mock_get = mocker.patch("httpx.get")
    mock_get.return_value.json.return_value = {"temp": 22}

    result = get_weather("London")
    assert result["temp"] == 22
    mock_get.assert_called_once_with("https://api.weather.com/London")
\`\`\`

**MagicMock** — auto-speccing mock that accepts any attribute access or call:
\`\`\`python
from unittest.mock import MagicMock

service = MagicMock()
service.get_user(1)                  # works, records call
service.get_user.assert_called_with(1)
service.get_user.return_value = {"id": 1}
\`\`\`

**side_effect — raise exceptions or dynamic returns:**
\`\`\`python
def test_retry_on_error(mocker):
    mock_call = mocker.patch("myapp.external_api")
    # First call raises, second succeeds
    mock_call.side_effect = [ConnectionError("timeout"), {"ok": True}]

    result = fetch_with_retry()
    assert result == {"ok": True}
    assert mock_call.call_count == 2
\`\`\`

**side_effect as a function:**
\`\`\`python
def dynamic_response(url):
    if "users" in url:
        return {"users": []}
    return {"error": "not found"}

mock_get.side_effect = dynamic_response
\`\`\`

**mocker.spy — wrap without replacing:**
\`\`\`python
def test_spy(mocker):
    spy = mocker.spy(mymodule, "calculate")
    mymodule.run()
    assert spy.call_count == 3
\`\`\`

**spec= — mock only real attributes:**
\`\`\`python
mock_user = mocker.MagicMock(spec=User)
mock_user.nonexistent_field  # raises AttributeError — catches typos
\`\`\``,
      tags: ["pytest", "mocking"],
    },
    {
      id: "async-testing",
      title: "Async testing with pytest-asyncio",
      difficulty: "medium",
      question: "How do you test async Python code with pytest-asyncio?",
      answer: `**pytest-asyncio** allows pytest to run \`async def\` test functions by managing the event loop.

**Install:**
\`\`\`sh
uv add --dev pytest-asyncio
\`\`\`

**Config (recommended — auto mode):**
\`\`\`toml
[tool.pytest.ini_options]
asyncio_mode = "auto"   # all async tests run automatically; no @pytest.mark.asyncio needed
\`\`\`

**Basic async test:**
\`\`\`python
import asyncio
import pytest
import httpx

async def fetch_user(client: httpx.AsyncClient, user_id: int) -> dict:
    response = await client.get(f"/users/{user_id}")
    response.raise_for_status()
    return response.json()

async def test_fetch_user():
    async with httpx.AsyncClient(base_url="http://test") as client:
        # use a mock transport or a running test server
        pass
\`\`\`

**Async fixtures:**
\`\`\`python
import pytest
from httpx import AsyncClient, ASGITransport
from myapp import app

@pytest.fixture
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac

async def test_list_users(client):
    response = await client.get("/users")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
\`\`\`

**Mocking async functions:**
\`\`\`python
async def test_service(mocker):
    mocker.patch("myapp.service.fetch_data", return_value={"data": []})
    # OR for async callables:
    async_mock = mocker.AsyncMock(return_value={"data": []})
    mocker.patch("myapp.service.fetch_data", async_mock)
\`\`\`

**Event loop scope (pytest-asyncio >= 0.23):**
\`\`\`python
@pytest.fixture(scope="session")
async def db_pool():
    pool = await asyncpg.create_pool(DATABASE_URL)
    yield pool
    await pool.close()
\`\`\`
Session-scoped async fixtures share one event loop across the session.`,
      tags: ["pytest", "async", "asyncio"],
    },
    {
      id: "pytest-cov",
      title: "Coverage with pytest-cov",
      difficulty: "medium",
      question: "How do you measure and enforce test coverage in Python?",
      answer: `**pytest-cov** integrates the \`coverage.py\` tool directly into pytest.

**Install:**
\`\`\`sh
uv add --dev pytest-cov
\`\`\`

**Run:**
\`\`\`sh
pytest --cov=src --cov-report=term-missing
pytest --cov=src --cov-report=html    # open htmlcov/index.html
pytest --cov=src --cov-fail-under=80  # fail if below 80%
\`\`\`

**Config in pyproject.toml:**
\`\`\`toml
[tool.coverage.run]
source = ["src"]
branch = true           # branch coverage (if/else arms)
omit = [
    "src/migrations/*",
    "src/*/management/commands/*",
]

[tool.coverage.report]
show_missing = true
fail_under = 80
exclude_lines = [
    "pragma: no cover",
    "if TYPE_CHECKING:",
    "raise NotImplementedError",
]
\`\`\`

**Branch coverage** — not just which lines ran, but which branches of conditionals were taken. More valuable than line coverage alone.

**Exclude lines:**
\`\`\`python
if TYPE_CHECKING:           # pragma: no cover
    from myapp import Model
\`\`\`

**CI integration (GitHub Actions):**
\`\`\`yaml
- name: Run tests with coverage
  run: uv run pytest --cov=src --cov-report=xml --cov-fail-under=80

- name: Upload coverage
  uses: codecov/codecov-action@v4
  with:
    files: coverage.xml
\`\`\`

**Coverage is a floor, not a goal:**
- 80% is a common minimum.
- Critical paths (auth, payments) should be near 100%.
- Don't write trivial tests just to hit a number.
- Mutation testing (mutmut) gives a stronger quality signal than line coverage.`,
      tags: ["pytest", "coverage"],
    },
    {
      id: "fastapi-testclient",
      title: "Testing FastAPI with TestClient",
      difficulty: "medium",
      question: "How do you test a FastAPI application?",
      answer: `FastAPI ships with a \`TestClient\` (built on \`httpx\`) that lets you make real HTTP calls to your app in tests — no server needed.

**Basic setup:**
\`\`\`python
# tests/conftest.py
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from myapp import create_app
from myapp.database import get_db, Base

engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
TestSession = sessionmaker(bind=engine)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(engine)
    yield
    Base.metadata.drop_all(engine)

@pytest.fixture
def db():
    session = TestSession()
    yield session
    session.close()

@pytest.fixture
async def client(db):
    app = create_app()
    app.dependency_overrides[get_db] = lambda: db  # override DB dependency
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
\`\`\`

**Tests:**
\`\`\`python
async def test_create_user(client):
    response = await client.post("/users", json={"name": "Ada", "email": "ada@example.com"})
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Ada"
    assert "id" in data

async def test_get_user_not_found(client):
    response = await client.get("/users/99999")
    assert response.status_code == 404

async def test_auth_required(client):
    response = await client.get("/me")
    assert response.status_code == 401
\`\`\`

**Override dependencies** — FastAPI's \`app.dependency_overrides\` is the key to testable apps:
\`\`\`python
from myapp.auth import get_current_user

@pytest.fixture
async def authed_client(client, db):
    fake_user = User(id=1, name="Test", role="admin")
    app.dependency_overrides[get_current_user] = lambda: fake_user
    yield client
    app.dependency_overrides.clear()
\`\`\`

**Sync alternative** — \`from fastapi.testclient import TestClient\` (wraps ASGI synchronously) for simpler cases without async fixtures.`,
      tags: ["pytest", "fastapi", "integration"],
    },
    {
      id: "mypy",
      title: "mypy type checking",
      difficulty: "medium",
      question: "How do you use mypy for static type checking in Python? What does --strict do?",
      answer: `**mypy** is the most widely-used Python static type checker. It reads type annotations and catches type errors without running the code.

**Install and run:**
\`\`\`sh
uv add --dev mypy
uv run mypy src/
\`\`\`

**Config in pyproject.toml:**
\`\`\`toml
[tool.mypy]
python_version = "3.12"
strict = true
\`\`\`

**\`--strict\` enables:**
- \`--disallow-untyped-defs\` — every function must have type annotations.
- \`--disallow-any-generics\` — \`list\` must be \`list[str]\`, not bare \`list\`.
- \`--warn-return-any\` — warn when returning \`Any\`.
- \`--warn-unused-ignores\` — \`# type: ignore\` that isn't needed is flagged.
- And many more.

**Common errors and fixes:**

\`\`\`python
# error: Argument 1 to "greet" has incompatible type "int"; expected "str"
def greet(name: str) -> str:
    return f"Hello, {name}"

greet(42)  # mypy catches this
\`\`\`

\`\`\`python
# error: Item "None" of "str | None" has no attribute "upper"
def process(value: str | None) -> str:
    return value.upper()   # must handle None

def process_fixed(value: str | None) -> str:
    if value is None:
        return ""
    return value.upper()
\`\`\`

**Per-module overrides:**
\`\`\`toml
[[tool.mypy.overrides]]
module = ["legacy.*", "third_party_without_stubs.*"]
ignore_missing_imports = true
disallow_untyped_defs = false
\`\`\`

**Stubs** — type information for untyped third-party libraries:
\`\`\`sh
uv add --dev types-requests types-boto3
\`\`\`

**mypy in CI:**
\`\`\`yaml
- run: uv run mypy src/
\`\`\`

Most FastAPI/Pydantic/SQLAlchemy libraries ship inline types; mypy works well with them.`,
      tags: ["tooling", "mypy", "types"],
    },
    {
      id: "pre-commit",
      title: "pre-commit hooks",
      difficulty: "medium",
      question: "How do you set up pre-commit hooks for a Python project?",
      answer: `**pre-commit** runs hooks automatically before each \`git commit\`, catching issues before they reach CI.

**Install:**
\`\`\`sh
uv add --dev pre-commit
uv run pre-commit install   # installs the git hook
\`\`\`

**\`.pre-commit-config.yaml\`:**
\`\`\`yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.6.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-toml
      - id: check-merge-conflict
      - id: debug-statements    # catches leftover pdb/breakpoint()

  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.4.0
    hooks:
      - id: ruff               # lint + fix
        args: [--fix]
      - id: ruff-format        # format

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.10.0
    hooks:
      - id: mypy
        additional_dependencies: [types-requests, pydantic]
\`\`\`

**Run manually:**
\`\`\`sh
uv run pre-commit run --all-files     # check all files
uv run pre-commit run ruff            # run one hook
\`\`\`

**Auto-update hook versions:**
\`\`\`sh
uv run pre-commit autoupdate
\`\`\`

**CI — run hooks in pipeline too:**
\`\`\`yaml
- name: Run pre-commit
  run: uv run pre-commit run --all-files
\`\`\`

**Benefits:**
- Catches lint/format issues before push — no CI round-trips.
- Enforces consistent code style across the team.
- Fast (ruff runs in milliseconds).

**Note:** hooks only run on staged files by default. Some teams skip mypy in pre-commit (too slow) and run it only in CI.`,
      tags: ["tooling", "pre-commit", "ci"],
    },
    {
      id: "factory-boy",
      title: "factory_boy for test fixtures",
      difficulty: "medium",
      question: "How does factory_boy help with test data, and how do you use it?",
      answer: `**factory_boy** generates test objects (model instances, dicts, etc.) with sensible defaults that you can selectively override. It eliminates repetitive fixture setup.

**Install:**
\`\`\`sh
uv add --dev factory-boy faker
\`\`\`

**Basic factory:**
\`\`\`python
import factory
from faker import Faker
from myapp.models import User, Post

fake = Faker()

class UserFactory(factory.Factory):
    class Meta:
        model = User   # calls User(**kwargs)

    id = factory.Sequence(lambda n: n)
    name = factory.LazyAttribute(lambda _: fake.name())
    email = factory.LazyAttribute(lambda obj: f"{obj.name.lower().replace(' ', '.')}@example.com")
    role = "user"
    is_active = True
\`\`\`

**Usage:**
\`\`\`python
user = UserFactory()                          # all defaults
admin = UserFactory(role="admin")             # override one field
users = UserFactory.build_batch(5)            # list of 5
user_dict = UserFactory.build().__dict__      # as dict
\`\`\`

**SQLAlchemy integration:**
\`\`\`python
class UserFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = User
        sqlalchemy_session = None   # set per-test

    name = factory.Faker("name")
    email = factory.Faker("email")

def test_create_user(db):
    UserFactory._meta.sqlalchemy_session = db
    user = UserFactory()
    db.flush()
    assert user.id is not None
\`\`\`

**Related objects:**
\`\`\`python
class PostFactory(factory.Factory):
    class Meta:
        model = Post

    title = factory.Faker("sentence")
    author = factory.SubFactory(UserFactory)   # creates a User automatically
\`\`\`

**Traits — predefined overrides:**
\`\`\`python
class UserFactory(factory.Factory):
    class Meta:
        model = User
    role = "user"

    class Params:
        admin = factory.Trait(role="admin", is_staff=True)

admin = UserFactory(admin=True)
\`\`\`

**Benefits over raw fixtures:** avoid duplication, readable tests, easy variation without constructor noise.`,
      tags: ["pytest", "fixtures", "factory-boy"],
    },
    {
      id: "tox-ci",
      title: "tox and CI/CD",
      difficulty: "medium",
      question: "What is tox and how does it fit into CI/CD for Python projects?",
      answer: `**tox** is a test automation tool that runs your tests in isolated virtual environments, across multiple Python versions and configurations.

**tox.ini / pyproject.toml config:**
\`\`\`toml
[tool.tox]
legacy_tox_ini = """
[tox]
envlist = py312, py313, lint, type
isolated_build = true

[testenv]
deps = pytest pytest-cov pytest-asyncio pytest-mock
commands = pytest --cov=src --cov-report=term-missing

[testenv:lint]
deps = ruff
commands =
    ruff check src tests
    ruff format --check src tests

[testenv:type]
deps = mypy types-requests
commands = mypy src
"""
\`\`\`

**Run:**
\`\`\`sh
tox              # all envs
tox -e py312     # one env
tox -e lint      # just linting
tox -p           # run envs in parallel
\`\`\`

**GitHub Actions CI with uv:**
\`\`\`yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ["3.12", "3.13"]

    steps:
      - uses: actions/checkout@v4

      - name: Install uv
        uses: astral-sh/setup-uv@v3
        with:
          version: "latest"

      - name: Set up Python \${{ matrix.python-version }}
        run: uv python install \${{ matrix.python-version }}

      - name: Install dependencies
        run: uv sync --group dev

      - name: Lint
        run: |
          uv run ruff check .
          uv run ruff format --check .

      - name: Type check
        run: uv run mypy src/

      - name: Test
        run: uv run pytest --cov=src --cov-report=xml --cov-fail-under=80

      - name: Upload coverage
        uses: codecov/codecov-action@v4
\`\`\`

**Modern trend:** many projects skip tox and run uv directly in CI matrix jobs — simpler, faster. tox remains useful when you need to test across many Python versions as a matrix in one command locally.`,
      tags: ["tooling", "tox", "ci", "github-actions"],
    },

    // ───── HARD ─────
    {
      id: "pytest-advanced-fixtures",
      title: "Advanced fixture patterns",
      difficulty: "hard",
      question: "Explain advanced pytest fixture techniques: parametrized fixtures, fixture finalization, and request object.",
      answer: `**Parametrized fixtures** — run the same tests against multiple fixture variants:

\`\`\`python
import pytest

@pytest.fixture(params=["sqlite", "postgresql"])
def db(request):
    """Tests run once for SQLite, once for PostgreSQL."""
    if request.param == "sqlite":
        engine = create_engine("sqlite:///:memory:")
    else:
        engine = create_engine(os.environ["TEST_PG_URL"])
    Base.metadata.create_all(engine)
    session = Session(engine)
    yield session
    session.close()
    Base.metadata.drop_all(engine)

def test_insert_user(db):
    db.add(User(name="Ada"))
    db.commit()
    assert db.query(User).count() == 1
    # This test runs twice: once with SQLite, once with PostgreSQL
\`\`\`

**request object** — gives a fixture access to the requesting test's context:
\`\`\`python
@pytest.fixture
def log_level(request):
    # request.param — set when fixture is used indirectly via parametrize
    # request.node — the test node
    # request.function — the test function
    # request.fspath — path to the test file
    # request.config — the pytest config
    level = getattr(request, "param", "INFO")
    return level

@pytest.fixture
def app(request):
    marker = request.node.get_closest_marker("slow")
    timeout = 30 if marker else 5
    return create_app(timeout=timeout)
\`\`\`

**Addfinalizer** — register multiple teardown actions (alternative to yield):
\`\`\`python
@pytest.fixture
def managed_resource(request):
    resource = acquire_resource()
    request.addfinalizer(resource.release)
    request.addfinalizer(lambda: logger.info("resource released"))
    return resource
    # finalizers run in LIFO order even if setup partially fails
\`\`\`

**Dynamic fixture generation** — create fixtures programmatically:
\`\`\`python
def make_user_fixture(role: str):
    @pytest.fixture(name=f"{role}_user")
    def fixture():
        return UserFactory(role=role)
    return fixture

admin_user = make_user_fixture("admin")
guest_user = make_user_fixture("guest")
\`\`\`

**Factory fixtures** — return a callable, not an object:
\`\`\`python
@pytest.fixture
def make_user(db):
    """Factory pattern: each test calls make_user() with custom args."""
    created = []
    def _make(name="Default", role="user"):
        user = User(name=name, role=role)
        db.add(user)
        db.commit()
        created.append(user)
        return user
    yield _make
    for u in created:
        db.delete(u)
    db.commit()

def test_two_users(make_user):
    admin = make_user(name="Alice", role="admin")
    guest = make_user(name="Bob")
    assert admin.role != guest.role
\`\`\``,
      tags: ["pytest", "fixtures", "advanced"],
    },
    {
      id: "snapshot-testing-python",
      title: "Snapshot testing in Python",
      difficulty: "hard",
      question: "How do you implement snapshot testing in Python with syrupy?",
      answer: `**Snapshot testing** asserts that output matches a previously stored snapshot. When output changes intentionally, you update the snapshot. **syrupy** is the modern snapshot plugin for pytest.

**Install:**
\`\`\`sh
uv add --dev syrupy
\`\`\`

**Basic snapshot test:**
\`\`\`python
# test_serializer.py
from myapp.serializers import serialize_user

def test_user_serialization(snapshot):
    user = UserFactory(id=1, name="Ada Lovelace", email="ada@example.com")
    result = serialize_user(user)
    assert result == snapshot
\`\`\`

First run with \`--snapshot-update\` creates \`__snapshots__/test_serializer.ambr\`:
\`\`\`
# serializer: test_user_serialization
{
  "email": "ada@example.com",
  "id": 1,
  "name": "Ada Lovelace"
}
\`\`\`

Subsequent runs compare output; failures show a diff.

**Update snapshots:**
\`\`\`sh
pytest --snapshot-update           # update all
pytest --snapshot-update -k "user" # update matching tests
\`\`\`

**API response snapshot testing:**
\`\`\`python
async def test_list_users_response(client, snapshot):
    UserFactory.create_batch(3)
    response = await client.get("/users")
    assert response.json() == snapshot
\`\`\`

**Custom snapshot serializer:**
\`\`\`python
from syrupy.extensions.json import JSONSnapshotExtension

@pytest.fixture
def snapshot(snapshot):
    return snapshot.use_extension(JSONSnapshotExtension)
\`\`\`

**Snapshot formats:**
- \`.ambr\` — default, human-readable Amber format.
- \`JSONSnapshotExtension\` — pretty-printed JSON.
- \`SingleFileSnapshotExtension\` — one file per snapshot.

**When to use:**
- API response shapes — catch unintended field additions/removals.
- Complex serialization outputs.
- Generated code / configuration.

**When to avoid:**
- Frequently changing output — you'll be updating snapshots constantly.
- Anything with timestamps, random IDs — stabilize them first (freeze time, seed factories).

**Stabilizing dynamic values:**
\`\`\`python
def test_event(snapshot, freezer):  # pytest-freezer
    result = create_event()
    assert result == snapshot  # timestamp is frozen
\`\`\``,
      tags: ["pytest", "snapshot", "testing"],
    },
    {
      id: "debugging-profiling",
      title: "Debugging and profiling Python",
      difficulty: "hard",
      question: "How do you debug and profile Python applications? Explain pdb, debugpy, cProfile, and py-spy.",
      answer: `## Debugging

**pdb — built-in Python debugger:**
\`\`\`python
def process(data):
    result = transform(data)
    import pdb; pdb.set_trace()   # drops into interactive debugger
    return result
\`\`\`

Or with Python 3.7+:
\`\`\`python
breakpoint()   # equivalent, respects PYTHONBREAKPOINT env var
\`\`\`

**pdb commands:**
\`\`\`
n       # next line (step over)
s       # step into function
c       # continue to next breakpoint
l       # list source around current line
p expr  # print expression
pp obj  # pretty-print object
b 42    # set breakpoint at line 42
w       # show call stack (where)
q       # quit
\`\`\`

**debugpy — VS Code / remote debugging:**
\`\`\`python
import debugpy
debugpy.listen(5678)
debugpy.wait_for_client()   # pause until IDE connects
\`\`\`

\`\`\`sh
# Then in VS Code launch.json:
{ "type": "python", "request": "attach", "port": 5678 }
\`\`\`

**pytest --pdb** — drop into pdb on test failure:
\`\`\`sh
pytest --pdb          # pdb on failure
pytest --pdb -x       # pdb on first failure
\`\`\`

---

## Profiling

**cProfile — deterministic profiler (built-in):**
\`\`\`sh
python -m cProfile -o profile.out myscript.py
python -m pstats profile.out
# Or visualize with snakeviz:
pip install snakeviz
snakeviz profile.out
\`\`\`

\`\`\`python
import cProfile, pstats

with cProfile.Profile() as pr:
    run_expensive_operation()

stats = pstats.Stats(pr).sort_stats("cumulative")
stats.print_stats(20)   # top 20 functions by cumulative time
\`\`\`

**py-spy — sampling profiler (no code changes, no overhead):**
\`\`\`sh
uv add --dev py-spy

# Attach to running process:
py-spy top --pid 1234

# Record flamegraph:
py-spy record -o profile.svg -- python myscript.py

# Profile a running web server:
py-spy top --pid $(pgrep -f uvicorn)
\`\`\`

**py-spy advantages:**
- No instrumentation — works on production processes.
- Generates flamegraphs (SVG) showing where time is really spent.
- Works with native extensions and threads.

**memray — memory profiler:**
\`\`\`sh
uv add --dev memray
python -m memray run -o output.bin myscript.py
python -m memray flamegraph output.bin
\`\`\`

**Rule of thumb:**
- Use **pdb / debugpy** for logic bugs.
- Use **py-spy** for production CPU profiling (zero overhead).
- Use **cProfile** for local benchmarking.
- Use **memray** for memory leaks.`,
      tags: ["debugging", "profiling", "tooling"],
    },
    {
      id: "packaging-publishing",
      title: "Python packaging and PyPI publishing",
      difficulty: "hard",
      question: "How do you package a Python library and publish it to PyPI?",
      answer: `**Modern Python packaging** uses \`pyproject.toml\` as the single config file and \`build\` + \`twine\` (or \`uv publish\`) to publish.

**Project structure:**
\`\`\`
my-library/
├── src/
│   └── mylib/
│       ├── __init__.py
│       └── core.py
├── tests/
├── pyproject.toml
└── README.md
\`\`\`

**pyproject.toml for a library:**
\`\`\`toml
[build-system]
requires = ["hatchling"]        # or "flit-core", "setuptools"
build-backend = "hatchling.build"

[project]
name = "my-library"
version = "1.2.0"
description = "A library that does things"
authors = [{ name = "Ada Lovelace", email = "ada@example.com" }]
license = { text = "MIT" }
readme = "README.md"
requires-python = ">=3.11"
dependencies = ["httpx>=0.27", "pydantic>=2.0"]
classifiers = [
    "Development Status :: 5 - Production/Stable",
    "Programming Language :: Python :: 3",
]

[project.urls]
Homepage = "https://github.com/example/my-library"
Repository = "https://github.com/example/my-library"

[project.optional-dependencies]
dev = ["pytest", "ruff", "mypy"]
\`\`\`

**Build the distribution:**
\`\`\`sh
uv add --dev build twine
uv run python -m build      # produces dist/*.whl and dist/*.tar.gz
\`\`\`

**Publish to TestPyPI first:**
\`\`\`sh
uv run twine upload --repository testpypi dist/*
pip install --index-url https://test.pypi.org/simple/ my-library
\`\`\`

**Publish to PyPI:**
\`\`\`sh
uv run twine upload dist/*
# Or with uv (uv 0.4+):
uv publish
\`\`\`

**GitHub Actions release workflow:**
\`\`\`yaml
name: Publish to PyPI
on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    environment: pypi
    permissions:
      id-token: write   # OIDC trusted publishing — no API keys needed

    steps:
      - uses: actions/checkout@v4
      - uses: astral-sh/setup-uv@v3
      - run: uv build
      - uses: pypa/gh-action-pypi-publish@release/v1
        # Trusted Publishing: no TWINE_PASSWORD needed
\`\`\`

**Trusted Publishing (PyPI OIDC)** — the modern approach; GitHub Actions receives a short-lived token from PyPI without storing secrets.

**Versioning:**
- Use \`__version__\` in \`__init__.py\` matching pyproject.toml.
- Or use \`hatch-vcs\` to derive version from git tags automatically.
- Bump with \`bump-my-version\` or manually before tagging.`,
      tags: ["tooling", "packaging", "pypi"],
    },
    {
      id: "integration-vs-unit-python",
      title: "Integration vs unit tests in Python",
      difficulty: "hard",
      question: "How do you structure unit vs integration tests in a Python backend, and where do you draw the boundary?",
      answer: `The distinction matters for **speed, isolation, and confidence**. Python backend projects need both.

## Unit tests — fast, isolated, no I/O

Test a single function or class. All external dependencies (DB, HTTP, filesystem) are mocked.

\`\`\`python
# src/myapp/service.py
from myapp.repository import UserRepository
from myapp.models import User

class UserService:
    def __init__(self, repo: UserRepository):
        self.repo = repo

    def deactivate(self, user_id: int) -> User:
        user = self.repo.get(user_id)
        if user is None:
            raise ValueError(f"User {user_id} not found")
        user.is_active = False
        self.repo.save(user)
        return user
\`\`\`

\`\`\`python
# tests/unit/test_user_service.py
def test_deactivate_user(mocker):
    mock_repo = mocker.MagicMock(spec=UserRepository)
    mock_repo.get.return_value = User(id=1, name="Ada", is_active=True)

    service = UserService(mock_repo)
    user = service.deactivate(1)

    assert user.is_active is False
    mock_repo.save.assert_called_once_with(user)

def test_deactivate_missing_user(mocker):
    mock_repo = mocker.MagicMock(spec=UserRepository)
    mock_repo.get.return_value = None

    service = UserService(mock_repo)
    with pytest.raises(ValueError, match="not found"):
        service.deactivate(99)
\`\`\`

## Integration tests — real dependencies, real I/O

Test the wiring: service → repository → actual database.

\`\`\`python
# tests/integration/test_user_service_db.py
import pytest
from sqlalchemy.orm import Session
from myapp.repository import SqlUserRepository
from myapp.service import UserService

@pytest.fixture
def service(db: Session):  # db fixture from conftest wraps a transaction
    repo = SqlUserRepository(db)
    return UserService(repo)

def test_deactivate_persists(service, db):
    user = UserFactory(is_active=True)
    db.add(user)
    db.flush()

    service.deactivate(user.id)

    db.refresh(user)
    assert user.is_active is False
\`\`\`

## Boundary decisions

| Boundary | Unit or Integration? |
|----------|---------------------|
| Pure business logic (no I/O) | Unit |
| Repository with real DB | Integration |
| HTTP handler + dependency injection | Integration (use TestClient) |
| Email sender | Unit (mock SMTP); integration with Mailtrap in E2E |
| Cache layer | Unit (mock Redis); integration in full test |
| External API client | Unit (mock httpx); contract test against sandbox |

## Folder structure

\`\`\`
tests/
├── conftest.py          # shared fixtures (db session, client)
├── unit/
│   ├── test_service.py
│   └── test_domain.py
├── integration/
│   ├── test_api.py      # FastAPI TestClient + real DB
│   └── test_repo.py     # repository + real DB
└── e2e/                 # Playwright or httpx against running server
\`\`\`

**CI strategy:**
- Unit tests on every commit (< 5s total).
- Integration tests on every PR (use Postgres service container).
- E2E tests on merge to main or nightly.`,
      tags: ["pytest", "testing", "architecture"],
    },
    {
      id: "coverage-mutation",
      title: "Mutation testing with mutmut",
      difficulty: "hard",
      question: "What is mutation testing and how do you use mutmut in Python?",
      answer: `**Mutation testing** verifies the quality of your tests by automatically introducing small bugs (mutations) and checking whether your tests catch them. High line coverage with weak assertions can't fool a mutation tester.

**How it works:**
1. mutmut modifies your source code slightly (changes \`>\` to \`>=\`, removes \`return\` values, negates conditions, etc.).
2. Runs your test suite against each mutant.
3. If tests **fail** → mutant is "killed" (good — tests caught the bug).
4. If tests **pass** → mutant "survived" (bad — tests missed a real bug scenario).

**Install and run:**
\`\`\`sh
uv add --dev mutmut
uv run mutmut run             # mutate src/, run pytest
uv run mutmut results         # summary
uv run mutmut show 42         # show surviving mutant #42
uv run mutmut html            # generate HTML report
\`\`\`

**Config in \`setup.cfg\` or \`pyproject.toml\`:**
\`\`\`toml
[tool.mutmut]
paths_to_mutate = "src/"
backup = false
runner = "python -m pytest tests/unit/ -x -q"
tests_dir = "tests/"
\`\`\`

**Example — surviving mutant reveals weak test:**
\`\`\`python
# src/pricing.py
def apply_discount(price: float, pct: float) -> float:
    return price * (1 - pct / 100)  # mutmut changes pct/100 to pct*100

# test_pricing.py
def test_discount():
    result = apply_discount(100, 10)
    assert result < 100              # ← too weak! survives the mutation
    # assert result == 90.0          ← would kill the mutant
\`\`\`

**Mutation score** = killed / total. Aim for > 70% on critical modules.

**Practical approach:**
- Don't run mutmut on the whole codebase — too slow.
- Focus on **critical business logic**: pricing, auth, validation.
- Run in CI on changed files only, or as a periodic scheduled job.
- Use it to audit test quality during code reviews.

**Mutations mutmut applies:**
- Arithmetic: \`+\` → \`-\`, \`*\` → \`/\`
- Comparison: \`>\` → \`>=\`, \`==\` → \`!=\`
- Boolean: \`and\` → \`or\`, \`not\` removed
- String literals: \`"hello"\` → \`""\`
- Return values: \`return x\` → \`return None\`

**mutmut vs coverage:** coverage tells you which lines ran; mutation testing tells you whether your assertions are meaningful.`,
      tags: ["pytest", "testing", "mutation", "quality"],
    },
  ],
};
