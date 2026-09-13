export function organicPatch(cx: number, cy: number, rx: number, ry: number, seed: number) {
  const points = Array.from({ length: 20 }, (_, i) => {
    const a = i / 20 * Math.PI * 2;
    const r = 0.84 + Math.sin(i * 1.72 + seed) * 0.1 + Math.cos(i * 2.31 + seed * 1.8) * 0.08;
    return { x: cx + Math.cos(a) * rx * r, y: cy + Math.sin(a) * ry * r };
  });
  const last = points[points.length - 1];
  let d = `M${(last.x + points[0].x) / 2} ${(last.y + points[0].y) / 2}`;
  points.forEach((p, i) => {
    const next = points[(i + 1) % points.length];
    d += `Q${p.x} ${p.y} ${(p.x + next.x) / 2} ${(p.y + next.y) / 2}`;
  });
  return d + 'Z';
}
