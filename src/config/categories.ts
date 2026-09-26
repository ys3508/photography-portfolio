/**
 * 作品分类。
 *
 * slug 用英文，因为它要进 URL（/gallery/architecture）。
 * 中英文名字在这里各写一次，页面上的标签、标题、详情页都从这里取。
 *
 * 一张照片属于哪一类，写在 content/photo-meta.json 的 category 字段里，
 * 值就是下面的 slug。没写的照片只出现在「全部」里。
 *
 * ★ 分类是王宇自己的事 ★
 *   程序不会去猜一张照片该归到哪一类。
 *   现在 photo-meta.json 里的分类是按「画面里明摆着的东西」给的初稿，
 *   改一个字段就能调整，改完重新跑 npm run import:photos 即可。
 */
export const CATEGORIES = [
  { slug: 'humanity', zh: '人文', en: 'Humanity' },
  { slug: 'street', zh: '街头', en: 'Street' },
  { slug: 'nature', zh: '自然', en: 'Nature' },
  { slug: 'architecture', zh: '建筑', en: 'Architecture' },
  { slug: 'margins', zh: '边缘群体', en: 'Margins' },
  { slug: 'art', zh: '艺术', en: 'Art' },
  { slug: 'everyday', zh: '日常生活', en: 'Everyday Life' },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]['slug'];

export const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug) as readonly string[];

export function categoryName(slug: string | null, lang: 'zh' | 'en'): string {
  const found = CATEGORIES.find((c) => c.slug === slug);
  return found ? found[lang] : '';
}
