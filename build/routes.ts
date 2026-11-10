/**
 * 预渲染路由的唯一入口。
 *
 * `crawlLinks: false` 意味着「不枚举就会漏页」——所以新增任何路由都要写进这里，
 * 并在 `scripts/verify-output.mjs` 里被逐条校验（`failOnError` 只能抓渲染报错，
 * 抓不到"该枚举却没枚举"这种漏页）。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DOCS_DIR = path.join(ROOT, 'content', 'docs');

/** Content v3 的约定：`1.user` → `user`，同时数字前缀决定排序。 */
export function stripOrder(segment: string): string {
  return segment.replace(/^\d+\./, '');
}

export interface DocsWalkResult {
  routes: string[];
  /** frontmatter 里出现过的分类 slug，用来枚举 /docs/category/<slug> */
  categories: Set<string>;
}

function walkDocs(dir: string, routeBase: string, result: DocsWalkResult): void {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    // .navigation.yml 等隐藏文件代表分组元信息，不产生路由
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDocs(full, `${routeBase}/${stripOrder(entry.name)}`, result);
      continue;
    }
    if (!entry.name.endsWith('.md')) continue;
    const { data } = matter(fs.readFileSync(full, 'utf-8'));
    if (data.draft === true) continue;
    if (typeof data.category === 'string' && data.category) result.categories.add(data.category);
    const slug = stripOrder(entry.name.replace(/\.md$/, ''));
    result.routes.push(slug === 'index' ? routeBase : `${routeBase}/${slug}`);
  }
}

export function buildRoutes(): string[] {
  // GitHub Releases 已改为客户端运行时拉取，构建期不再预渲染 /api/releases.json
  const base = ['/', '/download', '/docs', '/404.html'];
  const result: DocsWalkResult = { routes: [], categories: new Set() };
  walkDocs(DOCS_DIR, '/docs', result);

  // 分类页：slug 直接从 frontmatter 收集，新增分类不用改这里
  const categoryRoutes = [...result.categories]
    .sort((a, b) => a.localeCompare(b, 'zh-CN'))
    .map((name) => `/docs/category/${encodeURIComponent(name)}`);
  return [...base, ...result.routes, ...categoryRoutes];
}
