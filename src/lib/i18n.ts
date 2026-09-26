/**
 * 中文 / 英文两个版本。
 *
 * 语言不靠传参一层层往下递，而是每个组件自己从 URL 判断：
 * 路径里有 /en 就是英文版。这样加页面、改组件都不用惦记着把 lang 传下去。
 */
export type Lang = 'zh' | 'en';

const BASE = import.meta.env.BASE_URL;
/** '/photography-portfolio'（不带结尾斜杠），根部署时是 '' */
const ROOT = BASE.replace(/\/+$/, '');

/**
 * 去掉站点子路径，拿到「语言前缀 + 页面路径」。
 * 注意首页的 Astro.url.pathname 是 '/photography-portfolio'（没有结尾斜杠），
 * 所以这里按不带斜杠的前缀来剥。
 */
function strip(pathname: string): string {
  let rest = pathname;
  if (ROOT && rest.startsWith(ROOT)) rest = rest.slice(ROOT.length);
  return rest.replace(/^\/+/, '');
}

export function getLang(url: URL): Lang {
  const rest = strip(url.pathname);
  // 必须是整段 'en'，不能把将来某个叫 'english' 的页面也算进去
  return rest === 'en' || rest.startsWith('en/') ? 'en' : 'zh';
}

/** 生成某个语言版本下的链接。path 用不带语言前缀的相对路径，如 'gallery' */
export function localePath(lang: Lang, path = ''): string {
  const clean = path.replace(/^\/+/, '');
  if (clean.startsWith('#')) return clean;
  const prefix = lang === 'en' ? 'en/' : '';
  return `${ROOT}/${prefix}${clean}`;
}

/** 当前这一页在另一个语言下的地址（供语言切换按钮用） */
export function otherLangPath(lang: Lang, url: URL): string {
  let rest = strip(url.pathname);
  if (lang === 'en') rest = rest.replace(/^en\/?/, '');
  return localePath(lang === 'en' ? 'zh' : 'en', rest);
}

const DICT = {
  zh: {
    htmlLang: 'zh-CN',
    ogLocale: 'zh_CN',
    skip: '跳到主要内容',
    navWorks: '作品',
    navSelected: '精品',
    navAbout: '关于',
    siteTagline: '个人摄影作品集',
    pageWorksTitle: '作品',
    pageWorksHint: '点击照片全屏浏览',
    pageAboutTitle: '关于摄影师',
    selectedTitle: '精品集',
    moreTitle: '更多作品',
    moreCta: '进入完整摄影作品墙',
    aboutEyebrow: '关于摄影师',
    emptyGallery: '目前还没有照片。把照片放进 iCloud 文件夹，再运行导入脚本即可。',
    rights: '版权所有，未经许可请勿使用照片。',
    contact: '联系',
    notFoundTitle: '这里没有照片',
    notFoundBody: '页面地址可能输错了，或者这张页面已经移走。',
    notFoundCta: '回到首页',
    themeToggle: '切换白天 / 夜晚模式',
    langToggle: 'Switch to English',
    langLabel: 'EN',
    soundOn: '开启音乐',
    soundOff: '关闭音乐',
    soundPlay: '播放背景音乐',
    soundStop: '关闭背景音乐',
    lightbox: '照片全屏浏览',
    lbClose: '关闭 (ESC)',
    lbPrev: '上一张 (←)',
    lbNext: '下一张 (→)',
    zoomPrefix: '放大查看：',
    photoAlt: (n: number) => `摄影作品 第 ${n} 张`,
    leadAlt: '代表摄影作品',
  },
  en: {
    htmlLang: 'en',
    ogLocale: 'en_US',
    skip: 'Skip to content',
    navWorks: 'Works',
    navSelected: 'Selected',
    navAbout: 'About',
    siteTagline: 'Photographs',
    pageWorksTitle: 'Works',
    pageWorksHint: 'Click any photograph to view it full screen',
    pageAboutTitle: 'About the Photographer',
    selectedTitle: 'Selected Works',
    moreTitle: 'More Work',
    moreCta: 'Enter the full wall of photographs',
    aboutEyebrow: 'About the Photographer',
    emptyGallery: 'No photographs yet.',
    rights: 'All rights reserved. Please do not use these photographs without permission.',
    contact: 'Contact',
    notFoundTitle: 'Nothing here',
    notFoundBody: 'The address may be mistyped, or this page has moved.',
    notFoundCta: 'Back to the beginning',
    themeToggle: 'Switch between day and night',
    langToggle: '切换到中文',
    langLabel: '中',
    soundOn: 'Sound on',
    soundOff: 'Sound off',
    soundPlay: 'Play background music',
    soundStop: 'Stop background music',
    lightbox: 'Full screen viewer',
    lbClose: 'Close (ESC)',
    lbPrev: 'Previous (←)',
    lbNext: 'Next (→)',
    zoomPrefix: 'View larger: ',
    photoAlt: (n: number) => `Photograph no. ${n}`,
    leadAlt: 'Featured photograph',
  },
} as const;

export function t(lang: Lang) {
  return DICT[lang];
}
