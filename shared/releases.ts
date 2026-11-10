/** GitHub Releases 归一化后的站点自有 schema —— 组件只认这一份，不泄漏 GitHub 的字段形状。 */
export interface ReleaseAsset {
  name: string;
  size: number;
  downloadCount: number;
  url: string;
  /** GitHub 资产 label（可为空），用于更友好的展示名 */
  label?: string;
  /** GitHub 资产 content_type，例如 application/x-zip-compressed */
  contentType?: string;
}

export interface SiteRelease {
  tag: string;
  version: string;
  name: string;
  publishedAt: string;
  /** 归一化时就格式化成固定字符串，避免服务端/客户端 Intl 差异导致 hydration mismatch */
  publishedAtLabel: string;
  prerelease: boolean;
  notes: string;
  htmlUrl: string;
  assets: ReleaseAsset[];
}

export interface ReleasesPayload {
  source: 'github' | 'snapshot';
  fetchedAt: string | null;
  releases: SiteRelease[];
}

interface GithubAsset {
  name: string;
  label: string | null;
  content_type: string;
  size: number;
  download_count: number;
  browser_download_url: string;
}

export interface GithubRelease {
  tag_name: string;
  target_commitish?: string;
  name: string | null;
  body: string | null;
  html_url: string;
  prerelease: boolean;
  draft?: boolean;
  published_at: string;
  assets: GithubAsset[];
}

const KEEP_ASSET = /\.(rmskin|zip)$/i;

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** release body 压成纯文本：不引入运行时 Markdown 渲染，最多 20 行。 */
function plainNotes(body: string | null): string {
  if (!body) return '';
  const text = body
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`>]/g, '')
    .replace(/\r\n/g, '\n')
    .trim();
  return text.split('\n').slice(0, 20).join('\n');
}

export function normalizeReleases(raw: GithubRelease[]): SiteRelease[] {
  return raw
    .filter((r) => !r.draft)
    .map((r) => ({
      tag: r.tag_name,
      version: r.tag_name.replace(/^v/i, ''),
      name: r.name?.trim() || r.tag_name,
      publishedAt: r.published_at,
      publishedAtLabel: formatDate(r.published_at),
      prerelease: r.prerelease,
      notes: plainNotes(r.body),
      htmlUrl: r.html_url,
      assets: r.assets
        .filter((a) => KEEP_ASSET.test(a.name))
        .map((a) => ({
          name: a.name,
          size: a.size,
          downloadCount: a.download_count,
          url: a.browser_download_url,
          label: a.label ?? undefined,
          contentType: a.content_type,
        })),
    }));
}

export function formatBytes(bytes: number): string {
  if (!bytes) return '—';
  const mb = bytes / 1024 / 1024;
  if (mb >= 1) return `${mb.toFixed(2)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
