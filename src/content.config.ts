import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const legacyOperations = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/operations' }),
  schema: z.object({
    number: z.number().int().min(0).max(34),
    title: z.string().min(1),
    part: z.enum(['common-workflow', 'property-workflows', 'closing-loop']),
    slug: z.string().regex(/^\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*$/),
    status: z.literal('scaffold'),
  }),
});

const coreOperations = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/core-operations' }),
  schema: z.object({
    operation_id: z.string().regex(/^O\d{2}$/),
    status: z.enum(['scaffold', 'draft', 'reviewed']),
  }),
});

const recipes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/recipes' }),
  schema: z.object({
    recipe_slug: slug,
    status: z.enum(['scaffold', 'draft', 'reviewed']),
  }),
});

const framework = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/framework' }),
  schema: z.object({
    slug,
    title: z.string().min(1),
    status: z.enum(['scaffold', 'draft', 'reviewed']),
  }),
});

const topics = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/topics' }),
  schema: z.object({
    topic_slug: slug,
    status: z.enum(['draft', 'reviewed']),
  }),
});

const practicalGuides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/practical-guides' }),
  schema: z.object({
    topic_slug: slug,
    guide_slug: slug,
    title: z.string().min(1),
    kind: z.enum(['implementation', 'worked-example', 'visual-note']),
    tools: z.array(slug).min(1),
    status: z.enum(['draft', 'reviewed']),
    summary: z.string().min(20),
    tested_versions: z.array(z.string().min(3)).min(1),
    execution_script: z.string().regex(/^examples\/practical-guides\/[a-z0-9_]+\.py$/),
    source_ids: z.array(slug).min(1),
    media_ids: z.array(slug).default([]),
    review: z.string().regex(/^docs\/reviews\/[a-z0-9-]+\.md$/),
    reviewed_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }),
});

export const collections = {
  legacyOperations,
  coreOperations,
  recipes,
  framework,
  topics,
  practicalGuides,
};
