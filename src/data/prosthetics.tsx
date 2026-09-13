import type { ReactNode } from 'react';
import type { FaceSel } from './types';

export interface ProstheticCtx {
  skin: string;
  side: -1 | 1;
  iris: string;
  face: FaceSel;
  /** центры глаз с учётом слайдеров (высота, дистанция) */
  eyeL: { x: number; y: number };
  eyeR: { x: number; y: number };
  /** полуоси глазного разреза */
  eyeRX: number;
  eyeRY: number;
  /** кончик носа с учётом формы носа */
  noseTip: number;
  /** линия губ с учётом слайдера высоты рта */
  mouthY: number;
  /** реальные габариты рта: полуширина и верх/низ */
  mouthHalfW: number;
  mouthTop: number;
  mouthBottom: number;
  /** низ подбородка с учётом формы лица */
  chinY: number;
  templeHalf: number;
  idPrefix: string;
  sheen: string;
}

export interface ProstheticOption {
  id: string;
  name: string;
  /** маска: пластина обрезается по контуру лица в слое */
  clipToFace?: boolean;
  art: (p: ProstheticCtx) => ReactNode;
}

/* Маски 1914–1918: тонкая гальванопластика (медь/жесть), расписанная под тон кожи.
   Держались на дужках-очках. Здесь: расписанная пластина + патина + заклёпки. */
const tinPaint = (skin: string) => `color-mix(in srgb, ${skin} 74%, #cfc3b4)`;
const tinShade = (skin: string) => `color-mix(in srgb, ${skin} 42%, #7d7166)`;
const tinEdge = '#6f665c';
const tinLight = '#f4efe6';
const strapDark = '#2a231c';
const leather = '#6b4a34';
const leatherDark = '#3f2a1c';

