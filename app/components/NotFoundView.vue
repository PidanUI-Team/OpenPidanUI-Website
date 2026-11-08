<!-- 这里暂时不需要defineProps
<script setup lang="ts">
defineProps<{
  title?: string;
  description?: string;
}>();
</script>
-->
<template>
  <div class="mx-auto flex w-full max-w-page flex-col items-center px-4 py-24 text-center sm:px-6">
    <div class="flex h-36 w-36 items-center justify-center rounded-full bg-elevated">
      <img src="http://via.placeholder.com/512x512.webp" alt="404" class="object-contain" />
    </div>
    <h1 class="mt-4 text-2xl font-bold text-highlighted">哎呀~页面跑丢啦</h1>
    <p class="mt-3 max-w-md text-sm leading-relaxed text-muted">
      小蛋仔找不着这个页面咯，也许链接输错啦，或者它偷偷躲起来啦~
    </p>
    <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
      <UButton to="/" icon="i-lucide-house" size="lg">回到首页</UButton>
      <UButton to="/docs" variant="outline" color="neutral" icon="i-lucide-book-open" size="lg"
        >去读文档</UButton
      >
    </div>
  </div>
</template>
