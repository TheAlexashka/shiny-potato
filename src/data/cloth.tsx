import { useId, type ReactNode } from 'react';
import { FOOT_OUTLINE, HAND_OUTLINE, between, type FigureGeometry } from './figureGeometry';
import { armAmputation, legAmputation } from './limbs';

export const outline = { stroke: 'rgba(30,20,10,0.35)', strokeWidth: 1 };

/** Обрезает узор (горошек, цветы, складки) по заданному контуру платья */
export function Clipped({ d, children }: { d: string; children: ReactNode }) {
  const clipId = `clip-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  return (
    <g>
      <defs>
        <clipPath id={clipId}>
          <path d={d} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>{children}</g>
    </g>
  );
}

/* ═══════════ ТОРС ═══════════
   Контур строится по реальным точкам рига: ключицы → плечи → грудь → талия → бёдра → подол.
   Повторяет анатомический переход от шеи к плечам над ключицами и яремной ямкой. */
export function torsoPath(rig: FigureGeometry, o: {
  hem: number;
  hemHalf: number;
  shoulderEase?: number;
  chestEase?: number;
  waistEase?: number;
  hipEase?: number;
  neckDrop?: number;
  /** открытый вырез (бельё, вечернее платье): горловина уходит вниз, к шее не тянется */
  bare?: boolean;
  /** ширина выреза на плечах для bare (бретели) */
  bareHalf?: number;
  /** при bare: ткань закрывает плечо и огибает пройму (вырез остаётся открытым) */
  coverShoulders?: boolean;
}): string {
  const se = o.shoulderEase ?? 5;
  const ch = rig.chestHalf * (o.chestEase ?? 1.1);
  const wa = rig.waistHalf * (o.waistEase ?? 1.14);
  // Припуск на полноту ляжек: иначе бёдра вылезают из-под ткани
  const bulge = Math.max(0, rig.thighBulge ?? 0);
  const hi = rig.hipHalf * (o.hipEase ?? 1.12) + bulge * 0.8;
  // Горловина обнимает шею у ключиц. Ниже основания шеи полотно не поднимается.
  const neckBase = (rig.neckBaseHalf ?? (rig.neckHalf * 1.05)) + 2.5;
  const NECK_FLOOR = 127; // основание шеи: выше ткань не заходит, иначе дыра у ключиц
  const ny = o.bare ? (o.neckDrop ?? rig.chest.y - 6) : Math.max(o.neckDrop ?? 130, NECK_FLOOR);
  const rim = o.bare ? ny - 8 : Math.max(ny - 3, NECK_FLOOR - 3);
  // для открытого выреза «шея» полотна — это точки у бретелей на груди
  const nl = o.bare ? 150 - (o.bareHalf ?? rig.chestHalf * 0.85) : 150 - neckBase;
  const nr = o.bare ? 150 + (o.bareHalf ?? rig.chestHalf * 0.85) : 150 + neckBase;
  const sl = rig.shoulders[0];
  const sr = rig.shoulders[1];
  const cx = rig.chest.x;
  const wx = rig.waist.x;
  const hx = rig.crotch.x;
  const chestY = rig.chest.y + 16;
  const waistY = rig.waist.y + 8;
  const hipY = rig.hips[0].y + 10;
  const hem = o.hem;
  const hh = o.hemHalf;

  // Если подол выше линии бёдер, кривая не должна разворачиваться назад через бедро:
  // от талии идём сразу к подолу, иначе получается «разрыв» полотна в стороны.
  const shortHem = hem <= hipY + 4;
  const rightLower = shortHem
    ? [`C${wx + wa} ${waistY + 12} ${hx + hh} ${hem - 18} ${hx + hh} ${hem}`]
    : [
        `C${wx + wa} ${waistY + 14} ${hx + hi} ${hipY - 12} ${hx + hi} ${hipY}`,
        `C${hx + hi} ${hipY + 12} ${hx + hh} ${hem - 26} ${hx + hh} ${hem}`,
      ];
  const leftLower = shortHem
    ? [`C${hx - hh} ${hem - 18} ${wx - wa} ${waistY + 12} ${wx - wa} ${waistY}`]
    : [
        `C${hx - hh} ${hem - 26} ${hx - hi} ${hipY + 12} ${hx - hi} ${hipY}`,
        `C${hx - hi} ${hipY - 12} ${wx - wa} ${waistY + 14} ${wx - wa} ${waistY}`,
      ];

  if (o.bare && !o.coverShoulders) {
    // Открытый лиф: от бретели вниз по боку груди, без захода на плечи
    return [
      `M${nl} ${rim}`,
      `Q150 ${ny} ${nr} ${rim}`,
      `C${nr + 4} ${rim + 6} ${cx + ch} ${chestY - 14} ${cx + ch} ${chestY}`,
      `C${cx + ch} ${chestY + 22} ${wx + wa} ${waistY - 14} ${wx + wa} ${waistY}`,
      ...rightLower,
      `L${hx - hh} ${hem}`,
      ...leftLower,
      `C${wx - wa} ${waistY - 14} ${cx - ch} ${chestY + 22} ${cx - ch} ${chestY}`,
      `C${cx - ch} ${chestY - 14} ${nl - 4} ${rim + 6} ${nl} ${rim}Z`,
    ].join(' ');
  }
  // bare + coverShoulders: вырез открыт, но плечи закрыты — строится как
  // обычный лиф (ниже), т.к. nl/nr/rim уже установлены в точки выреза

  return [
    `M${nl} ${rim}`,
    `Q150 ${ny} ${nr} ${rim}`,
    // Анатомический симметричный переход от шеи через ключицы к правому плечу
    `C${nr + 7} ${rim + 5} ${sr.x - 5} ${sr.y - 2} ${sr.x + se} ${sr.y + 4}`,
    `C${sr.x + se} ${sr.y + 26} ${cx + ch} ${chestY - 12} ${cx + ch} ${chestY}`,
    `C${cx + ch} ${chestY + 22} ${wx + wa} ${waistY - 14} ${wx + wa} ${waistY}`,
    ...rightLower,
    `L${hx - hh} ${hem}`,
    ...leftLower,
    `C${wx - wa} ${waistY - 14} ${cx - ch} ${chestY + 22} ${cx - ch} ${chestY}`,
    `C${cx - ch} ${chestY - 12} ${sl.x - se} ${sl.y + 26} ${sl.x - se} ${sl.y + 4}`,
    // Симметричный переход от левого плеча через ключицу к шее (направлен внутрь к шее)
    `C${sl.x + 5} ${sl.y - 2} ${nl - 7} ${rim + 5} ${nl} ${rim}Z`,
  ].join(' ');
}

/** Анатомический воротничок / горловина (neckband), закрывающий переход от шеи к ключицам */
export function neckBand(rig: FigureGeometry, color: string, o: { height?: number; drop?: number; trim?: string } = {}): ReactNode {
  const nb = (rig.neckBaseHalf ?? (rig.neckHalf * 1.05)) + 2.8;
  const topY = o.height ?? 118;
  const botY = o.drop ?? 130;
  return (
    <g>
      <path
        d={`M${150 - nb + 1} ${topY} Q150 ${topY + 6} ${150 + nb - 1} ${topY} L${150 + nb} ${botY} Q150 ${botY + 7} ${150 - nb} ${botY} Z`}
        fill={color}
        stroke="rgba(0,0,0,0.35)"
        strokeWidth={0.7}
      />
      {o.trim && (
        <path
          d={`M${150 - nb + 1} ${topY} Q150 ${topY + 6} ${150 + nb - 1} ${topY}`}
          stroke={o.trim}
          strokeWidth={1.2}
          fill="none"
        />
      )}
      <path
        d={`M${150 - nb} ${botY} Q150 ${botY + 7} ${150 + nb} ${botY}`}
        stroke="rgba(0,0,0,0.22)"
        strokeWidth={1}
        fill="none"
      />
    </g>
  );
}

/** юбка от талии до подола (карандаш — pencil) */
export function skirtPath(rig: FigureGeometry, o: { hem: number; flare: number; pencil?: boolean }): string {
  const bulge = Math.max(0, rig.thighBulge ?? 0);
  const w0 = rig.waistHalf + 3.5;
  // Облегание: ткань идёт по контуру бедра с минимальным припуском, учитывая полноту ляжек
  const wHip = rig.hipHalf + (o.pencil ? 3.5 : 8) + bulge * 0.6;
  // Самая широкая точка бедра — чуть ниже линии таза (по ляжкам)
  const thighY = rig.hips[0].y + 34;
  const wThigh = rig.hipHalf + (o.pencil ? 2.5 : 7) + bulge * 0.9;
  const wHem = o.pencil ? Math.max(rig.hipHalf * 0.9, wThigh - 6) : o.flare;
  const hx = rig.crotch.x;
  const hipY = rig.hips[0].y + 4;
  const wy = rig.waist.y + 2;
  return [
    `M${rig.waist.x - w0} ${wy}`,
    `L${rig.waist.x + w0} ${wy}`,
    // Талия → бедро (вогнутая линия по боку)
    `C${rig.waist.x + w0} ${wy + 16} ${hx + wHip} ${hipY - 10} ${hx + wHip} ${hipY}`,
    // Бедро → ляжки (выпуклость)
    `C${hx + wHip} ${hipY + 14} ${hx + wThigh} ${thighY - 10} ${hx + wThigh} ${thighY}`,
    // Ляжки → подол
    `C${hx + wThigh} ${thighY + 30} ${hx + wHem} ${o.hem - 30} ${hx + wHem} ${o.hem}`,
    `L${hx - wHem} ${o.hem}`,
    `C${hx - wHem} ${o.hem - 30} ${hx - wThigh} ${thighY + 30} ${hx - wThigh} ${thighY}`,
    `C${hx - wThigh} ${thighY - 10} ${hx - wHip} ${hipY + 14} ${hx - wHip} ${hipY}`,
    `C${hx - wHip} ${hipY - 10} ${rig.waist.x - w0} ${wy + 16} ${rig.waist.x - w0} ${wy}Z`,
  ].join(' ');
}

/* ═══════════ РУКАВА ═══════════
   Ткань идёт строго по центру руки рига (плечо → локоть → кисть),
   поэтому рукава следуют за позой и шириной плеч. */
export function sleeves(rig: FigureGeometry, color: string, w: number, o: { short?: number; cuff?: boolean; cuffColor?: string; /** припуск оката плеча, по умолчанию 3 */ capPad?: number } = {}): ReactNode {
  // Минимальная ширина рукава с запасом, перекрывающим радиус руки персонажа
  const safeW = Math.max(w, rig.female ? 25 : 29);
  const capPad = o.capPad ?? 3;
  return rig.arms.map((arm, i) => {
    const loss = armAmputation(rig, arm.side);
    if (loss === 'shoulder') return null;
    const end = loss === 'elbow'
      ? between(arm.shoulder, arm.elbow, 0.78)
      : o.short
      ? between(arm.shoulder, arm.elbow, o.short)
      : { x: arm.hand.x, y: arm.hand.y - 11 };
    const cuffA = o.cuff ? between(arm.elbow, end, 0.82) : null;
    return (
      <g key={i}>
        {/* Окат плеча с полным перекрытием плечевого сустава */}
        <circle cx={arm.shoulder.x} cy={arm.shoulder.y + 2} r={safeW / 2 + capPad} fill={color} />
        {/* Плечевая часть рукава */}
        <path
          d={`M${arm.shoulder.x} ${arm.shoulder.y} L${arm.elbow.x} ${arm.elbow.y} L${end.x} ${end.y}`}
          stroke={color}
          strokeWidth={safeW}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {cuffA && (
          <path
            d={`M${cuffA.x} ${cuffA.y} L${end.x} ${end.y}`}
            stroke={o.cuffColor ?? 'rgba(0,0,0,0.28)'}
            strokeWidth={safeW}
            strokeLinecap="round"
            fill="none"
          />
        )}
        {!o.short && loss !== 'elbow' && (
          <path d={`M${arm.shoulder.x} ${arm.shoulder.y + 4} Q${(arm.shoulder.x + arm.elbow.x) / 2} ${(arm.shoulder.y + arm.elbow.y) / 2 + 5} ${arm.elbow.x} ${arm.elbow.y}`} stroke="rgba(0,0,0,0.12)" strokeWidth={1.1} fill="none" />
        )}
      </g>
    );
  });
}

/* ═══════════ БРЮКИ ═══════════
   Полноценный крой: закрывает таз, бёдра, ляжки и промежность целиком,
   без просветов между ногами. Повторяет анатомический изгиб ляжек.
   breeches = галифе: выраженное расширение на бёдрах («уши») и сужение к икре. */
function LimbAwareLegwear({ rig, children }: { rig: FigureGeometry; children: ReactNode }) {
  const id = `legwear-${useId().replace(/:/g, '')}`;
  const cuts = rig.legs.flatMap((leg) => {
    const loss = legAmputation(rig, leg.side);
    if (loss !== 'knee' && loss !== 'hip') return [];
    return [{
      x: leg.side === -1 ? 0 : 150,
      y: (loss === 'knee' ? leg.knee.y : leg.hip.y) - 2,
      width: 150,
      height: 624,
    }];
  });
  if (!cuts.length) return <>{children}</>;
  return (
    <g>
      <defs>
        <mask id={id} maskUnits="userSpaceOnUse" x={0} y={100} width={300} height={524}>
          <rect x={0} y={100} width={300} height={524} fill="white" />
          {cuts.map((cut, index) => <rect key={index} {...cut} fill="black" />)}
        </mask>
      </defs>
      <g mask={`url(#${id})`}>{children}</g>
    </g>
  );
}

