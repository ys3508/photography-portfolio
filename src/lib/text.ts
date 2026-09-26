/**
 * 把 **两个星号** 包起来的词渲染成朱红强调。
 * 内容来自 src/config/site.ts（我们自己写的），不是用户输入；
 * 即便如此也先做 HTML 转义，避免以后有人往里贴带尖括号的文字。
 */
const ESCAPE: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function renderEmphasis(text: string): string {
  const safe = text.replace(/[&<>"']/g, (c) => ESCAPE[c]);
  return safe.replace(/\*\*(.+?)\*\*/g, '<em class="mark">$1</em>');
}
