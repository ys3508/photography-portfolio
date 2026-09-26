/**
 * 网站全部「可修改文字 / 设置」集中在这一个文件。
 * 以后要改姓名、理念、陈述、白天黑夜时间，只需要改这里。
 */

export const SITE = {
  /** 摄影师姓名（导航品牌名 + 首页刊头 + 网页标题） */
  photographerName: '王宇',
  /** 拼音 / 英文名，留空则不显示 */
  photographerNameLatin: 'Yu Wang',

  /**
   * 摄影理念。
   * motto 是那一个字，mottoLatin 是它的英文。
   * 两者成对出现，像一方印章 —— 首页、摄影陈述、关于页都用它。
   */
  motto: '思',
  mottoLatin: 'Think and feel the world',

  /**
   * 80–150 字摄影陈述。
   * 现在留空 —— 等王宇本人提供真实文字再填，不要由他人代写。
   * 留空时，首页的「摄影陈述」一节只呈现「思」与它的英文，页面依然完整。
   */
  statement: '',

  /** 关于页面的补充段落，可留空 */
  aboutExtra: '',
  /** 联系方式，留空则页脚不显示 */
  email: '',

  /** 网站描述，用于 SEO 与微信/短信分享预览 */
  description: '王宇（Yu Wang）个人摄影作品集 —— 思 · Think and feel the world。',
  /** 分享预览图（相对 public/ 的路径），建议用一张代表作 */
  ogImage: 'photos/share/og-cover.jpg',
  /** 摄影师人像（相对 public/ 的路径） */
  portrait: 'photos/portrait/portrait.jpg',
  /** 人像的 alt 文字 */
  portraitAlt: '摄影师王宇',
  /** 版权起始年份 */
  copyrightSince: 2026,
} as const;

/**
 * 白天 / 夜晚模式的时间分界（访问者本地时间，24 小时制）。
 * DAY_START <= 当前小时 < DAY_END  →  白天模式
 * 其余时间                          →  夜晚模式
 *
 * 全站只有这两个常量决定日夜，不要在别的组件里再写时间判断。
 */
export const DAY_START = 7;
export const DAY_END = 19;

/** 导航（最多四项） */
export const NAV = [
  { label: '作品', href: 'gallery' },
  { label: '精品', href: '#featured' },
  { label: '关于', href: 'about' },
] as const;

/** 首页「精品集」editorial 版块最多展示几张 */
export const FEATURED_LIMIT = 5;
