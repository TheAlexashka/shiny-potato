interface BrowPoint {
  x: number;
  y: number;
}

interface BrowSpine {
  at: (t: number) => BrowPoint;
  knots: number[];
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const smoothstep = (t: number) => t * t * (3 - 2 * t);
const xy = (p: BrowPoint) => `${p.x.toFixed(3)} ${p.y.toFixed(3)}`;

// Two joined curves keep the endpoints fixed and place the actual apex at peakAt.
export function createBrowSpine(
  start: BrowPoint,
  end: BrowPoint,
  peakY: number,
  peakAt: number,
  shape: 'round' | 'kink' | 'flat',
): BrowSpine {
  const peak = clamp(peakAt, 0.1, 0.9);
  const plateau = shape === 'flat' ? Math.min(0.12, peak * 0.45, (1 - peak) * 0.45) : 0;
  const riseEnd = peak - plateau;
  const fallStart = peak + plateau;

  return {
    knots: plateau ? [riseEnd, peak, fallStart] : [peak],
    at: (value) => {
      const t = clamp(value, 0, 1);
      let y = peakY;
      if (t < riseEnd) {
        const u = 1 - t / riseEnd;
        y += (start.y - peakY) * (shape === 'kink' ? u : u * u);
      } else if (t > fallStart) {
        const u = (t - fallStart) / (1 - fallStart);
        y += (end.y - peakY) * (shape === 'kink' ? u : u * u);
      }
      return { x: start.x + (end.x - start.x) * t, y };
    },
  };
}

export function browThicknessAt(t: number, thickness: number, taper: number, innerPercent: number, outerPercent: number): number {
  const u = clamp(t, 0, 1);
  const tail = clamp((u - 0.35) / 0.65, 0, 1);
  const innerWeight = 1 - smoothstep(clamp(u / 0.32, 0, 1));
  const outerWeight = smoothstep(tail);
  const inner = 1 + (clamp(innerPercent, 0, 200) / 100 - 1) * innerWeight;
  const outer = 1 + (clamp(outerPercent, 0, 200) / 100 - 1) * outerWeight;
  return Math.max(0, thickness) * (1 - (1 - clamp(taper, 0, 2)) * tail) * inner * outer;
}

// A filled ribbon tapers all the way to zero without thick stroke caps at its tips.
export function browOutline(spine: BrowSpine, widthAt: (t: number) => number, from = 0, to = 1): string {
  if (to <= from) return '';
  const steps = Math.max(2, Math.ceil((to - from) * 48));
  const times = [...new Set([
    ...Array.from({ length: steps + 1 }, (_, i) => from + (to - from) * i / steps),
    ...spine.knots.filter((t) => t > from && t < to),
  ])].sort((a, b) => a - b);

  const outline = times.map((t) => {
    const point = spine.at(t);
    const before = spine.at(t - 0.0005);
    const after = spine.at(t + 0.0005);
    const dx = after.x - before.x;
    const dy = after.y - before.y;
    const length = Math.hypot(dx, dy) || 1;
    const radius = Math.max(0, widthAt(t)) / 2;
    const nx = dy / length * radius;
    const ny = -dx / length * radius;
    return {
      upper: { x: point.x + nx, y: point.y + ny },
      lower: { x: point.x - nx, y: point.y - ny },
      radius,
    };
  });

  const first = outline[0];
  const last = outline[outline.length - 1];
  const cap = (radius: number, end: BrowPoint, round: boolean) => round && radius > 0.001
    ? `A${radius.toFixed(3)} ${radius.toFixed(3)} 0 0 1 ${xy(end)}`
    : `L${xy(end)}`;

  return [
    `M${xy(first.upper)}`,
    ...outline.slice(1).map((p) => `L${xy(p.upper)}`),
    cap(last.radius, last.lower, to === 1),
    ...outline.slice(0, -1).reverse().map((p) => `L${xy(p.lower)}`),
    cap(first.radius, first.upper, from === 0),
    'Z',
  ].join(' ');
}
