import type { Category } from "./types";

export const cssInJs: Category = {
  slug: "css-in-js",
  title: "CSS-in-JS",
  description:
    "CSS-in-JS from core concepts and styled-components basics to Emotion, theming, dynamic styles, zero-runtime libraries (Vanilla Extract, Panda CSS, Linaria), SSR hydration, RSC compatibility, and migrating away from runtime solutions.",
  icon: "💅",
  questions: [
    // ───── EASY ─────
    {
      id: "what-is-css-in-js",
      title: "What is CSS-in-JS and why does it exist?",
      difficulty: "easy",
      question: "What is CSS-in-JS and what problems does it solve compared to traditional CSS?",
      answer: `**CSS-in-JS** is a pattern where CSS styles are written inside JavaScript (or TypeScript) files and applied to components at runtime or build time, rather than in separate \`.css\` files.

**Problems it solves:**

| Problem with traditional CSS | CSS-in-JS solution |
|---|---|
| Global scope — any class can clash with any other | Styles are automatically scoped to the component |
| Dead code — hard to know if a class is still used | Styles co-located with the component; delete component, delete styles |
| Dynamic values require inline styles or CSS variables | Props/state can be used directly inside style definitions |
| No JavaScript logic in selectors or values | Full JS available (conditionals, loops, theme values) |
| Cascade surprises | Each component owns its own styles; no implicit inheritance |

**Basic example (styled-components):**
\`\`\`tsx
import styled from "styled-components";

const Button = styled.button<{ $primary?: boolean }>\`
  padding: 0.5rem 1rem;
  background: \${(p) => (p.$primary ? "#3b82f6" : "transparent")};
  color: \${(p) => (p.$primary ? "#fff" : "#3b82f6")};
  border: 2px solid #3b82f6;
  border-radius: 0.375rem;
  font-weight: 600;
\`;

// Usage
<Button $primary>Save</Button>
<Button>Cancel</Button>
\`\`\`

**Trade-offs to be aware of:**
- Runtime libraries inject styles dynamically — adds JavaScript overhead and is incompatible with React Server Components
- Zero-runtime libraries (Vanilla Extract, Linaria, Panda CSS) solve this by generating static CSS at build time`,
      tags: ["fundamentals", "overview"],
    },
    {
      id: "styled-components-basics",
      title: "styled-components basics",
      difficulty: "easy",
      question: "How do you create and use a basic styled component? What is the tagged template literal syntax?",
      answer: `**styled-components** lets you attach CSS to a React component using a tagged template literal attached to an HTML element or another component.

**Creating a styled component:**
\`\`\`tsx
import styled from "styled-components";

// Styled HTML element
const Title = styled.h1\`
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1rem;
\`;

// Styled div
const Card = styled.div\`
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
\`;

// Usage — behaves like any React component
function Page() {
  return (
    <Card>
      <Title>Hello World</Title>
    </Card>
  );
}
\`\`\`

**How it works:**
1. At runtime, styled-components generates a unique class name (e.g. \`sc-abc123\`)
2. It injects the CSS for that class into a \`<style>\` tag in \`<head>\`
3. The component renders with that class applied

**Extending a styled component:**
\`\`\`tsx
const PrimaryButton = styled(Button)\`
  background: #3b82f6;
  color: white;
\`;
\`\`\`

**Styling any component that accepts \`className\`:**
\`\`\`tsx
// Third-party or custom component
const StyledLink = styled(RouterLink)\`
  text-decoration: none;
  color: #3b82f6;
\`;
\`\`\``,
      tags: ["styled-components", "basics"],
    },
    {
      id: "emotion-basics",
      title: "Emotion basics",
      difficulty: "easy",
      question: "What is Emotion and how does its css prop differ from styled-components' tagged template literal API?",
      answer: `**Emotion** is a CSS-in-JS library with two authoring APIs: \`styled\` (identical feel to styled-components) and the \`css\` prop (unique to Emotion).

**Setup — enable the \`css\` prop with the JSX pragma or Babel plugin:**
\`\`\`tsx
// Option 1: JSX pragma per file
/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";

// Option 2: Babel plugin (automatic, no pragma needed)
// .babelrc: { "plugins": ["@emotion/babel-plugin"] }
\`\`\`

**\`css\` prop usage:**
\`\`\`tsx
/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";

const headingStyle = css\`
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
\`;

function Page() {
  return (
    <div css={css\`padding: 2rem;\`}>
      <h1 css={headingStyle}>Hello</h1>
      <p css={{ color: "#6b7280", lineHeight: 1.6 }}>
        Emotion also accepts plain objects.
      </p>
    </div>
  );
}
\`\`\`

**Emotion \`styled\` API (same as styled-components):**
\`\`\`tsx
import styled from "@emotion/styled";

const Card = styled.div\`
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
\`;
\`\`\`

**styled-components vs Emotion \`css\` prop:**

| | styled-components | Emotion \`css\` prop |
|---|---|---|
| Creates new component | Yes | No — props on existing element |
| Object syntax | Limited | First-class |
| Composition | \`styled(X)\` | \`css={[a, b]}\` array merge |
| Bundle size | Larger | Smaller |`,
      tags: ["emotion", "basics", "css-prop"],
    },
    {
      id: "css-in-js-vs-css-modules-vs-utility",
      title: "CSS-in-JS vs CSS Modules vs utility-first",
      difficulty: "easy",
      question: "Compare CSS-in-JS, CSS Modules, and utility-first CSS (Tailwind). When would you choose each?",
      answer: `| Aspect | CSS-in-JS (runtime) | CSS Modules | Utility-first (Tailwind) |
|---|---|---|---|
| Scoping | Automatic (generated class) | Automatic (hashed class) | Manual (component abstraction) |
| Dynamic styles | First-class (props/state) | CSS variables or class swaps | Class name composition |
| Build output | JS bundle injects CSS | Static \`.css\` file | Static \`.css\` file |
| RSC compatible | No (runtime libraries) | Yes | Yes |
| TypeScript integration | Excellent | Good (with type gen) | Good (with IntelliSense) |
| Colocation | Styles in JS file | Sibling \`.module.css\` | Classes in JSX |
| Learning curve | Low-medium | Low | Low-medium |
| Performance | Runtime cost | Zero runtime | Zero runtime |

**Choose runtime CSS-in-JS (styled-components, Emotion) when:**
- Building a React client-only app or design system library
- You need complex dynamic theming via \`ThemeProvider\`
- Existing large codebase already uses it

**Choose CSS Modules when:**
- You want static CSS with zero runtime overhead
- You need RSC compatibility
- Team prefers CSS syntax over JS-in-CSS

**Choose utility-first (Tailwind) when:**
- Rapid prototyping with consistent design tokens
- Colocation of styles in JSX is acceptable
- You want the smallest possible CSS output

**Choose zero-runtime CSS-in-JS (Vanilla Extract, Panda CSS) when:**
- You want type-safe styles with zero runtime cost
- You need RSC compatibility but prefer CSS-in-JS ergonomics`,
      tags: ["comparison", "css-modules", "tailwind", "fundamentals"],
    },
    {
      id: "runtime-vs-zero-runtime",
      title: "Runtime vs zero-runtime CSS-in-JS",
      difficulty: "easy",
      question: "What is the difference between runtime and zero-runtime CSS-in-JS libraries?",
      answer: `**Runtime CSS-in-JS** generates and injects styles into the DOM at runtime, inside the browser (or during SSR on the server).

**Zero-runtime CSS-in-JS** extracts all styles to static \`.css\` files at build time — the browser receives plain CSS, no style injection at runtime.

**Runtime (styled-components, Emotion):**
\`\`\`tsx
// This style computation happens in the browser
const Box = styled.div<{ $size: number }>\`
  width: \${(p) => p.$size}px;   // evaluated when component renders
  color: \${(p) => p.theme.primary};
\`;
\`\`\`

**Zero-runtime (Vanilla Extract):**
\`\`\`ts
// styles.css.ts — runs only at build time
import { style, styleVariants } from "@vanilla-extract/css";

export const box = styleVariants({
  sm: { width: "64px" },
  md: { width: "128px" },
  lg: { width: "256px" },
});
// Outputs static CSS — no JS runs in the browser for styles
\`\`\`

**Key differences:**

| | Runtime | Zero-runtime |
|---|---|---|
| Style injection | Browser at render time | Build time → static CSS |
| Dynamic props | Arbitrary JS expressions | Pre-enumerated variants only |
| React Server Components | Incompatible | Compatible |
| Hydration cost | Requires serialization/rehydration | None |
| Bundle impact | Adds ~15–50 kB runtime | Negligible |
| Flexibility | Very high | High (within constraints) |

In 2026, zero-runtime is strongly preferred for new projects due to RSC compatibility and performance.`,
      tags: ["runtime", "zero-runtime", "performance", "fundamentals"],
    },
    {
      id: "global-styles",
      title: "Global styles in CSS-in-JS",
      difficulty: "easy",
      question: "How do you add global CSS (resets, body styles, fonts) when using styled-components or Emotion?",
      answer: `CSS-in-JS libraries provide specific APIs for styles that must live in the global scope rather than be scoped to a component.

**styled-components — \`createGlobalStyle\`:**
\`\`\`tsx
import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle\`
  *, *::before, *::after {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    font-family: "Inter", system-ui, sans-serif;
    background: #f9fafb;
    color: #111827;
    -webkit-font-smoothing: antialiased;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  @font-face {
    font-family: "Inter";
    src: url("/fonts/inter.woff2") format("woff2");
    font-display: swap;
  }
\`;

// Mount once at app root
function App() {
  return (
    <>
      <GlobalStyles />
      <Router />
    </>
  );
}
\`\`\`

**Emotion — \`Global\` component:**
\`\`\`tsx
import { Global, css } from "@emotion/react";

function App() {
  return (
    <>
      <Global
        styles={css\`
          *, *::before, *::after { box-sizing: border-box; }
          body { margin: 0; font-family: "Inter", system-ui, sans-serif; }
        \`}
      />
      <Router />
    </>
  );
}
\`\`\`

**Vanilla Extract — \`globalStyle\`:**
\`\`\`ts
// global.css.ts
import { globalStyle } from "@vanilla-extract/css";

globalStyle("*, *::before, *::after", { boxSizing: "border-box" });
globalStyle("body", { margin: 0, fontFamily: "Inter, system-ui, sans-serif" });
\`\`\``,
      tags: ["global-styles", "styled-components", "emotion", "vanilla-extract"],
    },
    {
      id: "keyframe-animations",
      title: "Keyframe animations",
      difficulty: "easy",
      question: "How do you define and use CSS keyframe animations in styled-components and Emotion?",
      answer: `Both libraries provide a helper to define \`@keyframes\` that generates a unique animation name to avoid collisions.

**styled-components — \`keyframes\`:**
\`\`\`tsx
import styled, { keyframes } from "styled-components";

const fadeIn = keyframes\`
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
\`;

const spin = keyframes\`
  to { transform: rotate(360deg); }
\`;

const Modal = styled.div\`
  animation: \${fadeIn} 0.2s ease-out;
\`;

const Spinner = styled.span\`
  display: inline-block;
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: \${spin} 0.75s linear infinite;
\`;
\`\`\`

**Emotion — \`keyframes\`:**
\`\`\`tsx
/** @jsxImportSource @emotion/react */
import { css, keyframes } from "@emotion/react";

const pulse = keyframes\`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
\`;

const skeletonStyle = css\`
  animation: \${pulse} 1.5s ease-in-out infinite;
  background: #e5e7eb;
  border-radius: 0.25rem;
\`;

function Skeleton({ width = "100%" }: { width?: string }) {
  return <div css={[skeletonStyle, { width, height: "1rem" }]} />;
}
\`\`\`

**Vanilla Extract — \`keyframes\`:**
\`\`\`ts
// animations.css.ts
import { keyframes, style } from "@vanilla-extract/css";

export const fadeIn = keyframes({
  from: { opacity: 0, transform: "translateY(8px)" },
  to:   { opacity: 1, transform: "translateY(0)" },
});

export const modal = style({
  animationName: fadeIn,
  animationDuration: "0.2s",
  animationTimingFunction: "ease-out",
});
\`\`\``,
      tags: ["animations", "keyframes", "styled-components", "emotion"],
    },

    // ───── MEDIUM ─────
    {
      id: "themeprovider-theming",
      title: "ThemeProvider and theming",
      difficulty: "medium",
      question: "How does ThemeProvider work in styled-components, and how do you access the theme in both styled components and regular React components?",
      answer: `**ThemeProvider** uses React Context to make a theme object available to all styled components in the tree without prop-drilling.

**1. Define the theme:**
\`\`\`ts
// theme.ts
export const theme = {
  colors: {
    primary: "#3b82f6",
    primaryDark: "#1d4ed8",
    surface: "#ffffff",
    background: "#f9fafb",
    text: "#111827",
    textMuted: "#6b7280",
    border: "#e5e7eb",
    danger: "#ef4444",
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
  },
  radii: { sm: "0.25rem", md: "0.375rem", lg: "0.75rem", full: "9999px" },
  fontSizes: { sm: "0.875rem", base: "1rem", lg: "1.125rem", xl: "1.25rem" },
} as const;

export type Theme = typeof theme;
\`\`\`

**2. Augment the DefaultTheme for TypeScript:**
\`\`\`ts
// styled.d.ts
import type { Theme } from "./theme";
import "styled-components";

declare module "styled-components" {
  export interface DefaultTheme extends Theme {}
}
\`\`\`

**3. Wrap the app:**
\`\`\`tsx
import { ThemeProvider } from "styled-components";
import { theme } from "./theme";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router />
    </ThemeProvider>
  );
}
\`\`\`

**4. Access theme in styled components:**
\`\`\`tsx
const Button = styled.button\`
  background: \${(p) => p.theme.colors.primary};
  color: white;
  padding: \${(p) => p.theme.spacing.sm} \${(p) => p.theme.spacing.md};
  border-radius: \${(p) => p.theme.radii.md};
  font-size: \${(p) => p.theme.fontSizes.sm};
  font-weight: 600;

  &:hover {
    background: \${(p) => p.theme.colors.primaryDark};
  }
\`;
\`\`\`

**5. Access theme in regular React components:**
\`\`\`tsx
import { useTheme } from "styled-components";

function Alert() {
  const theme = useTheme();
  return (
    <div style={{ color: theme.colors.danger }}>Something went wrong</div>
  );
}
\`\`\``,
      tags: ["theming", "ThemeProvider", "styled-components", "typescript"],
    },
    {
      id: "dynamic-styles-props",
      title: "Dynamic styles based on props",
      difficulty: "medium",
      question: "How do you create components with multiple style variants driven by props in styled-components and Emotion?",
      answer: `Both libraries let you interpolate functions in template literals that receive the component's props.

**styled-components — prop-driven variants:**
\`\`\`tsx
import styled, { css } from "styled-components";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

const variantStyles = {
  primary: css\`
    background: #3b82f6;
    color: white;
    &:hover { background: #1d4ed8; }
  \`,
  secondary: css\`
    background: #e5e7eb;
    color: #111827;
    &:hover { background: #d1d5db; }
  \`,
  danger: css\`
    background: #ef4444;
    color: white;
    &:hover { background: #dc2626; }
  \`,
  ghost: css\`
    background: transparent;
    color: #3b82f6;
    border: 1px solid #3b82f6;
    &:hover { background: #eff6ff; }
  \`,
};

const sizeStyles = {
  sm: css\`padding: 0.25rem 0.625rem; font-size: 0.75rem;\`,
  md: css\`padding: 0.5rem 1rem;     font-size: 0.875rem;\`,
  lg: css\`padding: 0.75rem 1.5rem;  font-size: 1rem;\`,
};

// Prefix transient props with $ to prevent forwarding to DOM
const Button = styled.button<{ $variant?: Variant; $size?: Size }>\`
  display: inline-flex;
  align-items: center;
  border: none;
  border-radius: 0.375rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;

  \${(p) => variantStyles[p.$variant ?? "primary"]}
  \${(p) => sizeStyles[p.$size ?? "md"]}
\`;

// Usage
<Button $variant="danger" $size="lg">Delete</Button>
\`\`\`

**Emotion — same pattern with object styles:**
\`\`\`tsx
import styled from "@emotion/styled";

const Badge = styled.span<{ $color: string }>(({ $color }) => ({
  display: "inline-flex",
  alignItems: "center",
  padding: "0.125rem 0.5rem",
  borderRadius: "9999px",
  fontSize: "0.75rem",
  fontWeight: 600,
  background: \`\${$color}20\`,
  color: $color,
}));

<Badge $color="#10b981">Active</Badge>
\`\`\``,
      tags: ["dynamic-styles", "props", "variants", "styled-components", "emotion"],
    },
    {
      id: "vanilla-extract-basics",
      title: "Vanilla Extract — zero-runtime type-safe CSS",
      difficulty: "medium",
      question: "What is Vanilla Extract and how do you use styleVariants and recipes to build type-safe component styles?",
      answer: `**Vanilla Extract** is a zero-runtime CSS-in-JS library. Style files have a \`.css.ts\` extension, run only at build time, and output plain \`.css\` files. All styles are fully type-safe.

**Setup (Vite):**
\`\`\`ts
// vite.config.ts
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
export default { plugins: [vanillaExtractPlugin()] };
\`\`\`

**Basic styles:**
\`\`\`ts
// button.css.ts
import { style, styleVariants } from "@vanilla-extract/css";

export const base = style({
  display: "inline-flex",
  alignItems: "center",
  borderRadius: "0.375rem",
  fontWeight: 600,
  cursor: "pointer",
  border: "none",
  transition: "background 0.15s",
});

export const variant = styleVariants({
  primary: { background: "#3b82f6", color: "#fff", ":hover": { background: "#1d4ed8" } },
  secondary: { background: "#e5e7eb", color: "#111827" },
  danger: { background: "#ef4444", color: "#fff" },
});

export const size = styleVariants({
  sm: { padding: "0.25rem 0.625rem", fontSize: "0.75rem" },
  md: { padding: "0.5rem 1rem",     fontSize: "0.875rem" },
  lg: { padding: "0.75rem 1.5rem",  fontSize: "1rem" },
});
\`\`\`

**Using \`recipe\` from \`@vanilla-extract/recipes\`:**
\`\`\`ts
// button.css.ts
import { recipe } from "@vanilla-extract/recipes";

export const button = recipe({
  base: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: "0.375rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  variants: {
    variant: {
      primary:   { background: "#3b82f6", color: "#fff" },
      secondary: { background: "#e5e7eb", color: "#111827" },
      danger:    { background: "#ef4444", color: "#fff" },
    },
    size: {
      sm: { padding: "0.25rem 0.625rem", fontSize: "0.75rem" },
      md: { padding: "0.5rem 1rem",     fontSize: "0.875rem" },
      lg: { padding: "0.75rem 1.5rem",  fontSize: "1rem" },
    },
  },
  defaultVariants: { variant: "primary", size: "md" },
});
\`\`\`

**Using in a React component:**
\`\`\`tsx
import { button } from "./button.css";

type ButtonProps = React.ComponentProps<"button"> & Parameters<typeof button>[0];

function Button({ variant, size, className, ...props }: ButtonProps) {
  return <button {...props} className={button({ variant, size })} />;
}

// Fully type-safe — TypeScript errors if variant is wrong
<Button variant="danger" size="lg">Delete</Button>
\`\`\``,
      tags: ["vanilla-extract", "zero-runtime", "typescript", "recipes"],
    },
    {
      id: "linaria-basics",
      title: "Linaria — zero-runtime with familiar syntax",
      difficulty: "medium",
      question: "What is Linaria and how does it differ from styled-components at runtime?",
      answer: `**Linaria** is a zero-runtime CSS-in-JS library with an API nearly identical to styled-components. It uses a Babel/Vite plugin to extract styles to static CSS files at build time.

**Key difference from styled-components:**
- styled-components evaluates template literals in the browser
- Linaria evaluates them at build time — only static expressions are allowed

**Setup (Vite):**
\`\`\`ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import linaria from "@linaria/vite";

export default defineConfig({
  plugins: [react(), linaria({ include: ["**/*.{ts,tsx}"] })],
});
\`\`\`

**Usage (familiar styled API):**
\`\`\`tsx
import { styled } from "@linaria/react";

const Card = styled.div\`
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
\`;

const Title = styled.h1\`
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
\`;
\`\`\`

**Dynamic values via CSS custom properties:**
\`\`\`tsx
import { styled } from "@linaria/react";

// Dynamic via CSS variables — still zero-runtime
const Box = styled.div<{ $color: string }>\`
  color: \${(p) => p.$color};   /* Linaria extracts as var(--color-abc) */
  padding: 1rem;
\`;
\`\`\`

**What Linaria cannot do (build-time constraint):**
\`\`\`tsx
// WRONG — conditional logic that depends on runtime module state
import { theme } from "./theme";
const Btn = styled.button\`
  background: \${theme.primary}; // OK if theme is a static object
  color: \${Math.random() > 0.5 ? "red" : "blue"}; // NOT OK — runtime
\`\`\`

| | styled-components | Linaria |
|---|---|---|
| Runtime cost | Yes | None |
| RSC compatible | No | Yes |
| Dynamic props | Arbitrary JS | CSS variables only |
| API familiarity | — | Near-identical |`,
      tags: ["linaria", "zero-runtime", "styled-components"],
    },
    {
      id: "panda-css",
      title: "Panda CSS",
      difficulty: "medium",
      question: "What is Panda CSS and how does its token-based system and JSX style props work?",
      answer: `**Panda CSS** is a zero-runtime, build-time CSS-in-JS framework with a design token system, type-safe style props, and recipes. It generates atomic CSS at build time — similar to Tailwind but with full TypeScript integration and a JS/TS authoring experience.

**Installation & codegen:**
\`\`\`bash
npm install -D @pandacss/dev
npx panda init --postcss
\`\`\`

**Define tokens in \`panda.config.ts\`:**
\`\`\`ts
import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: { 500: { value: "#3b82f6" }, 700: { value: "#1d4ed8" } },
      },
      fontSizes: {
        sm: { value: "0.875rem" },
        base: { value: "1rem" },
      },
    },
  },
  include: ["./src/**/*.{tsx,ts}"],
  outdir: "styled-system",
});
\`\`\`

**Using the generated \`css\` function:**
\`\`\`tsx
import { css } from "../styled-system/css";

const cardClass = css({
  background: "white",
  borderRadius: "lg",
  padding: "6",
  boxShadow: "sm",
  _hover: { boxShadow: "md" },
});

function Card({ children }: { children: React.ReactNode }) {
  return <div className={cardClass}>{children}</div>;
}
\`\`\`

**Recipes for variants:**
\`\`\`ts
import { cva } from "../styled-system/css";

const button = cva({
  base: { display: "inline-flex", fontWeight: "semibold", cursor: "pointer" },
  variants: {
    visual: {
      solid: { background: "brand.500", color: "white" },
      ghost: { background: "transparent", color: "brand.500" },
    },
    size: {
      sm: { padding: "1 3", fontSize: "sm" },
      md: { padding: "2 4", fontSize: "base" },
    },
  },
  defaultVariants: { visual: "solid", size: "md" },
});

<button className={button({ visual: "ghost", size: "sm" })}>Click</button>
\`\`\`

**JSX style props (opt-in):**
\`\`\`tsx
import { Box, Stack } from "../styled-system/jsx";

<Stack gap="4" direction="row">
  <Box bg="brand.500" color="white" p="4" rounded="lg">
    Panda JSX prop
  </Box>
</Stack>
\`\`\``,
      tags: ["panda-css", "zero-runtime", "design-tokens", "typescript"],
    },
    {
      id: "ssr-style-hydration",
      title: "SSR and style hydration",
      difficulty: "medium",
      question: "How do runtime CSS-in-JS libraries handle server-side rendering, and what is the hydration problem?",
      answer: `When a server renders HTML, runtime CSS-in-JS libraries must also render the styles so the page isn't unstyled before JavaScript loads. This requires **collecting styles during SSR** and embedding them in the HTML response.

**The hydration problem:**
1. Server renders component tree → styles are collected
2. Server serializes styles into a \`<style>\` tag in HTML
3. Browser shows server HTML (styled)
4. React hydrates — re-renders on client
5. Client library re-generates styles and injects them
6. If client styles differ from server styles → flash of unstyled content (FOUC) or hydration mismatch

**styled-components SSR (ServerStyleSheet):**
\`\`\`tsx
// pages/_document.tsx (Next.js Pages Router)
import Document, { Html, Head, Main, NextScript } from "next/document";
import { ServerStyleSheet } from "styled-components";

export default class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) =>
            sheet.collectStyles(<App {...props} />),
        });

      const initialProps = await Document.getInitialProps(ctx);
      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        ),
      };
    } finally {
      sheet.seal();
    }
  }
}
\`\`\`

**Emotion SSR (cache + extractCriticalToChunks):**
\`\`\`tsx
import createEmotionServer from "@emotion/server/create-instance";
import createCache from "@emotion/cache";

const cache = createCache({ key: "css" });
const { extractCriticalToChunks, constructStyleTagsFromChunks } =
  createEmotionServer(cache);

// On each request:
const html = renderToString(<App />);
const chunks = extractCriticalToChunks(html);
const styleTags = constructStyleTagsFromChunks(chunks);
// Inject styleTags into <head>
\`\`\`

**Why this is complex:**
- Each request needs a fresh style sheet instance (shared state = bugs)
- Streaming SSR (\`renderToPipeableStream\`) is very hard with runtime CSS-in-JS — styles must be known before HTML is sent`,
      tags: ["ssr", "hydration", "styled-components", "emotion", "next.js"],
    },
    {
      id: "typescript-integration",
      title: "TypeScript integration",
      difficulty: "medium",
      question: "How do you get full TypeScript type safety for props, themes, and variants in CSS-in-JS libraries?",
      answer: `**styled-components — typed props:**
\`\`\`tsx
// Use $ prefix for transient props (not forwarded to DOM)
const Box = styled.div<{ $color: string; $spacing: number }>\`
  color: \${(p) => p.$color};
  padding: \${(p) => p.$spacing}px;
\`;

// TypeScript error if wrong type passed
<Box $color={42} $spacing="big" />  // Error!
<Box $color="red" $spacing={16} />  // OK
\`\`\`

**Typed theme (styled-components):**
\`\`\`ts
// styled.d.ts
import "styled-components";
import type { MyTheme } from "./theme";

declare module "styled-components" {
  export interface DefaultTheme extends MyTheme {}
}

// Now theme is fully typed in interpolations
const Title = styled.h1\`
  color: \${(p) => p.theme.colors.primary};  // typed, autocompleted
\`;
\`\`\`

**Vanilla Extract — type-safe by design:**
\`\`\`ts
// sprinkles.css.ts
import { defineProperties, createSprinkles } from "@vanilla-extract/sprinkles";

const properties = defineProperties({
  properties: {
    color: ["#111827", "#3b82f6", "#ef4444"],
    padding: { sm: "0.5rem", md: "1rem", lg: "1.5rem" },
    display: ["block", "flex", "grid", "none"],
  },
});

export const sprinkles = createSprinkles(properties);

// TypeScript enforces valid values
sprinkles({ color: "#3b82f6", padding: "md" });  // OK
sprinkles({ color: "purple" });                   // Error — not in union
\`\`\`

**Panda CSS — codegen produces types:**
\`\`\`tsx
import { css } from "../styled-system/css";

// All properties are typed from your panda.config.ts tokens
css({ background: "brand.500", padding: "6" });  // typed
css({ background: "nonexistent" });               // TypeScript error
\`\`\`

**Emotion — typed css prop:**
\`\`\`tsx
/** @jsxImportSource @emotion/react */
// css prop on JSX elements is typed via @emotion/react/types
<div css={{ color: "#111827", padding: "1rem" }} />
\`\`\``,
      tags: ["typescript", "types", "styled-components", "vanilla-extract", "panda-css"],
    },
    {
      id: "styled-components-v6",
      title: "styled-components v6 changes",
      difficulty: "medium",
      question: "What are the major breaking changes and improvements in styled-components v6?",
      answer: `styled-components v6 (released 2023) introduced several breaking changes to modernise the library and improve performance.

**1. No more \`.attrs\` prop injection gotchas — tightened types:**
\`\`\`tsx
// v6 — .attrs must return valid HTML attributes
const Input = styled.input.attrs({ type: "text" })\`
  border: 1px solid #d1d5db;
\`;
\`\`\`

**2. Transient props (\`$\` prefix) — now the recommended default:**
\`\`\`tsx
// v5: custom props leaked to DOM, caused React warnings
const Box = styled.div<{ color: string }>\`color: \${p => p.color};\`;

// v6: use $ prefix — guaranteed not forwarded to DOM
const Box = styled.div<{ $color: string }>\`color: \${p => p.$color};\`;
\`\`\`

**3. \`shouldForwardProp\` behavior changed:**
\`\`\`tsx
// v6 — shouldForwardProp no longer inherits from parent styled component by default
const Base = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "$internal",
})<{ $internal?: boolean }>\`\`;
\`\`\`

**4. Removed \`css\` prop support (not built-in):**
In v6, the \`css\` prop is not enabled by default. Use the \`babel-plugin-styled-components\` or Emotion if you need it.

**5. Performance improvements:**
- Style sheet injection is now batched
- Smaller runtime (~20% bundle size reduction)
- Faster hashing algorithm for class names

**6. Namespace/nesting changes:**
\`\`\`tsx
// v6 supports native CSS nesting syntax
const Card = styled.div\`
  background: white;

  & > h2 {          /* explicit & required in v6 for nesting */
    font-size: 1.25rem;
  }

  &:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
\`;
\`\`\`

**7. React 18 concurrent mode support** — v6 is fully compatible with \`startTransition\` and concurrent features.

**Migration steps:**
1. Add \`$\` prefix to all custom props
2. Update \`shouldForwardProp\` usage
3. Enable \`babel-plugin-styled-components\` if using the \`css\` prop
4. Test server-side rendering (SSSheet API unchanged)`,
      tags: ["styled-components", "v6", "breaking-changes", "migration"],
    },

    // ───── HARD ─────
    {
      id: "rsc-incompatibility",
      title: "RSC incompatibility with runtime CSS-in-JS",
      difficulty: "hard",
      question: "Why are runtime CSS-in-JS libraries incompatible with React Server Components, and what are the alternatives?",
      answer: `**React Server Components (RSC)** run on the server (or at build time) and never execute in the browser. They produce serializable output — no event handlers, no hooks, no browser-only APIs.

**Why runtime CSS-in-JS breaks with RSC:**

Runtime libraries like styled-components and Emotion work by:
1. Using React Context (\`ThemeProvider\`) — Context is unavailable in RSCs
2. Injecting \`<style>\` tags into the DOM at render time — RSCs don't run in the browser
3. Using the \`useInsertionEffect\` hook or \`insertRule\` — hooks are unavailable in RSCs
4. Relying on a singleton style registry — impossible without a shared browser runtime

\`\`\`tsx
// This will ERROR in a Server Component
import styled from "styled-components";

// styled-components uses React.createContext internally for ThemeProvider
// Server Components cannot consume context
const Title = styled.h1\`color: red;\`; // Cannot use in RSC
\`\`\`

**The error you see (Next.js App Router):**
\`\`\`
Error: createContext only works in Client Components.
Add the "use client" directive at the top of the file.
\`\`\`

**Workaround 1 — mark the component \`"use client"\`:**
\`\`\`tsx
"use client";  // Forces entire subtree to be a Client Component

import styled from "styled-components";
const Card = styled.div\`padding: 1rem;\`;
export function ClientCard() { return <Card>...</Card>; }
\`\`\`
This works but loses RSC benefits (server rendering, no JS for static content).

**Workaround 2 — Next.js App Router registry (official workaround):**
\`\`\`tsx
// app/registry.tsx
"use client";
import { useServerInsertedHTML } from "next/navigation";
import { ServerStyleSheet, StyleSheetManager } from "styled-components";
import { useState } from "react";

export function StyledComponentsRegistry({ children }: { children: React.ReactNode }) {
  const [sheet] = useState(() => new ServerStyleSheet());
  useServerInsertedHTML(() => (
    <>{sheet.getStyleElement()}</>
  ));
  return (
    <StyleSheetManager sheet={sheet.instance}>
      {children}
    </StyleSheetManager>
  );
}

// app/layout.tsx
import { StyledComponentsRegistry } from "./registry";
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
      </body>
    </html>
  );
}
\`\`\`
This is brittle and forces all styled components to be Client Components.

**The real solution — zero-runtime alternatives:**

| Library | RSC compatible | Migration effort from SC/Emotion |
|---|---|---|
| Vanilla Extract | Yes | Medium (different API) |
| Panda CSS | Yes | Medium (different API) |
| Linaria | Yes | Low (near-identical API) |
| CSS Modules | Yes | Low |
| Tailwind CSS | Yes | High (different paradigm) |

In 2026, the recommended path for new Next.js App Router projects is **Vanilla Extract**, **Panda CSS**, or **CSS Modules** — not runtime CSS-in-JS.`,
      tags: ["rsc", "react-server-components", "next.js", "incompatibility", "app-router"],
    },
    {
      id: "performance-runtime-cost",
      title: "Performance: runtime cost and critical CSS extraction",
      difficulty: "hard",
      question: "What is the runtime performance cost of CSS-in-JS libraries, and how do zero-runtime and streaming SSR considerations factor in?",
      answer: `**Runtime costs of CSS-in-JS libraries:**

1. **Parse & evaluate template literals** — on every render, interpolation functions run to compute style values
2. **Hash generation** — each unique style combination produces a class name hash
3. **Style injection** — \`insertRule\` or \`<style>\` tag mutation; can cause layout thrashing
4. **React context reads** — \`ThemeProvider\` forces a context read on every styled component render
5. **Hydration overhead** — server-serialized styles must be re-parsed and re-applied on the client

**Measured impact (approximate, varies by app):**

| Metric | Runtime CSS-in-JS | Zero-runtime / CSS Modules |
|---|---|---|
| JS bundle added | 15–50 kB | ~0 kB |
| Style computation per render | O(styled components) | 0 |
| First Contentful Paint | Slightly delayed | Faster (CSS in \`<link>\`) |
| Hydration time | +20–200 ms (large apps) | +0 ms |
| Re-render cost | Higher (interpolations) | 0 |

**Critical CSS extraction — runtime approach:**
\`\`\`ts
// Emotion — extract only above-the-fold styles
import { extractCritical } from "@emotion/server";

const { html, css, ids } = extractCritical(renderToString(<App />));
// css contains only styles used in the HTML above
// ids are sent to client to avoid re-injecting known styles
\`\`\`

**Streaming SSR incompatibility:**
\`\`\`tsx
// React 18 streaming — pipeableStream sends chunks before full render
// Runtime CSS-in-JS cannot know which styles are needed until render completes
// Result: must buffer the full render, losing streaming benefits

import { renderToPipeableStream } from "react-dom/server";
// styled-components / Emotion = cannot stream + collect styles simultaneously
\`\`\`

**Zero-runtime approach — no runtime cost:**
\`\`\`ts
// Vanilla Extract output is a static .css file loaded via <link>
// Browser can start downloading CSS before JS executes
// No style computation on render — just className lookups (O(1))
// Fully compatible with streaming SSR
\`\`\`

**Practical recommendations for performance-critical apps:**
- Prefer zero-runtime (Vanilla Extract, Panda CSS, Linaria, CSS Modules)
- If stuck with runtime: memoize expensive computations, minimise ThemeProvider depth, use \`css\` helper to pre-compute styles outside render`,
      tags: ["performance", "runtime-cost", "critical-css", "streaming-ssr"],
    },
    {
      id: "vanilla-extract-sprinkles-theme",
      title: "Vanilla Extract: sprinkles, themes, and contract",
      difficulty: "hard",
      question: "How do you use Vanilla Extract's sprinkles for atomic CSS, theme contracts for multi-theme support, and createTheme for token management?",
      answer: `Vanilla Extract has three advanced APIs beyond basic \`style()\`:

---

### 1. Sprinkles — atomic utility classes (like Tailwind, typed)
\`\`\`ts
// sprinkles.css.ts
import { defineProperties, createSprinkles } from "@vanilla-extract/sprinkles";

const space = { 0: 0, 1: "0.25rem", 2: "0.5rem", 4: "1rem", 8: "2rem" };

const responsiveProperties = defineProperties({
  conditions: {
    mobile:  {},
    tablet:  { "@media": "screen and (min-width: 768px)" },
    desktop: { "@media": "screen and (min-width: 1024px)" },
  },
  defaultCondition: "mobile",
  properties: {
    display: ["none", "flex", "block", "grid"],
    padding: space,
    paddingX: space,
    gap: space,
  },
  shorthands: { paddingX: ["paddingLeft", "paddingRight"] },
});

export const sprinkles = createSprinkles(responsiveProperties);
// type-safe: sprinkles({ display: { mobile: "block", tablet: "flex" } })
\`\`\`

---

### 2. createThemeContract — multi-theme type-safe tokens
\`\`\`ts
// theme.css.ts
import { createThemeContract, createTheme } from "@vanilla-extract/css";

// Contract defines the shape — values are null (placeholders)
export const vars = createThemeContract({
  color: {
    primary: null,
    background: null,
    text: null,
    surface: null,
  },
  font: {
    body: null,
  },
});

// Light theme — fills the contract
export const lightTheme = createTheme(vars, {
  color: {
    primary: "#3b82f6",
    background: "#f9fafb",
    text: "#111827",
    surface: "#ffffff",
  },
  font: { body: "Inter, system-ui, sans-serif" },
});

// Dark theme — same contract, different values
export const darkTheme = createTheme(vars, {
  color: {
    primary: "#60a5fa",
    background: "#111827",
    text: "#f9fafb",
    surface: "#1f2937",
  },
  font: { body: "Inter, system-ui, sans-serif" },
});
\`\`\`

\`\`\`ts
// button.css.ts — consumes vars (typed)
import { style } from "@vanilla-extract/css";
import { vars } from "./theme.css";

export const button = style({
  background: vars.color.primary,  // resolves to CSS custom property
  color: vars.color.text,
  fontFamily: vars.font.body,
});
\`\`\`

\`\`\`tsx
// App.tsx — apply theme class to root
import { lightTheme, darkTheme } from "./theme.css";

function App({ isDark }: { isDark: boolean }) {
  return (
    <div className={isDark ? darkTheme : lightTheme}>
      <Content />
    </div>
  );
}
\`\`\`

---

### 3. Output
Each \`createTheme\` call generates a CSS class with custom properties:
\`\`\`css
.lightTheme_abc { --color-primary__xyz: #3b82f6; --color-background__xyz: #f9fafb; }
.darkTheme_def  { --color-primary__xyz: #60a5fa; --color-background__xyz: #111827; }

.button_ghi { background: var(--color-primary__xyz); }
\`\`\`
Zero runtime — just class names and custom properties.`,
      tags: ["vanilla-extract", "sprinkles", "theme-contract", "multi-theme", "advanced"],
    },
    {
      id: "migrating-from-runtime-css-in-js",
      title: "Migrating away from runtime CSS-in-JS",
      difficulty: "hard",
      question: "What is a practical strategy for migrating a large codebase from styled-components or Emotion to a zero-runtime alternative?",
      answer: `Migrating a large codebase is a multi-sprint effort. The key is **incremental migration** — run both systems in parallel and migrate file by file.

---

### Step 1: Choose the target library

| Source | Best target | Reason |
|---|---|---|
| styled-components | Linaria | Near-identical API, minimal rewrite |
| styled-components | Vanilla Extract + recipes | Type-safety, atomic output |
| Emotion (css prop) | Panda CSS | Similar mental model |
| Either | CSS Modules | Universal, zero learning curve |

---

### Step 2: Audit and categorise

\`\`\`bash
# Count styled-components usage
grep -r "styled\\." src --include="*.tsx" | wc -l
grep -r "createGlobalStyle" src --include="*.tsx" -l
grep -r "ThemeProvider" src --include="*.tsx" -l
grep -r "keyframes" src --include="*.tsx" -l
\`\`\`

Categories to handle separately:
- Static components (no dynamic props) — easiest, migrate first
- Dynamic prop components — need variant mapping
- ThemeProvider consumers — migrate after establishing new token system
- \`createGlobalStyle\` — move to \`global.css.ts\` or \`globals.css\`

---

### Step 3: Migrate static components first (Linaria example)

\`\`\`tsx
// Before (styled-components)
const Card = styled.div\`
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
\`;

// After (Linaria — s/styled-components/@linaria\/react/)
import { styled } from "@linaria/react";
const Card = styled.div\`
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
\`;
\`\`\`

---

### Step 4: Replace ThemeProvider with CSS custom properties

\`\`\`ts
// tokens.css.ts (Vanilla Extract)
import { createGlobalTheme } from "@vanilla-extract/css";

export const vars = createGlobalTheme(":root", {
  color: { primary: "#3b82f6", text: "#111827" },
  spacing: { md: "1rem", lg: "1.5rem" },
});
\`\`\`

\`\`\`tsx
// Replace useTheme() calls
import { vars } from "./tokens.css";
// vars.color.primary === "var(--color-primary__abc)" — use in style()
\`\`\`

---

### Step 5: Codemods and automation

\`\`\`bash
# styled-components → Linaria codemod (community tool)
npx @linaria/codemods styled-components src/

# Or use jscodeshift for custom transforms
npx jscodeshift -t ./codemods/sc-to-ve.ts src/
\`\`\`

---

### Step 6: Validate and clean up

\`\`\`bash
# Check for remaining styled-components imports
grep -r "from 'styled-components'" src --include="*.tsx"

# Remove styled-components from package.json when count reaches 0
npm uninstall styled-components @types/styled-components
\`\`\`

**Common pitfalls:**
- Forgetting \`createGlobalStyle\` → replace with a \`global.css\` or \`globalStyle()\`
- Server-side \`ServerStyleSheet\` setup → remove entirely (zero-runtime has no registry)
- Snapshot tests with generated class names → class names change, update snapshots`,
      tags: ["migration", "styled-components", "vanilla-extract", "linaria", "refactoring"],
    },
    {
      id: "css-in-js-design-system",
      title: "CSS-in-JS in a design system library",
      difficulty: "hard",
      question: "What are the unique challenges of using CSS-in-JS when building a shared component library consumed by multiple apps, and how do you solve them?",
      answer: `Design system libraries have different constraints from application code: they are consumed by unknown host environments, bundled separately, and must not conflict with host styles.

---

### Challenge 1: Dependency conflicts

\`\`\`
Host app: styled-components@6.0
Library:  styled-components@5.3  ← Two runtimes in the browser!
\`\`\`

**Solution:** Mark CSS-in-JS as a peer dependency, not a regular dependency:
\`\`\`json
{
  "peerDependencies": {
    "styled-components": "^6.0",
    "react": "^18.0"
  },
  "devDependencies": {
    "styled-components": "^6.0"
  }
}
\`\`\`

---

### Challenge 2: ThemeProvider collision

If both library and host app use ThemeProvider, nested providers can override each other.

**Solution A — library reads its own context:**
\`\`\`tsx
const LibThemeContext = React.createContext(defaultLibTheme);

export function LibProvider({ children, theme }: { children: React.ReactNode; theme?: Partial<LibTheme> }) {
  const merged = { ...defaultLibTheme, ...theme };
  return <LibThemeContext.Provider value={merged}>{children}</LibThemeContext.Provider>;
}

// Inside library components — never touch host ThemeProvider
const useLibTheme = () => React.useContext(LibThemeContext);
\`\`\`

**Solution B — CSS custom properties (zero-runtime, no context):**
\`\`\`css
/* Consumers override these in their own CSS */
:root {
  --lib-color-primary: #3b82f6;
  --lib-spacing-md: 1rem;
}
\`\`\`

---

### Challenge 3: Class name uniqueness

Multiple styled-components instances generate class names independently — can collide.

**Solution — \`babel-plugin-styled-components\` with namespace:**
\`\`\`json
{
  "plugins": [["babel-plugin-styled-components", { "namespace": "mylib" }]]
}
\`\`\`

---

### Challenge 4: RSC consumers (2026 reality)

Host apps increasingly use React Server Components. A library with runtime CSS-in-JS forces all consuming components to be Client Components.

**Recommended solution in 2026:**
Build design system libraries with **Vanilla Extract** or **Panda CSS**:
- Zero-runtime CSS shipped as a static \`.css\` file
- No React context needed
- Works in RSC and Client Components equally
- Consumers just import the CSS file once

\`\`\`ts
// package.json of the library
{
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./styles.css": "./dist/styles.css"   // ← pre-built CSS
  }
}
\`\`\`

\`\`\`tsx
// In consuming app
import "@my-org/ui/styles.css";
import { Button, Card } from "@my-org/ui";
\`\`\``,
      tags: ["design-system", "library", "peer-dependencies", "rsc", "advanced"],
    },
  ],
};
