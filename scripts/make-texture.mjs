#!/usr/bin/env node
/**
 * 生成网站背景用的大理石头像底纹。
 *
 *   design-source/greek_statues.jpg  （原图，只读）
 *        ↓ 降饱和 + 轻微提对比 + 放大
 *   public/texture/marble-head.webp / .avif
 *
 * 为什么要降饱和：底纹要退到照片后面去，不能和摄影作品抢颜色。
 * 真正的上色交给 CSS 的混合模式 —— 白天 multiply（石膏像成为一层阴影），
 * 夜晚 screen（石膏像从黑暗里浮出来）。
 *
 *   npm run texture
 */
import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const PROJECT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const CANDIDATES = [
  path.join(PROJECT, 'design-source/greek_statues.jpg'),
  path.join(PROJECT, 'greek_statues.jpg'),
];
const OUT_DIR = path.join(PROJECT, 'public/texture');

const source = CANDIDATES.find((p) => fsSync.existsSync(p));
if (!source) {
  console.error('✗ 找不到 greek_statues.jpg（在 design-source/ 或项目根目录下）');
  process.exit(1);
}

await fs.mkdir(OUT_DIR, { recursive: true });

const base = sharp(source)
  .rotate()
  .resize({ width: 980, kernel: 'lanczos3', withoutEnlargement: false })
  .modulate({ saturation: 0.45 })   // 退到接近中性的石膏色
  .linear(1.08, -8);                // 轻微提对比，让轮廓在低不透明度下还站得住

await base.clone().webp({ quality: 82, effort: 5 }).toFile(path.join(OUT_DIR, 'marble-head.webp'));
await base.clone().avif({ quality: 58, effort: 4 }).toFile(path.join(OUT_DIR, 'marble-head.avif'));

/*
  声音按钮用的小头像：从原图里切一块正方形（眼睛与额头那一带），
  不降饱和 —— 它是个按钮，要看得清是谁在看你。
*/
const src = await sharp(source).rotate().metadata();
const side = Math.round(Math.min(src.width, src.height) * 0.46);
const left = Math.round(src.width * 0.05);
const top = Math.round(src.height * 0.2);

await sharp(source)
  .rotate()
  .extract({ left, top, width: side, height: side })
  .resize(320, 320, { kernel: 'lanczos3' })
  .webp({ quality: 88 })
  .toFile(path.join(OUT_DIR, 'marble-mark.webp'));

const meta = await sharp(path.join(OUT_DIR, 'marble-head.webp')).metadata();
console.log(`\n底纹已生成 ${meta.width}×${meta.height}`);
for (const f of ['marble-head.webp', 'marble-head.avif', 'marble-mark.webp']) {
  const s = await fs.stat(path.join(OUT_DIR, f));
  console.log(`  ${f}  ${(s.size / 1024).toFixed(0)} KB`);
}
console.log('');
