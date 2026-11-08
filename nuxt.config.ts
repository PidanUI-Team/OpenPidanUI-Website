import { createRequire } from 'node:module';
import { dirname } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import { buildRoutes } from './build/routes';
import { rehypeExternalLinksBlank } from './build/rehype-external-links';

// ---- 字体（自包含）----
// 生产：`nuxi generate` 之后由 scripts/sync-fonts.mjs 生成 /fonts/harmonyos.css；
// 开发：还没有那次构建，直接把 npm 包里的三档样式（含同目录 woff2 分片）挂到
//       Nitro 的 /fonts 下，否则 dev 下样式表 404，正文会掉到系统字体。
const require = createRequire(import.meta.url);
const isDev = process.env.NODE_ENV === 'development';
let harmonyFontsDir = '';
try {
  harmonyFontsDir = dirname(require.resolve('harmonyos-sans-sc-webfont-splitted'));
} catch {
  // 包没装时不挂载：构建会由 sync-fonts.mjs 直接报错，比这里静默失败更明确
}

const FONT_LINKS = isDev
  ? [
      { rel: 'stylesheet', href: '/fonts/Regular.css' },
      { rel: 'stylesheet', href: '/fonts/Medium.css' },
      { rel: 'stylesheet', href: '/fonts/Bold.css' },
    ]
  : [{ rel: 'stylesheet', href: '/fonts/harmonyos.css' }];

export default defineNuxtConfig({
  compatibilityDate: '2026-11-01',

  modules: ['@nuxt/ui', '@nuxt/content'],

  // 组件按文件名注册（不带目录前缀），home/ 与 docs/ 下的组件也能直接写 <HomeSection>
  components: [{ path: '~/components', pathPrefix: false }],

  css: ['~/assets/styles/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  // 字体全部自包含：HarmonyOS Sans SC 由 scripts/sync-fonts.mjs 在 generate 之后灌注，
  // Cascadia Code 由 @fontsource 走 Vite。关掉 @nuxt/fonts，避免它接管字体加载并外部请求。
  ui: {
    fonts: false,
  },

  colorMode: {
    preference: 'system',
    fallback: 'light',
    storageKey: 'openpidanui-theme',
  },

  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      meta: [
        {
          name: 'keywords',
          content:
            'OpenPidanUI, PidanUI, Pidan UI, 皮蛋UI, EggyUI, Eggy UI, OpenEggyUI, 蛋仔UI, 蛋仔美化, 蛋仔风格美化, 蛋仔风格主题, 蛋仔风格壁纸, 蛋仔风格Windows, 主题包下载, 蛋仔派对二创, Rainmeter蛋仔组件, Windows桌面美化, 开源UI组件',
        },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/images/favicon.ico' },
        // 界面字体：生产引用 sync-fonts.mjs 生成的本地样式表，开发直接挂 npm 包目录
        ...FONT_LINKS,
      ],
      script: [
        // 首帧同步脚本：DOM 解析时立即给 <html> 加 .js。
        // 禁用 JS 时此脚本不执行，动画标记一个都不会打，内容照常可读。
        {
          innerHTML: 'document.documentElement.classList.add("js");',
          tagPriority: 'critical',
        },
      ],
    },
    // 保住 .page-enter-from / .page-leave-to 等类名（见 animation.css）
    pageTransition: { name: 'page', mode: 'out-in', appear: true },
  },

  content: {
    // 用 Node 内置的 node:sqlite，免掉 better-sqlite3 的原生编译（Windows 上少一个坑）。
    // Node 22 会打一条 ExperimentalWarning，不影响构建。
    experimental: { sqliteConnector: 'native' },
    build: {
      markdown: {
        toc: { depth: 3, searchDepth: 3 },
        highlight: {
          theme: {
            default: 'github-light',
            dark: 'github-dark',
          },
          langs: [
            'bash',
            'bat',
            'powershell',
            'json',
            'jsonc',
            'ts',
            'js',
            'vue',
            'csharp',
            'xml',
            'ini',
            'md',
            'yaml',
            'css',
            'diff',
          ],
        },
        // 站外链接一律新开标签页，站内相对路径/锚点保持原样（与 PidanUI 官网同款规则）
        rehypePlugins: {
          'rehype-external-links-blank': { instance: rehypeExternalLinksBlank },
        },
      },
    },
  },

  icon: {
    // svg 模式：图标在服务端内联成 <svg>，静态站首屏不出现空白方框
    mode: 'svg',
    serverBundle: {
      collections: ['lucide', 'simple-icons'],
    },
    clientBundle: {
      // 动态 :name 绑定的图标扫描不到，必须在这里登记，否则静态站运行时会去 Iconify API 取图。
      // 注意格式是 `集合:图标名`（@nuxt/icon v2 不接受 `i-` 前缀）。
      icons: [
        'lucide:house',
        'lucide:download',
        'lucide:book-open',
        'lucide:newspaper',
        'lucide:arrow-up-right',
        'lucide:chevron-left',
        'lucide:chevron-right',
        'lucide:chevron-up',
        'lucide:list',
        'lucide:code-xml',
        'lucide:sun',
        'lucide:sun-moon',
        'lucide:moon',
        'lucide:menu',
        'lucide:x',
        'lucide:folder-git-2',
        'lucide:package',
        'lucide:sparkles',
        'lucide:shield-check',
        'lucide:layers',
        'lucide:palette',
        'lucide:terminal',
        'lucide:wrench',
        'lucide:file-text',
        'lucide:clock',
        'lucide:circle-alert',
        'lucide:arrow-left',
        'lucide:users',
        'lucide:arrow-right',
        'lucide:external-link',
        'lucide:tag',
        'lucide:hard-drive-download',
        'lucide:arrow-up',
        'simple-icons:bilibili',
        'simple-icons:github',
        'simple-icons:gitcode',
        'simple-icons:tencentqq',
      ],
    },
  },

  nitro: {
    // 显式锁死 static：Cloudflare 上的环境变量会把预设切到 cloudflare-*，
    // 那套产物带 Worker 入口，wrangler deploy 会找不到 assets 目录。
    preset: 'static',
    // 开发期直接挂 npm 包里的 HarmonyOS Sans SC 分片（生产产物由
    // scripts/sync-fonts.mjs 灌注，不需要这条挂载）。
    publicAssets:
      isDev && harmonyFontsDir
        ? [{ dir: harmonyFontsDir, baseURL: '/fonts', maxAge: 0 }]
        : undefined,
    prerender: {
      crawlLinks: false,
      failOnError: true,
      autoSubfolderIndex: false,
    },
  },

  hooks: {
    'prerender:routes'(ctx) {
      for (const route of buildRoutes()) {
        ctx.routes.add(route);
      }
    },
  },

  experimental: {
    payloadExtraction: 'client',
  },

  typescript: {
    strict: true,
  },
});
