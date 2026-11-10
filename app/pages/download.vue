<script setup lang="ts">
import { SITE } from '#shared/site';

useSeoMeta({
  title: '下载',
  description: '下载 OpenPidanUI 的 Rainmeter 小组件与配套设置程序。当前版本来自 GitHub Releases。',
});

const { payload, latest, others, status } = useReleases();

const requirements = [
  { icon: 'i-lucide-hard-drive-download', label: 'Windows 10 及以上' },
  { icon: 'i-lucide-package', label: '需先安装 Rainmeter' },
  { icon: 'i-lucide-shield-check', label: '卸载＝切回默认主题' },
];
</script>

<template>
  <div>
    <PageHeading
      title="下载 OpenPidanUI"
      description="目前只提供 Rainmeter 小组件及其设置程序。版本数据在页面加载时从 GitHub Releases 实时拉取，同步完成前先显示仓库内的兜底数据。"
    />

    <div class="pb-4">
      <UAlert
        v-if="status === 'error'"
        class="mb-6"
        color="primary"
        variant="subtle"
        icon="i-lucide-circle-alert"
        title="当前展示的是离线快照"
        description="运行时未能连接 GitHub Releases（网络受限或 API 限流），已回退到仓库内的 downloads.json，版本信息可能不是最新的；完整列表请到仓库的 Releases 页面查看。"
      />

      <div v-if="latest" class="space-y-8">
        <section>
          <ReleaseCard :release="latest" featured />
        </section>

        <section v-if="others.length" class="space-y-4">
          <h2 class="text-lg font-semibold text-highlighted">历史版本</h2>
          <ReleaseCard v-for="release in others" :key="release.tag" :release="release" />
        </section>

        <div
          v-else-if="payload.releases.length === 0"
          class="rounded-xl border border-default p-8 text-center"
        >
          <p class="text-sm text-muted">仓库目前还没有 Release。</p>
          <UButton
            :to="`${SITE.repoUrl}/releases`"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-4"
            variant="soft"
          >
            去 Releases 页面看看
          </UButton>
        </div>
      </div>

      <!-- 系统要求 -->
      <section class="mt-10">
        <h2 class="text-lg font-semibold text-highlighted">安装前须知</h2>
        <div class="mt-4 flex flex-wrap gap-3">
          <span
            v-for="item in requirements"
            :key="item.label"
            class="inline-flex items-center gap-2 rounded-full border border-default bg-elevated px-4 py-2 text-sm text-muted"
          >
            <UIcon :name="item.icon" class="size-4 text-primary" />
            {{ item.label }}
          </span>
        </div>
        <p class="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
          组件不替换
          <code class="rounded bg-elevated px-1 font-mono text-xs">imageres.dll.mun</code>
          等系统文件， 所有改动都在主题包与 Rainmeter 皮肤目录里；想还原，切回默认主题即可。
        </p>
        <UButton
          :to="withBase('/docs/user/install-rainmeter')"
          variant="link"
          class="mt-2 px-0"
          trailing-icon="i-lucide-arrow-right"
        >
          去读安装文档
        </UButton>
      </section>

      <p class="mt-10 text-xs text-dimmed">
        数据来源：<a
          :href="`${SITE.repoUrl}/releases`"
          target="_blank"
          rel="noopener noreferrer"
          class="underline"
          >GitHub Releases</a
        >
        · 目标仓库 <code class="font-mono">{{ SITE.repo }}</code>
      </p>
    </div>
  </div>
</template>
