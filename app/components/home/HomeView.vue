<script setup lang="ts">
import { ABOUT_TEXT, ABOUT_TIMELINE, PROMO_IMAGE } from '~/data/home';

// 首页版式与 PidanUI 官网一致：Hero（左文右图）→ 温馨提示 → 项目特性 →
// 组件展示 → 关于 → 加入开发，区块节奏走同一份 SECTION_UI。
// 滚动入场由 layout 的 useScrollReveal 统一处理（按 .page-shell 层级打标）。
const promoFailed = ref(false);

/** 各区块共用的纵向节奏：默认主题的 py-16/24/32 会把首页拉得很长，压到一半左右 */
const SECTION_UI = {
  container: 'py-10 sm:py-12 lg:py-14 gap-6 sm:gap-8',
  body: 'mt-8',
  footer: 'mt-8',
} as const;
</script>

<template>
  <div class="mx-auto max-w-page">
    <!-- Hero：左侧项目名 / 简介 / 下载按钮，右侧宣传图。
         UPageHero 在 horizontal 下的两列分别是「wrapper（标题/描述/按钮）」与
         默认插槽，因此宣传图必须走默认插槽 —— 放进 #body 会被塞进左列底部。 -->
    <UPageHero
      orientation="horizontal"
      :ui="{ container: 'py-8 sm:py-12 lg:py-16 gap-10 lg:gap-14' }"
    >
      <template #headline>
        <UBadge variant="soft" color="primary" size="md" label="PidanUI 配套组件 · 开源" />
      </template>

      <template #title>
        <span
          class="hero-title text-[clamp(34px,5.4vw,54px)] leading-[1.15] font-extrabold tracking-[1px]"
        >
          OpenPidanUI
        </span>
      </template>

      <template #description>
        <p class="max-w-[560px] text-[15.5px] leading-[1.8] text-toned">
          在你的电脑上自由定制一个《蛋仔派对》风格的桌面，只需几分钟。
        </p>
      </template>

      <template #links>
        <UButton
          :to="withBase('/download')"
          size="lg"
          icon="i-lucide-download"
          trailing-icon="i-lucide-arrow-right"
          label="立即下载"
        />
        <UButton
          :to="withBase('/docs')"
          size="lg"
          variant="outline"
          color="neutral"
          label="查看文档"
        />
      </template>

      <div class="overflow-hidden rounded-2xl shadow-float ring-1 ring-default">
        <img
          v-if="!promoFailed"
          :src="PROMO_IMAGE"
          alt="OpenPidanUI 桌面效果宣传图"
          width="960"
          height="540"
          class="aspect-video w-full object-cover"
          decoding="async"
          fetchpriority="high"
          @error="promoFailed = true"
        />
        <div
          v-else
          class="flex aspect-video w-full flex-col items-center justify-center gap-3 bg-elevated text-dimmed"
        >
          <UIcon name="i-lucide-palette" class="size-10" />
          <p class="text-sm">宣传图加载失败</p>
        </div>
      </div>
    </UPageHero>

    <!-- 重要说明 -->
    <UAlert
      class="mb-12"
      color="primary"
      variant="soft"
      icon="i-lucide-triangle-alert"
      title="温馨提示"
      description="OpenPidanUI 是 PidanUI 的辅助组件开源代码库，面向 Windows 10 及以上系统。组件不做持久化的系统改动，卸载时切回默认主题即可恢复。"
    />

    <!-- 项目特性 -->
    <UPageSection
      title="项目特性"
      description="桌面美化最容易踩的两个坑是「改坏系统」和「装完不敢卸」。这一版把这两件事都当作硬约束。"
      :ui="{ ...SECTION_UI, container: 'pt-0 pb-10 sm:pb-12 lg:pb-14 gap-6 sm:gap-8' }"
    >
      <FeatureGrid />
    </UPageSection>

    <!-- 组件展示 -->
    <UPageSection
      title="看看它长什么样"
      description="截图目前是占位素材，只用来确认版式；正式宣传图会在上线前整体替换。"
      :ui="SECTION_UI"
    >
      <ShowcaseCarousel />
    </UPageSection>

    <!-- 关于 -->
    <UPageSection title="关于 OpenPidanUI" :ui="SECTION_UI">
      <div class="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
        <div>
          <p
            v-for="line in ABOUT_TEXT"
            :key="line"
            class="mt-3 text-[15px] leading-relaxed text-toned first:mt-0"
          >
            {{ line }}
          </p>
          <UButton
            :to="withBase('/docs/developer')"
            variant="link"
            class="mt-4 px-0"
            trailing-icon="i-lucide-arrow-right"
          >
            看看仓库结构
          </UButton>
        </div>

        <ol class="relative space-y-6 border-l border-default pl-6">
          <li v-for="item in ABOUT_TIMELINE" :key="item.time" class="relative">
            <span
              class="absolute top-1.5 -left-[29px] size-2 rounded-full bg-primary ring-4 ring-default"
            />
            <p class="text-xs font-medium tracking-wide text-primary">{{ item.time }}</p>
            <h3 class="mt-1 text-sm font-semibold text-highlighted">{{ item.title }}</h3>
            <p class="mt-1 text-sm leading-relaxed text-muted">{{ item.description }}</p>
          </li>
        </ol>
      </div>
    </UPageSection>

    <!-- 加入开发 -->
    <UPageSection
      title="一起把它做完"
      description="组件按模块划分，一个人也能维护一个模块。遇到问题先在文档里翻一翻，再来群里说。"
      :ui="SECTION_UI"
    >
      <JoinDevSection />
    </UPageSection>
  </div>
</template>

<style scoped>
/* 品牌渐变文字：需要 background-clip:text，工具类写起来过于冗长 */
.hero-title {
  background: var(--brand-grad);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-title em {
  font-style: normal;
}
</style>
