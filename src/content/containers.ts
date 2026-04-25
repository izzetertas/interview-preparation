import type { Category } from "./types";

export const containers: Category = {
  slug: "containers",
  title: "Containers",
  description:
    "Containers and Kubernetes: Docker fundamentals, images, networking, volumes, security, OCI, runtimes, and Kubernetes core concepts.",
  icon: "🐳",
  questions: [
    // ───── EASY ─────
    {
      id: "what-is-container",
      title: "What is a container?",
      difficulty: "easy",
      question: "What is a container and how does it differ from a VM?",
      answer: `A **container** is a lightweight, isolated process running with its own file system and network namespace, sharing the host kernel. Built using Linux primitives:
- **Namespaces** — isolation (pid, mount, network, user).
- **cgroups** — resource limits (CPU, memory, I/O).
- **Capabilities** — fine-grained kernel privileges.
- **Seccomp** — system call filtering.

**Vs Virtual Machines:**

| Aspect             | VM                     | Container                       |
|--------------------|------------------------|----------------------------------|
| Boot time          | Minutes                | Seconds                          |
| Disk size          | GBs                    | MBs–hundreds of MBs              |
| Isolation          | Strong (own OS kernel) | Process-level                    |
| OS flexibility     | Any OS                 | Same kernel as host (Linux→Linux) |
| Density            | Tens per host          | Hundreds–thousands                |
| Use case           | Multi-tenant, legacy   | Microservices, dev parity         |

**Containers run inside VMs in cloud** (ECS Fargate, EKS) — best of both: VM isolation + container density.

**Common runtimes:**
- **runc** — low-level OCI-compliant runtime.
- **containerd** — high-level (used by Docker, k8s).
- **CRI-O** — Kubernetes CRI implementation.
- **gVisor** — sandboxed runtime; stronger isolation.
- **Firecracker** — micro-VMs (AWS Lambda, Fargate).
- **Kata Containers** — VM-isolated containers.`,
      tags: ["fundamentals"],
    },
    {
      id: "image-vs-container",
      title: "Image vs container",
      difficulty: "easy",
      question: "What's the difference between an image and a container?",
      answer: `**Image** = template / blueprint (read-only). Filesystem layers, metadata, default command.
**Container** = running instance of an image. Has its own writable layer.

**Analogy:**
- Image = class.
- Container = instance.

**Image structure:**
- Layered — each Dockerfile instruction adds a read-only layer.
- Layers are content-addressable (SHA-256). Reusable across images.
- Top of running container is a thin **writable layer** (copy-on-write).

\`\`\`
docker pull nginx:latest    # download image
docker run -d nginx:latest  # create + start a container
docker ps                   # list running containers
docker image ls             # list images
\`\`\`

**Images are immutable.** You build a new image to "change" anything. Tag updates point to a new digest.

**Where they live:**
- **Local** — \`~/.docker/...\` (Docker Desktop) or \`/var/lib/containerd\`.
- **Registry** — Docker Hub, ECR, GCR, GitHub Container Registry, Quay.

**Layers in practice:**
- Stable layers (base OS, system deps) cached → reused across builds.
- Frequently-changing layers (your app code) at the top → rebuild fast.

**Tags vs digests:**
- \`nginx:latest\` is a tag — mutable.
- \`nginx@sha256:abc...\` is a digest — immutable. Use digests in production for reproducibility.`,
      tags: ["fundamentals"],
    },
    {
      id: "dockerfile",
      title: "Dockerfile basics",
      difficulty: "easy",
      question: "What does a Dockerfile look like?",
      answer: `\`\`\`Dockerfile
# Base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy and install deps (cache-friendly)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy app source
COPY . .

# Build (if needed)
RUN npm run build

# Default user (don't run as root)
USER node

# Default port
EXPOSE 3000

# Default command
CMD ["node", "dist/index.js"]
\`\`\`

**Common instructions:**
- **\`FROM\`** — base image (must be first).
- **\`WORKDIR\`** — change cwd; creates if missing.
- **\`COPY\` / \`ADD\`** — copy files into image. Prefer \`COPY\` (\`ADD\` has implicit fetch/extract magic).
- **\`RUN\`** — execute command at build time; creates a new layer.
- **\`ENV\`** — environment variable.
- **\`EXPOSE\`** — documentation hint, doesn't actually publish.
- **\`USER\`** — switch user; default is root (security risk).
- **\`CMD\`** — default command at runtime.
- **\`ENTRYPOINT\`** — fixed entry; use with CMD as args.
- **\`HEALTHCHECK\`** — periodic health probe.

**Build:**
\`\`\`sh
docker build -t my-app:v1 .
\`\`\`

**Best practices:**
- Use specific base images (\`node:20.11-alpine3.19\`) not \`latest\`.
- Layer ordering: stable → volatile (deps before code).
- Combine RUN steps with \`&&\` to reduce layer count.
- Use \`.dockerignore\` to exclude \`.git\`, \`node_modules\`, secrets.
- Run as non-root.
- Multi-stage for smaller final images (covered separately).`,
      tags: ["docker"],
    },
    {
      id: "compose",
      title: "Docker Compose",
      difficulty: "easy",
      question: "What is Docker Compose?",
      answer: `**Docker Compose** runs multi-container apps locally with a single YAML file.

\`\`\`yaml
# docker-compose.yml
services:
  app:
    build: .
    ports: ["3000:3000"]
    depends_on: [db, redis]
    environment:
      DATABASE_URL: postgres://postgres:pw@db:5432/app
      REDIS_URL: redis://redis:6379
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD: pw
    volumes:
      - pgdata:/var/lib/postgresql/data
  redis:
    image: redis:7-alpine
volumes:
  pgdata:
\`\`\`

\`\`\`sh
docker compose up -d        # start all services
docker compose logs -f app   # tail logs
docker compose down          # stop + remove
docker compose down -v       # also remove volumes (data!)
\`\`\`

**Networking:**
- Compose creates a default network — services reach each other by name (\`db\`, \`redis\`).
- DNS handles service discovery within the compose network.

**Use cases:**
- **Local dev** — replicate prod stack on laptop.
- **Integration tests** — spin up DB + cache + app for tests.
- **Demos** — single command to run everything.

**Not for:**
- Production multi-host orchestration (use Kubernetes / ECS / Nomad).
- Multi-AZ deployments.

**Modern alternatives:**
- **\`docker compose\`** (built-in) replaces older \`docker-compose\` Python tool.
- **Tilt / Skaffold** for k8s-native local dev.
- **Devcontainers** for IDE integration.`,
      tags: ["docker", "tooling"],
    },
    {
      id: "volumes",
      title: "Volumes vs bind mounts",
      difficulty: "easy",
      question: "How do you persist data with containers?",
      answer: `Containers' filesystems are **ephemeral** — data is lost when the container is removed. Use volumes or bind mounts for persistence.

**Volume:**
- Managed by Docker; lives in \`/var/lib/docker/volumes\`.
- Portable across machines (when using Docker volume drivers).
- Best for production data.

\`\`\`sh
docker volume create pgdata
docker run -v pgdata:/var/lib/postgresql/data postgres
\`\`\`

**Bind mount:**
- Maps a host path directly into the container.
- Used for **dev** — share source code from host into container.
- Less portable; depends on host filesystem layout.

\`\`\`sh
docker run -v /home/me/code:/app node:20 npm run dev
\`\`\`

**Tmpfs:**
- In-memory; data lost on container stop.
- For sensitive temporary data.

\`\`\`sh
docker run --tmpfs /tmp:size=100M,mode=1777 my-app
\`\`\`

**Bind vs volume:**
| Aspect       | Bind mount             | Volume                          |
|--------------|------------------------|---------------------------------|
| Performance  | Same as host fs        | Same on Linux; slower on Mac/Windows (Docker VM) |
| Portability  | Tied to host paths     | Portable                        |
| Backup       | Host backup            | \`docker volume\`                |
| Use case     | Dev (live code reload) | Production data                  |

**Production:**
- **Stateful workloads** — use cloud storage (EBS, EFS, Azure Disk, GCP PD).
- In Kubernetes, **PersistentVolumes** + **PersistentVolumeClaims**.
- Avoid storing critical data in container-local volumes — they vanish if the host dies.`,
      tags: ["docker"],
    },
    {
      id: "network-basics",
      title: "Container networking basics",
      difficulty: "easy",
      question: "How does Docker networking work?",
      answer: `Docker creates **virtual networks** to connect containers and the outside world.

**Default networks:**
- **bridge** — default; isolated network on the host.
- **host** — container shares the host's network stack (no isolation).
- **none** — no networking.

**User-defined bridge networks** (preferred):
- Built-in DNS for service-name resolution.
- Containers on the same network reach each other by name.

\`\`\`sh
docker network create my-net
docker run -d --network my-net --name db postgres
docker run -d --network my-net --name app my-app
# inside 'app' container, 'db' resolves to db's IP
\`\`\`

**Port publishing:**
\`\`\`sh
docker run -p 3000:3000 my-app   # host:container
docker run -p 127.0.0.1:3000:3000 my-app   # bind to localhost only
\`\`\`

**Multi-host networking:**
- **Docker Swarm overlay networks** — across multiple hosts.
- **Kubernetes CNI plugins** — Calico, Cilium, Flannel.

**Common issues:**
- "Cannot connect to localhost from inside container" — \`localhost\` is the container itself; use \`host.docker.internal\` (Mac/Win) or the host's IP.
- "Container A can't reach B" — they're on different networks.
- Hostname resolution issues — only works on user-defined networks, not the default bridge.

**For production:**
- Kubernetes handles networking via Services + Ingress.
- Cloud-native: ECS uses awsvpc mode (each task gets a VPC ENI).`,
      tags: ["docker", "network"],
    },

    // ───── MEDIUM ─────
    {
      id: "multi-stage",
      title: "Multi-stage builds",
      difficulty: "medium",
      question: "What are multi-stage builds and why use them?",
      answer: `**Multi-stage builds** use multiple \`FROM\` instructions in one Dockerfile. Each stage can copy artifacts from previous stages without bloating the final image.

\`\`\`Dockerfile
# Stage 1: build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: runtime
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
USER node
CMD ["node", "dist/index.js"]
\`\`\`

**Why:**
- **Smaller final images** — leave dev deps, build tools, source files behind.
- **Better security** — fewer packages = smaller attack surface.
- **Faster pulls** — less data to transfer.
- **Cleaner separation** — build env vs runtime env.

**Distroless / scratch:**
\`\`\`Dockerfile
FROM golang:1.21 AS builder
WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 go build -o /app

FROM gcr.io/distroless/static
COPY --from=builder /app /app
ENTRYPOINT ["/app"]
\`\`\`
- **\`scratch\`** — empty base; smallest possible.
- **\`distroless\`** — Google's stripped-down images; just enough libraries to run common languages.
- **alpine** — tiny but uses musl libc (some compatibility issues).

**Targeting stages:**
\`\`\`sh
docker build --target builder -t my-app:dev .
\`\`\`
Lets you build only up to a stage (useful for testing intermediate states).

**Best practice:** every production Dockerfile should use multi-stage. Difference between 1.5 GB and 50 MB images.`,
      tags: ["docker", "build"],
    },
    {
      id: "layer-caching",
      title: "Layer caching",
      difficulty: "medium",
      question: "How does Docker layer caching work?",
      answer: `Docker caches each layer based on the **command + content** that produced it. If both are unchanged, Docker reuses the layer instead of rebuilding.

**Order matters:**
\`\`\`Dockerfile
# Bad: code changes invalidate npm install
COPY . .
RUN npm install

# Good: deps cached unless package.json changes
COPY package*.json ./
RUN npm install
COPY . .
\`\`\`

**Cache invalidation:**
- Any change in a layer's input invalidates **all subsequent layers**.
- ENV, ARG changes can invalidate.
- File modification time matters for COPY (use \`.dockerignore\` to exclude noise).

**BuildKit (modern Docker):**
- Better caching, parallel stages, cache mounts.
- Enable: \`DOCKER_BUILDKIT=1\` (default in modern Docker).

**Cache mounts** (BuildKit):
\`\`\`Dockerfile
RUN --mount=type=cache,target=/root/.npm \\
    npm ci
\`\`\`
Persists npm cache across builds — much faster.

**Inline / registry cache:**
\`\`\`sh
docker buildx build --cache-from type=registry,ref=my-app:cache --cache-to type=registry,ref=my-app:cache,mode=max .
\`\`\`
Share cache between CI runners or developers via the registry.

**\`.dockerignore\`** — exclude files from the build context:
\`\`\`
node_modules
.git
.env
dist
\`\`\`

**Tips:**
- Group rarely-changing setup at the top.
- Frequently-changing source at the bottom.
- Use multi-stage to isolate build deps.
- Pin base image versions for cache stability.

**Test cache hits:**
\`\`\`sh
docker build --no-cache=false -t my-app .   # try with cache
docker build --no-cache -t my-app .          # force fresh build
\`\`\`

A well-designed Dockerfile can rebuild in seconds when only code changes.`,
      tags: ["docker", "performance"],
    },
    {
      id: "container-security",
      title: "Container security",
      difficulty: "medium",
      question: "What are container security best practices?",
      answer: `**1. Minimal base images:**
- distroless, alpine, or scratch.
- Fewer packages = smaller attack surface.

**2. Don't run as root:**
\`\`\`Dockerfile
USER node   # or create a dedicated user
\`\`\`

**3. Read-only filesystem:**
\`\`\`sh
docker run --read-only --tmpfs /tmp my-app
\`\`\`

**4. Drop capabilities:**
\`\`\`sh
docker run --cap-drop=ALL --cap-add=NET_BIND_SERVICE my-app
\`\`\`

**5. Resource limits:**
\`\`\`sh
docker run --memory=512m --cpus=0.5 my-app
\`\`\`
Prevents one container from starving the host.

**6. Scan images:**
- **Trivy, Grype, Snyk, Docker Scout, AWS Inspector**.
- Integrate in CI; fail builds on critical CVEs.

**7. Sign and verify:**
- **cosign / sigstore** — sign images.
- **Notary v2** — image signature standard.
- Verify signatures in admission controllers.

**8. Don't bake in secrets:**
- Use runtime injection (env vars from secret stores, mounted secrets).
- \`docker build\` ARGs end up in image metadata even if not used.

**9. Use specific tags / digests:**
- \`my-image@sha256:abc...\` is reproducible.
- \`latest\` is mutable; risky.

**10. Run with seccomp / AppArmor / SELinux profiles:**
- Restrict syscalls; default profiles ship with Docker.

**11. No privileged mode in production:**
- \`--privileged\` gives host kernel access — only for narrow use cases (DinD, low-level diagnostics).

**12. Network segmentation:**
- Network policies (k8s) or firewall rules.

**13. Update regularly:**
- Rebuild images on a schedule with fresh base images.
- Tools: dependabot, renovate.

**Runtime protection:**
- **Falco** — anomalous syscall detection.
- **Aqua, Sysdig, Twistlock** (Prisma Cloud) — commercial container security.`,
      tags: ["security"],
    },
    {
      id: "oci",
      title: "OCI standards",
      difficulty: "medium",
      question: "What are the OCI standards?",
      answer: `**OCI (Open Container Initiative)** is the Linux Foundation project that maintains open standards for containers.

**Three specifications:**

**1. Image Spec** — what's in a container image:
- Manifest (metadata).
- Layers (filesystem snapshots).
- Configuration (entrypoint, env, etc.).
- Content-addressable (SHA-256).

**2. Runtime Spec** — how to run a container:
- Bundle structure on disk.
- Lifecycle: create, start, kill, delete.
- Hooks: prestart, poststart, poststop.
- Implemented by **runc**, **crun**, **gVisor**, **Kata**.

**3. Distribution Spec** — how to publish/pull images:
- HTTP API for registries.
- Push/pull, tags, manifests.
- Implemented by Docker Hub, ECR, GCR, Quay, Harbor.

**Why standards matter:**
- **Interoperability** — Docker images run on Kubernetes (via containerd/CRI-O), Podman, and other tools.
- **No vendor lock-in** — switch tooling without rebuilding images.
- **Security** — verifiable signatures (cosign).

**Key projects:**
- **runc** — reference runtime.
- **containerd** — high-level runtime managing images and execution.
- **CRI-O** — Kubernetes-specific implementation of CRI (Container Runtime Interface).
- **Podman** — daemonless Docker alternative.
- **BuildKit / buildx** — modern image build.

**OCI artifacts:**
- Beyond images, OCI registries can store anything (Helm charts, WASM modules, ML models, SBOMs).
- Tools like **ORAS** (OCI Registry as Storage) push generic artifacts.

**Image format extensions:**
- **Distribution-spec v2** — adds artifact type.
- **OCI Image v1.1** — manifest references for SBOMs, signatures.

OCI is why "Docker image" and "container image" are interchangeable today — they're the same OCI-compliant artifact under the hood.`,
      tags: ["fundamentals"],
    },
    {
      id: "k8s-pod",
      title: "Pods, deployments, services",
      difficulty: "medium",
      question: "Explain pods, deployments, and services in Kubernetes.",
      answer: `**Pod** — smallest deployable unit. One or more containers sharing:
- Network namespace (one IP, shared ports).
- Volumes.
- Lifecycle.

Co-located containers (sidecar pattern): logger, proxy, init container.

\`\`\`yaml
apiVersion: v1
kind: Pod
metadata: { name: my-app }
spec:
  containers:
    - name: app
      image: my-app:v1
      ports: [{ containerPort: 3000 }]
\`\`\`

**Deployment** — declarative pod management. Rolling updates, replicas, rollback.

\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata: { name: my-app }
spec:
  replicas: 3
  selector: { matchLabels: { app: my-app } }
  template:
    metadata: { labels: { app: my-app } }
    spec:
      containers:
        - name: app
          image: my-app:v1
          resources:
            requests: { cpu: 100m, memory: 128Mi }
            limits:   { cpu: 500m, memory: 512Mi }
          livenessProbe:
            httpGet: { path: /health, port: 3000 }
\`\`\`

Behind the scenes: Deployment manages a **ReplicaSet**, which manages **Pods**.

**Service** — stable endpoint for accessing pods. Pods are ephemeral (IPs change); Services give a fixed DNS name.

\`\`\`yaml
apiVersion: v1
kind: Service
metadata: { name: my-app }
spec:
  selector: { app: my-app }
  ports:
    - port: 80
      targetPort: 3000
\`\`\`

**Service types:**
- **ClusterIP** (default) — internal cluster IP.
- **NodePort** — exposes on each node's IP at a port.
- **LoadBalancer** — provisions a cloud LB (AWS NLB/ALB, GCP LB).
- **ExternalName** — DNS CNAME to external service.

**Ingress** — HTTP routing into the cluster (\`/api → app-service\`, \`/web → web-service\`). Backed by ingress controllers (nginx, Traefik, ALB Controller).

**Pattern:** Deployment → Service → Ingress.`,
      tags: ["kubernetes"],
    },
    {
      id: "k8s-config",
      title: "ConfigMaps and Secrets",
      difficulty: "medium",
      question: "How do you handle config and secrets in Kubernetes?",
      answer: `**ConfigMap** — non-sensitive config (key-value).

\`\`\`yaml
apiVersion: v1
kind: ConfigMap
metadata: { name: app-config }
data:
  LOG_LEVEL: info
  config.json: |
    { "feature_x": true }
\`\`\`

**Secret** — sensitive data; base64-encoded (NOT encrypted by default).

\`\`\`yaml
apiVersion: v1
kind: Secret
metadata: { name: db-creds }
type: Opaque
stringData:
  password: "supersecret"
\`\`\`

**Use in pods:**
- **As env vars:**
\`\`\`yaml
env:
  - name: LOG_LEVEL
    valueFrom: { configMapKeyRef: { name: app-config, key: LOG_LEVEL } }
  - name: DB_PASSWORD
    valueFrom: { secretKeyRef: { name: db-creds, key: password } }
\`\`\`
- **Mounted as files:**
\`\`\`yaml
volumeMounts:
  - name: config
    mountPath: /etc/app
volumes:
  - name: config
    configMap: { name: app-config }
\`\`\`

**Important:** Secrets are NOT encrypted by default — they're just base64-encoded. Anyone with cluster API access can read them.

**Encrypt at rest:**
- Enable **encryption at rest** for etcd via kubeadm config.
- Or use **External Secrets Operator** to sync from AWS Secrets Manager / Vault.
- Or **sealed-secrets** (Bitnami) — encrypt secrets in git.

**Security:**
- RBAC — restrict who can read Secrets.
- Audit logs.
- Avoid Secrets in env vars — they leak in logs/dumps.
- Rotate periodically.

**Modern alternatives:**
- **External Secrets Operator** — sync from AWS/Azure/GCP secret stores.
- **HashiCorp Vault** + Vault Agent Sidecar — dynamic secrets.
- **AWS Secrets and Config Provider for k8s** — direct integration.
- **ServiceAccount tokens** for cloud IAM (IRSA on EKS, Workload Identity on GKE).`,
      tags: ["kubernetes"],
    },
    {
      id: "k8s-probes",
      title: "Health checks and probes",
      difficulty: "medium",
      question: "What probes does Kubernetes use?",
      answer: `**Three probe types:**

**1. Liveness probe** — "is the container alive?"
- Failed → kill + restart container.
- Use for: detect deadlock, infinite loops.

**2. Readiness probe** — "is the container ready to accept traffic?"
- Failed → remove from Service endpoints (no traffic).
- Use for: warm-up, dependency checks.

**3. Startup probe** — "has the container finished starting?"
- Disables liveness/readiness while running.
- Use for: slow-starting apps (Java, big migrations).

**Probe types:**
- **httpGet** — HTTP GET on a path; success = 2xx/3xx.
- **tcpSocket** — TCP connection succeeds.
- **exec** — run a command in container; exit code 0 = success.
- **grpc** — gRPC health check (newer).

**Example:**
\`\`\`yaml
livenessProbe:
  httpGet: { path: /healthz, port: 3000 }
  initialDelaySeconds: 30
  periodSeconds: 10
  failureThreshold: 3
readinessProbe:
  httpGet: { path: /ready, port: 3000 }
  initialDelaySeconds: 5
  periodSeconds: 5
startupProbe:
  httpGet: { path: /healthz, port: 3000 }
  failureThreshold: 30
  periodSeconds: 10
\`\`\`

**Key fields:**
- \`initialDelaySeconds\` — wait before first probe.
- \`periodSeconds\` — how often.
- \`timeoutSeconds\` — fail if no response within.
- \`failureThreshold\` — consecutive fails to mark unhealthy.
- \`successThreshold\` — consecutive successes to mark healthy (default 1).

**Best practices:**
- **Liveness + readiness on different endpoints**.
- Liveness: check internal state (deadlocks, fatal errors).
- Readiness: check downstream deps (DB ping, cache).
- Don't make readiness too strict — flapping endpoints kill availability.
- Tune timing based on app startup behavior.

**Common bugs:**
- Liveness too aggressive — pod loops restart on slow startup. Use startupProbe.
- Readiness checks downstream that doesn't depend on this pod's health → flapping.
- No probes at all — k8s thinks containers are healthy when they're not.`,
      tags: ["kubernetes"],
    },
    {
      id: "k8s-storage",
      title: "Persistent storage in Kubernetes",
      difficulty: "medium",
      question: "How does persistent storage work in Kubernetes?",
      answer: `**Pod storage is ephemeral** — when a pod is deleted, its filesystem is gone. For databases, file uploads, etc., you need PersistentVolumes.

**Concepts:**
- **PersistentVolume (PV)** — actual storage resource (cluster-wide).
- **PersistentVolumeClaim (PVC)** — request for storage by a pod.
- **StorageClass** — defines how PVs are provisioned (dynamic).

**Static provisioning:**
- Admin pre-creates PVs.
- Pods make PVCs that bind to available PVs.

**Dynamic provisioning** (preferred):
- StorageClass defines a provisioner (e.g. \`ebs.csi.aws.com\`).
- Pod claims a PVC; provisioner auto-creates a PV.

\`\`\`yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata: { name: gp3 }
provisioner: ebs.csi.aws.com
parameters: { type: gp3 }
reclaimPolicy: Retain   # or Delete
volumeBindingMode: WaitForFirstConsumer
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata: { name: pgdata }
spec:
  accessModes: [ReadWriteOnce]
  resources: { requests: { storage: 100Gi } }
  storageClassName: gp3
---
# Use in a pod
volumes:
  - name: data
    persistentVolumeClaim: { claimName: pgdata }
\`\`\`

**Access modes:**
- **ReadWriteOnce (RWO)** — one node at a time. Most cloud block storage.
- **ReadOnlyMany (ROX)** — many nodes read.
- **ReadWriteMany (RWX)** — many nodes write. Needs network FS (NFS, EFS, Azure Files, GCP Filestore).
- **ReadWriteOncePod (RWOP)** — single pod (newer, stricter).

**Reclaim policy:**
- \`Retain\` — keep PV after PVC delete (manual cleanup).
- \`Delete\` — also delete underlying storage.

**StatefulSet:**
- For stateful apps (databases, queues).
- Stable identities (pod-0, pod-1).
- Stable storage (each replica gets its own PVC via volumeClaimTemplates).

**Cloud-specific:**
- **EKS** — EBS, EFS, FSx CSI drivers.
- **GKE** — Persistent Disk, Filestore.
- **AKS** — Azure Disk, Azure Files.

**Backup:**
- **Velero** — popular k8s backup tool.
- Cloud snapshots (EBS snapshots, etc.).`,
      tags: ["kubernetes", "storage"],
    },

    // ───── HARD ─────
    {
      id: "k8s-networking",
      title: "Kubernetes networking",
      difficulty: "hard",
      question: "How does networking work in Kubernetes?",
      answer: `**Four core requirements:**
1. Every pod gets its own IP.
2. Pods communicate without NAT (across nodes).
3. Nodes communicate with pods without NAT.
4. Each pod sees its own IP as others see it.

**CNI (Container Network Interface):**
- Plugin model. Each cluster runs one CNI implementation.
- Examples: Calico, Cilium, Flannel, Weave Net, AWS VPC CNI.

**Pod networking:**
- Each pod gets an IP from a per-node CIDR.
- Cluster has a pod CIDR (e.g. 10.244.0.0/16).
- Cross-node traffic goes through the CNI's overlay or routing.

**Service networking:**
- ClusterIP — virtual IP managed by kube-proxy.
- iptables / IPVS rules forward to pod IPs.
- DNS via CoreDNS — \`my-svc.my-ns.svc.cluster.local\`.

**Network policies:**
- Firewall rules at L3/L4 between pods.
- Default: all pods can talk to all pods.
- Implemented by CNIs (Calico, Cilium support; basic Flannel doesn't).

\`\`\`yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: db-deny-all-except-app }
spec:
  podSelector: { matchLabels: { tier: db } }
  ingress:
    - from:
        - podSelector: { matchLabels: { tier: app } }
\`\`\`

**Service mesh (advanced):**
- **Istio, Linkerd, Consul Connect** — sidecar proxy per pod.
- mTLS between services, observability, traffic shifting, circuit breaking.
- Adds complexity; consider need carefully.

**Ingress:**
- HTTP routing into the cluster.
- Implemented by ingress controllers (nginx-ingress, Traefik, ALB Controller, Istio Gateway).

**Gateway API:**
- Modern replacement for Ingress.
- More expressive (TCP, gRPC, advanced routing).
- Kubernetes 1.30+ stabilized.

**eBPF / Cilium:**
- Modern CNI using eBPF for fast in-kernel networking.
- Replaces kube-proxy with eBPF-based load balancing.
- Native L7 visibility and policies.

**Cloud-specific:**
- **EKS VPC CNI** — pods get real VPC IPs (no overlay). Direct AWS service integration.
- **GKE** — alias IPs.
- **AKS** — Azure CNI or Kubenet.`,
      tags: ["kubernetes", "network"],
    },
    {
      id: "k8s-rbac",
      title: "RBAC in Kubernetes",
      difficulty: "hard",
      question: "How does RBAC work in Kubernetes?",
      answer: `**RBAC (Role-Based Access Control)** controls who can do what in the cluster.

**Building blocks:**

**Role / ClusterRole** — set of permissions.
\`\`\`yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata: { name: pod-reader, namespace: my-ns }
rules:
  - apiGroups: [""]
    resources: ["pods", "pods/log"]
    verbs: ["get", "list", "watch"]
\`\`\`

- **Role** — namespace-scoped.
- **ClusterRole** — cluster-wide (or namespace via binding).

**RoleBinding / ClusterRoleBinding** — assign roles to subjects.
\`\`\`yaml
kind: RoleBinding
metadata: { name: alice-pod-reader, namespace: my-ns }
subjects:
  - kind: User
    name: alice
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
\`\`\`

**Subjects:**
- **User** — external identity (managed by your auth system).
- **ServiceAccount** — workload identity in the cluster.
- **Group** — list of users.

**ServiceAccount** for pods:
\`\`\`yaml
apiVersion: v1
kind: ServiceAccount
metadata: { name: my-app, namespace: my-ns }
---
spec:
  serviceAccountName: my-app
\`\`\`

**Cloud IAM integration:**
- **EKS IRSA** (IAM Roles for Service Accounts) — pod assumes AWS IAM role via OIDC.
- **GKE Workload Identity** — same idea on GCP.
- **AKS Pod Identity / Workload Identity** — Azure AD integration.

Eliminates the need for long-lived AWS keys in pods.

**Best practices:**
- **Least privilege** — start with no access, add what's needed.
- **One ServiceAccount per app**.
- **Namespace isolation** — separate teams in their own namespaces.
- **Audit logs** — \`kubectl get events\`, audit policy on the API server.
- **Avoid \`cluster-admin\`** for human users — use SSO + scoped roles.

**Tools:**
- **rbac-tool** — analyze permissions.
- **kubectl-who-can** — "who can delete pods?".
- **OPA / Kyverno** — policy enforcement beyond RBAC.

**Common mistakes:**
- Granting broad \`*\` verbs.
- Using a single ServiceAccount across many apps.
- Not auditing inactive users / accounts.`,
      tags: ["kubernetes", "security"],
    },
    {
      id: "k8s-resource-mgmt",
      title: "Resource requests and limits",
      difficulty: "hard",
      question: "How do CPU and memory requests/limits work?",
      answer: `**Requests** — minimum guaranteed resources. Used by the scheduler.
**Limits** — maximum allowed. Enforced by the kernel.

\`\`\`yaml
resources:
  requests: { cpu: 100m, memory: 128Mi }
  limits:   { cpu: 500m, memory: 512Mi }
\`\`\`

**Units:**
- CPU: \`1\` = 1 full core; \`100m\` = 0.1 core (millicores).
- Memory: \`Mi\` = mebibytes; \`Gi\` = gibibytes.

**CPU behavior:**
- **Request** — scheduler ensures the node has at least this much.
- **Limit** — throttled at the kernel level (CFS scheduler).
- Throttling causes latency, not OOM kill.

**Memory behavior:**
- **Request** — scheduler guarantees.
- **Limit** — exceeded → **OOMKilled** (kernel kills the container).

**QoS classes:**
- **Guaranteed** — requests = limits for all resources. Highest priority; last to be evicted.
- **Burstable** — has requests, limits may be higher or unset.
- **BestEffort** — no requests/limits. First to be evicted under pressure.

**Eviction:**
- Node under memory pressure → kubelet evicts BestEffort first, then Burstable, then Guaranteed.

**Setting them right:**
- **Profile in production**, not in dev.
- **Requests** = typical usage (peak P50).
- **Limits** = absolute max you'd ever want (peak P99 + headroom).

**Vertical Pod Autoscaler (VPA)** — auto-recommends and applies right-sized requests/limits.
**Horizontal Pod Autoscaler (HPA)** — scales replicas based on CPU/memory/custom metrics.
**Cluster Autoscaler** — adds/removes nodes based on pending pods.

**Common mistakes:**
- No requests = scheduler over-commits → degraded performance.
- Memory limit too low → OOMKilled in spikes.
- CPU limit set strict → unnecessary throttling. Often better to omit CPU limits, rely on requests.

**Tools:**
- **Goldilocks** — recommends requests/limits.
- **kube-reqsizer** — VPA-like.
- **kubectl-resources** — see usage at a glance.`,
      tags: ["kubernetes", "performance"],
    },
    {
      id: "helm",
      title: "Helm",
      difficulty: "medium",
      question: "What is Helm and when do you use it?",
      answer: `**Helm** = package manager for Kubernetes. Bundles YAML manifests into reusable, parameterized **charts**.

**Chart structure:**
\`\`\`
my-chart/
  Chart.yaml
  values.yaml          # default config
  templates/
    deployment.yaml    # Go templates
    service.yaml
    ingress.yaml
\`\`\`

**Templates use Go templating:**
\`\`\`yaml
spec:
  replicas: {{ .Values.replicaCount }}
  template:
    spec:
      containers:
        - image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
\`\`\`

**Install / upgrade:**
\`\`\`sh
helm install my-app ./my-chart -f values-prod.yaml
helm upgrade my-app ./my-chart -f values-prod.yaml
helm rollback my-app 1
\`\`\`

**Strengths:**
- Reusable charts (Bitnami, ArtifactHub).
- Parameterizable per environment.
- Release tracking (revision history).
- Rollback to previous versions.

**Pain points:**
- Go templating is awkward for YAML.
- "Helm hell" — overly complex charts with many conditionals.
- Templating + indentation bugs.

**Modern alternatives:**
- **Kustomize** — declarative overlays without templating. Built into kubectl.
- **CDK8s** — code-first (TS, Python, Go).
- **Jsonnet** — programmable JSON / YAML.
- **Pulumi for Kubernetes** — code-first IaC.

**When to use Helm:**
- Reusable charts shared across teams.
- Complex apps with many config knobs.
- Existing chart you want to use (open source software).

**When to use Kustomize:**
- Small env-specific overrides.
- Don't want template complexity.
- Working with existing YAML.

**Hybrid:** Helm chart + Kustomize overlay on top.

**GitOps + Helm:**
- Argo CD / Flux can deploy Helm charts.
- Common pattern: Helm chart in git; Argo applies + reconciles.`,
      tags: ["kubernetes", "tooling"],
    },
    {
      id: "ecs-vs-eks",
      title: "ECS vs EKS",
      difficulty: "hard",
      question: "Should you use ECS or EKS on AWS?",
      answer: `**ECS (Elastic Container Service)** — AWS's proprietary container orchestrator.
- Tight AWS integration; simpler than k8s.
- Two launch types: EC2 (you manage hosts) or **Fargate** (serverless).
- Less powerful but easier to operate.

**EKS (Elastic Kubernetes Service)** — managed Kubernetes.
- Standard k8s API.
- Multi-cloud portability.
- Larger ecosystem (Helm, Operators).
- More powerful, more complex.

**Comparison:**

| Aspect             | ECS                          | EKS                              |
|--------------------|------------------------------|----------------------------------|
| Complexity         | Lower                        | Higher                            |
| AWS integration    | Native (IAM, ALB, CloudWatch) | Native via add-ons                |
| Portability        | AWS-only                     | Multi-cloud (k8s standard)       |
| Ecosystem          | Smaller                      | Vast (Helm, CRDs, operators)     |
| Pricing            | Free control plane (ECS)     | \$0.10/hr per cluster + workers   |
| Networking         | awsvpc / bridge              | VPC CNI / Cilium / Calico        |
| Service mesh       | App Mesh                     | Istio / Linkerd / App Mesh       |
| Spot              | Native                       | Managed Node Groups + Karpenter   |

**Pick ECS when:**
- AWS-only, no plan to leave.
- Smaller team; want simpler ops.
- Standard web apps + workers.
- Fargate for serverless containers.

**Pick EKS when:**
- Multi-cloud or hybrid requirements.
- Complex orchestration needs (CRDs, operators, GitOps).
- Already have k8s expertise.
- Need ecosystem tools (Argo CD, Istio, etc.).

**Fargate** runs both:
- ECS Fargate — simpler, AWS-native.
- EKS Fargate — pods on Fargate (no node management).

**Cost comparison:**
- ECS Fargate vs EKS Fargate: similar for workloads.
- EKS adds \$73/month per cluster control plane.
- EKS requires worker nodes (EC2 or Fargate).

**Reality:**
- Most AWS-only teams start with **ECS Fargate**, move to **EKS** when complexity demands.
- Some never need EKS.`,
      tags: ["aws", "comparison"],
    },
    {
      id: "operators",
      title: "Kubernetes Operators",
      difficulty: "hard",
      question: "What is a Kubernetes Operator?",
      answer: `**Operator** = pattern for managing complex stateful applications using Kubernetes' own API. Combines:
1. **Custom Resource Definition (CRD)** — extend k8s API with new resource types.
2. **Custom Controller** — watches CRD; reconciles desired state.

**Example:**
\`\`\`yaml
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata: { name: my-pg }
spec:
  instances: 3
  storage: { size: 100Gi }
  postgresql: { parameters: { shared_buffers: 256MB } }
\`\`\`

CloudNativePG operator sees this and:
- Provisions 3 Postgres instances.
- Configures replication.
- Sets up backups.
- Handles failover.
- Performs upgrades.

**Why operators:**
- Encode operational knowledge in code.
- Self-healing, self-managing systems.
- Treat databases / queues / etc. as first-class k8s objects.

**Popular operators:**
- **Postgres** — CloudNativePG, Crunchy, Zalando.
- **Kafka** — Strimzi.
- **Elasticsearch** — Elastic Cloud on Kubernetes (ECK).
- **Redis** — Spotahome / Redis Labs.
- **Prometheus** — Prometheus Operator.
- **Cert-manager** — TLS cert lifecycle.
- **External-Secrets** — sync from cloud secret stores.

**OperatorHub** — directory of operators (operatorhub.io).

**Building an operator:**
- **Operator SDK** (Red Hat) — Go scaffolding.
- **Kubebuilder** — Kubernetes-native scaffolding.
- **Helm operator** — wrap existing Helm chart.
- **Kopf** (Python), **kube-rs** (Rust).

**Operator capability levels** (1-5):
1. Basic install.
2. Seamless upgrades.
3. Full lifecycle.
4. Deep insights.
5. Auto-pilot.

**Reality:**
- Building operators is hard — complex state, edge cases.
- Use existing well-maintained operators when possible.
- Don't write an operator for something a Helm chart could do.`,
      tags: ["kubernetes", "advanced"],
    },
    {
      id: "service-mesh",
      title: "Service mesh",
      difficulty: "hard",
      question: "What is a service mesh and when do you need one?",
      answer: `**Service mesh** = infrastructure layer that handles service-to-service communication using sidecar proxies.

**How it works:**
- A proxy (Envoy, etc.) sits next to each service instance.
- All traffic flows through the proxy.
- Control plane configures proxies dynamically.

**What it provides:**
- **mTLS** — automatic encryption between services.
- **Authentication** — service identity + authorization.
- **Observability** — metrics, traces, logs without app code changes.
- **Traffic management** — canary deploys, retries, circuit breaking, timeouts.
- **Rate limiting**.

**Popular meshes:**
- **Istio** — feature-rich, complex. CNCF.
- **Linkerd** — simpler, smaller; lightweight Rust proxy.
- **Consul Connect** — HashiCorp.
- **AWS App Mesh** — AWS-native (deprecated in favor of VPC Lattice).
- **Cilium Service Mesh** — eBPF-based, no sidecars.

**When you might need one:**
- 50+ microservices with complex traffic patterns.
- Compliance requires mTLS between services.
- Need fine-grained traffic shifting (canary based on headers).
- Heavy investment in observability.

**When you probably don't:**
- Small number of services (< 20).
- Simple stateless apps.
- Already getting observability from APM tools.

**Costs:**
- **Operational complexity** — service mesh adds significant infra to learn.
- **Latency** — sidecar proxy adds 1-5 ms per hop.
- **Resource overhead** — sidecars use CPU/memory.

**Alternatives:**
- **API gateways** for north-south traffic.
- **Library-based** approach (Hystrix, gRPC built-in retries).
- **eBPF-based meshes** (Cilium) — no sidecars, faster.
- **Just don't** until you actually need it.

**Modern trend:**
- "Mesh-less" with eBPF.
- **Ambient mesh** (Istio) — node-level proxies, no per-pod sidecar.

Service mesh is powerful but easy to over-adopt. Start simple; add complexity only when warranted.`,
      tags: ["kubernetes", "architecture"],
    },
  ],
};
