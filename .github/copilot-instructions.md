# Copilot Instructions

> 本文件仅适用于 **OpenPidanUI-Website**（OpenPidanUI 官网）仓库，请勿套用到 PidanUI 官网、冷域观者站或其他同族项目——它们虽然共用一套设计语言，外壳与发布链路并不相同。

## 项目指南

### 交互与视觉（硬性规则）

- 整站版式是「**吸顶顶栏 + 主内容 + 文档流底栏**」：`SiteHeader`（Nuxt UI `UHeader`）+ `<main id="content">` + `SiteFooter`（`UFooter`）。不要再引入左右侧栏，也不要给 `main` 加固定高度或 `overflow-y: auto`。
- 移动端导航是**顶栏下方下拉面板**（`UHeader` 的 `#bottom` + `grid-rows-[0fr]↔[1fr]` + `inert`）。**禁止换成 `USlideover` / `UDrawer`**：那会带回滚动锁、遮罩与边缘手势，与当前版式冲突。也不要用 `UCollapsible`——reka 的 `Presence` 在关闭态不输出 DOM，SSR 与无 JS 时导航会整块消失。
- 断点只用 Tailwind / Nuxt UI 默认阶梯（`sm 640` / `md 768` / `lg 1024` / `xl 1280` / `2xl 1536`），移动端临界值 = `lg`。**禁止再自定义像素断点**。
- 视觉语言与 PidanUI 官网、冷域观者站同源：品牌黄 `#ffc53d` / `#ff9f1a`、ink 灰阶、描边 + hover 阴影分层、克制的圆角。**主题色板与圆角刻度是既有决定，不要「顺手优化」配色。**
- 页面区块一律用 Nuxt UI 的骨架表达（`UPageHero` / `UPageSection` / `UPageGrid` / `UPageCard` / `UPageHeader` / `UAlert`），能靠组件表达的外观不要再手写 CSS。首页的区块顺序与节奏是刻意的：Hero → 温馨提示 → 项目特性 → 组件展示 → 关于 → 加入开发。
- 新增动效必须遵循系统「减少动态效果」偏好，补 `@media (prefers-reduced-motion: reduce)` 分支；悬浮反馈以颜色、描边、阴影为主，**不要**新增大位移、旋转等夸张效果。
- **不要引入全屏加载动画**：首屏只保留 `PageProgress` 这条细进度条，任何「等 JS 初始化完再显示页面」的实现都会被回退。
- 卡片信息与密度由 `app.config.ts` 的 `ui.pageGrid` 统一接管（`auto-fill` + 调用点的 `--grid-min`）。**不要在调用点另写列数**（`sm:grid-cols-2` 之类），否则各页列宽会重新走偏。

### 禁止注入式增强（硬性规则）

- **禁止在 `public/` 下放 JS / CSS，再通过 `app.head` 的 `link` / `script` 注入它们来做功能增强。** 需要新交互就写 Vue 组件（`app/components/*.vue`）、composable（`app/composables/`）或客户端插件（`app/plugins/*.client.ts`）；需要新样式就写进 `app/assets/styles/` 或组件的 `<style scoped>`。`nuxt.config.ts` 的 `app.head` 只用于**站点元信息**、**第三方 CDN 资源**（字体）与**首帧标记脚本**（`document.documentElement.classList.add('js')`），不放本站自己写的业务逻辑。
- 为什么（同族项目的返工教训：PidanUI 官网 `a3045cc` 引入 `public/custom/{custom.css,custom.js}`，`b5b79b1` 全部拆回主站代码）：
  - **SPA 不接管**：注入的脚本只在首次加载扫一遍 DOM，站内跳转后新增的页面不会被处理（滚动显现、进度条、返回顶部全部失效），而本站是 Nuxt 客户端路由。
  - **绕开样式分层**：`public/` 里的 CSS 拿不到 Tailwind 的 `@layer`，只能靠 `!important` 和特异性堆叠去压既有规则，改一处坏一片。
  - **不受类型与风格检查覆盖**：`public/` 是原样拷贝，Prettier 与 `pnpm build` 都不会检查，等于在受管代码之外开了一个无人守的口子。
  - **重复实现**：站内已有 `useScrollReveal` / `PageProgress` / `BackToTop` 等能力，注入层再写一份必然与它们冲突。
