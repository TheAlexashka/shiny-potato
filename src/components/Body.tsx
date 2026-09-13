import { memo, useId } from 'react';
import type { BodySel, FaceSel, Gender, PoseId } from '../data/types';
import { DEFAULT_BODY } from '../data/types';
import { FOOT_OUTLINE, HAND_OUTLINE, between, getFigureGeometry, type ArmGeometry, type LegGeometry } from '../data/figureGeometry';
import { armAmputation, legAmputation } from '../data/limbs';
import { BodyMarks } from './BodyMarks';
import { Head } from './Face';

interface Props {
  gender: Gender;
  skin: string;
  hairColor: string;
  face: FaceSel;
  body?: BodySel;
  pose?: PoseId;
  uid?: string;
  /** рисовать ли голову внутри тела (false — голова выводится отдельным слоем поверх одежды) */
  withHead?: boolean;
}

/** 0 — светлая кожа (нежный контур), 1 — тёмная кожа (выраженная тень) */
function skinShadowStrength(skin: string): number {
  const hex = skin.replace('#', '');
  if (hex.length < 6) return 0.5;
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return Math.max(0, Math.min(1, (0.72 - lum) / 0.38));
}

const cubic = (segment: LegGeometry['outer'][number]) =>
  `C${segment.b.x} ${segment.b.y} ${segment.c.x} ${segment.c.y} ${segment.d.x} ${segment.d.y}`;

/** Exact part of a leg removed from the continuous body silhouette. */
function legRemovalPath(leg: LegGeometry, level: 'knee' | 'hip'): string {
  if (level === 'knee') {
    return [
      `M${leg.outer[1].a.x} ${leg.outer[1].a.y}`,
      ...leg.outer.slice(1).map(cubic),
      `L${leg.inner[0].a.x} ${leg.inner[0].a.y}`,
      ...leg.inner.slice(0, 2).map(cubic),
      'Z',
    ].join(' ');
  }
  return [
    `M${leg.outer[0].a.x} ${leg.outer[0].a.y}`,
    ...leg.outer.map(cubic),
    `L${leg.inner[0].a.x} ${leg.inner[0].a.y}`,
    ...leg.inner.map(cubic),
    'Z',
  ].join(' ');
}

function Hand({
  arm,
  skin,
  shade,
  deepShade,
  highlight,
  specular,
  warmth,
  id,
  isLegacy,
}: {
  arm: ArmGeometry;
  skin: string;
  shade: string;
  deepShade: string;
  highlight: string;
  specular: string;
  warmth: string;
  id: string;
  isLegacy: boolean;
}) {
  return (
    <g transform={arm.handTransform} data-hand-side={arm.side}>
      <defs>
        <clipPath id={`${id}-hand-clip`}><path d={HAND_OUTLINE} /></clipPath>
        {isLegacy && (
          <linearGradient id={`${id}-hand-skin-legacy`}>
            <stop stopColor={`color-mix(in srgb, ${skin} 61%, #79523e)`} />
            <stop offset="0.32" stopColor={skin} />
            <stop offset="0.66" stopColor={highlight} />
            <stop offset="1" stopColor={skin} />
          </linearGradient>
        )}
      </defs>
      {/* Базовая форма кисти в чистом цвете кожи */}
      <path d={HAND_OUTLINE} fill={isLegacy ? `url(#${id}-hand-skin-legacy)` : skin} />

      <g clipPath={`url(#${id}-hand-clip)`} fill="none" strokeLinecap="round">
        {/* Мягкий объём кисти */}
        <path d="M-5.8 4 Q0 6 6.8 4.5" stroke={shade} strokeWidth={0.7} opacity={0.35} />
        <path d="M-4.2 11 Q0.5 8.5 4.8 11" stroke={shade} strokeWidth={0.65} opacity={0.38} />

        {/* Тепло на костяшках пальцев */}
        {!isLegacy && (
          <g fill={warmth} opacity={0.22}>
            <circle cx={-5.8} cy={16} r={1.6} />
            <circle cx={-2.2} cy={19} r={1.8} />
            <circle cx={1.8} cy={20} r={1.8} />
            <circle cx={5.8} cy={17} r={1.6} />
            <circle cx={9.2} cy={8} r={1.5} />
          </g>
        )}

        {/* Межпальцевые разделители и тени */}
        <path d="M-4.2 6.1 Q-3 8.3 -3.2 11 M-1.8 5 Q-.8 8 -.6 11 M1.8 4.8 Q2.8 8 2.9 11" stroke={deepShade} strokeWidth={0.5} opacity={0.45} />
        <path d="M6.2 6.8 Q4.5 8.2 5.2 13" stroke={deepShade} strokeWidth={0.55} opacity={0.42} />

        {/* Сгибы фаланг */}
        <path d="M-6.8 18.3 l1.2-.2 M-3.5 21.2 l1.8-.1 M.9 23.1 l1.8-.1 M5.9 20.8 l1.2-.4" stroke={shade} strokeWidth={0.55} opacity={0.48} />

        {/* Блики и свет на пальцах */}
        <path d="M-6.2 21.4 l.9-.1 M-2.9 26.6 l1.2-.1 M1.4 29.1 l1.3-.1 M6.4 24.8 l.9-.3" stroke={specular} strokeWidth={0.75} opacity={0.65} />

        {/* Ногтевые пластинки */}
        <ellipse cx={-5.7} cy={22.2} rx={0.7} ry={1.2} fill={highlight} opacity={0.38} />
        <ellipse cx={-2.3} cy={27.8} rx={0.8} ry={1.4} fill={highlight} opacity={0.38} />
        <ellipse cx={2.0} cy={30.2} rx={0.8} ry={1.4} fill={highlight} opacity={0.38} />
        <ellipse cx={6.7} cy={26.2} rx={0.7} ry={1.3} fill={highlight} opacity={0.38} />
      </g>
    </g>
  );
}

