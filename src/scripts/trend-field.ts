/**
 * Background animation: slow-moving price lines drifting across a faint chart grid.
 * Lightweight 2D canvas (no libraries), ~30 fps, paused when the tab is hidden,
 * and drawn as a single still frame when the user prefers reduced motion.
 */

type Line = {
  points: number[];
  drift: number;
  volatility: number;
  hue: "accent" | "up" | "down";
  width: number;
  alpha: number;
  offset: number;
};

const COLORS = {
  accent: [123, 108, 255],
  up: [43, 217, 160],
  down: [255, 92, 122],
  grid: [148, 160, 255],
} as const;

const STEP = 14; // px between points
const FPS = 30;

export function startTrendField(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let width = 0;
  let height = 0;
  let lines: Line[] = [];
  let frame = 0;
  let last = 0;
  let running = true;

  const rand = (min: number, max: number) => min + Math.random() * (max - min);

  function walk(start: number, count: number, drift: number, vol: number): number[] {
    const out = [start];
    for (let i = 1; i < count; i++) out.push(next(out[i - 1], drift, vol));
    return out;
  }

  function next(prev: number, drift: number, vol: number): number {
    let value = prev - drift + (Math.random() - 0.5) * vol;
    // Keep each line inside the canvas with a soft pull back to the middle.
    value += (height * 0.55 - value) * 0.004;
    return Math.min(height * 0.95, Math.max(height * 0.08, value));
  }

  function build() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.ceil(width / STEP) + 3;
    const specs: Pick<Line, "hue" | "width" | "alpha">[] = [
      { hue: "accent", width: 2.2, alpha: 0.65 },
      { hue: "up", width: 1.5, alpha: 0.42 },
      { hue: "down", width: 1.3, alpha: 0.34 },
      { hue: "accent", width: 1.1, alpha: 0.26 },
      { hue: "up", width: 1, alpha: 0.2 },
      { hue: "down", width: 1, alpha: 0.16 },
    ];
    lines = specs.map((s, i) => {
      const drift = rand(-0.35, 0.55);
      const volatility = rand(6, 16);
      return {
        ...s,
        drift,
        volatility,
        offset: 0,
        points: walk(height * (0.25 + i * 0.12), count, drift, volatility),
      };
    });
  }

  function rgba(c: readonly number[], a: number) {
    return `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${a})`;
  }

  function drawGrid() {
    ctx!.strokeStyle = rgba(COLORS.grid, 0.045);
    ctx!.lineWidth = 1;
    ctx!.beginPath();
    for (let x = 0.5; x < width; x += 72) {
      ctx!.moveTo(x, 0);
      ctx!.lineTo(x, height);
    }
    for (let y = 0.5; y < height; y += 72) {
      ctx!.moveTo(0, y);
      ctx!.lineTo(width, y);
    }
    ctx!.stroke();
  }

  function drawLine(line: Line) {
    const color = COLORS[line.hue];
    const { points } = line;
    const shift = line.offset;

    // Soft area under the main line.
    if (line.hue === "accent" && line.width >= 2) {
      const gradient = ctx!.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, rgba(color, 0.1));
      gradient.addColorStop(1, rgba(color, 0));
      ctx!.beginPath();
      ctx!.moveTo(-shift, height);
      points.forEach((y, i) => ctx!.lineTo(i * STEP - shift, y));
      ctx!.lineTo((points.length - 1) * STEP - shift, height);
      ctx!.closePath();
      ctx!.fillStyle = gradient;
      ctx!.fill();
    }

    ctx!.beginPath();
    points.forEach((y, i) => {
      const x = i * STEP - shift;
      if (i === 0) ctx!.moveTo(x, y);
      else ctx!.lineTo(x, y);
    });
    ctx!.strokeStyle = rgba(color, line.alpha);
    ctx!.lineWidth = line.width;
    ctx!.lineJoin = "round";
    ctx!.stroke();

    // Pulsing "last price" dot at the leading edge.
    const lastIndex = Math.min(points.length - 1, Math.floor((width + shift) / STEP));
    const x = lastIndex * STEP - shift;
    const y = points[lastIndex];
    if (line.width >= 1.4) {
      const pulse = 0.5 + 0.5 * Math.sin(frame / 9);
      ctx!.beginPath();
      ctx!.arc(x, y, 3 + pulse * 5, 0, Math.PI * 2);
      ctx!.fillStyle = rgba(color, 0.12 * (1 - pulse) + 0.05);
      ctx!.fill();
      ctx!.beginPath();
      ctx!.arc(x, y, 2.4, 0, Math.PI * 2);
      ctx!.fillStyle = rgba(color, Math.min(1, line.alpha + 0.35));
      ctx!.fill();
    }
  }

  function advance(line: Line) {
    line.offset += 0.6 + line.width * 0.15;
    while (line.offset >= STEP) {
      line.offset -= STEP;
      line.points.shift();
      line.points.push(next(line.points[line.points.length - 1], line.drift, line.volatility));
      // Occasionally flip the trend so lines don't all run off in one direction.
      if (Math.random() < 0.02) line.drift = -line.drift * rand(0.6, 1.2);
    }
  }

  function render() {
    ctx!.clearRect(0, 0, width, height);
    drawGrid();
    lines.forEach(drawLine);
  }

  function loop(time: number) {
    if (!running) return;
    requestAnimationFrame(loop);
    if (time - last < 1000 / FPS) return;
    last = time;
    frame += 1;
    lines.forEach(advance);
    render();
  }

  function start() {
    if (reduceMotion.matches) {
      running = false;
      render();
      return;
    }
    if (!running) {
      running = true;
      requestAnimationFrame(loop);
    }
  }

  build();
  render();
  requestAnimationFrame(loop);

  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      build();
      render();
    }, 200);
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) running = false;
    else start();
  });
  reduceMotion.addEventListener("change", start);
  if (reduceMotion.matches) {
    running = false;
  }
}