- `public/` 只放**原样发给浏览器、不需要加工的资源**：图片、`robots.txt`、`_headers`。字体走构建期灌注（见「字体与图标」），也不在 `public/` 里手写 CSS。

### 一致性

- 页面主标题只有一处来源：`PageHeading.vue`（`UPageHeader :as="{ title: 'div' }"` + 内层 `h1`）。**不要直接写 `<UPageHeader :title>` 再套 `h1`**，会出现 h1 套 h1。列表页的外框节奏由 `app.config.ts` 的 `ui.pageHeader` 统一接管。
- 导航项与分区判定只有一处数据源：`app/data/nav.ts` + `app/composables/useNav.ts`（顶栏、移动面板、底栏共用）。外链项写 `external: true`，`↗` 由 `UNavigationMenu` 依据 `target="_blank"` 自动补——**不要再传 `trailingIcon`**，否则会出现两个箭头。
- 底栏固定三栏：品牌 + 站点导航 / 关注我们 / 友情链接，版权行在 `UFooter` 的 `#left`。社交图标用 `i-simple-icons-*`（Lucide 没有品牌图标），通用入口用 `i-lucide-*`。
- 首页的特性、加入开发用 `UPageGrid` + `UPageCard`（`subtle` + `spotlight` / `outline`）；文档概览用 `DocsGroupCards`（`UCard` + `variant="soft"`）。同一类内容不要在两处用两套卡片外观。
- 所有页面容器由 `app/layouts/default.vue` 的 `UContainer.page-shell` 提供。**页面里不要再套一层 `mx-auto max-w-page px-4`**（首页 `HomeView` 与 PidanUI 官网保持一致的那层 `max-w-page` 除外）。

## 项目概况

| 项       | 值                                                                                                                                                                         |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 定位     | OpenPidanUI（PidanUI 配套组件）官网，纯静态站点（SSG），部署于 Cloudflare Workers Static Assets                                                                            |
| 技术栈   | Nuxt `4.6.4` + Vue `3.5.45` + TypeScript（别名装 TS 6 API，见「代码风格与 CI」）+ Tailwind CSS `4.3.5` + Nuxt UI `4.12` + @nuxt/content `3.16.2`                           |
| 包管理器 | pnpm（`packageManager: pnpm@12.11.2`），Node 版本由 `.node-version` 固定（22.x），CI 用 `pnpm install --frozen-lockfile`                                                   |
| 发布流程 | 分支 / PR 触发 `.github/workflows/lint.yml`（`pnpm format:check` → `pnpm lint` → `pnpm build`）；部署由维护者执行 `pnpm deploy`（`wrangler deploy`），仓库里没有部署流水线 |
| 许可证   | AGPL v3，禁止商业用途                                                                                                                                                      |

## 常用命令

```bash
pnpm dev                       # 本地开发（默认 http://localhost:3000）
pnpm build                     # nuxi generate + 注入字体 + 产物校验，输出 .output/public
pnpm generate                  # 只生成静态产物
pnpm preview                   # wrangler dev：按 Cloudflare 的规则跑静态产物
pnpm deploy                    # 构建 + wrangler deploy
pnpm exec nuxt prepare         # 生成 .nuxt 类型（改 nuxt.config / app.config 后手动跑一次）
pnpm lint                      # ESLint：找「可能出错的地方」+ 分号硬约束
pnpm lint:fix                  # ESLint 自动修复（漏分号等）
pnpm format                    # Prettier 全量重排
pnpm format:check              # Prettier 检查（CI 用这个）
```

