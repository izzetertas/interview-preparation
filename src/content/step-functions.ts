import type { Category } from "./types";

export const stepFunctions: Category = {
  slug: "step-functions",
  title: "Step Functions",
  description:
    "AWS Step Functions: state machines, ASL, Standard vs Express, integration patterns, error handling, retries, parallel/map states, and observability.",
  icon: "🪜",
  questions: [
    {
      id: "what-are-step-functions",
      title: "What are Step Functions?",
      difficulty: "easy",
      question: "What is AWS Step Functions and what problem does it solve?",
      answer: `**AWS Step Functions** is a serverless **workflow orchestration** service. You define **state machines** in **Amazon States Language (ASL)** — a JSON DSL — and Step Functions runs them, calling AWS services or Lambdas at each step, handling retries, parallel branches, errors, and state passing.

**Problems it solves:**
- Multi-step business workflows (order → payment → fulfillment → notify).
- Glue together AWS services without writing orchestration code in Lambdas.
- Long-running processes (up to 1 year for Standard workflows).
- Approval flows, callbacks, human-in-the-loop.
- ETL pipelines spanning multiple services.

**Why not just chain Lambdas with SQS/EventBridge?**
- **Visibility** — you see the entire workflow as a graph.
- **State management** — Step Functions tracks every step's input/output for replay/debug.
- **Built-in error handling** — retries, catches, fallbacks declarative.
- **Long execution time** — Lambdas cap at 15 min; Step Functions can run for a year.

**Two flavors:**
- **Standard** — durable, exactly-once, up to 1 year, state stored, ~25 RPS per state machine.
- **Express** — high-throughput (100k RPS), at-least-once, max 5 min, no UI history (logs only).`,
      tags: ["fundamentals"],
    },
    {
      id: "asl",
      title: "Amazon States Language (ASL)",
      difficulty: "medium",
      question: "What is ASL and what are the state types?",
      answer: `**ASL** is the JSON-based DSL describing a state machine.

\`\`\`json
{
  "StartAt": "ProcessOrder",
  "States": {
    "ProcessOrder": {
      "Type": "Task",
      "Resource": "arn:aws:states:::lambda:invoke",
      "Parameters": { "FunctionName": "ProcessOrder", "Payload.\$": "\$" },
      "ResultPath": "\$.processed",
      "Next": "Charge"
    },
    "Charge": { ... }
  }
}
\`\`\`

**State types:**
- **Task** — call a service (Lambda, SNS, SQS, ECS, Glue, Athena, etc.) or do work.
- **Choice** — branch based on input (\`if/else\`).
- **Wait** — pause for a duration or until a timestamp.
- **Parallel** — run multiple branches concurrently; converge.
- **Map** — apply a sub-workflow to each item in an array (with concurrency control).
- **Pass** — transform input/output without doing work.
- **Succeed** / **Fail** — terminal states.

**Key fields:**
- \`InputPath\` / \`Parameters\` — what reaches the state.
- \`ResultPath\` — where to put the result in the state's output.
- \`OutputPath\` — what to forward to the next state.
- \`Retry\` / \`Catch\` — error handling.

ASL is verbose; **CDK / SAM / Step Functions Workflow Studio** generate it for you. Few teams hand-write JSON for big workflows.`,
      tags: ["fundamentals"],
    },
    {
      id: "standard-vs-express",
      title: "Standard vs Express workflows",
      difficulty: "medium",
      question: "What's the difference between Standard and Express workflows?",
      answer: `| Feature              | Standard                                  | Express                                       |
|----------------------|-------------------------------------------|-----------------------------------------------|
| Max duration         | 1 year                                    | 5 minutes                                      |
| Pricing              | Per state transition                      | Per execution + duration + memory              |
| Throughput           | ~25 executions/sec                        | 100,000 executions/sec                         |
| Execution semantics  | **Exactly-once**                          | **At-least-once** (or at-most-once for sync)   |
| Execution history    | Stored, queryable in console for 90 days  | Logs in CloudWatch only                        |
| Use case             | Long-running, durable workflows           | High-volume, short-lived workflows             |

**Express invocation modes:**
- **Async** — fire and forget; at-least-once.
- **Sync** — synchronous response (HTTP-style); at-most-once.

**Pick Standard for:**
- Approval workflows (waits hours/days).
- Long ETL jobs.
- Order processing with audit trail.
- Anything you debug interactively in the console.

**Pick Express for:**
- API request orchestration (sync express).
- High-volume event processing.
- IoT data pipelines.

**Pricing surprise:** Standard is **\$25 per million state transitions**. A workflow with 10 states is \$0.25 per 1M executions. Express is much cheaper for volume but you lose the visual history.`,
      tags: ["fundamentals"],
    },
    {
      id: "service-integrations",
      title: "Service integrations and patterns",
      difficulty: "medium",
      question: "How does Step Functions integrate with AWS services?",
      answer: `Step Functions has **direct integrations** with 200+ AWS services. The integration **pattern** controls how Step Functions waits for the response.

**Three patterns** (specified in Resource ARN):

**1. Request/Response** — \`arn:aws:states:::lambda:invoke\`
- Call API → continue immediately.
- For sync APIs: returns response.
- For async APIs (SQS SendMessage): just confirms send.

**2. Run a Job (.sync)** — \`arn:aws:states:::ecs:runTask.sync\`
- Step Functions polls until the underlying job completes.
- Used for ECS Run Task, Batch jobs, EMR steps, Glue jobs, SageMaker training.
- Step Functions **waits**; no Lambda hop needed.

**3. Wait for callback (.waitForTaskToken)** — \`arn:aws:states:::sqs:sendMessage.waitForTaskToken\`
- Step Functions sends a **task token** with the request.
- Receiver does work, then calls \`SendTaskSuccess(taskToken, output)\` or \`SendTaskFailure\`.
- Used for **human approval** flows, external system callbacks, manual gates.
- Can wait up to 1 year.

**Why this matters:**
- Direct integrations remove the need for **glue Lambdas**.
- Lambdas only when you have business logic, not when calling another AWS service.
- Saves cost (Lambda invocations) and reduces latency.

**Workflow Studio** (visual editor) makes picking the right ARN/parameters easy.`,
      tags: ["integration"],
    },
    {
      id: "error-handling",
      title: "Error handling: Retry and Catch",
      difficulty: "medium",
      question: "How do retries and catches work in Step Functions?",
      answer: `Each Task / Parallel / Map state can declare **\`Retry\`** and **\`Catch\`** policies.

\`\`\`json
{
  "Type": "Task",
  "Resource": "arn:aws:states:::lambda:invoke",
  "Parameters": { ... },
  "Retry": [
    {
      "ErrorEquals": ["Lambda.ServiceException", "Lambda.TooManyRequestsException"],
      "IntervalSeconds": 2,
      "MaxAttempts": 3,
      "BackoffRate": 2.0,
      "JitterStrategy": "FULL"
    },
    {
      "ErrorEquals": ["States.ALL"],
      "MaxAttempts": 2
    }
  ],
  "Catch": [
    {
      "ErrorEquals": ["CustomBusinessError"],
      "ResultPath": "\$.error",
      "Next": "HandleBusinessError"
    },
    {
      "ErrorEquals": ["States.ALL"],
      "Next": "FailGracefully"
    }
  ]
}
\`\`\`

**Behavior:**
- **Retry** rules try in order; first match controls the retry policy.
- **Backoff** with optional **jitter** (full jitter recommended for thundering herd).
- After retries exhausted, **Catch** rules trigger.
- If no Catch, the state machine fails.

**Built-in error names:**
- \`States.ALL\` — wildcard.
- \`States.Timeout\`, \`States.TaskFailed\`, \`States.Permissions\`, \`States.DataLimitExceeded\`.
- Lambda-specific: \`Lambda.ServiceException\`, \`Lambda.TooManyRequestsException\`.
- Custom errors thrown from Lambda: match by name.

**Best practices:**
- Retry transient errors (\`TooManyRequests\`, \`ServiceException\`); don't retry validation failures.
- Always have a final \`States.ALL\` catch to terminate gracefully.
- Set **TimeoutSeconds** on every Task — fail fast on hung dependencies.`,
      tags: ["reliability"],
    },
    {
      id: "parallel-map",
      title: "Parallel and Map states",
      difficulty: "medium",
      question: "What are Parallel and Map states?",
      answer: `**Parallel** — run multiple branches **concurrently**; aggregate results.

\`\`\`json
{
  "Type": "Parallel",
  "Branches": [
    { "StartAt": "FetchUser",   "States": { ... } },
    { "StartAt": "FetchOrders", "States": { ... } },
    { "StartAt": "FetchCart",   "States": { ... } }
  ],
  "Next": "Combine"
}
\`\`\`
- Each branch runs simultaneously.
- Output is an array of branch results, in branch order.
- If any branch fails (and isn't caught), the Parallel fails.

**Map** — apply a sub-workflow to **each element** of an input array.

\`\`\`json
{
  "Type": "Map",
  "ItemsPath": "\$.orders",
  "MaxConcurrency": 10,
  "ItemProcessor": {
    "StartAt": "ProcessOrder",
    "States": { "ProcessOrder": { "Type": "Task", ... } }
  }
}
\`\`\`

**Distributed Map** (newer) — handles **massive arrays** (millions of items):
- Reads input from S3 (CSV/JSON).
- Up to **10,000 concurrent** child executions.
- Each child is a Standard or Express sub-workflow.
- Use cases: process every file in a bucket, batch-update millions of items.

**Inline Map vs Distributed Map:**
- **Inline** — small batches, items live in execution state, < 256 KB total.
- **Distributed** — large datasets, items in S3, separate child executions, full Distributed Map console.

**Concurrency tuning:**
- \`MaxConcurrency\` controls parallelism — too high overwhelms downstream; too low slows the job.
- Start with 10-50; tune based on downstream rate limits.`,
      tags: ["patterns"],
    },
    {
      id: "wait-for-callback",
      title: "Wait for callback (task tokens)",
      difficulty: "hard",
      question: "How do task tokens enable human-in-the-loop workflows?",
      answer: `**Task token pattern** lets a state machine pause indefinitely while an external system (human approver, third-party service, SaaS webhook) does its work.

**Flow:**
1. Step Functions task includes \`.waitForTaskToken\` integration.
2. Step Functions sends a message (SQS, SNS, Lambda, EventBridge, etc.) with a unique **task token**.
3. State machine **pauses** (no compute, no charge per second).
4. External system processes; when done, it calls **\`SendTaskSuccess(token, output)\`** or **\`SendTaskFailure(token, error, cause)\`**.
5. State machine resumes from where it paused.

\`\`\`json
{
  "Type": "Task",
  "Resource": "arn:aws:states:::sqs:sendMessage.waitForTaskToken",
  "Parameters": {
    "QueueUrl": "https://sqs...",
    "MessageBody": {
      "Input.\$": "\$",
      "TaskToken.\$": "\$\$.Task.Token"
    }
  }
}
\`\`\`

**Use cases:**
- **Approval workflows** — manager approves a leave request via UI; UI calls SendTaskSuccess.
- **Long-running external API** — submit job, poll-style done callback.
- **Manual data fixes** — step pauses; ops dashboard resumes when ready.

**Limits:**
- Task tokens valid for **1 year** max.
- One token per task instance.
- Lost tokens cause permanent waits (use \`HeartbeatSeconds\` to detect).

**\`HeartbeatSeconds\`** — periodic keep-alive from the worker; if missed, Step Functions fails the task. Useful for ECS / external worker patterns.

**Cost:** while waiting, no state transitions are charged. Resuming costs one transition.`,
      tags: ["advanced", "patterns"],
    },
    {
      id: "input-output-paths",
      title: "Input/output processing",
      difficulty: "medium",
      question: "How do InputPath, Parameters, ResultPath, and OutputPath work?",
      answer: `Step Functions has **four** transformation steps inside each state:

\`\`\`
incoming JSON
   ↓ InputPath        — slice into the part this state cares about
   ↓ Parameters       — restructure into the call's expected shape
   [Task runs]
   ↓ ResultSelector   — reshape the result
   ↓ ResultPath       — where in the original input to attach the result
   ↓ OutputPath       — slice for the next state
outgoing JSON
\`\`\`

**Quick reference:**
- **InputPath** — \`"\$"\` (default, all). Use to focus on a sub-object.
- **Parameters** — build the *task input* with constants and JSON-Path / intrinsic functions.
- **ResultPath** — \`"\$"\` (replace input) vs \`"\$.someField"\` (merge alongside) vs \`null\` (discard result).
- **OutputPath** — final slice before passing to next state.

**Common patterns:**

**Pass through original input + new result:**
\`\`\`json
"ResultPath": "\$.processed"
\`\`\`
Input \`{ a: 1 }\` + result \`{ ok: true }\` → output \`{ a: 1, processed: { ok: true } }\`.

**Discard result, keep input:**
\`\`\`json
"ResultPath": null
\`\`\`

**Replace entirely:**
\`\`\`json
"ResultPath": "\$"
\`\`\`

**Intrinsic functions** — \`States.Format\`, \`States.JsonToString\`, \`States.UUID\`, \`States.Hash\`, etc. Avoid Lambda calls for trivial string ops.

**Tip:** test with the **Workflow Studio simulator** — pasting input and seeing output of each transformation step is invaluable.`,
      tags: ["fundamentals"],
    },
    {
      id: "express-sync",
      title: "Synchronous Express workflows",
      difficulty: "medium",
      question: "When should you use Sync Express workflows?",
      answer: `**Sync Express** is the third execution mode (alongside Standard and async Express). The caller waits for the workflow to finish and gets the result back synchronously.

\`\`\`
client → API Gateway → StartSyncExecution → state machine runs → response
\`\`\`

**Properties:**
- Up to **5 minutes** total runtime.
- HTTP-friendly response — useful for API request orchestration.
- **At-most-once** semantics (vs at-least-once for async Express).
- Cheaper than Standard for similar use cases.
- No execution history beyond logs.

**Use cases:**
- **API orchestration** — single API call coordinates 3-5 service calls + business logic.
- **Synchronous fan-out + aggregate** — fetch from N services in parallel, return combined result.
- **Validation pipelines** — multiple checks, return verdict.

**Why prefer over a Lambda doing the orchestration:**
- Visual workflow + retries + error handling declarative.
- Each step's input/output is observable in CloudWatch Logs.
- No code to maintain for the glue.

**Why prefer over Standard:**
- Standard's per-state-transition cost adds up; Sync Express is per-execution.
- Standard's API is async; Sync Express returns immediately when done.

**Limits:**
- 5 min — don't use for long workflows.
- 256 KB input/output — for bigger payloads, use S3 pointers.

**API Gateway integration:** native — pick "Step Functions" as the integration type and "Sync Express" mode.`,
      tags: ["patterns"],
    },
    {
      id: "logging-monitoring",
      title: "Logging and monitoring",
      difficulty: "medium",
      question: "How do you observe Step Functions executions?",
      answer: `**Built-in observability:**

**Standard workflows:**
- Console shows the **execution graph** with each state colored by status.
- Click any state to see input, output, errors, timing.
- **History** retained 90 days.

**Express workflows:**
- No graph history — only **CloudWatch Logs** (configure log level: ALL, ERROR, FATAL, OFF).
- Logs include state input, output, errors.

**CloudWatch metrics (per state machine):**
- \`ExecutionsStarted\`, \`ExecutionsSucceeded\`, \`ExecutionsFailed\`, \`ExecutionsAborted\`, \`ExecutionsTimedOut\`.
- \`ExecutionThrottled\` — hitting concurrency limits.
- \`ProvisionedRefillRate\` for hot workflows (provisioned concurrency).
- Per-activity / per-Lambda task metrics.

**X-Ray tracing:**
- Enable on the state machine.
- See traces across Step Functions → Lambda → downstream.
- Correlate latency between states.

**Alerting:**
- Alarm on failure rate > X%.
- Alarm on average duration anomalies.
- Specific catch-state metric: number of times a Catch fired.

**Distributed Map specifically:**
- Per-iteration metrics in the dedicated UI.
- Failed item reports in S3 for replay.

**Cost of logs:**
- Standard logs are minimal; Express ALL-level can be heavy at high throughput. Use ERROR level in prod, ALL in dev.

**Pro tip:** include a **correlation ID** (e.g. order ID) in input. Search CloudWatch Logs by it across services.`,
      tags: ["observability"],
    },
    {
      id: "saga-pattern",
      title: "Saga pattern with Step Functions",
      difficulty: "hard",
      question: "How do you implement the saga pattern in Step Functions?",
      answer: `A **saga** is a sequence of local transactions, each with a compensating action that undoes its effect if a later step fails. Step Functions is the canonical AWS way to implement it.

\`\`\`
Book flight  ──fail──>  (no compensation needed)
   ↓ ok
Book hotel   ──fail──>  cancel flight
   ↓ ok
Charge card  ──fail──>  cancel hotel + cancel flight
   ↓ ok
done
\`\`\`

**Implementation:**
- Each step is a **Task** state.
- A **Catch** at each step routes to a compensation chain.
- Compensation chain calls "undo" actions for previously-completed steps.

\`\`\`json
{
  "States": {
    "BookFlight": { "Type": "Task", "Catch": [{ "ErrorEquals": ["States.ALL"], "Next": "FailNoOp" }], "Next": "BookHotel" },
    "BookHotel":  { "Type": "Task", "Catch": [{ "ErrorEquals": ["States.ALL"], "Next": "CancelFlight" }], "Next": "ChargeCard" },
    "ChargeCard": { "Type": "Task", "Catch": [{ "ErrorEquals": ["States.ALL"], "Next": "CancelHotel" }], "End": true },
    "CancelFlight": { "Type": "Task", "Resource": "...", "End": true },
    "CancelHotel":  { "Type": "Task", "Next": "CancelFlight" }
  }
}
\`\`\`

**Why Step Functions excels:**
- Compensation logic is **declarative**, visible in the graph.
- State machine guarantees compensation runs even if the orchestrator crashes (Standard durability).
- Built-in retry per step.
- Audit trail showing whether compensation completed.

**Idempotency** is essential — compensation must be safe to retry.

**Alternatives:**
- **Choreography** (events between services) — decentralized, harder to trace.
- **Custom orchestrator in code** — fragile; reinventing Step Functions.

For multi-service business workflows where atomicity matters but distributed transactions don't fit, sagas in Step Functions are the modern AWS answer.`,
      tags: ["patterns", "advanced"],
    },
    {
      id: "iam-permissions",
      title: "IAM permissions",
      difficulty: "medium",
      question: "How do IAM permissions work for Step Functions?",
      answer: `**Two roles to think about:**

**1. Execution role (the state machine's role):**
- Step Functions assumes this role to perform tasks.
- Needs **\`lambda:InvokeFunction\`** for Lambda tasks.
- Needs service-specific permissions for direct integrations (\`sqs:SendMessage\`, \`dynamodb:PutItem\`, \`s3:PutObject\`, etc.).
- For \`.sync\` and \`.waitForTaskToken\` integrations, additional permissions sometimes needed (e.g. \`states:StartExecution\` for child workflows).

**2. Caller role (whoever starts the execution):**
- Needs \`states:StartExecution\` (or \`StartSyncExecution\`).
- Pass-through to the state machine — caller doesn't need permissions for the state machine's tasks.

**Principle of least privilege:**
- Grant exactly what each Task needs — \`lambda:InvokeFunction\` on **specific** function ARNs, not \`*\`.
- Use \`Condition\` keys to restrict (e.g. only invoke a Lambda in a specific region).

**Common pitfalls:**
- \`AccessDeniedException\` deep in a workflow — usually missing permission on the execution role for a downstream service.
- \`KMS\` permissions if encrypted resources (SQS with KMS, S3 with SSE-KMS).
- Cross-account: state machine in account A calling Lambda in account B requires both **resource policy** on the Lambda AND **execution role** with permission to assume.

**Useful IAM tools:**
- AWS Console "Generate policy from CloudTrail" — derive least-privilege policies from observed activity.
- IAM Access Analyzer to detect overly broad policies.

**Activity tasks** (legacy worker pattern) — workers need \`states:GetActivityTask\`, \`states:SendTaskSuccess\`, \`states:SendTaskFailure\` permissions on the Activity ARN.`,
      tags: ["security", "iam"],
    },
    {
      id: "wait-state",
      title: "Wait states and timeouts",
      difficulty: "easy",
      question: "How do Wait states and timeouts work?",
      answer: `**Wait state** pauses the workflow for a duration or until a specific time.

\`\`\`json
{
  "Type": "Wait",
  "Seconds": 60,
  "Next": "CheckStatus"
}
\`\`\`

**Variants:**
- \`Seconds\` — fixed delay.
- \`SecondsPath\` — delay from input field.
- \`Timestamp\` — wait until ISO timestamp.
- \`TimestampPath\` — timestamp from input.

**Pricing:** during a Wait, there's **no cost per second** (unlike a Lambda \`setTimeout\`). State Machine billing is per-state-transition (Standard) or per execution (Express). Wait states cost one transition.

**Use cases:**
- **Polling** — wait 30 s, check status, repeat (for jobs that don't support \`.sync\` integration).
- **Throttling** — wait between API calls to respect rate limits.
- **Scheduled steps** — wait until tomorrow at 9 AM, then send report.

**Polling pattern with Choice:**
\`\`\`
Start → CheckJob → Choice → (done?) → End
                          ↘ (not yet) → Wait → loop back
\`\`\`

**Timeouts on Tasks:**
- \`TimeoutSeconds\` — fail the task if it takes longer.
- \`HeartbeatSeconds\` — fail if no heartbeat from the worker (for \`.waitForTaskToken\`).
- Always set timeouts on long-waiting tasks; otherwise a hung dependency hangs your workflow.

**Maximum wait:**
- Standard workflows can wait up to **the workflow's 1-year limit**.
- Express limited to 5 min total runtime.`,
      tags: ["fundamentals"],
    },
    {
      id: "nested-workflows",
      title: "Nested workflows",
      difficulty: "hard",
      question: "How do you compose state machines from sub-workflows?",
      answer: `**Nested execution** — a state machine starts another state machine as a Task.

\`\`\`json
{
  "Type": "Task",
  "Resource": "arn:aws:states:::states:startExecution.sync:2",
  "Parameters": {
    "StateMachineArn": "arn:aws:states:...:childWorkflow",
    "Input": { ... }
  }
}
\`\`\`

**Variants:**
- \`startExecution.sync\` — wait for child to complete, return its output.
- \`startExecution\` (request/response) — fire and forget.
- \`startExecution.waitForTaskToken\` — child callbacks parent.

**Why nest:**
- **Reusability** — common sub-flows (notify users, retry external service) as their own state machines.
- **Modularity** — break giant graphs into manageable pieces.
- **Mixed semantics** — outer Standard, inner Express for high-volume sub-tasks.
- **Cross-team boundaries** — team A owns a state machine; team B's workflow invokes it.

**Patterns:**
- **Standard parent + Express children** — parent provides durability + history; children handle high-throughput per-item processing.
- **Distributed Map** is essentially this pattern productized — each child execution can be Express.

**Caveats:**
- Each child execution starts and stops the meter — additional state transitions/executions cost.
- Failures in children are surfaced; ensure your error handling covers child failures.
- Debugging crosses execution boundaries — link execution ARNs in logs for tracing.

**Alternative:** in-place sub-workflow via inline JSON. Good for small reuse; nesting better when sub-workflow has its own owners or testing needs.`,
      tags: ["patterns"],
    },
    {
      id: "rollouts-versioning",
      title: "State machine versioning and aliases",
      difficulty: "hard",
      question: "How do you safely deploy state machine changes?",
      answer: `Step Functions supports **versions** and **aliases** (added 2023):

- **Version** — immutable snapshot of the state machine definition.
- **Alias** — pointer to one or more versions; can split traffic.

\`\`\`
StateMachine "OrderProcessor"
  v1 (initial)
  v2 (refactor)
  v3 (latest)

Aliases:
  prod    → 100% v3
  canary  → 90% v2, 10% v3
  preview → 100% v3
\`\`\`

**Benefits:**
- **Canary deployment** — slowly shift traffic to a new version.
- **A/B testing** workflows.
- **Rollback** — flip alias back to previous version.
- **Blue/green** at workflow level.

**Workflow:**
1. Update definition → publish a new version.
2. Update alias to start a canary (10% traffic).
3. Monitor — error rates, durations, business metrics.
4. Increase canary % → eventually 100%.
5. If issues, flip back instantly.

**Without aliases (legacy):**
- Update state machine in place.
- New executions use new definition; in-flight executions use the version they started with.
- Rollback = redeploy old definition; in-flight remains on new.

**Best practices:**
- Keep state machine immutable per release.
- Use IaC (CDK/CloudFormation) to manage versions.
- Tag versions with git SHA for traceability.

**Activity tasks** that talk to specific versions need to be versioned alongside.`,
      tags: ["operations"],
    },
    {
      id: "step-functions-vs-airflow",
      title: "Step Functions vs Airflow vs other orchestrators",
      difficulty: "medium",
      question: "How does Step Functions compare to Airflow / Temporal / etc?",
      answer: `**Step Functions:**
- Serverless, AWS-native, no infrastructure to manage.
- Visual graph + execution history.
- Best for AWS-heavy stacks, business workflows, ETL.
- Limited to 1 year executions; ASL JSON DSL.

**Apache Airflow (MWAA on AWS):**
- Code-first (Python DAGs).
- Excellent for **data pipelines** with complex dependencies.
- Big ecosystem of operators (Snowflake, Hive, Postgres, dbt).
- Requires the Airflow scheduler / web UI infra (managed via MWAA).
- Less ideal for sub-second / long human-in-the-loop workflows.

**Temporal:**
- Code-as-workflow (TypeScript, Go, Java, Python).
- **Most flexible** — workflows are full programs with branches, loops, side effects.
- Self-hosted or Temporal Cloud.
- Excellent for high-throughput, complex, long-running flows.
- Steeper learning curve than Step Functions.

**Argo Workflows:**
- Kubernetes-native, YAML.
- For container-based pipelines (ML, build systems).

**AWS Glue Workflows:**
- ETL-specific; best for Glue Job orchestration.

**Pick Step Functions when:**
- AWS-native shop.
- Business workflows or moderate-complexity data pipelines.
- Want the visual graph and zero infra.

**Pick Airflow when:**
- Heavy data engineering with many connectors.
- Code-first culture; Python-friendly.
- Existing Airflow expertise.

**Pick Temporal when:**
- Complex workflow logic that wants real code constructs.
- Multi-cloud or hybrid; Step Functions locks you to AWS.
- Need ultimate flexibility (signals, timers, sub-workflows in code).`,
      tags: ["comparison"],
    },
    {
      id: "anti-patterns",
      title: "Common Step Functions anti-patterns",
      difficulty: "hard",
      question: "What are common Step Functions anti-patterns?",
      answer: `**1. Lambda chaining where direct integration would suffice.**
- Bad: state machine → Lambda → SQS.
- Good: state machine → SQS directly.
- Saves Lambda invocations, latency, code.

**2. Massive workflows with 50+ states.**
- Hard to read, debug, and version.
- Break into nested workflows by domain.

**3. Storing big payloads in state.**
- 256 KB input/output limit per state.
- Pass S3 pointers, not megabytes of JSON.
- Express also has 256 KB execution-time limit.

**4. Polling Lambdas instead of Wait + Choice loops.**
- Native Wait state is free per second; Lambda costs per invocation.

**5. No error handling on Tasks.**
- One transient AWS hiccup tanks the whole workflow.
- Always Retry on transient errors and Catch with a fallback.

**6. Synchronous Lambdas waiting for long external work.**
- Use \`.waitForTaskToken\` instead — Lambda exits immediately, callback resumes.

**7. Putting business logic in mapping templates.**
- ASL JSON Path is limited; complex transforms in code (Lambda) are clearer.

**8. Standard for high-throughput tasks.**
- Standard caps at 25 RPS per state machine and \$25/M transitions.
- Use Express for volume.

**9. Express where you need exactly-once or long history.**
- Express is at-least-once; idempotency is on you.

**10. Not using Workflow Studio or IaC.**
- Hand-writing ASL is error-prone. Use Studio + CDK/SAM.

**11. Forgetting timeouts.**
- Without TimeoutSeconds, a hung dependency hangs your workflow forever (up to 1 year).

**12. Confusing async vs sync Express invocations.**
- Sync = at-most-once, returns response. Async = at-least-once, fire-and-forget. Pick the one that matches your semantics.`,
      tags: ["best-practices"],
    },
    {
      id: "debugging",
      title: "Debugging failed executions",
      difficulty: "medium",
      question: "How do you debug a failed Step Functions execution?",
      answer: `**Standard workflow execution UI:**
1. Open the execution in the console — see the graph.
2. Click the failed state — input, output, error JSON.
3. Read the error name and cause (\`States.TaskFailed\`, custom error from Lambda, etc.).
4. Check timing — was it timed out, did it run past the next state's timeout?

**Common failure types:**
- **States.Timeout** — Task exceeded \`TimeoutSeconds\`.
- **States.TaskFailed** — Lambda threw, integration returned error.
- **States.Permissions** — IAM denied; check execution role.
- **States.DataLimitExceeded** — output too big (256 KB limit).
- **Lambda.Unknown** — Lambda crashed; check Lambda logs.

**Linking to downstream logs:**
- Each Task includes the Lambda request ID in its output (or via X-Ray trace).
- Search CloudWatch Logs for that request ID.

**Replay a failed execution:**
- Console has **"Redrive"** (newer feature) — restart from the failed state with the same input. Saves replaying earlier successful steps.

**Express workflows:**
- No graph; rely on CloudWatch Logs.
- Search for execution ARN in logs.

**X-Ray:**
- Enabled? Trace shows full request path through Lambda and downstream.
- Latency per state, errors highlighted.

**State input snapshots:**
- Step Functions stores every state's input/output (Standard).
- Copy a failing input, paste into a new execution to reproduce locally.

**Best practice:** structured error messages from Lambda. Throw with \`{ "errorCode": "...", "message": "..." }\` — Step Functions surfaces these for matching in Catch and visibility.`,
      tags: ["operations"],
    },
    {
      id: "studio",
      title: "Workflow Studio",
      difficulty: "easy",
      question: "What is Step Functions Workflow Studio?",
      answer: `**Workflow Studio** is the visual editor for state machines. Drag-and-drop states; behind the scenes it generates ASL JSON.

**Features:**
- **Drag-and-drop** state types (Task, Choice, Parallel, Map, Wait).
- **Resource picker** — search 200+ AWS services with their integration ARNs and parameter shapes pre-filled.
- **JSON Path tester** — verify InputPath / OutputPath against sample input.
- **Error handling tabs** on each state — pick error names from a list.
- Switch between **visual** and **JSON** views without losing edits.
- **Code snippet** for SAM, CDK, CloudFormation export.

**Use cases:**
- **Beginners** building first state machines — picks correct ARNs, validates JSON.
- **Prototyping** — quick visual mock before writing production IaC.
- **Documentation** — visual graphs for design reviews.

**Limits:**
- For **production**, use IaC (CDK / SAM / Terraform). Studio is great for design but you don't want production state machines clicked together by hand.
- Some advanced features (intrinsic functions, complex Catch chains) sometimes easier in JSON directly.

**Workflow:**
1. Prototype in Studio → export ASL.
2. Move ASL into your IaC.
3. Edit in code; preview in Studio whenever you need a visual sanity check.

**Embedded in Lambda console:** if you have a Lambda that orchestrates AWS services, the console suggests "Connect with Step Functions" → opens Workflow Studio with that Lambda as Task 1.`,
      tags: ["tooling"],
    },
    {
      id: "step-functions-cost",
      title: "Step Functions cost",
      difficulty: "medium",
      question: "What drives Step Functions cost?",
      answer: `**Standard workflows:**
- **\$25 per million state transitions**.
- A workflow with 10 states = 10 transitions per execution → \$0.25 per 1M executions.
- Heavy retry / loops add transitions.
- Free tier: 4,000 transitions/month.

**Express workflows:**
- **Per execution + duration + memory**:
  - \$1.00 per million executions.
  - \$0.0000001 per GB-second of execution.
- 5-min cap means runaway loops can't run up huge bills.

**Direct service costs** (separate from Step Functions):
- Each Lambda invocation costs Lambda fees.
- Each SQS / SNS / DynamoDB call costs the underlying service.
- Step Functions itself is just the orchestrator.

**Cost optimization:**
- **Direct integrations** — avoid Lambda glue tasks; call AWS services directly. Saves Lambda invocations.
- **Express for volume** — high-throughput workflows. Cap is 5 min so be sure.
- **Standard for durability** — long approvals, complex retries, audit trails.
- **Reduce state count** — combine multiple Pass / Choice states; use Parameters and intrinsic functions instead of explicit Pass states.
- **Wait states are nearly free** — cheaper than Lambda \`setTimeout\`.

**Hidden costs:**
- **Distributed Map** child executions counted separately.
- **Nested workflows** — each child execution + its own transitions.
- **CloudWatch Logs** — Express ALL-level logging at high throughput is expensive. Use ERROR in production.

**Visibility:**
- Cost Explorer per state machine (use tags).
- CloudWatch metric \`StateTransitions\` × \$25/M = cost.`,
      tags: ["cost"],
    },
  ],
};
