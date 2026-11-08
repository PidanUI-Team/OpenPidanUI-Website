import { defineCollection, defineContentConfig, z } from '@nuxt/content';

export default defineContentConfig({
  collections: {
    docs: defineCollection({
      type: 'page',
      source: { include: 'docs/**/*.md' },
      schema: z.object({
        /** 分类名，可自由命名（中文也行）。同名即同组，不需要预先登记 */
        category: z.string().min(1),
        /** 分类内的显示序号：侧边栏、分类页、上下篇都按它排 */
        order: z.number(),
        badge: z.string().optional(),
        draft: z.boolean().default(false),
      }),
    }),
  },
});
