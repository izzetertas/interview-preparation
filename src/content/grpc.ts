import type { Category } from "./types";

export const grpc: Category = {
  slug: "grpc",
  title: "gRPC & Protobuf",
  description:
    "gRPC fundamentals: Protocol Buffers (proto3), service definitions, the four communication patterns, code generation with buf, Node.js clients and servers, gRPC-Web, metadata, error codes, interceptors, deadlines, health checking, load balancing, NestJS integration, Connect protocol, and comparisons with REST, GraphQL, and tRPC.",
  icon: "⚡",
  questions: [
    // ───── EASY ─────
    {
      id: "what-is-grpc",
      title: "What is gRPC?",
      difficulty: "easy",
      question: "What is gRPC and what problems does it solve compared to plain REST?",
      answer: `**gRPC** (Google Remote Procedure Call) is an open-source RPC framework that uses **HTTP/2** as its transport and **Protocol Buffers** (protobuf) as its interface definition language and default serialization format. Google open-sourced it in 2016.

**Core idea:** you define services and messages in a \`.proto\` file; \`protoc\` or \`buf\` generate type-safe client and server stubs in any supported language.

\`\`\`proto
// hello.proto
syntax = "proto3";

service Greeter {
  rpc SayHello (HelloRequest) returns (HelloReply);
}

message HelloRequest { string name = 1; }
message HelloReply   { string message = 1; }
\`\`\`

**Problems gRPC solves vs REST:**

| Problem | REST | gRPC |
|---------|------|------|
| Serialization efficiency | JSON (text, verbose) | Protobuf (binary, ~3-10× smaller) |
| Type safety | Optional (OpenAPI/Zod) | Enforced by generated code |
| Multiplexing | HTTP/1.1 (usually one req at a time per connection) | HTTP/2 multiplexed streams |
| Streaming | Workarounds (SSE, long-poll) | First-class 4 patterns |
| Contracts | OpenAPI (optional, often drift) | \`.proto\` is the single source of truth |
| Codegen | Optional | Built-in, multi-language |

**Where REST still wins:** browser-native fetch, human-readable payloads, CDN caching, simple CRUD with no streaming needs.

> gRPC excels in **microservice-to-microservice** communication where latency, throughput, and strict contracts matter.`,
      tags: ["fundamentals"],
    },
    {
      id: "what-is-protobuf",
      title: "What are Protocol Buffers?",
      difficulty: "easy",
      question: "What are Protocol Buffers (protobuf) and what is proto3 syntax?",
      answer: `**Protocol Buffers** (protobuf) is Google's language-neutral, platform-neutral, extensible mechanism for serializing structured data. It is both a **wire format** (binary encoding) and an **IDL** (Interface Definition Language).

**proto3 is the current version** — simpler than proto2 (no required fields, no default values in the schema).

### Scalar types

| proto3 type | Go | TypeScript (via buf/protoc) |
|-------------|----|-----------------------------|
| \`double\` | \`float64\` | \`number\` |
| \`float\` | \`float32\` | \`number\` |
| \`int32\` | \`int32\` | \`number\` |
| \`int64\` | \`int64\` | \`bigint\` or \`string\` |
| \`bool\` | \`bool\` | \`boolean\` |
| \`string\` | \`string\` | \`string\` |
| \`bytes\` | \`[]byte\` | \`Uint8Array\` |

### Message and field syntax

\`\`\`proto
syntax = "proto3";

package example.v1;

// Field numbers (1-15 use 1 byte; 16-2047 use 2 bytes)
message User {
  string  id        = 1;
  string  email     = 2;
  int32   age       = 3;
  repeated string tags = 4;  // repeated = list/array
  UserRole role     = 5;
}

enum UserRole {
  USER_ROLE_UNSPECIFIED = 0;  // proto3 requires 0 as first value
  USER_ROLE_ADMIN       = 1;
  USER_ROLE_MEMBER      = 2;
}
\`\`\`

**Key rules:**
- Field numbers are **permanent** — never reuse a deleted field number (use \`reserved\` instead).
- Default values: \`0\` for numerics, \`""\` for strings, \`false\` for bool.
- \`repeated\` replaces arrays; \`map<K, V>\` for dictionaries.`,
      tags: ["protobuf", "proto3"],
    },
    {
      id: "proto-nested-oneof",
      title: "Nested messages, oneof, and map",
      difficulty: "easy",
      question: "How do you model nested types, oneof (union), and maps in proto3?",
      answer: `### Nested messages

\`\`\`proto
message Order {
  string id = 1;
  Address shipping_address = 2;  // nested message reference

  message Address {              // can also define inline
    string street = 1;
    string city   = 2;
    string zip    = 3;
  }
}
\`\`\`

### oneof — discriminated union

Only **one field in a oneof** is set at a time. Setting another clears the previous.

\`\`\`proto
message SearchResult {
  string query = 1;

  oneof result {
    Product product = 2;
    Article article = 3;
    ErrorDetail error = 4;
  }
}
\`\`\`

Generated TypeScript (buf + @bufbuild/protobuf):
\`\`\`ts
// result.case is "product" | "article" | "error" | undefined
if (r.result.case === "product") {
  console.log(r.result.value.name);
}
\`\`\`

### map fields

\`\`\`proto
message Config {
  map<string, string> labels = 1;  // like Record<string, string>
  map<string, int32>  scores = 2;
}
\`\`\`

**Restrictions:** map keys can be any integer or string type; values can be any type except another map.

### reserved fields

\`\`\`proto
message LegacyUser {
  reserved 3, 5 to 7;           // reserved field numbers
  reserved "old_field", "temp"; // reserved field names
}
\`\`\`
Always reserve deleted field numbers/names to prevent accidental reuse.`,
      tags: ["protobuf", "proto3"],
    },
    {
      id: "service-definition",
      title: "Defining a gRPC service in .proto",
      difficulty: "easy",
      question: "How do you define a gRPC service in a .proto file, and what are the four RPC patterns?",
      answer: `A **service** block in proto3 defines the RPC methods. Each method maps to one of the four communication patterns determined by whether the request/response is a single message or a **stream**.

\`\`\`proto
syntax = "proto3";
package chat.v1;

service ChatService {
  // 1. Unary — one request, one response
  rpc GetMessage (GetMessageRequest) returns (Message);

  // 2. Server streaming — one request, stream of responses
  rpc ListMessages (ListMessagesRequest) returns (stream Message);

  // 3. Client streaming — stream of requests, one response
  rpc SendMessages (stream SendMessageRequest) returns (SendSummary);

  // 4. Bidirectional streaming — stream in both directions
  rpc Chat (stream ChatMessage) returns (stream ChatMessage);
}
\`\`\`

| Pattern | Request | Response | Use cases |
|---------|---------|----------|-----------|
| **Unary** | Single | Single | Standard CRUD, auth |
| **Server streaming** | Single | Many | Live feeds, log tailing, search results |
| **Client streaming** | Many | Single | File upload, batch ingestion |
| **Bidirectional** | Many | Many | Chat, collaborative editing, real-time games |

> The \`stream\` keyword before the type name makes it a streaming side. Both sides can be independently streaming.`,
      tags: ["service-definition", "streaming"],
    },
    {
      id: "grpc-vs-rest-vs-graphql",
      title: "gRPC vs REST vs GraphQL",
      difficulty: "easy",
      question: "When would you choose gRPC over REST or GraphQL?",
      answer: `| Dimension | REST | GraphQL | gRPC |
|-----------|------|---------|------|
| **Protocol** | HTTP/1.1 or 2 | HTTP/1.1 or 2 | HTTP/2 |
| **Payload** | JSON (text) | JSON (text) | Protobuf (binary) |
| **Contract** | OpenAPI (optional) | Schema (SDL) | .proto (enforced) |
| **Type safety** | Optional | Strong | Enforced by codegen |
| **Streaming** | SSE / WebSocket | Subscriptions | Native (4 patterns) |
| **Browser** | Native | Native | Needs gRPC-Web proxy |
| **Caching** | HTTP cache (GET) | Persisted queries | No HTTP-level caching |
| **Versioning** | URL versioning common | Schema evolution | Field-number based |
| **Codegen** | Optional (openapi-ts) | graphql-codegen | Required (protoc/buf) |

**Choose gRPC when:**
- Service-to-service communication (microservices, internal APIs).
- You need low latency and high throughput (binary protocol, HTTP/2 multiplexing).
- Streaming is a first-class requirement.
- You want rigidly enforced contracts across multiple languages.

**Choose REST when:**
- Public API consumed by browsers directly.
- You need HTTP caching at the CDN layer.
- Simple resource-oriented CRUD; team is unfamiliar with protobuf.

**Choose GraphQL when:**
- Clients have highly variable data requirements (mobile vs web).
- You want to aggregate multiple backend services behind one flexible endpoint.
- Rapid product iteration where client requirements change often.`,
      tags: ["fundamentals", "comparison"],
    },
    {
      id: "grpc-status-codes",
      title: "gRPC status codes",
      difficulty: "easy",
      question: "What are the standard gRPC status codes and how do they map to HTTP status codes?",
      answer: `gRPC defines **17 canonical status codes** in the \`google.rpc.Code\` enum (also available as \`@grpc/grpc-js\` \`status\` enum).

| Code | Number | Closest HTTP | Meaning |
|------|--------|--------------|---------|
| \`OK\` | 0 | 200 | Success |
| \`CANCELLED\` | 1 | 499 | Caller cancelled the request |
| \`UNKNOWN\` | 2 | 500 | Unknown error |
| \`INVALID_ARGUMENT\` | 3 | 400 | Bad input from client |
| \`DEADLINE_EXCEEDED\` | 4 | 504 | Deadline passed before completion |
| \`NOT_FOUND\` | 5 | 404 | Resource not found |
| \`ALREADY_EXISTS\` | 6 | 409 | Resource already exists |
| \`PERMISSION_DENIED\` | 7 | 403 | Not authorized |
| \`RESOURCE_EXHAUSTED\` | 8 | 429 | Rate limited / quota exceeded |
| \`FAILED_PRECONDITION\` | 9 | 400 | System not in required state |
| \`ABORTED\` | 10 | 409 | Concurrency conflict |
| \`OUT_OF_RANGE\` | 11 | 400 | Value out of valid range |
| \`UNIMPLEMENTED\` | 12 | 501 | Method not implemented |
| \`INTERNAL\` | 13 | 500 | Internal server error |
| \`UNAVAILABLE\` | 14 | 503 | Service down, retry later |
| \`DATA_LOSS\` | 15 | 500 | Unrecoverable data loss |
| \`UNAUTHENTICATED\` | 16 | 401 | Missing or invalid credentials |

\`\`\`ts
import { ServerUnaryCall, sendUnaryData, status } from "@grpc/grpc-js";

function getUser(call: ServerUnaryCall<GetUserRequest, User>, cb: sendUnaryData<User>) {
  const user = db.find(call.request.id);
  if (!user) {
    return cb({ code: status.NOT_FOUND, message: "User not found" });
  }
  cb(null, user);
}
\`\`\`

> Prefer specific codes over \`UNKNOWN\` — they let clients make smarter retry decisions.`,
      tags: ["error-handling", "status-codes"],
    },
    {
      id: "grpc-metadata",
      title: "Metadata and headers in gRPC",
      difficulty: "easy",
      question: "What is gRPC metadata and how does it relate to HTTP headers?",
      answer: `**Metadata** in gRPC is a list of key-value pairs sent alongside an RPC, analogous to HTTP headers. It is used for cross-cutting concerns that are not part of the business payload: authentication tokens, tracing IDs, locale, rate-limit info, etc.

**Two types:**
- **Initial metadata** — sent before the first message (like request/response headers).
- **Trailing metadata** — sent after the last message, only from server (like HTTP trailers).

### Sending metadata from a Node.js client

\`\`\`ts
import { Metadata } from "@grpc/grpc-js";

const meta = new Metadata();
meta.add("authorization", "Bearer eyJhbGc...");
meta.add("x-request-id", crypto.randomUUID());

client.getUser({ id: "123" }, meta, (err, user) => {
  console.log(user);
});
\`\`\`

### Reading metadata on the server

\`\`\`ts
function getUser(call: ServerUnaryCall<GetUserRequest, User>, cb: sendUnaryData<User>) {
  const token = call.metadata.get("authorization")[0];
  // validate token...
}
\`\`\`

### Binary metadata

Keys ending in \`-bin\` are treated as base64-encoded binary:

\`\`\`ts
meta.add("trace-bin", Buffer.from([0x01, 0x02]));
\`\`\`

> Metadata keys are **case-insensitive** and follow the same naming rules as HTTP/2 header names (lowercase, no underscores in standard gRPC).`,
      tags: ["metadata", "headers"],
    },
    // ───── MEDIUM ─────
    {
      id: "buf-toolchain",
      title: "buf toolchain and code generation",
      difficulty: "medium",
      question: "What is buf and how does it replace protoc for modern gRPC development?",
      answer: `**buf** is the standard toolchain for Protocol Buffers in 2026. It replaces raw \`protoc\` with a more ergonomic, reproducible, and lint-aware workflow.

### Why buf over protoc?

| Feature | protoc | buf |
|---------|--------|-----|
| Plugin management | Manual, error-prone | Declared in \`buf.gen.yaml\` |
| Linting | None built-in | \`buf lint\` (configurable rule sets) |
| Breaking change detection | None | \`buf breaking\` |
| Schema registry | None | Buf Schema Registry (BSR) |
| Reproducibility | Path-dependent | Lockfile (\`buf.lock\`) |

### Project layout

\`\`\`
proto/
  buf.yaml          # module config + lint rules
  buf.gen.yaml      # codegen config
  buf.lock          # dependency lockfile
  example/v1/
    user.proto
\`\`\`

### buf.yaml

\`\`\`yaml
version: v2
lint:
  use:
    - STANDARD
breaking:
  use:
    - FILE
deps:
  - buf.build/googleapis/googleapis
\`\`\`

### buf.gen.yaml (TypeScript with Connect)

\`\`\`yaml
version: v2
plugins:
  - remote: buf.build/bufbuild/es
    out: src/gen
    opt: target=ts
  - remote: buf.build/connectrpc/es
    out: src/gen
    opt: target=ts
\`\`\`

### Common commands

\`\`\`bash
buf lint                       # lint all .proto files
buf breaking --against .git#branch=main  # detect breaking changes
buf generate                   # run code generation
buf push                       # push module to BSR
\`\`\`

> \`buf generate\` is idempotent and can be run in CI to ensure generated code is always in sync with \`.proto\` files.`,
      tags: ["tooling", "buf", "codegen"],
    },
    {
      id: "grpc-nodejs-server",
      title: "gRPC server in Node.js",
      difficulty: "medium",
      question: "How do you build a gRPC server in Node.js using @grpc/grpc-js?",
      answer: `**@grpc/grpc-js** is the official pure-JavaScript gRPC library for Node.js (no native bindings required since v1.x).

### 1. Install dependencies

\`\`\`bash
npm install @grpc/grpc-js @grpc/proto-loader
\`\`\`

### 2. Proto file

\`\`\`proto
syntax = "proto3";
package user.v1;

service UserService {
  rpc GetUser (GetUserRequest) returns (User);
}
message GetUserRequest { string id = 1; }
message User { string id = 1; string name = 2; string email = 3; }
\`\`\`

### 3. Server implementation

\`\`\`ts
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";

const PROTO_PATH = path.join(__dirname, "user.proto");

const packageDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: false,       // convert snake_case → camelCase
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const proto = grpc.loadPackageDefinition(packageDef) as any;

function getUser(
  call: grpc.ServerUnaryCall<{ id: string }, unknown>,
  cb: grpc.sendUnaryData<unknown>
) {
  const { id } = call.request;
  if (id !== "1") {
    return cb({ code: grpc.status.NOT_FOUND, message: "User not found" });
  }
  cb(null, { id: "1", name: "Ada Lovelace", email: "ada@example.com" });
}

const server = new grpc.Server();
server.addService(proto.user.v1.UserService.service, { getUser });

server.bindAsync(
  "0.0.0.0:50051",
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) throw err;
    console.log(\`gRPC server listening on port \${port}\`);
  }
);
\`\`\`

> For production, use \`ServerCredentials.createSsl()\` with TLS certificates instead of \`createInsecure()\`.`,
      tags: ["nodejs", "grpc-js", "server"],
    },
    {
      id: "grpc-nodejs-client",
      title: "gRPC client in Node.js",
      difficulty: "medium",
      question: "How do you build a gRPC client in Node.js and call unary and streaming RPCs?",
      answer: `### Unary call

\`\`\`ts
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";

const packageDef = protoLoader.loadSync("user.proto", { keepCase: false, defaults: true });
const proto = grpc.loadPackageDefinition(packageDef) as any;

const client = new proto.user.v1.UserService(
  "localhost:50051",
  grpc.credentials.createInsecure()
);

// Callback style
client.getUser({ id: "1" }, (err: grpc.ServiceError | null, user: any) => {
  if (err) console.error(err);
  else console.log(user);
});

// Promise wrapper (util.promisify works for unary calls)
import { promisify } from "util";
const getUser = promisify(client.getUser.bind(client));
const user = await getUser({ id: "1" });
\`\`\`

### Server-streaming call

\`\`\`ts
const stream = client.listMessages({ userId: "1" });

stream.on("data", (msg: any) => console.log("Received:", msg));
stream.on("end",  ()         => console.log("Stream ended"));
stream.on("error",(err: any) => console.error("Stream error:", err));
\`\`\`

### Client-streaming call

\`\`\`ts
const stream = client.sendMessages((err: any, summary: any) => {
  if (!err) console.log("Summary:", summary);
});

for (const msg of messages) {
  stream.write(msg);
}
stream.end();
\`\`\`

### Bidirectional streaming

\`\`\`ts
const stream = client.chat();
stream.on("data", (msg: any) => console.log("Server:", msg.text));
stream.write({ text: "Hello!" });
stream.write({ text: "How are you?" });
stream.end();
\`\`\`

> Prefer the **Connect protocol** with \`@connectrpc/connect-node\` for new projects — it generates typed clients and works over both HTTP/1.1 and HTTP/2 without \`proto-loader\`.`,
      tags: ["nodejs", "grpc-js", "client", "streaming"],
    },
    {
      id: "grpc-web",
      title: "gRPC-Web and browser limitations",
      difficulty: "medium",
      question: "Why can't browsers use gRPC directly, and what is gRPC-Web?",
      answer: `**Browsers cannot use gRPC natively** because:
1. The Fetch/XHR API does not expose HTTP/2 framing — you cannot send raw HTTP/2 frames or read HTTP trailers (where gRPC sends status codes and trailing metadata).
2. Browsers do not support HTTP/2 server push in the way gRPC requires.
3. The \`grpc-status\` trailer is inaccessible via standard browser APIs.

### gRPC-Web

gRPC-Web is a spec that wraps gRPC messages so they can travel over standard HTTP/1.1 or HTTP/2 without trailers. It requires a **proxy** (Envoy, grpc-web-proxy, or Nginx) on the server side.

\`\`\`
Browser ──(HTTP/1.1 + gRPC-Web encoding)──> Envoy proxy ──(HTTP/2 gRPC)──> gRPC Server
\`\`\`

**Limitations of gRPC-Web:**
- Only **unary** and **server streaming** are supported — client streaming and bidirectional streaming are **not** supported in gRPC-Web 1.x.
- Requires a proxy — added infrastructure complexity.

### Envoy gRPC-Web filter (envoy.yaml snippet)

\`\`\`yaml
http_filters:
  - name: envoy.filters.http.grpc_web
    typed_config:
      "@type": type.googleapis.com/envoy.extensions.filters.http.grpc_web.v3.GrpcWeb
  - name: envoy.filters.http.router
\`\`\`

### Better alternative: Connect protocol

The **Connect protocol** (by Buf) is HTTP/1.1 and HTTP/2 compatible and works natively in browsers **without a proxy**, supporting all four streaming patterns over HTTP/2:

\`\`\`ts
import { createClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import { UserService } from "./gen/user_connect";

const transport = createConnectTransport({ baseUrl: "https://api.example.com" });
const client = createClient(UserService, transport);

const user = await client.getUser({ id: "1" });
\`\`\`

> In 2026, **Connect** is the recommended approach for browser-side gRPC consumption.`,
      tags: ["grpc-web", "browser", "connect"],
    },
    {
      id: "grpc-interceptors",
      title: "Interceptors in gRPC",
      difficulty: "medium",
      question: "What are gRPC interceptors and how do you implement logging and auth interceptors?",
      answer: `Interceptors are middleware for gRPC — they wrap RPC calls (client-side) or handler invocations (server-side) to add cross-cutting behavior: logging, auth, tracing, retries, metrics.

### Client-side interceptor (@grpc/grpc-js)

\`\`\`ts
import * as grpc from "@grpc/grpc-js";

const loggingInterceptor: grpc.Interceptor = (options, nextCall) => {
  const start = Date.now();
  return new grpc.InterceptingCall(nextCall(options), {
    start(metadata, listener, next) {
      // Add auth header to every call
      metadata.add("authorization", \`Bearer \${getToken()}\`);
      next(metadata, {
        onReceiveMessage(msg, nextMsg) { nextMsg(msg); },
        onReceiveStatus(status, nextStatus) {
          const ms = Date.now() - start;
          console.log(\`[\${options.method_definition.path}] \${status.code} \${ms}ms\`);
          nextStatus(status);
        },
      });
    },
  });
};

const client = new proto.UserService("localhost:50051",
  grpc.credentials.createInsecure(),
  { interceptors: [loggingInterceptor] }
);
\`\`\`

### Server-side interceptor

\`\`\`ts
const authInterceptor: grpc.ServerInterceptor = (methodDescriptor, call) => {
  return new grpc.ServerInterceptingCall(call, {
    start(next) {
      const meta = call.metadata.get("authorization");
      if (!meta.length || !isValidToken(String(meta[0]))) {
        call.sendStatus({ code: grpc.status.UNAUTHENTICATED, details: "Invalid token" });
        return; // do not call next()
      }
      next();
    },
  });
};

const server = new grpc.Server({ interceptors: [authInterceptor] });
\`\`\`

### Connect middleware (simpler API)

\`\`\`ts
import { ConnectRouter } from "@connectrpc/connect";
import type { Interceptor } from "@connectrpc/connect";

const authMiddleware: Interceptor = (next) => async (req) => {
  const token = req.header.get("authorization");
  if (!token) throw new ConnectError("Unauthenticated", Code.Unauthenticated);
  return next(req);
};
\`\`\`

> Chain multiple interceptors — they compose like Express middleware (first in, last out).`,
      tags: ["interceptors", "middleware", "auth"],
    },
    {
      id: "deadlines-cancellation",
      title: "Deadlines and cancellation",
      difficulty: "medium",
      question: "How do deadlines and cancellation work in gRPC?",
      answer: `### Deadlines

A **deadline** is an absolute timestamp by which an RPC must complete. If the server has not responded by then, the client receives \`DEADLINE_EXCEEDED\` and the server receives a cancellation signal.

\`\`\`ts
import * as grpc from "@grpc/grpc-js";

// Set a 2-second deadline
const deadline = new Date(Date.now() + 2000);

client.getUser({ id: "1" }, { deadline }, (err, user) => {
  if (err?.code === grpc.status.DEADLINE_EXCEEDED) {
    console.error("Request timed out");
  }
});
\`\`\`

Deadlines **propagate** through the call chain — when service A calls service B with a 5-second deadline, service B should forward the remaining deadline (not a new fixed one).

### Cancellation

A client can cancel an ongoing RPC (especially useful for streaming):

\`\`\`ts
const call = client.listMessages({ userId: "1" });

call.on("data", (msg) => {
  if (shouldStop) {
    call.cancel(); // sends CANCELLED to server
  }
  process(msg);
});

call.on("error", (err) => {
  if (err.code === grpc.status.CANCELLED) {
    console.log("Cancelled by client");
  }
});
\`\`\`

### Server: checking cancellation

\`\`\`ts
function listMessages(call: grpc.ServerWritableStream<ListRequest, Message>) {
  for (const msg of db.getMessages()) {
    if (call.cancelled) {
      console.log("Client cancelled, stopping work");
      return;
    }
    call.write(msg);
  }
  call.end();
}
\`\`\`

**Best practices:**
- Always set deadlines on the client — never let a call wait indefinitely.
- Use per-call deadlines derived from a request-scoped context (similar to Go's \`context.Context\`).
- Check \`call.cancelled\` in tight server loops to avoid wasted work.`,
      tags: ["deadlines", "cancellation", "reliability"],
    },
    {
      id: "grpc-nestjs",
      title: "gRPC in NestJS",
      difficulty: "medium",
      question: "How do you integrate gRPC into a NestJS application as both a server and a client?",
      answer: `NestJS has a built-in **gRPC microservice transport** via \`@nestjs/microservices\`.

### Install

\`\`\`bash
npm install @nestjs/microservices @grpc/grpc-js @grpc/proto-loader
\`\`\`

### Bootstrap as gRPC server (main.ts)

\`\`\`ts
import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { join } from "path";

const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.GRPC,
  options: {
    package: "user.v1",
    protoPath: join(__dirname, "proto/user.proto"),
    url: "0.0.0.0:50051",
  },
});
await app.listen();
\`\`\`

### Implement the service (user.controller.ts)

\`\`\`ts
import { Controller } from "@nestjs/common";
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable, Subject } from "rxjs";

@Controller()
export class UserController {
  @GrpcMethod("UserService", "GetUser")
  getUser(data: { id: string }): { id: string; name: string } {
    return { id: data.id, name: "Ada Lovelace" };
  }

  @GrpcStreamMethod("UserService", "Chat")
  chat(messages$: Observable<ChatMessage>): Observable<ChatMessage> {
    const subject = new Subject<ChatMessage>();
    messages$.subscribe({
      next: (msg) => subject.next({ text: \`Echo: \${msg.text}\` }),
      error: (e)  => subject.error(e),
      complete: () => subject.complete(),
    });
    return subject.asObservable();
  }
}
\`\`\`

### Call another gRPC service as a client

\`\`\`ts
import { Inject, OnModuleInit } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";

@Injectable()
export class UserService implements OnModuleInit {
  private userClient: any;

  constructor(@Inject("USER_PACKAGE") private grpc: ClientGrpc) {}

  onModuleInit() {
    this.userClient = this.grpc.getService("UserService");
  }

  getUser(id: string): Observable<User> {
    return this.userClient.getUser({ id });
  }
}
\`\`\`

Register in a module:
\`\`\`ts
ClientsModule.register([{
  name: "USER_PACKAGE",
  transport: Transport.GRPC,
  options: { package: "user.v1", protoPath: "proto/user.proto", url: "localhost:50051" },
}])
\`\`\``,
      tags: ["nestjs", "microservices"],
    },
    {
      id: "grpc-health-checking",
      title: "gRPC health checking protocol",
      difficulty: "medium",
      question: "What is the gRPC Health Checking Protocol and how do you implement it?",
      answer: `The **gRPC Health Checking Protocol** is a standard (defined in \`grpc/health/v1/health.proto\`) that exposes a \`Check\` RPC so load balancers and orchestrators (Kubernetes, Envoy) can probe service health.

\`\`\`proto
// google/grpc/health/v1/health.proto (standard)
service Health {
  rpc Check (HealthCheckRequest) returns (HealthCheckResponse);
  rpc Watch (HealthCheckRequest) returns (stream HealthCheckResponse);
}

enum ServingStatus {
  UNKNOWN = 0;
  SERVING = 1;
  NOT_SERVING = 2;
  SERVICE_UNKNOWN = 3;
}
\`\`\`

### Node.js implementation with @grpc/grpc-js

\`\`\`ts
import { HealthImplementation } from "grpc-health-check";
// npm install grpc-health-check

const healthImpl = new HealthImplementation({
  "": "SERVING",            // overall health
  "user.v1.UserService": "SERVING",
});

server.addService(healthImpl.service, healthImpl);

// Later, mark a service unhealthy:
healthImpl.setStatus("user.v1.UserService", "NOT_SERVING");
\`\`\`

### Kubernetes probe using grpc_health_probe

\`\`\`yaml
livenessProbe:
  grpc:
    port: 50051
  initialDelaySeconds: 10
  periodSeconds: 15
readinessProbe:
  grpc:
    port: 50051
\`\`\`

Kubernetes 1.24+ supports native gRPC probes; older versions need the \`grpc_health_probe\` binary.

### Watch (streaming health)

\`Watch\` streams \`HealthCheckResponse\` whenever the status changes — useful for client-side load balancer integration.

> Always implement the health protocol in production gRPC services — Kubernetes, Istio, and Envoy all rely on it for traffic routing.`,
      tags: ["health-check", "kubernetes", "reliability"],
    },
    // ───── HARD ─────
    {
      id: "connect-protocol",
      title: "Connect protocol vs gRPC",
      difficulty: "hard",
      question: "What is the Connect protocol (Buf Connect) and how does it differ from standard gRPC?",
      answer: `The **Connect protocol** is an RPC protocol developed by Buf that is designed to be simpler than gRPC while remaining wire-compatible with standard gRPC servers. It is the recommended approach for new TypeScript/JavaScript projects in 2026.

### How it differs from gRPC

| | gRPC | Connect |
|--|------|---------|
| Transport | HTTP/2 only | HTTP/1.1 **and** HTTP/2 |
| Browser support | Requires gRPC-Web proxy | **Native**, no proxy |
| Payload (default) | Protobuf binary | Protobuf binary **or** JSON |
| Unary HTTP method | POST | POST |
| Unary content-type | \`application/grpc\` | \`application/connect+proto\` or \`application/json\` |
| Trailers | HTTP/2 trailers | Inline in body (for HTTP/1.1 compat) |
| Error format | gRPC status trailer | JSON error body (curl-friendly) |

### Wire compatibility

A Connect server speaks **three protocols** simultaneously:
- **Connect protocol** — for Connect clients.
- **gRPC protocol** — for standard gRPC clients.
- **gRPC-Web protocol** — for gRPC-Web clients.

No proxy needed.

### Node.js Connect server (with Express adapter)

\`\`\`ts
import { ConnectRouter } from "@connectrpc/connect";
import { expressConnectMiddleware } from "@connectrpc/connect-express";
import express from "express";
import { UserService } from "./gen/user_connect";

function routes(router: ConnectRouter) {
  router.service(UserService, {
    async getUser(req) {
      return { id: req.id, name: "Ada Lovelace" };
    },
    async *listUsers(_req) {
      for (const user of await db.getAllUsers()) {
        yield user;
      }
    },
  });
}

const app = express();
app.use(expressConnectMiddleware({ routes }));
app.listen(8080);
\`\`\`

### Browser client (no proxy!)

\`\`\`ts
import { createClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import { UserService } from "./gen/user_connect";

const client = createClient(UserService, createConnectTransport({
  baseUrl: "https://api.example.com",
}));

// Fully typed, no codegen ceremony
const user = await client.getUser({ id: "1" });

// Server streaming works natively in the browser
for await (const u of client.listUsers({})) {
  console.log(u.name);
}
\`\`\`

> Connect is wire-compatible with gRPC, so you can use a Connect server from any standard gRPC client (Go, Java, Python) — and vice versa.`,
      tags: ["connect", "buf", "browser"],
    },
    {
      id: "grpc-load-balancing",
      title: "gRPC load balancing",
      difficulty: "hard",
      question: "How does load balancing work in gRPC and what are the client-side vs proxy-side approaches?",
      answer: `gRPC load balancing is more nuanced than HTTP/1.1 because a single HTTP/2 connection can carry many streams — a layer-4 (TCP) load balancer will pin all traffic to one backend.

### The problem

\`\`\`
Client ──(one HTTP/2 connection with many streams)──> LB (L4) ──> Backend 1 (all traffic)
                                                                 > Backend 2 (idle)
\`\`\`

An L4 load balancer sees one TCP connection and routes it to one upstream for its lifetime.

### Solution 1: L7 proxy (Envoy / Istio)

The proxy terminates HTTP/2 and creates a new connection per upstream, enabling **per-RPC** load balancing:

\`\`\`yaml
# Envoy cluster config
load_assignment:
  cluster_name: user_service
  endpoints:
    - lb_endpoints:
        - endpoint: { address: { socket_address: { address: user-svc-1, port_value: 50051 } } }
        - endpoint: { address: { socket_address: { address: user-svc-2, port_value: 50051 } } }
load_balancing_policy:
  policies:
    - typed_extension_config:
        name: envoy.load_balancing_policies.round_robin
\`\`\`

### Solution 2: Client-side load balancing

The client resolves multiple addresses and maintains a pool of connections:

\`\`\`ts
import * as grpc from "@grpc/grpc-js";

const client = new proto.UserService(
  "dns:///user-service:50051",  // DNS resolver returns multiple IPs
  grpc.credentials.createInsecure(),
  {
    "grpc.service_config": JSON.stringify({
      loadBalancingConfig: [{ round_robin: {} }],
    }),
  }
);
\`\`\`

Supported resolvers in \`@grpc/grpc-js\`:
- \`dns:\` — resolves A/AAAA records, picks from all IPs.
- \`xds:\` — connects to an xDS control plane (Envoy/Traffic Director).

### Solution 3: Look-aside (xDS / gRPC service mesh)

gRPC supports the **xDS protocol** natively — the client connects to a control plane (e.g., Istio Pilot) that pushes endpoint lists, load balancing config, circuit breaker settings, etc.:

\`\`\`ts
const client = new proto.UserService(
  "xds:///user-service",
  grpc.credentials.createInsecure()
);
\`\`\`

### Recommendation

| Setup | Best for |
|-------|----------|
| Envoy/Istio sidecar | Kubernetes microservices (zero client changes) |
| Client-side LB with DNS | Simple deployments without a service mesh |
| xDS native | Large clusters, advanced traffic management |`,
      tags: ["load-balancing", "envoy", "kubernetes", "reliability"],
    },
    {
      id: "grpc-reflection",
      title: "gRPC server reflection",
      difficulty: "hard",
      question: "What is gRPC server reflection and how is it used with tools like grpcurl?",
      answer: `**gRPC Server Reflection** is a standard protocol (\`grpc.reflection.v1.ServerReflection\`) that allows clients to query a running gRPC server for its service definitions **without needing the .proto files out-of-band**. This enables interactive tooling like \`grpcurl\` and \`grpc-client-cli\`.

### Enable reflection in Node.js

\`\`\`bash
npm install grpc-reflection-js
\`\`\`

\`\`\`ts
import { ReflectionService } from "grpc-reflection-js";
import * as protoLoader from "@grpc/proto-loader";

const packageDef = protoLoader.loadSync(["user.proto", "health.proto"], {
  includeDirs: ["proto"],
});

const reflection = new ReflectionService(packageDef);
reflection.addToServer(server);
\`\`\`

### Using grpcurl (CLI)

\`\`\`bash
# List all services
grpcurl -plaintext localhost:50051 list

# Describe a service
grpcurl -plaintext localhost:50051 describe user.v1.UserService

# Call a method
grpcurl -plaintext -d '{"id": "1"}' localhost:50051 user.v1.UserService/GetUser

# Call with metadata
grpcurl -plaintext -H 'authorization: Bearer token123' \
  -d '{"id": "1"}' localhost:50051 user.v1.UserService/GetUser
\`\`\`

### Using Postman / Kreya / BloomRPC

All major gRPC GUI clients can auto-discover services via reflection — point them at \`localhost:50051\` and they list all RPCs with their request/response schemas.

### buf curl (buf CLI)

\`\`\`bash
# buf curl uses BSR schemas even without server reflection
buf curl --schema buf.build/acme/petapis \
  --data '{"pet_id": "1"}' \
  https://api.example.com/acme.petstore.v1.PetService/GetPet
\`\`\`

**Security note:** Disable reflection in production if you do not want to expose your API surface. Enable it only in dev/staging or behind authentication.`,
      tags: ["reflection", "tooling", "devex"],
    },
    {
      id: "grpc-vs-trpc",
      title: "gRPC vs tRPC",
      difficulty: "hard",
      question: "How does gRPC compare to tRPC, and when would you choose one over the other?",
      answer: `Both gRPC and tRPC provide **end-to-end type safety** for RPC-style APIs, but they target different ecosystems and have fundamentally different designs.

### Comparison

| Dimension | gRPC | tRPC |
|-----------|------|------|
| **Schema language** | Proto3 (language-neutral IDL) | TypeScript types (inferred) |
| **Languages** | Any (multi-language codegen) | **TypeScript only** |
| **Wire format** | Protobuf binary | JSON (over HTTP) |
| **Browser** | Needs Connect or gRPC-Web proxy | Native (standard fetch) |
| **Streaming** | 4 native patterns | Subscriptions (WebSocket/SSE) |
| **Codegen** | Required (buf/protoc) | **None** — types inferred from router |
| **Versioning** | Field-number based, explicit | TypeScript structural compatibility |
| **Ecosystem** | Multi-language microservices | Full-stack TypeScript monorepos |
| **Runtime overhead** | Low (binary, HTTP/2) | Low (JSON is small for simple data) |
| **Learning curve** | Moderate (proto3, buf, codegen) | Very low (just TypeScript) |

### tRPC example

\`\`\`ts
// server (trpc router)
const router = t.router({
  getUser: t.procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return db.users.findById(input.id); // return type inferred
    }),
});

export type AppRouter = typeof router;

// client (fully typed, no codegen)
const user = await trpc.getUser.query({ id: "1" });
//    ^? { id: string; name: string; email: string }
\`\`\`

### When to choose gRPC

- **Polyglot services** — Go backend, Python ML service, Node.js gateway.
- **High-throughput inter-service** communication where binary protocol matters.
- **Streaming** (bidirectional, client streaming) is a hard requirement.
- Teams comfortable with proto3 and buf toolchain.
- You need a formal, versioned contract enforced at the schema level.

### When to choose tRPC

- **Full-stack TypeScript** monorepo (Next.js + NestJS / Fastify).
- You want **zero ceremony** — no IDL, no codegen step, instant type safety.
- Browser is a first-class client and you want to avoid proxy infrastructure.
- Rapid iteration — tRPC types update automatically when the server function changes.

### Can you use both?

Yes — a common pattern is tRPC for the **browser-to-BFF** layer (zero-ceremony, excellent DX) and gRPC for **BFF-to-microservice** communication (performance, polyglot, contracts).`,
      tags: ["trpc", "comparison", "typescript"],
    },
    {
      id: "grpc-advanced-error-handling",
      title: "Rich error details with google.rpc.Status",
      difficulty: "hard",
      question: "How do you send structured error details (google.rpc.Status) in gRPC beyond simple status codes?",
      answer: `The basic \`{ code, message }\` error is often insufficient. The **google.rpc.Status** proto allows attaching **structured error details** — validation errors, retry info, resource names — that clients can programmatically inspect.

### Proto types (from googleapis)

\`\`\`proto
// google/rpc/error_details.proto
message ErrorInfo {
  string reason   = 1;
  string domain   = 2;
  map<string, string> metadata = 3;
}

message BadRequest {
  message FieldViolation {
    string field       = 1;
    string description = 2;
  }
  repeated FieldViolation field_violations = 1;
}

message RetryInfo {
  google.protobuf.Duration retry_delay = 1;
}
\`\`\`

### Sending rich errors (Node.js with @grpc/grpc-js)

\`\`\`ts
import { status, Metadata } from "@grpc/grpc-js";
import { Status } from "@bufbuild/protobuf/wkt";
import { BadRequest, ErrorInfo } from "@buf/googleapis_googleapis.bufbuild_es/google/rpc/error_details_pb";

function createUser(call: any, cb: any) {
  const badRequest = new BadRequest({
    fieldViolations: [
      { field: "email", description: "must be a valid email address" },
      { field: "age",   description: "must be >= 18" },
    ],
  });

  const grpcStatus = new Status({
    code: status.INVALID_ARGUMENT,
    message: "Validation failed",
    details: [{ pack(badRequest) }],
  });

  const trailingMeta = new Metadata();
  // Encode Status proto in "grpc-status-details-bin" trailer
  trailingMeta.set("grpc-status-details-bin",
    Buffer.from(grpcStatus.toBinary()).toString("base64"));

  cb({
    code: status.INVALID_ARGUMENT,
    message: "Validation failed",
    metadata: trailingMeta,
  });
}
\`\`\`

### Reading rich errors on the client

\`\`\`ts
import { ConnectError, Code } from "@connectrpc/connect";
import { BadRequest } from "@buf/googleapis_googleapis.bufbuild_es/google/rpc/error_details_pb";

try {
  await client.createUser({ email: "bad", age: 15 });
} catch (err) {
  if (err instanceof ConnectError) {
    const br = err.findDetails(BadRequest)[0];
    if (br) {
      for (const v of br.fieldViolations) {
        console.error(\`\${v.field}: \${v.description}\`);
      }
    }
  }
}
\`\`\`

> Connect automatically parses \`grpc-status-details-bin\` — no manual base64 decoding needed. With raw \`@grpc/grpc-js\` you must parse the trailer yourself.

**Common detail types:**
- \`BadRequest\` — field-level validation errors.
- \`RetryInfo\` — when to retry.
- \`QuotaFailure\` — which quota was exceeded.
- \`ResourceInfo\` — what resource was not found.
- \`ErrorInfo\` — machine-readable reason code + domain.`,
      tags: ["error-handling", "google-rpc", "rich-errors"],
    },
    {
      id: "grpc-tls-auth",
      title: "TLS, mTLS, and authentication in gRPC",
      difficulty: "hard",
      question: "How does TLS and mutual TLS (mTLS) work in gRPC, and what are the authentication patterns?",
      answer: `gRPC rides on HTTP/2, which is almost always TLS-encrypted in production. Authentication sits **above** transport security in the metadata layer.

### TLS (one-way)

\`\`\`ts
import * as grpc from "@grpc/grpc-js";
import * as fs from "fs";

// Server
const serverCreds = grpc.ServerCredentials.createSsl(
  fs.readFileSync("ca.crt"),   // CA cert (to verify client if mTLS)
  [{ cert_chain: fs.readFileSync("server.crt"),
     private_key: fs.readFileSync("server.key") }],
  false  // checkClientCertificate — false = TLS, true = mTLS
);
server.bindAsync("0.0.0.0:50051", serverCreds, () => {});

// Client
const clientCreds = grpc.credentials.createSsl(
  fs.readFileSync("ca.crt")   // trust the server's CA
);
const client = new proto.UserService("api.example.com:50051", clientCreds);
\`\`\`

### mTLS (mutual TLS) — both sides authenticate

\`\`\`ts
// Server: set checkClientCertificate = true
const serverCreds = grpc.ServerCredentials.createSsl(
  fs.readFileSync("ca.crt"),
  [{ cert_chain: fs.readFileSync("server.crt"),
     private_key: fs.readFileSync("server.key") }],
  true  // require client cert
);

// Client: provide its own cert
const clientCreds = grpc.credentials.createSsl(
  fs.readFileSync("ca.crt"),
  fs.readFileSync("client.key"),
  fs.readFileSync("client.crt")
);
\`\`\`

### Authentication patterns

| Pattern | How | When |
|---------|-----|------|
| **mTLS** | Cert exchange at TLS handshake | Service-to-service (zero-trust networks) |
| **JWT Bearer** | \`authorization\` metadata header | User-facing APIs, standard OAuth2 flows |
| **API Key** | Custom metadata header | Simple M2M, dev environments |
| **ALTS** | Google's Application Layer Transport Security | GCP internal services |

### Combining TLS + JWT

\`\`\`ts
// Compose credentials: TLS + per-call token
const callCreds = grpc.credentials.createFromMetadataGenerator((_params, cb) => {
  const meta = new grpc.Metadata();
  meta.add("authorization", \`Bearer \${getJwt()}\`);
  cb(null, meta);
});

const combinedCreds = grpc.credentials.combineChannelCredentials(
  grpc.credentials.createSsl(fs.readFileSync("ca.crt")),
  callCreds
);

const client = new proto.UserService("api.example.com:50051", combinedCreds);
\`\`\`

> In Kubernetes with Istio/Linkerd, **mTLS is automatic** between sidecars — you often don't need to manage certs yourself in-app.`,
      tags: ["security", "tls", "mtls", "auth"],
    },
    {
      id: "protobuf-backward-compatibility",
      title: "Protobuf backward and forward compatibility",
      difficulty: "hard",
      question: "What are the rules for evolving a proto schema without breaking existing clients?",
      answer: `One of protobuf's core strengths is **schema evolution** — old clients can talk to new servers and vice versa, provided you follow the rules. \`buf breaking\` enforces these automatically in CI.

### Safe changes (backward AND forward compatible)

| Change | Safe? | Notes |
|--------|-------|-------|
| Add a new field | ✅ | Old parsers ignore unknown fields (proto3) |
| Add a new enum value | ✅ | Old parsers see it as the default (0) |
| Add a new RPC method | ✅ | Old clients just won't use it |
| Rename a field | ✅ (wire) / ⚠️ (codegen) | Field number is the wire identity; codegen breaks |
| Change a field's JSON name | ⚠️ | Breaks JSON serialization only |

### Breaking changes (never do these)

| Change | Why it breaks |
|--------|---------------|
| Delete a field number | Old messages have that field set; new parser silently drops data |
| Change a field's type (e.g., \`int32\` → \`string\`) | Different wire encoding — corruption |
| Change a field's field number | Same as deleting + adding |
| Change an RPC's request/response type | Breaks existing generated stubs |
| Renumber enum values | Old parsers read wrong meaning |

### Reserving deleted fields

\`\`\`proto
message User {
  reserved 3;           // field 3 was "phone", now deleted
  reserved "phone";     // also reserve the name

  string id    = 1;
  string email = 2;
  // field 3 gone — but reserved so it can't be accidentally reused
  string name  = 4;
}
\`\`\`

### buf breaking in CI

\`\`\`bash
# buf.yaml
breaking:
  use:
    - FILE  # or WIRE_JSON for stricter mode

# In CI
buf breaking --against .git#branch=main
\`\`\`

**FILE** mode catches all breaking changes to generated code. **WIRE** mode catches only wire-incompatible changes (allows safe codegen-only breaks like renames).

### Versioning strategy

Use **package versioning** (\`package user.v1;\` → \`package user.v2;\`) for large breaking changes — both packages coexist and clients migrate at their own pace.`,
      tags: ["protobuf", "compatibility", "versioning", "buf"],
    },
  ],
};
