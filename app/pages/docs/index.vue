<script setup lang="ts">
import { computed } from 'vue';

useSeoMeta({
  title: '文档',
  description: 'OpenPidanUI 文档：快速上手使用组件，以及仓库结构、构建调试与发版流程。',
});

const { groups } = await useDocsGroups();

// 描述跟随动态探测到的分类，不再写死「分成两类 / 安装 Rainmeter」这类假设：
// 新增或移除某个分类（如本次移除「用户文档」）时，这里会自动跟着变。
const leadDescription = computed(() => {
  if (!groups.value.length) return '文档还在整理中，过段时间再来看看。';
  const names = groups.value.map((g) => g.name).join('、');
  const first = groups.value[0]?.name ?? '';
  return `目前收录 ${groups.value.length} 个分类：${names}。第一次使用建议先读「${first}」。`;
});
</script>

<template>
  <div>
    <PageHeading title="文档" :description="leadDescription" />

    <div class="pb-4">
      <DocsGroupCards :groups="groups" />

      <UAlert
        class="mt-8"
        color="neutral"
        variant="subtle"
        icon="i-lucide-info"
        title="文档的写作正在进行中 "
        description="首版只写了一些必要的部分。如果你觉得文档不完善的话，可以直接去网站仓库提 Issue。"
      />
    </div>
  </div>
</template>
