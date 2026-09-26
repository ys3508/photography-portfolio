# 王宇 摄影作品集

**观 · Think and feel the world**

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

网站有**中英文两个版本**，内容同一套组件渲染，右上角 `EN / 中` 一键切换。

| 页面 | 中文 | English | 内容 |
| --- | --- | --- | --- |
| 首页 | `/` | `/en/` | 封面（姓名 + 一张代表作品 + 那方印）→ 精品集 → 更多作品 → 关于摄影师 |
| 作品 | `/gallery` | `/en/gallery` | 完整摄影作品墙，masonry 排列，带分类标签 |
| 分类 | `/gallery/建筑` | `/en/gallery/architecture` | 按分类筛选后的作品墙 |
| 详情 | `/works/…` | `/en/works/…` | 单张作品的详情页，可上一张 / 下一张翻看 |
| 关于 | `/about` | `/en/about` | 摄影师介绍 |

**首页与作品墙不重复**：放在「网站照片」里的上首页，放在「作品集」里的上作品墙，两边是不相交的两组。

语言由 URL 决定（路径里有 `/en` 就是英文版），组件自己判断，不需要层层传参。
所有界面文字集中在 **`src/lib/i18n.ts`** 的 `DICT` 里；
关于摄影师的正文在 `src/config/site.ts` 的 `STATEMENT` / `STATEMENT_EN`。
加语言就是在 `DICT` 里加一份、在 `src/pages/` 下再建一个目录。

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
| `npm run placeholders` | 重新生成占位图（还没有真照片时用） |
| `npm run texture` | 重新生成背景大理石底纹 + 声音按钮那只眼睛 |

---

## 三、叔叔怎么放照片

iCloud 云盘里的文件夹是这样的：

```
iCloud 云盘 / 叔叔摄影作品集 /
├── 网站照片          ← ★ 首页展示：第一张进封面，其余进「精品集」那一节
└── 作品集            ← ★ 完整作品墙 /gallery
    ├── 人文
    ├── 街头
    ├── 自然
    ├── 建筑
    ├── 边缘群体
    ├── 艺术
    └── 日常生活
```

### 文件夹就是分类

**把照片拖进「建筑」，它就是建筑。** 不用改任何文件、不用写任何配置。

- 「作品集」根目录下的照片也会上作品墙，只是没有分类，只出现在「全部」里。
- **空的分类不会显示标签** —— 等那一类有了照片，标签自己会出现。
- 分类只认文件夹。想单独调某一张，在 `content/photo-meta.json` 里写 `category` 覆盖即可。

**首页和作品墙的照片是两组，互不重复**：上了首页的不会再出现在作品墙上。
同一张照片两边都放了也没关系 —— 脚本按**文件内容**去重，复制一份、改个名都骗不过去。

哪些照片上网站、上首页、归哪一类，全由王宇本人决定，程序不会替他挑，也不会用 AI 自动分类。

本机上的实际路径：

```
/Users/sissi/Library/Mobile Documents/com~apple~CloudDocs/叔叔摄影作品集/
```

> 要改读哪些文件夹、或增减分类：`scripts/import-photos.mjs` 顶部的 `SOURCES` 与
> `FOLDER_CATEGORY`，以及 `src/config/categories.ts`。

## 四、我怎么把照片导入网站

叔叔往「精品集」里放了新照片之后，在电脑上跑一条命令：

```bash
npm run import:photos
```

这条命令做的事：

```
iCloud 精品集（原图，只读）
     ↓ 读取
public/photos/full/*.webp     网站大图   长边最多 2400px（原图更小就原样保留）
public/photos/thumbs/*.webp   缩略图     长边最多 1200px（同上）
public/photos/thumbs/*.avif   缩略图     体积更小，现代浏览器优先用
     ↓
src/data/gallery.json         网站读取的照片数据（自动生成，不用手改）
content/photo-meta.json       照片信息表（会新增条目，已填的内容不会被覆盖）
```

### 安全闸：来源突然变少时会停下

iCloud 还没同步完、文件夹被临时清空、或者有人正在整理目录的时候，
来源会「看起来」突然少掉一大批。这时候脚本**不会**顺手把网站上的照片删掉 ——
少了三成以上就停下，什么都不改：

```
✗ 停下了：来源照片数从 27 张掉到 6 张。
  本次没有改动任何东西 —— 网站上现有的照片原样保留。
```

确认来源确实就是这么多，再加参数重跑：