- **构建必须零错误零警告**：`nitro.prerender.failOnError: true`，任何路由渲染失败都会让构建失败。
- `pnpm build` 之后还有两步不要绕过：`scripts/sync-fonts.mjs` 把 HarmonyOS Sans SC 灌注进 `.output/public/fonts/`；`scripts/verify-output.mjs` 逐条校验 `build/routes.ts` 的路由都有产物（`failOnError` 抓不到「该枚举却没枚举」的漏页）。
- 项目没有单元测试，验收方式：`pnpm generate` 通过 + 浏览器实看页面（首次可 `pnpm exec nuxt dev`，或 `pnpm preview` 预览产物）。
- 构建期不再发任何网络请求：GitHub Releases 由浏览器在 `/download` 挂载后异步拉取，构建日志里不应出现 `[releases]` 相关警告；预渲染出来的下载页本来就是 `downloads.json` 的内容。
- 若构建报 `Another Nuxt build is already running`，说明有残留的 node 进程占着锁：先结束该 PID，再删 `node_modules/.cache/nuxt/*.lock`。

## 代码风格与 CI

- 排版由 **Prettier** 接管：`semi: true`、`singleQuote: true`、`printWidth: 100`、`tabWidth: 2`、`trailingComma: all`、`endOfLine: auto`（Windows 工作区是 CRLF、CI 检出 LF，写死 `lf` 会让本机 `format:check` 全红）。
- **硬约束：语句结束必须写分号。** 两处一起兜：Prettier 的 `"semi": true` 负责排版时补上，ESLint 的 `@stylistic/semi: ['error', 'always']` 负责当场报红。手写或粘贴的 TS 少了分号，`pnpm lint` 直接失败——CI 的 lint 步骤不过，构建与部署都不会继续。**不要**把任何一方改成 `false` / `'never'`。
  - 原因是 **ASI（Automatic Semicolon Insertion，自动分号插入）不是「随便补」**：它只在换行处、且遇到语法错误时才插入分号，遇到能继续解析的写法会继续拼接。这类「看起来换行了、实际被当成同一句」的代码能通过语法检查，却完全改变了语义，属于灾难性解析错误：
    - 行首 `(` / `[` / 模板字符串会成为上一行的继续调用或索引：
      `const a = b` 换行 `[1, 2].forEach(...)` 被解析成 `b[1, 2].forEach(...)`；
      `const x = y` 换行 `(function () {})()` 被解析成 `y(function () {})()`。
    - `return` / `break` / `continue` 后紧接换行会被当成语句结束：`return` 换行 `value` 实际 `return undefined`。
    - `let a = 1` 换行 `-1` 之类会被当成二元运算，变量初始化值直接算错。
  - 这些错误在源码里不报错、在压缩 / 转译 / 预渲染之后更难定位；统一写分号是唯一可靠的防线，所以把它升级成 lint 错误而不是可选的风格偏好。
- 分工固定：**Prettier 管排版（缩进、引号、换行、分号），ESLint 只管可能出错的地方**（未定义变量、无效的 Vue 用法、可疑的 TS 写法）。职责重叠的规则由 `eslint-config-prettier` 关掉，所以不要把格式化规则加回 ESLint，否则两个工具会互相改来改去。
- 配置文件：`.prettierrc.json` + `.prettierignore` + `eslint.config.mjs`（flat config）。`content/` 与 `public/` 不进 Prettier：文档正文的 MDC 组件与中文长句经不起换行重排，字体目录是构建期生成的。ESLint 的 `ignores` 与之一致，并额外忽略 `.wrangler/`。
- 本仓库**没有安装 `@nuxt/eslint`**：它会连带引入一整套 `@stylistic` 排版规则，与 Prettier 冲突。ESLint 只提供 Nuxt 目录约定需要的少量规则（关闭 `vue/multi-word-component-names`、`vue/require-default-prop`，`no-undef` 在 `.vue` 里关掉以免与自动导入误报）。
- `.prettierignore` 排除了 `content/`、`public/`、依赖与构建产物：文档正文的 MDC 组件与中文长句经不起换行重排，字体目录是构建期生成的。
- CI：`.github/workflows/lint.yml`（`name: Lint & Format`，job `quality`）在 `push`（排除 `main`）、`pull_request`、`workflow_dispatch` 上依次跑 `pnpm format:check` → `pnpm lint` → `pnpm build`——**构建本身就是产物校验**，漏页会在这里被抓到。顺序是刻意的：先定位排版问题，再看 lint，最后才是构建。
- **TypeScript 是别名安装的**：`"typescript": "npm:@typescript/typescript6@^6.0.2"`。项目构建走 `nuxi generate`、不跑 `tsc`，类型检查依赖编辑器的语言服务与 `nuxt prepare` 生成的 `.nuxt` 类型。
- 注释风格与现有文件一致：中文、`// ====` 分节横幅，只解释「为什么」，不复述代码。

