/**
 * 日 / 夜模式的手动切换。
 * 初始判断已经在 BaseLayout 的 inline script 里完成（避免首屏闪烁），
 * 时间分界只在 src/config/site.ts 定义一次。
 */
declare global {
  interface Window {
    __themeConfig?: {
      key: string;
      dayStart: number;
      dayEnd: number;
      byClock: () => 'day' | 'night';
    };
  }
}

const config = window.__themeConfig;
const root = document.documentElement;

function currentTheme(): 'day' | 'night' {
  return root.getAttribute('data-theme') === 'night' ? 'night' : 'day';
}

function paint(theme: 'day' | 'night') {
  root.setAttribute('data-theme', theme);
  document.querySelectorAll<HTMLElement>('[data-theme-icon]').forEach((el) => {
    el.textContent = theme === 'day' ? '☀︎' : '◐';
  });
  document
    .querySelectorAll<HTMLButtonElement>('[data-theme-toggle]')
    .forEach((btn) => btn.setAttribute('aria-pressed', theme === 'night' ? 'true' : 'false'));
}

paint(currentTheme());

document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const next = currentTheme() === 'day' ? 'night' : 'day';
    paint(next);
    try {
      if (config) localStorage.setItem(config.key, next);
    } catch {
      /* 隐私模式：记不住就算了，不影响使用 */
    }
  });
});

export {};