export function trousers(rig: FigureGeometry, color: string, o: {
  waistband?: string;
  thighEase?: number;
  shinEase?: number;
  ankle?: number;
  breeches?: boolean;
  crease?: boolean;
  inTunic?: boolean;
  tunicHem?: number;
} = {}): ReactNode {
  const [left, right] = rig.legs;
  const thighEase = o.thighEase ?? (o.breeches ? 12 : 6);
  const shinEase = o.shinEase ?? (o.breeches ? -2 : 4);
  // Защита от 0 или некорректных значений ankle
  const ankleL = (o.ankle !== undefined && o.ankle > 100) ? o.ankle : (left.ankle.y + 7);
  const ankleR = (o.ankle !== undefined && o.ankle > 100) ? o.ankle : (right.ankle.y + 7);

  // Точки талии брюк
  const wy = rig.waist.y + 4;
  const wLeft = rig.waist.x - (o.inTunic ? rig.waistHalf - 1 : rig.waistHalf + 4.5);
  const wRight = rig.waist.x + (o.inTunic ? rig.waistHalf - 1 : rig.waistHalf + 4.5);

  // Точки бёдер (наружные): если под кителем, ширина не должна торчать из-под кителя
  const hipExtra = o.inTunic ? 0 : (o.breeches ? 14 : 5);
  const hipL = { x: left.hip.x - (o.inTunic ? 2 : (6 + hipExtra)), y: left.hip.y + 4 };
  const hipR = { x: right.hip.x + (o.inTunic ? 2 : (6 + hipExtra)), y: right.hip.y + 4 };

  // Полнота ляжек: ткань обязана перекрывать бедро
  const bulge = Math.max(0, rig.thighBulge ?? 0);

  // Колени
  const kwL = left.kneeWidth + (o.breeches ? 8 : (4 + thighEase * 0.4));
  const kwR = right.kneeWidth + (o.breeches ? 8 : (4 + thighEase * 0.4));
  const koL = { x: left.knee.x - kwL, y: left.knee.y };
  const koR = { x: right.knee.x + kwR, y: right.knee.y };
  const kiL = { x: left.knee.x + kwL * 0.88, y: left.knee.y };
  const kiR = { x: right.knee.x - kwR * 0.88, y: right.knee.y };

  // Щиколотки
  const awL = left.ankleWidth + 4 + shinEase;
  const awR = right.ankleWidth + 4 + shinEase;
  const aoL = { x: left.ankle.x - awL, y: ankleL };
  const aiL = { x: left.ankle.x + awL, y: ankleL };
  const aoR = { x: right.ankle.x + awR, y: ankleR };
  const aiR = { x: right.ankle.x - awR, y: ankleR };

  // Промежность и ляжки
  const crotchY = rig.crotch.y + 14;
  const crotchCenter = { x: rig.crotch.x, y: crotchY };
  // Точки внутренней поверхности ляжек
  const innerThighL = {
    x: between({ x: rig.crotch.x - 4, y: crotchY }, kiL, 0.45).x + 3,
    y: between({ x: rig.crotch.x - 4, y: crotchY }, kiL, 0.45).y,
  };
  const innerThighR = {
    x: between({ x: rig.crotch.x + 4, y: crotchY }, kiR, 0.45).x - 3,
    y: between({ x: rig.crotch.x + 4, y: crotchY }, kiR, 0.45).y,
  };

  // Шорты: низ штанины выше колена — обрезаем контур на бедре, без прохода через колено
  const shortLeg = ankleL < left.knee.y - 6;
  let pantsPath: string;
  if (shortLeg) {
    // Доля длины бедра, где заканчивается штанина
    const tL = Math.max(0.15, Math.min(0.95, (ankleL - left.hip.y) / (left.knee.y - left.hip.y)));
    const tR = Math.max(0.15, Math.min(0.95, (ankleR - right.hip.y) / (right.knee.y - right.hip.y)));
    const midL = between(left.hip, left.knee, tL);
    const midR = between(right.hip, right.knee, tR);
    // Ширина на срезе: интерполяция между бедром и коленом + припуск
    const hwL = (left.kneeWidth + 6) * (1 - tL) + kwL * tL + thighEase * 0.5 + bulge * 0.4;
    const hwR = (right.kneeWidth + 6) * (1 - tR) + kwR * tR + thighEase * 0.5 + bulge * 0.4;
    const boL = { x: midL.x - hwL, y: midL.y };
    const biL = { x: midL.x + hwL * 0.8, y: midL.y };
    const boR = { x: midR.x + hwR, y: midR.y };
    const biR = { x: midR.x - hwR * 0.8, y: midR.y };
    // Скругление углов среза штанины (радиус ~ треть ширины)
    const rL = Math.min(hwL * 0.45, 9);
    const rR = Math.min(hwR * 0.45, 9);
    pantsPath = [
      `M${wLeft} ${wy}`,
      `L${wRight} ${wy}`,
      `C${wRight + 3} ${wy + 18} ${hipR.x + 3 + bulge * 0.6} ${hipR.y - 12} ${hipR.x + bulge * 0.5} ${hipR.y}`,
      // наружный край правой штанины → скруглённый внешний угол
      `Q${hipR.x + bulge * 0.5} ${(hipR.y + boR.y) / 2 + 6} ${boR.x} ${boR.y - rR}`,
      `Q${boR.x} ${boR.y} ${boR.x - rR} ${boR.y}`,
      // низ до внутреннего угла со скруглением
      `L${biR.x + rR} ${biR.y}`,
      `Q${biR.x} ${biR.y} ${biR.x} ${biR.y - rR}`,
      `Q${innerThighR.x} ${Math.min(innerThighR.y, biR.y - 2)} ${crotchCenter.x + 1} ${crotchCenter.y}`,
      `Q${innerThighL.x} ${Math.min(innerThighL.y, biL.y - 2)} ${biL.x} ${biL.y - rL}`,
      `Q${biL.x} ${biL.y} ${biL.x - rL} ${biL.y}`,
      `L${boL.x + rL} ${boL.y}`,
      `Q${boL.x} ${boL.y} ${boL.x} ${boL.y - rL}`,
      `Q${hipL.x - bulge * 0.5} ${(hipL.y + boL.y) / 2 + 6} ${hipL.x - bulge * 0.5} ${hipL.y}`,
      `C${hipL.x - 3 - bulge * 0.6} ${hipL.y - 12} ${wLeft - 3} ${wy + 18} ${wLeft} ${wy}Z`,
    ].join(' ');
  } else {
  // Полноценный замкнутый контур обоих штанин и пояса
  pantsPath = [
    // Пояс слева направо
    `M${wLeft} ${wy}`,
    `L${wRight} ${wy}`,
    // Правое бедро снаружи (с учётом полноты ляжки)
    `C${wRight + 3} ${wy + 18} ${hipR.x + 3 + bulge * 0.6} ${hipR.y - 12} ${hipR.x + bulge * 0.5} ${hipR.y}`,
    `C${hipR.x + bulge * 0.5} ${hipR.y + 36} ${koR.x + (o.breeches ? 8 : 3) + bulge} ${koR.y - 32} ${koR.x} ${koR.y}`,
    `L${aoR.x} ${aoR.y}`,
    // Низ правой штанины
    `L${aiR.x} ${aiR.y}`,
    // Внутренняя сторона правой ноги (голень → колено → ляжка)
    `L${kiR.x} ${kiR.y}`,
    `Q${innerThighR.x} ${innerThighR.y} ${crotchCenter.x + 1} ${crotchCenter.y}`,
    // Промежность соединяет штанины плавной дугой, переходя на левую ляжку
    `Q${innerThighL.x} ${innerThighL.y} ${kiL.x} ${kiL.y}`,
    // Внутренняя сторона левой ноги
    `L${aiL.x} ${aiL.y}`,
    // Низ левой штанины
    `L${aoL.x} ${aoL.y}`,
    // Наружная сторона левой ноги (щиколотка → колено → бедро, с учётом полноты)
    `L${koL.x} ${koL.y}`,
    `C${koL.x - (o.breeches ? 8 : 3) - bulge} ${koL.y - 32} ${hipL.x - bulge * 0.5} ${hipL.y + 36} ${hipL.x - bulge * 0.5} ${hipL.y}`,
    `C${hipL.x - 3 - bulge * 0.6} ${hipL.y - 12} ${wLeft - 3} ${wy + 18} ${wLeft} ${wy}Z`,
  ].join(' ');
  }

  const shade = 'rgba(0,0,0,0.18)';
  const light = 'rgba(255,255,255,0.14)';

  return (
    <LimbAwareLegwear rig={rig}>
      <g data-trousers>
      {/* Основное полотно брюк */}
      <path d={pantsPath} fill={color} {...outline} />

      {/* Паховая тень и шаговой шов */}
      <path
        d={`M${rig.crotch.x} ${wy + 8} L${rig.crotch.x} ${crotchCenter.y - 6} Q${rig.crotch.x} ${crotchCenter.y} ${rig.crotch.x} ${crotchCenter.y + 2}`}
        stroke={shade}
        strokeWidth={1.4}
        fill="none"
        strokeLinecap="round"
      />
      {/* Гульфик (отстрочка ширинки) */}
      <path
        d={`M${rig.crotch.x + 3.2} ${wy + 6} L${rig.crotch.x + 3.2} ${crotchCenter.y - 10} Q${rig.crotch.x + 3.2} ${crotchCenter.y - 3} ${rig.crotch.x} ${crotchCenter.y - 2}`}
        stroke={shade}
        strokeWidth={0.9}
        fill="none"
      />

      {/* Складки на ляжках у паха (у шорт не рисуем — уходят ниже среза) */}
      {!shortLeg && (
        <>
          <path
            d={`M${rig.crotch.x - 5} ${crotchCenter.y - 2} Q${innerThighL.x + 4} ${innerThighL.y - 4} ${kiL.x - 2} ${kiL.y - 14}`}
            stroke={shade}
            strokeWidth={0.8}
            fill="none"
            opacity={0.65}
          />
          <path
            d={`M${rig.crotch.x + 5} ${crotchCenter.y - 2} Q${innerThighR.x - 4} ${innerThighR.y - 4} ${kiR.x + 2} ${kiR.y - 14}`}
            stroke={shade}
            strokeWidth={0.8}
            fill="none"
            opacity={0.65}
          />
        </>
      )}

      {/* Стрелки брюк (crease) */}
      {o.crease && !shortLeg && (
        <g stroke={light} strokeWidth={1.1} fill="none" opacity={0.65}>
          <path d={`M${left.hip.x + 4} ${rig.hips[0].y + 14} L${left.knee.x} ${left.knee.y} L${left.ankle.x} ${ankleL - 5}`} />
          <path d={`M${right.hip.x - 4} ${rig.hips[1].y + 14} L${right.knee.x} ${right.knee.y} L${right.ankle.x} ${ankleR - 5}`} />
        </g>
      )}

      {/* Отделка пояса и пряжка */}
      {o.waistband && (
        <g>
          <path
            d={`M${wLeft - 1} ${wy - 1} L${wRight + 1} ${wy - 1} L${wRight + 1} ${wy + 11} L${wLeft - 1} ${wy + 11} Z`}
            fill={o.waistband}
            {...outline}
          />
          <rect x={rig.waist.x - 5} y={wy + 1} width={10} height={9} rx={1.5} fill="#c9a24b" stroke="rgba(0,0,0,0.4)" strokeWidth={0.6} />
        </g>
      )}
      </g>
    </LimbAwareLegwear>
  );
}

