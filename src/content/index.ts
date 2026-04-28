import { aiEngineering } from "./ai-engineering";
import { algorithms } from "./algorithms";
import { llms } from "./llms";
import { mlFundamentals } from "./ml-fundamentals";
import { mlops } from "./mlops";
import { apiGateway } from "./api-gateway";
import { auth } from "./auth";
import { aurora } from "./aurora";
import { awsIam } from "./aws-iam";
import { awsServerless } from "./aws-serverless";
import { browserApis } from "./browser-apis";
import { browserSecurity } from "./browser-security";
import { buildTools } from "./build-tools";
import { cloudfront } from "./cloudfront";
import { cloudSecurity } from "./cloud-security";
import { containers } from "./containers";
import { css } from "./css";
import { cssInJs } from "./css-in-js";
import { database } from "./database";
import { dataStructures } from "./data-structures";
import { denoBun } from "./deno-bun";
import { electron } from "./electron";
import { devops } from "./devops";
import { dynamodb } from "./dynamodb";
import { eventbridge } from "./eventbridge";
import { django } from "./django";
import { fastapi } from "./fastapi";
import { python } from "./python";
import { pythonAsync } from "./python-async";
import { pythonTooling } from "./python-tooling";
import { pydanticSqlalchemy } from "./pydantic-sqlalchemy";
import { graphql } from "./graphql";
import { grpc } from "./grpc";
import { html } from "./html";
import { httpFrameworks } from "./http-frameworks";
import { javascript } from "./javascript";
import { jsEngine } from "./js-engine";
import { microservices } from "./microservices";
import { mongodb } from "./mongodb";
import { monorepos } from "./monorepos";
import { nestjs } from "./nestjs";
import { nextjs } from "./nextjs";
import { nodejs } from "./nodejs";
import { nosql } from "./nosql";
import { postgres } from "./postgres";
import { prisma } from "./prisma";
import { pwa } from "./pwa";
import { rds } from "./rds";
import { react } from "./react";
import { reactNative } from "./react-native";
import { realtime } from "./realtime";
import { redshift } from "./redshift";
import { restApi } from "./rest-api";
import { s3 } from "./s3";
import { samCloudformation } from "./sam-cloudformation";
import { serverState } from "./server-state";
import { ses } from "./ses";
import { sql } from "./sql";
import { stateManagement } from "./state-management";
import { messageQueues } from "./message-queues";
import { observability } from "./observability";
import { stepFunctions } from "./step-functions";
import { systemDesign } from "./system-design";
import { systemDesignCases } from "./system-design-cases";
import { testing } from "./testing";
import { trpc } from "./trpc";
import { typescript } from "./typescript";
import { tailwind } from "./tailwind";
import { vue } from "./vue";
import { webassembly } from "./webassembly";
import { webComponents } from "./web-components";
import { webPerformance } from "./web-performance";
export { categoryGroups } from "./groups";
import type { Category } from "./types";

export const categories: Category[] = [
  database,
  sql,
  postgres,
  prisma,
  nosql,
  mongodb,
  javascript,
  typescript,
  jsEngine,
  react,
  nextjs,
  vue,
  reactNative,
  nodejs,
  nestjs,
  python,
  fastapi,
  django,
  pythonAsync,
  pydanticSqlalchemy,
  pythonTooling,
  httpFrameworks,
  denoBun,
  stateManagement,
  serverState,
  graphql,
  grpc,
  restApi,
  auth,
  realtime,
  testing,
  buildTools,
  monorepos,
  webPerformance,
  browserApis,
  pwa,
  html,
  css,
  dataStructures,
  algorithms,
  aurora,
  rds,
  redshift,
  s3,
  dynamodb,
  cloudfront,
  ses,
  apiGateway,
  stepFunctions,
  eventbridge,
  samCloudformation,
  awsServerless,
  awsIam,
  cloudSecurity,
  microservices,
  devops,
  containers,
  webassembly,
  electron,
  tailwind,
  cssInJs,
  webComponents,
  browserSecurity,
  trpc,
  messageQueues,
  observability,
  systemDesign,
  systemDesignCases,
  aiEngineering,
  llms,
  mlFundamentals,
  mlops,
];

if (process.env.NODE_ENV !== "production") {
  const seenCategory = new Set<string>();
  for (const cat of categories) {
    if (seenCategory.has(cat.slug)) {
      throw new Error(`Duplicate category slug: "${cat.slug}"`);
    }
    seenCategory.add(cat.slug);

    const seenQuestion = new Set<string>();
    for (const q of cat.questions) {
      if (seenQuestion.has(q.id)) {
        throw new Error(`Duplicate question id "${q.id}" in category "${cat.slug}"`);
      }
      seenQuestion.add(q.id);
    }
  }
}

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

const difficultyOrder = { easy: 0, medium: 1, hard: 2 } as const;

export function sortByDifficulty<T extends { difficulty: keyof typeof difficultyOrder }>(items: T[]): T[] {
  return [...items].sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
}
