import type { Category } from "./types";

export const webComponents: Category = {
  slug: "web-components",
  title: "Web Components",
  description:
    "The browser-native component model: Custom Elements, Shadow DOM, HTML Templates, slots, lifecycle callbacks, form integration, accessibility, Lit 3.x, and SSR with Declarative Shadow DOM.",
  icon: "🧩",
  questions: [
    // ───── EASY ─────
    {
      id: "what-are-web-components",
      title: "What are Web Components?",
      difficulty: "easy",
      question: "What are Web Components and which three specifications make up the standard?",
      answer: `**Web Components** is an umbrella term for a suite of browser-native APIs that let you create reusable, encapsulated custom HTML elements without a framework.

The standard rests on **three specifications**:

| Spec | What it provides |
|------|-----------------|
| **Custom Elements** | Register new HTML tags (e.g. \`<my-button>\`) with their own behaviour |
| **Shadow DOM** | An isolated DOM subtree attached to an element, hiding internals from the page |
| **HTML Templates** | \`<template>\` and \`<slot>\` for inert, reusable markup fragments |

Together they give you encapsulation, reusability, and interoperability — any JavaScript framework can consume a web component because it's just an HTML element.

**Browser support (2026):** All three specs are fully supported in every major browser. No polyfills are needed for new projects.

\`\`\`html
<!-- Using a custom element feels like built-in HTML -->
<user-avatar name="Ada" size="48"></user-avatar>
\`\`\``,
      tags: ["web-components", "custom-elements", "shadow-dom", "html-templates"],
    },
    {
      id: "define-custom-element",
      title: "Defining a custom element",
      difficulty: "easy",
      question: "How do you define and register a basic custom element in vanilla JavaScript?",
      answer: `A custom element is a class that **extends \`HTMLElement\`** (or a built-in element) and is registered with \`customElements.define\`.

\`\`\`js
class GreetBanner extends HTMLElement {
  connectedCallback() {
    const name = this.getAttribute("name") ?? "World";
    this.textContent = \`Hello, \${name}!\`;
  }
}

// Tag name must contain at least one hyphen
customElements.define("greet-banner", GreetBanner);
\`\`\`

\`\`\`html
<greet-banner name="Ada"></greet-banner>
<!-- Renders: Hello, Ada! -->
\`\`\`

Key rules:
- The tag name **must contain a hyphen** to avoid clashing with future HTML elements.
- The class must extend \`HTMLElement\` (or a concrete element like \`HTMLButtonElement\` for customised built-ins).
- \`customElements.define\` can only be called once per tag name.
- You can check readiness with \`await customElements.whenDefined("greet-banner")\`.`,
      tags: ["custom-elements", "htmlelement"],
    },
    {
      id: "lifecycle-callbacks",
      title: "Lifecycle callbacks",
      difficulty: "easy",
      question: "What are the lifecycle callbacks available in a custom element and when does each fire?",
      answer: `Custom elements expose four lifecycle callbacks:

| Callback | When it fires |
|----------|--------------|
| \`constructor()\` | Element is created (or upgraded). Keep it minimal — no DOM reads yet. |
| \`connectedCallback()\` | Element is inserted into a document. Safe to render child DOM here. |
      | \`disconnectedCallback()\` | Element is removed from the document. Clean up listeners, timers, observers. |
| \`attributeChangedCallback(name, oldVal, newVal)\` | A watched attribute changes. Must pair with \`static observedAttributes\`. |
| \`adoptedCallback()\` | Element is moved to a new document (e.g. into an \`<iframe>\`). Rare. |

\`\`\`js
class MyTimer extends HTMLElement {
  static observedAttributes = ["interval"];

  #timer = null;

  connectedCallback() {
    this.#start();
  }

  disconnectedCallback() {
    clearInterval(this.#timer);
  }

  attributeChangedCallback(name, _old, next) {
    if (name === "interval") {
      clearInterval(this.#timer);
      this.#start();
    }
  }

  #start() {
    const ms = Number(this.getAttribute("interval") ?? 1000);
    this.#timer = setInterval(() => this.#tick(), ms);
  }

  #tick() { /* ... */ }
}
\`\`\`

> **Gotcha:** \`connectedCallback\` can fire multiple times if the element is moved between containers — always guard against double-initialisation.`,
      tags: ["custom-elements", "lifecycle"],
    },
    {
      id: "shadow-dom-basics",
      title: "Shadow DOM basics",
      difficulty: "easy",
      question: "What is the Shadow DOM and how do you attach one to a custom element?",
      answer: `The **Shadow DOM** is a separate, isolated DOM tree attached to a host element. Styles and scripts inside the shadow tree do not leak out, and page styles do not leak in (by default).

\`\`\`js
class FancyCard extends HTMLElement {
  constructor() {
    super();
    // attachShadow returns the shadow root
    const shadow = this.attachShadow({ mode: "open" });

    shadow.innerHTML = \`
      <style>
        :host { display: block; border: 1px solid #ccc; padding: 1rem; }
        h2    { color: navy; }
      </style>
      <h2><slot name="title">Untitled</slot></h2>
      <slot></slot>
    \`;
  }
}
customElements.define("fancy-card", FancyCard);
\`\`\`

**Light DOM vs Shadow DOM:**

| Term | Meaning |
|------|---------|
| **Light DOM** | The element's regular children provided by the consumer |
| **Shadow DOM** | The element's internal implementation DOM |

Slots bridge them — slotted light-DOM nodes are *rendered* inside the shadow tree but still live in the light DOM.`,
      tags: ["shadow-dom", "encapsulation"],
    },
    {
      id: "open-vs-closed-shadow",
      title: "open vs closed shadow mode",
      difficulty: "easy",
      question: "What is the difference between open and closed Shadow DOM mode?",
      answer: `The \`mode\` option passed to \`attachShadow\` controls external JavaScript access to the shadow root.

| Mode | \`el.shadowRoot\` from outside | Use case |
|------|-----------------------------|---------|
| \`"open"\` | Returns the \`ShadowRoot\` | Most components — enables DevTools inspection and testing |
| \`"closed"\` | Returns \`null\` | High-security widgets (e.g. payment inputs) where you want to prevent external script access |

\`\`\`js
// open
const shadow = host.attachShadow({ mode: "open" });
host.shadowRoot; // → ShadowRoot

// closed — you must hold a reference yourself
const shadow = host.attachShadow({ mode: "closed" });
host.shadowRoot; // → null
\`\`\`

**Practical advice:** Closed mode is not a security silver bullet — determined code can still patch \`Element.prototype.attachShadow\` to intercept the root. Prefer \`"open"\` for normal components; the developer-experience benefits are significant.`,
      tags: ["shadow-dom"],
    },
    {
      id: "html-templates",
      title: "HTML Templates",
      difficulty: "easy",
      question: "What is the <template> element and why is it useful for web components?",
      answer: `The \`<template>\` element holds **inert HTML** — it is parsed by the browser but never rendered or executed until you clone it.

\`\`\`html
<template id="card-tpl">
  <style> :host { display: block } </style>
  <article>
    <slot name="title"></slot>
    <slot></slot>
  </article>
</template>
\`\`\`

\`\`\`js
class MyCard extends HTMLElement {
  constructor() {
    super();
    const tpl = document.getElementById("card-tpl");
    this.attachShadow({ mode: "open" })
        .appendChild(tpl.content.cloneNode(true)); // deep clone
  }
}
\`\`\`

**Why clone?** \`template.content\` is a \`DocumentFragment\`. \`cloneNode(true)\` lets you stamp the same template many times without altering the original.

Benefits:
- Parsed once, cloned cheaply.
- Script tags inside \`<template>\` are **not executed** until the content is adopted into the document.
- Images and other sub-resources are **not fetched** while inside a template.`,
      tags: ["html-templates", "slots"],
    },
    {
      id: "named-slots",
      title: "Named slots and fallback content",
      difficulty: "easy",
      question: "How do named slots work and how do you provide fallback content when a slot is empty?",
      answer: `**Slots** project light-DOM children into designated places in the shadow tree.

**Named slot** — a slot with a \`name\` attribute that matches a child's \`slot\` attribute:

\`\`\`html
<!-- Component shadow DOM -->
<header><slot name="title">Default Title</slot></header>
<main><slot></slot></main>
<footer><slot name="actions"></slot></footer>
\`\`\`

\`\`\`html
<!-- Consumer -->
<my-dialog>
  <h2 slot="title">Confirm Delete</h2>
  <p>Are you sure?</p>
  <div slot="actions">
    <button>Cancel</button>
    <button>Delete</button>
  </div>
</my-dialog>
\`\`\`

**Fallback content** is whatever lives between the opening and closing \`<slot>\` tags. It is displayed when nothing is assigned to that slot:

\`\`\`html
<slot name="title">Untitled</slot>  <!-- "Untitled" shown if consumer omits slot="title" -->
\`\`\`

**Key points:**
- An unnamed \`<slot>\` is the *default slot* — catches all unassigned light-DOM children.
- A child can only be assigned to one slot.
- Slotted content retains its **light-DOM styles** (document CSS applies); shadow styles use \`::slotted()\` for additional styling.`,
      tags: ["html-templates", "slots"],
    },
    // ───── MEDIUM ─────
    {
      id: "attribute-vs-property",
      title: "Attribute vs property",
      difficulty: "medium",
      question: "What is the difference between HTML attributes and DOM properties in the context of custom elements, and how do you keep them in sync?",
      answer: `**Attributes** live in HTML markup and are always strings. **Properties** are JavaScript values on the DOM object — they can be any type.

For built-in elements (\`<input value="hi">\`) the browser syncs them automatically. For custom elements you must do it yourself.

**Pattern: property → attribute reflection (like built-ins do):**

\`\`\`js
class MyRating extends HTMLElement {
  static observedAttributes = ["value"];

  // Property getter reads from the attribute
  get value() {
    return Number(this.getAttribute("value") ?? 0);
  }

  // Property setter reflects to the attribute
  set value(v) {
    this.setAttribute("value", String(v));
  }

  attributeChangedCallback(name, _old, next) {
    if (name === "value") this.#render();
  }

  #render() {
    this.textContent = "★".repeat(this.value);
  }
}
\`\`\`

**When to reflect:**
- Simple scalar values (string, number, boolean) — reflect to attributes so CSS selectors and \`querySelector('[value="5"]\`) work.
- Large objects or arrays — store as a property only (no reflection); serialising to attributes is wasteful and lossy.

**Boolean attributes** follow HTML convention: presence = true, absence = false:
\`\`\`js
get disabled() { return this.hasAttribute("disabled"); }
set disabled(v) { this.toggleAttribute("disabled", Boolean(v)); }
\`\`\``,
      tags: ["custom-elements", "attributes", "properties"],
    },
    {
      id: "css-custom-properties",
      title: "Styling with CSS custom properties",
      difficulty: "medium",
      question: "How do CSS custom properties (variables) pierce the Shadow DOM boundary, and how should you design a component's style API?",
      answer: `Shadow DOM blocks most inherited styles and all class-based styles from entering. **CSS custom properties are inherited**, so they cross the shadow boundary freely — this makes them the primary theming API for web components.

\`\`\`css
/* Page / consumer */
my-button {
  --btn-bg: #0070f3;
  --btn-radius: 8px;
}
\`\`\`

\`\`\`css
/* Inside shadow DOM */
:host {
  display: inline-block;
}
button {
  background: var(--btn-bg, #333);       /* fallback if unset */
  border-radius: var(--btn-radius, 4px);
}
\`\`\`

**Design guidelines:**
- Document every custom property your component consumes.
- Provide sensible defaults via \`var(--foo, <default>)\`.
- Prefix variables with your component name (e.g. \`--my-button-\`) to avoid collisions.

**\`::part\` for structural styling:**

CSS custom properties work for values (colours, sizes). For structural overrides (layout, pseudo-elements) expose **parts**:

\`\`\`html
<!-- shadow DOM -->
<button part="base"><slot></slot></button>
\`\`\`

\`\`\`css
/* consumer */
my-button::part(base) {
  letter-spacing: 0.05em;
}
\`\`\`

**\`::slotted\`** styles slotted light-DOM children from inside the shadow:

\`\`\`css
::slotted(img) { border-radius: 50%; }
\`\`\`
Note: \`::slotted\` only matches direct slotted children, not their descendants.`,
      tags: ["shadow-dom", "css", "styling"],
    },
    {
      id: "slotted-and-part",
      title: "::slotted and ::part pseudo-elements",
      difficulty: "medium",
      question: "Explain the ::slotted() and ::part() CSS pseudo-elements and their limitations.",
      answer: `These two pseudo-elements are the blessed escape hatches for styling across the shadow boundary.

---

### \`::slotted()\`

Targets **light-DOM nodes** that have been assigned to a slot, written *inside* the shadow stylesheet:

\`\`\`css
/* Inside shadow DOM */
::slotted(*)        { box-sizing: border-box; }
::slotted(p)        { margin: 0; }
::slotted(.highlight) { color: gold; }
\`\`\`

**Limitations:**
- Selector must match a **direct** slotted child — \`::slotted(p > span)\` does not work.
- Specificity behaves like a normal class selector.
- Cannot target shadow-internal elements.

---

### \`::part()\`

Targets **shadow-DOM elements** that have been explicitly exported via the \`part\` attribute, written *outside* the component:

\`\`\`html
<!-- shadow template -->
<input part="input" /><button part="trigger">▼</button>
\`\`\`

\`\`\`css
/* Consumer stylesheet */
my-select::part(input)   { border-color: steelblue; }
my-select::part(trigger) { background: transparent; }
\`\`\`

**Limitations:**
- Parts cannot be selected across multiple shadow boundaries unless re-exported with \`exportparts\`.
- Pseudo-classes work: \`my-select::part(input):focus\` is valid.
- Pseudo-elements do not: \`my-select::part(input)::placeholder\` is **invalid**.

\`\`\`html
<!-- Re-exporting a nested component's parts -->
<inner-widget exportparts="thumb, track"></inner-widget>
\`\`\``,
      tags: ["shadow-dom", "css", "styling"],
    },
    {
      id: "form-associated-elements",
      title: "Form-associated custom elements",
      difficulty: "medium",
      question: "How do you create a custom element that participates in HTML forms (value submission, validation, labels)?",
      answer: `By default, custom elements are ignored by \`<form>\`. The **ElementInternals** API (and the \`formAssociated\` flag) makes them first-class form participants.

\`\`\`js
class StarRating extends HTMLElement {
  static formAssociated = true;         // opt-in

  #internals;
  #value = "0";

  constructor() {
    super();
    this.#internals = this.attachInternals(); // returns ElementInternals
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() { this.#render(); }

  get value() { return this.#value; }
  set value(v) {
    this.#value = v;
    this.#internals.setFormValue(v);          // tells the form the value
    this.#internals.setValidity(
      v === "0" ? { valueMissing: true } : {},
      "Please select a rating",
      this.shadowRoot.querySelector("input"),  // anchor for :invalid styling
    );
  }

  // Form lifecycle hooks via ElementInternals
  formResetCallback() { this.value = "0"; }
  formStateRestoreCallback(state) { this.value = state; }

  #render() { /* build shadow DOM stars UI */ }
}

customElements.define("star-rating", StarRating);
\`\`\`

\`\`\`html
<form>
  <label>Rating <star-rating name="rating" required></star-rating></label>
  <button type="submit">Submit</button>
</form>
\`\`\`

**What ElementInternals gives you:**
| Feature | API |
|---------|-----|
| Submit a value | \`internals.setFormValue(value, state?)\` |
| Constraint validation | \`internals.setValidity(flags, msg, anchor)\` |
| ARIA roles | \`internals.role\`, \`internals.ariaLabel\`, … |
| Labels | \`internals.labels\` (NodeList of associated \`<label>\`s) |`,
      tags: ["custom-elements", "forms", "element-internals"],
    },
    {
      id: "web-components-vs-framework",
      title: "Web components vs framework components",
      difficulty: "medium",
      question: "How do web components compare to React or Vue components, and when would you choose one over the other?",
      answer: `| Dimension | Web Components | React / Vue components |
|-----------|---------------|----------------------|
| **Runtime dependency** | None — browser-native | Framework bundle required |
| **Interoperability** | Works in any framework or plain HTML | Tied to the framework ecosystem |
| **Reactivity** | Manual (or via library like Lit) | Built-in VDOM / reactivity system |
| **SSR** | Possible with Declarative Shadow DOM | Mature, first-class support |
| **Ecosystem** | Growing; smaller than React's | Huge (npm, component libraries) |
| **Dev experience** | Verbose without Lit; raw browser APIs | Excellent tooling, HMR, DevTools |
| **Styling** | True encapsulation via Shadow DOM | CSS Modules, scoped styles, or CSS-in-JS |
| **Performance** | Native — no diffing overhead | Optimised but adds framework overhead |

**Choose web components when:**
- Building a **design system** that must work across multiple tech stacks (e.g. a company with React, Angular, and Vue teams).
- Building **standalone widgets** to be embedded in third-party sites.
- You want **zero framework lock-in** for long-lived components.

**Choose framework components when:**
- Building an **application** with complex state and routing.
- The team is already invested in one framework's ecosystem.
- You need mature SSR, streaming, or server actions.

In practice these are not mutually exclusive — you can author web components with **Lit**, then consume them inside React or Vue with thin wrappers.`,
      tags: ["web-components", "react", "vue", "frameworks"],
    },
    {
      id: "lit-basics",
      title: "Lit basics",
      difficulty: "medium",
      question: "What is Lit and how does it simplify web component authoring?",
      answer: `**Lit** is a lightweight (~5 kB) library from Google that sits on top of the Web Components standards and adds:

- **Reactive properties** — declarative state that auto-schedules efficient DOM updates.
- **Tagged template literals** for declarative, HTML-safe templating (\`html\`\`\`).
- **Lifecycle helpers** and class-field decorators (optional, Lit 3.x).

\`\`\`js
import { LitElement, html, css } from "lit";
import { property, customElement } from "lit/decorators.js";

@customElement("user-card")
class UserCard extends LitElement {
  static styles = css\`
    :host { display: block; font-family: sans-serif; }
    h2    { color: var(--card-heading-color, #333); }
  \`;

  @property() name = "Anonymous";
  @property({ type: Number }) age = 0;

  render() {
    return html\`
      <h2>\${this.name}</h2>
      <p>Age: \${this.age}</p>
    \`;
  }
}
\`\`\`

\`\`\`html
<user-card name="Ada" age="36"></user-card>
\`\`\`

**How Lit's rendering works:**
1. \`html\`\`\` tags produce a \`TemplateResult\` — a description, not real DOM.
2. On first render Lit clones a \`<template>\` and patches only the dynamic parts.
3. On updates it diffs **only the bindings**, not the whole tree — similar in concept to a VDOM but with zero parsing overhead.

**Lit 3.x additions:**
- Standard decorators (TC39 Stage 3) supported without Babel.
- Reactive controllers for reusable stateful logic.
- \`@lit-labs/ssr\` for server-side rendering with Declarative Shadow DOM.`,
      tags: ["lit", "web-components"],
    },
    {
      id: "lit-reactive-properties",
      title: "Lit reactive properties",
      difficulty: "medium",
      question: "How do reactive properties work in Lit, and what options can you pass to @property()?",
      answer: `In Lit, a **reactive property** is a class field (or accessor) that, when changed, automatically schedules an async re-render of the component.

\`\`\`js
import { LitElement, html } from "lit";
import { property, state } from "lit/decorators.js";

class MyEl extends LitElement {
  // Public — reflects to attribute, consumers can set via HTML or JS
  @property({ type: Number, reflect: true }) count = 0;

  // Private reactive state — no attribute, not part of public API
  @state() _open = false;

  render() {
    return html\`<p>Count: \${this.count}</p>\`;
  }
}
\`\`\`

**\`@property()\` options:**

| Option | Default | Description |
|--------|---------|-------------|
| \`type\` | \`String\` | Converter used when reading attribute (\`Number\`, \`Boolean\`, \`Array\`, \`Object\`) |
| \`attribute\` | property name | Name of the observed HTML attribute (\`false\` to disable) |
| \`reflect\` | \`false\` | Mirror property changes back to the attribute |
| \`converter\` | built-in | Custom \`{fromAttribute, toAttribute}\` functions |
| \`hasChanged\` | \`!==\` | Custom equality check to decide if re-render is needed |

**\`@state()\`** is shorthand for \`@property({ state: true })\` — no attribute binding, no reflection.

**Batched rendering:** Lit batches multiple property changes into a single microtask update, so setting \`this.count = 1; this.label = "hi";\` causes only one re-render.`,
      tags: ["lit", "reactive-properties"],
    },
    {
      id: "aria-shadow-dom",
      title: "ARIA and accessibility in Shadow DOM",
      difficulty: "medium",
      question: "What accessibility challenges does Shadow DOM introduce and how do you address them?",
      answer: `Shadow DOM creates isolated subtrees that break several accessibility mechanisms built on the assumption of a single flat DOM.

**Problem 1 — \`aria-labelledby\` cross-root references**

\`aria-labelledby\` takes an IDREF but IDs are scoped to a tree — an ID inside a shadow root is invisible from the light DOM and vice versa.

*Workaround:* Use \`ElementInternals.ariaLabel\` or expose a \`label\` attribute that the component forwards internally.

\`\`\`js
// Inside component
attributeChangedCallback(name, _, val) {
  if (name === "label") this.#internals.ariaLabel = val;
}
\`\`\`

**Problem 2 — Focus management**

\`document.activeElement\` returns the host element, not the focused element inside the shadow. Use \`shadowRoot.activeElement\` or the \`composedPath()\` of a focus event.

**Problem 3 — Screen reader traversal**

Screen readers generally pierce shadow roots today (2026), but always test with NVDA/VoiceOver. Ensure your shadow DOM has proper heading hierarchy and landmark roles.

**Best practices:**

- Use semantic HTML inside shadow roots (\`<button>\`, \`<nav>\`, \`<main>\`).
- Delegate ARIA via \`ElementInternals\`:
  \`\`\`js
  this.#internals.role = "checkbox";
  this.#internals.ariaChecked = "false";
  \`\`\`
- Manage focus explicitly: \`this.shadowRoot.querySelector("button").focus()\`.
- Expose a \`label\` or \`aria-label\` attribute that the component consumes internally.
- Test with keyboard-only navigation and a real screen reader.`,
      tags: ["accessibility", "aria", "shadow-dom"],
    },
    {
      id: "event-retargeting",
      title: "Event retargeting across shadow boundaries",
      difficulty: "medium",
      question: "How does event retargeting work when events cross the Shadow DOM boundary?",
      answer: `When an event fired inside a shadow root bubbles to the **light DOM**, the browser **retargets** it — the \`event.target\` is replaced with the **host element** rather than the internal element that actually fired it. This preserves encapsulation.

\`\`\`html
<!-- shadow DOM of <fancy-input> -->
<input id="inner" />
\`\`\`

\`\`\`js
document.querySelector("fancy-input").addEventListener("click", e => {
  console.log(e.target); // → <fancy-input>, NOT the inner <input>
});
\`\`\`

**Getting the full path — \`composedPath()\`:**

\`\`\`js
document.addEventListener("click", e => {
  console.log(e.composedPath());
  // [input#inner, shadow-root, fancy-input, body, html, document, Window]
});
\`\`\`

**Custom events and \`composed\`:**

By default, custom events do **not** cross the shadow boundary (\`composed: false\`). To make them bubble through:

\`\`\`js
this.dispatchEvent(new CustomEvent("value-change", {
  bubbles: true,
  composed: true,   // cross shadow boundaries
  detail: { value: this.#value },
}));
\`\`\`

**Rule of thumb:** Use \`composed: true\` for events that consumers of the component need to observe. Keep internal events (\`composed: false\`) for implementation details.`,
      tags: ["shadow-dom", "events"],
    },
    // ───── HARD ─────
    {
      id: "declarative-shadow-dom-ssr",
      title: "Declarative Shadow DOM and SSR",
      difficulty: "hard",
      question: "What is Declarative Shadow DOM (DSD) and how does it solve server-side rendering for web components?",
      answer: `The fundamental SSR problem with web components is that \`attachShadow\` is a **JavaScript API** — the shadow tree doesn't exist until JS runs, so server-rendered HTML contains no shadow content, causing layout shift and FOUC.

**Declarative Shadow DOM (DSD)** solves this by allowing shadow roots to be declared in HTML via a \`<template>\` element with the \`shadowrootmode\` attribute. The browser parses it into a real shadow root *before* JavaScript runs.

\`\`\`html
<!-- Server sends this HTML -->
<user-card>
  <template shadowrootmode="open">
    <style>:host { display: block; }</style>
    <h2>Ada Lovelace</h2>
    <slot></slot>
  </template>
  <p>Mathematician and writer</p>
</user-card>
\`\`\`

The browser attaches the shadow root immediately during HTML parsing — no JS needed for initial paint.

**SSR workflow with Lit (@lit-labs/ssr):**

\`\`\`js
// server.js (Node)
import { render } from "@lit-labs/ssr";
import { html } from "lit";
import "./user-card.js"; // register element server-side

const ssrResult = render(html\`<user-card name="Ada"></user-card>\`);
// ssrResult is an async iterable of HTML strings with DSD templates
\`\`\`

**Client-side hydration:**

Lit's \`@lit-labs/ssr-client\` \`hydrateShadowRoots()\` reconnects the already-rendered DOM to live Lit element instances without re-rendering.

\`\`\`js
import { hydrateShadowRoots } from "@lit-labs/ssr-client/lit-element-hydrate-support.js";
hydrateShadowRoots(document.body);
\`\`\`

**Key DSD attributes:**

| Attribute | Effect |
|-----------|--------|
| \`shadowrootmode="open"\` | Creates an open shadow root |
| \`shadowrootmode="closed"\` | Creates a closed shadow root |
| \`shadowrootdelegatesfocus\` | Mirrors \`delegatesFocus\` option |
| \`shadowrootserializable\` | Allows \`getHTML({ serializableShadowRoots: true })\` |`,
      tags: ["shadow-dom", "ssr", "declarative-shadow-dom", "lit"],
    },
    {
      id: "element-internals-advanced",
      title: "ElementInternals deep dive",
      difficulty: "hard",
      question: "Explain the full ElementInternals API: form participation, validation, ARIA, and state.",
      answer: `\`ElementInternals\` is obtained by calling \`this.attachInternals()\` inside a custom element. It is the gateway to form participation, validation, and ARIA without polluting the public element API.

---

### Form participation

\`\`\`js
static formAssociated = true;

constructor() {
  super();
  this.#i = this.attachInternals();
}

// Set the form's submission value (and optional restore state)
this.#i.setFormValue("42", "42");

// Form reset hook
formResetCallback() { this.#setValue(this.getAttribute("default") ?? ""); }

// Browser autofill / back-button restore
formStateRestoreCallback(state, mode) {
  // mode: "restore" | "autocomplete"
  this.#setValue(state);
}
\`\`\`

### Constraint validation

\`\`\`js
// Mark invalid with a message and a visible anchor element
this.#i.setValidity(
  { rangeUnderflow: true },
  "Value must be at least 1",
  this.shadowRoot.querySelector("input")  // anchor for tooltip positioning
);

// Mark valid
this.#i.setValidity({});

// Check (same API as built-in elements)
this.#i.checkValidity();   // → boolean, fires "invalid" event
this.#i.reportValidity();  // → boolean, shows user-visible message
\`\`\`

### ARIA via ElementInternals

Sets **default ARIA** on the host without touching its attribute list:

\`\`\`js
this.#i.role       = "slider";
this.#i.ariaValueMin  = "0";
this.#i.ariaValueMax  = "100";
this.#i.ariaValueNow  = String(this.value);
\`\`\`

Consumer can still override: \`<my-slider aria-label="Volume">\` wins over the default.

### Custom state (CSS \`:state()\`)

\`\`\`js
// Lit / Vanilla
this.#i.states.add("--checked");
this.#i.states.delete("--checked");
\`\`\`

\`\`\`css
my-checkbox:state(--checked) { outline: 2px solid blue; }
\`\`\`

This lets consumers style internal boolean states without custom attributes.`,
      tags: ["element-internals", "forms", "aria", "custom-elements"],
    },
    {
      id: "upgrade-timing",
      title: "Custom element upgrade timing and FOUC",
      difficulty: "hard",
      question: "What is custom element upgrading, when does it happen, and how do you avoid flash-of-unstyled-content (FOUC)?",
      answer: `**Upgrading** is the process of turning a plain unknown HTML element (parsed before the defining script ran) into a fully initialised custom element instance.

**Upgrade timeline:**

1. Browser parses \`<my-button>Click</my-button>\` → creates an \`HTMLElement\` with tag \`my-button\` (no class, no lifecycle).
2. Script defines \`customElements.define("my-button", MyButton)\`.
3. Browser **upgrades** all existing instances: runs constructor, then \`connectedCallback\`.

Elements parsed *after* registration are upgraded synchronously; elements parsed before registration are upgraded in a microtask.

---

### FOUC strategies

**1. \`:not(:defined)\` CSS rule** — hide or mute unupgraded elements:

\`\`\`css
my-button:not(:defined) {
  visibility: hidden;      /* or opacity: 0 */
}
\`\`\`

**2. \`:defined\` — show only when ready:**

\`\`\`css
my-button { visibility: hidden; }
my-button:defined { visibility: visible; }
\`\`\`

**3. Await definition in JS:**

\`\`\`js
await customElements.whenDefined("my-button");
document.querySelector("my-button").doSomething();
\`\`\`

**4. Use \`customElements.upgrade(el)\`** to synchronously upgrade a subtree you've just created in JS:

\`\`\`js
const tpl = document.getElementById("tpl").content.cloneNode(true);
customElements.upgrade(tpl);             // upgrade before insert
document.body.appendChild(tpl);
\`\`\`

**5. Declarative Shadow DOM + SSR** — the element renders before JS runs, so there is nothing unstyled to flash.

> **Async attribute reads:** Inside \`constructor\`, attributes are not yet available (the element hasn't been inserted). Read attributes in \`connectedCallback\` or \`attributeChangedCallback\`.`,
      tags: ["custom-elements", "upgrade", "performance"],
    },
    {
      id: "lit-controllers-and-directives",
      title: "Lit reactive controllers and directives",
      difficulty: "hard",
      question: "What are Lit reactive controllers and custom directives, and how do they extend Lit's rendering model?",
      answer: `### Reactive Controllers

A **reactive controller** is a class that hooks into a Lit element's lifecycle via the \`ReactiveControllerHost\` interface. It lets you package reusable stateful logic — similar to React hooks — without subclassing.

\`\`\`js
import { ReactiveController } from "lit";

export class MouseController {
  host;
  pos = { x: 0, y: 0 };

  constructor(host) {
    (this.host = host).addController(this);
  }

  hostConnected() {
    window.addEventListener("mousemove", this._onMove);
  }
  hostDisconnected() {
    window.removeEventListener("mousemove", this._onMove);
  }

  _onMove = (e) => {
    this.pos = { x: e.clientX, y: e.clientY };
    this.host.requestUpdate();       // ask the host to re-render
  };
}
\`\`\`

\`\`\`js
class MyEl extends LitElement {
  _mouse = new MouseController(this);

  render() {
    return html\`<p>Mouse: \${this._mouse.pos.x}, \${this._mouse.pos.y}</p>\`;
  }
}
\`\`\`

---

### Custom Directives

A **directive** is a function that takes control of how a binding is rendered and updated. Use them when you need fine-grained DOM manipulation that goes beyond normal template expressions.

\`\`\`js
import { Directive, directive, PartType } from "lit/directive.js";

class HighlightDirective extends Directive {
  render(text, query) {
    if (!query) return text;
    return text.replace(
      new RegExp(query, "gi"),
      m => \`<mark>\${m}</mark>\`
    );
  }

  // Override update() for DOM-level access
  update(part, [text, query]) {
    part.element.innerHTML = this.render(text, query); // careful with XSS
    return noChange;  // tell Lit we handled it
  }
}

export const highlight = directive(HighlightDirective);
\`\`\`

\`\`\`js
// Usage in a template
html\`<p>\${highlight(this.content, this.searchQuery)}</p>\`
\`\`\`

**Built-in Lit directives worth knowing:** \`repeat\` (keyed list rendering), \`classMap\`, \`styleMap\`, \`ifDefined\`, \`cache\`, \`guard\`, \`live\`, \`ref\`.`,
      tags: ["lit", "controllers", "directives"],
    },
    {
      id: "web-components-cross-framework",
      title: "Consuming web components in frameworks",
      difficulty: "hard",
      question: "What friction points exist when using web components inside React, Angular, or Vue, and how do you solve them?",
      answer: `Despite web components being standard HTML, each framework has quirks when consuming them.

---

### React (pre-React 19)

React treated all unknown props as HTML attributes (strings). Passing object/array data or listening to custom events required workarounds:

\`\`\`jsx
// BROKEN in React <19: passes "[object Object]" as attribute
<my-chart data={bigArray} />

// Workaround: use a ref
function Chart({ data }) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current.data = data;                        // set as property
    ref.current.addEventListener("select", handler); // add custom event listener
    return () => ref.current.removeEventListener("select", handler);
  }, [data]);
  return <my-chart ref={ref} />;
}
\`\`\`

**React 19** added full web-component support: object props are set as properties, \`on*\` props attach event listeners, and SSR emits DSD markup.

---

### Angular

Angular supports web components out of the box with \`CUSTOM_ELEMENTS_SCHEMA\`:

\`\`\`ts
@NgModule({ schemas: [CUSTOM_ELEMENTS_SCHEMA] })
\`\`\`

Property binding \`[prop]="value"\` sets the DOM property; event binding \`(myEvent)="handler($event)"\` works for custom events.

---

### Vue

Vue 3 handles web components well. Mark tags to opt-out of Vue component resolution:

\`\`\`js
// vite.config.js
plugins: [vue({ template: { compilerOptions: {
  isCustomElement: tag => tag.startsWith("my-")
}}})]
\`\`\`

Then use normal Vue bindings: \`:prop="value"\` for properties, \`@my-event="handler"\` for custom events.

---

### Summary table

| Framework | Object props | Custom events | SSR/DSD |
|-----------|-------------|--------------|---------|
| React <19 | ref workaround | addEventListener in useEffect | Manual |
| React 19+ | Native | Native (\`on*\`) | Native DSD |
| Angular | \`[prop]\` binding | \`(event)\` binding | Partial |
| Vue 3 | \`:prop\` binding | \`@event\` binding | Nuxt plugin |`,
      tags: ["web-components", "react", "angular", "vue", "interoperability"],
    },
    {
      id: "performance-large-lists",
      title: "Performance: web components at scale",
      difficulty: "hard",
      question: "What are the performance considerations when rendering many web component instances, and how does Lit's keyed repeat directive help?",
      answer: `Each custom element instance carries its own shadow root, styles, and lifecycle overhead. At scale (thousands of items) this can hurt.

---

### Shadow DOM style cost

When many instances share the same \`static styles\`, Lit 3 uses **adoptedStyleSheets** (\`CSSStyleSheet\` shared across shadow roots) so the stylesheet is parsed **once** and shared by reference:

\`\`\`js
static styles = css\`:host { display: block; color: navy; }\`;
// Lit internally: shadow.adoptedStyleSheets = [sharedSheet]
\`\`\`

Without this (plain \`<style>\` per instance) the browser parses the same CSS string N times.

---

### Keyed rendering with \`repeat\`

Lit's \`repeat\` directive uses a key function to reuse existing DOM rather than tear down and recreate:

\`\`\`js
import { repeat } from "lit/directives/repeat.js";

render() {
  return html\`
    <ul>
      \${repeat(
        this.items,
        item => item.id,               // key function
        item => html\`<li-item .data=\${item}></li-item>\`
      )}
    </ul>
  \`;
}
\`\`\`

Without \`repeat\`, Lit updates bindings in place but cannot move nodes — a sort re-renders every row. With \`repeat\`, Lit moves existing DOM nodes, preserving focus and animation state.

---

### Other tips

- **Lazy upgrade:** Define elements only when they scroll into view using an IntersectionObserver + dynamic \`import()\`.
- **Avoid too-granular elements:** A \`<td>\` custom element in a 10 000-row table is expensive. Use plain HTML for leaves; reserve custom elements for composites.
- **\`willUpdate\` hook in Lit:** Compute derived data before rendering to avoid redundant work inside \`render()\`.
- **\`scheduleUpdate\` override:** For animation-frame–aligned updates, override \`scheduleUpdate\` to \`return new Promise(r => requestAnimationFrame(r))\`.`,
      tags: ["performance", "lit", "web-components"],
    },
  ],
};
