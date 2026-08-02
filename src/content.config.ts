import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const operations = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/operations' }),
  schema: z.object({
    number: z.number().int().min(0).max(34),
    title: z.string().min(1),
    part: z.enum(['common-workflow', 'property-workflows', 'closing-loop']),
    slug: z.string().regex(/^\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*$/),
    status: z.literal('scaffold'),
  }),
});

export const collections = { operations };
