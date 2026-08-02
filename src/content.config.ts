import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

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
    recipe_slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    status: z.enum(['scaffold', 'draft', 'reviewed']),
  }),
});

const framework = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/framework' }),
  schema: z.object({
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: z.string().min(1),
    status: z.enum(['scaffold', 'draft', 'reviewed']),
  }),
});

const topics = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/topics' }),
  schema: z.object({
    topic_slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    status: z.enum(['draft', 'reviewed']),
  }),
});

export const collections = { legacyOperations, coreOperations, recipes, framework, topics };
