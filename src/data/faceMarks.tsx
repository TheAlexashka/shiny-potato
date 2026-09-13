import type { ReactNode } from 'react';

export interface FaceMarkOption {
  id: string;
  name: string;
  group: 'scar' | 'wound' | 'congenital' | 'disease';
  art: (p: { skin: string; scarTone?: string }) => ReactNode;
}

export interface ScarTone {
  id: string;
  name: string;
  swatch: string;
}

export const SCAR_TONES: ScarTone[] = [
  { id: 'auto', name: 'Под кожу', swatch: '#c48b80' },
  { id: 'fresh', name: 'Свежий', swatch: '#d4766a' },
  { id: 'mature', name: 'Зрелый', swatch: '#d9b6a8' },
  { id: 'hyper', name: 'Тёмный', swatch: '#5c3626' },
  { id: 'hypo', name: 'Светлый', swatch: '#e0cfbe' },
  { id: 'keloid', name: 'Келоид', swatch: '#8a5246' },
];

export const DEFAULT_SCAR_TONE = 'auto';

const SCAR_FIXED: Record<string, { light: string; mid: string; deep: string; stitch: string; keloid: string; gloss: string }> = {
  fresh: { light: '#f0c2b2', mid: '#d4766a', deep: '#96443c', stitch: '#5f2a26', keloid: '#cf8f80', gloss: '#fff0e8' },
  mature: { light: '#f2e2d4', mid: '#d9b6a8', deep: '#a8827a', stitch: '#7a5a50', keloid: '#d0a894', gloss: '#fff8f2' },
  hyper: { light: '#8a5a44', mid: '#5c3626', deep: '#2e1a14', stitch: '#241410', keloid: '#7a4a38', gloss: '#e8d0c0' },
  hypo: { light: '#f6ece2', mid: '#e0cfbe', deep: '#b39884', stitch: '#8a745f', keloid: '#e8d6c4', gloss: '#fffaf4' },
  keloid: { light: '#b57e6a', mid: '#7d453a', deep: '#45201c', stitch: '#3a1e1a', keloid: '#96543f', gloss: '#f6e0d4' },
};

const pal = (skin: string, tone = 'auto') => {
  const base = {
    light: `color-mix(in srgb, ${skin} 62%, #f6e3d8)`,
    mid: `color-mix(in srgb, ${skin} 55%, #8d5a4e)`,
    deep: `color-mix(in srgb, ${skin} 40%, #4a2a24)`,
    stitch: `color-mix(in srgb, ${skin} 30%, #3a2420)`,
    flesh: `color-mix(in srgb, ${skin} 30%, #b8443e)`,
    fleshDark: `color-mix(in srgb, ${skin} 22%, #5a1a18)`,
    keloid: `color-mix(in srgb, ${skin} 48%, #a86e60)`,
    gloss: `color-mix(in srgb, ${skin} 40%, #fff8f0)`,
    pigment: `color-mix(in srgb, ${skin} 55%, #5a3a26)`,
    pale: `color-mix(in srgb, ${skin} 50%, #f3e6da)`,
    red: `color-mix(in srgb, ${skin} 35%, #c0413c)`,
    redDeep: `color-mix(in srgb, ${skin} 28%, #7a1f22)`,
    yellow: `color-mix(in srgb, ${skin} 45%, #e0c26a)`,
    purple: `color-mix(in srgb, ${skin} 40%, #6e3a6a)`,
    blueish: `color-mix(in srgb, ${skin} 55%, #6a6f8a)`,
  };
  const f = tone && tone !== 'auto' ? SCAR_FIXED[tone] : undefined;
  if (!f) return base;
  const mx = (c: string, pct = 16) => `color-mix(in srgb, ${skin} ${pct}%, ${c})`;
  return { ...base, light: mx(f.light), mid: mx(f.mid), deep: mx(f.deep), stitch: mx(f.stitch, 10), keloid: mx(f.keloid), gloss: f.gloss };
};

const tooth = '#f1ead9';
const toothShade = '#c9bda6';

