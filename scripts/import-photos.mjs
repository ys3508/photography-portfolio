#!/usr/bin/env node
/**
 * 从 iCloud 导入照片 → 生成网站用的图片副本 + gallery.json
 *
 * 读两个文件夹：
 *
 *   叔叔摄影作品集/网站照片   →  首页展示的那几张（封面 + 精品集那一节）
 *   叔叔摄影作品集/作品集     →  完整摄影作品墙 /gallery
 *
 * 两边的照片都会进作品墙；来自「网站照片」的额外标成 featured，上首页。
 * 同一张照片两边都有时，按**文件内容**去重（改名、复制一份都骗不过去），只算一张。
 *
 *        ↓  读取
 *   public/photos/full/*.webp     网站大图   长边最多 2400px
 *   public/photos/thumbs/*.webp   缩略图     长边最多 1200px
 *   public/photos/thumbs/*.avif   缩略图     体积更小，现代浏览器优先
 *        ↓
 *   src/data/gallery.json         网站读取的照片数据
 *
 * ★ 安全承诺 ★
 *   本脚本对 iCloud 原图只有「读」这一个动作。
 *   全文没有任何 删除 / 移动 / 改名 / 覆盖 / 写入 原目录的代码。
 *   只缩小、永不放大：原图小于上限时保持原分辨率，不做任何插值。
 *
 * 用法：
 *   npm run import:photos
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

/** 顺序有意义：排在前面的文件夹优先决定一张照片的归属 */
const SOURCES = [
  { folder: '网站照片', featured: true, note: '首页展示' },
  { folder: '作品集', featured: false, note: '完整作品墙' },
];

/**
 * 「作品集」下面的子文件夹名就是分类 —— 把照片拖进「建筑」，它就是建筑。
 * 不用改任何文件。放在「作品集」根目录下的照片只出现在「全部」里。
 */
const FOLDER_CATEGORY = {
  人文: 'humanity',
  街头: 'street',
  自然: 'nature',
  建筑: 'architecture',
  边缘群体: 'margins',
  艺术: 'art',
  日常生活: 'everyday',
};

const OUT_FULL = path.join(PROJECT, 'public/photos/full');
const OUT_THUMB = path.join(PROJECT, 'public/photos/thumbs');
const GALLERY_JSON = path.join(PROJECT, 'src/data/gallery.json');
const META_JSON = path.join(PROJECT, 'content/photo-meta.json');

/* 只缩小、永不放大 */
const FULL_EDGE = 2400;
const THUMB_EDGE = 1200;
const FULL_QUALITY = 94;
const THUMB_QUALITY = 88;
const AVIF_QUALITY = 68;

const SUPPORTED = new Set([
  '.jpg', '.jpeg', '.png', '.tif', '.tiff', '.webp', '.heic', '.heif',
  '.arw', '.cr2', '.cr3', '.nef', '.raf', '.dng', '.orf', '.rw2',
]);

/* ------------------------------------------------------------------ 工具 */

const log = (...a) => console.log(...a);

/** 文件内容的指纹 —— 用它去重和做 id，改名、复制一份都骗不过去 */
const contentId = (buffer) => crypto.createHash('sha1').update(buffer).digest('hex').slice(0, 10);

