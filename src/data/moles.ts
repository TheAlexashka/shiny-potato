export interface MoleDot {
  x: number;
  y: number;
  radius: number;
  raised?: boolean;
  light?: boolean;
}

export interface MoleOption {
  id: string;
  name: string;
  dots: MoleDot[];
}

/** Точки по спирали Архимеда: плотнее к центру, размер убывает к краю. */
function spiralDots(cx: number, cy: number, turns: number, r0: number, r1: number, count: number, radius: number): MoleDot[] {
  return Array.from({ length: count }, (_, i) => {
    const t = i / Math.max(1, count - 1);
    const angle = t * Math.PI * 2 * turns;
    const r = r0 + (r1 - r0) * Math.pow(t, 0.85);
    return {
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r * 0.92,
      radius: radius * (1 - 0.4 * t),
    };
  });
}

/** Хаотичная россыпь с детерминированным генератором, чтобы превью не «прыгало». */
function chaoticDots(cx: number, cy: number, rx: number, ry: number, count: number, seed: number, radius: number): MoleDot[] {
  let state = (seed * 9301 + 49297) % 233280;
  const next = () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
  return Array.from({ length: count }, () => {
    const angle = next() * Math.PI * 2;
    const dist = Math.sqrt(next());
    return {
      x: cx + Math.cos(angle) * rx * dist,
      y: cy + Math.sin(angle) * ry * dist,
      radius: radius * (0.4 + next() * 0.8),
    };
  });
}

