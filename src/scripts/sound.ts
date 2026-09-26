/**
 * 背景音乐的开关逻辑。
 *
 * 原则：
 *   · 绝不自动播放。第一次进网站一定是安静的，访客点了才响。
 *   · 音量渐入渐出，不要「啪」一下出声。
 *   · 选择记在 localStorage；换一页时尝试接上，浏览器不允许自动播就安静地回到「关」，
 *     不弹任何提示 —— 访客再点一下就是了。
 */
const audio = document.querySelector<HTMLAudioElement>('[data-sound-el]');
const button = document.querySelector<HTMLButtonElement>('[data-sound-toggle]');

if (audio && button) {
  const KEY = 'portfolio-sound';
  const TIME_KEY = 'portfolio-sound-time';
  const label = button.querySelector<HTMLElement>('[data-sound-label]');

  const TARGET = Number(audio.dataset.volume ?? '') || 0.4;
  const FADE_MS = 1200;
  const STEP_MS = 50;

  let fadeTimer: number | undefined;

  function store(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* 隐私模式记不住，不影响使用 */
    }
  }

  function read(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function paint(on: boolean) {
    button!.setAttribute('aria-pressed', on ? 'true' : 'false');
    button!.setAttribute('aria-label', on ? '关闭背景音乐' : '播放背景音乐');
    if (label) label.textContent = on ? '关闭音乐' : '开启音乐';
  }

  function fadeTo(target: number, done?: () => void) {
    window.clearInterval(fadeTimer);
    const from = audio!.volume;
    const steps = Math.max(1, Math.round(FADE_MS / STEP_MS));
    let i = 0;
    fadeTimer = window.setInterval(() => {
      i += 1;
      const v = from + ((target - from) * i) / steps;
      audio!.volume = Math.min(1, Math.max(0, v));
      if (i >= steps) {
        window.clearInterval(fadeTimer);
        done?.();
      }
    }, STEP_MS);
  }

  async function start(fromGesture: boolean) {
    const at = Number(read(TIME_KEY) ?? '0');
    if (at > 0 && Number.isFinite(at) && at < audio!.duration + 1) {
      try {
        audio!.currentTime = at;
      } catch {
        /* 还没加载到那一段就算了，从头放 */
      }
    }
    audio!.volume = 0;
    try {
      await audio!.play();
      paint(true);
      store(KEY, 'on');
      fadeTo(TARGET);
    } catch {
      // 浏览器拦了自动播放 —— 安静地维持「关」，等访客自己点
      paint(false);
      if (fromGesture) store(KEY, 'off');
    }
  }

  function stop() {
    fadeTo(0, () => audio!.pause());
    paint(false);
    store(KEY, 'off');
  }

  button.addEventListener('click', () => {
    if (audio.paused) start(true);
    else stop();
  });

  // 记住播到哪儿了，换页能接上
  audio.addEventListener('timeupdate', () => {
    if (!audio.paused) store(TIME_KEY, String(Math.floor(audio.currentTime)));
  });

  // 上一页开着音乐，这一页试着接上；被拦就算了
  paint(false);
  if (read(KEY) === 'on') {
    audio.preload = 'auto';
    start(false);
  }
}

export {};
