import type { Category } from "./types";

export const realtime: Category = {
  slug: "realtime",
  title: "Realtime (WebSockets / SSE / WebRTC)",
  description:
    "Realtime web techniques: WebSocket protocol, Server-Sent Events, WebRTC peer connections, scaling, reconnection, presence, CRDTs, and managed realtime services.",
  icon: "📡",
  questions: [
    // ───── EASY ─────
    {
      id: "ws-vs-polling",
      title: "WebSocket vs HTTP polling",
      difficulty: "easy",
      question: "Why use WebSockets instead of HTTP polling or long-polling?",
      answer: `**Polling** = client repeatedly hits an endpoint asking "anything new?".
**Long-polling** = server holds the request open until data is ready, then responds; client immediately re-opens.
**WebSocket** = single long-lived, bidirectional TCP connection.

| Approach        | Latency    | Overhead per msg | Direction       | Server cost |
|-----------------|------------|------------------|-----------------|-------------|
| Short polling   | High (interval) | Full HTTP request + response | Client → Server pull | Wasted requests |
| Long polling    | Medium     | Full HTTP request | Pull, semi-push | Many open conns |
| **WebSocket**   | **Very low** | **2-14 byte frame** | **Bidirectional**  | Stateful conns |
| SSE             | Low        | Small text frame | Server → Client | Many open conns |

**Why WebSockets win for chat / collab / live dashboards:**
- **Push** — server sends without being asked.
- **Tiny frames** — no HTTP headers per message.
- **Bidirectional** — client and server both push.
- **Real-time** — sub-100ms updates feasible.

**Why polling still has a place:**
- **Stateless / scales horizontally** with no sticky sessions.
- **Works through every proxy** unmodified.
- **Cheap to implement** — just \`setInterval\` + fetch.
- Fine for "every 30s is OK" data (unread badge, currency rate).

> **Tip:** if you'd refresh more than once every ~10s, prefer SSE or WebSocket; if every minute is fine, polling is simpler.`,
      tags: ["fundamentals"],
    },
    {
      id: "ws-handshake",
      title: "WebSocket upgrade handshake",
      difficulty: "easy",
      question: "How does the WebSocket handshake actually work?",
      answer: `A WebSocket starts life as a regular **HTTP/1.1 GET with an Upgrade header**. The server responds **101 Switching Protocols**, then both sides speak the WebSocket framing protocol over the same TCP socket.

**Client request:**
\`\`\`http
GET /chat HTTP/1.1
Host: example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
Origin: https://example.com
\`\`\`

**Server response:**
\`\`\`http
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
\`\`\`

- \`Sec-WebSocket-Key\` is a random base64 nonce.
- \`Sec-WebSocket-Accept\` is **SHA-1(key + magic string) base64-encoded** — proves the server really speaks WebSocket (not just any 101).
- After 101, no more HTTP. Both sides exchange **frames** (opcode + payload, optionally masked).

**Subprotocols & extensions:**
- \`Sec-WebSocket-Protocol: graphql-ws, json\` — app-level protocol negotiation.
- \`Sec-WebSocket-Extensions: permessage-deflate\` — per-message compression.

**HTTP/2 / HTTP/3** use different mechanisms (RFC 8441 \`:protocol\` pseudo-header), but the model is the same: hijack a stream, switch to WebSocket framing.

> Because it starts as HTTP, WebSockets get through **most** firewalls / proxies — but transparent proxies that don't understand \`Upgrade\` will break it. \`wss://\` over 443 is the most reliable.`,
      tags: ["protocol"],
    },
    {
      id: "sse-basics",
      title: "Server-Sent Events (SSE)",
      difficulty: "easy",
      question: "What is SSE and when should you reach for it instead of WebSocket?",
      answer: `**Server-Sent Events** is a one-way, text-only push channel built on plain HTTP. The browser consumes it via the **\`EventSource\`** API.

**Server response:**
\`\`\`http
HTTP/1.1 200 OK
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive

data: {"type":"tick","price":42.10}

event: trade
id: 1234
data: {"id":1234,"qty":5}

retry: 5000
\`\`\`

**Client:**
\`\`\`js
const es = new EventSource("/api/stream");
es.onmessage = (e) => console.log(JSON.parse(e.data));
es.addEventListener("trade", (e) => handleTrade(JSON.parse(e.data)));
es.onerror = () => { /* browser auto-reconnects */ };
\`\`\`

**Why SSE rocks for one-way streams:**
- **Simpler than WebSocket** — it's just a long HTTP response.
- **Auto-reconnect** built into the browser, with \`Last-Event-ID\` resumption.
- **Works through most HTTP infra** unchanged (CDNs that don't buffer, proxies, load balancers).
- **Plays well with HTTP/2 / HTTP/3** multiplexing — many streams over one connection.

**Limitations:**
- **Server → client only.** Client uses regular fetch/POST for upstream messages.
- **UTF-8 text only** — binary needs base64 framing.
- **Connection limit** in HTTP/1.1 (~6 per origin per browser); HTTP/2 lifts this.
- **Custom headers** can't be set with \`EventSource\`; use a polyfill (\`@microsoft/fetch-event-source\`) for auth headers.

| Need                              | Pick           |
|-----------------------------------|----------------|
| Server → client only (feeds, logs, AI tokens) | **SSE**     |
| Bidirectional (chat, collab, games) | **WebSocket** |
| Audio / video / P2P data          | **WebRTC**     |

> OpenAI / Anthropic streaming APIs use SSE — that's why you see \`data:\` lines in the raw stream.`,
      tags: ["sse"],
    },
    {
      id: "ws-vs-sse",
      title: "WebSocket vs SSE",
      difficulty: "easy",
      question: "How do WebSockets and SSE compare?",
      answer: `| Feature                  | WebSocket                       | SSE (\`EventSource\`)              |
|--------------------------|---------------------------------|----------------------------------|
| Direction                | Bidirectional                   | Server → Client                  |
| Protocol                 | Custom framing over TCP (after HTTP upgrade) | Plain HTTP text stream |
| Payload                  | Text or binary                  | UTF-8 text only                  |
| Reconnection             | DIY (or via library)            | Built into browser               |
| Resume after drop        | DIY message replay              | \`Last-Event-ID\` header          |
| Browser API              | \`new WebSocket(url)\`           | \`new EventSource(url)\`          |
| Custom headers           | Subprotocols only               | Not in native \`EventSource\`     |
| Works through proxies    | Mostly (needs Upgrade support)  | Yes — pure HTTP                  |
| HTTP/2 / HTTP/3 friendly | Needs RFC 8441                  | Native (multiplexed streams)     |
| Server-side cost         | Stateful socket per client      | One open HTTP response per client |
| Authentication           | Cookie / token in URL / subprotocol | Cookie / fetch wrapper |

**Picking between them:**
- **Need to push only?** → SSE. Simpler, fewer footguns.
- **Need to send lots from client too?** → WebSocket.
- **Need binary (video chunks, protobuf)?** → WebSocket.
- **Mobile network with flaky proxies?** → SSE often more robust.
- **Tons of small messages each way (gaming, multiplayer)?** → WebSocket.

**Hybrid:** SSE for server pushes + regular HTTP POSTs for client commands is a popular, **stateless-friendly** combo (the client never needs sticky sessions for upstream).

> A well-designed app rarely "needs" full duplex; a lot of "use WebSocket" really should be **SSE + POST**.`,
      tags: ["comparison"],
    },
    {
      id: "browser-ws-api",
      title: "Browser WebSocket API basics",
      difficulty: "easy",
      question: "How do you use the native browser WebSocket API?",
      answer: `\`\`\`js
const ws = new WebSocket("wss://api.example.com/socket", ["json.v1"]);
ws.binaryType = "arraybuffer"; // or "blob"

ws.addEventListener("open", () => {
  ws.send(JSON.stringify({ type: "hello" }));
});

ws.addEventListener("message", (event) => {
  // event.data is string | ArrayBuffer | Blob
  const msg = JSON.parse(event.data);
  console.log(msg);
});

ws.addEventListener("close", (event) => {
  console.log("closed", event.code, event.reason, event.wasClean);
});

ws.addEventListener("error", () => {
  // Spec hides details for security; close event has the real info.
});

// Closing cleanly with an application code (4000-4999 reserved for app use)
ws.close(1000, "bye");
\`\`\`

**\`readyState\`:**

| Value | Constant       | Meaning              |
|-------|----------------|----------------------|
| 0     | \`CONNECTING\` | Handshake in flight  |
| 1     | \`OPEN\`       | Ready to send        |
| 2     | \`CLOSING\`    | Close handshake started |
| 3     | \`CLOSED\`     | Closed or failed     |

**Things people get wrong:**
- **Sending before \`open\`** throws. Queue messages, flush on \`open\`.
- **Treating \`error\` as informative** — it isn't. Always wire \`close\` for diagnostics.
- **Not handling backpressure** — \`ws.bufferedAmount\` shows queued bytes; pause sends if it grows.
- **Not setting \`binaryType\`** — defaults to \`Blob\`, which is awkward to parse synchronously.

**Close codes you should know:**
- \`1000\` — normal closure.
- \`1001\` — going away (page unload).
- \`1006\` — abnormal (no close frame received) — usually network drop.
- \`1011\` — server error.
- \`4000-4999\` — application-defined.`,
      tags: ["browser", "api"],
    },
    {
      id: "socket-io",
      title: "Socket.IO vs raw WebSocket",
      difficulty: "easy",
      question: "What does Socket.IO add on top of WebSockets?",
      answer: `**Socket.IO** is a higher-level library (Node server + client SDKs) that uses WebSocket as its main transport but adds an opinionated layer.

**Headline features:**
- **Auto-reconnect** with exponential backoff out of the box.
- **Rooms & namespaces** — group sockets, broadcast to subsets.
- **Acknowledgements** — request/response style on top of pub/sub.
- **Binary support** with automatic packing/unpacking.
- **Fallback to HTTP long-polling** when WebSocket is blocked (less critical in 2025; toggleable).
- **Adapters** — Redis adapter for multi-node broadcasting.

**Server:**
\`\`\`ts
import { Server } from "socket.io";
const io = new Server(httpServer);

io.on("connection", (socket) => {
  socket.join("room:42");
  socket.on("message", (msg, ack) => {
    io.to("room:42").emit("message", msg);
    ack?.("received"); // acknowledgement
  });
});
\`\`\`

**Client:**
\`\`\`js
import { io } from "socket.io-client";
const socket = io("https://example.com", { auth: { token } });

socket.emit("message", { text: "hi" }, (ack) => console.log(ack));
socket.on("message", (msg) => console.log(msg));
\`\`\`

**Trade-offs:**

| | Raw WebSocket             | Socket.IO                      |
|--|---------------------------|--------------------------------|
| Wire format | What you choose | Custom Socket.IO protocol       |
| Bundle size | ~0 (built in)   | ~25 KB client                  |
| Cross-platform | Anything WS-capable | Needs Socket.IO client      |
| Rooms / broadcast | DIY        | Built in + Redis adapter        |
| Reconnect | DIY              | Robust default                 |
| Acks      | DIY               | First-class                    |

**When to pick raw WebSocket:**
- Cross-language clients (Go, Swift, etc.) without Socket.IO ports.
- Strict bundle budget.
- Custom binary protocol (game netcode, MQTT-over-WS).

**When to pick Socket.IO:**
- Node backend, JS client, want batteries included.
- Need rooms / namespaces / acks without building them.

**Modern alternatives:** \`ws\` + a thin app layer; \`uWebSockets.js\`; \`Bun.serve({ websocket })\`; managed services like Ably / Pusher.`,
      tags: ["libraries"],
    },
    {
      id: "ws-frames",
      title: "WebSocket framing & message size",
      difficulty: "easy",
      question: "What does a WebSocket frame look like and what are the size limits?",
      answer: `Each WebSocket message is one or more **frames**. A frame is a tiny binary header plus payload.

**Frame header:**
- **FIN bit** — last frame of a logical message?
- **RSV1/2/3** — reserved (used by extensions like permessage-deflate).
- **Opcode (4 bits)** — \`0x1\` text, \`0x2\` binary, \`0x8\` close, \`0x9\` ping, \`0xA\` pong, \`0x0\` continuation.
- **Mask bit** — client→server frames **must** be masked; server→client must not be.
- **Payload length** — 7 bits, or 7+16, or 7+64.
- **Masking key** (4 bytes if masked).
- **Payload data**.

So overhead is **2-14 bytes** per frame.

**Fragmentation:**
A 5 MB message can be sent as multiple frames: \`text(FIN=0)\` → \`continuation(FIN=0)\` … → \`continuation(FIN=1)\`. Receivers reassemble.

**Size limits:**
- **Protocol-level:** payload length is a 64-bit integer, so technically up to **2⁶³ - 1 bytes** per message.
- **In practice** every server / library sets a cap to prevent OOM:
  - \`ws\`: \`maxPayload\` defaults to ~100 MB; lower it in production.
  - \`uWebSockets.js\`: configurable, often 16 KB to a few MB.
  - Socket.IO: \`maxHttpBufferSize\` default 1 MB.
  - Browsers don't have a documented per-message cap but watch \`bufferedAmount\`.

**Tips:**
- **Cap payloads** server-side and **drop / close** offenders with code \`1009\` ("Message too big").
- For files, prefer **HTTP upload** then notify over WS — don't push large blobs through one socket.
- Enable **\`permessage-deflate\`** for chatty text protocols, but watch CPU.

> Treat WS as a **message bus**, not a file pipe.`,
      tags: ["protocol"],
    },

    // ───── MEDIUM ─────
    {
      id: "ws-heartbeats",
      title: "Heartbeats & idle timeouts",
      difficulty: "medium",
      question: "Why do WebSocket connections need heartbeats?",
      answer: `TCP can keep a socket "open" indefinitely even when one side has dropped — half-open connections. Load balancers, NATs, and corporate proxies also **silently kill idle sockets** after 30-120s. Heartbeats detect this and keep the path warm.

**Two flavors:**

**1. Protocol-level ping/pong** (RFC 6455 opcodes \`0x9\` / \`0xA\`):
- Either side sends a ping; the other **must** reply with a matching pong.
- Browsers handle pongs automatically — you can't ping from JS.
- Servers like \`ws\` expose \`socket.ping()\` and a \`pong\` event.

\`\`\`ts
import { WebSocketServer } from "ws";
const wss = new WebSocketServer({ port: 8080 });

const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping(); // peer must pong
  });
}, 30_000);

wss.on("connection", (ws) => {
  ws.isAlive = true;
  ws.on("pong", () => { ws.isAlive = true; });
});
\`\`\`

**2. Application-level heartbeat** (e.g. JSON \`{type:"ping"}\`):
- Needed for browsers (no programmatic ping).
- Lets you piggyback timing/auth checks.

\`\`\`js
const HEARTBEAT_MS = 25_000;
let timer;
ws.addEventListener("open", () => {
  timer = setInterval(() => ws.send(JSON.stringify({ t: "ping" })), HEARTBEAT_MS);
});
ws.addEventListener("close", () => clearInterval(timer));
\`\`\`

**Choosing the interval:**
- **Slightly less than the smallest idle timeout** in your path.
- AWS ALB defaults to 60s; CloudFront 60s; many corporate proxies 30s.
- Common: **20-30s** heartbeat, **60s** "missed ping → kill" budget.

**Watch out for:**
- Heartbeats wake mobile radios → **battery drain**. Use longer intervals on background tabs / mobile.
- "Missed N pongs → reconnect" rule is more robust than "missed 1".
- Don't conflate **idle timeout** with **session expiry** (auth) — those need separate handling.`,
      tags: ["connection", "operations"],
    },
    {
      id: "ws-reconnect",
      title: "Reconnection & exponential backoff",
      difficulty: "medium",
      question: "How do you build a robust WebSocket reconnect strategy?",
      answer: `Networks drop. A real-world client must reconnect **without DDoS-ing the server** when it comes back, and must **resume state** correctly.

**Reconnect rules of thumb:**
1. **Exponential backoff with jitter** — don't reconnect in a tight loop.
2. **Cap the max delay** (e.g. 30s) so users get reconnected eventually.
3. **Reset the backoff** after a successful, *stable* connection (e.g. open for >10s).
4. **Stop retrying** on auth failures (4001/4401) — re-authenticate first.
5. **Stop retrying** on tab unload — set a flag in the close handler.
6. **Resume cleanly** — server should accept a "since cursor" so client doesn't miss messages.

\`\`\`ts
function connect(url: string) {
  let attempts = 0;
  let ws: WebSocket;

  const open = () => {
    ws = new WebSocket(url);
    ws.onopen = () => { attempts = 0; /* flush queue, hello, etc */ };
    ws.onclose = (e) => {
      if (e.code === 4401) return; // auth failed — bail
      const base = Math.min(30_000, 500 * 2 ** attempts++);
      const jitter = Math.random() * base; // "full jitter"
      setTimeout(open, jitter);
    };
  };

  open();
}
\`\`\`

**Backoff strategies (AWS style):**

| Strategy        | Delay = ?                   | Notes                       |
|-----------------|-----------------------------|-----------------------------|
| Exponential     | \`base * 2^n\`               | Synchronized retry storms   |
| Equal jitter    | \`(base * 2^n) / 2 + rand\`   | Some randomness             |
| **Full jitter** | \`rand(0, base * 2^n)\`       | Best for thundering herd    |

**Resuming state:**
- Server assigns a **session ID** + **last-message-id**.
- Client reconnects with \`?resume=session-123&since=987\`.
- Server **replays** missed messages from a buffer (Redis stream, in-memory ring).
- Bound the buffer (e.g. last 5 minutes); past that, force a full refetch.

**SSE comparison:** browser does most of this for you — \`retry:\` field + \`Last-Event-ID\` header. WebSocket leaves it to libraries (Socket.IO, Ably client) or you.

> **Tip:** disable reconnects in your test suite or you'll get phantom requests after teardown.`,
      tags: ["reliability", "patterns"],
    },
    {
      id: "ws-auth",
      title: "Authenticating WebSockets",
      difficulty: "medium",
      question: "How do you authenticate a WebSocket connection?",
      answer: `Browsers **don't let you set custom headers** on \`new WebSocket(...)\`. That single fact dictates the auth options.

**Option 1 — Cookie auth (recommended when same-origin):**
- Browser includes \`Cookie\` on the upgrade request automatically.
- Use \`HttpOnly; Secure; SameSite=Strict\` session cookies.
- Server validates in the upgrade handler.
- **Beware CSRF**: an attacker page could open a WebSocket to your origin, and cookies would be sent. Mitigate by **strict Origin checking** server-side (the WS analog of CSRF).

\`\`\`ts
wss.on("headers", (headers, req) => {
  if (req.headers.origin !== "https://app.example.com") req.destroy();
});
\`\`\`

**Option 2 — Token in URL query string:**
\`\`\`
wss://api.example.com/socket?token=eyJhbGc...
\`\`\`
- Easy, works everywhere.
- **Tokens leak into access logs and proxies.** Use a **short-lived, single-use ticket** issued by an HTTPS endpoint (not the long-lived JWT).

**Option 3 — Subprotocol header (smuggle a token):**
\`\`\`js
new WebSocket(url, ["json.v1", \`bearer.\${token}\`]);
\`\`\`
- The subprotocol is a request header, so no log leakage in URL.
- Server picks the \`bearer.*\` value and validates it.
- A working hack used by Kubernetes apiserver and others.

**Option 4 — Message-level auth after connect:**
\`\`\`
client → { "type": "auth", "token": "..." }
server → { "type": "ack" } | { "type": "error", "code": 4401 }
\`\`\`
- Keep the socket **unprivileged** until auth message received.
- Disconnect with \`4401\` on failure to trigger client re-auth flow.

**Token refresh while connected:**
- WS connections often outlive an access token (15-60 min).
- Periodically push a \`refresh\` message; client sends a new token; server rotates session.
- Or close cleanly with code \`4001\` and let the client reconnect with a new token.

**Authorization** (vs authentication) is per-message: check the user can join *this* room, see *that* user's data — not just "is logged in".`,
      tags: ["security", "auth"],
    },
    {
      id: "ws-scaling",
      title: "Scaling WebSockets across servers",
      difficulty: "medium",
      question: "How do you scale a WebSocket app across multiple servers?",
      answer: `A single Node process can hold **tens of thousands** of WebSocket connections (with care). Beyond that you need horizontal scaling — and that breaks naive in-memory broadcast.

**The core problem:**
- User A is connected to server-1. User B to server-2.
- B publishes a message to "room:42". Server-2 only knows about its own clients.
- Server-1 never delivers the message to A.

**Solution: a shared message bus.** Every server **subscribes** to events and **publishes** outgoing messages there.

| Bus              | Pros                          | Cons                       |
|------------------|-------------------------------|----------------------------|
| **Redis pub/sub** | Cheap, very common (Socket.IO Redis adapter) | At-most-once, no replay |
| **Redis Streams**| Durable, consumer groups      | Slightly more complex      |
| **NATS / NATS JetStream** | High throughput, subjects | Extra infra              |
| **Kafka**        | Massive scale, durable        | Heavy for chat use         |
| **Postgres LISTEN/NOTIFY** | Free if you have Postgres | Limited message size, no replay |

**Sticky sessions:**
- LBs hashing on connection (e.g. ALB target stickiness) keeps a client on one node, which is critical for **upgrade routing** but also for any per-connection state.
- Without sticky sessions, the upgrade can land on node A but the next reconnect on node B — fine if state is in Redis, painful otherwise.

**Presence (who's online?):**
- Each node writes \`presence:user:42 = node-1\` with TTL.
- TTL refreshed by heartbeat.
- On disconnect, key deleted.
- A separate "presence" Redis set per room: \`SADD room:42 user:42\`.

**Connection limits:**
- File descriptors (\`ulimit -n\`).
- Ephemeral ports outbound.
- Memory per connection (a few KB for \`ws\`, lower with \`uWebSockets.js\`).
- TLS handshake CPU — terminate TLS at the load balancer if possible.

**Architecture sketch:**
\`\`\`
Browser → ALB (sticky, TLS) → Node WS gateway (×N) → Redis pub/sub → Node WS gateway (×N) → Browser
                                               ↓
                                    App services / DB
\`\`\`

> Once you're past one box, **don't roll your own** unless you have to — Ably, Pusher, PartyKit, or Cloudflare Durable Objects exist for a reason.`,
      tags: ["scaling", "ops"],
    },
    {
      id: "ws-security",
      title: "WebSocket security",
      difficulty: "medium",
      question: "What are the main WebSocket security concerns?",
      answer: `WebSockets bypass several browser security expectations — they need explicit hardening.

**1. Use \`wss://\` always.**
- Plain \`ws://\` is unencrypted; on shared Wi-Fi anyone reads & rewrites traffic.
- TLS termination at the LB is fine, but the back-end must enforce it.

**2. Validate \`Origin\` server-side (CSRF analog).**
- Browsers **send** \`Origin\` on the upgrade but **don't enforce** the same-origin policy on WebSocket connections.
- Without an Origin check, any attacker page can open a socket to your API and exploit the user's cookie auth — "Cross-Site WebSocket Hijacking".

\`\`\`ts
const ALLOWED = new Set(["https://app.example.com"]);
const wss = new WebSocketServer({ noServer: true });

httpServer.on("upgrade", (req, socket, head) => {
  if (!ALLOWED.has(req.headers.origin ?? "")) {
    socket.write("HTTP/1.1 403 Forbidden\\r\\n\\r\\n");
    return socket.destroy();
  }
  wss.handleUpgrade(req, socket, head, (ws) => wss.emit("connection", ws, req));
});
\`\`\`

**3. Authenticate every message context, not just the connection.**
- Don't trust client-supplied \`userId\` / \`roomId\`. Re-derive from the auth token.
- Authorize **per action** (can this user post to this room?).

**4. Cap payload sizes & rate-limit.**
- A malicious client can flood you with tiny pings or huge payloads.
- Set \`maxPayload\` on the server.
- Token-bucket rate-limit per connection.
- Drop with code \`1008\` (policy violation) or \`1009\` (too big).

**5. Validate every inbound message.**
- Treat the socket like any other untrusted input. Use Zod / Valibot to parse.
- Reject malformed JSON early; never \`JSON.parse\` and trust the shape.

**6. Sanitize before broadcasting.**
- Anything you echo to other users is a **stored XSS vector** if rendered as HTML.

**7. Subprotocol pinning.**
- Pick \`Sec-WebSocket-Protocol\` server-side; reject unknown ones.

**8. Resource limits per user.**
- Max connections per IP / user.
- Max rooms per connection.
- Otherwise one bad actor exhausts memory.

**9. Audit \`permessage-deflate\`.**
- Compression bombs can amplify CPU usage. Bound the dictionary / window size.

**10. Logging & observability.**
- Log connect/disconnect with reason codes.
- Alert on spikes in \`1006\` (abnormal close) — usually indicates infra problems.`,
      tags: ["security"],
    },
    {
      id: "pubsub-presence",
      title: "Pub/sub, presence & typing indicators",
      difficulty: "medium",
      question: "How do you implement pub/sub, presence, and typing indicators in a realtime app?",
      answer: `These three patterns power most "live" UIs (chat, docs, dashboards).

**Pub/sub (rooms / channels):**
- Sockets join named rooms.
- Publishing to a room fans out to all sockets in it.
- Across multiple servers, fan-out goes through Redis pub/sub or similar.

\`\`\`ts
// Socket.IO
io.on("connection", (socket) => {
  socket.on("join", ({ room }) => socket.join(room));
  socket.on("send", ({ room, text }) =>
    io.to(room).emit("msg", { from: socket.data.userId, text })
  );
});
\`\`\`

**Presence:**
- "Who's currently in this room / online?"
- Stored in Redis: \`SADD presence:room:42 user:7\` on join, \`SREM\` on disconnect.
- TTL on a per-user heartbeat key prevents ghosts when sockets die ungracefully.
- On membership change, broadcast a \`presence\` event so other clients update their UI.

\`\`\`ts
async function join(room, userId) {
  await redis.sadd(\`room:\${room}\`, userId);
  await redis.set(\`alive:\${userId}\`, 1, "EX", 60);
  io.to(room).emit("presence", await redis.smembers(\`room:\${room}\`));
}
\`\`\`

**Typing indicators:**
- Cheap, ephemeral, **don't persist**.
- Client sends \`{type:"typing"}\` while user types, throttled to ~once per 2-3s.
- Server broadcasts to room (excluding sender).
- Each receiver shows "X is typing…" with a **client-side timeout** (e.g. 4s after last event) — no need for explicit "stopped typing" message.

\`\`\`ts
socket.on("typing", () => socket.to(room).emit("typing", { user: socket.data.userId }));
\`\`\`

**Other common ephemeral signals:**
- **Read receipts** — push when a user opens a message.
- **Cursor / selection** for collab editing.
- **Reactions** that animate then disappear.

**Design tips:**
- Separate **durable events** (messages stored in DB) from **ephemeral signals** (typing, cursors). Ephemeral never hits the DB.
- Throttle aggressive signals; coalesce per tick.
- Always namespace events to avoid collisions across features (\`chat:message\`, \`presence:join\`).

**Managed services that bake this in:** Ably, Pusher, PubNub, Liveblocks, PartyKit — all provide rooms / presence / broadcast as primitives.`,
      tags: ["patterns"],
    },
    {
      id: "rt-libraries",
      title: "Managed realtime services",
      difficulty: "medium",
      question: "When should you use Ably / Pusher / PubNub / Liveblocks / PartyKit instead of running your own?",
      answer: `Running WebSockets at scale is a real ops burden: connections, sticky sessions, fan-out across boxes, presence, geo-routing, mobile reconnection, etc. **Managed realtime services** sell that as a SaaS layer.

| Service       | Sweet spot                              |
|---------------|-----------------------------------------|
| **Pusher**    | Simple pub/sub channels for web/mobile  |
| **Ably**      | Production-grade pub/sub, presence, history, edge regions |
| **PubNub**    | Massive global pub/sub, IoT, mobile push |
| **Liveblocks**| Multiplayer collab primitives (presence, threads, comments, Yjs/CRDT integration) |
| **PartyKit**  | Stateful "party" servers built on Cloudflare Durable Objects — write code, not infra |
| **Supabase Realtime** | Postgres-driven realtime (CDC) bundled with the rest of Supabase |
| **Convex / Replicache** | Sync engines — realtime is a side effect of how the data layer works |

**What you usually get:**
- **Channels / rooms** with pub/sub.
- **Presence** APIs.
- **History / replay** so reconnecting clients catch up.
- **Push to mobile** (APNs / FCM bridges).
- **Geo-distributed PoPs** for low latency.
- **At-least-once / ordered delivery** options.
- **SDKs** for web, iOS, Android, Unity, etc.

**Pricing** is usually based on: peak concurrent connections, messages per month, data transfer.

**Decision matrix:**
- **Few hundred users, internal app** → DIY with \`ws\` + Redis is fine.
- **Public app, want to ship in a day, global users** → Pusher / Ably.
- **Multiplayer cursors, comments, Figma-style UI** → Liveblocks or PartyKit.
- **You already use Supabase** → Supabase Realtime.
- **Need Cloudflare-native, code-first** → PartyKit / Durable Objects.

**Lock-in considerations:**
- Channel/room semantics differ; abstract through your own facade if you might switch.
- History APIs vary in retention.
- Pricing model can spike with chatty apps.

> The honest take: **most teams should not run their own WebSocket fleet** unless realtime is core to the product or volumes are huge.`,
      tags: ["services"],
    },

    // ───── HARD ─────
    {
      id: "backpressure-ordering",
      title: "Backpressure & message ordering",
      difficulty: "hard",
      question: "How do you handle backpressure and message ordering in WebSockets?",
      answer: `**Backpressure** = sender producing faster than receiver / network can consume. Without handling it, memory explodes and the connection eventually dies.

**Where backpressure shows up:**

**Server → Client:**
- The server keeps calling \`socket.send(...)\` faster than the client TCP window can drain.
- In \`ws\`, queued bytes live in \`socket.bufferedAmount\` (browser) or you check via \`drain\` events (Node).
- Without limits, the server's RSS grows until OOM.

**Client → Server:**
- Tab generating events (e.g. cursor positions) faster than the link can carry.
- \`ws.bufferedAmount > THRESHOLD\` → drop / coalesce.

**Mitigations:**
- **Bound the queue** — drop oldest, drop newest, or close on overflow.
- **Coalesce / debounce** — for high-frequency events (typing, cursors), keep only the latest.
- **Sample** — every Nth tick, not every tick.
- **Slow-consumer disconnect** — close with \`1013\` ("Try again later") to force a clean reconnect.
- **\`uWebSockets.js\`** exposes \`getBufferedAmount\` and \`drain\` events for fine-grained control.

\`\`\`ts
const LIMIT = 1 << 20; // 1 MB queued
function safeSend(ws, msg) {
  if (ws.bufferedAmount > LIMIT) return false; // drop or coalesce
  ws.send(msg);
  return true;
}
\`\`\`

**Message ordering:**
- A single TCP connection guarantees **in-order delivery within that socket**.
- **Across reconnects** order is lost — you must replay from a cursor.
- **Across multiple sockets** to the same user (multi-tab) order is undefined — design messages so this is OK.
- **Across publishers** (multiple writers to one room) ordering is per-publisher only; don't assume global causal order without sequence numbers / vector clocks.

**Patterns for correctness:**
- Each message gets a **monotonic ID** from the server.
- Client tracks \`lastSeenId\`; on reconnect, asks for "everything > lastSeenId".
- **Idempotency keys** for client→server sends so retries don't double-create.
- For collab editing, lean on **CRDTs / OT** (next question) so message order doesn't have to be perfect.

> Realtime is full of small races. Designing **idempotent + replayable** messages is what separates "demo" from "production".`,
      tags: ["reliability", "concurrency"],
    },
    {
      id: "webrtc-overview",
      title: "WebRTC overview",
      difficulty: "hard",
      question: "What is WebRTC and what are its components?",
      answer: `**WebRTC** is a browser standard for **peer-to-peer** real-time audio, video, and arbitrary data — **without a media server in the middle** for 1:1 calls.

**Three APIs in the browser:**
- \`getUserMedia()\` — capture camera/mic.
- \`RTCPeerConnection\` — negotiate and send media + data.
- \`RTCDataChannel\` — bidirectional data, like WebSocket but P2P (and supports unreliable/unordered).

**Key components and acronyms:**

| Term     | Role                                                   |
|----------|--------------------------------------------------------|
| **Signaling** | Out-of-band channel to swap SDP offers/answers and ICE candidates. WebRTC doesn't define this — usually WebSocket. |
| **SDP**  | Session Description Protocol — text blob describing codecs, ports, IPs. |
| **ICE**  | Interactive Connectivity Establishment — finds the best route between peers. |
| **STUN** | Server that tells a peer "your public IP:port looks like X". Tiny, cheap. |
| **TURN** | Relay server used when direct/NAT-traversed connection is impossible (~10-15% of calls). Bandwidth-heavy. |
| **DTLS** | Datagram TLS — encrypts the connection. |
| **SRTP** | Secure Real-time Transport Protocol — actual media frames. |

**Connection flow (1:1):**
\`\`\`ts
const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });

pc.onicecandidate = (e) => signal.send({ candidate: e.candidate });
pc.ontrack = (e) => video.srcObject = e.streams[0];

const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
stream.getTracks().forEach(t => pc.addTrack(t, stream));

const offer = await pc.createOffer();
await pc.setLocalDescription(offer);
signal.send({ sdp: offer });
\`\`\`

**Data channel:**
\`\`\`ts
const dc = pc.createDataChannel("game", { ordered: false, maxRetransmits: 0 });
dc.onmessage = (e) => handle(e.data);
dc.send(JSON.stringify({ x, y }));
\`\`\`

**Beyond 1:1:**
- **Mesh** (each peer connects to every other) — fine up to ~4 participants.
- **SFU** (Selective Forwarding Unit) — server forwards each participant's stream to others without re-encoding. Standard for Zoom/Meet/Discord.
- **MCU** — server mixes streams into one (rare today; CPU heavy).

**TURN reality:** you **must** run TURN (\`coturn\`, Twilio Network Traversal, Cloudflare TURN) in production. STUN-only fails behind symmetric NATs and corporate firewalls.

**Use cases:** video calls, screen share, multiplayer game netcode (DataChannel), low-latency live streaming, file transfer.`,
      tags: ["webrtc"],
    },
    {
      id: "supabase-realtime",
      title: "Supabase Realtime & Postgres CDC",
      difficulty: "hard",
      question: "How does Supabase Realtime work and where does it shine?",
      answer: `Supabase Realtime is an Elixir/Phoenix server that exposes **Postgres changes** to web/mobile clients over a single WebSocket. It has three modes:

**1. Postgres Changes (CDC):**
- Reads the **logical replication stream** (WAL) of your Postgres DB.
- Translates inserts/updates/deletes into JSON events.
- Filters by table, schema, columns, and **Row Level Security** so each client only sees rows they're authorized for.

\`\`\`ts
supabase
  .channel("todos")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "todos", filter: \`user_id=eq.\${uid}\` },
    (payload) => updateCache(payload)
  )
  .subscribe();
\`\`\`

- **payload** has \`eventType\`, \`new\`, \`old\`, \`commit_timestamp\`.
- Combine with TanStack Query: write the change into the cache via \`setQueryData\`.

**2. Broadcast:**
- Plain pub/sub channel, **no DB involved** — messages don't get persisted.
- Use for cursors, typing indicators, presence-style ephemera.

**3. Presence:**
- Built-in presence map per channel, synced via Phoenix Presence (CRDT under the hood).
- Each client publishes its state; everyone sees a consistent room roster.

**Why it's interesting:**
- **One source of truth.** The DB is the realtime stream; you don't have to dual-write to a queue.
- **RLS for free.** Whatever you can express as a Postgres policy applies to realtime too.
- **One WebSocket** multiplexes many channels.

**Trade-offs / gotchas:**
- **WAL pressure.** High-write tables generate a lot of replication traffic; subscribers see all of it before filtering.
- **Filters happen server-side, but per-row** — many subscribers × many rows = work.
- **No history replay** — if a client misses messages while offline, you must refetch.
- **Schema migrations** can break consumers if you add NOT NULL columns the JSON payload doesn't expect.

**Similar systems:**
- **PowerSync**, **ElectricSQL** — Postgres → on-device sync engines (CRDT-based).
- **Convex / Replicache** — bespoke sync engines, not Postgres CDC.
- **Hasura subscriptions** — Postgres → GraphQL subscriptions (polling-under-the-hood historically; newer versions use logical replication).

> Supabase Realtime is brilliant when **your data shape matches the UI**. If you do heavy joins / aggregations to render a row, prefer regular queries with manual invalidation.`,
      tags: ["supabase", "cdc"],
    },
    {
      id: "http2-h3-streaming",
      title: "HTTP/2 push, HTTP/3 streaming",
      difficulty: "hard",
      question: "What about HTTP/2 server push and HTTP/3 streaming?",
      answer: `**HTTP/2 Server Push (deprecated):**
- Idea: when the server returns \`/index.html\`, also push \`/style.css\` and \`/app.js\` into the client cache before the browser asks.
- Reality: browsers couldn't tell what was already cached, so push wasted bandwidth more than it helped. Chrome **removed support in 2022**, others followed.
- Don't reach for it for app-realtime — it's gone, and it never targeted that use case anyway.

**HTTP/2 streaming (still fine):**
- A single response can be a long-lived stream. Trailers + chunked encoding work over HTTP/2 multiplexed streams.
- Multiple streams share **one TCP+TLS connection** — many SSE channels are cheap.
- Browsers limit "max concurrent streams" but it's far higher than HTTP/1.1's 6 connections per origin.

**HTTP/3 (QUIC):**
- Runs on **UDP**, not TCP. Built-in TLS 1.3, 0-RTT.
- **No head-of-line blocking across streams** — a packet drop on one stream doesn't stall others (TCP couldn't avoid this in HTTP/2).
- **Connection migration** — a client switching Wi-Fi → LTE keeps the same connection ID; no re-handshake.
- Very friendly for **streaming workloads** like SSE, AI token streams, live updates.

**WebTransport** (over HTTP/3):
- A newer browser API: bi-directional, multi-stream, **unreliable + reliable** datagrams over QUIC.
- Aims to be a "WebSocket++" with proper backpressure and multiple substreams.
- Browser support is still partial (Chromium-class only at the time of writing). Standardized but not ubiquitous.

\`\`\`js
const wt = new WebTransport("https://example.com/realtime");
await wt.ready;
const writer = wt.datagrams.writable.getWriter();
writer.write(new Uint8Array([1, 2, 3]));
\`\`\`

**fetch streams (\`ReadableStream\`):**
- \`fetch().body\` exposes a \`ReadableStream\` you can iterate.
- Used by AI SDKs (Anthropic / OpenAI) to consume SSE without \`EventSource\`.
- Gives you headers, abort, custom auth — none of which \`EventSource\` does.

**When does any of this matter?**
- HTTP/2/3 are mostly an **infra-level** win — your code rarely changes.
- Run **TLS + HTTP/2** at minimum; HTTP/3 if your CDN supports it (Cloudflare, Fastly, Vercel do).
- For very high realtime fan-out, **WebTransport** is the future to watch.`,
      tags: ["http", "future"],
    },
    {
      id: "collab-crdt-ot",
      title: "Realtime collaboration: CRDTs vs OT",
      difficulty: "hard",
      question: "How do CRDTs and OT power Google Docs / Figma-style collaboration?",
      answer: `Realtime collab editing has to merge concurrent edits from many users into a single, consistent document — without conflicts. Two main approaches:

**OT — Operational Transformation:**
- Each edit is an **operation** (insert "h" at index 4).
- When operations arrive out of order, they're **transformed** against each other so the result is the same on every client.
- Requires a **central server** to assign canonical order and run transforms.
- Used by **Google Docs**.
- Hard to get right: 30+ years of papers fixing edge cases.

**CRDT — Conflict-free Replicated Data Type:**
- Each edit carries enough metadata (unique IDs, vector clocks) that merges are **automatically conflict-free** regardless of order.
- **No central server required** — clients can sync peer-to-peer.
- More memory per edit, but algorithmically simpler.
- Used by **Figma** (custom CRDT), **Linear**, **Notion** (partly).

**Popular JS CRDT libraries:**

| Library      | Notes                                                 |
|--------------|-------------------------------------------------------|
| **Yjs**      | Compact, fast, huge ecosystem. Bindings for ProseMirror, TipTap, Monaco, CodeMirror, Quill. |
| **Automerge** | JSON-shaped CRDT, immutable API, more general-purpose. Great for offline-first apps. |
| **Loro**     | Newer Rust-based CRDT with rich text + time travel.    |

**Wiring a CRDT into your app:**
\`\`\`ts
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

const ydoc = new Y.Doc();
const provider = new WebsocketProvider("wss://collab.example.com", "doc:42", ydoc);
const ytext = ydoc.getText("body");

ytext.observe(() => editor.setContent(ytext.toString()));
editor.onChange((delta) => ytext.applyDelta(delta));
\`\`\`

- The **transport** (WebSocket / WebRTC) just shuffles binary updates.
- The **CRDT** does the merging on every peer.
- **Persistence**: a server saves snapshots periodically; clients hydrate from the latest snapshot + missed updates.

**Tooling around CRDTs:**
- **Liveblocks** wraps Yjs with rooms, presence, comments, and a hosted backend.
- **Tldraw**, **PartyKit**, **Hocuspocus** all build on Yjs.
- **Automerge Repo** provides storage adapters and sync.

**When NOT a CRDT:**
- If your model is **strongly consistent transactions** (e.g. inventory, money), not free-form merging — use a normal DB with optimistic concurrency.
- CRDTs add ~30% overhead per edit; small price for collab, big for high-volume telemetry.

> If your spec includes "two users typing in the same paragraph at once", grab Yjs and a host like Liveblocks/PartyKit — don't write your own.`,
      tags: ["collaboration", "crdt"],
    },
    {
      id: "ws-react-query",
      title: "Integrating WebSockets with React Query / SWR",
      difficulty: "hard",
      question: "What's the recommended pattern for combining WebSockets with TanStack Query or SWR?",
      answer: `Server-state libraries (TanStack Query, SWR) are **pull-based** — they fetch and cache on demand. WebSockets are **push-based**. The clean pattern is to keep the cache as the source of truth and let the socket **mutate** it.

**Two main strategies:**

**1. Push invalidates, then refetch:**
- WebSocket message arrives → call \`queryClient.invalidateQueries(...)\`.
- TanStack Query refetches the affected query.
- Trade-off: simple, but every push triggers an HTTP round-trip.

\`\`\`ts
useEffect(() => {
  const ws = new WebSocket(url);
  ws.onmessage = (e) => {
    const evt = JSON.parse(e.data);
    if (evt.type === "todo:changed") {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    }
  };
  return () => ws.close();
}, []);
\`\`\`

**2. Push patches the cache directly:**
- WS payload contains the new/changed data.
- Use \`setQueryData\` to merge it into the cache — no refetch needed.
- More work to write, much less network.

\`\`\`ts
ws.onmessage = (e) => {
  const evt = JSON.parse(e.data);
  if (evt.type === "todo:created") {
    queryClient.setQueryData(["todos"], (old = []) => [...old, evt.todo]);
  }
  if (evt.type === "todo:updated") {
    queryClient.setQueryData(["todos"], (old = []) =>
      old.map((t) => (t.id === evt.todo.id ? evt.todo : t))
    );
  }
};
\`\`\`

**Pattern: a single subscription per query family.**
- Don't open a socket per component — components mount/unmount, sockets shouldn't.
- Open one socket at app root (or per feature), route messages by type, update relevant cache entries.

**Coordinating with optimistic updates:**
- WebSocket echo can race with optimistic UI ("user sent message; same message arrives back over WS").
- Tag mutations with a client ID; ignore your own echoes when patching the cache.

**Resuming after disconnect:**
- On reconnect, **invalidate everything that could have changed** so caches re-sync from the server.
- Or have the server send a "since-cursor" replay of missed events.

**SWR equivalent:**
\`\`\`ts
import { mutate } from "swr";
ws.onmessage = (e) => {
  const evt = JSON.parse(e.data);
  if (evt.type === "todo:updated") {
    mutate("/api/todos", (old = []) => old.map(t => t.id === evt.todo.id ? evt.todo : t), false);
  }
};
\`\`\`

**Higher-level options:**
- **\`@trpc/react-query\` subscriptions** — typed WS subscriptions that flow into the same cache.
- **Apollo / urql** — first-class GraphQL subscriptions update the normalized cache automatically.
- **Liveblocks**, **Replicache**, **Convex** — sync engines where realtime + cache are the same thing.

> Rule of thumb: **server-state lib owns the cache, the socket just feeds it**. Don't keep a parallel store of "live data" in Redux next to TanStack Query.`,
      tags: ["react-query", "patterns"],
    },
  ],
};
