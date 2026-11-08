export default defineAppConfig({
  // 图标一律渲染成内联 <svg>：静态站首屏就要有图标
  icon: {
    mode: 'svg',
  },

  ui: {
    colors: {
      primary: 'brand',
      neutral: 'ink',
      error: 'danger',
    },

    /* ---- UPageHeader ----
       Nuxt UI 的默认值偏营销页（py-8 + sm:text-4xl）。列表页需要的是
       「下边框 + pb-5」的紧凑节奏，与 PidanUI 官网一致。 */
    pageHeader: {
      slots: {
        root: 'py-0 pb-5 mb-6 border-b border-default',
        wrapper: 'flex flex-row flex-wrap items-end justify-between gap-x-4 gap-y-3',
        description: 'mt-1.5 text-[13px] text-dimmed',
        links: 'flex flex-wrap gap-2',
      },
    },

    /* ---- UPageGrid ----
       默认 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 是固定列数，卡片宽度
       会被视口牵着走。改为 auto-fill：密度由调用点的 --grid-min 决定
       （首页特性 250 / 分类索引 220），min(…, 100%) 顺带兜住窄屏。
       末尾的 ! 只用于压掉主题里的 sm:/lg: 列数。 */
    pageGrid: {
      base:
        'relative grid gap-3.5! ' +
        'grid-cols-[repeat(auto-fill,minmax(min(var(--grid-min,clamp(280px,28vw,360px)),100%),1fr))]!',
    },

    // 文档正文的观感由 app/assets/styles/prose.css 独占（与 PidanUI 官网同源）。
    // 这里把同名 Prose slot 的默认工具类清空，避免两套规则抢同一批属性；
    // 需要单独调某个元素时，优先改 prose.css 的 .doc-body 规则。
    prose: {
      h1: { base: '' },
      h2: { base: '' },
      h3: { base: '' },
      h4: { base: '' },
      p: { base: '' },
      a: { base: '' },
      strong: { base: '' },
      code: { base: '' },
      pre: { base: '' },
      ul: { base: '' },
      ol: { base: '' },
      li: { base: '' },
      // Nuxt UI 的 ProseBlockquote 主题默认带 italic 工具类（extend 合并且
      // 空串压不掉）。这里用 not-italic 在同组里覆盖它，让引用块默认保持正体；
      // 显式修饰符（*强调* → <em>）仍由元素自身渲染为斜体。
      blockquote: { base: 'not-italic' },
      hr: { base: '' },
      img: { base: '' },
      table: { base: '' },
      th: { base: '' },
      td: { base: '' },
    },
  },
});