export const MOLE_OPTIONS: MoleOption[] = [
  { id: 'lip-left', name: 'Над губой слева', dots: [{ x: 139.5, y: 98.2, radius: 1 }] },
  { id: 'lip-right', name: 'Над губой справа', dots: [{ x: 162, y: 98.5, radius: 1.15 }] },
  { id: 'under-eye', name: 'Под глазом', dots: [{ x: 132, y: 85.8, radius: 0.85 }] },
  { id: 'cheek', name: 'На щеке', dots: [{ x: 175, y: 93.6, radius: 1.25 }] },
  { id: 'chin', name: 'На подбородке', dots: [{ x: 155.4, y: 116, radius: 0.95 }] },
  { id: 'pair', name: 'Парные родинки', dots: [{ x: 124, y: 94, radius: 0.95 }, { x: 128.3, y: 96, radius: 0.65 }] },
  { id: 'scattered', name: 'Мелкая россыпь', dots: [{ x: 126, y: 65, radius: 0.5 }, { x: 168, y: 90.5, radius: 0.6 }, { x: 130, y: 99, radius: 0.55 }, { x: 142, y: 113, radius: 0.62 }, { x: 175, y: 60, radius: 0.55 }] },
  { id: 'light-flat', name: 'Светлая плоская', dots: [{ x: 170.5, y: 100, radius: 1.8, light: true }] },
  { id: 'raised', name: 'Объёмная родинка', dots: [{ x: 132.5, y: 105, radius: 1.35, raised: true }] },
  { id: 'spiral-cheek', name: 'Спираль на щеке', dots: spiralDots(176, 96, 2.4, 1.2, 11, 16, 0.72) },
  { id: 'spiral-temple', name: 'Спираль у виска', dots: spiralDots(124, 72, 1.9, 0.9, 8.5, 13, 0.6) },
  { id: 'spiral-jaw', name: 'Спираль по скуле', dots: spiralDots(131, 100, 2.1, 1, 12, 15, 0.66) },
  { id: 'spiral-twin', name: 'Две спирали', dots: [...spiralDots(128, 92, 2, 1, 8, 11, 0.58), ...spiralDots(171, 101, 2.4, 1.1, 9.5, 13, 0.64)] },
  { id: 'chaotic-face', name: 'Хаотичная россыпь', dots: chaoticDots(150, 86, 30, 34, 22, 7, 0.58) },
  { id: 'chaotic-cheek', name: 'Хаотично по щеке', dots: chaoticDots(174, 99, 14, 15, 14, 23, 0.62) },
  { id: 'chaotic-forehead', name: 'Хаотично по лбу', dots: chaoticDots(150, 58, 26, 11, 13, 41, 0.5) },
  { id: 'dense-scatter', name: 'Густая россыпь', dots: [...chaoticDots(140, 92, 22, 24, 20, 11, 0.5), ...chaoticDots(168, 104, 13, 14, 12, 29, 0.55)] },
  { id: 'constellation', name: 'Созвездие', dots: [{ x: 168, y: 88, radius: 0.9 }, { x: 173, y: 93, radius: 0.6 }, { x: 178, y: 90, radius: 0.75 }, { x: 175, y: 99, radius: 0.55 }, { x: 181, y: 97, radius: 0.85 }] },
  { id: 'line-jaw', name: 'Дорожка по челюсти', dots: Array.from({ length: 7 }, (_, i) => ({ x: 126 + i * 5.5, y: 104 + Math.sin(i * 0.9) * 2.4 + i * 1.6, radius: 0.55 + (i % 2) * 0.2 })) },
  { id: 'temple-cluster', name: 'Гроздь у виска', dots: chaoticDots(178, 66, 6, 9, 9, 53, 0.66) },
  { id: 'nose-bridge', name: 'На переносице', dots: [{ x: 148.8, y: 80, radius: 0.7 }, { x: 151.6, y: 84, radius: 0.55 }] },
  { id: 'neck-line', name: 'Под подбородком', dots: [{ x: 143, y: 120, radius: 0.8 }, { x: 156, y: 121.5, radius: 0.65 }, { x: 150, y: 124, radius: 0.5 }] },
  { id: 'forehead-center', name: 'На лбу по центру', dots: [{ x: 150, y: 52, radius: 0.9 }] },
  { id: 'forehead-left', name: 'На лбу слева', dots: [{ x: 136, y: 50, radius: 0.85 }] },
  { id: 'forehead-right', name: 'На лбу справа', dots: [{ x: 164, y: 50, radius: 0.85 }] },
  { id: 'forehead-pair', name: 'Пара на лбу', dots: [{ x: 140, y: 54, radius: 0.7 }, { x: 160, y: 52, radius: 0.8 }] },
  { id: 'forehead-trio', name: 'Три на лбу', dots: [{ x: 138, y: 56, radius: 0.65 }, { x: 150, y: 49, radius: 0.8 }, { x: 162, y: 56, radius: 0.65 }] },
  { id: 'forehead-scatter', name: 'Россыпь на лбу', dots: chaoticDots(150, 54, 18, 8, 9, 77, 0.55) },
  /* у бровей */
  { id: 'brow-above-left', name: 'Над бровью слева', dots: [{ x: 134, y: 59, radius: 0.85 }] },
  { id: 'brow-above-right', name: 'Над бровью справа', dots: [{ x: 166, y: 59, radius: 0.85 }] },
  { id: 'brow-tail-left', name: 'У хвоста брови слева', dots: [{ x: 124, y: 66, radius: 0.8 }] },
  { id: 'brow-tail-right', name: 'У хвоста брови справа', dots: [{ x: 176, y: 66, radius: 0.8 }] },
  { id: 'brow-between', name: 'Между бровями', dots: [{ x: 150, y: 64, radius: 0.9 }] },
  { id: 'brow-in-left', name: 'В брови слева', dots: [{ x: 140, y: 63.5, radius: 0.7 }] },
  { id: 'brow-in-right', name: 'В брови справа', dots: [{ x: 160, y: 63.5, radius: 0.7 }] },
  { id: 'brow-pair', name: 'Пара над бровями', dots: [{ x: 136, y: 58, radius: 0.7 }, { x: 164, y: 58, radius: 0.7 }] },
  /* у губ */
  { id: 'lip-corner-left', name: 'У уголка рта слева', dots: [{ x: 136, y: 105, radius: 0.85 }] },
  { id: 'lip-corner-right', name: 'У уголка рта справа', dots: [{ x: 164, y: 105, radius: 0.85 }] },
  { id: 'lip-under', name: 'Под нижней губой', dots: [{ x: 152, y: 111.5, radius: 0.8 }] },
  { id: 'lip-philtrum', name: 'Над губой по центру', dots: [{ x: 150, y: 98, radius: 0.75 }] },
  { id: 'lip-cupid', name: 'У лука Амура', dots: [{ x: 147, y: 99.5, radius: 0.65 }] },
  { id: 'lip-mouche', name: 'Мушка у губы', dots: [{ x: 141, y: 101, radius: 1.3, raised: true }] },
  { id: 'lip-cluster', name: 'Гроздь у губы', dots: [{ x: 160, y: 99, radius: 0.7 }, { x: 163.5, y: 102, radius: 0.55 }, { x: 159, y: 104, radius: 0.5 }] },
  { id: 'lip-both-corners', name: 'У обоих уголков', dots: [{ x: 137, y: 104.5, radius: 0.7 }, { x: 163, y: 104.5, radius: 0.7 }] },
  { id: 'eyelid', name: 'На веке', dots: [{ x: 166.5, y: 70.5, radius: 0.6 }] },
  { id: 'big-cheek', name: 'Крупная на щеке', dots: [{ x: 128, y: 96, radius: 2.1, raised: true }] },
  { id: 'twin-lip', name: 'Две у губы', dots: [{ x: 158, y: 100, radius: 0.85 }, { x: 161.5, y: 106.5, radius: 0.65 }] },
];

export const MOLE_COLORS = ['#a77653', '#885538', '#704632', '#523226', '#33251f'];