/* ═══════════ САПОГИ / ОБУВЬ ═══════════ */
export function boots(rig: FigureGeometry, color = '#241a12', topY = 452): ReactNode {
  return rig.legs.filter((leg) => !legAmputation(rig, leg.side)).map((leg) => (
    <g key={leg.side}>
      <path
        d={`M${leg.knee.x} ${topY + 2} L${leg.ankle.x} ${leg.ankle.y + 6}`}
        stroke={color}
        strokeWidth={leg.calfWidth * 2 + 5}
        strokeLinecap="butt"
        fill="none"
      />
      <path d={`M${leg.knee.x - leg.calfWidth - 2.5} ${topY + 6} L${leg.knee.x + leg.calfWidth + 2.5} ${topY + 6}`} stroke="rgba(255,255,255,0.14)" strokeWidth={2.2} />
      <path d={FOOT_OUTLINE} transform={`${leg.footTransform} scale(1.07)`} fill={color} stroke="rgba(0,0,0,0.45)" strokeWidth={0.7} />
      <path d={`M${leg.foot.x - leg.side * 4} ${leg.foot.y - 2} L${leg.foot.x + leg.side * 16} ${leg.foot.y + 2}`} stroke="rgba(255,255,255,0.1)" strokeWidth={1.6} />
    </g>
  ));
}