## 目录结构

```
app/
├─ app.vue                     # <UApp><NuxtLayout><NuxtPage /></NuxtLayout></UApp> + titleTemplate
├─ error.vue                   # 404 / 错误页（保留站点外壳）
├─ app.config.ts               # Nuxt UI 主题：colors / pageHeader / pageGrid / prose / icon.mode
├─ layouts/default.vue         # 外壳：PageProgress + 顶栏 + UContainer.page-shell + 底栏 + BackToTop
├─ pages/
│  ├─ index.vue                # 首页（SEO + HomeView）
│  ├─ download.vue             # 下载页
│  └─ docs/                    # index.vue / [...slug].vue / category/[category].vue
├─ components/
│  ├─ home/                    # HomeView / FeatureGrid / ShowcaseCarousel / JoinDevSection
│  ├─ download/                # ReleaseCard / AssetRow
│  ├─ docs/                    # DocsGroupCards
│  └─ *.vue                    # SiteHeader / SiteFooter / DocsShell / PageHeading / PageProgress / BackToTop / ThemeToggle / NotFoundView
├─ composables/                # useDocsGroups / useReleases / useNav / useScrollReveal / usePageProgress
├─ data/                       # nav / home / showcase / docsCategories / socialLinks
├─ utils/base.ts               # withBase 垫片（自动导入）
└─ assets/styles/              # main.css（入口）/ tokens.css / base.css / animation.css
content/docs/                  # 文档正文（唯一内容源）
public/                        # images/、robots.txt、_headers（只放资源，不放注入式 JS/CSS）
build/routes.ts                # 预渲染路由全集（含文档与分类枚举）
shared/                        # site.ts / releases.ts / data/downloads.json（离线兜底）
scripts/                       # sync-fonts.mjs（字体灌注）/ verify-output.mjs（产物校验）
```

不要提交 `.nuxt/`、`.output/`、`.data/`、`.wrangler/`、`build*.log` 等产物与日志（已在 `.ignore` / `.gitignore` 覆盖）。

## 路由与页面机制

- **路由 = 文件**，页面文件只做「SEO + 渲染视图」：`pages/index.vue` → `HomeView`，`pages/download.vue` → 下载页，`pages/docs/**` → 文档三件套。
- 站内链接一律 `<NuxtLink :to>` + `withBase()`（自动导入）；**严禁裸 `<a href>` 指向站内路由**——Nuxt 不拦截裸链接，会退化成整页刷新，页面过渡与进度条全部失效。
- **预渲染路由必须显式登记**：`nitro.prerender.crawlLinks: false`，路由全集由 `build/routes.ts` 的 `buildRoutes()` 生成，并通过 `nuxt.config.ts` 的 `hooks['prerender:routes']` 注入。**新增任何页面都要改这里**，否则产物里根本没有这一页。
- 文档路由由 `build/routes.ts` 遍历 `content/docs/` 得到：`1.user/2.install.md` → `/docs/user/install`（数字前缀只决定顺序，`stripOrder()` 会去掉）；分类页 `/docs/category/<分类名>` 从 frontmatter 的 `category` 收集，中文分类必须 `encodeURIComponent`。
- `nitro.prerender.autoSubfolderIndex: false`：`/docs/user/install-rainmeter` 落成 `install-rainmeter.html`，URL 不带尾斜杠。
- 页面标题 / 描述用 `useSeoMeta`；全站标题模板在 `app/app.vue`（`title · OpenPidanUI`）。

## 外壳与滚动

