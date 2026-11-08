<script setup lang="ts">
import type { DocGroup } from '~/composables/useDocsGroups';

defineProps<{ groups: DocGroup[] }>();
</script>

<template>
  <div class="grid gap-5 md:grid-cols-2">
    <UCard v-for="group in groups" :key="group.name" variant="soft" :ui="{ body: 'p-6' }">
      <div class="flex items-center gap-2">
        <h2 class="text-base font-semibold text-highlighted">{{ group.name }}</h2>
        <UBadge variant="subtle" color="neutral" size="sm" class="ml-auto"
          >{{ group.displayEntries.length }} 篇</UBadge
        >
      </div>

      <p v-if="group.description" class="mt-2 text-sm leading-relaxed text-muted">
        {{ group.description }}
      </p>

      <ol class="mt-4 space-y-1.5">
        <li v-for="entry in group.displayEntries" :key="entry.path">
          <NuxtLink
            :to="withBase(entry.path)"
            class="group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted transition-colors hover:bg-elevated hover:text-highlighted"
          >
            <span class="w-4 shrink-0 text-right font-mono text-xs text-dimmed">{{
              entry.order
            }}</span>
            <span class="min-w-0 flex-1 truncate">{{ entry.title }}</span>
            <UIcon
              name="i-lucide-arrow-right"
              class="size-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
            />
          </NuxtLink>
        </li>
      </ol>

      <UButton
        :to="withBase(group.route)"
        variant="soft"
        size="sm"
        class="mt-4"
        trailing-icon="i-lucide-arrow-right"
      >
        查看分类
      </UButton>
    </UCard>
  </div>
</template>