export type ShoeKind = 'oxford' | 'brogue' | 'maryjane' | 'tstrap' | 'pump' | 'laceboot' | 'clog' | 'espadrille' | 'mule' | 'loafer' | 'folk' | 'wedge' | 'gladiator' | 'peep' | 'fishskin' | 'plexiglas' | 'woodsole' | 'orthopedic';

export function shoes(rig: FigureGeometry, kind: ShoeKind): ReactNode {
  const c =
    kind === 'oxford' ? '#6b4423'
    : kind === 'maryjane' ? '#232323'
    : kind === 'tstrap' ? '#b5743a'
    : kind === 'laceboot' ? '#4a2f1b'
    : kind === 'brogue' ? '#efe4cc'
    : kind === 'clog' ? '#b08a4e'
    : kind === 'espadrille' ? '#e8ddc8'
    : kind === 'mule' ? '#8a5a3a'
    : kind === 'loafer' ? '#5a3a22'
    : kind === 'folk' ? '#7a4a22'
    : kind === 'wedge' ? '#b5743a'
    : kind === 'gladiator' ? '#a07840'
    : kind === 'peep' ? '#7a1f2b'
    : kind === 'fishskin' ? '#6a7a6a'
    : kind === 'plexiglas' ? '#d8e4e0'
    : kind === 'woodsole' ? '#8a6a3a'
    : kind === 'orthopedic' ? '#1c1b1e'
    : '#7a1f2b';
  // Открытая обувь: стопа (кожа) остаётся видна, рисуем лишь подошву/ремень
  const openBack = kind === 'gladiator' || kind === 'peep' || kind === 'mule';
  return rig.legs.filter((leg) => !legAmputation(rig, leg.side)).map((leg) => (
    <g key={leg.side} transform={leg.footTransform}>
      {kind === 'laceboot' && (
        <path d="M-7 -26 L7 -24 L8 4 L-8 4 Z" fill={c} {...outline} />
      )}
      {kind === 'orthopedic' && leg.side === 1 && (
        /* Правая нога: высокий ортопедический ботинок Геббельса с жестким берцем */
        <g>
          <path d="M-8 -26 L8 -24 L8 4 L-9 4 Z" fill="#18181a" {...outline} />
          {/* Боковая стальная шина жесткости */}
          <path d="M-5 -25 L-5 2" stroke="#b0b0b8" strokeWidth={1.4} fill="none" />
          <circle cx={-5} cy={-22} r={1.2} fill="#777" />
          <circle cx={-5} cy={-2} r={1.2} fill="#777" />
          {/* Высокая многослойная компенсаторная подошва (+14px) */}
          <path d="M-10 16.5 L30 16.5 L31 30.5 L-10 30.5 Z" fill="#5a3d24" stroke="#24170d" strokeWidth={0.8} />
          {/* Слои пробки и кожи */}
          <path d="M-9 20.5 L30 20.5 M-9 24.5 L30 24.5 M-9 28 L31 28" stroke="#8a6138" strokeWidth={0.6} opacity={0.75} />
          {/* Нижняя резиновая протекторная подошва */}
          <path d="M-11 30.5 L31.5 30.5 L31 33.5 L-11 33.5 Z" fill="#151517" stroke="#000" strokeWidth={0.7} />
          {/* Высокий каблук с металлической подковкой */}
          <path d="M-11 30.5 L-2 30.5 L-2 37.5 L-11 37.5 Z" fill="#1c1c1f" stroke="#000" strokeWidth={0.7} />
          <path d="M-10 37.5 L-2.5 37.5" stroke="#c0c0c0" strokeWidth={1.4} fill="none" />
        </g>
      )}
      {!openBack && <path d={FOOT_OUTLINE} fill={c} {...outline} />}
      {kind === 'oxford' && (
        <g fill="none">
          <path d="M12 -2 Q18 3 20 13" stroke="#3a2412" strokeWidth={1} />
          <path d="M2 -8 L10 -3 M2 -4 L10 1 M2 0 L10 5" stroke="#d9c39a" strokeWidth={0.8} />
          <path d="M-8 4 L-2 5" stroke="#3a2412" strokeWidth={1} />
        </g>
      )}
      {kind === 'brogue' && (
        <g>
          <path d="M14 -4 Q22 2 24 16 L29 14 Q30 16 25 17.6 L8 17.6 Q10 4 14 -4Z" fill="#5a3a22" />
          <path d="M-8 12 L-2 14 L-2 17.6 L-8 17.6Z" fill="#5a3a22" />
          {[8, 12, 16].map((x) => (
            <circle key={x} cx={x} cy={2} r={0.8} fill="#5a3a22" />
          ))}
        </g>
      )}
      {kind === 'maryjane' && (
        <g>
          <path d="M1 -10 L8 4" stroke={c} strokeWidth={3} />
          <circle cx={8} cy={1} r={1.5} fill="#c9a24b" />
        </g>
      )}
      {kind === 'tstrap' && (
        <g stroke={c} strokeWidth={2.4} fill="none">
          <path d="M2 -11 L9 4" />
          <path d="M-1 -4 L12 -2" />
        </g>
      )}
      {kind === 'pump' && (
        <g>
          <path d="M-8.6 8 L-10 19 L-4 19 L-3.4 10Z" fill="#3a0f14" />
          <path d="M-2 -8 Q8 -10 14 -2" stroke="#3a0f14" strokeWidth={1} fill="none" />
        </g>
      )}
      {kind === 'laceboot' && (
        <g stroke="#d9c39a" strokeWidth={0.9} fill="none">
          {[-20, -15, -10, -5].map((y) => (
            <path key={y} d={`M-4 ${y} L4 ${y + 2} M4 ${y} L-4 ${y + 2}`} />
          ))}
        </g>
      )}
      {kind === 'orthopedic' && (
        <g stroke="#c8bca0" strokeWidth={0.9} fill="none">
          {leg.side === -1 ? (
            /* Левый обычный полуботинок */
            <>
              <path d="M12 -2 Q18 3 20 13" stroke="#2a2a2a" strokeWidth={1} />
              <path d="M2 -8 L10 -3 M2 -4 L10 1 M2 0 L10 5" />
            </>
          ) : (
            /* Правый ортопедический высокий берц со шнуровкой */
            <>
              {[-22, -17, -12, -7, -2, 3].map((y) => (
                <g key={y}>
                  <path d={`M-5 ${y} L4 ${y + 2} M4 ${y} L-5 ${y + 2}`} />
                  <circle cx={-5} cy={y} r={0.7} fill="#c8bca0" />
                  <circle cx={4} cy={y + 2} r={0.7} fill="#c8bca0" />
                </g>
              ))}
            </>
          )}
        </g>
      )}
      {kind === 'clog' && (
        <g>
          {/* толстая деревянная подошва, выступающая за стопу */}
          <path d="M-11 15.5 L-11 21.5 Q-11 23.5 -9 23.5 L30 23.5 Q32.5 23.5 32.5 21 L32.5 16.5 Z" fill="#8a6a3a" stroke="#3f2d15" strokeWidth={0.8} />
          <path d="M-6 -12 Q0 -14.5 7 -11.5" stroke="#5a3f1e" strokeWidth={1.1} fill="none" />
          <path d="M-5 -7 Q1 -9.5 8 -5.5" stroke="#ead6a6" strokeWidth={0.9} fill="none" strokeDasharray="2.2 2" />
          <path d="M-8 16.5 L31 16.5" stroke="#3f2d15" strokeWidth={0.6} />
        </g>
      )}
      {kind === 'espadrille' && (
        <g>
          {/* джутовая подошва */}
          <path d="M-10 15.5 L-10 21 Q-10 22.5 -8 22.5 L30 22.5 Q32.5 22.5 32.5 20.5 L32.5 15.5 Z" fill="#c8a25a" stroke="#7a5a2a" strokeWidth={0.7} />
          <path d="M-9 17.8 L31 17.8 M-9 20 L31 20" stroke="#8a6a2e" strokeWidth={0.5} />
          {/* резиновый носок */}
          <path d="M24 14.5 Q29 15 29.4 15.8 L29.4 17.8 L24 17.8 Z" fill="#a8a59a" />
          <path d="M-6 -10 Q2 -12 9 -8" stroke="#c8b890" strokeWidth={0.9} fill="none" strokeDasharray="1.8 1.8" />
        </g>
      )}
      {kind === 'mule' && (
        <g>
          {/* подошва */}
          <path d="M-10 16.5 L30 16.5 L32.5 17.8 L32.5 19.4 L-10 19.4 Z" fill="#4a2f1b" stroke="rgba(0,0,0,0.4)" strokeWidth={0.6} />
          {/* верх без пятки: от мыска до середины, пятка открыта */}
          <path d="M-4 4 Q-6 12 -4 16.5 L30 16.5 Q32 16 31.5 13 L20 4 Q10 -8 -2 -10 Q-6 -6 -4 4 Z" fill={c} stroke="rgba(0,0,0,0.35)" strokeWidth={0.8} />
          <path d="M-2 -9 Q8 -7 18 3" stroke="rgba(255,255,255,0.18)" strokeWidth={0.9} fill="none" />
        </g>
      )}
      {kind === 'loafer' && (
        <g>
          {/* седло-ремень (blank strap) */}
          <path d="M0 -9 Q6 -11 11 -8 L13 -4 Q8 -7 2 -5 Q0 -7 0 -9 Z" fill="#3a2412" stroke="rgba(0,0,0,0.4)" strokeWidth={0.6} />
          <path d="M2 -5 L2 0 M11 -8 L12 -3" stroke="#3a2412" strokeWidth={0.8} />
          {/* низкая подошва */}
          <path d="M-10 17 L30 17 L30 18.6 L-10 18.6 Z" fill="#2a1a0e" />
        </g>
      )}
      {kind === 'folk' && (
        <g>
          {/* крестовая вышивка на мыске */}
          <g stroke="#e8d5a8" strokeWidth={0.7} fill="none">
            <path d="M8 -8 L14 -2 M14 -8 L8 -2" />
            <path d="M13 -3 L19 3 M19 -3 L13 3" />
          </g>
          <path d="M6 -10 Q14 -12 20 -8 L22 -4 Q14 -7 7 -6 Z" fill="none" stroke="#3f2d15" strokeWidth={0.7} />
          {/* низкий каблук */}
          <path d="M-9 15 L-4 15 L-4 19 L-9 19 Z" fill="#3f2d15" />
        </g>
      )}
      {kind === 'wedge' && (
        <g>
          {/* клинообразная подошва, толще на пятке */}
          <path d="M-10 15 L-10 21 L30 20 L30 17.6 L-10 17.6 Z" fill="#8a6a3a" stroke="#5a3f1e" strokeWidth={0.6} />
          <path d="M-6 -8 Q6 -11 16 -7" stroke="#d9c39a" strokeWidth={0.8} fill="none" strokeDasharray="2 2" />
        </g>
      )}
      {kind === 'gladiator' && (
        <g>
          <path d="M-10 17.6 L30 17.6 L30 19 L-10 19 Z" fill={c} stroke="rgba(0,0,0,0.4)" strokeWidth={0.5} />
          {[-2, 3, 8, 13, 18].map((x) => (
            <path key={x} d={`M${x} -8 L${x + 2} 17`} stroke={c} strokeWidth={1.3} />
          ))}
          <path d="M-6 2 L26 2" stroke={c} strokeWidth={1.4} />
        </g>
      )}
      {kind === 'peep' && (
        <g>
          <path d="M-8.6 8 L-10 19 L-4 19 L-3.4 10Z" fill="#7a1f2b" />
          {/* тонкая подошва на всю стопу */}
          <path d="M-10 17.6 L30 17.6 L30 19 L-10 19 Z" fill={c} stroke="rgba(0,0,0,0.3)" strokeWidth={0.5} />
          {/* верх до середины, мысок открыт (пальцы видны) */}
          <path d="M-9 16.5 L-9 6 Q-8 0 -2 -4 L14 -6 Q16 -1 15 4 L14 12 Q14 16.5 12 16.5 Z" fill={c} stroke="rgba(0,0,0,0.35)" strokeWidth={0.8} />
          <path d="M-2 -5 Q8 -7 15 3" stroke="rgba(255,255,255,0.18)" strokeWidth={0.8} fill="none" />
        </g>
      )}
      {kind === 'fishskin' && (
        <g>
          {/* чешуйчатая фактура рыбьей кожи */}
          {Array.from({ length: 22 }, (_, i) => {
            const col = i % 4;
            const row = Math.floor(i / 4);
            const x = -6 + col * 8 + (row % 2) * 4;
            const y = -8 + row * 6;
            return <circle key={i} cx={x} cy={y} r={2.4} fill="none" stroke="#4a5a4a" strokeWidth={0.5} opacity={0.6} />;
          })}
          {/* деревянная подошва */}
          <path d="M-10 17 L30 17 L30 19 L-10 19 Z" fill="#8a6a3a" stroke="#5a3f1e" strokeWidth={0.5} />
          <path d="M-6 -8 Q4 -10 12 -6" stroke="#d9c39a" strokeWidth={0.7} fill="none" />
        </g>
      )}
      {kind === 'plexiglas' && (
        <g>
          {/* прозрачная подошва из плексигласа */}
          <path d="M-10 16.5 L30 16.5 L32 17.8 L32 19.4 L-10 19.4 Z" fill={c} stroke="rgba(120,150,145,0.5)" strokeWidth={0.5} opacity={0.75} />
          {/* блик пластика */}
          <path d="M-8 17.4 L28 17.4" stroke="#ffffff" strokeWidth={0.5} opacity={0.5} />
          <path d="M-9 18.6 L29 18.6" stroke="#ffffff" strokeWidth={0.3} opacity={0.3} />
          {/* прозрачный верх */}
          <path d="M-8 16.5 L-8 4 Q-6 -4 2 -8 L14 -6 Q16 -2 15 4 L14 12 Q14 16.5 12 16.5 Z" fill={c} stroke="rgba(120,150,145,0.6)" strokeWidth={0.7} opacity={0.6} />
          <path d="M-2 -6 Q8 -8 14 2" stroke="#ffffff" strokeWidth={0.7} opacity={0.4} fill="none" />
        </g>
      )}
      {kind === 'woodsole' && (
        <g>
          {/* деревянная подошва-платформа */}
          <path d="M-11 15.5 L-11 21.5 Q-11 23 -9 23 L30 23 Q32 23 32 21 L32 16.5 Z" fill="#8a6a3a" stroke="#3f2d15" strokeWidth={0.8} />
          <path d="M-8 16.5 L31 16.5" stroke="#3f2d15" strokeWidth={0.6} />
          {/* тканевый верх */}
          <path d="M-6 -10 Q4 -13 12 -9 L14 -2 Q6 -6 -2 -4 Q-6 -2 -6 -10 Z" fill="#6a5a3a" stroke="rgba(0,0,0,0.3)" strokeWidth={0.6} />
          <path d="M0 -8 Q6 -10 11 -7" stroke="#d9c39a" strokeWidth={0.7} fill="none" strokeDasharray="1.8 1.8" />
        </g>
      )}
    </g>
  ));
}