function Foot({
  leg,
  skin,
  shade,
  deepShade,
  highlight,
  specular,
  warmth,
  id,
  isLegacy,
}: {
  leg: LegGeometry;
  skin: string;
  shade: string;
  deepShade: string;
  highlight: string;
  specular: string;
  warmth: string;
  id: string;
  isLegacy: boolean;
}) {
  return (
    <g transform={leg.footTransform} data-foot-side={leg.side} data-toes="outward">
      <defs>
        <clipPath id={`${id}-foot-clip`}><path d={FOOT_OUTLINE} /></clipPath>
        {isLegacy && (
          <linearGradient id={`${id}-foot-skin-legacy`} x1="0" y1="0" x2="0.4" y2="1">
            <stop stopColor={skin} />
            <stop offset="0.5" stopColor={`color-mix(in srgb, ${skin} 91%, white)`} />
            <stop offset="1" stopColor={`color-mix(in srgb, ${skin} 65%, #74503d)`} />
          </linearGradient>
        )}
      </defs>
      {/* Базовая форма стопы в чистом тоне кожи */}
      <path d={FOOT_OUTLINE} fill={isLegacy ? `url(#${id}-foot-skin-legacy)` : skin} />

      <g clipPath={`url(#${id}-foot-clip)`} fill="none" strokeLinecap="round">
        {/* Щиколоточная косточка */}
        <ellipse cx={-5.2} cy={-1.2} rx={2.2} ry={3.2} fill={shade} opacity={0.35} stroke="none" />
        <circle cx={-5.5} cy={-1.6} r={1.2} fill={highlight} opacity={0.4} stroke="none" />

        {/* Подъём стопы и тень свода */}
        <path d="M-5.8 -7 Q-4.8 1 -5.6 7 M4.1 -5 Q6.2 3.5 15.6 10" stroke={shade} strokeWidth={0.75} opacity={0.45} />
        <path d="M-2 -4 Q2 2 12 7" stroke={highlight} strokeWidth={1.0} opacity={0.25} />

        {/* Тепло на пальцах стопы */}
        {!isLegacy && (
          <g fill={warmth} opacity={0.22}>
            <circle cx={24} cy={14} r={2.8} />
            <circle cx={19} cy={13.5} r={2.2} />
            <circle cx={14} cy={13} r={2.0} />
          </g>
        )}

        {/* Линии разделения пальцев */}
        <path d="M-5.8 16.3 C1 17.7 5.6 16.9 10 17 L24.8 17" stroke={deepShade} strokeWidth={0.7} opacity={0.55} />
        <path d="M27 12.7 q-1.8 1.1 -1 3.1 M22.7 12.4 q-1.4 1.6 -.9 3.3 M18.8 11.3 q-1 1.8 -.6 3.1 M15.4 10.2 q-.9 1.4 -.5 2.8" stroke={deepShade} strokeWidth={0.5} opacity={0.55} />

        {/* Блик на большом пальце и ногти */}
        <path d="M23.4 12.3 Q25.2 11.6 26.5 12.6" stroke={specular} strokeWidth={0.75} opacity={0.45} />
        <ellipse cx={26.2} cy={14.8} rx={1.2} ry={1.8} fill={highlight} opacity={0.25} stroke="none" />
      </g>
    </g>
  );
}

