import galleryData from '../data/gallery.json';
import { FEATURED_LIMIT } from '../config/site';

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
  placeholder?: boolean;
}

export const photos: Photo[] = [...(galleryData as Photo[])].sort(
  (a, b) => a.order - b.order,
);

export const featuredPhotos: Photo[] = photos
  .filter((p) => p.featured)
  .slice(0, FEATURED_LIMIT);

/** 真正的照片墙用：每张照片在完整作品集中的序号，Lightbox 计数 "12 / 47" 用得到 */
export function indexOf(photo: Photo): number {
  return photos.findIndex((p) => p.id === photo.id);
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