/* ═══════════ ПЕРЧАТКИ ═══════════ */
export function gloves(rig: FigureGeometry, color: string, cuffColor?: string): ReactNode {
  return rig.arms.filter((arm) => !armAmputation(rig, arm.side)).map((arm, i) => (
    <g key={i} transform={arm.handTransform}>
      <rect x={-7.5} y={-18} width={15} height={9} rx={2} fill={cuffColor ?? color} stroke="rgba(0,0,0,0.3)" strokeWidth={0.5} />
      <path d={HAND_OUTLINE} fill={color} {...outline} />
      <path d="M-4 -2 L-5 12 M0 -3 L0 14 M4 -2 L5 12" stroke="rgba(0,0,0,0.3)" strokeWidth={0.9} fill="none" />
    </g>
  ));
}

/* ═══════════ ДЕТАЛИ ═══════════ */
export function standCollar(rig: FigureGeometry, color: string, piping?: string): ReactNode {
  const nh = rig.neckHalf + 4;
  return (
    <g>
      <path d={`M${150 - nh} 118 L${150 - nh + 3} 134 Q150 143 ${150 + nh - 3} 134 L${150 + nh} 118 Q150 127 ${150 - nh} 118Z`} fill={color} stroke="rgba(0,0,0,0.3)" strokeWidth={0.6} />
      {piping && <path d={`M${150 - nh + 3} 134 Q150 143 ${150 + nh - 3} 134`} stroke={piping} strokeWidth={1.2} fill="none" />}
    </g>
  );
}

export function belt(rig: FigureGeometry, leather: string, buckle: string, buckleInner?: string): ReactNode {
  const w = rig.waistHalf + 6;
  return (
    <g>
      <rect x={rig.waist.x - w} y={rig.waist.y - 2} width={w * 2} height={9} rx={1.5} fill={leather} stroke="rgba(0,0,0,0.4)" strokeWidth={0.6} />
      <path d={`M${rig.waist.x - w} ${rig.waist.y} L${rig.waist.x + w} ${rig.waist.y}`} stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
      <rect x={rig.waist.x - 6} y={rig.waist.y - 3.5} width={12} height={12} rx={1.5} fill={buckle} stroke="rgba(0,0,0,0.45)" strokeWidth={0.7} />
      <rect x={rig.waist.x - 4} y={rig.waist.y - 1.5} width={8} height={8} rx={1} fill="none" stroke={buckleInner ?? 'rgba(0,0,0,0.5)'} strokeWidth={0.9} />
      <circle cx={rig.waist.x} cy={rig.waist.y + 2.5} r={1.4} fill={buckleInner ?? 'rgba(0,0,0,0.55)'} />
    </g>
  );
}

