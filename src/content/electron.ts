import type { Category } from "./types";

export const electron: Category = {
  slug: "electron",
  title: "Electron & Tauri",
  description:
    "Desktop app development with Electron 33+ and Tauri 2.x: process model, IPC, security hardening, packaging, auto-updates, native integrations, and a head-to-head comparison of the two frameworks.",
  icon: "🖥️",
  questions: [
    // ───── EASY ─────
    {
      id: "what-is-electron",
      title: "What is Electron?",
      difficulty: "easy",
      question: "What is Electron and what problems does it solve for desktop app development?",
      answer: `**Electron** is an open-source framework (maintained by GitHub/Microsoft) that lets you build cross-platform desktop applications using web technologies — HTML, CSS, and JavaScript/TypeScript — by bundling **Chromium** (for the UI) and **Node.js** (for OS access) into a single executable.

**Problems it solves:**

| Challenge | Electron's answer |
|---|---|
| Cross-platform native UIs | One codebase runs on macOS, Windows, Linux |
| OS-level APIs from JS | Node.js built-in APIs + native Node addons |
| No browser security sandbox | Main process can call any OS API |
| Distribution | electron-builder / electron-forge produce signed installers |

**How an app starts:**
1. The OS launches the **main process** (Node.js).
2. The main process calls \`app.on('ready')\` and creates \`BrowserWindow\` instances.
3. Each window loads a URL / local HTML file into an embedded **Chromium renderer**.

\`\`\`ts
// main.ts  (Electron 33+)
import { app, BrowserWindow } from "electron";
import path from "node:path";

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,   // required in modern Electron
      nodeIntegration: false,   // never enable in 2026
    },
  });
  win.loadFile("index.html");
});
\`\`\`

> **Key trade-off:** shipping Chromium + Node (~150 MB) means bundles are large and memory usage is high compared to native toolkits — but developer productivity is unmatched for web-skilled teams.`,
      tags: ["fundamentals"],
    },
    {
      id: "main-vs-renderer-process",
      title: "Main vs renderer process",
      difficulty: "easy",
      question: "What is the difference between Electron's main process and renderer process?",
      answer: `Electron follows a **multi-process architecture** inherited from Chromium. Understanding the two primary process types is fundamental to every Electron app.

| Aspect | Main process | Renderer process |
|---|---|---|
| **Entry point** | \`main\` field in package.json | Each \`BrowserWindow\` |
| **Runtime** | Node.js | Chromium (Blink + V8) |
| **Count** | Exactly one | One per window / webview |
| **Node APIs** | Full access (fs, net, child_process…) | None by default (contextIsolation) |
| **Electron APIs** | \`app\`, \`BrowserWindow\`, \`Menu\`, \`Tray\`… | \`ipcRenderer\`, exposed preload APIs |
| **Crash impact** | Kills entire app | Only that window crashes |

**Main process responsibilities:**
- App lifecycle (\`app.quit()\`, \`before-quit\` event)
- Creating / managing \`BrowserWindow\` instances
- Native menus, system tray, dialogs, notifications
- Auto-updater, protocol handlers

**Renderer process responsibilities:**
- Rendering the web UI (React / Vue / plain HTML)
- Handling user interactions
- Sending IPC messages to main when OS-level work is needed

\`\`\`ts
// In renderer — you CANNOT do this (Node is disabled):
// const fs = require("fs"); // ❌ ReferenceError

// Instead, call a bridged API exposed via preload:
const result = await window.electronAPI.readFile("/tmp/data.json");
\`\`\``,
      tags: ["architecture", "processes"],
    },
    {
      id: "ipc-basics",
      title: "IPC basics",
      difficulty: "easy",
      question: "How does inter-process communication (IPC) work in Electron? What are ipcMain and ipcRenderer?",
      answer: `**IPC (Inter-Process Communication)** is the messaging layer between the main process and renderer processes. Electron ships two paired modules:

| Module | Lives in | Purpose |
|---|---|---|
| \`ipcMain\` | Main process | Registers handlers, receives messages from renderers |
| \`ipcRenderer\` | Renderer (preload) | Sends messages to / receives replies from main |

**Invoke / handle pattern (recommended — returns a Promise):**

\`\`\`ts
// main.ts
import { ipcMain } from "electron";
import fs from "node:fs/promises";

ipcMain.handle("read-file", async (_event, filePath: string) => {
  return fs.readFile(filePath, "utf-8");
});
\`\`\`

\`\`\`ts
// preload.ts
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  readFile: (path: string) => ipcRenderer.invoke("read-file", path),
});
\`\`\`

\`\`\`ts
// renderer (React component)
const content = await window.electronAPI.readFile("/etc/hosts");
\`\`\`

**One-way messages** (\`send\` / \`on\`) are still available for fire-and-forget events (e.g., progress updates from main → renderer):

\`\`\`ts
// main pushes progress to renderer
win.webContents.send("download-progress", { percent: 42 });

// preload exposes listener
contextBridge.exposeInMainWorld("electronAPI", {
  onDownloadProgress: (cb: (p: number) => void) =>
    ipcRenderer.on("download-progress", (_e, data) => cb(data.percent)),
});
\`\`\`

> **Rule:** Always prefer \`invoke/handle\` over \`send/on\` for request-response flows — it handles errors via rejected promises and avoids listener leaks.`,
      tags: ["ipc", "architecture"],
    },
    {
      id: "preload-scripts",
      title: "Preload scripts",
      difficulty: "easy",
      question: "What is an Electron preload script and why is it needed?",
      answer: `A **preload script** is a JavaScript file that runs in the renderer process **before** the web page loads, but in a privileged context — it has access to both \`ipcRenderer\` and a limited set of Node APIs, even when \`nodeIntegration: false\`.

**Why it's needed:**
- Renderers are sandboxed; they cannot call Node.js or \`ipcRenderer\` directly.
- The preload acts as a **safe bridge** — it selectively exposes specific capabilities to the web page via \`contextBridge\`.

\`\`\`ts
// preload.ts — compiled to preload.js
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  // Only expose narrow, typed functions — not the whole ipcRenderer
  getSystemInfo: () => ipcRenderer.invoke("get-system-info"),
  openFile:      () => ipcRenderer.invoke("dialog:open-file"),
  onThemeChange: (cb: (theme: string) => void) => {
    const listener = (_: Electron.IpcRendererEvent, t: string) => cb(t);
    ipcRenderer.on("theme-changed", listener);
    // Return cleanup so React effects can unsubscribe
    return () => ipcRenderer.removeListener("theme-changed", listener);
  },
});
\`\`\`

**Registration in BrowserWindow:**
\`\`\`ts
new BrowserWindow({
  webPreferences: {
    preload: path.join(__dirname, "preload.js"),
    contextIsolation: true,
  },
});
\`\`\`

**What the renderer sees:**
\`\`\`ts
// renderer — window.electronAPI is a plain object, not ipcRenderer itself
const info = await window.electronAPI.getSystemInfo();
\`\`\`

> The preload is the **single point of control** for what the web page can do. Keep it minimal and typed.`,
      tags: ["security", "ipc", "preload"],
    },
    {
      id: "context-isolation",
      title: "contextIsolation & nodeIntegration",
      difficulty: "easy",
      question: "What are contextIsolation and nodeIntegration, and what are the recommended settings in 2026?",
      answer: `These two \`webPreferences\` flags control how much access the renderer process has to Node.js and Electron APIs.

| Flag | Default (Electron 12+) | Effect when \`true\` |
|---|---|---|
| \`contextIsolation\` | \`true\` | Renderer JS runs in an isolated V8 context; \`window\` in preload ≠ \`window\` in page |
| \`nodeIntegration\` | \`false\` | Renderer can call \`require('fs')\`, access \`process\`, etc. |

**2026 recommended settings:**
\`\`\`ts
webPreferences: {
  contextIsolation: true,   // ✅ always
  nodeIntegration: false,   // ✅ always
  sandbox: true,            // ✅ default true since Electron 20
  preload: "...",           // bridge via contextBridge
}
\`\`\`

**Why \`contextIsolation: true\` matters:**
Without it, a malicious script loaded by the page could reach into the preload's scope and call \`ipcRenderer.send\` directly — bypassing all validation:
\`\`\`js
// Attack possible when contextIsolation: false
require("electron").ipcRenderer.invoke("delete-all-files");
\`\`\`

**Why \`nodeIntegration: false\` matters:**
If the renderer ever executes untrusted content (an XSS, a malicious iframe, a remote URL), Node access lets an attacker run arbitrary OS commands.

> **Electron Security Checklist #1 & #2:** Disable \`nodeIntegration\`, enable \`contextIsolation\`. These are non-negotiable for production apps loading any remote content.`,
      tags: ["security", "configuration"],
    },
    {
      id: "what-is-tauri",
      title: "What is Tauri?",
      difficulty: "easy",
      question: "What is Tauri and how does it differ from Electron at a high level?",
      answer: `**Tauri** is an open-source framework for building desktop (and now mobile) apps with a web frontend and a **Rust backend**. Instead of bundling Chromium, it uses the **OS's own WebView** (WebKit on macOS/Linux, WebView2 on Windows).

**Architecture at a glance:**

\`\`\`
┌─────────────────────────────────────┐
│  Web frontend (any framework)       │  ← WebView (OS-native)
│  React / Vue / Svelte / plain HTML  │
└────────────────┬────────────────────┘
                 │  Tauri IPC (invoke / event)
┌────────────────▼────────────────────┐
│  Rust core (tauri crate)            │  ← your business logic
│  Commands, plugins, OS APIs         │
└─────────────────────────────────────┘
\`\`\`

**Key differences vs Electron (detailed comparison in its own question):**

| | Electron | Tauri |
|---|---|---|
| Backend language | Node.js (JS/TS) | Rust |
| Rendering engine | Bundled Chromium | OS WebView |
| Installer size | ~150 MB | ~3–10 MB |
| Memory (idle) | ~150–300 MB | ~20–60 MB |
| Maturity | 2013, very stable | 2022 (v1), v2 in 2024 |
| Mobile support | No | Yes (Tauri v2) |

> Tauri v2 (released late 2024) stabilised mobile targets (iOS, Android) and introduced a capability-based permission system, making it the most actively developed desktop+mobile framework in the Rust ecosystem as of 2026.`,
      tags: ["fundamentals", "tauri"],
    },
    {
      id: "electron-app-lifecycle",
      title: "Electron app lifecycle events",
      difficulty: "easy",
      question: "What are the key app lifecycle events in Electron and when should each be used?",
      answer: `The \`app\` module emits lifecycle events you hook into to control startup, window management, and shutdown.

| Event | When it fires | Typical use |
|---|---|---|
| \`ready\` / \`whenReady()\` | Chromium is initialised | Create first BrowserWindow, register IPC handlers |
| \`window-all-closed\` | Last window closes | On non-macOS: call \`app.quit()\` |
| \`activate\` | macOS dock icon clicked with no open windows | Re-create the main window |
| \`before-quit\` | Quit initiated but windows not yet closed | Save state, clean up |
| \`will-quit\` | All windows closed, about to exit | Final cleanup |
| \`quit\` | App has exited | (rarely needed) |

\`\`\`ts
import { app, BrowserWindow } from "electron";

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({ width: 1280, height: 800 });
  mainWindow.loadFile("index.html");
  mainWindow.on("closed", () => { mainWindow = null; });
}

app.whenReady().then(createWindow);

// Standard cross-platform pattern
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (mainWindow === null) createWindow();
});

app.on("before-quit", () => {
  // persist user settings
});
\`\`\`

> **Single-instance lock** — call \`app.requestSingleInstanceLock()\` in \`ready\` to prevent multiple instances of your app from launching simultaneously.`,
      tags: ["lifecycle", "fundamentals"],
    },

    // ───── MEDIUM ─────
    {
      id: "context-bridge-patterns",
      title: "contextBridge patterns",
      difficulty: "medium",
      question: "What patterns should you follow when using contextBridge to safely expose APIs to the renderer?",
      answer: `\`contextBridge.exposeInMainWorld\` is the only sanctioned way to communicate between the preload's privileged context and the web page. Getting it right requires a few key patterns.

**1. Expose functions, not objects with callable internals**
\`\`\`ts
// ❌ Too broad — exposes the whole ipcRenderer
contextBridge.exposeInMainWorld("ipc", ipcRenderer);

// ✅ Narrow, typed, auditable
contextBridge.exposeInMainWorld("electronAPI", {
  saveFile: (content: string) => ipcRenderer.invoke("save-file", content),
  openFile: ()               => ipcRenderer.invoke("open-file"),
});
\`\`\`

**2. Validate arguments in the main handler, not just preload**
\`\`\`ts
ipcMain.handle("save-file", async (_e, content: unknown) => {
  if (typeof content !== "string") throw new Error("invalid arg");
  // ...
});
\`\`\`

**3. Return clean-up functions for event listeners**
\`\`\`ts
contextBridge.exposeInMainWorld("electronAPI", {
  onProgress: (cb: (pct: number) => void) => {
    const handler = (_: unknown, pct: number) => cb(pct);
    ipcRenderer.on("progress", handler);
    return () => ipcRenderer.removeListener("progress", handler);
  },
});

// In React:
useEffect(() => {
  const unsub = window.electronAPI.onProgress(setPct);
  return unsub; // cleanup on unmount
}, []);
\`\`\`

**4. TypeScript declarations for the renderer**
\`\`\`ts
// electron.d.ts (included in renderer tsconfig)
interface ElectronAPI {
  saveFile: (content: string) => Promise<void>;
  openFile: ()               => Promise<string | null>;
  onProgress: (cb: (pct: number) => void) => () => void;
}

declare global {
  interface Window { electronAPI: ElectronAPI; }
}
\`\`\`

**5. Never pass Node objects (Buffer, fs handles) through the bridge** — they will not serialize correctly. Convert to plain JSON-serialisable values first.`,
      tags: ["security", "ipc", "preload"],
    },
    {
      id: "electron-packaging",
      title: "Packaging with electron-builder & electron-forge",
      difficulty: "medium",
      question: "How do electron-builder and electron-forge differ, and how do you produce a distributable with each?",
      answer: `Both tools take your compiled app and produce platform-specific installers, but they have different philosophies.

| | electron-builder | electron-forge |
|---|---|---|
| **Approach** | Config-driven (package.json / yaml) | Scaffold + plugin pipeline |
| **Templates** | Bring your own bundler | Vite, Webpack, Parcel plugins built-in |
| **Targets** | NSIS, DMG, AppImage, Snap, deb, rpm, MSI… | Same, via makers |
| **Auto-update** | Built-in S3, GitHub, Spaces publish | Via update-electron-app / custom |
| **Maintained by** | Community | OpenJS Foundation (officially blessed) |

**electron-builder** (config in package.json):
\`\`\`json
{
  "build": {
    "appId": "com.example.myapp",
    "mac":  { "target": "dmg", "hardenedRuntime": true },
    "win":  { "target": "nsis" },
    "linux":{ "target": "AppImage" },
    "publish": { "provider": "github" }
  }
}
\`\`\`
\`\`\`bash
npx electron-builder --mac --win --linux
\`\`\`

**electron-forge** (forge.config.ts):
\`\`\`ts
import { MakerDMG } from "@electron-forge/maker-dmg";
import { MakerNSIS } from "@electron-forge/maker-nsis";
import { VitePlugin } from "@electron-forge/plugin-vite";

export default {
  packagerConfig: { asar: true },
  makers: [new MakerDMG(), new MakerNSIS()],
  plugins: [new VitePlugin({ /* vite configs */ })],
};
\`\`\`
\`\`\`bash
npx electron-forge make
\`\`\`

**asar archives** — always enable \`asar: true\` to pack source files into an archive that prevents trivial source inspection and speeds up file I/O.

> **Recommendation in 2026:** Start new projects with electron-forge + the Vite plugin — the zero-config HMR dev experience and official backing make it the default choice.`,
      tags: ["packaging", "distribution"],
    },
    {
      id: "auto-update",
      title: "Auto-update with autoUpdater",
      difficulty: "medium",
      question: "How do you implement auto-update in an Electron app?",
      answer: `Electron ships a built-in \`autoUpdater\` module (based on Squirrel) and the ecosystem provides \`update-electron-app\` as a zero-config wrapper.

**Option A — update-electron-app (simplest, GitHub Releases):**
\`\`\`ts
// main.ts
import { updateElectronApp, UpdateSourceType } from "update-electron-app";

app.whenReady().then(() => {
  updateElectronApp({
    updateSource: {
      type: UpdateSourceType.ElectronPublicUpdateService,
      repo: "my-org/my-app",
    },
    updateInterval: "1 hour",
    notifyUser: true,
  });
});
\`\`\`

**Option B — manual autoUpdater (full control):**
\`\`\`ts
import { autoUpdater } from "electron";

autoUpdater.setFeedURL({
  url: \`https://releases.example.com/update/\${process.platform}/\${app.getVersion()}\`,
});

autoUpdater.on("update-downloaded", (_e, notes, name) => {
  const choice = dialog.showMessageBoxSync({
    type: "info",
    buttons: ["Restart", "Later"],
    message: \`Version \${name} is ready. Restart to install?\`,
    detail: notes,
  });
  if (choice === 0) autoUpdater.quitAndInstall();
});

autoUpdater.checkForUpdates();
\`\`\`

**Platform notes:**

| Platform | Mechanism | Signing required? |
|---|---|---|
| macOS | Squirrel.Mac | Yes — notarisation |
| Windows | Squirrel.Windows | Yes — Authenticode |
| Linux | No built-in Squirrel | Use AppImage self-update or snap channels |

**electron-builder** integrates \`electron-updater\` (a cross-platform replacement that works on Linux too):
\`\`\`ts
import { autoUpdater } from "electron-updater";
autoUpdater.checkForUpdatesAndNotify();
\`\`\`

> Always sign and notarise before distributing updates — macOS Gatekeeper and Windows SmartScreen will block unsigned installers.`,
      tags: ["distribution", "auto-update"],
    },
    {
      id: "native-menus-tray",
      title: "Native menus & system tray",
      difficulty: "medium",
      question: "How do you create a native application menu and a system tray icon in Electron?",
      answer: `**Application Menu** — built with \`Menu.buildFromTemplate\`:

\`\`\`ts
import { app, Menu, shell, BrowserWindow } from "electron";

function buildMenu(win: BrowserWindow) {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: "File",
      submenu: [
        { label: "Open…", accelerator: "CmdOrCtrl+O",
          click: () => win.webContents.send("menu:open") },
        { type: "separator" },
        { role: "quit" },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" }, { role: "redo" },
        { type: "separator" },
        { role: "cut" }, { role: "copy" }, { role: "paste" },
      ],
    },
    { role: "viewMenu" },   // zoom, devtools
    { role: "windowMenu" }, // minimize, close
    {
      label: "Help",
      submenu: [{ label: "Documentation",
        click: () => shell.openExternal("https://example.com") }],
    },
  ];

  // macOS: first menu item is always the app name menu
  if (process.platform === "darwin") {
    template.unshift({ role: "appMenu" });
  }

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}
\`\`\`

**System Tray** — shown in the OS notification area / menu bar:

\`\`\`ts
import { Tray, Menu, nativeImage } from "electron";
import path from "node:path";

let tray: Tray | null = null; // must be module-level to prevent GC

app.whenReady().then(() => {
  const icon = nativeImage.createFromPath(
    path.join(__dirname, "assets/trayIcon.png")
  );
  tray = new Tray(icon);
  tray.setToolTip("My App");

  const contextMenu = Menu.buildFromTemplate([
    { label: "Show App", click: () => mainWindow?.show() },
    { label: "Quit",     click: () => app.quit() },
  ]);
  tray.setContextMenu(contextMenu);

  tray.on("click", () => mainWindow?.show()); // Windows: single-click
});
\`\`\`

> **Gotcha:** Store \`Tray\` in a variable outside the function — if it goes out of scope JavaScript GC will destroy it and the icon disappears.`,
      tags: ["native", "ui"],
    },
    {
      id: "tauri-commands-events",
      title: "Tauri commands & events",
      difficulty: "medium",
      question: "How does Tauri's IPC work? Explain commands and events with examples.",
      answer: `Tauri uses a capability-based IPC where the frontend calls **commands** (Rust functions) and both sides can emit **events**.

**Commands (frontend → Rust, like RPC):**

\`\`\`rust
// src-tauri/src/main.rs
use tauri::command;

#[command]
async fn read_file(path: String) -> Result<String, String> {
    std::fs::read_to_string(&path).map_err(|e| e.to_string())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![read_file])
        .run(tauri::generate_context!())
        .expect("error running tauri");
}
\`\`\`

\`\`\`ts
// Frontend (TypeScript)
import { invoke } from "@tauri-apps/api/core";

const content = await invoke<string>("read_file", { path: "/etc/hosts" });
\`\`\`

**Events (pub/sub in both directions):**

\`\`\`rust
// Rust emits an event to the frontend
use tauri::Emitter;

#[command]
async fn start_download(url: String, app: tauri::AppHandle) {
    // ... download logic ...
    app.emit("download-progress", serde_json::json!({ "percent": 50 }))
       .unwrap();
}
\`\`\`

\`\`\`ts
// Frontend listens
import { listen } from "@tauri-apps/api/event";

const unlisten = await listen<{ percent: number }>(
  "download-progress",
  (event) => console.log(event.payload.percent)
);
// cleanup:
unlisten();
\`\`\`

**Tauri v2 capability system** — commands must be explicitly allowed in \`capabilities/default.json\`:
\`\`\`json
{
  "permissions": ["core:default", "fs:read-files"]
}
\`\`\`

> Commands are type-safe end-to-end: Rust return types map to TypeScript via \`invoke<T>\`. The capability system replaces v1's allowlist and provides fine-grained, auditable permission control.`,
      tags: ["tauri", "ipc"],
    },
    {
      id: "tauri-vs-electron-comparison",
      title: "Tauri vs Electron comparison",
      difficulty: "medium",
      question: "Compare Tauri and Electron across bundle size, memory, security, and developer experience.",
      answer: `**Head-to-head comparison (2026, typical apps):**

| Dimension | Electron 33 | Tauri 2.x |
|---|---|---|
| **Rendering engine** | Bundled Chromium | OS WebView (WebKit / WebView2) |
| **Backend language** | Node.js (JS/TS) | Rust |
| **Installer size** | ~140–200 MB | ~3–15 MB |
| **Idle RAM** | ~150–300 MB | ~20–70 MB |
| **Startup time** | Slower (Chromium boot) | Faster (OS WebView already loaded) |
| **Rendering consistency** | ✅ Identical across OSes | ⚠️ WebKit on macOS/Linux, WebView2 on Win |
| **Node.js ecosystem** | ✅ Full npm | ❌ Not available; use Rust crates |
| **Security model** | contextIsolation + sandbox | Capability permissions (v2) |
| **Mobile support** | ❌ | ✅ iOS & Android (Tauri v2) |
| **Learning curve** | Low (JS/TS devs) | Medium (requires Rust) |
| **Maturity** | Very high (10+ yrs) | Growing (released 2022) |
| **Notable users** | VS Code, Slack, Discord | 1Password (migration), Bitwarden |

**When to choose Electron:**
- Team is JS/TS-only with no Rust experience.
- Need pixel-perfect, consistent UI across all OSes.
- Leveraging a large Node.js/npm dependency tree.
- Shipping soon; need stable, well-documented APIs.

**When to choose Tauri:**
- Bundle size and memory footprint are critical (e.g., lightweight utilities).
- Need mobile + desktop from one codebase (Tauri v2).
- Security-sensitive app (smaller attack surface, Rust memory safety).
- Willing to invest in a Rust backend for long-term gains.`,
      tags: ["tauri", "comparison"],
    },
    {
      id: "multi-window-management",
      title: "Multi-window management",
      difficulty: "medium",
      question: "How do you manage multiple windows in Electron, including communication between them?",
      answer: `**Creating and tracking windows:**

\`\`\`ts
// main.ts
import { BrowserWindow, ipcMain } from "electron";

const windows = new Map<number, BrowserWindow>();

function createWindow(label: string, url: string): BrowserWindow {
  const win = new BrowserWindow({
    width: 800, height: 600,
    webPreferences: { preload: "...", contextIsolation: true },
  });
  win.loadURL(url);
  windows.set(win.id, win);
  win.on("closed", () => windows.delete(win.id));
  return win;
}

// Open a secondary window on demand
ipcMain.handle("open-settings", () => {
  const existing = [...windows.values()].find(
    w => w.webContents.getURL().includes("settings")
  );
  if (existing) { existing.focus(); return; }
  createWindow("settings", "app://./settings.html");
});
\`\`\`

**Broadcasting a message to ALL windows:**
\`\`\`ts
ipcMain.handle("broadcast", (_e, channel: string, payload: unknown) => {
  for (const win of windows.values()) {
    win.webContents.send(channel, payload);
  }
});
\`\`\`

**Targeted message (renderer A → renderer B via main):**
\`\`\`ts
ipcMain.on("send-to-window", (event, targetId: number, msg: unknown) => {
  const target = windows.get(targetId);
  target?.webContents.send("from-window", msg);
});
\`\`\`

**Modal / child windows:**
\`\`\`ts
const modal = new BrowserWindow({
  parent: mainWindow,
  modal: true,
  width: 400, height: 300,
  webPreferences: { preload: "..." },
});
modal.loadFile("modal.html");
\`\`\`

**Shared state** — keep all mutable state in the main process. Renderers request reads/writes via IPC. Avoid duplicating state in multiple renderers; they will drift.

> **Tip:** Assign a stable string \`label\` property or track by URL so you can prevent duplicate windows without maintaining extra maps.`,
      tags: ["windows", "architecture"],
    },
    {
      id: "deep-links",
      title: "Deep links / custom protocols",
      difficulty: "medium",
      question: "How do you register a custom URL protocol (deep link) in an Electron app?",
      answer: `Deep links let external apps or web browsers open your Electron app at a specific route: \`myapp://dashboard/42\`.

**Step 1 — Register the protocol at install time (OS-level):**
\`\`\`ts
// main.ts
if (process.defaultApp) {
  // Dev: register with the electron binary itself
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient("myapp", process.execPath, [
      path.resolve(process.argv[1]),
    ]);
  }
} else {
  // Production: register the packaged .exe / .app
  app.setAsDefaultProtocolClient("myapp");
}
\`\`\`

**Step 2 — Handle the URL (single-instance pattern):**
\`\`\`ts
const gotLock = app.requestSingleInstanceLock();

if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", (_e, argv) => {
    // Windows / Linux: URL is in argv
    const url = argv.find(a => a.startsWith("myapp://"));
    if (url) handleDeepLink(url);
    mainWindow?.focus();
  });

  // macOS: URL arrives via open-url event
  app.on("open-url", (event, url) => {
    event.preventDefault();
    handleDeepLink(url);
  });

  app.whenReady().then(createWindow);
}

function handleDeepLink(url: string) {
  const parsed = new URL(url); // e.g. myapp://dashboard/42
  mainWindow?.webContents.send("deep-link", parsed.pathname);
}
\`\`\`

**electron-builder** registration:
\`\`\`json
{
  "build": {
    "protocols": [{ "name": "My App", "schemes": ["myapp"] }]
  }
}
\`\`\`

> On macOS deep links only work with a signed, bundled app. During development use the \`process.defaultApp\` branch above to test.`,
      tags: ["distribution", "protocols"],
    },

    // ───── HARD ─────
    {
      id: "electron-security-hardening",
      title: "Security hardening checklist",
      difficulty: "hard",
      question: "What is the full security hardening checklist for a production Electron app, and how do you implement each item?",
      answer: `Electron's Chromium core expands the attack surface beyond a typical browser. The following checklist maps to the official Electron Security Recommendations (updated for v33).

**1. Disable nodeIntegration, enable contextIsolation (mandatory)**
\`\`\`ts
webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true }
\`\`\`

**2. Validate all IPC inputs in the main process**
\`\`\`ts
ipcMain.handle("write-file", (_e, p: unknown, data: unknown) => {
  if (typeof p !== "string" || !p.startsWith(app.getPath("userData")))
    throw new Error("path traversal blocked");
  if (typeof data !== "string") throw new Error("invalid data");
  return fs.writeFile(p, data, "utf-8");
});
\`\`\`

**3. Set a strict Content-Security-Policy**
\`\`\`ts
session.defaultSession.webRequest.onHeadersReceived((details, cb) => {
  cb({
    responseHeaders: {
      ...details.responseHeaders,
      "Content-Security-Policy": [
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'",
      ],
    },
  });
});
\`\`\`

**4. Use a custom protocol instead of loading remote URLs**
\`\`\`ts
protocol.handle("app", (req) => {
  const url = new URL(req.url);
  const filePath = path.join(__dirname, "dist", url.pathname);
  return net.fetch(pathToFileURL(filePath).toString());
});
win.loadURL("app://./index.html"); // no http:// remote content
\`\`\`

**5. Disable navigation to untrusted origins**
\`\`\`ts
app.on("web-contents-created", (_e, contents) => {
  contents.on("will-navigate", (event, url) => {
    if (!url.startsWith("app://")) event.preventDefault();
  });
  contents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url); // open in browser, not new Electron window
    return { action: "deny" };
  });
});
\`\`\`

**6. Enable process sandboxing (default since Electron 20)**
\`\`\`ts
app.enableSandbox(); // call before app.whenReady()
\`\`\`

**7. Sign & notarise on macOS; sign on Windows**
- macOS: \`hardened-runtime: true\`, Apple notarisation via \`@electron/notarize\`.
- Windows: Authenticode EV or OV certificate.

**8. Keep Electron (and Chromium) updated**
- Each Electron minor ships a new Chromium, patching CVEs. Pin to latest stable release line.

**9. Audit dependencies with \`npm audit\` + \`electronegativity\`**
\`\`\`bash
npx electronegativity -i dist/  # static analysis for Electron misconfigs
\`\`\`

**10. Never eval() remote strings**
\`\`\`ts
// ❌ Do not do this
win.webContents.executeJavaScript(remoteCode);
\`\`\``,
      tags: ["security"],
    },
    {
      id: "tauri-v2-changes",
      title: "Tauri v2 major changes",
      difficulty: "hard",
      question: "What are the most significant changes in Tauri v2 compared to v1, and how do they affect app architecture?",
      answer: `Tauri v2 (stable since October 2024) is a ground-up redesign of the permission system, plugin architecture, and platform support.

**1. Capability-based permission system (replaces allowlist)**

v1 used a flat allowlist in \`tauri.conf.json\`:
\`\`\`json
// v1 — deprecated
{ "tauri": { "allowlist": { "fs": { "readFile": true } } } }
\`\`\`

v2 uses granular capability files per window / context:
\`\`\`json
// src-tauri/capabilities/main-window.json
{
  "identifier": "main-window",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "fs:read-files",
    "fs:scope" // + scope array for path restrictions
  ]
}
\`\`\`

**2. Mobile targets (iOS & Android)**
\`\`\`bash
tauri android init && tauri android dev
tauri ios init     && tauri ios dev
\`\`\`
Commands, events, and plugins share the same API surface on mobile — no separate codebase.

**3. Plugin system overhaul**
First-party plugins are now separate crates (\`tauri-plugin-fs\`, \`tauri-plugin-http\`, \`tauri-plugin-notification\`), each with its own permissions. Third-party plugins follow the same interface.

\`\`\`toml
# Cargo.toml
[dependencies]
tauri-plugin-fs   = "2"
tauri-plugin-http = "2"
\`\`\`

\`\`\`rust
tauri::Builder::default()
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_http::init())
    .run(tauri::generate_context!())
    .unwrap();
\`\`\`

**4. Scoped filesystem access**
\`\`\`json
{ "permissions": ["fs:read-files"],
  "scope": { "allow": ["$APPDATA/**"] } }
\`\`\`

**5. invoke() now in \`@tauri-apps/api/core\`**
\`\`\`ts
// v1
import { invoke } from "@tauri-apps/api/tauri";
// v2
import { invoke } from "@tauri-apps/api/core";
\`\`\`

**Migration impact summary:**

| Area | v1 | v2 |
|---|---|---|
| Permissions | Flat allowlist | Capability JSON files |
| Plugins | Built-in features | Separate crates + JS packages |
| Mobile | No | iOS + Android |
| IPC API path | \`@tauri-apps/api/tauri\` | \`@tauri-apps/api/core\` |
| Window labeling | String IDs | Typed \`WebviewWindow\` |`,
      tags: ["tauri", "v2", "architecture"],
    },
    {
      id: "performance-memory-optimization",
      title: "Performance & memory optimization",
      difficulty: "hard",
      question: "What are the most impactful techniques for reducing memory usage and improving startup performance in Electron apps?",
      answer: `Electron apps can easily consume 500 MB+ without discipline. Here are the highest-leverage optimizations.

**Startup performance:**

| Technique | Impact |
|---|---|
| Enable \`asar\` archive | Faster file I/O on Windows |
| V8 snapshots via \`electron-link\` | Pre-compile app JS into a snapshot (can cut 300–500 ms) |
| Lazy-load heavy modules | Don't \`require\` at top-level in main — defer until needed |
| Background window preloading | Create hidden window early; show when ready |
| Use \`app.setAppLogsPath\` | Avoid blocking disk writes during startup |

**Code splitting for the renderer:**
\`\`\`ts
// vite.config.ts
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          charts: ["recharts"],
        },
      },
    },
  },
};
\`\`\`

**Memory — main process:**
\`\`\`ts
// Destroy windows when hidden rather than just hiding them
win.on("close", (e) => {
  e.preventDefault();
  win.destroy(); // frees Chromium renderer memory
  win = null;
});
// Re-create on next open
\`\`\`

**Memory — renderer process:**
- Remove event listeners on unmount (especially ipcRenderer listeners).
- Avoid storing large datasets in renderer state; keep in main + stream subsets.
- Use \`OffscreenCanvas\` / \`createImageBitmap\` in workers for image processing.

**Monitoring memory:**
\`\`\`ts
import { app } from "electron";

setInterval(() => {
  const metrics = app.getAppMetrics();
  for (const proc of metrics) {
    console.log(proc.type, proc.memory.workingSetSize / 1024, "MB");
  }
}, 30_000);
\`\`\`

**Process sandboxing saves memory:** With \`sandbox: true\`, renderer processes use the OS shared-memory Chromium sandbox which reduces per-process overhead.

**Baseline numbers after optimisation (typical dashboard app):**

| State | Before | After |
|---|---|---|
| Idle (1 window) | 280 MB | 130 MB |
| Startup time | 3.2 s | 1.1 s |
| Cold install size | 185 MB | 145 MB |`,
      tags: ["performance", "memory"],
    },
    {
      id: "code-signing-distribution",
      title: "Code signing & distribution",
      difficulty: "hard",
      question: "Explain the complete code-signing and notarisation workflow for distributing an Electron app on macOS and Windows.",
      answer: `Code signing is mandatory for smooth distribution — unsigned apps trigger OS warnings (Gatekeeper on macOS, SmartScreen on Windows) or are blocked outright.

**macOS — Full Signing + Notarisation Pipeline:**

\`\`\`bash
# 1. Build
npx electron-builder --mac

# 2. Sign is done automatically by electron-builder with:
# CSC_LINK=path/to/cert.p12  CSC_KEY_PASSWORD=...
# or via Keychain on CI

# 3. Notarise (electron-builder + @electron/notarize)
\`\`\`

\`\`\`ts
// forge.config.ts / afterSign hook (electron-builder)
import { notarize } from "@electron/notarize";

export async function afterSign(context: any) {
  if (context.electronPlatformName !== "darwin") return;
  await notarize({
    tool: "notarytool",   // xcrun notarytool (Apple Silicon + Intel)
    appPath: context.appOutDir + "/MyApp.app",
    appleId: process.env.APPLE_ID!,
    appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD!,
    teamId: process.env.APPLE_TEAM_ID!,
  });
}
\`\`\`

**electron-builder config for hardened runtime (required for notarisation):**
\`\`\`json
{
  "mac": {
    "hardenedRuntime": true,
    "gatekeeperAssess": false,
    "entitlements": "build/entitlements.mac.plist",
    "entitlementsInherit": "build/entitlements.mac.plist"
  }
}
\`\`\`

\`\`\`xml
<!-- build/entitlements.mac.plist -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "...">
<plist version="1.0"><dict>
  <key>com.apple.security.cs.allow-jit</key><true/>
  <key>com.apple.security.cs.allow-unsigned-executable-memory</key><true/>
</dict></plist>
\`\`\`

**Windows — Authenticode Signing:**

\`\`\`json
{
  "win": {
    "signingHashAlgorithms": ["sha256"],
    "certificateFile": "cert.pfx",
    "certificatePassword": "\${env.WIN_CSC_KEY_PASSWORD}"
  }
}
\`\`\`

Or use Azure Trusted Signing (replaces EV USB tokens):
\`\`\`bash
# CI: uses Azure identity, no physical token
npx electron-builder --win --config.win.azureSignOptions.endpoint=https://...
\`\`\`

**CI/CD — GitHub Actions example:**
\`\`\`yaml
- name: Build & Sign
  env:
    CSC_LINK: \${{ secrets.MAC_CERT_BASE64 }}
    CSC_KEY_PASSWORD: \${{ secrets.MAC_CERT_PASSWORD }}
    APPLE_ID: \${{ secrets.APPLE_ID }}
    APPLE_APP_SPECIFIC_PASSWORD: \${{ secrets.APPLE_ASP }}
    APPLE_TEAM_ID: \${{ secrets.APPLE_TEAM_ID }}
  run: npx electron-builder --mac --win --publish always
\`\`\`

> **Stapling:** After notarisation, staple the ticket so offline Gatekeeper checks work: \`xcrun stapler staple MyApp.app\``,
      tags: ["distribution", "security", "code-signing"],
    },
    {
      id: "crash-reporting",
      title: "Crash reporting",
      difficulty: "hard",
      question: "How do you implement crash reporting in Electron, covering both main-process and renderer crashes?",
      answer: `Crash reporting in Electron requires covering multiple failure modes: main process uncaught exceptions, renderer process crashes, and GPU process crashes.

**1. Built-in crashReporter (Breakpad/Crashpad minidumps):**
\`\`\`ts
// main.ts — call BEFORE app.whenReady()
import { crashReporter } from "electron";

crashReporter.start({
  productName: "MyApp",
  companyName: "MyOrg",
  submitURL: "https://crashes.example.com/upload",   // Sentry / Backtrace / custom
  uploadToServer: true,
  extra: { version: app.getVersion() },
});
\`\`\`
This catches **renderer and GPU process crashes** and uploads a \`.dmp\` minidump.

**2. Main process unhandled exceptions:**
\`\`\`ts
process.on("uncaughtException", (error) => {
  console.error("Uncaught:", error);
  // Log to file before process dies
  fs.appendFileSync(
    path.join(app.getPath("logs"), "crash.log"),
    \`\${new Date().toISOString()} \${error.stack}\\n\`
  );
  dialog.showErrorBox("Unexpected Error", error.message);
  app.quit();
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});
\`\`\`

**3. Renderer process crashes (from main):**
\`\`\`ts
app.on("web-contents-created", (_e, contents) => {
  contents.on("render-process-gone", (_e, details) => {
    console.error("Renderer crashed:", details.reason, details.exitCode);
    // Reload or show error UI
    if (details.reason !== "clean-exit") {
      contents.reload();
    }
  });

  contents.on("unresponsive", () => {
    const choice = dialog.showMessageBoxSync({
      type: "warning",
      buttons: ["Wait", "Kill"],
      message: "The page is unresponsive.",
    });
    if (choice === 1) contents.forcefullyCrashRenderer();
  });
});
\`\`\`

**4. Sentry integration (recommended for production):**
\`\`\`ts
// main.ts
import * as Sentry from "@sentry/electron/main";
Sentry.init({
  dsn: "https://xxx@sentry.io/yyy",
  release: app.getVersion(),
  environment: process.env.NODE_ENV,
});

// renderer entry point
import * as Sentry from "@sentry/electron/renderer";
import { init as reactInit } from "@sentry/react";
Sentry.init({ dsn: "..." }, reactInit);
\`\`\`

\`@sentry/electron\` automatically configures \`crashReporter\`, captures JS errors in both processes, and correlates them in the Sentry dashboard.

**5. Local crash log directory:**
\`\`\`ts
console.log(crashReporter.getCrashesDirectory());
// ~/Library/Application Support/MyApp/Crashpad/... (macOS)
\`\`\``,
      tags: ["reliability", "crash-reporting", "monitoring"],
    },
    {
      id: "electron-ipc-security-advanced",
      title: "IPC security & privilege escalation prevention",
      difficulty: "hard",
      question: "How do you prevent privilege escalation through IPC in Electron? What attack vectors exist and how are they mitigated?",
      answer: `IPC is the boundary between the untrusted web world and the privileged main process. Mistakes here are the most common source of critical Electron CVEs.

**Attack vector 1: Overly broad IPC handlers**
\`\`\`ts
// ❌ Allows renderer to run ANY shell command
ipcMain.handle("exec", (_e, cmd: string) => require("child_process").exec(cmd));

// ✅ Only whitelist specific operations
const ALLOWED_COMMANDS = new Set(["open-log-file", "clear-cache"]);
ipcMain.handle("run-action", (_e, action: unknown) => {
  if (typeof action !== "string" || !ALLOWED_COMMANDS.has(action))
    throw new Error("forbidden action");
  return performAction(action);
});
\`\`\`

**Attack vector 2: Path traversal via IPC**
\`\`\`ts
// ❌ Renderer controls arbitrary path
ipcMain.handle("read", (_e, p: string) => fs.readFile(p));

// ✅ Restrict to safe directories
ipcMain.handle("read-user-file", (_e, filename: unknown) => {
  if (typeof filename !== "string" || filename.includes("..") || filename.includes("/"))
    throw new Error("invalid filename");
  const safe = path.join(app.getPath("userData"), filename);
  return fs.readFile(safe, "utf-8");
});
\`\`\`

**Attack vector 3: Prototype pollution via IPC payloads**
\`\`\`ts
// IPC payloads are structured-cloned, but validate shapes:
import { z } from "zod";

const SaveSchema = z.object({ name: z.string().max(255), data: z.string() });

ipcMain.handle("save", (_e, raw: unknown) => {
  const { name, data } = SaveSchema.parse(raw); // throws on invalid
  return saveToFile(name, data);
});
\`\`\`

**Attack vector 4: Impersonation — verify sender origin**
\`\`\`ts
ipcMain.handle("sensitive-op", (event) => {
  const sender = event.senderFrame;
  // Reject if the frame is a cross-origin iframe
  if (sender.url !== "app://./index.html") {
    throw new Error("untrusted sender");
  }
  return performSensitiveOp();
});
\`\`\`

**Attack vector 5: Remote code execution via remote URLs**
\`\`\`ts
// ✅ Block navigation to any external URL
app.on("web-contents-created", (_e, wc) => {
  wc.on("will-navigate", (e, url) => {
    if (!url.startsWith("app://")) e.preventDefault();
  });
  wc.setWindowOpenHandler(() => ({ action: "deny" }));
});
\`\`\`

**Summary of defences:**

| Vector | Defence |
|---|---|
| Broad handlers | Whitelist operations, never pass commands |
| Path traversal | Canonicalize + restrict to safe dirs |
| Malformed payloads | Runtime schema validation (zod / joi) |
| Untrusted sender | Check \`event.senderFrame.url\` |
| Remote URL injection | Block navigation, deny new windows |
| Prototype pollution | Use \`Object.create(null)\` for accumulator objects |`,
      tags: ["security", "ipc", "advanced"],
    },
  ],
};
