import type { BodySel, Gender, PoseId } from './types';

export interface Point { x: number; y: number }
export type Side = -1 | 1;
interface Cubic { a: Point; b: Point; c: Point; d: Point }
export interface ArmGeometry {
  side: Side;
  shoulder: Point;
  elbow: Point;
  hand: Point;
  handAngle: number;
  handScale: number;
  handTransform: string;
  path: string;
  inFront: boolean;
}
export interface LegGeometry {
  side: Side;
  hip: Point;
  knee: Point;
  calf: Point;
  ankle: Point;
  foot: Point;
  footTransform: string;
  kneeWidth: number;
  calfWidth: number;
  ankleWidth: number;
  outer: Cubic[];
  inner: Cubic[];
}

export const HAND_OUTLINE = 'M-5.7-9 C-5.7-3.2-7 3-6.6 9 L-7.7 20.5 Q-7.9 23.5-6.5 23.8 Q-5.1 23.8-4.9 21 L-3.5 14.5 L-3.9 26.3 Q-3.8 29.4-2.3 29.4 Q-.8 29.4-.7 26.5 L.2 15.4 L.5 29 Q.7 32 2.2 31.8 Q3.7 31.6 3.4 28.8 L3.6 14.7 L5.4 25.5 Q5.9 28.2 7.4 27.5 Q8.5 26.8 7.9 24.1 L6.9 10 C7.8 10.8 8.7 12.8 9.6 14 Q11 16.2 12.3 14.8 Q13 13.6 11.6 11.3 L9.7 7.5 C8 3.7 6 1.5 5.8-3 L5.8-9Z';

// Canonical right foot. Mirroring by side keeps both toes pointing away from the centre.
export const FOOT_OUTLINE = 'M-7-13 C-7.4-6-7.5 1.5-8.7 8 Q-10.2 14.7-6.3 17.2 C-2.6 19 3.2 17.8 8 17.8 L25 17.8 Q29 17.6 29.2 14.9 Q29.4 12.4 25.3 11.3 L16.1 8.1 C11.4 6.4 8 1.8 7-4.8 L6-13Z';

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
export const between = (a: Point, b: Point, t: number): Point => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
const xy = (p: Point) => `${p.x.toFixed(3)} ${p.y.toFixed(3)}`;
const cmd = (segment: Cubic) => `C${xy(segment.b)} ${xy(segment.c)} ${xy(segment.d)}`;
const reverse = (segments: Cubic[]) => [...segments].reverse().map((s) => ({ a: s.d, b: s.c, c: s.b, d: s.a }));

function smoothOutline(points: Point[]) {
  let d = `M${xy(points[0])}`;
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];
    d += cmd({ a: p1, b: { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 }, c: { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 }, d: p2 });
  }
  return d + 'Z';
}

function armOutline(shoulder: Point, elbow: Point, wrist: Point, female: boolean) {
  const points = [shoulder, between(shoulder, elbow, 0.4), elbow, between(elbow, wrist, 0.3), wrist];
  const radii = female ? [10.5, 11.4, 7.8, 8.9, 5.6] : [13, 13.8, 9.8, 11.1, 6.6];
  const left: Point[] = [];
  const right: Point[] = [];
  points.forEach((p, i) => {
    const prev = points[Math.max(0, i - 1)];
    const next = points[Math.min(points.length - 1, i + 1)];
    const length = Math.hypot(next.x - prev.x, next.y - prev.y) || 1;
    const nx = -(next.y - prev.y) / length;
    const ny = (next.x - prev.x) / length;
    left.push({ x: p.x + nx * radii[i], y: p.y + ny * radii[i] });
    right.push({ x: p.x - nx * radii[i], y: p.y - ny * radii[i] });
  });
  return smoothOutline([...left, ...right.reverse()]);
}