export function neckerchief(rig: FigureGeometry, color: string, knot?: string): ReactNode {
  const nh = rig.neckHalf + 7;
  return (
    <g>
      <path d={`M${150 - nh} 119 Q150 128 ${150 + nh} 119 L${150 + 4} 162 Q150 165 ${150 - 4} 162 Z`} fill={color} {...outline} />
      <circle cx={150} cy={152} r={3.4} fill={knot ?? color} stroke="rgba(0,0,0,0.4)" strokeWidth={0.6} />
    </g>
  );
}

/** нарукавная повязка: перпендикулярна оси руки, следует за позой */
export function armband(rig: FigureGeometry, armIdx: 0 | 1, bg: string, emblem?: ReactNode, t = 0.4): ReactNode {
  const a = rig.arms[armIdx];
  const p = between(a.shoulder, a.elbow, t);
  const ang = Math.atan2(a.elbow.y - a.shoulder.y, a.elbow.x - a.shoulder.x) * 180 / Math.PI;
  const w = (rig.female ? 21 : 25) + 2;
  return (
    <g transform={`translate(${p.x} ${p.y}) rotate(${ang - 90})`}>
      <rect x={-w / 2} y={-7.5} width={w} height={15} fill={bg} stroke="rgba(0,0,0,0.35)" strokeWidth={0.6} />
      <path d={`M${-w / 2} -5.5 L${w / 2} -5.5 M${-w / 2} 5.5 L${w / 2} 5.5`} stroke="rgba(255,255,255,0.25)" strokeWidth={0.7} />
      {emblem}
    </g>
  );
}

/* ═══════════ ЭМБЛЕМЫ (стилизованные) ═══════════ */
export const eagle = (cx: number, cy: number, s: number, color: string): ReactNode => (
  <g fill={color}>
    <path
      d={`M${cx - 6 * s} ${cy - 1.4 * s} Q${cx - 2.2 * s} ${cy - 4.6 * s} ${cx} ${cy - 1.8 * s} Q${cx + 2.2 * s} ${cy - 4.6 * s} ${cx + 6 * s} ${cy - 1.4 * s} Q${cx + 2.6 * s} ${cy - 1.1 * s} ${cx + 1.7 * s} ${cy + 0.7 * s} L${cx} ${cy + 4 * s} L${cx - 1.7 * s} ${cy + 0.7 * s} Q${cx - 2.6 * s} ${cy - 1.1 * s} ${cx - 6 * s} ${cy - 1.4 * s}Z`}
    />
    <circle cx={cx} cy={cy - 2.3 * s} r={0.9 * s} />
    <ellipse cx={cx} cy={cy + 4.6 * s} rx={2.2 * s} ry={1.1 * s} fill="none" stroke={color} strokeWidth={0.5 * s} />
  </g>
);

const crossPattee = (cx: number, cy: number, a: number) =>
  [
    `M${cx - 0.32 * a} ${cy - 0.2 * a} L${cx - 0.66 * a} ${cy - 1.08 * a} L${cx + 0.66 * a} ${cy - 1.08 * a} L${cx + 0.32 * a} ${cy - 0.2 * a} Z`,
    `M${cx + 0.2 * a} ${cy - 0.32 * a} L${cx + 1.08 * a} ${cy - 0.66 * a} L${cx + 1.08 * a} ${cy + 0.66 * a} L${cx + 0.2 * a} ${cy + 0.32 * a} Z`,
    `M${cx - 0.32 * a} ${cy + 0.2 * a} L${cx - 0.66 * a} ${cy + 1.08 * a} L${cx + 0.66 * a} ${cy + 1.08 * a} L${cx + 0.32 * a} ${cy + 0.2 * a} Z`,
    `M${cx - 0.2 * a} ${cy - 0.32 * a} L${cx - 1.08 * a} ${cy - 0.66 * a} L${cx - 1.08 * a} ${cy + 0.66 * a} L${cx - 0.2 * a} ${cy + 0.32 * a} Z`,
    `M${cx - 0.34 * a} ${cy - 0.34 * a} h${0.68 * a} v${0.68 * a} h${-0.68 * a} Z`,
  ].join(' ');

export const ironCross = (cx: number, cy: number, s: number, rim = '#d3d3cd', core = '#17181c'): ReactNode => (
  <g>
    <path d={crossPattee(cx, cy, s * 1.16)} fill={rim} stroke="rgba(0,0,0,0.5)" strokeWidth={0.3} />
    <path d={crossPattee(cx, cy, s)} fill={core} />
  </g>
);

/** муаровая лента: вертикальные полоски */
export const ribbon = (cx: number, cy: number, w: number, h: number, stripes: string[]): ReactNode => {
  const sw = w / stripes.length;
  return (
    <g>
      {stripes.map((c, i) => (
        <rect key={i} x={cx - w / 2 + i * sw} y={cy - h / 2} width={sw + 0.2} height={h} fill={c} />
      ))}
      <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} fill="none" stroke="rgba(0,0,0,0.45)" strokeWidth={0.4} />
    </g>
  );
};

export const wreathBadge = (cx: number, cy: number, rx: number, ry: number, color: string, center: ReactNode): ReactNode => (
  <g>
    <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={color} strokeWidth={1.6} />
    <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth={0.4} strokeDasharray="1.2 1" />
    {center}
  </g>
);

/* ═══════════ ЧУЛКИ / КОЛГОТКИ ═══════════
   Строятся точно по контурам ног рига (outer/inner), поэтому струятся по ляжкам,
   коленям и икрам при любой позе и полноте. */
const cub = (s: { b: { x: number; y: number }; c: { x: number; y: number }; d: { x: number; y: number } }) =>
  `C${s.b.x} ${s.b.y} ${s.c.x} ${s.c.y} ${s.d.x} ${s.d.y}`;

export interface StockingOpts {
  /** верх чулка: доля бедра 0..1 (0.4 = середина бедра, 1 = до паха) */
  top?: number;
  /** полупрозрачный тон капрона */
  tone?: string;
  /** задний шов */
  seam?: boolean;
  /** кружевная оборка по верху */
  lace?: boolean;
  /** узор «сетка» */
  fishnet?: boolean;
  /** цвет резинки/оборки */
  band?: string;
  /** длина: до щиколотки (false) или выше колена (knee) */
  length?: 'full' | 'knee';
}

/** Точная точка верхней кромки чулка на ноге (для подвязок): наружная, внутренняя и середина */
export function stockingTop(leg: FigureGeometry['legs'][0], top = 0.42) {
  const bez = (s: typeof leg.outer[0], u: number) => {
    const v = 1 - u;
    return {
      x: v * v * v * s.a.x + 3 * v * v * u * s.b.x + 3 * v * u * u * s.c.x + u * u * u * s.d.x,
      y: v * v * v * s.a.y + 3 * v * v * u * s.b.y + 3 * v * u * u * s.c.y + u * u * u * s.d.y,
    };
  };
  const outer = bez(leg.outer[0], top);
  const inner = bez(leg.inner[2], 1 - top);
  const y = (outer.y + inner.y) / 2;
  return { outer: { x: outer.x, y }, inner: { x: inner.x, y }, y, mid: { x: (outer.x + inner.x) / 2, y } };
}

