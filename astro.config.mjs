// @ts-check
import { defineConfig } from 'astro/config';

/**
 * base / site 全部走环境变量，方便以后切换到自定义域名。
 *
 *  GitHub Pages 项目站点（默认）
 *    SITE_URL  = https://ys3508.github.io
 *    SITE_BASE = /photography-portfolio
 *
 *  以后买了自己的域名
 *    SITE_URL  = https://你的域名.com
 *    SITE_BASE = /
 *
 * 注意：本地 dev 也使用同一个 base，这样本地看到的路径和线上完全一致，
 * 避免「本地正常、GitHub Pages 全部 404」的经典问题。
 */
const SITE_URL = process.env.SITE_URL ?? 'https://ys3508.github.io';
const SITE_BASE = process.env.SITE_BASE ?? '/photography-portfolio';

export default defineConfig({
  site: SITE_URL,
  base: SITE_BASE,
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
    assets: 'assets',
  },
  devToolbar: { enabled: false },
});
