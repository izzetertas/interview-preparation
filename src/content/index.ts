import { algorithms } from "./algorithms";
import { apiGateway } from "./api-gateway";
import { aurora } from "./aurora";
import { awsIam } from "./aws-iam";
import { awsServerless } from "./aws-serverless";
import { browserApis } from "./browser-apis";
import { buildTools } from "./build-tools";
import { cloudfront } from "./cloudfront";
import { cloudSecurity } from "./cloud-security";
import { containers } from "./containers";
import { css } from "./css";
import { database } from "./database";
import { dataStructures } from "./data-structures";
import { devops } from "./devops";
import { dynamodb } from "./dynamodb";
import { eventbridge } from "./eventbridge";
import { html } from "./html";
import { javascript } from "./javascript";
import { mongodb } from "./mongodb";
import { nestjs } from "./nestjs";
import { nextjs } from "./nextjs";
import { nodejs } from "./nodejs";
import { nosql } from "./nosql";
import { postgres } from "./postgres";
import { rds } from "./rds";
import { react } from "./react";
import { redshift } from "./redshift";
import { s3 } from "./s3";
import { samCloudformation } from "./sam-cloudformation";
import { serverState } from "./server-state";
import { ses } from "./ses";
import { sql } from "./sql";
import { stateManagement } from "./state-management";
import { stepFunctions } from "./step-functions";
import { testing } from "./testing";
import { typescript } from "./typescript";
import { vue } from "./vue";
import { webPerformance } from "./web-performance";
import type { Category } from "./types";

export const categories: Category[] = [
  database,
  sql,
  postgres,
  nosql,
  mongodb,
  javascript,
  typescript,
  react,
  nextjs,
  vue,
  nodejs,
  nestjs,
  stateManagement,
  serverState,
  testing,
  buildTools,
  webPerformance,
  browserApis,
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
  devops,
  containers,
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
