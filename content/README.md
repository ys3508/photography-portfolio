# content/photo-meta.json —— 照片信息表

这个文件是**唯一**需要手工填写照片信息的地方。
`npm run import:photos` 会自动把新照片加进来（字段留空），并且**永远不会覆盖**你已经填好的内容。

```json
{
  "IMG_1234.JPG": {
    "title": "晨雾",
    "year": "2024",
    "location": "皖南",
    "caption": "",
    "featured": true,
    "category": "architecture",
    "order": 1
  }
}
```

| 字段 | 说明 |
| --- | --- |
| `title` | 作品标题。没有就留空字符串，网站不会显示。 |
| `year` | 年份。留空时自动使用照片 EXIF 里的拍摄年份。 |
| `location` | 拍摄地点。留空则不显示。 |
| `caption` | 一句说明，只在全屏浏览时低调出现。 |
| `featured` | 是否上首页。默认由文件夹决定（放在「网站照片」里就是 true），这里写了才覆盖。 |
| `category` | 分类。默认由「作品集」下的子文件夹名决定，这里写了才覆盖。 |
| `order` | 手动排序，数字越小越靠前。`null` 表示按拍摄时间自动排（新的在前）。 |

**不要编造信息。** 没有的字段就留空。