- **滚动权在浏览器**：`body` 自然滚动（`min-height: 100dvh`，`overflow-x: clip`），**没有自定义滚动容器**。所有滚动监听 / `IntersectionObserver` / `scrollTo` 一律面向 `window`。
- 路由滚动交给 Nuxt 默认 `scrollBehavior`（回顶、前进后退位置、hash 偏移都由框架处理）。**不要新建 `router.options.ts`**。
- 需要让开吸顶顶栏的地方统一用 `--shell-header-h`（= `--ui-header-height`）：`html { scroll-padding-top }`、标题 `scroll-margin-top`、代码块信息栏。**不要写死 64px / 4rem 这类字面值。**
- 页面容器的类名是 `.page-shell`（`UContainer`）。滚动入场的选择器是 `#content .page-shell > * > *`，因此**每个页面必须保持单一根节点**，否则该页丢失去重入场编排。
- 顶部加载进度条 `PageProgress` + `usePageProgress` 挂在 layout：`page:loading:start` 开始、`page:loading:end` 推进、`page:finish` 等字体与首屏图片后收尾。**不要改成定时器模拟的假进度。**
- 页面切换过渡由 `nuxt.config.ts` 的 `app.pageTransition`（`name: 'page'`）+ `animation.css` 提供；out-in 期间不要在钩子里量尺寸，layout 的 `page:transition:finish` 里有补刷。

## 内容与数据

- 文档 frontmatter（`content.config.ts` 里用 zod 声明，**新增字段先改 schema**）：
  - `title`、`description`（摘要，卡片与 SEO 共用）
  - `category`（自由命名、同名成组，不需要预先登记）、`order`（组内序号）、`categoryOrder`（分类权重，默认 999）
  - `badge`（可选角标）、`draft`（`true` 时既不进导航也不进预渲染）
- 分类的图标 / 描述 / 强制权重在 `app/data/docsCategories.ts` 的 `DOC_CATEGORY_PRESENTATION`；没配的分类走 `DEFAULT_CATEGORY_ICON` 与通用描述。
- `useDocsGroups()` 是 **async**：调用方必须 `await`（`const { groups } = await useDocsGroups()`），否则 setup 阶段拿到的是空数组。侧边栏排序用返回的 `navRank`（分类权重 × 1000 + 组内序号）。
- 版本数据链路：`app/composables/useReleases.ts` 在**客户端运行时**（`onMounted`）异步拉 `PidanUI-Team/OpenPidanUI` 的 GitHub Releases，用 `normalizeReleases()` 归一化成 `SiteRelease[]`。首屏（含预渲染静态 HTML）先渲染 `shared/data/downloads.json` 兜底数据，拉到实时结果后整体替换；**只有请求失败才回退 `downloads.json`**，此时 `source: 'snapshot'` 且页面显示「离线快照」提示。发版后无需重新构建本站。
  - `nitro.preset: 'static'` 是纯静态产物（Cloudflare assets-only，无服务端运行时），所以取数只能在客户端；**预渲染阶段不得发网络请求**，`build/routes.ts` 里也没有 `/api/releases.json`。
  - 浏览器侧保持「不带任何自定义头的简单 GET」：GitHub API 返回 `Access-Control-Allow-Origin: *`，但 `User-Agent` 是 forbidden header，`GITHUB_TOKEN` 绝不能进客户端产物，自定义头会触发 CORS 预检。
  - 未认证限流 60 次/小时/IP：成功结果按 GitHub 响应 `max-age=60` 在 `sessionStorage` 缓存 60 秒，同一页多个组件实例共用一次请求；失败不进缓存。禁用 JS 时页面停留在兜底数据，仍有完整内容。
- 站点常量（品牌名、仓库地址、许可证、`PROMO_IMAGE`）只在 `shared/site.ts`；导航在 `app/data/nav.ts`；底栏渠道在 `app/data/socialLinks.ts`；首页文案在 `app/data/{home,showcase}.ts`。**改内容只改数据文件，不动版式。**

## 样式与 Nuxt UI 约定

