<script setup lang="ts">
import { NAV_ITEMS } from '~/data/nav';
import { FRIEND_LINKS, SOCIAL_LINKS } from '~/data/socialLinks';
import { SITE } from '#shared/site';

// 全站底栏（与 PidanUI 官网同构）：品牌与站点导航（同时承担无 JS 时的导航兜底）、
// 关注我们、友情链接；底部左侧是版权说明。
/** 站点年份，需要写死成字符串而不是动态获取 */
const year: string = "2026";
</script>

<template>
  <UFooter class="mt-16 border-t border-default bg-elevated/40">
    <template #top>
      <UContainer class="max-w-none px-4 sm:px-6 lg:px-8">
        <div class="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          <!-- 品牌 + 站点导航 -->
          <div class="min-w-0">
            <NuxtLink class="flex items-center gap-2.5 text-lg font-bold text-default" to="/">
              <img
                class="size-8 rounded-lg object-contain"
                :src="withBase('/images/logo.webp')"
                :alt="SITE.brand"
                width="32"
                height="32"
                decoding="async"
                loading="lazy"
              />
              <span>{{ SITE.brand }}</span>
            </NuxtLink>
            <p class="mt-3 max-w-xs text-sm leading-relaxed text-toned">
              PidanUI 的辅助组件开源代码库：模块化、可审查、不修改系统文件。
            </p>
            <nav class="mt-4 flex flex-wrap gap-x-4 gap-y-2" aria-label="页脚导航">
              <NuxtLink
                v-for="item in NAV_ITEMS"
                :key="item.key"
                class="text-sm text-toned transition-colors hover:text-brand-600"
                :to="item.external ? item.href : withBase(item.href)"
                :target="item.external ? '_blank' : undefined"
                :rel="item.external ? 'noopener noreferrer' : undefined"
                >{{ item.label }}</NuxtLink
              >
            </nav>
          </div>

          <!-- 关注我们 -->
          <div class="min-w-0">
            <h2 class="mb-3 text-[13px] font-bold tracking-[0.5px] text-dimmed uppercase">
              关注我们
            </h2>
            <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              <a
                v-for="link in SOCIAL_LINKS"
                :key="link.key"
                class="flex items-center gap-2.5 rounded-lg border border-default px-2.5 py-2 text-sm text-toned transition-colors hover:border-brand-600/35 hover:text-brand-600"
                :href="link.href"
                target="_blank"
                rel="noopener noreferrer"
              >
                <UIcon :name="link.icon" class="size-4 shrink-0" aria-hidden="true" />
                <span class="truncate">{{ link.label }}</span>
              </a>
            </div>
          </div>

          <!-- 友情链接 -->
          <div class="min-w-0">
            <h2 class="mb-3 text-[13px] font-bold tracking-[0.5px] text-dimmed uppercase">
              友情链接
            </h2>
            <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              <a
                v-for="link in FRIEND_LINKS"
                :key="link.key"
                class="flex items-center gap-2.5 rounded-lg border border-default px-2.5 py-2 text-sm text-toned transition-colors hover:border-brand-600/35 hover:text-brand-600"
                :href="link.href"
                target="_blank"
                rel="noopener noreferrer"
              >
                <UIcon :name="link.icon" class="size-4 shrink-0" aria-hidden="true" />
                <span class="truncate">{{ link.label }}</span>
              </a>
            </div>
          </div>
        </div>
      </UContainer>
    </template>

    <template #left>
      <p class="text-sm leading-relaxed text-dimmed">
        © {{ year }} {{ SITE.brand }} · 本项目为《蛋仔派对》同人创作，非《蛋仔派对》官方出品。
      </p>
    </template>
  </UFooter>
</template>
