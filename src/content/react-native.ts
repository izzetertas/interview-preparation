import type { Category } from "./types";

export const reactNative: Category = {
  slug: "react-native",
  title: "React Native",
  description:
    "Building cross-platform mobile apps with React Native: Expo, navigation, lists, animations, native modules, Hermes, the new architecture, and shipping to stores.",
  icon: "📱",
  questions: [
    // ───── EASY ─────
    {
      id: "rn-vs-react-dom",
      title: "React Native vs React DOM",
      difficulty: "easy",
      question: "How does React Native differ from React on the web?",
      answer: `**React Native (RN)** uses the **same React core** (components, hooks, reconciler) but renders to **native UI views** instead of the DOM.

| Aspect          | React DOM                  | React Native                          |
|-----------------|----------------------------|---------------------------------------|
| Renderer        | \`react-dom\`              | \`react-native\` (iOS/Android hosts)  |
| Primitives      | \`<div>\`, \`<span>\`, \`<img>\` | \`<View>\`, \`<Text>\`, \`<Image>\` |
| Styling         | CSS / CSS-in-JS            | \`StyleSheet\` (subset of CSS)        |
| Layout          | Block / inline / flex      | **Flexbox by default**                |
| Routing         | URL-based (history API)    | Stack/tab navigators or file routes   |
| Threading       | Main thread                | JS thread + UI thread (+ shadow)      |

**Architectures:**
- **Old (Bridge)** — JS and native communicate via an asynchronous, batched JSON **bridge**. Serialization overhead = bottleneck.
- **New (Fabric + TurboModules + JSI)** — **JSI** lets JS hold references to native objects synchronously. **Fabric** is the new renderer; **TurboModules** are lazily-loaded native modules. No JSON bridge.

\`\`\`tsx
import { View, Text } from "react-native";
export const Hello = () => (
  <View style={{ padding: 16 }}>
    <Text>Hello mobile</Text>
  </View>
);
\`\`\`

> **Tip:** mental model — "React the library, native the host." Hooks, context, and Suspense work the same; only the host primitives change.`,
      tags: ["fundamentals"],
    },
    {
      id: "expo-vs-bare",
      title: "Expo vs bare React Native",
      difficulty: "easy",
      question: "What's the difference between Expo and bare React Native?",
      answer: `**Expo** is a framework + cloud services on top of React Native. **Bare** RN is the raw \`react-native init\` project with full Xcode/Gradle access.

| Concern              | Expo (managed)              | Bare RN                          |
|----------------------|-----------------------------|----------------------------------|
| Setup                | \`npx create-expo-app\`     | \`npx react-native init\`        |
| Native code          | Hidden (config plugins)     | You own \`ios/\` and \`android/\`|
| Add native module    | Needs **prebuild** / dev client | Link any module immediately   |
| Build infra          | **EAS Build** (cloud)       | Local Xcode / Android Studio     |
| OTA updates          | **EAS Update** (built in)   | CodePush or DIY                  |
| App size             | Slightly larger             | Lean                             |
| Learning curve       | Beginner-friendly           | Steeper                          |

**Workflows:**
- **Managed** — no native code, ship JS only. Great for MVPs.
- **Bare** — full control; required for unusual native deps.
- **Continuous Native Generation (CNG)** — modern Expo regenerates \`ios/\`/\`android/\` from \`app.json\` + config plugins, giving you Expo ergonomics with native flexibility.

**EAS** (Expo Application Services):
\`\`\`sh
npm i -g eas-cli
eas build --platform ios
eas submit --platform ios
eas update --branch production
\`\`\`

> **Verdict (2024+):** start with Expo for almost any new app. Drop down to bare only when a native dep absolutely refuses to play nice — and even then, prefer a **dev client** over ejecting.`,
      tags: ["expo", "tooling"],
    },
    {
      id: "core-components",
      title: "Core components",
      difficulty: "easy",
      question: "What are the core RN components and what do they map to natively?",
      answer: `RN ships a small set of **primitives** that map to platform-native views.

| Component       | iOS                  | Android              | Notes                                   |
|-----------------|----------------------|----------------------|-----------------------------------------|
| \`View\`        | \`UIView\`           | \`ViewGroup\`        | The flexbox container                   |
| \`Text\`        | \`UITextView\`       | \`TextView\`         | All text MUST be inside \`<Text>\`      |
| \`Image\`       | \`UIImageView\`      | \`ImageView\`        | Local + remote sources                  |
| \`ScrollView\`  | \`UIScrollView\`     | \`ScrollView\`       | Renders all children — small lists only |
| \`FlatList\`    | \`UICollectionView\` | \`RecyclerView\`     | Virtualized list                        |
| \`SectionList\` | \`UITableView\`      | \`RecyclerView\`     | Grouped lists with section headers      |
| \`Pressable\`   | gesture recognizer   | \`TouchListener\`    | Modern touchable (replaces TouchableX)  |
| \`TextInput\`   | \`UITextField\`      | \`EditText\`         | Controlled inputs                       |

\`\`\`tsx
import { View, Text, Image, FlatList } from "react-native";

<FlatList
  data={users}
  keyExtractor={(u) => u.id}
  renderItem={({ item }) => (
    <View style={{ flexDirection: "row" }}>
      <Image source={{ uri: item.avatar }} style={{ width: 40, height: 40 }} />
      <Text>{item.name}</Text>
    </View>
  )}
/>
\`\`\`

**Gotchas:**
- **Text must be inside \`<Text>\`** — bare strings inside \`<View>\` crash.
- \`ScrollView\` renders every child up front. **Never use it for long lists.**
- \`Image\` requires an explicit \`width\`/\`height\` (no intrinsic sizing).

> **Tip:** treat \`<View>\` like a \`<div style="display:flex; flex-direction:column">\` — flex column is the **default**, opposite of the web.`,
      tags: ["primitives"],
    },
    {
      id: "stylesheet-flexbox",
      title: "StyleSheet and Flexbox",
      difficulty: "easy",
      question: "How does styling work in React Native and how is its Flexbox different?",
      answer: `RN uses **inline-style objects** (camelCase keys) plus an optional \`StyleSheet.create\` for validation and reuse.

\`\`\`tsx
import { StyleSheet, View, Text } from "react-native";

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 8, backgroundColor: "#fff" },
  title: { fontSize: 18, fontWeight: "600" },
});

<View style={[styles.card, isActive && { borderColor: "blue" }]}>
  <Text style={styles.title}>Hello</Text>
</View>
\`\`\`

**Differences vs web CSS:**

| Property             | Web default         | React Native default     |
|----------------------|---------------------|--------------------------|
| \`display\`          | \`block\`/\`inline\` | Always \`flex\`         |
| \`flexDirection\`    | \`row\`             | **\`column\`**           |
| \`alignContent\`     | \`stretch\`         | \`flex-start\`           |
| \`flexShrink\`       | \`1\`               | \`0\`                    |
| Units                | px, %, em, rem      | unitless density-pixels  |
| Cascading            | Yes                 | **No** — styles are local |

**Tailwind variants:**
- **NativeWind** — Tailwind classes compiled to RN styles. \`<View className="p-4 bg-white" />\`.
- **Tamagui** — design system + Tailwind-like tokens that compiles to native.
- **Restyle / Dripsy** — typed theme primitives.

**Other tools:**
- \`Platform.select\` for OS-specific styles.
- \`Dimensions\` / \`useWindowDimensions\` for responsive layout.
- \`SafeAreaView\` (or \`react-native-safe-area-context\`) for notches.

> **Tip:** memorize the four flex defaults that flip from the web (\`column\`, no shrink, no inheritance, no media queries) — they account for 90% of "why doesn't this look right" bugs.`,
      tags: ["styling"],
    },
    {
      id: "navigation",
      title: "Navigation",
      difficulty: "easy",
      question: "What are the standard navigation options in React Native?",
      answer: `Two dominant solutions: **React Navigation** (config-based) and **Expo Router** (file-based, built on React Navigation).

**React Navigation** — the de-facto standard.
\`\`\`tsx
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Profile" component={Profile} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
\`\`\`

**Navigator types:**
- **Native Stack** — uses \`UINavigationController\` / \`Fragment\`; best perf.
- **Stack** — JS-driven; more customizable.
- **Bottom Tabs**, **Drawer**, **Material Top Tabs**.

**Expo Router** — files in \`app/\` become routes (Next.js-style).
\`\`\`
app/
  _layout.tsx         // root layout
  index.tsx           // /
  (tabs)/
    _layout.tsx       // tabs layout
    home.tsx          // /home
    profile.tsx       // /profile
  user/[id].tsx       // /user/123
\`\`\`

\`\`\`tsx
import { Link, useRouter } from "expo-router";
const router = useRouter();
router.push(\`/user/\${id}\`);
\`\`\`

**Why file-based:**
- One mental model with **deep links** — every URL maps to a file.
- Layouts compose naturally (\`_layout.tsx\`).
- Typed routes via codegen.

> **Pick:** new app on Expo → **Expo Router**. Existing or non-Expo app → **React Navigation** directly.`,
      tags: ["navigation"],
    },
    {
      id: "platform-module",
      title: "Platform module and OS differences",
      difficulty: "easy",
      question: "How do you handle iOS vs Android differences?",
      answer: `RN ships a **\`Platform\`** module to branch on OS, plus file-extension overrides.

**Inline check:**
\`\`\`tsx
import { Platform } from "react-native";

const padding = Platform.OS === "ios" ? 20 : 16;
\`\`\`

**\`Platform.select\`:**
\`\`\`tsx
const shadow = Platform.select({
  ios: { shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4 },
  android: { elevation: 4 },
  default: {},
});
\`\`\`

**File-extension routing:**
\`\`\`
Button.ios.tsx
Button.android.tsx
Button.tsx           // fallback (web, default)
\`\`\`
Importing \`./Button\` automatically picks the matching file at build time.

**Common differences to handle:**

| Concern              | iOS                          | Android                          |
|----------------------|------------------------------|----------------------------------|
| Shadows              | \`shadowColor/Opacity\`      | \`elevation\`                    |
| Status bar           | \`StatusBar\` translucent off | translucent on                   |
| Keyboard behavior    | \`KeyboardAvoidingView padding\` | \`height\` or system handles  |
| Back button          | Swipe gesture / nav bar      | Hardware back button (\`BackHandler\`) |
| Permissions          | Info.plist usage strings     | AndroidManifest + runtime prompt |
| Ripple               | None                         | \`android_ripple\` on Pressable  |
| Safe areas           | Notch + home indicator       | Cutout API on newer devices      |

**Version checks:**
\`\`\`tsx
Platform.Version            // iOS string ("17.4"), Android API number (34)
Platform.isPad              // iOS only
\`\`\`

> **Tip:** test **both** simulators every PR. iOS-only devs ship Android bugs constantly (and vice-versa).`,
      tags: ["platform"],
    },
    {
      id: "local-storage",
      title: "Local storage on device",
      difficulty: "easy",
      question: "What are the options for persisting data on device?",
      answer: `Three tiers, picked by **size and shape** of data.

| Need                    | Tool                           | Notes                                  |
|-------------------------|--------------------------------|----------------------------------------|
| Tiny key/value (auth)   | **AsyncStorage** / **MMKV**    | MMKV is ~30× faster, sync API          |
| Secure data (tokens)    | **expo-secure-store** / Keychain | Encrypted at rest                    |
| Larger structured data  | **SQLite** (\`expo-sqlite\`, op-sqlite) | Real DB, queries, joins         |
| Offline-first sync      | **WatermelonDB**, **PowerSync**, **RxDB** | Reactive layer over SQLite     |

**AsyncStorage (default):**
\`\`\`tsx
import AsyncStorage from "@react-native-async-storage/async-storage";

await AsyncStorage.setItem("user", JSON.stringify(user));
const raw = await AsyncStorage.getItem("user");
\`\`\`
- Async, JSON-string only, fine for ~MB-scale data.

**MMKV** — Tencent's mmap key-value, exposed via JSI:
\`\`\`tsx
import { MMKV } from "react-native-mmkv";
const storage = new MMKV();

storage.set("token", "abc");      // synchronous
const token = storage.getString("token");
\`\`\`
- **Sync** access (no awaits anywhere), encryption optional, perfect for Zustand/Redux persistence.

**SQLite** for relational/queryable:
\`\`\`tsx
import * as SQLite from "expo-sqlite";
const db = await SQLite.openDatabaseAsync("app.db");
await db.execAsync("CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY, body TEXT)");
\`\`\`

> **Tip:** **never** put auth tokens in plain AsyncStorage — use SecureStore/Keychain. Use MMKV for hot user prefs, SQLite for anything you'd otherwise paginate.`,
      tags: ["storage"],
    },

    // ───── MEDIUM ─────
    {
      id: "flatlist-perf",
      title: "FlatList performance",
      difficulty: "medium",
      question: "How do you make a FlatList smooth with thousands of items?",
      answer: `\`FlatList\` virtualizes — only on-screen rows are mounted — but defaults aren't optimal for every dataset.

**The non-negotiable basics:**
\`\`\`tsx
<FlatList
  data={items}
  keyExtractor={(item) => item.id}                 // stable, unique
  renderItem={renderRow}                            // memoized fn outside render
  initialNumToRender={10}
  windowSize={7}                                   // how many screens of content to keep
  maxToRenderPerBatch={8}
  removeClippedSubviews                            // unmount offscreen rows
  getItemLayout={(_, i) => ({ length: 80, offset: 80 * i, index: i })}
/>
\`\`\`

**Why each prop matters:**

| Prop                     | Effect                                                   |
|--------------------------|----------------------------------------------------------|
| \`keyExtractor\`         | Avoids index-based keys → fewer re-renders on reorder    |
| \`getItemLayout\`        | Skips measurement; enables instant \`scrollToIndex\`     |
| \`initialNumToRender\`   | First paint speed                                        |
| \`windowSize\`           | Memory vs blank-flash trade-off                          |
| \`removeClippedSubviews\`| Unmounts native views off-screen (Android win)           |
| \`maxToRenderPerBatch\`  | Smaller = smoother scroll, slower fill                   |

**Renderer:**
\`\`\`tsx
const Row = memo(function Row({ item }: { item: Item }) {
  return <Text>{item.name}</Text>;
});
const renderRow = useCallback(({ item }) => <Row item={item} />, []);
\`\`\`

**\`SectionList\`** — same virtualization with grouped sections; pay the same attention.

**Modern alternative — \`FlashList\`** (Shopify): cell recycling like native \`RecyclerView\`/\`UICollectionView\`, drop-in API, often 5-10× smoother for image-heavy feeds.

\`\`\`tsx
import { FlashList } from "@shopify/flash-list";
<FlashList data={items} renderItem={renderRow} estimatedItemSize={80} />
\`\`\`

> **Tip:** if rows are dynamic-height, \`FlashList\` + \`estimatedItemSize\` beats \`FlatList\` every time.`,
      tags: ["performance", "lists"],
    },
    {
      id: "reanimated-gesture",
      title: "Reanimated and Gesture Handler",
      difficulty: "medium",
      question: "How do you build smooth animations and gestures in RN?",
      answer: `Three layers exist; pick by complexity.

**1. \`Animated\` API** — built-in, JS-driven by default.
\`\`\`tsx
import { Animated } from "react-native";
const opacity = useRef(new Animated.Value(0)).current;
Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
\`\`\`
- Add \`useNativeDriver: true\` to run on the UI thread (transforms + opacity only).

**2. \`react-native-reanimated\` v3** — animations and gestures **fully on the UI thread** via JSI worklets.
\`\`\`tsx
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";

const offset = useSharedValue(0);
const style = useAnimatedStyle(() => ({ transform: [{ translateX: offset.value }] }));

return (
  <>
    <Animated.View style={[styles.box, style]} />
    <Button title="Move" onPress={() => (offset.value = withSpring(100))} />
  </>
);
\`\`\`

**3. \`react-native-gesture-handler\`** — declarative gestures (pan, pinch, long-press) handled on the UI thread.
\`\`\`tsx
import { GestureDetector, Gesture } from "react-native-gesture-handler";

const pan = Gesture.Pan().onUpdate((e) => {
  offset.value = e.translationX;
}).onEnd(() => {
  offset.value = withSpring(0);
});

<GestureDetector gesture={pan}><Animated.View style={[styles.box, style]} /></GestureDetector>
\`\`\`

| Layer        | Thread    | Use when                                    |
|--------------|-----------|---------------------------------------------|
| \`Animated\` | JS or UI  | Simple fade/slide                            |
| Reanimated   | UI        | Anything tracking finger/scroll, 60fps work  |
| Skia         | GPU       | Drawing, shaders, complex visuals (Shopify Skia) |

> **Tip:** \`Animated\` looks fine until JS thread gets busy (lists, parsing) — then it stutters. **Reanimated worklets keep running** because they're on the UI thread.`,
      tags: ["animation"],
    },
    {
      id: "data-fetching",
      title: "Data fetching and state",
      difficulty: "medium",
      question: "How do you fetch data and manage state in a RN app?",
      answer: `Same patterns as the web — \`fetch\`/\`axios\` for transport, **server-state libs** for caching, **client-state libs** for UI.

**TanStack Query (React Query):**
\`\`\`tsx
const { data, isLoading } = useQuery({
  queryKey: ["users"],
  queryFn: () => fetch("/api/users").then(r => r.json()),
  staleTime: 60_000,
});
\`\`\`
- Cache survives screen pops; refetch on focus via \`focusManager\`.
- Pair with \`@tanstack/query-async-storage-persister\` to persist between launches.

**Mobile-specific concerns:**
- **Offline** — react-query has \`networkMode: "offlineFirst"\`; combine with \`@react-native-community/netinfo\`.
- **App focus** — wire \`AppState\` to \`focusManager.setFocused()\` so queries refetch on resume.
- **Background fetch** — Expo BackgroundFetch / WorkManager for periodic syncs.

**Client state:**
| Lib       | Notes                                      |
|-----------|--------------------------------------------|
| **Zustand** | Tiny, hooks-first, MMKV persist works out of the box |
| **Redux Toolkit** | Mature, RTK Query covers server state too   |
| **Jotai** | Atomic, great for derived state                |
| **Recoil**  | Less active in 2024+                         |
| **Legend-State** | Reactive + persistence for offline-first    |

**Forms:** \`react-hook-form\` + \`zod\` resolver works the same as on the web; bind via the \`Controller\` for native inputs.

\`\`\`tsx
<Controller
  control={control}
  name="email"
  render={({ field }) => <TextInput value={field.value} onChangeText={field.onChange} />}
/>
\`\`\`

> **Tip:** treat the **server** as the source of truth (React Query) and **device** as ephemeral (Zustand/MMKV). Don't reinvent caching in Redux.`,
      tags: ["data", "state"],
    },
    {
      id: "push-notifications",
      title: "Push notifications",
      difficulty: "medium",
      question: "How do push notifications work on iOS and Android?",
      answer: `Push goes through OS-owned services: **APNs** on iOS, **FCM** on Android. Your server talks to them; the OS delivers to the device.

**Architecture:**
\`\`\`
[your server] → [APNs / FCM] → [device OS] → [your app]
\`\`\`

**Tokens:**
- App requests permission, receives a **device token**, sends it to your server.
- Server stores token per user; uses it as the \`to\` field when pushing.

**Expo Notifications** — abstracts both providers behind one API.
\`\`\`tsx
import * as Notifications from "expo-notifications";

const { status } = await Notifications.requestPermissionsAsync();
const token = (await Notifications.getExpoPushTokenAsync()).data;
// POST token to your backend
\`\`\`

Then your server hits Expo's push endpoint; Expo fans out to APNs/FCM:
\`\`\`sh
curl -H "Content-Type: application/json" -X POST https://exp.host/--/api/v2/push/send \\
  -d '{"to":"ExponentPushToken[xxx]","title":"Hi","body":"Hello"}'
\`\`\`

**Bare RN** — wire \`@react-native-firebase/messaging\` (FCM) and \`PushNotificationIOS\` (APNs) yourself.

| Provider        | Good for                              | Limits                             |
|-----------------|---------------------------------------|------------------------------------|
| Expo Push       | Single API, dev-friendly              | Adds Expo as a hop                 |
| FCM             | Cross-platform from one server        | iOS still requires an APNs cert    |
| APNs direct     | Lowest-latency iOS                    | iOS-only                           |
| OneSignal/Braze | Marketing UI, segmentation, A/B       | Vendor lock-in                     |

**Foreground vs background:**
- iOS: silent pushes need \`content-available: 1\` + Background Modes.
- Android: foreground services / notification channels are mandatory on API 26+.

> **Tip:** **always** rotate tokens — they change on reinstall and OS update. Refresh on every app launch and re-upload to your backend.`,
      tags: ["push", "ios", "android"],
    },
    {
      id: "deep-linking",
      title: "Deep linking",
      difficulty: "medium",
      question: "How do you implement deep links and universal links?",
      answer: `Three flavors:
- **Custom scheme** — \`myapp://user/42\`. Easy, but spoofable, no web fallback.
- **Universal Links (iOS)** / **App Links (Android)** — real \`https://\` URLs that open the app if installed.
- **Expo Router links** — file-based routes already are URLs.

**Configure scheme (Expo):**
\`\`\`json
// app.json
{ "expo": { "scheme": "myapp" } }
\`\`\`

**Universal Links / App Links require:**
- iOS: an **\`apple-app-site-association\`** JSON served from \`https://yourdomain.com/.well-known/apple-app-site-association\`.
- Android: an **\`assetlinks.json\`** at \`/.well-known/assetlinks.json\` and \`<intent-filter android:autoVerify="true">\` in \`AndroidManifest.xml\`.

**Handling URLs:**
\`\`\`tsx
import * as Linking from "expo-linking";

// Cold start
const url = await Linking.getInitialURL();

// Subscribed while running
const sub = Linking.addEventListener("url", ({ url }) => {
  // route based on parsed path/query
});
\`\`\`

**With Expo Router:** routes ARE deep links — \`/user/42\` opens \`app/user/[id].tsx\` automatically. No parsing logic needed.

**With React Navigation:**
\`\`\`tsx
const linking = {
  prefixes: ["myapp://", "https://yourdomain.com"],
  config: { screens: { Profile: "user/:id" } },
};

<NavigationContainer linking={linking}>...</NavigationContainer>
\`\`\`

**Test:**
\`\`\`sh
xcrun simctl openurl booted "myapp://user/42"
adb shell am start -W -a android.intent.action.VIEW -d "myapp://user/42"
\`\`\`

> **Tip:** ship Universal/App Links from day one. Custom schemes feel quick but break **email links** and the OS share sheet — you'll rewrite later.`,
      tags: ["routing"],
    },
    {
      id: "hermes-jsi",
      title: "Hermes and JSI",
      difficulty: "medium",
      question: "What is Hermes and what does JSI enable in the new architecture?",
      answer: `**Hermes** is Meta's JS engine optimized for RN. **JSI** is the C++ interface that lets JS and native call each other directly.

**Hermes:**
- Ahead-of-time **bytecode** — no parse step at app start → faster TTI.
- Smaller heap, lower memory.
- Improved \`Intl\`, source map support, debugging via Chrome DevTools.
- **Default engine** since RN 0.70.

| Metric            | Hermes vs JSC (iOS / Android)        |
|-------------------|--------------------------------------|
| TTI (cold start)  | -30 to -50%                          |
| Bundle size       | Larger source, smaller bytecode      |
| Memory            | Lower steady-state                   |
| Debugging         | Chrome DevTools / React DevTools     |

**JSI (JavaScript Interface):**
- C++ API independent of any JS engine.
- JS can hold a **direct reference** to a native object — no JSON serialization.
- Calls can be **synchronous**, return values, throw, etc.

**What JSI enables:**
- **TurboModules** — native modules loaded lazily, with sync calls.
- **Fabric** — new renderer, builds the shadow tree on the JS thread via JSI.
- **Reanimated worklets** — JS functions executed on the UI thread.
- **MMKV** — synchronous storage with no bridge cost.

**Old vs new:**
\`\`\`
Old: JS ──[serialize JSON]──> Bridge ──[parse]──> Native
New: JS ──[JSI ref / direct call]────────────────> Native
\`\`\`

**Enable the new architecture (Expo SDK 51+):**
\`\`\`json
{ "expo": { "newArchEnabled": true } }
\`\`\`

> **Tip:** if you write any custom native module today, write a **TurboModule** with codegen — the old bridge module is on the way out.`,
      tags: ["architecture", "performance"],
    },
    {
      id: "debugging",
      title: "Debugging RN apps",
      difficulty: "medium",
      question: "How do you debug a React Native app?",
      answer: `**Flipper** was the official desktop debugger but is **deprecated as of RN 0.73** — Meta moved to a Chrome DevTools-based experience.

**Modern stack:**

| Tool                     | What it shows                                     |
|--------------------------|---------------------------------------------------|
| **JS DevTools** (Hermes) | Console, breakpoints, network, profiler           |
| **React DevTools**       | Component tree, props, hooks                      |
| **\`npx expo start\` overlay** | Reload, perf monitor, element inspector       |
| **\`xcrun simctl\`** / **\`adb logcat\`** | Native logs                            |
| **Reactotron**           | Logs, async storage, action timeline              |
| **Sentry / Bugsnag**     | Production crash + error monitoring               |

**Open the JS debugger:**
\`\`\`sh
# In dev menu (cmd+D / cmd+M) → "Open Debugger" or
npx expo start                    # then press 'j' to open the JS debugger
\`\`\`

**Enable React DevTools:**
\`\`\`sh
npx react-devtools
# then reload the app
\`\`\`

**Native logs:**
\`\`\`sh
# iOS
npx react-native log-ios
xcrun simctl spawn booted log stream --predicate 'process == "MyApp"'

# Android
adb logcat *:S ReactNative:V ReactNativeJS:V
\`\`\`

**Performance:**
- **Perf Monitor** in dev menu shows JS / UI FPS — drops below 60 = trouble.
- **Hermes profiler** → Chrome DevTools "Performance" tab.
- **Systrace** for native frame analysis.

**Common gotchas:**
- LogBox suppresses warnings — use \`LogBox.ignoreLogs([...])\` sparingly.
- Network inspector only shows \`fetch\`/XHR; \`WebSocket\` and \`URLSession\` calls won't appear.
- Source maps must be uploaded to Sentry per build to symbolicate prod stacks.

> **Tip:** for tricky native crashes, nothing replaces **\`adb logcat\`** and Xcode's **Console**. JS-only debuggers won't show a missing Info.plist key.`,
      tags: ["debugging"],
    },

    // ───── HARD ─────
    {
      id: "native-modules",
      title: "Native modules and TurboModules",
      difficulty: "hard",
      question: "When should you write a native module and how does it work in the new architecture?",
      answer: `Reach for native code only when JS can't get there: **camera/sensors, Bluetooth, system APIs, performance-critical paths**, or when wrapping an existing **iOS/Android SDK**.

**Decision matrix:**

| Need                              | Use                                 |
|-----------------------------------|-------------------------------------|
| HTTP, JSON, CRUD                  | Pure JS                             |
| Re-implementing a UI primitive    | JS + Reanimated/Skia first          |
| Hardware (NFC, BLE, biometrics)   | Native module (often community-made) |
| Vendor SDK (Stripe, Mixpanel)     | Native module wrapper               |
| Hot loop / image processing       | Native module + JSI                 |

**Old architecture (Bridge module):**
- Inherits \`RCTBridgeModule\` (iOS) / \`ReactContextBaseJavaModule\` (Android).
- All calls async, JSON-serialized.

**New architecture (TurboModule):**
- Define a **JS spec** (TypeScript) → \`codegen\` produces C++ interfaces.
- Implement spec in Obj-C++/Kotlin.
- Calls go through **JSI** — synchronous, type-safe, lazy-loaded.

**Spec example:**
\`\`\`ts
// NativeMyModule.ts
import type { TurboModule } from "react-native";
import { TurboModuleRegistry } from "react-native";

export interface Spec extends TurboModule {
  multiply(a: number, b: number): number;          // synchronous!
  asyncStuff(payload: string): Promise<string>;
}

export default TurboModuleRegistry.getEnforcing<Spec>("MyModule");
\`\`\`

**iOS impl sketch:**
\`\`\`objc
- (NSNumber *)multiply:(double)a b:(double)b {
  return @(a * b);
}
\`\`\`

**Build it once:**
\`\`\`sh
npx create-expo-module my-module
# generates JS spec + iOS + Android scaffolding
\`\`\`

> **Rule of thumb:** before writing native code, search \`@react-native-community/*\` and Expo modules — odds are someone already wrapped that SDK. Maintaining native is a **recurring tax** with every RN upgrade.`,
      tags: ["native", "architecture"],
    },
    {
      id: "perf-deep-dive",
      title: "Performance deep dive",
      difficulty: "hard",
      question: "How do you diagnose and fix RN performance issues?",
      answer: `Two threads to watch: the **JS thread** (runs your code) and the **UI thread** (compositor). Either one stalled = jank.

**Measure first:**
- Dev menu → **Perf Monitor** (JS / UI FPS).
- **Hermes sampling profiler** → flame graph in Chrome DevTools.
- **Systrace** (Android) / **Instruments** (iOS) for native frames.
- Production: **Sentry Performance**, **Firebase Performance**, **DataDog RUM**.

**Common bottlenecks and fixes:**

| Symptom                                  | Likely cause                          | Fix                                                |
|------------------------------------------|---------------------------------------|----------------------------------------------------|
| Slow cold start                          | Big JS bundle, sync requires          | Hermes, RAM bundles, lazy import, **inlineRequires** |
| Scroll jank in long lists                | \`ScrollView\`, missing \`getItemLayout\` | \`FlatList\`/\`FlashList\` with proper props       |
| Animation stutters under load            | JS-driven \`Animated\`                | \`useNativeDriver\` or **Reanimated worklets**     |
| Re-render storms                         | Inline objects, unstable callbacks    | \`memo\`, \`useCallback\`, selector-based stores   |
| Image-heavy screens                      | Decoding on JS thread                 | \`expo-image\` / \`react-native-fast-image\`, resize |
| Slow navigation transitions              | Mounting heavy screens                | Native Stack, \`InteractionManager.runAfterInteractions\` |
| Slow startup on Android                  | Cold dex, Hermes off                  | Hermes + R8 + ProGuard, baseline profiles          |
| Bridge floods (old arch)                 | Frequent JS↔native calls              | Batch / move to JSI / TurboModules                 |

**Key APIs:**
\`\`\`tsx
InteractionManager.runAfterInteractions(() => doExpensiveWork());
\`\`\`
- Defer work until animations / transitions finish so they stay smooth.

**Rendering hygiene:**
- Memoize list rows.
- Avoid anonymous \`style={{...}}\` in hot paths — recreates objects each render.
- Co-locate state — global stores cause every subscriber to re-render.

**Bundle:**
- Enable \`inlineRequires: true\` and **RAM bundles** in \`metro.config.js\` to lazy-load modules.
- Run **bundle analyzer** (\`metro-visualizer\`) to spot bloat.

> **Tip:** before optimizing JS, check the **UI thread** in Systrace. The most common "RN is slow" turns out to be a misuse of \`ScrollView\` or unbounded image sizes — a 30-second fix.`,
      tags: ["performance"],
    },
    {
      id: "testing-rn",
      title: "Testing React Native apps",
      difficulty: "hard",
      question: "How do you test RN apps end-to-end?",
      answer: `Three layers, mirroring the testing trophy.

| Layer            | Tool                                      | Notes                                  |
|------------------|-------------------------------------------|----------------------------------------|
| Unit             | **Jest** (\`jest-expo\` preset)           | Pure logic, hooks, reducers            |
| Component        | **@testing-library/react-native**         | Renders into a JS-only host            |
| E2E (gray-box)   | **Detox**                                 | Built for RN, hooks into native sync   |
| E2E (black-box)  | **Maestro**                               | YAML flows, no app instrumentation     |
| Visual           | **Storybook for RN** + Chromatic Native   | Snapshots of stories                   |

**Component test:**
\`\`\`tsx
import { render, fireEvent, screen } from "@testing-library/react-native";
import { Counter } from "./Counter";

test("increments", () => {
  render(<Counter />);
  fireEvent.press(screen.getByRole("button", { name: /count/i }));
  expect(screen.getByText("Count: 1")).toBeOnTheScreen();
});
\`\`\`
- API mirrors the web RTL — same query priorities, same mental model.

**Detox** — drives a real app on a simulator, syncs with the JS event loop and animations.
\`\`\`ts
describe("login", () => {
  beforeEach(async () => { await device.reloadReactNative(); });
  it("signs in", async () => {
    await element(by.id("email")).typeText("ada@x.com");
    await element(by.id("password")).typeText("pw");
    await element(by.id("submit")).tap();
    await expect(element(by.text("Welcome"))).toBeVisible();
  });
});
\`\`\`
- Pros: deeply integrated, fast feedback.
- Cons: setup heavy, brittle on CI without effort.

**Maestro** — YAML, no native build dependency:
\`\`\`yaml
appId: com.example.app
---
- launchApp
- tapOn: "Sign in"
- inputText: "ada@x.com"
- assertVisible: "Welcome"
\`\`\`
- Pros: trivial setup, runs against any binary.
- Cons: less fine-grained control than Detox.

**CI:**
- Use **EAS Build** to produce a binary; download it as the artifact for Detox/Maestro.
- Cache simulators / pods aggressively — they dominate run time.

> **Tip:** start with RTL component tests (cheap, fast). Add Maestro for top-3 user flows. Reach for Detox only when you need millisecond timing or sync-bound assertions.`,
      tags: ["testing"],
    },
    {
      id: "publishing",
      title: "Building and publishing",
      difficulty: "hard",
      question: "What's involved in shipping an RN app to the stores?",
      answer: `Two distribution targets — **App Store** and **Play Store** — each with its own signing, review, and metadata process. RN apps follow the same rules as any native app.

**Local builds:**
\`\`\`sh
# iOS
cd ios && pod install
xcodebuild -workspace MyApp.xcworkspace -scheme MyApp -configuration Release archive

# Android
cd android && ./gradlew bundleRelease
\`\`\`

**EAS Build (cloud):**
\`\`\`sh
eas build --profile production --platform all
eas submit --platform ios          # uploads to App Store Connect
eas submit --platform android      # uploads to Play Console
\`\`\`

**Required artifacts:**

| Platform | Build output       | Signed by                       | Submitted to       |
|----------|--------------------|---------------------------------|--------------------|
| iOS      | \`.ipa\`           | Apple distribution certificate + provisioning profile | TestFlight → App Store |
| Android  | \`.aab\` (preferred) | Upload key (Play App Signing manages release key) | Play Console internal/closed/open testing → production |

**Versioning:**
- iOS: \`CFBundleShortVersionString\` (1.2.3) + \`CFBundleVersion\` (build number, monotonically increasing).
- Android: \`versionName\` (1.2.3) + \`versionCode\` (integer, monotonically increasing).
- EAS can auto-bump with \`autoIncrement: true\`.

**Review hot spots:**
- iOS: privacy manifest (\`PrivacyInfo.xcprivacy\`), tracking permission strings, **encryption export** declaration.
- Android: target SDK requirements (Play raises the floor yearly), data-safety form.

**OTA / over-the-air updates:**
- **Expo Updates** / **EAS Update** — push a new JS bundle without going through review.
- **CodePush** — Microsoft's option (sunset for many; AppCenter retiring 2025).
- **Limit:** only JS + assets. Native code changes still require a store submission.
- **Policy:** Apple allows JS updates as long as you don't change the app's core purpose.

\`\`\`sh
eas update --branch production --message "fix: empty cart crash"
\`\`\`

**Channels:** map binaries to update branches (\`production\`, \`staging\`) so a TestFlight build only sees \`staging\` updates.

> **Tip:** automate **everything** — version bumps, builds, store metadata (\`fastlane\`/\`eas submit\`). Manual store submissions are the #1 source of release-day mistakes.`,
      tags: ["release", "ci"],
    },
    {
      id: "new-arch-migration",
      title: "Migrating to the new architecture",
      difficulty: "hard",
      question: "How do you migrate an app to Fabric and TurboModules and what breaks?",
      answer: `The **new architecture** ships **Fabric** (renderer) + **TurboModules** (lazy native modules) on top of **JSI**. RN 0.76 (late 2024) made it the default for new apps; existing apps must opt in and audit native deps.

**Enable it:**

\`\`\`json
// app.json (Expo)
{ "expo": { "newArchEnabled": true } }
\`\`\`

\`\`\`properties
# android/gradle.properties (bare)
newArchEnabled=true
\`\`\`

\`\`\`ruby
# ios/Podfile.properties.json (bare)
{ "newArchEnabled": "true" }
\`\`\`

**What changes under the hood:**

| Subsystem    | Old                         | New                             |
|--------------|-----------------------------|---------------------------------|
| Renderer     | Paper (UI tree on JS thread, async) | Fabric (sync C++ shadow tree) |
| Modules      | Bridge modules (async JSON) | TurboModules (JSI, often sync) |
| Comm         | JSON bridge                 | JSI direct refs                 |
| Codegen      | Optional                    | **Required** for native specs  |

**What breaks:**
- **Unmaintained native modules** — anything that hasn't shipped a TurboModule/Fabric component yet. Check \`reactnative.directory\` for the green checkmark.
- **\`requireNativeComponent\`** — must migrate to **codegen + Fabric component** spec.
- **\`UIManager.dispatchViewManagerCommand\`** — replaced by typed commands on Fabric refs.
- **Deeply imperative APIs** (e.g. \`measure\` callbacks) — semantics tightened.
- **Layout timing** — Fabric flushes synchronously; some \`onLayout\`-based hacks no longer race the way they used to.

**Audit checklist:**

\`\`\`sh
# 1) Upgrade RN / Expo SDK to a version that supports new arch
# 2) Run with newArchEnabled=true on a feature branch
# 3) Watch for red boxes mentioning "interop layer" — that's a legacy module
# 4) Profile cold start + scroll perf vs old arch
\`\`\`

**Interop layer:**
- RN ships an **interop layer** so old bridge modules keep working temporarily.
- It's a **migration crutch**, not a destination — you lose the perf wins until modules are ported.

**Rollout strategy:**
1. Pin all native deps to versions with new-arch support.
2. Enable on a **beta channel** via EAS Update/CodePush channel separation.
3. Monitor crash rate (Sentry) and FPS (Firebase Performance) vs control group.
4. Promote to 100% when crash-free sessions match.

> **Tip:** the new architecture's biggest wins (sync TurboModule calls, Fabric scheduling) only show up if you **also rewrite hot paths** to use them. Just flipping the flag often produces a flat curve — measure before celebrating.`,
      tags: ["architecture", "migration"],
    },
    {
      id: "code-sharing-web",
      title: "Sharing code with the web",
      difficulty: "hard",
      question: "How do you share code between a React Native app and a web app?",
      answer: `Three increasingly ambitious tiers: **share logic only**, **share components via RN-Web**, or **share a full design system**.

**Tier 1 — Logic only (easy):**
- Move pure code (utils, types, API clients, Zustand stores, hooks) into a shared package.
- Web and RN both import it. No rendering shared.
- Works in any monorepo (pnpm workspaces, Turborepo, Nx).

**Tier 2 — RN primitives on the web (\`react-native-web\`):**
- Maps \`<View>\`/\`<Text>\` to \`<div>\`/\`<span>\`.
- Lets you write **once** with RN APIs and run on web.
- Used by Twitter/X, Discord.
\`\`\`tsx
import { View, Text } from "react-native";  // resolves to react-native-web on web
\`\`\`

**Tier 3 — Cross-platform router + components (\`Solito\`, \`Tamagui\`):**
- **Solito** — Next.js + Expo Router with shared screens.
- **Tamagui** — design-system + compiler that emits optimized RN and web styles.
- True "write once, ship three platforms (iOS, Android, Web)."

| Approach          | Effort | Code share | Trade-off                              |
|-------------------|--------|------------|----------------------------------------|
| Shared logic pkg  | Low    | ~30%       | UI duplicated                          |
| RN Web            | Medium | ~70%       | Some web bugs (CSS quirks, SSR)        |
| Solito + Tamagui  | High   | ~90%       | Steeper learning, opinionated stack    |

**Monorepo layout:**
\`\`\`
apps/
  web/         # Next.js
  mobile/      # Expo
packages/
  ui/          # Shared components (Tamagui)
  api/         # Shared API client + types
  config/      # ESLint, tsconfig, Tailwind
\`\`\`

**Cross-platform alternatives:**
- **Flutter** — Dart, own widget toolkit, no JS reuse. Excellent perf; smaller JS-shop overlap.
- **Capacitor / Ionic** — web app in a WebView. Cheap to ship, native feel limited.
- **KMP / Kotlin Multiplatform** — share business logic across iOS/Android/web with native UI on each.

> **Tip:** start with **shared logic only**. Most teams over-invest in "write once" and end up with components that feel wrong on every platform. Pick RN-Web/Tamagui only if a single design system is a real product requirement.`,
      tags: ["cross-platform", "monorepo"],
    },
  ],
};
