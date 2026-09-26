# 王宇 摄影作品集

**思 · Think and feel the world**

摄影师 **王宇（Yu Wang）** 的个人摄影网站 —— 个人摄影画册 × 线上摄影展 × 摄影师个人档案。
不是商业接单网站，没有预约、没有商城、没有评论。照片是唯一的主角。

- **网站地址**：https://ys3508.github.io/photography-portfolio/
- **代码仓库**：https://github.com/ys3508/photography-portfolio
- **技术栈**：[Astro](https://astro.build)（纯静态网站）+ [sharp](https://sharp.pixelplumbing.com)（本地处理照片）

---

## 目录

1. [网站介绍](#一网站介绍)
2. [本地运行](#二本地运行)
3. [叔叔怎么放照片](#三叔叔怎么放照片)
4. [我怎么把照片导入网站](#四我怎么把照片导入网站)
5. [怎么填写照片信息 / 决定首页放哪几张](#五怎么填写照片信息--决定首页放哪几张)
6. [怎么改网站上的文字](#六怎么改网站上的文字)
7. [怎么发布新版本](#七怎么发布新版本)
8. [项目结构](#八项目结构)
9. [以后换成自己的域名](#九以后换成自己的域名)
10. [常见问题](#十常见问题)

---

## 一、网站介绍

| 页面 | 地址 | 内容 |
| --- | --- | --- |
| 首页 | `/` | 封面（人像 + 代表作品 + 姓名 + 摄影理念）→ 摄影陈述 → 精品集 → 更多作品 → 关于摄影师 |
| 作品 | `/gallery` | 完整摄影作品墙，masonry 排列，保持每张照片的原始比例 |
| 关于 | `/about` | 摄影师介绍 |

其它特性：

- **白天 / 夜晚两套视觉**，按访问者本地时间自动切换，也可以手动点右上角 `☀︎ / ◐`，选择会被记住
- **点击任意照片进入全屏浏览**：左右箭头、键盘 `←` `→`、`ESC` 退出、手机左右滑动、照片计数 `12 / 47`
- 照片全部 lazy load，缩略图与大图分开，首页不会一次加载几十张高清原图
- 手机、平板、电脑都测试过；微信 / 短信分享会显示标题、说明和一张预览图

---

## 二、本地运行

需要先装好 [Node.js](https://nodejs.org)（20 或更高版本）。

```bash
cd ~/Desktop/photography-portfolio
npm install        # 第一次才需要
npm run dev
```

浏览器打开终端里显示的地址（通常是 **http://localhost:4321/photography-portfolio**）。

> 注意网址里的 `/photography-portfolio` 不能少 —— 本地和线上保持同样的路径，
> 就不会出现「本地正常、线上图片全 404」的问题。

其它命令：

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 本地预览，改代码自动刷新 |
| `npm run build` | 构建线上版本到 `dist/` |
| `npm run preview` | 预览构建好的线上版本 |
| `npm run check` | 检查代码有没有类型错误 |
| `npm run import:photos` | **从 iCloud 精品集导入照片**（最常用） |
| `npm run placeholders` | 重新生成占位图（叔叔还没给照片时用） |

---

## 三、叔叔怎么放照片

iCloud 云盘里已经建好了这个文件夹：

```
iCloud 云盘 / 叔叔摄影作品集 /
├── 作品集      ← 平时想保存的摄影作品都放这里
├── 精品集      ← ★ 叔叔认为应该正式放到网站上的照片放这里
├── 网站照片    ← 留作备用，网站不读取这里
└── 说明书.txt  ← 给叔叔看的上传步骤
```

**网站只读取「精品集」。** 哪些照片算精品，由叔叔本人决定，
程序不会替他挑、也不会用 AI 自动选片。

本机上的实际路径：

```
/Users/sissi/Library/Mobile Documents/com~apple~CloudDocs/叔叔摄影作品集/精品集
```

桌面上有一个同名快捷方式指向它。

---

## 四、我怎么把照片导入网站

叔叔往「精品集」里放了新照片之后，在电脑上跑一条命令：

```bash
npm run import:photos
```

这条命令做的事：

```
iCloud 精品集（原图，只读）
     ↓ 读取
public/photos/full/*.webp     网站大图   长边约 2200px
public/photos/thumbs/*.webp   缩略图     长边约 900px
public/photos/thumbs/*.avif   缩略图     体积更小，现代浏览器优先用
     ↓
src/data/gallery.json         网站读取的照片数据（自动生成，不用手改）
content/photo-meta.json       照片信息表（会新增条目，已填的内容不会被覆盖）
```

### 关于 iCloud 原图的安全承诺

脚本对 iCloud 里的原照片**只有「读」这一个动作**。

- 不删除、不移动、不改名、不覆盖、不压缩、不修改原图
- 所有网站图片都是**全新生成的副本**，写在本项目的 `public/photos/` 下
- 高清原始摄影文件**不会**被上传到 GitHub（`.gitignore` 里屏蔽了 RAW / HEIC / TIFF）

脚本还会自动跳过没有变化的照片，所以照片多了以后重跑也很快。
如果某张照片从「精品集」里拿走了，下次运行会自动清掉网站里对应的副本
（只清项目里的副本，不动 iCloud）。

> 支持 JPEG / PNG / TIFF / WebP / HEIC，以及常见 RAW 格式。
> HEIC 等 sharp 解不了的格式会自动改用 macOS 自带的 `sips` 转换，临时文件用完即删。

---

## 五、怎么填写照片信息 / 决定首页放哪几张

唯一需要手工填写的文件是 **`content/photo-meta.json`**，按原始文件名索引：

```json
{
  "IMG_1234.JPG": {
    "title": "晨雾",
    "year": "2024",
    "location": "皖南",
    "caption": "",
    "featured": true,
    "order": 1
  }
}
```

| 字段 | 说明 |
| --- | --- |
| `title` | 作品标题。留空则网站不显示标题。 |
| `year` | 年份。留空时自动用照片 EXIF 里的拍摄年份。 |
| `location` | 拍摄地点。留空则不显示。 |
| `caption` | 一句说明，只在全屏浏览时低调出现。 |
| `featured` | **`true` = 出现在首页「精品集」**。这是叔叔的决定，程序不代劳。 |
| `order` | 手动排序，数字越小越靠前。`null` = 按拍摄时间自动排（新的在前）。 |

**没有的信息就留空，不要编造。** 网站会自动跳过空字段。

如果一张都没标 `featured`，首页会暂时用排在最前面的 5 张顶着，
并在导入时提示你去确认。首页最多显示 5 张，可在 `src/config/site.ts` 改 `FEATURED_LIMIT`。

改完 `photo-meta.json` 之后**再跑一次 `npm run import:photos`** 让改动生效。

---

## 六、怎么改网站上的文字

所有可改的文字集中在一个文件：**`src/config/site.ts`**

```ts
export const SITE = {
  photographerName: '王宇',              // 导航品牌名 + 首页刊头 + 网页标题
  photographerNameLatin: 'Yu Wang',      // 拼音 / 英文名，留空则不显示

  motto: '思',                           // 摄影理念那一个字
  mottoLatin: 'Think and feel the world',// 它的英文

  statement: '',                         // 80–150 字摄影陈述；留空时页面只呈现「思」
  aboutExtra: '',                        // 关于页面的补充段落
  email: '',                             // 留空则页脚不显示联系方式
  description: '...',                    // 分享到微信 / 搜索引擎时的说明
  ogImage: 'photos/share/og-cover.jpg',  // 分享预览图
  portrait: 'photos/portrait/portrait.jpg',
};

export const DAY_START = 7;   // 7:00–19:00 白天模式
export const DAY_END = 19;    // 其余时间夜晚模式
```

`motto` 与 `mottoLatin` 成对出现，像一方钤印 —— 首页封面、摄影陈述、关于页共用同一套排法。

**关于 `statement`**：现在是空的。留空时，「摄影陈述」一节只呈现居中的「思」和它的英文，
页面依然完整、甚至更安静。等王宇本人写好 80–150 字，填进去就会自动出现在「思」的下方。
**不要由他人代写。**

**换摄影师人像**：把照片存成 `public/photos/portrait/portrait.jpg`（建议竖构图，4:5 左右）。
**换分享预览图**：把一张代表作存成 `public/photos/share/og-cover.jpg`（建议 1200×630）。

---

## 七、怎么发布新版本

网站已经配好自动部署。流程是：

```
改代码 / 导入新照片
      ↓
git add / commit / push 到 main
      ↓
GitHub Actions 自动构建
      ↓
网站自动更新（大约 1–2 分钟）
```

具体命令：

```bash
npm run build          # 先本地确认能构建成功
git status             # 看看改了什么
git add -A
git commit -m "Add new photos from 精品集"
git push
```

然后到 GitHub 仓库的 **Actions** 标签页看绿色对勾。
不需要手动上传任何构建文件。

> 第一次推送前，仓库的 Settings → Pages → Source 需要选 **GitHub Actions**。

---

## 八、项目结构

```
photography-portfolio/
├── .github/workflows/deploy.yml   自动部署到 GitHub Pages
├── content/
│   ├── photo-meta.json            ★ 照片信息表（手工填写，唯一需要改的数据文件）
│   └── README.md                  这张表怎么填
├── public/
│   ├── favicon.svg                网站图标
│   ├── apple-touch-icon.png       iPhone 添加到主屏幕时的图标
│   └── photos/
│       ├── full/                  网站大图（脚本生成）
│       ├── thumbs/                缩略图（脚本生成）
│       ├── portrait/portrait.jpg  摄影师人像
│       └── share/og-cover.jpg     分享预览图
├── scripts/
│   ├── import-photos.mjs          ★ iCloud 精品集 → 网站照片
│   └── make-placeholders.mjs      占位图生成器
├── src/
│   ├── config/site.ts             ★ 姓名 / 理念 / 陈述 / 日夜时间，全站文字都在这里
│   ├── data/gallery.json          照片数据（自动生成，不要手改）
│   ├── lib/
│   │   ├── gallery.ts             照片读取 + masonry 分列算法
│   │   └── paths.ts               GitHub Pages 子路径处理
│   ├── layouts/BaseLayout.astro   HTML 骨架、SEO、分享预览、日夜初始判断
│   ├── components/
│   │   ├── SiteHeader.astro       导航
│   │   ├── ThemeToggle.astro      ☀︎ / ◐ 切换按钮
│   │   ├── HeroCover.astro        首页封面
│   │   ├── ArtistStatement.astro  摄影陈述
│   │   ├── FeaturedEditorial.astro 首页精品集（杂志式编排）
│   │   ├── MoreWorks.astro        更多作品预览带
│   │   ├── AboutTeaser.astro      首页的关于摄影师
│   │   ├── MasonryGallery.astro   完整照片墙
│   │   ├── PhotoFrame.astro       单张照片（保持原始比例）
│   │   ├── Lightbox.astro         全屏看图
│   │   └── SiteFooter.astro       页脚
│   ├── scripts/
│   │   ├── theme.ts               日 / 夜手动切换
│   │   ├── reveal.ts              滚动出场、图片淡入、导航吸顶
│   │   ├── lightbox.ts            全屏看图的键盘 / 滑动逻辑
│   │   └── masonry.ts             照片墙列数自适应
│   ├── pages/
│   │   ├── index.astro            首页
│   │   ├── gallery.astro          作品墙
│   │   ├── about.astro            关于
│   │   └── 404.astro              找不到页面
│   └── styles/global.css          配色、字体、排版、动画
├── DESIGN_PLAN.md                 设计方案与参考来源说明
└── README.md                      本文件
```

---

## 九、以后换成自己的域名

代码没有把地址写死成 `github.io`，换域名只要三步：

1. 在域名服务商把域名解析到 GitHub Pages
   （`A` 记录指向 `185.199.108–111.153`，或 `CNAME` 指向 `ys3508.github.io`）
2. 在项目里新建 **`public/CNAME`**，里面只写一行域名，例如：
   ```
   www 你的域名.com
   ```
   （实际写成 `www.example.com` 这样的一行，不要有空格）
3. GitHub 仓库 → Settings → Pages → Custom domain 填同一个域名，勾选 **Enforce HTTPS**

推送之后 `actions/configure-pages` 会自动把 `SITE_URL` 和 `SITE_BASE`
换成新域名和根路径 `/`，**不需要改任何代码**。

本地想按根路径预览，可以临时这样跑：

```bash
SITE_BASE=/ npm run dev
```

---

## 十、常见问题

**Q：叔叔往「精品集」放了照片，网站上没看到？**
A：需要在电脑上跑 `npm run import:photos`，再 `git push`。网站不会自动读 iCloud。

**Q：会不会不小心动到叔叔的原图？**
A：不会。导入脚本只有读取操作，全文没有任何删除 / 移动 / 改名 / 写入原目录的代码。
   高清原始文件也被 `.gitignore` 挡住，不会被传到 GitHub。

**Q：照片很多会不会很慢？**
A：所有照片都是 lazy load，照片墙先加载缩略图（长边 900px），
   只有点开全屏时才加载大图（长边 2200px）。几百张也没问题。

**Q：为什么用 WebP / AVIF？**
A：同样画质下体积小很多。iPhone Safari（14 以上）、Chrome、Edge、Firefox 全都支持。
   网站用 `<picture>` 写法：支持 AVIF 的用 AVIF，其余用 WebP。

**Q：线上图片 404 了？**
A：检查 GitHub 仓库名是不是还叫 `photography-portfolio`。
   改过仓库名的话，`actions/configure-pages` 会自动跟着变，但本地 `npm run dev`
   要用 `SITE_BASE=/新仓库名 npm run dev`，或者改 `astro.config.mjs` 里的默认值。

**Q：安全方面要注意什么？**
A：仓库里没有、也不要放任何 Token、密码、API key。
   `.gitignore` 已经挡掉 `.env*`（`.env.example` 模板除外）、`node_modules`、`.DS_Store` 等。
   GitHub Actions 用的是内置临时令牌，没有硬编码任何 secret。
