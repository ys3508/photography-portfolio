#!/usr/bin/env node
/**
 * 生成占位图，让网站在叔叔的照片到位之前也能完整地跑起来、被检查。
 *
 * 这些图是纯色调的空白图版，只是为了验证排版与交互。
 * 一旦运行 `npm run import:photos`，它们会被真正的照片整批替换。
 *
 *   npm run placeholders
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const PROJECT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT_FULL = path.join(PROJECT, 'public/photos/full');
const OUT_THUMB = path.join(PROJECT, 'public/photos/thumbs');
const OUT_PORTRAIT = path.join(PROJECT, 'public/photos/portrait');
const OUT_SHARE = path.join(PROJECT, 'public/photos/share');
const GALLERY_JSON = path.join(PROJECT, 'src/data/gallery.json');

/** 比例刻意做成有长有短，用来检验 masonry 是否真的保持原始比例 */
const PLATES = [
  { w: 3, h: 2, tone: '#6e6a63' }, // 01 超大横图
  { w: 2, h: 3, tone: '#4d4a46' }, // 02 竖图
  { w: 21, h: 9, tone: '#7c776e' }, // 03 宽幅
  { w: 4, h: 5, tone: '#5a5751' }, // 04 小作品
  { w: 1, h: 1, tone: '#8a8478' }, // 05 小作品
  { w: 3, h: 2, tone: '#585550' },
  { w: 2, h: 3, tone: '#736d64' },
  { w: 16, h: 9, tone: '#4a4744' },
  { w: 4, h: 5, tone: '#827c72' },
  { w: 3, h: 4, tone: '#625e58' },
  { w: 3, h: 2, tone: '#6b675f' },
  { w: 5, h: 4, tone: '#514e4a' },
  { w: 2, h: 3, tone: '#7a746a' },
  { w: 16, h: 9, tone: '#55524d' },
];

const FULL_EDGE = 2000;
const THUMB_EDGE = 900;

function plate(width, height, tone, label) {
  const fontSize = Math.round(Math.min(width, height) * 0.055);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${tone}" stop-opacity="1"/>
        <stop offset="100%" stop-color="${tone}" stop-opacity="0.72"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
      font-family="Helvetica, Arial, sans-serif" font-size="${fontSize}"
      letter-spacing="${fontSize * 0.22}" fill="#f4f2ec" fill-opacity="0.72">${label}</text>
  </svg>`;
  return sharp(Buffer.from(svg)).png();
}

async function main() {
  for (const dir of [OUT_FULL, OUT_THUMB, OUT_PORTRAIT, OUT_SHARE]) {
    await fs.mkdir(dir, { recursive: true });
  }

  const gallery = [];

  for (const [i, spec] of PLATES.entries()) {
    const n = String(i + 1).padStart(2, '0');
    const slug = `placeholder-${n}`;
    const label = `占位图 ${n}`;

    const landscape = spec.w >= spec.h;
    const fullW = landscape ? FULL_EDGE : Math.round((FULL_EDGE * spec.w) / spec.h);
    const fullH = landscape ? Math.round((FULL_EDGE * spec.h) / spec.w) : FULL_EDGE;

    const base = plate(fullW, fullH, spec.tone, label);
    await base.clone().webp({ quality: 88 }).toFile(path.join(OUT_FULL, `${slug}.webp`));

    const thumbW = landscape ? THUMB_EDGE : Math.round((THUMB_EDGE * spec.w) / spec.h);
    const thumbH = landscape ? Math.round((THUMB_EDGE * spec.h) / spec.w) : THUMB_EDGE;
    const thumb = plate(thumbW, thumbH, spec.tone, label);
    await thumb.clone().webp({ quality: 82 }).toFile(path.join(OUT_THUMB, `${slug}.webp`));
    await thumb.clone().avif({ quality: 58, effort: 3 }).toFile(path.join(OUT_THUMB, `${slug}.avif`));

    gallery.push({
      id: slug,
      filename: `${slug}.webp`,
      src: `photos/full/${slug}.webp`,
      thumbnail: `photos/thumbs/${slug}.webp`,
      thumbnailAvif: `photos/thumbs/${slug}.avif`,
      width: fullW,
      height: fullH,
      aspectRatio: Number((fullW / fullH).toFixed(4)),
      title: '',
      year: '',
      location: '',
      caption: '',
      featured: i < 5,
      order: i + 1,
      placeholder: true,
    });
  }

  // 摄影师人像占位
  await plate(1200, 1500, '#494640', 'PORTRAIT')
    .jpeg({ quality: 86 })
    .toFile(path.join(OUT_PORTRAIT, 'portrait.jpg'));

  // 分享预览图占位（1200×630，微信 / 短信会用到）
  await plate(1200, 630, '#2b2926', '个人摄影作品集')
    .jpeg({ quality: 86 })
    .toFile(path.join(OUT_SHARE, 'og-cover.jpg'));

  await fs.writeFile(GALLERY_JSON, `${JSON.stringify(gallery, null, 2)}\n`, 'utf8');

  console.log(`\n已生成 ${gallery.length} 张占位图 + 人像 + 分享图。`);
  console.log('这些只是空白图版，叔叔的照片一导入就会全部被替换。\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
