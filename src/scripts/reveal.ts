/**
 * 滚动出场 + 图片淡入 + 导航吸顶状态。
 * 全部尊重 prefers-reduced-motion。
 */
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- 图片加载后淡入 ---------- */
function markLoaded(img: HTMLImageElement) {
  img.dataset.loaded = 'true';
  img.style.opacity = '1';
}

function watchImages(scope: ParentNode = document) {
  scope.querySelectorAll<HTMLImageElement>('img[data-loaded="false"]').forEach((img) => {
    if (img.complete && img.naturalWidth > 0) {
      markLoaded(img);
    } else {
      img.addEventListener('load', () => markLoaded(img), { once: true });
      img.addEventListener('error', () => markLoaded(img), { once: true });
    }
  });
}
watchImages();

/* ---------- 滚动出场 ---------- */
const targets = document.querySelectorAll<HTMLElement>('.reveal, .clip-reveal');

if (reduced || !('IntersectionObserver' in window)) {
  targets.forEach((el) => el.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.06 },
  );
  targets.forEach((el) => {
    // 首屏已经在视口内的元素直接显示，避免刷新时闪一下
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) el.classList.add('is-visible');
    else observer.observe(el);
  });
}

/* ---------- 导航吸顶 ---------- */
const header = document.querySelector<HTMLElement>('[data-site-header]');
if (header) {
  const update = () => header.classList.toggle('is-stuck', window.scrollY > 24);
  update();
  window.addEventListener('scroll', update, { passive: true });
}

export { watchImages };