/** эллипс-отверстие для path с fillRule="evenodd" */
const hole = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx} ${cy} a${rx} ${ry} 0 1 0 ${rx * 2} 0 a${rx} ${ry} 0 1 0 ${-rx * 2} 0Z`;

/** отверстие под рот строго по реальным габаритам губ (+ запас) */
const mouthHole = (ctx: ProstheticCtx) => {
  const cy = (ctx.mouthTop + ctx.mouthBottom) / 2;
  const ry = Math.max(3.6, (ctx.mouthBottom - ctx.mouthTop) / 2 + 1.4);
  return hole(150, cy, ctx.mouthHalfW + 2.4, ry);
};

/** общая заливка пластины: краска + патина + кромка */
const plate = (d: string, skin: string, sheen: string, bare = false) => (
  <g>
    <path d={d} fill={bare ? '#b9a892' : tinPaint(skin)} fillRule="evenodd" />
    <path d={d} fill={sheen} fillRule="evenodd" opacity={bare ? 0.5 : 0.32} />
    <path d={d} fill="none" stroke={tinEdge} strokeWidth={0.75} opacity={0.75} />
    <path d={d} fill="none" stroke={tinLight} strokeWidth={0.35} opacity={0.5} transform="translate(0 -0.5)" />
  </g>
);

/** нарисованный на пластине глаз (маски закрывали утраченный глаз) */
const paintedEye = (cx: number, cy: number, rx: number, ry: number, iris: string) => (
  <g>
    <path
      d={`M${cx - rx} ${cy} Q${cx} ${cy - ry * 1.25} ${cx + rx} ${cy} Q${cx} ${cy + ry} ${cx - rx} ${cy}Z`}
      fill="#efe9df"
      stroke="#5d4b3c"
      strokeWidth={0.5}
    />
    <circle cx={cx} cy={cy - 0.2} r={ry * 0.78} fill={iris} opacity={0.9} />
    <circle cx={cx} cy={cy - 0.2} r={ry * 0.34} fill="#1a1512" />
    <circle cx={cx - ry * 0.28} cy={cy - ry * 0.5} r={ry * 0.18} fill="#fff" opacity={0.85} />
    <path d={`M${cx - rx} ${cy} Q${cx} ${cy - ry * 1.3} ${cx + rx} ${cy}`} fill="none" stroke="#3b2c21" strokeWidth={0.85} />
  </g>
);

/** дужка-очки: крепление маски, уходит к виску */
const spectacleArm = (fromX: number, y: number, side: -1 | 1) => (
  <g stroke={tinEdge} strokeWidth={1.1} fill="none" strokeLinecap="round" opacity={0.9}>
    <path d={`M${fromX} ${y} q${side * 12} -1 ${side * 24} -3`} />
    <path d={`M${fromX} ${y} q${side * 12} -1 ${side * 24} -3`} stroke={tinLight} strokeWidth={0.35} opacity={0.6} transform="translate(0 -0.5)" />
  </g>
);

/** ряд заклёпок по кромке */
const rivets = (points: [number, number][]) => (
  <g>
    {points.map(([x, y], i) => (
      <g key={i}>
        <circle cx={x} cy={y} r={0.85} fill={tinShade('#c9b9a4')} />
        <circle cx={x - 0.25} cy={y - 0.25} r={0.35} fill={tinLight} opacity={0.8} />
      </g>
    ))}
  </g>
);

/* ─── протез носа ─── */
const noseProsthesis = ({ skin, noseTip, sheen }: ProstheticCtx) => {
  const top = 73;
  const tip = noseTip + 0.5;
  const d = `M144 ${top} L156 ${top} Q158.5 ${(top + tip) / 2} 153.5 ${tip} Q150 ${tip + 3} 146.5 ${tip} Q141.5 ${(top + tip) / 2} 144 ${top} Z`;
  return (
    <g>
      {plate(d, skin, sheen)}
      <path d={`M146 ${top + 2} L147 ${tip - 3}`} stroke={tinLight} strokeWidth={0.7} opacity={0.65} />
      <g fill={tinEdge} opacity={0.8}>
        <ellipse cx={146.8} cy={tip - 1} rx={1.3} ry={0.85} />
        <ellipse cx={153.2} cy={tip - 1} rx={1.3} ry={0.85} />
      </g>
      {rivets([[144.6, top + 3], [155.4, top + 3]])}
    </g>
  );
};

/* ─── протез челюсти ─── */
const jawProsthesis = (ctx: ProstheticCtx) => {
  const { skin, chinY } = ctx;
  const top = ctx.mouthBottom + 2.5;
  const bottom = chinY + 1.5;
  const mid = (top + bottom) / 2;
  const d = `M129 ${top} Q132 ${mid + 4} 138 ${bottom - 2} Q150 ${bottom + 5} 162 ${bottom - 2} Q168 ${mid + 4} 171 ${top} Q150 ${top - 3} 129 ${top} Z`;
  return (
    <g>
      {plate(d, skin, ctx.sheen)}
      <path d={`M133 ${top + 2} Q150 ${mid + 3} 167 ${top + 2}`} stroke={tinLight} strokeWidth={0.7} fill="none" opacity={0.6} />
      {rivets([[134, top + 3.5], [166, top + 3.5], [150, bottom - 1]])}
    </g>
  );
};

/* ─── повязка на глаз: кожаный щиток + ремень к затылку ─── */
const eyePatch = (ctx: ProstheticCtx) => {
  const { side, eyeL, eyeR, eyeRX, eyeRY } = ctx;
  const eye = side === -1 ? eyeL : eyeR;
  const cx = eye.x;
  const cy = eye.y;
  const rx = eyeRX + 3.2;
  const ry = eyeRY + 4;
  const outerX = cx + side * (rx - 0.6);
  const outerY = cy - ry * 0.15;
  const otherEye = side === -1 ? eyeR : eyeL;
  const innerX = cx - side * (rx - 0.7);
  const bridgeY = cy + 3.4;
  const crossStrap = `M${innerX} ${cy + 0.4} Q${150 + side * 1.2} ${bridgeY - 1} 150 ${bridgeY} C${150 - side * 9} ${bridgeY + 4.2} ${otherEye.x - side * 10} ${otherEye.y + eyeRY + 4} ${150 - side * (ctx.templeHalf + 2)} ${cy + 2.2}`;
  return (
    <g>
      <g stroke={strapDark} strokeWidth={1.15} fill="none" strokeLinecap="round">
        <path data-patch-strap="temple" d={`M${outerX} ${outerY} C${outerX + side * 10} ${outerY - 2} ${outerX + side * 18} ${cy - 8} ${outerX + side * 22} ${cy - 14}`} />
        <path data-patch-strap="across-nose" d={crossStrap} />
      </g>
      <g stroke="#8a7464" strokeWidth={0.4} fill="none" opacity={0.7} strokeLinecap="round">
        <path d={`M${outerX} ${outerY - 0.5} C${outerX + side * 10} ${outerY - 2.5} ${outerX + side * 18} ${cy - 8.5} ${outerX + side * 22} ${cy - 14.5}`} />
        <path d={crossStrap} transform="translate(0 -0.35)" />
      </g>
      <path
        d={`M${cx - side * rx} ${cy - 1}
            Q${cx - side * rx * 0.6} ${cy - ry} ${cx + side * rx * 0.35} ${cy - ry}
            Q${cx + side * rx} ${cy - ry * 0.8} ${cx + side * rx} ${cy + 0.5}
            Q${cx + side * rx * 0.75} ${cy + ry} ${cx - side * rx * 0.2} ${cy + ry}
            Q${cx - side * rx} ${cy + ry * 0.7} ${cx - side * rx} ${cy - 1} Z`}
        fill={leather}
      />
      <path
        d={`M${cx - side * rx} ${cy - 1}
            Q${cx - side * rx * 0.6} ${cy - ry} ${cx + side * rx * 0.35} ${cy - ry}
            Q${cx + side * rx} ${cy - ry * 0.8} ${cx + side * rx} ${cy + 0.5}
            Q${cx + side * rx * 0.75} ${cy + ry} ${cx - side * rx * 0.2} ${cy + ry}
            Q${cx - side * rx} ${cy + ry * 0.7} ${cx - side * rx} ${cy - 1} Z`}
        fill={ctx.sheen}
        opacity={0.25}
      />
      <path
        d={`M${cx - side * (rx - 1.6)} ${cy - 0.8}
            Q${cx - side * (rx - 1.6) * 0.6} ${cy - ry + 1.5} ${cx + side * rx * 0.3} ${cy - ry + 1.5}
            Q${cx + side * (rx - 1.5)} ${cy - ry * 0.75} ${cx + side * (rx - 1.5)} ${cy + 0.4}
            Q${cx + side * (rx - 1.5) * 0.75} ${cy + ry - 1.5} ${cx - side * rx * 0.2} ${cy + ry - 1.5}`}
        fill="none"
        stroke="#d8b98f"
        strokeWidth={0.42}
        strokeDasharray="1.8 1.6"
        opacity={0.65}
      />
      <path d={`M${cx - side * 3} ${cy - ry + 3} Q${cx} ${cy} ${cx + side * 2} ${cy + ry - 3}`} stroke={leatherDark} strokeWidth={0.5} fill="none" opacity={0.5} />
    </g>
  );
};

/** маска на один глаз со щекой (самый частый тип) */
const eyeMask = (side: -1 | 1, ctx: ProstheticCtx) => {
  const { skin, eyeL, eyeR, eyeRX, eyeRY, iris } = ctx;
  const eye = side === -1 ? eyeL : eyeR;
  const top = eye.y - eyeRY - 11;
  const bottom = eye.y + eyeRY + 17;
  const innerX = 150 - side * 2;
  const outerX = eye.x + side * 26;
  const d =
    `M${innerX} ${top + 4}
     Q${eye.x} ${top - 3} ${outerX} ${top + 6}
     Q${outerX + side * 4} ${eye.y} ${outerX - side * 2} ${bottom - 6}
     Q${eye.x} ${bottom + 4} ${innerX} ${bottom - 8}
     Q${innerX - side * 2} ${eye.y} ${innerX} ${top + 4} Z`;
  return (
    <g>
      {plate(d, skin, ctx.sheen)}
      {paintedEye(eye.x, eye.y, eyeRX + 0.6, eyeRY + 0.4, iris)}
      <path d={`M${eye.x - side * 8} ${eye.y - eyeRY - 5} Q${eye.x} ${eye.y - eyeRY - 8} ${eye.x + side * 8} ${eye.y - eyeRY - 5.5}`} stroke="#4a382c" strokeWidth={1.5} fill="none" strokeLinecap="round" opacity={0.8} />
      {spectacleArm(outerX - side, eye.y - 2, side)}
      {rivets([[innerX + side * 1.5, top + 7], [innerX + side * 1.5, bottom - 10]])}
    </g>
  );
};

/** полумаска на половину лица: от лба до линии НАД ртом (рот открыт) */
const halfMask = (side: -1 | 1, ctx: ProstheticCtx) => {
  const { skin, eyeL, eyeR, eyeRX, eyeRY, noseTip } = ctx;
  const eye = side === -1 ? eyeL : eyeR;
  const top = 36;
  const bottom = Math.min(ctx.mouthTop - 2.5, noseTip + 4);
  const outerX = 150 + side * 54;
  const d =
    `M150 ${top + 2}
     Q${150 + side * 22} ${top - 3} ${outerX} ${top + 14}
     Q${outerX + side * 3} ${eye.y + 14} ${150 + side * 34} ${bottom - 2}
     Q${150 + side * 16} ${bottom + 3} 150 ${bottom}
     Z`;
  return (
    <g>
      {plate(d + ' ' + hole(eye.x, eye.y, eyeRX + 1.5, eyeRY + 1.8), skin, ctx.sheen)}
      <path d={`M${150 + side * 1.5} ${eye.y + 6} Q${150 + side * 4} ${noseTip - 6} ${150 + side * 2.5} ${noseTip}`} stroke={tinShade(skin)} strokeWidth={0.8} fill="none" opacity={0.7} />
      <path d={`M${eye.x - side * 8.5} ${eye.y - eyeRY - 5} Q${eye.x} ${eye.y - eyeRY - 8.5} ${eye.x + side * 8.5} ${eye.y - eyeRY - 5.5}`} stroke="#4a382c" strokeWidth={1.6} fill="none" strokeLinecap="round" opacity={0.8} />
      <path d={`M150 ${top + 3} V${bottom - 1}`} stroke={tinEdge} strokeWidth={0.7} opacity={0.55} />
      <path d={`M150.7 ${top + 4} V${bottom - 2}`} stroke={tinLight} strokeWidth={0.4} opacity={0.45} />
      {spectacleArm(150 + side * 46, eye.y - 4, side)}
      {rivets([[150 + side * 3, top + 8], [150 + side * 3, bottom - 5]])}
    </g>
  );
};

/** полная половина лица, включая рот: с прорезью по реальным губам */
const fullHalfMask = (side: -1 | 1, ctx: ProstheticCtx) => {
  const { skin, eyeL, eyeR, eyeRX, eyeRY, iris, chinY } = ctx;
  const eye = side === -1 ? eyeL : eyeR;
  const top = 36;
  const bottom = chinY - 1;
  const outerX = 150 + side * 54;
  const d =
    `M150 ${top + 2}
     Q${150 + side * 22} ${top - 3} ${outerX} ${top + 14}
     Q${outerX + side * 3} ${eye.y + 20} ${150 + side * 30} ${bottom - 10}
     Q${150 + side * 14} ${bottom + 3} 150 ${bottom}
     Z`;
  const mCy = (ctx.mouthTop + ctx.mouthBottom) / 2;
  const mRy = Math.max(4.2, (ctx.mouthBottom - ctx.mouthTop) / 2 + 2.4);
  const mRx = ctx.mouthHalfW + 4;
  const shapeClip = `${ctx.idPrefix}-full-${side}-shape`;
  const mouthMask = `${ctx.idPrefix}-full-${side}-mouth`;
  return (
    <g>
      <defs>
        <clipPath id={shapeClip} clipPathUnits="userSpaceOnUse"><path d={d} /></clipPath>
        <mask id={mouthMask} maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse" x={60} y={0} width={180} height={180} style={{ maskType: 'luminance' }}>
          <rect x={60} y={0} width={180} height={180} fill="white" />
          <ellipse cx={150} cy={mCy} rx={mRx} ry={mRy} fill="black" />
        </mask>
      </defs>
      <g clipPath={`url(#${shapeClip})`}>
        <g mask={`url(#${mouthMask})`} data-rounded-mouth-opening>
          {plate(d + ' ' + hole(eye.x, eye.y, eyeRX + 1.5, eyeRY + 1.8), skin, ctx.sheen)}
          {paintedEye(eye.x, eye.y, eyeRX + 0.6, eyeRY + 0.4, iris)}
          <path d={`M${eye.x - side * 8.5} ${eye.y - eyeRY - 5} Q${eye.x} ${eye.y - eyeRY - 8.5} ${eye.x + side * 8.5} ${eye.y - eyeRY - 5.5}`} stroke="#4a382c" strokeWidth={1.6} fill="none" strokeLinecap="round" opacity={0.8} />
          {mCy - mRy > top + 4 && <path d={`M150 ${top + 3} V${mCy - mRy - 0.5}`} stroke={tinEdge} strokeWidth={0.7} opacity={0.5} />}
          {mCy + mRy < bottom - 3 && <path d={`M150 ${mCy + mRy + 0.5} V${bottom - 2}`} stroke={tinEdge} strokeWidth={0.7} opacity={0.5} />}
          <ellipse cx={150} cy={mCy} rx={mRx + 0.35} ry={mRy + 0.35} fill="none" stroke={tinEdge} strokeWidth={0.55} opacity={0.55} />
          {rivets([[150 + side * 3, top + 8], [150 + side * 3, bottom - 6]])}
        </g>
      </g>
      {spectacleArm(150 + side * 46, eye.y - 4, side)}
    </g>
  );
};

