import galleryData from '../data/gallery.json';
import { FEATURED_LIMIT, HERO_PHOTO_COUNT } from '../config/site';
import { CATEGORIES } from '../config/categories';

export interface Photo {
  id: string;
  filename: string;
  src: string;
  srcAvif?: string;
  thumbnail: string;
  thumbnailAvif?: string;
  width: number;
  height: number;
  aspectRatio: number;
  title: string;
  year: string;
  location: string;
  caption: string;
  featured: boolean;
  order: number;
  /** 分类 slug，见 src/config/categories.ts；没分类就是 null */
  category?: string | null;
  /** 来自 iCloud 的哪个文件夹 */
  folder?: string;
  placeholder?: boolean;
}

export const photos: Photo[] = [...(galleryData as Photo[])].sort(
  (a, b) => a.order - b.order,
);

export const featuredPhotos: Photo[] = photos
  .filter((p) => p.featured)
  .slice(0, FEATURED_LIMIT);

/** 封面用的（代表作品 + 右上角那张小的） */
export const heroPhotos: Photo[] = featuredPhotos.slice(0, HERO_PHOTO_COUNT);

/** 「精品集」那一节用的 —— 刻意跳过封面已经用掉的，首页不重复同一张 */
export const editorialPhotos: Photo[] = featuredPhotos.slice(HERO_PHOTO_COUNT, HERO_PHOTO_COUNT + 5);

/**
 * 完整作品墙用的照片 —— 刻意排除首页那几张。
 * 精品集与作品集互不重复：上了首页的就不再出现在作品墙上。
 */
export const galleryPhotos: Photo[] = photos.filter((p) => !p.featured);

/** 某一分类下的作品 */
export function photosInCategory(slug: string): Photo[] {
  return galleryPhotos.filter((p) => p.category === slug);
}

/** 真的有作品的分类 —— 空分类不显示标签，等有照片了自己会出现 */
export const activeCategories = CATEGORIES.filter(
  (c) => galleryPhotos.some((p) => p.category === c.slug),
);

/** 在作品墙里找某张照片的位置，详情页的上一张 / 下一张用得到 */
export function neighbours(photo: Photo, within: Photo[] = galleryPhotos) {
  const i = within.findIndex((p) => p.id === photo.id);
  if (i < 0) return { prev: undefined, next: undefined, index: 0, total: within.length };
  return {
    prev: within[(i - 1 + within.length) % within.length],
    next: within[(i + 1) % within.length],
    index: i,
    total: within.length,
  };
}

/** 详情页的地址用的 slug —— 从生成好的文件名里取，稳定且安全 */
export function photoSlug(photo: Photo): string {
  return photo.src.replace(/^photos\/full\//, '').replace(/\.webp$/, '');
}

export function findBySlug(slug: string): Photo | undefined {
  return photos.find((p) => photoSlug(p) === slug);
}

/**
 * 照片在某一组里的序号 —— Lightbox 的左右切换和 "01 / 06" 计数都按这个算。
 * 默认是全部照片；首页只翻精品那几张，所以要把那一组传进来。
 */
export function indexOf(photo: Photo, within: Photo[] = photos): number {
  return within.findIndex((p) => p.id === photo.id);
}

/**
 * 把按顺序排列的照片分配到 N 个瀑布流列中。
 * 规则：按原始顺序逐张放入「当前最矮」的一列。
 * 这样既保持照片的策展顺序，又不会出现某一列特别长。
 * 服务端构建时和浏览器端重排时使用同一套逻辑，避免布局跳动。
 */
export function distribute(items: Photo[], columnCount: number): Photo[][] {
  const columns: Photo[][] = Array.from({ length: columnCount }, () => []);
  const heights = new Array(columnCount).fill(0);
  for (const item of items) {
    let shortest = 0;
    for (let i = 1; i < columnCount; i += 1) {
      if (heights[i] < heights[shortest] - 0.001) shortest = i;
    }
    columns[shortest].push(item);
    // 以「1 / 宽高比」作为等宽列中的相对高度，再加一点间距权重
    heights[shortest] += item.height / item.width + 0.06;
  }
  return columns;
}
