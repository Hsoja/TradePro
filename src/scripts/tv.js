// Widgets oficiales de TradingView: tamaño en píxeles reales, carga diferida y re-render al cambiar el ancho
const reg = [];
const px = (v) => (typeof v === 'number' ? v + 'px' : '100%');

function render(it) {
  const { el, widget, cfg } = it;
  const c = { colorTheme: 'dark', locale: 'es', isTransparent: true, width: el.clientWidth || 600, height: el.clientHeight || 500, ...cfg };
  el.dataset.loaded = 1;
  el.innerHTML = `<div class="tradingview-widget-container__widget" style="width:${px(c.width)};height:${px(c.height)}"></div>`;
  const s = document.createElement('script');
  s.src = `https://s3.tradingview.com/external-embedding/embed-widget-${widget}.js`;
  s.async = true;
  s.innerHTML = JSON.stringify(c);
  el.appendChild(s);
}

export function tv(el, widget, cfg = {}, lazy = true) {
  if (typeof el === 'string') el = document.getElementById(el);
  if (!el || el.dataset.loaded) return;
  let it = reg.find((i) => i.el === el);
  if (!it) reg.push((it = { el, widget, cfg }));
  if (!lazy) return render(it);
  new IntersectionObserver((e, o) => { if (e[0].isIntersecting) { o.disconnect(); render(it); } }, { rootMargin: '300px' }).observe(el);
}

let lw = innerWidth, t;
addEventListener('resize', () => {
  clearTimeout(t);
  t = setTimeout(() => {
    if (Math.abs(innerWidth - lw) < 40) return;
    lw = innerWidth;
    reg.forEach((i) => {
      if (!i.el.dataset.loaded) return;
      if (i.el.getClientRects().length) render(i);
      else { delete i.el.dataset.loaded; i.el.innerHTML = ''; }
    });
  }, 500);
});
