import type { Category } from "./types";

export const vue: Category = {
  slug: "vue",
  title: "Vue.js",
  description:
    "Vue 3: Composition API, reactivity, components, directives, Pinia, Vue Router, Nuxt, performance, and ecosystem.",
  icon: "💚",
  questions: [
    // ───── EASY ─────
    {
      id: "what-is-vue",
      title: "What is Vue.js?",
      difficulty: "easy",
      question: "What is Vue and how does it compare to React?",
      answer: `**Vue.js** is a progressive JavaScript framework for building UIs. Created by Evan You in 2014.

**Vs React:**
| Aspect              | Vue                              | React                              |
|---------------------|----------------------------------|------------------------------------|
| Templates           | HTML-based with directives       | JSX                                |
| Reactivity          | Automatic (Proxy-based)          | Explicit (\`useState\`, deps)        |
| API style           | Options API + Composition API    | Hooks-based                         |
| Single-file components | \`.vue\` (template + script + style) | Convention by file                  |
| State management    | Pinia (official)                 | Many options (Redux, Zustand, ...)  |
| Routing             | Vue Router (official)            | React Router, TanStack Router, ...  |
| SSR framework       | Nuxt                             | Next.js, Remix                      |
| Bundle size         | ~30 KB                           | ~45 KB (React + DOM)                |

**Strengths:**
- **Gentle learning curve** — HTML templates feel familiar.
- **Single-file components** — colocated logic, template, style.
- **Built-in patterns** — transitions, scoped styles, directives.
- **Excellent docs** — among the best in the ecosystem.

**Vue 3** (current major) introduced **Composition API** + Proxy-based reactivity + better TypeScript support.`,
      tags: ["fundamentals"],
    },
    {
      id: "single-file-components",
      title: "Single File Components (SFC)",
      difficulty: "easy",
      question: "What is a Vue Single File Component?",
      answer: `A **\`.vue\` file** combines template, script, and style in one file.

\`\`\`vue
<script setup lang="ts">
import { ref } from "vue";
const count = ref(0);
const inc = () => count.value++;
</script>

<template>
  <button @click="inc">Count: {{ count }}</button>
</template>

<style scoped>
button { color: var(--brand); }
</style>
\`\`\`

**Three blocks:**
- **\`<template>\`** — HTML-like markup with Vue directives.
- **\`<script>\`** (or \`<script setup>\`) — component logic.
- **\`<style>\`** — CSS, optionally \`scoped\` to component.

**\`<script setup>\`** — Vue 3's modern syntax:
- Top-level imports/declarations are exposed automatically.
- No need to return an object.
- Cleaner than the older Options API.

**Scoped styles:**
- \`<style scoped>\` — styles only apply to this component (uses data attributes).
- \`<style module>\` — CSS modules pattern.

**Multi-block:**
- \`<docs>\`, \`<i18n>\` — custom blocks for tooling.

**Tooling:**
- **Vite** — recommended dev server.
- **Volar** (now "Vue - Official") — VS Code extension.
- **Vue Language Tools** — TypeScript, IntelliSense.`,
      tags: ["fundamentals"],
    },
    {
      id: "reactivity",
      title: "Reactivity: ref vs reactive",
      difficulty: "easy",
      question: "What's the difference between ref and reactive?",
      answer: `Vue 3 uses **Proxies** for reactivity. Two main APIs:

**\`ref(value)\`** — wraps any value (primitives included) in an object with a \`.value\` property.

\`\`\`ts
const count = ref(0);
count.value++;                       // mutate in script
{{ count }}                          // auto-unwrapped in template
\`\`\`

**\`reactive(object)\`** — makes an object deeply reactive (Proxy).

\`\`\`ts
const state = reactive({ count: 0, user: { name: "Ada" } });
state.count++;
state.user.name = "Bob";
\`\`\`

**When to use which:**
- **\`ref\`** for primitives, single values, when reassigning needed.
- **\`reactive\`** for related groups of state.
- Many devs use \`ref\` everywhere for consistency.

**Caveats:**
- **Don't destructure reactive** — loses reactivity:
  \`\`\`ts
  const { count } = reactive({ count: 0 }); // count is a plain number now
  \`\`\`
  Use \`toRefs\` to keep reactivity:
  \`\`\`ts
  const { count } = toRefs(state);
  \`\`\`
- **\`ref\` requires \`.value\`** in script (annoying but explicit).
- Templates auto-unwrap refs.

**Computed:**
\`\`\`ts
const doubled = computed(() => count.value * 2);
\`\`\`

**Watchers:**
\`\`\`ts
watch(count, (newVal, oldVal) => console.log(newVal));
watchEffect(() => console.log(count.value));   // auto-tracks
\`\`\`

Vue's reactivity is automatic — no \`useState\` setter calls.`,
      tags: ["reactivity"],
    },
    {
      id: "directives",
      title: "Directives",
      difficulty: "easy",
      question: "What are common Vue directives?",
      answer: `**Directives** are special template attributes prefixed with \`v-\`.

**Core directives:**
- **\`v-bind\`** (\`:attr\`) — bind attribute / prop.
\`\`\`vue
<a :href="url">link</a>
<input :class="{ active: isActive }" />
\`\`\`
- **\`v-on\`** (\`@event\`) — event listener.
\`\`\`vue
<button @click="onClick">Click</button>
<input @keyup.enter="submit" />
\`\`\`
- **\`v-model\`** — two-way binding.
\`\`\`vue
<input v-model="name" />
\`\`\`
- **\`v-if\` / \`v-else-if\` / \`v-else\`** — conditional render (removed from DOM).
- **\`v-show\`** — toggle CSS \`display\` (kept in DOM).
- **\`v-for\`** — list rendering.
\`\`\`vue
<li v-for="item in items" :key="item.id">{{ item.name }}</li>
\`\`\`
- **\`v-slot\`** — named slots in components.
- **\`v-html\`** — raw HTML insertion (XSS risk; rare).
- **\`v-text\`** — text insertion (use \`{{ }}\` instead).

**Modifiers:**
- \`@click.stop\`, \`@click.prevent\`, \`@click.once\`.
- \`@keyup.enter\`, \`@keyup.esc\`.
- \`v-model.number\`, \`v-model.trim\`, \`v-model.lazy\`.

**Custom directives:**
\`\`\`ts
const vFocus = { mounted: (el) => el.focus() };

<input v-focus />
\`\`\`

**Style / class shortcuts:**
\`\`\`vue
<div :class="[base, isActive && 'active']" />
<div :style="{ color: textColor }" />
\`\`\``,
      tags: ["fundamentals"],
    },
    {
      id: "components",
      title: "Components and props",
      difficulty: "easy",
      question: "How do components and props work in Vue?",
      answer: `Define a component as a \`.vue\` file or via \`defineComponent\`:

\`\`\`vue
<!-- UserCard.vue -->
<script setup lang="ts">
defineProps<{
  name: string;
  age?: number;
}>();
</script>

<template>
  <div class="card">
    <h3>{{ name }}</h3>
    <p v-if="age">{{ age }} years old</p>
  </div>
</template>
\`\`\`

**Use:**
\`\`\`vue
<UserCard name="Ada" :age="30" />
\`\`\`

**defineProps** options:
- TypeScript: pass type as generic.
- Runtime: \`defineProps({ name: String, age: { type: Number, default: 0 } })\`.

**Emit events:**
\`\`\`vue
<script setup>
const emit = defineEmits<{ select: [id: string] }>();
const onClick = (id: string) => emit("select", id);
</script>
\`\`\`

Parent listens:
\`\`\`vue
<UserCard @select="onSelect" />
\`\`\`

**Slots** for content projection:
\`\`\`vue
<!-- Card.vue -->
<template>
  <div class="card">
    <header><slot name="header" /></header>
    <slot />
  </div>
</template>

<!-- usage -->
<Card>
  <template #header>Title</template>
  <p>Body</p>
</Card>
\`\`\`

**\`v-model\` on components:**
\`\`\`vue
<MyInput v-model="text" />
<!-- equivalent to -->
<MyInput :modelValue="text" @update:modelValue="text = \$event" />
\`\`\`

**Component registration:**
- **Auto-import** with \`unplugin-vue-components\` (recommended).
- Manual: \`import + components: { ... }\`.`,
      tags: ["fundamentals"],
    },
    {
      id: "lifecycle",
      title: "Lifecycle hooks",
      difficulty: "easy",
      question: "What are Vue lifecycle hooks?",
      answer: `**Composition API hooks:**

\`\`\`vue
<script setup>
import { onMounted, onUnmounted, onUpdated } from "vue";

onMounted(() => console.log("mounted"));
onUnmounted(() => console.log("cleanup"));
onUpdated(() => console.log("updated"));
</script>
\`\`\`

**All hooks:**
- **\`onBeforeMount\`** — before first render.
- **\`onMounted\`** — after first render. **DOM available.**
- **\`onBeforeUpdate\`** — reactive data changed; before re-render.
- **\`onUpdated\`** — after re-render.
- **\`onBeforeUnmount\`** — before removal.
- **\`onUnmounted\`** — after removal. **Cleanup time.**
- **\`onErrorCaptured\`** — child errors.
- **\`onActivated\` / \`onDeactivated\`** — for \`<KeepAlive>\`.

**Vs React:**
- React's \`useEffect(fn, [])\` ≈ \`onMounted\`.
- React's \`useEffect(fn)\` cleanup ≈ \`onUnmounted\`.
- Vue's reactivity auto-tracks; no dependency array.

**Server-side:**
- \`onServerPrefetch\` — runs only during SSR; awaitable.

**Common patterns:**
\`\`\`ts
onMounted(async () => {
  data.value = await fetchData();
});

onUnmounted(() => {
  intervalId && clearInterval(intervalId);
  websocket?.close();
});
\`\`\`

**watchers** as alternative for "run when X changes":
\`\`\`ts
watchEffect(() => fetchUser(userId.value));
\`\`\`

Cleaner than equivalent React \`useEffect\` because dependencies are auto-tracked.`,
      tags: ["fundamentals"],
    },
    {
      id: "vue-router",
      title: "Vue Router basics",
      difficulty: "easy",
      question: "How does Vue Router work?",
      answer: `Official routing library — declarative routes, nested layouts, navigation guards.

\`\`\`ts
// router.ts
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: Home },
    { path: "/users/:id", component: UserDetail, props: true },
    { path: "/admin", component: Admin, meta: { requiresAuth: true } },
    { path: "/:pathMatch(.*)*", component: NotFound },
  ],
});

export default router;
\`\`\`

\`\`\`ts
// main.ts
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

createApp(App).use(router).mount("#app");
\`\`\`

\`\`\`vue
<!-- App.vue -->
<router-view />   <!-- where matched component renders -->
<router-link to="/users/42">User 42</router-link>
\`\`\`

**Programmatic navigation:**
\`\`\`ts
import { useRouter, useRoute } from "vue-router";
const router = useRouter();
const route = useRoute();

router.push("/users/42");
router.push({ name: "user", params: { id: 42 } });
router.replace("/login");
router.go(-1);

route.params.id;
route.query.q;
\`\`\`

**Navigation guards:**
\`\`\`ts
router.beforeEach((to, from) => {
  if (to.meta.requiresAuth && !isLoggedIn()) return "/login";
});
\`\`\`

**Lazy-loaded routes** for code splitting:
\`\`\`ts
{ path: "/admin", component: () => import("./Admin.vue") }
\`\`\`

**Modes:** \`createWebHistory\` (HTML5) or \`createWebHashHistory\` (\`#/\` based — for static hosts without rewrites).`,
      tags: ["routing"],
    },
    {
      id: "computed-watch",
      title: "computed vs watch",
      difficulty: "easy",
      question: "When do you use computed vs watch vs watchEffect?",
      answer: `**\`computed\`** — derived state. Cached based on dependencies.

\`\`\`ts
const fullName = computed(() => \`\${first.value} \${last.value}\`);
\`\`\`

- Returns a value.
- Re-computes only when dependencies change.
- Cached: multiple reads in the same render don't recompute.
- Use for: any value derived from reactive state.

**\`watch\`** — react to specific source changes; old + new values.

\`\`\`ts
watch(query, (newVal, oldVal) => {
  searchAPI(newVal);
});

// Multiple sources
watch([first, last], ([nf, nl], [of, ol]) => { ... });

// Deep watch on object
watch(user, (newUser) => save(newUser), { deep: true });
\`\`\`

- For side effects with explicit dependencies.
- Get old + new values.
- \`immediate: true\` runs on setup; \`flush: 'post'\` runs after DOM update.

**\`watchEffect\`** — auto-track dependencies; no source needed.

\`\`\`ts
watchEffect(() => {
  console.log(\`User \${userId.value} viewed\`);
});
\`\`\`

- Runs immediately + on every dep change.
- Less explicit; can over-trigger.
- No old values.

**Picking:**
- Derived value → \`computed\`.
- Side effect with known dependencies → \`watch\`.
- Side effect, easy auto-tracking → \`watchEffect\`.

**Cleanup in watchers:**
\`\`\`ts
watchEffect((onCleanup) => {
  const id = setInterval(...);
  onCleanup(() => clearInterval(id));
});
\`\`\``,
      tags: ["reactivity"],
    },

    // ───── MEDIUM ─────
    {
      id: "composition-vs-options",
      title: "Composition API vs Options API",
      difficulty: "medium",
      question: "What's the difference between Composition API and Options API?",
      answer: `**Options API** (Vue 2 style, still supported in Vue 3):

\`\`\`vue
<script>
export default {
  data() { return { count: 0 }; },
  computed: { doubled() { return this.count * 2; } },
  methods: { inc() { this.count++; } },
  mounted() { console.log("mounted"); }
};
</script>
\`\`\`

**Composition API** (Vue 3 default):

\`\`\`vue
<script setup>
import { ref, computed, onMounted } from "vue";
const count = ref(0);
const doubled = computed(() => count.value * 2);
const inc = () => count.value++;
onMounted(() => console.log("mounted"));
</script>
\`\`\`

**Why Composition API:**
- **Better TypeScript inference** — types flow naturally.
- **Reusable composables** — extract logic to functions.
- **Group related code** — feature, not framework concept.
- **Less \`this\`** — no surprises about context.

**\`<script setup>\`** is shorthand for Composition API; even more concise.

**Composables** (Vue's hooks equivalent):
\`\`\`ts
// useCounter.ts
export function useCounter(initial = 0) {
  const count = ref(initial);
  const inc = () => count.value++;
  return { count, inc };
}

// component
const { count, inc } = useCounter();
\`\`\`

**Migration:** can mix in same project. New code Composition; legacy Options.

**For new projects:** Composition API + \`<script setup>\` is the modern default.`,
      tags: ["fundamentals"],
    },
    {
      id: "pinia",
      title: "Pinia (state management)",
      difficulty: "medium",
      question: "What is Pinia and how does it differ from Vuex?",
      answer: `**Pinia** is the official Vue state management library, replacing Vuex (which is in maintenance).

\`\`\`ts
// stores/counter.ts
import { defineStore } from "pinia";

export const useCounterStore = defineStore("counter", () => {
  const count = ref(0);
  const doubled = computed(() => count.value * 2);
  function inc() { count.value++; }
  return { count, doubled, inc };
});
\`\`\`

\`\`\`vue
<script setup>
import { useCounterStore } from "@/stores/counter";
const store = useCounterStore();

// or destructure with storeToRefs to keep reactivity
import { storeToRefs } from "pinia";
const { count } = storeToRefs(store);
const { inc } = store;
</script>

<template>{{ count }} <button @click="inc">+</button></template>
\`\`\`

**Vs Vuex:**
- **No mutations** — state is mutated directly.
- **No modules** — multiple stores naturally.
- **TypeScript-first**.
- **Smaller** (~1.5 KB vs Vuex 6 KB).
- **Devtools** integration.
- **Simpler** API — just functions.

**Setup syntax** (above) vs **Options syntax**:
\`\`\`ts
defineStore("counter", {
  state: () => ({ count: 0 }),
  getters: { doubled: (s) => s.count * 2 },
  actions: { inc() { this.count++ } }
});
\`\`\`

**Persisting state:**
- \`pinia-plugin-persistedstate\` — localStorage sync.

**SSR support:**
- Built in. Works with Nuxt seamlessly.

**Patterns:**
- One store per domain (auth, cart, products).
- Share via composables built on top of stores.`,
      tags: ["state"],
    },
    {
      id: "nuxt",
      title: "Nuxt",
      difficulty: "medium",
      question: "What is Nuxt and what does it add to Vue?",
      answer: `**Nuxt** is the Vue equivalent of Next.js — a meta-framework on top of Vue.

**Adds:**
- **File-based routing** (\`pages/\`).
- **Layouts** (\`layouts/\`).
- **SSR / SSG / ISR / hybrid rendering**.
- **Auto-imports** for components, composables, utilities.
- **API routes** (\`server/api/\`).
- **Module system** — first-party for analytics, auth, content.
- **Nitro server** — universal deployment (Node, Vercel, Netlify, Cloudflare, edge).
- **Built-in TypeScript**.
- **Image module** with optimization.
- **SEO helpers** (\`useHead\`, \`useSeoMeta\`).

\`\`\`vue
<!-- pages/index.vue → / -->
<script setup>
const { data } = await useFetch("/api/posts");
</script>

<template>
  <ul><li v-for="p in data">{{ p.title }}</li></ul>
</template>
\`\`\`

\`\`\`ts
// server/api/posts.get.ts
export default defineEventHandler(async () => {
  return await db.post.findMany();
});
\`\`\`

**Nuxt 3** — current major version, fully Vue 3 + Composition API.

**Rendering modes** (per route):
- SSR (default).
- SSG (\`nuxi generate\`).
- ISR via Nitro routeRules.
- SPA mode for full client.

**Modules:**
- @nuxt/image, @nuxt/content, @nuxtjs/tailwindcss, @nuxt/i18n, @sidebase/nuxt-auth, ...
- Add-on modules cover most needs.

**vs plain Vue:**
- Need routing, SSR, deployment? Use Nuxt.
- Pure SPA, custom build? Vite + Vue alone.`,
      tags: ["framework"],
    },
    {
      id: "transitions",
      title: "Transitions and animations",
      difficulty: "medium",
      question: "How do Vue transitions work?",
      answer: `Vue's built-in **\`<Transition>\`** component animates elements when they enter/leave the DOM.

\`\`\`vue
<Transition name="fade">
  <p v-if="show">Hello</p>
</Transition>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
\`\`\`

**Six CSS classes** auto-applied with the prefix:
- \`{name}-enter-from\` — initial state of entering.
- \`{name}-enter-active\` — during enter.
- \`{name}-enter-to\` — final state of entering.
- \`{name}-leave-from\`, \`-leave-active\`, \`-leave-to\` — same for leaving.

**\`<TransitionGroup>\`** — for animating lists.

\`\`\`vue
<TransitionGroup name="list" tag="ul">
  <li v-for="item in items" :key="item.id">{{ item.text }}</li>
</TransitionGroup>
\`\`\`

**JS hooks:**
\`\`\`vue
<Transition
  @before-enter="onBeforeEnter"
  @enter="onEnter"
  @after-enter="onAfterEnter"
  :css="false"
>
  ...
</Transition>
\`\`\`
For library integrations (GSAP, Anime.js).

**Mode:**
- \`mode="out-in"\` — wait for leave before entering (default is overlap).
- \`mode="in-out"\`.

**Enterprise-grade:**
- **VueUse Motion** for declarative motion API.
- **GSAP** for complex sequences.
- **Auto-Animate** drop-in for list animations.

**SVG / custom elements** — work the same way.

**Performance:** transitions on \`transform\`/\`opacity\` are GPU-accelerated; \`width\`/\`height\` cause layout.`,
      tags: ["animation"],
    },
    {
      id: "provide-inject",
      title: "provide / inject",
      difficulty: "medium",
      question: "What are provide and inject?",
      answer: `Vue's mechanism for sharing data with descendants without prop drilling.

\`\`\`ts
// Parent
import { provide, ref } from "vue";
const theme = ref("dark");
provide("theme", theme);
\`\`\`

\`\`\`ts
// Any descendant
import { inject } from "vue";
const theme = inject("theme", "light");   // default fallback
\`\`\`

**Type-safe with InjectionKey:**
\`\`\`ts
import type { InjectionKey, Ref } from "vue";
export const ThemeKey: InjectionKey<Ref<string>> = Symbol();

provide(ThemeKey, theme);
const theme = inject(ThemeKey)!;          // typed correctly
\`\`\`

**Vs Pinia:**
- Pinia = global state (any component).
- provide/inject = scoped to component subtree.

**Use cases:**
- Theme propagation.
- I18n locale.
- Plugin instances (auth, router, ...).
- "API" objects for child components.

**Reactive vs not:**
- Provide a \`ref\` → descendants react to changes.
- Provide a plain value → snapshot, no reactivity.

**Read-only:**
\`\`\`ts
import { readonly } from "vue";
provide("theme", readonly(theme));   // descendants can't mutate
\`\`\`

**Order:** provide must run before descendants try to inject.

**vs React Context:**
- Same pattern.
- Vue's reactivity removes the "re-render entire tree" issue React has with Context.`,
      tags: ["patterns"],
    },
    {
      id: "teleport-suspense",
      title: "Teleport and Suspense",
      difficulty: "medium",
      question: "What are Teleport and Suspense in Vue?",
      answer: `**\`<Teleport>\`** — render a piece of template into a DOM node elsewhere in the document.

\`\`\`vue
<Teleport to="body">
  <div class="modal">Hello</div>
</Teleport>
\`\`\`

**Why:**
- Modals, tooltips, dropdowns that should escape parent's CSS \`overflow\`/\`z-index\`.
- The component logic stays in its place; only DOM moves.

**Targets:** \`to="body"\`, \`to="#modal-root"\`, etc.

**Disable conditionally:**
\`\`\`vue
<Teleport :to="target" :disabled="isMobile">...</Teleport>
\`\`\`

---

**\`<Suspense>\`** — coordinate async dependencies (async setup, async components).

\`\`\`vue
<Suspense>
  <UserProfile />                  <!-- has async setup -->
  <template #fallback>Loading…</template>
</Suspense>
\`\`\`

\`\`\`vue
<!-- UserProfile.vue -->
<script setup>
const user = await fetchUser();   // top-level await in async setup
</script>
\`\`\`

**Use cases:**
- Lazy-loaded components.
- Server-side async data.
- Coordinated loading skeletons.

**Caveat:** \`<Suspense>\` is **experimental** in Vue 3 (stable in Nuxt context). API may evolve.

**Error handling:** \`@error\` event on \`<Suspense>\` for fallback rendering.

**vs React Suspense:** very similar concept; Vue's was added later.`,
      tags: ["patterns"],
    },
    {
      id: "composables",
      title: "Composables",
      difficulty: "medium",
      question: "What are composables and how do you write one?",
      answer: `A **composable** is a function that uses Composition API to encapsulate reusable stateful logic. Vue's equivalent of React hooks.

\`\`\`ts
// composables/useCounter.ts
import { ref } from "vue";

export function useCounter(initial = 0) {
  const count = ref(initial);
  const inc = () => count.value++;
  const dec = () => count.value--;
  const reset = () => count.value = initial;
  return { count, inc, dec, reset };
}
\`\`\`

\`\`\`vue
<script setup>
import { useCounter } from "@/composables/useCounter";
const { count, inc, reset } = useCounter(10);
</script>
\`\`\`

**Convention:** name starts with \`use\` (mirrors React).

**Common composables:**

\`\`\`ts
export function useFetch<T>(url: string) {
  const data = ref<T | null>(null);
  const error = ref<Error | null>(null);
  const loading = ref(true);

  const run = async () => {
    try {
      const res = await fetch(url);
      data.value = await res.json();
    } catch (e) { error.value = e as Error; }
    finally { loading.value = false; }
  };
  onMounted(run);
  return { data, error, loading, refresh: run };
}
\`\`\`

**VueUse** — huge collection of community composables (useLocalStorage, useMouse, useDebounce, useIntersectionObserver, useWebSocket, ...). Like React's "use\\* hooks" libraries.

**Best practices:**
- Pure logic, no DOM unless necessary.
- Return refs (or \`reactive\` object).
- Use lifecycle hooks inside if needed (called only during component setup).
- Keep them small and single-purpose.

**vs React hooks:**
- Vue composables are **regular functions** — no rules-of-hooks ordering constraint.
- Reactivity is automatic — no dependency arrays.
- Easier to compose without "stale closure" bugs.`,
      tags: ["patterns"],
    },
    {
      id: "v-model-custom",
      title: "v-model on custom components",
      difficulty: "medium",
      question: "How do you implement v-model on a custom component?",
      answer: `**\`v-model\`** is sugar over \`:modelValue\` + \`@update:modelValue\`.

\`\`\`vue
<!-- MyInput.vue -->
<script setup lang="ts">
defineProps<{ modelValue: string }>();
defineEmits<{ "update:modelValue": [value: string] }>();
</script>

<template>
  <input
    :value="modelValue"
    @input="\$emit('update:modelValue', \$event.target.value)"
  />
</template>
\`\`\`

\`\`\`vue
<MyInput v-model="text" />
\`\`\`

**Multiple v-models:** name each one.
\`\`\`vue
<UserForm v-model:first-name="firstName" v-model:last-name="lastName" />
\`\`\`

\`\`\`vue
<!-- UserForm.vue -->
<script setup>
defineProps<{ firstName: string; lastName: string }>();
defineEmits<{
  "update:firstName": [value: string];
  "update:lastName": [value: string];
}>();
</script>
\`\`\`

**\`defineModel\`** (Vue 3.4+) — even cleaner:
\`\`\`vue
<script setup>
const firstName = defineModel<string>("firstName", { required: true });
// firstName is now a ref; mutations sync to parent
</script>

<template>
  <input v-model="firstName" />
</template>
\`\`\`

**Modifiers** (\`v-model.trim\`, \`v-model.number\`):
\`\`\`vue
<script setup>
const props = defineProps<{ modelValue: string; modelModifiers?: { capitalize?: boolean } }>();
const emit = defineEmits(["update:modelValue"]);
const onInput = (e) => {
  let v = e.target.value;
  if (props.modelModifiers?.capitalize) v = v.toUpperCase();
  emit("update:modelValue", v);
};
</script>
\`\`\`

\`v-model\` is one of Vue's superpowers — **idiomatic two-way binding** without verbose Redux-style action plumbing.`,
      tags: ["forms"],
    },

    // ───── HARD ─────
    {
      id: "reactivity-internals",
      title: "Reactivity internals (Proxy)",
      difficulty: "hard",
      question: "How does Vue's reactivity work under the hood?",
      answer: `Vue 3's reactivity is built on **ES6 Proxies**.

**Core concept:**
- \`reactive(obj)\` returns a Proxy that intercepts \`get\` and \`set\` operations.
- On \`get\`: track which **effect** (function) is reading this property.
- On \`set\`: trigger all tracked effects to re-run.

**Simplified pseudo-code:**
\`\`\`ts
let activeEffect = null;
const targetMap = new WeakMap(); // target → key → Set<effect>

function track(target, key) {
  if (!activeEffect) return;
  let depsMap = targetMap.get(target);
  if (!depsMap) targetMap.set(target, depsMap = new Map());
  let dep = depsMap.get(key);
  if (!dep) depsMap.set(key, dep = new Set());
  dep.add(activeEffect);
}

function trigger(target, key) {
  const depsMap = targetMap.get(target);
  depsMap?.get(key)?.forEach(effect => effect());
}

function reactive(obj) {
  return new Proxy(obj, {
    get(t, k) { track(t, k); return Reflect.get(t, k); },
    set(t, k, v) { Reflect.set(t, k, v); trigger(t, k); return true; }
  });
}
\`\`\`

**\`effect\`** wraps any reactive function (computed, watch, render):
\`\`\`ts
function effect(fn) {
  activeEffect = fn;
  fn();
  activeEffect = null;
}
\`\`\`

**Vue 2 used \`Object.defineProperty\`** which had limitations:
- Couldn't detect property add/delete on objects.
- Couldn't detect array index changes.
- Required \`Vue.set()\` workaround.

**Vue 3 with Proxy** fixes all of these. Plus it's faster for many keys.

**Trade-off:** Proxy doesn't work in IE11 (Vue 3 dropped IE support).

**\`ref\`** is implemented as a small object with a \`get/set value\` accessor + reactive triggering. Effectively \`reactive({ value })\` with sugar.

**Performance:** O(1) tracking; very efficient for most apps. The cost is the indirect access (vs direct property).`,
      tags: ["internals"],
    },
    {
      id: "ssr-hydration",
      title: "SSR and hydration",
      difficulty: "hard",
      question: "How does Vue SSR + hydration work?",
      answer: `**SSR flow:**
1. Server renders Vue components to HTML (\`renderToString\`).
2. HTML + serialized state shipped to browser.
3. Browser parses HTML, then **hydrates** — Vue mounts the same component tree on top of existing DOM, attaching event listeners.

**Hydration:**
- Vue walks the existing DOM.
- Reuses nodes; doesn't recreate.
- Wires up reactivity and listeners.
- After hydration, behaves like a normal SPA.

**Hydration mismatches:** server HTML differs from client render → warning + Vue may re-render.

**Common causes:**
- \`Date.now()\` / random in render.
- Conditional rendering based on \`window\` (server has no window).
- Different data on server vs client.

**Fix:**
- Use **\`onMounted\`** to defer client-only code.
- Use **\`<ClientOnly>\`** (Nuxt) component.
- Use **deterministic** values during render.

**Async setup + Suspense** for awaitable data fetching:
\`\`\`vue
<script setup>
const user = await fetchUser();   // SSR awaits this
</script>
\`\`\`

**Streaming SSR** (Vue 3.4+):
- Render in chunks; flush as ready.
- Improves TTFB for big pages.
- Nuxt 3 uses this with Nitro.

**Lazy hydration** (planned):
- Hydrate components only when visible / interacted with.
- Reduces JS execution on initial load.

**Nuxt** handles all of this for you. For raw SSR:
- \`@vue/server-renderer\` package.
- More setup; usually not worth doing manually.

**Comparison vs React:**
- Both have hydration.
- React has streaming SSR + Selective Hydration via Suspense.
- Vue 3 catching up; Vue + Nuxt has solid story.`,
      tags: ["rendering", "ssr"],
    },
    {
      id: "vue-perf",
      title: "Vue performance optimizations",
      difficulty: "hard",
      question: "What are common Vue performance pitfalls?",
      answer: `**1. Excessive re-renders.**
- Vue's reactivity is fine-grained; usually only what changed re-renders.
- But: **unstable keys** in \`v-for\`, **inline functions** as props can cause unnecessary work.

**2. Large \`reactive\` objects.**
- Each property tracked. Heavy on objects with thousands of keys.
- Use **\`shallowRef\`** / **\`shallowReactive\`** when nested reactivity isn't needed.

**3. Computed properties with expensive logic.**
- Cached, but if dependencies churn frequently, re-compute often.
- Memoize at a smaller granularity.

**4. \`v-for\` without \`:key\`** — Vue can't track items efficiently.
- Always use stable, unique keys.

**5. Large lists rendered in full.**
- Use **virtual scrolling** (\`vue-virtual-scroller\`, TanStack Virtual).
- Render only visible rows.

**6. Heavy components without \`defineAsyncComponent\`.**
- Lazy-load with code splitting.
\`\`\`ts
const Chart = defineAsyncComponent(() => import("./Chart.vue"));
\`\`\`

**7. Watchers triggering chains.**
- A → B → C → A loops cause infinite re-renders.
- Use \`watch\` with \`flush: 'post'\` or guard conditions.

**8. CSS not scoped causing global selectors.**
- Use \`<style scoped>\` or CSS modules.

**9. Bundle size.**
- Tree-shake by importing only needed Vue features.
- Use \`unplugin-vue-components\` for on-demand component imports.
- Analyze with \`rollup-plugin-visualizer\`.

**10. Hydration mismatch warnings.**
- Indicates a perf-impacting bug; fix to avoid client-side re-render.

**Tools:**
- **Vue DevTools** for component inspection, performance profiling.
- **\`v-once\`** directive for static content.
- **\`v-memo\`** to skip re-render if specific deps unchanged.
\`\`\`vue
<div v-memo="[item.id, item.selected]">{{ item.name }}</div>
\`\`\``,
      tags: ["performance"],
    },
  ],
};