```bash
npm run import:photos -- --allow-shrink
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
| `featured` | 是否上首页。**默认由文件夹决定**（放在「网站照片」里就是 `true`），这里写了才覆盖。 |
| `category` | 分类。**默认由子文件夹决定**，这里写了才覆盖。取值见 `src/config/categories.ts` 的 slug。 |
| `order` | 手动排序，数字越小越靠前。`null` = 按拍摄时间自动排（新的在前）。 |

**没有的信息就留空，不要编造。** 网站会自动跳过空字段。

**封面用第 1 张，「精品集」那一节用其余的** —— 同一张照片不会在首页出现两次。
想换封面那张，就在 `photo-meta.json` 里把它的 `order` 设成 `1`。
（封面的图版是限高的，横构图在那里才撑得开。）

改完 `photo-meta.json` 之后**再跑一次 `npm run import:photos`** 让改动生效。

---

## 六、怎么改网站上的文字

所有可改的文字集中在一个文件：**`src/config/site.ts`**

```ts
export const SITE = {
  photographerName: '王宇',              // 导航品牌名 + 首页刊头 + 网页标题
  photographerNameLatin: 'Yu Wang',      // 拼音 / 英文名

  motto: '观',                           // 摄影理念那一个字
  mottoLatin: 'Think and feel the world',
  creed: '观看，是为了看见自己',           // 封面「观」下面那一句
  creedLatin: 'To observe is to encounter oneself.',

  email: '',                             // 留空则页脚不显示联系方式
  description: '...',                    // 分享到微信 / 搜索引擎时的说明
  ogImage: 'photos/share/og-cover.jpg',
  portrait: 'photos/portrait/portrait.jpg',
};

export const DAY_START = 7;   // 7:00–19:00 白天模式
export const DAY_END = 19;    // 其余时间夜晚模式
```

`motto` / `mottoLatin` / `creed` / `creedLatin` 成对出现，像一方钤印 —— 首页封面用全套，
关于页只用前一对。

### 改「关于摄影师」的文字

同一个文件里的 `STATEMENT`：

```ts
export const STATEMENT = {
  lead: '王宇，观念摄影师、视觉哲思者。',   // 一句话身份
  opening: '对他而言，摄影不仅是记录…',     // 开头一段
  creed: '观看，是为了看见自己。',          // 单独拎出来的那一句，朱红
  body: ['他行走于…', '他的创作围绕…', '他的影像…'],  // 其余段落
};
```

正文里用 **两个星号** 包起来的词会以朱红强调。想换强调哪几个词，
只要挪动星号的位置，不用碰任何组件。

这段文字在**首页「关于摄影师」一节**和 **/about 页面**共用，只写一次。

### 背景音乐

右下角那只**石膏像的眼睛**就是开关。规矩：

- **绝不自动播放。** 第一次进网站一定是安静的，访客点了才响。
- 音频 `preload="none"`，**不点就一个字节都不下载**（这首 3.9 MB）。
- 音量渐入渐出，不会「啪」一下出声；默认音量 0.4。
- 开 / 关记在 `localStorage`，换页时尝试接着放（连播到第几秒都记着）；
  浏览器不允许自动播就安静地回到「关」，不弹任何提示。
- 全屏看图时按钮自动藏起来（层级 70 < Lightbox 120）。

**换一首**：把 mp3 放进 `public/audio/`，改 `src/config/site.ts` 里的 `audio` 路径。
**不要音乐**：把 `audio` 改成空字符串 `''`，按钮会整个消失。
音量改 `audioVolume`。

> ⚠️ **版权**：网站是公开的，放上去的音乐等于对外发布。
> 现在这首是商业卡拉 OK 伴奏带（Louis Armstrong《We Have All the Time in the World》，
> 词曲 John Barry / Hal David）。用之前请确认授权，或换成可商用授权的曲子。

### 换背景底纹 / 改朱红

**底纹**（首页封面、摄影陈述、关于页背后那层若隐若现的石膏像）：
把新的图片放到 `design-source/greek_statues.jpg`，跑 `npm run texture` 即可。
浓淡在 `src/styles/global.css` 里改 `--marble-opacity`（白天 0.17 / 夜晚 0.16）。
位置在 `src/components/MarbleGround.astro` 里改。

**背景的朱染**（整页从左到右渐变、右缘最深）：`global.css` 顶部的 `--wash`。
每一档都是手调的不透明色 —— 不要改成「深红 + 透明度」的写法，
那样中段会变成灰粉，整个网站会立刻显得廉价。
窄屏另有一套（860px 以下），在文件末尾。

**朱红**：同样在 `global.css` 顶部，`--accent`。
白天 `#480818`，夜晚 `#ca4954`（夜晚必须提亮，原色在黑底上看不见）。
改一处，全站的「观」、细线、下划线、选中底色、焦点环会一起变。

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
A：所有照片都是 lazy load，照片墙先加载缩略图，只有点开全屏时才加载大图。几百张也没问题。
   **脚本只缩小、永不放大**：原图本来就小于上限时，网站版本保持原分辨率，不做任何插值。

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
