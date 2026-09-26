/**
 * 照片墙列数自适应。
 * 构建时已经按 3 列排好；浏览器端只在列数需要改变时重新分配，
 * 使用和 src/lib/gallery.ts 完全相同的「最矮列优先」算法，保持策展顺序。
 */
const grid = document.querySelector<HTMLElement>('[data-masonry]');

if (grid) {
  const items = Array.from(grid.querySelectorAll<HTMLElement>('.masonry-item')).sort(
    (a, b) => Number(a.dataset.index) - Number(b.dataset.index),
  );

  let applied = Number(grid.dataset.defaultColumns || 3);

  function desiredColumns(): number {
    const w = window.innerWidth;
    if (w <= 640) return 1;
    if (w <= 1080) return 2;
    return 3;
  }

  function layout() {
    const want = desiredColumns();
    if (want === applied) return;

    const columns: HTMLElement[] = [];
    for (let i = 0; i < want; i += 1) {
      const col = document.createElement('div');
      col.className = 'masonry-col';
      columns.push(col);
    }

    const heights = new Array(want).fill(0);
    for (const item of items) {
      let shortest = 0;
      for (let i = 1; i < want; i += 1) {
        if (heights[i] < heights[shortest] - 0.001) shortest = i;
      }
      columns[shortest].appendChild(item);
      heights[shortest] += Number(item.dataset.ratio || 1) + 0.06;
    }

    grid!.replaceChildren(...columns);
    applied = want;
  }

  layout();

  let timer: number | undefined;
  window.addEventListener('resize', () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(layout, 160);
  });
}

export {};
