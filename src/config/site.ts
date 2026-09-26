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
  motto: '观',
  mottoLatin: 'Think and feel the world',

  /** 封面「观」下面那一句 */
  creed: '观看，是为了看见自己',
  creedLatin: 'To observe is to encounter oneself.',
  /** 联系方式，留空则页脚不显示 */
  email: '',

  /** 网站描述，用于 SEO 与微信/短信分享预览 */
  description: '王宇（Yu Wang）个人摄影作品集 —— 观 · Think and feel the world。观看，是为了看见自己。',
  descriptionEn:
    'Photographs by Yu Wang — 观 · Think and feel the world. To observe is to encounter oneself.',
  /** 分享预览图（相对 public/ 的路径），建议用一张代表作 */
  ogImage: 'photos/share/og-cover.jpg',
  /** 摄影师人像（相对 public/ 的路径） */
  portrait: 'photos/portrait/portrait.jpg',
  /** 人像的 alt 文字 */
  portraitAlt: '摄影师王宇',
  portraitAltEn: 'Portrait of Yu Wang',
  /** 版权起始年份 */
  copyrightSince: 2026,

  /**
   * 背景音乐。
   * 绝不自动播放 —— 访客点了石膏像那个按钮才开始。
   * 不需要音乐就把 audio 设成空字符串，按钮会整个消失。
   */
  audio: 'audio/all-the-time-in-the-world.mp3',
  audioVolume: 0.4,
} as const;

/**
 * 关于摄影师。
 *
 * 正文里用 **两个星号** 包起来的词会以朱红强调 —— 想改强调哪几个词，
 * 只要挪动星号的位置，不用碰任何组件。
 */
export const STATEMENT = {
  /** 一句话身份 */
  lead: '王宇，观念摄影师、视觉哲思者。',

  /** 开头一段 */
  opening:
    '对他而言，摄影不仅是记录，更是一种**理解世界的方式**。他关注的不只是眼前发生了什么，也在意**观看本身**——我们如何看见他人，如何被他人看见，又如何在观看世界的过程中重新认识自己。',

  /** 独立成行的那一句，朱红 */
  creed: '观看，是为了看见自己。',

  /** 其余段落 */
  body: [
    '他行走于亚洲、欧洲、中东与北美，以镜头记录那些容易被忽略的**真实瞬间**。人文、街头、自然、建筑、边缘群体，以及艺术与日常生活，都是他进入世界、理解世界的入口。',
    '他的创作围绕**真理**、**人与世界的关系**、**人与爱之间的共鸣**、**观看与被观看**，以及对历史的发现、理解与反思展开。',
    '他的影像温暖而克制，重视**真实**、**故事感**与**人文温度**，也试图在日常经验中保留更深一层的哲学思考。',
  ],
} as const;

/** 英文版的同一段文字。翻译求优雅简洁，和中文保持同一种气质。 */
export const STATEMENT_EN = {
  lead: 'Yu Wang — conceptual photographer, visual thinker.',

  opening:
    'For him, photography is not only a record but **a way of understanding the world**. What holds his attention is not only what happens in front of the lens, but **the act of looking itself** — how we see others, how we are seen, and how, in looking at the world, we come to know ourselves again.',

  creed: 'To observe is to encounter oneself.',

  body: [
    'He has travelled across Asia, Europe, the Middle East and North America, photographing **the true moments** that are easily overlooked. People, streets, nature, architecture, those at the margins, and art alongside everyday life — each is a way into the world, and a way of understanding it.',
    'His work turns on **truth**, **the relation between a person and the world**, **the resonance between a person and love**, **seeing and being seen**, and the discovery, understanding and reconsideration of history.',
    'His images are warm and restrained, attentive to **what is true**, to **the sense of a story**, and to **human warmth** — and they try to keep, within ordinary experience, a deeper layer of philosophical thought.',
  ],
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

/**
 * 首页一共用掉几张「精品」。
 * 其中前 HERO_PHOTO_COUNT 张给封面，剩下的给「精品集」那一节 ——
 * 同一张照片不会在首页出现两次。
 */
export const FEATURED_LIMIT = 8;
/** 封面只放一张代表作品 —— 其余的留给「精品集」那一节 */
export const HERO_PHOTO_COUNT = 1;
