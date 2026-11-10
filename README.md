<div align="center">

# OpenPidanUI-Website

![Last Commit](https://img.shields.io/github/last-commit/PidanEggyTeam/OpenPidanUI-Website?label=Last%20Commit)
[![Nuxt](https://img.shields.io/badge/Nuxt-4.6.4-00DC82?logo=Nuxt&logoColor=white)](https://nuxt.com/)
[![Nuxt UI](https://img.shields.io/badge/Nuxt%20UI-4.12-00DC82?logo=Nuxt&logoColor=white)](https://ui.nuxt.com/)
[![Vue](https://img.shields.io/badge/Vue-3.5.45-4FC08D?logo=Vue.js&logoColor=white)](https://cn.vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0.2-3178C6?logo=TypeScript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.3.5-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
![License](https://img.shields.io/badge/License-AGPL--3.0-orange)
[![GitHub](https://img.shields.io/badge/GitHub-PidanUI--Team-blue?logo=github&logoColor=F5F5F5)](https://github.com/PidanUI-Team)

[OpenPidanUI](https://github.com/PidanUI-Team/OpenPidanUI) 的官方网站，使用 Nuxt 4 + @nuxt/content + Nuxt UI 4 + TypeScript + Tailwind CSS 构建，通过 `nuxi generate` 静态生成（SSG）后部署到 Cloudflare Workers 静态资源。版式与设计语言与 PidanUI 官网保持一致，组件全部模块化、可审查，不替换任何系统文件。

开发约定（目录结构、样式分层、内容与数据文件的维护方式）见 [.github/copilot-instructions.md](.github/copilot-instructions.md)。

</div>

## 网站结构

版式是「顶栏 → 内容 → 底栏」三段式，全站只有 window 一条滚动条：顶栏吸顶常驻，导航在 1024px 以下收进顶栏下方下拉面板；底栏承担站点导航、社交渠道与友情链接。

- **首页**：`/`，左文右图的 Hero（项目名 / 简介 / 下载与文档按钮 + 宣传图）→ 温馨提示 → 项目特性 → 组件展示（可左右切换的截图轮播）→ 关于 OpenPidanUI（名称沿革时间线）→ 加入开发。
- **下载**：`/download`，页面头部是标题与说明，下方每个版本一张卡片（版本信息 + 资产清单）。版本数据在页面加载时由浏览器异步实时拉取 GitHub Releases，拉取完成前与请求失败时展示仓库内的 `downloads.json` 兜底数据；发版后无需重新构建本站。
- **文档**：`/docs`，左侧文章条目侧边栏、右侧正文的技术文档风格；分类页 `/docs/category/<分类名>` 与文章页 `/docs/<分类>/<文章>`。Markdown 排版走 Nuxt UI 的 Prose 组件。
- **新闻**：顶栏外链到 `<https://pidanui.eggycore.top/posts/>`，本站不实现该页面（导航项带 ↗ 图标）。
- **404**：`/404.html`，预渲染产物里的兜底页。

## 技术栈

- [Nuxt 4](https://nuxt.com/)（Nitro 预渲染 + SSG，`nitro.prerender.failOnError: true`）
- [@nuxt/content v3](https://content.nuxt.com/)（文档内容库，MDC + Shiki 双主题）
- [Nuxt UI 4](https://ui.nuxt.com/)（组件层：`UHeader` / `UFooter` / `UPageHero` / `UPageSection` / `UPageCard` / `UPageHeader` / `UContentNavigation` / `UContentToc` / `USwitch` 等，主题色映射到站点品牌黄）
- [TypeScript](https://www.typescriptlang.org/)（`typescript.strict: true`）
- [Tailwind CSS v4](https://tailwindcss.com/)（`@theme` 设计令牌 + 工具类，**启用 Preflight**）
- [@nuxt/icon](https://nuxt.com/modules/icon)（随 Nuxt UI 内置，Lucide + Simple Icons，构建期内联为 SVG）

## 构建步骤

1. [下载并安装 Node.js](https://nodejs.org/zh-cn)（建议 22 LTS）
2. 安装 `pnpm`：`npm install -g pnpm`（`pnpm --version` 可验证）
3. 在项目文件夹下执行 `pnpm install`
4. `pnpm dev` 启动开发服务器（默认 `http://localhost:3000`）
5. `pnpm build` 生成静态产物，输出在 **`.output/public`**

```bash
pnpm build       # nuxi generate + 注入字体 + 产物校验
pnpm preview     # wrangler dev，按 Cloudflare 的规则跑静态产物
pnpm deploy      # 构建 + wrangler deploy
pnpm lint        # ESLint：可能出错的地方 + 分号硬约束
pnpm format:check
```

`pnpm build` 里那两步不要省：

- `scripts/sync-fonts.mjs`：把 HarmonyOS Sans SC 的分包字体复制进 `.output/public/fonts/`；
- `scripts/verify-output.mjs`：逐条校验 `build/routes.ts` 的路由都有产物（`failOnError` 抓不到漏页）。

> [!TIP]
> 如果 `npm install` 安装较慢，可先执行 `npm config set registry https://registry.npmmirror.com` 切换至镜像源。

## 字体与图标

字体为 HarmonyOS Sans SC（400 / 500 / 700 三个字重，按 unicode-range 分片）和 Cascadia Code 分包字体，**仓库不保留字体文件**：构建后由 `scripts/sync-fonts.mjs` 把字体灌注进产物，Cascadia Code 走 `@fontsource` 由 Vite 处理。开发态由 `nitro.publicAssets` 直接挂 npm 包的字体目录，保证 `pnpm dev` 下也不再出现字体 404。回退链定义见 `app/assets/styles/base.css` 的 `--font-ui` / `--font-code`。

图标使用随 Nuxt UI 内置的 `@nuxt/icon`（Lucide + Simple Icons），图标集以 `@iconify-json/*` 本地安装，**构建期直接内联为 SVG**（`app.config.ts` 里 `icon.mode: 'svg'`），运行时不请求 Iconify API。动态 `:name` 绑定的图标必须在 `nuxt.config.ts` 的 `icon.clientBundle.icons` 里登记。

## 关于 OpenPidanUI

OpenPidanUI 是 PidanUI 的辅助组件开源代码库，存放系统镜像、独立美化包所需的配套组件源代码（Rainmeter 小组件、设置程序、部署脚本等）。

它不负责替换系统文件，也不做持久化的系统改动——美化交给主题包与 Rainmeter，出问题切回默认主题就能恢复。组件按模块独立发布、独立更新，与主项目同步迭代。

## 部署方式

本网站部署于 **Cloudflare Workers Static Assets**（assets-only，没有 Worker 脚本），通过静态托管的方式对外提供服务。`wrangler.jsonc` 里固定了资产目录与 SPA 以外的路由行为，执行 `pnpm deploy` 即完成「构建 → 上传 → 部署」。站点没有后端，所有内容以静态资源形式存在，更新时需重新构建并推送。

## 许可证

本项目采用 **AGPL v3** 许可证，详见 [LICENSE](LICENSE)。

**禁止商业用途。** 任何个人或组织不得将本项目及其衍生作品用于商业目的。使用、修改、分发本项目时，请遵守 AGPL v3 的相关条款。

## 版权声明

- 本项目为《蛋仔派对》粉丝二次创作，非官方出品，禁止用于商业用途。
- 所有视觉素材均来自合规渠道或团队重绘，未使用游戏拆包/解包资源。
- 《蛋仔派对》是网易游戏的注册商标，Windows 是微软公司的注册商标。
- 本项目与网易、微软无任何隶属或赞助关系。

规划文档见 [docs/WEBSITE-PLAN.md](docs/WEBSITE-PLAN.md)。
