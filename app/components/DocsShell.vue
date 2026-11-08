<script setup lang="ts">
/**
 * 文档页外壳：桌面三栏（目录 / 正文 / 本页目录），窄屏把目录折成正文上方的面板。
 * 不用 Drawer —— 与顶栏同一种「grid-rows 0fr↔1fr + inert」的展开方式。
 *
 * 目录顺序以 frontmatter 的 `order` 为准：@nuxt/content 生成的 navigation 按文件系统排，
 * 这里用分类 `.navigation.yml` 的 `categoryOrder`（经 useDocsGroups）与文章 `order` 映射成 navRank 把它纠正回来；
 * 同时把每个「分类目录节点」的标题强制绑定为 `.navigation.yml` 里的分类名，避免其误沿用 landing 页标题。
 */
import type { ContentNavigationItem } from '@nuxt/content';

defineProps<{
  tocLinks?: { id: string; text: string; depth: number }[];
  showToc?: boolean;
}>();

const navigation = inject<Ref<ContentNavigationItem[] | null>>('navigation');
const { navRank, categoryTitles } = await useDocsGroups();
const open = ref(false);

function sortItems(items: ContentNavigationItem[]): ContentNavigationItem[] {
  return [...items]
    .map((item) => (item.children?.length ? { ...item, children: sortItems(item.children) } : item))
    .sort((a, b) => {
      // 叶子节点用 navRank（分类权重 * 1000 + 组内 order）；分组节点取组内最小 rank
      const rank = (node: ContentNavigationItem) => {
        if (node.children?.length) {
          return Math.min(
            ...node.children.map((child) => navRank.value[child.path ?? ''] ?? 999999),
          );
        }
        return navRank.value[node.path ?? ''] ?? 999999;
      };
      return rank(a) - rank(b);
    });
}

/**
 * 用 `.navigation.yml` 的分类名覆盖导航树里「分类目录节点」的标题。
 * @nuxt/content 在生成树时会把分类 landing 页（index）并入目录节点，可能让目录节点
 * 标题变成 landing 页标题；这里按目录路径显式绑定回分类名，确保二级分类标题正确。
 * 仅覆盖带子项的「容器 / 目录节点」，叶子页面（含与目录同路径的 landing 页）保留自身标题。
 */
function applyCategoryTitles(items: ContentNavigationItem[]): ContentNavigationItem[] {
  return items.map((item) => {
    const overridden = categoryTitles[item.path ?? ''];
    const next = overridden && item.children?.length ? { ...item, title: overridden } : item;
    if (next.children?.length) {
      return { ...next, children: applyCategoryTitles(next.children) };
    }
    return next;
  });
}

const sortedNavigation = computed(() => applyCategoryTitles(sortItems(navigation.value ?? [])));
</script>

<template>
  <div class="w-full">
    <div
      class="lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[240px_minmax(0,1fr)_200px]"
    >
      <!-- 桌面左侧目录：overflow-x-hidden + 内层 px-2.5 抵消 UContentNavigation
           根节点的 -mx-2.5（hover 底色的外扩量），否则 overflow-y:auto 会
           连带产生一条水平滚动条 -->
      <aside class="hidden lg:block">
        <div class="sticky top-20 max-h-[calc(100vh-6rem)] overflow-x-hidden overflow-y-auto pr-2">
          <div class="px-2.5">
            <UContentNavigation
              v-if="sortedNavigation.length"
              :navigation="sortedNavigation"
              highlight
              :default-open="true"
              :ui="{ link: 'text-sm' }"
            />
          </div>
        </div>
      </aside>

      <div class="min-w-0">
        <!-- 窄屏目录 -->
        <div class="mb-6 lg:hidden">
          <UButton
            block
            variant="soft"
            color="neutral"
            :icon="open ? 'i-lucide-chevron-up' : 'i-lucide-list'"
            :aria-expanded="open"
            aria-controls="docs-mobile-nav"
            @click="open = !open"
          >
            文档目录
          </UButton>
          <div
            id="docs-mobile-nav"
            class="grid overflow-hidden transition-[grid-template-rows] duration-300"
            :class="open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
            :inert="!open"
          >
            <div class="min-h-0 overflow-hidden">
              <UContentNavigation
                v-if="sortedNavigation.length"
                :navigation="sortedNavigation"
                :default-open="false"
                class="rounded-lg border border-default p-2"
                :ui="{ link: 'text-sm' }"
              />
            </div>
          </div>
        </div>

        <slot />
      </div>

      <!-- 右侧本页目录 -->
      <aside v-if="showToc && tocLinks?.length" class="hidden xl:block">
        <div class="sticky top-20">
          <UContentToc :links="tocLinks" title="本页目录" :ui="{ link: 'text-sm' }" />
        </div>
      </aside>
    </div>
  </div>
</template>
