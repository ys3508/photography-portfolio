/**
 * 网站全部「可修改文字 / 设置」集中在这一个文件。
 * 以后要改摄影师姓名、理念、白天黑夜时间，只需要改这里。
 */

export const SITE = {
  /** 摄影师姓名（导航栏品牌名 + 首页大字 + 网页标题） */
  photographerName: '【摄影师姓名】',
  /** 可选：姓名拼音 / 英文名，留空则不显示 */
  photographerNameLatin: '',
  /** 一句摄影理念，首页封面使用。建议 10–20 字 */
  tagline: '【一句摄影理念】',
  /** 80–150 字摄影陈述，首页 Artist Statement 段落使用 */
  statement:
    '【80–150字摄影陈述。这里留给叔叔本人的文字：为什么拍照、在拍什么、想让看照片的人感受到什么。等叔叔提供真实内容之后替换这段占位文字，不要由他人代写。】',
  /** 关于页面的补充段落，可留空 */
  aboutExtra: '',
  /** 联系方式，留空则页脚不显示 */
  email: '',
  /** 网站描述，用于 SEO 与微信/短信分享预览 */
  description: '【摄影师姓名】的个人摄影作品集 —— 一场可以随时打开的线上摄影展。',
  /** 分享预览图（相对 public/ 的路径），建议用一张代表作 */
  ogImage: 'photos/share/og-cover.jpg',
  /** 摄影师人像（相对 public/ 的路径） */
  portrait: 'photos/portrait/portrait.jpg',
  /** 人像的 alt 文字 */
  portraitAlt: '摄影师本人肖像',
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