export function stockings(rig: FigureGeometry, o: StockingOpts = {}): ReactNode {
  const tone = o.tone ?? 'rgba(112,72,52,0.36)';
  const band = o.band ?? 'rgba(80,48,36,0.5)';
  const kneeStop = o.length === 'knee';
  return rig.legs.filter((leg) => !legAmputation(rig, leg.side)).map((leg) => {
    if (kneeStop) {
      // Гольфы: от чуть ниже колена до стопы
      const t = o.top ?? 0.18; // насколько низко от колена начинается верх гольфа
      const [, o2, o3] = leg.outer; // колено→икра→щиколотка
      const [i1, i2] = leg.inner;  // щиколотка→икра→колено
      const bez = (s: typeof o2, u: number) => {
        const v = 1 - u;
        return {
          x: v * v * v * s.a.x + 3 * v * v * u * s.b.x + 3 * v * u * u * s.c.x + u * u * u * s.d.x,
          y: v * v * v * s.a.y + 3 * v * v * u * s.b.y + 3 * v * u * u * s.c.y + u * u * u * s.d.y,
        };
      };
      const topO = bez(o2, t);
      const topI = bez(i2, t);
      const topY = (topO.y + topI.y) / 2;
      const d = [
        `M${topO.x} ${topY}`,
        `Q${(topO.x + o2.d.x) / 2 + leg.side * 2} ${(topY + o2.d.y) / 2} ${o2.d.x} ${o2.d.y}`,
        cub(o3),
        `L${i1.a.x} ${i1.a.y}`,
        cub(i1),
        `Q${(i2.a.x + topI.x) / 2 - leg.side * 2} ${(i2.a.y + topY) / 2} ${topI.x} ${topY}`,
        'Z',
      ].join(' ');
      return (
        <g key={leg.side} data-socks>
          <path d={d} fill={tone} />
          {/* Стопа полностью покрыта капроном/тканью */}
          <path d={FOOT_OUTLINE} transform={leg.footTransform} fill={tone} />
          <path d={`M${topO.x} ${topY} L${topI.x} ${topY}`} stroke={band} strokeWidth={4} strokeLinecap="round" />
          {o.lace && laceEdge(topO.x, topI.x, topY, band)}
          <path d={`M${topO.x + leg.side * 2} ${topY + 4} L${leg.ankle.x + leg.side * 2} ${leg.ankle.y - 14}`} stroke="rgba(255,245,235,0.22)" strokeWidth={2} fill="none" strokeLinecap="round" />
        </g>
      );
    }

    const [o1, o2, o3] = leg.outer;
    const [i1, i2, i3] = leg.inner;
    const side = leg.side;
    // Верх чулка: доля бедра 0..1, по умолчанию 0.42
    const t = o.top ?? 0.42;
    // Точка на кубической Безье
    const bez = (s: typeof o1, u: number) => {
        const v = 1 - u;
        return {
          x: v * v * v * s.a.x + 3 * v * v * u * s.b.x + 3 * v * u * u * s.c.x + u * u * u * s.d.x,
          y: v * v * v * s.a.y + 3 * v * v * u * s.b.y + 3 * v * u * u * s.c.y + u * u * u * s.d.y,
        };
      };
    // Верхняя кромка: срез наружной (o1: таз→колено) и внутренней (i3: колено→пах, идём с конца) кривых
    const outerTop = bez(o1, t);
    const innerTop = bez(i3, 1 - t);
    const topY = (outerTop.y + innerTop.y) / 2;
    const outerX = outerTop.x;
    const innerTopX = innerTop.x;

    const d = [
      `M${outerX} ${topY}`,
      // вниз по наружной стороне: остаток бедра → колено → икра → щиколотка
      `Q${(outerTop.x + o1.d.x) / 2 + side * 2} ${(topY + o1.d.y) / 2} ${o1.d.x} ${o1.d.y}`,
      cub(o2),
      cub(o3),
      // стопа: перехват через подъём
      `L${i1.a.x} ${i1.a.y}`,
      // вверх по внутренней: щиколотка → икра → колено → ляжка
      cub(i1),
      cub(i2),
      `Q${(i3.a.x + innerTop.x) / 2 - side * 2} ${(i3.a.y + topY) / 2} ${innerTopX} ${topY}`,
      'Z',
    ].join(' ');

    // шов сзади (посередине голени и бедра)
    const seam = `M${between(leg.hip, leg.knee, t + 0.02).x} ${topY + 2} L${leg.knee.x} ${leg.knee.y} L${leg.ankle.x} ${leg.ankle.y + 2}`;
    // блик капрона по внешней стороне икры
    const gloss = `M${leg.knee.x + side * (leg.kneeWidth * 0.45)} ${leg.knee.y + 14} Q${leg.calf.x + side * (leg.calfWidth * 0.55)} ${leg.calf.y + 10} ${leg.ankle.x + side * 2} ${leg.ankle.y - 18}`;

    return (
      <g key={side} data-stockings>
        <path d={d} fill={tone} />
        {/* Стопа полностью покрыта капроном чулка */}
        <path d={FOOT_OUTLINE} transform={leg.footTransform} fill={tone} />
        {/* уплотнённая резинка / кромка чулка */}
        <path d={`M${outerX} ${topY} L${innerTopX} ${topY}`} stroke={band} strokeWidth={3} strokeLinecap="round" />
        <path d={`M${outerX} ${topY - 1.3} L${innerTopX} ${topY - 1.3}`} stroke="rgba(255,240,230,0.25)" strokeWidth={0.8} />
        {o.lace && laceEdge(outerX, innerTopX, topY, band)}
        {o.fishnet && fishnetPattern(outerX, innerTopX, topY, leg)}
        {o.seam !== false && <path d={seam} stroke="rgba(70,40,30,0.32)" strokeWidth={0.7} fill="none" strokeLinecap="round" />}
        <path d={gloss} stroke="rgba(255,245,235,0.28)" strokeWidth={2} fill="none" strokeLinecap="round" />
      </g>
    );
  });
}

/* Кружевная оборка по верхней кромке чулка */
function laceEdge(x1: number, x2: number, y: number, color: string): ReactNode {
  const width = Math.abs(x2 - x1);
  const n = Math.max(3, Math.round(width / 6));
  const left = Math.min(x1, x2);
  const dir = x2 > x1 ? 1 : -1;
  return (
    <g>
      {Array.from({ length: n }).map((_, i) => {
        const x = left + (width / n) * i;
        return (
          <circle key={i} cx={x} cy={y - 3} r={2.6} fill="none" stroke={color} strokeWidth={0.9} opacity={0.7} transform={`scale(${dir} 1) translate(${dir === -1 ? -(x * 2) : 0} 0)`} />
        );
      })}
      <path d={`M${left} ${y - 4} Q${left + width / 2} ${y + 2} ${left + width} ${y - 4}`} stroke={color} strokeWidth={0.8} fill="none" opacity={0.8} />
    </g>
  );
}

/* Сетка-стрейч поверх чулка */
function fishnetPattern(x1: number, x2: number, yTop: number, leg: { ankle: { x: number; y: number }; calf: { x: number; y: number } }): ReactNode {
  const left = Math.min(x1, x2);
  const width = Math.abs(x2 - x1);
  const yBot = leg.ankle.y;
  const rows = 8;
  const cols = 3;
  const dark = 'rgba(60,36,30,0.18)';
  return (
    <g stroke={dark} strokeWidth={0.4}>
      {Array.from({ length: rows + 1 }).map((_, r) => {
        const y = yTop + ((yBot - yTop) / rows) * r;
        const w = width * (1 - r / (rows + 4));
        const cx = (x1 + x2) / 2;
        return <path key={`r${r}`} d={`M${cx - w / 2} ${y} L${cx + w / 2} ${y}`} opacity={0.9} />;
      })}
      {Array.from({ length: cols }).map((_, c) => {
        const u = (c + 1) / (cols + 1);
        const xTop = left + width * u;
        const cx = (x1 + x2) / 2;
        const xBot = cx + (xTop - cx) * 0.4;
        return <path key={`c${c}`} d={`M${xTop} ${yTop} L${xBot} ${yBot}`} opacity={0.8} />;
      })}
    </g>
  );
}

/* ═══════════ ГРАЖДАНСКИЕ ПЛАТЬЯ (единый конструктор) ═══════════
   Лиф + юбка цельнокроеные, с разными вырезами, рукавами, фартуком и
   национальными акцентами (дирндль, финское, японское, французское и т.п.) */
export type DressNeckline = 'round' | 'v' | 'square' | 'peterpan' | 'sweetheart' | 'high';

export interface CivilianDressOpts {
  bodice: string;
  skirt: string;
  /** цвет рукавов; по умолчанию как лиф */
  sleeves?: string;
  /** ширина рукава */
  sleeveWidth?: number;
  /** короткий рукав: доля плеча (0.4–0.6); не задано — длинный */
  shortSleeve?: number;
  /** длинный рукав до запястья */
  longSleeve?: boolean;
  /** без рукавов (бретельный/вечерний лиф) */
  sleeveless?: boolean;
  /** низ подола */
  hem?: number;
  /** полуширина расклёшенной юбки */
  flare?: number;
  /** прямая/узкая юбка вместо клёш */
  pencil?: boolean;
  neckline?: DressNeckline;
  /** отступ горловины вниз */
  neckDrop?: number;
  /** цвет белого/контрастного воротничка */
  collarColor?: string;
  /** цвет отстрочки/оборок/тесьмы */
  trim?: string;
  /** цвет пуговиц (ряд по лифу) */
  buttons?: string;
  /** число пуговиц */
  buttonCount?: number;
  /** узкий пояс по талии */
  belt?: string;
  /** широкий кушак/съёмный пояс */
  sash?: string;
  /** фартук поверх юбки (дирндль) */
  apron?: string;
  /** тесьма/оборка по фартуку */
  apronTrim?: string;
  /** бантик фартука сзади/сбоку */
  apronBow?: string;
  /** узор внутри юбки (полосы, вышивка) */
  skirtPattern?: ReactNode;
  /** узор/детали на лифе */
  bodiceDetail?: ReactNode;
  /** оборка по подолу */
  hemRuffle?: string;
  /** манжеты контрастные */
  cuffColor?: string;
  /** мягкие складки/сборки на юбке */
  pleats?: boolean;
}

