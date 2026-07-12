import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    category: z.enum(['loodgieter', 'klussen', 'algemeen']),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    author: z.string().default('Stepan namens Vladimir Porva'),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
