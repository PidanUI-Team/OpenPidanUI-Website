<script setup lang="ts">
import { JOIN_CARDS } from '~/data/home';
</script>

<template>
  <div class="grid gap-6 md:grid-cols-2">
    <UPageCard
      v-for="card in JOIN_CARDS"
      :key="card.title"
      :icon="card.icon"
      :title="card.title"
      :description="card.description"
      variant="outline"
    >
      <template #footer>
        <div class="flex flex-wrap gap-2">
          <template v-for="link in card.links" :key="link.label">
            <UButton
              v-if="link.external"
              :to="link.to"
              target="_blank"
              rel="noopener noreferrer"
              :icon="link.icon"
              variant="soft"
              color="neutral"
              size="sm"
              trailing-icon="i-lucide-arrow-up-right"
              :label="link.label"
            />
            <UButton
              v-else
              :to="withBase(link.to)"
              variant="soft"
              size="sm"
              :label="link.label"
              :icon="link.icon"
            />
          </template>
        </div>
      </template>
    </UPageCard>
  </div>
</template>
