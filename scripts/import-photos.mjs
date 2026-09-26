#!/usr/bin/env node
/**
 * 从 iCloud「精品集」导入照片 → 生成网站用的图片副本 + gallery.json
 *
 *   iCloud 精品集（原图，只读）
 *        ↓  读取
 *   public/photos/full/*.webp     网站大图   长边 ~2200px
 *   public/photos/thumbs/*.webp   缩略图     长边 ~900px
 *   public/photos/thumbs/*.avif   缩略图     更小体积，现代浏览器优先
 *        ↓
 *   src/data/gallery.json         网站读取的照片数据
 *
 * ★ 安全承诺 ★
 *   本脚本对 iCloud 原图只有「读」这一个动作。
 *   全文没有任何 删除 / 移动 / 改名 / 覆盖 / 写入 原目录的代码。
 *   所有网站图片都是全新生成的副本，写在本项目的 public/photos/ 下。
 *
 * 用法：
 *   npm run import:photos
 *   PHOTOS_SOURCE_DIR="/别的路径" npm run import:photos
 */

import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import sharp from 'sharp';
import exifr from 'exifr';

const execFileAsync = promisify(execFile);

/* ------------------------------------------------------------------ 配置 */

const PROJECT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

const ICLOUD_BASE = path.join(
  os.homedir(),
  'Library/Mobile Documents/com~apple~CloudDocs/叔叔摄影作品集',
);

/*
  网站读取哪个文件夹。
  目前是「网站照片」—— 王宇挑定、确认要放上网站的那一组。
  「精品集」留作他平时挑选的中转站；如果以后决定直接用「精品集」，
  把下面这一行改成 '精品集' 即可（同时记得改 iCloud 里的 说明书.txt）。
*/
const SOURCE_FOLDER = '网站照片';
const OTHER_FOLDER = '精品集';

const DEFAULT_SOURCE = path.join(ICLOUD_BASE, SOURCE_FOLDER);
const SOURCE_DIR = process.env.PHOTOS_SOURCE_DIR?.trim() || DEFAULT_SOURCE;

const OUT_FULL = path.join(PROJECT, 'public/photos/full');
const OUT_THUMB = path.join(PROJECT, 'public/photos/thumbs');
const GALLERY_JSON = path.join(PROJECT, 'src/data/gallery.json');
const META_JSON = path.join(PROJECT, 'content/photo-meta.json');

/*
  只缩小、永不放大（sharp 的 withoutEnlargement）。
  原图如果本来就小于这些尺寸，就原样保留 —— 不会为了"统一"去插值放大，
  也不会把一张 768×1024 的照片缩成 675×900。
*/
const FULL_EDGE = 2400; // 全屏浏览用
const THUMB_EDGE = 1200; // 照片墙用（留足 2 倍屏的余量）
const FULL_QUALITY = 94;
const THUMB_QUALITY = 88;
const AVIF_QUALITY = 68;

const SUPPORTED = new Set([
  '.jpg', '.jpeg', '.png', '.tif', '.tiff', '.webp', '.heic', '.heif',
  '.arw', '.cr2', '.cr3', '.nef', '.raf', '.dng', '.orf', '.rw2',
]);

/* ------------------------------------------------------------------ 工具 */

const log = (...a) => console.log(...a);

function slugify(name, fallbackId) {
  const base = path
    .basename(name, path.extname(name))
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
  const ascii = base.replace(/[^a-z0-9-]/g, '');
  return ascii.length >= 3 ? ascii.slice(0, 48) : `photo-${fallbackId}`;
}

function idFor(filename) {
  return crypto.createHash('sha1').update(filename).digest('hex').slice(0, 8);
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch {
    return fallback;
  }
}

/**
 * 读取原图。只读，绝不写回原目录。
 * iCloud 上没下载到本地的文件会先触发下载；HEIC 等 sharp 解不了的格式
 * 走 macOS 自带的 sips 转成临时 TIFF（临时文件写在系统临时目录，不动原图）。
 */
async function loadImage(sourceFile) {
  const buffer = await fs.readFile(sourceFile); // ← 唯一接触原图的操作
  try {
    const pipeline = sharp(buffer, { failOn: 'none' });
    await pipeline.metadata();
    return { pipeline, temp: null };
  } catch {
    const temp = path.join(
      await fs.mkdtemp(path.join(os.tmpdir(), 'photo-import-')),
      'converted.tiff',
    );
    await execFileAsync('sips', ['-s', 'format', 'tiff', sourceFile, '--out', temp]);
    return { pipeline: sharp(temp, { failOn: 'none' }), temp };
  }
}