- 全局样式 4 个文件，`main.css` 是唯一入口，`@import` 顺序（硬性）：
  `tailwindcss/theme.css` → **`tailwindcss/preflight.css`** → `tailwindcss/utilities.css` → `@import "@nuxt/ui"`（必须在 `tokens.css` 之前，它自带只认 `.dark` 的 `@custom-variant dark`，要被我们的三路版本覆盖）→ `tokens.css` → `base.css` → `animation.css`。
- **Preflight 已启用**：元素级默认值（`margin` / `padding` / `box-sizing` / 表单控件 / 列表符号 / 标题字号）都由它提供。**不要在 `base.css` 里重复声明这些**——两处抢同一批属性，改一处忘一处。`base.css` 只保留：主题变量真源、`--ui-*` 映射、滚动条、过渡基线、`svg` 垂直对齐、`h1-h6` 字重补齐、`::selection`、`[data-slot='overlay']`。
- 全局 reset **必须待在 `@layer base` 里**：未分层规则会压过所有 utilities，导致 Nuxt UI 组件的 `py-*` / `mt-auto` 全部失效。
- `tokens.css` 用 `@theme static` 定义令牌。**断点不要覆盖**；`--radius-*: initial` 与 `--color-*: initial` 会连带清掉 Nuxt UI 依赖的键，新增色 / 圆角时必须补齐：
  - `--color-*: initial` 连 `--color-primary` / `--color-error` 一起清掉 → 已手动补回；
  - `--radius-*: initial` 连 `xs/sm/md/lg/xl/2xl/3xl` 一起清掉 → 已补齐，否则 `rounded-md` 整条规则消失。
- 品牌色板：`--color-brand-50…950`（500 = `#ffc53d`、600 = `#ff9f1a`、800 = `#a85a00`），灰阶 `--color-ink-50…950`（**不能叫 neutral**，Nuxt UI 对保留名会回退到它自己的 oklch 灰），错误色 `--color-danger-50…950`。`app.config.ts` 里 `ui.colors = { primary: 'brand', neutral: 'ink', error: 'danger' }`。
- `--ui-primary` 指向 `--brand-deep`（`#ff9f1a`）而不是 `#ffc53d`：同一个变量既做实心按钮底色又做 `text-primary` 文字色，浅黄做文字在白底上几乎不可读。
- **没有 `warning` / `success` / `info` 语义色**（调色板被清空后未补）。需要提示时用 `color="primary"` 或 `color="neutral"` + `variant="soft"/"subtle"`，**不要写 `color="warning"`**——那会静默无色。
- 换成 `U*` 组件的元素，**必须同时删掉旧语义类声明**（未分层规则恒高于工具类，不删会出现「改 class 没反应」）。
- 文档正文排版**不引 `@tailwindcss/typography`**：Markdown 由 `<ContentRenderer>` + Nuxt UI 的 Prose 渲染，覆盖项统一写在 `app.config.ts` 的 `ui.prose`。
- `body { overflow-x: clip }` 而不是 `hidden`：`hidden` 会让 body 成为滚动容器，**sticky 顶栏会直接失效**。

## 主题（深浅色）

- 主题由 **Nuxt UI 的 colorMode** 接管（`nuxt.config.ts` 的 `colorMode`：`preference: 'system'`、`fallback: 'light'`、`storageKey: 'openpidanui-theme'`）。框架在 `<html>` 上写 `.dark` / `.light`，并在首帧前注入脚本，**不要自己再加第二套 `data-theme` 主题脚本**。
- CSS 里深色只写 `.dark` 一条即可；`base.css` 与 `tokens.css` 仍保留 `[data-theme='dark']` 选择器做兼容，不要删。
- 切换控件是 `ThemeToggle.vue` 的 `USwitch` 胶囊开关，三态循环「跟随系统 → 浅色 → 深色」；滑块位置 = 当前实际是否深色。**不要换成 UButton 图标按钮**（与 PidanUI 官网不一致）。
- 服务端没有 `localStorage` 与 `prefers-color-scheme`：`ThemeToggle` 用 `mounted` 标记保证首屏渲染与客户端一致，避免 hydration 警告。

