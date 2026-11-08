<script setup lang="ts">
import { computed } from 'vue';
import type { ReleaseAsset } from '#shared/releases';
import { formatBytes } from '#shared/releases';

const props = defineProps<{ asset: ReleaseAsset }>();

/** 由 GitHub 返回的 content_type / 文件名推断一个简短的类型标签 */
const kind = computed(() => {
  const { contentType, name } = props.asset;
  if (/zip/i.test(contentType ?? '') || /\.zip$/i.test(name)) return 'ZIP';
  if (/\.rmskin$/i.test(name)) return 'Rainmeter';
  return '';
});
</script>

<template>
  <div
    class="flex flex-wrap items-center gap-3 rounded-lg border border-default bg-elevated px-4 py-3"
  >
    <UIcon name="i-lucide-package" class="size-4 shrink-0 text-primary" />
    <div class="min-w-0 flex-1">
      <p class="truncate text-sm font-medium text-highlighted">{{ asset.name }}</p>
      <p class="mt-0.5 text-xs text-dimmed">
        {{ formatBytes(asset.size) }}<template v-if="kind"> · {{ kind }}</template> · 已下载
        {{ asset.downloadCount }} 次
      </p>
    </div>
    <UButton
      :to="asset.url"
      target="_blank"
      rel="noopener noreferrer"
      size="sm"
      icon="i-lucide-download"
    >
      下载
    </UButton>
  </div>
</template>
