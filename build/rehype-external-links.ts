// ============================================================
// rehype 插件：正文里的站外链接一律新开标签页
// ------------------------------------------------------------
// 为什么放在构建期而不是客户端：Markdown 渲染出的 <a> 是静态 HTML，
// 在这里补 target / rel 无需 JS 也能生效，禁用 JS 时同样是新标签页打开。
//
// 节点形状（@nuxt/content v3 + @nuxtjs/mdc）：
//   Markdown 链接先解析成 MDC 的 `link` 节点（url 在 node.url），
//   由渲染器的 handlers.link 在序列化阶段转成 <a>，附加属性取自
//   node.attributes。因此这里同时处理两种形态：
//   · MDC `link` 节点        → 写 node.attributes
//   · 已经是 <a> 的元素节点  → 写 node.properties
//
// 只认 http(s)：站内相对路径 / 锚点 / mailto 保持原样，
// 否则站内跳转会退化成整页刷新。
// ============================================================

interface HastNode {
  type: string;
  tagName?: string;
  url?: string;
  attributes?: Record<string, unknown>;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

const EXTERNAL = /^https?:\/\//i;

const BLANK = {
  target: '_blank',
  // noopener：新页拿不到 window.opener，避免反向控制
  // noreferrer：不把来源地址带给第三方站点
  rel: 'noopener noreferrer',
} as const;

function patch(node: HastNode): void {
  const isMdcLink = node.type === 'link';
  const isAnchor = node.type === 'element' && node.tagName === 'a';
  if (!isMdcLink && !isAnchor) return;

  const url = isMdcLink ? node.url : node.properties?.href;
  if (typeof url !== 'string' || !EXTERNAL.test(url)) return;

  if (isMdcLink) {
    node.attributes = { ...node.attributes, ...BLANK };
  } else {
    node.properties = { ...node.properties, ...BLANK };
  }
}

function walk(node: HastNode): void {
  patch(node);
  if (!node.children) return;
  for (const child of node.children) walk(child);
}

/** rehype 插件入口：不依赖 unist-util-visit，避免为二十行逻辑多引一个包 */
export function rehypeExternalLinksBlank() {
  return (tree: HastNode): void => {
    walk(tree);
  };
}