## 字体与图标

- 字体**自包含**，仓库不保留字体文件：
  - HarmonyOS Sans SC 由 `scripts/sync-fonts.mjs` 在 `nuxi generate` 之后复制进 `.output/public/fonts/`，并生成 `/fonts/harmonyos.css`（`nuxt.config.ts` 的 `app.head` 引入它）；开发态没有那次构建，`nitro.publicAssets` 会把 npm 包的 `dist` 挂到 `/fonts`，`app.head` 改引 `Regular/Medium/Bold.css`；
  - Cascadia Code 由 `@fontsource/cascadia-code` 走 Vite 打包。
- 字体栈唯一定义在 `base.css` 的 `--font-ui` / `--font-code`。**改字体要同时改脚本与字体栈，不要只改一处。**
- 图标统一用 `<UIcon name="i-lucide-xxx" />`（品牌图标 `i-simple-icons-xxx`）。图标集只装了 `@iconify-json/lucide` 与 `@iconify-json/simple-icons`，**其他集合写了就是空白**。
- **新增动态图标必须同步 `nuxt.config.ts` 的 `icon.clientBundle.icons`**（写 `lucide:xxx` / `simple-icons:xxx`）：静态字面量由 `scan` 收录，`:name` 动态绑定（导航项、特性列表、社交链接、主题图标）不登记就会退化成运行时取图。
- `app.config.ts` 的 `icon.mode: 'svg'` 保证输出内联 `<svg>`，别改成 `css`（否则首屏只有空占位）。
- 网站 Logo 是图片资源（`public/images/logo.webp`），不属于图标体系，保持现状。

## 无障碍与降级

- 图标一律 `aria-hidden="true"` 并提供文字或 `aria-label`；可切换按钮补 `aria-expanded` / `aria-controls`（汉堡按钮、轮播即为范例）。
- 主内容使用 `<main id="content" role="main">`；`<html class="js">` 仅在 JS 可用时由 head 内联脚本添加，滚动入场的 `html.js` 规则依赖它——**无 JS 时内容必须原样可读**。
- 轮播 `ShowcaseCarousel` 是完整的有无障碍实现：`role="region"` + `aria-roledescription`、`tablist` 指示点、方向键 / Home / End、指针滑动、`aria-live` 播报。**改交互时不要丢掉这些**。
- 依赖 JS 的入口（移动端汉堡、轮播按钮、返回顶部）在无 JS 时不应把页面卡成不可用；装饰性内容不要放进 Tab 序列。

## 动效契约

- 页面过渡：`nuxt.config.ts` 的 `app.pageTransition` + `animation.css` 的 `.page-enter-*` / `.page-leave-*`。
- 滚动入场：`useScrollReveal` 给区块打 `data-reveal="hidden|shown"`，`animation.css` 只对 `html.js [data-reveal='shown']` 播放 `reveal-up`（`backwards` 填充，动画结束不保留 `transform`）。
- 同屏错峰靠 `--reveal-delay`；`prefers-reduced-motion: reduce` 时**一个标记都不打**，元素保持可见。
- 导航进度条、返回顶部、轮播的自动播放都以 `prefers-reduced-motion` 为准，不做「强制播放」。

## 配置与类型（易踩坑）

- `tsconfig.json` 只是 `extends ./.nuxt/tsconfig.json`；别名规则：`@` / `~` → `app/`，`~~` → 仓库根，`#shared` → `shared/`，`#server` → `server/`。
- 改了 `nuxt.config.ts` / `app.config.ts` 里影响类型或 `#build/ui.*` 的配置后，跑一次 `pnpm exec nuxt prepare`，否则编辑器会报找不到自动导入 / 主题类是旧的。
- `@nuxt/content` 用 Node 内置的 `node:sqlite`（`experimental.sqliteConnector: 'native'`），**不需要 `better-sqlite3`**，也没有 `allowBuilds` 那一步；Node 22 会打一条 `ExperimentalWarning`，属正常。
- 站点没有服务端路由：`nitro.preset: 'static'` 下 `server/` 里的东西要么在构建期被预渲染成静态文件，要么线上不存在。运行时取数一律放客户端组合式函数（`onMounted` / `import.meta.client`），不要依赖 `useFetch('/api/...')`。
- `nitro.preset` 被显式锁死为 `static`：Cloudflare 上的环境变量会把预设切到 `cloudflare-*`，那套产物带 Worker 入口，`wrangler deploy` 会找不到 assets 目录。
- `nuxt.config.ts` 的 `icon.clientBundle.icons` 与 `app/data/*` 里的图标是手工同步关系，改了数据记得回来看一眼。