/** верхняя маска: лоб, переносица, оба глаза в окулярах */
const upperMask = (ctx: ProstheticCtx) => {
  const { skin, eyeL, eyeR, eyeRX, eyeRY, noseTip } = ctx;
  const top = 36;
  const bottom = Math.min(eyeL.y, eyeR.y) + eyeRY + 12;
  const d =
    `M104 ${top + 10}
     Q150 ${top - 8} 196 ${top + 10}
     Q200 ${eyeR.y} 192 ${bottom - 4}
     Q172 ${bottom + 2} 156 ${bottom - 6}
     Q150 ${noseTip - 8} 144 ${bottom - 6}
     Q128 ${bottom + 2} 108 ${bottom - 4}
     Q100 ${eyeL.y} 104 ${top + 10} Z`;
  return (
    <g>
      {plate(
        d + ' ' + hole(eyeL.x, eyeL.y, eyeRX + 1.5, eyeRY + 1.8) + ' ' + hole(eyeR.x, eyeR.y, eyeRX + 1.5, eyeRY + 1.8),
        skin,
        ctx.sheen,
      )}
      {[eyeL, eyeR].map((eye, i) => (
        <path
          key={i}
          d={`M${eye.x - 8.5} ${eye.y - eyeRY - 5} Q${eye.x} ${eye.y - eyeRY - 8.5} ${eye.x + 8.5} ${eye.y - eyeRY - 5.5}`}
          stroke="#4a382c"
          strokeWidth={1.6}
          fill="none"
          strokeLinecap="round"
          opacity={0.8}
        />
      ))}
      <path d={`M150 ${eyeL.y + 2} V${noseTip - 9}`} stroke={tinShade(skin)} strokeWidth={0.8} opacity={0.6} />
      {spectacleArm(105, eyeL.y - 2, -1)}
      {spectacleArm(195, eyeR.y - 2, 1)}
      {rivets([[112, top + 14], [188, top + 14]])}
    </g>
  );
};

