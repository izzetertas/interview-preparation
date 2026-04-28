import type { Category } from "./types";

export const mlops: Category = {
  slug: "mlops",
  title: "MLOps",
  description:
    "End-to-end machine learning operations: the ML lifecycle, model serving, experiment tracking, feature stores, data versioning, monitoring, CI/CD for ML, and LLM-specific ops.",
  icon: "🔁",
  questions: [
    // ───── EASY ─────
    {
      id: "what-is-mlops",
      title: "What is MLOps?",
      difficulty: "easy",
      question: "What is MLOps and why does it matter?",
      answer: `**MLOps** (Machine Learning Operations) is a set of practices that combines ML, DevOps, and data engineering to reliably and efficiently build, deploy, and maintain ML systems in production.

Without MLOps, models trained in notebooks rarely make it to production, and those that do degrade silently over time.

**Core goals:**
- **Reproducibility** — re-run any experiment and get the same result
- **Automation** — CI/CD pipelines that retrain, evaluate, and redeploy
- **Monitoring** — catch data drift and model decay before users notice
- **Collaboration** — shared experiment tracking and model registries

**Key disciplines it spans:**

| Pillar | Examples |
|--------|----------|
| Data engineering | DVC, feature stores (Feast) |
| Experimentation | MLflow, Weights & Biases |
| Serving | FastAPI, vLLM, KServe |
| Monitoring | Evidently, Arize |
| Orchestration | GitHub Actions, Kubeflow |`,
      tags: ["fundamentals"],
    },
    {
      id: "ml-lifecycle",
      title: "The ML lifecycle",
      difficulty: "easy",
      question: "Describe the end-to-end ML lifecycle from raw data to a monitored production model.",
      answer: `The ML lifecycle has six repeating stages:

1. **Data collection & versioning** — raw data is ingested and version-controlled (e.g., DVC pointing at S3).
2. **Feature engineering** — raw fields are transformed into model-ready features, ideally via a feature store (Feast) so training and serving use identical logic.
3. **Training & experimentation** — models are trained with tracked hyper-parameters, metrics, and artifacts (MLflow runs or W&B experiments).
4. **Evaluation** — offline metrics (accuracy, RMSE, NDCG) and business KPIs are compared against a baseline or champion model before promotion.
5. **Deployment** — the approved model is packaged (Docker + FastAPI or vLLM) and deployed via a CI/CD pipeline; canary or shadow releases reduce risk.
6. **Monitoring** — production predictions and input features are continuously checked for data drift, concept drift, and prediction drift; alerts trigger retraining.

The cycle is never truly "done" — production signals feed back into step 1.`,
      tags: ["fundamentals", "lifecycle"],
    },
    {
      id: "model-registry",
      title: "What is a model registry?",
      difficulty: "easy",
      question: "What is a model registry and what problems does it solve?",
      answer: `A **model registry** is a centralized store that tracks every version of every model artifact together with its metadata (training run, dataset version, metrics, lineage).

**Problems it solves:**
- *"Which model is in prod right now?"* — the registry holds a \`production\` alias/stage pointer.
- *"What data was this trained on?"* — lineage links artifact → dataset version → code commit.
- *"Can I roll back?"* — previous versions are never deleted; redeploying is a stage change, not a re-build.

**Popular options:**

| Registry | Notes |
|----------|-------|
| **MLflow Model Registry** (3.x) | Self-hosted or managed; integrated with MLflow tracking |
| **Weights & Biases Artifacts** | Tight W&B ecosystem integration |
| **Hugging Face Hub** | De-facto standard for open-weight LLMs and datasets |

\`\`\`python
import mlflow

# Log and register in one call (MLflow 3.x)
with mlflow.start_run():
    mlflow.log_metric("f1", 0.92)
    mlflow.sklearn.log_model(
        model,
        name="fraud-detector",
        registered_model_name="fraud-detector",
    )

# Promote to production via alias
client = mlflow.MlflowClient()
client.set_registered_model_alias("fraud-detector", "champion", version=7)
\`\`\``,
      tags: ["model-registry", "mlflow"],
    },
    {
      id: "experiment-tracking",
      title: "Experiment tracking",
      difficulty: "easy",
      question: "What is experiment tracking and how does MLflow support it?",
      answer: `**Experiment tracking** records every training run's inputs (hyper-parameters, dataset version, code commit) and outputs (metrics, artifacts) so you can compare runs and reproduce any result.

**MLflow concepts:**
- **Experiment** — a named group of runs (e.g., \`fraud-detector-v2\`).
- **Run** — one training execution; stores params, metrics (step-wise), tags, and artifacts.
- **Artifact store** — file or object-storage location (S3, GCS) where model files live.

\`\`\`python
import mlflow
import mlflow.sklearn
from sklearn.ensemble import GradientBoostingClassifier

mlflow.set_experiment("fraud-detector-v2")

with mlflow.start_run(run_name="gbm-lr-0.05"):
    mlflow.log_params({"n_estimators": 200, "learning_rate": 0.05})

    model = GradientBoostingClassifier(n_estimators=200, learning_rate=0.05)
    model.fit(X_train, y_train)

    mlflow.log_metric("f1", f1_score(y_val, model.predict(X_val)))
    mlflow.sklearn.log_model(model, "model")
\`\`\`

**W&B sweeps** add automatic hyper-parameter search on top of tracking, distributing trials across agents.`,
      tags: ["experiment-tracking", "mlflow", "wandb"],
    },
    {
      id: "real-time-vs-batch-inference",
      title: "Real-time vs batch inference",
      difficulty: "easy",
      question: "What is the difference between real-time and batch inference? When do you choose each?",
      answer: `| | Real-time (online) | Batch (offline) |
|---|---|---|
| **Latency** | Milliseconds | Minutes to hours |
| **Throughput** | Low–medium per request | Very high aggregate |
| **Trigger** | User/service request | Schedule or event |
| **Infrastructure** | Always-on API (FastAPI, vLLM) | Spark, Ray, Airflow job |
| **Cost** | Higher idle cost | Pay only when running |

**Choose real-time** when the prediction must influence a live user interaction: fraud check at checkout, autocomplete, recommendation on page load.

**Choose batch** when predictions can be pre-computed: nightly product recommendations written to a database, monthly churn scores, document classification for an archive.

A hybrid pattern is **pre-computed + real-time fallback**: serve from a cache of batch predictions, but call the online model for cache misses.`,
      tags: ["serving", "inference"],
    },
    {
      id: "data-versioning-dvc",
      title: "Data versioning with DVC",
      difficulty: "easy",
      question: "What problem does DVC solve and how does it work?",
      answer: `**Problem:** Git tracks code but not large binary files (datasets, model weights). Without versioning, "which data was used for run #42?" is unanswerable.

**DVC** (Data Version Control) solves this by:
1. Storing a small \`.dvc\` pointer file in Git that records a content hash.
2. Pushing the actual file to a remote store (S3, GCS, Azure Blob, SSH).

\`\`\`bash
# One-time setup
dvc init
dvc remote add -d myremote s3://my-bucket/dvc-store

# Track a dataset
dvc add data/train.parquet        # creates data/train.parquet.dvc
git add data/train.parquet.dvc .gitignore
git commit -m "track training dataset v1"
dvc push                          # upload to S3

# On another machine / CI
git clone <repo>
dvc pull                          # downloads the exact dataset
\`\`\`

DVC also supports **pipelines** (\`dvc.yaml\`) that define stages (preprocess → train → evaluate) with input/output dependencies, enabling reproducible, cacheable workflows.`,
      tags: ["data-versioning", "dvc"],
    },
    {
      id: "containerizing-ml-models",
      title: "Containerizing ML models with Docker + FastAPI",
      difficulty: "easy",
      question: "How do you containerize an ML model for serving using Docker and FastAPI?",
      answer: `Containerizing ensures the model runs identically in development, CI, and production.

**FastAPI inference server:**

\`\`\`python
# app/main.py
from fastapi import FastAPI
import mlflow.sklearn
import numpy as np

app = FastAPI()
model = mlflow.sklearn.load_model("models:/fraud-detector/champion")

@app.post("/predict")
def predict(features: list[float]):
    arr = np.array(features).reshape(1, -1)
    prob = model.predict_proba(arr)[0, 1]
    return {"fraud_probability": float(prob)}
\`\`\`

**Dockerfile:**

\`\`\`dockerfile
FROM python:3.12-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ app/
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
\`\`\`

**Build and run:**

\`\`\`bash
docker build -t fraud-detector:v1 .
docker run -p 8080:8080 fraud-detector:v1
curl -X POST http://localhost:8080/predict \
     -H "Content-Type: application/json" \
     -d '{"features": [0.3, 1.2, -0.5]}'
\`\`\`

The image is then pushed to a container registry (ECR, GCR) and deployed to Kubernetes or a managed service.`,
      tags: ["serving", "docker", "fastapi"],
    },

    // ───── MEDIUM ─────
    {
      id: "feature-stores",
      title: "Feature stores",
      difficulty: "medium",
      question: "What problem do feature stores solve, and how do Feast and Tecton differ?",
      answer: `**The core problem — training-serving skew:** features are computed one way during training (batch SQL) and a different way at serving time (real-time Python), causing silent model degradation.

**A feature store solves this by:**
- Providing a **single definition** of every feature (e.g., \`user_avg_spend_30d\`).
- Materializing features to an **offline store** (S3/BigQuery) for training.
- Materializing features to an **online store** (Redis, DynamoDB) for low-latency serving.
- Guaranteeing both stores use the **same transformation logic**.

\`\`\`python
# Feast example — feature retrieval
from feast import FeatureStore

store = FeatureStore(repo_path=".")

# Training: point-in-time correct join from offline store
training_df = store.get_historical_features(
    entity_df=entity_df,
    features=["user_stats:avg_spend_30d", "user_stats:login_count_7d"],
).to_df()

# Serving: online lookup in <10 ms
features = store.get_online_features(
    features=["user_stats:avg_spend_30d"],
    entity_rows=[{"user_id": "u123"}],
).to_dict()
\`\`\`

| | **Feast** | **Tecton** |
|---|---|---|
| Hosting | Self-hosted OSS | Managed SaaS |
| Streaming | Limited (contrib) | First-class Spark/Flink |
| Governance | Manual | Built-in lineage + ACLs |
| Cost | Free | Enterprise pricing |`,
      tags: ["feature-store", "feast", "tecton"],
    },
    {
      id: "model-monitoring-drift",
      title: "Model monitoring and drift detection",
      difficulty: "medium",
      question: "Explain data drift, concept drift, and prediction drift. How do you detect each in production?",
      answer: `**Three types of drift:**

| Type | What changes | Example |
|------|--------------|---------|
| **Data drift** (covariate shift) | Input feature distribution P(X) | \`age\` mean shifts from 35 to 28 after a new marketing campaign |
| **Concept drift** | The true relationship P(Y\|X) | Fraud patterns change after a new attack vector emerges |
| **Prediction drift** | Output distribution P(Ŷ) | Model suddenly predicts "fraud" far more often |

**Detection with Evidently:**

\`\`\`python
from evidently.report import Report
from evidently.metric_preset import DataDriftPreset, TargetDriftPreset

report = Report(metrics=[DataDriftPreset(), TargetDriftPreset()])
report.run(reference_data=reference_df, current_data=production_df)
report.save_html("drift_report.html")
\`\`\`

Evidently uses statistical tests (KS test for continuous, chi-squared for categorical) and flags features whose distributions have shifted significantly.

**Arize** adds a managed platform: automatic embedding drift detection for LLMs, SHAP-based feature importance tracking, and alerting integrated with PagerDuty or Slack.

**Action on drift:**
1. Alert on-call team.
2. Inspect drifted features for upstream data pipeline issues.
3. If concept drift, trigger retraining pipeline with fresh labels.`,
      tags: ["monitoring", "drift", "evidently", "arize"],
    },
    {
      id: "ab-testing-models",
      title: "A/B testing models in production",
      difficulty: "medium",
      question: "How do you run an A/B test between two model versions in production?",
      answer: `**Goal:** determine whether the challenger model (B) outperforms the champion (A) on real traffic, with statistical confidence, before full rollout.

**Setup:**

1. **Traffic splitting** — a router (Nginx, Envoy, or application-layer logic) sends X% of requests to model A and (100-X)% to model B. Users are hashed on a stable key (user ID) so they always see the same model.

2. **Logging** — every prediction is logged with \`model_version\`, \`user_id\`, \`request_id\`, \`prediction\`, and \`timestamp\`. Outcomes (conversions, labels) are joined back later.

3. **Evaluation** — after sufficient sample size (power analysis determines this), compute the primary business metric and run a significance test (t-test, Mann-Whitney, or Bayesian posterior).

\`\`\`python
# Simple router with feature flags (e.g., using Unleash or LaunchDarkly)
def route_request(user_id: str, payload: dict) -> dict:
    bucket = hash(user_id) % 100
    model = champion_model if bucket < 90 else challenger_model
    result = model.predict(payload)
    log_prediction(user_id, model.version, result)
    return result
\`\`\`

**KServe InferenceGraph** natively supports traffic splitting:

\`\`\`yaml
apiVersion: serving.kserve.io/v1alpha1
kind: InferenceGraph
metadata:
  name: fraud-ab-test
spec:
  nodes:
    root:
      routerType: WeightedEnsemble
      steps:
        - serviceName: fraud-v1
          weight: 80
        - serviceName: fraud-v2
          weight: 20
\`\`\``,
      tags: ["a-b-testing", "production", "kserve"],
    },
    {
      id: "shadow-canary-deployment",
      title: "Shadow deployment and canary releases",
      difficulty: "medium",
      question: "What are shadow deployment and canary release strategies for ML models? When do you use each?",
      answer: `Both strategies reduce the risk of deploying a new model version.

**Shadow deployment (dark launch):**
- 100% of production traffic still goes to the champion model.
- Every request is *also* mirrored to the challenger model (asynchronously).
- Challenger predictions are logged but **never returned to users**.
- Use this when you want zero user-facing risk — ideal for the first sanity check of a new architecture.

\`\`\`python
import threading

def predict(payload):
    champion_result = champion_model.predict(payload)
    # Fire-and-forget shadow call
    threading.Thread(
        target=lambda: log_shadow(challenger_model.predict(payload)),
        daemon=True,
    ).start()
    return champion_result
\`\`\`

**Canary release:**
- A small percentage (e.g., 5%) of *real* users receive predictions from the challenger.
- Metrics (latency, error rate, business KPIs) are compared in real time.
- Traffic is gradually increased (5% → 20% → 50% → 100%) if metrics stay healthy, or the canary is rolled back automatically.

**Decision guide:**

| Situation | Strategy |
|-----------|----------|
| First production test of new model | Shadow |
| Validated offline but want measured rollout | Canary |
| Need statistical A/B significance | Full A/B test with hold-out |`,
      tags: ["deployment", "canary", "shadow"],
    },
    {
      id: "ci-cd-for-ml",
      title: "CI/CD for ML with GitHub Actions + DVC + MLflow",
      difficulty: "medium",
      question: "Describe a CI/CD pipeline for an ML project using GitHub Actions, DVC, and MLflow.",
      answer: `**Pipeline stages on every PR / merge to main:**

\`\`\`yaml
# .github/workflows/ml-pipeline.yml
name: ML CI/CD

on:
  push:
    branches: [main]
  pull_request:

jobs:
  train-and-evaluate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: Install dependencies
        run: pip install -r requirements.txt

      - name: Pull data with DVC
        env:
          AWS_ACCESS_KEY_ID: \${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: \${{ secrets.AWS_SECRET_ACCESS_KEY }}
        run: dvc pull

      - name: Run DVC pipeline (train + evaluate)
        run: dvc repro

      - name: Compare metrics and gate promotion
        env:
          MLFLOW_TRACKING_URI: \${{ secrets.MLFLOW_TRACKING_URI }}
        run: python scripts/promote_if_better.py
\`\`\`

**\`promote_if_better.py\`:**
\`\`\`python
import mlflow

client = mlflow.MlflowClient()
champion = client.get_model_version_by_alias("fraud-detector", "champion")
latest = client.search_model_versions("name='fraud-detector'")[0]

champion_f1 = float(client.get_run(champion.run_id).data.metrics["f1"])
latest_f1 = float(client.get_run(latest.run_id).data.metrics["f1"])

if latest_f1 > champion_f1 + 0.005:  # 0.5 pp improvement gate
    client.set_registered_model_alias("fraud-detector", "champion", latest.version)
    print(f"Promoted v{latest.version} (f1={latest_f1:.4f})")
else:
    raise SystemExit(f"Did not improve: {latest_f1:.4f} vs {champion_f1:.4f}")
\`\`\`

DVC caches intermediate stages, so unchanged steps (e.g., preprocessing) are skipped, making CI fast.`,
      tags: ["ci-cd", "github-actions", "dvc", "mlflow"],
    },
    {
      id: "model-serving-options",
      title: "Model serving options",
      difficulty: "medium",
      question: "Compare REST (FastAPI), gRPC, and batch inference as serving patterns. What drives the choice?",
      answer: `**REST with FastAPI**
- Familiar HTTP/JSON interface; easy to call from any language.
- Higher payload overhead than binary protocols.
- Good default for internal microservices and external APIs.
- Latency: ~5–20 ms overhead per call for JSON serialization.

**gRPC**
- Uses Protocol Buffers (binary) — 3–10× smaller payloads, ~2× lower latency vs REST for equivalent logic.
- Strongly typed contracts via \`.proto\` files.
- Preferred for high-throughput internal services and when the client is also Python/Go/Java.

\`\`\`protobuf
service FraudDetector {
  rpc Predict (PredictRequest) returns (PredictResponse);
}
message PredictRequest { repeated float features = 1; }
message PredictResponse { float fraud_probability = 1; }
\`\`\`

**Batch inference**
- No persistent server; a job reads a dataset, runs the model, writes predictions.
- Highest throughput, lowest cost per prediction.
- Latency is hours — unacceptable for real-time needs.

**Decision matrix:**

| Requirement | Recommended |
|-------------|-------------|
| External or browser clients | REST / FastAPI |
| High-throughput internal service | gRPC |
| Pre-computed predictions, not time-sensitive | Batch (Ray, Spark) |
| LLM text generation | vLLM (OpenAI-compatible REST + streaming) |`,
      tags: ["serving", "fastapi", "grpc", "batch"],
    },
    {
      id: "kubernetes-for-ml",
      title: "Kubernetes for ML: KServe and Seldon",
      difficulty: "medium",
      question: "How does Kubernetes simplify ML model serving? What do KServe and Seldon add?",
      answer: `Kubernetes provides **auto-scaling, health checks, rolling updates, and resource isolation** — all critical for reliable model serving. But raw Kubernetes requires you to write Deployments, Services, HPAs, and Ingress rules manually for every model.

**KServe** (formerly KFServing) abstracts this into a single \`InferenceService\` CRD:

\`\`\`yaml
apiVersion: serving.kserve.io/v1beta1
kind: InferenceService
metadata:
  name: fraud-detector
spec:
  predictor:
    model:
      modelFormat:
        name: sklearn
      storageUri: s3://my-bucket/models/fraud-detector/champion
  minReplicas: 1
  maxReplicas: 10
\`\`\`

KServe handles:
- Model download from S3/GCS
- Container startup with the correct runtime (SKLearn Server, Triton, vLLM)
- Knative-based scale-to-zero
- Canary traffic splitting via InferenceGraph

**Seldon Core** is an alternative with a focus on enterprise features: A/B test routing, outlier detection sidecars, and explainability endpoints via Alibi.

**GPU autoscaling** is the killer feature for LLM workloads: KServe integrates with KEDA to scale pods based on inference queue depth, ensuring GPU nodes spin up only when needed.`,
      tags: ["kubernetes", "kserve", "seldon"],
    },
    {
      id: "online-vs-offline-evaluation",
      title: "Online vs offline evaluation",
      difficulty: "medium",
      question: "What is the difference between offline and online evaluation for ML models?",
      answer: `**Offline evaluation** happens before deployment using a held-out dataset.

- Metrics: accuracy, F1, AUROC, RMSE, NDCG — computed against ground-truth labels.
- Fast to iterate; no user risk.
- **Limitation:** metrics on historical data may not reflect real user behavior (popularity bias, distribution shift, label quality).

\`\`\`python
from sklearn.metrics import roc_auc_score, classification_report

y_pred_proba = model.predict_proba(X_test)[:, 1]
print(f"AUROC: {roc_auc_score(y_test, y_pred_proba):.4f}")
print(classification_report(y_test, model.predict(X_test)))
\`\`\`

**Online evaluation** happens in production with real users.

- Metrics: click-through rate, conversion, revenue, user retention, task completion.
- Requires A/B testing or interleaving for causal attribution.
- Ground truth labels may arrive with delay (e.g., fraud confirmed days after transaction).

**The gap:** a model that improves offline AUROC by 2% may have zero impact on online revenue if the model was already well-calibrated in the relevant score range.

**Best practice:** use offline evaluation as a **gate** (reject regressions), use online evaluation as the **source of truth** for business decisions.`,
      tags: ["evaluation", "metrics"],
    },
    {
      id: "llm-prompt-versioning",
      title: "LLM prompt versioning",
      difficulty: "medium",
      question: "Why is prompt versioning important for LLM applications, and how do you implement it?",
      answer: `LLM behavior is determined by both the **model weights** and the **prompt**. Changing a prompt is equivalent to changing code — without versioning, you cannot reproduce past behavior, roll back regressions, or compare prompt variants systematically.

**What to version:**
- System prompt text and version tag
- Few-shot examples
- Output schema / function calling spec
- Model ID and temperature

**Simple file-based approach:**

\`\`\`
prompts/
  fraud-explainer/
    v1.0.0.yaml
    v1.1.0.yaml   ← current production
    v2.0.0.yaml   ← staging
\`\`\`

\`\`\`yaml
# prompts/fraud-explainer/v1.1.0.yaml
version: "1.1.0"
model: claude-sonnet-4-6
temperature: 0.2
system: |
  You are a fraud analyst assistant. Given transaction features,
  explain in plain English why the model flagged this transaction.
  Be concise (≤3 sentences). Do not speculate beyond the data provided.
few_shot:
  - user: "amount=5000, country=NG, time=03:00"
    assistant: "Flagged due to unusually large amount combined with
                an atypical geography and off-hours timing."
\`\`\`

\`\`\`python
import yaml, pathlib

def load_prompt(name: str, version: str) -> dict:
    path = pathlib.Path(f"prompts/{name}/{version}.yaml")
    return yaml.safe_load(path.read_text())
\`\`\`

**Managed alternatives:** LangSmith Hub, Weights & Biases Prompts, and Anthropic's prompt management API all provide diff views, deployment history, and A/B testing of prompt variants.`,
      tags: ["llm", "prompt-versioning"],
    },

    // ───── HARD ─────
    {
      id: "vllm-llm-serving",
      title: "vLLM for LLM serving",
      difficulty: "hard",
      question: "How does vLLM achieve high-throughput LLM serving? Explain continuous batching and PagedAttention.",
      answer: `By 2026 vLLM is the de-facto standard for self-hosted LLM serving, replacing naive single-request inference loops.

**Problem with naive serving:**
Each LLM request generates tokens one at a time (auto-regressive). A standard server processes one request until it finishes, leaving the GPU idle during I/O and wasting memory on pre-allocated KV-cache buffers.

---

**PagedAttention**

The KV-cache (past key/value tensors) traditionally requires a contiguous memory block pre-allocated to the maximum sequence length, causing:
- **Internal fragmentation:** most requests finish early, wasting the tail.
- **External fragmentation:** new requests can't start because no large contiguous block is free.

PagedAttention treats KV-cache like OS virtual memory:
- Memory is divided into fixed-size **pages** (blocks).
- Each sequence is assigned a **page table** mapping logical positions to physical blocks.
- Blocks from finished sequences are immediately reclaimed.
- **Copy-on-write** allows multiple requests sharing a prefix (e.g., same system prompt) to reference the same physical blocks.

Result: ~2–4× more concurrent sequences in the same GPU VRAM.

---

**Continuous batching (iteration-level scheduling)**

Traditional static batching waits until a full batch of requests arrives before starting — high latency for early arrivals. Continuous batching inserts new requests into an **already-running batch** at any token generation step:

\`\`\`
Step 0: batch = [req_A(t=0), req_B(t=0), req_C(t=0)]
Step 3: req_A finishes → slot freed
Step 3: req_D joins  → batch = [req_B(t=3), req_C(t=3), req_D(t=0)]
\`\`\`

This keeps the GPU fully occupied without waiting for the slowest request.

---

**Running vLLM:**

\`\`\`bash
pip install vllm

# OpenAI-compatible server
python -m vllm.entrypoints.openai.api_server \
  --model meta-llama/Llama-3.1-70B-Instruct \
  --tensor-parallel-size 4 \
  --max-model-len 32768 \
  --gpu-memory-utilization 0.92
\`\`\`

\`\`\`python
from openai import OpenAI

client = OpenAI(base_url="http://localhost:8000/v1", api_key="ignored")
response = client.chat.completions.create(
    model="meta-llama/Llama-3.1-70B-Instruct",
    messages=[{"role": "user", "content": "Summarize this contract..."}],
    max_tokens=512,
)
\`\`\`

**Throughput gains vs naive serving:** typically 10–24× more tokens/second on the same hardware, depending on request mix and sequence lengths.`,
      tags: ["llm", "vllm", "serving", "performance"],
    },
    {
      id: "llm-evaluation-pipelines",
      title: "LLM evaluation pipelines",
      difficulty: "hard",
      question: "How do you build a rigorous evaluation pipeline for LLM applications in production?",
      answer: `LLM evaluation is harder than classical ML because outputs are open-ended text — there is no single ground-truth number.

**Four evaluation layers:**

### 1. Unit tests (deterministic)
Test exact behaviors that must always hold: JSON schema validity, no PII in output, response length bounds, refusal on injections.

\`\`\`python
import pytest, json

def test_output_is_valid_json(llm_client, prompt):
    response = llm_client.complete(prompt)
    data = json.loads(response)  # raises if invalid
    assert "summary" in data
    assert len(data["summary"]) <= 500
\`\`\`

### 2. Benchmark datasets (offline)
Curate a golden dataset of (input, expected_output) pairs. Use an LLM-as-judge or embedding similarity to score outputs.

\`\`\`python
# LLM-as-judge pattern
def judge(question: str, reference: str, candidate: str) -> float:
    prompt = f"""Rate how well the candidate answer matches the reference.
Reference: {reference}
Candidate: {candidate}
Output a score 0.0-1.0 only."""
    return float(judge_model.complete(prompt).strip())
\`\`\`

### 3. Online A/B evaluation
Route a fraction of production traffic to the new prompt/model version. Measure user-facing signals: thumbs up/down, task completion, retry rate, session length.

### 4. Regression detection
On every CI run, re-run the benchmark suite. Block promotion if the score drops >2% on any critical dimension (faithfulness, safety, format compliance).

**Tools in 2026:**
- **LangSmith** — tracing, dataset management, automated evals
- **Braintrust** — eval pipelines with human review UI
- **Arize Phoenix** — LLM observability with embedding clustering
- **MLflow 3.x** — now has a built-in LLM evaluation API (\`mlflow.evaluate\` with \`model_type="question-answering"\`)

\`\`\`python
import mlflow

with mlflow.start_run():
    results = mlflow.evaluate(
        model="runs:/abc123/model",
        data=eval_df,          # columns: inputs, ground_truth
        targets="ground_truth",
        model_type="question-answering",
        evaluators=["default"],
    )
    print(results.metrics)  # rouge1, rouge2, rougeL, toxicity, ...
\`\`\``,
      tags: ["llm", "evaluation", "mlflow"],
    },
    {
      id: "llm-cost-tracking",
      title: "LLM cost tracking per model and user",
      difficulty: "hard",
      question: "How do you track and control LLM inference costs per model and per user in a production system?",
      answer: `LLM costs are dominated by token counts: **prompt tokens + completion tokens × price/token**. Without per-request tracking, costs are invisible until the monthly cloud bill arrives.

**Instrumentation — middleware approach:**

\`\`\`python
from fastapi import FastAPI, Request
from openai import AsyncOpenAI
import time, asyncio
from dataclasses import dataclass

app = FastAPI()
client = AsyncOpenAI()

@dataclass
class UsageRecord:
    user_id: str
    model: str
    prompt_tokens: int
    completion_tokens: int
    latency_ms: float
    cost_usd: float

PRICES = {  # per 1M tokens, 2026 approximate
    "gpt-4o": {"input": 2.50, "output": 10.00},
    "claude-sonnet-4-6": {"input": 3.00, "output": 15.00},
    "meta-llama/Llama-3.1-70B-Instruct": {"input": 0.35, "output": 0.40},
}

async def tracked_completion(user_id: str, model: str, messages: list) -> str:
    t0 = time.monotonic()
    response = await client.chat.completions.create(
        model=model, messages=messages
    )
    latency = (time.monotonic() - t0) * 1000
    usage = response.usage
    price = PRICES.get(model, {"input": 0, "output": 0})
    cost = (
        usage.prompt_tokens * price["input"] / 1_000_000
        + usage.completion_tokens * price["output"] / 1_000_000
    )
    record = UsageRecord(
        user_id=user_id,
        model=model,
        prompt_tokens=usage.prompt_tokens,
        completion_tokens=usage.completion_tokens,
        latency_ms=latency,
        cost_usd=cost,
    )
    await write_to_warehouse(record)  # BigQuery, ClickHouse, etc.
    return response.choices[0].message.content
\`\`\`

**Aggregation and alerting:**

\`\`\`sql
-- Daily cost per user, last 7 days
SELECT user_id,
       SUM(cost_usd)           AS total_cost,
       SUM(prompt_tokens)      AS prompt_tokens,
       SUM(completion_tokens)  AS completion_tokens,
       COUNT(*)                AS request_count
FROM llm_usage
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY user_id
ORDER BY total_cost DESC;
\`\`\`

**Rate limiting and budgets:**
- Store a rolling token budget per user in Redis; reject or downgrade (switch to a cheaper model) when the budget is exceeded.
- Alert on anomalous cost spikes (>3× rolling average) via PagerDuty.

**Managed tools:** LangSmith, Helicone, and OpenMeter all provide out-of-the-box cost dashboards and per-user quota enforcement without custom instrumentation.`,
      tags: ["llm", "cost-tracking", "observability"],
    },
    {
      id: "model-lineage-governance",
      title: "Model versioning, lineage, and governance",
      difficulty: "hard",
      question: "What is model lineage, why does it matter for governance, and how do you implement it end-to-end?",
      answer: `**Model lineage** is the full directed acyclic graph (DAG) of every artifact and decision that produced a model version:

\`\`\`
raw data (S3 path + hash)
  └─ preprocessing code (git commit abc123)
       └─ training dataset (DVC hash)
            └─ training run (MLflow run_id)
                 ├─ hyper-parameters
                 ├─ environment (Docker image sha256)
                 └─ model artifact (MLflow model URI)
                      └─ deployment (K8s InferenceService, timestamp)
\`\`\`

**Why it matters:**
- **Debugging:** "Why did fraud rates spike on March 3?" → trace to a dataset shift at that date.
- **Compliance:** GDPR right-to-erasure requires knowing which training rows contained a user's data.
- **Auditability:** financial regulators (SR 11-7) require documenting model development decisions.

**Implementation with MLflow 3.x:**

\`\`\`python
import mlflow

with mlflow.start_run() as run:
    # Log data lineage
    mlflow.log_param("dataset_dvc_hash", "a3f9b2c")
    mlflow.log_param("dataset_s3_uri", "s3://data/train_2026-03-01.parquet")
    mlflow.log_param("git_commit", subprocess.check_output(["git", "rev-parse", "HEAD"]).decode().strip())
    mlflow.log_param("docker_image", "ghcr.io/myorg/trainer:sha256-abc")

    # Train
    model.fit(X_train, y_train)
    mlflow.sklearn.log_model(model, "model", registered_model_name="fraud-detector")

    # Tag the run
    mlflow.set_tags({
        "team": "risk",
        "regulation": "SR11-7",
        "data_contains_pii": "false",
    })
\`\`\`

**Model cards:** document intended use, known limitations, training data demographics, and evaluation results. Store as a versioned artifact alongside the model.

\`\`\`python
mlflow.log_artifact("model_card.md")
\`\`\`

**Automated governance gates in CI:**
1. Check that dataset hash is registered in the data catalog before training.
2. Require sign-off (PR approval) from a second team member before promoting to \`champion\`.
3. Enforce model card completeness check — fail the pipeline if required fields are missing.`,
      tags: ["governance", "lineage", "mlflow", "compliance"],
    },
    {
      id: "advanced-monitoring-retraining",
      title: "Advanced monitoring and automated retraining",
      difficulty: "hard",
      question: "Design a production monitoring system that automatically triggers retraining when model performance degrades.",
      answer: `A robust monitoring-to-retraining loop requires three components: a metrics pipeline, a degradation detector, and a retraining orchestrator.

**Architecture overview:**

\`\`\`
Production requests
  → Prediction logger (Kafka / Kinesis)
  → Feature + prediction store (ClickHouse)
  → Drift detector (Evidently scheduled job)
  → Alert router (Prometheus → AlertManager)
  → Retraining trigger (GitHub Actions / Kubeflow Pipeline)
  → Model evaluator (MLflow evaluate)
  → Promotion gate (champion vs challenger comparison)
  → Registry update (set alias "champion")
  → Deployment rollout (KServe)
\`\`\`

**Drift detection job (runs hourly):**

\`\`\`python
from evidently.report import Report
from evidently.metric_preset import DataDriftPreset
from evidently.test_suite import TestSuite
from evidently.tests import TestShareOfDriftedColumns
import clickhouse_connect, prometheus_client

client = clickhouse_connect.get_client(host="clickhouse")

reference_df = load_reference_window()  # last 30 days of stable data
current_df = client.query_df(
    "SELECT * FROM predictions WHERE ts > now() - INTERVAL 1 HOUR"
)

suite = TestSuite(tests=[
    TestShareOfDriftedColumns(lt=0.3),  # fail if >30% of features drift
])
suite.run(reference_data=reference_df, current_data=current_df)

drift_share = suite.as_dict()["summary"]["failed_tests"]
DRIFT_GAUGE.set(drift_share)  # push to Prometheus

if not suite.as_dict()["summary"]["all_passed"]:
    trigger_retraining_pipeline()
\`\`\`

**Retraining pipeline (GitHub Actions):**

\`\`\`yaml
on:
  repository_dispatch:
    types: [drift-detected]

jobs:
  retrain:
    steps:
      - name: Pull latest data
        run: dvc pull --run-cache

      - name: Run pipeline
        run: dvc repro --force train evaluate

      - name: Gate: must beat champion by 1pp F1
        run: python scripts/promote_if_better.py --min-delta 0.01

      - name: Deploy if promoted
        run: kubectl apply -f k8s/inference-service.yaml
\`\`\`

**Label latency challenge:** for many tasks (fraud, churn) ground-truth labels arrive days or weeks late. Mitigations:
- Use **proxy labels** (chargebacks filed within 3 days) for fast feedback.
- Maintain a **holdout window** — never retrain on data from the last N days to avoid leakage.
- Track **prediction stability** (how often the model changes its mind on the same input over time) as a label-free degradation signal.`,
      tags: ["monitoring", "retraining", "automation", "evidently"],
    },
  ],
};