export function civilianDress(rig: FigureGeometry, o: CivilianDressOpts): ReactNode {
  const bodice = o.bodice;
  const skirtColor = o.skirt;
  const sleeveColor = o.sleeves ?? bodice;
  const hem = o.hem ?? 438;
  const flare = o.flare ?? 58;
  const waistY = rig.waist.y + 11;
  const neckline = o.neckline ?? 'round';
  const neckDrop = o.neckDrop ?? (neckline === 'high' ? 122 : neckline === 'v' ? 140 : neckline === 'square' ? 136 : 132);
  const bare = neckline === 'v' || neckline === 'square' || neckline === 'sweetheart';
  const bareHalf = neckline === 'square' ? rig.chestHalf * 0.62 : rig.chestHalf * 0.5;

  // Рукава (компактный окат плеча, чтобы не торчал за узким лифом)
  const sleeveNode = o.sleeveless
    ? null
    : o.longSleeve
      ? sleeves(rig, sleeveColor, o.sleeveWidth ?? 21, { cuff: !!o.cuffColor, cuffColor: o.cuffColor, capPad: 1 })
      : sleeves(rig, sleeveColor, o.sleeveWidth ?? 21, { short: o.shortSleeve ?? 0.52, cuff: !!o.cuffColor, cuffColor: o.cuffColor, capPad: 1 });

  // Лиф: плечи → талия (при открытом вырезе плечи остаются закрытыми)
  const bodicePath = torsoPath(rig, {
    hem: waistY,
    hemHalf: rig.waistHalf + 2.5,
    neckDrop,
    bare,
    bareHalf,
    coverShoulders: bare,
    shoulderEase: 6,
    chestEase: 1.07,
    waistEase: 1.04,
    hipEase: 1.18,
  });

  // Юбка от талии — щедрый hipEase, чтобы ткань накрывала бёдра, а не вырезалась в них
  const skirtPathStr = skirtPath(rig, {
    hem,
    flare: o.pencil ? 8 : flare,
    pencil: o.pencil,
  });

  // Горловина поверх лифа
  const collar = (() => {
    if (!o.collarColor && !(neckline === 'peterpan' || neckline === 'high')) return null;
    const c = o.collarColor ?? shadeText(skirtColor);
    if (neckline === 'peterpan') {
      // белый круглый воротничок «питер пэн»
      return (
        <g>
          <ellipse cx={rig.chest.x - 9} cy={133} rx={10} ry={6.5} transform={`rotate(-18 ${rig.chest.x - 9} 133)`} fill={c} {...outline} />
          <ellipse cx={rig.chest.x + 9} cy={133} rx={10} ry={6.5} transform={`rotate(18 ${rig.chest.x + 9} 133)`} fill={c} {...outline} />
        </g>
      );
    }
    if (neckline === 'high') {
      return neckBand(rig, c, { height: 129, drop: 136, trim: o.trim });
    }
    return null;
  })();

  // Вырез-обработка (тесьма)
  const neckTrim = o.trim ? (
    <path
      d={
        neckline === 'v'
          ? `M${rig.chest.x - rig.chestHalf * 0.5} ${neckDrop} Q${rig.chest.x} ${neckDrop + 14} ${rig.chest.x + rig.chestHalf * 0.5} ${neckDrop}`
          : neckline === 'square'
            ? `M${rig.chest.x - bareHalf} ${neckDrop} H${rig.chest.x + bareHalf}`
            : `M${rig.chest.x - rig.chestHalf * 0.52} ${neckDrop - 3} Q${rig.chest.x} ${neckDrop + 9} ${rig.chest.x + rig.chestHalf * 0.52} ${neckDrop - 3}`
      }
      fill="none"
      stroke={o.trim}
      strokeWidth={2}
      opacity={0.85}
    />
  ) : null;

  // Пуговицы по лифу
  const buttonNodes = o.buttons
    ? Array.from({ length: o.buttonCount ?? 5 }, (_, i) => {
        const y = 138 + i * ((waistY - 142) / Math.max(1, (o.buttonCount ?? 5) - 1));
        return <circle key={i} cx={rig.chest.x} cy={y} r={1.7} fill={o.buttons} stroke="rgba(0,0,0,0.35)" strokeWidth={0.4} />;
      })
    : null;

  // Пояс / кушак
  const beltNode = o.belt
    ? <rect x={rig.waist.x - rig.waistHalf - 5} y={waistY - 4} width={(rig.waistHalf + 5) * 2} height={8} fill={o.belt} {...outline} />
    : null;
  const sashNode = o.sash ? (
    <g>
      <path d={`M${rig.waist.x - rig.waistHalf - 7} ${waistY - 6} Q${rig.waist.x} ${waistY - 2} ${rig.waist.x + rig.waistHalf + 7} ${waistY - 6} L${rig.waist.x + rig.waistHalf + 7} ${waistY + 5} Q${rig.waist.x} ${waistY + 9} ${rig.waist.x - rig.waistHalf - 7} ${waistY + 5} Z`} fill={o.sash} {...outline} />
      <circle cx={rig.waist.x + rig.waistHalf * 0.7} cy={waistY} r={3} fill={o.sash} stroke="rgba(0,0,0,0.3)" strokeWidth={0.5} />
    </g>
  ) : null;

  // Фартук (дирндль)
  const apronNode = o.apron ? (
    <g>
      <path
        d={`M${rig.waist.x - rig.waistHalf * 0.55} ${waistY - 2} L${rig.waist.x + rig.waistHalf * 0.55} ${waistY - 2} L${rig.waist.x + flare * 0.72} ${hem - 4} Q${rig.waist.x} ${hem + 2} ${rig.waist.x - flare * 0.72} ${hem - 4} Z`}
        fill={o.apron}
        {...outline}
      />
      {o.apronTrim && (
        <>
          <path d={`M${rig.waist.x - rig.waistHalf * 0.55} ${waistY - 2} L${rig.waist.x + rig.waistHalf * 0.55} ${waistY - 2}`} stroke={o.apronTrim} strokeWidth={3} />
          <path d={`M${rig.waist.x - flare * 0.72} ${hem - 4} Q${rig.waist.x} ${hem + 2} ${rig.waist.x + flare * 0.72} ${hem - 4}`} stroke={o.apronTrim} strokeWidth={3} fill="none" />
        </>
      )}
      {o.apronBow && (
        <g transform={`translate(${rig.waist.x + rig.waistHalf * 0.5} ${waistY - 2})`}>
          <path d="M0 0 Q-9 -6 -12 -1 Q-9 4 0 2 Z" fill={o.apronBow} {...outline} />
          <path d="M0 0 Q9 -6 12 -1 Q9 4 0 2 Z" fill={o.apronBow} {...outline} />
          <circle cx={0} cy={1} r={2} fill={o.apronBow} stroke="rgba(0,0,0,0.35)" strokeWidth={0.4} />
        </g>
      )}
    </g>
  ) : null;

  // Оборка по подолу
  const ruffleNode = o.hemRuffle ? (
    <g>
      <path d={`M${rig.crotch.x - flare} ${hem - 5} Q${rig.crotch.x - flare * 0.5} ${hem + 1} ${rig.crotch.x} ${hem - 4} T${rig.crotch.x + flare} ${hem - 5}`} fill="none" stroke={o.hemRuffle} strokeWidth={5} strokeLinecap="round" opacity={0.95} />
      {Array.from({ length: 14 }, (_, i) => {
        const x = rig.crotch.x - flare + (i * (2 * flare)) / 13;
        return <path key={i} d={`M${x} ${hem - 5} q2 4 0 7`} stroke={o.hemRuffle} strokeWidth={3} fill="none" opacity={0.7} />;
      })}
    </g>
  ) : null;

  // Сборки на юбке
  const pleatNodes = o.pleats
    ? Array.from({ length: 9 }, (_, i) => {
        const t = i / 8;
        const xTop = rig.waist.x - rig.waistHalf + 6 + t * (2 * (rig.waistHalf - 6));
        const xBot = rig.crotch.x - flare + 8 + t * (2 * (flare - 8));
        return <path key={i} d={`M${xTop} ${waistY + 4} Q${(xTop + xBot) / 2} ${(waistY + hem) / 2} ${xBot} ${hem - 6}`} stroke="rgba(0,0,0,0.16)" strokeWidth={0.9} fill="none" />;
      })
    : null;

  return (
    <g data-civilian-dress>
      {sleeveNode}
      {/* Юбка под лифом */}
      <path d={skirtPathStr} fill={skirtColor} {...outline} />
      {o.skirtPattern && <Clipped d={skirtPathStr}>{o.skirtPattern}</Clipped>}
      {pleatNodes}
      {/* Лиф */}
      <path d={bodicePath} fill={bodice} {...outline} />
      {o.bodiceDetail && <Clipped d={bodicePath}>{o.bodiceDetail}</Clipped>}
      {neckTrim}
      {collar}
      {buttonNodes}
      {beltNode}
      {sashNode}
      {apronNode}
      {ruffleNode}
    </g>
  );
}

/** подбор тёмного текстового/контурного оттенка к ткани */
function shadeText(color: string): string {
  return `color-mix(in srgb, ${color} 72%, black)`;
}
