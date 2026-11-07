export interface DocEntry {
  path: string;
  title: string;
  description?: string;
  /** 分类名，来自 frontmatter，可自由命名 */
  category: string;
  /** 分类内序号 */
  order: number;
  /** 分类间权重 */
  categoryOrder: number;
  badge?: string;
}

export interface DocGroup {
  name: string;
  description?: string;
  order: number;
  route: string;
  entries: DocEntry[];
}

/**
 * 文档分类视图：一次性取回全部文档的元信息（不取正文，避免 payload 变大）。
 *
 * 分类**不预先登记**：frontmatter 里 `category` 写什么就有什么，
 * 同名自动成组；`categoryOrder` 决定分类之间谁在前，`order` 决定组内顺序。
 *
 * 注意是 async：调用方要 `await`，否则 setup 阶段拿到的还是空数组
 * （Nuxt 只在那之后才等 asyncData，动态路由页面里同步读会读到空值）。
 */
export async function useDocsGroups() {
  const { data } = await useAsyncData(
    'docs:entries',
    () =>
      queryCollection('docs')
        .select('path', 'title', 'description', 'category', 'order', 'categoryOrder', 'badge')
        .all(),
    { default: () => [] },
  );

  const entries = computed<DocEntry[]>(() =>
    (data.value as DocEntry[])
      // 排除两个位置：/docs 概览本身，以及 /docs/<组> 这种「分类首页」——
      // 后者由分类页承担，混在列表里会多出一行「0 用户文档」的怪东西
      .filter((entry) => entry.path !== '/docs' && !/^\/docs\/[^/]+$/.test(entry.path))
      .map((entry) => ({
        ...entry,
        order: entry.order ?? 999,
        categoryOrder: entry.categoryOrder ?? 999,
      }))
      .sort((a, b) => a.order - b.order),
  );

  const groups = computed<DocGroup[]>(() => {
    const map = new Map<string, DocGroup>();

    for (const entry of entries.value) {
      let group = map.get(entry.category);
      if (!group) {
        group = {
          name: entry.category,
          order: entry.categoryOrder,
          route: `/docs/category/${encodeURIComponent(entry.category)}`,
          entries: [],
        };
        map.set(entry.category, group);
      }
      group.entries.push(entry);
    }

    // 分类描述由文章动态探测：优先取该分类的「索引 / 简介」页（order 为 0），
    // 没有则回退到组内第一篇；都不存在则为空。不再写死在代码里。
    for (const group of map.values()) {
      group.description =
        group.entries.find((e) => e.order === 0)?.description ?? group.entries[0]?.description;
    }

    return [...map.values()].sort(
      (a, b) => a.order - b.order || a.name.localeCompare(b.name, 'zh-CN'),
    );
  });

  /** 侧边栏排序用：分类权重 * 1000 + 组内序号 */
  const navRank = computed<Record<string, number>>(() =>
    Object.fromEntries(
      entries.value.map((entry) => {
        const group = groups.value.find((g) => g.name === entry.category);
        return [entry.path, (group?.order ?? 999) * 1000 + entry.order];
      }),
    ),
  );

  return { entries, groups, navRank };
}