/** нижняя маска: нос, рот, подбородок; прорезь строго по губам */
const lowerMask = (ctx: ProstheticCtx) => {
  const { skin, noseTip, chinY } = ctx;
  const top = noseTip - 12;
  const bottom = chinY + 1;
  const d =
    `M112 ${top + 8}
     Q130 ${top - 3} 144 ${top}
     Q150 ${top - 4} 156 ${top}
     Q170 ${top - 3} 188 ${top + 8}
     Q194 ${(top + bottom) / 2} 184 ${bottom - 8}
     Q150 ${bottom + 6} 116 ${bottom - 8}
     Q106 ${(top + bottom) / 2} 112 ${top + 8} Z`;
  return (
    <g>
      {plate(d + ' ' + mouthHole(ctx), skin, ctx.sheen)}
      <g fill={tinEdge} opacity={0.8}>
        <ellipse cx={146.6} cy={noseTip - 0.5} rx={1.4} ry={0.9} />
        <ellipse cx={153.4} cy={noseTip - 0.5} rx={1.4} ry={0.9} />
      </g>
      <path d={`M150 ${top + 2} V${noseTip - 3}`} stroke={tinShade(skin)} strokeWidth={0.8} opacity={0.6} />
      <path d={`M120 ${top + 12} Q150 ${top + 6} 180 ${top + 12}`} stroke={tinLight} strokeWidth={0.6} fill="none" opacity={0.5} />
      {spectacleArm(113, top + 12, -1)}
      {spectacleArm(187, top + 12, 1)}
      {rivets([[118, bottom - 12], [182, bottom - 12]])}
    </g>
  );
};

