import { parse as parseYaml } from 'yaml';

export interface DocEntry {
  path: string;
  title: string;
  description?: string;
  /** 分类名，来自 frontmatter，可自由命名 */
  category: string;
  /** 分类内序号 */
  order: number;
  badge?: string;
}

export interface DocGroup {
  name: string;
  description?: string;
  order: number;
  route: string;
  entries: DocEntry[];
  /** 首页卡片 / 分类页要列出的条目：展示该分类下的全部文档（含 landing / 索引页），
   *  分类完全由 frontmatter 动态增减，任何分类被增删都不会出现空白。 */
  displayEntries: DocEntry[];
}

interface CategoryNavConfig {
  title?: string;
  categoryOrder?: number;
  description?: string;
}

/**
 * 分类侧配置：每个分类目录下的 `.navigation.yml` 统一描述该分类的 `title`、`categoryOrder`
 * 与 `description`。一次性读取（import.meta.glob 在构建期求值），产出三份映射：
 *  - `byTitle`：分类名 → 排序权重，供分组排序使用；
 *  - `byTitleDesc`：分类名 → 描述，供首页 / 分类页展示，确保与导航配置保持一致；
 *  - `byPath`：分类在侧边栏导航树里的目录路径（如 /docs/quickstart）→ 分类标题，
 *    供侧边栏把「分类节点」的标题强制绑定为分类名，避免其误沿用 landing 页标题。
 */
const categoryNavConfig = (() => {
  const sources = import.meta.glob('../../content/docs/**/.navigation.yml', {
    eager: true,
    query: '?raw',
    import: 'default',
  });
  const byTitle = new Map<string, number>();
  const byTitleDesc = new Map<string, string>();
  const byPath = new Map<string, string>();
  for (const [file, raw] of Object.entries(sources)) {
    try {
      const data = parseYaml(raw as string) as CategoryNavConfig;
      if (!data?.title) continue;
      // 由 .navigation.yml 所在目录反推导航树里的目录路径：去掉数字前缀（与
      // @nuxt/content 的 URL 归一化一致，例如 1.quickstart → quickstart）。
      const dir = file.replace(/^.*content\/docs\//, '').replace(/\/\.navigation\.yml$/, '');
      const urlPath =
        '/docs/' +
        dir
          .split('/')
          .map((s) => s.replace(/^\d+\./, ''))
          .join('/');
      byPath.set(urlPath, data.title);
      if (typeof data.categoryOrder === 'number') {
        byTitle.set(data.title, data.categoryOrder);
      }
      if (typeof data.description === 'string' && data.description.trim()) {
        byTitleDesc.set(data.title, data.description.trim());
      }
    } catch {
      // 忽略无法解析的导航配置
    }
  }
  return { byTitle, byTitleDesc, byPath };
})();

const categoryOrderByTitle = categoryNavConfig.byTitle;

/**
 * 文档分类视图：一次性取回全部文档的元信息（不取正文，避免 payload 变大）。
 *
 * 分类**不预先登记**：frontmatter 里 `category` 写什么就有什么，同名自动成组；
 * 分类间的先后顺序由对应 `.navigation.yml` 的 `categoryOrder` 决定，`order` 决定组内顺序。
 *
 * 注意是 async：调用方要 `await`，否则 setup 阶段拿到的还是空数组
 * （Nuxt 只在那之后才等 asyncData，动态路由页面里同步读会读到空值）。
 */
export async function useDocsGroups() {
  const { data } = await useAsyncData(
    'docs:entries',
    () =>
      queryCollection('docs')
        .select('path', 'title', 'description', 'category', 'order', 'badge')
        .all(),
    { default: () => [] },
  );

  const entries = computed<DocEntry[]>(() =>
    (data.value as DocEntry[])
      // 只排除 /docs 概览本身。「分类 landing 页」(/docs/<分类名>) 仍保留：
      // 分组、动态描述都依赖它；是否展示由 groups 里的 displayEntries 决定。
      .filter((entry) => entry.path !== '/docs')
      .map((entry) => ({
        ...entry,
        order: entry.order ?? 999,
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
          order: categoryOrderByTitle.get(entry.category) ?? 999,
          route: `/docs/category/${encodeURIComponent(entry.category)}`,
          entries: [],
          displayEntries: [],
        };
        map.set(entry.category, group);
      }
      group.entries.push(entry);
    }

    // 分类描述以对应 `.navigation.yml` 的 `description` 为准（与导航配置保持一致），
    // 不再沿用 landing 页的描述；若该分类未配置则回退到 landing / 首篇描述。
    const categoryDescByTitle = categoryNavConfig.byTitleDesc;
    for (const group of map.values()) {
      group.description =
        categoryDescByTitle.get(group.name) ??
        group.entries.find((e) => e.order === 0)?.description ??
        group.entries[0]?.description;

      // 文章列表展示该分类下的全部文档（含 landing / 索引页），
      // 分类完全由 frontmatter 动态增减，任何分类被增删都不会出现空白。
      group.displayEntries = group.entries;
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

  return {
    entries,
    groups,
    navRank,
    /** 分类目录路径 → 分类标题：供侧边栏把分类节点标题绑定为分类名 */
    categoryTitles: Object.fromEntries(categoryNavConfig.byPath),
  };
}
