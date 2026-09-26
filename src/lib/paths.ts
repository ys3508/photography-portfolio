/**
 * 统一处理 GitHub Pages 子路径。
 * 所有链接、图片、favicon 都必须经过 withBase()，
 * 否则部署到 https://用户名.github.io/photography-portfolio/ 之后会 404。
 */
const BASE = import.meta.env.BASE_URL; // 例如 "/photography-portfolio/" 或 "/"

export function withBase(path: string): string {
  if (!path) return BASE;
  if (/^(https?:)?\/\//.test(path) || path.startsWith('#') || path.startsWith('mailto:')) {
    return path;
  }
  const clean = path.replace(/^\/+/, '');
  const base = BASE.endsWith('/') ? BASE : `${BASE}/`;
  return `${base}${clean}`;
}