/** накладка на щёку и челюсть (глаз открыт, рот открыт) */
const cheekMask = (side: -1 | 1, ctx: ProstheticCtx) => {
  const { skin, eyeL, eyeR, eyeRY, chinY } = ctx;
  const eye = side === -1 ? eyeL : eyeR;
  const top = eye.y + eyeRY + 4;
  const bottom = chinY - 3;
  const innerX = 150 + side * (ctx.mouthHalfW + 5);
  const outerX = 150 + side * 50;
  const d =
    `M${innerX} ${top + 2}
     Q${(innerX + outerX) / 2} ${top - 4} ${outerX} ${top + 4}
     Q${outerX + side * 3} ${(top + bottom) / 2} ${outerX - side * 8} ${bottom - 2}
     Q${(innerX + outerX) / 2} ${bottom + 4} ${innerX} ${bottom - 8}
     Q${innerX - side * 3} ${(top + bottom) / 2} ${innerX} ${top + 2} Z`;
  return (
    <g>
      {plate(d, skin, ctx.sheen)}
      <path d={`M${innerX + side * 3} ${top + 6} Q${(innerX + outerX) / 2} ${(top + bottom) / 2} ${innerX + side * 5} ${bottom - 8}`} stroke={tinLight} strokeWidth={0.55} fill="none" opacity={0.45} />
      {spectacleArm(outerX - side * 2, top + 6, side)}
      {rivets([[innerX + side * 2, top + 5], [innerX + side * 2, bottom - 9]])}
    </g>
  );
};