## Git 与协作

- **不要直接向主仓库的 `main` 推送**：一律「分支 + PR」，`main` 只接受合并。分支命名 `feat/<简述>` / `fix/<简述>` / `docs/<简述>`。
- **每个提交都要能独立 `pnpm build` 通过**。视觉改动按「可回滚单元」拆（先换组件、再调样式、最后补文档），便于二分定位与单独 revert。
- 提交信息用中文，`feat:` / `fix:` / `style:` / `refactor:` / `chore:` / `docs:` 前缀；正文说清「为什么这么做、影响面是什么」，不要复述 diff。**提交信息里不要用反引号包代码片段**——在部分 shell 下会被当命令执行。
- **不要顺手把无关文件的格式化改动混进来**：工作区里常有历史 Prettier 差异，提交前用 `git add <具体文件>`，不要 `git add -A`。
- 依赖变更必须同时提交 `pnpm-lock.yaml`（CI 用 `--frozen-lockfile`）。
- 不要提交产物与临时文件（`.nuxt/`、`.output/`、`.data/`、`.wrangler/`、`build*.log`、`debug.log`）；不要为了本地调试临时改 `failOnError`、`nitro.preset` 这类配置后忘记还原。
- 不要对已推送的公共分支 `rebase` / `force-push`；同步上游用 merge。
- 视觉改动请附截图：浅色 + 深色、桌面 + ≤1024px 各一组。
- **不要动**（属站点身份与发布链路，需先讨论）：`nuxt.config.ts` 的 `nitro` / `icon` / `colorMode`；`shared/site.ts` 的 `SITE` 常量；`public/images/` 下的品牌素材；`base.css` 的字体栈与 `tokens.css` 的品牌色板；`.github/workflows/lint.yml` 的检查顺序。

## 提交前自检清单

1. `pnpm generate`（或 `pnpm build`）通过且零错误；构建日志没有异常，也不应有 `[releases]` 网络警告（构建期已不请求 GitHub）。
2. `.output/public` 里能按预期找到 `/index.html`、`/download.html`、`/docs.html`、文档页与中文分类页；中文文件名未被百分号编码成错误路径。
3. 浏览器实看：首页（Hero / 温馨提示 / 项目特性 / 组件展示 / 关于 / 加入开发）、`/download`（首屏先出兜底卡片，挂载后异步换成 GitHub 实时版本；断网时保持兜底并显示「离线快照」）、`/docs`、一个文档页、`/docs/category/<分类>`。
4. 宽度 1440 / 1024 / 1023 / 768 / 375 各过一遍：顶栏吸顶不抖、底栏在文末、无横向滚动、汉堡下拉面板开合与 `Escape` 收起、`aria-expanded` 正确。
5. 站内跳转不整页刷新（Network 里不应出现 document 请求）；顶部进度条能正常收尾；从页面中部跳转后新页在顶部。
6. 深浅色两种模式都看一遍：首帧不闪白、卡片描边与文字对比度正常、轮播/进度条/返回顶部不受主题影响而失色。
7. 「新闻」导航只有一个 ↗；底栏社交图标不是空白（`simple-icons` 用法正确）。
8. 新增图标已登记进 `icon.clientBundle.icons`，新增颜色 / 圆角来自变量，新增动效有 reduced-motion 分支。
9. `pnpm lint` 与 `pnpm exec prettier --check <改动文件>` 都通过；没有把无关的格式化差异混进提交。
10. 没有提交构建产物、缓存、日志或临时文件。
