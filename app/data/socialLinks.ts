export interface Link {
  key: string;
  label: string;
  href: string;
  icon: string;
}

/** 社交链接 */
export const SOCIAL_LINKS: Link[] = [
  {
    key: 'github',
    label: 'GitHub',
    href: 'https://github.com/PidanUI-Team/OpenPidanUI',
    // 品牌图标一律走 simple-icons，与 PidanUI 官网底栏一致；
    // lucide 没有品牌图标，写 i-lucide-github 会渲染成空白
    icon: 'i-simple-icons-github',
  },
  {
    key: 'site-repo',
    label: '本站源码',
    href: 'https://github.com/PidanEggyTeam/OpenPidanUI-Website',
    icon: 'i-lucide-folder-git-2',
  },
  {
    key: 'bilibili',
    label: '哔哩哔哩',
    href: 'https://space.bilibili.com/',
    icon: 'i-simple-icons-bilibili',
  },
  { key: 'qq', label: 'QQ 群', href: 'https://qm.qq.com/q/Km93h8YWAw', icon: 'i-simple-icons-tencentqq' },
];

/** 友情链接 */
export const FRIEND_LINKS: Link[] = [
  { key: 'qq', label: 'QQ 群', href: 'https://qm.qq.com/q/Km93h8YWAw', icon: 'i-simple-icons-tencentqq' },
];
