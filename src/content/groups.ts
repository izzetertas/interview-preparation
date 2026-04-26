export interface CategoryGroup {
  title: string;
  icon: string;
  slugs: string[];
}

export const categoryGroups: CategoryGroup[] = [
  {
    title: "Databases",
    icon: "🗄️",
    slugs: ["database", "sql", "postgres", "prisma", "nosql", "mongodb"],
  },
  {
    title: "JavaScript / TypeScript",
    icon: "🟨",
    slugs: ["javascript", "typescript", "js-engine"],
  },
  {
    title: "Frontend Frameworks",
    icon: "⚛️",
    slugs: ["react", "nextjs", "vue", "react-native", "state-management", "server-state"],
  },
  {
    title: "Python",
    icon: "🐍",
    slugs: ["python", "fastapi", "django", "python-async", "pydantic-sqlalchemy", "python-tooling"],
  },
  {
    title: "Backend & APIs",
    icon: "🔧",
    slugs: [
      "nodejs", "nestjs", "http-frameworks", "deno-bun",
      "graphql", "grpc", "rest-api", "trpc",
      "realtime", "auth", "message-queues", "microservices",
    ],
  },
  {
    title: "Frontend / UI",
    icon: "🎨",
    slugs: [
      "html", "css", "tailwind", "css-in-js",
      "web-components", "browser-apis", "web-performance",
      "pwa", "browser-security",
    ],
  },
  {
    title: "Testing & Tooling",
    icon: "🧪",
    slugs: ["testing", "build-tools", "monorepos", "observability"],
  },
  {
    title: "AWS",
    icon: "☁️",
    slugs: [
      "aurora", "rds", "redshift", "s3", "dynamodb", "cloudfront",
      "ses", "api-gateway", "step-functions", "eventbridge",
      "sam-cloudformation", "aws-serverless", "aws-iam",
    ],
  },
  {
    title: "DevOps & Cloud",
    icon: "🐳",
    slugs: ["cloud-security", "devops", "containers"],
  },
  {
    title: "CS Fundamentals",
    icon: "📐",
    slugs: ["data-structures", "algorithms"],
  },
  {
    title: "System Design",
    icon: "🏛️",
    slugs: ["system-design", "system-design-cases"],
  },
  {
    title: "Specialized",
    icon: "🔩",
    slugs: ["webassembly", "electron"],
  },
];