export const Body = memo(function Body({
  gender,
  skin,
  hairColor,
  face,
  body = DEFAULT_BODY,
  pose = 'standard',
  uid = 'main',
  withHead = true,
}: Props) {
  const id = `${uid}-figure-${useId().replace(/:/g, '')}`;
  const rig = getFigureGeometry(gender, body, pose);
  const { arms, legs, shoulders, waist, chest, hips, crotch, female } = rig;

  const isLegacy = body.legacySkin ?? false;
  const darkT = skinShadowStrength(skin);
  const darkSkin = darkT > 0.5;

  // Гармоничная реалистичная колористика теней и света на коже
  const shade = isLegacy
    ? `color-mix(in srgb, ${skin} 58%, #77523d)`
    : `color-mix(in srgb, ${skin} 68%, #36160e)`;
  const deepShade = isLegacy
    ? `color-mix(in srgb, ${skin} 42%, #553322)`
    : `color-mix(in srgb, ${skin} 42%, #1e0904)`;
  const highlight = isLegacy
    ? `color-mix(in srgb, ${skin} 72%, white)`
    : `color-mix(in srgb, ${skin} 76%, #fffaf2)`;
  const specular = `color-mix(in srgb, ${skin} 52%, #ffffff)`;
  const warmth = `color-mix(in srgb, ${skin} 70%, #d85446)`;


  const drawArm = (arm: ArmGeometry) => {
    const loss = armAmputation(rig, arm.side);
    if (loss === 'shoulder') {
      const stump = between(arm.shoulder, arm.elbow, 0.08);
      return (
        <g key={arm.side} data-arm-side={arm.side} data-amputation="shoulder">
          <ellipse cx={stump.x} cy={stump.y} rx={rig.female ? 9.5 : 11.5} ry={rig.female ? 10.5 : 12} fill={skin} />
          <ellipse cx={stump.x - arm.side * 1.2} cy={stump.y - 1.2} rx={rig.female ? 6.5 : 8} ry={rig.female ? 7.2 : 8.5} fill={warmth} opacity={0.1} />
          <path d={`M${stump.x - 4} ${stump.y - 2} Q${stump.x} ${stump.y + 2} ${stump.x + 4} ${stump.y - 2}`} stroke={shade} strokeWidth={0.7} opacity={0.35} fill="none" />
        </g>
      );
    }
    if (loss === 'elbow') {
      const stump = between(arm.shoulder, arm.elbow, 0.82);
      const width = rig.female ? 20 : 24;
      return (
        <g key={arm.side} data-arm-side={arm.side} data-amputation="elbow">
          <path d={`M${arm.shoulder.x} ${arm.shoulder.y} Q${between(arm.shoulder, stump, 0.5).x} ${between(arm.shoulder, stump, 0.5).y} ${stump.x} ${stump.y}`} stroke={skin} strokeWidth={width} strokeLinecap="round" fill="none" />
          <path d={`M${between(arm.shoulder, stump, 0.2).x - arm.side * 2} ${between(arm.shoulder, stump, 0.2).y} L${stump.x - arm.side * 2} ${stump.y}`} stroke={highlight} strokeWidth={1.5} opacity={0.32} fill="none" strokeLinecap="round" />
          <ellipse cx={stump.x} cy={stump.y} rx={width * 0.42} ry={width * 0.34} fill={warmth} opacity={0.1} />
          <path d={`M${stump.x - 4} ${stump.y} Q${stump.x} ${stump.y + 2} ${stump.x + 4} ${stump.y}`} stroke={shade} strokeWidth={0.7} opacity={0.4} fill="none" />
        </g>
      );
    }
    const upperA = between(arm.shoulder, arm.elbow, 0.2);
    const upperB = between(arm.shoulder, arm.elbow, 0.72);
    const lowerA = between(arm.elbow, arm.hand, 0.2);
    const lowerB = between(arm.elbow, arm.hand, 0.86);
    return (
      <g key={arm.side} data-arm-side={arm.side}>
        {/* Базовая рука в чистом цвете кожи */}
        <path d={arm.path} fill={skin} />

        <g clipPath={`url(#${id}-arm-${arm.side})`} fill="none" strokeLinecap="round">
          {/* Светотень плеча/бицепса */}
          <path
            d={`M${upperA.x + arm.side * 3} ${upperA.y} Q${upperB.x + arm.side * 7} ${upperB.y - 10} ${upperB.x + arm.side * 2} ${upperB.y}`}
            stroke={shade}
            strokeWidth={1.1}
            opacity={0.32}
          />
          {/* Блик на передней поверхности руки */}
          <path
            d={`M${lowerA.x - arm.side * 3} ${lowerA.y} Q${lowerB.x - arm.side * 4} ${lowerB.y - 14} ${lowerB.x} ${lowerB.y}`}
            stroke={highlight}
            strokeWidth={1.8}
            opacity={0.42}
          />
          {/* Локтевой сгиб */}
          <path d={`M${arm.elbow.x - 3} ${arm.elbow.y - 1} q3 2.5 6 .7`} stroke={shade} strokeWidth={0.9} opacity={0.52} />
          {/* Тепло на локте */}
          {!isLegacy && <circle cx={arm.elbow.x} cy={arm.elbow.y} r={3.2} fill={warmth} opacity={0.18} stroke="none" />}
        </g>

        {loss !== 'hand' ? (
          <Hand
            arm={arm}
            skin={skin}
            shade={shade}
            deepShade={deepShade}
            highlight={highlight}
            specular={specular}
            warmth={warmth}
            id={`${id}-${arm.side}`}
            isLegacy={isLegacy}
          />
        ) : (
          <g data-amputation="hand">
            <ellipse cx={arm.hand.x} cy={arm.hand.y} rx={rig.female ? 5.5 : 6.5} ry={rig.female ? 4.5 : 5.2} fill={warmth} opacity={0.1} />
            <path d={`M${arm.hand.x - 3.5} ${arm.hand.y} Q${arm.hand.x} ${arm.hand.y + 1.8} ${arm.hand.x + 3.5} ${arm.hand.y}`} stroke={shade} strokeWidth={0.65} opacity={0.4} fill="none" />
          </g>
        )}
      </g>
    );
  };

  const legCuts = legs.flatMap((leg) => {
    const loss = legAmputation(rig, leg.side);
    return loss === 'knee' || loss === 'hip' ? [legRemovalPath(leg, loss)] : [];
  });

  return (
    <g data-pose={pose} data-waist-y={waist.y} data-neck-scale={rig.neckScale} data-skin-mode={isLegacy ? 'legacy' : 'realistic'}>
      <defs>
        {/* Симметричный мягкий свет по центру фигуры без затемнения левой или правой ноги */}
        <linearGradient id={`${id}-skin-volume`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={highlight} stopOpacity={0.15} />
          <stop offset="0.25" stopColor={skin} stopOpacity={0.0} />
          <stop offset="0.75" stopColor={skin} stopOpacity={0.0} />
          <stop offset="1" stopColor={shade} stopOpacity={0.12} />
        </linearGradient>

        <radialGradient id={`${id}-shade`}>
          <stop stopColor={shade} stopOpacity={0.28} />
          <stop offset="1" stopColor={shade} stopOpacity={0} />
        </radialGradient>

        {/* Мягкое размытие для светотени мышц */}
        <filter id={`${id}-soft`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>

        {/* Объём груди/бюста */}
        <radialGradient id={`${id}-bust`} cx="38%" cy="32%" r="72%">
          <stop stopColor={highlight} stopOpacity={darkT > 0.5 ? 0.6 : 0.5} />
          <stop offset="0.55" stopColor={skin} stopOpacity={0.12} />
          <stop offset="1" stopColor={shade} stopOpacity={darkT > 0.5 ? 0.5 : 0.34} />
        </radialGradient>

        <clipPath id={`${id}-core`}><path d={rig.corePath} /></clipPath>
        <mask id={`${id}-limb-mask`} maskUnits="userSpaceOnUse" x={0} y={100} width={300} height={520}>
          <rect x={0} y={100} width={300} height={520} fill="white" />
          {legCuts.map((d, index) => <path key={index} d={d} fill="black" />)}
        </mask>
        {arms.map((arm) => <clipPath key={arm.side} id={`${id}-arm-${arm.side}`}><path d={arm.path} /></clipPath>)}

        {/* Единый силуэт для родинок, веснушек и витилиго */}
        <clipPath id={`${id}-silhouette`}>
          <path d={rig.corePath} />
          {arms.map((arm) => (
            <g key={arm.side}>
              <path d={arm.path} />
              <path d={HAND_OUTLINE} transform={arm.handTransform} />
            </g>
          ))}
          {legs.map((leg) => <path key={leg.side} d={FOOT_OUTLINE} transform={leg.footTransform} />)}
        </clipPath>
      </defs>

      {/* Руки сзади (если поза отведена назад) */}
      {arms.filter((arm) => !arm.inFront).map(drawArm)}

      {/* Стопы */}
      {legs.filter((leg) => !legAmputation(rig, leg.side)).map((leg) => (
        <Foot
          key={leg.side}
          leg={leg}
          skin={skin}
          shade={shade}
          deepShade={deepShade}
          highlight={highlight}
          specular={specular}
          warmth={warmth}
          id={`${id}-${leg.side}`}
          isLegacy={isLegacy}
        />
      ))}

      <g mask={`url(#${id}-limb-mask)`}>
        {/* Основной торс и ноги в чистом цвете кожи (ровная подсветка без затемнения одной из сторон) */}
        <path d={rig.corePath} fill={skin} data-continuous-hips />
        {/* Мягкий симметричный объемный градиент */}
        <path d={rig.corePath} fill={`url(#${id}-skin-volume)`} opacity={0.65} />

        {/* Анатомические детали внутри силуэта тела */}
        <g clipPath={`url(#${id}-core)`}>
        {/* Падающая тень под подбородком на шее */}
        <g transform={`translate(150 0) scale(${rig.neckScale} 1) translate(-150 0)`}>
          <path d="M138 108 Q150 126 162 108" fill={shade} opacity={0.3} />
          <path d="M141 116 Q144 136 147 145 M159 116 Q156 136 153 145" stroke={shade} strokeWidth={0.65} fill="none" strokeLinecap="round" opacity={0.4} />
          {!female && <path d="M148 123 L150 121 L152 124 L150 128Z" fill={shade} opacity={0.28} />}
        </g>

        {/* Ключицы и яремная ямка */}
        <g fill="none" strokeLinecap="round">
          {/* Яремная ямка */}
          <path d="M145.5 138 Q150 142.5 154.5 138" stroke={deepShade} strokeWidth={1.0} opacity={0.55} />
          <path d="M146 137 Q150 135 154 137" stroke={specular} strokeWidth={0.6} opacity={0.5} />

          {/* Ключичные линии к плечам */}
          {shoulders.map((shoulder, i) => {
            const side = i ? 1 : -1;
            return (
              <g key={i}>
                {/* Тень под ключицей */}
                <path
                  d={`M${chest.x + side * 4} 141.5 Q${chest.x + side * 22} 144.5 ${shoulder.x - side * 10} ${shoulder.y + 2}`}
                  stroke={shade}
                  strokeWidth={1.3}
                  opacity={0.48}
                />
                {/* Светящийся блик по ребру ключицы */}
                <path
                  d={`M${chest.x + side * 5} 139.5 Q${chest.x + side * 21} 142 ${shoulder.x - side * 11} ${shoulder.y + 0.5}`}
                  stroke={specular}
                  strokeWidth={1.0}
                  opacity={0.65}
                />
                {/* Мышцы трапеции */}
                <path
                  d={`M${150 + side * (rig.neckBaseHalf ?? 14)} 132 Q${chest.x + side * 26} 136 ${shoulder.x - side * 6} ${shoulder.y}`}
                  stroke={shade}
                  strokeWidth={0.75}
                  opacity={0.3}
                />
              </g>
            );
          })}
        </g>

        {/* Бюст (женский) / Грудные мышцы (мужские) — параметры из рига, единые с бельём */}
        {(() => {
          const b = rig.bust;
          const cxb = chest.x;
          if (female) {
            const r = rig.bustRadius;
            const cy = rig.bustCenterY;
            const off = rig.bustOffset;
            const underLight = 0.10 + 0.08 * Math.min(1, b - 0.5);
            const underDark  = 0.22 + 0.2 * Math.min(1, b - 0.5);
            const under = underLight + (underDark - underLight) * darkT;
            const foldLight = 0.15 + 0.08 * (b - 0.5);
            const foldDark  = 0.38 + 0.2 * (b - 0.5);
            const foldOp = foldLight + (foldDark - foldLight) * darkT;
            const foldColor = darkT > 0.5 ? deepShade : shade;
            const cleavageBase = 0.24 + 0.3 * Math.max(0, b - 0.9);
            const cleavageOp = Math.max(0.06, cleavageBase * (1 - off / 24) * (0.45 + 0.55 * darkT));
            return (
              <g data-female-bust>
                {[-1, 1].map((s) => (
                  <g key={s}>
                    <ellipse cx={cxb + s * off} cy={cy + r * 0.72} rx={r * 0.95} ry={r * 0.42} fill={shade} opacity={under} />
                    <circle cx={cxb + s * off} cy={cy} r={r} fill={`url(#${id}-bust)`} />
                    <path
                      d={`M${cxb + s * off - r * 0.92} ${cy + r * 0.28} Q${cxb + s * off} ${cy + r * 1.08} ${cxb + s * off + r * 0.92} ${cy + r * 0.28}`}
                      stroke={foldColor}
                      strokeWidth={0.9 + 0.4 * (b - 1)}
                      fill="none"
                      opacity={foldOp}
                    />
                    <circle cx={cxb + s * off} cy={cy + 1} r={Math.max(1.8, 2.4 * b)} fill={warmth} opacity={0.22 + 0.12 * darkT} />
                    <circle cx={cxb + s * off} cy={cy + 1} r={Math.max(0.8, 1.0 * b)} fill={foldColor} opacity={0.22 + 0.15 * darkT} />
                  </g>
                ))}
                {off < 22 && (
                  <path
                    d={`M${cxb - 1.5} ${cy - r * 0.55} Q${cxb} ${cy + r * 0.4} ${cxb + 1.5} ${cy - r * 0.55}`}
                    stroke={shade}
                    strokeWidth={0.8}
                    fill="none"
                    opacity={cleavageOp}
                  />
                )}
              </g>
            );
          }
          // Мужская грудь: широкие, выразительные анатомические пекторальные мышцы
          const w = 17 * b;
          const h = 21 + 5 * (b - 1);
          const cy = rig.bustCenterY;
          const off = rig.bustOffset;
          return (
            <g data-male-pecs>
              {[-1, 1].map((s) => (
                <g key={s}>
                  <path
                    d={`M${cxb + s * off} ${cy - 4} Q${cxb + s * (off + w * 0.85)} ${cy - 4} ${cxb + s * (off + w)} ${cy + h * 0.35} Q${cxb + s * (off + w * 0.95)} ${cy + h} ${cxb + s * (off + w * 0.45)} ${cy + h + 1} Q${cxb + s * (off + 2)} ${cy + h * 0.95} ${cxb + s * off} ${cy + h * 0.72} Z`}
                    fill={`url(#${id}-bust)`}
                    opacity={0.5 + 0.35 * Math.min(1, b - 0.5)}
                  />
                  <path
                    d={`M${cxb + s * (off + w)} ${cy + h * 0.35} Q${cxb + s * (off + w * 0.95)} ${cy + h} ${cxb + s * (off + w * 0.45)} ${cy + h + 1} Q${cxb + s * (off + 2)} ${cy + h * 0.95} ${cxb + s * off} ${cy + h * 0.72}`}
                    stroke={shade}
                    strokeWidth={darkSkin ? 0.85 + 0.4 * (b - 1) : 0.7 + 0.3 * (b - 1)}
                    fill="none"
                    opacity={darkSkin ? 0.26 + 0.14 * (b - 0.5) : 0.16 + 0.08 * (b - 0.5)}
                  />
                  <path
                    d={`M${cxb + s * (off + w * 0.15)} ${cy + h * 0.22} Q${cxb + s * (off + w * 0.6)} ${cy + h * 0.08} ${cxb + s * (off + w * 0.85)} ${cy + h * 0.28}`}
                    stroke={specular}
                    strokeWidth={0.9}
                    fill="none"
                    opacity={darkSkin ? 0.28 : 0.34}
                  />
                  <circle cx={cxb + s * (off + w * 0.65)} cy={cy + h * 0.58} r={1.7} fill={warmth} opacity={darkSkin ? 0.3 : 0.24} />
                  <circle cx={cxb + s * (off + w * 0.65)} cy={cy + h * 0.58} r={0.7} fill={shade} opacity={darkSkin ? 0.3 : 0.24} />
                </g>
              ))}
              <path d={`M${cxb} ${cy - 6} L${cxb} ${cy + h + 6}`} stroke={shade} strokeWidth={0.7} opacity={0.14 + 0.12 * Math.max(0, b - 1)} fill="none" />
            </g>
          );
        })()}

        {/* Боковые контурные тени талии */}
        <ellipse cx={waist.x - rig.waistHalf + 4} cy={waist.y} rx={9} ry={27} fill={`url(#${id}-shade)`} opacity={0.5} />
        <ellipse cx={waist.x + rig.waistHalf - 4} cy={waist.y} rx={9} ry={27} fill={`url(#${id}-shade)`} opacity={0.6} />

        {/* Белая линия живота */}
        <path d={`M${chest.x} ${chest.y + 28} Q${waist.x - 0.5} ${waist.y - 5} ${waist.x} ${waist.y + 7}`} stroke={shade} strokeWidth={0.6} opacity={0.28} fill="none" />

        {/* Чёткий красивый объёмный пупок, видимый на любом цвете кожи */}
        <g data-navel transform={`translate(${waist.x} ${waist.y + 9})`}>
          {/* Тень ямки */}
          <ellipse cx={0} cy={0} rx={2.2} ry={3.2} fill={deepShade} opacity={0.75} />
          {/* Глубина центра */}
          <ellipse cx={0} cy={0.4} rx={1.1} ry={1.6} fill="#1a0804" opacity={0.45} />
          {/* Верхний светящийся блик валика */}
          <path d="M-1.8 -0.8 Q0 -2.4 1.8 -0.8" stroke={specular} strokeWidth={0.75} fill="none" opacity={0.85} strokeLinecap="round" />
          {/* Нижняя складочка */}
          <path d="M-1.2 1.8 Q0 2.6 1.2 1.8" stroke={shade} strokeWidth={0.6} fill="none" opacity={0.65} strokeLinecap="round" />
        </g>

        {/* Линии подвздошных костей (пояс Аполлона) */}
        {hips.map((hip, i) => {
          const side = i ? 1 : -1;
          return (
            <path
              key={i}
              d={`M${hip.x - side * 11} ${hip.y - 13} Q${hip.x - side * 17} ${hip.y - 6} ${crotch.x + side * 10} ${crotch.y - 9}`}
              stroke={shade}
              strokeWidth={0.8}
              opacity={0.3}
              fill="none"
            />
          );
        })}

        {/* Коленные чашечки и рельеф ног */}
        {legs.map((leg) => (
          <g key={leg.side}>
            <ellipse cx={leg.knee.x} cy={leg.knee.y - 1.5} rx={5.8} ry={7.4} fill={`url(#${id}-shade)`} />
            {/* Тепло на колене */}
            {!isLegacy && <circle cx={leg.knee.x} cy={leg.knee.y} r={4.5} fill={warmth} opacity={0.2} stroke="none" />}
            {/* Нижняя тень под коленкой */}
            <path d={`M${leg.knee.x - 3.8} ${leg.knee.y + 4.5} Q${leg.knee.x} ${leg.knee.y + 7} ${leg.knee.x + 3.8} ${leg.knee.y + 4.5}`} stroke={deepShade} strokeWidth={0.75} opacity={0.55} fill="none" />
            {/* Верхний блик надколенника */}
            <path d={`M${leg.knee.x - 3} ${leg.knee.y - 6} Q${leg.knee.x} ${leg.knee.y - 8.5} ${leg.knee.x + 3} ${leg.knee.y - 6}`} stroke={specular} strokeWidth={0.9} opacity={0.7} fill="none" />
            {/* Блик по голени */}
            <path d={`M${leg.knee.x - leg.side * 3} ${leg.knee.y + 20} Q${leg.calf.x - leg.side * 6} ${leg.calf.y + 14} ${leg.ankle.x} ${leg.ankle.y - 22}`} stroke={highlight} strokeWidth={1.8} opacity={0.38} fill="none" />
            {/* Боковая тень бедра */}
            <path d={`M${leg.hip.x - leg.side * 13} ${leg.hip.y + 19} Q${leg.knee.x + leg.side * 9} ${leg.knee.y - 58} ${leg.knee.x + leg.side * 5} ${leg.knee.y - 19}`} stroke={shade} strokeWidth={0.8} opacity={0.22} fill="none" />
          </g>
        ))}

        {/* Очерченность мышц (muscle 0..250) — работает на всех тонах кожи */}
        {(() => {
          const m = Math.max(0, Math.min(250, body.muscle ?? 20)) / 100;
          if (m <= 0.02) return null;
          const soft = `url(#${id}-soft)`;
          // Рельеф адаптирован под тон кожи и смягчён: на тёмной коже ярче блик, мягче тень
          const shadeOp = Math.min(0.6, (0.05 + m * 0.2) * (1 - darkT * 0.3));
          const lightOp = Math.min(0.7, (0.06 + m * 0.22) * (0.7 + darkT * 0.6));
          const lineOp = Math.min(0.6, (0.04 + m * 0.15) * (0.8 + darkT * 0.4));
          const lw = 0.4 + Math.min(m, 2) * 0.45;
          const absRows = m < 0.35 ? 1 : m < 0.7 ? 2 : m < 1.4 ? 3 : 4;
          return (
            <g data-muscles strokeLinecap="round" strokeLinejoin="round">
              {/* Пресс и кубики */}
              <g filter={soft}>
                <ellipse cx={waist.x} cy={waist.y - 9} rx={1.8} ry={26} fill={deepShade} opacity={shadeOp} />
                {Array.from({ length: absRows }).map((_, i) => {
                  const y = waist.y - 20 + i * 13;
                  const wdt = 10 - i * 1.5;
                  return (
                    <g key={i}>
                      <ellipse cx={waist.x - wdt * 0.55} cy={y + 6} rx={wdt * 0.55} ry={2.4} fill={shade} opacity={shadeOp * 0.9} />
                      <ellipse cx={waist.x + wdt * 0.55} cy={y + 6} rx={wdt * 0.55} ry={2.4} fill={shade} opacity={shadeOp * 0.9} />
                      <ellipse cx={waist.x - wdt * 0.5} cy={y - 1} rx={wdt * 0.45} ry={2.0} fill={highlight} opacity={lightOp * 0.75} />
                      <ellipse cx={waist.x + wdt * 0.5} cy={y - 1} rx={wdt * 0.45} ry={2.0} fill={highlight} opacity={lightOp * 0.75} />
                    </g>
                  );
                })}
                {/* Косые мышцы */}
                <ellipse cx={waist.x - rig.waistHalf + 7} cy={waist.y - 2} rx={4} ry={16} fill={shade} opacity={shadeOp * 0.75} transform={`rotate(-14 ${waist.x - rig.waistHalf + 7} ${waist.y - 2})`} />
                <ellipse cx={waist.x + rig.waistHalf - 7} cy={waist.y - 2} rx={4} ry={16} fill={shade} opacity={shadeOp * 0.75} transform={`rotate(14 ${waist.x + rig.waistHalf - 7} ${waist.y - 2})`} />
              </g>

              {/* Плечи и руки (дельта, бицепс) */}
              <g filter={soft}>
                {arms.map((arm) => {
                  const dl = between(arm.shoulder, arm.elbow, 0.18);
                  const bi = between(arm.shoulder, arm.elbow, 0.58);
                  const fo = between(arm.elbow, arm.hand, 0.45);
                  const ang = Math.atan2(arm.elbow.y - arm.shoulder.y, arm.elbow.x - arm.shoulder.x) * 180 / Math.PI;
                  const ang2 = Math.atan2(arm.hand.y - arm.elbow.y, arm.hand.x - arm.elbow.x) * 180 / Math.PI;
                  return (
                    <g key={arm.side}>
                      <ellipse cx={dl.x - arm.side * 2} cy={dl.y} rx={7.5} ry={9.5} fill={highlight} opacity={lightOp} transform={`rotate(${ang - 90} ${dl.x} ${dl.y})`} />
                      <ellipse cx={bi.x - arm.side * 2.5} cy={bi.y} rx={4.8} ry={12} fill={highlight} opacity={lightOp * 0.95} transform={`rotate(${ang - 90} ${bi.x} ${bi.y})`} />
                      <ellipse cx={bi.x + arm.side * 4} cy={bi.y} rx={2.8} ry={13} fill={shade} opacity={shadeOp * 0.8} transform={`rotate(${ang - 90} ${bi.x} ${bi.y})`} />
                      <ellipse cx={fo.x - arm.side * 2} cy={fo.y} rx={3.2} ry={12} fill={highlight} opacity={lightOp * 0.75} transform={`rotate(${ang2 - 90} ${fo.x} ${fo.y})`} />
                    </g>
                  );
                })}
              </g>

              {/* Ноги (квадрицепс и икры) */}
              <g filter={soft}>
                {legs.map((leg) => {
                  const th = between(leg.hip, leg.knee, 0.5);
                  const ca = between(leg.knee, leg.ankle, 0.35);
                  return (
                    <g key={leg.side}>
                      <ellipse cx={th.x - leg.side * 3} cy={th.y} rx={6.5} ry={26} fill={highlight} opacity={lightOp * 0.9} />
                      <ellipse cx={th.x + leg.side * 7} cy={th.y + 4} rx={3.2} ry={24} fill={shade} opacity={shadeOp * 0.75} />
                      <ellipse cx={ca.x + leg.side * 3} cy={ca.y} rx={4.8} ry={16} fill={highlight} opacity={lightOp * 0.8} />
                      <ellipse cx={ca.x - leg.side * 4} cy={ca.y + 2} rx={2.6} ry={15} fill={shade} opacity={shadeOp * 0.65} />
                    </g>
                  );
                })}
              </g>

              {/* Четкие линии при выраженном рельефе */}
              {m > 0.4 && (
                <g fill="none" stroke={darkT > 0.5 ? specular : deepShade} opacity={lineOp} strokeWidth={lw}>
                  {Array.from({ length: absRows }).map((_, i) => {
                    const y = waist.y - 14 + i * 13;
                    return <path key={i} d={`M${waist.x - 8} ${y} Q${waist.x} ${y + 2.5} ${waist.x + 8} ${y}`} />;
                  })}
                </g>
              )}
            </g>
          );
        })()}
        </g>
      </g>

      {/* Rounded ends are drawn after masking so each cut reads as a stump. */}
      {legs.map((leg) => {
        const loss = legAmputation(rig, leg.side);
        if (!loss) return null;
        const point = loss === 'foot' ? leg.ankle : loss === 'knee' ? leg.knee : between(leg.hip, leg.knee, 0.08);
        const rx = loss === 'foot' ? leg.ankleWidth * 1.05 : loss === 'knee' ? leg.kneeWidth * 0.92 : (rig.female ? 15 : 17);
        const ry = loss === 'foot' ? 4.4 : loss === 'knee' ? 7 : 10;
        return (
          <g key={leg.side} data-leg-side={leg.side} data-amputation={loss}>
            <ellipse cx={point.x} cy={point.y} rx={rx} ry={ry} fill={skin} />
            <ellipse cx={point.x} cy={point.y + 1} rx={rx * 0.72} ry={ry * 0.55} fill={warmth} opacity={0.1} />
            <path d={`M${point.x - rx * 0.55} ${point.y} Q${point.x} ${point.y + ry * 0.35} ${point.x + rx * 0.55} ${point.y}`} stroke={shade} strokeWidth={0.75} opacity={0.38} fill="none" />
          </g>
        );
      })}

      {/* Руки спереди (если поза confident) */}
      {arms.filter((arm) => arm.inFront).map(drawArm)}

      {/* Все родимые пятна, веснушки, шрамы и витилиго поверх тела, рук, ног, кистей и стоп */}
      <BodyMarks body={body} rig={rig} skin={skin} />

      {/* Голова (если withHead) */}
      {withHead && <Head gender={gender} skin={skin} hairColor={hairColor} face={face} pigmentation={body} uid={uid} />}
    </g>
  );
});
