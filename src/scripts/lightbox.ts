/**
 * 沉浸式全屏看图。
 * 键盘：← → ESC / Home End
 * 手机：左右滑动
 * 计数：12 / 47
 */
interface LightboxPhoto {
  src: string;
  thumb: string;
  w: number;
  h: number;
  title: string;
  year: string;
  location: string;
  caption: string;
}

const dataNode = document.getElementById('gallery-data');
const root = document.querySelector<HTMLElement>('[data-lightbox]');

if (dataNode && root) {
  const photos: LightboxPhoto[] = JSON.parse(dataNode.textContent || '[]');
  const image = root.querySelector<HTMLImageElement>('[data-lightbox-image]')!;
  const caption = root.querySelector<HTMLElement>('[data-lightbox-caption]')!;
  const counter = root.querySelector<HTMLElement>('[data-lightbox-counter]')!;
  const btnClose = root.querySelector<HTMLButtonElement>('[data-lightbox-close]')!;
  const btnPrev = root.querySelector<HTMLButtonElement>('[data-lightbox-prev]')!;
  const btnNext = root.querySelector<HTMLButtonElement>('[data-lightbox-next]')!;

  let index = -1;
  let lastFocused: HTMLElement | null = null;

  const preloaded = new Set<string>();
  function preload(i: number) {
    const p = photos[i];
    if (!p || preloaded.has(p.src)) return;
    preloaded.add(p.src);
    const img = new Image();
    img.src = p.src;
  }

  function show(i: number) {
    if (!photos.length) return;
    index = (i + photos.length) % photos.length;
    const p = photos[index];

    image.classList.remove('is-ready');
    image.width = p.w;
    image.height = p.h;
    image.alt =
      [p.title, p.location, p.year].filter(Boolean).join('，') || `摄影作品 第 ${index + 1} 张`;

    const next = new Image();
    next.onload = () => {
      image.src = p.src;
      image.classList.add('is-ready');
    };
    next.onerror = () => {
      image.src = p.thumb;
      image.classList.add('is-ready');
    };
    next.src = p.src;
    // 已经在缓存里时 onload 可能很快，先给个缩略图垫底
    if (!image.src) image.src = p.thumb;

    const bits = [p.title, p.location, p.year, p.caption].filter(Boolean);
    caption.innerHTML = bits.map((b) => `<span>${b}</span>`).join('');
    counter.textContent = `${index + 1} / ${photos.length}`;

    preload(index + 1);
    preload(index - 1 < 0 ? photos.length - 1 : index - 1);
  }

  function open(i: number) {
    lastFocused = document.activeElement as HTMLElement | null;
    root!.hidden = false;
    document.body.classList.add('is-locked');
    requestAnimationFrame(() => root!.classList.add('is-open'));
    show(i);
    btnClose.focus({ preventScroll: true });
  }

  function close() {
    root!.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    window.setTimeout(() => {
      root!.hidden = true;
      image.removeAttribute('src');
      image.classList.remove('is-ready');
    }, 380);
    lastFocused?.focus({ preventScroll: true });
  }

  /* ---------- 打开：事件委托，masonry 重排后依然有效 ---------- */
  document.addEventListener('click', (event) => {
    const trigger = (event.target as HTMLElement | null)?.closest<HTMLElement>(
      '[data-lightbox-open]',
    );
    if (!trigger) return;
    event.preventDefault();
    open(Number(trigger.dataset.index ?? 0));
  });

  btnClose.addEventListener('click', close);
  btnPrev.addEventListener('click', () => show(index - 1));
  btnNext.addEventListener('click', () => show(index + 1));

  // 点击照片以外的空白处关闭
  root.addEventListener('click', (event) => {
    if (event.target === root || (event.target as HTMLElement).classList.contains('stage')) {
      close();
    }
  });

  /* ---------- 键盘 ---------- */
  document.addEventListener('keydown', (event) => {
    if (root!.hidden) return;
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        close();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        show(index - 1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        show(index + 1);
        break;
      case 'Home':
        event.preventDefault();
        show(0);
        break;
      case 'End':
        event.preventDefault();
        show(photos.length - 1);
        break;
      case 'Tab':
        // 简单的焦点收束：全屏时只在关闭 / 左 / 右之间循环
        event.preventDefault();
        {
          const ring = [btnClose, btnPrev, btnNext].filter((b) => b.offsetParent !== null);
          const at = ring.indexOf(document.activeElement as HTMLButtonElement);
          const step = event.shiftKey ? -1 : 1;
          ring[(at + step + ring.length) % ring.length]?.focus();
        }
        break;
    }
  });

  /* ---------- 手机滑动 ---------- */
  let startX = 0;
  let startY = 0;
  let tracking = false;

  root.addEventListener(
    'touchstart',
    (event) => {
      if (event.touches.length !== 1) return;
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
      tracking = true;
    },
    { passive: true },
  );

  root.addEventListener(
    'touchend',
    (event) => {
      if (!tracking) return;
      tracking = false;
      const touch = event.changedTouches[0];
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.2) {
        // 向下大幅滑动 = 关闭，和系统相册的手感一致
        if (dy > 110 && Math.abs(dx) < 70) close();
        return;
      }
      show(dx < 0 ? index + 1 : index - 1);
    },
    { passive: true },
  );
}

export {};
