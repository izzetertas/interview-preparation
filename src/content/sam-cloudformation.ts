import type { Category } from "./types";

export const samCloudformation: Category = {
  slug: "sam-cloudformation",
  title: "SAM & CloudFormation",
  description:
    "AWS SAM and CloudFormation: stacks, templates, parameters, intrinsic functions, change sets, drift, nested stacks, StackSets, SAM transforms, and best practices.",
  icon: "📦",
  questions: [
    {
      id: "what-is-cloudformation",
      title: "What is CloudFormation?",
      difficulty: "easy",
      question: "What is AWS CloudFormation?",
      answer: `**AWS CloudFormation** is AWS's native **Infrastructure-as-Code (IaC)** service. You write YAML or JSON templates describing AWS resources; CloudFormation provisions and manages them.

**Core concepts:**
- **Template** — YAML/JSON document defining resources, parameters, outputs.
- **Stack** — a deployed instance of a template; all resources are managed as a unit.
- **Change set** — preview of what would happen if you applied a template change.
- **Stack policy** — JSON rules guarding specific resources from being modified or deleted.
- **Drift detection** — compare current AWS state vs template; flags out-of-band changes.

**Why use it:**
- **Repeatable deployments** — dev/staging/prod from the same template.
- **Auditable** — diffs in version control show every change.
- **Rollback on failure** — failed stack updates auto-revert.
- **Tagging at scale** — apply tags to all resources from one place.
- **No agents to install** — managed control plane.

**Alternatives in the AWS ecosystem:**
- **AWS SAM** — extension of CloudFormation for serverless apps.
- **AWS CDK** — code-first (TS, Python, Go, Java, .NET) that synthesizes CloudFormation.
- **Terraform** — multi-cloud HCL; competes with CloudFormation.
- **Pulumi** — code-first, multi-cloud.

CloudFormation is the foundation; CDK and SAM compile *to* CloudFormation.`,
      tags: ["fundamentals"],
    },
    {
      id: "what-is-sam",
      title: "What is SAM?",
      difficulty: "easy",
      question: "What is AWS SAM and how does it relate to CloudFormation?",
      answer: `**AWS Serverless Application Model (SAM)** is a CloudFormation **transform** + a CLI for building serverless applications. Templates use shorter syntax for Lambda, API Gateway, DynamoDB, EventBridge — SAM expands them into full CloudFormation under the hood.

**Template signature:**
\`\`\`yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Resources:
  HelloFunction:
    Type: AWS::Serverless::Function
    Properties:
      Runtime: nodejs20.x
      Handler: index.handler
      CodeUri: ./src
      Events:
        Api:
          Type: Api
          Properties: { Path: /hello, Method: get }
\`\`\`

What SAM expands behind the scenes:
- Lambda function + role + log group.
- API Gateway with proper integration.
- IAM permissions wired up.
- Implicit cross-resource dependencies.

**SAM CLI:**
- \`sam build\` — builds Lambda artifacts.
- \`sam deploy\` — packages, uploads, creates change set, executes.
- \`sam local invoke\` — run Lambda locally.
- \`sam local start-api\` — emulate API Gateway + Lambda locally.
- \`sam logs\` — tail Lambda logs.
- \`sam sync --watch\` — fast iterative deploys (skip full CFN for Lambda code).

**When to use SAM vs CDK:**
- **SAM** — declarative YAML; smaller serverless apps; CFN-fluent teams.
- **CDK** — code-first; large/complex stacks; teams comfortable with TS/Python.

**SAM strength:** familiar CFN feel + serverless ergonomics + best-in-class local emulation.`,
      tags: ["fundamentals"],
    },
    {
      id: "template-anatomy",
      title: "Template anatomy",
      difficulty: "easy",
      question: "What are the main sections of a CloudFormation template?",
      answer: `\`\`\`yaml
AWSTemplateFormatVersion: '2010-09-09'   # version
Transform: AWS::Serverless-2016-10-31   # SAM (optional)

Description: My API stack

Parameters:                             # inputs
  Stage: { Type: String, Default: prod }

Mappings:                               # static lookup tables
  RegionMap:
    us-east-1: { AMI: ami-abc }
    us-west-2: { AMI: ami-def }

Conditions:                             # boolean expressions
  IsProd: !Equals [!Ref Stage, prod]

Resources:                              # what to create (required)
  MyTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: !Sub "users-\${Stage}"
      ...

Outputs:                                # values to export / display
  TableName:
    Value: !Ref MyTable
    Export:
      Name: !Sub "\${AWS::StackName}-TableName"
\`\`\`

**Required:** \`Resources\`. Everything else is optional.

**Common intrinsic functions:**
- \`!Ref\` — value of a parameter or resource ID.
- \`!Sub\` — string substitution with \`\${var}\` (replace \\\$ with \$ in real templates).
- \`!GetAtt\` — get a resource attribute (e.g. \`!GetAtt MyTable.Arn\`).
- \`!Join\` / \`!Split\`.
- \`!FindInMap\` — look up in Mappings.
- \`!If\` / \`!Equals\` / \`!And\` — conditions.
- \`!ImportValue\` — import another stack's output.

Read top-down: parameters → conditions → mappings → resources → outputs.`,
      tags: ["fundamentals"],
    },
    {
      id: "parameters-outputs",
      title: "Parameters, outputs, and exports",
      difficulty: "easy",
      question: "How do parameters, outputs, and exports work?",
      answer: `**Parameters** — inputs to templates.

\`\`\`yaml
Parameters:
  EnvName:
    Type: String
    AllowedValues: [dev, staging, prod]
    Default: dev
  InstanceType:
    Type: AWS::SSM::Parameter::Value<String>   # read from Parameter Store
    Default: /myapp/instance-type
  MinSize:
    Type: Number
    MinValue: 1
    MaxValue: 100
\`\`\`

**Pass at deploy:**
\`\`\`sh
aws cloudformation deploy --parameter-overrides EnvName=prod MinSize=3
\`\`\`

**\`NoEcho: true\`** — for secrets; CloudFormation hides the value in console/logs. Better: use SSM SecureString or Secrets Manager refs.

**Outputs** — values to display or export.

\`\`\`yaml
Outputs:
  ApiUrl:
    Value: !Sub "https://\${ApiGateway}.execute-api.\${AWS::Region}.amazonaws.com/\${Stage}"
    Export:
      Name: !Sub "\${AWS::StackName}-ApiUrl"
\`\`\`

**\`Export\`** registers the value globally per-region; another stack can:
\`\`\`yaml
SomeResource:
  Properties:
    SomeUrl: !ImportValue MyApiStack-ApiUrl
\`\`\`

**Cross-stack references:**
- **Imports** create coupling — exporter can't change/delete the export while importers exist.
- Often better to **pass values via parameters** for flexibility, especially at the boundaries between teams.

**SSM-backed:**
- Outputs to **SSM parameters**. Other stacks read from SSM (looser coupling).
- Useful for "stack output → next deployment input."`,
      tags: ["fundamentals"],
    },
    {
      id: "intrinsic-functions",
      title: "Intrinsic functions",
      difficulty: "medium",
      question: "What are CloudFormation intrinsic functions?",
      answer: `Built-in functions for evaluating values in templates. YAML supports short form (\`!Ref\`) and long form (\`Fn::Ref\`).

**Most-used:**
- **\`!Ref\`** — parameter value or resource logical ID.
- **\`!GetAtt\`** — resource attribute (e.g. \`!GetAtt Bucket.Arn\`).
- **\`!Sub\`** — string substitution. \`!Sub "https://\${ApiId}.execute-api.\${AWS::Region}.amazonaws.com"\`.
- **\`!Join\`** — \`!Join [", ", [a, b, c]]\` → \`"a, b, c"\`.
- **\`!Split\`** — \`!Split [",", "a,b,c"]\` → \`[a, b, c]\`.
- **\`!Base64\`** — base64 encode (for EC2 user data).
- **\`!FindInMap\`** — \`!FindInMap [RegionMap, !Ref AWS::Region, AMI]\`.
- **\`!ImportValue\`** — import another stack's output.

**Conditional functions:**
- \`!Equals [a, b]\` → boolean.
- \`!Not [cond]\`.
- \`!And [c1, c2]\` / \`!Or [c1, c2]\`.
- \`!If [cond, ifTrue, ifFalse]\`.

**Pseudo parameters** — built-in references:
- \`AWS::AccountId\`, \`AWS::Region\`, \`AWS::StackName\`, \`AWS::StackId\`, \`AWS::Partition\`, \`AWS::URLSuffix\`, \`AWS::NoValue\` (drops a property when used).

**Newer: \`!ToJsonString\`, \`!Length\`** — for working with arrays in CFN.

**Limitations:**
- No loops or recursion (use \`Mappings\`, lists, or move to CDK for code-driven).
- Logic is restricted compared to a real programming language — many teams escape to **CDK** when templates get complex.

**\`Fn::Transform\`** — embed macros that pre-process the template (custom transformations, generated content).`,
      tags: ["fundamentals"],
    },
    {
      id: "change-sets",
      title: "Change sets",
      difficulty: "medium",
      question: "What are change sets?",
      answer: `A **change set** is a preview: "if I apply this template, here's what would change."

\`\`\`sh
aws cloudformation create-change-set \\
  --stack-name my-stack \\
  --template-body file://template.yaml \\
  --change-set-name my-change-set
\`\`\`

**Output:** list of changes — for each affected resource: \`Add\`, \`Modify\`, \`Remove\`, with the property changes.

**Critical for production:**
- Reveals **whether a resource will be replaced** (e.g. changing a DynamoDB table's PK is replacement = data loss).
- Surfaces **inadvertent deletions** (renaming a logical ID).
- Lets reviewers validate before applying.

**Workflow:**
1. \`create-change-set\` (or \`sam deploy --no-execute-changeset\`).
2. Review in console / CLI.
3. \`execute-change-set\` to apply (or \`delete-change-set\` to discard).

**SAM deploy** runs change sets implicitly:
\`\`\`sh
sam deploy --no-confirm-changeset    # auto-execute
sam deploy --confirm-changeset       # prompt
sam deploy --no-execute-changeset    # create only, execute later
\`\`\`

**Stack drift detection:**
- Compares current resource state in AWS vs template.
- Reports drifted resources and their property differences.
- Doesn't fix drift automatically — you re-import or update.

**Approval gates:**
- CI/CD pipelines should create change sets, post diff to PR for review, then execute on approval.
- Catches bad surprises before they hit prod.

**Replacement vs in-place update:**
- Replacement = old resource deleted, new one created. Data may be lost (DBs, EBS volumes).
- Always check for "Replacement: true" in change sets before approving.`,
      tags: ["operations"],
    },
    {
      id: "rollback",
      title: "Stack updates and rollback",
      difficulty: "medium",
      question: "How does rollback work in CloudFormation?",
      answer: `**Update flow:**
1. Submit new template.
2. CloudFormation determines required changes.
3. Applies them in dependency order.
4. **If anything fails**, by default CloudFormation **rolls back** all completed changes — restoring the prior stable state.

**Rollback triggers:**
- A resource creation/update fails.
- IAM permission denied.
- Validation failure.
- Quota exceeded.
- Custom resource Lambda errors.

**Rollback configuration:**
- **Rollback triggers** — CloudWatch alarms; if they fire during deployment, automatically roll back.
\`\`\`yaml
RollbackConfiguration:
  RollbackTriggers:
    - { Arn: arn:aws:cloudwatch:..., Type: AWS::CloudWatch::Alarm }
  MonitoringTimeInMinutes: 10
\`\`\`

**\`UPDATE_ROLLBACK_FAILED\`:**
- Rare; rollback itself failed (e.g. delete-protected resource).
- Stack is stuck — manual intervention needed.
- Options: \`continue-update-rollback\`, \`skip-resources\` for problematic ones.

**Disable rollback (\`--disable-rollback\`):**
- Useful in development for debugging — stack stays in failed state for inspection.
- Don't use in production.

**Stack policies:**
- Resource-level guardrails — prevent specific resources from being modified/replaced/deleted.

\`\`\`json
{ "Statement": [{ "Effect": "Deny", "Action": "Update:Replace", "Principal": "*", "Resource": "LogicalResourceId/MyDB" }] }
\`\`\`

Stack policies prevent accidental destruction of critical infrastructure.

**Termination protection:**
- Stack-level: prevent the stack itself from being deleted.
- Use on production stacks.`,
      tags: ["operations"],
    },
    {
      id: "iam-with-cfn",
      title: "IAM in CloudFormation templates",
      difficulty: "medium",
      question: "How do you define IAM roles and policies in CloudFormation?",
      answer: `**Role definition:**
\`\`\`yaml
LambdaRole:
  Type: AWS::IAM::Role
  Properties:
    AssumeRolePolicyDocument:
      Version: '2012-10-17'
      Statement:
        - Effect: Allow
          Principal: { Service: lambda.amazonaws.com }
          Action: sts:AssumeRole
    Policies:
      - PolicyName: LambdaPolicy
        PolicyDocument:
          Statement:
            - Effect: Allow
              Action: dynamodb:GetItem
              Resource: !GetAtt MyTable.Arn
\`\`\`

**Inline vs managed policies:**
- **Inline** — declared in the role; deleted when role is deleted.
- **Managed** — \`AWS::IAM::ManagedPolicy\` standalone, attached to many roles. Reusable.
- **AWS-managed** — built-in policies (e.g. \`arn:aws:iam::aws:policy/AWSLambdaBasicExecutionRole\`).

**SAM Policy Templates:**
\`\`\`yaml
HelloFunction:
  Type: AWS::Serverless::Function
  Properties:
    Policies:
      - DynamoDBCrudPolicy: { TableName: !Ref MyTable }
      - SQSPollerPolicy:    { QueueName: !GetAtt MyQueue.QueueName }
      - S3ReadPolicy:       { BucketName: !Ref MyBucket }
\`\`\`
- 60+ pre-defined templates that translate to least-privilege policies.
- Avoid hand-rolling policies for common patterns.

**Capabilities flag:**
- \`CAPABILITY_IAM\` — needed when stack creates IAM resources.
- \`CAPABILITY_NAMED_IAM\` — needed when IAM resources have specified names.
- Without these, deploy fails. SAM CLI prompts.

**Best practices:**
- Least privilege — restrict actions and resources tightly.
- One role per Lambda — never share roles across functions.
- Avoid \`*\` wildcards.
- Use \`Conditions\` to restrict by tag, IP, time of day.
- Run policies through **IAM Access Analyzer** before commit.`,
      tags: ["security"],
    },
    {
      id: "nested-stacks",
      title: "Nested stacks",
      difficulty: "medium",
      question: "What are nested stacks and when should you use them?",
      answer: `**Nested stack** = a stack defined as a resource inside another (parent) stack.

\`\`\`yaml
NetworkStack:
  Type: AWS::CloudFormation::Stack
  Properties:
    TemplateURL: https://s3.../network.yaml
    Parameters:
      VpcCidr: 10.0.0.0/16
\`\`\`

**Why nest:**
- **Reusable modules** — shared VPC, security groups, IAM roles.
- **Avoid template size limits** (51,200 bytes inline / 1 MB total).
- **Parallel updates** — independent nested stacks update concurrently.

**Pros:**
- Modularization without StackSets complexity.
- Each nested stack has its own logical ID isolation.

**Cons:**
- Cross-stack references via \`!GetAtt NetworkStack.Outputs.VpcId\` — fragile if you rename outputs.
- Updates to a nested stack require updating the parent (no independent deploys).
- Templates must be uploaded to S3 (or accessible URL).
- Debugging cascades — failure in one nested stack rolls back the parent.

**SAM-specific:**
- \`AWS::Serverless::Application\` (the SAM equivalent of nested stack).
- Pulls templates from local filesystem, S3, or **Serverless Application Repository (SAR)**.

**Alternatives:**
- **CDK Constructs** — code-first reusable modules; way more flexible.
- **CloudFormation Modules** — newer feature; reusable resource groups registered with the registry.
- **Macros / transforms** — generate template fragments.

**When NOT to nest:**
- Production-critical infra you want to deploy independently — **separate stacks** with shared exports/imports.
- Stacks with very different lifecycle (network vs. apps).`,
      tags: ["organization"],
    },
    {
      id: "stacksets",
      title: "StackSets",
      difficulty: "hard",
      question: "What are CloudFormation StackSets?",
      answer: `**StackSets** deploy a single template to **multiple accounts and regions** at once. Used in AWS Organizations to roll out infrastructure across the org.

**Example use cases:**
- Deploy a baseline IAM role / VPC / log-archive to every account.
- Roll out a security tool (GuardDuty, Config rules) org-wide.
- Standardize tagging or compliance enforcement.

**Setup:**
1. Define a template in a "management" account.
2. Create a StackSet referencing it.
3. **Deploy** to a list of (account, region) pairs.
4. CloudFormation creates a stack instance in each.

**Two permission models:**
- **Self-managed** — admin role in the management account, execution role in each target account. You provision both.
- **Service-managed** (with AWS Organizations) — AWS handles the trust relationships; just specify OUs and regions.

**Operations:**
- **Update** — re-roll the template to all instances.
- **Add/remove instances** — add new accounts/regions.
- **Drift detection** at the StackSet level.

**Concurrency:**
- Configurable parallelism (\`MaxConcurrentCount\`, \`FailureToleranceCount\`).
- Failed instances don't block others.

**Limits:**
- 1 StackSet can target up to 10,000 stack instances.
- Region quotas still apply per-account.

**Alternatives for similar use cases:**
- **AWS Control Tower** — opinionated multi-account framework; uses StackSets internally.
- **Terraform with multiple backends** — multi-account from one project.
- **CDK Pipelines / CloudFormation StackSets via CDK** — code-first multi-account deploys.`,
      tags: ["multi-account", "advanced"],
    },
    {
      id: "drift-detection",
      title: "Drift detection",
      difficulty: "medium",
      question: "What is drift detection?",
      answer: `**Drift** = a stack's current resources differ from the template (someone changed something out-of-band — console, CLI, another tool).

**Detect:**
\`\`\`sh
aws cloudformation detect-stack-drift --stack-name my-stack
aws cloudformation describe-stack-resource-drifts --stack-name my-stack
\`\`\`

**Per-resource status:**
- **\`IN_SYNC\`** — matches.
- **\`MODIFIED\`** — properties changed.
- **\`DELETED\`** — resource is gone.
- **\`NOT_CHECKED\`** — drift detection not supported for that resource type.

**Resolve drift:**
- **Re-import** — update template to reflect actual values.
- **Re-apply** — update stack with template values to "correct" the resource.
- Document why drift was acceptable (rare, e.g. emergency hotfix).

**Why it matters:**
- Hidden drift = templates lying about reality.
- Makes future updates risky (CloudFormation may fight your manual changes).
- Audit / compliance issues.

**Prevention:**
- **No console editing in production** — IAM policies blocking direct modifications on tagged resources.
- **All changes via CI/CD pipeline** with template updates.
- Periodic drift checks in CI; alert if drift detected.

**Limitations:**
- Not all resources support drift detection (improving over time).
- Doesn't detect drift in nested resources of complex types (some IAM policy details).
- StackSets have separate drift detection.

**Best practice:** schedule weekly drift detection across all stacks; alert on results.`,
      tags: ["operations"],
    },
    {
      id: "deletion-policies",
      title: "DeletionPolicy and UpdateReplacePolicy",
      difficulty: "medium",
      question: "What do DeletionPolicy and UpdateReplacePolicy do?",
      answer: `These attributes control what happens to a resource when the stack is deleted or the resource is replaced.

**DeletionPolicy** — applied when stack is deleted:
- **\`Retain\`** — leave the resource in AWS, untouched.
- **\`Snapshot\`** — take a snapshot, then delete (RDS, EBS, ElastiCache).
- **\`Delete\`** (default) — destroy.

**UpdateReplacePolicy** — applied when resource is replaced (during update):
- Same values as DeletionPolicy.

\`\`\`yaml
MyDatabase:
  Type: AWS::RDS::DBInstance
  DeletionPolicy: Snapshot
  UpdateReplacePolicy: Snapshot
  Properties: { ... }
\`\`\`

**Why crucial for stateful resources:**
- A schema change might force RDS replacement → without \`Snapshot\` policy, you lose all data.
- Same for DynamoDB (\`Retain\` so deletes don't wipe data), S3 buckets (with versioning), ElastiCache.

**Best practice — production stateful resources:**
- DeletionPolicy: **Retain** or **Snapshot**.
- UpdateReplacePolicy: matching.
- Force human review of any change set that lists "Replacement: true" on these.

**S3 buckets:**
- \`DeletionPolicy: Retain\` is critical — bucket deletion cascades to objects (even versioned).
- Empty bucket via lifecycle / batch ops before deleting stack.

**EBS volumes / RDS instances:**
- Snapshot policy gives you backup; restore separately.

**DynamoDB tables:**
- Retain in production; recreating loses data and PITR history.

**Override at deploy time (rare):**
- Cannot override these in change sets; they're template-defined.
- For one-off cases, edit template, deploy, edit back.

**Anti-pattern:** default \`Delete\` policy on production databases. Easy way to lose data with one bad PR.`,
      tags: ["safety"],
    },
    {
      id: "secrets-management",
      title: "Secrets in templates",
      difficulty: "medium",
      question: "How do you handle secrets in CloudFormation/SAM templates?",
      answer: `**Don't commit secrets in templates.** Use AWS-native services and reference them.

**Options:**

**1. Secrets Manager:**
\`\`\`yaml
DbPassword:
  Type: AWS::SecretsManager::Secret
  Properties:
    Name: /prod/db/password
    GenerateSecretString:
      PasswordLength: 32
\`\`\`

Reference at runtime:
\`\`\`yaml
DbInstance:
  Properties:
    MasterUserPassword: !Sub "{{resolve:secretsmanager:\${DbPassword}::password}}"
\`\`\`

**2. SSM Parameter Store:**
\`\`\`yaml
Parameters:
  DbHost:
    Type: AWS::SSM::Parameter::Value<String>
    Default: /prod/db/host
\`\`\`
Or dynamic reference:
\`\`\`yaml
!Sub "{{resolve:ssm-secure:/prod/api/key:1}}"
\`\`\`

**3. Parameter with NoEcho:**
\`\`\`yaml
Parameters:
  ApiKey: { Type: String, NoEcho: true }
\`\`\`
Hides from console; passed via CI/CD parameter override.

**Best practices:**
- **Don't bake secrets into Lambda env vars** — at rest in CloudFormation, visible to everyone with CFN read.
- Use Lambda's **runtime-only retrieval** of secrets (cached) via Secrets Manager / SSM.
- **Rotation** — Secrets Manager supports automatic rotation; configure Lambda rotators.
- **IAM scoping** — only Lambdas that need a secret can read it.

**Anti-patterns:**
- Hardcoded passwords in templates.
- Plain SSM parameters (non-secure) for secrets.
- Storing secrets in CodeCommit / GitHub.

**Tools:**
- \`git-secrets\` — pre-commit hook to block committed secrets.
- AWS GitHub Action for Secrets Scanning.
- IAM Access Analyzer to verify scoped policies.`,
      tags: ["security"],
    },
    {
      id: "cdk-vs-sam-vs-tf",
      title: "CDK vs SAM vs Terraform",
      difficulty: "medium",
      question: "When should you pick CDK, SAM, or Terraform?",
      answer: `**SAM (declarative YAML/JSON, AWS-native):**
- Best for **serverless apps** (Lambda, API Gateway, DDB, EB).
- Best **local emulation** (\`sam local\`).
- Compiles to CloudFormation.
- Familiar for CFN-fluent teams.

**CDK (code-first, TS/Py/Go/Java/.NET, AWS-native):**
- Programming-language flexibility — loops, abstractions, libraries.
- **Constructs** — reusable units; share across teams/orgs.
- Synthesizes to CloudFormation.
- Steeper learning curve; debugging spans CDK + CFN.
- Best for large/complex AWS-only architectures.

**Terraform (HCL, multi-cloud):**
- **Multi-cloud** — same tool for AWS, GCP, Azure, k8s, SaaS.
- Mature; huge community.
- Plan/apply UX often beats CFN's change set.
- State stored externally (S3 backend); requires careful state management.
- No native local emulation comparable to SAM CLI.

**When each shines:**

**Pick SAM when:**
- Serverless AWS app, mostly Lambda + DDB + API Gateway.
- Want best-in-class local emulation.
- Small-to-medium projects.

**Pick CDK when:**
- Large AWS-only architecture.
- Team comfortable with code, wants reusable constructs.
- Need programmatic logic in IaC.

**Pick Terraform when:**
- Multi-cloud or multi-provider (AWS + Datadog + GitHub + Cloudflare).
- Existing org-wide Terraform investment.
- Strong tooling ecosystem (Atlantis, Terragrunt).

**Hybrid:** common to use Terraform for foundational infra (VPC, IAM, networking) and SAM/CDK for application stacks. Each plays to its strengths.`,
      tags: ["comparison"],
    },
    {
      id: "best-practices",
      title: "Template best practices",
      difficulty: "hard",
      question: "What are CloudFormation/SAM best practices?",
      answer: `**Organization:**
- One stack per **independently deployable unit** — not "one giant stack."
- Group by lifecycle: networking stack + apps stack + monitoring stack.
- Keep templates small (< 1000 lines); split if growing.

**Naming:**
- Logical IDs in PascalCase (e.g. \`MyApiFunction\`).
- Resource names usually omit (let CFN auto-generate); only specify when external systems reference them.
- Tag everything: project, owner, environment, cost-center.

**Parameters:**
- Use **AllowedValues / AllowedPattern** for safety.
- Default sensible values for dev; require overrides for prod.
- Use \`Type: AWS::SSM::Parameter::Value\` for shared config.

**Policies (DeletionPolicy / UpdateReplacePolicy):**
- \`Retain\` for stateful resources (DBs, S3 buckets).
- \`Snapshot\` for RDS / EBS where applicable.

**IAM:**
- Least privilege — never \`*\` actions or resources.
- Use SAM Policy Templates.
- One role per Lambda.

**Outputs:**
- Export values that other stacks depend on; document the contract.
- Avoid creating tight coupling — prefer SSM parameter handoff for cross-stack values that may change owners.

**Updates:**
- Always **change set first** in production.
- Read every \`Replacement: true\` line carefully.
- Stack policies on critical production resources.

**CI/CD:**
- Validate templates: \`cfn-lint\`, \`sam validate\`, \`aws cloudformation validate-template\`.
- Run \`cfn-nag\` or \`cfn-guard\` for security/policy violations.
- Diff change sets in PR comments.

**Local dev:**
- \`sam local invoke\` / \`start-api\` for Lambda testing.
- \`sam sync --watch\` for fast iteration.

**Resource limits:**
- Soft limit: 500 resources per stack — split via nested stacks or multiple stacks beyond that.

**Avoid:**
- Embedding application code in templates (\`Code:\` inline) for anything beyond tiny utilities.
- Manual console edits to managed resources.
- Templates without parameters (no flexibility).
- Templates without outputs (no integration with other stacks).`,
      tags: ["best-practices"],
    },
    {
      id: "lambda-deploy",
      title: "Lambda deployment in SAM",
      difficulty: "medium",
      question: "How does SAM package and deploy Lambda code?",
      answer: `**\`sam build\`** prepares Lambda artifacts.
- Reads \`CodeUri\` per function.
- Installs dependencies (\`npm install\`, \`pip install\`, \`go build\`, etc.).
- Outputs to \`.aws-sam/build/\`.

**\`sam deploy\`** packages and deploys.
- Zips each Lambda artifact.
- Uploads to S3 (managed by SAM CLI in a deployment bucket).
- Creates change set on CloudFormation.
- Executes change set.

**Configurable:**
- \`samconfig.toml\` — persistent deploy settings (bucket, region, params).
- Per-environment configs: \`sam deploy --config-env prod\`.

**Build types:**
- **In-process** (Node.js, Python) — \`sam build\` runs locally.
- **Container** (\`--use-container\`) — runs in a Docker container matching Lambda runtime — useful for binary deps (numpy, pillow, native modules).

**Image-based Lambdas:**
\`\`\`yaml
MyFunction:
  Type: AWS::Serverless::Function
  Properties:
    PackageType: Image
    Metadata:
      DockerContext: ./src
      Dockerfile: Dockerfile
\`\`\`
- SAM builds the image, pushes to ECR, deploys.
- Up to 10 GB image size (vs 250 MB zip).
- Cold starts slightly higher.

**\`sam sync --watch\`:**
- Skips full CloudFormation for code changes — directly updates Lambda code via S3.
- Reduces iteration time from 1 min → 5-10 s.
- For dev only; never use against prod.

**Layers:**
\`\`\`yaml
Layers:
  - !Ref CommonLayer
\`\`\`
- Share dependencies across functions.
- Limited to 5 layers per function, 250 MB total unzipped.

**Versions and aliases:**
- SAM creates a new \`AutoPublishAlias\` version per deploy.
- Combine with **CodeDeploy** for canary / linear deployments.`,
      tags: ["deployment", "lambda"],
    },
    {
      id: "canary-deployments",
      title: "Canary deployments with SAM and CodeDeploy",
      difficulty: "hard",
      question: "How do you do canary Lambda deployments?",
      answer: `SAM integrates with **CodeDeploy** to shift Lambda traffic gradually.

\`\`\`yaml
HelloFunction:
  Type: AWS::Serverless::Function
  Properties:
    AutoPublishAlias: live
    DeploymentPreference:
      Type: Canary10Percent10Minutes
      Alarms:
        - !Ref ErrorAlarm
        - !Ref LatencyAlarm
      Hooks:
        PreTraffic: !Ref PreTrafficHook
        PostTraffic: !Ref PostTrafficHook
\`\`\`

**\`Type\` options:**
- **\`Canary10Percent10Minutes\`** — shift 10% for 10 min, then 100%.
- **\`Canary10Percent5Minutes\`**, \`...30Minutes\`, \`...15Minutes\`, etc.
- **\`Linear10PercentEvery1Minute\`** — increase by 10% every minute over 10 min.
- **\`AllAtOnce\`** — flip 100% immediately.

**Alarms:**
- CloudWatch alarms attached.
- If any alarm fires during the deployment window, **traffic shifts back automatically**.
- Common: error rate, latency, custom business metrics.

**Hooks:**
- **PreTraffic Lambda** — runs before any traffic shifts. Validates new version (smoke tests).
- **PostTraffic Lambda** — after deploy completes. Send notifications, run integration tests.
- Hooks fail → deployment rolls back.

**Why use canary deploys:**
- Catch regressions before all traffic affected.
- Auto-rollback on bad metrics.
- More confidence shipping during business hours.

**Considerations:**
- Adds deployment duration (10-30 minutes typically).
- Hooks add complexity; budget time to implement properly.
- Alarms must be sensitive enough to catch real issues but not flap.

**Alternative tools:**
- **AWS AppConfig** — feature-flag based gradual rollouts at the app layer.
- **Argo Rollouts / Flagger** — for k8s.
- **Manual versioning** — alias points to specific version; flip on success.`,
      tags: ["deployment", "advanced"],
    },
    {
      id: "common-pitfalls",
      title: "Common pitfalls",
      difficulty: "hard",
      question: "What are common CloudFormation/SAM pitfalls?",
      answer: `**1. Replacement of stateful resources.**
- Renaming a logical ID, changing a primary key, switching subnets — replaces the resource.
- Without DeletionPolicy/UpdateReplacePolicy, you lose data.
- **Always read change sets**.

**2. Circular dependencies.**
- Resource A references B, B references A.
- CFN error during validation.
- Break the cycle: introduce a third resource (parameter / SSM) or refactor.

**3. \`UPDATE_ROLLBACK_FAILED\` state.**
- Stack stuck because rollback itself failed.
- Use \`continue-update-rollback\` or \`skip-resources\`.
- Worst case: delete stack (with retain on critical resources), recreate.

**4. Soft template / stack limits.**
- 51,200 bytes inline template, 1 MB on S3.
- 500 resources per stack.
- Split with nested stacks or multiple top-level stacks.

**5. Manual changes.**
- Console edits → drift → next deploy fails or unexpected behavior.
- Strict change-control via CI/CD.

**6. Capabilities mistakes.**
- Forgot \`CAPABILITY_IAM\` → deploy fails. SAM CLI prompts; pure CFN doesn't.

**7. Missing logical-ID stability.**
- Renaming a Lambda's logical ID = replacement = downtime.
- Treat logical IDs as part of your API surface.

**8. Outputs with circular ImportValue.**
- Stack A exports → Stack B imports. If A wants to update an exported value, B must let go first.
- Use SSM parameters for looser coupling.

**9. Long-running custom resources without timeout.**
- Custom resource Lambdas time out (max 1h via SQS callback). Stack hangs.
- Always set timeout + send signal on failure.

**10. Debugging \`sam local\` vs cloud.**
- Some IAM behaviors differ; some VPC-bound services don't work locally.
- Test critical paths in cloud (dev account).

**11. Forgotten \`Default\` on parameters.**
- Deploying without specifying every required parameter fails.
- Provide sensible defaults; require explicit override for prod.

**12. Costs from leaked dev stacks.**
- Personal dev stacks left running for months — RDS, NAT gateways especially expensive.
- Tag, monitor, scheduled cleanup via Lambda.`,
      tags: ["best-practices"],
    },
    {
      id: "sam-vs-cdk",
      title: "Migrating between SAM, CDK, and CFN",
      difficulty: "hard",
      question: "How do you migrate from SAM to CDK (or vice versa)?",
      answer: `**SAM → CDK:**

1. **Same stack name** — both can manage the same CloudFormation stack.
2. **\`cdk import\`** — import existing resources into CDK code.
3. Or rewrite the SAM template in CDK constructs.
4. Test on a non-prod stack first; verify resources match.
5. **CDK uses tokens** for cross-stack refs; ensure they resolve to same logical IDs.

**Trick:** generate the CFN from CDK (\`cdk synth\`) and **diff** against the SAM CFN expansion. Get them identical, then switch.

**CDK → SAM:**
- Less common but doable.
- Use \`cdk synth\` to get CloudFormation, then translate hand-rolled to SAM YAML.
- Or just keep CDK and hide it behind a "generates SAM template" abstraction.

**Plain CFN → SAM:**
- Add \`Transform: AWS::Serverless-2016-10-31\`.
- Replace \`AWS::Lambda::Function\` blocks with \`AWS::Serverless::Function\` (with Events, etc.).
- Remove now-unnecessary IAM and API Gateway boilerplate.

**Plain CFN → CDK:**
- \`cdk migrate\` (newer) — ingests CFN templates and produces CDK code (TypeScript).
- Limitations: not every resource type supported; review output carefully.

**Key principles:**
- **Logical IDs** must match across the migration to avoid replacements.
- **Stack name** stays the same — you're updating, not creating new.
- Keep state-bearing resources \`DeletionPolicy: Retain\` during migration.
- Test with \`change-set\` before applying.

**Why migrate:**
- **SAM → CDK**: your serverless project grew complex; need code abstractions.
- **CFN → SAM**: simplify boilerplate.
- **Anything → Terraform**: multi-cloud or org-wide IaC standard.

**Don't migrate just to migrate.** Each tool has trade-offs; a mature SAM project may be better than a newly-translated CDK one.`,
      tags: ["migration"],
    },
    {
      id: "custom-resources",
      title: "Custom resources",
      difficulty: "hard",
      question: "What are CloudFormation custom resources?",
      answer: `**Custom resources** let you extend CloudFormation with **arbitrary logic** via Lambda or SNS.

\`\`\`yaml
MyCustomResource:
  Type: Custom::MyResource
  Properties:
    ServiceToken: !GetAtt MyHandlerFunction.Arn
    AnyOtherProp: "value"
\`\`\`

**How it works:**
1. CloudFormation invokes the Lambda with **Create / Update / Delete** request.
2. Lambda processes; calls back to a CloudFormation pre-signed URL with success or failure.
3. Stack proceeds based on response.

**Use cases:**
- **Resources without CFN support** — bootstrap an external service, fetch dynamic config, integrate with non-AWS systems.
- **Complex logic** beyond CFN's intrinsic functions.
- **Generated values** — random tokens, encryption keys, ACM cert validation.
- **Cross-region orchestration** during stack creation.

**Lambda handler shape:**
\`\`\`js
exports.handler = async (event, context) => {
  try {
    if (event.RequestType === "Delete") {
      // cleanup
    } else {
      // create/update
    }
    await sendResponse(event, context, "SUCCESS", { Data: "value" });
  } catch (err) {
    await sendResponse(event, context, "FAILED");
  }
};
\`\`\`

**\`cfn-response\`** library helper for clean code; or **AWS Lambda Powertools**.

**Pitfalls:**
- **Always send response** even on failure — otherwise stack hangs for 1h timeout.
- Long-running operations need callbacks or async patterns; Lambda max 15 min.
- Custom resources during update — handle property changes carefully.
- Don't depend on order of resource creation — use \`DependsOn\`.

**Alternative:** **CloudFormation Modules / Hooks / Registry** — for reusable extensions, often cleaner than custom resources.

**SAM:** has built-in helpers (\`AWS::Serverless::Function\` works as the custom resource backend).`,
      tags: ["advanced"],
    },
  ],
};
