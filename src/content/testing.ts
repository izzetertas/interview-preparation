import type { Category } from "./types";

export const testing: Category = {
  slug: "testing",
  title: "Testing",
  description:
    "Testing front-end and Node code: Jest, Vitest, React Testing Library, Playwright, Cypress, mocking, contract tests, TDD, and CI integration.",
  icon: "🧪",
  questions: [
    // ───── EASY ─────
    {
      id: "test-pyramid",
      title: "The testing pyramid",
      difficulty: "easy",
      question: "What's the testing pyramid and what's the trophy alternative?",
      answer: `**Testing pyramid** (classic):
\`\`\`
       /\\
      /E2E\\         few, slow, expensive
     /------\\
    /Integration\\
   /-----------\\
  /   Unit       \\   many, fast, cheap
 -----------------
\`\`\`
- Lots of fast unit tests at the base.
- Fewer integration tests.
- A handful of E2E.

**Testing trophy** (Kent C. Dodds, modern):
\`\`\`
        /\\
       /E2E\\
      /------\\
     / Integration \\   ← biggest layer
    /----------------\\
   /     Unit          \\
  ----------------------
       /Static\\
\`\`\`
- **Integration tests** are the focus — best ROI.
- Static analysis (TypeScript, ESLint) catches a lot for free.
- Unit tests still useful, but don't over-invest.
- E2E for critical user flows.

**Why the trophy:**
- Unit tests on private helpers break refactors without catching real bugs.
- Integration tests verify behavior users care about.
- Static analysis prevents whole classes of bugs (typos, type errors).

**For React app:**
- TypeScript + ESLint (static).
- React Testing Library + Vitest (integration).
- Playwright (E2E for critical flows).
- Unit tests for pure utilities, complex logic.

**Don't aim for 100% coverage** — chase **valuable tests**, not lines covered. Coverage > 80% on business logic + critical paths is healthier than 100% global.`,
      tags: ["fundamentals"],
    },
    {
      id: "jest-vitest",
      title: "Jest vs Vitest",
      difficulty: "easy",
      question: "What's the difference between Jest and Vitest?",
      answer: `**Jest** — Facebook's test framework. Long-time default for JS/React.
**Vitest** — modern alternative built on Vite. API-compatible with Jest.

| Feature              | Jest                       | Vitest                          |
|----------------------|----------------------------|--------------------------------|
| Runner               | Custom                     | Vite-native                     |
| Speed                | Slower (especially TS/ESM) | Much faster                     |
| ESM support          | Limited (workarounds)      | Native                          |
| TypeScript           | Via Babel/ts-jest          | Native via esbuild              |
| Config               | Often complex (Babel + transform) | Often zero-config         |
| Watch mode           | Good                       | Excellent (instant)             |
| Snapshot testing     | ✅                          | ✅                               |
| Mocking              | \`jest.mock\`, \`jest.fn\` | \`vi.mock\`, \`vi.fn\`           |
| Coverage             | Built in (Istanbul)        | Built in (V8 / Istanbul)        |
| UI                   | Console                    | Optional Vite-style UI          |

**Why pick Vitest:**
- **Faster** — uses Vite's transform, not separate Babel/swc step.
- **Native ESM** — modern JS works without config.
- **Same API** — easy migration from Jest (\`jest.fn\` → \`vi.fn\`).
- **Vite ecosystem** — same plugins, same config.

**Why Jest still:**
- Existing codebase, no reason to switch.
- React Native (Vitest support evolving).
- More mature edge cases.

**For new projects in 2024+:** Vitest is the recommended default unless tied to Jest.

**Sample test:**
\`\`\`ts
import { describe, it, expect } from "vitest";

describe("sum", () => {
  it("adds two numbers", () => {
    expect(sum(1, 2)).toBe(3);
  });
});
\`\`\`

Same code works in Jest with \`@jest/globals\`.`,
      tags: ["fundamentals"],
    },
    {
      id: "rtl",
      title: "React Testing Library",
      difficulty: "easy",
      question: "What is React Testing Library and how does it differ from Enzyme?",
      answer: `**React Testing Library (RTL)** — testing library that encourages testing **what the user sees and does**, not implementation details.

\`\`\`tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

test("clicking button increments counter", async () => {
  render(<Counter />);
  const btn = screen.getByRole("button", { name: /count: 0/i });
  await userEvent.click(btn);
  expect(screen.getByRole("button", { name: /count: 1/i })).toBeInTheDocument();
});
\`\`\`

**Philosophy:**
- Query elements **the way users do**: by role, label, text — not by class names or component names.
- Test **behavior**, not internals.
- Refactor freely — tests survive as long as user-facing UI doesn't change.

**Vs Enzyme** (older):
- Enzyme exposed component instances, lifecycle methods, internal state.
- Tests broke on every refactor.
- RTL replaced it by encouraging behavior tests.
- Enzyme is essentially deprecated for React 17+.

**Common queries (priority order):**
1. \`getByRole\` — accessibility-friendly.
2. \`getByLabelText\` — for form inputs.
3. \`getByPlaceholderText\`.
4. \`getByText\`.
5. \`getByDisplayValue\`.
6. \`getByAltText\`.
7. \`getByTitle\`.
8. \`getByTestId\` — last resort, when nothing else works.

**Variants:**
- \`getBy*\` — throws if not found.
- \`queryBy*\` — returns null (use for "not present" assertions).
- \`findBy*\` — async; waits up to 1s.

**\`userEvent\`** simulates real user interactions (clicks, typing, tab navigation) more accurately than \`fireEvent\`.

**Equivalent libs:** Vue Testing Library, Svelte Testing Library, Solid Testing Library — same philosophy.`,
      tags: ["react"],
    },
    {
      id: "test-types",
      title: "Unit vs integration vs E2E",
      difficulty: "easy",
      question: "What's the difference between unit, integration, and E2E tests?",
      answer: `**Unit test** — single function or component in isolation.
- All dependencies mocked.
- Fast (ms each).
- Catches logic bugs.
- Example: \`add(2, 3) === 5\`.

**Integration test** — multiple units working together.
- Some real dependencies (DB, file system, network — sometimes).
- Slower (10s of ms).
- Catches contract / wiring bugs.
- Example: form submission triggers API call → state updates.

**E2E test** — full app, real browser.
- All dependencies real (or near-real, e.g. test DB).
- Slow (seconds per test).
- Catches user-flow bugs.
- Example: user signs up, logs in, creates an order, checks email.

**Tools by category:**

| Type           | JS Tools                                            |
|----------------|------------------------------------------------------|
| Unit           | Jest, Vitest, Mocha + Chai                          |
| Component      | React Testing Library, Vue Testing Library, Storybook tests |
| Integration    | Jest/Vitest with real deps; Supertest for HTTP APIs |
| E2E            | Playwright, Cypress, WebdriverIO                    |
| Visual         | Chromatic, Percy, Applitools                        |
| Load           | k6, Artillery, Gatling                              |

**Time / value trade-off:**
- 100 unit tests → seconds, catches a lot, easy to maintain.
- 10 E2E tests → minutes, catches real-user issues, brittle.
- Mix that fits your domain.

**API tests:**
- Hit real HTTP endpoints with Supertest / fetch in tests.
- Faster than E2E, real than unit.
- Good for backend contract verification.

**Modern trend:** invest more in **integration / component tests** — best ROI per the testing trophy.`,
      tags: ["fundamentals"],
    },
    {
      id: "mocking",
      title: "Mocking and stubbing",
      difficulty: "easy",
      question: "How do you mock dependencies in tests?",
      answer: `**Mock** = fake implementation that records interactions.
**Stub** = fake that returns canned values.
**Spy** = wraps a real function to track calls without changing behavior.

**Vitest / Jest:**

**Mock a module:**
\`\`\`ts
vi.mock("@/lib/api", () => ({
  fetchUser: vi.fn().mockResolvedValue({ id: 1, name: "Ada" }),
}));
\`\`\`

**Mock a function:**
\`\`\`ts
const cb = vi.fn();
doSomething(cb);
expect(cb).toHaveBeenCalledWith("expected");
expect(cb).toHaveBeenCalledTimes(1);
\`\`\`

**Spy on real function:**
\`\`\`ts
const spy = vi.spyOn(console, "log");
runCode();
expect(spy).toHaveBeenCalledWith("hello");
spy.mockRestore();
\`\`\`

**Mock implementations conditionally:**
\`\`\`ts
fn.mockReturnValueOnce("first").mockReturnValueOnce("second");
\`\`\`

**Network mocking:**
- **MSW (Mock Service Worker)** — intercepts fetch/XHR at the network layer. Tests use real fetch; MSW returns canned responses. Best practice; tests work in unit + E2E.
- \`vi.mock\` for the API module — simpler but tests are coupled to your client.
- \`nock\` for Node HTTP.

**Time mocking:**
\`\`\`ts
vi.useFakeTimers();
setTimeout(fn, 1000);
vi.advanceTimersByTime(1000);
expect(fn).toHaveBeenCalled();
vi.useRealTimers();
\`\`\`

**Don't over-mock:**
- Mocking the world makes tests pass without testing real behavior.
- Prefer real imports + MSW for network.
- Mock only what's expensive or non-deterministic.

**Auto-mocking:** \`vi.mock("./db")\` without factory uses module's default mock. Powerful but error-prone — explicit factory often safer.`,
      tags: ["fundamentals"],
    },
    {
      id: "test-coverage",
      title: "Test coverage",
      difficulty: "easy",
      question: "What is test coverage and what's a healthy target?",
      answer: `**Coverage** measures what percentage of your code is executed during tests.

**Types:**
- **Line coverage** — % of lines executed.
- **Statement coverage** — % of statements.
- **Branch coverage** — % of if/else branches.
- **Function coverage** — % of functions called.

**Tools:**
- **Vitest / Jest** — built-in via \`--coverage\` flag.
- **Istanbul / nyc** — popular library underneath.
- **V8 coverage** — Node's native; faster.
- **Codecov / Coveralls** — SaaS dashboards.

**Targets:**
- **80%** is a common target.
- **100% is rarely worth it** — diminishing returns; tests for trivial code add noise.
- **Critical paths** (payment, auth) → aim for 95%+.
- **UI / display logic** → ~70% is fine.

**Why coverage isn't the goal:**
- 100% covered code can still be wrong (tests not asserting the right things).
- 100% coverage with bad tests = false confidence.
- Focus on **valuable tests** > hitting numbers.

**Use coverage as a tool:**
- Find untested critical code.
- Spot dead code.
- Pre-merge gate (don't drop below X%).

**CI integration:**
\`\`\`yaml
- run: npm test -- --coverage
- run: codecov
\`\`\`

**Differential coverage:**
- New code 100%; old code as-is.
- Easier to ratchet up over time.

**Mutation testing** (Stryker for JS) — verifies tests actually catch bugs by introducing mutations and checking if tests fail. Far better quality signal than coverage. Slow; rare in practice.`,
      tags: ["metrics"],
    },
    {
      id: "playwright-cypress",
      title: "Playwright vs Cypress",
      difficulty: "easy",
      question: "What's the difference between Playwright and Cypress?",
      answer: `Both are modern E2E testing tools.

**Playwright** (Microsoft):
- Multi-browser: Chromium, Firefox, WebKit.
- Fast, parallel by default.
- Auto-wait built in.
- Network interception easy.
- Mobile emulation.
- Multi-tab / multi-context.
- Trace Viewer for debugging.

**Cypress** (Cypress.io):
- Chromium / Edge / Firefox / Electron.
- Runs in-browser — sees app state directly.
- Excellent UI ("test runner").
- Time-travel debugging.
- Easy onboarding.
- Limitations: single tab/origin per test (improved in v12).

| Feature              | Playwright                | Cypress                  |
|----------------------|---------------------------|--------------------------|
| Browsers             | Chromium, Firefox, WebKit | Chromium, Firefox        |
| Multi-tab            | ✅                         | Limited                  |
| Multi-domain         | ✅                         | Limited (improved v12)   |
| Parallelism          | Built in                  | Paid dashboard           |
| Network mocking      | Excellent                 | Good                     |
| Test isolation       | Strong                    | Good                     |
| Speed                | Faster                    | Good                     |
| Debugging UI         | Trace Viewer              | Time-travel runner       |
| Pricing              | Free                      | Free + paid dashboard    |

**Sample test:**

**Playwright:**
\`\`\`ts
import { test, expect } from "@playwright/test";

test("sign in", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("user@x.com");
  await page.getByLabel("Password").fill("pw");
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL("/dashboard");
});
\`\`\`

**Cypress:**
\`\`\`ts
it("sign in", () => {
  cy.visit("/login");
  cy.get("[name=email]").type("user@x.com");
  cy.get("[name=password]").type("pw");
  cy.contains("button", /sign in/i).click();
  cy.url().should("include", "/dashboard");
});
\`\`\`

**Pick:**
- New project, want maximum browser coverage → **Playwright**.
- Existing Cypress investment, love the UI → **Cypress**.
- Most teams in 2024+ choose Playwright.`,
      tags: ["e2e"],
    },
    {
      id: "snapshot-tests",
      title: "Snapshot testing",
      difficulty: "easy",
      question: "What are snapshot tests and when should you use them?",
      answer: `**Snapshot test** — assert that the serialized output matches a saved baseline.

\`\`\`tsx
import { render } from "@testing-library/react";
import { expect, test } from "vitest";

test("button renders correctly", () => {
  const { container } = render(<Button>Click</Button>);
  expect(container).toMatchSnapshot();
});
\`\`\`

First run: writes the snapshot to a \`__snapshots__\` folder.
Subsequent runs: compares; fails if different.

**Update snapshots intentionally:**
\`\`\`sh
vitest -u            # update all
\`\`\`

**Use cases:**
- Catch unintentional UI / output changes.
- Lock down complex object structures.
- Quick regression coverage.

**Pitfalls:**
- **Brittle** — every UI change breaks tests; teams ignore failures and \`-u\` reflexively.
- **Hard to review** — large diff snapshots in PRs.
- **Don't catch logic bugs** — only changes from baseline, not whether baseline was correct.

**Better alternatives in many cases:**
- **Specific assertions** (\`expect(button).toHaveTextContent("Click")\`) — focused, intentional.
- **Visual regression testing** (Chromatic, Percy) — actual pixel diffs in real browsers.

**When snapshots ARE good:**
- API responses / serialization tests.
- Component output that rarely changes.
- Configuration / generated code outputs.
- Inline snapshots for short outputs:
\`\`\`ts
expect(parsed).toMatchInlineSnapshot(\`{ "a": 1, "b": 2 }\`);
\`\`\`

**Storybook + Chromatic** — more powerful approach for component visual snapshots.

**Verdict:** use sparingly; prefer specific assertions for behavior, visual regression for appearance.`,
      tags: ["patterns"],
    },

    // ───── MEDIUM ─────
    {
      id: "tdd",
      title: "Test-Driven Development (TDD)",
      difficulty: "medium",
      question: "What is TDD and is it always the right approach?",
      answer: `**TDD** = write the test first, then the code.

**Red-Green-Refactor cycle:**
1. **Red** — write a failing test for the next bit of behavior.
2. **Green** — write the minimum code to pass.
3. **Refactor** — clean up while tests stay green.
4. Repeat.

**Benefits:**
- Forces design from the consumer's perspective.
- Always have working tests.
- High coverage by construction.
- Caught requirements gaps early.
- Code is testable (because it has tests).

**When TDD shines:**
- Clear, well-understood requirements.
- Pure logic / algorithms.
- Bug fixes — write a failing test reproducing the bug first.
- API design — tests are the first consumer.

**When TDD is harder:**
- **Exploratory** code — you don't know the design yet.
- **UI / styling** — feedback loop is faster in browser.
- **Spike / prototype** — code is throwaway.
- **Heavy framework code** — boilerplate dominates.

**Common variations:**
- **BDD (Behavior-Driven Development)** — tests written in business language; \`Given/When/Then\`. Tools: Cucumber, Gherkin.
- **ATDD (Acceptance TDD)** — start with acceptance test; then dev TDD inside.
- **"Test after"** — write code first, then tests. Pragmatic; less rigorous.

**Common misuses:**
- TDD for everything → slow exploration.
- 1-line tests for trivial getters → noise.
- Tests that just mirror implementation → break on refactor.

**My take:** TDD as a tool, not a religion. Use it for **gnarly logic, bug fixes, well-specified features**. Skip for **prototyping, simple UI**.`,
      tags: ["philosophy"],
    },
    {
      id: "msw",
      title: "MSW (Mock Service Worker)",
      difficulty: "medium",
      question: "What is MSW and why is it the recommended way to mock APIs?",
      answer: `**MSW** intercepts network requests at the **service worker / Node http** level. Your app code uses real \`fetch\`; MSW returns canned responses.

\`\`\`ts
// mocks/handlers.ts
import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/api/users", () => {
    return HttpResponse.json([{ id: 1, name: "Ada" }]);
  }),
  http.post("/api/users", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: 2, ...body }, { status: 201 });
  }),
];
\`\`\`

**Setup for tests (Node):**
\`\`\`ts
import { setupServer } from "msw/node";
const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
\`\`\`

**Setup for browser dev:**
\`\`\`ts
import { setupWorker } from "msw/browser";
const worker = setupWorker(...handlers);
worker.start();
\`\`\`

**Why MSW dominates:**
- **Same handlers** for unit tests, browser dev, Storybook, E2E.
- **Real network behavior** — testing actual fetch logic, not mocked module.
- **Refactor-friendly** — change API client; tests still work.
- **Realistic** — actual HTTP semantics, status codes, headers.

**Versus alternatives:**
- \`vi.mock("@/lib/api")\` — couples tests to your client implementation; tests pass even if your client is broken.
- \`nock\` — Node-only, less developer-friendly.
- \`fetch-mock\` — replaces global fetch; works but less ergonomic.

**Use cases:**
- Unit / component tests with deterministic API responses.
- Storybook stories that "feel real" without a backend.
- Local dev when backend isn't ready.
- E2E tests in non-network-isolated environments.

**Limitations:**
- Service Worker doesn't intercept all requests (e.g. \`<script src>\`).
- Setup overhead for the first time.

**Pro tip:** organize handlers by feature; compose into MSW server per test as needed.`,
      tags: ["mocking"],
    },
    {
      id: "rtl-best-practices",
      title: "React Testing Library best practices",
      difficulty: "medium",
      question: "What are common RTL best practices and pitfalls?",
      answer: `**1. Query by role, then label, then text.**
\`\`\`tsx
// good
screen.getByRole("button", { name: /save/i })

// bad — fragile
screen.getByClassName("btn-save")
\`\`\`

**2. Use \`userEvent\`, not \`fireEvent\`.**
- \`userEvent\` simulates real user behavior (focus, type, click sequence).
- \`fireEvent\` dispatches raw DOM events; misses keystrokes, focus.

**3. Async queries with \`findBy*\`.**
\`\`\`tsx
const user = await screen.findByText("Ada");   // waits up to 1s
\`\`\`
- Don't use \`waitFor\` to retry queries — \`findBy\` is built for this.

**4. Test accessibility implicitly.**
- Querying by role forces you to use semantic HTML.
- Tests fail if a button is a \`<div>\` without role.
- Free a11y improvements!

**5. Avoid testing implementation details.**
- Don't test \`useState\` internals.
- Test what users see + can do.

**6. Avoid \`act\` warnings.**
- They mean state updates outside test assertions.
- Wrap async updates in \`await waitFor(...)\` or \`findBy*\`.

**7. Snapshots only when justified.**
- Specific assertions are clearer.

**8. Don't query \`getByTestId\` first.**
- Last resort. If you need it, often means UI isn't accessible.

**9. Render the right amount of context.**
- Wrap with required Providers (Router, Theme, Query).
- Helper: \`renderWithProviders(component)\`.

**10. Test interaction flows, not setup.**
\`\`\`tsx
render(<App />);
await userEvent.type(screen.getByLabelText(/email/i), "ada@x.com");
await userEvent.click(screen.getByRole("button", { name: /sign up/i }));
expect(await screen.findByText(/welcome/i)).toBeInTheDocument();
\`\`\`

**11. Custom matchers (jest-dom):** \`toBeInTheDocument\`, \`toHaveTextContent\`, \`toBeVisible\`. Way more readable than raw assertions.`,
      tags: ["react"],
    },
    {
      id: "playwright-patterns",
      title: "Playwright patterns",
      difficulty: "medium",
      question: "What are good Playwright patterns?",
      answer: `**1. Page Object Model (POM):**
\`\`\`ts
class LoginPage {
  constructor(private page: Page) {}
  async login(email: string, password: string) {
    await this.page.getByLabel("Email").fill(email);
    await this.page.getByLabel("Password").fill(password);
    await this.page.getByRole("button", { name: /sign in/i }).click();
  }
}

test("login", async ({ page }) => {
  const login = new LoginPage(page);
  await page.goto("/login");
  await login.login("user@x.com", "pw");
});
\`\`\`
- Encapsulates page interactions.
- Tests stay clean.

**2. Auth bypass:**
- Don't log in via UI for every test (slow).
- Set cookies / localStorage directly.
\`\`\`ts
await page.context().addCookies([{ name: "session", value: "...", url: "..." }]);
\`\`\`
- Or use \`storageState\` to reuse a logged-in session.

**3. \`storageState\` per project:**
\`\`\`ts
// playwright.config.ts
projects: [
  { name: "loggedin", use: { storageState: "auth.json" } },
]
\`\`\`
Run an auth setup once; reuse session for all tests.

**4. Network mocking:**
\`\`\`ts
await page.route("/api/users", route => route.fulfill({
  status: 200,
  body: JSON.stringify([{ id: 1, name: "Ada" }]),
}));
\`\`\`

**5. Wait for state, not time:**
\`\`\`ts
await page.waitForResponse(r => r.url().includes("/api/users") && r.ok());
\`\`\`
- Don't \`waitForTimeout(1000)\` — flaky.

**6. Trace Viewer:**
\`\`\`ts
// playwright.config.ts
use: { trace: "retain-on-failure" }
\`\`\`
Then \`npx playwright show-trace trace.zip\` — replay test with timeline.

**7. Parallelism:**
- By default, tests run in parallel within a file.
- \`test.describe.serial(...)\` for sequential.

**8. Test isolation:**
- Each test gets a fresh browser context — no cookie/localStorage leakage.

**9. Dev mode:**
- \`--ui\` for the interactive runner.
- \`--debug\` for step-through.

**10. CI:**
- \`--reporter=html\` for report.
- \`--retries=2\` for flaky-tolerant builds (but fix flaky tests, don't hide).`,
      tags: ["e2e"],
    },
    {
      id: "test-isolation",
      title: "Test isolation",
      difficulty: "medium",
      question: "Why is test isolation important and how do you achieve it?",
      answer: `**Test isolation** = each test runs independently; order doesn't matter; one test's state doesn't affect another's.

**Why:**
- **Reproducibility** — failing test means broken code, not order-dependent quirk.
- **Parallelism** — only possible if tests don't share state.
- **Refactoring** — can move/delete tests freely.
- **Debugging** — minimal repro is one test.

**Common shared state to isolate:**

**1. Test data:**
- Fresh DB or fresh records per test.
- Use **transactions** that rollback after each test.
- Or **truncate + seed** in \`beforeEach\`.
- Or **per-test schema** (Postgres schemas; pricey but bulletproof).

**2. Module state:**
- ES modules cache imports; mutating module-level state leaks.
- Reset in \`beforeEach\` or use \`vi.resetModules\`.

**3. Globals:**
- \`window\`, \`document\`, \`localStorage\`.
- jsdom resets between test files but not between tests in the same file.
- Manual cleanup or use \`@testing-library/react\` cleanup hook.

**4. Mocks:**
- Reset between tests:
\`\`\`ts
beforeEach(() => vi.clearAllMocks());
\`\`\`

**5. Network:**
- MSW: \`server.resetHandlers()\` after each test.

**6. Time:**
- Reset fake timers in \`afterEach\`.

**7. File system:**
- Temp directories per test.

**Anti-pattern:**
- Tests that share data ("first test creates user, second test reads it").
- Order-dependent assertions.
- Global counters / singletons.

**Database tests:**
\`\`\`ts
beforeEach(async () => {
  await db.\$executeRaw\`BEGIN\`;
});
afterEach(async () => {
  await db.\$executeRaw\`ROLLBACK\`;
});
\`\`\`
Or use **Testcontainers** to spin up fresh Postgres per test suite.

**Goal:** any test should pass when run alone, in any order, in parallel.`,
      tags: ["patterns"],
    },
    {
      id: "ci-tests",
      title: "Tests in CI",
      difficulty: "medium",
      question: "How do you run tests in CI effectively?",
      answer: `**Goal:** fast feedback, reliable signals, low flakiness.

**Pipeline structure:**
\`\`\`
1. Install + cache deps
2. Lint + type-check
3. Unit + integration tests (parallel)
4. Build
5. E2E tests
6. Deploy (if all green)
\`\`\`

**GitHub Actions example:**
\`\`\`yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'npm' }
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test -- --coverage
      - run: npm run build
      - run: npx playwright install --with-deps
      - run: npm run e2e
\`\`\`

**Optimization:**
- **Cache dependencies** — \`actions/setup-node\` with \`cache: 'npm'\`.
- **Parallelize** — split test suites across workers.
- **Affected tests only** — Nx, Turborepo, lerna detect changed packages.
- **Test sharding** — Playwright/Vitest support \`--shard 1/4\`.
- **Run E2E only on main / PRs to main** if too slow.

**Flakiness mitigation:**
- Retry transient failures (\`--retries=2\` in Playwright).
- Quarantine flaky tests; don't ignore them.
- Track flake rates in CI dashboards.

**Containerized services:**
- Postgres / Redis as services in the workflow.
\`\`\`yaml
services:
  postgres:
    image: postgres:16
    ports: ["5432:5432"]
\`\`\`

**Coverage:**
- Upload to Codecov / Coveralls.
- Fail PR if coverage drops > X%.

**Artifact upload:**
- Save Playwright traces / screenshots on failure for debug.

**Scheduled runs:**
- Nightly long-running E2E suites.
- Catch issues independent of PR cadence.

**Status badges + Slack notifications:**
- Visibility for the team.

**Don't:**
- Skip tests "to unblock deploy."
- Set \`continue-on-error: true\` to mask failures.
- Run E2E on every commit if too slow — gate on PR open instead.`,
      tags: ["ci"],
    },
    {
      id: "contract-tests",
      title: "Contract tests",
      difficulty: "medium",
      question: "What are contract tests?",
      answer: `**Contract test** verifies that two services agree on an API contract (request/response shape, status codes).

**Problem solved:**
- Service A and B communicate over HTTP / message queue.
- A's expectations and B's implementation can drift.
- Integration tests catch it but slow + late.
- Unit tests don't catch it at all.
- Contract tests catch it cheaply per service.

**Patterns:**

**Consumer-driven contracts (CDC):**
- **Consumer** writes contract: "I expect this request to return that response."
- **Provider** runs contract test: "Does my implementation match?"
- Tools: **Pact**, **Spring Cloud Contract**, **Pact Broker** for sharing contracts.

\`\`\`ts
// Consumer side (Pact)
provider
  .uponReceiving("a request for users")
  .withRequest({ method: "GET", path: "/users" })
  .willRespondWith({ status: 200, body: [{ id: 1, name: "Ada" }] });
\`\`\`

The contract is a JSON file shared with the provider's CI, where the provider runs:
\`\`\`ts
// Provider verification
verifyProvider({ provider: "users-api", baseUrl: "http://localhost:3000" });
\`\`\`

**OpenAPI-based contracts:**
- Schema is the contract.
- Tools generate request/response validators.
- Less consumer-driven; more "everyone agrees on the schema."

**Schema validation tests:**
- Test that responses match a Zod / JSON Schema.
- Catches drift on the producer side.

**When to use:**
- Microservices with multiple consumers.
- Public APIs with external clients.
- Cross-team integrations.

**When skip:**
- Monorepo with tight coupling — TypeScript types ARE the contract.
- Single-team app.

**Modern alternatives:**
- **tRPC** — types ARE the contract.
- **GraphQL** with shared schema.
- **OpenAPI + codegen** for typed clients.

**Pact remains popular** for HTTP/message-based contracts at scale.`,
      tags: ["integration"],
    },
    {
      id: "visual-testing",
      title: "Visual regression testing",
      difficulty: "medium",
      question: "What is visual regression testing?",
      answer: `**Visual regression** = compare screenshots of your UI before and after a change. Pixel-perfect verification.

**Why:**
- Catches **CSS regressions** that snapshot tests miss.
- Detects unintended visual side effects (a margin change moved everything).
- Useful for design system / shared components.

**Tools:**

**Chromatic** (Storybook):
- Each Storybook story is a baseline.
- PR opens → screenshots compared.
- Visual diff UI for review.
- Free for OSS; paid for private.

**Percy** (BrowserStack):
- Similar; supports any web app, not just Storybook.
- Pixel comparison + reviews.

**Applitools** (AI-powered):
- Smart diff (ignores anti-aliasing, dynamic content).
- Cross-browser visual.
- Premium pricing.

**Playwright** has native screenshot comparison:
\`\`\`ts
await expect(page).toHaveScreenshot("homepage.png");
\`\`\`
- Free, but you maintain baselines yourself.
- Cross-browser via Playwright projects.

**Workflow:**
1. Capture baseline (run test with \`--update-snapshots\`).
2. PR runs → compares to baseline.
3. Reviewer approves visual diffs in PR.
4. Approved diffs become new baseline.

**Pitfalls:**
- **Anti-aliasing / fonts** — pixel-perfect comparison fails across machines. Use containers (Docker) for consistency.
- **Animations / transitions** — disable for tests.
- **Dynamic data** (timestamps, random IDs) — mask or stub.
- **Large baseline storage** — projects grow.

**When to invest:**
- Design system / component library.
- Marketing site with brand-critical visuals.
- Migration projects (refactor without UI breakage).

**When to skip:**
- Internal admin panels where visual is non-critical.
- Apps under heavy redesign.

**Combined with Storybook:** capture every story as a visual snapshot — high coverage with little effort.`,
      tags: ["visual"],
    },

    // ───── HARD ─────
    {
      id: "test-perf",
      title: "Speeding up test suites",
      difficulty: "hard",
      question: "How do you speed up a slow test suite?",
      answer: `**1. Switch Jest → Vitest.**
- Often 2-5× faster for TS/ESM projects.

**2. Parallelize.**
- Vitest/Jest run tests in parallel by default.
- Tune workers: \`--threads --max-workers=8\`.

**3. Sharding.**
- Split across CI machines.
- \`vitest --shard=1/4\` and \`2/4\` etc on parallel jobs.

**4. Eliminate slow tests.**
- Find slowest with \`--reporter=verbose\` or test timing reports.
- Refactor: smaller scope, fewer setup steps.

**5. Reduce setup overhead.**
- Module-level setup once, not per test.
- Avoid \`beforeEach\` with heavy DB / network calls.

**6. Mock expensive deps.**
- Don't actually call OpenAI in unit tests.
- Use MSW for HTTP, in-memory DB for storage.

**7. Use SWC or esbuild for transformation.**
- Vitest does this natively.
- Jest with \`@swc/jest\` for faster TS.

**8. Don't over-mount.**
- Test smaller components in isolation.
- Mount tree only for integration scenarios.

**9. Cache dependencies in CI.**
- npm/pnpm cache.
- Build artifacts cache (Turborepo, Nx).

**10. Smart test selection.**
- Run only changed file tests:
  - Vitest: \`vitest --changed\`.
  - Nx: \`nx affected\`.
  - Turborepo: \`turbo run test --filter=...\`.

**11. Parallel browsers (Playwright).**
- \`workers: 4\` in config.
- Different browsers in parallel projects.

**12. Database speedup.**
- Use \`pg-mem\` for in-memory Postgres.
- SQLite for unit tests.
- Real Postgres for integration only.
- Transactions + rollback per test (no truncate).

**13. Heavy E2E on a separate cadence.**
- Unit + integration on every PR.
- E2E nightly + on main.
- Smoke E2E on PR; full suite less often.

**14. Identify and fix flakes.**
- Flaky tests waste retries — fix > tolerate.

**15. CI runner sizing.**
- Bigger machines run tests faster (often net cheaper).`,
      tags: ["performance"],
    },
    {
      id: "flaky-tests",
      title: "Flaky tests",
      difficulty: "hard",
      question: "What are flaky tests and how do you debug them?",
      answer: `**Flaky test** = sometimes passes, sometimes fails, with no code change. Erodes trust in test suite.

**Common causes:**

**1. Race conditions / timing.**
- \`waitForTimeout(1000)\` then expect.
- Network response order.
- Animations not finished.
- **Fix:** wait for state, not time. Use \`waitFor\`, \`findBy\`, \`waitForResponse\`.

**2. Test interdependence.**
- Test A leaves state that test B depends on.
- **Fix:** isolation — fresh state per test.

**3. Non-deterministic data.**
- \`Math.random()\`, \`Date.now()\`, generated IDs.
- **Fix:** seed RNG, mock time, snapshot-stable IDs.

**4. Network flakiness.**
- Real APIs in tests.
- **Fix:** MSW or fixtures.

**5. Order-dependent.**
- Parallel test workers race for shared resources (DB rows).
- **Fix:** unique data per test (UUIDs, namespaces).

**6. UI race conditions.**
- React state update happens after assertion.
- **Fix:** \`await\` with proper queries; avoid \`fireEvent\`.

**7. Animations.**
- Click happens before button is interactive.
- **Fix:** wait for visible; disable animations in tests.

**Debugging strategy:**

**1. Reproduce locally.**
- Run the test in a loop: \`for i in {1..50}; do npm test -- testname; done\`.
- Run in random order.
- Use Playwright's \`--repeat-each\` flag.

**2. Add detailed logging.**
- What's the state when it fails?
- Add screenshots / videos (Playwright traces).

**3. Inspect timing.**
- Check for missed awaits.
- Race conditions show as off-by-one.

**4. Quarantine** (don't ignore):
- Mark as \`test.fixme\` or \`it.skip\` with TODO.
- Track in a flaky-test list.
- Block merging fixes-or-removals queue.

**5. Track in CI.**
- Tools: BuildPulse, Currents, Datadog Test Visibility.
- Identify top 10 flakes; fix them.

**Don't:**
- Add \`--retries\` to mask flakes — they'll bite later.
- Disable forever — broken windows.

Flakes are a **test design problem**, not a CI problem.`,
      tags: ["debugging"],
    },
    {
      id: "testing-async",
      title: "Testing async code",
      difficulty: "hard",
      question: "How do you test async code reliably?",
      answer: `**Use \`async/await\`:**
\`\`\`ts
test("fetch user", async () => {
  const user = await fetchUser(1);
  expect(user.name).toBe("Ada");
});
\`\`\`

**Always \`await\`.** Forgetting awaits is the #1 source of false-passing tests.

**Promise rejection:**
\`\`\`ts
await expect(badCall()).rejects.toThrow("error message");
\`\`\`

**Wait for state:**
\`\`\`tsx
await waitFor(() => {
  expect(screen.getByText("Loaded")).toBeInTheDocument();
});

// Or use findBy* — built for async
const item = await screen.findByText("Loaded");
\`\`\`

**Avoid arbitrary timeouts:**
\`\`\`ts
// ❌ flaky
setTimeout(() => expect(...), 1000);

// ✅ wait for the actual condition
await waitFor(() => expect(...));
\`\`\`

**Fake timers:**
\`\`\`ts
vi.useFakeTimers();
const promise = sleep(1000).then(...);
vi.advanceTimersByTime(1000);
await promise;
vi.useRealTimers();
\`\`\`
Useful for testing time-dependent logic without slow tests.

**Microtasks vs macrotasks:**
- \`await\` flushes microtasks but not timers.
- \`vi.runAllTimers()\` flushes timers.
- \`vi.runOnlyPendingTimers()\` runs queued ones (avoids infinite recursion).

**RxJS / observables:**
- Marble testing in \`rxjs/testing\`.
- Test schedulers control time.

**Suspense / React.lazy:**
- Wrap render in Suspense; use \`findBy*\`.
- React Testing Library handles act() internally.

**Mocking promises:**
\`\`\`ts
vi.mocked(fetchUser).mockResolvedValue({ id: 1, name: "Ada" });
vi.mocked(fetchUser).mockRejectedValue(new Error("404"));
\`\`\`

**Sequence:**
\`\`\`ts
fn.mockResolvedValueOnce(a).mockResolvedValueOnce(b);
\`\`\`

**Test isolation:**
- Cancel pending promises in cleanup.
- AbortController for fetch.

**Common bug:** assertion runs before promise resolves.
\`\`\`ts
// ❌ test passes incorrectly
test("...", () => {
  fetchUser().then(u => expect(u).toBe(...));
});

// ✅
test("...", async () => {
  const u = await fetchUser();
  expect(u).toBe(...);
});
\`\`\``,
      tags: ["async"],
    },
    {
      id: "test-architecture",
      title: "Test architecture in large codebases",
      difficulty: "hard",
      question: "How do you organize tests in a large codebase?",
      answer: `**File location:**
- **Co-located** (next to code): \`Button.tsx\` + \`Button.test.tsx\`. Easier to find; encourages testing as you write.
- **Mirror tree** (\`src/\` + \`__tests__/\`): cleaner src; some prefer for big refactors.
- Most modern projects co-locate.

**Naming:**
- \`*.test.ts\` for unit/integration.
- \`*.spec.ts\` for behavior/BDD.
- \`*.e2e.ts\` for E2E.
- \`*.bench.ts\` for benchmarks.
- Vitest config matches by pattern.

**Types of tests, location:**
- Unit / integration → \`src/\`.
- E2E → \`tests/\` or \`e2e/\`.
- Visual → Storybook \`stories/\`.

**Helpers:**
- \`test/setup.ts\` for global setup (MSW server, jest-dom matchers).
- \`test/utils.ts\` for renderWithProviders, factories.
- \`test/fixtures/\` for shared test data.

**Test fixtures / factories:**
- Use **factories** (factory-bot pattern, Fishery) instead of inline data.
- Encapsulate creation; tests stay readable.
\`\`\`ts
const user = userFactory.build({ email: "test@x.com" });
\`\`\`

**Shared providers wrapper:**
\`\`\`tsx
function renderWithProviders(ui, opts) {
  return render(
    <QueryClientProvider client={qc}>
      <ThemeProvider><Router>{ui}</Router></ThemeProvider>
    </QueryClientProvider>,
    opts
  );
}
\`\`\`

**Conventions:**
- One test file per source file.
- One \`describe\` per function/component (or topic).
- Test names describe behavior: "creates a user when valid" not "test1".

**Monorepo:**
- Each package has its own tests + config.
- Root config for common settings.
- Use **affected** to run only impacted tests (Nx, Turborepo).

**Tooling:**
- **Storybook** for component visual tests + interaction tests.
- **Playwright** for E2E.
- **Vitest** for unit/integration.
- **MSW** for network mocking.

**Documentation:**
- README in \`tests/\` explaining structure.
- New devs know where to add what.

**Anti-patterns:**
- All tests in one giant \`__tests__/\` folder.
- Test code that looks nothing like production code (e.g., custom DSL).
- Helper hell — too much abstraction.`,
      tags: ["architecture"],
    },
  ],
};
