/** 首页宣传图 */
export const PROMO_IMAGE = 'https://img.remit.ee/i/UQi9eaPKuGU4';

export interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

/** 六条卖点，全部出自 OpenPidanUI 的自述（D:\TestProject\Eggix\README.md）。 */
export const HOME_FEATURES: FeatureItem[] = [
  {
    icon: 'i-lucide-terminal',
    title: '.NET 10 技术栈',
    description: '组件全面转向 .NET 10，告别易语言，杀软误报也少了一大截。',
  },
  {
    icon: 'i-lucide-palette',
    title: '精简版美化',
    description:
      '只保留定制主题与 Rainmeter 小组件，去掉冗余的持久化改动，日常用起来接近原版 Windows。',
  },
  {
    icon: 'i-lucide-layers',
    title: '模块化组件',
    description: '每个组件独立发布、独立更新，出问题只换那一个，不用整包重装。',
  },
  {
    icon: 'i-simple-icons-github',
    title: '开源透明',
    description: '源码可审查，欢迎提交 issue 与 PR。改了什么、为什么改，都能在提交记录里找到。',
  },
];

export interface TimelineItem {
  time: string;
  title: string;
  description: string;
}

/** 名称沿革：只讲事实，不复述争议。 */
export const ABOUT_TIMELINE: TimelineItem[] = [
  { time: '2024-04', title: 'EggyUI 启动', description: '以易语言为主要技术栈起步。' },
  {
    time: '2026-10',
    title: 'Finale Mini 发布',
    description: 'EggyUI 收官版本，随后归档停止维护。',
  },
  {
    time: '2026',
    title: '更名 OpenPidanUI',
    description: 'OpenEggyUI 全面重构，转向 .NET 10，并恢复开发。',
  },
  { time: '至今', title: '随 PidanUI 一起更新', description: '组件按模块发布，与主项目同步迭代。' },
];

export const ABOUT_TEXT = [
  'OpenPidanUI 是 PidanUI 的辅助组件开源代码库，存放系统镜像、独立美化包所需的配套组件源代码。',
  '它不负责替换系统文件，也不做持久化的系统改动——美化交给主题包与 Rainmeter，出问题切回默认主题就能恢复。',
];

export interface JoinCard {
  title: string;
  description: string;
  icon: string;
  links: {
    label: string;
    to: string;
    external?: boolean,
    icon?: string
  }[];
}

export const JOIN_CARDS: JoinCard[] = [
  {
    title: '加入社区',
    description: '装上了想反馈问题，或者只是来看看别人怎么用。',
    icon: 'i-lucide-users',
    links: [
      { label: 'QQ 群', to: 'https://qm.qq.com/q/Km93h8YWAw', external: true },
      { label: '哔哩哔哩', to: 'https://space.bilibili.com/', external: true },
    ],
  },
  {
    title: '加入开发组',
    description: '组件都是模块化的，挑一个感兴趣的模块就能上手。',
    icon: 'i-lucide-code-xml',
    links: [
      {
        label: 'GitHub 仓库',
        to: 'https://github.com/PidanUI-Team/OpenPidanUI',
        external: true,
        icon: 'i-simple-icons-github'
      },
      { label: '开发者文档', to: '/docs/developer' },
    ],
  },
];
