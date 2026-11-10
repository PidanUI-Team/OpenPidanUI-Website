/**
 * 下载页的版本数据：只在浏览器里异步实时拉取，构建期零请求。
 *
 * 站点是 `nitro.preset: 'static'` 的纯静态产物（Cloudflare assets-only），没有服务端运行时，
 * 所以「运行时」= 页面挂载之后的客户端请求。SSR / `nuxi generate` 预渲染阶段一律不发网络请求，
 * 首屏直接渲染仓库内的 `shared/data/downloads.json`，拉到实时数据再整体替换：
 * 既不会空白，也不会因为服务端与客户端首帧不一致而 hydration mismatch；禁用 JS 时同样有内容。
 *
 * GitHub REST API 允许跨域读取（`Access-Control-Allow-Origin: *`），但：
 * - `User-Agent` 是浏览器禁止设置的 header，`Authorization` 更不能进客户端产物
 *   （`GITHUB_TOKEN` 只属于构建环境，绝不下发）；
 * - 自定义 header 会触发 CORS 预检，所以这里保持「不带任何自定义头的简单 GET」。
 */
import type { GithubRelease, ReleasesPayload } from '#shared/releases';
import { normalizeReleases } from '#shared/releases';
import { SITE } from '#shared/site';
import fallback from '#shared/data/downloads.json';

const API_URL = `https://api.github.com/repos/${SITE.repo}/releases?per_page=20`;
const REQUEST_TIMEOUT_MS = 8000;

/**
 * 未认证限流是 60 次/小时/IP。GitHub 自身响应带 `Cache-Control: public, max-age=60`，
 * 所以本地会话缓存也只取 60 秒，不比服务端更陈旧；且只缓存成功结果，
 * 请求失败一律回退 downloads.json，不会把「离线快照」当成实时数据缓存下来。
 */
const CACHE_KEY = 'openpidanui:releases:v1';
const CACHE_TTL_MS = 60 * 1000;

export type ReleasesStatus = 'pending' | 'success' | 'error';

interface CacheEntry {
  savedAt: number;
  payload: ReleasesPayload;
}

const snapshot = fallback as unknown as ReleasesPayload;

/** 每次返回新对象，避免多个组件实例共用同一份响应式数据相互污染。 */
function snapshotPayload(): ReleasesPayload {
  return { source: 'snapshot', fetchedAt: snapshot.fetchedAt, releases: snapshot.releases };
}

function readCache(): ReleasesPayload | null {
  if (!import.meta.client) return null;
  try {
    const raw = window.sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry;
    if (entry?.payload?.source !== 'github' || !Array.isArray(entry.payload.releases)) return null;
    if (Date.now() - entry.savedAt > CACHE_TTL_MS) return null;
    return entry.payload;
  } catch {
    return null;
  }
}

function writeCache(payload: ReleasesPayload): void {
  if (!import.meta.client) return;
  try {
    const entry: CacheEntry = { savedAt: Date.now(), payload };
    window.sessionStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // 隐私模式 / 配额不足：缓存只是限流保护，写不进去不影响取数
  }
}

async function fetchLive(): Promise<ReleasesPayload> {
  const response = await fetch(API_URL, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  if (!response.ok) throw new Error(`GitHub Releases API 返回 ${response.status}`);

  const raw = (await response.json()) as GithubRelease[];
  if (!Array.isArray(raw)) throw new Error('GitHub Releases 返回格式异常');

  const releases = normalizeReleases(raw);
  if (!releases.length) throw new Error('仓库暂无 Release');

  return { source: 'github', fetchedAt: new Date().toISOString(), releases };
}

/** 同一页面里多个组件实例共用一次请求，避免重复消耗限流额度。 */
let inflight: Promise<ReleasesPayload> | null = null;

function loadLive(): Promise<ReleasesPayload> {
  if (!inflight) {
    inflight = fetchLive()
      .then((payload) => {
        writeCache(payload);
        return payload;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

export function useReleases() {
  // 首屏（包括预渲染出来的静态 HTML）就是兜底数据，拉取到之前页面始终有内容
  const payload = shallowRef<ReleasesPayload>(snapshotPayload());
  const status = ref<ReleasesStatus>('pending');
  const error = ref<unknown>(null);

  async function refresh(): Promise<void> {
    const cached = readCache();
    if (cached) {
      payload.value = cached;
      status.value = 'success';
      return;
    }

    status.value = 'pending';
    try {
      // 只有成功才替换；失败时保持/回退 downloads.json，且仅此时提示用户
      payload.value = await loadLive();
      status.value = 'success';
    } catch (cause) {
      error.value = cause;
      payload.value = snapshotPayload();
      status.value = 'error';
    }
  }

  onMounted(() => {
    void refresh();
  });

  const latest = computed(() => {
    const list = payload.value.releases;
    return list.find((release) => !release.prerelease) ?? list[0] ?? null;
  });
  const others = computed(() =>
    payload.value.releases.filter((release) => release.tag !== latest.value?.tag),
  );

  return { payload, latest, others, error, status, refresh };
}