const scarLine = (d: string, skin: string, w = 1.4, scarTone = 'auto', key?: string) => {
  const p = pal(skin, scarTone);
  return (
    <g key={key} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={p.light} strokeWidth={w + 1.6} opacity={0.5} />
      <path d={d} stroke={p.mid} strokeWidth={w} opacity={0.9} />
      <path d={d} stroke={p.deep} strokeWidth={w * 0.4} opacity={0.75} />
      <path d={d} stroke={p.gloss} strokeWidth={0.35} opacity={0.5} transform="translate(0 -0.45)" />
    </g>
  );
};

const stitches = (points: [number, number, number][], skin: string, scarTone = 'auto', key?: string) => (
  <g key={key} stroke={pal(skin, scarTone).stitch} strokeWidth={0.55} opacity={0.8} strokeLinecap="round">
    {points.map(([x, y, a], i) => (
      <path key={i} d={`M${x} ${y} l0 3`} transform={`rotate(${a} ${x} ${y}) translate(0 -1.5)`} />
    ))}
  </g>
);

const patch = (cx: number, cy: number, rx: number, ry: number, seed: number, fill: string, opacity = 0.6) => {
  const n = 16;
  let d = '';
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const wob = 0.78 + 0.28 * Math.abs(Math.sin(i * 1.9 + seed) * 0.6 + Math.cos(i * 2.7 + seed * 1.3) * 0.4);
    const x = cx + Math.cos(a) * rx * wob;
    const y = cy + Math.sin(a) * ry * wob;
    d += i === 0 ? `M${x} ${y}` : ` L${x} ${y}`;
  }
  return <path d={d + 'Z'} fill={fill} opacity={opacity} />;
};

const scatter = (cx: number, cy: number, rx: number, ry: number, count: number, seed: number) => {
  let s = (seed * 9301 + 49297) % 233280;
  const nx = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  return Array.from({ length: count }, () => {
    const a = nx() * Math.PI * 2;
    const r = Math.sqrt(nx());
    return { x: cx + Math.cos(a) * rx * r, y: cy + Math.sin(a) * ry * r, k: nx() };
  });
};

