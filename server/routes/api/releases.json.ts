/**
 * 构建期抓取 GitHub Releases，归一化后预渲染成静态 JSON（产物：/api/releases.json）。
 *
 * 为什么不放客户端：未认证的 GitHub API 限流是 60 次/小时/IP，校园网或公司网出口共享一个 IP，
 * 页面一刷新就可能 403。放在构建期只有「每次构建 1 次」的消耗，访问端零请求、零 CORS。
 *
 * 断网 / 5xx / 限流都不抛错——否则 `prerender.failOnError: true` 会把一次网络抖动放大成构建失败；
 * 失败时回退到随仓库入库的 `shared/data/downloads.json`（与 GitHub 归一化后的结构一致），
 * 页面照常渲染，只是版本信息停在最近一次手写的数据上。
 */
import type { GithubRelease, ReleasesPayload, SiteRelease } from '#shared/releases';
import { normalizeReleases } from '#shared/releases';
import fallback from '#shared/data/downloads.json';

const REPO = 'PidanUI-Team/OpenPidanUI';

export default defineEventHandler(async (): Promise<ReleasesPayload> => {
  const token = process.env.GITHUB_TOKEN;

  try {
    const raw = await $fetch<GithubRelease[]>(
      `https://api.github.com/repos/${REPO}/releases?per_page=20`,
      {
        headers: {
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          // GitHub 强制要求 UA，Node 默认不带，缺了直接 403
          'User-Agent':
            'OpenPidanUI-Website/0.1 (+https://github.com/PidanUI-Team/OpenPidanUI-Website)',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        signal: AbortSignal.timeout(5000),
      },
    );

    const releases = normalizeReleases(raw);
    if (!releases.length) throw new Error('仓库暂无 Release');

    console.info(`[releases] GitHub 拉取成功：${releases.length} 个版本`);
    return { source: 'github', fetchedAt: new Date().toISOString(), releases };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[releases] GitHub 不可用，回退仓库内的 downloads.json：${message}`);
    return {
      source: 'snapshot',
      fetchedAt: fallback.fetchedAt,
      releases: fallback.releases as SiteRelease[],
    };
  }
});