export function getFigureGeometry(gender: Gender, body: BodySel, pose: PoseId) {
  const female = gender === 'f';
  const shoulderScale = clamp(body.shoulders ?? 100, 70, 140) / 100;
  const hipScale = clamp(body.hips ?? 100, 70, 140) / 100;
  const chestScale = clamp(body.chest ?? 100, 70, 140) / 100;
  const bellyScale = clamp(body.belly ?? 100, 70, 140) / 100;
  const neckScale = clamp(body.neckWidth ?? 100, 60, 150) / 100;
  const thighGap = clamp(body.thighGap ?? 0, -35, 35); // сдвиг / просвет между ляжками
  const thighFull = clamp(body.thighFullness ?? 100, 70, 150) / 100; // полнота ляжек
  const thighBulge = (thighFull - 1) * 24; // прибавка мягких тканей бедра, px
  const waistOffset = clamp(body.waistY ?? 0, -22, 22);
  const hipShift = pose === 'graceful' ? 9 : 0;
  const chestShift = pose === 'graceful' ? -3 : 0;
  const shoulderTilt = pose === 'graceful' ? -0.065 : 0;
  const hipTilt = pose === 'graceful' ? 0.09 : 0;
  const shoulderHalf = (female ? 45 : 55) * shoulderScale;
  const hipHalf = (female ? 46 : 43) * hipScale;
  const chestHalf = (female ? 36 : 44) * chestScale;
  const waistHalf = (female ? 27 : 33) * bellyScale;
  const waist = { x: 150 + (hipShift + chestShift) * 0.5, y: 255 + waistOffset };
  const chest = { x: 150 + chestShift, y: 191 };
  const crotch = { x: 150 + hipShift, y: 326 + (thighGap < 0 ? -thighGap * 0.25 : 0) };
  const hips: [Point, Point] = [
    { x: 150 + hipShift - hipHalf, y: 297 - hipTilt * hipHalf },
    { x: 150 + hipShift + hipHalf, y: 297 + hipTilt * hipHalf },
  ];
  const shoulders: [Point, Point] = [
    { x: chest.x - shoulderHalf, y: 150 - shoulderTilt * shoulderHalf },
    { x: chest.x + shoulderHalf, y: 150 + shoulderTilt * shoulderHalf },
  ];

  const arms = ([-1, 1] as Side[]).map((side, index): ArmGeometry => {
    const extra = female ? 0 : 5;
    const spread = (shoulderScale - 1) * (female ? 45 : 55);
    const shoulder = { x: shoulders[index].x - side * 4, y: shoulders[index].y + 7 };
    let elbow = { x: 150 + side * (56 + extra + spread * 0.45), y: 238 };
    let hand = { x: 150 + side * (60 + extra + spread * 0.25), y: 324 };
    if (pose === 'confident') {
      elbow = { x: 150 + side * (74 + extra + spread * 0.45), y: 225 };
      hand = { x: waist.x + side * (waistHalf + 8), y: waist.y + 24 };
    } else if (pose === 'pensive' && side === 1) {
      // правая рука поднята к лицу: локоть в сторону, кисть у нижней челюсти
      elbow = { x: 208 + extra + spread * 0.4, y: 214 };
      hand = { x: 171, y: 168 };
    } else if (pose === 'pensive') {
      // левая рука опущена и слегка прижата к корпусу
      elbow = { x: 150 + side * (58 + extra + spread * 0.45), y: 240 };
      hand = { x: 150 + side * (62 + extra + spread * 0.25), y: 326 };
    } else if (pose === 'graceful' && side === 1) {
      elbow = { x: 214 + extra + spread * 0.35, y: 225 };
      hand = { x: 170, y: 191 };
    } else if (pose === 'graceful') {
      elbow = { x: 91 - extra - spread * 0.4, y: 239 };
      hand = { x: 79 - extra - spread * 0.25, y: 326 };
    }
    const handAngle = Math.atan2(hand.y - elbow.y, hand.x - elbow.x) * 180 / Math.PI - 90;
    const handScale = female ? 1 : 1.14;
    return { side, shoulder, elbow, hand, handAngle, handScale, handTransform: `translate(${xy(hand)}) rotate(${handAngle}) scale(${-side * handScale} ${handScale})`, path: armOutline(shoulder, elbow, hand, female), inFront: pose === 'confident' || pose === 'pensive' || (pose === 'graceful' && side === 1) };
  });

  const gapShift = thighGap * 0.22;
  const legs = ([-1, 1] as Side[]).map((side, index): LegGeometry => {
    let knee = { x: 150 + side * (24 + gapShift * 0.8), y: 440 };
    let footX = 150 + side * (28 + gapShift * 0.9);
    let turn = 0.91;
    if (pose === 'confident') {
      knee = { x: 150 + side * (34 + gapShift * 0.8), y: 440 };
      footX = 150 + side * (44 + gapShift * 0.9);
      turn = 1.06;
    } else if (pose === 'graceful') {
      knee = side === -1 ? { x: 138 - gapShift * 0.4, y: 442 } : { x: 176 + gapShift * 0.8, y: 438 };
      footX = side === -1 ? 128 - gapShift * 0.5 : 176 + gapShift * 0.9;
      turn = side === -1 ? 1.1 : 0.9;
    }
    const size = female ? 1 : 1.1;
    const foot = { x: footX, y: 594 - 17.8 * size };
    const ankle = { x: foot.x, y: foot.y - 9 * size };
    const calf = between(knee, ankle, 0.33);
    const kneeWidth = (female ? 11.7 : 13) * (0.93 + 0.07 * hipScale);
    const calfWidth = female ? 13.5 : 15;
    const ankleWidth = (female ? 6.7 : 7.1) * turn;
    const hip = hips[index];
    const ko = { x: knee.x + side * kneeWidth, y: knee.y };
    const co = { x: calf.x + side * calfWidth, y: calf.y };
    const ao = { x: ankle.x + side * ankleWidth, y: ankle.y };
    const ai = { x: ankle.x - side * ankleWidth, y: ankle.y };
    const ci = { x: calf.x - side * calfWidth, y: calf.y };
    const ki = { x: knee.x - side * kneeWidth, y: knee.y };
    const groinOffset = side * (5.5 + gapShift * 0.5);
    const groin = { x: crotch.x + groinOffset, y: crotch.y + 16 };
    // При смыкании ляжек (thighGap < 0) внутренняя поверхность ляжки идёт ближе к центру
    const innerThighBulge = -thighGap * 0.18;
    const outer: Cubic[] = [
      // Наружная линия бедра: полнота ляжки выпирает мягкой дугой
      { a: hip, b: { x: hip.x + side * thighBulge * 0.7, y: hip.y + 42 }, c: { x: ko.x + side * (5 + thighBulge), y: knee.y - 48 }, d: ko },
      { a: ko, b: { x: ko.x - side, y: knee.y + 16 }, c: { x: co.x + side * 3, y: calf.y - 17 }, d: co },
      { a: co, b: { x: co.x, y: calf.y + 33 }, c: { x: ao.x, y: ankle.y - 28 }, d: ao },
    ];
    const inner: Cubic[] = [
      { a: ai, b: { x: ai.x, y: ankle.y - 25 }, c: { x: ci.x, y: calf.y + 31 }, d: ci },
      { a: ci, b: { x: ci.x, y: calf.y - 17 }, c: { x: ki.x, y: knee.y + 17 }, d: ki },
      {
        a: ki,
        // Внутренняя линия ляжки: полнота наполняет бедро к центру
        b: { x: ki.x - side * (2 + innerThighBulge * 0.3 + thighBulge * 0.75), y: knee.y - 36 },
        c: { x: crotch.x + side * (11 + gapShift * 0.7) - side * (innerThighBulge + thighBulge * 0.35), y: crotch.y + 40 },
        d: groin,
      },
    ];
    return { side, hip, knee, calf, ankle, foot, footTransform: `translate(${xy(foot)}) scale(${side * size * turn} ${size})`, kneeWidth, calfWidth, ankleWidth, outer, inner };
  });

  const neckHalf = (female ? 12 : 15) * neckScale;
  const neckBaseHalf = neckHalf * 1.04;
  const [sl, sr] = shoulders;
  const [hl, hr] = hips;
  const [left, right] = legs;

  // Hips and both legs are part of ONE closed silhouette, without an overlay at the groin.
  const corePath = [
    `M${150 - neckHalf} 108 C${150 - neckHalf * 0.98} 117 ${150 - neckHalf * 0.98} 126 ${150 - neckBaseHalf} 133`,
    `C${150 - neckBaseHalf - 5} 142 ${sl.x + 12} ${sl.y - 6} ${xy(sl)}`,
    `C${sl.x - 5} ${sl.y + 4} ${sl.x - 2} ${sl.y + 22} ${chest.x - chestHalf} ${chest.y - 6}`,
    `C${chest.x - chestHalf} ${chest.y + 19} ${waist.x - waistHalf} ${waist.y - 18} ${waist.x - waistHalf} ${waist.y}`,
    `C${waist.x - waistHalf} ${waist.y + (hl.y - waist.y) * 0.42} ${hl.x} ${hl.y - (hl.y - waist.y) * 0.34} ${xy(hl)}`,
    ...left.outer.map(cmd),
    `L${xy(left.inner[0].a)}`,
    ...left.inner.map(cmd),
    `C${crotch.x - 2} ${crotch.y - 2} ${crotch.x + 2} ${crotch.y - 2} ${xy(right.inner[2].d)}`,
    ...reverse(right.inner).map(cmd),
    `L${xy(right.outer[2].d)}`,
    ...reverse(right.outer).map(cmd),
    `C${hr.x} ${hr.y - (hr.y - waist.y) * 0.34} ${waist.x + waistHalf} ${waist.y + (hr.y - waist.y) * 0.42} ${waist.x + waistHalf} ${waist.y}`,
    `C${waist.x + waistHalf} ${waist.y - 18} ${chest.x + chestHalf} ${chest.y + 19} ${chest.x + chestHalf} ${chest.y - 6}`,
    `C${sr.x + 2} ${sr.y + 22} ${sr.x + 5} ${sr.y + 4} ${xy(sr)}`,
    `C${sr.x - 12} ${sr.y - 6} ${150 + neckBaseHalf + 5} 142 ${150 + neckBaseHalf} 133`,
    `C${150 + neckHalf * 0.98} 126 ${150 + neckHalf * 0.98} 117 ${150 + neckHalf} 108Z`,
  ].join(' ');

  const claviclePit = { x: 150 + chestShift * 0.5, y: 140 };
  const collarBases: [Point, Point] = [
    { x: 150 - neckBaseHalf, y: 133 },
    { x: 150 + neckBaseHalf, y: 133 },
  ];

  // Параметры бюста/грудных мышц — единый источник для тела и белья
  // (до 3.0 — для гипертрофированных мужских грудных мышц)
  const bust = Math.max(0.5, Math.min(3, (body.bust ?? 100) / 100));
  const bustSpacing = Math.max(-25, Math.min(30, body.bustSpacing ?? 0));
  const bustY = Math.max(-30, Math.min(30, body.bustY ?? 0));
  /** расстояние от центра груди до центра одной груди/мышцы */
  const bustOffset = female ? Math.max(6, 13 + 3 * (bust - 1) + bustSpacing * 0.5) : Math.max(2, 4 + bustSpacing * 0.4);
  /** радиус женской груди (для чашек белья) */
  const bustRadius = 11 * bust;
  /** вертикальный центр груди (у женщин опускается при большом объёме) */
  const bustCenterY = (female ? 190 + 6 * (bust - 1) : 178) + bustY;
  const armAmputationSide = body.armAmputationSide ?? 'none';
  const armAmputationLevel = body.armAmputationLevel ?? 'hand';
  const legAmputationSide = body.legAmputationSide ?? 'none';
  const legAmputationLevel = body.legAmputationLevel ?? 'foot';

  return { female, corePath, arms, legs, waist, chest, hips, crotch, shoulders, waistHalf, hipHalf, chestHalf, chestScale, bellyScale, neckHalf, neckBaseHalf, neckScale, thighGap, thighFull, thighBulge, claviclePit, collarBases, pose, bust, bustSpacing, bustOffset, bustRadius, bustCenterY, bustY, armAmputationSide, armAmputationLevel, legAmputationSide, legAmputationLevel };
}

export type FigureGeometry = ReturnType<typeof getFigureGeometry>;