export const FACE_MARKS: FaceMarkOption[] = [
  { id: 'scar-brow', name: 'Шрам через бровь', group: 'scar', art: ({ skin, scarTone }) => <g>{scarLine('M131 58 L136 71', skin, 1.3, scarTone)}</g> },
  { id: 'scar-cheek-diag', name: 'Косой шрам на щеке', group: 'scar', art: ({ skin, scarTone }) => <g>{scarLine('M170 82 L182 104', skin, 1.5, scarTone)}</g> },
  { id: 'scar-chin', name: 'Шрам на подбородке', group: 'scar', art: ({ skin, scarTone }) => <g>{scarLine('M144 116 Q150 119 157 115', skin, 1.2, scarTone)}</g> },
  { id: 'scar-lip', name: 'Шрам через губу', group: 'scar', art: ({ skin, scarTone }) => <g>{scarLine('M144 96 L142 108', skin, 1.1, scarTone)}</g> },
  { id: 'scar-nose', name: 'Шрам на переносице', group: 'scar', art: ({ skin, scarTone }) => <g>{scarLine('M145 74 L155 80', skin, 1.1, scarTone)}</g> },
  { id: 'scar-forehead', name: 'Рубец на лбу', group: 'scar', art: ({ skin, scarTone }) => <g>{scarLine('M138 46 Q150 42 164 50', skin, 1.6, scarTone)}</g> },
  { id: 'scar-forehead-vert', name: 'Вертикальный шрам на лбу', group: 'scar', art: ({ skin, scarTone }) => <g>{scarLine('M150 38 L150 56', skin, 1.3, scarTone)}</g> },
  { id: 'scar-forehead-diag', name: 'Косой шрам на лбу', group: 'scar', art: ({ skin, scarTone }) => <g>{scarLine('M136 42 L158 54', skin, 1.4, scarTone)}</g> },
  { id: 'scar-forehead-stitched', name: 'Зашитый шрам на лбу', group: 'scar',
    art: ({ skin, scarTone }) => <g>{scarLine('M140 40 L160 52', skin, 1.4, scarTone)}{stitches([[144, 42, 55], [148, 44.5, 60], [152, 47, 60], [156, 49.5, 65]], skin, scarTone)}</g> },
  { id: 'scar-forehead-double', name: 'Двойной рубец на лбу', group: 'scar',
    art: ({ skin, scarTone }) => <g>{scarLine('M136 48 Q150 44 164 48', skin, 1.2, scarTone)}{scarLine('M138 54 Q150 50 162 54', skin, 1.1, scarTone)}</g> },
  { id: 'scar-stitched', name: 'Зашитый шрам', group: 'scar',
    art: ({ skin, scarTone }) => <g>{scarLine('M122 92 Q128 100 126 110', skin, 1.4, scarTone)}{stitches([[123.5, 94, 60], [125.5, 98, 70], [126.8, 102, 80], [126.5, 106, 95]], skin, scarTone)}</g> },
  { id: 'scar-dueling', name: 'Дуэльный шрам (Schmiss)', group: 'scar', art: ({ skin, scarTone }) => <g>{scarLine('M168 86 C176 92 178 100 172 112', skin, 1.8, scarTone)}</g> },
  { id: 'scar-keloid', name: 'Келоидный рубец', group: 'scar',
    art: ({ skin, scarTone }) => { const p = pal(skin, scarTone); return <g><path d="M124 88 Q130 98 128 110" stroke={p.keloid} strokeWidth={3.6} fill="none" strokeLinecap="round" opacity={0.85} /><path d="M124 88 Q130 98 128 110" stroke={p.deep} strokeWidth={0.6} fill="none" strokeLinecap="round" opacity={0.55} transform="translate(1.2 0)" /><path d="M124 88 Q130 98 128 110" stroke={p.gloss} strokeWidth={0.7} fill="none" strokeLinecap="round" opacity={0.45} transform="translate(-0.9 0)" /></g>; } },
  { id: 'scar-burn', name: 'Ожоговый рубец', group: 'scar',
    art: ({ skin, scarTone }) => { const p = pal(skin, scarTone); return <g>{patch(126, 96, 12, 14, 3, p.mid, 0.5)}{patch(124, 98, 9, 11, 7, p.keloid, 0.5)}{patch(122, 101, 5, 7, 11, p.light, 0.5)}<g stroke={p.deep} strokeWidth={0.4} opacity={0.45} fill="none"><path d="M118 90 q4 3 2 8 M122 88 q5 4 4 10 M128 92 q3 5 0 9" /></g></g>; } },
  { id: 'scar-pox', name: 'Оспины', group: 'scar',
    art: ({ skin, scarTone }) => { const p = pal(skin, scarTone); return <g>{[[126, 86], [131, 94], [124, 100], [136, 99], [168, 84], [174, 92], [176, 101], [166, 98], [150, 66], [158, 60], [143, 112]].map(([x, y], i) => <g key={i}><circle cx={x} cy={y} r={1.1 + (i % 3) * 0.25} fill={p.mid} opacity={0.55} /><circle cx={x - 0.3} cy={y - 0.3} r={0.6 + (i % 3) * 0.2} fill={p.deep} opacity={0.6} /></g>)}</g>; } },
  { id: 'wound-cheek-teeth', name: 'Рана щеки (видны зубы)', group: 'wound',
    art: ({ skin, scarTone }) => { const p = pal(skin, scarTone); return <g>{patch(170, 103, 9, 8, 5, p.mid, 0.7)}{patch(170.5, 103, 6.5, 5.6, 9, p.fleshDark, 0.95)}{patch(170, 103.5, 5.2, 4.4, 13, p.flesh, 0.7)}<g><rect x={165.6} y={100.6} width={2.4} height={3.2} rx={0.6} fill={tooth} /><rect x={168.3} y={100.3} width={2.4} height={3.6} rx={0.6} fill={tooth} /><rect x={171} y={100.6} width={2.3} height={3.2} rx={0.6} fill={tooth} /><rect x={173.5} y={101} width={1.8} height={2.6} rx={0.5} fill={tooth} opacity={0.9} /><path d="M165.6 103.8 L175.3 103.6" stroke={toothShade} strokeWidth={0.35} /><path d="M168.3 100.3 v3.6 M171 100.6 v3.2 M173.5 101 v2.6" stroke={toothShade} strokeWidth={0.3} /></g><g fill="none" stroke={p.deep} strokeWidth={0.55} opacity={0.6} strokeLinecap="round"><path d="M162 98 q-3 -2 -5 -4 M163 108 q-3 2 -5 5 M178 97 q2 -3 4 -5 M179 108 q2 3 3 6" /></g><path d="M163 95.5 Q170 92.5 177 95.5" stroke={p.gloss} strokeWidth={0.5} fill="none" opacity={0.4} /></g>; } },
  { id: 'wound-shrapnel', name: 'Осколочные шрамы', group: 'wound',
    art: ({ skin, scarTone }) => { const p = pal(skin, scarTone); return <g>{[[128, 62, 2.2, 1.6, 1], [136, 74, 1.6, 1.4, 4], [123, 84, 2.6, 2, 7], [132, 96, 1.4, 1.2, 9], [126, 106, 2, 1.7, 12], [141, 58, 1.2, 1, 15]].map(([x, y, rx, ry, s], i) => <g key={i}>{patch(x, y, rx + 1.2, ry + 1, s, p.light, 0.5)}{patch(x, y, rx, ry, s + 2, p.mid, 0.8)}{patch(x + 0.2, y + 0.2, rx * 0.5, ry * 0.5, s + 4, p.deep, 0.7)}</g>)}</g>; } },
  { id: 'wound-jaw', name: 'Раздробленная челюсть', group: 'wound',
    art: ({ skin, scarTone }) => { const p = pal(skin, scarTone); return <g>{patch(160, 112, 14, 7, 6, p.mid, 0.55)}{patch(160, 113, 11, 5, 10, p.keloid, 0.55)}{scarLine('M147 110 Q160 118 173 108', skin, 1.6, scarTone)}{stitches([[150, 112, 70], [155, 115, 80], [160, 116.5, 90], [165, 115.5, 100], [170, 112, 110]], skin, scarTone)}<path d="M150 118 Q160 123 171 116" stroke={p.deep} strokeWidth={0.7} fill="none" opacity={0.45} /></g>; } },
  { id: 'wound-eye-scar', name: 'Шрам через глаз', group: 'wound',
    art: ({ skin, scarTone }) => <g>{scarLine('M128 62 C132 72 135 80 134 92', skin, 1.5, scarTone)}<path d="M126 74 Q134 70 142 75" stroke={pal(skin, scarTone).light} strokeWidth={1} fill="none" opacity={0.5} /></g> },
  { id: 'wound-gas-burn', name: 'Ожоги от газа', group: 'wound',
    art: ({ skin, scarTone }) => { const p = pal(skin, scarTone); return <g>{patch(150, 100, 26, 13, 2, p.keloid, 0.35)}{patch(140, 104, 12, 9, 8, p.mid, 0.4)}{patch(162, 102, 11, 8, 14, p.mid, 0.4)}<g fill={p.light} opacity={0.5}>{[[132, 98], [138, 106], [146, 110], [156, 111], [164, 106], [171, 99]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={1.6} ry={1.1} />)}</g></g>; } },
  { id: 'wound-nose-tip', name: 'Утраченный кончик носа', group: 'wound',
    art: ({ skin, scarTone }) => { const p = pal(skin, scarTone); return <g>{patch(150, 94, 6, 4, 4, p.mid, 0.75)}{patch(150, 94.5, 4.4, 2.8, 9, p.keloid, 0.7)}<path d="M146 93 Q150 91 154 93" stroke={p.deep} strokeWidth={0.6} fill="none" opacity={0.6} /></g>; } },
  { id: 'wound-temple', name: 'Пулевой рубец у виска', group: 'wound',
    art: ({ skin, scarTone }) => { const p = pal(skin, scarTone); return <g>{patch(122, 66, 3.6, 3.6, 3, p.light, 0.6)}{patch(122, 66, 2.4, 2.4, 6, p.mid, 0.85)}{patch(122.2, 66.2, 1.1, 1.1, 8, p.deep, 0.8)}{scarLine('M124 68 L131 74', skin, 0.9, scarTone)}</g>; } },
  { id: 'wound-ear-missing', name: 'Повреждённое ухо', group: 'wound',
    art: ({ skin, scarTone }) => { const p = pal(skin, scarTone); return <g>{patch(185, 79, 4.5, 8, 5, p.mid, 0.6)}{patch(185, 80, 3, 5.5, 9, p.keloid, 0.6)}<path d="M182 74 Q186 78 183 86" stroke={p.deep} strokeWidth={0.7} fill="none" opacity={0.55} /></g>; } },
  { id: 'cleft-lip', name: 'Заячья губа', group: 'congenital',
    art: ({ skin, scarTone }) => { const p = pal(skin, scarTone); return <g><path d="M146.5 96 L145.2 103.4 L148.4 103.6 L147.6 96.4 Z" fill={skin} /><path d="M146.5 96 L145.2 103.4" stroke={p.mid} strokeWidth={0.8} fill="none" strokeLinecap="round" /><path d="M147.6 96.4 L148.4 103.6" stroke={p.light} strokeWidth={0.6} fill="none" opacity={0.7} /><path d="M143 103.2 Q145 100.5 146.4 102.6" stroke={p.flesh} strokeWidth={0.9} fill="none" opacity={0.6} /><path d="M145.5 94.5 q-1.6 0.8 -1.2 2.4" stroke={p.deep} strokeWidth={0.5} fill="none" opacity={0.5} /></g>; } },
  { id: 'cleft-repaired', name: 'Ушитая заячья губа', group: 'congenital',
    art: ({ skin, scarTone }) => <g>{scarLine('M146.8 95 L145.6 103.2', skin, 1, scarTone)}<path d="M143.5 103 Q145.5 101 147.5 103" stroke={pal(skin, scarTone).light} strokeWidth={0.8} fill="none" opacity={0.6} /></g> },
  { id: 'port-wine', name: 'Винное пятно', group: 'congenital',
    art: ({ skin, scarTone }) => { const p = pal(skin, scarTone); return <g>{patch(168, 84, 16, 20, 4, p.redDeep, 0.45)}{patch(170, 88, 12, 15, 9, p.purple, 0.35)}{patch(166, 80, 7, 8, 13, p.red, 0.3)}</g>; } },
  { id: 'birthmark-cafe', name: 'Пятно кофе с молоком', group: 'congenital',
    art: ({ skin, scarTone }) => { const p = pal(skin, scarTone); return <g>{patch(128, 92, 7, 5, 6, p.pigment, 0.55)}{patch(127, 92, 5, 3.6, 10, p.deep, 0.35)}</g>; } },
  { id: 'hemangioma', name: 'Красная родинка', group: 'congenital',
    art: ({ skin, scarTone }) => <g><circle cx={137} cy={68} r={1.9} fill={pal(skin, scarTone).red} opacity={0.9} /><circle cx={136.6} cy={67.5} r={0.7} fill="#ff9c9c" opacity={0.55} /></g> },
  { id: 'dimple-chin-cleft', name: 'Ямочка на подбородке', group: 'congenital',
    art: ({ skin, scarTone }) => <g><ellipse cx={150} cy={117.5} rx={1.6} ry={2.8} fill={`color-mix(in srgb, ${skin} 55%, #6b3f2c)`} opacity={0.6} /><path d="M149.3 115.5 q0.7 -0.8 1.4 0" stroke={pal(skin, scarTone).gloss} strokeWidth={0.4} fill="none" opacity={0.5} /></g> },
  { id: 'ptosis-left', name: 'Птоз левого века', group: 'congenital', art: () => null },
  { id: 'ptosis-right', name: 'Птоз правого века', group: 'congenital', art: () => null },
  { id: 'dis-acne', name: 'Акне', group: 'disease',
    art: ({ skin, scarTone }) => { const p = pal(skin, scarTone); const pts = [...scatter(150, 56, 20, 9, 9, 3), ...scatter(128, 92, 10, 14, 8, 11), ...scatter(172, 92, 10, 14, 8, 17), ...scatter(150, 112, 9, 6, 5, 23)]; return <g>{pts.map((q, i) => <g key={i}><circle cx={q.x} cy={q.y} r={1 + q.k * 0.9} fill={p.red} opacity={0.55} />{q.k > 0.6 && <circle cx={q.x - 0.2} cy={q.y - 0.2} r={0.45} fill={p.yellow} opacity={0.7} />}</g>)}</g>; } },
  { id: 'dis-acne-scars', name: 'Постакне', group: 'disease',
    art: ({ skin, scarTone }) => { const p = pal(skin, scarTone); const pts = [...scatter(128, 94, 11, 15, 12, 31), ...scatter(172, 94, 11, 15, 12, 37), ...scatter(150, 54, 18, 8, 6, 43)]; return <g>{pts.map((q, i) => <g key={i}><circle cx={q.x} cy={q.y} r={0.9 + q.k * 0.6} fill={p.deep} opacity={0.4} /><circle cx={q.x - 0.25} cy={q.y - 0.25} r={0.4 + q.k * 0.3} fill={p.mid} opacity={0.35} /></g>)}</g>; } },
  { id: 'dis-rosacea', name: 'Розацеа', group: 'disease',
    art: ({ skin, scarTone }) => { const p = pal(skin, scarTone); return <g>{patch(131, 94, 13, 10, 2, p.red, 0.34)}{patch(169, 94, 13, 10, 5, p.red, 0.34)}{patch(150, 92, 6, 9, 8, p.red, 0.3)}{patch(150, 118, 8, 5, 12, p.red, 0.2)}<g stroke={p.redDeep} strokeWidth={0.35} fill="none" opacity={0.45}><path d="M124 92 q3 2 5 5 M128 98 q4 1 7 3 M170 90 q3 3 6 4 M172 97 q2 3 5 4" /></g></g>; } },
  { id: 'dis-lupus', name: 'Волчаночная «бабочка»', group: 'disease',
    art: ({ skin, scarTone }) => { const p = pal(skin, scarTone); return <g>{patch(135, 90, 15, 9, 4, p.red, 0.38)}{patch(165, 90, 15, 9, 7, p.red, 0.38)}{patch(150, 86, 7, 6, 10, p.red, 0.34)}{patch(134, 90, 10, 6, 13, p.redDeep, 0.2)}{patch(166, 90, 10, 6, 16, p.redDeep, 0.2)}</g>; } },
  { id: 'dis-eczema', name: 'Экзема', group: 'disease',
    art: ({ skin, scarTone }) => { const p = pal(skin, scarTone); return <g>{patch(126, 100, 9, 11, 6, p.red, 0.32)}{patch(124, 103, 6, 8, 9, p.keloid, 0.3)}<g fill={p.pale} opacity={0.55}>{scatter(125, 102, 7, 9, 12, 51).map((q, i) => <rect key={i} x={q.x} y={q.y} width={0.9} height={0.5} rx={0.2} />)}</g><g stroke={p.deep} strokeWidth={0.3} fill="none" opacity={0.45}><path d="M120 96 l2 2 M123 100 l2 2 M121 106 l2 2 M126 108 l2 2" /></g></g>; } },
  { id: 'dis-psoriasis', name: 'Псориаз (бляшки)', group: 'disease',
    art: ({ skin, scarTone }) => { const p = pal(skin, scarTone); const plaque = (cx: number, cy: number, rx: number, ry: number, seed: number) => <g>{patch(cx, cy, rx, ry, seed, p.red, 0.4)}{patch(cx, cy, rx * 0.72, ry * 0.72, seed + 3, p.pale, 0.7)}<g fill={p.gloss} opacity={0.6}>{scatter(cx, cy, rx * 0.6, ry * 0.6, 7, seed + 7).map((q, i) => <rect key={i} x={q.x} y={q.y} width={0.8} height={0.5} />)}</g></g>; return <g>{plaque(150, 48, 9, 5, 21)}{plaque(126, 66, 5, 7, 27)}{plaque(176, 64, 5, 7, 33)}</g>; } },
  { id: 'dis-vitiligo-face', name: 'Витилиго на лице', group: 'disease',
    art: ({ skin, scarTone }) => { const p = pal(skin, scarTone); return <g fill={p.pale}>{patch(133, 78, 9, 8, 8, p.pale, 0.9)}{patch(168, 96, 10, 9, 13, p.pale, 0.9)}{patch(150, 112, 7, 5, 5, p.pale, 0.85)}{patch(140, 52, 6, 4, 19, p.pale, 0.8)}</g>; } },
  { id: 'dis-melasma', name: 'Мелазма (пигментация)', group: 'disease',
    art: ({ skin, scarTone }) => { const p = pal(skin, scarTone); return <g>{patch(150, 52, 18, 6, 2, p.pigment, 0.32)}{patch(132, 86, 11, 7, 7, p.pigment, 0.3)}{patch(168, 86, 11, 7, 11, p.pigment, 0.3)}{patch(150, 98, 5, 3, 15, p.pigment, 0.25)}</g>; } },
  { id: 'dis-measles', name: 'Коревая сыпь', group: 'disease',
    art: ({ skin, scarTone }) => { const p = pal(skin, scarTone); const pts = scatter(150, 86, 32, 34, 44, 61); return <g>{pts.map((q, i) => <ellipse key={i} cx={q.x} cy={q.y} rx={1.1 + q.k * 0.9} ry={0.8 + q.k * 0.6} fill={p.red} opacity={0.42} />)}</g>; } },
  { id: 'dis-chickenpox', name: 'Ветрянка', group: 'disease',
    art: ({ skin, scarTone }) => { const p = pal(skin, scarTone); const pts = scatter(150, 84, 30, 34, 18, 71); return <g>{pts.map((q, i) => <g key={i}><circle cx={q.x} cy={q.y} r={1.4 + q.k * 0.6} fill={p.red} opacity={0.45} /><circle cx={q.x} cy={q.y} r={0.7 + q.k * 0.3} fill={q.k > 0.5 ? p.pale : p.deep} opacity={0.75} /></g>)}</g>; } },
  { id: 'dis-tb-pallor', name: 'Чахоточная бледность', group: 'disease',
    art: ({ skin, scarTone }) => { const p = pal(skin, scarTone); return <g><ellipse cx={150} cy={84} rx={36} ry={40} fill={p.pale} opacity={0.22} />{patch(132, 92, 9, 6, 3, p.red, 0.3)}{patch(168, 92, 9, 6, 6, p.red, 0.3)}<ellipse cx={134} cy={83} rx={8} ry={3.2} fill={p.blueish} opacity={0.35} /><ellipse cx={166} cy={83} rx={8} ry={3.2} fill={p.blueish} opacity={0.35} /></g>; } },
  { id: 'dis-jaundice', name: 'Желтуха', group: 'disease',
    art: ({ skin, scarTone }) => { const p = pal(skin, scarTone); return <g><ellipse cx={150} cy={84} rx={37} ry={41} fill={p.yellow} opacity={0.24} /><ellipse cx={135} cy={76} rx={7} ry={3.2} fill={p.yellow} opacity={0.45} /><ellipse cx={165} cy={76} rx={7} ry={3.2} fill={p.yellow} opacity={0.45} /></g>; } },
  { id: 'dis-frostbite', name: 'Обморожение', group: 'disease',
    art: ({ skin, scarTone }) => { const p = pal(skin, scarTone); return <g>{patch(150, 94, 5, 4, 2, p.purple, 0.45)}{patch(128, 98, 7, 9, 6, p.purple, 0.35)}{patch(172, 98, 7, 9, 9, p.purple, 0.35)}{patch(184, 78, 4, 7, 12, p.blueish, 0.4)}{patch(116, 78, 4, 7, 15, p.blueish, 0.4)}<g fill={p.pale} opacity={0.5}><circle cx={150} cy={93} r={1.4} /><circle cx={127} cy={100} r={1.1} /><circle cx={173} cy={100} r={1.1} /></g></g>; } },
  { id: 'dis-lice-bites', name: 'Расчёсы', group: 'disease',
    art: ({ skin, scarTone }) => { const p = pal(skin, scarTone); return <g stroke={p.red} strokeWidth={0.55} fill="none" strokeLinecap="round" opacity={0.65}><path d="M120 84 l6 8 M123 82 l5 9 M176 84 l-5 9 M180 88 l-5 8 M136 108 l4 6 M164 108 l-4 6 M148 52 l3 5 M155 50 l2 6" /></g>; } },
  { id: 'dis-bruise', name: 'Синяк под глазом', group: 'disease',
    art: ({ skin, scarTone }) => { const p = pal(skin, scarTone); return <g>{patch(133, 82, 12, 8, 4, p.purple, 0.45)}{patch(132, 84, 8, 5, 9, p.blueish, 0.35)}{patch(128, 88, 6, 4, 13, p.yellow, 0.3)}</g>; } },
];

export const FACE_MARK_GROUPS: { id: FaceMarkOption['group']; label: string }[] = [
  { id: 'scar', label: 'Шрамы' },
  { id: 'wound', label: 'Ранения' },
  { id: 'congenital', label: 'Врождённые' },
  { id: 'disease', label: 'Болезни' },
];
