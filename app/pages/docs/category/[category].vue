<script setup lang="ts">
const route = useRoute();
/** 分类名可以是中文，路由参数会自动解码；这里再兜一层 decode 以防双重编码 */
const name = computed(() => {
  const raw = String(route.params.category ?? '');
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
});

const { groups } = await useDocsGroups();
const group = computed(() => groups.value.find((item) => item.name === name.value));

if (!group.value) {
  throw createError({ statusCode: 404, statusMessage: '分类不存在', fatal: true });
}

useSeoMeta({
  title: `${name.value} · 文档`,
  description: computed(() => group.value?.description ?? `${name.value}分类下的全部文档。`),
});
</script>

<template>
  <div>
    <!-- 返回文档：与 PidanUI 官网文章页的「返回新闻」同一套胶囊按钮 -->
    <nav class="mb-[18px]" aria-label="返回文档">
      <UButton
        :to="withBase('/docs')"
        variant="soft"
        color="primary"
        size="sm"
        class="rounded-full"
        icon="i-lucide-arrow-left"
        label="返回文档"
      />
    </nav>

    <PageHeading :title="name" :description="group?.description ?? `${name}分类下的全部文档。`" />

    <div class="pb-4">
      <ol class="space-y-3">
        <li v-for="entry in group?.displayEntries ?? []" :key="entry.path">
          <NuxtLink
            :to="withBase(entry.path)"
            class="group flex items-start gap-4 rounded-xl border border-default bg-elevated/40 p-4 transition-colors hover:border-primary/40 hover:bg-elevated"
          >
            <span
              class="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 font-mono text-xs font-medium text-primary"
            >
              {{ entry.order }}
            </span>
            <span class="min-w-0 flex-1">
              <span class="flex flex-wrap items-center gap-2">
                <span class="text-sm font-medium text-highlighted">{{ entry.title }}</span>
                <UBadge v-if="entry.badge" variant="subtle" color="primary" size="sm">{{
                  entry.badge
                }}</UBadge>
              </span>
              <span v-if="entry.description" class="mt-1 block text-sm leading-relaxed text-muted">
                {{ entry.description }}
              </span>
            </span>
            <UIcon
              name="i-lucide-arrow-right"
              class="mt-1 size-4 shrink-0 text-dimmed transition-colors group-hover:text-primary"
            />
          </NuxtLink>
        </li>
      </ol>

      <UButton :to="withBase('/docs')" variant="link" class="mt-6 px-0" icon="i-lucide-arrow-left">
        返回文档概览
      </UButton>
    </div>
  </div>
</template>