/** маска носа и верхней губы, с расписными усами */
const noseLipMask = (ctx: ProstheticCtx) => {
  const { skin, noseTip } = ctx;
  const top = noseTip - 20;
  const bottom = ctx.mouthTop - 0.5;
  const d =
    `M140 ${top + 3}
     Q150 ${top - 3} 160 ${top + 3}
     Q166 ${noseTip - 4} 164 ${noseTip + 2}
     Q162 ${bottom} 150 ${bottom + 1}
     Q138 ${bottom} 136 ${noseTip + 2}
     Q134 ${noseTip - 4} 140 ${top + 3} Z`;
  return (
    <g>
      {plate(d, skin, ctx.sheen)}
      <g fill={tinEdge} opacity={0.8}>
        <ellipse cx={146.6} cy={noseTip - 0.5} rx={1.4} ry={0.9} />
        <ellipse cx={153.4} cy={noseTip - 0.5} rx={1.4} ry={0.9} />
      </g>
      <path
        d={`M138 ${bottom - 3.5} Q144 ${bottom - 6} 149.5 ${bottom - 3} Q155 ${bottom - 6} 162 ${bottom - 3.5} Q155 ${bottom - 0.5} 149.5 ${bottom - 2} Q144 ${bottom - 0.5} 138 ${bottom - 3.5} Z`}
        fill="#4a382c"
        opacity={0.85}
      />
      <path d={`M150 ${top + 4} V${noseTip - 4}`} stroke={tinShade(skin)} strokeWidth={0.7} opacity={0.55} />
      {rivets([[139, noseTip - 6], [161, noseTip - 6]])}
    </g>
  );
};

export const FACE_PROSTHETICS: ProstheticOption[] = [
  { id: 'nose', name: 'Протез носа', art: noseProsthesis },
  { id: 'jaw', name: 'Протез челюсти', art: jawProsthesis },
  { id: 'glass-eye-left', name: 'Стеклянный глаз (левый)', art: () => null },
  { id: 'glass-eye-right', name: 'Стеклянный глаз (правый)', art: () => null },
  { id: 'eyepatch-left', name: 'Повязка на левый глаз', art: (p) => eyePatch({ ...p, side: -1 }) },
  { id: 'eyepatch-right', name: 'Повязка на правый глаз', art: (p) => eyePatch({ ...p, side: 1 }) },
  { id: 'mask-eye-left', name: 'Маска на левый глаз', clipToFace: true, art: (p) => eyeMask(-1, p) },
  { id: 'mask-eye-right', name: 'Маска на правый глаз', clipToFace: true, art: (p) => eyeMask(1, p) },
  { id: 'mask-half-left', name: 'Полумаска слева', clipToFace: true, art: (p) => halfMask(-1, p) },
  { id: 'mask-half-right', name: 'Полумаска справа', clipToFace: true, art: (p) => halfMask(1, p) },
  { id: 'mask-full-left', name: 'Полумаска слева, во всё лицо', clipToFace: true, art: (p) => fullHalfMask(-1, p) },
  { id: 'mask-full-right', name: 'Полумаска справа, во всё лицо', clipToFace: true, art: (p) => fullHalfMask(1, p) },
  { id: 'mask-cheek-left', name: 'Накладка на левую щёку', clipToFace: true, art: (p) => cheekMask(-1, p) },
  { id: 'mask-cheek-right', name: 'Накладка на правую щёку', clipToFace: true, art: (p) => cheekMask(1, p) },
  { id: 'mask-upper', name: 'Верхняя маска', clipToFace: true, art: upperMask },
  { id: 'mask-lower', name: 'Нижняя маска', clipToFace: true, art: lowerMask },
  { id: 'mask-nose-lip', name: 'Маска носа и губы', clipToFace: true, art: noseLipMask },
];