function slugify(name, fallbackId) {
  const base = path
    .basename(name, path.extname(name))
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
  const ascii = base.replace(/[^a-z0-9-]/g, '').replace(/^-+|-+$/g, '');
  return ascii.length >= 3 ? `${ascii.slice(0, 40)}-${fallbackId}` : `photo-${fallbackId}`;
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
 * HEIC 等 sharp 解不了的格式走 macOS 自带的 sips 转成临时 TIFF
 * （临时文件写在系统临时目录，用完即删，不动原图）。
 */
async function loadImage(sourceFile, buffer) {
  try {
    const pipeline = sharp(buffer, { failOn: 'none' });
    await pipeline.metadata();
    return { pipeline, temp: null };
  } catch {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'photo-import-'));
    const temp = path.join(dir, 'converted.tiff');
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
  for (const src of SOURCES) {
    const dir = path.join(ICLOUD_BASE, src.folder);
    if (!fsSync.existsSync(dir)) {
      console.error(`✗ 找不到文件夹：\n  ${dir}\n`);
      process.exit(1);
    }
    log(`来源（只读）: ${src.folder.padEnd(6, '　')} → ${src.note}`);
  }
  log(`输出        : public/photos/\n`);

  await fs.mkdir(OUT_FULL, { recursive: true });
  await fs.mkdir(OUT_THUMB, { recursive: true });
  await fs.mkdir(path.dirname(META_JSON), { recursive: true });

  /* ---- 合并两个文件夹，按文件内容去重 ---- */
  const byContent = new Map();
  let seen = 0;

  for (const src of SOURCES) {
    const dir = path.join(ICLOUD_BASE, src.folder);
    // 连子文件夹一起读：子文件夹名 = 分类
    const found = [];
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue;
      if (entry.isDirectory()) {
        const sub = path.join(dir, entry.name);
        for (const f of await fs.readdir(sub)) {
          if (f.startsWith('.') || !SUPPORTED.has(path.extname(f).toLowerCase())) continue;
          found.push({ filename: f, file: path.join(sub, f), category: FOLDER_CATEGORY[entry.name] ?? null });
        }
      } else if (SUPPORTED.has(path.extname(entry.name).toLowerCase())) {
        found.push({ filename: entry.name, file: path.join(dir, entry.name), category: null });
      }
    }
    found.sort((a, b) => a.filename.localeCompare(b.filename, 'zh-CN'));

    for (const entry of found) {
      seen += 1;
      const { filename, file } = entry;
      const buffer = await fs.readFile(file); // ← 唯一接触原图的操作
      const id = contentId(buffer);
      const existing = byContent.get(id);
      if (existing) {
        // 同一张照片又出现了一次：只把「上首页」这个属性合并进去，不重复收录
        if (src.featured) existing.featured = true;
        continue;
      }
      byContent.set(id, {
        id,
        file,
        filename,
        folder: src.folder,
        folderCategory: entry.category,
        featured: src.featured,
        stat: await fs.stat(file),
      });
    }
  }

  const items = [...byContent.values()];
  if (items.length === 0) {
    log('两个文件夹里都还没有照片。本次没有改动任何文件。\n');
    return;
  }
  if (seen > items.length) log(`（跳过 ${seen - items.length} 张重复照片 —— 按文件内容判断）\n`);

  /* ---- 逐张生成网站版本 ---- */
  const previous = await readJson(GALLERY_JSON, []);
  const prevById = new Map(previous.map((p) => [p.id, p]));
  const meta = await readJson(META_JSON, {});

  const collected = [];
  const keepFiles = new Set();

  for (const item of items) {
    const { id, file, filename, stat } = item;
    const slug = slugify(filename, id);
    const fullRel = `photos/full/${slug}.webp`;
    const thumbRel = `photos/thumbs/${slug}.webp`;
    const thumbAvifRel = `photos/thumbs/${slug}.avif`;
    keepFiles.add(`${slug}.webp`);
    keepFiles.add(`${slug}.avif`);

    const prev = prevById.get(id);
    const unchanged =
      prev &&
      prev.sourceSize === stat.size &&
      fsSync.existsSync(path.join(PROJECT, 'public', fullRel)) &&
      fsSync.existsSync(path.join(PROJECT, 'public', thumbRel)) &&
      fsSync.existsSync(path.join(PROJECT, 'public', thumbAvifRel));

    let width = prev?.width ?? 0;
    let height = prev?.height ?? 0;
    let year = prev?.year ?? '';
    let taken = prev?.taken ?? null;

    if (unchanged) {
      log(`·  跳过（无变化） ${item.folder}/${filename}`);
    } else {
      log(`→  处理 ${item.folder}/${filename}`);
      const buffer = await fs.readFile(file);
      const { pipeline, temp } = await loadImage(file, buffer);
      try {
        const info = await pipeline.metadata();
        // EXIF 带旋转信息时，实际显示的宽高要交换
        const rotated = (info.orientation ?? 1) >= 5;
        const srcW = rotated ? info.height : info.width;
        const srcH = rotated ? info.width : info.height;

        const scale = Math.min(1, FULL_EDGE / Math.max(srcW, srcH));
        width = Math.round(srcW * scale);
        height = Math.round(srcH * scale);

        const resize = (edge) => ({
          width: edge,
          height: edge,
          fit: 'inside',
          withoutEnlargement: true,
        });

        await pipeline.clone().rotate().resize(resize(FULL_EDGE))
          .webp({ quality: FULL_QUALITY, effort: 5 })
          .toFile(path.join(PROJECT, 'public', fullRel));

        await pipeline.clone().rotate().resize(resize(THUMB_EDGE))
          .webp({ quality: THUMB_QUALITY, effort: 5 })
          .toFile(path.join(PROJECT, 'public', thumbRel));

        await pipeline.clone().rotate().resize(resize(THUMB_EDGE))
          .avif({ quality: AVIF_QUALITY, effort: 4 })
          .toFile(path.join(PROJECT, 'public', thumbAvifRel));

        const e = await exifYear(file);
        year = e.year;
        taken = e.taken;
      } finally {
        if (temp) await fs.rm(path.dirname(temp), { recursive: true, force: true });
      }
    }

    // 标题 / 地点 / 说明 / 顺序以 content/photo-meta.json 为准。
    // 没填的就留空 —— 不自动编造。
    if (!meta[filename]) {
      meta[filename] = { title: '', year: '', location: '', caption: '', category: null, order: null };
    }
    if (!('category' in meta[filename])) meta[filename].category = null;
    const m = meta[filename];

    collected.push({
      id,
      filename,
      folder: item.folder,
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
      // 分类由文件夹决定；photo-meta 里显式写 category 可以覆盖
      category: m.category ?? item.folderCategory ?? null,
      // 首页展示与否由文件夹决定；photo-meta 里显式写 featured 可以覆盖
      featured: typeof m.featured === 'boolean' ? m.featured : item.featured,
      order: 0,
      sourceSize: stat.size,
      taken,
      manualOrder: typeof m.order === 'number' ? m.order : null,
    });
  }

  /* 排序：手动 order 优先 → 首页那几张在前 → 拍摄时间新在前 → 文件名 */
  collected.sort((a, b) => {
    if (a.manualOrder !== null && b.manualOrder !== null) return a.manualOrder - b.manualOrder;
    if (a.manualOrder !== null) return -1;
    if (b.manualOrder !== null) return 1;
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    if (a.taken && b.taken && a.taken !== b.taken) return b.taken - a.taken;
    return a.filename.localeCompare(b.filename, 'zh-CN');
  });
  collected.forEach((p, i) => {
    p.order = i + 1;
    delete p.manualOrder;
    delete p.taken;
  });

  /*
    安全闸。
    iCloud 正在同步、文件夹被临时清空、或者有人正在整理目录时，
    来源会「看起来」突然少掉一大批。这时候绝不能顺手把网站上的照片删掉。
    少了三成以上就停下来，什么都不改，让人来确认。
  */
  const allowShrink = process.argv.includes('--allow-shrink');
  if (!allowShrink && previous.length >= 5 && collected.length < previous.length * 0.7) {
    console.error('\n✗ 停下了：来源照片数从 ' + previous.length + ' 张掉到 ' + collected.length + ' 张。');
    console.error('  这通常意味着 iCloud 还没同步完，或者有人正在整理文件夹。');
    console.error('  本次没有改动任何东西 —— 网站上现有的照片原样保留。\n');
    console.error('  确认来源确实就是这么多，再加 --allow-shrink 重跑：');
    console.error('    npm run import:photos -- --allow-shrink\n');
    process.exit(1);
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

  const featured = collected.filter((p) => p.featured).length;
  const wall = collected.length - featured;
  const uncategorised = collected.filter((p) => !p.featured && !p.category).length;
  log('\n────────────────────────────────────────');
  log(`首页展示  ：${featured} 张（来自「网站照片」）`);
  log(`作品墙    ：${wall} 张（来自「作品集」）`);
  if (uncategorised > 0) {
    log(`\n提示：作品墙里有 ${uncategorised} 张还没分类，它们只会出现在「全部」里。`);
    log(`     在 content/photo-meta.json 里填 category 即可（见 content/README.md）。`);
  }
  if (removed) log(`清理了 ${removed} 个不再需要的网站图片副本`);
  log('iCloud 原图未被修改。\n');
  log('接下来：');
  log('  npm run dev      本地预览');
  log('  git add -A && git commit -m "Update photo set" && git push\n');
}

main().catch((err) => {
  console.error('\n✗ 导入失败：', err.message);
  console.error('（iCloud 原图不受影响。）\n');
  process.exit(1);
});
