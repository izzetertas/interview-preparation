import { algorithms } from "./algorithms";
import { apiGateway } from "./api-gateway";
import { aurora } from "./aurora";
import { cloudfront } from "./cloudfront";
import { css } from "./css";
import { database } from "./database";
import { dataStructures } from "./data-structures";
import { dynamodb } from "./dynamodb";
import { eventbridge } from "./eventbridge";
import { html } from "./html";
import { javascript } from "./javascript";
import { mongodb } from "./mongodb";
import { nodejs } from "./nodejs";
import { nosql } from "./nosql";
import { postgres } from "./postgres";
import { rds } from "./rds";
import { react } from "./react";
import { redshift } from "./redshift";
import { s3 } from "./s3";
import { samCloudformation } from "./sam-cloudformation";
import { ses } from "./ses";
import { stepFunctions } from "./step-functions";
import { typescript } from "./typescript";
import type { Category } from "./types";

export const categories: Category[] = [
  database,
  postgres,
  nosql,
  mongodb,
  javascript,
  typescript,
  react,
  nodejs,
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