async function exifYear(sourceFile) {
  try {
    const exif = await exifr.parse(sourceFile, ['DateTimeOriginal', 'CreateDate']);
    const date = exif?.DateTimeOriginal ?? exif?.CreateDate;
    if (date instanceof Date && !Number.isNaN(date.getTime())) {
      return { year: String(date.getFullYear()), taken: date.getTime() };
    }
  } catch {
    /* 没有 EXIF 很正常，留空即可，绝不编造 */
  }
  return { year: '', taken: null };
}

/* ------------------------------------------------------------------ 主流程 */

async function main() {
  log('\n照片导入');
  log('────────────────────────────────────────');
  log(`来源（只读）: ${SOURCE_DIR}`);
  log(`输出        : public/photos/\n`);

  // 另一个文件夹里如果也有照片，提醒一声，免得有人以为它们会自动上网站
  if (!process.env.PHOTOS_SOURCE_DIR) {
    const other = path.join(ICLOUD_BASE, OTHER_FOLDER);
    try {
      const n = (await fs.readdir(other))
        .filter((f) => !f.startsWith('.') && SUPPORTED.has(path.extname(f).toLowerCase()))
        .length;
      if (n > 0) {
        log(`⚠  提醒：「${OTHER_FOLDER}」里还有 ${n} 张照片，本次不会用到。`);
        log(`   网站只读取「${SOURCE_FOLDER}」。要换文件夹请改 scripts/import-photos.mjs 顶部的 SOURCE_FOLDER。\n`);
      }
    } catch {
      /* 另一个文件夹不存在也无所谓 */
    }
  }

  if (path.resolve(SOURCE_DIR).startsWith(path.resolve(PROJECT) + path.sep)) {
    console.error('✗ 来源目录不能在项目内部，退出。');
    process.exit(1);
  }

  if (!fsSync.existsSync(SOURCE_DIR)) {
    console.error(`✗ 找不到来源文件夹：\n  ${SOURCE_DIR}\n`);
    console.error('  请确认 iCloud 云盘 → 叔叔摄影作品集 → 精品集 存在，');
    console.error('  或用 PHOTOS_SOURCE_DIR 指定其它路径。');
    process.exit(1);
  }

  const entries = (await fs.readdir(SOURCE_DIR, { withFileTypes: true }))
    .filter((e) => e.isFile() && !e.name.startsWith('.'))
    .map((e) => e.name)
    .filter((name) => SUPPORTED.has(path.extname(name).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, 'zh-CN'));

  if (entries.length === 0) {
    log('精品集里还没有照片。');
    log('把叔叔挑好的照片放进 iCloud 云盘 → 叔叔摄影作品集 → 精品集，再运行一次。\n');
    log('（本次没有改动任何文件，网站会继续使用现有的 gallery.json。）\n');
    return;
  }

  await fs.mkdir(OUT_FULL, { recursive: true });
  await fs.mkdir(OUT_THUMB, { recursive: true });
  await fs.mkdir(path.dirname(META_JSON), { recursive: true });

  const previous = await readJson(GALLERY_JSON, []);
  const prevById = new Map(previous.map((p) => [p.id, p]));
  const meta = await readJson(META_JSON, {});

  const collected = [];
  const keepFiles = new Set();

  for (const filename of entries) {
    const sourceFile = path.join(SOURCE_DIR, filename);
    const stat = await fs.stat(sourceFile);
    const id = idFor(filename);
    const slug = `${slugify(filename, id)}-${id}`;

    const fullRel = `photos/full/${slug}.webp`;
    const thumbRel = `photos/thumbs/${slug}.webp`;
    const thumbAvifRel = `photos/thumbs/${slug}.avif`;
    keepFiles.add(`${slug}.webp`);
    keepFiles.add(`${slug}.avif`);

    const prev = prevById.get(id);
    const unchanged =
      prev &&
      prev.sourceSize === stat.size &&
      prev.sourceMtime === Math.floor(stat.mtimeMs) &&
      fsSync.existsSync(path.join(PROJECT, 'public', fullRel)) &&
      fsSync.existsSync(path.join(PROJECT, 'public', thumbRel));

    let width = prev?.width ?? 0;
    let height = prev?.height ?? 0;
    let year = prev?.year ?? '';
    let taken = prev?.taken ?? null;

    if (unchanged) {
      log(`·  跳过（无变化） ${filename}`);
    } else {
      log(`→  处理 ${filename}`);
      const { pipeline, temp } = await loadImage(sourceFile);
      try {
        const info = await pipeline.metadata();
        // EXIF 里带旋转信息时，实际显示的宽高要交换
        const rotated = (info.orientation ?? 1) >= 5;
        const srcW = rotated ? info.height : info.width;
        const srcH = rotated ? info.width : info.height;

        const fullScale = Math.min(1, FULL_EDGE / Math.max(srcW, srcH));
        width = Math.round(srcW * fullScale);
        height = Math.round(srcH * fullScale);

        await pipeline
          .clone()
          .rotate()
          .resize({ width, height, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: FULL_QUALITY, effort: 5 })
          .toFile(path.join(PROJECT, 'public', fullRel));

        await pipeline
          .clone()
          .rotate()
          .resize({ width: THUMB_EDGE, height: THUMB_EDGE, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: THUMB_QUALITY, effort: 5 })
          .toFile(path.join(PROJECT, 'public', thumbRel));

        await pipeline
          .clone()
          .rotate()
          .resize({ width: THUMB_EDGE, height: THUMB_EDGE, fit: 'inside', withoutEnlargement: true })
          .avif({ quality: AVIF_QUALITY, effort: 4 })
          .toFile(path.join(PROJECT, 'public', thumbAvifRel));

        const e = await exifYear(sourceFile);
        year = e.year;
        taken = e.taken;
      } finally {
        if (temp) await fs.rm(path.dirname(temp), { recursive: true, force: true });
      }
    }

    // 叔叔填写的信息（标题 / 地点 / 说明 / 精品 / 顺序）永远以 content/photo-meta.json 为准。
    // 没有填的就留空 —— 不自动编造。
    const m = meta[filename] ?? {};
    if (!meta[filename]) {
      meta[filename] = { title: '', year: '', location: '', caption: '', featured: false, order: null };
    }

    collected.push({
      id,
      filename,
      src: fullRel,
      thumbnail: thumbRel,
      thumbnailAvif: thumbAvifRel,
      width,
      height,
      aspectRatio: height ? Number((width / height).toFixed(4)) : 1,
      title: m.title ?? '',
      year: m.year || year,
      location: m.location ?? '',
      caption: m.caption ?? '',
      featured: m.featured === true,
      order: 0,
      sourceSize: stat.size,
      sourceMtime: Math.floor(stat.mtimeMs),
      taken,
      manualOrder: typeof m.order === 'number' ? m.order : null,
    });
  }

  /* 排序：手动 order 优先 → 拍摄时间新在前 → 文件名 */
  collected.sort((a, b) => {
    if (a.manualOrder !== null && b.manualOrder !== null) return a.manualOrder - b.manualOrder;
    if (a.manualOrder !== null) return -1;
    if (b.manualOrder !== null) return 1;
    if (a.taken && b.taken && a.taken !== b.taken) return b.taken - a.taken;
    return a.filename.localeCompare(b.filename, 'zh-CN');
  });
  collected.forEach((p, i) => {
    p.order = i + 1;
    delete p.manualOrder;
    delete p.taken;
  });

  /* 首页精品集：叔叔在 photo-meta.json 里标了 featured 就用他标的；
     一个都没标时，暂时用排在最前面的 5 张占位，等叔叔决定。 */
  if (!collected.some((p) => p.featured)) {
    collected.slice(0, 5).forEach((p) => {
      p.featured = true;
    });
    log('\n提示：photo-meta.json 里还没有标记 featured，');
    log('     首页精品集暂时使用排在最前的 5 张。');
    log('     请叔叔确认后，在 content/photo-meta.json 里把想上首页的照片设为 "featured": true。');
  }

  /* 清理项目里已经没有对应原图的旧副本（只动 public/photos，不动 iCloud） */
  let removed = 0;
  for (const dir of [OUT_FULL, OUT_THUMB]) {
    for (const file of await fs.readdir(dir)) {
      if (file.startsWith('.')) continue;
      if (!keepFiles.has(file)) {
        await fs.rm(path.join(dir, file));
        removed += 1;
      }
    }
  }

  await fs.writeFile(GALLERY_JSON, `${JSON.stringify(collected, null, 2)}\n`, 'utf8');
  await fs.writeFile(META_JSON, `${JSON.stringify(meta, null, 2)}\n`, 'utf8');

  log('\n────────────────────────────────────────');
  log(`完成：${collected.length} 张照片`);
  log(`首页精品集：${collected.filter((p) => p.featured).length} 张`);
  if (removed) log(`清理了 ${removed} 个不再需要的网站图片副本`);
  log('iCloud 原图未被修改。\n');
  log('接下来：');
  log('  npm run dev      本地预览');
  log('  git add -A && git commit -m "Update photo set" && git push');
  log('');
}

main().catch((err) => {
  console.error('\n✗ 导入失败：', err.message);
  console.error('（iCloud 原图不受影响。）\n');
  process.exit(1);
});
