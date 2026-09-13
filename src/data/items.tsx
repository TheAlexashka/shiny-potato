import type { ReactNode } from 'react';
import type { FaceSel, Gender, Item } from './types';
import { between, FOOT_OUTLINE, HAND_OUTLINE, type FigureGeometry } from './figureGeometry';
import { getFaceGeometry } from './faceGeometry';
import { effectsVolume } from './skinEffects';
import { Hair } from '../components/Hair';
import {
  armband, belt, boots, civilianDress, Clipped, eagle, gloves, ironCross, neckBand, neckerchief, outline, ribbon, shoes,
  skirtPath, sleeves, standCollar, stockings, stockingTop, torsoPath, trousers, wreathBadge,
} from './cloth';

/* ═══════════════════════ НАБОРЫ-КИТЫ ═══════════════════════ */

const FG = '#6a7059'; // фельдграу

import { CLOTH_COLORS, CLOTH_COLOR_NAMES, HAT_BAND_COLORS, HAT_BAND_COLOR_NAMES, type GarmentColorSlot, type ItemRenderContext } from './types';

/** читает выбранный цвет ткани предмета, иначе возвращает базовый */
function fabricTone(context: ItemRenderContext | undefined, itemId: string, slot: string, fallback: string): string {
  return context?.face.garmentColors?.[itemId]?.[slot] ?? fallback;
}

/** метаданные сменного цвета ткани */
function tone(slot: string, label: string, note?: string): GarmentColorSlot {
  return { slot, label, note, colors: CLOTH_COLORS, names: CLOTH_COLOR_NAMES };
}

/** типовой верх, где весь предмет красится одним цветом */
function topTone(label = 'Цвет ткани'): GarmentColorSlot[] {
  return [tone('body', label)];
}

/** затемняет цвет: base=(100-amount)%, black=amount% */
function darken(base: string, amount: number): string {
  return `color-mix(in srgb, #000000 ${amount}%, ${base})`;
}

/** палитра для бантов и галстуков */
const ACCENT_COLORS = ['#8b2635', '#5a1e2a', '#2c3a5c', '#2f5d3a', '#3d2b1a', '#1c1a17', '#4a4a4e', '#c9a24b', '#b8452f', '#7a3b4f'];
const ACCENT_COLOR_NAMES = ['Бордо', 'Сливовый', 'Тёмно-синий', 'Тёмно-зелёный', 'Коричневый', 'Чёрный', 'Графитовый', 'Золото', 'Терракота', 'Пыльная роза'];

/** отдельный сменный цвет акцента (бант, галстук) */
function accentTone(slot: string, label: string): GarmentColorSlot {
  return { slot, label, colors: ACCENT_COLORS, names: ACCENT_COLOR_NAMES };
}

/** читает выбранный цвет акцента */
function accentColor(context: ItemRenderContext | undefined, itemId: string, slot: string, fallback: string): string {
  return fabricTone(context, itemId, slot, fallback);
}

/** лента на федорах: один цвет на оба головных убора */
const FEDORA_BAND: GarmentColorSlot = {
  slot: 'band',
  label: 'Цвет ленты',
  note: 'одна лента на обеих федорах',
  colors: HAT_BAND_COLORS,
  names: HAT_BAND_COLOR_NAMES,
  storageKey: 'fedora',
};

/** читает общий цвет ленты федоры */
function fedoraBand(context: ItemRenderContext | undefined): string {
  return context?.face.garmentColors?.fedora?.band ?? '#1d1d1d';
}

/** основа блузки/джемпера: воротник, рукава, корпус */
function topBody(rig: FigureGeometry, toneColor: string, o: {
  hem: number; ease?: number; neck?: number; sleeveW?: number;
  cuff?: string; short?: number; collar?: string; collarTrim?: string;
}): ReactNode {
  return (
    <g>
      {neckBand(rig, o.collar ?? toneColor, { height: 114, drop: (o.neck ?? 126) - 12, trim: o.collarTrim })}
      {sleeves(rig, toneColor, o.sleeveW ?? 22, { cuff: !!o.cuff, cuffColor: o.cuff, short: o.short })}
      <path d={torsoPath(rig, { hem: o.hem, hemHalf: rig.waistHalf + 7, chestEase: o.ease ?? 1.08, waistEase: (o.ease ?? 1.08) + 0.03, hipEase: 1.06, neckDrop: o.neck ?? 126 })} fill={toneColor} {...outline} />
    </g>
  );
}

/** резинка по низу трикотажа */
function knitHem(rig: FigureGeometry, toneColor: string, y: number): ReactNode {
  const w = rig.waistHalf + 7;
  return (
    <g>
      <path d={`M${rig.waist.x - w} ${y} L${rig.waist.x + w} ${y} L${rig.waist.x + w} ${y + 11} L${rig.waist.x - w} ${y + 11} Z`} fill={toneColor} stroke="rgba(0,0,0,0.28)" strokeWidth={0.7} />
      {Array.from({ length: 13 }, (_, i) => (
        <path key={i} d={`M${rig.waist.x - w + 2 + i * ((w * 2 - 4) / 12)} ${y + 1} L${rig.waist.x - w + 2 + i * ((w * 2 - 4) / 12)} ${y + 10}`} stroke="rgba(255,255,255,0.18)" strokeWidth={1} />
      ))}
    </g>
  );
}

/** узор, обрезанный по контуру одежды */
function fabricPattern(rig: FigureGeometry, hem: number, children: ReactNode): ReactNode {
  const d = torsoPath(rig, { hem, hemHalf: rig.waistHalf + 7, chestEase: 1.08, waistEase: 1.11, hipEase: 1.06, neckDrop: 126 });
  return <Clipped d={d}>{children}</Clipped>;
}

/** фактура твида: диагональные рубчики (без собственной обрезки) */
function tweedWeaveInner(rig: FigureGeometry, hem: number, light = '#d9c39a', dark = '#54401f'): ReactNode {
  return (
    <g fill="none" strokeLinecap="round">
      {Array.from({ length: 24 }, (_, i) => (
        <path key={`h${i}`} d={`M${rig.chest.x - rig.chestHalf - 6} ${144 + i * 12} L${rig.chest.x + rig.chestHalf + 6} ${142 + i * 12}`} stroke={i % 2 ? light : dark} strokeWidth={1.1} opacity={0.5} />
      ))}
      {Array.from({ length: 14 }, (_, i) => (
        <path key={`v${i}`} d={`M${rig.chest.x - rig.chestHalf + i * 6} 138 L${rig.chest.x - rig.chestHalf + i * 6 + 4} ${hem}`} stroke={dark} strokeWidth={0.6} opacity={0.3} />
      ))}
    </g>
  );
}



/** узор, обрезанный по контуру юбки */
function fabricSkirt(_rig: FigureGeometry, d: string, _hem: number, children: ReactNode): ReactNode {
  return <Clipped d={d}>{children}</Clipped>;
}

/** фактура кожи: жёсткие блики */
function leatherGloss(rig: FigureGeometry, hem: number): ReactNode {
  return fabricPattern(rig, hem, (
    <g fill="none" strokeLinecap="round">
      <path d={`M${rig.chest.x - rig.chestHalf * 0.55} ${rig.chest.y + 2} L${rig.chest.x - rig.chestHalf * 0.62} ${hem - 16}`} stroke="rgba(255,255,255,0.22)" strokeWidth={4} />
      <path d={`M${rig.chest.x + rig.chestHalf * 0.62} ${rig.chest.y + 8} L${rig.chest.x + rig.chestHalf * 0.55} ${hem - 12}`} stroke="rgba(255,255,255,0.13)" strokeWidth={3} />
    </g>
  ));
}

/** Чашки бюстгальтера, прилегающие к реальному бюсту (объём и расставленность из рига) */
function braCups(rig: FigureGeometry, fill: string, trim?: string): ReactNode {
  const r = rig.bustRadius * 0.96;
  const cy = rig.bustCenterY;
  const off = rig.bustOffset;
  const cxb = rig.chest.x;
  return (
    <g data-bra>
      {[-1, 1].map((s) => {
        const cx = cxb + s * off;
        const topY = cy - r * 0.42;
        return (
          <g key={s}>
            {/* Чашка огибает нижнюю часть груди, верхний край повторяет сферу */}
            <path
              d={`M${cx - r * 0.94} ${topY + r * 0.3} Q${cx} ${cy - r * 1.12} ${cx + r * 0.94} ${topY + r * 0.3} C${cx + r} ${cy + r * 0.4} ${cx + r * 0.62} ${cy + r * 0.82} ${cx} ${cy + r * 0.86} C${cx - r * 0.62} ${cy + r * 0.82} ${cx - r} ${cy + r * 0.4} ${cx - r * 0.94} ${topY + r * 0.3} Z`}
              fill={fill}
              {...outline}
            />
            {/* Шов-косточка под чашкой */}
            <path d={`M${cx - r * 0.8} ${cy + r * 0.5} Q${cx} ${cy + r * 0.92} ${cx + r * 0.8} ${cy + r * 0.5}`} fill="none" stroke={trim ?? 'rgba(0,0,0,0.25)'} strokeWidth={0.9} />
          </g>
        );
      })}
      {/* Пояс под грудью */}
      <path
        d={`M${cxb - off - r * 0.86} ${cy + r * 0.62} Q${cxb} ${cy + r * 1.18} ${cxb + off + r * 0.86} ${cy + r * 0.62}`}
        fill="none"
        stroke={fill}
        strokeWidth={4.5}
        strokeLinecap="round"
      />
      {/* Бретели: от внешнего верха чашки по плечу */}
      {[-1, 1].map((s) => {
        const cx = cxb + s * off;
        const sh = rig.shoulders[s === -1 ? 0 : 1];
        return (
          <path
            key={`strap-${s}`}
            d={`M${cx + s * r * 0.5} ${cy - r * 0.82} L${sh.x - s * 10} ${sh.y + 5}`}
            stroke={fill}
            strokeWidth={3}
            strokeLinecap="round"
            fill="none"
          />
        );
      })}
    </g>
  );
}

/** Белая блуза в квадратном/фигурном вырезе традиционного платья (дирндль, финское) */
function dirndlBlouse(rig: FigureGeometry, neckY: number, width = 0.56): ReactNode {
  const half = rig.chestHalf * width;
  return (
    <g data-blouse>
      <path
        d={`M${rig.chest.x - half} ${neckY - 1} Q${rig.chest.x} ${neckY + 9} ${rig.chest.x + half} ${neckY - 1} L${rig.chest.x + half + 3} ${neckY + 5} Q${rig.chest.x} ${neckY + 15} ${rig.chest.x - half - 3} ${neckY + 5} Z`}
        fill="#fbf6ec"
        {...outline}
      />
      {/* оборки по краю выреза */}
      <path
        d={`M${rig.chest.x - half} ${neckY} Q${rig.chest.x} ${neckY + 8} ${rig.chest.x + half} ${neckY}`}
        fill="none"
        stroke="#e2d8c4"
        strokeWidth={1.2}
        strokeDasharray="2.5 2"
      />
      {/* рюши по центру */}
      <path d={`M${rig.chest.x} ${neckY + 2} q-2 5 0 9 q2 -4 0 -9`} fill="#f4efe4" stroke="#e2d8c4" strokeWidth={0.7} />
    </g>
  );
}

/* ══════════ МЕХОВЫЕ ГОРЖЕТКИ (цельные шкурки на шею: спина + плечи) ══════════ */
interface StolePalette {
  fur: string;
  dark: string;
  light: string;
  muzzle: string;
  nose: string;
  tailTip?: string;
  bib?: string;
}

/* ══════════ ПАЛИТРЫ НАТУРАЛЬНОГО МЕХА ══════════ */
const FUR_PALETTE: Record<string, StolePalette> = {
  rabbit: { fur: '#c8b09a', dark: '#8a6e56', light: '#f0e2d2', muzzle: '#e8d8c4', nose: '#4a3424' },
  mink: { fur: '#5c4230', dark: '#3a2a1e', light: '#a8845a', muzzle: '#c8b090', nose: '#241a12' },
  lynx: { fur: '#d8c9a8', dark: '#a08a66', light: '#f6f0e2', muzzle: '#f0e8d4', nose: '#3a2c1e' },
  fox: { fur: '#c9702e', dark: '#8a4418', light: '#f0c090', muzzle: '#f6f0e6', nose: '#1c1410' },
  sable: { fur: '#3a2418', dark: '#241610', light: '#8a7458', muzzle: '#c8b090', nose: '#14100c' },
};

/** Детерминированный ворс меха: расходящиеся остевые волоски по эллипсу */
function furHair(cx: number, cy: number, rx: number, ry: number, p: StolePalette, count: number, seed: number): ReactNode {
  return (
    <g fill="none" strokeLinecap="round">
      {Array.from({ length: count }, (_, i) => {
        const a = (i * 2.399 + seed) % (Math.PI * 2);
        const r = Math.sqrt(((i * 37 + seed * 13) % 101) / 101);
        const x = cx + Math.cos(a) * rx * r;
        const y = cy + Math.sin(a) * ry * r;
        const len = 1.5 + ((i * 7 + seed) % 5) * 0.35;
        const dx = Math.cos(a) * len;
        const dy = Math.sin(a) * len * 0.8;
        return (
          <path
            key={i}
            d={`M${x} ${y} l${dx} ${dy}`}
            stroke={i % 3 === 0 ? p.light : p.dark}
            strokeWidth={0.55}
            opacity={i % 3 === 0 ? 0.5 : 0.35}
          />
        );
      })}
    </g>
  );
}

export type StoleKind = 'fox' | 'marten' | 'sable' | 'silverfox' | 'ermine';

/** Задняя часть горжетки — огибает шею сзади со спины (слой back, под телом и головой) */
function stoleBack(rig: FigureGeometry, p: StolePalette): ReactNode {
  const shL = rig.shoulders[0];
  const shR = rig.shoulders[1];
  const pL = { x: shL.x + 10, y: shL.y - 6 };
  const pR = { x: shR.x - 10, y: shR.y - 6 };
  const d = `M${pL.x} ${pL.y} Q150 114 ${pR.x} ${pR.y}`;
  return (
    <g data-stole-back>
      <path d={d} stroke={p.dark} strokeWidth={21} fill="none" strokeLinecap="round" />
      <path d={d} stroke={p.fur} strokeWidth={17} fill="none" strokeLinecap="round" />
      <path d={d} stroke={p.dark} strokeWidth={15} fill="none" strokeLinecap="round" strokeDasharray="1.5 8" strokeDashoffset={4} opacity={0.4} />
      <path d={d} stroke={p.light} strokeWidth={13} fill="none" strokeLinecap="round" strokeDasharray="1.5 8" opacity={0.55} />
    </g>
  );
}

/** Передняя часть горжетки: перевал через плечи и две полосы меха, спускающиеся на грудь */
function stoleFront(rig: FigureGeometry, p: StolePalette): { endL: { x: number; y: number }; endR: { x: number; y: number }; node: ReactNode } {
  const cx = rig.chest.x;
  const cy = rig.chest.y;
  const shL = rig.shoulders[0];
  const shR = rig.shoulders[1];
  const ovL = { x: shL.x + 10, y: shL.y - 6 };
  const ovR = { x: shR.x - 10, y: shR.y - 6 };
  const endL = { x: cx - 18, y: cy + 18 };
  const endR = { x: cx + 18, y: cy + 14 };

  const dLeft = `M${ovL.x - 1} ${ovL.y - 1} Q${shL.x + 8} ${shL.y + 14} ${endL.x} ${endL.y}`;
  const dRight = `M${ovR.x + 1} ${ovR.y - 1} Q${shR.x - 8} ${shR.y + 14} ${endR.x} ${endR.y}`;

  const node = (
    <g data-stole-front>
      {/* Плечевые накладки (перевал меха через верхушку плеча со спины на грудь) */}
      <circle cx={ovL.x} cy={ovL.y + 2} r={10} fill={p.fur} {...outline} />
      <circle cx={ovR.x} cy={ovR.y + 2} r={10} fill={p.fur} {...outline} />

      {/* Правая полоса шкурки (к хвосту) */}
      <path d={dRight} stroke={p.dark} strokeWidth={17} fill="none" strokeLinecap="round" />
      <path d={dRight} stroke={p.fur} strokeWidth={14} fill="none" strokeLinecap="round" />
      <path d={dRight} stroke={p.light} strokeWidth={11} fill="none" strokeLinecap="round" strokeDasharray="1.5 8" opacity={0.5} />

      {/* Левая полоса шкурки (к голове) */}
      <path d={dLeft} stroke={p.dark} strokeWidth={18} fill="none" strokeLinecap="round" />
      <path d={dLeft} stroke={p.fur} strokeWidth={15} fill="none" strokeLinecap="round" />
      <path d={dLeft} stroke={p.light} strokeWidth={12} fill="none" strokeLinecap="round" strokeDasharray="1.5 8" opacity={0.5} />

      {/* Золотистая/серебряная застежка-клипса на груди */}
      <ellipse cx={cx} cy={cy + 8} rx={3.5} ry={4.5} fill="#c9a24b" stroke="rgba(0,0,0,0.4)" strokeWidth={0.7} />
      <circle cx={cx} cy={cy + 8} r={1.6} fill="#4a3210" />
    </g>
  );

  return { endL, endR, node };
}

/** Голова зверя на левом конце горжетки + передние лапы */
function stoleHead(x: number, y: number, p: StolePalette, kind: StoleKind): ReactNode {
  const pointed = kind === 'fox' || kind === 'silverfox';
  const isErmine = kind === 'ermine';
  return (
    <g transform={`translate(${x} ${y})`} data-stole-head={kind}>
      {p.bib && <ellipse cx={3} cy={2} rx={7} ry={10} fill={p.bib} opacity={0.95} />}
      {pointed ? (
        <g>
          <path d="M-9,-4 L-14,-20 L-1,-10 Z" fill={p.fur} {...outline} />
          <path d="M9,-4 L14,-20 L1,-10 Z" fill={p.fur} {...outline} />
          <path d="M-9,-7 L-11.5,-16 L-4,-10 Z" fill={p.dark} />
          <path d="M9,-7 L11.5,-16 L4,-10 Z" fill={p.dark} />
        </g>
      ) : (
        <g>
          <circle cx={-7.5} cy={-7} r={isErmine ? 2.8 : 3.8} fill={p.fur} {...outline} />
          <circle cx={7.5} cy={-7} r={isErmine ? 2.8 : 3.8} fill={p.fur} {...outline} />
          <circle cx={-7.5} cy={-7} r={isErmine ? 1.2 : 1.7} fill={p.dark} />
          <circle cx={7.5} cy={-7} r={isErmine ? 1.2 : 1.7} fill={p.dark} />
        </g>
      )}
      <ellipse cx={0} cy={2} rx={pointed ? 10 : isErmine ? 7.2 : 8.5} ry={pointed ? 11 : isErmine ? 8 : 9.5} fill={p.fur} {...outline} />
      <ellipse cx={-5.5} cy={5} rx={4} ry={5.5} fill={p.muzzle} opacity={0.95} />
      <ellipse cx={5.5} cy={5} rx={4} ry={5.5} fill={p.muzzle} opacity={0.95} />
      <ellipse cx={0} cy={8} rx={pointed ? 4.5 : isErmine ? 3.2 : 3.8} ry={pointed ? 6 : isErmine ? 3.8 : 4.5} fill={p.muzzle} />
      <ellipse cx={0} cy={pointed ? 12.5 : isErmine ? 9.5 : 11} rx={pointed ? 2.2 : isErmine ? 1.4 : 1.8} ry={pointed ? 1.8 : isErmine ? 1.2 : 1.5} fill={p.nose} />
      <path d="M0,14 L0,16 M0,16 Q-2.5,17 -4,16 M0,16 Q2.5,17 4,16" stroke={p.nose} strokeWidth={0.6} fill="none" opacity={0.8} />
      {/* Стеклянные глазки таксидермии с бликом */}
      {[-1, 1].map((s) => (
        <g key={s}>
          <circle cx={s * (isErmine ? 3.5 : 4.5)} cy={-1} r={isErmine ? 1.1 : 1.4} fill="#1c1410" />
          <circle cx={s * (isErmine ? 3.5 : 4.5) - 0.4} cy={-1.5} r={0.45} fill="#fff" />
        </g>
      ))}
      <path d="M-6,9 L-13,7 M-6,11 L-12,12 M6,9 L13,7 M6,11 L12,12" stroke={p.muzzle} strokeWidth={0.5} opacity={0.7} />
      {/* Передние лапки с коготками */}
      {[-1, 1].map((s) => (
        <g key={`paw-${s}`}>
          <ellipse cx={s * 6} cy={22} rx={isErmine ? 2.2 : 3} ry={isErmine ? 4 : 5.5} fill={pointed ? p.dark : p.fur} {...outline} />
          <path d={`M${s * 6 - 1.2},24 L${s * 6 - 1.2},27 M${s * 6 + 1.2},24 L${s * 6 + 1.2},27`} stroke={p.dark} strokeWidth={0.6} />
        </g>
      ))}
    </g>
  );
}

/** Пушистый хвост на правом конце горжетки */
function stoleTail(x: number, y: number, p: StolePalette, kind: StoleKind): ReactNode {
  if (kind === 'fox' || kind === 'silverfox') {
    const d = 'M-7,0 C-13,14 -12,30 -5,42 C-2,46 4,45 6,40 C10,28 9,12 5,0 Z';
    return (
      <g transform={`translate(${x} ${y})`} data-stole-tail={kind}>
        <path d={d} fill={p.fur} {...outline} />
        <Clipped d={d}>
          <ellipse cx={0.5} cy={37} rx={6} ry={8} fill={p.tailTip ?? p.muzzle} />
          <path d="M-5,6 Q-6,22 -3,36 M1,4 Q0,22 1,38 M6,6 Q7,20 5,34" stroke={p.dark} strokeWidth={0.8} fill="none" opacity={0.5} />
          <path d="M-4,4 Q-5,20 -2,34 M3,4 Q4,20 3,36" stroke={p.light} strokeWidth={0.8} fill="none" opacity={0.6} />
        </Clipped>
        {/* Задние лапки у основания хвоста */}
        {[-1, 1].map((s) => (
          <ellipse key={`hpaw-${s}`} cx={s * 8} cy={4} rx={2.8} ry={5} fill={p.dark} {...outline} />
        ))}
      </g>
    );
  }
  if (kind === 'ermine') {
    // Горностаевый хвост с контрастным угольно-черным кончиком
    const d = 'M-4,0 C-6,12 -5,26 -2,36 C-1,38 2,38 3,35 C6,24 5,10 3,0 Z';
    return (
      <g transform={`translate(${x} ${y})`} data-stole-tail="ermine">
        <path d={d} fill={p.fur} {...outline} />
        <Clipped d={d}>
          <path d="M-5,24 L6,24 L4,38 L-3,38 Z" fill="#141416" />
        </Clipped>
        {/* Дополнительные свисающие хвостики горностая */}
        <g transform="translate(-10 6) rotate(14)">
          <path d="M-2,0 C-4,8 -3,18 -1,24 C0,26 2,26 3,23 C4,16 3,6 2,0 Z" fill="#f8f6f0" {...outline} />
          <path d="M-2.5,16 L3.5,16 L2.5,25 L-1.5,25 Z" fill="#141416" />
        </g>
        <g transform="translate(10 8) rotate(-18)">
          <path d="M-2,0 C-4,8 -3,18 -1,24 C0,26 2,26 3,23 C4,16 3,6 2,0 Z" fill="#f8f6f0" {...outline} />
          <path d="M-2.5,16 L3.5,16 L2.5,25 L-1.5,25 Z" fill="#141416" />
        </g>
      </g>
    );
  }
  const slim = kind === 'marten';
  const d = slim
    ? 'M-5.5,0 C-9,16 -8,34 -3,48 C-1,51 3,50 4,46 C7,32 6,14 4,0 Z'
    : 'M-7,0 C-11,14 -10,30 -4,40 C-1,43 4,42 5,38 C9,26 8,12 4,0 Z';
  return (
    <g transform={`translate(${x} ${y})`} data-stole-tail={kind}>
      <path d={d} fill={p.fur} {...outline} />
      <Clipped d={d}>
        <path d="M-3,4 Q-4,24 -1,44 M2,4 Q3,24 2,44" stroke={p.dark} strokeWidth={1} fill="none" opacity={0.5} />
        <path d="M-1,4 Q-2,24 0,44" stroke={p.light} strokeWidth={1} fill="none" opacity={0.55} />
      </Clipped>
      {/* Задние лапки */}
      {[-1, 1].map((s) => (
        <ellipse key={`hpaw-${s}`} cx={s * 7} cy={5} rx={2.6} ry={4.8} fill={p.fur} {...outline} />
      ))}
    </g>
  );
}

function epaulettes(rig: FigureGeometry, color: string, piping?: string, buttonColor = '#c9c9c4'): ReactNode {
  return rig.shoulders.map((s, i) => {
    const side = i ? 1 : -1;
    return (
      <g key={i} transform={`translate(${s.x + side * 3} ${s.y + 1}) rotate(${side * -6}) scale(${side < 0 ? -1 : 1} 1)`}>
        <rect x={-3} y={-5.5} width={19} height={9.5} rx={3} fill={color} stroke={piping ?? 'rgba(0,0,0,0.35)'} strokeWidth={piping ? 1.1 : 0.6} />
        <circle cx={13} cy={-0.8} r={1.7} fill={buttonColor} />
      </g>
    );
  });
}

function collarPatches(rig: FigureGeometry, color: string, litzen?: string, runes?: boolean): ReactNode {
  return [-1, 1].map((s) => (
    <g key={s} transform={`translate(${150 + s * (rig.neckHalf * 0.92)} 127) rotate(${s * 16})`}>
      <rect x={-3} y={-6} width={7} height={12} rx={1} fill={color} stroke="rgba(0,0,0,0.35)" strokeWidth={0.5} />
      {litzen && !(runes && s > 0) && (
        <g fill={litzen}>
          <rect x={-1.8} y={-4} width={4.4} height={1.6} rx={0.6} />
          <rect x={-1.8} y={-0.6} width={4.4} height={1.6} rx={0.6} />
          <rect x={-1.8} y={2.8} width={4.4} height={1.6} rx={0.6} />
        </g>
      )}
      {runes && s > 0 && (
        <g stroke={litzen ?? '#c9c9c4'} strokeWidth={1.2} fill="none">
          <path d="M-1.4 -4 L0.2 -4 L-1.2 0 L0.6 0 L-1 4" />
        </g>
      )}
    </g>
  ));
}

interface TunicOpts {
  shell: string;
  collar: string;
  piping?: string;
  trouser: string;
  hem?: number;
  buttons?: string;
  beltLeather?: string;
  beltBuckle?: string;
  bootColor?: string;
  noBoots?: boolean;
  breeches?: boolean;
  double?: boolean;
  trouserPiping?: string;
  epaulette?: { color: string; piping?: string; button?: string };
  collarPatch?: { color: string; litzen?: string; runes?: boolean };
  eaglePos?: 'viewer-left' | 'viewer-right' | 'left-arm' | null;
  eagleColor?: string;
  pocketFlap?: boolean;
  hiddenPlacket?: boolean;
  necktie?: string;
  sleeveW?: number;
  cuffColor?: string;
}

function tunicKit(rig: FigureGeometry, o: TunicOpts): ReactNode {
  const hem = o.hem ?? 366;
  const btn = o.buttons ?? '#b9b9b2';
  const eagleX = rig.chest.x + (o.eaglePos === 'viewer-right' ? 17 : -17);
  const btnYs = [150, 184, 218, 252, 286, 320];
  return (
    <g>
      {trousers(rig, o.trouser, { breeches: o.breeches, crease: true, inTunic: true, tunicHem: hem })}
      {o.trouserPiping && rig.legs.map((leg) => (
        <path key={leg.side} d={`M${leg.hip.x + leg.side * 13} ${leg.hip.y + 12} L${leg.knee.x + leg.side * 12} ${leg.knee.y} L${leg.ankle.x + leg.side * 11} ${leg.ankle.y}`} stroke={o.trouserPiping} strokeWidth={1.4} fill="none" opacity={0.85} />
      ))}
      {!o.noBoots && boots(rig, o.bootColor ?? '#241a12')}
      {sleeves(rig, o.shell, o.sleeveW ?? 26, { cuff: true, cuffColor: o.cuffColor ?? 'rgba(0,0,0,0.22)' })}
      {/* Короткий китель (танкист, ГЮ) сидит по талии: узкий подол без «полов» */}
      <path
        d={torsoPath(rig, hem <= rig.hips[0].y + 4
          ? { hem, hemHalf: rig.waistHalf + 9, waistEase: 1.16 }
          : { hem, hemHalf: rig.hipHalf + (o.breeches ? 16 : 11), waistEase: 1.18, hipEase: 1.22 })}
        fill={o.shell}
        {...outline}
      />
      <path d={`M${rig.chest.x} 138 Q${rig.waist.x} ${Math.min(rig.waist.y, hem - 20)} ${rig.waist.x} ${hem - 6}`} stroke="rgba(0,0,0,0.22)" strokeWidth={1} fill="none" />
      {hem > rig.hips[0].y + 4 && (
        <path d={`M${rig.chest.x - rig.chestHalf * 0.98} ${rig.chest.y + 20} Q${rig.waist.x - rig.waistHalf} ${rig.waist.y + 6} ${rig.crotch.x - rig.hipHalf - 4} ${hem - 14}`} stroke="rgba(0,0,0,0.1)" strokeWidth={2.4} fill="none" />
      )}
      {!o.hiddenPlacket && !o.double && btnYs.filter((y) => y + 4 < hem - 6).map((y, i) => {
        const t = i / (btnYs.length - 1);
        const x = rig.chest.x + (rig.waist.x - rig.chest.x) * t;
        return <circle key={y} cx={x} cy={y + 4} r={2.3} fill={btn} stroke="rgba(0,0,0,0.4)" strokeWidth={0.5} />;
      })}
      {o.hiddenPlacket && <path d={`M${rig.chest.x + 3.4} 140 L${rig.waist.x + 3.4} ${hem - 12}`} stroke="rgba(0,0,0,0.18)" strokeWidth={1} fill="none" />}
      {o.double && [150, 186, 222, 258, 294].map((y) => (
        <g key={y}>
          <circle cx={rig.chest.x - 9} cy={y + 4} r={2.5} fill={btn} stroke="rgba(0,0,0,0.4)" strokeWidth={0.5} />
          <circle cx={rig.chest.x + 9} cy={y + 4} r={2.5} fill={btn} stroke="rgba(0,0,0,0.4)" strokeWidth={0.5} />
        </g>
      ))}
      {o.pocketFlap && [-1, 1].map((s) => (
        <g key={s}>
          <rect x={rig.chest.x + s * 16 - 7.5} y={rig.chest.y + 20} width={15} height={17} rx={1.5} fill="none" stroke="rgba(0,0,0,0.28)" strokeWidth={1} />
          <path d={`M${rig.chest.x + s * 16 - 7.5} ${rig.chest.y + 25} L${rig.chest.x + s * 16 + 7.5} ${rig.chest.y + 25}`} stroke="rgba(0,0,0,0.32)" strokeWidth={1.2} />
          <circle cx={rig.chest.x + s * 16} cy={rig.chest.y + 28.5} r={1.3} fill={btn} />
        </g>
      ))}
      {standCollar(rig, o.collar, o.piping)}
      {o.collarPatch && collarPatches(rig, o.collarPatch.color, o.collarPatch.litzen, o.collarPatch.runes)}
      {o.necktie && <path d={`M${150 - 4.5} 135 L${150 + 4.5} 135 L${150 + 3} ${rig.chest.y + 40} L150 ${rig.chest.y + 48} L${150 - 3} ${rig.chest.y + 40}Z`} fill={o.necktie} {...outline} />}
      {o.beltLeather && belt(rig, o.beltLeather, o.beltBuckle ?? '#8a8a84')}
      {o.epaulette && epaulettes(rig, o.epaulette.color, o.epaulette.piping, o.epaulette.button)}
      {(o.eaglePos === 'viewer-left' || o.eaglePos === 'viewer-right') && eagle(eagleX, rig.chest.y - 2, 1.35, o.eagleColor ?? '#b9b9b2')}
      {o.eaglePos === 'left-arm' && (() => {
        const a = rig.arms[0];
        const p = between(a.shoulder, a.elbow, 0.42);
        return eagle(p.x, p.y, 1.1, o.eagleColor ?? '#c9c9c4');
      })()}
    </g>
  );
}

interface DressOpts {
  dress: string;
  hem?: number;
  flare?: number;
  sleevesW?: number;
  sleeveColor?: string;
  shortSleeve?: boolean;
  collar?: string;
  apron?: string;
  armbandNode?: ReactNode;
  neckerchiefColor?: string;
  knotColor?: string;
  beltColor?: string;
  buckle?: string;
  socks?: boolean;
  buttons?: string;
  piping?: string;
}

function dressKit(rig: FigureGeometry, o: DressOpts): ReactNode {
  const hem = o.hem ?? 442;
  const flare = o.flare ?? 56;
  const btn = o.buttons ?? '#c9c9c4';
  return (
    <g>
      {o.socks && stockings(rig)}
      {/* Горловина платья: закрывает основание шеи и ключицы */}
      {neckBand(rig, o.collar ?? o.dress, { height: 117, drop: 130, trim: o.piping })}
      {sleeves(rig, o.sleeveColor ?? o.dress, o.sleevesW ?? 20, o.shortSleeve ? { short: 0.52 } : undefined)}
      <path d={torsoPath(rig, { hem, hemHalf: flare, chestEase: 1.07, waistEase: 1.1, hipEase: 1.07, neckDrop: 131 })} fill={o.dress} {...outline} />
      {[-2, -1, 0, 1, 2].map((i) => (
        <path key={i} d={`M${rig.waist.x + i * (rig.waistHalf * 0.42)} ${rig.waist.y + 10} Q${rig.crotch.x + i * (flare * 0.42)} ${(rig.waist.y + hem) / 2 + 30} ${rig.crotch.x + i * (flare * 0.5)} ${hem - 4}`} stroke="rgba(0,0,0,0.14)" strokeWidth={1} fill="none" />
      ))}
      {[150, 172, 194, 216].map((y) => (
        <circle key={y} cx={rig.chest.x} cy={y + 4} r={1.7} fill={btn} stroke="rgba(0,0,0,0.3)" strokeWidth={0.4} />
      ))}
      {o.piping && <path d={`M${150 - rig.neckHalf - 4} 120 Q150 132 ${150 + rig.neckHalf + 4} 120`} stroke={o.piping} strokeWidth={1.3} fill="none" />}
      {o.collar && (
        <g fill={o.collar} {...outline}>
          <ellipse cx={150 - rig.neckHalf * 0.55 - 2} cy={127} rx={rig.neckHalf * 0.62} ry={7} transform={`rotate(-16 ${150 - rig.neckHalf * 0.55 - 2} 127)`} />
          <ellipse cx={150 + rig.neckHalf * 0.55 + 2} cy={127} rx={rig.neckHalf * 0.62} ry={7} transform={`rotate(16 ${150 + rig.neckHalf * 0.55 + 2} 127)`} />
        </g>
      )}
      {o.apron && (
        <g>
          <path d={skirtPath(rig, { hem: hem - 8, flare: flare * 0.56 })} fill={o.apron} opacity={0.94} {...outline} />
          <path d={`M${rig.waist.x - rig.waistHalf * 0.6} ${rig.waist.y + 3} L${rig.waist.x + rig.waistHalf * 0.6} ${rig.waist.y + 3}`} stroke={o.apron} strokeWidth={4} />
        </g>
      )}
      {o.beltColor && belt(rig, o.beltColor, o.buckle ?? '#3a3a3e')}
      {o.neckerchiefColor && neckerchief(rig, o.neckerchiefColor, o.knotColor)}
      {o.armbandNode}
    </g>
  );
}

/* ═══════════════════════ ГОЛОВНЫЕ УБОРЫ (хелперы) ═══════════════════════ */

function stahlhelm(shell: string, variant: 'm35' | 'm40' | 'm42', decal?: ReactNode, gender: Gender = 'f', face?: FaceSel): ReactNode {
  const geometry = getFaceGeometry(gender, face?.shape ?? (gender === 'm' ? 'square' : 'oval'), {
    ...face,
    cheekVolume: Math.round(effectsVolume(face?.skinEffects)),
  });
  const chin = geometry.chinY + 4;
  const strap = `M109 67 C111 96 ${150 - geometry.cheek} ${chin - 2} 141 ${chin} Q150 ${chin + 2} 159 ${chin} C${150 + geometry.cheek} ${chin - 2} 189 96 191 67`;
  return (
    <g data-helmet={variant}>
      {/* The strap follows the cheeks and closes below the actual chin. */}
      <g data-helmet-chinstrap fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d={strap} stroke="#241b13" strokeWidth={4.2} />
        <path d={strap} stroke="#624832" strokeWidth={2.8} />
        <path d={strap} stroke="#b39470" strokeWidth={0.55} opacity={0.55} />
        <rect x={157.5} y={chin - 2.5} width={6.5} height={5} rx={0.8} stroke="#a5a195" strokeWidth={1} />
      </g>
      <path d="M103 68 C103 38 123 21 150 21 C177 21 197 38 197 68 L202 78 Q188 71 178 71 L122 71 Q112 71 98 78 Z" fill={shell} stroke="rgba(0,0,0,0.4)" strokeWidth={1} />
      <path d="M103 66 Q150 56 197 66 L195 60 Q150 50 105 60 Z" fill="rgba(0,0,0,0.16)" />
      <path d="M134 25 Q150 18 166 25" stroke="rgba(255,255,255,0.3)" strokeWidth={2.2} fill="none" />
      {variant === 'm35' && <path d="M98 78 Q150 67 202 78" stroke="rgba(255,255,255,0.22)" strokeWidth={2.6} fill="none" />}
      {variant === 'm40' && <g fill="rgba(0,0,0,0.32)"><circle cx={117} cy={55} r={1.5} /><circle cx={183} cy={55} r={1.5} /></g>}
      {variant === 'm42' && <path d="M98 78 L103 68 M202 78 L197 68" stroke="rgba(0,0,0,0.3)" strokeWidth={1.2} />}
      <circle cx={109} cy={68} r={1.8} fill="#79786c" stroke="#34392d" strokeWidth={0.6} />
      <circle cx={191} cy={68} r={1.8} fill="#79786c" stroke="#34392d" strokeWidth={0.6} />
      {decal}
    </g>
  );
}

const heerDecal = (
  <g>
    <path d="M167 42 L177 42 L177 49 Q172 54 167 49Z" fill="#e8e6dd" stroke="#3a3a3e" strokeWidth={0.5} />
    <rect x={167} y={42} width={10} height={2.3} fill="#20222a" />
    <rect x={167} y={44.3} width={10} height={2.3} fill="#e8e6dd" />
    <rect x={167} y={46.6} width={10} height={2.3} fill="#a03030" />
  </g>
);

const ssDecal = (
  <g>
    <path d="M167 42 L177 42 L177 49 Q172 54 167 49Z" fill="#c9c9c4" stroke="#3a3a3e" strokeWidth={0.5} />
    {eagle(172, 46.5, 0.5, '#2c2c30')}
  </g>
);

function schiffchen(color: string, darker: string, piping: string, emblem: ReactNode): ReactNode {
  return (
    <g>
      <path d="M114 56 Q126 34 148 29 L186 45 Q189 51 184 54 Q150 44 116 58 Z" fill={color} {...outline} />
      <path d="M116 58 Q150 46 184 54 L181 59 Q150 50 119 62 Z" fill={darker} {...outline} />
      <path d="M124 46 L136 37 L131 51" stroke={piping} strokeWidth={1.1} fill="none" />
      {emblem}
      <circle cx={127} cy={53} r={2.2} fill={piping} stroke="rgba(0,0,0,0.3)" strokeWidth={0.5} />
    </g>
  );
}

function capVisor(): ReactNode {
  return (
    <g data-cap-visor>
      {/* A solid closed surface overlaps the band; highlights do not replace its fill. */}
      <path d="M115 55 Q150 46 185 55 C182 63 172 70 150 70 C128 70 118 63 115 55Z" fill="#15171c" fillOpacity={1} stroke="#080a0e" strokeWidth={0.9} strokeLinejoin="round" />
      <path d="M119 60 C132 70 168 70 181 60" stroke="#080a0e" strokeWidth={1.5} fill="none" strokeLinecap="round" />
      <path d="M125 59 Q150 54 175 59" stroke="#7a808b" strokeWidth={1.1} fill="none" opacity={0.38} strokeLinecap="round" />
    </g>
  );
}

function schirmmutze(crown: string, band: string, piping: string, cord: string, emblem: ReactNode, whiteTop?: boolean): ReactNode {
  return (
    <g>
      <path d="M111 47 Q108 27 150 25 Q192 27 189 47 Q150 37 111 47Z" fill={whiteTop ? '#f2efe6' : crown} {...outline} />
      {capVisor()}
      <path d="M111 47 Q150 38 189 47 L188 57 Q150 48 112 57 Z" fill={band} {...outline} />
      <path d="M111 47 Q150 38 189 47" stroke={piping} strokeWidth={1.1} fill="none" />
      <path d="M112 57 Q150 48 188 57" stroke={piping} strokeWidth={1.1} fill="none" />
      <path d="M121 55 Q150 61 179 55" stroke={cord} strokeWidth={1.6} fill="none" />
      {emblem}
    </g>
  );
}

/** федора: тулья, лента и поля (лента окрашивается) */
function fedora(crown: string, band: string): ReactNode {
  return (
    <g>
      <path d="M118,60 L124,16 Q150,6 176,16 L182,60 Z" fill={crown} {...outline} />
      <path d="M136,12 Q150,30 164,12" stroke="rgba(0,0,0,0.35)" strokeWidth={2} fill="none" />
      <path d="M122,22 Q150,34 178,22" stroke="rgba(255,255,255,0.13)" strokeWidth={1.5} fill="none" />
      {/* лента-околыш */}
      <path d="M118,50 L182,50 L182,60 L118,60 Z" fill={band} {...outline} />
      <path d="M118,50 L182,50" stroke="rgba(255,255,255,0.16)" strokeWidth={1} />
      {/* поля */}
      <ellipse cx={150} cy={62} rx={50} ry={9} fill={crown} {...outline} />
      <path d="M118,60 L182,60 L181,64 L119,64 Z" fill={band} opacity={0.6} />
      <path d="M104 60 Q150 52 196 60" stroke="rgba(0,0,0,0.18)" strokeWidth={1.4} fill="none" />
      {/* бантик на ленте сбоку */}
      <path d="M172,54 L166,50 L166,58 Z M172,54 L178,50 L178,58 Z" fill={band} stroke="rgba(0,0,0,0.3)" strokeWidth={0.5} />
      <circle cx={172} cy={54} r={1.6} fill="rgba(0,0,0,0.35)" />
    </g>
  );
}

const hatBeret = (color: string, badge?: ReactNode) => (
  <g>
    <ellipse cx={152} cy={42} rx={40} ry={16} fill={color} transform="rotate(-10 152 42)" {...outline} />
    <path d="M118,54 Q150,44 186,46" stroke="rgba(0,0,0,0.25)" strokeWidth={1.2} fill="none" />
    <circle cx={150} cy={28} r={2.5} fill={color} stroke="rgba(0,0,0,0.3)" />
    {badge}
  </g>
);

/* ═══════════════════════ ЛЕНТЫ НАГРАД ═══════════════════════ */

const EK_RIBBON = ['#20222a', '#e8e6dd', '#20222a', '#e8e6dd', '#20222a'];
const RK_RIBBON = ['#20222a', '#e8e6dd', '#a03030', '#e8e6dd', '#20222a'];
const OST_RIBBON = ['#a03030', '#e8e6dd', '#a03030'];
const MUTTER_RIBBON = ['#e8e6dd', '#3a5a9a', '#e8e6dd', '#3a5a9a', '#e8e6dd'];

/** стилизованная партийная эмблема на повязке: белый круг с тёмным геометрическим знаком */
const bandEmblem = (
  <g>
    <circle cx={0} cy={0} r={5.4} fill="#f2efe6" stroke="rgba(0,0,0,0.3)" strokeWidth={0.4} />
    <g stroke="#1f2024" strokeWidth={1.5} fill="none" strokeLinecap="square" transform="rotate(45)">
      <path d="M-3.4 0 H3.4 M0 -3.4 V3.4" />
      <path d="M-3.4 0 v-2.4 M3.4 0 v2.4 M0 -3.4 h2.4 M0 3.4 h-2.4" />
    </g>
  </g>
);

/* ═══════════════════════ СПИСОК ПРЕДМЕТОВ ═══════════════════════ */

export const ITEMS: Item[] = [
  /* ===== ВОЛОСЫ (женские) ===== */
  { id: 'hair-waves', name: 'Холодная волна', category: 'hair', fit: 'f', z: 60, bbox: [101, 20, 98, 114], back: (_g, _rig, ctx) => <Hair styleId="hair-waves" layer="back" face={ctx?.face} />, render: (_g, _rig, ctx) => <Hair styleId="hair-waves" face={ctx?.face} /> },
  { id: 'hair-victory', name: 'Виктори-роллы', category: 'hair', fit: 'f', z: 60, bbox: [99, 18, 102, 149], back: (_g, _rig, ctx) => <Hair styleId="hair-victory" layer="back" face={ctx?.face} />, render: (_g, _rig, ctx) => <Hair styleId="hair-victory" face={ctx?.face} /> },
  { id: 'hair-chignon', name: 'Низкий шиньон', category: 'hair', fit: 'f', z: 60, bbox: [100, 20, 100, 116], back: (_g, _rig, ctx) => <Hair styleId="hair-chignon" layer="back" face={ctx?.face} />, render: (_g, _rig, ctx) => <Hair styleId="hair-chignon" face={ctx?.face} /> },
  { id: 'hair-braid', name: 'Коса-корона', category: 'hair', fit: 'f', z: 60, bbox: [99, 15, 102, 121], back: (_g, _rig, ctx) => <Hair styleId="hair-braid" layer="back" face={ctx?.face} />, render: (_g, _rig, ctx) => <Hair styleId="hair-braid" face={ctx?.face} /> },
  { id: 'hair-long', name: 'Локоны до плеч', category: 'hair', fit: 'f', z: 60, bbox: [94, 18, 112, 162], back: (_g, _rig, ctx) => <Hair styleId="hair-long" layer="back" face={ctx?.face} />, render: (_g, _rig, ctx) => <Hair styleId="hair-long" face={ctx?.face} /> },
  { id: 'hair-bob', name: 'Волнистый боб', category: 'hair', fit: 'f', z: 60, bbox: [96, 18, 108, 132], back: (_g, _rig, ctx) => <Hair styleId="hair-bob" layer="back" face={ctx?.face} />, render: (_g, _rig, ctx) => <Hair styleId="hair-bob" face={ctx?.face} /> },
  { id: 'hair-pageboy', name: 'Паж с подкрученными концами', category: 'hair', fit: 'f', z: 60, bbox: [95, 18, 110, 136], back: (_g, _rig, ctx) => <Hair styleId="hair-pageboy" layer="back" face={ctx?.face} />, render: (_g, _rig, ctx) => <Hair styleId="hair-pageboy" face={ctx?.face} /> },
  { id: 'hair-side-curls', name: 'Локоны набок', category: 'hair', fit: 'f', z: 60, bbox: [95, 15, 110, 154], back: (_g, _rig, ctx) => <Hair styleId="hair-side-curls" layer="back" face={ctx?.face} />, render: (_g, _rig, ctx) => <Hair styleId="hair-side-curls" face={ctx?.face} /> },
  { id: 'hair-gibson', name: 'Низкий валик', category: 'hair', fit: 'f', z: 60, bbox: [96, 18, 108, 130], back: (_g, _rig, ctx) => <Hair styleId="hair-gibson" layer="back" face={ctx?.face} />, render: (_g, _rig, ctx) => <Hair styleId="hair-gibson" face={ctx?.face} /> },
  { id: 'hair-curly-bob', name: 'Кудрявое каре', category: 'hair', fit: 'f', z: 60, bbox: [94, 15, 112, 144], back: (_g, _rig, ctx) => <Hair styleId="hair-curly-bob" layer="back" face={ctx?.face} />, render: (_g, _rig, ctx) => <Hair styleId="hair-curly-bob" face={ctx?.face} /> },
  { id: 'hair-side-buns', name: 'Баранки по бокам', category: 'hair', fit: 'f', z: 60, bbox: [78, 28, 144, 122], back: (_g, _rig, ctx) => <Hair styleId="hair-side-buns" layer="back" face={ctx?.face} />, render: (_g, _rig, ctx) => <Hair styleId="hair-side-buns" face={ctx?.face} /> },
  { id: 'hair-two-braids', name: 'Две косы', category: 'hair', fit: 'f', z: 60, bbox: [96, 20, 108, 162], back: (_g, _rig, ctx) => <Hair styleId="hair-two-braids" layer="back" face={ctx?.face} />, render: (_g, _rig, ctx) => <Hair styleId="hair-two-braids" face={ctx?.face} /> },
  { id: 'hair-side-braid', name: 'Коса набок', category: 'hair', fit: 'f', z: 60, bbox: [96, 18, 110, 160], back: (_g, _rig, ctx) => <Hair styleId="hair-side-braid" layer="back" face={ctx?.face} />, render: (_g, _rig, ctx) => <Hair styleId="hair-side-braid" face={ctx?.face} /> },
  { id: 'hair-spike-braid', name: 'Колосок с лентой', category: 'hair', fit: 'f', z: 60, bbox: [100, 20, 100, 146], back: (_g, _rig, ctx) => <Hair styleId="hair-spike-braid" layer="back" face={ctx?.face} />, render: (_g, _rig, ctx) => <Hair styleId="hair-spike-braid" face={ctx?.face} /> },
  { id: 'hair-jp-shimada', name: 'Симада с канзаси', category: 'hair', fit: 'f', z: 60, bbox: [92, 8, 116, 140], back: (_g, _rig, ctx) => <Hair styleId="hair-jp-shimada" layer="back" face={ctx?.face} />, render: (_g, _rig, ctx) => <Hair styleId="hair-jp-shimada" face={ctx?.face} /> },
  { id: 'hair-jp-momoware', name: 'Момоварэ', category: 'hair', fit: 'f', z: 60, bbox: [88, 10, 124, 130], back: (_g, _rig, ctx) => <Hair styleId="hair-jp-momoware" layer="back" face={ctx?.face} />, render: (_g, _rig, ctx) => <Hair styleId="hair-jp-momoware" face={ctx?.face} /> },

  /* ===== ВОЛОСЫ (мужские) ===== */
  { id: 'hair-slick', name: 'Зачёс назад', category: 'hair', fit: 'm', z: 60, bbox: [102, 20, 96, 116], render: (_g, _rig, ctx) => <Hair styleId="hair-slick" face={ctx?.face} /> },
  { id: 'hair-part', name: 'Косой пробор', category: 'hair', fit: 'm', z: 60, bbox: [101, 20, 98, 116], render: (_g, _rig, ctx) => <Hair styleId="hair-part" face={ctx?.face} /> },
  { id: 'hair-short', name: 'Короткая стрижка', category: 'hair', fit: 'm', z: 60, bbox: [104, 24, 92, 112], render: (_g, _rig, ctx) => <Hair styleId="hair-short" face={ctx?.face} /> },
  { id: 'hair-pomp', name: 'Волна надо лбом', category: 'hair', fit: 'm', z: 60, bbox: [101, 13, 98, 123], render: (_g, _rig, ctx) => <Hair styleId="hair-pomp" face={ctx?.face} /> },
  { id: 'hair-male-waves', name: 'Мягкие волны', category: 'hair', fit: 'm', z: 60, bbox: [101, 15, 98, 120], render: (_g, _rig, ctx) => <Hair styleId="hair-male-waves" face={ctx?.face} /> },
  { id: 'hair-undercut', name: 'Зачёс с короткими висками', category: 'hair', fit: 'm', z: 60, bbox: [101, 12, 98, 124], render: (_g, _rig, ctx) => <Hair styleId="hair-undercut" face={ctx?.face} /> },
  { id: 'hair-fade-top', name: 'Выбритые виски, длинный верх', category: 'hair', fit: 'm', z: 60, bbox: [101, 10, 98, 126], render: (_g, _rig, ctx) => <Hair styleId="hair-fade-top" face={ctx?.face} /> },
  { id: 'hair-side-part-fade', name: 'Пробор с выбритыми висками', category: 'hair', fit: 'm', z: 60, bbox: [101, 12, 98, 124], render: (_g, _rig, ctx) => <Hair styleId="hair-side-part-fade" face={ctx?.face} /> },
  { id: 'hair-comb-over-fade', name: 'Текстурный зачёс с фейдом', category: 'hair', fit: 'm', z: 60, bbox: [101, 10, 98, 126], render: (_g, _rig, ctx) => <Hair styleId="hair-comb-over-fade" face={ctx?.face} /> },
  { id: 'hair-classic-taper', name: 'Классический тейпер 30-х', category: 'hair', fit: 'm', z: 60, bbox: [101, 15, 98, 120], render: (_g, _rig, ctx) => <Hair styleId="hair-classic-taper" face={ctx?.face} /> },
  { id: 'hair-crew', name: 'Короткая ёжиком', category: 'hair', fit: 'm', z: 60, bbox: [103, 22, 94, 114], render: (_g, _rig, ctx) => <Hair styleId="hair-crew" face={ctx?.face} /> },
  { id: 'hair-curtains', name: 'Пробор по центру', category: 'hair', fit: 'm', z: 60, bbox: [100, 14, 100, 122], render: (_g, _rig, ctx) => <Hair styleId="hair-curtains" face={ctx?.face} /> },
  /* ===== ВОЛОСЫ: 1930-е (по референсам) ===== */
  { id: 'hair-marcel', name: 'Марсель (гофре)', category: 'hair', fit: 'f', z: 60, bbox: [100, 20, 100, 116], back: (_g, _rig, ctx) => <Hair styleId="hair-marcel" layer="back" face={ctx?.face} />, render: (_g, _rig, ctx) => <Hair styleId="hair-marcel" face={ctx?.face} /> },
  { id: 'hair-finger-wave', name: 'Пальцевые волны', category: 'hair', fit: 'f', z: 60, bbox: [98, 20, 104, 118], back: (_g, _rig, ctx) => <Hair styleId="hair-finger-wave" layer="back" face={ctx?.face} />, render: (_g, _rig, ctx) => <Hair styleId="hair-finger-wave" face={ctx?.face} /> },
  { id: 'hair-shingle', name: 'Шингл (Итон)', category: 'hair', fit: 'f', z: 60, bbox: [102, 22, 96, 110], back: (_g, _rig, ctx) => <Hair styleId="hair-shingle" layer="back" face={ctx?.face} />, render: (_g, _rig, ctx) => <Hair styleId="hair-shingle" face={ctx?.face} /> },
  { id: 'hair-thirties-curls', name: 'Кудри у щёк, 30-е', category: 'hair', fit: 'f', z: 60, bbox: [98, 20, 104, 120], back: (_g, _rig, ctx) => <Hair styleId="hair-thirties-curls" layer="back" face={ctx?.face} />, render: (_g, _rig, ctx) => <Hair styleId="hair-thirties-curls" face={ctx?.face} /> },
  { id: 'hair-sculpted-side', name: 'Скульптурная с пробором', category: 'hair', fit: 'f', z: 60, bbox: [98, 20, 104, 118], back: (_g, _rig, ctx) => <Hair styleId="hair-sculpted-side" layer="back" face={ctx?.face} />, render: (_g, _rig, ctx) => <Hair styleId="hair-sculpted-side" face={ctx?.face} /> },
  { id: 'hair-feathered30', name: 'Перьевая короткая', category: 'hair', fit: 'f', z: 60, bbox: [100, 20, 100, 116], back: (_g, _rig, ctx) => <Hair styleId="hair-feathered30" layer="back" face={ctx?.face} />, render: (_g, _rig, ctx) => <Hair styleId="hair-feathered30" face={ctx?.face} /> },
  { id: 'hair-crownbraid', name: 'Плетёная корона', category: 'hair', fit: 'f', z: 60, bbox: [100, 22, 100, 110], back: (_g, _rig, ctx) => <Hair styleId="hair-crownbraid" layer="back" face={ctx?.face} />, render: (_g, _rig, ctx) => <Hair styleId="hair-crownbraid" face={ctx?.face} /> },
  { id: 'hair-topknot', name: 'Высокий узел', category: 'hair', fit: 'f', z: 60, bbox: [104, 8, 92, 104], back: (_g, _rig, ctx) => <Hair styleId="hair-topknot" layer="back" face={ctx?.face} />, render: (_g, _rig, ctx) => <Hair styleId="hair-topknot" face={ctx?.face} /> },
  { id: 'hair-ear-ringlets', name: 'Колечки у ушей', category: 'hair', fit: 'f', z: 60, bbox: [100, 20, 100, 112], back: (_g, _rig, ctx) => <Hair styleId="hair-ear-ringlets" layer="back" face={ctx?.face} />, render: (_g, _rig, ctx) => <Hair styleId="hair-ear-ringlets" face={ctx?.face} /> },
  { id: 'hair-nape-roll', name: 'Низкий валик', category: 'hair', fit: 'f', z: 60, bbox: [102, 20, 96, 112], back: (_g, _rig, ctx) => <Hair styleId="hair-nape-roll" layer="back" face={ctx?.face} />, render: (_g, _rig, ctx) => <Hair styleId="hair-nape-roll" face={ctx?.face} /> },
  { id: 'hair-low-bun-waves', name: 'Пучок с боковой волной', category: 'hair', fit: 'f', z: 60, bbox: [98, 20, 104, 114], back: (_g, _rig, ctx) => <Hair styleId="hair-low-bun-waves" layer="back" face={ctx?.face} />, render: (_g, _rig, ctx) => <Hair styleId="hair-low-bun-waves" face={ctx?.face} /> },
  { id: 'hair-jp-marugari', name: 'Маругари (армейский ёжик)', category: 'hair', fit: 'm', z: 60, bbox: [103, 24, 94, 112], render: () => <Hair styleId="hair-jp-marugari" /> },
  { id: 'hair-jp-shichisan', name: 'Ситисан — пробор 7:3', category: 'hair', fit: 'm', z: 60, bbox: [100, 18, 100, 120], render: () => <Hair styleId="hair-jp-shichisan" /> },
  { id: 'hair-slick-recede', name: 'Зачёс назад с высоким лбом', category: 'hair', fit: 'm', z: 60, bbox: [101, 18, 98, 122], render: () => <Hair styleId="hair-slick-recede" /> },
  { id: 'hair-comb-back-thin', name: 'Зачёс назад, редеющие волосы', category: 'hair', fit: 'm', z: 60, bbox: [101, 18, 98, 124], render: () => <Hair styleId="hair-comb-back-thin" /> },

  /* ===== ИСПОДНЕЕ (по фигуре) ===== */
  {
    id: 'und-slip', name: 'Шёлковая комбинация', category: 'underwear', fit: 'f', z: 10, bbox: [86, 120, 128, 240],
    render: (_g, rig) => (
      <g>
        {/* Бретели: от чашки лифа по поверхности плеча (а не через шею) */}
        <path d={`M${rig.chest.x - rig.chestHalf * 0.82} ${rig.chest.y - 6} L${rig.shoulders[0].x + 13} ${rig.shoulders[0].y + 5}`} stroke="#e8b6a6" strokeWidth={4.5} strokeLinecap="round" fill="none" />
        <path d={`M${rig.chest.x + rig.chestHalf * 0.82} ${rig.chest.y - 6} L${rig.shoulders[1].x - 13} ${rig.shoulders[1].y + 5}`} stroke="#e8b6a6" strokeWidth={4.5} strokeLinecap="round" fill="none" />
        {/* Комбинация облегает тело (ease≈1), чтобы не выглядывать из-под верхней одежды */}
        <path d={torsoPath(rig, { hem: 342, hemHalf: rig.hipHalf + 3, chestEase: 1.0, waistEase: 1.02, hipEase: 1.02, neckDrop: rig.chest.y - 8, bare: true, bareHalf: rig.chestHalf * 0.7 })} fill="#f4cbbd" {...outline} />
        <path d={`M${rig.crotch.x - rig.hipHalf - 2} 336 q6,-8 12,0 q6,-8 12,0 q6,-8 12,0 q6,-8 12,0 q6,-8 12,0 q6,-8 12,0 q6,-8 12,0`} stroke="#fff" strokeWidth={1.5} fill="none" />
        <path d={`M${rig.chest.x - 14} ${rig.chest.y - 2} L${rig.chest.x} ${rig.chest.y + 12} L${rig.chest.x + 14} ${rig.chest.y - 2}`} stroke="#fff" strokeWidth={1.2} fill="none" />
        <circle cx={rig.chest.x} cy={rig.chest.y + 4} r={2} fill="#8b2635" />
      </g>
    ),
  },
  {
    id: 'und-set', name: 'Бюстгальтер и панталоны', category: 'underwear', fit: 'f', z: 10, bbox: [86, 130, 128, 200],
    render: (_g, rig) => (
      <g>
        {/* Чашки, бретели и пояс под грудью — по реальному бюсту */}
        {braCups(rig, '#f3ead8', '#d9c9a8')}
        <path d={`M${rig.waist.x - rig.waistHalf - 4} ${rig.waist.y + 4} L${rig.waist.x + rig.waistHalf + 4} ${rig.waist.y + 4} L${rig.hips[1].x + 8} ${rig.hips[1].y + 16} L${rig.crotch.x + 10} ${rig.crotch.y + 12} Q${rig.crotch.x} ${rig.crotch.y + 2} ${rig.crotch.x - 10} ${rig.crotch.y + 12} L${rig.hips[0].x - 8} ${rig.hips[0].y + 16} Z`} fill="#f3ead8" {...outline} />
        <path d={`M${rig.waist.x - rig.waistHalf - 4} ${rig.waist.y + 8} L${rig.waist.x + rig.waistHalf + 4} ${rig.waist.y + 8}`} stroke="#d9c9a8" strokeWidth={1.2} />
      </g>
    ),
  },
  {
    id: 'und-corset', name: 'Пояс с чулками', category: 'underwear', fit: 'f', z: 10, bbox: [86, 130, 128, 440],
    render: (_g, rig) => (
      <g>
        {/* Чашки, бретели и пояс под грудью — по реальному бюсту */}
        {braCups(rig, '#f1e7d4', '#d9c9a8')}
        {/* Пояс-грация: от талии до бёдер, облегающий */}
        <path d={torsoPath(rig, { hem: rig.hips[0].y + 12, hemHalf: rig.hipHalf + 2, chestEase: 1.0, waistEase: 1.02, hipEase: 1.02, neckDrop: rig.waist.y - 22, bare: true, bareHalf: rig.waistHalf + 2 })} fill="#f1e7d4" {...outline} />
        {[-0.6, -0.2, 0.2, 0.6].map((t) => (
          <path key={t} d={`M${rig.waist.x + t * rig.waistHalf} ${rig.waist.y - 16} L${rig.waist.x + t * rig.waistHalf} ${rig.hips[0].y + 8}`} stroke="#c8b898" strokeWidth={1} />
        ))}
        {stockings(rig, { top: 0.4, tone: 'rgba(30,20,24,0.4)', seam: true })}
        {/* Подвязки: две на ногу, точно на кромку чулка, с золотыми пряжками */}
        {rig.legs.map((leg) => {
          const st = stockingTop(leg, 0.4);
          const beltY = rig.hips[0].y + 10;
          const straps = [
            { from: leg.hip.x + leg.side * 4, to: st.outer.x - leg.side * 2 },
            { from: leg.hip.x - leg.side * 12, to: st.inner.x + leg.side * 2 },
          ];
          return (
            <g key={leg.side}>
              {straps.map((s, j) => (
                <g key={j}>
                  <path d={`M${s.from} ${beltY} L${s.to} ${st.y}`} stroke="#c8b898" strokeWidth={2.4} strokeLinecap="round" />
                  <rect x={s.to - 3.5} y={st.y - 3} width={7} height={6.5} rx={1.2} fill="#c9a24b" stroke="rgba(0,0,0,0.45)" strokeWidth={0.5} />
                </g>
              ))}
            </g>
          );
        })}
      </g>
    ),
  },
  {
    id: 'und-tank', name: 'Майка и трусы', category: 'underwear', fit: 'm', z: 10, bbox: [80, 130, 140, 210],
    render: (_g, rig) => (
      <g>
        {/* Майка: облегающая, с открытым вырезом на бретелях */}
        <path d={torsoPath(rig, { hem: rig.waist.y + 16, hemHalf: rig.waistHalf + 2, chestEase: 1.0, waistEase: 1.02, neckDrop: 140, bare: true, bareHalf: rig.chestHalf * 0.55 })} fill="#f6f2ea" {...outline} />
        <path d={`M${150 - rig.chestHalf * 0.55} 132 Q150 146 ${150 + rig.chestHalf * 0.55} 132`} stroke="#cfc6b4" strokeWidth={1.6} fill="none" />
        {/* бретели */}
        <path d={`M${150 - rig.chestHalf * 0.55} 132 L${rig.shoulders[0].x + 12} ${rig.shoulders[0].y + 6} M${150 + rig.chestHalf * 0.55} 132 L${rig.shoulders[1].x - 12} ${rig.shoulders[1].y + 6}`} stroke="#f6f2ea" strokeWidth={7} strokeLinecap="round" fill="none" />
        <path d={`M${rig.waist.x - rig.waistHalf - 4} ${rig.waist.y + 8} L${rig.waist.x + rig.waistHalf + 4} ${rig.waist.y + 8} L${rig.hips[1].x + 8} ${rig.hips[1].y + 16} L${rig.crotch.x + 10} ${rig.crotch.y + 12} Q${rig.crotch.x} ${rig.crotch.y + 2} ${rig.crotch.x - 10} ${rig.crotch.y + 12} L${rig.hips[0].x - 8} ${rig.hips[0].y + 16} Z`} fill="#f6f2ea" {...outline} />
        <path d={`M${rig.waist.x - rig.waistHalf - 4} ${rig.waist.y + 12} L${rig.waist.x + rig.waistHalf + 4} ${rig.waist.y + 12}`} stroke="#cfc6b4" strokeWidth={1.5} />
      </g>
    ),
  },
  {
    id: 'und-union', name: 'Кальсоны с рубахой', category: 'underwear', fit: 'm', z: 10, bbox: [70, 130, 160, 450],
    render: (_g, rig) => (
      <g>
        {sleeves(rig, '#ece3cf', 23)}
        {/* Кальсоны облегают ноги: строим по контурам рига, чтобы не вылезали из брюк */}
        {trousers(rig, '#ece3cf', { thighEase: 1, shinEase: 0, inTunic: true })}
        {rig.legs.map((leg) => (
          <path key={leg.side} d={`M${leg.ankle.x - 9} ${leg.ankle.y - 6} L${leg.ankle.x + 9} ${leg.ankle.y - 6}`} stroke="#d9d0bc" strokeWidth={1.4} />
        ))}
        <path d={torsoPath(rig, { hem: rig.crotch.y + 6, hemHalf: rig.hipHalf + 2, chestEase: 1.02, waistEase: 1.04, hipEase: 1.02, neckDrop: 130 })} fill="#ece3cf" {...outline} />
        <path d={`M${150 - rig.neckBaseHalf - 2} 128 Q150 138 ${150 + rig.neckBaseHalf + 2} 128`} fill="none" stroke="#cfc6b4" strokeWidth={1.5} />
        {[150, 172, 194, 216].map((y) => (
          <circle key={y} cx={rig.chest.x} cy={y} r={2} fill="#cfc6b4" />
        ))}
      </g>
    ),
  },
  {
    id: 'und-tank-fitted', name: 'Приталенная майка и трусы', category: 'underwear', fit: 'm', z: 10, bbox: [80, 130, 140, 210],
    render: (_g, rig) => (
      <g>
        {/* Облегающая майка-борцовка: узкие бретели, приталенный силуэт */}
        <path d={torsoPath(rig, { hem: rig.waist.y + 18, hemHalf: rig.waistHalf, chestEase: 0.98, waistEase: 0.96, neckDrop: 150, bare: true, bareHalf: rig.chestHalf * 0.4 })} fill="#eceae2" {...outline} />
        {/* Узкие бретели-борцовки */}
        <path d={`M${150 - rig.chestHalf * 0.4} 138 L${rig.shoulders[0].x + 16} ${rig.shoulders[0].y + 4} M${150 + rig.chestHalf * 0.4} 138 L${rig.shoulders[1].x - 16} ${rig.shoulders[1].y + 4}`} stroke="#eceae2" strokeWidth={5} strokeLinecap="round" fill="none" />
        <path d={`M${150 - rig.chestHalf * 0.4} 140 Q150 152 ${150 + rig.chestHalf * 0.4} 140`} stroke="#cfc6b4" strokeWidth={1.4} fill="none" />
        {/* Облегающие боксеры */}
        <path d={`M${rig.waist.x - rig.waistHalf - 2} ${rig.waist.y + 10} L${rig.waist.x + rig.waistHalf + 2} ${rig.waist.y + 10} L${rig.hips[1].x + 6} ${rig.hips[1].y + 16} L${rig.crotch.x + 9} ${rig.crotch.y + 16} Q${rig.crotch.x} ${rig.crotch.y + 6} ${rig.crotch.x - 9} ${rig.crotch.y + 16} L${rig.hips[0].x - 6} ${rig.hips[0].y + 16} Z`} fill="#3a3d45" {...outline} />
        <path d={`M${rig.waist.x - rig.waistHalf - 2} ${rig.waist.y + 14} L${rig.waist.x + rig.waistHalf + 2} ${rig.waist.y + 14}`} stroke="#2b2e35" strokeWidth={3} />
        <rect x={rig.waist.x - rig.waistHalf - 2} y={rig.waist.y + 10} width={(rig.waistHalf + 2) * 2} height={4} fill="#c9c4b4" opacity={0.3} />
      </g>
    ),
  },
  {
    id: 'und-tshirt', name: 'Белая футболка и трусы', category: 'underwear', fit: 'm', z: 10, bbox: [70, 118, 160, 225],
    render: (_g, rig) => {
      const white = '#f7f4ec';
      const seam = '#d9d3c4';
      return (
        <g>
          {/* Короткие облегающие рукава */}
          {sleeves(rig, white, 22, { short: 0.36 })}
          {/* Прилегающий корпус: круглый вырез под шею, подол под пояс трусов */}
          <path d={torsoPath(rig, { hem: rig.waist.y + 20, hemHalf: rig.waistHalf + 2, chestEase: 1.01, waistEase: 1.02, hipEase: 1.02, neckDrop: 134 })} fill={white} {...outline} />
          {/* Круглая горловина в рубчик */}
          <path d={`M${150 - rig.neckBaseHalf - 2} 127 Q150 140 ${150 + rig.neckBaseHalf + 2} 127`} fill="none" stroke={seam} strokeWidth={2.2} />
          <path d={`M${150 - rig.neckBaseHalf - 2} 127 Q150 140 ${150 + rig.neckBaseHalf + 2} 127`} fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth={0.6} />
          {/* Лёгкие складки по бокам груди и у талии */}
          <path d={`M${rig.chest.x - rig.chestHalf * 0.85} ${rig.chest.y + 4} q3 12 1 24`} stroke="rgba(0,0,0,0.08)" strokeWidth={1.2} fill="none" strokeLinecap="round" />
          <path d={`M${rig.chest.x + rig.chestHalf * 0.85} ${rig.chest.y + 4} q-3 12 -1 24`} stroke="rgba(0,0,0,0.08)" strokeWidth={1.2} fill="none" strokeLinecap="round" />
          {/* Подшивка подола */}
          <path d={`M${rig.waist.x - rig.waistHalf - 2} ${rig.waist.y + 17} L${rig.waist.x + rig.waistHalf + 2} ${rig.waist.y + 17}`} stroke={seam} strokeWidth={1.1} />
          {/* Трусы */}
          <path d={`M${rig.waist.x - rig.waistHalf - 4} ${rig.waist.y + 10} L${rig.waist.x + rig.waistHalf + 4} ${rig.waist.y + 10} L${rig.hips[1].x + 8} ${rig.hips[1].y + 16} L${rig.crotch.x + 10} ${rig.crotch.y + 12} Q${rig.crotch.x} ${rig.crotch.y + 2} ${rig.crotch.x - 10} ${rig.crotch.y + 12} L${rig.hips[0].x - 8} ${rig.hips[0].y + 16} Z`} fill="#eeeae0" {...outline} />
          <path d={`M${rig.waist.x - rig.waistHalf - 4} ${rig.waist.y + 14} L${rig.waist.x + rig.waistHalf + 4} ${rig.waist.y + 14}`} stroke="#cfc6b4" strokeWidth={1.5} />
        </g>
      );
    },
  },
  {
    id: 'und-briefs', name: 'Трусы-плавки', category: 'underwear', fit: 'm', z: 10, bbox: [96, 250, 108, 90],
    render: (_g, rig) => (
      <g>
        {/* Компактные плавки без майки */}
        <path d={`M${rig.waist.x - rig.hipHalf - 2} ${rig.hips[0].y - 2} L${rig.waist.x + rig.hipHalf + 2} ${rig.hips[0].y - 2} L${rig.hips[1].x + 4} ${rig.hips[1].y + 14} L${rig.crotch.x + 11} ${rig.crotch.y + 18} Q${rig.crotch.x} ${rig.crotch.y + 8} ${rig.crotch.x - 11} ${rig.crotch.y + 18} L${rig.hips[0].x - 4} ${rig.hips[0].y + 14} Z`} fill="#4a4e57" {...outline} />
        <path d={`M${rig.waist.x - rig.hipHalf - 2} ${rig.hips[0].y + 3} L${rig.waist.x + rig.hipHalf + 2} ${rig.hips[0].y + 3}`} stroke="#2f333b" strokeWidth={4} />
      </g>
    ),
  },
  {
    id: 'und-long-johns', name: 'Кальсоны длинные', category: 'underwear', fit: 'm', z: 10, bbox: [86, 250, 128, 340],
    render: (_g, rig) => (
      <g>
        {/* Тёплые кальсоны в облипку по ногам */}
        {trousers(rig, '#dcd3bf', { thighEase: 1, shinEase: -1, inTunic: true, crease: false })}
        <path d={`M${rig.waist.x - rig.waistHalf - 3} ${rig.waist.y + 2} L${rig.waist.x + rig.waistHalf + 3} ${rig.waist.y + 2} L${rig.waist.x + rig.waistHalf + 3} ${rig.waist.y + 12} L${rig.waist.x - rig.waistHalf - 3} ${rig.waist.y + 12} Z`} fill="#cfc6b0" {...outline} />
        {/* Вязаная резинка внизу */}
        {rig.legs.map((leg) => (
          <g key={leg.side}>
            {[0, 1, 2].map((i) => (
              <path key={i} d={`M${leg.ankle.x - 9} ${leg.ankle.y - 4 - i * 3} L${leg.ankle.x + 9} ${leg.ankle.y - 4 - i * 3}`} stroke="#c2b89e" strokeWidth={1} />
            ))}
          </g>
        ))}
        {/* Продольная вязка */}
        {rig.legs.map((leg) => (
          <path key={leg.side} d={`M${between(leg.hip, leg.knee, 0.4).x} ${between(leg.hip, leg.knee, 0.4).y} L${leg.knee.x} ${leg.knee.y} L${leg.ankle.x} ${leg.ankle.y - 6}`} stroke="rgba(150,140,115,0.35)" strokeWidth={0.6} fill="none" />
        ))}
      </g>
    ),
  },

  /* ===== ЧУЛКИ / КОЛГОТКИ (10 видов) ===== */
  { id: 'und-stock-nude', name: 'Чулки телесные', category: 'underwear', fit: 'f', z: 10, bbox: [70, 300, 160, 300], render: (_g, rig) => stockings(rig, { top: 0.45, tone: 'rgba(120,80,58,0.34)', seam: true }) },
  { id: 'und-stock-black', name: 'Чулки чёрные', category: 'underwear', fit: 'f', z: 10, bbox: [70, 300, 160, 300], render: (_g, rig) => stockings(rig, { top: 0.45, tone: 'rgba(30,20,24,0.5)', seam: true, band: 'rgba(15,10,14,0.75)' }) },
  { id: 'und-stock-fishnet', name: 'Чулки в сетку', category: 'underwear', fit: 'f', z: 10, bbox: [70, 300, 160, 300], render: (_g, rig) => stockings(rig, { top: 0.45, tone: 'rgba(40,26,26,0.32)', fishnet: true, seam: false, band: 'rgba(20,12,14,0.6)' }) },
  { id: 'und-stock-lace', name: 'Чулки с кружевом', category: 'underwear', fit: 'f', z: 10, bbox: [70, 300, 160, 300], render: (_g, rig) => stockings(rig, { top: 0.5, tone: 'rgba(240,235,238,0.5)', lace: true, seam: false, band: 'rgba(225,215,225,0.7)' }) },
  { id: 'und-stock-white', name: 'Чулки белые', category: 'underwear', fit: 'f', z: 10, bbox: [70, 300, 160, 300], render: (_g, rig) => stockings(rig, { top: 0.45, tone: 'rgba(238,232,234,0.55)', seam: true, band: 'rgba(250,246,248,0.8)' }) },
  { id: 'und-stock-red', name: 'Чулки красные', category: 'underwear', fit: 'f', z: 10, bbox: [70, 300, 160, 300], render: (_g, rig) => stockings(rig, { top: 0.45, tone: 'rgba(120,16,24,0.5)', seam: false, band: 'rgba(180,30,40,0.8)' }) },
  { id: 'und-stock-grey', name: 'Чулки серые', category: 'underwear', fit: 'f', z: 10, bbox: [70, 300, 160, 300], render: (_g, rig) => stockings(rig, { top: 0.45, tone: 'rgba(80,78,84,0.42)', seam: false, band: 'rgba(50,48,54,0.7)' }) },
  { id: 'und-holdups', name: 'Чулки на силиконе', category: 'underwear', fit: 'f', z: 10, bbox: [70, 300, 160, 300], render: (_g, rig) => stockings(rig, { top: 0.55, tone: 'rgba(28,18,20,0.45)', seam: false, band: 'rgba(200,170,170,0.4)' }) },
  {
    id: 'und-garter', name: 'Подвязки с чулками', category: 'underwear', fit: 'f', z: 10, bbox: [70, 240, 160, 360],
    render: (_g, rig) => (
      <g>
        {stockings(rig, { top: 0.42, tone: 'rgba(30,20,24,0.45)', seam: true, band: 'rgba(15,10,14,0.7)' })}
        {/* Пояс-подвязка на бёдрах */}
        <path d={`M${rig.waist.x - rig.hipHalf - 4} ${rig.hips[0].y - 18} L${rig.waist.x + rig.hipHalf + 4} ${rig.hips[0].y - 18} L${rig.waist.x + rig.hipHalf + 6} ${rig.hips[0].y - 8} L${rig.waist.x - rig.hipHalf - 6} ${rig.hips[0].y - 8} Z`} fill="#1a1418" {...outline} />
        {/* Ремешки подвязок к чулкам */}
        {rig.legs.map((leg) => (
          <g key={leg.side}>
            <path d={`M${leg.hip.x - leg.side * 6} ${rig.hips[0].y - 8} L${between(leg.hip, leg.knee, 0.42).x + leg.side * 3} ${between(leg.hip, leg.knee, 0.42).y}`} stroke="#1a1418" strokeWidth={2.4} fill="none" />
            <rect x={between(leg.hip, leg.knee, 0.42).x + leg.side * 3 - 3} y={between(leg.hip, leg.knee, 0.42).y - 3} width={6} height={5} rx={1} fill="#c9a24b" stroke="rgba(0,0,0,0.4)" strokeWidth={0.5} />
          </g>
        ))}
      </g>
    ),
  },
  { id: 'und-knee', name: 'Гольфы', category: 'underwear', fit: 'f', z: 10, bbox: [80, 380, 140, 200], render: (_g, rig) => stockings(rig, { length: 'knee', top: 0.6, tone: 'rgba(238,232,234,0.6)', seam: false, band: 'rgba(180,170,175,0.55)' }) },

  /* ═══════════ ПЛАТЬЯ (категория dress, цельнокроеные) ═══════════ */

  /* Цельный традиционный немецкий дирндль: лиф со шнуровкой, белая блуза, фартук с бантом */
  {
    id: 'dress-dirndl', name: 'Дирндль (цельный)', category: 'dress', fit: 'f', z: 35, bbox: [78, 120, 145, 340],
    render: (_g, rig) => civilianDress(rig, {
      bodice: '#5a2730', skirt: '#4a2a28', sleeves: '#fbf6ec', sleeveWidth: 24, shortSleeve: 0.42,
      hem: 452, flare: 62, neckline: 'square', neckDrop: 138,
      trim: '#c9a24b', buttons: '#e8dcc0', buttonCount: 0, sash: '#8b2635',
      apron: '#efe6d6', apronTrim: '#b53a48', apronBow: '#b53a48',
      pleats: true,
      bodiceDetail: (
        <g>
          {dirndlBlouse(rig, 137, 0.62)}
          {[150, 158, 166, 174, 182].map((y) => (
            <g key={y} stroke="#e8dcc0" strokeWidth={0.8}>
              <circle cx={rig.chest.x - 7} cy={y} r={1} fill="#e8dcc0" stroke="none" />
              <path d={`M${rig.chest.x - 7} ${y} Q${rig.chest.x} ${y + 4} ${rig.chest.x + 7} ${y}`} fill="none" />
              <circle cx={rig.chest.x + 7} cy={y} r={1} fill="#e8dcc0" stroke="none" />
            </g>
          ))}
        </g>
      ),
    }),
  },

  /* Австрийский ландхаус-дирндль: зелёный лиф, клетчатый фартук */
  {
    id: 'dress-landhaus', name: 'Ландхаус (Австрия)', category: 'dress', fit: 'f', z: 35, bbox: [78, 120, 145, 340],
    render: (_g, rig) => civilianDress(rig, {
      bodice: '#2f5d3a', skirt: '#374a30', sleeves: '#f4efe2', sleeveWidth: 25, shortSleeve: 0.44,
      hem: 446, flare: 58, neckline: 'sweetheart', neckDrop: 140,
      trim: '#d8c39a', sash: '#6b8f4e',
      apron: '#e6dcc4', apronTrim: '#7a5236', apronBow: '#7a5236',
      pleats: true,
      bodiceDetail: dirndlBlouse(rig, 139, 0.5),
      skirtPattern: (
        <g opacity={0.5}>
          {[-40, -20, 0, 20, 40].map((x) => (
            <path key={x} d={`M${rig.waist.x + x} ${rig.waist.y + 12} L${rig.crotch.x + x * 1.4} 446`} stroke="rgba(90,60,40,0.25)" strokeWidth={3} />
          ))}
        </g>
      ),
    }),
  },

  /* Немецкое трахтен-платье: бордовое с белой блузой и вышивкой */
  {
    id: 'dress-trachten', name: 'Трахтен (Германия)', category: 'dress', fit: 'f', z: 35, bbox: [78, 120, 145, 340],
    render: (_g, rig) => civilianDress(rig, {
      bodice: '#6d2230', skirt: '#57242b', sleeves: '#f7f1e5', sleeveWidth: 24, shortSleeve: 0.4,
      hem: 442, flare: 56, neckline: 'square', neckDrop: 138,
      trim: '#d9b878', sash: '#3f5d3a',
      apron: '#eee2cc', apronTrim: '#3f5d3a', apronBow: '#3f5d3a',
      pleats: true,
      bodiceDetail: (
        <g>
          {dirndlBlouse(rig, 137, 0.62)}
          <g stroke="#d9b878" strokeWidth={0.9} fill="none" opacity={0.8}>
            <path d={`M${rig.chest.x - 13} 176 q4 -6 8 0 q4 -6 8 0 q4 -6 8 0`} />
            <path d={`M${rig.chest.x - 12} 184 l4 -5 4 5 4 -5 4 5 4 -5`} />
          </g>
        </g>
      ),
    }),
  },

  /* Платье для чая 1930-х: клёш со скошенным подолом и рукавами-крыльями */
  {
    id: 'dress-tea30', name: 'Платье к чаю, 1930-е', category: 'dress', fit: 'f', z: 35, bbox: [72, 120, 156, 340],
    render: (_g, rig) => civilianDress(rig, {
      bodice: '#7a93a6', skirt: '#829bad', sleeveWidth: 30, shortSleeve: 0.3,
      hem: 466, flare: 72, neckline: 'round', neckDrop: 134,
      belt: '#3f5566', trim: '#e6dcc4', hemRuffle: '#8ea4b2', pleats: true,
      skirtPattern: (
        <g>
          {[-50, -25, 0, 25, 50].map((x, i) => (
            <path key={i} d={`M${rig.waist.x + x * 0.5} ${rig.waist.y + 11} Q${rig.crotch.x + x} ${(rig.waist.y + 466) / 2} ${rig.crotch.x + x * 1.25} 460`} stroke="rgba(255,255,255,0.18)" strokeWidth={1} fill="none" />
          ))}
        </g>
      ),
    }),
  },

  /* Платье косого кроя (bias-cut) 1930-х: облегающее, струящееся, атлас */
  {
    id: 'dress-bias30', name: 'Косой крой, 1930-е', category: 'dress', fit: 'f', z: 35, bbox: [82, 122, 136, 360],
    render: (_g, rig) => civilianDress(rig, {
      bodice: '#2c3a55', skirt: '#31405d', sleeveWidth: 16, shortSleeve: 0.34,
      hem: 486, flare: 30, pencil: true, neckline: 'sweetheart', neckDrop: 140,
      trim: '#c9a24b', belt: '#c9a24b',
      skirtPattern: (
        <g opacity={0.4} fill="none" stroke="#cdd8e6" strokeWidth={0.8}>
          {[-20, -10, 0, 10, 20].map((x, i) => (
            <path key={i} d={`M${rig.waist.x + x * 0.6} ${rig.waist.y + 11} Q${rig.crotch.x + x} 360 ${rig.crotch.x + x * 0.7} 482`} />
          ))}
        </g>
      ),
    }),
  },

  /* Платье с рубашечным лифом 1940-х: воротничок, рукава, пуговицы, скромный клёш */
  {
    id: 'dress-shirtwaist40', name: 'Платье-рубашка, 1940-е', category: 'dress', fit: 'f', z: 35, bbox: [76, 118, 148, 340],
    render: (_g, rig) => civilianDress(rig, {
      bodice: '#7a4a52', skirt: '#7a4a52', sleeves: '#7a4a52', sleeveWidth: 22, shortSleeve: 0.42,
      hem: 452, flare: 54, neckline: 'peterpan', neckDrop: 126,
      collarColor: '#f4efe4', buttons: '#f0e6d2', buttonCount: 6,
      belt: '#5c353c', trim: '#f0e6d2', pleats: true,
    }),
  },

  /* Платье fit-and-flare 1940-х: подчёркнутая талия, широкий подол */
  {
    id: 'dress-fitflare40', name: 'Фигурное с клёшем, 1940-е', category: 'dress', fit: 'f', z: 35, bbox: [72, 120, 156, 340],
    render: (_g, rig) => civilianDress(rig, {
      bodice: '#3a4d63', skirt: '#41566e', sleeveWidth: 26, shortSleeve: 0.36,
      hem: 462, flare: 74, neckline: 'round', neckDrop: 134,
      buttons: '#d8c39a', buttonCount: 3, belt: '#28344a',
      hemRuffle: '#4b6178', pleats: true,
    }),
  },

  /* Французское дневное платье: тёмно-синее в мелкий горох с белым воротничком */
  {
    id: 'dress-french-day', name: 'Французское дневное', category: 'dress', fit: 'f', z: 35, bbox: [76, 118, 148, 340],
    render: (_g, rig) => civilianDress(rig, {
      bodice: '#26324e', skirt: '#26324e', sleeveWidth: 22, shortSleeve: 0.4,
      hem: 448, flare: 60, neckline: 'peterpan', neckDrop: 126,
      collarColor: '#f6f1e6', belt: '#c8402f',
      pleats: true,
      skirtPattern: (
        <g fill="#f3ecd9" opacity={0.85}>
          {Array.from({ length: 126 }, (_, i) => {
            const col = i % 9;
            const row = Math.floor(i / 9);
            const x = rig.crotch.x - 56 + col * 14 + (row % 2) * 7;
            const y = rig.waist.y + 20 + row * 24;
            return y < 444 ? <circle key={i} cx={x} cy={y} r={1.4} /> : null;
          })}
        </g>
      ),
      bodiceDetail: (
        <g fill="#f3ecd9" opacity={0.85}>
          {Array.from({ length: 12 }, (_, i) => {
            const col = i % 4;
            const row = Math.floor(i / 4);
            return <circle key={i} cx={rig.chest.x - 18 + col * 12 + (row % 2) * 6} cy={156 + row * 14} r={1.4} />;
          })}
        </g>
      ),
    }),
  },

  /* Маленькое чёрное платье: французское вечернее, без рукавов */
  {
    id: 'dress-lbd', name: 'Маленькое чёрное (Франция)', category: 'dress', fit: 'f', z: 35, bbox: [86, 120, 128, 350],
    render: (_g, rig) => civilianDress(rig, {
      bodice: '#15141a', skirt: '#15141a', sleeveless: true,
      hem: 456, flare: 44, neckline: 'sweetheart', neckDrop: 142,
      trim: '#d8c39a', belt: '#c9a24b', pleats: true,
      skirtPattern: (
        <g stroke="rgba(216,195,154,0.25)" strokeWidth={0.7} fill="none">
          {[-30, -15, 0, 15, 30].map((x, i) => (
            <path key={i} d={`M${rig.waist.x + x * 0.6} ${rig.waist.y + 11} Q${rig.crotch.x + x} 360 ${rig.crotch.x + x * 1.1} 450`} />
          ))}
        </g>
      ),
    }),
  },

  /* Финское национальное платье: полосатая юбка, цветной лиф, белая блуза */
  {
    id: 'dress-finnish', name: 'Финское народное', category: 'dress', fit: 'f', z: 35, bbox: [76, 118, 148, 350],
    render: (_g, rig) => civilianDress(rig, {
      bodice: '#c0443a', skirt: '#2d3f5e', sleeves: '#f6f1e6', sleeveWidth: 25, shortSleeve: 0.42,
      hem: 458, flare: 64, neckline: 'square', neckDrop: 138,
      collarColor: '#f6f1e6', trim: '#f0e6d2', sash: '#e6d3a2',
      pleats: true,
      skirtPattern: (
        <g opacity={0.9}>
          {[150, 200, 250, 300, 350, 400].map((y, i) => (
            <path key={i} d={`M${rig.crotch.x - 58 + i * 0.5} ${y} Q${rig.crotch.x} ${y + 3} ${rig.crotch.x + 58 - i * 0.5} ${y}`} stroke={i % 2 ? '#c0443a' : '#f0e6d2'} strokeWidth={5} fill="none" />
          ))}
        </g>
      ),
      bodiceDetail: (
        <g>
          {dirndlBlouse(rig, 137, 0.62)}
          <rect x={rig.chest.x - 3} y={146} width={6} height={70} fill="#f0e6d2" />
          <circle cx={rig.chest.x} cy={160} r={1.6} fill="#2d3f5e" />
          <circle cx={rig.chest.x} cy={178} r={1.6} fill="#2d3f5e" />
          <circle cx={rig.chest.x} cy={196} r={1.6} fill="#2d3f5e" />
        </g>
      ),
    }),
  },

  /* Японское платье в духе вафуку/кимоно: прямой силуэт, широкие рукава, пояс оби */
  {
    id: 'dress-wafuku', name: 'Вафуку (Япония)', category: 'dress', fit: 'f', z: 35, bbox: [66, 120, 168, 380],
    render: (_g, rig) => (
      <g>
        {/* Длинные широкие рукава кимоно (без торчащих окатов) */}
        {sleeves(rig, '#8a2b35', 30, { capPad: 0 })}
        {/* Прямой корпус кимоно: закрытая горловина, плечи закрыты тканью */}
        <path d={torsoPath(rig, {
          hem: 480, hemHalf: rig.hipHalf + 14,
          shoulderEase: 14, chestEase: 1.18, waistEase: 1.16, hipEase: 1.14,
          neckDrop: 130,
        })} fill="#9a323d" {...outline} />
        {/* Белый внутренний воротник (нагадзюбан) */}
        {neckBand(rig, '#f4efe6', { height: 121, drop: 150 })}
        {/* Диагональный запах */}
        <path d={`M${rig.chest.x - rig.chestHalf * 0.4} 130 L${rig.chest.x + 6} ${rig.waist.y + 8} L${rig.chest.x + 2} ${rig.waist.y + 16} L${rig.chest.x - rig.chestHalf * 0.5} 138 Z`} fill="#812730" {...outline} />
        {/* Пояс оби */}
        <rect x={rig.waist.x - rig.waistHalf - 12} y={rig.waist.y + 2} width={(rig.waistHalf + 12) * 2} height={20} rx={2} fill="#d9b15f" {...outline} />
        <rect x={rig.waist.x - rig.waistHalf - 12} y={rig.waist.y + 2} width={(rig.waistHalf + 12) * 2} height={5} fill="#b8903f" />
        {/* Узел оби сзади-спереди */}
        <rect x={rig.chest.x + 6} y={rig.waist.y - 4} width={13} height={30} rx={2} fill="#c9a14f" {...outline} />
        {/* Прямой подол с лёгким разрезом */}
        <path d={`M${rig.crotch.x - 6} 470 L${rig.crotch.x - 6} 486 M${rig.crotch.x + 6} 470 L${rig.crotch.x + 6} 486`} stroke="rgba(0,0,0,0.2)" strokeWidth={1} />
      </g>
    ),
  },

  /* Итальянское летнее платье на бретелях в оборках */
  {
    id: 'dress-italian-sun', name: 'Итальянское летнее', category: 'dress', fit: 'f', z: 35, bbox: [84, 122, 132, 350],
    render: (_g, rig) => civilianDress(rig, {
      bodice: '#d98a52', skirt: '#e0935c', sleeveless: true,
      hem: 450, flare: 56, neckline: 'sweetheart', neckDrop: 142,
      sash: '#f0e0c8', hemRuffle: '#e9a26d',
      pleats: true,
      bodiceDetail: (
        <g stroke="#f0e0c8" strokeWidth={2.4} fill="none" strokeLinecap="round">
          <path d={`M${rig.chest.x - rig.chestHalf * 0.42} ${146} Q${rig.shoulders[0].x + 6} ${rig.shoulders[0].y - 2} ${rig.shoulders[0].x + 13} ${rig.shoulders[0].y + 6}`} />
          <path d={`M${rig.chest.x + rig.chestHalf * 0.42} ${146} Q${rig.shoulders[1].x - 6} ${rig.shoulders[1].y - 2} ${rig.shoulders[1].x - 13} ${rig.shoulders[1].y + 6}`} />
        </g>
      ),
      skirtPattern: (
        <g fill="none" stroke="rgba(255,245,230,0.4)" strokeWidth={3} strokeLinecap="round">
          {[300, 340, 380, 420].map((y) => (
            <path key={y} d={`M${rig.crotch.x - 46} ${y} Q${rig.crotch.x} ${y + 4} ${rig.crotch.x + 46} ${y}`} />
          ))}
        </g>
      ),
    }),
  },

  /* Итальянское приталенное платье с V-вырезом и длинными рукавами */
  {
    id: 'dress-italian-tailored', name: 'Итальянское приталенное', category: 'dress', fit: 'f', z: 35, bbox: [76, 120, 148, 340],
    render: (_g, rig) => civilianDress(rig, {
      bodice: '#51604b', skirt: '#51604b', sleeves: '#51604b', sleeveWidth: 20, longSleeve: true,
      hem: 444, flare: 46, neckline: 'v', neckDrop: 146,
      buttons: '#e6dcc0', buttonCount: 4, belt: '#3d4838', trim: '#cfc3a5',
      pleats: true,
    }),
  },

  /* ═══════════ ПЛАТЬЯ: авторская коллекция ═══════════ */
  {
    id: 'dress-berlin-day', name: 'Дневное, Берлин (30-е)', category: 'dress', fit: 'f', z: 35, bbox: [72, 118, 156, 360],
    render: (_g, rig) => (
      <g>
        {neckBand(rig, '#33394d', { height: 117, drop: 130, trim: '#e8e2d2' })}
        {sleeves(rig, '#33394d', 20, { short: 0.5 })}
        <path d={torsoPath(rig, { hem: 450, hemHalf: 58, chestEase: 1.06, waistEase: 1.08, hipEase: 1.05, neckDrop: 130 })} fill="#33394d" {...outline} />
        {[-2, -1, 0, 1, 2].map((i) => (
          <path key={i} d={`M${rig.waist.x + i * 11} ${rig.waist.y + 12} L${rig.crotch.x + i * 20} 446`} stroke="rgba(0,0,0,0.22)" strokeWidth={1} fill="none" />
        ))}
        {/* белый отложной воротничок */}
        <path d={`M${150 - rig.neckHalf - 4} 124 L${rig.chest.x} ${rig.chest.y - 4} L${150 + rig.neckHalf + 4} 124 L${150 + rig.neckHalf + 8} 132 L${rig.chest.x} ${rig.chest.y + 4} L${150 - rig.neckHalf - 8} 132 Z`} fill="#efe9d8" {...outline} />
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={rig.chest.x} cy={rig.chest.y + 22 + i * 20} r={1.9} fill="#e8e2d2" stroke="rgba(0,0,0,0.3)" strokeWidth={0.4} />
        ))}
        <rect x={rig.waist.x - rig.waistHalf - 5} y={rig.waist.y} width={(rig.waistHalf + 5) * 2} height={9} fill="#23262e" {...outline} />
        <rect x={rig.waist.x - 4} y={rig.waist.y + 1} width={8} height={7} rx={1} fill="none" stroke="#c9a24b" strokeWidth={1.2} />
      </g>
    ),
  },
  {
    id: 'dress-loden', name: 'Лоден, Австрия', category: 'dress', fit: 'f', z: 35, bbox: [72, 112, 156, 365],
    render: (_g, rig) => (
      <g>
        {sleeves(rig, '#5c6650', 21, { cuff: true, cuffColor: '#4a523e', capPad: 1 })}
        <path d={torsoPath(rig, { hem: 446, hemHalf: 52, chestEase: 1.07, waistEase: 1.1, hipEase: 1.05, neckDrop: 130 })} fill="#5c6650" {...outline} />
        {standCollar(rig, '#4a523e', '#8a7a4a')}
        {/* роговые пуговицы */}
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <circle cx={rig.chest.x} cy={148 + i * 24} r={2.6} fill="#3a2c1c" stroke="#1e140c" strokeWidth={0.5} />
            <circle cx={rig.chest.x - 0.8} cy={148 + i * 24 - 0.8} r={0.8} fill="#8a7358" opacity={0.8} />
          </g>
        ))}
        {/* нагрудные клапаны */}
        {[-1, 1].map((s) => (
          <g key={s}>
            <rect x={rig.chest.x + s * 17 - 8} y={rig.chest.y + 18} width={16} height={6} rx={1} fill="#4a523e" stroke="rgba(0,0,0,0.3)" strokeWidth={0.6} />
            <circle cx={rig.chest.x + s * 17} cy={rig.chest.y + 21} r={1.2} fill="#3a2c1c" />
          </g>
        ))}
        {[-2, -1, 0, 1, 2].map((i) => (
          <path key={i} d={`M${rig.waist.x + i * 10} ${rig.waist.y + 12} L${rig.crotch.x + i * 17} 442`} stroke="rgba(0,0,0,0.18)" strokeWidth={1} fill="none" />
        ))}
        <rect x={rig.waist.x - rig.waistHalf - 5} y={rig.waist.y} width={(rig.waistHalf + 5) * 2} height={9} fill="#4a523e" {...outline} />
      </g>
    ),
  },
  {
    id: 'dress-french-bias', name: 'Косой крой, Париж', category: 'dress', fit: 'f', z: 35, bbox: [70, 118, 160, 435],
    render: (_g, rig) => {
      const cx = rig.chest.x;
      const cy = rig.chest.y;
      const ch = rig.chestHalf;
      const dressPath = torsoPath(rig, { hem: 530, hemHalf: 62, chestEase: 1.04, waistEase: 1.06, hipEase: 1.09, neckDrop: cy + 6, bare: true, bareHalf: ch * 0.7 });
      return (
        <g>
          {/* бретели поверх плеч */}
          <path d={`M${150 - rig.neckHalf - 11} 138 L${cx - ch * 0.55} ${cy - 4} M${150 + rig.neckHalf + 11} 138 L${cx + ch * 0.55} ${cy - 4}`} stroke="#b89a78" strokeWidth={2.4} fill="none" strokeLinecap="round" />
          <path d={dressPath} fill="#d8c096" {...outline} />
          {/* драпированный вырез «качели» */}
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M${cx - ch * 0.62} ${cy - 2 + i * 5} Q${cx} ${cy + 12 + i * 5} ${cx + ch * 0.62} ${cy - 2 + i * 5}`} fill="none" stroke="#a8845c" strokeWidth={1.1} opacity={0.75} />
          ))}
          {/* косые складки шёлка — обрезаны по контуру платья */}
          <Clipped d={dressPath}>
            {[-2, -1, 0, 1, 2].map((i) => (
              <path key={i} d={`M${cx + i * 12 - 14} ${cy + 40} Q${rig.waist.x + i * 14} ${(cy + 530) / 2} ${rig.crotch.x + i * 22 + 8} 526`} stroke="rgba(120,90,50,0.25)" strokeWidth={1.2} fill="none" />
            ))}
            <path d={`M${cx - ch * 0.5} ${cy + 30} Q${cx - 10} ${330} ${rig.crotch.x - 26} 516`} stroke="rgba(255,246,230,0.5)" strokeWidth={4} fill="none" strokeLinecap="round" />
          </Clipped>
          <path d={`M${rig.crotch.x - 58} 524 Q${rig.crotch.x} 530 ${rig.crotch.x + 58} 524`} stroke="#a8845c" strokeWidth={1.4} fill="none" opacity={0.7} />
        </g>
      );
    },
  },
  {
    id: 'dress-french-floral', name: 'Цветочное, Прованс', category: 'dress', fit: 'f', z: 35, bbox: [72, 118, 156, 365],
    render: (_g, rig) => {
      const dressPath = torsoPath(rig, { hem: 448, hemHalf: 64, chestEase: 1.06, waistEase: 1.07, hipEase: 1.05, neckDrop: 131 });
      return (
      <g>
        {neckBand(rig, '#efe6d4', { height: 118, drop: 130 })}
        {sleeves(rig, '#efe6d4', 20, { short: 0.32, capPad: 1 })}
        {rig.shoulders.map((s, i) => (
          <circle key={i} cx={s.x + (i ? 4 : -4)} cy={s.y + 12} r={11} fill="#efe6d4" {...outline} />
        ))}
        <path d={dressPath} fill="#efe6d4" {...outline} />
        {/* мелкий цветочный узор — обрезан по контуру платья */}
        <Clipped d={dressPath}>
        {Array.from({ length: 30 }).map((_, i) => {
          const row = Math.floor(i / 5);
          const col = i % 5;
          const x = rig.chest.x - 44 + col * 22 + (row % 2) * 11;
          const y = 160 + row * 46;
          const half = y < rig.waist.y ? rig.chestHalf + 4 : 62;
          if (Math.abs(x - rig.chest.x) > half) return null;
          return (
            <g key={i}>
              {[0, 72, 144, 216, 288].map((a) => (
                <circle key={a} cx={x + Math.cos((a * Math.PI) / 180) * 2.1} cy={y + Math.sin((a * Math.PI) / 180) * 2.1} r={1.5} fill={i % 3 === 0 ? '#b45a6e' : '#c98a8a'} opacity={0.9} />
              ))}
              <circle cx={x} cy={y} r={1.1} fill="#8a6a25" />
              <ellipse cx={x + 5} cy={y + 4} rx={2.4} ry={1.2} fill="#5a7a4a" opacity={0.8} transform={`rotate(30 ${x + 5} ${y + 4})`} />
            </g>
          );
        })}
        </Clipped>
        {/* квадратный вырез с белой окантовкой */}
        <path d={`M${150 - rig.chestHalf * 0.55} 132 L${150 - rig.chestHalf * 0.55} ${rig.chest.y - 2} L${150 + rig.chestHalf * 0.55} ${rig.chest.y - 2} L${150 + rig.chestHalf * 0.55} 132`} fill="none" stroke="#fffdf4" strokeWidth={2.6} />
        {/* пояс-кушак с бантом */}
        <rect x={rig.waist.x - rig.waistHalf - 6} y={rig.waist.y - 1} width={(rig.waistHalf + 6) * 2} height={10} fill="#b45a6e" {...outline} />
        <path d={`M${rig.waist.x - 24} ${rig.waist.y + 4} L${rig.waist.x - 38} ${rig.waist.y - 4} L${rig.waist.x - 36} ${rig.waist.y + 12} Z M${rig.waist.x - 24} ${rig.waist.y + 4} L${rig.waist.x - 12} ${rig.waist.y - 5} L${rig.waist.x - 12} ${rig.waist.y + 12} Z`} fill="#b45a6e" {...outline} />
        <circle cx={rig.waist.x - 24} cy={rig.waist.y + 4} r={2.6} fill="#8a3a4e" />
      </g>
      );
    },
  },
  {
    id: 'dress-finnish-folk', name: 'Народное, Финляндия', category: 'dress', fit: 'f', z: 35, bbox: [72, 118, 156, 360],
    render: (_g, rig) => {
      const cx = rig.chest.x;
      const cy = rig.chest.y;
      const wy = rig.waist.y;
      const ch = rig.chestHalf;
      const wh = rig.waistHalf;
      return (
        <g>
          {neckBand(rig, '#f6f2e8', { height: 118, drop: 130 })}
          <path d={torsoPath(rig, { hem: wy + 8, hemHalf: wh + 7, chestEase: 1.06, waistEase: 1.08, neckDrop: 131 })} fill="#f6f2e8" {...outline} />
          {sleeves(rig, '#f6f2e8', 20, { short: 0.42, capPad: 1 })}
          {/* синий жилет с вышивкой — с плечами, чтобы не «висел» */}
          <path d={torsoPath(rig, { hem: wy + 12, hemHalf: wh + 5, chestEase: 1.03, waistEase: 1.05, neckDrop: cy + 4, bare: true, bareHalf: ch * 0.58, coverShoulders: true })} fill="#2e4a6b" {...outline} />
          {[-1, 1].map((s) => (
            <g key={s}>
              <path d={`M${cx + s * ch * 0.5} ${cy - 2} L${cx + s * 12} ${wy - 8}`} stroke="#c93a3a" strokeWidth={1.6} fill="none" />
              {[0, 1, 2, 3].map((i) => (
                <path key={i} d={`M${cx + s * (ch * 0.5 - 3)} ${cy + 8 + i * 12} l3 3 m0 -3 l-3 3`} stroke="#f2efe6" strokeWidth={0.9} />
              ))}
            </g>
          ))}
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={cx} cy={cy + 14 + i * 16} r={1.8} fill="#c9a24b" stroke="rgba(0,0,0,0.35)" strokeWidth={0.4} />
          ))}
          {/* тёмно-красная юбка */}
          <path d={skirtPath(rig, { hem: 450, flare: 66 })} fill="#7a2a2a" {...outline} />
          {[-2, -1, 0, 1, 2].map((i) => (
            <path key={i} d={`M${rig.waist.x + i * 11} ${wy + 12} L${rig.crotch.x + i * 21} 446`} stroke="rgba(0,0,0,0.2)" strokeWidth={1} fill="none" />
          ))}
          {/* тканый пояс */}
          <rect x={rig.waist.x - wh - 5} y={wy} width={(wh + 5) * 2} height={4} fill="#c93a3a" />
          <rect x={rig.waist.x - wh - 5} y={wy + 4} width={(wh + 5) * 2} height={2.4} fill="#2e4a6b" />
          <rect x={rig.waist.x - wh - 5} y={wy + 6.4} width={(wh + 5) * 2} height={2} fill="#f2efe6" />
        </g>
      );
    },
  },
  {
    id: 'dress-kimono', name: 'Кимоно, Япония', category: 'dress', fit: 'f', z: 35, bbox: [62, 116, 176, 410],
    render: (_g, rig) => {
      const sl = rig.shoulders[0];
      const sr = rig.shoulders[1];
      const flowers: [number, number, number][] = [
        [-0.55, 0.3, 1], [0.5, 0.42, 0.85], [-0.3, 0.62, 1.1], [0.62, 0.7, 0.9], [-0.6, 0.85, 0.8], [0.15, 0.9, 1],
      ];
      return (
        <g>
          <path d={torsoPath(rig, { hem: 500, hemHalf: 56, chestEase: 1.08, waistEase: 1.12, hipEase: 1.06, neckDrop: 130 })} fill="#8b2f2f" {...outline} />
          {/* широкие рукава-тамото */}
          {[-1, 1].map((s) => {
            const sh = s < 0 ? sl : sr;
            return (
              <g key={s}>
                <path d={`M${sh.x + s * 2} ${sh.y - 2} L${sh.x + s * 27} ${sh.y + 8} L${sh.x + s * 24} ${rig.waist.y - 28} L${sh.x - s * 8} ${rig.waist.y - 44} Z`} fill="#8b2f2f" {...outline} />
                <path d={`M${sh.x + s * 26} ${sh.y + 10} L${sh.x + s * 23} ${rig.waist.y - 30}`} stroke="#f2e8d8" strokeWidth={1.6} opacity={0.85} />
              </g>
            );
          })}
          {/* белый воротник нагадзюбан и красный запах */}
          <path d={`M${150 - rig.neckHalf - 2} 126 L150 ${rig.chest.y + 26} L${150 + rig.neckHalf + 2} 126`} fill="none" stroke="#f2e8d8" strokeWidth={5} strokeLinejoin="round" />
          <path d={`M${150 - rig.neckHalf - 6} 126 L150 ${rig.chest.y + 34} L${150 + rig.neckHalf + 6} 126`} fill="none" stroke="#5c1c1c" strokeWidth={1.4} />
          <path d={`M150 ${rig.chest.y + 26} L${150 + 6} ${rig.waist.y - 30}`} stroke="#5c1c1c" strokeWidth={1.6} fill="none" />
          {/* сакура */}
          {flowers.map(([fx, fy, fs], i) => {
            const x = rig.chest.x + fx * 44;
            const y = 210 + fy * 260;
            return (
              <g key={i}>
                {[0, 72, 144, 216, 288].map((a) => (
                  <circle key={a} cx={x + Math.cos((a * Math.PI) / 180) * 3 * fs} cy={y + Math.sin((a * Math.PI) / 180) * 3 * fs} r={2.2 * fs} fill="#f2d8dc" opacity={0.92} />
                ))}
                <circle cx={x} cy={y} r={1.2 * fs} fill="#c9a24b" />
              </g>
            );
          })}
          {/* широкий пояс оби */}
          <rect x={rig.waist.x - rig.waistHalf - 8} y={rig.waist.y - 12} width={(rig.waistHalf + 8) * 2} height={28} fill="#b98a3a" {...outline} />
          <path d={`M${rig.waist.x - rig.waistHalf - 8} ${rig.waist.y - 4} L${rig.waist.x + rig.waistHalf + 8} ${rig.waist.y - 4} M${rig.waist.x - rig.waistHalf - 8} ${rig.waist.y + 8} L${rig.waist.x + rig.waistHalf + 8} ${rig.waist.y + 8}`} stroke="#7a5a1e" strokeWidth={1.2} />
          <rect x={rig.waist.x - 11} y={rig.waist.y - 9} width={22} height={22} rx={2} fill="#8a6428" stroke="#5c4218" strokeWidth={1} />
          {/* фамильные гербы */}
          {[-1, 1].map((s) => (
            <circle key={s} cx={rig.chest.x + s * 15} cy={rig.chest.y - 12} r={3.4} fill="none" stroke="#f2e8d8" strokeWidth={1.3} opacity={0.9} />
          ))}
        </g>
      );
    },
  },
  {
    id: 'dress-moga', name: 'Модан гару, Токио', category: 'dress', fit: 'f', z: 35, bbox: [74, 122, 152, 312],
    render: (_g, rig) => {
      const cx = rig.chest.x;
      const cy = rig.chest.y;
      const ch = rig.chestHalf;
      const hemY = 408;
      const scallops = Array.from({ length: 9 }).map((_, i) => {
        const x0 = rig.crotch.x - 54 + i * 13.5;
        return `M${x0} ${hemY} Q${x0 + 6.75} ${hemY + 7} ${x0 + 13.5} ${hemY}`;
      }).join(' ');
      return (
        <g>
          <path d={`M${150 - rig.neckHalf - 11} 138 L${cx - ch * 0.5} ${cy - 6} M${150 + rig.neckHalf + 11} 138 L${cx + ch * 0.5} ${cy - 6}`} stroke="#c9a24b" strokeWidth={2.2} fill="none" strokeLinecap="round" />
          <path d={torsoPath(rig, { hem: hemY, hemHalf: 56, chestEase: 1.04, waistEase: 1.02, hipEase: 1.0, neckDrop: cy + 2, bare: true, bareHalf: ch * 0.6 })} fill="#232228" {...outline} />
          {/* золотые шевроны ар-деко */}
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M${cx - 26} ${cy + 16 + i * 12} L${cx} ${cy + 26 + i * 12} L${cx + 26} ${cy + 16 + i * 12}`} fill="none" stroke="#c9a24b" strokeWidth={1.4} opacity={0.85} />
          ))}
          {/* заниженная талия */}
          <rect x={rig.hips[0].x + 2} y={rig.hips[0].y - 26} width={(rig.hips[1].x - rig.hips[0].x) - 4} height={9} fill="#c9a24b" opacity={0.9} />
          {/* веер на подоле */}
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M${cx - 30 + i * 6} ${hemY - 44} Q${cx} ${hemY - 62 - i * 4} ${cx + 30 - i * 6} ${hemY - 44}`} fill="none" stroke="#c9a24b" strokeWidth={1.2} opacity={0.8} />
          ))}
          <path d={scallops} fill="none" stroke="#c9a24b" strokeWidth={1.6} />
        </g>
      );
    },
  },
  {
    id: 'dress-roma', name: 'Вечернее, Рим', category: 'dress', fit: 'f', z: 35, bbox: [70, 120, 160, 465],
    render: (_g, rig) => {
      const cx = rig.chest.x;
      const cy = rig.chest.y;
      const ch = rig.chestHalf;
      return (
        <g>
          <path d={`M${150 - rig.neckHalf - 11} 138 L${cx - ch * 0.5} ${cy - 10} M${150 + rig.neckHalf + 11} 138 L${cx + ch * 0.5} ${cy - 10}`} stroke="#c9a24b" strokeWidth={2.2} fill="none" strokeLinecap="round" />
          <path d={torsoPath(rig, { hem: 560, hemHalf: 62, chestEase: 1.02, waistEase: 1.04, hipEase: 1.03, neckDrop: cy + 2, bare: true, bareHalf: ch * 0.5 })} fill="#1f1c22" {...outline} />
          {/* V-вырез с золотой окантовкой */}
          <path d={`M${cx - ch * 0.5} ${cy - 10} L${cx} ${cy + 20} L${cx + ch * 0.5} ${cy - 10}`} fill="none" stroke="#c9a24b" strokeWidth={1.8} />
          <circle cx={cx} cy={cy + 20} r={3.4} fill="#c9a24b" stroke="#7a5a1e" strokeWidth={0.8} />
          <circle cx={cx} cy={cy + 20} r={1.3} fill="#8b2635" />
          {/* драпировка */}
          {[-2, -1, 0, 1, 2].map((i) => (
            <path key={i} d={`M${cx + i * 8 - 20} ${cy + 60} Q${rig.waist.x + i * 16} ${380} ${rig.crotch.x + i * 24} 552`} stroke="rgba(201,162,75,0.22)" strokeWidth={1.4} fill="none" />
          ))}
          <path d={`M${cx - ch * 0.4} ${cy + 44} Q${cx - 14} ${360} ${rig.crotch.x - 30} 548`} stroke="rgba(255,244,225,0.28)" strokeWidth={5} fill="none" strokeLinecap="round" />
          {/* золотой шнур на талии */}
          <path d={`M${rig.waist.x - rig.waistHalf - 4} ${rig.waist.y + 2} Q${rig.waist.x} ${rig.waist.y + 8} ${rig.waist.x + rig.waistHalf + 4} ${rig.waist.y + 2}`} fill="none" stroke="#c9a24b" strokeWidth={2.6} />
        </g>
      );
    },
  },
  {
    id: 'dress-capri', name: 'Летнее, Капри', category: 'dress', fit: 'f', z: 35, bbox: [72, 118, 156, 360],
    render: (_g, rig) => (
      <g>
        {neckBand(rig, '#f6f1e6', { height: 118, drop: 130, trim: '#b8452f' })}
        {sleeves(rig, '#f6f1e6', 20, { short: 0.3 })}
        {rig.shoulders.map((s, i) => (
          <g key={i}>
            <circle cx={s.x + (i ? 4 : -4)} cy={s.y + 12} r={11} fill="#f6f1e6" {...outline} />
            <path d={`M${s.x + (i ? 4 : -4) - 9} ${s.y + 19} Q${s.x + (i ? 4 : -4)} ${s.y + 24} ${s.x + (i ? 4 : -4) + 9} ${s.y + 19}`} fill="none" stroke="#b8452f" strokeWidth={1.6} />
          </g>
        ))}
        <path d={torsoPath(rig, { hem: 440, hemHalf: 66, chestEase: 1.05, waistEase: 1.07, hipEase: 1.05, neckDrop: 131 })} fill="#f6f1e6" {...outline} />
        {/* вышивка ришелье у горловины */}
        <path d={`M${150 - rig.chestHalf * 0.6} 134 Q150 146 ${150 + rig.chestHalf * 0.6} 134`} fill="none" stroke="#b8452f" strokeWidth={2} />
        {Array.from({ length: 9 }).map((_, i) => (
          <circle key={i} cx={150 - rig.chestHalf * 0.6 + 6 + i * ((rig.chestHalf * 1.2 - 12) / 8)} cy={139 + Math.sin((i / 8) * Math.PI) * 4} r={1.3} fill="#b8452f" />
        ))}
        {[-2, -1, 0, 1, 2].map((i) => (
          <path key={i} d={`M${rig.waist.x + i * 11} ${rig.waist.y + 14} L${rig.crotch.x + i * 22} 424`} stroke="rgba(184,69,47,0.18)" strokeWidth={1.2} fill="none" />
        ))}
        {/* кайма по подолу */}
        <path d={`M${rig.crotch.x - 62} 428 Q${rig.crotch.x} 436 ${rig.crotch.x + 62} 428`} fill="none" stroke="#b8452f" strokeWidth={3} />
        {Array.from({ length: 12 }).map((_, i) => (
          <circle key={i} cx={rig.crotch.x - 55 + i * 10} cy={432} r={1.2} fill="#b8452f" opacity={0.8} />
        ))}
        {/* кушак с бантом */}
        <rect x={rig.waist.x - rig.waistHalf - 6} y={rig.waist.y - 1} width={(rig.waistHalf + 6) * 2} height={11} fill="#b8452f" {...outline} />
        <path d={`M${rig.waist.x + 22} ${rig.waist.y + 4} L${rig.waist.x + 36} ${rig.waist.y - 5} L${rig.waist.x + 34} ${rig.waist.y + 12} Z M${rig.waist.x + 22} ${rig.waist.y + 4} L${rig.waist.x + 10} ${rig.waist.y - 5} L${rig.waist.x + 10} ${rig.waist.y + 12} Z`} fill="#b8452f" {...outline} />
      </g>
    ),
  },
  {
    id: 'dress-utility', name: 'Утилитарное, 40-е', category: 'dress', fit: 'f', z: 35, bbox: [72, 118, 156, 350],
    render: (_g, rig) => (
      <g>
        {neckBand(rig, '#5a6570', { height: 117, drop: 130 })}
        {sleeves(rig, '#5a6570', 20, { short: 0.5 })}
        <path d={torsoPath(rig, { hem: 430, hemHalf: 50, chestEase: 1.05, waistEase: 1.09, hipEase: 1.04, neckDrop: 130 })} fill="#5a6570" {...outline} />
        {/* рубашечный воротник и планка */}
        <path d={`M${150 - rig.neckHalf - 3} 124 L${rig.chest.x} ${rig.chest.y - 4} L${150 + rig.neckHalf + 3} 124 L${150 + rig.neckHalf + 6} 131 L${rig.chest.x} ${rig.chest.y + 3} L${150 - rig.neckHalf - 6} 131 Z`} fill="#4a545e" {...outline} />
        <path d={`M${rig.chest.x} ${rig.chest.y + 3} L${rig.waist.x} 426`} stroke="rgba(0,0,0,0.3)" strokeWidth={1.2} fill="none" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <circle key={i} cx={rig.chest.x + (rig.waist.x - rig.chest.x) * (i / 5)} cy={rig.chest.y + 18 + i * 38} r={2} fill="#d8d2c0" stroke="rgba(0,0,0,0.35)" strokeWidth={0.5} />
        ))}
        {/* накладные карманы */}
        {[-1, 1].map((s) => (
          <g key={s}>
            <rect x={rig.chest.x + s * 19 - 8} y={rig.chest.y + 16} width={16} height={18} rx={1} fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth={1.1} />
            <path d={`M${rig.chest.x + s * 19 - 8} ${rig.chest.y + 21} L${rig.chest.x + s * 19 + 8} ${rig.chest.y + 21}`} stroke="rgba(0,0,0,0.35)" strokeWidth={1} />
            <rect x={rig.waist.x + s * 24 - 9} y={rig.waist.y + 34} width={18} height={22} rx={1} fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth={1.1} />
            <path d={`M${rig.waist.x + s * 24 - 9} ${rig.waist.y + 40} L${rig.waist.x + s * 24 + 9} ${rig.waist.y + 40}`} stroke="rgba(0,0,0,0.3)" strokeWidth={1} />
          </g>
        ))}
        <rect x={rig.waist.x - rig.waistHalf - 5} y={rig.waist.y} width={(rig.waistHalf + 5) * 2} height={9} fill="#4a545e" {...outline} />
        <rect x={rig.waist.x - 4} y={rig.waist.y + 1} width={8} height={7} rx={1} fill="none" stroke="#b9b9b2" strokeWidth={1.2} />
      </g>
    ),
  },

  /* ===== ВЕРХ (женский) ===== */
  {
    id: 'top-bowblouse', name: 'Блуза с бантом', category: 'top', fit: 'f', z: 20, bbox: [76, 126, 148, 210],
    colorable: [...topTone('Цвет блузы'), accentTone('bow', 'Цвет банта')],
    render: (_g, rig, context) => {
      const c = fabricTone(context, 'top-bowblouse', 'body', '#f7f3ea');
      const bow = accentColor(context, 'top-bowblouse', 'bow', '#8b2635');
      return (
      <g>
        {neckBand(rig, c, { height: 114, drop: 128, trim: '#ded7c8' })}
        {sleeves(rig, c, 21)}
        {/* Блуза заправлена: подол на уровне талии, без петли через бёдра */}
        <path d={torsoPath(rig, { hem: rig.waist.y + 8, hemHalf: rig.waistHalf + 6, neckDrop: 126 })} fill={c} {...outline} />
        <path d={`M${150 - rig.neckHalf - 3} 122 L${rig.chest.x} ${rig.chest.y - 4} L${150 + rig.neckHalf + 3} 122 L${150 + rig.neckHalf + 6} 129 L${rig.chest.x} ${rig.chest.y + 6} L${150 - rig.neckHalf - 6} 129 Z`} fill="#fff" {...outline} />
        {[168, 186, 204].map((y) => (
          <circle key={y} cx={rig.chest.x} cy={y} r={2} fill="#cfc4ae" />
        ))}
        <path d={`M${rig.chest.x} ${rig.chest.y - 12} L${rig.chest.x - 16} ${rig.chest.y - 20} L${rig.chest.x - 14} ${rig.chest.y - 2} Z M${rig.chest.x} ${rig.chest.y - 12} L${rig.chest.x + 16} ${rig.chest.y - 20} L${rig.chest.x + 14} ${rig.chest.y - 2} Z`} fill={bow} />
        <circle cx={rig.chest.x} cy={rig.chest.y - 12} r={4} fill={darken(bow, 22)} />
        <path d={`M${rig.chest.x - 4} ${rig.chest.y - 10} L${rig.chest.x - 9} ${rig.chest.y + 18} M${rig.chest.x + 4} ${rig.chest.y - 10} L${rig.chest.x + 9} ${rig.chest.y + 18}`} stroke={bow} strokeWidth={3} strokeLinecap="round" />
      </g>
      );
    },
  },
  {
    id: 'top-tweed', name: 'Твидовый жакет', category: 'top', fit: 'f', z: 40, bbox: [76, 126, 148, 190],
    colorable: topTone('Цвет твида'),
    render: (_g, rig, context) => {
      const c = fabricTone(context, 'top-tweed', 'body', '#8a6f4e');
      const dark = darken(c, 20);
      return (
      <g>
        {neckBand(rig, darken(c, 14), { height: 115, drop: 126 })}
        {sleeves(rig, c, 23, { cuff: true, cuffColor: dark })}
        <path d={torsoPath(rig, { hem: rig.hips[0].y + 14, hemHalf: rig.hipHalf + 8, neckDrop: 128 })} fill={c} {...outline} />
        {Array.from({ length: 9 }).map((_, i) => (
          <path key={i} d={`M${rig.chest.x - rig.chestHalf - 4} ${150 + i * 17} L${rig.chest.x + rig.chestHalf + 4} ${150 + i * 17}`} stroke="rgba(0,0,0,0.12)" strokeWidth={1} />
        ))}
        <path d={`M${rig.chest.x} ${rig.chest.y - 2} L${150 - rig.neckHalf - 3} 122 L${rig.chest.x - rig.chestHalf * 0.8} ${rig.chest.y + 44} L${rig.chest.x} ${rig.chest.y + 62} Z`} fill={dark} {...outline} />
        <path d={`M${rig.chest.x} ${rig.chest.y - 2} L${150 + rig.neckHalf + 3} 122 L${rig.chest.x + rig.chestHalf * 0.8} ${rig.chest.y + 44} L${rig.chest.x} ${rig.chest.y + 62} Z`} fill={dark} {...outline} />
        <path d={`M${rig.waist.x} ${rig.chest.y + 62} L${rig.waist.x} ${rig.hips[0].y + 12}`} stroke="rgba(0,0,0,0.25)" strokeWidth={1} />
        <circle cx={rig.waist.x} cy={rig.waist.y + 14} r={3.2} fill={darken(c, 48)} />
        <path d={`M${rig.chest.x - rig.chestHalf * 0.6} ${rig.waist.y + 12} L${rig.chest.x - rig.chestHalf * 0.6 + 15} ${rig.waist.y + 12} L${rig.chest.x - rig.chestHalf * 0.6 + 15} ${rig.waist.y + 30} L${rig.chest.x - rig.chestHalf * 0.6} ${rig.waist.y + 30} Z M${rig.chest.x + rig.chestHalf * 0.6 - 15} ${rig.waist.y + 12} L${rig.chest.x + rig.chestHalf * 0.6} ${rig.waist.y + 12} L${rig.chest.x + rig.chestHalf * 0.6} ${rig.waist.y + 30} L${rig.chest.x + rig.chestHalf * 0.6 - 15} ${rig.waist.y + 30} Z`} fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth={1} />
      </g>
      );
    },
  },
  {
    id: 'top-sweater', name: 'Вязаный джемпер', category: 'top', fit: 'f', z: 20, bbox: [76, 126, 148, 130],
    colorable: topTone('Цвет пряжи'),
    render: (_g, rig, context) => {
      const c = fabricTone(context, 'top-sweater', 'body', '#7a2e3a');
      return (
      <g>
        {neckBand(rig, darken(c, 14), { height: 114, drop: 126, trim: darken(c, 14) })}
        {sleeves(rig, c, 22, { cuff: true, cuffColor: c })}
        {/* Джемпер до талии с резинкой: подол выше линии бёдер, без петли */}
        <path d={torsoPath(rig, { hem: rig.waist.y + 14, hemHalf: rig.waistHalf + 7, neckDrop: 126 })} fill={c} {...outline} />
        <path d={`M${150 - rig.neckHalf - 1} 121 Q150 131 ${150 + rig.neckHalf + 1} 121 Q150 126 ${150 - rig.neckHalf - 1} 121 Z`} fill={darken(c, 14)} />
        {/* Резинка по низу */}
        <path d={`M${rig.waist.x - rig.waistHalf - 7} ${rig.waist.y + 3} L${rig.waist.x + rig.waistHalf + 7} ${rig.waist.y + 3} L${rig.waist.x + rig.waistHalf + 7} ${rig.waist.y + 14} L${rig.waist.x - rig.waistHalf - 7} ${rig.waist.y + 14} Z`} fill={darken(c, 14)} />
        {Array.from({ length: 12 }).map((_, i) => (
          <path key={i} d={`M${rig.waist.x - rig.waistHalf - 4 + i * (((rig.waistHalf + 4) * 2) / 11)},${rig.waist.y + 4} L${rig.waist.x - rig.waistHalf - 4 + i * (((rig.waistHalf + 4) * 2) / 11)},${rig.waist.y + 13}`} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
        ))}
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M${rig.chest.x - rig.chestHalf} ${172 + i * 18} l6,-5 l6,5 l6,-5 l6,5 l6,-5 l6,5 l6,-5 l6,5 l6,-5 l6,5 l6,-5`} stroke="rgba(255,255,255,0.22)" strokeWidth={1.5} fill="none" />
        ))}
      </g>
      );
    },
  },
  {
    id: 'top-dirndl', name: 'Лиф дирндля', category: 'top', fit: 'f', z: 20, bbox: [86, 126, 128, 120],
    colorable: [tone('bodice', 'Цвет лифа'), tone('blouse', 'Цвет блузки')],
    render: (_g, rig, context) => {
      const cx = rig.chest.x;
      const cy = rig.chest.y; // 191
      const wy = rig.waist.y; // 255
      const ch = rig.chestHalf;
      const wh = rig.waistHalf;
      const sl = rig.shoulders[0];
      const sr = rig.shoulders[1];
      const blouse = fabricTone(context, 'top-dirndl', 'blouse', '#fbf8f1');
      const bodice = fabricTone(context, 'top-dirndl', 'bodice', '#2f5d3a');
      // Квадратный вырез: размеры от груди, не от шеи — риг плеч/шеи не ломает
      const blouseBottom = cy + 14;
      const sqHalf = Math.max(15, ch * 0.52);
      const sqTop = 132;
      const sqBot = cy + 2;
      // Белая блузка одним контуром: плечо → угол выреза → вниз по стенке → дно → вверх → угол → плечо.
      // Вырез встроен в контур, поэтому верхней грани (и «палки» у шеи) нет вообще.
      const blousePath = [
        `M${sl.x + 4} ${sl.y - 10}`,
        `L${cx - sqHalf} ${sqTop}`,
        `L${cx - sqHalf} ${sqBot}`,
        `L${cx + sqHalf} ${sqBot}`,
        `L${cx + sqHalf} ${sqTop}`,
        `L${sr.x - 4} ${sr.y - 10}`,
        `Q${sr.x + 12} ${sr.y - 2} ${cx + ch + 12} ${blouseBottom - 6}`,
        `L${cx + ch + 10} ${blouseBottom}`,
        `L${cx - ch - 10} ${blouseBottom}`,
        `L${cx - ch - 12} ${blouseBottom - 6}`,
        `Q${sl.x - 12} ${sl.y - 2} ${sl.x + 4} ${sl.y - 10}`,
        'Z',
      ].join(' ');
      // Кружево — только по трём сторонам выреза (без верхней грани)
      const necklineD = `M${cx - sqHalf} ${sqTop} L${cx - sqHalf} ${sqBot} L${cx + sqHalf} ${sqBot} L${cx + sqHalf} ${sqTop}`;
      // Зелёный лиф: внешние боковины + низ, центр груди открыт шире блузки
      const bHalf = sqHalf + 8;
      const bTop = sqTop - 4;
      const bBot = sqBot + 10;
      // Вырез встроен в единый контур. Верхней линии между его углами нет,
      // поэтому ни контур лифа, ни золотая тесьма не пересекают шею.
      const bodicePath = [
        `M${cx - ch - 8} ${bTop}`,
        `L${cx - bHalf} ${bTop}`,
        `L${cx - bHalf} ${bBot}`,
        `L${cx + bHalf} ${bBot}`,
        `L${cx + bHalf} ${bTop}`,
        `L${cx + ch + 8} ${bTop}`,
        `C${cx + ch + 10} ${bTop + 16} ${cx + wh + 8} ${wy - 14} ${cx + wh + 6} ${wy + 2}`,
        `L${cx - wh - 6} ${wy + 2}`,
        `C${cx - wh - 8} ${wy - 14} ${cx - ch - 10} ${bTop + 16} ${cx - ch - 8} ${bTop}`,
        'Z',
      ].join(' ');
      // Золотая тесьма только по бокам и низу квадратного выреза.
      const bodiceNeck = `M${cx - bHalf} ${bTop} L${cx - bHalf} ${bBot} L${cx + bHalf} ${bBot} L${cx + bHalf} ${bTop}`;
      // Центральная планка со шнуровкой (ниже декольте)
      const lacePath = `M${cx - 11} ${bBot + 4} L${cx + 11} ${bBot + 4} L${cx + 7} ${wy - 2} L${cx - 7} ${wy - 2} Z`;
      return (
        <g>
          {/* Крупные рукава-фонарики: объёмный шар + сборка + манжета */}
          {[sl, sr].map((s, k) => {
            const dir = k === 0 ? -1 : 1;
            const bx = s.x + dir * 6;
            const by = s.y + 10;
            return (
              <g key={k}>
                {/* Шар фонарика */}
                <ellipse cx={bx} cy={by} rx={26} ry={24} fill={blouse} {...outline} />
                {/* Нижняя сборка на манжете */}
                <path
                  d={`M${bx - dir * 20} ${by + 18} Q${bx} ${by + 30} ${bx + dir * 20} ${by + 16} L${bx + dir * 18} ${by + 26} Q${bx} ${by + 38} ${bx - dir * 18} ${by + 28} Z`}
                  fill={blouse}
                  {...outline}
                />
                {/* Складки объёма */}
                {[-0.55, -0.2, 0.2, 0.55].map((t) => (
                  <path
                    key={t}
                    d={`M${bx + t * 20} ${by - 20} Q${bx + t * 26} ${by} ${bx + t * 18} ${by + 20}`}
                    stroke="#e2dbc9"
                    strokeWidth={1.2}
                    fill="none"
                  />
                ))}
                {/* Фестоны по краю манжеты */}
                <path d={`M${bx - dir * 18} ${by + 28} q${dir * 6} 6 ${dir * 12} 0 q${dir * 6} 6 ${dir * 12} -2`} fill="none" stroke="#d9d0bc" strokeWidth={1.3} />
              </g>
            );
          })}
          {/* Белая блузка с квадратным вырезом: в вырезе виден бюст (тело под одеждой) */}
          <path d={blousePath} fill={blouse} {...outline} />
          {/* Кружево по трём сторонам квадрата блузки */}
          <path d={necklineD} fill="none" stroke="#efe8da" strokeWidth={3.5} />
          <path d={necklineD} fill="none" stroke="#d9d0bc" strokeWidth={1} strokeDasharray="2.5 2" />
          {/* Тень ложбинки в окне */}
          <path d={`M${cx} ${sqBot - 5} L${cx} ${sqBot + 2}`} stroke="rgba(150,110,95,0.4)" strokeWidth={1.2} strokeLinecap="round" />
          {/* Сборка под грудью */}
          <path d={`M${cx - ch - 8} ${blouseBottom} L${cx + ch + 8} ${blouseBottom}`} stroke="#d9d0bc" strokeWidth={1.4} />
          {/* Лиф с квадратным вырезом шире блузки */}
          <path d={bodicePath} fill={bodice} {...outline} />
          {/* Золотое кружево по квадрату лифа */}
          <path d={bodiceNeck} fill="none" stroke="#d8b25a" strokeWidth={1.4} opacity={0.85} />
          <path d={lacePath} fill={darken(bodice, 18)} stroke="rgba(0,0,0,0.3)" strokeWidth={0.6} />
          {/* Шнуровка ниже декольте */}
          {[0, 1, 2].map((i) => {
            const y = bBot + 10 + i * 13;
            return (
              <path key={i} d={`M${cx - 8} ${y} L${cx + 8} ${y + 8} M${cx + 8} ${y} L${cx - 8} ${y + 8}`} stroke="#d8b25a" strokeWidth={1.6} strokeLinecap="round" />
            );
          })}
        </g>
      );
    },
  },

  /* ===== ВЕРХ (женский), новая коллекция ===== */
  {
    id: 'top-silk-blouse', name: 'Шёлковая блуза', category: 'top', fit: 'f', z: 20, bbox: [76, 126, 148, 210],
    colorable: [tone('silk', 'Цвет шёлка')],
    render: (_g, rig, context) => {
      const c = fabricTone(context, 'top-silk-blouse', 'silk', '#e8dcc8');
      const wy = rig.waist.y + 8;
      return (
        <g>
          {topBody(rig, c, { hem: wy, ease: 1.14, neck: 132, sleeveW: 24, short: 0.46 })}
          {/* мягкие складки шёлка */}
          {fabricPattern(rig, wy, (
            <g fill="none" strokeLinecap="round">
              {[-0.62, -0.34, -0.08, 0.2, 0.48].map((t, i) => (
                <path key={i} d={`M${rig.chest.x + t * rig.chestHalf} ${rig.chest.y - 4} q${t * 8} 22 ${t * 14} ${wy - rig.chest.y - 8}`} stroke="rgba(255,255,255,0.34)" strokeWidth={1.8} />
              ))}
              <path d={`M${rig.chest.x - rig.chestHalf * 0.5} ${rig.chest.y + 12} q10 14 8 ${wy - rig.chest.y - 18}`} stroke="rgba(0,0,0,0.13)" strokeWidth={1.4} />
            </g>
          ))}
          {/* бант-завязка на вороте */}
          <path d={`M${rig.chest.x - 7} 128 L${rig.chest.x + 7} 128 L${rig.chest.x + 5} ${rig.chest.y + 6} L${rig.chest.x - 5} ${rig.chest.y + 6}Z`} fill={c} {...outline} />
          <path d={`M${rig.chest.x - 5} 127 L${rig.chest.x + 5} 127`} stroke="rgba(0,0,0,0.22)" strokeWidth={1} />
        </g>
      );
    },
  },
  {
    id: 'top-peterpan-blouse', name: 'Блуза с воротником «питер пэн»', category: 'top', fit: 'f', z: 20, bbox: [76, 126, 148, 210],
    colorable: [tone('body', 'Цвет блузы')],
    render: (_g, rig, context) => {
      const c = fabricTone(context, 'top-peterpan-blouse', 'body', '#f6f2e8');
      const wy = rig.waist.y + 10;
      return (
        <g>
          {topBody(rig, c, { hem: wy, ease: 1.1, neck: 126, sleeveW: 22, short: 0.44 })}
          {/* круглый воротник «питер пэн» */}
          <g fill="#fbfaf4" {...outline}>
            <path d={`M${150 - rig.neckHalf - 3} 121 Q${rig.chest.x - 21} 126 ${rig.chest.x - 15} ${rig.chest.y + 2} Q${rig.chest.x} ${rig.chest.y + 9} ${rig.chest.x - 1} ${rig.chest.y + 1} Z`} />
            <path d={`M${150 + rig.neckHalf + 3} 121 Q${rig.chest.x + 21} 126 ${rig.chest.x + 15} ${rig.chest.y + 2} Q${rig.chest.x} ${rig.chest.y + 9} ${rig.chest.x + 1} ${rig.chest.y + 1} Z`} />
          </g>
          {/* планка и пуговицы */}
          <path d={`M${rig.chest.x} ${rig.chest.y + 2} L${rig.waist.x} ${wy - 6}`} stroke="rgba(0,0,0,0.18)" strokeWidth={1.1} fill="none" />
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={rig.chest.x} cy={rig.chest.y + 22 + i * 22} r={2} fill="#cfc4ae" stroke="rgba(0,0,0,0.25)" strokeWidth={0.4} />
          ))}
          {fabricPattern(rig, wy, (
            <g fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth={0.9}>
              {[-0.6, -0.3, 0, 0.3, 0.6].map((t, i) => (
                <path key={i} d={`M${rig.chest.x + t * rig.chestHalf} ${rig.chest.y + 8} q${t * 6} 20 ${t * 12} ${wy - rig.chest.y - 14}`} />
              ))}
            </g>
          ))}
        </g>
      );
    },
  },
  {
    id: 'top-tweed-vest', name: 'Твидовый жилет', category: 'top', fit: 'f', z: 35, bbox: [76, 126, 148, 190],
    colorable: topTone('Цвет твида'),
    render: (_g, rig, context) => {
      const c = fabricTone(context, 'top-tweed-vest', 'body', '#8a6f4e');
      const hem = rig.hips[0].y + 12;
      const vestD = `M${150 - rig.neckHalf - 3} 124 L${rig.chest.x - rig.chestHalf * 0.78} ${rig.chest.y + 40} L${rig.chest.x - rig.waistHalf - 6} ${hem} L${rig.chest.x + rig.waistHalf + 6} ${hem} L${rig.chest.x + rig.chestHalf * 0.78} ${rig.chest.y + 40} L${150 + rig.neckHalf + 3} 124 L${rig.chest.x + 20} ${rig.chest.y + 4} L${rig.chest.x - 20} ${rig.chest.y + 4}Z`;
      return (
        <g>
          {topBody(rig, '#f2ede2', { hem: rig.waist.y + 22, ease: 1.02, neck: 128, sleeveW: 20, short: 0.4 })}
          {/* жилет поверх блузки: замкнутый контур, сидит по плечам и не выходит за фигуру */}
          <path d={vestD} fill={c} {...outline} />
          <Clipped d={vestD}>{tweedWeaveInner(rig, hem, '#d9c39a', '#5c452a')}</Clipped>
          {/* вырез и лацканы */}
          <path d={`M${rig.chest.x - 20} ${rig.chest.y + 6} L${rig.chest.x} ${rig.chest.y + 52} L${rig.chest.x + 20} ${rig.chest.y + 6}`} fill="none" stroke="rgba(0,0,0,0.34)" strokeWidth={1.3} />
          {[0, 1, 2, 3].map((i) => (
            <circle key={i} cx={rig.chest.x - 10} cy={rig.chest.y + 34 + i * 20} r={2.2} fill="#4a3822" stroke="rgba(0,0,0,0.35)" strokeWidth={0.4} />
          ))}
          {/* ремешок-пряжка на талии */}
          <rect x={rig.waist.x - 9} y={rig.waist.y + 6} width={18} height={9} rx={1.5} fill="#4a3822" stroke="#2a1e12" strokeWidth={0.7} />
          <rect x={rig.waist.x - 4} y={rig.waist.y + 8.5} width={8} height={4} rx={0.8} fill="none" stroke="#c9a24b" strokeWidth={1} />
        </g>
      );
    },
  },
  {
    id: 'top-tweed-jacket', name: 'Твидовый пиджак', category: 'top', fit: 'f', z: 40, bbox: [72, 118, 156, 230],
    colorable: topTone('Цвет твида'),
    render: (_g, rig, context) => {
      const c = fabricTone(context, 'top-tweed-jacket', 'body', '#7d6a48');
      const dark = darken(c, 16);
      const hem = rig.hips[0].y + 16;
      return (
        <g>
          {topBody(rig, '#f2ede2', { hem: rig.waist.y + 20, ease: 1.0, neck: 128, sleeveW: 19, short: 0.42 })}
          {/* пиджак с рукавами: подол укладывается в границы bbox */}
          {sleeves(rig, c, 25, { cuff: true, cuffColor: dark })}
          <path d={torsoPath(rig, { hem, hemHalf: rig.hipHalf + 13, chestEase: 1.14, waistEase: 1.22, hipEase: 1.18, neckDrop: 126 })} fill={c} {...outline} />
          <Clipped d={torsoPath(rig, { hem, hemHalf: rig.hipHalf + 13, chestEase: 1.14, waistEase: 1.22, hipEase: 1.18, neckDrop: 126 })}>
            {tweedWeaveInner(rig, hem, `color-mix(in srgb, ${c} 55%, white)`, darken(c, 34))}
          </Clipped>
          {/* лацканы */}
          <path d={`M${rig.chest.x} ${rig.chest.y - 2} L${150 - rig.neckHalf - 3} 122 L${rig.chest.x - rig.chestHalf * 0.82} ${rig.chest.y + 46} L${rig.chest.x} ${rig.chest.y + 64} Z`} fill={dark} {...outline} />
          <path d={`M${rig.chest.x} ${rig.chest.y - 2} L${150 + rig.neckHalf + 3} 122 L${rig.chest.x + rig.chestHalf * 0.82} ${rig.chest.y + 46} L${rig.chest.x} ${rig.chest.y + 64} Z`} fill={dark} {...outline} />
          <path d={`M${rig.chest.x} ${rig.chest.y + 64} L${rig.waist.x - 2} ${hem - 8}`} stroke="rgba(0,0,0,0.3)" strokeWidth={1.1} fill="none" />
          {/* карманы с клапанами */}
          {[-1, 1].map((s) => (
            <g key={s}>
              <path d={`M${rig.chest.x + s * 22} ${rig.waist.y - 6} L${rig.chest.x + s * 22 + 14} ${rig.waist.y - 2}`} stroke="rgba(0,0,0,0.36)" strokeWidth={2.4} strokeLinecap="round" />
            </g>
          ))}
          <path d={`M${rig.chest.x - 8} ${rig.chest.y + 34} L${rig.chest.x + 8} ${rig.chest.y + 34}`} stroke="rgba(0,0,0,0.32)" strokeWidth={2.2} strokeLinecap="round" />
        </g>
      );
    },
  },
  {
    id: 'top-crewneck', name: 'Джемпер с круглым вырезом', category: 'top', fit: 'f', z: 20, bbox: [76, 126, 148, 140],
    colorable: topTone('Цвет пряжи'),
    render: (_g, rig, context) => {
      const c = fabricTone(context, 'top-crewneck', 'body', '#5c6a7a');
      const hem = rig.waist.y + 14;
      return (
        <g>
          {topBody(rig, c, { hem, ease: 1.06, neck: 124, sleeveW: 23, cuff: c })}
          {fabricPattern(rig, hem, (
            <g stroke="rgba(255,255,255,0.15)" strokeWidth={1.1} fill="none">
              {Array.from({ length: 12 }, (_, i) => (
                <path key={i} d={`M${rig.chest.x - rig.chestHalf} ${150 + i * 12} q${rig.chestHalf} 5 ${rig.chestHalf * 2} 0`} />
              ))}
            </g>
          ))}
          {/* круглый вырез в рубчик */}
          <path d={`M${150 - rig.neckHalf - 2} 122 Q150 134 ${150 + rig.neckHalf + 2} 122`} fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth={3.4} />
          <path d={`M${150 - rig.neckHalf - 2} 122 Q150 134 ${150 + rig.neckHalf + 2} 122`} fill="none" stroke="rgba(255,255,255,0.24)" strokeWidth={1.1} />
          {knitHem(rig, c, hem)}
          {/* плечевые швы */}
          {[-1, 1].map((s) => (
            <path key={s} d={`M${150 + s * (rig.neckHalf + 2)} 122 L${rig.chest.x + s * rig.chestHalf} ${rig.chest.y - 6}`} stroke="rgba(0,0,0,0.2)" strokeWidth={1} fill="none" />
          ))}
        </g>
      );
    },
  },
  {
    id: 'top-pullover-collar', name: 'Пуловер с воротником', category: 'top', fit: 'f', z: 20, bbox: [76, 110, 148, 160],
    colorable: topTone('Цвет пряжи'),
    render: (_g, rig, context) => {
      const c = fabricTone(context, 'top-pullover-collar', 'body', '#3f5a48');
      const hem = rig.waist.y + 16;
      return (
        <g>
          {sleeves(rig, c, 23, { cuff: true, cuffColor: c })}
          <path d={torsoPath(rig, { hem, hemHalf: rig.waistHalf + 7, chestEase: 1.06, waistEase: 1.09, neckDrop: 132 })} fill={c} {...outline} />
          {fabricPattern(rig, hem, (
            <g stroke="rgba(255,255,255,0.13)" strokeWidth={1} fill="none">
              {Array.from({ length: 16 }, (_, i) => (
                <path key={i} d={`M${rig.chest.x - rig.chestHalf + i * 5.4} ${rig.chest.y - 8} L${rig.chest.x - rig.chestHalf + i * 5.4} ${hem}`} />
              ))}
            </g>
          ))}
          {/* отложной воротник поло */}
          <path d={`M${150 - rig.neckHalf - 3} 120 L${rig.chest.x - 4} ${rig.chest.y - 8} L${rig.chest.x + 4} ${rig.chest.y - 8} L${150 + rig.neckHalf + 3} 120 L${150 + rig.neckHalf + 5} 128 L${rig.chest.x} ${rig.chest.y + 4} L${150 - rig.neckHalf - 5} 128Z`} fill={c} {...outline} />
          <path d={`M${rig.chest.x} ${rig.chest.y + 2} L${rig.chest.x} ${rig.chest.y + 24}`} stroke="rgba(0,0,0,0.28)" strokeWidth={1} />
          {[-1, 1].map((s) => (
            <circle key={s} cx={rig.chest.x} cy={rig.chest.y + 10 + s * 8} r={1.7} fill="#c9a24b" stroke="rgba(0,0,0,0.3)" strokeWidth={0.4} />
          ))}
          {knitHem(rig, c, hem)}
        </g>
      );
    },
  },
  {
    id: 'top-knit-pattern', name: 'Вязаный джемпер с узором', category: 'top', fit: 'f', z: 20, bbox: [76, 126, 148, 150],
    colorable: [tone('body', 'Цвет пряжи'), tone('motif', 'Цвет узора')],
    render: (_g, rig, context) => {
      const c = fabricTone(context, 'top-knit-pattern', 'body', '#6b4a3a');
      const motif = fabricTone(context, 'top-knit-pattern', 'motif', '#e8d8b8');
      const hem = rig.waist.y + 14;
      return (
        <g>
          {topBody(rig, c, { hem, ease: 1.07, neck: 124, sleeveW: 23, cuff: c })}
          {fabricPattern(rig, hem, (
            <g>
              {/* ромбовидный орнамент по груди */}
              {Array.from({ length: 3 }, (_, row) =>
                Array.from({ length: 4 }, (_, col) => {
                  const x = rig.chest.x - 27 + col * 18 + (row % 2) * 9;
                  const y = rig.chest.y + 4 + row * 20;
                  return (
                    <g key={`${row}-${col}`}>
                      <path d={`M${x} ${y - 8} L${x + 8} ${y} L${x} ${y + 8} L${x - 8} ${y}Z`} fill="none" stroke={motif} strokeWidth={1.8} />
                      <circle cx={x} cy={y} r={1.5} fill={motif} />
                    </g>
                  );
                }),
              )}
              {/* кайма узора по низу */}
              <path d={`M${rig.chest.x - rig.chestHalf} ${hem - 20} L${rig.chest.x + rig.chestHalf} ${hem - 20}`} stroke={motif} strokeWidth={2.2} />
              <path d={`M${rig.chest.x - rig.chestHalf} ${hem - 15} L${rig.chest.x + rig.chestHalf} ${hem - 15}`} stroke={motif} strokeWidth={1.2} strokeDasharray="3 3" />
            </g>
          ))}
          <path d={`M${150 - rig.neckHalf - 2} 122 Q150 134 ${150 + rig.neckHalf + 2} 122`} fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth={3.2} />
          {knitHem(rig, c, hem)}
        </g>
      );
    },
  },
  {
    id: 'top-leather-jacket', name: 'Куртка из кожи', category: 'top', fit: 'f', z: 40, bbox: [72, 118, 156, 200],
    colorable: topTone('Цвет кожи'),
    render: (_g, rig, context) => {
      const c = fabricTone(context, 'top-leather-jacket', 'body', '#3a2a24');
      const dark = darken(c, 30);
      const hem = rig.waist.y + 22;
      return (
        <g>
          {topBody(rig, '#e6e0d2', { hem: rig.waist.y + 14, ease: 1.0, neck: 130, sleeveW: 19, short: 0.44 })}
          {/* кожаная куртка косо на молнии */}
          {sleeves(rig, c, 26, { cuff: true, cuffColor: dark })}
          <path d={torsoPath(rig, { hem, hemHalf: rig.waistHalf + 9, chestEase: 1.16, waistEase: 1.2, hipEase: 1.1, neckDrop: 128 })} fill={c} {...outline} />
          {leatherGloss(rig, hem)}
          {/* широкий шалевый воротник */}
          <path d={`M${rig.chest.x} ${rig.chest.y - 6} L${150 - rig.neckHalf - 6} 118 L${150 - rig.neckHalf - 2} 136 L${rig.chest.x - rig.chestHalf * 0.6} ${rig.chest.y + 20} L${rig.chest.x} ${rig.chest.y + 14} Z`} fill={dark} {...outline} />
          <path d={`M${rig.chest.x} ${rig.chest.y - 6} L${150 + rig.neckHalf + 6} 118 L${150 + rig.neckHalf + 2} 136 L${rig.chest.x + rig.chestHalf * 0.6} ${rig.chest.y + 20} L${rig.chest.x} ${rig.chest.y + 14} Z`} fill={dark} {...outline} />
          {/* косая молния */}
          <path d={`M${rig.chest.x - 3} ${rig.chest.y + 10} L${rig.waist.x + 14} ${hem - 6}`} stroke="#c9c4b4" strokeWidth={2} strokeDasharray="2 1.4" fill="none" />
          <circle cx={rig.waist.x + 14} cy={hem - 6} r={2} fill="#c9a24b" stroke="#6a4a1e" strokeWidth={0.5} />
          {/* пояс по низу */}
          <rect x={rig.waist.x - rig.waistHalf - 9} y={hem - 12} width={(rig.waistHalf + 9) * 2} height={12} rx={2} fill={dark} {...outline} />
          <rect x={rig.waist.x - 5} y={hem - 10} width={10} height={8} rx={1} fill="#c9a24b" stroke="rgba(0,0,0,0.5)" strokeWidth={0.6} />
          {/* карман на молнии */}
          <path d={`M${rig.chest.x + 14} ${rig.waist.y - 8} L${rig.chest.x + 30} ${rig.waist.y - 2}`} stroke="#c9c4b4" strokeWidth={1.8} strokeDasharray="1.6 1.2" fill="none" />
        </g>
      );
    },
  },

  /* ===== ВЕРХ (мужской) ===== */
  {
    id: 'top-shirt-tie', name: 'Рубашка с галстуком', category: 'top', fit: 'm', z: 20, bbox: [70, 126, 160, 120],
    colorable: [...topTone('Цвет рубашки'), accentTone('tie', 'Цвет галстука')],
    render: (_g, rig, context) => {
      const shirt = fabricTone(context, 'top-shirt-tie', 'body', '#f6f3ec');
      const tie = accentColor(context, 'top-shirt-tie', 'tie', '#2c3a5c');
      return (
      <g>
        {neckBand(rig, shirt, { height: 114, drop: 126 })}
        {sleeves(rig, shirt, 24, { cuff: true, cuffColor: darken(shirt, 8) })}
        <path d={torsoPath(rig, { hem: rig.waist.y + 26, hemHalf: rig.hipHalf + 2, neckDrop: 128 })} fill={shirt} {...outline} />
        <path d={`M${150 - rig.neckHalf - 3} 120 L${rig.chest.x} ${rig.chest.y - 8} L${150 + rig.neckHalf + 3} 120 L${150 + rig.neckHalf + 7} 128 L${rig.chest.x} ${rig.chest.y + 4} L${150 - rig.neckHalf - 7} 128 Z`} fill={darken(shirt, 5)} {...outline} />
        <path d={`M${rig.chest.x} ${rig.chest.y + 4} L${rig.waist.x} ${rig.waist.y + 20}`} stroke="rgba(0,0,0,0.15)" strokeWidth={1} />
        <path d={`M${rig.chest.x - 6} ${rig.chest.y - 10} L${rig.chest.x + 6} ${rig.chest.y - 10} L${rig.chest.x + 6} ${rig.chest.y + 44} L${rig.chest.x} ${rig.chest.y + 52} L${rig.chest.x - 6} ${rig.chest.y + 44} Z`} fill={tie} {...outline} />
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M${rig.chest.x - 6} ${rig.chest.y + i * 11} L${rig.chest.x + 6} ${rig.chest.y + i * 11 - 5}`} stroke={darken(tie, 35)} strokeWidth={2} />
        ))}
        <path d={`M${rig.chest.x - 7} ${rig.chest.y - 12} L${rig.chest.x + 7} ${rig.chest.y - 12} L${rig.chest.x + 7} ${rig.chest.y - 4} L${rig.chest.x - 7} ${rig.chest.y - 4} Z`} fill={darken(tie, 25)} />
      </g>
      );
    },
  },
  {
    id: 'top-waistcoat', name: 'Жилет', category: 'top', fit: 'm', z: 35, bbox: [70, 126, 160, 140],
    colorable: [tone('vest', 'Цвет жилета'), tone('shirt', 'Цвет рубашки'), accentTone('tie', 'Цвет галстука')],
    render: (_g, rig, context) => {
      const vest = fabricTone(context, 'top-waistcoat', 'vest', '#55524e');
      const shirt = fabricTone(context, 'top-waistcoat', 'shirt', '#f6f3ec');
      const tie = accentColor(context, 'top-waistcoat', 'tie', '#5a1e2a');
      return (
      <g>
        {neckBand(rig, shirt, { height: 114, drop: 126 })}
        {sleeves(rig, shirt, 24, { cuff: true, cuffColor: darken(shirt, 8) })}
        <path d={torsoPath(rig, { hem: rig.waist.y + 26, hemHalf: rig.hipHalf + 2, neckDrop: 128 })} fill={shirt} {...outline} />
        <path d={`M${150 - rig.neckHalf - 3} 120 L${rig.chest.x} ${rig.chest.y - 8} L${150 + rig.neckHalf + 3} 120 L${150 + rig.neckHalf + 7} 128 L${rig.chest.x} ${rig.chest.y + 4} L${150 - rig.neckHalf - 7} 128 Z`} fill={darken(shirt, 5)} {...outline} />
        <path d={`M${rig.chest.x - 6} ${rig.chest.y - 10} L${rig.chest.x + 6} ${rig.chest.y - 10} L${rig.chest.x + 6} ${rig.chest.y + 30} L${rig.chest.x} ${rig.chest.y + 38} L${rig.chest.x - 6} ${rig.chest.y + 30} Z`} fill={tie} />
        <path d={`M${rig.chest.x - rig.chestHalf * 0.92} ${rig.shoulders[0].y + 8} L${rig.chest.x} ${rig.chest.y + 44} L${rig.chest.x + rig.chestHalf * 0.92} ${rig.shoulders[1].y + 8} L${rig.chest.x + rig.chestHalf * 1.02} ${rig.waist.y + 30} L${rig.chest.x} ${rig.waist.y + 44} L${rig.chest.x - rig.chestHalf * 1.02} ${rig.waist.y + 30} Z`} fill={vest} {...outline} />
        <path d={`M${rig.chest.x} ${rig.chest.y + 44} L${rig.waist.x} ${rig.waist.y + 42}`} stroke="rgba(0,0,0,0.3)" strokeWidth={1} />
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={rig.chest.x} cy={rig.chest.y + 56 + i * 15} r={2.5} fill="#2b2925" />
        ))}
        <path d={`M${rig.chest.x - rig.chestHalf * 0.72} ${rig.waist.y + 2} L${rig.chest.x - rig.chestHalf * 0.72 + 14} ${rig.waist.y + 2} M${rig.chest.x + rig.chestHalf * 0.72 - 14} ${rig.waist.y + 2} L${rig.chest.x + rig.chestHalf * 0.72} ${rig.waist.y + 2}`} stroke="rgba(0,0,0,0.35)" strokeWidth={1.5} />
        <path d={`M${rig.chest.x} ${rig.waist.y + 8} Q${rig.chest.x + 14} ${rig.waist.y + 28} ${rig.chest.x + 26} ${rig.waist.y + 2}`} stroke="#c9a24b" strokeWidth={1.5} fill="none" />
      </g>
      );
    },
  },
  {
    id: 'top-suit', name: 'Двубортный пиджак', category: 'top', fit: 'm', z: 40, bbox: [66, 124, 168, 196],
    colorable: topTone('Цвет пиджака'),
    render: (_g, rig, context) => {
      const c = fabricTone(context, 'top-suit', 'body', '#33363d');
      const dark = darken(c, 12);
      return (
      <g>
        {neckBand(rig, '#f6f3ec', { height: 114, drop: 126 })}
        {/* Прямой силуэт: талия не заужена, низ расширен */}
        <path d={torsoPath(rig, { hem: rig.hips[0].y + 22, hemHalf: rig.hipHalf + 22, chestEase: 1.14, waistEase: 1.56, hipEase: 1.24, neckDrop: 128 })} fill={c} {...outline} />
        {/* Рукава поверх груди: руки перед корпусом */}
        {sleeves(rig, c, 26, { cuff: true, cuffColor: dark })}
        <path d={`M${150 - rig.neckHalf - 2} 120 L${rig.chest.x} ${rig.chest.y - 6} L${150 + rig.neckHalf + 2} 120 L${150 + rig.neckHalf + 5} 126 L${rig.chest.x} ${rig.chest.y + 2} L${150 - rig.neckHalf - 5} 126 Z`} fill="#f6f3ec" />
        <path d={`M${rig.chest.x - 6} ${rig.chest.y - 8} L${rig.chest.x + 6} ${rig.chest.y - 8} L${rig.chest.x + 6} ${rig.chest.y + 30} L${rig.chest.x} ${rig.chest.y + 38} L${rig.chest.x - 6} ${rig.chest.y + 30} Z`} fill="#7a1f2b" />
        <path d={`M${rig.chest.x} ${rig.chest.y - 4} L${150 - rig.neckHalf - 5} 122 L${rig.chest.x - rig.chestHalf * 0.85} ${rig.chest.y + 52} L${rig.chest.x} ${rig.chest.y + 74} Z`} fill={dark} {...outline} />
        <path d={`M${rig.chest.x} ${rig.chest.y - 4} L${150 + rig.neckHalf + 5} 122 L${rig.chest.x + rig.chestHalf * 0.85} ${rig.chest.y + 52} L${rig.chest.x} ${rig.chest.y + 74} Z`} fill={dark} {...outline} />
        <path d={`M${rig.waist.x} ${rig.chest.y + 74} L${rig.waist.x - 3} ${rig.hips[0].y + 20}`} stroke="rgba(0,0,0,0.35)" strokeWidth={1} />
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <circle cx={rig.chest.x - 13} cy={rig.chest.y + 64 + i * 25} r={3.2} fill="#15161a" />
            <circle cx={rig.chest.x + 13} cy={rig.chest.y + 64 + i * 25} r={3.2} fill="#15161a" />
          </g>
        ))}
        <path d={`M${rig.chest.x - rig.chestHalf * 0.9} ${rig.waist.y + 16} L${rig.chest.x - rig.chestHalf * 0.9 + 18} ${rig.waist.y + 16} L${rig.chest.x - rig.chestHalf * 0.9 + 18} ${rig.waist.y + 20} L${rig.chest.x - rig.chestHalf * 0.9} ${rig.waist.y + 20} Z`} fill={dark} />
        <path d={`M${rig.chest.x - rig.chestHalf * 0.78} ${rig.chest.y + 8} L${rig.chest.x - rig.chestHalf * 0.78 + 11} ${rig.chest.y + 8} L${rig.chest.x - rig.chestHalf * 0.78 + 11} ${rig.chest.y + 12} L${rig.chest.x - rig.chestHalf * 0.78} ${rig.chest.y + 12} Z`} fill="#f6f3ec" />
      </g>
      );
    },
  },
  {
    id: 'top-tux', name: 'Фрак с жилетом', category: 'top', fit: 'm', z: 40, bbox: [66, 124, 168, 320],
    // Фалды — за спиной, спереди не видны
    back: (_g, rig) => {
      const cx = rig.chest.x;
      const wy = rig.waist.y;
      const ky = rig.legs[0].knee.y;
      return (
        <g>
          <path d={`M${cx - 14} ${wy - 2} L${cx - 4} ${wy - 2} L${cx - 9} ${ky + 16} L${cx - 18} ${ky + 8} Z`} fill="#17181c" {...outline} />
          <path d={`M${cx + 4} ${wy - 2} L${cx + 14} ${wy - 2} L${cx + 18} ${ky + 8} L${cx + 9} ${ky + 16} Z`} fill="#17181c" {...outline} />
        </g>
      );
    },
    render: (_g, rig) => {
      const cx = rig.chest.x;
      const wy = rig.waist.y;
      const wh = rig.waistHalf;
      const ch = rig.chestHalf;
      const nh = rig.neckHalf;
      const srX = rig.shoulders[1].x;
      const slX = rig.shoulders[0].x;
      const cyV = rig.chest.y;
      // Спереди фрак короткий: до талии, с вырезом
      const frontPath = [
        `M${cx - nh - 3} 120`,
        `L${cx} 124`,
        `L${cx + nh + 3} 120`,
        `L${cx + nh + 6} 126`,
        `L${srX} 154`,
        `C${srX} 176 ${cx + ch * 1.05} ${wy - 30} ${cx + wh + 6} ${wy + 2}`,
        `L${cx - wh - 6} ${wy + 2}`,
        `C${cx - ch * 1.05} ${wy - 30} ${slX} 176 ${slX} 154`,
        `L${cx - nh - 6} 126 Z`,
      ].join(' ');
      return (
        <g>
          {neckBand(rig, '#f8f6ef', { height: 114, drop: 126 })}
          {sleeves(rig, '#1e1f24', 26, { cuff: true, cuffColor: '#f6f3ec' })}
          {/* Короткая передняя часть фрака */}
          <path d={frontPath} fill="#1e1f24" {...outline} />
          {/* Манишка */}
          <path d={`M${cx - nh - 2} 120 L${cx} 124 L${cx + nh + 2} 120 L${cx + nh + 5} 126 L${cx} 130 L${cx - nh - 5} 126 Z`} fill="#f8f6ef" />
          {/* Жилет под фраком */}
          <path d={`M${cx - 8} 128 L${cx + 8} 128 L${cx + 8} ${cyV + 34} L${cx} ${cyV + 42} L${cx - 8} ${cyV + 34} Z`} fill="#f2ead8" {...outline} />
          {/* Пуговицы жилета: строго внутри полотна манишки */}
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={cx} cy={cyV + 4 + i * 11} r={1.4} fill="#2b2925" />
          ))}
          {/* Лацканы фрака */}
          <path d={`M${cx} 124 L${cx - nh - 5} 122 L${cx - ch * 0.8} ${rig.chest.y + 50} L${cx} ${rig.chest.y + 64} Z`} fill="#141519" {...outline} />
          <path d={`M${cx} 124 L${cx + nh + 5} 122 L${cx + ch * 0.8} ${rig.chest.y + 50} L${cx} ${rig.chest.y + 64} Z`} fill="#141519" {...outline} />
          {/* Галстук-бабочка */}
          <path d={`M${cx} ${rig.chest.y - 10} L${cx - 13} ${rig.chest.y - 17} L${cx - 13} ${rig.chest.y - 3} Z M${cx} ${rig.chest.y - 10} L${cx + 13} ${rig.chest.y - 17} L${cx + 13} ${rig.chest.y - 3} Z`} fill="#17181c" {...outline} />
          {/* Пояс */}
          <rect x={cx - wh - 4} y={wy + 2} width={(wh + 4) * 2} height={11} fill="#2b2d33" {...outline} />
          {Array.from({ length: 8 }).map((_, i) => (
            <path key={i} d={`M${cx - wh + i * (wh / 4)} ${wy + 3} L${cx - wh + i * (wh / 4)} ${wy + 12}`} stroke="rgba(0,0,0,0.3)" strokeWidth={1} />
          ))}
        </g>
      );
    },
  },
  {
    id: 'top-tux-old', name: 'Фрак классический (ст.)', category: 'top', fit: 'm', z: 40, bbox: [66, 124, 168, 220],
    render: (_g, rig) => (
      <g>
        {neckBand(rig, '#f8f6ef', { height: 114, drop: 126 })}
        {sleeves(rig, '#1e1f24', 26, { cuff: true, cuffColor: '#f6f3ec' })}
        {/* Та же длина, что у нового фрака: перед до талии */}
        <path d={torsoPath(rig, { hem: rig.waist.y + 2, hemHalf: rig.waistHalf + 6, chestEase: 1.12, neckDrop: 128 })} fill="#1e1f24" {...outline} />
        <path d={`M${150 - rig.neckHalf - 2} 120 L${rig.chest.x} ${rig.chest.y - 6} L${150 + rig.neckHalf + 2} 120 L${150 + rig.neckHalf + 5} 126 L${rig.chest.x} ${rig.chest.y + 2} L${150 - rig.neckHalf - 5} 126 Z`} fill="#f8f6ef" />
        <path d={`M${rig.chest.x - 8} ${rig.chest.y - 8} L${rig.chest.x + 8} ${rig.chest.y - 8} L${rig.chest.x + 8} ${rig.chest.y + 34} L${rig.chest.x} ${rig.chest.y + 42} L${rig.chest.x - 8} ${rig.chest.y + 34} Z`} fill="#f2ead8" {...outline} />
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={rig.chest.x} cy={rig.chest.y + i * 12} r={1.4} fill="#2b2925" />
        ))}
        <path d={`M${rig.chest.x} ${rig.chest.y - 4} L${150 - rig.neckHalf - 5} 122 L${rig.chest.x - rig.chestHalf * 0.8} ${rig.chest.y + 50} L${rig.chest.x} ${rig.chest.y + 70} Z`} fill="#141519" {...outline} />
        <path d={`M${rig.chest.x} ${rig.chest.y - 4} L${150 + rig.neckHalf + 5} 122 L${rig.chest.x + rig.chestHalf * 0.8} ${rig.chest.y + 50} L${rig.chest.x} ${rig.chest.y + 70} Z`} fill="#141519" {...outline} />
        <path d={`M${rig.chest.x} ${rig.chest.y - 12} L${rig.chest.x - 13} ${rig.chest.y - 19} L${rig.chest.x - 13} ${rig.chest.y - 5} Z M${rig.chest.x} ${rig.chest.y - 12} L${rig.chest.x + 13} ${rig.chest.y - 19} L${rig.chest.x + 13} ${rig.chest.y - 5} Z`} fill="#17181c" {...outline} />
        <rect x={rig.waist.x - rig.waistHalf - 4} y={rig.waist.y + 2} width={(rig.waistHalf + 4) * 2} height={11} fill="#2b2d33" {...outline} />
        {Array.from({ length: 8 }).map((_, i) => (
          <path key={i} d={`M${rig.waist.x - rig.waistHalf + i * (rig.waistHalf / 4)} ${rig.waist.y + 3} L${rig.waist.x - rig.waistHalf + i * (rig.waistHalf / 4)} ${rig.waist.y + 12}`} stroke="rgba(0,0,0,0.3)" strokeWidth={1} />
        ))}
      </g>
    ),
  },
  {
    id: 'top-cardigan', name: 'Кардиган с шалевым воротником', category: 'top', fit: 'm', z: 40, bbox: [66, 124, 168, 186],
    colorable: topTone('Цвет кардигана'),
    render: (_g, rig, context) => {
      const c = fabricTone(context, 'top-cardigan', 'body', '#6b4f36');
      const dark = darken(c, 16);
      return (
      <g>
        {neckBand(rig, dark, { height: 115, drop: 126 })}
        {sleeves(rig, c, 25, { cuff: true, cuffColor: dark })}
        {/* Прямой (не приталенный) силуэт: грудь = талия = бёдра */}
        <path d={torsoPath(rig, { hem: rig.hips[0].y + 12, hemHalf: rig.hipHalf + 9, chestEase: 1.12, waistEase: 1.48, hipEase: 1.13, neckDrop: 128 })} fill={c} {...outline} />
        <path d={`M${150 - rig.neckHalf - 2} 120 L${rig.chest.x} ${rig.chest.y - 6} L${150 + rig.neckHalf + 2} 120 L${150 + rig.neckHalf + 5} 126 L${rig.chest.x} ${rig.chest.y + 2} L${150 - rig.neckHalf - 5} 126 Z`} fill="#f2ead8" />
        <path d={`M${rig.chest.x} ${rig.chest.y - 4} L${150 - rig.neckHalf - 6} 120 Q${rig.chest.x - rig.chestHalf * 0.95} ${rig.chest.y + 6} ${rig.chest.x - rig.chestHalf * 0.85} ${rig.hips[0].y + 10} L${rig.chest.x} ${rig.hips[0].y + 10} Z`} fill={dark} {...outline} />
        <path d={`M${rig.chest.x} ${rig.chest.y - 4} L${150 + rig.neckHalf + 6} 120 Q${rig.chest.x + rig.chestHalf * 0.95} ${rig.chest.y + 6} ${rig.chest.x + rig.chestHalf * 0.85} ${rig.hips[0].y + 10} L${rig.chest.x} ${rig.hips[0].y + 10} Z`} fill={dark} {...outline} />
        {[0, 1, 2, 3].map((i) => (
          <circle key={i} cx={rig.chest.x} cy={rig.chest.y + 26 + i * 24} r={3} fill="#2c1e12" />
        ))}
      </g>
      );
    },
  },
  {
    id: 'top-turtleneck', name: 'Водолазка', category: 'top', fit: 'm', z: 20, bbox: [70, 100, 160, 150],
    colorable: topTone('Цвет трикотажа'),
    render: (_g, rig, context) => {
      const c = fabricTone(context, 'top-turtleneck', 'body', '#e8dfc8');
      return (
      <g>
        {sleeves(rig, c, 24, { cuff: true, cuffColor: darken(c, 7) })}
        <path d={torsoPath(rig, { hem: rig.waist.y + 30, hemHalf: rig.hipHalf + 2, neckDrop: 130 })} fill={c} {...outline} />
        {/* Высокий ворот-стойка от основания шеи вверх */}
        <path
          d={`M${150 - rig.neckBaseHalf - 2.5} 132 Q150 137 ${150 + rig.neckBaseHalf + 2.5} 132 L${150 + rig.neckHalf + 1.5} 104 Q150 100 ${150 - rig.neckHalf - 1.5} 104 Z`}
          fill={c}
          {...outline}
        />
        <path d={`M${150 - rig.neckHalf - 1.5} 106 Q150 111 ${150 + rig.neckHalf + 1.5} 106`} stroke="rgba(0,0,0,0.18)" strokeWidth={1.1} fill="none" />
        {[-0.6, -0.3, 0, 0.3, 0.6].map((t) => (
          <path key={t} d={`M${150 + t * rig.neckHalf} 106 L${150 + t * (rig.neckBaseHalf + 1)} 131`} stroke="rgba(0,0,0,0.12)" strokeWidth={1} />
        ))}
      </g>
      );
    },
  },
  /* ===== ВЕРХ (мужской), новая коллекция ===== */
  {
    id: 'top-collar-shirt', name: 'Рубашка с воротником', category: 'top', fit: 'm', z: 20, bbox: [70, 126, 160, 130],
    colorable: topTone('Цвет рубашки'),
    render: (_g, rig, context) => {
      const shirt = fabricTone(context, 'top-collar-shirt', 'body', '#f2eee4');
      const hem = rig.waist.y + 28;
      return (
        <g>
          {sleeves(rig, shirt, 24, { cuff: true, cuffColor: darken(shirt, 7) })}
          <path d={torsoPath(rig, { hem, hemHalf: rig.hipHalf + 2, chestEase: 1.06, waistEase: 1.1, neckDrop: 128 })} fill={shirt} {...outline} />
          {/* планка и пуговицы */}
          <path d={`M${rig.chest.x - 5} ${rig.chest.y - 2} L${rig.chest.x - 5} ${hem - 6}`} stroke="rgba(0,0,0,0.16)" strokeWidth={1} fill="none" />
          <path d={`M${rig.chest.x + 5} ${rig.chest.y - 2} L${rig.chest.x + 5} ${hem - 6}`} stroke="rgba(0,0,0,0.16)" strokeWidth={1} fill="none" />
          {[0, 1, 2, 3, 4].map((i) => (
            <circle key={i} cx={rig.chest.x} cy={rig.chest.y + 14 + i * 26} r={1.9} fill="#cfc6ae" stroke="rgba(0,0,0,0.28)" strokeWidth={0.4} />
          ))}
          {/* отложной воротник с острыми концами: начинается у основания шеи, концы не задираются выше ворота */}
          <path d={`M${150 - rig.neckHalf - 6} 116 L${rig.chest.x - 14} ${rig.chest.y - 8} L${rig.chest.x - 4} ${rig.chest.y + 6} L${rig.chest.x + 3} ${rig.chest.y - 4} L${150 - rig.neckHalf - 2} 124 Z`} fill={darken(shirt, 5)} {...outline} />
          <path d={`M${150 + rig.neckHalf + 6} 116 L${rig.chest.x + 14} ${rig.chest.y - 8} L${rig.chest.x + 4} ${rig.chest.y + 6} L${rig.chest.x - 3} ${rig.chest.y - 4} L${150 + rig.neckHalf + 2} 124 Z`} fill={darken(shirt, 5)} {...outline} />
          <path d={`M${rig.chest.x - 4} ${rig.chest.y + 6} L${rig.chest.x + 4} ${rig.chest.y + 6}`} stroke="rgba(0,0,0,0.24)" strokeWidth={0.9} />
          {fabricPattern(rig, hem, (
            <g stroke="rgba(0,0,0,0.07)" strokeWidth={0.9} fill="none">
              {[-0.5, 0, 0.5].map((t, i) => (
                <path key={i} d={`M${rig.chest.x + t * rig.chestHalf} ${rig.chest.y + 8} q${t * 5} 18 ${t * 9} ${hem - rig.chest.y - 14}`} />
              ))}
            </g>
          ))}
        </g>
      );
    },
  },
  {
    id: 'top-striped-shirt', name: 'Рубашка в полоску', category: 'top', fit: 'm', z: 20, bbox: [70, 126, 160, 130],
    colorable: [tone('stripe', 'Цвет полоски'), tone('shirt', 'Цвет рубашки')],
    render: (_g, rig, context) => {
      const stripe = fabricTone(context, 'top-striped-shirt', 'stripe', '#2c3a5c');
      const shirt = fabricTone(context, 'top-striped-shirt', 'shirt', '#f4f0e6');
      const hem = rig.waist.y + 28;
      return (
        <g>
          {sleeves(rig, shirt, 24, { cuff: true, cuffColor: darken(shirt, 7) })}
          <path d={torsoPath(rig, { hem, hemHalf: rig.hipHalf + 2, chestEase: 1.06, waistEase: 1.1, neckDrop: 128 })} fill={shirt} {...outline} />
          {/* вертикальная полоска */}
          {fabricPattern(rig, hem, (
            <g stroke={stripe} strokeWidth={2.2} fill="none" opacity={0.85}>
              {Array.from({ length: 14 }, (_, i) => (
                <path key={i} d={`M${rig.chest.x - rig.chestHalf + i * 6.6} ${rig.chest.y - 10} L${rig.chest.x - rig.chestHalf + i * 6.6} ${hem}`} />
              ))}
            </g>
          ))}
          {/* воротник и планка: сидит по основанию шеи, концы ниже ворота */}
          <path d={`M${150 - rig.neckHalf - 6} 116 L${rig.chest.x - 14} ${rig.chest.y - 8} L${rig.chest.x - 4} ${rig.chest.y + 6} L${rig.chest.x + 3} ${rig.chest.y - 4} L${150 - rig.neckHalf - 2} 124 Z`} fill={darken(shirt, 5)} {...outline} />
          <path d={`M${150 + rig.neckHalf + 6} 116 L${rig.chest.x + 14} ${rig.chest.y - 8} L${rig.chest.x + 4} ${rig.chest.y + 6} L${rig.chest.x - 3} ${rig.chest.y - 4} L${150 + rig.neckHalf + 2} 124 Z`} fill={darken(shirt, 5)} {...outline} />
          <path d={`M${rig.chest.x - 5} ${rig.chest.y - 2} L${rig.chest.x + 5} ${rig.chest.y - 2} L${rig.chest.x + 5} ${hem - 6} L${rig.chest.x - 5} ${hem - 6}Z`} fill={darken(shirt, 3)} opacity={0.9} />
          {[0, 1, 2, 3, 4].map((i) => (
            <circle key={i} cx={rig.chest.x} cy={rig.chest.y + 14 + i * 26} r={1.9} fill="#cfc6ae" stroke="rgba(0,0,0,0.28)" strokeWidth={0.4} />
          ))}
        </g>
      );
    },
  },
  {
    id: 'top-tweed-vest-m', name: 'Твидовый жилет', category: 'top', fit: 'm', z: 35, bbox: [70, 126, 160, 150],
    colorable: topTone('Цвет твида'),
    render: (_g, rig, context) => {
      const c = fabricTone(context, 'top-tweed-vest-m', 'body', '#6e5c40');
      const hem = rig.waist.y + 30;
      const vestD = `M${rig.chest.x - rig.chestHalf * 0.9} ${rig.shoulders[0].y + 12} L${rig.chest.x} ${rig.chest.y + 44} L${rig.chest.x + rig.chestHalf * 0.9} ${rig.shoulders[1].y + 12} L${rig.chest.x + rig.waistHalf + 6} ${hem} L${rig.chest.x - rig.waistHalf - 6} ${hem} Z`;
      return (
        <g>
          {topBody(rig, '#f2eee4', { hem: rig.waist.y + 26, ease: 1.0, neck: 128, sleeveW: 24, cuff: '#e2ddd0' })}
          {/* жилет с V-вырезом: контур замкнут по плечам и низу, не выходит за фигуру */}
          <path d={vestD} fill={c} {...outline} />
          <Clipped d={vestD}>{tweedWeaveInner(rig, hem)}</Clipped>
          {/* вырез жилетa */}
          <path d={`M${rig.chest.x - rig.chestHalf * 0.9} ${rig.shoulders[0].y + 12} L${rig.chest.x} ${rig.chest.y + 44} L${rig.chest.x + rig.chestHalf * 0.9} ${rig.shoulders[1].y + 12}`} fill="none" stroke="rgba(0,0,0,0.36)" strokeWidth={1.4} />
          <path d={`M${rig.chest.x} ${rig.chest.y + 44} L${rig.chest.x} ${hem - 4}`} stroke="rgba(0,0,0,0.28)" strokeWidth={1.1} fill="none" />
          {/* ряд пуговиц */}
          {[0, 1, 2, 3].map((i) => (
            <circle key={i} cx={rig.chest.x - 9} cy={rig.chest.y + 60 + i * 24} r={2.6} fill="#2b2925" stroke="rgba(0,0,0,0.4)" strokeWidth={0.4} />
          ))}
          {/* хлястик-регулировка */}
          <path d={`M${rig.chest.x - rig.chestHalf * 0.7} ${hem - 10} L${rig.chest.x - rig.chestHalf * 0.7 + 16} ${hem - 10}`} stroke="rgba(0,0,0,0.4)" strokeWidth={2.2} />
          <path d={`M${rig.chest.x + rig.chestHalf * 0.7} ${hem - 10} L${rig.chest.x + rig.chestHalf * 0.7 - 16} ${hem - 10}`} stroke="rgba(0,0,0,0.4)" strokeWidth={2.2} />
          {/* цепочка для часов */}
          <path d={`M${rig.chest.x - 8} ${rig.waist.y + 8} Q${rig.chest.x + 10} ${rig.waist.y + 26} ${rig.chest.x + 20} ${rig.waist.y + 4}`} stroke="#c9a24b" strokeWidth={1.4} fill="none" />
        </g>
      );
    },
  },
  {
    id: 'top-tweed-jacket-m', name: 'Твидовый пиджак', category: 'top', fit: 'm', z: 40, bbox: [62, 120, 176, 220],
    colorable: topTone('Цвет твида'),
    render: (_g, rig, context) => {
      const c = fabricTone(context, 'top-tweed-jacket-m', 'body', '#5f5644');
      const dark = darken(c, 16);
      const hem = rig.hips[0].y + 22;
      return (
        <g>
          {topBody(rig, '#f2eee4', { hem: rig.waist.y + 24, ease: 1.0, neck: 128, sleeveW: 23, cuff: '#e2ddd0' })}
          {sleeves(rig, c, 26, { cuff: true, cuffColor: dark })}
          <path d={torsoPath(rig, { hem, hemHalf: rig.hipHalf + 26, chestEase: 1.18, waistEase: 1.52, hipEase: 1.32, neckDrop: 128 })} fill={c} {...outline} />
          <Clipped d={torsoPath(rig, { hem, hemHalf: rig.hipHalf + 26, chestEase: 1.18, waistEase: 1.52, hipEase: 1.32, neckDrop: 128 })}>
            {tweedWeaveInner(rig, hem)}
          </Clipped>
          {/* лацканы */}
          <path d={`M${rig.chest.x} ${rig.chest.y - 6} L${150 - rig.neckHalf - 5} 120 L${rig.chest.x - rig.chestHalf * 0.86} ${rig.chest.y + 50} L${rig.chest.x} ${rig.chest.y + 70} Z`} fill={dark} {...outline} />
          <path d={`M${rig.chest.x} ${rig.chest.y - 6} L${150 + rig.neckHalf + 5} 120 L${rig.chest.x + rig.chestHalf * 0.86} ${rig.chest.y + 50} L${rig.chest.x} ${rig.chest.y + 70} Z`} fill={dark} {...outline} />
          <path d={`M${rig.chest.x} ${rig.chest.y + 70} L${rig.waist.x - 3} ${hem - 10}`} stroke="rgba(0,0,0,0.32)" strokeWidth={1.1} fill="none" />
          {/* платок-паше в нагрудном кармане */}
          <path d={`M${rig.chest.x - 16} ${rig.chest.y + 8} L${rig.chest.x - 4} ${rig.chest.y + 8} L${rig.chest.x - 10} ${rig.chest.y + 20} Z`} fill="#e8dcc8" {...outline} />
          {/* пуговицы и карманы */}
          {[0, 1].map((i) => (
            <circle key={i} cx={rig.chest.x} cy={rig.chest.y + 82 + i * 26} r={2.8} fill="#241f18" stroke="rgba(0,0,0,0.4)" strokeWidth={0.4} />
          ))}
          {[-1, 1].map((s) => (
            <path key={s} d={`M${rig.waist.x + s * 26 - 13} ${rig.waist.y - 2} L${rig.waist.x + s * 26 + 13} ${rig.waist.y + 2}`} stroke="rgba(0,0,0,0.34)" strokeWidth={2.8} strokeLinecap="round" />
          ))}
        </g>
      );
    },
  },
  {
    id: 'top-crewneck-m', name: 'Джемпер с круглым вырезом', category: 'top', fit: 'm', z: 20, bbox: [70, 126, 160, 150],
    colorable: topTone('Цвет пряжи'),
    render: (_g, rig, context) => {
      const c = fabricTone(context, 'top-crewneck-m', 'body', '#4a5560');
      const hem = rig.waist.y + 24;
      return (
        <g>
          {sleeves(rig, c, 24, { cuff: true, cuffColor: c })}
          <path d={torsoPath(rig, { hem, hemHalf: rig.hipHalf + 2, chestEase: 1.08, waistEase: 1.12, neckDrop: 128 })} fill={c} {...outline} />
          {fabricPattern(rig, hem, (
            <g stroke="rgba(255,255,255,0.13)" strokeWidth={1.1} fill="none">
              {Array.from({ length: 12 }, (_, i) => (
                <path key={i} d={`M${rig.chest.x - rig.chestHalf} ${148 + i * 13} q${rig.chestHalf} 5 ${rig.chestHalf * 2} 0`} />
              ))}
            </g>
          ))}
          <path d={`M${150 - rig.neckHalf - 2} 122 Q150 134 ${150 + rig.neckHalf + 2} 122`} fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth={3.4} />
          <path d={`M${150 - rig.neckHalf - 2} 122 Q150 134 ${150 + rig.neckHalf + 2} 122`} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth={1.1} />
          {knitHem(rig, c, hem)}
          {[-1, 1].map((s) => (
            <path key={s} d={`M${150 + s * (rig.neckHalf + 2)} 122 L${rig.chest.x + s * rig.chestHalf} ${rig.chest.y - 8}`} stroke="rgba(0,0,0,0.2)" strokeWidth={1} fill="none" />
          ))}
        </g>
      );
    },
  },
  {
    id: 'top-pullover-collar-m', name: 'Пуловер с воротником', category: 'top', fit: 'm', z: 20, bbox: [70, 110, 160, 170],
    colorable: topTone('Цвет пряжи'),
    render: (_g, rig, context) => {
      const c = fabricTone(context, 'top-pullover-collar-m', 'body', '#3d4a3a');
      const hem = rig.waist.y + 26;
      return (
        <g>
          {sleeves(rig, c, 24, { cuff: true, cuffColor: c })}
          <path d={torsoPath(rig, { hem, hemHalf: rig.hipHalf + 2, chestEase: 1.08, waistEase: 1.12, neckDrop: 134 })} fill={c} {...outline} />
          {fabricPattern(rig, hem, (
            <g stroke="rgba(255,255,255,0.12)" strokeWidth={1} fill="none">
              {Array.from({ length: 18 }, (_, i) => (
                <path key={i} d={`M${rig.chest.x - rig.chestHalf + i * 5.4} ${rig.chest.y - 10} L${rig.chest.x - rig.chestHalf + i * 5.4} ${hem}`} />
              ))}
            </g>
          ))}
          {/* воротник поло */}
          <path d={`M${150 - rig.neckHalf - 3} 120 L${rig.chest.x - 5} ${rig.chest.y - 10} L${rig.chest.x + 5} ${rig.chest.y - 10} L${150 + rig.neckHalf + 3} 120 L${150 + rig.neckHalf + 5} 130 L${rig.chest.x} ${rig.chest.y + 6} L${150 - rig.neckHalf - 5} 130Z`} fill={c} {...outline} />
          <path d={`M${rig.chest.x} ${rig.chest.y + 4} L${rig.chest.x} ${rig.chest.y + 26}`} stroke="rgba(0,0,0,0.28)" strokeWidth={1} />
          {[0, 1].map((i) => (
            <circle key={i} cx={rig.chest.x} cy={rig.chest.y + 12 + i * 10} r={1.8} fill="#c9a24b" stroke="rgba(0,0,0,0.3)" strokeWidth={0.4} />
          ))}
          {knitHem(rig, c, hem)}
        </g>
      );
    },
  },
  {
    id: 'top-knit-pattern-m', name: 'Вязаный джемпер с узором', category: 'top', fit: 'm', z: 20, bbox: [70, 126, 160, 160],
    colorable: [tone('body', 'Цвет пряжи'), tone('motif', 'Цвет узора')],
    render: (_g, rig, context) => {
      const c = fabricTone(context, 'top-knit-pattern-m', 'body', '#4a4034');
      const motif = fabricTone(context, 'top-knit-pattern-m', 'motif', '#d9c39a');
      const hem = rig.waist.y + 24;
      return (
        <g>
          {sleeves(rig, c, 24, { cuff: true, cuffColor: c })}
          <path d={torsoPath(rig, { hem, hemHalf: rig.hipHalf + 2, chestEase: 1.08, waistEase: 1.12, neckDrop: 128 })} fill={c} {...outline} />
          {fabricPattern(rig, hem, (
            <g>
              {/* северный узор: зигзаг и ромбы */}
              <path d={`M${rig.chest.x - rig.chestHalf} ${rig.chest.y + 26} l11 -8 l11 8 l11 -8 l11 8 l11 -8 l11 8 l11 -8 l11 8`} fill="none" stroke={motif} strokeWidth={2.4} />
              {Array.from({ length: 4 }, (_, i) => {
                const x = rig.chest.x - 27 + i * 18;
                const y = rig.chest.y + 58;
                return (
                  <g key={i}>
                    <path d={`M${x} ${y - 8} L${x + 8} ${y} L${x} ${y + 8} L${x - 8} ${y}Z`} fill="none" stroke={motif} strokeWidth={1.8} />
                    <circle cx={x} cy={y} r={1.5} fill={motif} />
                  </g>
                );
              })}
              <path d={`M${rig.chest.x - rig.chestHalf} ${hem - 22} L${rig.chest.x + rig.chestHalf} ${hem - 22}`} stroke={motif} strokeWidth={2.4} />
              <path d={`M${rig.chest.x - rig.chestHalf} ${hem - 16} L${rig.chest.x + rig.chestHalf} ${hem - 16}`} stroke={motif} strokeWidth={1.2} strokeDasharray="3 3" />
            </g>
          ))}
          <path d={`M${150 - rig.neckHalf - 2} 122 Q150 134 ${150 + rig.neckHalf + 2} 122`} fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth={3.4} />
          {knitHem(rig, c, hem)}
        </g>
      );
    },
  },
  {
    id: 'top-hunting-jacket', name: 'Охотничья куртка', category: 'top', fit: 'm', z: 40, bbox: [66, 120, 168, 200],
    colorable: [tone('body', 'Цвет сукна')],
    render: (_g, rig, context) => {
      const c = fabricTone(context, 'top-hunting-jacket', 'body', '#5c5a3a');
      const dark = darken(c, 16);
      const hem = rig.hips[0].y + 16;
      return (
        <g>
          {topBody(rig, '#e4ddca', { hem: rig.waist.y + 20, ease: 1.0, neck: 130, sleeveW: 23, short: 0.44 })}
          {sleeves(rig, c, 27, { cuff: true, cuffColor: dark })}
          {/* куртка с множеством карманов */}
          <path d={torsoPath(rig, { hem, hemHalf: rig.hipHalf + 16, chestEase: 1.2, waistEase: 1.44, hipEase: 1.2, neckDrop: 128 })} fill={c} {...outline} />
          {/* шалевый воротник: лежит по плечам от основания шеи, не задирается выше ворота */}
          <path d={`M${150 - rig.neckHalf - 7} 116 L${rig.chest.x - 18} ${rig.chest.y - 10} Q${rig.chest.x - rig.chestHalf * 0.92} ${rig.chest.y + 4} ${rig.chest.x - rig.chestHalf * 0.8} ${rig.chest.y + 22} L${rig.chest.x - 4} ${rig.chest.y + 14} L${rig.chest.x + 3} ${rig.chest.y - 4} L${150 - rig.neckHalf - 2} 124 Z`} fill={dark} {...outline} />
          <path d={`M${150 + rig.neckHalf + 7} 116 L${rig.chest.x + 18} ${rig.chest.y - 10} Q${rig.chest.x + rig.chestHalf * 0.92} ${rig.chest.y + 4} ${rig.chest.x + rig.chestHalf * 0.8} ${rig.chest.y + 22} L${rig.chest.x + 4} ${rig.chest.y + 14} L${rig.chest.x - 3} ${rig.chest.y - 4} L${150 + rig.neckHalf + 2} 124 Z`} fill={dark} {...outline} />
          {/* планка с роговыми пуговицами */}
          <path d={`M${rig.chest.x} ${rig.chest.y + 12} L${rig.chest.x} ${hem - 8}`} stroke="rgba(0,0,0,0.3)" strokeWidth={1.2} fill="none" />
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <circle cx={rig.chest.x} cy={rig.chest.y + 40 + i * 34} r={3} fill={darken(c, 45)} stroke="#17100a" strokeWidth={0.6} />
              <circle cx={rig.chest.x - 0.8} cy={rig.chest.y + 39.2} r={0.9} fill="#8a7358" opacity={0.8} />
            </g>
          ))}
          {/* четыре накладных кармана с клапанами */}
          {[-1, 1].map((s) => [0, 1].map((row) => (
            <g key={`${s}-${row}`}>
              <rect x={rig.chest.x + s * 26 - 11} y={rig.chest.y + 26 + row * 44} width={22} height={20} rx={1.5} fill="none" stroke="rgba(0,0,0,0.34)" strokeWidth={1.1} />
              <rect x={rig.chest.x + s * 26 - 11} y={rig.chest.y + 26 + row * 44 - 5} width={22} height={6} rx={1} fill={c} stroke="rgba(0,0,0,0.34)" strokeWidth={0.9} />
              <circle cx={rig.chest.x + s * 26} cy={rig.chest.y + 26 + row * 44 - 2} r={1.1} fill="#2e2114" />
            </g>
          )))}
          {/* кожаные усилители на плечах */}
          {[-1, 1].map((s) => (
            <path key={s} d={`M${rig.chest.x + s * (rig.neckHalf + 3)} 122 L${rig.chest.x + s * rig.chestHalf} ${rig.chest.y - 6}`} stroke={darken(c, 34)} strokeWidth={5} strokeLinecap="round" fill="none" />
          ))}
          {fabricPattern(rig, hem, <path d={`M${rig.chest.x - rig.chestHalf - 8} 156 L${rig.chest.x + rig.chestHalf + 8} 156`} stroke="rgba(255,255,255,0.14)" strokeWidth={1.4} />)}
        </g>
      );
    },
  },
  {
    id: 'top-leather-jacket-m', name: 'Куртка из кожи', category: 'top', fit: 'm', z: 40, bbox: [66, 118, 168, 210],
    colorable: topTone('Цвет кожи'),
    render: (_g, rig, context) => {
      const c = fabricTone(context, 'top-leather-jacket-m', 'body', '#2f241f');
      const dark = darken(c, 28);
      const hem = rig.waist.y + 26;
      return (
        <g>
          {topBody(rig, '#e6e0d2', { hem: rig.waist.y + 18, ease: 1.0, neck: 130, sleeveW: 22, short: 0.44 })}
          {sleeves(rig, c, 28, { cuff: true, cuffColor: dark })}
          <path d={torsoPath(rig, { hem, hemHalf: rig.waistHalf + 12, chestEase: 1.2, waistEase: 1.3, hipEase: 1.14, neckDrop: 128 })} fill={c} {...outline} />
          {leatherGloss(rig, hem)}
          {/* асимметричная молния «косуха» */}
          <path d={`M${rig.chest.x + 4} ${rig.chest.y + 8} L${rig.waist.x - 12} ${hem - 8}`} stroke="#c9c4b4" strokeWidth={2.2} strokeDasharray="2.2 1.5" fill="none" />
          <circle cx={rig.waist.x - 12} cy={hem - 8} r={2.2} fill="#c9a24b" stroke="#6a4a1e" strokeWidth={0.5} />
          {/* широкие лацканы */}
          <path d={`M${rig.chest.x + 4} ${rig.chest.y + 4} L${150 + rig.neckHalf + 8} 116 L${150 + rig.neckHalf + 2} 140 L${rig.chest.x + rig.chestHalf * 0.66} ${rig.chest.y + 30} L${rig.chest.x + 4} ${rig.chest.y + 22} Z`} fill={dark} {...outline} />
          {/* косой шалевый воротник слева */}
          <path d={`M${rig.chest.x - 4} ${rig.chest.y - 2} L${150 - rig.neckHalf - 9} 116 L${150 - rig.neckHalf - 2} 144 L${rig.chest.x - rig.chestHalf * 0.5} ${rig.chest.y + 40} L${rig.chest.x - 4} ${rig.chest.y + 24} Z`} fill={dark} {...outline} />
          {/* пояс и карманы */}
          <rect x={rig.waist.x - rig.waistHalf - 12} y={hem - 13} width={(rig.waistHalf + 12) * 2} height={13} rx={2} fill={dark} {...outline} />
          <rect x={rig.waist.x - 5} y={hem - 11} width={10} height={9} rx={1} fill="#c9a24b" stroke="rgba(0,0,0,0.5)" strokeWidth={0.6} />
          {[-1, 1].map((s) => (
            <path key={s} d={`M${rig.waist.x + s * 28} ${rig.waist.y + 2} L${rig.waist.x + s * 28 + s * 10} ${rig.waist.y + 14}`} stroke="#c9c4b4" strokeWidth={1.8} strokeDasharray="1.6 1.2" fill="none" />
          ))}
        </g>
      );
    },
  },
  {
    id: 'top-rubber-cape-m', name: 'Плащ из резины', category: 'dress', fit: 'm', z: 43, bbox: [56, 108, 188, 470],
    colorable: [tone('rubber', 'Цвет резины')],
    render: (_g, rig, context) => {
      const c = fabricTone(context, 'top-rubber-cape-m', 'rubber', '#31393c');
      const hem = 504;
      return (
        <g>
          {topBody(rig, '#d9d2c2', { hem: rig.waist.y + 14, ease: 1.0, neck: 130, sleeveW: 22, short: 0.44 })}
          {/* глухой капюшон */}
          <path d={`M${150 - rig.neckHalf - 12} 122 Q150 100 ${150 + rig.neckHalf + 12} 122 Q150 148 ${150 - rig.neckHalf - 12} 122Z`} fill={c} {...outline} />
          <path d={`M${150 - rig.neckHalf - 9} 122 Q150 106 ${150 + rig.neckHalf + 9} 122`} stroke="rgba(255,255,255,0.16)" strokeWidth={2} fill="none" />
          {/* плащ-дождевик */}
          <path d={torsoPath(rig, { hem, hemHalf: rig.hipHalf + 30, chestEase: 1.36, waistEase: 1.6, shoulderEase: 12, hipEase: 1.42, neckDrop: 130 })} fill={c} {...outline} />
          {fabricPattern(rig, hem, (
            <g fill="none" strokeLinecap="round">
              <path d={`M${rig.chest.x - rig.chestHalf * 0.6} ${rig.chest.y + 4} L${rig.chest.x - rig.chestHalf * 0.72} ${hem - 22}`} stroke="rgba(255,255,255,0.28)" strokeWidth={5} />
              <path d={`M${rig.chest.x + rig.chestHalf * 0.7} ${rig.chest.y + 14} L${rig.chest.x + rig.chestHalf * 0.6} ${hem - 18}`} stroke="rgba(255,255,255,0.17)" strokeWidth={4} />
            </g>
          ))}
          {/* металлические пряжки и центральная застёжка */}
          <path d={`M${rig.chest.x - 4} ${rig.chest.y + 16} L${rig.chest.x - 4} ${hem - 14}`} stroke="#14181a" strokeWidth={3} fill="none" />
          {Array.from({ length: 6 }, (_, i) => (
            <rect key={i} x={rig.chest.x - 9} y={rig.chest.y + 28 + i * 54} width={10} height={5} rx={1} fill="#c9a24b" stroke="rgba(0,0,0,0.5)" strokeWidth={0.5} />
          ))}
        </g>
      );
    },
  },
  {
    id: 'top-overcoat', name: 'Шинель', category: 'dress', fit: 'm', z: 42, bbox: [60, 110, 180, 420],
    render: (_g, rig) => (
      <g>
        {neckBand(rig, '#4a4f43', { height: 112, drop: 130 })}
        {sleeves(rig, '#5a5f52', 29, { cuff: true, cuffColor: '#4a4f43' })}
        <path d={torsoPath(rig, { hem: 508, hemHalf: rig.hipHalf + 18, chestEase: 1.2, waistEase: 1.22, hipEase: 1.18, neckDrop: 130 })} fill="#5a5f52" {...outline} />
        <path d={`M${150 - rig.neckHalf - 7} 117 L${150 - rig.neckHalf - 1} 137 L${150 - rig.neckHalf + 8} 131 L${150 - rig.neckHalf + 4} 117 Z M${150 + rig.neckHalf + 7} 117 L${150 + rig.neckHalf + 1} 137 L${150 + rig.neckHalf - 8} 131 L${150 + rig.neckHalf - 4} 117 Z`} fill="#4a4f43" {...outline} />
        <path d={`M${rig.chest.x} 138 L${rig.waist.x - 2} ${rig.hips[0].y + 30}`} stroke="rgba(0,0,0,0.25)" strokeWidth={1.2} fill="none" />
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <circle cx={rig.chest.x - 11} cy={152 + i * 34} r={3} fill="#8a8a80" stroke="rgba(0,0,0,0.4)" strokeWidth={0.5} />
            <circle cx={rig.chest.x + 11} cy={152 + i * 34} r={3} fill="#8a8a80" stroke="rgba(0,0,0,0.4)" strokeWidth={0.5} />
          </g>
        ))}
        {belt(rig, '#4a3a26', '#8a8a84')}
        <path d={`M${rig.chest.x - rig.chestHalf * 1.1} ${rig.hips[0].y + 24} L${rig.chest.x - rig.chestHalf * 1.1 + 20} ${rig.hips[0].y + 24} M${rig.chest.x + rig.chestHalf * 1.1 - 20} ${rig.hips[0].y + 24} L${rig.chest.x + rig.chestHalf * 1.1} ${rig.hips[0].y + 24}`} stroke="rgba(0,0,0,0.3)" strokeWidth={1.4} />
      </g>
    ),
  },
  {
    id: 'top-labcoat', name: 'Белый халат', category: 'dress', fit: 'both', z: 41, bbox: [60, 110, 180, 330],
    render: (_g, rig) => (
      <g>
        {neckBand(rig, '#e2dfd2', { height: 116, drop: 130 })}
        {sleeves(rig, '#f2f0e8', 27, { cuff: true, cuffColor: '#e2dfd2', capPad: 1 })}
        <path d={torsoPath(rig, { hem: 428, hemHalf: rig.hipHalf + 12, chestEase: 1.16, waistEase: 1.16, hipEase: 1.12, neckDrop: 130 })} fill="#f2f0e8" {...outline} />
        <path d={`M${150 - rig.neckHalf - 3} 122 L${rig.chest.x} ${rig.chest.y - 6} L${150 + rig.neckHalf + 3} 122 L${150 + rig.neckHalf + 6} 129 L${rig.chest.x} ${rig.chest.y + 2} L${150 - rig.neckHalf - 6} 129 Z`} fill="#fbfaf4" {...outline} />
        <path d={`M${rig.chest.x} ${rig.chest.y + 2} L${rig.chest.x - rig.chestHalf * 0.8} ${rig.chest.y + 40} L${rig.chest.x - 4} ${rig.chest.y + 58} Z`} fill="#e2dfd2" {...outline} />
        <path d={`M${rig.chest.x} ${rig.chest.y + 2} L${rig.chest.x + rig.chestHalf * 0.8} ${rig.chest.y + 40} L${rig.chest.x + 4} ${rig.chest.y + 58} Z`} fill="#e2dfd2" {...outline} />
        <path d={`M${rig.waist.x - 2} ${rig.chest.y + 58} L${rig.waist.x - 3} 424`} stroke="rgba(0,0,0,0.18)" strokeWidth={1.2} fill="none" />
        {[0, 1, 2, 3].map((i) => (
          <circle key={i} cx={rig.chest.x - 7} cy={rig.chest.y + 52 + i * 30} r={2.4} fill="#c9c4b4" />
        ))}
        <path d={`M${rig.chest.x - rig.chestHalf} ${rig.waist.y + 20} L${rig.chest.x - rig.chestHalf + 18} ${rig.waist.y + 20} L${rig.chest.x - rig.chestHalf + 18} ${rig.waist.y + 40} L${rig.chest.x - rig.chestHalf} ${rig.waist.y + 40} Z M${rig.chest.x + rig.chestHalf - 18} ${rig.waist.y + 20} L${rig.chest.x + rig.chestHalf} ${rig.waist.y + 20} L${rig.chest.x + rig.chestHalf} ${rig.waist.y + 40} L${rig.chest.x + rig.chestHalf - 18} ${rig.waist.y + 40} Z`} fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth={1.2} />
      </g>
    ),
  },
  {
    id: 'top-woman-coat', name: 'Пальто женское', category: 'dress', fit: 'f', z: 42, bbox: [60, 110, 180, 430],
    colorable: [tone('wool', 'Цвет драпа')],
    render: (_g, rig, context) => {
      const c = fabricTone(context, 'top-woman-coat', 'wool', '#6b5a48');
      const dark = darken(c, 18);
      const hardware = darken(c, 42);
      const hem = 470;
      return (
        <g>
          {topBody(rig, '#e8e0d0', { hem: rig.waist.y + 12, ease: 1.0, neck: 130, sleeveW: 20, short: 0.42 })}
          {sleeves(rig, c, 27, { cuff: true, cuffColor: dark })}
          <path d={torsoPath(rig, { hem, hemHalf: rig.hipHalf + 18, chestEase: 1.18, waistEase: 1.24, hipEase: 1.2, neckDrop: 130 })} fill={c} {...outline} />
          {/* отложной воротник */}
          <path d={`M${rig.chest.x} ${rig.chest.y - 6} L${150 - rig.neckHalf - 7} 118 L${150 - rig.neckHalf - 2} 138 L${rig.chest.x - rig.chestHalf * 0.7} ${rig.chest.y + 24} L${rig.chest.x} ${rig.chest.y + 16} Z`} fill={dark} {...outline} />
          <path d={`M${rig.chest.x} ${rig.chest.y - 6} L${150 + rig.neckHalf + 7} 118 L${150 + rig.neckHalf + 2} 138 L${rig.chest.x + rig.chestHalf * 0.7} ${rig.chest.y + 24} L${rig.chest.x} ${rig.chest.y + 16} Z`} fill={dark} {...outline} />
          {/* запáх и пуговицы в ряд */}
          <path d={`M${rig.chest.x - 2} ${rig.chest.y + 16} L${rig.waist.x - 6} ${hem - 8}`} stroke="rgba(0,0,0,0.26)" strokeWidth={1.2} fill="none" />
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <circle cx={rig.chest.x - 4} cy={rig.chest.y + 44 + i * 44} r={3} fill={hardware} stroke={darken(c, 55)} strokeWidth={0.5} />
              <circle cx={rig.chest.x - 4.8} cy={rig.chest.y + 43.2} r={0.9} fill={darken(c, 8)} opacity={0.75} />
            </g>
          ))}
          {/* накладные карманы */}
          {[-1, 1].map((s) => (
            <g key={s}>
              <path d={`M${rig.waist.x + s * 22 - 12} ${rig.waist.y + 44} L${rig.waist.x + s * 22 + 12} ${rig.waist.y + 48}`} stroke="rgba(0,0,0,0.32)" strokeWidth={3.4} strokeLinecap="round" />
            </g>
          ))}
          {/* пояс с пряжкой */}
          <path d={`M${rig.waist.x - rig.waistHalf - 8} ${rig.waist.y + 2} L${rig.waist.x + rig.waistHalf + 8} ${rig.waist.y + 2} L${rig.waist.x + rig.waistHalf + 8} ${rig.waist.y + 14} L${rig.waist.x - rig.waistHalf - 8} ${rig.waist.y + 14} Z`} fill={c} {...outline} />
          <rect x={rig.waist.x - 6} y={rig.waist.y + 1} width={12} height={13} rx={1.5} fill={hardware} stroke={darken(c, 55)} strokeWidth={0.7} />
          <rect x={rig.waist.x - 3} y={rig.waist.y + 4} width={6} height={7} rx={1} fill="none" stroke="#c9a24b" strokeWidth={1.1} />
          {fabricPattern(rig, hem, <path d={`M${rig.chest.x - rig.chestHalf - 8} ${160} L${rig.chest.x + rig.chestHalf + 8} 160`} stroke="rgba(255,255,255,0.14)" strokeWidth={1.6} />)}
        </g>
      );
    },
  },
  {
    id: 'top-loose-coat', name: 'Пальто неприталенное', category: 'dress', fit: 'f', z: 42, bbox: [60, 110, 180, 440],
    colorable: [tone('wool', 'Цвет драпа')],
    render: (_g, rig, context) => {
      const c = fabricTone(context, 'top-loose-coat', 'wool', '#8a8478');
      const dark = darken(c, 18);
      const hem = 486;
      return (
        <g>
          {topBody(rig, '#e8e0d0', { hem: rig.waist.y + 12, ease: 1.0, neck: 130, sleeveW: 20, short: 0.42 })}
          {sleeves(rig, c, 30, { cuff: true, cuffColor: dark })}
          {/* прямой мешковатый силуэт: талия не заужена */}
          <path d={torsoPath(rig, { hem, hemHalf: rig.hipHalf + 24, chestEase: 1.3, waistEase: 1.62, hipEase: 1.34, neckDrop: 130 })} fill={c} {...outline} />
          {/* круглый воротник-хомут */}
          <path d={`M${150 - rig.neckHalf - 3} 124 Q150 142 ${150 + rig.neckHalf + 3} 124 L${150 + rig.neckHalf + 5} 118 Q150 134 ${150 - rig.neckHalf - 5} 118Z`} fill={dark} {...outline} />
          {/* потайная застёжка и петли */}
          <path d={`M${rig.chest.x} ${rig.chest.y + 12} L${rig.chest.x} ${hem - 10}`} stroke="rgba(0,0,0,0.2)" strokeWidth={1.1} fill="none" />
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={rig.chest.x + 6} cy={rig.chest.y + 54 + i * 54} r={2.6} fill={darken(c, 42)} stroke="rgba(0,0,0,0.3)" strokeWidth={0.5} />
          ))}
          {/* боковые прорезные карманы */}
          {[-1, 1].map((s) => (
            <path key={s} d={`M${rig.waist.x + s * (rig.waistHalf - 6)} ${rig.waist.y + 46} q${s * 6} 10 ${s * 4} 22`} stroke="rgba(0,0,0,0.3)" strokeWidth={3} fill="none" strokeLinecap="round" />
          ))}
          {fabricPattern(rig, hem, (
            <g stroke="rgba(0,0,0,0.09)" strokeWidth={1} fill="none">
              {Array.from({ length: 8 }, (_, i) => (
                <path key={i} d={`M${rig.chest.x - rig.chestHalf - 10} ${150 + i * 42} L${rig.chest.x + rig.chestHalf + 10} ${148 + i * 42}`} />
              ))}
            </g>
          ))}
        </g>
      );
    },
  },
  {
    id: 'top-rubber-cape', name: 'Плащ из резины', category: 'dress', fit: 'f', z: 43, bbox: [56, 108, 188, 460],
    colorable: [tone('rubber', 'Цвет резины')],
    render: (_g, rig, context) => {
      const c = fabricTone(context, 'top-rubber-cape', 'rubber', '#2c3a38');
      const hem = 500;
      return (
        <g>
          {topBody(rig, '#d9d2c2', { hem: rig.waist.y + 12, ease: 1.0, neck: 130, sleeveW: 20, short: 0.42 })}
          {/* широкий глухой капюшон-ворот */}
          <path d={`M${150 - rig.neckHalf - 10} 124 Q150 104 ${150 + rig.neckHalf + 10} 124 Q150 148 ${150 - rig.neckHalf - 10} 124Z`} fill={c} {...outline} />
          <path d={`M${150 - rig.neckHalf - 8} 124 Q150 110 ${150 + rig.neckHalf + 8} 124`} stroke="rgba(255,255,255,0.16)" strokeWidth={2} fill="none" />
          {/* непромокаемый плащ-накидка */}
          <path d={torsoPath(rig, { hem, hemHalf: rig.hipHalf + 30, chestEase: 1.38, waistEase: 1.66, shoulderEase: 12, hipEase: 1.44, neckDrop: 130 })} fill={c} {...outline} />
          {/* резиновый блеск */}
          {fabricPattern(rig, hem, (
            <g fill="none" strokeLinecap="round">
              <path d={`M${rig.chest.x - rig.chestHalf * 0.6} ${rig.chest.y + 4} L${rig.chest.x - rig.chestHalf * 0.72} ${hem - 20}`} stroke="rgba(255,255,255,0.3)" strokeWidth={5} />
              <path d={`M${rig.chest.x + rig.chestHalf * 0.7} ${rig.chest.y + 14} L${rig.chest.x + rig.chestHalf * 0.6} ${hem - 16}`} stroke="rgba(255,255,255,0.18)" strokeWidth={4} />
              <path d={`M${rig.chest.x - 8} ${rig.chest.y + 20} L${rig.chest.x - 12} ${hem - 30}`} stroke="rgba(255,255,255,0.12)" strokeWidth={3} />
            </g>
          ))}
          {/* застёжка-панты и пряжки */}
          <path d={`M${rig.chest.x - 4} ${rig.chest.y + 16} L${rig.chest.x - 4} ${hem - 12}`} stroke="#14181a" strokeWidth={3} fill="none" />
          {Array.from({ length: 6 }, (_, i) => (
            <rect key={i} x={rig.chest.x - 8} y={rig.chest.y + 26 + i * 52} width={9} height={5} rx={1} fill="#c9a24b" stroke="rgba(0,0,0,0.5)" strokeWidth={0.5} />
          ))}
        </g>
      );
    },
  },
  {
    id: 'top-goebbels-trench', name: 'Тренчкот рейхсминистра (Женева 1933)', category: 'dress', fit: 'both', z: 42, bbox: [60, 110, 180, 420],
    render: (_g, rig) => {
      const cx = rig.chest.x;
      const wy = rig.waist.y;
      return (
        <g data-goebbels-trench>
          {neckBand(rig, '#bca98a', { height: 114, drop: 130, trim: '#8c7a5e' })}
          {sleeves(rig, '#d2c2a4', 27, { cuff: true, cuffColor: '#bca98a', capPad: 2 })}
          <path d={torsoPath(rig, { hem: 485, hemHalf: rig.hipHalf + 16, chestEase: 1.18, waistEase: 1.2, hipEase: 1.15, neckDrop: 130 })} fill="#d2c2a4" {...outline} />
          {/* Широкие лацканы тренчкота */}
          <path d={`M${150 - rig.neckHalf - 5} 122 L${cx - 16} 136 L${cx - rig.chestHalf * 0.9} 168 L${cx - 8} 190 Z`} fill="#bca98a" {...outline} />
          <path d={`M${150 + rig.neckHalf + 5} 122 L${cx + 16} 136 L${cx + rig.chestHalf * 0.9} 168 L${cx + 8} 190 Z`} fill="#bca98a" {...outline} />
          {/* Штормовой клапан (gun flap) справа */}
          <path d={`M${cx + 4} 142 L${cx + 28} 142 L${cx + 22} 182 L${cx + 2} 176 Z`} fill="#c5b496" stroke="rgba(0,0,0,0.3)" strokeWidth={0.7} />
          <circle cx={cx + 14} cy={176} r={1.6} fill="#4a3822" />
          {/* Эполеты */}
          {epaulettes(rig, '#bca98a', undefined, '#4a3822')}
          {/* Двубортный ряд пуговиц */}
          {[164, 196, 228, 290, 324].map((y) => (
            <g key={y}>
              <circle cx={cx - 12} cy={y} r={2.8} fill="#3a2a1a" stroke="#22160a" strokeWidth={0.5} />
              <circle cx={cx - 12.8} cy={y - 0.8} r={0.8} fill="#8a6e4e" opacity={0.7} />
              <circle cx={cx + 12} cy={y} r={2.8} fill="#3a2a1a" stroke="#22160a" strokeWidth={0.5} />
              <circle cx={cx + 11.2} cy={y - 0.8} r={0.8} fill="#8a6e4e" opacity={0.7} />
            </g>
          ))}
          {/* Широкий пояс с пряжкой */}
          <path d={`M${rig.waist.x - rig.waistHalf - 7} ${wy - 3} L${rig.waist.x + rig.waistHalf + 7} ${wy - 3} L${rig.waist.x + rig.waistHalf + 7} ${wy + 9} L${rig.waist.x - rig.waistHalf - 7} ${wy + 9} Z`} fill="#bca98a" {...outline} />
          <rect x={rig.waist.x - 7} y={wy - 4.5} width={14} height={12} rx={1.5} fill="#4a3822" stroke="rgba(0,0,0,0.5)" strokeWidth={0.7} />
          <rect x={rig.waist.x - 4} y={wy - 2} width={8} height={7} rx={1} fill="none" stroke="#bca98a" strokeWidth={1.2} />
          <path d={`M${rig.waist.x + 8} ${wy + 9} L${rig.waist.x + 6} ${wy + 48} L${rig.waist.x + 16} ${wy + 48} L${rig.waist.x + 18} ${wy + 9} Z`} fill="#bca98a" {...outline} />
          {/* Карманы */}
          <path d={`M${cx - rig.chestHalf * 0.9} ${wy + 32} L${cx - rig.chestHalf * 0.9 + 18} ${wy + 42}`} stroke="#4a3822" strokeWidth={2.5} strokeLinecap="round" />
          <path d={`M${cx + rig.chestHalf * 0.9} ${wy + 32} L${cx + rig.chestHalf * 0.9 - 18} ${wy + 42}`} stroke="#4a3822" strokeWidth={2.5} strokeLinecap="round" />
        </g>
      );
    },
  },

  /* ===== НИЗ (женский) ===== */
  {
    id: 'bot-pencil', name: 'Юбка-карандаш', category: 'bottom', fit: 'f', z: 30, bbox: [96, 240, 108, 210],
    render: (_g, rig) => (
      <g>
        <path d={skirtPath(rig, { hem: 438, flare: 0, pencil: true })} fill="#5c5a5a" {...outline} />
        <rect x={rig.waist.x - rig.waistHalf - 4} y={rig.waist.y + 2} width={(rig.waistHalf + 4) * 2} height={9} fill="#454343" />
        <path d={`M${rig.crotch.x} 402 L${rig.crotch.x} 436`} stroke="rgba(0,0,0,0.4)" strokeWidth={1.5} />
        <circle cx={rig.waist.x} cy={rig.waist.y + 6} r={2.5} fill="#c9a24b" />
      </g>
    ),
  },
  {
    id: 'bot-aline', name: 'Юбка в складку', category: 'bottom', fit: 'f', z: 30, bbox: [80, 240, 140, 220],
    render: (_g, rig) => (
      <g>
        <path d={skirtPath(rig, { hem: 448, flare: 62 })} fill="#2c3a5c" {...outline} />
        {[-3, -2, -1, 0, 1, 2, 3].map((i) => (
          <path key={i} d={`M${rig.waist.x + i * (rig.waistHalf * 0.3)} ${rig.waist.y + 10} L${rig.crotch.x + i * 19} 446`} stroke="rgba(0,0,0,0.3)" strokeWidth={1} />
        ))}
        <rect x={rig.waist.x - rig.waistHalf - 4} y={rig.waist.y + 2} width={(rig.waistHalf + 4) * 2} height={9} fill="#1e2a45" />
      </g>
    ),
  },
  {
    id: 'bot-marlene', name: 'Широкие брюки «Марлен»', category: 'bottom', fit: 'f', z: 30, bbox: [84, 240, 132, 350],
    render: (_g, rig) => (
      <g>
        {trousers(rig, '#d9cfb8', { waistband: '#b4a98e', thighEase: 13, shinEase: 12, crease: true })}
      </g>
    ),
  },
  {
    id: 'bot-dirndl', name: 'Юбка дирндля с фартуком', category: 'bottom', fit: 'f', z: 30, bbox: [78, 240, 144, 226],
    render: (_g, rig) => (
      <g>
        <path d={skirtPath(rig, { hem: 452, flare: 68 })} fill="#a63a3a" {...outline} />
        <path d={skirtPath(rig, { hem: 440, flare: 40 })} fill="#f8f2e4" opacity={0.94} {...outline} />
        <rect x={rig.waist.x - rig.waistHalf - 5} y={rig.waist.y} width={(rig.waistHalf + 5) * 2} height={8} fill="#f8f2e4" {...outline} />
        <path d={`M${rig.waist.x + 18} ${rig.waist.y + 8} L${rig.waist.x + 10} ${rig.waist.y + 30} L${rig.waist.x + 26} ${rig.waist.y + 26} Z M${rig.waist.x + 18} ${rig.waist.y + 8} L${rig.waist.x + 32} ${rig.waist.y + 26} L${rig.waist.x + 36} ${rig.waist.y + 16} Z`} fill="#f8f2e4" {...outline} />
        {[-1, 0, 1].map((i) => (
          <path key={i} d={`M${rig.crotch.x + i * 16} ${rig.waist.y + 24} L${rig.crotch.x + i * 22} 430`} stroke="rgba(0,0,0,0.1)" strokeWidth={1} />
        ))}
      </g>
    ),
  },

  /* ===== НИЗ (женский), новая коллекция ===== */
  {
    id: 'bot-akline', name: 'Юбка-клёш (А-силуэт)', category: 'bottom', fit: 'f', z: 30, bbox: [70, 240, 160, 240],
    colorable: [tone('cloth', 'Цвет ткани')],
    render: (_g, rig, context) => {
      const c = fabricTone(context, 'bot-akline', 'cloth', '#4a5a62');
      const hem = 456;
      const d = skirtPath(rig, { hem, flare: 74 });
      return (
        <g>
          <path d={d} fill={c} {...outline} />
          {/* плавное расширение к подолу: мягкие продольные складки */}
          {fabricSkirt(rig, d, hem, (
            <g stroke="rgba(0,0,0,0.16)" strokeWidth={1} fill="none">
              {[-0.66, -0.44, -0.22, 0, 0.22, 0.44, 0.66].map((t, i) => (
                <path key={i} d={`M${rig.waist.x + t * (rig.waistHalf - 4)} ${rig.waist.y + 12} L${rig.crotch.x + t * 74} ${hem - 4}`} />
              ))}
            </g>
          ))}
          {/* пояс */}
          <rect x={rig.waist.x - rig.waistHalf - 5} y={rig.waist.y + 2} width={(rig.waistHalf + 5) * 2} height={9} fill={c} stroke="rgba(0,0,0,0.34)" strokeWidth={0.8} />
          <rect x={rig.waist.x - 4} y={rig.waist.y + 3.5} width={8} height={6} rx={1} fill="none" stroke="#c9a24b" strokeWidth={1.2} />
        </g>
      );
    },
  },
  {
    id: 'bot-maxi', name: 'Длинная юбка в пол', category: 'bottom', fit: 'f', z: 30, bbox: [70, 240, 160, 320],
    colorable: [tone('cloth', 'Цвет ткани')],
    render: (_g, rig, context) => {
      const c = fabricTone(context, 'bot-maxi', 'cloth', '#5c3a4a');
      const hem = 522;
      const d = skirtPath(rig, { hem, flare: 62 });
      return (
        <g>
          <path d={d} fill={c} {...outline} />
          {fabricSkirt(rig, d, hem, (
            <g fill="none" strokeLinecap="round">
              {/* струящиеся вертикальные складки */}
              {[-0.7, -0.5, -0.3, -0.1, 0.1, 0.3, 0.5, 0.7].map((t, i) => (
                <path key={i} d={`M${rig.waist.x + t * (rig.waistHalf - 2)} ${rig.waist.y + 14} Q${rig.crotch.x + t * 52} ${380} ${rig.crotch.x + t * 60} ${hem - 6}`} stroke="rgba(0,0,0,0.2)" strokeWidth={1.1} />
              ))}
              <path d={`M${rig.crotch.x - 40} ${hem - 24} Q${rig.crotch.x} ${hem - 12} ${rig.crotch.x + 40} ${hem - 24}`} stroke="rgba(255,255,255,0.18)" strokeWidth={4} />
              <path d={`M${rig.crotch.x - 52} ${hem - 6} Q${rig.crotch.x} ${hem + 4} ${rig.crotch.x + 52} ${hem - 6}`} stroke="rgba(0,0,0,0.32)" strokeWidth={2} />
            </g>
          ))}
          <rect x={rig.waist.x - rig.waistHalf - 5} y={rig.waist.y + 2} width={(rig.waistHalf + 5) * 2} height={9} fill={c} stroke="rgba(0,0,0,0.34)" strokeWidth={0.8} />
        </g>
      );
    },
  },
  {
    id: 'bot-gode', name: 'Юбка с клиньями (годе)', category: 'bottom', fit: 'f', z: 30, bbox: [70, 240, 160, 260],
    colorable: [tone('cloth', 'Цвет ткани')],
    render: (_g, rig, context) => {
      const c = fabricTone(context, 'bot-gode', 'cloth', '#2c3a5c');
      const hem = 470;
      const d = skirtPath(rig, { hem, flare: 68 });
      return (
        <g>
          {/* узкая по бёдрам, расклешённая клиньями книзу */}
          <path d={d} fill={c} {...outline} />
          {fabricSkirt(rig, d, hem, (
            <g>
              {/* расходящиеся клинья-годе */}
              {[-0.72, -0.36, 0, 0.36, 0.72].map((t, i) => {
                const topX = rig.waist.x + t * (rig.waistHalf - 6);
                const botX = rig.crotch.x + t * 68;
                return (
                  <g key={i}>
                    <path d={`M${topX} ${rig.waist.y + 14} L${botX} ${hem - 4}`} stroke="rgba(0,0,0,0.26)" strokeWidth={1.2} fill="none" />
                    <path d={`M${topX - 3} ${rig.waist.y + 14} L${botX - 8} ${hem - 4}`} stroke="rgba(255,255,255,0.16)" strokeWidth={1} fill="none" />
                    {/* клин-расклешение у подола */}
                    <path d={`M${botX - 11} ${hem - 6} L${botX} ${hem - 16} L${botX + 11} ${hem - 6}`} fill="rgba(0,0,0,0.14)" />
                  </g>
                );
              })}
              <path d={`M${rig.crotch.x - 62} ${hem - 4} Q${rig.crotch.x} ${hem + 4} ${rig.crotch.x + 62} ${hem - 4}`} stroke="rgba(0,0,0,0.34)" strokeWidth={2.2} fill="none" />
            </g>
          ))}
          <rect x={rig.waist.x - rig.waistHalf - 5} y={rig.waist.y + 2} width={(rig.waistHalf + 5) * 2} height={9} fill={c} stroke="rgba(0,0,0,0.34)" strokeWidth={0.8} />
        </g>
      );
    },
  },
  {
    id: 'bot-culottes', name: 'Юбки-брюки', category: 'bottom', fit: 'f', z: 30, bbox: [72, 240, 156, 260],
    colorable: [tone('cloth', 'Цвет ткани')],
    render: (_g, rig, context) => {
      const c = fabricTone(context, 'bot-culottes', 'cloth', '#7a6a52');
      const kneeY = rig.legs[0].knee.y;
      return (
        <g>
          {/* широкие брюки-юбка до середины голени */}
          {trousers(rig, c, { waistband: c, thighEase: 16, shinEase: 14, ankle: kneeY + 54, crease: true })}
          {/* мягкие складки от пояса */}
          {rig.legs.map((leg) => (
            <g key={leg.side} fill="none" strokeLinecap="round">
              <path d={`M${leg.hip.x - leg.side * 6} ${rig.waist.y + 16} L${leg.knee.x - leg.side * 10} ${kneeY + 44}`} stroke="rgba(0,0,0,0.16)" strokeWidth={1.1} />
              <path d={`M${leg.hip.x + leg.side * 8} ${rig.waist.y + 16} L${leg.knee.x + leg.side * 12} ${kneeY + 44}`} stroke="rgba(255,255,255,0.14)" strokeWidth={1.1} />
            </g>
          ))}
          {/* широкие штанины-подол с подшивкой */}
          {rig.legs.map((leg) => (
            <path key={`h${leg.side}`} d={`M${leg.ankle.x - leg.side * 20} ${kneeY + 44} L${leg.ankle.x + leg.side * 20} ${kneeY + 44}`} stroke="rgba(0,0,0,0.3)" strokeWidth={2} />
          ))}
        </g>
      );
    },
  },
  {
    id: 'bot-shorts', name: 'Шорты', category: 'bottom', fit: 'f', z: 30, bbox: [80, 250, 140, 130],
    colorable: [tone('cloth', 'Цвет ткани')],
    render: (_g, rig, context) => {
      const c = fabricTone(context, 'bot-shorts', 'cloth', '#c8b48a');
      const ankleY = rig.legs[0].knee.y - 34;
      return (
        <g>
          {/* короткие штанины: брюки автоматически обрезаются выше колена */}
          {trousers(rig, c, { waistband: c, thighEase: 9, shinEase: 6, ankle: ankleY, crease: false })}
          {/* манжеты-отвороты со строчкой */}
          {rig.legs.map((leg) => (
            <g key={leg.side}>
              <path d={`M${leg.ankle.x - leg.side * 18} ${ankleY} L${leg.ankle.x + leg.side * 18} ${ankleY}`} stroke="rgba(0,0,0,0.3)" strokeWidth={2.4} />
              <path d={`M${leg.ankle.x - leg.side * 16} ${ankleY + 5} L${leg.ankle.x + leg.side * 16} ${ankleY + 5}`} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
            </g>
          ))}
          {/* боковые карманы */}
          {[-1, 1].map((s) => (
            <path key={s} d={`M${rig.waist.x + s * (rig.waistHalf - 6)} ${rig.waist.y + 14} q${s * 5} 10 ${s * 3} 20`} stroke="rgba(0,0,0,0.3)" strokeWidth={1.4} fill="none" />
          ))}
        </g>
      );
    },
  },

  /* ===== НИЗ (мужской) ===== */
  {
    id: 'bot-wool', name: 'Шерстяные брюки', category: 'bottom', fit: 'm', z: 30, bbox: [88, 240, 124, 350],
    render: (_g, rig) => trousers(rig, '#5a5d66', { waistband: '#3a2a1e', crease: true }),
  },
  {
    id: 'bot-lederhosen', name: 'Ледерхозен', category: 'bottom', fit: 'm', z: 30, bbox: [80, 240, 140, 280],
    render: (_g, rig) => {
      const kneeY = rig.legs[0].knee.y;
      return (
        <g>
          {/* Кожаные галифе по колено */}
          {trousers(rig, '#6b4a2a', { breeches: true, thighEase: 6, shinEase: -3, ankle: kneeY + 16, inTunic: true })}
          {/* Хосенбанда: широкий кожаный пояс с металлической пряжкой */}
          <path d={`M${rig.waist.x - rig.waistHalf - 5} ${rig.waist.y} L${rig.waist.x + rig.waistHalf + 5} ${rig.waist.y} L${rig.waist.x + rig.waistHalf + 5} ${rig.waist.y + 14} L${rig.waist.x - rig.waistHalf - 5} ${rig.waist.y + 14} Z`} fill="#3a2a1a" {...outline} />
          <rect x={rig.waist.x - 7} y={rig.waist.y + 1} width={14} height={12} rx={1.5} fill="#c9a24b" stroke="rgba(0,0,0,0.5)" strokeWidth={0.7} />
          <rect x={rig.waist.x - 4.5} y={rig.waist.y + 3.5} width={9} height={7} rx={1} fill="none" stroke="rgba(60,40,20,0.7)" strokeWidth={1} />
          {/* Подвесные ремешки (hosenband) от пояса к плечам */}
          <path d={`M${rig.waist.x - 15} ${rig.waist.y + 2} L${rig.shoulders[0].x + 6} ${rig.shoulders[0].y - 2}`} stroke="#3a2a1a" strokeWidth={4.5} fill="none" />
          <path d={`M${rig.waist.x + 15} ${rig.waist.y + 2} L${rig.shoulders[1].x - 6} ${rig.shoulders[1].y - 2}`} stroke="#3a2a1a" strokeWidth={4.5} fill="none" />
          <path d={`M${rig.waist.x - 15} ${rig.waist.y + 2} L${rig.shoulders[0].x + 6} ${rig.shoulders[0].y - 2}`} stroke="rgba(255,240,220,0.18)" strokeWidth={1} fill="none" />
          <path d={`M${rig.waist.x + 15} ${rig.waist.y + 2} L${rig.shoulders[1].x - 6} ${rig.shoulders[1].y - 2}`} stroke="rgba(255,240,220,0.18)" strokeWidth={1} fill="none" />
          {/* Передний клапан (Hosenvord) с пуговицей */}
          <path d={`M${rig.waist.x - 13} ${rig.waist.y + 22} L${rig.waist.x + 13} ${rig.waist.y + 22} L${rig.waist.x + 11} ${rig.waist.y + 40} L${rig.waist.x - 11} ${rig.waist.y + 40} Z`} fill="#5a3d20" {...outline} />
          <circle cx={rig.waist.x} cy={rig.waist.y + 31} r={2.2} fill="#d9c39a" stroke="rgba(0,0,0,0.4)" strokeWidth={0.5} />
          {/* Бляха на колене */}
          <path d={`M${rig.waist.x - 5} ${rig.waist.y + 24} L${rig.waist.x + 5} ${rig.waist.y + 24} L${rig.waist.x + 4} ${rig.waist.y + 28} L${rig.waist.x} ${rig.waist.y + 31} L${rig.waist.x - 4} ${rig.waist.y + 28} Z`} fill="#c9a24b" opacity={0.85} />
          {/* Шнуровка на коленях с пряжками */}
          {rig.legs.map((leg) => (
            <g key={leg.side}>
              <path d={`M${leg.knee.x - 15} ${leg.knee.y + 8} Q${leg.knee.x} ${leg.knee.y + 20} ${leg.knee.x + 15} ${leg.knee.y + 8}`} stroke="#4a3218" strokeWidth={5} fill="none" strokeLinecap="round" />
              <path d={`M${leg.knee.x - 12} ${leg.knee.y + 9} L${leg.knee.x + 12} ${leg.knee.y + 14} M${leg.knee.x - 12} ${leg.knee.y + 14} L${leg.knee.x + 12} ${leg.knee.y + 9}`} stroke="#d9c39a" strokeWidth={1} />
              <rect x={leg.knee.x + leg.side * 12 - 2.5} y={leg.knee.y + 9.5} width={5} height={5} rx={0.8} fill="#c9a24b" stroke="rgba(0,0,0,0.45)" strokeWidth={0.5} />
            </g>
          ))}
        </g>
      );
    },
  },
  {
    id: 'bot-lederhosen-short', name: 'Ледерхозен короткие', category: 'bottom', fit: 'm', z: 30, bbox: [84, 240, 132, 150],
    render: (_g, rig) => {
      const cx = rig.waist.x;
      const wy = rig.waist.y;
      const wh = rig.waistHalf;
      const [left, right] = rig.legs;
      const crotchY = rig.crotch.y + 15;
      const leftCenter = between({ x: cx - 24, y: crotchY }, left.knee, 0.34);
      const rightCenter = between({ x: cx + 24, y: crotchY }, right.knee, 0.34);
      const fullness = Math.max(0, rig.thighBulge ?? 0) * 0.45;
      const legW = 18 + fullness;
      // Один замкнутый контур: талия, таз, обе короткие штанины и пах.
      const shortsPath = [
        `M${cx - wh - 4} ${wy + 4}`,
        `L${cx + wh + 4} ${wy + 4}`,
        `C${cx + wh + 7} ${wy + 24} ${rig.hips[1].x + 6} ${rig.hips[1].y + 2} ${rig.hips[1].x + 6} ${rig.hips[1].y + 12}`,
        `C${rig.hips[1].x + 5} ${rig.hips[1].y + 30} ${rightCenter.x + legW + 3} ${rightCenter.y - 15} ${rightCenter.x + legW} ${rightCenter.y}`,
        `Q${rightCenter.x + legW - 1} ${rightCenter.y + 8} ${rightCenter.x + legW - 7} ${rightCenter.y + 9}`,
        `Q${rightCenter.x} ${rightCenter.y + 13} ${rightCenter.x - legW * 0.72} ${rightCenter.y + 7}`,
        `C${rightCenter.x - legW * 0.72} ${rightCenter.y - 10} ${cx + 8} ${crotchY + 5} ${cx + 5} ${crotchY}`,
        `Q${cx} ${crotchY + 6} ${cx - 5} ${crotchY}`,
        `C${cx - 8} ${crotchY + 5} ${leftCenter.x + legW * 0.72} ${leftCenter.y - 10} ${leftCenter.x + legW * 0.72} ${leftCenter.y + 7}`,
        `Q${leftCenter.x} ${leftCenter.y + 13} ${leftCenter.x - legW + 7} ${leftCenter.y + 9}`,
        `Q${leftCenter.x - legW + 1} ${leftCenter.y + 8} ${leftCenter.x - legW} ${leftCenter.y}`,
        `C${leftCenter.x - legW - 3} ${leftCenter.y - 15} ${rig.hips[0].x - 5} ${rig.hips[0].y + 30} ${rig.hips[0].x - 6} ${rig.hips[0].y + 12}`,
        `C${rig.hips[0].x - 6} ${rig.hips[0].y + 2} ${cx - wh - 7} ${wy + 24} ${cx - wh - 4} ${wy + 4}Z`,
      ].join(' ');
      return (
        <g>
          <path d={shortsPath} fill="#7d5730" {...outline} />
          {/* Подгиб-манжета по низу каждой штанины */}
          <path d={`M${rightCenter.x + legW - 7} ${rightCenter.y + 9} Q${rightCenter.x} ${rightCenter.y + 13} ${rightCenter.x - legW * 0.72} ${rightCenter.y + 7}`} stroke="#5a3d20" strokeWidth={4} fill="none" strokeLinecap="round" />
          <path d={`M${leftCenter.x - legW + 7} ${leftCenter.y + 9} Q${leftCenter.x} ${leftCenter.y + 13} ${leftCenter.x + legW * 0.72} ${leftCenter.y + 7}`} stroke="#5a3d20" strokeWidth={4} fill="none" strokeLinecap="round" />
          {/* Пояс */}
          <path d={`M${cx - wh - 5} ${wy} L${cx + wh + 5} ${wy} L${cx + wh + 5} ${wy + 13} L${cx - wh - 5} ${wy + 13} Z`} fill="#4a3218" {...outline} />
          <rect x={cx - 7} y={wy + 1} width={14} height={11} rx={1.5} fill="#c9a24b" stroke="rgba(0,0,0,0.5)" strokeWidth={0.7} />
          {/* Подтяжки к плечам + нагрудная перемычка */}
          <path d={`M${cx - 14} ${wy + 2} L${rig.shoulders[0].x + 8} ${rig.shoulders[0].y - 2} M${cx + 14} ${wy + 2} L${rig.shoulders[1].x - 8} ${rig.shoulders[1].y - 2}`} stroke="#4a3218" strokeWidth={4.5} fill="none" strokeLinecap="round" />
          <path d={`M${rig.chest.x - 20} ${rig.chest.y - 10} L${rig.chest.x + 20} ${rig.chest.y - 10}`} stroke="#4a3218" strokeWidth={4} strokeLinecap="round" />
          <circle cx={rig.chest.x - 20} cy={rig.chest.y - 10} r={2} fill="#c9a24b" />
          <circle cx={rig.chest.x + 20} cy={rig.chest.y - 10} r={2} fill="#c9a24b" />
          {/* Клапан с пуговицами */}
          <path d={`M${cx - 13} ${wy + 20} L${cx + 13} ${wy + 20} L${cx + 11} ${wy + 37} L${cx - 11} ${wy + 37} Z`} fill="#6b4a26" {...outline} />
          <circle cx={cx - 7} cy={wy + 28} r={1.8} fill="#d9c39a" />
          <circle cx={cx + 7} cy={wy + 28} r={1.8} fill="#d9c39a" />
        </g>
      );
    },
  },
  {
    id: 'bot-lederhosen-black', name: 'Ледерхозен чёрные', category: 'bottom', fit: 'm', z: 30, bbox: [80, 240, 140, 280],
    render: (_g, rig) => {
      const kneeY = rig.legs[0].knee.y;
      return (
        <g>
          {trousers(rig, '#2e2721', { breeches: true, thighEase: 6, shinEase: -3, ankle: kneeY + 16, inTunic: true })}
          <path d={`M${rig.waist.x - rig.waistHalf - 5} ${rig.waist.y} L${rig.waist.x + rig.waistHalf + 5} ${rig.waist.y} L${rig.waist.x + rig.waistHalf + 5} ${rig.waist.y + 14} L${rig.waist.x - rig.waistHalf - 5} ${rig.waist.y + 14} Z`} fill="#1c1814" {...outline} />
          <rect x={rig.waist.x - 7} y={rig.waist.y + 1} width={14} height={12} rx={1.5} fill="#b9b9b2" stroke="rgba(0,0,0,0.5)" strokeWidth={0.7} />
          <path d={`M${rig.waist.x - 15} ${rig.waist.y + 2} L${rig.shoulders[0].x + 6} ${rig.shoulders[0].y - 2} M${rig.waist.x + 15} ${rig.waist.y + 2} L${rig.shoulders[1].x - 6} ${rig.shoulders[1].y - 2}`} stroke="#1c1814" strokeWidth={4.5} fill="none" />
          <path d={`M${rig.waist.x - 13} ${rig.waist.y + 22} L${rig.waist.x + 13} ${rig.waist.y + 22} L${rig.waist.x + 11} ${rig.waist.y + 40} L${rig.waist.x - 11} ${rig.waist.y + 40} Z`} fill="#3a322a" {...outline} />
          <circle cx={rig.waist.x} cy={rig.waist.y + 31} r={2.2} fill="#c9c9c4" />
          {rig.legs.map((leg) => (
            <g key={leg.side}>
              <path d={`M${leg.knee.x - 15} ${leg.knee.y + 8} Q${leg.knee.x} ${leg.knee.y + 20} ${leg.knee.x + 15} ${leg.knee.y + 8}`} stroke="#241f1a" strokeWidth={5} fill="none" strokeLinecap="round" />
              <rect x={leg.knee.x + leg.side * 12 - 2.5} y={leg.knee.y + 9.5} width={5} height={5} rx={0.8} fill="#b9b9b2" stroke="rgba(0,0,0,0.45)" strokeWidth={0.5} />
            </g>
          ))}
        </g>
      );
    },
  },
  {
    id: 'bot-lederhosen-fest', name: 'Ледерхозен праздничные', category: 'bottom', fit: 'm', z: 30, bbox: [80, 240, 140, 280],
    render: (_g, rig) => {
      const kneeY = rig.legs[0].knee.y;
      const cx = rig.waist.x;
      return (
        <g>
          {trousers(rig, '#8a6134', { breeches: true, thighEase: 7, shinEase: -3, ankle: kneeY + 16, inTunic: true })}
          {/* Зелёная вышивка по бедру */}
          {rig.legs.map((leg) => (
            <g key={leg.side} stroke="#2f5d3a" strokeWidth={1.4} fill="none">
              <path d={`M${leg.hip.x + leg.side * 10} ${leg.hip.y + 16} q${leg.side * 6} 12 0 24 q${leg.side * -6} 12 0 24`} />
              <circle cx={leg.hip.x + leg.side * 10} cy={leg.hip.y + 14} r={2} fill="#2f5d3a" />
            </g>
          ))}
          <path d={`M${cx - rig.waistHalf - 5} ${rig.waist.y} L${cx + rig.waistHalf + 5} ${rig.waist.y} L${cx + rig.waistHalf + 5} ${rig.waist.y + 14} L${cx - rig.waistHalf - 5} ${rig.waist.y + 14} Z`} fill="#4a3218" {...outline} />
          <rect x={cx - 8} y={rig.waist.y + 1} width={16} height={12} rx={1.5} fill="#c9a24b" stroke="rgba(0,0,0,0.5)" strokeWidth={0.7} />
          {/* Подтяжки к плечам */}
          <path d={`M${cx - 15} ${rig.waist.y + 2} L${rig.chest.x - 16} ${rig.chest.y - 8} L${rig.shoulders[0].x + 8} ${rig.shoulders[0].y - 2} M${cx + 15} ${rig.waist.y + 2} L${rig.chest.x + 16} ${rig.chest.y - 8} L${rig.shoulders[1].x - 8} ${rig.shoulders[1].y - 2}`} stroke="#4a3218" strokeWidth={5} fill="none" strokeLinejoin="round" />
          {/* Вышитая нагрудная пластина-перемычка соединяет подтяжки */}
          <path d={`M${rig.chest.x - 18} ${rig.chest.y - 12} L${rig.chest.x + 18} ${rig.chest.y - 12} L${rig.chest.x + 16} ${rig.chest.y} L${rig.chest.x - 16} ${rig.chest.y} Z`} fill="#5a3d20" {...outline} />
          <path d={`M${rig.chest.x - 10} ${rig.chest.y - 4} l5 -4 l5 4 l5 -4`} stroke="#2f5d3a" strokeWidth={1.5} fill="none" />
          <circle cx={rig.chest.x - 15} cy={rig.chest.y - 8} r={1.8} fill="#c9a24b" />
          <circle cx={rig.chest.x + 15} cy={rig.chest.y - 8} r={1.8} fill="#c9a24b" />
          <path d={`M${cx - 14} ${rig.waist.y + 22} L${cx + 14} ${rig.waist.y + 22} L${cx + 12} ${rig.waist.y + 42} L${cx - 12} ${rig.waist.y + 42} Z`} fill="#6b4a26" {...outline} />
          <path d={`M${cx - 7} ${rig.waist.y + 28} l4 -4 l4 4 l4 -4`} stroke="#2f5d3a" strokeWidth={1.4} fill="none" />
          <circle cx={cx} cy={rig.waist.y + 36} r={2.2} fill="#d9c39a" />
          {rig.legs.map((leg) => (
            <g key={leg.side}>
              <path d={`M${leg.knee.x - 15} ${leg.knee.y + 8} Q${leg.knee.x} ${leg.knee.y + 20} ${leg.knee.x + 15} ${leg.knee.y + 8}`} stroke="#4a3218" strokeWidth={5} fill="none" strokeLinecap="round" />
              <path d={`M${leg.knee.x - 12} ${leg.knee.y + 9} L${leg.knee.x + 12} ${leg.knee.y + 14} M${leg.knee.x - 12} ${leg.knee.y + 14} L${leg.knee.x + 12} ${leg.knee.y + 9}`} stroke="#2f5d3a" strokeWidth={1.1} />
              <rect x={leg.knee.x + leg.side * 12 - 2.5} y={leg.knee.y + 9.5} width={5} height={5} rx={0.8} fill="#c9a24b" stroke="rgba(0,0,0,0.45)" strokeWidth={0.5} />
            </g>
          ))}
        </g>
      );
    },
  },
  {
    id: 'bot-black', name: 'Чёрные брюки', category: 'bottom', fit: 'm', z: 30, bbox: [88, 240, 124, 350],
    render: (_g, rig) => trousers(rig, '#1e1c1f', { waistband: '#141215', thighEase: 6, shinEase: 3, crease: true }),
  },
  {
    id: 'bot-slim', name: 'Узкие классические', category: 'bottom', fit: 'm', z: 30, bbox: [88, 240, 124, 350],
    render: (_g, rig) => (
      <g>
        {/* Узкий крой: минимальные припуски, заужены к щиколотке */}
        {trousers(rig, '#3a3d42', { waistband: '#2c2e33', thighEase: 3, shinEase: -1, crease: true })}
      </g>
    ),
  },
  {
    id: 'bot-pleated', name: 'Брюки с защипами', category: 'bottom', fit: 'm', z: 30, bbox: [86, 240, 128, 350],
    render: (_g, rig) => (
      <g>
        {trousers(rig, '#2f3a55', { waistband: '#1b1b1f', thighEase: 11, shinEase: 6, crease: true })}
        {rig.legs.map((leg) => (
          <g key={leg.side} stroke="rgba(0,0,0,0.3)" strokeWidth={1} fill="none">
            <path d={`M${leg.hip.x - 8} ${leg.hip.y + 8} L${leg.hip.x - 7} ${leg.hip.y + 34}`} />
            <path d={`M${leg.hip.x + 8} ${leg.hip.y + 8} L${leg.hip.x + 7} ${leg.hip.y + 34}`} />
          </g>
        ))}
      </g>
    ),
  },
  {
    id: 'bot-knicker', name: 'Никербокеры', category: 'bottom', fit: 'm', z: 30, bbox: [82, 240, 136, 350],
    render: (_g, rig) => (
      <g>
        {/* Вязаные шерстяные гетры от колена до щиколотки */}
        {rig.legs.map((leg) => (
          <path key={leg.side} d={`M${leg.knee.x} ${leg.knee.y + 6} L${leg.ankle.x} ${leg.ankle.y + 4}`} stroke="#4a4a4a" strokeWidth={leg.calfWidth * 2 - 2} strokeLinecap="round" fill="none" />
        ))}
        {/* Бриджи до колена с напуском */}
        {trousers(rig, '#7d6a4e', { waistband: '#3a2a1e', breeches: true, ankle: rig.legs[0].knee.y + 14 })}
        {/* Манжета с пуговицей под коленом */}
        {rig.legs.map((leg) => (
          <g key={leg.side}>
            <path d={`M${leg.knee.x - 14} ${leg.knee.y + 8} Q${leg.knee.x} ${leg.knee.y + 16} ${leg.knee.x + 14} ${leg.knee.y + 8}`} stroke="#5c4d38" strokeWidth={5} fill="none" strokeLinecap="round" />
            <circle cx={leg.knee.x + leg.side * 11} cy={leg.knee.y + 10} r={1.8} fill="#c9a24b" />
          </g>
        ))}
      </g>
    ),
  },
  {
    id: 'bot-breeches', name: 'Галифе', category: 'bottom', fit: 'm', z: 30, bbox: [78, 240, 144, 350],
    render: (_g, rig) => trousers(rig, '#4a4636', { waistband: '#2f2a1e', breeches: true, crease: false }),
  },

  /* ===== ОБУВЬ ===== */
  { id: 'shoe-oxford', name: 'Оксфорды', category: 'shoes', fit: 'both', z: 50, bbox: [92, 552, 116, 50], render: (_g, rig) => shoes(rig, 'oxford') },
  { id: 'shoe-brogue', name: 'Двухцветные броги', category: 'shoes', fit: 'm', z: 50, bbox: [92, 552, 116, 50], render: (_g, rig) => shoes(rig, 'brogue') },
  { id: 'shoe-boot', name: 'Ботинки на шнуровке', category: 'shoes', fit: 'both', z: 50, bbox: [92, 528, 116, 74], render: (_g, rig) => shoes(rig, 'laceboot') },
  { id: 'shoe-maryjane', name: 'Мэри Джейн', category: 'shoes', fit: 'f', z: 50, bbox: [92, 552, 116, 50], render: (_g, rig) => shoes(rig, 'maryjane') },
  { id: 'shoe-tstrap', name: 'Туфли с Т-ремешком', category: 'shoes', fit: 'f', z: 50, bbox: [92, 552, 116, 50], render: (_g, rig) => shoes(rig, 'tstrap') },
  { id: 'shoe-pump', name: 'Лодочки', category: 'shoes', fit: 'f', z: 50, bbox: [92, 552, 116, 56], render: (_g, rig) => shoes(rig, 'pump') },
  { id: 'shoe-jackboot', name: 'Сапоги', category: 'shoes', fit: 'both', z: 50, bbox: [92, 440, 116, 165], render: (_g, rig) => boots(rig, '#241a12') },
  { id: 'shoe-jackboot-brown', name: 'Сапоги коричневые', category: 'shoes', fit: 'both', z: 50, bbox: [92, 440, 116, 165], render: (_g, rig) => boots(rig, '#4a3320') },
  { id: 'shoe-clog', name: 'Клогги (Нидерланды)', category: 'shoes', fit: 'both', z: 50, bbox: [90, 546, 122, 58], render: (_g, rig) => shoes(rig, 'clog') },
  { id: 'shoe-espadrille', name: 'Эспадрильи (Испания)', category: 'shoes', fit: 'both', z: 50, bbox: [90, 546, 122, 58], render: (_g, rig) => shoes(rig, 'espadrille') },
  { id: 'shoe-mule', name: 'Мюли (Франция)', category: 'shoes', fit: 'f', z: 50, bbox: [92, 548, 116, 54], render: (_g, rig) => shoes(rig, 'mule') },
  { id: 'shoe-loafer', name: 'Лоферы (Бавария)', category: 'shoes', fit: 'm', z: 50, bbox: [92, 548, 116, 54], render: (_g, rig) => shoes(rig, 'loafer') },
  { id: 'shoe-folk', name: 'Народные туфли (Австрия)', category: 'shoes', fit: 'both', z: 50, bbox: [92, 548, 116, 54], render: (_g, rig) => shoes(rig, 'folk') },
  { id: 'shoe-wedge', name: 'На шпильке-клине', category: 'shoes', fit: 'f', z: 50, bbox: [90, 546, 122, 58], render: (_g, rig) => shoes(rig, 'wedge') },
  { id: 'shoe-gladiator', name: 'Сандалии-гладиаторы', category: 'shoes', fit: 'f', z: 50, bbox: [92, 540, 116, 64], render: (_g, rig) => shoes(rig, 'gladiator') },
  { id: 'shoe-peep', name: 'Лодочки с открытым носом', category: 'shoes', fit: 'f', z: 50, bbox: [92, 542, 116, 62], render: (_g, rig) => shoes(rig, 'peep') },
  { id: 'shoe-orthopedic', name: 'Ортопедический ботинок (Геббельс)', category: 'shoes', fit: 'both', z: 50, bbox: [90, 520, 122, 90], render: (_g, rig) => shoes(rig, 'orthopedic') },
/* ===== СТРОГАЯ МУЖСКАЯ ОБУВЬ ===== */
  {
    id: 'shoe-black-oxford', name: 'Чёрные оксфорды', category: 'shoes', fit: 'm', z: 50, bbox: [92, 548, 116, 56],
    render: (_g, rig) => (
      <g>
        {shoes(rig, 'oxford')}
        {rig.legs.map((leg) => (
          <g key={leg.side} transform={leg.footTransform}>
            <path d={FOOT_OUTLINE} fill="#15151a" stroke="#000" strokeWidth={0.9} />
            <path d="M12 -2 Q18 3 20 13" fill="none" stroke="#000" strokeWidth={1.1} />
            <path d="M2 -8 L10 -3 M2 -4 L10 1 M2 0 L10 5" stroke="rgba(200,200,205,0.28)" strokeWidth={0.8} />
            <path d="M-8 4 L-2 5" stroke="#000" strokeWidth={1} />
            <path d="M-6 8 Q6 6 18 12" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth={1.4} />
          </g>
        ))}
      </g>
    ),
  },
  {
    id: 'shoe-black-balmoral', name: 'Чёрные балморалы', category: 'shoes', fit: 'm', z: 50, bbox: [92, 548, 116, 56],
    render: (_g, rig) => (
      <g>
        {rig.legs.map((leg) => (
          <g key={leg.side} transform={leg.footTransform}>
            {/* Строгий цельный союз: закрытая шнуровка под накладкой */}
            <path d={FOOT_OUTLINE} fill="#14141a" stroke="#000" strokeWidth={0.9} />
            <path d="M-8 -6 L8 -8 L9 0 L-8 1Z" fill="#0e0e12" stroke="#000" strokeWidth={0.6} />
            <path d="M-4 -5 L4 -6 M-4 -3 L4 -4" stroke="rgba(190,190,196,0.3)" strokeWidth={0.7} />
            <path d="M12 -2 Q18 3 20 13" fill="none" stroke="#000" strokeWidth={1.1} />
            <path d="M-8 4 L-2 5" stroke="#000" strokeWidth={1} />
            {/* Узкий блик по союзе — признак полированной кожи */}
            <path d="M-5 -2 Q2 -5 12 6" fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth={1.3} />
          </g>
        ))}
      </g>
    ),
  },
  {
    id: 'shoe-black-patent', name: 'Лакированные чёрные', category: 'shoes', fit: 'm', z: 50, bbox: [92, 548, 116, 58],
    render: (_g, rig) => (
      <g>
        {rig.legs.map((leg) => (
          <g key={leg.side} transform={leg.footTransform}>
            {/* Лаковая кожа: очень тёмный фон + два жёстких блика */}
            <path d={FOOT_OUTLINE} fill="#0a0a0e" stroke="#000" strokeWidth={0.9} />
            <path d="M-6 -6 Q4 -9 14 4" fill="none" stroke="#ffffff" strokeWidth={2.4} opacity={0.34} />
            <path d="M-4 2 Q6 0 17 9" fill="none" stroke="#ffffff" strokeWidth={1.2} opacity={0.22} />
            <path d="M-8 4 L-2 5" stroke="#000" strokeWidth={1} />
            <path d="M18 14 L26 17" stroke="rgba(255,255,255,0.2)" strokeWidth={1.6} />
          </g>
        ))}
      </g>
    ),
  },
  {
    id: 'shoe-black-boot', name: 'Чёрные ботинки на шнуровке', category: 'shoes', fit: 'm', z: 50, bbox: [92, 522, 116, 82],
    render: (_g, rig) => (
      <g>
        {rig.legs.map((leg) => (
          <g key={leg.side} transform={leg.footTransform}>
            <path d="M-7 -26 L7 -24 L8 4 L-8 4 Z" fill="#17171c" stroke="#000" strokeWidth={0.9} strokeLinejoin="round" />
            <path d="M-6 -22 L6 -20 M-6 -4 L6 -2" stroke="rgba(255,255,255,0.12)" strokeWidth={1.2} />
            {[-20, -15, -10, -5].map((y) => (
              <g key={y}>
                <path d={`M-4 ${y} L4 ${y + 2} M4 ${y} L-4 ${y + 2}`} stroke="rgba(180,180,188,0.4)" strokeWidth={0.85} />
                <circle cx={-4} cy={y} r={0.6} fill="rgba(190,190,196,0.6)" />
                <circle cx={4} cy={y + 2} r={0.6} fill="rgba(190,190,196,0.6)" />
              </g>
            ))}
            <path d={FOOT_OUTLINE} fill="#17171c" stroke="#000" strokeWidth={0.9} />
            <path d="M-6 8 Q6 6 18 12" fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth={1.4} />
          </g>
        ))}
      </g>
    ),
  },
  {
    id: 'shoe-black-half-boot', name: 'Полуботинки чёрные', category: 'shoes', fit: 'm', z: 50, bbox: [92, 548, 116, 56],
    render: (_g, rig) => (
      <g>
        {rig.legs.map((leg) => (
          <g key={leg.side} transform={leg.footTransform}>
            <path d={FOOT_OUTLINE} fill="#1c1c22" stroke="#000" strokeWidth={0.9} />
            {/* Тонкая союзная накладка с двумя люверсами */}
            <path d="M-7 -5 L6 -7 L7 1 L-7 2Z" fill="#13131a" stroke="#000" strokeWidth={0.5} />
            <circle cx={-4} cy={-3} r={0.8} fill="rgba(200,200,206,0.5)" />
            <circle cx={3} cy={-4} r={0.8} fill="rgba(200,200,206,0.5)" />
            <path d="M12 -2 Q18 3 20 13" fill="none" stroke="#000" strokeWidth={1.1} />
            <path d="M-8 4 L-2 5" stroke="#000" strokeWidth={1} />
            <path d="M-4 8 Q6 6 17 12" fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth={1.3} />
          </g>
        ))}
      </g>
    ),
  },

  /* ===== УНИФОРМА (мужская) ===== */
  {
    id: 'uni-goebbels-suit', name: 'Френч гауляйтера (Геббельс)', category: 'uniform', fit: 'm', z: 45, bbox: [60, 110, 180, 490],
    render: (_g, rig) => (
      <g data-goebbels-uniform>
        {tunicKit(rig, {
          shell: '#ab8248', collar: '#7d5c2e', piping: '#e8c878', trouser: '#99733e', breeches: true,
          beltLeather: '#422c19', beltBuckle: '#c9a24b', buttons: '#c9a24b', double: true,
          epaulette: { color: '#7d5c2e', piping: '#c9a24b', button: '#c9a24b' },
          collarPatch: { color: '#8a2b2b', litzen: '#c9a24b' },
          necktie: '#332014', pocketFlap: true, bootColor: '#2b1c12',
        })}
        {/* Золотой партийный значок №22 на левом кармане (знак Геббельса) */}
        <g transform={`translate(${rig.chest.x + 16} ${rig.chest.y + 24}) scale(0.68)`}>
          <circle cx={0} cy={0} r={8.5} fill="#c9a24b" stroke="#7a5a1e" strokeWidth={1} />
          <circle cx={0} cy={0} r={6.8} fill="#a03030" />
          {bandEmblem}
        </g>
        {/* Нарукавная партийная повязка с золотым кантом */}
        {armband(rig, 0, '#a03030', (
          <g>
            <path d="M-12 -6.5 L12 -6.5 M-12 6.5 L12 6.5" stroke="#c9a24b" strokeWidth={1.2} />
            {bandEmblem}
          </g>
        ))}
      </g>
    ),
  },
  {
    id: 'uni-heer', name: 'Полевой китель, пехота', category: 'uniform', fit: 'm', z: 45, bbox: [60, 110, 180, 490],
    render: (_g, rig) => tunicKit(rig, {
      shell: FG, collar: '#4e5346', trouser: '#63684f', beltLeather: '#3a2c1c',
      collarPatch: { color: '#4e5346', litzen: '#d6d2c4' },
      epaulette: { color: FG, piping: '#e8e6dd' },
      eaglePos: 'viewer-right', eagleColor: '#d6d2c4', pocketFlap: true, bootColor: '#2a1f16',
    }),
  },
  {
    id: 'uni-officer', name: 'Парадный офицерский мундир', category: 'uniform', fit: 'm', z: 45, bbox: [60, 110, 180, 490],
    render: (_g, rig) => tunicKit(rig, {
      shell: '#5f6650', collar: '#2b3040', piping: '#c9a24b', trouser: '#4a4f3e', breeches: true,
      trouserPiping: '#a03030', beltLeather: '#2f2118', beltBuckle: '#c9a24b',
      collarPatch: { color: '#2b3040', litzen: '#c9a24b' },
      epaulette: { color: '#2b3040', piping: '#c9a24b', button: '#c9a24b' },
      eaglePos: 'viewer-right', eagleColor: '#c9a24b', pocketFlap: true, buttons: '#c9a24b',
    }),
  },
  {
    id: 'uni-panzer', name: 'Куртка танкиста', category: 'uniform', fit: 'm', z: 45, bbox: [60, 110, 180, 490],
    render: (_g, rig) => tunicKit(rig, {
      shell: '#232326', collar: '#1b1b1e', piping: '#a03030', trouser: '#232326', hem: 268,
      collarPatch: { color: '#1b1b1e', litzen: '#c9c9c4' },
      hiddenPlacket: true, noBoots: false, bootColor: '#1d1610',
      eaglePos: 'viewer-right', eagleColor: '#c9c9c4', necktie: '#3a3a3e',
      cuffColor: '#1b1b1e',
    }),
  },
  {
    id: 'uni-luft', name: 'Китель авиации', category: 'uniform', fit: 'm', z: 45, bbox: [60, 110, 180, 490],
    render: (_g, rig) => tunicKit(rig, {
      shell: '#6f7a80', collar: '#5c666b', trouser: '#6f7a80', beltLeather: '#3a2c1c',
      collarPatch: { color: '#c9a24b' },
      epaulette: { color: '#5c666b', piping: '#c9c9c4' },
      eaglePos: 'viewer-right', eagleColor: '#d6d2c4', pocketFlap: true, noBoots: true,
      necktie: '#2f3a45',
    }),
  },
  {
    id: 'uni-black', name: 'Чёрный парадный мундир', category: 'uniform', fit: 'm', z: 45, bbox: [60, 110, 180, 490],
    render: (_g, rig) => tunicKit(rig, {
      shell: '#1c1c20', collar: '#141418', piping: '#c9c9c4', trouser: '#1c1c20', breeches: true,
      beltLeather: '#15100c', beltBuckle: '#c9c9c4',
      collarPatch: { color: '#141418', litzen: '#c9c9c4', runes: true },
      epaulette: { color: '#141418', piping: '#c9c9c4' },
      eaglePos: 'left-arm', eagleColor: '#c9c9c4', pocketFlap: true, buttons: '#c9c9c4',
      bootColor: '#151015',
    }),
  },
  {
    id: 'uni-brown', name: 'Коричневая партийная форма', category: 'uniform', fit: 'm', z: 45, bbox: [60, 110, 180, 490],
    render: (_g, rig) => tunicKit(rig, {
      shell: '#7a5a34', collar: '#6a4c2a', trouser: '#4a4030', breeches: true,
      beltLeather: '#4a3320', beltBuckle: '#c9a24b',
      collarPatch: { color: '#a03030' },
      necktie: '#3a2a1a', buttons: '#c9a24b', pocketFlap: true, bootColor: '#4a3320',
    }),
  },
  {
    id: 'uni-rad', name: 'Форма трудовой службы', category: 'uniform', fit: 'm', z: 45, bbox: [60, 110, 180, 490],
    render: (_g, rig) => tunicKit(rig, {
      shell: '#6b6a4a', collar: '#5a5a3e', trouser: '#6b6a4a', beltLeather: '#4a3a26',
      collarPatch: { color: '#5a5a3e', litzen: '#d6d2c4' },
      pocketFlap: true, noBoots: false, bootColor: '#3a2c1c', buttons: '#8a8a80',
    }),
  },
  {
    id: 'uni-hj', name: 'Форма юношеской организации', category: 'uniform', fit: 'm', z: 45, bbox: [60, 110, 180, 490],
    render: (_g, rig) => (
      <g>
        {tunicKit(rig, {
          shell: '#c8a878', collar: '#b89a68', trouser: '#3a3a40', hem: 262,
          beltLeather: '#2f2118', beltBuckle: '#b9b9b2', noBoots: true, buttons: '#b9b9b2',
          pocketFlap: true, sleeveW: 22,
        })}
        {neckerchief(rig, '#2c2c30', '#6b4a34')}
        {armband(rig, 0, '#a03030', bandEmblem)}
      </g>
    ),
  },

  /* ===== УНИФОРМА (женская) ===== */
  {
    id: 'uni-bdm', name: 'Форма девичьей организации', category: 'uniform', fit: 'f', z: 45, bbox: [70, 110, 160, 400],
    render: (_g, rig) => (
      <g>
        {dressKit(rig, {
          dress: '#3a4356', sleeveColor: '#f2efe6', sleevesW: 19, shortSleeve: true,
          hem: 430, flare: 54, collar: '#f2efe6', beltColor: '#3a2c1c', buckle: '#b9b9b2',
          neckerchiefColor: '#2c2c30', knotColor: '#6b4a34', socks: false,
        })}
        <path d={skirtPath(rig, { hem: 430, flare: 54 })} fill="#3a4356" {...outline} />
        {[-2, -1, 0, 1, 2].map((i) => (
          <path key={i} d={`M${rig.waist.x + i * 9} ${rig.waist.y + 12} L${rig.crotch.x + i * 18} 426`} stroke="rgba(0,0,0,0.18)" strokeWidth={1} />
        ))}
        {armband(rig, 0, '#a03030', bandEmblem)}
      </g>
    ),
  },
  {
    id: 'uni-nurse', name: 'Форма сестры милосердия', category: 'uniform', fit: 'f', z: 45, bbox: [70, 110, 160, 400],
    render: (_g, rig) => (
      <g>
        {dressKit(rig, {
          dress: '#6d7f9a', sleevesW: 20, hem: 452, flare: 58, collar: '#f6f4ec',
          apron: '#f6f4ec', buttons: '#e8e6dd', piping: '#f6f4ec',
        })}
        <g transform={`translate(${rig.chest.x - 20} ${rig.chest.y + 6})`}>
          <rect x={-6} y={-2} width={12} height={4} fill="#a03030" />
          <rect x={-2} y={-6} width={4} height={12} fill="#a03030" />
        </g>
      </g>
    ),
  },
  {
    id: 'uni-helferin', name: 'Служебный костюм связистки', category: 'uniform', fit: 'f', z: 45, bbox: [70, 110, 160, 400],
    render: (_g, rig) => (
      <g>
        {neckBand(rig, '#e6e3d6', { height: 116, drop: 130 })}
        {sleeves(rig, '#5f6650', 21, { cuff: true, cuffColor: '#4e5346' })}
        <path d={skirtPath(rig, { hem: 424, flare: 44, pencil: true })} fill="#4e5346" {...outline} />
        <path d={torsoPath(rig, { hem: rig.hips[0].y + 10, hemHalf: rig.hipHalf + 7, neckDrop: 130 })} fill="#5f6650" {...outline} />
        <path d={`M${150 - rig.neckHalf - 3} 123 L${rig.chest.x} ${rig.chest.y - 6} L${150 + rig.neckHalf + 3} 123 L${150 + rig.neckHalf + 6} 130 L${rig.chest.x} ${rig.chest.y + 2} L${150 - rig.neckHalf - 6} 130 Z`} fill="#e6e3d6" {...outline} />
        {[0, 1, 2, 3].map((i) => (
          <circle key={i} cx={rig.chest.x} cy={rig.chest.y + 20 + i * 22} r={2.2} fill="#b9b9b2" />
        ))}
        {eagle(rig.chest.x + 17, rig.chest.y - 2, 1.2, '#d6d2c4')}
        {belt(rig, '#3a2c1c', '#8a8a84')}
      </g>
    ),
  },
  {
    id: 'uni-arbeitsmaid', name: 'Рабочее платье с фартуком', category: 'uniform', fit: 'f', z: 45, bbox: [70, 110, 160, 400],
    render: (_g, rig) => dressKit(rig, {
      dress: '#7d6a4e', sleevesW: 20, shortSleeve: true, hem: 440, flare: 56,
      collar: '#efe9d8', apron: '#efe9d8', beltColor: '#4a3a26', buckle: '#8a8a80', socks: true,
    }),
  },

  /* ===== ГОЛОВНЫЕ УБОРЫ ===== */
  { id: 'head-m35', name: 'Каска M35', category: 'headgear', fit: 'both', z: 72, bbox: [94, 16, 112, 132], render: (g, _rig, context) => stahlhelm('#5f6650', 'm35', heerDecal, g, context?.face) },
  { id: 'head-m40', name: 'Каска M40', category: 'headgear', fit: 'both', z: 72, bbox: [94, 16, 112, 132], render: (g, _rig, context) => stahlhelm('#575c4c', 'm40', ssDecal, g, context?.face) },
  { id: 'head-m42', name: 'Каска M42', category: 'headgear', fit: 'both', z: 72, bbox: [94, 16, 112, 132], render: (g, _rig, context) => stahlhelm('#4e5346', 'm42', undefined, g, context?.face) },
  {
    id: 'head-schiffchen', name: 'Пилотка', category: 'headgear', fit: 'both', z: 72, bbox: [108, 24, 88, 44],
    render: () => schiffchen('#6a7059', '#5a5f4a', '#d6d2c4', eagle(160, 42, 0.85, '#d6d2c4')),
  },
  {
    id: 'head-schirm-heer', name: 'Фуражка полевая', category: 'headgear', fit: 'both', z: 72, bbox: [104, 20, 92, 52],
    render: () => schirmmutze('#6a7059', '#3a4038', '#e8e6dd', '#c9c9c4', <>{eagle(150, 34, 0.95, '#d6d2c4')}{wreathBadge(150, 52, 6, 5, '#d6d2c4', <circle cx={150} cy={52} r={2.2} fill="#a03030" />)}</>),
  },
  {
    id: 'head-schirm-officer', name: 'Фуражка офицерская', category: 'headgear', fit: 'both', z: 72, bbox: [104, 20, 92, 52],
    render: () => schirmmutze('#78806a', '#2b3040', '#c9a24b', '#c9a24b', <>{eagle(150, 34, 1, '#c9a24b')}{wreathBadge(150, 52, 6.5, 5, '#c9a24b', <circle cx={150} cy={52} r={2.2} fill="#a03030" />)}</>),
  },
  {
    id: 'head-schirm-white', name: 'Фуражка с белым верхом', category: 'headgear', fit: 'both', z: 72, bbox: [104, 20, 92, 52],
    render: () => schirmmutze('#f2efe6', '#2b3040', '#c9a24b', '#c9a24b', <>{eagle(150, 34, 1, '#c9a24b')}{wreathBadge(150, 52, 6.5, 5, '#c9a24b', <circle cx={150} cy={52} r={2.2} fill="#a03030" />)}</>, true),
  },
  {
    id: 'head-schirm-black', name: 'Фуражка чёрная', category: 'headgear', fit: 'both', z: 72, bbox: [104, 20, 92, 52],
    render: () => schirmmutze('#1c1c20', '#141418', '#c9c9c4', '#c9c9c4', <>{eagle(150, 34, 0.95, '#c9c9c4')}{wreathBadge(150, 52, 6, 5, '#c9c9c4', <circle cx={150} cy={52} r={2} fill="#1c1c20" />)}</>),
  },
  {
    id: 'head-fedora', name: 'Федора', category: 'headgear', fit: 'both', z: 72, bbox: [94, 4, 112, 70],
    colorable: [FEDORA_BAND],
    render: (_g, _rig, context) => fedora('#4a4a4a', fedoraBand(context)),
  },
  {
    id: 'head-fedora-white', name: 'Федора белая', category: 'headgear', fit: 'm', z: 72, bbox: [94, 4, 112, 70],
    colorable: [FEDORA_BAND],
    render: (_g, _rig, context) => fedora('#e9e4d6', fedoraBand(context)),
  },
  {
    id: 'head-wide-brim', name: 'Шляпа с широкими полями', category: 'headgear', fit: 'f', z: 72, bbox: [84, 4, 132, 78],
    colorable: [tone('felt', 'Цвет фетра')],
    render: (_g, _rig, context) => {
      const c = fabricTone(context, 'head-wide-brim', 'felt', '#3f3a44');
      return (
        <g>
          {/* широкие мягкие поля */}
          <ellipse cx={150} cy={58} rx={62} ry={13} fill={c} {...outline} />
          <path d="M92 58 Q150 50 208 58 Q200 68 150 70 Q100 68 92 58Z" fill="rgba(0,0,0,0.22)" />
          <path d="M96 60 Q150 52 204 60" stroke="rgba(255,255,255,0.16)" strokeWidth={1.6} fill="none" />
          {/* низкая тулья */}
          <path d="M114 58 Q116 18 150 14 Q184 18 186 58 Q150 48 114 58Z" fill={c} {...outline} />
          <path d="M122 20 Q150 34 178 20" stroke="rgba(255,255,255,0.14)" strokeWidth={1.6} fill="none" />
          {/* лента */}
          <path d="M114 50 Q150 40 186 50 L186 58 Q150 48 114 58Z" fill="#1c1a18" {...outline} />
          <circle cx={176} cy={52} r={2.6} fill="#c9a24b" stroke="rgba(0,0,0,0.4)" strokeWidth={0.5} />
          {/* вуаль */}
          <path d="M122 24 Q150 40 178 24 Q168 44 150 46 Q132 44 122 24Z" fill="rgba(20,16,20,0.2)" />
        </g>
      );
    },
  },
  {
    id: 'head-straw', name: 'Соломенная шляпа', category: 'headgear', fit: 'f', z: 72, bbox: [84, 4, 132, 76],
    render: () => (
      <g>
        {/* сплетённые поля */}
        <ellipse cx={150} cy={56} rx={58} ry={13} fill="#d9bb78" {...outline} />
        <g stroke="#a8874a" strokeWidth={0.8} fill="none" opacity={0.85}>
          {Array.from({ length: 9 }, (_, i) => (
            <ellipse key={i} cx={150} cy={56} rx={10 + i * 6} ry={2 + i * 1.2} />
          ))}
        </g>
        <path d="M94 56 Q150 48 206 56 Q196 66 150 68 Q104 66 94 56Z" fill="rgba(140,110,60,0.3)" />
        {/* тулья из плетёной соломки */}
        <path d="M116 56 Q118 18 150 15 Q182 18 184 56 Q150 46 116 56Z" fill="#e2c68c" {...outline} />
        <g stroke="#b8934e" strokeWidth={0.75} fill="none" opacity={0.8}>
          {[22, 28, 34, 40, 46].map((y) => (
            <path key={y} d={`M120 ${y} Q150 ${y - 6} 180 ${y}`} />
          ))}
        </g>
        {/* атласная лента */}
        <path d="M116 48 Q150 38 184 48 L184 57 Q150 47 116 57Z" fill="#b8452f" {...outline} />
        <path d="M116 48 Q150 38 184 48" stroke="rgba(255,255,255,0.28)" strokeWidth={1.2} fill="none" />
        {/* бантик на ленте */}
        <path d="M170 51 L164 46 L164 56 Z M170 51 L176 46 L176 56 Z" fill="#8f3423" />
        <circle cx={170} cy={51} r={1.8} fill="#6e2818" />
      </g>
    ),
  },
  {
    id: 'head-newsboy', name: 'Кепка газетчика', category: 'headgear', fit: 'both', z: 72, bbox: [100, 14, 100, 62],
    colorable: [tone('cloth', 'Цвет ткани')],
    render: (_g, _rig, context) => {
      const c = fabricTone(context, 'head-newsboy', 'cloth', '#6b5a3e');
      return (
        <g>
          {/* объёмный мягкий верх из восьми клиньев */}
          <path d="M106 52 Q108 20 150 16 Q192 20 194 52 Q150 40 106 52Z" fill={c} {...outline} />
          <g stroke="rgba(0,0,0,0.28)" strokeWidth={0.9} fill="none">
            {[-3, -2, -1, 0, 1, 2, 3].map((i) => (
              <path key={i} d={`M150 16 Q${150 + i * 14} 30 ${150 + i * 19} 52`} />
            ))}
            <path d="M110 46 Q150 34 190 46" />
          </g>
          {/* пуговка на макушке */}
          <circle cx={150} cy={17} r={2.4} fill={c} stroke="rgba(0,0,0,0.4)" strokeWidth={0.6} />
          {/* широкая козырёк-накладка */}
          <path d="M104 52 Q150 40 196 52 L194 58 Q150 47 106 58Z" fill="#4a3f2e" {...outline} />
          {/* большой мягкий козырёк спереди */}
          <path d="M108 56 Q150 44 192 56 Q188 70 150 72 Q112 70 108 56Z" fill={c} {...outline} />
          <path d="M112 58 Q150 48 188 58" stroke="rgba(255,255,255,0.16)" strokeWidth={1.4} fill="none" />
          <path d="M110 62 Q150 54 190 62" stroke="rgba(0,0,0,0.26)" strokeWidth={1.6} fill="none" />
          {/* лента-околыш */}
          <path d="M106 52 Q150 40 194 52 L193 56 Q150 45 107 56Z" fill="rgba(0,0,0,0.28)" />
        </g>
      );
    },
  },
  {
    id: 'head-fur-hat', name: 'Меховая шапка', category: 'headgear', fit: 'both', z: 72, bbox: [94, 6, 112, 68],
    render: () => {
      const p = FUR_PALETTE.fox;
      return (
        <g>
          {/* суконная тулья */}
          <path d="M108 46 Q110 14 150 11 Q190 14 192 46 Q150 36 108 46Z" fill="#3a4a3a" {...outline} />
          <path d="M116 18 Q150 30 184 18" stroke="rgba(255,255,255,0.14)" strokeWidth={1.6} fill="none" />
          {/* пышный меховой отворот по кругу */}
          <path d="M106 50 Q150 36 194 50 Q196 66 150 70 Q104 66 106 50Z" fill={p.fur} {...outline} />
          <path d="M106 50 Q150 36 194 50" stroke={p.dark} strokeWidth={2} fill="none" />
          <g stroke="none">
            {Array.from({ length: 26 }, (_, i) => {
              const a = Math.PI * (0.08 + (i / 25) * 0.84);
              const x = 150 - Math.cos(a) * 44;
              const y = 58 + Math.sin(a) * 6;
              return <path key={i} d={`M${x} ${y} l${(i % 3) - 1} ${2.6 + (i % 4) * 0.7}`} stroke={i % 3 === 0 ? p.light : p.dark} strokeWidth={1.2} opacity={0.55} />;
            })}
          </g>
          {/* кисточка спереди */}
          <circle cx={150} cy={30} r={3} fill={p.dark} stroke="#24170d" strokeWidth={0.7} />
          <path d="M150 33 L148 44 M150 33 L153 44 M150 33 L150 45" stroke={p.light} strokeWidth={1.2} strokeLinecap="round" />
        </g>
      );
    },
  },
  {
    id: 'head-headscarf', name: 'Платок на голову', category: 'headgear', fit: 'f', z: 73, bbox: [96, 10, 108, 88],
    colorable: [tone('silk', 'Цвет платка')],
    render: (_g, _rig, context) => {
      const c = fabricTone(context, 'head-headscarf', 'silk', '#8b2635');
      return (
        <g>
          {/* платок покрывает только волосы и не перекрывает черты лица */}
          <path d="M110 60 Q106 20 150 16 Q194 20 190 60 Q176 52 150 50 Q124 52 110 60Z" fill={c} {...outline} />
          {/* складки шёлка */}
          <g stroke="rgba(255,255,255,0.2)" strokeWidth={1.2} fill="none">
            <path d="M118 26 Q150 40 182 26" />
            <path d="M122 34 Q150 46 178 34" />
          </g>
          {/* цветочный принт */}
          {[[128, 32], [150, 28], [172, 32], [138, 42], [162, 42]].map(([x, y], i) => (
            <g key={i}>
              {[0, 72, 144, 216, 288].map((a) => (
                <circle key={a} cx={x + Math.cos((a * Math.PI) / 180) * 2.2} cy={y + Math.sin((a * Math.PI) / 180) * 2.2} r={1.3} fill="rgba(255,240,225,0.75)" />
              ))}
              <circle cx={x} cy={y} r={1.1} fill="rgba(255,235,180,0.9)" />
            </g>
          ))}
        </g>
      );
    },
  },
  {
    id: 'head-homburg', name: 'Хомбург', category: 'headgear', fit: 'm', z: 72, bbox: [96, 8, 108, 64],
    render: () => (
      <g>
        <path d="M120,58 Q120,18 150,14 Q180,18 180,58 Z" fill="#2f2f34" {...outline} />
        <path d="M142,16 Q150,30 158,16" stroke="rgba(0,0,0,0.4)" strokeWidth={2} fill="none" />
        <path d="M120,48 L180,48 L180,58 L120,58 Z" fill="#5a1e2a" />
        <ellipse cx={150} cy={60} rx={44} ry={8} fill="#2f2f34" {...outline} />
        <path d="M106,60 Q150,70 194,60" stroke="#c9a24b" strokeWidth={1} fill="none" />
      </g>
    ),
  },
  {
    id: 'head-cloche', name: 'Шляпа-клош', category: 'headgear', fit: 'f', z: 72, bbox: [100, 14, 100, 66],
    render: () => (
      <g>
        <path d="M112,64 Q106,22 150,20 Q194,22 188,64 Z" fill="#7a3b4f" {...outline} />
        <path d="M104,64 Q150,54 196,64 Q198,72 190,74 Q150,68 110,74 Q102,72 104,64 Z" fill="#6a3244" {...outline} />
        <path d="M112,56 Q150,48 188,56 L188,64 L112,64 Z" fill="#3c1c26" />
        <path d="M168,52 l6,-8 l4,8 l-4,8 Z" fill="#c9a24b" />
      </g>
    ),
  },
  { id: 'head-beret-black', name: 'Чёрный берет', category: 'headgear', fit: 'both', z: 72, bbox: [104, 18, 96, 46], render: () => hatBeret('#2a2a2a') },
  { id: 'head-beret-red', name: 'Бордовый берет', category: 'headgear', fit: 'f', z: 72, bbox: [104, 18, 96, 46], render: () => hatBeret('#8b2635') },
  {
    id: 'head-flatcap', name: 'Кепка-восьмиклинка', category: 'headgear', fit: 'm', z: 72, bbox: [104, 20, 96, 60],
    render: () => (
      <g>
        <path d="M112,60 Q112,28 150,24 Q188,28 188,60 Q150,66 112,60 Z" fill="#6b5a3e" {...outline} />
        {[-2, -1, 0, 1, 2].map((i) => (
          <path key={i} d={`M150,24 Q${150 + i * 14},40 ${150 + i * 18},62`} stroke="rgba(0,0,0,0.2)" strokeWidth={1} fill="none" />
        ))}
        <path d="M112,60 Q150,70 192,58 L194,64 Q150,78 110,66 Z" fill="#4e4130" {...outline} />
        <circle cx={150} cy={24} r={2} fill="#4e4130" />
      </g>
    ),
  },
  {
    id: 'head-scarf', name: 'Косынка', category: 'headgear', fit: 'f', z: 72, bbox: [100, 22, 100, 76],
    render: () => (
      <g>
        <path d="M112,66 Q110,26 150,24 Q190,26 188,66 Q150,54 112,66 Z" fill="#8b2635" {...outline} />
        <path d="M112,66 Q150,54 188,66 L186,76 Q150,64 114,76 Z" fill="#7a1f2b" />
        <path d="M186,72 Q198,84 190,96 Q184,84 180,74 Z" fill="#8b2635" {...outline} />
        {[0, 1, 2, 3].map((i) => (
          <circle key={i} cx={126 + i * 16} cy={44 + (i % 2) * 8} r={2} fill="#f3ecdc" opacity={0.7} />
        ))}
      </g>
    ),
  },
  {
    id: 'head-tirol', name: 'Тирольская шляпа', category: 'headgear', fit: 'both', z: 72, bbox: [98, 10, 104, 62],
    render: () => (
      <g>
        <path d="M122,58 Q120,22 150,18 Q180,22 178,58 Z" fill="#4a5a3e" {...outline} />
        <path d="M122,48 L178,48 L178,56 L122,56 Z" fill="#2f3a2a" />
        <ellipse cx={150} cy={60} rx={46} ry={9} fill="#4a5a3e" {...outline} />
        <path d="M176,50 q4,-16 10,-22 q-2,14 -4,22 Z" fill="#c9a24b" {...outline} />
        <path d="M118,60 Q150,68 182,60" stroke="rgba(0,0,0,0.25)" strokeWidth={1} fill="none" />
      </g>
    ),
  },
  {
    /* Кутюрная наклонная шляпка-фасинатор из головы леопарда (в точности как у Магды Геббельс на фото) */
    id: 'head-leopard', name: 'Шляпка «Леопард» набекрень', category: 'headgear', fit: 'f', z: 74, bbox: [134, 10, 68, 64],
    render: () => (
      <g transform="translate(162 38) rotate(-26)" data-couture-leopard-hat>
        {/* Черная бархатная основа-подложка шляпки */}
        <ellipse cx={0} cy={2} rx={22} ry={16} fill="#18181b" opacity={0.9} />
        {/* Объемная голова леопарда: лоб и щеки */}
        <path d="M-20,-4 C-21,-14 -10,-18 0,-18 C10,-18 21,-14 20,-4 C22,8 14,17 0,17 C-14,17 -22,8 -20,-4 Z" fill="#cca05a" {...outline} />
        {/* Ушки с темной задней каймой и бежевым пушком */}
        <g>
          <path d="M-17,-12 C-21,-22 -10,-24 -7,-15 Z" fill="#24170d" />
          <path d="M-15,-13 C-18,-20 -10,-21 -8,-15 Z" fill="#ecd8b8" />
          <path d="M17,-12 C21,-22 10,-24 7,-15 Z" fill="#24170d" />
          <path d="M15,-13 C18,-20 10,-21 8,-15 Z" fill="#ecd8b8" />
        </g>
        {/* Леопардовые розетки на лбу и висках */}
        {[[-12, -8], [0, -12], [12, -8], [-14, 0], [14, 0], [-6, -4], [6, -4]].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={2.5} fill="#24170d" />
            <circle cx={x} cy={y} r={1.1} fill="#8a5a24" />
          </g>
        ))}
        {/* Светлые подушечки усов (вибриссные подушечки) и подбородок */}
        <ellipse cx={-5.5} cy={8} rx={6} ry={5} fill="#f5ede0" opacity={0.95} />
        <ellipse cx={5.5} cy={8} rx={6} ry={5} fill="#f5ede0" opacity={0.95} />
        <ellipse cx={0} cy={12} rx={4.5} ry={3.5} fill="#ecdcc4" />
        {/* Черный кожаный кошачий носик с ноздрями */}
        <path d="M-4,4 L4,4 L0,9 Z" fill="#1b120c" />
        <ellipse cx={0} cy={4.5} rx={4.2} ry={2} fill="#24170d" />
        <ellipse cx={-1.5} cy={6} rx={0.9} ry={0.6} fill="#0a0705" />
        <ellipse cx={1.5} cy={6} rx={0.9} ry={0.6} fill="#0a0705" />
        <path d="M0,9 L0,11.5 M0,11.5 Q-3,13 -5,11.5 M0,11.5 Q3,13 5,11.5" stroke="#24170d" strokeWidth={0.7} fill="none" />
        {/* Выпуклые стеклянные янтарно-зеленые глаза с вертикальным зрачком и бликом */}
        {[-1, 1].map((s) => (
          <g key={s}>
            <ellipse cx={s * 8.5} cy={0} rx={4.2} ry={3.6} fill="#b2b844" stroke="#24170d" strokeWidth={0.8} />
            <ellipse cx={s * 8.5} cy={0} rx={1.1} ry={3.2} fill="#141410" />
            <circle cx={s * 8.5 - 1} cy={-1} r={0.8} fill="#ffffff" />
            <circle cx={s * 8.5 + 1.2} cy={1.2} r={0.35} fill="#ffffff" opacity={0.7} />
          </g>
        ))}
        {/* Длинные тонкие черные усы веером в стороны (в точности как на фото Магды Геббельс!) */}
        <g stroke="#181412" strokeWidth={0.65} fill="none" strokeLinecap="round">
          <path d="M-6,8 C-14,7 -22,12 -30,16" />
          <path d="M-7,9 C-16,10 -24,17 -31,23" />
          <path d="M-6,10 C-15,13 -22,21 -28,29" />
          <path d="M-5,11 C-12,16 -18,24 -23,32" />
          <path d="M6,8 C14,7 22,12 30,16" />
          <path d="M7,9 C16,10 24,17 31,23" />
          <path d="M6,10 C15,13 22,21 28,29" />
          <path d="M5,11 C12,16 18,24 23,32" />
        </g>
        {/* Точки крепления усов */}
        {[-8, -6, -4].map((x, i) => <circle key={`dtl-${i}`} cx={x} cy={8 + i * 1.5} r={0.5} fill="#24170d" />)}
        {[8, 6, 4].map((x, i) => <circle key={`dtr-${i}`} cx={x} cy={8 + i * 1.5} r={0.5} fill="#24170d" />)}
      </g>
    ),
  },
  {
    /* Кутюрный фасинатор из гепарда с легкой вуалеткой (как на правом фото) */
    id: 'head-cheetah-veil', name: 'Фасинатор «Гепард» с вуалью', category: 'headgear', fit: 'f', z: 74, bbox: [126, 10, 76, 78],
    render: () => (
      <g>
        {/* Наклонная мордочка гепарда набекрень */}
        <g transform="translate(160 36) rotate(-24)">
          <ellipse cx={0} cy={2} rx={21} ry={15} fill="#18181b" opacity={0.85} />
          <path d="M-19,-4 C-20,-14 -10,-17 0,-17 C10,-17 20,-14 19,-4 C21,8 13,16 0,16 C-13,16 -21,8 -19,-4 Z" fill="#d2a65e" {...outline} />
          {/* Круглые ушки гепарда */}
          <path d="M-16,-11 C-20,-20 -10,-22 -7,-14 Z" fill="#1b120c" />
          <path d="M-14,-12 C-17,-18 -10,-19 -8,-14 Z" fill="#ecd8b8" />
          <path d="M16,-11 C20,-20 10,-22 7,-14 Z" fill="#1b120c" />
          <path d="M14,-12 C17,-18 10,-19 8,-14 Z" fill="#ecd8b8" />
          {/* Мелкие четкие пятнышки гепарда */}
          {[[-11, -7], [0, -11], [11, -7], [-13, 1], [13, 1], [-5, -3], [5, -3], [-3, -8], [3, -8]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={1.6} fill="#14100c" />
          ))}
          {/* Глаза и характерные черные «слезные полосы» гепарда */}
          {[-1, 1].map((s) => (
            <g key={s}>
              <ellipse cx={s * 8} cy={0} rx={4} ry={3.4} fill="#c49a32" stroke="#1b120c" strokeWidth={0.8} />
              <ellipse cx={s * 8} cy={0} rx={1} ry={3} fill="#0d0d0b" />
              <circle cx={s * 8 - 0.9} cy={-1} r={0.75} fill="#ffffff" />
              {/* Слезная линия от внутреннего угла глаза к пасти */}
              <path d={`M${s * 5.2},1 Q${s * 4.5},6 ${s * 3.5},10`} stroke="#14100c" strokeWidth={1.4} fill="none" strokeLinecap="round" />
            </g>
          ))}
          {/* Носик */}
          <ellipse cx={-5} cy={8} rx={5} ry={4} fill="#f4ede2" />
          <ellipse cx={5} cy={8} rx={5} ry={4} fill="#f4ede2" />
          <path d="M-3.5,4 L3.5,4 L0,8.5 Z" fill="#1a110b" />
          {/* Черные усы */}
          <g stroke="#1a110b" strokeWidth={0.6} fill="none">
            <path d="M-5,8 C-12,7 -20,12 -27,17" />
            <path d="M-5,9 C-14,11 -21,18 -26,25" />
            <path d="M5,8 C12,7 20,12 27,17" />
            <path d="M5,9 C14,11 21,18 26,25" />
          </g>
        </g>
        {/* Черная вуалетка в крапинку (мушки), спадающая через лоб и висок */}
        <path d="M142,32 Q168,26 186,40 Q178,66 148,68 Q132,56 142,32 Z" fill="rgba(24,20,24,0.22)" stroke="rgba(20,20,20,0.5)" strokeWidth={0.6} />
        {/* Сетка вуали и мушки */}
        <g stroke="rgba(255,255,255,0.18)" strokeWidth={0.4} fill="none">
          <path d="M146,38 L176,56 M140,46 L170,64 M152,34 L182,52" />
          <path d="M172,34 L142,54 M178,42 L148,62 M166,32 L136,52" />
        </g>
        {[[148, 42], [162, 38], [174, 46], [154, 52], [168, 56], [146, 58]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={1} fill="#141014" />
        ))}
      </g>
    ),
  },
  {
    /* Кутюрная наклонная шляпка из головы лисицы */
    id: 'head-fox', name: 'Шляпка «Лисица» набекрень', category: 'headgear', fit: 'f', z: 74, bbox: [134, 10, 68, 64],
    render: () => (
      <g transform="translate(162 38) rotate(-26)" data-couture-fox-hat>
        <ellipse cx={0} cy={2} rx={20} ry={15} fill="#1c1612" opacity={0.88} />
        {/* Голова рыжей лисы */}
        <path d="M-18,-4 C-19,-14 -9,-17 0,-17 C9,-17 19,-14 18,-4 C20,8 11,18 0,19 C-11,18 -20,8 -18,-4 Z" fill="#c85626" {...outline} />
        {/* Стоячие ушки с черными кончиками и белым пушком */}
        <g>
          <path d="M-16,-10 L-22,-25 L-7,-15 Z" fill="#c85626" {...outline} />
          <path d="M-19,-19 L-22,-25 L-14,-22 Z" fill="#1b120c" />
          <path d="M-15,-12 L-19,-20 L-9,-15 Z" fill="#f4eee4" />
          <path d="M16,-10 L22,-25 L7,-15 Z" fill="#c85626" {...outline} />
          <path d="M19,-19 L22,-25 L14,-22 Z" fill="#1b120c" />
          <path d="M15,-12 L19,-20 L9,-15 Z" fill="#f4eee4" />
        </g>
        {/* Белоснежные щечки лисицы */}
        <path d="M-17,0 Q-18,10 -8,12 L0,15 L0,2 Q-10,2 -17,0 Z" fill="#f6f0e6" />
        <path d="M17,0 Q18,10 8,12 L0,15 L0,2 Q10,2 17,0 Z" fill="#f6f0e6" />
        {/* Черный носик-кнопочка */}
        <circle cx={0} cy={15} r={2.2} fill="#14100c" />
        <circle cx={-0.6} cy={14.2} r={0.6} fill="#fff" opacity={0.6} />
        {/* Стеклянные карие глаза */}
        {[-1, 1].map((s) => (
          <g key={s}>
            <ellipse cx={s * 8} cy={0} rx={3.8} ry={3.2} fill="#8a4a1a" stroke="#1c120a" strokeWidth={0.8} />
            <circle cx={s * 8} cy={0} r={1.6} fill="#100a06" />
            <circle cx={s * 8 - 0.8} cy={-0.8} r={0.7} fill="#fff" />
          </g>
        ))}
        {/* Белые и черные усы */}
        <g stroke="#f6f0e6" strokeWidth={0.6} fill="none">
          <path d="M-4,12 C-10,12 -18,16 -24,22" />
          <path d="M-4,14 C-11,15 -17,21 -22,28" />
          <path d="M4,12 C10,12 18,16 24,22" />
          <path d="M4,14 C11,15 17,21 22,28" />
        </g>
      </g>
    ),
  },
  {
    /* Кутюрный фасинатор из головы тигра */
    id: 'head-tiger', name: 'Шляпка «Тигр» набекрень', category: 'headgear', fit: 'f', z: 74, bbox: [134, 10, 68, 64],
    render: () => (
      <g transform="translate(162 38) rotate(-26)" data-couture-tiger-hat>
        <ellipse cx={0} cy={2} rx={22} ry={16} fill="#1a1410" opacity={0.88} />
        <path d="M-20,-4 C-21,-14 -10,-18 0,-18 C10,-18 21,-14 20,-4 C22,8 14,17 0,17 C-14,17 -22,8 -20,-4 Z" fill="#cc7b32" {...outline} />
        {/* Ушки с белыми пятнами сзади */}
        <g>
          <path d="M-17,-12 C-21,-21 -10,-23 -7,-14 Z" fill="#18120c" />
          <circle cx={-13} cy={-16} r={2.4} fill="#f4eee4" />
          <path d="M17,-12 C21,-21 10,-23 7,-14 Z" fill="#18120c" />
          <circle cx={13} cy={-16} r={2.4} fill="#f4eee4" />
        </g>
        {/* Черные тигриные полосы */}
        <g stroke="#18120c" strokeWidth={2} strokeLinecap="round" fill="none">
          <path d="M-16,-6 L-8,-3 M-17,0 L-10,2 M-16,6 L-9,6" />
          <path d="M16,-6 L8,-3 M17,0 L10,2 M16,6 L9,6" />
          <path d="M-5,-15 L-3,-9 M0,-16 L0,-8 M5,-15 L3,-9" />
        </g>
        {/* Белые подушечки усов и бакенбарды */}
        <ellipse cx={-5.5} cy={8} rx={6} ry={5} fill="#f6efe4" />
        <ellipse cx={5.5} cy={8} rx={6} ry={5} fill="#f6efe4" />
        <path d="M-4,4 L4,4 L0,9 Z" fill="#8a4434" />
        {/* Зеленые глаза хищника */}
        {[-1, 1].map((s) => (
          <g key={s}>
            <ellipse cx={s * 8.5} cy={0} rx={4.2} ry={3.6} fill="#7da644" stroke="#18120c" strokeWidth={0.8} />
            <circle cx={s * 8.5} cy={0} r={1.6} fill="#0d0d0b" />
            <circle cx={s * 8.5 - 1} cy={-1} r={0.8} fill="#fff" />
          </g>
        ))}
        {/* Длинные белые усы тигра */}
        <g stroke="#f6efe4" strokeWidth={0.7} fill="none">
          <path d="M-6,8 C-14,7 -22,12 -30,16" />
          <path d="M-6,10 C-15,13 -22,21 -28,29" />
          <path d="M6,8 C14,7 22,12 30,16" />
          <path d="M6,10 C15,13 22,21 28,29" />
        </g>
      </g>
    ),
  },
  {
    id: 'head-goebbels-cap', name: 'Фуражка гауляйтера Берлина', category: 'headgear', fit: 'both', z: 72, bbox: [102, 18, 96, 54],
    render: () => schirmmutze(
      '#c49a56', /* светло-песочный партийный верх */
      '#3a2618', /* темно-коричневый бархатный околыш */
      '#a03030', /* красный кант гауляйтера */
      '#c9a24b', /* золотой плетеный шнур */
      <g>
        {eagle(150, 33, 0.95, '#c9a24b')}
        {wreathBadge(150, 52, 6.5, 5, '#c9a24b', <circle cx={150} cy={52} r={2.2} fill="#a03030" />)}
      </g>,
    ),
  },

  /* ===== НАГРАДЫ И ЗНАКИ ===== */
  {
    id: 'dec-ek1', name: 'Крест 1-го класса на кармане', category: 'decor', fit: 'both', z: 68, bbox: [120, 200, 60, 44],
    render: (_g, rig) => ironCross(rig.chest.x - 16, rig.chest.y + 32, 6.4),
  },
  {
    id: 'dec-ek2', name: 'Лента в петлице', category: 'decor', fit: 'both', z: 68, bbox: [124, 140, 52, 40],
    render: (_g, rig) => (
      <g transform={`rotate(-28 ${rig.chest.x - 8} ${rig.chest.y + 6})`}>
        {ribbon(rig.chest.x - 8, rig.chest.y + 6, 7, 16, EK_RIBBON)}
      </g>
    ),
  },
  {
    id: 'dec-ribbonbar', name: 'Колодка орденских лент', category: 'decor', fit: 'both', z: 68, bbox: [120, 180, 60, 30],
    render: (_g, rig) => (
      <g>
        {ribbon(rig.chest.x - 20, rig.chest.y + 4, 9, 5, EK_RIBBON)}
        {ribbon(rig.chest.x - 11, rig.chest.y + 4, 9, 5, OST_RIBBON)}
        {ribbon(rig.chest.x - 2, rig.chest.y + 4, 9, 5, RK_RIBBON)}
      </g>
    ),
  },
  {
    id: 'dec-knight', name: 'Крест на шейной ленте', category: 'decor', fit: 'both', z: 69, bbox: [126, 116, 48, 80],
    render: (_g, rig) => (
      <g>
        <path d={`M${150 - rig.neckHalf} 122 Q150 150 ${150 + rig.neckHalf} 122`} stroke="#20222a" strokeWidth={3.4} fill="none" />
        <path d={`M${150 - rig.neckHalf + 2} 124 Q150 150 ${150 + rig.neckHalf - 2} 124`} stroke="#a03030" strokeWidth={1} fill="none" />
        {ironCross(150, rig.chest.y - 34, 7)}
      </g>
    ),
  },
  {
    id: 'dec-wound', name: 'Знак за ранение', category: 'decor', fit: 'both', z: 68, bbox: [120, 200, 60, 40],
    render: (_g, rig) => (
      <g>
        <ellipse cx={rig.chest.x - 16} cy={rig.chest.y + 34} rx={6} ry={7} fill="#3a3a3e" stroke="#8a8a84" strokeWidth={1.2} />
        <path d={`M${rig.chest.x - 19} ${rig.chest.y + 31} l6 6 m0 -6 l-6 6`} stroke="#c9c9c4" strokeWidth={1.1} fill="none" />
      </g>
    ),
  },
  {
    id: 'dec-sport', name: 'Спортивный знак', category: 'decor', fit: 'both', z: 68, bbox: [120, 200, 60, 40],
    render: (_g, rig) => wreathBadge(rig.chest.x - 16, rig.chest.y + 34, 6.5, 7.5, '#c9a24b', <circle cx={rig.chest.x - 16} cy={rig.chest.y + 34} r={2.4} fill="#8a8a84" />),
  },
  {
    id: 'dec-party', name: 'Партийный значок', category: 'decor', fit: 'both', z: 68, bbox: [126, 150, 48, 34],
    render: (_g, rig) => (
      <g transform={`translate(${rig.chest.x - 20} ${rig.chest.y + 4}) scale(0.62)`}>
        <circle cx={0} cy={0} r={7} fill="#a03030" stroke="#c9a24b" strokeWidth={1.4} />
        {bandEmblem}
      </g>
    ),
  },
  {
    id: 'dec-mother', name: 'Материнский крест', category: 'decor', fit: 'f', z: 69, bbox: [126, 116, 48, 84],
    render: (_g, rig) => (
      <g>
        <path d={`M${150 - rig.neckHalf} 122 Q150 152 ${150 + rig.neckHalf} 122`} stroke="#3a5a9a" strokeWidth={3.2} fill="none" />
        {ironCross(150, rig.chest.y - 30, 6.4, '#c9a24b', '#3a5a9a')}
      </g>
    ),
  },
  {
    id: 'dec-mother-ribbon', name: 'Лента материнского знака', category: 'decor', fit: 'f', z: 68, bbox: [124, 150, 52, 32],
    render: (_g, rig) => ribbon(rig.chest.x - 18, rig.chest.y + 4, 10, 5.5, MUTTER_RIBBON),
  },
  {
    id: 'dec-armband', name: 'Нарукавная повязка', category: 'decor', fit: 'both', z: 67, bbox: [64, 150, 172, 90],
    render: (_g, rig) => armband(rig, 0, '#a03030', bandEmblem),
  },
  {
    id: 'dec-armband-staff', name: 'Служебная повязка', category: 'decor', fit: 'both', z: 67, bbox: [64, 150, 172, 90],
    render: (_g, rig) => armband(rig, 0, '#e8e6dd', <text x={0} y={3} textAnchor="middle" fontSize={7} fill="#20222a" fontFamily="Georgia, serif">DRK</text>),
  },
  {
    id: 'dec-aiguillette', name: 'Аксельбант', category: 'decor', fit: 'both', z: 67, bbox: [96, 140, 108, 120],
    render: (_g, rig) => {
      const s = rig.shoulders[1];
      return (
        <g stroke="#c9a24b" strokeWidth={1.4} fill="none">
          <path d={`M${s.x - 6} ${s.y + 4} Q${rig.chest.x + 26} ${rig.chest.y + 6} ${rig.chest.x + 12} ${rig.chest.y + 30}`} />
          <path d={`M${s.x - 10} ${s.y + 6} Q${rig.chest.x + 30} ${rig.chest.y + 16} ${rig.chest.x + 14} ${rig.chest.y + 38}`} />
          <circle cx={rig.chest.x + 12} cy={rig.chest.y + 32} r={1.8} fill="#c9a24b" />
          <circle cx={rig.chest.x + 14} cy={rig.chest.y + 40} r={1.8} fill="#c9a24b" />
        </g>
      );
    },
  },

  /* ===== АКСЕССУАРЫ ===== */
  {
    id: 'acc-glasses', name: 'Круглые очки', category: 'accessories', fit: 'both', z: 65, bbox: [112, 62, 76, 32],
    render: () => (
      <g fill="rgba(255,255,255,0.08)" stroke="#6b4a2a" strokeWidth={1.8}>
        <circle cx={136} cy={79} r={10.5} />
        <circle cx={164} cy={79} r={10.5} />
        <path d="M146.5,78 Q150,74 153.5,78" fill="none" />
        <path d="M125.5,78 L116,80 M174.5,78 L184,80" fill="none" />
      </g>
    ),
  },
  {
    id: 'acc-monocle', name: 'Монокль', category: 'accessories', fit: 'm', z: 65, bbox: [150, 64, 40, 60],
    render: () => (
      <g>
        <circle cx={164} cy={79} r={11} fill="rgba(255,255,255,0.1)" stroke="#c9a24b" strokeWidth={2} />
        <path d="M172,86 Q182,110 176,124" stroke="#c9a24b" strokeWidth={1.2} fill="none" />
      </g>
    ),
  },
  {
    id: 'acc-pearls', name: 'Жемчужное ожерелье', category: 'accessories', fit: 'f', z: 66, bbox: [120, 118, 60, 56],
    render: (_g, rig) => (
      <g>
        {Array.from({ length: 11 }).map((_, i) => {
          const t = i / 10;
          const x0 = 150 - rig.neckHalf - 6;
          const x1 = 150 + rig.neckHalf + 6;
          const x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * 150 + t * t * x1;
          const y = (1 - t) * (1 - t) * 124 + 2 * (1 - t) * t * (rig.chest.y - 20) + t * t * 124;
          return <circle key={i} cx={x} cy={y} r={3.2} fill="#f6f0e6" stroke="#c8bfae" strokeWidth={0.8} />;
        })}
      </g>
    ),
  },
  {
    id: 'acc-brooch', name: 'Брошь-камея', category: 'accessories', fit: 'f', z: 66, bbox: [120, 140, 48, 36],
    render: (_g, rig) => (
      <g>
        <ellipse cx={rig.chest.x - 16} cy={rig.chest.y - 14} rx={7} ry={8.5} fill="#c9a24b" stroke="#8a6a25" strokeWidth={1} />
        <ellipse cx={rig.chest.x - 16} cy={rig.chest.y - 14} rx={4.5} ry={6} fill="#f2d9c8" />
        <path d={`M${rig.chest.x - 18} ${rig.chest.y - 18} q2,-2 4,0 q1,4 -2,7 q-3,-3 -2,-7 Z`} fill="#c98a7a" />
      </g>
    ),
  },
  {
    id: 'acc-scarf', name: 'Шёлковый шарф', category: 'accessories', fit: 'both', z: 64, bbox: [112, 116, 76, 120],
    render: (_g, rig) => neckerchief(rig, '#b8452f', '#8f3423'),
  },
  {
    id: 'acc-bowtie', name: 'Галстук-бабочка', category: 'accessories', fit: 'm', z: 66, bbox: [130, 124, 40, 30],
    render: (_g, rig) => (
      <g>
        <path d={`M150,${rig.chest.y - 32} L134,${rig.chest.y - 40} L134,${rig.chest.y - 24} Z M150,${rig.chest.y - 32} L166,${rig.chest.y - 40} L166,${rig.chest.y - 24} Z`} fill="#5a1e2a" {...outline} />
        <rect x={146} y={rig.chest.y - 36} width={8} height={8} rx={1.5} fill="#3d1119" />
      </g>
    ),
  },
  {
    id: 'acc-watch', name: 'Карманные часы', category: 'accessories', fit: 'm', z: 66, bbox: [140, 230, 60, 46],
    render: (_g, rig) => (
      <g>
        <path d={`M${rig.waist.x} ${rig.waist.y - 6} Q${rig.waist.x + 14} ${rig.waist.y + 14} ${rig.waist.x + 26} ${rig.waist.y + 2}`} stroke="#c9a24b" strokeWidth={1.5} fill="none" strokeDasharray="2 1.5" />
        <circle cx={rig.waist.x + 28} cy={rig.waist.y + 4} r={5} fill="#e9d9a8" stroke="#c9a24b" strokeWidth={1.2} />
        <path d={`M${rig.waist.x + 28} ${rig.waist.y + 1} L${rig.waist.x + 28} ${rig.waist.y + 4} L${rig.waist.x + 30.5} ${rig.waist.y + 5}`} stroke="#4a3a1a" strokeWidth={0.8} fill="none" />
      </g>
    ),
  },
  { id: 'acc-gloves', name: 'Кожаные перчатки', category: 'accessories', fit: 'both', z: 55, bbox: [60, 290, 180, 70], render: (_g, rig) => gloves(rig, '#4a362b', '#3a2a22') },
  { id: 'acc-gloves-white', name: 'Белые перчатки', category: 'accessories', fit: 'both', z: 55, bbox: [60, 290, 180, 70], render: (_g, rig) => gloves(rig, '#f2f0e8', '#e2dfd2') },
  {
    id: 'acc-handbag', name: 'Сумочка', category: 'accessories', fit: 'f', z: 56, bbox: [170, 300, 70, 90],
    render: (_g, rig) => {
      const h = rig.arms[1].hand;
      return (
        <g>
          <path d={`M${h.x - 8},${h.y + 6} Q${h.x},${h.y + 20} ${h.x + 8},${h.y + 6}`} stroke="#3a2214" strokeWidth={2} fill="none" />
          <path d={`M${h.x - 16},${h.y + 18} L${h.x + 16},${h.y + 18} L${h.x + 20},${h.y + 54} L${h.x - 20},${h.y + 54} Z`} fill="#4a2a1a" {...outline} />
          <path d={`M${h.x - 16},${h.y + 18} L${h.x + 16},${h.y + 18} L${h.x + 12},${h.y + 32} L${h.x - 12},${h.y + 32} Z`} fill="#3a2014" />
          <circle cx={h.x} cy={h.y + 32} r={2.5} fill="#c9a24b" />
        </g>
      );
    },
  },
  {
    id: 'acc-briefcase', name: 'Портфель', category: 'accessories', fit: 'm', z: 56, bbox: [40, 300, 90, 110],
    render: (_g, rig) => {
      const h = rig.arms[0].hand;
      return (
        <g>
          <path d={`M${h.x - 6},${h.y + 10} Q${h.x},${h.y + 22} ${h.x + 6},${h.y + 10}`} stroke="#3a2214" strokeWidth={2.5} fill="none" />
          <path d={`M${h.x - 26},${h.y + 20} L${h.x + 26},${h.y + 20} L${h.x + 26},${h.y + 66} L${h.x - 26},${h.y + 66} Z`} fill="#5b3a22" {...outline} />
          <path d={`M${h.x - 26},${h.y + 20} L${h.x + 26},${h.y + 20} L${h.x + 26},${h.y + 38} L${h.x - 26},${h.y + 38} Z`} fill="#4a2e1a" />
          <rect x={h.x - 5} y={h.y + 34} width={10} height={8} rx={1} fill="#c9a24b" />
        </g>
      );
    },
  },
  {
    id: 'acc-mapcase', name: 'Полевая сумка', category: 'accessories', fit: 'both', z: 57, bbox: [160, 250, 80, 90],
    render: (_g, rig) => (
      <g>
        <path d={`M${rig.shoulders[0].x + 10} ${rig.shoulders[0].y + 6} L${rig.waist.x + rig.waistHalf + 4} ${rig.waist.y + 24}`} stroke="#3a2c1c" strokeWidth={4} fill="none" />
        <rect x={rig.waist.x + rig.waistHalf - 6} y={rig.waist.y + 22} width={26} height={22} rx={2} fill="#4a3320" {...outline} />
        <path d={`M${rig.waist.x + rig.waistHalf - 6} ${rig.waist.y + 30} L${rig.waist.x + rig.waistHalf + 20} ${rig.waist.y + 30}`} stroke="rgba(0,0,0,0.4)" strokeWidth={1.2} />
        <rect x={rig.waist.x + rig.waistHalf + 3} y={rig.waist.y + 28} width={6} height={5} rx={1} fill="#8a8a84" />
      </g>
    ),
  },
  {
    id: 'acc-umbrella', name: 'Зонт-трость', category: 'accessories', fit: 'both', z: 56, bbox: [180, 280, 70, 320],
    render: (_g, rig) => {
      const h = rig.arms[1].hand;
      return (
        <g>
          <path d={`M${h.x + 4},${h.y - 2} Q${h.x + 16},${h.y - 8} ${h.x + 16},${h.y + 4}`} stroke="#4a2a1a" strokeWidth={3} fill="none" strokeLinecap="round" />
          <path d={`M${h.x + 16},${h.y + 4} L${h.x + 16},${h.y + 250}`} stroke="#2a2a2a" strokeWidth={9} strokeLinecap="round" />
          <path d={`M${h.x + 16},${h.y + 14} L${h.x + 16},${h.y + 240}`} stroke="rgba(255,255,255,0.15)" strokeWidth={2} />
          <path d={`M${h.x + 16},${h.y + 250} L${h.x + 16},${h.y + 264}`} stroke="#8a8a8a" strokeWidth={3} strokeLinecap="round" />
          <path d={`M${h.x + 11},${h.y + 44} L${h.x + 21},${h.y + 44} M${h.x + 11},${h.y + 164} L${h.x + 21},${h.y + 164}`} stroke="#4a2a1a" strokeWidth={3} />
        </g>
      );
    },
  },
  {
    id: 'acc-cane', name: 'Трость', category: 'accessories', fit: 'both', z: 56, bbox: [180, 280, 70, 320],
    render: (_g, rig) => {
      const h = rig.arms[1].hand;
      return (
        <g>
          <path d={`M${h.x - 4},${h.y} Q${h.x + 18},${h.y - 10} ${h.x + 16},${h.y + 10}`} stroke="#c9a24b" strokeWidth={4} fill="none" strokeLinecap="round" />
          <path d={`M${h.x + 16},${h.y + 10} L${h.x + 16},${h.y + 262}`} stroke="#2b1a10" strokeWidth={4} strokeLinecap="round" />
          <path d={`M${h.x + 16},${h.y + 252} L${h.x + 16},${h.y + 266}`} stroke="#9a9a9a" strokeWidth={4} strokeLinecap="round" />
        </g>
      );
    },
  },
  {
    id: 'acc-headband', name: 'Бархатная лента', category: 'headgear', fit: 'f', z: 68, bbox: [108, 30, 84, 24],
    render: () => (
      <g>
        <path d="M114,54 Q150,30 186,54" stroke="#2f5d3a" strokeWidth={6} fill="none" strokeLinecap="round" />
        <path d="M172,42 L164,34 L166,46 Z M172,42 L182,36 L182,48 Z" fill="#2f5d3a" {...outline} />
        <circle cx={172} cy={42} r={2.5} fill="#244a2d" />
      </g>
    ),
  },
  {
    id: 'acc-flower', name: 'Цветок в петлице', category: 'accessories', fit: 'both', z: 66, bbox: [110, 150, 40, 44],
    render: (_g, rig) => {
      const cx = rig.chest.x - 22;
      const cy = rig.chest.y - 4;
      return (
        <g>
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx={cx} cy={cy - 6} rx={3} ry={5.5} fill="#f3f0e8" stroke="#d6d0c2" strokeWidth={0.8} transform={`rotate(${a} ${cx} ${cy})`} />
          ))}
          <circle cx={cx} cy={cy} r={3} fill="#e9c24a" />
          <path d={`M${cx + 2},${cy + 6} L${cx + 6},${cy + 14}`} stroke="#3f6a3f" strokeWidth={1.5} />
        </g>
      );
    },
  },
  {
    id: 'acc-fox', name: 'Меховой воротник', category: 'accessories', fit: 'f', z: 63, bbox: [92, 118, 116, 76],
    back: (_g, rig) => {
      const shL = rig.shoulders[0];
      const shR = rig.shoulders[1];
      const d = `M${shL.x + 8} ${shL.y - 6} Q150 114 ${shR.x - 8} ${shR.y - 6}`;
      return (
        <g data-fur-collar-back>
          <path d={d} stroke="#5c3f2c" strokeWidth={22} fill="none" strokeLinecap="round" />
          <path d={d} stroke="#8c6a4a" strokeWidth={18} fill="none" strokeLinecap="round" />
          <path d={d} stroke="#c9a27c" strokeWidth={14} fill="none" strokeLinecap="round" strokeDasharray="1.5 6" opacity={0.6} />
        </g>
      );
    },
    render: (_g, rig) => (
      <g data-fur-collar-front>
        <path d={`M${rig.shoulders[0].x + 6} ${rig.shoulders[0].y - 4} Q${rig.chest.x - 12} ${rig.chest.y - 18} ${rig.chest.x - 18} ${rig.chest.y + 4} Q150 ${rig.chest.y - 6} ${rig.chest.x + 18} ${rig.chest.y + 4} Q${rig.chest.x + 12} ${rig.chest.y - 18} ${rig.shoulders[1].x - 6} ${rig.shoulders[1].y - 4} Q${rig.shoulders[1].x + 4} ${rig.chest.y - 10} ${rig.chest.x + 22} ${rig.chest.y + 8} Q150 ${rig.chest.y + 14} ${rig.chest.x - 22} ${rig.chest.y + 8} Q${rig.shoulders[0].x - 4} ${rig.chest.y - 10} ${rig.shoulders[0].x + 6} ${rig.shoulders[0].y - 4} Z`} fill="#8c6a4a" {...outline} />
        {Array.from({ length: 14 }).map((_, i) => (
          <path key={i} d={`M${rig.chest.x - 36 + i * 5.5},${rig.chest.y - 12 + Math.sin(i) * 3} l2,8`} stroke="rgba(255,240,220,0.35)" strokeWidth={1.2} />
        ))}
        {/* Застежка-клипса со стразом */}
        <circle cx={rig.chest.x} cy={rig.chest.y + 2} r={3.2} fill="#c9a24b" stroke="rgba(0,0,0,0.4)" strokeWidth={0.6} />
        <circle cx={rig.chest.x} cy={rig.chest.y + 2} r={1.5} fill="#1a1a1a" />
      </g>
    ),
  },
  {
    id: 'acc-stole-fox', name: 'Горжетка: лиса', category: 'accessories', fit: 'f', z: 63, bbox: [94, 118, 116, 152],
    back: (_g, rig) => {
      const p: StolePalette = { fur: '#b45a2e', dark: '#6e3418', light: '#e8a86a', muzzle: '#f2ead8', nose: '#1c1410', tailTip: '#f2ead8' };
      return stoleBack(rig, p);
    },
    render: (_g, rig) => {
      const p: StolePalette = { fur: '#b45a2e', dark: '#6e3418', light: '#e8a86a', muzzle: '#f2ead8', nose: '#1c1410', tailTip: '#f2ead8' };
      const { endL, endR, node } = stoleFront(rig, p);
      return (
        <g>
          {node}
          {stoleTail(endR.x, endR.y, p, 'fox')}
          {stoleHead(endL.x, endL.y + 2, p, 'fox')}
        </g>
      );
    },
  },
  {
    id: 'acc-stole-marten', name: 'Горжетка: куница', category: 'accessories', fit: 'f', z: 63, bbox: [94, 118, 116, 152],
    back: (_g, rig) => {
      const p: StolePalette = { fur: '#6b4a2a', dark: '#42301a', light: '#a8845a', muzzle: '#d8c8a8', nose: '#1c1410', bib: '#e8d5a8' };
      return stoleBack(rig, p);
    },
    render: (_g, rig) => {
      const p: StolePalette = { fur: '#6b4a2a', dark: '#42301a', light: '#a8845a', muzzle: '#d8c8a8', nose: '#1c1410', bib: '#e8d5a8' };
      const { endL, endR, node } = stoleFront(rig, p);
      return (
        <g>
          {node}
          {stoleTail(endR.x, endR.y, p, 'marten')}
          {stoleHead(endL.x, endL.y + 2, p, 'marten')}
        </g>
      );
    },
  },
  {
    id: 'acc-stole-sable', name: 'Горжетка: соболь', category: 'accessories', fit: 'f', z: 63, bbox: [94, 118, 116, 152],
    back: (_g, rig) => {
      const p: StolePalette = { fur: '#3a2418', dark: '#241610', light: '#8a7458', muzzle: '#c8b090', nose: '#14100c' };
      return stoleBack(rig, p);
    },
    render: (_g, rig) => {
      const p: StolePalette = { fur: '#3a2418', dark: '#241610', light: '#8a7458', muzzle: '#c8b090', nose: '#14100c' };
      const { endL, endR, node } = stoleFront(rig, p);
      return (
        <g>
          {node}
          {stoleTail(endR.x, endR.y, p, 'sable')}
          {stoleHead(endL.x, endL.y + 2, p, 'sable')}
        </g>
      );
    },
  },
  {
    id: 'acc-stole-silverfox', name: 'Горжетка: чернобурка', category: 'accessories', fit: 'f', z: 63, bbox: [94, 118, 116, 152],
    back: (_g, rig) => {
      const p: StolePalette = { fur: '#222326', dark: '#111214', light: '#a6adb5', muzzle: '#2a2b2f', nose: '#111214', tailTip: '#f4f6f8' };
      return stoleBack(rig, p);
    },
    render: (_g, rig) => {
      const p: StolePalette = { fur: '#222326', dark: '#111214', light: '#a6adb5', muzzle: '#2a2b2f', nose: '#111214', tailTip: '#f4f6f8' };
      const { endL, endR, node } = stoleFront(rig, p);
      return (
        <g>
          {node}
          {stoleTail(endR.x, endR.y, p, 'silverfox')}
          {stoleHead(endL.x, endL.y + 2, p, 'silverfox')}
        </g>
      );
    },
  },
  {
    id: 'acc-stole-ermine', name: 'Горжетка: горностай', category: 'accessories', fit: 'f', z: 63, bbox: [94, 118, 116, 152],
    back: (_g, rig) => {
      const p: StolePalette = { fur: '#f8f6f0', dark: '#d8d4c8', light: '#ffffff', muzzle: '#f4f0e6', nose: '#151515', tailTip: '#151515' };
      return stoleBack(rig, p);
    },
    render: (_g, rig) => {
      const p: StolePalette = { fur: '#f8f6f0', dark: '#d8d4c8', light: '#ffffff', muzzle: '#f4f0e6', nose: '#151515', tailTip: '#151515' };
      const { endL, endR, node } = stoleFront(rig, p);
      return (
        <g>
          {node}
          {stoleTail(endR.x, endR.y, p, 'ermine')}
          {stoleHead(endL.x, endL.y + 2, p, 'ermine')}
        </g>
      );
    },
  },
  {
    id: 'acc-cape-leopard', name: 'Пелерина «Леопард» с бантом', category: 'accessories', fit: 'f', z: 42, bbox: [76, 118, 148, 120],
    back: (_g, rig) => {
      const shL = rig.shoulders[0];
      const shR = rig.shoulders[1];
      const d = `M${shL.x - 2} ${shL.y + 12} Q150 114 ${shR.x + 2} ${shR.y + 12} L${shR.x + 6} ${shR.y + 36} Q150 170 ${shL.x - 6} ${shL.y + 36} Z`;
      return (
        <g data-leopard-cape-back>
          <path d={d} fill="#cca05a" {...outline} />
          {/* Леопардовые пятна со спины */}
          <Clipped d={d}>
            {[[-30, 134], [-15, 126], [0, 122], [15, 126], [30, 134], [-24, 148], [0, 142], [24, 148]].map(([dx, y], i) => (
              <circle key={i} cx={150 + dx} cy={y} r={2.8} fill="#24170d" opacity={0.75} />
            ))}
          </Clipped>
        </g>
      );
    },
    render: (_g, rig) => {
      const cx = rig.chest.x;
      const cy = rig.chest.y;
      const shL = rig.shoulders[0];
      const shR = rig.shoulders[1];
      const capeD = `M${150 - rig.neckHalf - 4} 128 Q150 134 ${150 + rig.neckHalf + 4} 128 L${shR.x + 8} ${shR.y + 16} Q${cx + 34} ${cy + 8} ${cx + 18} ${cy + 16} L${cx - 18} ${cy + 16} Q${cx - 34} ${cy + 8} ${shL.x - 8} ${shL.y + 16} Z`;
      return (
        <g data-leopard-cape-front>
          {/* Золотая цепочка с бантиком на шее (как на фото Магды Геббельс!) */}
          <path d={`M${150 - rig.neckHalf - 2} 126 Q150 136 ${150 + rig.neckHalf + 2} 126`} stroke="#c9a24b" strokeWidth={1.4} fill="none" />
          <path d={`M146 136 L142 133 L142 139 Z M154 136 L158 133 L158 139 Z`} fill="#c9a24b" />
          <circle cx={150} cy={136} r={1.5} fill="#c9a24b" />

          {/* Леопардовая пелерина на плечах */}
          <path d={capeD} fill="#cca05a" {...outline} />
          {/* Леопардовые розетки */}
          <Clipped d={capeD}>
            {[
              [shL.x + 12, shL.y + 16], [shL.x + 28, shL.y + 22], [cx - 22, cy - 2],
              [shR.x - 12, shR.y + 16], [shR.x - 28, shR.y + 22], [cx + 22, cy - 2],
              [cx - 12, cy + 8], [cx + 12, cy + 8], [shL.x + 20, shL.y + 32], [shR.x - 20, shR.y + 32]
            ].map(([x, y], i) => (
              <g key={i}>
                <circle cx={x} cy={y} r={3.2} fill="#24170d" opacity={0.8} />
                <circle cx={x} cy={y} r={1.4} fill="#8a5a24" />
              </g>
            ))}
          </Clipped>

          {/* Роскошный объемный черный шелковый бант на вырезе (как на референсе!) */}
          <g transform={`translate(${cx} ${cy - 8})`}>
            {/* Левое и правое крылья банта */}
            <path d="M0 0 C-14 -12 -28 -14 -32 -2 C-34 10 -18 8 0 2 Z" fill="#18181b" stroke="#000" strokeWidth={0.8} />
            <path d="M0 0 C14 -12 28 -14 32 -2 C34 10 18 8 0 2 Z" fill="#18181b" stroke="#000" strokeWidth={0.8} />
            {/* Складки шелка с бликом */}
            <path d="M-10 -4 C-20 -6 -24 0 -22 4" stroke="rgba(255,255,255,0.2)" strokeWidth={1.2} fill="none" />
            <path d="M10 -4 C20 -6 24 0 22 4" stroke="rgba(255,255,255,0.2)" strokeWidth={1.2} fill="none" />
            {/* Крупный граненый черный кабошон по центру */}
            <circle cx={0} cy={1} r={6.5} fill="#111113" stroke="#2c2c30" strokeWidth={1} />
            <circle cx={-1.5} cy={-1} r={2} fill="#ffffff" opacity={0.4} />
          </g>
        </g>
      );
    },
  },
  {
    id: 'acc-muff-leopard', name: 'Муфта «Леопард»', category: 'accessories', fit: 'f', z: 58, bbox: [110, 290, 80, 56],
    render: (_g, rig) => {
      const cx = rig.waist.x;
      const cy = rig.waist.y + 60;
      return (
        <g data-leopard-muff>
          {/* Шелковый шнурок на шею */}
          <path d={`M144 135 Q136 210 ${cx - 22} ${cy - 12} M156 135 Q164 210 ${cx + 22} ${cy - 12}`} stroke="#24170d" strokeWidth={1.4} fill="none" />
          {/* Муфта */}
          <rect x={cx - 26} y={cy - 16} width={52} height={32} rx={12} fill="#cca05a" {...outline} />
          <ellipse cx={cx - 26} cy={cy} rx={4.5} ry={13} fill="#24170d" />
          <ellipse cx={cx + 26} cy={cy} rx={4.5} ry={13} fill="#24170d" />
          {/* Розетки леопарда */}
          {[[-14, cy - 6], [0, cy - 8], [14, cy - 6], [-8, cy + 4], [8, cy + 4]].map(([x, y], i) => (
            <g key={i}>
              <circle cx={cx + x} cy={y} r={3} fill="#24170d" />
              <circle cx={cx + x} cy={y} r={1.3} fill="#8a5a24" />
            </g>
          ))}
          {/* Пушистый контур меха */}
          <path d={`M${cx - 24} ${cy - 16} Q${cx} ${cy - 19} ${cx + 24} ${cy - 16} M${cx - 24} ${cy + 16} Q${cx} ${cy + 19} ${cx + 24} ${cy + 16}`} stroke="rgba(255,240,210,0.3)" strokeWidth={1.4} fill="none" />
        </g>
      );
    },
  },
  {
    id: 'acc-muff-sable', name: 'Муфта из соболя', category: 'accessories', fit: 'f', z: 58, bbox: [110, 290, 80, 56],
    render: (_g, rig) => {
      const cx = rig.waist.x;
      const cy = rig.waist.y + 60;
      return (
        <g data-sable-muff>
          <path d={`M144 135 Q136 210 ${cx - 22} ${cy - 12} M156 135 Q164 210 ${cx + 22} ${cy - 12}`} stroke="#3a2418" strokeWidth={1.4} fill="none" />
          <rect x={cx - 26} y={cy - 16} width={52} height={32} rx={12} fill="#3a2418" {...outline} />
          <ellipse cx={cx - 26} cy={cy} rx={4.5} ry={13} fill="#20140e" />
          <ellipse cx={cx + 26} cy={cy} rx={4.5} ry={13} fill="#20140e" />
          {/* Остевой серебристый волос */}
          {[-18, -9, 0, 9, 18].map((dx, i) => (
            <path key={i} d={`M${cx + dx} ${cy - 12} Q${cx + dx + 2} ${cy} ${cx + dx} ${cy + 12}`} stroke="rgba(255,240,220,0.32)" strokeWidth={1} fill="none" />
          ))}
          {/* Атласный бант по центру */}
          <circle cx={cx} cy={cy} r={3.5} fill="#5a3824" stroke="#20140e" strokeWidth={0.8} />
          <path d={`M${cx} ${cy} L${cx - 8} ${cy - 5} L${cx - 6} ${cy + 5} Z M${cx} ${cy} L${cx + 8} ${cy - 5} L${cx + 6} ${cy + 5} Z`} fill="#5a3824" />
        </g>
      );
    },
  },
  {
    id: 'acc-fur-cuffs', name: 'Меховые манжеты', category: 'accessories', fit: 'both', z: 58, bbox: [60, 290, 180, 50],
    render: (_g, rig) => rig.arms.map((arm, i) => (
      <g key={i} transform={arm.handTransform}>
        <rect x={-11} y={-22} width={22} height={14} rx={6} fill="#6b4a2a" stroke="#3a2418" strokeWidth={0.8} />
        <path d="M-9 -15 L9 -15" stroke="rgba(255,240,220,0.35)" strokeWidth={1.5} />
      </g>
    )),
  },
/* ═══════════ СТАРЫЕ ВАРИАНТЫ (ст.) — сохранены рядом с новыми ═══════════ */

  {
    id: 'bot-pencil-old', name: 'Юбка-карандаш (ст.)', category: 'bottom', fit: 'f', z: 30, bbox: [104, 224, 92, 220],
    render: (_g, rig) => (
      <g>
        <path d={skirtPath(rig, { hem: 438, flare: 0, pencil: true })} fill="#5c5a5a" {...outline} />
        <rect x={rig.waist.x - rig.waistHalf - 5} y={rig.waist.y} width={(rig.waistHalf + 5) * 2} height={9} fill="#454343" {...outline} />
        <path d={`M${rig.crotch.x} 400 L${rig.crotch.x} 436`} stroke="rgba(0,0,0,0.4)" strokeWidth={1.5} />
        <circle cx={rig.waist.x} cy={rig.waist.y + 4.5} r={2.5} fill="#c9a24b" />
      </g>
    ),
  },
  {
    id: 'bot-aline-old', name: 'Юбка в складку (ст.)', category: 'bottom', fit: 'f', z: 30, bbox: [86, 224, 128, 230],
    render: (_g, rig) => (
      <g>
        <path d={skirtPath(rig, { hem: 448, flare: 60 })} fill="#2c3a5c" {...outline} />
        {[-3, -2, -1, 0, 1, 2, 3].map((i) => (
          <path key={i} d={`M${rig.waist.x + i * 9} ${rig.waist.y + 12} L${rig.crotch.x + i * 16} 444`} stroke="rgba(0,0,0,0.3)" strokeWidth={1} />
        ))}
        <rect x={rig.waist.x - rig.waistHalf - 5} y={rig.waist.y} width={(rig.waistHalf + 5) * 2} height={9} fill="#1e2a45" {...outline} />
      </g>
    ),
  },
  {
    id: 'bot-dirndl-old', name: 'Юбка дирндля с фартуком (ст.)', category: 'bottom', fit: 'f', z: 30, bbox: [80, 224, 140, 236],
    render: (_g, rig) => (
      <g>
        <path d={skirtPath(rig, { hem: 452, flare: 66 })} fill="#a63a3a" {...outline} />
        <path d={skirtPath(rig, { hem: 436, flare: 38 })} fill="#f8f2e4" opacity={0.92} {...outline} />
        <rect x={rig.waist.x - rig.waistHalf * 0.62} y={rig.waist.y} width={rig.waistHalf * 1.24} height={7} fill="#f8f2e4" {...outline} />
        {[-1, 0, 1].map((i) => (
          <path key={i} d={`M${rig.crotch.x + i * 14} ${rig.waist.y + 14} L${rig.crotch.x + i * 24} 430`} stroke="rgba(0,0,0,0.1)" strokeWidth={1} />
        ))}
      </g>
    ),
  },
  {
    id: 'bot-knicker-old', name: 'Никербокеры (ст.)', category: 'bottom', fit: 'm', z: 30, bbox: [92, 230, 116, 350],
    render: (_g, rig) => (
      <g>
        {rig.legs.map((leg) => (
          <path key={leg.side} d={`M${leg.knee.x} ${leg.knee.y + 6} L${leg.ankle.x} ${leg.ankle.y + 4}`} stroke="#4a4a4a" strokeWidth={24} strokeLinecap="round" fill="none" />
        ))}
        {trousers(rig, '#7d6a4e', { breeches: true, waistband: '#3a2a1e' })}
        {rig.legs.map((leg) => (
          <path key={leg.side} d={`M${leg.knee.x - 15} ${leg.knee.y + 2} Q${leg.knee.x} ${leg.knee.y + 12} ${leg.knee.x + 15} ${leg.knee.y + 2} L${leg.knee.x + 14} ${leg.knee.y + 10} Q${leg.knee.x} ${leg.knee.y + 19} ${leg.knee.x - 14} ${leg.knee.y + 10} Z`} fill="#5c4d38" {...outline} />
        ))}
      </g>
    ),
  },
  {
    id: 'bot-pleated-old', name: 'Брюки с защипами (ст.)', category: 'bottom', fit: 'm', z: 30, bbox: [90, 230, 120, 356],
    render: (_g, rig) => (
      <g>
        {trousers(rig, '#2f3a55', { waistband: '#1b1b1f', crease: true })}
        {rig.legs.map((leg) => (
          <path key={leg.side} d={`M${leg.ankle.x - 12} ${leg.ankle.y - 2} L${leg.ankle.x + 12} ${leg.ankle.y - 2}`} stroke="rgba(0,0,0,0.35)" strokeWidth={1.4} />
        ))}
      </g>
    ),
  },

  /* ===== УНИФОРМА (мужская), расширенный набор ===== */
  {
    id: 'uni-heer-m36', name: 'Вермахт, M36 (фельдграу)', category: 'uniform', fit: 'm', z: 32, bbox: [56, 100, 188, 512],
    render: (_g, rig) => tunicKit(rig, { shell: FG, collar: '#39452f', piping: '#a03030', trouser: '#7d7f72', beltLeather: '#4a3220', beltBuckle: '#8a8a84', epaulette: { color: FG, piping: '#a03030' }, collarPatch: { color: '#39452f', litzen: '#c9c9c4' }, eaglePos: 'viewer-left', pocketFlap: true }),
  },
  {
    id: 'uni-heer-m40', name: 'Вермахт, M40', category: 'uniform', fit: 'm', z: 32, bbox: [56, 100, 188, 512],
    render: (_g, rig) => tunicKit(rig, { shell: '#666c55', collar: '#666c55', trouser: '#7d7f72', beltLeather: '#4a3220', beltBuckle: '#8a8a84', epaulette: { color: '#666c55', piping: '#9aa0a8' }, collarPatch: { color: '#39452f', litzen: '#c9c9c4' }, eaglePos: 'viewer-left', pocketFlap: true }),
  },
  {
    id: 'uni-heer-m43', name: 'Вермахт, M43', category: 'uniform', fit: 'm', z: 32, bbox: [56, 100, 188, 512],
    render: (_g, rig) => tunicKit(rig, { shell: '#61684f', collar: '#61684f', trouser: '#75776a', beltLeather: '#4a3220', beltBuckle: '#8a8a84', epaulette: { color: '#61684f' }, collarPatch: { color: '#39452f', litzen: '#c9c9c4' }, eaglePos: 'viewer-left', pocketFlap: true, hiddenPlacket: true }),
  },
  {
    id: 'uni-luftwaffe', name: 'Люфтваффе', category: 'uniform', fit: 'm', z: 32, bbox: [56, 100, 188, 512],
    render: (_g, rig) => tunicKit(rig, { shell: '#46535f', collar: '#2e3a46', piping: '#d8b25a', trouser: '#39424e', buttons: '#c9a24b', beltLeather: '#3a3226', beltBuckle: '#c9a24b', epaulette: { color: '#46535f', piping: '#d8b25a', button: '#c9a24b' }, collarPatch: { color: '#2e3a46', litzen: '#d8b25a' }, eaglePos: 'viewer-left', eagleColor: '#c9a24b', pocketFlap: true }),
  },
  {
    id: 'uni-kriegsmarine', name: 'Кригсмарине', category: 'uniform', fit: 'm', z: 32, bbox: [56, 100, 188, 512],
    render: (_g, rig) => tunicKit(rig, { shell: '#2b3444', collar: '#232c3c', trouser: '#232c3c', buttons: '#c9a24b', double: true, epaulette: { color: '#2b3444', piping: '#c9a24b', button: '#c9a24b' }, noBoots: true, bootColor: '#1c1c1e' }),
  },
  {
    id: 'uni-wss', name: 'Ваффен-СС, полевой', category: 'uniform', fit: 'm', z: 32, bbox: [56, 100, 188, 512],
    render: (_g, rig) => tunicKit(rig, { shell: FG, collar: '#20221f', trouser: '#666c55', beltLeather: '#26221e', beltBuckle: '#c9c9c4', epaulette: { color: FG, piping: '#9aa0a8' }, collarPatch: { color: '#20221f', litzen: '#c9c9c4', runes: true }, eaglePos: 'left-arm', pocketFlap: true }),
  },
  {
    id: 'uni-ss-black', name: 'СС, парадный (чёрный)', category: 'uniform', fit: 'm', z: 32, bbox: [56, 100, 188, 512],
    render: (_g, rig) => tunicKit(rig, { shell: '#26262a', collar: '#1c1c20', trouser: '#202024', breeches: true, beltLeather: '#1c1a18', beltBuckle: '#c9c9c4', epaulette: { color: '#26262a', piping: '#c9c9c4' }, collarPatch: { color: '#1c1c20', litzen: '#c9c9c4', runes: true }, eaglePos: 'viewer-left', eagleColor: '#c9c9c4', necktie: '#17181c' }),
  },
  {
    id: 'uni-sa', name: 'СА (штурмовики)', category: 'uniform', fit: 'm', z: 32, bbox: [56, 100, 188, 512],
    render: (_g, rig) => tunicKit(rig, { shell: '#8a6238', collar: '#7a5430', trouser: '#8a7f68', hem: 340, breeches: true, beltLeather: '#4a3220', beltBuckle: '#8a8a84', necktie: '#4a3626', pocketFlap: true }),
  },
  {
    id: 'uni-hj-old', name: 'Гитлерюгенд (ст.)', category: 'uniform', fit: 'm', z: 32, bbox: [56, 100, 188, 512],
    render: (_g, rig) => (
      <g>
        {tunicKit(rig, { shell: '#9a6b3e', collar: '#8a5c32', trouser: '#2c2c30', hem: 330, beltLeather: '#26221e', beltBuckle: '#9aa0a8', pocketFlap: true })}
        {neckerchief(rig, '#20222a', '#6b4a2a')}
      </g>
    ),
  },
  {
    id: 'uni-rad-old', name: 'Имперская трудовая служба (ст.)', category: 'uniform', fit: 'm', z: 32, bbox: [56, 100, 188, 512],
    render: (_g, rig) => tunicKit(rig, { shell: '#96703e', collar: '#86602f', trouser: '#2c2c30', hem: 332, beltLeather: '#26221e', beltBuckle: '#9aa0a8', pocketFlap: true }),
  },
  {
    id: 'uni-orpo', name: 'Полиция порядка (Орпо)', category: 'uniform', fit: 'm', z: 32, bbox: [56, 100, 188, 512],
    render: (_g, rig) => tunicKit(rig, { shell: '#4f5f45', collar: '#39462f', trouser: '#3f4a3a', beltLeather: '#3a2c1c', beltBuckle: '#9aa0a8', epaulette: { color: '#4f5f45', piping: '#6f9a5a' }, collarPatch: { color: '#39462f', litzen: '#c9c9c4' }, eaglePos: 'viewer-left', pocketFlap: true }),
  },
  {
    id: 'uni-med', name: 'Санитарная служба', category: 'uniform', fit: 'm', z: 32, bbox: [56, 100, 188, 512],
    render: (_g, rig) => (
      <g>
        {tunicKit(rig, { shell: FG, collar: '#39452f', piping: '#a03030', trouser: '#7d7f72', beltLeather: '#4a3220', beltBuckle: '#8a8a84', epaulette: { color: FG, piping: '#5a8ab0' }, collarPatch: { color: '#39452f', litzen: '#c9c9c4' }, pocketFlap: true })}
        {armband(rig, 0, '#f1ede2', <g fill="#b03030"><rect x={-1.4} y={-4.4} width={2.8} height={8.8} /><rect x={-4.4} y={-1.4} width={8.8} height={2.8} /></g>)}
      </g>
    ),
  },
  {
    id: 'uni-veteran', name: 'Ветеран (старый мундир)', category: 'uniform', fit: 'm', z: 32, bbox: [56, 100, 188, 512],
    render: (_g, rig) => (
      <g>
        {tunicKit(rig, { shell: '#5d6268', collar: '#4c5056', trouser: '#54575c', buttons: '#8a8a84', beltLeather: '#3a2c1c', beltBuckle: '#8a8a84', pocketFlap: true })}
        {ribbon(rig.chest.x + 2, 206, 9, 5.5, EK_RIBBON)}
        {wreathBadge(rig.chest.x + 16, 206, 5, 6, '#3a3a3e', <path d={`M${rig.chest.x + 13} 206 Q${rig.chest.x + 16} 202 ${rig.chest.x + 19} 206 L${rig.chest.x + 19.6} 207.6 L${rig.chest.x + 12.4} 207.6Z`} fill="#2c2c30" />)}
      </g>
    ),
  },
  {
    id: 'civ-worker', name: 'Рабочий комбинезон', category: 'uniform', fit: 'm', z: 32, bbox: [56, 100, 188, 512],
    render: (_g, rig) => tunicKit(rig, { shell: '#5a6a78', collar: '#4e5c68', trouser: '#52606e', hem: 324, buttons: '#3a3e44', beltLeather: '#52606e', beltBuckle: '#3a3a3e', bootColor: '#3a2c20', pocketFlap: true }),
  },

  /* ===== УНИФОРМА (женская), расширенный набор ===== */
  {
    id: 'uni-bdm-old', name: 'Союз немецких девушек (ст.)', category: 'uniform', fit: 'f', z: 32, bbox: [56, 100, 188, 512],
    render: (_g, rig) => (
      <g>
        {stockings(rig)}
        {neckBand(rig, '#f4f1e8', { height: 116, drop: 130 })}
        {sleeves(rig, '#f4f1e8', 19, { short: 0.5 })}
        <path d={torsoPath(rig, { hem: rig.waist.y + 14, hemHalf: rig.waistHalf + 8, chestEase: 1.06, waistEase: 1.08, neckDrop: 130 })} fill="#f4f1e8" {...outline} />
        <path d={skirtPath(rig, { hem: 436, flare: 52 })} fill="#2e3a55" {...outline} />
        {[-2, -1, 0, 1, 2].map((i) => (
          <path key={i} d={`M${rig.waist.x + i * 9} ${rig.waist.y + 12} L${rig.crotch.x + i * 15} 432`} stroke="rgba(0,0,0,0.22)" strokeWidth={1} />
        ))}
        {neckerchief(rig, '#20222a', '#3a2c1c')}
        {[150, 168, 186].map((y) => (
          <circle key={y} cx={rig.chest.x} cy={y + 2} r={1.6} fill="#c9c4b4" />
        ))}
      </g>
    ),
  },
  {
    id: 'uni-frauenschaft', name: 'Женская служба (Frauenschaft)', category: 'uniform', fit: 'f', z: 32, bbox: [56, 100, 188, 512],
    render: (_g, rig) => dressKit(rig, { dress: '#31415c', hem: 440, flare: 54, collar: '#f2efe6', beltColor: '#232c3c', armbandNode: armband(rig, 0, '#a03030', bandEmblem) }),
  },
  {
    id: 'uni-radwj', name: 'Женская трудовая служба (RADwJ)', category: 'uniform', fit: 'f', z: 32, bbox: [56, 100, 188, 512],
    render: (_g, rig) => dressKit(rig, { dress: '#8a7a63', hem: 442, flare: 56, collar: '#f2efe6', beltColor: '#3a322a', armbandNode: armband(rig, 0, '#e8e6dd', <path d="M-2.5 2 Q0 -3 2.5 2 L1.5 3 L0.6 1.6 L0.6 4.5 L-0.6 4.5 L-0.6 1.6 L-1.5 3Z" fill="#6a4a2a" />) }),
  },
  {
    id: 'uni-drk', name: 'Медсестра DRK', category: 'uniform', fit: 'f', z: 32, bbox: [56, 100, 188, 512],
    render: (_g, rig) => dressKit(rig, { dress: '#f1ede2', hem: 430, flare: 48, collar: '#fbfaf4', apron: '#c9ced4', armbandNode: armband(rig, 0, '#f8f6f0', <g fill="#b03030"><rect x={-1.4} y={-4.4} width={2.8} height={8.8} /><rect x={-4.4} y={-1.4} width={8.8} height={2.8} /></g>), buttons: '#c9c4b4' }),
  },
  {
    id: 'uni-blitz', name: 'Телеграфистка (Blitzmädel)', category: 'uniform', fit: 'f', z: 32, bbox: [56, 100, 188, 512],
    render: (_g, rig) => dressKit(rig, { dress: '#46535f', hem: 438, flare: 50, piping: '#d8b25a', buttons: '#c9a24b', beltColor: '#2e3a46', buckle: '#c9a24b' }),
  },
  {
    id: 'uni-lotta', name: 'Лотта Свярд (Финляндия)', category: 'uniform', fit: 'f', z: 32, bbox: [56, 100, 188, 512],
    render: (_g, rig) => dressKit(rig, { dress: '#7d7d78', hem: 442, flare: 54, collar: '#f2efe6', armbandNode: armband(rig, 0, '#3a5a9a', <circle r={3.4} fill="#e8e6dd" />) }),
  },

  /* ===== ГОЛОВНЫЕ УБОРЫ, расширенный набор ===== */
  { id: 'hat-stahlhelm-m35', name: 'Штальхельм M35 (ст.)', category: 'headgear', fit: 'both', z: 70, bbox: [94, 12, 112, 136], render: (g, _rig, context) => stahlhelm('#5d6450', 'm35', heerDecal, g, context?.face) },
  { id: 'hat-stahlhelm-m40', name: 'Штальхельм M40 (ст.)', category: 'headgear', fit: 'both', z: 70, bbox: [94, 12, 112, 136], render: (g, _rig, context) => stahlhelm('#59604c', 'm40', heerDecal, g, context?.face) },
  { id: 'hat-stahlhelm-m42', name: 'Штальхельм M42 (ст.)', category: 'headgear', fit: 'both', z: 70, bbox: [94, 12, 112, 136], render: (g, _rig, context) => stahlhelm('#525847', 'm42', undefined, g, context?.face) },
  { id: 'hat-schiffchen', name: 'Пилотка (ст.)', category: 'headgear', fit: 'both', z: 70, bbox: [104, 22, 96, 48], render: () => schiffchen(FG, '#4c523e', '#a03030', eagle(146, 40, 0.62, '#c9c9c4')) },
  {
    id: 'hat-schirm-heer', name: 'Фуражка офицера (Heer)', category: 'headgear', fit: 'm', z: 70, bbox: [100, 18, 100, 56],
    render: () => schirmmutze('#6a7059', '#39452f', '#a03030', '#c9c9c4', <g>{eagle(150, 46.5, 0.62, '#c9c9c4')}<circle cx={150} cy={53} r={2.1} fill="#39452f" stroke="#c9c9c4" strokeWidth={0.6} /></g>),
  },
  {
    id: 'hat-schirm-ss', name: 'Фуражка (СС)', category: 'headgear', fit: 'm', z: 70, bbox: [100, 18, 100, 56],
    render: () => schirmmutze('#26262a', '#1c1c20', '#c9c9c4', '#c9c9c4', <g>{eagle(150, 46.5, 0.62, '#c9c9c4')}<circle cx={150} cy={53} r={2.1} fill="#1c1c20" stroke="#c9c9c4" strokeWidth={0.6} /></g>),
  },
  {
    id: 'hat-schirm-km', name: 'Фуражка (Кригсмарине)', category: 'headgear', fit: 'm', z: 70, bbox: [100, 18, 100, 56],
    render: () => schirmmutze('#2b3444', '#232c3c', '#c9a24b', '#c9a24b', <g>{eagle(150, 46.5, 0.62, '#c9a24b')}<circle cx={150} cy={53} r={2.1} fill="#232c3c" stroke="#c9a24b" strokeWidth={0.6} /></g>, true),
  },
  {
    id: 'hat-hj-cap', name: 'Фуражка HJ', category: 'headgear', fit: 'm', z: 70, bbox: [100, 18, 100, 56],
    render: () => (
      <g>
        <path d="M113 49 Q112 29 150 27 Q188 29 187 49 Q150 40 113 49Z" fill="#4a4038" {...outline} />
        {capVisor()}
        <path d="M113 49 Q150 41 187 49 L186 57 Q150 49 114 57 Z" fill="#2c2620" {...outline} />
        <path d="M150 39 L155.5 45 L150 51 L144.5 45Z" fill="#20222a" stroke="#e8e6dd" strokeWidth={0.9} />
        <path d="M150 41.5 L153 45 L150 48.5 L147 45Z" fill="#a03030" />
      </g>
    ),
  },
  { id: 'hat-rad-cap', name: 'Кепи RAD', category: 'headgear', fit: 'm', z: 70, bbox: [104, 22, 96, 48], render: () => schiffchen('#8a6a42', '#6e5230', '#2c2c30', <path d="M143.5 42 Q146 37 148.5 42 L147.6 43 L146.7 41.6 L146.7 45.5 L145.3 45.5 L145.3 41.6 L144.4 43Z" fill="#e8e6dd" />) },
  { id: 'hat-panzer-beret', name: 'Берет танкиста', category: 'headgear', fit: 'm', z: 70, bbox: [104, 18, 96, 46], render: () => hatBeret('#232323', <circle cx={141} cy={44} r={2.4} fill="#c9c9c4" />) },
  {
    id: 'hat-bowler', name: 'Котелок', category: 'headgear', fit: 'both', z: 70, bbox: [100, 16, 100, 48],
    render: () => (
      <g>
        <ellipse cx={150} cy={52} rx={44} ry={8.5} fill="#2c2c2e" {...outline} />
        <path d="M118 52 Q116 26 150 24 Q184 26 182 52 Q150 44 118 52Z" fill="#333336" {...outline} />
        <path d="M118 50 Q150 42 182 50 L182 54 Q150 46 118 54Z" fill="#1c1c1e" />
        <path d="M130 30 Q142 24 158 27" stroke="rgba(255,255,255,0.22)" strokeWidth={2.4} fill="none" />
      </g>
    ),
  },
  {
    id: 'hat-homburg-old', name: 'Хомбург (ст.)', category: 'headgear', fit: 'm', z: 70, bbox: [100, 16, 100, 48],
    render: () => (
      <g>
        <path d="M104 54 Q150 44 196 54 Q186 47 150 45 Q114 47 104 54Z" fill="#3e4046" {...outline} />
        <path d="M117 49 Q120 26 142 25 Q150 31 158 25 Q180 26 183 49 Q150 41 117 49Z" fill="#46484f" {...outline} />
        <path d="M118 46 Q150 38 182 46 L182 50 Q150 42 118 50Z" fill="#2c2c30" />
        <path d="M130 30 Q140 25 148 28" stroke="rgba(255,255,255,0.2)" strokeWidth={2.2} fill="none" />
      </g>
    ),
  },
  {
    id: 'hat-tophat', name: 'Цилиндр', category: 'headgear', fit: 'both', z: 70, bbox: [104, 0, 92, 60],
    render: () => (
      <g>
        <ellipse cx={150} cy={50} rx={42} ry={8} fill="#202024" {...outline} />
        <rect x={125} y={6} width={50} height={42} rx={4} fill="#26262a" {...outline} />
        <rect x={125} y={40} width={50} height={7} fill="#3e4046" />
        <path d="M131 10 L131 44" stroke="rgba(255,255,255,0.16)" strokeWidth={3} />
      </g>
    ),
  },
  {
    id: 'hat-tyrolean', name: 'Тирольская шляпа (ст.)', category: 'headgear', fit: 'both', z: 70, bbox: [100, 10, 100, 52],
    render: () => (
      <g>
        <path d="M106 54 Q150 44 194 54 Q184 48 150 46 Q116 48 106 54Z" fill="#34502f" {...outline} />
        <path d="M120 50 Q126 22 150 19 Q174 22 180 50 Q150 42 120 50Z" fill="#3f5a3a" {...outline} />
        <path d="M122 46 Q150 38 178 46" stroke="#6b4a2a" strokeWidth={2.6} fill="none" />
        <path d="M174 42 Q186 24 178 8 Q177 24 169 40Z" fill="#e8e6dd" {...outline} />
        <path d="M175 34 L180 30 M174 26 L179 22 M173 18 L177 14" stroke="#c9c4b4" strokeWidth={0.8} />
      </g>
    ),
  },
  {
    id: 'hat-pillbox', name: 'Шляпка-таблетка с вуалью', category: 'headgear', fit: 'f', z: 70, bbox: [104, 14, 92, 74],
    render: () => (
      <g>
        <g transform="rotate(-12 150 40)">
          <rect x={122} y={26} width={56} height={18} rx={9} fill="#7a3b4f" {...outline} />
          <path d="M122 36 Q150 30 178 36" stroke="#5c2c3c" strokeWidth={2.4} fill="none" />
        </g>
        <path d="M118 44 Q150 56 182 44 L178 80 Q150 92 122 80Z" fill="rgba(42,30,42,0.26)" />
        {[[130, 58], [150, 64], [170, 58], [140, 74], [160, 74]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={0.9} fill="rgba(30,20,30,0.5)" />
        ))}
      </g>
    ),
  },
  {
    id: 'hat-nurse-cap', name: 'Чепец медсестры', category: 'headgear', fit: 'f', z: 70, bbox: [108, 22, 84, 46],
    render: () => (
      <g>
        <path d="M120 46 Q150 28 180 46 L184 56 Q150 42 116 56Z" fill="#f4f1e8" {...outline} />
        <path d="M116 56 Q150 44 184 56 L182 62 Q150 51 118 62Z" fill="#e4e0d0" {...outline} />
        <g fill="#b03030"><rect x={147.8} y={36} width={4.4} height={12} /><rect x={144} y={39.8} width={12} height={4.4} /></g>
        <path d="M128 44 L124 52 M172 44 L176 52" stroke="#d9d4c2" strokeWidth={1} />
      </g>
    ),
  },

  /* ===== НАГРАДЫ И ЗНАКИ, расширенный набор ===== */
  { id: 'med-ek2-ribbon', name: 'Лента Железного креста II (в петлице)', category: 'decor', fit: 'both', z: 45, bbox: [120, 140, 60, 110], render: (_g, rig) => ribbon(rig.chest.x + 2, 206, 9, 5.5, EK_RIBBON) },
  {
    id: 'med-ek2', name: 'Железный крест II класса', category: 'decor', fit: 'both', z: 45, bbox: [120, 140, 60, 110],
    render: (_g, rig) => (
      <g>
        {ribbon(rig.chest.x + 2, 204, 8, 5, EK_RIBBON)}
        <path d={`M${rig.chest.x + 2} 207 L${rig.chest.x + 2} 212`} stroke="#20222a" strokeWidth={1.4} />
        {ironCross(rig.chest.x + 2, 218, 5.2)}
      </g>
    ),
  },
  { id: 'med-ek1', name: 'Железный крест I класса', category: 'decor', fit: 'both', z: 45, bbox: [120, 140, 60, 110], render: (_g, rig) => ironCross(rig.chest.x + 15, 204, 5.8) },
  {
    id: 'med-rk', name: 'Рыцарский крест', category: 'decor', fit: 'both', z: 47, bbox: [118, 110, 64, 60],
    render: (_g, rig) => {
      const nh = rig.neckHalf + 2;
      const d = `M${150 - nh} 126 Q150 152 ${150 + nh} 126`;
      return (
        <g>
          <path d={d} stroke="#20222a" strokeWidth={4.6} fill="none" />
          <path d={d} stroke="#e8e6dd" strokeWidth={2.7} fill="none" />
          <path d={d} stroke="#a03030" strokeWidth={1.1} fill="none" />
          {ironCross(150, 152, 5.8)}
        </g>
      );
    },
  },
  {
    id: 'med-dk', name: 'Немецкий крест (золото)', category: 'decor', fit: 'both', z: 45, bbox: [120, 140, 60, 110],
    render: (_g, rig) => (
      <g transform={`translate(${rig.chest.x - 17} 210)`}>
        <g fill="#c9a24b" stroke="#8a6a25" strokeWidth={0.5}>
          <path d="M0 -8 L2.2 -2.2 L8 0 L2.2 2.2 L0 8 L-2.2 2.2 L-8 0 L-2.2 -2.2Z" />
          <path d="M0 -8 L2.2 -2.2 L8 0 L2.2 2.2 L0 8 L-2.2 2.2 L-8 0 L-2.2 -2.2Z" transform="rotate(45)" />
        </g>
        <circle r={4.4} fill="#c9c9c4" stroke="#8a8a84" strokeWidth={0.5} />
        {ironCross(0, 0, 3.2)}
      </g>
    ),
  },
  {
    id: 'med-wound-black', name: 'Знак за ранение (чёрный)', category: 'decor', fit: 'both', z: 45, bbox: [120, 140, 60, 110],
    render: (_g, rig) => wreathBadge(rig.chest.x + 15, 222, 5, 6.4, '#3a3a3e', <path d={`M${rig.chest.x + 12} 222 Q${rig.chest.x + 15} 218 ${rig.chest.x + 18} 222 L${rig.chest.x + 18.6} 223.6 L${rig.chest.x + 11.4} 223.6Z`} fill="#2c2c30" />),
  },
  {
    id: 'med-wound-silver', name: 'Знак за ранение (серебро)', category: 'decor', fit: 'both', z: 45, bbox: [120, 140, 60, 110],
    render: (_g, rig) => wreathBadge(rig.chest.x + 15, 222, 5, 6.4, '#c9c9c4', <path d={`M${rig.chest.x + 12} 222 Q${rig.chest.x + 15} 218 ${rig.chest.x + 18} 222 L${rig.chest.x + 18.6} 223.6 L${rig.chest.x + 11.4} 223.6Z`} fill="#8a8a84" />),
  },
  {
    id: 'med-wound-gold', name: 'Знак за ранение (золото)', category: 'decor', fit: 'both', z: 45, bbox: [120, 140, 60, 110],
    render: (_g, rig) => wreathBadge(rig.chest.x + 15, 222, 5, 6.4, '#c9a24b', <path d={`M${rig.chest.x + 12} 222 Q${rig.chest.x + 15} 218 ${rig.chest.x + 18} 222 L${rig.chest.x + 18.6} 223.6 L${rig.chest.x + 11.4} 223.6Z`} fill="#8a6a25" />),
  },
  {
    id: 'med-ost', name: 'Медаль «За зимнюю кампанию»', category: 'decor', fit: 'both', z: 45, bbox: [120, 140, 60, 110],
    render: (_g, rig) => (
      <g>
        {ribbon(rig.chest.x + 15, 232, 7, 5, OST_RIBBON)}
        <path d={`M${rig.chest.x + 15} 235 L${rig.chest.x + 15} 239`} stroke="#8a8a84" strokeWidth={1.2} />
        <circle cx={rig.chest.x + 15} cy={243} r={4.2} fill="#9aa0a8" stroke="#6a6f76" strokeWidth={0.6} />
        <path d={`M${rig.chest.x + 13} 243 L${rig.chest.x + 17} 243 M${rig.chest.x + 15} 241 L${rig.chest.x + 15} 245`} stroke="#4a4e54" strokeWidth={0.8} />
      </g>
    ),
  },
  {
    id: 'med-panzer', name: 'Танковый штурмовой знак', category: 'decor', fit: 'both', z: 45, bbox: [120, 140, 60, 110],
    render: (_g, rig) => wreathBadge(rig.chest.x + 15, 240, 6.4, 7.6, '#9aa0a8', (
      <g fill="#3a3c40">
        <rect x={rig.chest.x + 11} y={239} width={8} height={3} rx={1.2} />
        <rect x={rig.chest.x + 13} y={236.6} width={3.6} height={2.4} rx={0.8} />
        <path d={`M${rig.chest.x + 16.4} 237.4 L${rig.chest.x + 20} 237.4`} stroke="#3a3c40" strokeWidth={0.8} />
      </g>
    )),
  },
  {
    id: 'med-infantry', name: 'Пехотный штурмовой знак', category: 'decor', fit: 'both', z: 45, bbox: [120, 140, 60, 110],
    render: (_g, rig) => wreathBadge(rig.chest.x - 17, 232, 6.4, 7.6, '#9aa0a8', (
      <g stroke="#4a4e54" strokeWidth={1} fill="#4a4e54">
        <circle cx={rig.chest.x - 17} cy={228.4} r={1.2} />
        <path d={`M${rig.chest.x - 17} 229.8 L${rig.chest.x - 17} 234 M${rig.chest.x - 19.4} 236.6 L${rig.chest.x - 17} 233.4 L${rig.chest.x - 14.6} 236.6 M${rig.chest.x - 19.6} 231 L${rig.chest.x - 14.4} 231`} fill="none" />
        <path d={`M${rig.chest.x - 20.4} 227.6 L${rig.chest.x - 13} 236.2`} strokeWidth={0.8} />
      </g>
    )),
  },
  {
    id: 'med-mutter-bronze', name: 'Крест Матери (бронза)', category: 'decor', fit: 'f', z: 45, bbox: [120, 140, 60, 110],
    render: (_g, rig) => (
      <g>
        {ribbon(rig.chest.x - 9, 214, 7, 13, MUTTER_RIBBON)}
        <g transform={`translate(${rig.chest.x - 9} 230)`}>
          <rect x={-2.2} y={-7} width={4.4} height={14} rx={0.8} fill="#a86a3a" stroke="#6e421e" strokeWidth={0.6} />
          <rect x={-5.5} y={-2.2} width={11} height={4.4} rx={0.8} fill="#a86a3a" stroke="#6e421e" strokeWidth={0.6} />
          <circle r={1.5} fill="#f2efe6" />
        </g>
      </g>
    ),
  },
  {
    id: 'med-mutter-silber', name: 'Крест Матери (серебро)', category: 'decor', fit: 'f', z: 45, bbox: [120, 140, 60, 110],
    render: (_g, rig) => (
      <g>
        {ribbon(rig.chest.x - 9, 214, 7, 13, MUTTER_RIBBON)}
        <g transform={`translate(${rig.chest.x - 9} 230)`}>
          <rect x={-2.2} y={-7} width={4.4} height={14} rx={0.8} fill="#c9c9c4" stroke="#8a8a84" strokeWidth={0.6} />
          <rect x={-5.5} y={-2.2} width={11} height={4.4} rx={0.8} fill="#c9c9c4" stroke="#8a8a84" strokeWidth={0.6} />
          <circle r={1.5} fill="#3a5a9a" />
        </g>
      </g>
    ),
  },
  {
    id: 'med-mutter-gold', name: 'Крест Матери (золото)', category: 'decor', fit: 'f', z: 45, bbox: [120, 140, 60, 110],
    render: (_g, rig) => (
      <g>
        {ribbon(rig.chest.x - 9, 214, 7, 13, MUTTER_RIBBON)}
        <g transform={`translate(${rig.chest.x - 9} 230)`}>
          <rect x={-2.2} y={-7} width={4.4} height={14} rx={0.8} fill="#c9a24b" stroke="#8a6a25" strokeWidth={0.6} />
          <rect x={-5.5} y={-2.2} width={11} height={4.4} rx={0.8} fill="#c9a24b" stroke="#8a6a25" strokeWidth={0.6} />
          <circle r={1.5} fill="#f2efe6" />
        </g>
      </g>
    ),
  },
  {
    id: 'med-partei-gold', name: 'Золотой партийный значок', category: 'decor', fit: 'both', z: 45, bbox: [120, 140, 60, 110],
    render: (_g, rig) => (
      <g>
        <circle cx={rig.chest.x - 17} cy={248} r={5.6} fill="#a03030" stroke="#c9a24b" strokeWidth={1.3} />
        <circle cx={rig.chest.x - 17} cy={248} r={3.4} fill="#e8e6dd" />
        <circle cx={rig.chest.x - 17} cy={248} r={1.5} fill="#20222a" />
      </g>
    ),
  },
  {
    id: 'med-partei', name: 'Партийный значок (малый)', category: 'decor', fit: 'both', z: 45, bbox: [120, 140, 60, 110],
    render: (_g, rig) => (
      <g>
        <circle cx={rig.chest.x - 7} cy={196} r={2.8} fill="#a03030" stroke="#c9a24b" strokeWidth={0.6} />
        <circle cx={rig.chest.x - 7} cy={196} r={1.7} fill="#e8e6dd" />
        <circle cx={rig.chest.x - 7} cy={196} r={0.8} fill="#20222a" />
      </g>
    ),
  },
  { id: 'ins-eagle-heer', name: 'Орёл на грудь (Heer)', category: 'decor', fit: 'both', z: 44, bbox: [120, 140, 60, 110], render: (_g, rig) => eagle(rig.chest.x - 17, 188, 1.35, '#b9b9b2') },
  { id: 'ins-epaulettes-heer', name: 'Погоны (фельдграу)', category: 'decor', fit: 'both', z: 44, bbox: [70, 130, 160, 50], render: (_g, rig) => epaulettes(rig, FG, '#a03030') },
  { id: 'ins-collar-heer', name: 'Петлицы (Heer)', category: 'decor', fit: 'both', z: 44, bbox: [118, 108, 64, 44], render: (_g, rig) => collarPatches(rig, '#39452f', '#c9c9c4') },
  { id: 'ins-collar-ss', name: 'Петлицы (СС)', category: 'decor', fit: 'both', z: 44, bbox: [118, 108, 64, 44], render: (_g, rig) => collarPatches(rig, '#20221f', '#c9c9c4', true) },
  {
    id: 'ins-chevrons', name: 'Нашивки звания (ефрейтор)', category: 'decor', fit: 'both', z: 44, bbox: [70, 150, 70, 60],
    render: (_g, rig) => {
      const a = rig.arms[0];
      const p = between(a.shoulder, a.elbow, 0.32);
      const ang = Math.atan2(a.elbow.y - a.shoulder.y, a.elbow.x - a.shoulder.x) * 180 / Math.PI;
      return (
        <g transform={`translate(${p.x} ${p.y}) rotate(${ang - 90})`}>
          <path d="M-8 -1 L0 -6 L8 -1 L8 2.4 L0 -2.6 L-8 2.4Z" fill="#9aa0a8" stroke="rgba(0,0,0,0.3)" strokeWidth={0.4} />
          <path d="M-8 4 L0 -1 L8 4 L8 7.4 L0 2.4 L-8 7.4Z" fill="#9aa0a8" stroke="rgba(0,0,0,0.3)" strokeWidth={0.4} />
        </g>
      );
    },
  },
  {
    id: 'ins-cuffband', name: 'Нарукавная лента', category: 'decor', fit: 'both', z: 44, bbox: [70, 180, 70, 60],
    render: (_g, rig) => {
      const a = rig.arms[0];
      const p = between(a.elbow, a.hand, 0.58);
      const ang = Math.atan2(a.hand.y - a.elbow.y, a.hand.x - a.elbow.x) * 180 / Math.PI;
      const w = rig.female ? 19 : 23;
      return (
        <g transform={`translate(${p.x} ${p.y}) rotate(${ang - 90})`}>
          <rect x={-w / 2} y={-4.5} width={w} height={9} fill="#2a2c30" stroke="rgba(0,0,0,0.4)" strokeWidth={0.5} />
          {[-0.3, -0.1, 0.1, 0.3].map((t) => (
            <path key={t} d={`M${t * w} -2 L${t * w + 1.4} 2`} stroke="#c9c9c4" strokeWidth={1} />
          ))}
        </g>
      );
    },
  },

  /* ===== АКСЕССУАРЫ, расширенный набор ===== */
  {
    id: 'acc-pince', name: 'Пенсне', category: 'accessories', fit: 'both', z: 65, bbox: [112, 62, 76, 60],
    render: () => (
      <g fill="rgba(255,255,255,0.08)" stroke="#c9a24b" strokeWidth={1.4}>
        <circle cx={134.4} cy={78} r={9} />
        <circle cx={165.6} cy={78} r={9} />
        <path d="M143.4,75 Q150,71 156.6,75" fill="none" strokeWidth={1.6} />
        <path d="M174.6,80 Q180,96 176,112 Q174,118 178,122" fill="none" strokeWidth={0.8} opacity={0.8} />
      </g>
    ),
  },
  {
    id: 'acc-pearls-old', name: 'Жемчужное ожерелье (ст.)', category: 'accessories', fit: 'f', z: 66, bbox: [124, 130, 52, 44],
    render: (_g, rig) => (
      <g>
        {Array.from({ length: 11 }).map((_, i) => {
          const t = i / 10;
          const x = (1 - t) * (1 - t) * 130 + 2 * (1 - t) * t * 150 + t * t * 170;
          const y = (1 - t) * (1 - t) * (rig.waist.y - 120) + 2 * (1 - t) * t * (rig.waist.y - 78) + t * t * (rig.waist.y - 120);
          return <circle key={i} cx={x} cy={y} r={3.2} fill="#f6f0e6" stroke="#c8bfae" strokeWidth={0.8} />;
        })}
      </g>
    ),
  },
  {
    id: 'acc-brooch-old', name: 'Брошь-камея (ст.)', category: 'accessories', fit: 'f', z: 66, bbox: [124, 150, 24, 24],
    render: (_g, rig) => (
      <g>
        <ellipse cx={rig.chest.x - 14} cy={rig.chest.y + 2} rx={7} ry={8.5} fill="#c9a24b" stroke="#8a6a25" strokeWidth={1} />
        <ellipse cx={rig.chest.x - 14} cy={rig.chest.y + 2} rx={4.5} ry={6} fill="#f2d9c8" />
        <path d={`M${rig.chest.x - 16} ${rig.chest.y - 2} q2,-2 4,0 q1,4 -2,7 q-3,-3 -2,-7 Z`} fill="#c98a7a" />
      </g>
    ),
  },
  {
    id: 'acc-scarf-old', name: 'Шёлковый шарф (ст.)', category: 'accessories', fit: 'both', z: 64, bbox: [116, 128, 68, 110],
    render: (_g, rig) => (
      <g>
        <path d={`M${150 - rig.neckHalf - 8} 118 Q150 134 ${150 + rig.neckHalf + 8} 118 L${150 + rig.neckHalf + 12} 134 Q150 152 ${150 - rig.neckHalf - 12} 134 Z`} fill="#b8452f" {...outline} />
        <path d={`M${rig.chest.x - 6} ${rig.chest.y + 6} L${rig.chest.x - 12} ${rig.waist.y + 8} L${rig.chest.x + 6} ${rig.waist.y + 10} L${rig.chest.x + 10} ${rig.chest.y + 8} Z`} fill="#b8452f" {...outline} />
        <path d={`M${rig.chest.x - 12} ${rig.waist.y + 8} L${rig.chest.x - 10} ${rig.waist.y + 16} M${rig.chest.x - 4} ${rig.waist.y + 9} L${rig.chest.x - 3} ${rig.waist.y + 17} M${rig.chest.x + 4} ${rig.waist.y + 10} L${rig.chest.x + 5} ${rig.waist.y + 18}`} stroke="#b8452f" strokeWidth={1.5} />
      </g>
    ),
  },
  {
    id: 'acc-watch-old', name: 'Карманные часы (ст.)', category: 'accessories', fit: 'm', z: 66, bbox: [146, 226, 40, 30],
    render: (_g, rig) => (
      <g>
        <path d={`M${rig.waist.x} ${rig.waist.y + 4} Q${rig.waist.x + 16} ${rig.waist.y + 24} ${rig.waist.x + 27} ${rig.waist.y + 12}`} stroke="#c9a24b" strokeWidth={1.5} fill="none" strokeDasharray="2 1.5" />
        <circle cx={rig.waist.x + 29} cy={rig.waist.y + 14} r={5} fill="#e9d9a8" stroke="#c9a24b" strokeWidth={1.2} />
        <path d={`M${rig.waist.x + 29} ${rig.waist.y + 11} L${rig.waist.x + 29} ${rig.waist.y + 14} L${rig.waist.x + 31.5} ${rig.waist.y + 15}`} stroke="#4a3a1a" strokeWidth={0.8} fill="none" />
      </g>
    ),
  },
  {
    id: 'acc-fox-old', name: 'Меховой воротник (ст.)', category: 'accessories', fit: 'f', z: 63, bbox: [96, 126, 108, 60],
    render: (_g, rig) => (
      <g>
        <path d={`M${150 - rig.neckHalf - 12} 124 Q150 102 ${150 + rig.neckHalf + 12} 124 Q${150 + rig.neckHalf + 16} 142 ${150 + rig.neckHalf + 6} 152 Q150 130 ${150 - rig.neckHalf - 6} 152 Q${150 - rig.neckHalf - 16} 142 ${150 - rig.neckHalf - 12} 124 Z`} fill="#8c6a4a" {...outline} />
        {Array.from({ length: 14 }).map((_, i) => (
          <path key={i} d={`M${108 + i * 6},${128 + Math.sin(i) * 3} l2,10`} stroke="rgba(255,240,220,0.35)" strokeWidth={1.2} />
        ))}
      </g>
    ),
  },
  { id: 'acc-belt-gott', name: 'Поясной ремень с бляхой', category: 'accessories', fit: 'm', z: 36, bbox: [96, 230, 108, 30], render: (_g, rig) => belt(rig, '#4a3220', '#8a8a84', '#5c5c56') },
  {
    id: 'acc-holster-p08', name: 'Кобура P08', category: 'accessories', fit: 'm', z: 37, bbox: [150, 280, 60, 60],
    render: (_g, rig) => {
      const h = rig.hips[1];
      return (
        <g transform={`translate(${h.x + 3} ${h.y + 8})`}>
          <path d="M5 -10 L11 -10 L11 0 L5 0Z" fill="#2e2019" />
          <path d="M0 0 L16 0 L15 22 Q8 25 1 22 Z" fill="#2e2019" {...outline} />
          <path d="M0 0 L16 0 L15.5 9 Q8 12 0.5 9 Z" fill="#3a2a1f" {...outline} />
          <circle cx={8} cy={9} r={1.4} fill="#c9a24b" />
        </g>
      );
    },
  },
  {
    id: 'acc-holster-p38', name: 'Кобура P38', category: 'accessories', fit: 'm', z: 37, bbox: [150, 280, 60, 54],
    render: (_g, rig) => {
      const h = rig.hips[1];
      return (
        <g transform={`translate(${h.x + 4} ${h.y + 8})`}>
          <path d="M4 -9 L10 -9 L10 0 L4 0Z" fill="#33261c" />
          <rect x={0} y={0} width={14} height={17} rx={3} fill="#33261c" {...outline} />
          <path d="M0 0 L14 0 L14 6 Q7 9 0 6Z" fill="#3f2f22" {...outline} />
          <circle cx={7} cy={6} r={1.2} fill="#9aa0a8" />
        </g>
      );
    },
  },
  {
    id: 'acc-mapcase-old', name: 'Планшетка', category: 'accessories', fit: 'm', z: 37, bbox: [80, 280, 60, 56],
    render: (_g, rig) => {
      const h = rig.hips[0];
      return (
        <g transform={`translate(${h.x - 23} ${h.y + 8})`}>
          <path d="M18 -10 L14 0" stroke="#4a3220" strokeWidth={2.4} />
          <rect x={0} y={0} width={20} height={15} rx={2} fill="#6b4a2a" {...outline} />
          <path d="M0 0 L20 0 L19 7 L1 7Z" fill="#5a3a20" {...outline} />
          <circle cx={10} cy={7} r={1.2} fill="#c9a24b" />
          <path d="M3 10 L17 10 M3 12.5 L13 12.5" stroke="rgba(0,0,0,0.25)" strokeWidth={0.8} />
        </g>
      );
    },
  },
  {
    id: 'acc-binoculars', name: 'Полевой бинокль', category: 'accessories', fit: 'm', z: 43, bbox: [120, 120, 60, 100],
    render: (_g, rig) => (
      <g>
        <path d={`M${rig.chest.x - 6} 128 L${rig.chest.x - 7} ${rig.chest.y + 4} M${rig.chest.x + 6} 128 L${rig.chest.x + 7} ${rig.chest.y + 4}`} stroke="#2a2a2a" strokeWidth={2} fill="none" />
        <rect x={rig.chest.x - 13} y={rig.chest.y + 4} width={11} height={19} rx={3.4} fill="#232323" {...outline} />
        <rect x={rig.chest.x + 2} y={rig.chest.y + 4} width={11} height={19} rx={3.4} fill="#232323" {...outline} />
        <rect x={rig.chest.x - 4} y={rig.chest.y + 8} width={8} height={5} fill="#1a1a1a" />
        <ellipse cx={rig.chest.x - 7.5} cy={rig.chest.y + 22} rx={4.4} ry={1.8} fill="#3a4a5a" />
        <ellipse cx={rig.chest.x + 7.5} cy={rig.chest.y + 22} rx={4.4} ry={1.8} fill="#3a4a5a" />
      </g>
    ),
  },
  {
    id: 'acc-pipe', name: 'Трубка', category: 'accessories', fit: 'm', z: 57, bbox: [180, 300, 50, 50],
    render: (_g, rig) => {
      const h = rig.arms[1].hand;
      return (
        <g transform={`translate(${h.x - 2} ${h.y - 18})`}>
          <path d="M0 2 L13 -4 L13.6 -1.6 L1.6 4.6Z" fill="#5a3a22" />
          <path d="M11 -12 Q19.5 -12.5 18.6 -4 Q17.8 2.4 11.6 1.4 Q8.4 -0.8 9.4 -6Z" fill="#6b4423" {...outline} />
          <ellipse cx={14.4} cy={-9} rx={3.2} ry={1.7} fill="#3a2412" />
          <path d="M15 -13 q3 -4 1 -8 q-2 -3.4 1.4 -7" stroke="rgba(200,200,200,0.5)" strokeWidth={1.1} fill="none" />
        </g>
      );
    },
  },
  {
    id: 'acc-cigarette', name: 'Сигарета', category: 'accessories', fit: 'both', z: 57, bbox: [180, 300, 46, 44],
    render: (_g, rig) => {
      const h = rig.arms[1].hand;
      return (
        <g transform={`translate(${h.x - 1} ${h.y - 14}) rotate(-24)`}>
          <rect x={0} y={-1} width={11} height={2.2} rx={1} fill="#f2efe6" stroke="rgba(0,0,0,0.25)" strokeWidth={0.3} />
          <rect x={9.4} y={-1} width={2} height={2.2} rx={0.8} fill="#d8843a" />
          <path d="M12 -1.4 q2.6 -2.6 1.4 -5.4 q-1.2 -2.4 1 -4.6" stroke="rgba(190,190,190,0.55)" strokeWidth={1} fill="none" />
        </g>
      );
    },
  },
  { id: 'acc-armband-party', name: 'Повязка (партийная)', category: 'accessories', fit: 'both', z: 46, bbox: [70, 150, 70, 60], render: (_g, rig) => armband(rig, 0, '#a03030', bandEmblem) },
  { id: 'acc-armband-hj', name: 'Повязка HJ', category: 'accessories', fit: 'both', z: 46, bbox: [70, 150, 70, 60], render: (_g, rig) => armband(rig, 0, '#a03030', <g><path d="M-4.4 0 L0 -3.8 L4.4 0 L0 3.8Z" fill="#e8e6dd" /><path d="M-2.6 0 L0 -2.2 L2.6 0 L0 2.2Z" fill="#20222a" /><path d="M-1 0 L0 -0.9 L1 0 L0 0.9Z" fill="#a03030" /></g>) },
  { id: 'acc-armband-rad', name: 'Повязка RAD', category: 'accessories', fit: 'both', z: 46, bbox: [70, 150, 70, 60], render: (_g, rig) => armband(rig, 0, '#e8e6dd', <path d="M-2.5 2 Q0 -3 2.5 2 L1.5 3 L0.6 1.6 L0.6 4.5 L-0.6 4.5 L-0.6 1.6 L-1.5 3Z" fill="#6a4a2a" />) },
  { id: 'acc-armband-drk', name: 'Повязка Красного Креста', category: 'accessories', fit: 'both', z: 46, bbox: [70, 150, 70, 60], render: (_g, rig) => armband(rig, 0, '#f8f6f0', <g fill="#b03030"><rect x={-1.4} y={-4.4} width={2.8} height={8.8} /><rect x={-4.4} y={-1.4} width={8.8} height={2.8} /></g>) },
  {
    id: 'acc-crutch', name: 'Костыль', category: 'accessories', fit: 'both', z: 34, bbox: [60, 150, 60, 450],
    render: (_g, rig) => {
      const a = rig.arms[0];
      const top = between(a.shoulder, a.elbow, 0.22);
      const footX = a.hand.x - 16;
      return (
        <g>
          <path d={`M${top.x - 7} ${top.y + 6} L${footX} 596`} stroke="#8a6a42" strokeWidth={4.4} strokeLinecap="round" />
          <path d={`M${top.x - 5} ${top.y + 6} L${footX + 2} 596`} stroke="rgba(0,0,0,0.25)" strokeWidth={1.2} />
          <ellipse cx={top.x - 7} cy={top.y + 4} rx={7.5} ry={3.6} fill="#6b4a2a" {...outline} />
          <path d={`M${top.x - 17} ${top.y + 62} L${top.x + 1} ${top.y + 60}`} stroke="#8a6a42" strokeWidth={3.6} strokeLinecap="round" />
          <circle cx={footX} cy={597} r={2.2} fill="#4a4a4a" />
        </g>
      );
    },
  },
  {
    id: 'acc-soldbuch', name: 'Зольдбух (книжка)', category: 'accessories', fit: 'both', z: 57, bbox: [60, 300, 50, 50],
    render: (_g, rig) => {
      const h = rig.arms[0].hand;
      return (
        <g transform={`translate(${h.x - 7} ${h.y - 22}) rotate(-9)`}>
          <rect x={0} y={0} width={14} height={18} rx={1} fill="#7d7f76" {...outline} />
          <rect x={0} y={0} width={2.4} height={18} fill="#5f615a" />
          {eagle(8, 5, 0.4, '#4a4a42')}
          <path d="M4 10 L12 10 M4 12.5 L12 12.5 M4 15 L9 15" stroke="#4a4a42" strokeWidth={0.7} />
        </g>
      );
    },
  },

  /* ═══════════ ОРТОПЕДИЧЕСКИЕ ПРИСПОСОБЛЕНИЯ (Геббельс / особенности) ═══════════ */
  {
    id: 'acc-orthopedic-brace', name: 'Ортопедическая шина (Геббельс)', category: 'accessories', fit: 'both', z: 51, bbox: [120, 390, 80, 210],
    mirrorable: true,
    render: (_g, rig, context) => {
      // Select the opposite limb rather than reflecting the whole pose.
      const leg = rig.legs[context?.mirrored ? 0 : 1];
      const ky = leg.knee.y;
      const kx = leg.knee.x;
      const ax = leg.ankle.x;
      const ay = leg.ankle.y;
      return (
        <g data-orthopedic-brace data-leg-side={leg.side}>
          {/* Верхняя бедренная манжета (кожа с ремешком и пряжкой) */}
          <path d={`M${kx - 14} ${ky - 36} L${kx + 14} ${ky - 36} L${kx + 13} ${ky - 24} L${kx - 13} ${ky - 24} Z`} fill="#4a2e18" stroke="#26170b" strokeWidth={0.8} />
          <path d={`M${kx - 14} ${ky - 30} L${kx + 14} ${ky - 30}`} stroke="#c8bca0" strokeWidth={0.7} strokeDasharray="2 1.5" />
          <rect x={kx - 3} y={ky - 33} width={6} height={6} rx={1} fill="#c9a24b" stroke="rgba(0,0,0,0.5)" strokeWidth={0.5} />
          {/* Подколенная манжета на верхней части голени */}
          <path d={`M${kx - 14} ${ky + 16} L${kx + 14} ${ky + 16} L${kx + 13} ${ky + 28} L${kx - 13} ${ky + 28} Z`} fill="#4a2e18" stroke="#26170b" strokeWidth={0.8} />
          <rect x={kx - 3} y={ky + 19} width={6} height={6} rx={1} fill="#c9a24b" stroke="rgba(0,0,0,0.5)" strokeWidth={0.5} />
          {/* Нижняя надлодыжечная манжета */}
          <path d={`M${ax - 10} ${ay - 14} L${ax + 10} ${ay - 14} L${ax + 9} ${ay - 4} L${ax - 9} ${ay - 4} Z`} fill="#4a2e18" stroke="#26170b" strokeWidth={0.8} />
          <rect x={ax - 2.5} y={ay - 11} width={5} height={5} rx={0.8} fill="#c9a24b" />
          {/* Две стальные полированные шины по бокам ноги */}
          {/* Внутренняя шина */}
          <path d={`M${kx - 12} ${ky - 42} L${kx - 12} ${ky} L${ax - 7.5} ${ay + 12}`} stroke="#d8dbe2" strokeWidth={2.4} fill="none" strokeLinecap="round" />
          <path d={`M${kx - 12} ${ky - 42} L${kx - 12} ${ky} L${ax - 7.5} ${ay + 12}`} stroke="#7a808c" strokeWidth={0.7} fill="none" />
          {/* Внешняя шина */}
          <path d={`M${kx + 12} ${ky - 42} L${kx + 12} ${ky} L${ax + 7.5} ${ay + 12}`} stroke="#d8dbe2" strokeWidth={2.4} fill="none" strokeLinecap="round" />
          <path d={`M${kx + 12} ${ky - 42} L${kx + 12} ${ky} L${ax + 7.5} ${ay + 12}`} stroke="#7a808c" strokeWidth={0.7} fill="none" />
          {/* Коленные шарниры (осевые диски с болтами) */}
          <circle cx={kx - 12} cy={ky} r={3.6} fill="#c2c6d0" stroke="#4a4e58" strokeWidth={0.8} />
          <circle cx={kx - 12} cy={ky} r={1.2} fill="#24262c" />
          <circle cx={kx + 12} cy={ky} r={3.6} fill="#c2c6d0" stroke="#4a4e58" strokeWidth={0.8} />
          <circle cx={kx + 12} cy={ky} r={1.2} fill="#24262c" />
          {/* Стремя в подошву */}
          <path d={`M${ax - 7.5} ${ay + 12} L${ax + 7.5} ${ay + 12}`} stroke="#b0b4be" strokeWidth={2} fill="none" />
        </g>
      );
    },
  },
  {
    id: 'acc-orthopedic-harness', name: 'Ортопедический подвес ноги', category: 'accessories', fit: 'both', z: 38, bbox: [120, 240, 80, 200],
    mirrorable: true,
    render: (_g, rig, context) => {
      const wy = rig.waist.y;
      const leg = rig.legs[context?.mirrored ? 0 : 1];
      const sd = leg.side;
      const ky = leg.knee.y;
      const kx = leg.knee.x;
      const start = { x: rig.waist.x + sd * 14, y: wy + 9 };
      const end = { x: kx + sd * 8, y: ky - 36 };
      const adjuster = between(start, end, 0.32);
      return (
        <g data-orthopedic-harness data-leg-side={sd}>
          {/* Пояс на талии */}
          <rect x={rig.waist.x - rig.waistHalf - 4} y={wy + 1} width={(rig.waistHalf + 4) * 2} height={8} fill="#3a2414" {...outline} />
          <rect x={rig.waist.x - 5} y={wy} width={10} height={10} rx={1.5} fill="#c9a24b" stroke="rgba(0,0,0,0.4)" strokeWidth={0.6} />
          {/* The strap and its buckle follow the selected thigh. */}
          <path d={`M${start.x} ${start.y} L${end.x} ${end.y}`} stroke="#3a2414" strokeWidth={3.2} fill="none" />
          <path d={`M${start.x} ${start.y} L${end.x} ${end.y}`} stroke="rgba(255,255,255,0.18)" strokeWidth={0.8} fill="none" />
          {/* Латунная регулировочная пряжка на бедре */}
          <rect x={adjuster.x - 3} y={adjuster.y - 4} width={6} height={8} rx={1} fill="#c9a24b" stroke="rgba(0,0,0,0.5)" strokeWidth={0.5} />
          {/* Латунный карабин крепления к аппарату */}
          <ellipse cx={end.x} cy={end.y} rx={2.2} ry={3.2} fill="#c9a24b" stroke="#7a5a1e" strokeWidth={0.6} />
        </g>
      );
    },
  },

  /* ═══════════ ПРЕДМЕТЫ И СИМВОЛЫ ГЕББЕЛЬСА ═══════════ */
  {
    id: 'acc-volksempfaenger', name: 'Радиоприёмник VE301 «Volksempfänger»', category: 'accessories', fit: 'both', z: 58, bbox: [160, 270, 90, 100],
    render: (_g, rig) => {
      const h = rig.arms[1].hand;
      const bx = h.x + 4;
      const by = h.y - 12;
      return (
        <g data-volksempfaenger>
          {/* Бакелитовый корпус со скругленным верхом */}
          <path d={`M${bx - 16} ${by + 36} L${bx - 16} ${by - 14} Q${bx} ${by - 26} ${bx + 16} ${by - 14} L${bx + 16} ${by + 36} Z`} fill="#23140b" stroke="#0f0703" strokeWidth={0.9} />
          {/* Внутренняя рамка */}
          <path d={`M${bx - 14} ${by + 34} L${bx - 14} ${by - 12} Q${bx} ${by - 23} ${bx + 14} ${by - 12} L${bx + 14} ${by + 34} Z`} fill="#2d1a0e" />
          {/* Круглый динамик с тканевой решеткой и орлом */}
          <circle cx={bx} cy={by - 2} r={10} fill="#c2a472" stroke="#1a0e07" strokeWidth={0.8} />
          {/* Тканевые лучи динамика */}
          <path d={`M${bx - 8} ${by - 2} L${bx + 8} ${by - 2} M${bx} ${by - 10} L${bx} ${by + 6}`} stroke="#8f7347" strokeWidth={1} />
          <path d={`M${bx - 6} ${by - 8} L${bx + 6} ${by + 4} M${bx - 6} ${by + 4} L${bx + 6} ${by - 8}`} stroke="#8f7347" strokeWidth={0.8} />
          {/* Стилизованный золоченый орел в центре динамика */}
          <circle cx={bx} cy={by - 2} r={2.8} fill="#24150d" />
          {eagle(bx, by - 2, 0.45, '#c9a24b')}
          {/* Круглая светящаяся шкала частот */}
          <circle cx={bx} cy={by + 16} r={6.5} fill="#e8d5a2" stroke="#140a05" strokeWidth={0.8} />
          <circle cx={bx} cy={by + 16} r={5} fill="none" stroke="#6e5428" strokeWidth={0.5} strokeDasharray="1.2 1" />
          {/* Стрелка настройки */}
          <path d={`M${bx} ${by + 16} L${bx + 2.5} ${by + 12}`} stroke="#a03030" strokeWidth={0.8} />
          <circle cx={bx} cy={by + 16} r={1.2} fill="#140a05" />
          {/* Две круглые бакелитовые ручки настройки */}
          <circle cx={bx - 9} cy={by + 27} r={3} fill="#140a05" stroke="#3d2414" strokeWidth={0.6} />
          <circle cx={bx + 9} cy={by + 27} r={3} fill="#140a05" stroke="#3d2414" strokeWidth={0.6} />
          {/* Надпись «VE 301» */}
          <text x={bx} y={by + 29} textAnchor="middle" fontSize={3.6} fill="#c9a24b" fontFamily="Georgia, serif" fontWeight="bold">VE 301</text>
        </g>
      );
    },
  },
  {
    id: 'acc-microphone-rrg', name: 'Студийный микрофон RRG', category: 'accessories', fit: 'both', z: 68, bbox: [160, 140, 70, 160],
    render: (_g, rig) => {
      const cx = rig.chest.x + 30;
      const cy = rig.chest.y - 12;
      return (
        <g data-microphone-rrg>
          {/* Вертикальная хромированная стойка */}
          <path d={`M${cx} ${cy + 18} L${cx} ${cy + 130}`} stroke="#bcc2ce" strokeWidth={3.4} strokeLinecap="round" />
          <path d={`M${cx - 0.7} ${cy + 18} L${cx - 0.7} ${cy + 130}`} stroke="#ffffff" strokeWidth={0.9} />
          {/* Регулировочная латунная муфта */}
          <rect x={cx - 4} y={cy + 42} width={8} height={6} rx={1} fill="#8a8f9a" stroke="#4a505c" strokeWidth={0.6} />
          {/* Хромированное кольцо-рама микрофона */}
          <circle cx={cx} cy={cy} r={18} fill="none" stroke="#dce0e8" strokeWidth={3.2} />
          <circle cx={cx} cy={cy} r={18} fill="none" stroke="#7a8290" strokeWidth={0.8} />
          {/* 8 пружин подвеса капсюля */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
            const rad = (a * Math.PI) / 180;
            const x1 = cx + Math.cos(rad) * 9.5;
            const y1 = cy + Math.sin(rad) * 9.5;
            const x2 = cx + Math.cos(rad) * 16.5;
            const y2 = cy + Math.sin(rad) * 16.5;
            return <path key={a} d={`M${x1} ${y1} L${x2} ${y2}`} stroke="#6b7280" strokeWidth={0.9} strokeDasharray="1.2 1" />;
          })}
          {/* Центральный микрофонный капсюль */}
          <circle cx={cx} cy={cy} r={9.5} fill="#23272e" stroke="#c0c6d2" strokeWidth={1} />
          <circle cx={cx} cy={cy} r={7.5} fill="#2f3540" />
          {/* Металлическая защитная сетка */}
          <circle cx={cx} cy={cy} r={6.5} fill="none" stroke="#8b94a4" strokeWidth={0.5} strokeDasharray="1 1" />
          {/* Красная эмалевая шильда «RRG» */}
          <rect x={cx - 7} y={cy + 10} width={14} height={5.5} rx={1} fill="#8a2024" stroke="#c9a24b" strokeWidth={0.6} />
          <text x={cx} y={cy + 14.2} textAnchor="middle" fontSize={3.6} fill="#f4f0e6" fontFamily="sans-serif" fontWeight="bold">RRG</text>
        </g>
      );
    },
  },
  {
    id: 'acc-angriff-paper', name: 'Газета «Der Angriff»', category: 'accessories', fit: 'both', z: 58, bbox: [40, 270, 90, 90],
    render: (_g, rig) => {
      const h = rig.arms[0].hand;
      const gx = h.x - 14;
      const gy = h.y - 18;
      return (
        <g transform={`translate(${gx} ${gy}) rotate(8)`} data-angriff-paper>
          {/* Лист газеты */}
          <rect x={-14} y={-4} width={34} height={46} rx={1} fill="#ebe5d2" stroke="#4a4234" strokeWidth={0.8} />
          <rect x={-12} y={-2} width={30} height={42} fill="#f3eedc" />
          {/* Готический заголовок DER ANGRIFF */}
          <text x={3} y={4} textAnchor="middle" fontSize={4.2} fill="#141414" fontFamily="Georgia, serif" fontWeight="bold" letterSpacing="0.4">DER ANGRIFF</text>
          <path d="M-10 6 L16 6" stroke="#141414" strokeWidth={0.7} />
          <text x={3} y={8.5} textAnchor="middle" fontSize={1.9} fill="#444" fontFamily="sans-serif">Tageszeitung der DAF · Berlin</text>
          <path d="M-10 9.5 L16 9.5" stroke="#141414" strokeWidth={0.5} />
          {/* Фотография в газете */}
          <rect x={-9} y={11} width={11} height={13} fill="#b8b09c" stroke="#444" strokeWidth={0.4} />
          <path d="M-9 20 Q-3 15 2 22" fill="none" stroke="#6e6858" strokeWidth={0.8} />
          {/* Колонки газетного текста */}
          {Array.from({ length: 6 }).map((_, i) => (
            <path key={i} d={`M4 ${12 + i * 2.2} L15 ${12 + i * 2.2}`} stroke="#333" strokeWidth={0.6} />
          ))}
          {Array.from({ length: 7 }).map((_, i) => (
            <path key={i} d={`M-9 ${26 + i * 2} L15 ${26 + i * 2}`} stroke="#333" strokeWidth={0.55} />
          ))}
        </g>
      );
    },
  },
  {
    id: 'acc-goebbels-diary', name: 'Дневник рейхсминистра и перо', category: 'accessories', fit: 'both', z: 58, bbox: [160, 270, 80, 80],
    render: (_g, rig) => {
      const h = rig.arms[1].hand;
      const dx = h.x - 2;
      const dy = h.y - 14;
      return (
        <g transform={`translate(${dx} ${dy}) rotate(-12)`} data-goebbels-diary>
          {/* Толстый кожаный фолиант в сафьяне */}
          <rect x={-6} y={-6} width={26} height={34} rx={2} fill="#4a1820" stroke="#24080c" strokeWidth={0.9} />
          {/* Золотой обрез страниц */}
          <rect x={18} y={-4} width={3} height={30} fill="#c9a24b" stroke="#7a5a1e" strokeWidth={0.4} />
          {/* Золотое тиснение на обложке */}
          <rect x={-3} y={-3} width={18} height={28} rx={1} fill="none" stroke="#c9a24b" strokeWidth={0.6} opacity={0.85} />
          <circle cx={6} cy={11} r={3.2} fill="none" stroke="#c9a24b" strokeWidth={0.6} />
          <circle cx={6} cy={11} r={1.2} fill="#c9a24b" />
          {/* Красная шелковая лента-закладка (ляссе) */}
          <path d="M6 22 Q4 32 10 38" stroke="#a02428" strokeWidth={1.8} fill="none" strokeLinecap="round" />
          {/* Перьевая ручка Pelikan с золотым пером */}
          <g transform="translate(18 -12) rotate(42)">
            <rect x={-1.4} y={-14} width={2.8} height={20} rx={1} fill="#141416" stroke="#000" strokeWidth={0.4} />
            <rect x={-1.5} y={-4} width={3} height={2} fill="#c9a24b" />
            <path d="M-1.4 6 L1.4 6 L0 12 Z" fill="#c9a24b" stroke="#7a5a1e" strokeWidth={0.4} />
            <path d="M0 6 L0 10.5" stroke="#241a0e" strokeWidth={0.4} />
          </g>
        </g>
      );
    },
  },
  {
    id: 'acc-film-camera', name: 'Кинокамера хроники UFA', category: 'accessories', fit: 'both', z: 58, bbox: [150, 260, 90, 90],
    render: (_g, rig) => {
      const h = rig.arms[1].hand;
      const cx = h.x + 8;
      const cy = h.y - 6;
      return (
        <g transform={`translate(${cx} ${cy})`} data-film-camera>
          {/* Кожаный ремень через плечо к шее */}
          <path d={`M-10 -4 L${rig.shoulders[0].x - cx + 18} ${rig.shoulders[0].y - cy + 4}`} stroke="#3a2414" strokeWidth={2.4} fill="none" />
          {/* Круглый двухкассетный магазин пленки 35мм сверху */}
          <circle cx={-6} cy={-12} r={8.5} fill="#1f2228" stroke="#0d0e12" strokeWidth={0.8} />
          <circle cx={7} cy={-12} r={8.5} fill="#1f2228" stroke="#0d0e12" strokeWidth={0.8} />
          <circle cx={-6} cy={-12} r={3} fill="#3a404c" />
          <circle cx={7} cy={-12} r={3} fill="#3a404c" />
          {/* Корпус камеры */}
          <rect x={-14} y={-6} width={28} height={22} rx={2} fill="#262a32" stroke="#121418" strokeWidth={0.9} />
          {/* Револьверная турель объективов (справа/впереди) */}
          <circle cx={14} cy={3} r={5.5} fill="#3a404c" stroke="#121418" strokeWidth={0.8} />
          <rect x={16} y={-2} width={7} height={4} rx={1} fill="#9aa0a8" stroke="#333" strokeWidth={0.5} />
          <rect x={16} y={4} width={5} height={3} rx={1} fill="#c9a24b" stroke="#333" strokeWidth={0.5} />
          {/* Оптический визир */}
          <rect x={-12} y={-9} width={22} height={4} rx={1} fill="#121418" />
          <circle cx={-11} cy={-7} r={1.2} fill="#4a7090" />
          {/* Боковая ручка взвода */}
          <path d="M-14 6 L-19 6 L-19 12" stroke="#9aa0a8" strokeWidth={1.4} fill="none" />
          <circle cx={-19} cy={12} r={1.5} fill="#333" />
        </g>
      );
    },
  },

  /* ═══════════ ЭРЗАЦ-МОДА (война: замена материалов) ═══════════ */
  {
    id: 'shoe-fishskin', name: 'Туфли из рыбьей кожи', category: 'shoes', fit: 'both', z: 50, bbox: [90, 546, 122, 58],
    render: (_g, rig) => shoes(rig, 'fishskin'),
  },
  {
    id: 'shoe-fishskin-boot', name: 'Ботинки из рыбьей кожи', category: 'shoes', fit: 'both', z: 50, bbox: [90, 520, 122, 84],
    render: (_g, rig) => (
      <g>
        {boots(rig, '#6a7a6a', 470)}
        {/* чешуйчатая фактура поверх ботинка */}
        {rig.legs.map((leg) => (
          <g key={leg.side}>
            {Array.from({ length: 16 }, (_, i) => {
              const col = i % 4;
              const row = Math.floor(i / 4);
              return <circle key={i} cx={leg.knee.x - 12 + col * 8 + (row % 2) * 4} cy={478 + row * 7} r={2.6} fill="none" stroke="#4a5a4a" strokeWidth={0.55} opacity={0.55} />;
            })}
          </g>
        ))}
      </g>
    ),
  },
  {
    id: 'shoe-plexiglas', name: 'Туфли из плексигласа', category: 'shoes', fit: 'f', z: 50, bbox: [90, 546, 122, 58],
    render: (_g, rig) => shoes(rig, 'plexiglas'),
  },
  {
    id: 'shoe-woodsole', name: 'Туфли на деревянной подошве', category: 'shoes', fit: 'both', z: 50, bbox: [90, 542, 122, 62],
    render: (_g, rig) => shoes(rig, 'woodsole'),
  },
  {
    id: 'hat-newspaper', name: 'Шляпа из газеты', category: 'headgear', fit: 'both', z: 72, bbox: [100, 18, 100, 60],
    render: () => (
      <g>
        {/* поля из газетного листа */}
        <ellipse cx={150} cy={58} rx={46} ry={9} fill="#d8d2c0" {...outline} />
        {/* тулья из сложенной газеты */}
        <path d="M120 56 Q120 26 150 24 Q180 26 180 56 Q150 48 120 56Z" fill="#e2dcc8" {...outline} />
        {/* сгибы бумаги */}
        <path d="M126 30 L174 30 M124 38 L176 38 M122 48 L178 48" stroke="#b8b2a0" strokeWidth={0.7} />
        <path d="M150 24 L150 52" stroke="#b8b2a0" strokeWidth={0.6} />
        {/* строчки газетного текста */}
        {Array.from({ length: 5 }, (_, i) => (
          <path key={i} d={`M${128 + (i % 2) * 4} ${31 + i * 5} L${172 - (i % 2) * 4} ${31 + i * 5}`} stroke="#8a8578" strokeWidth={0.45} opacity={0.65} />
        ))}
        {/* шнурок-завязка */}
        <path d="M124 52 Q150 44 176 52" fill="none" stroke="#a89878" strokeWidth={1.2} />
      </g>
    ),
  },
  {
    id: 'hat-plexiglas-crown', name: 'Корона из плексигласа', category: 'headgear', fit: 'both', z: 72, bbox: [106, 6, 88, 60],
    render: () => (
      <g>
        {/* прозрачный обруч-основа */}
        <path d="M112 52 Q150 46 188 52 L186 58 Q150 52 114 58 Z" fill="#cfe0dc" stroke="rgba(120,150,145,0.6)" strokeWidth={0.7} opacity={0.75} />
        {/* зубцы короны из плексигласа */}
        {[0, 1, 2, 3, 4].map((i) => {
          const x = 116 + i * 17;
          const h = i === 2 ? 34 : 26;
          return (
            <g key={i}>
              <path d={`M${x} 50 L${x + 3} ${50 - h} L${x + 9} ${50 - h} L${x + 12} 50 Z`} fill="#dcebe7" stroke="rgba(120,150,145,0.6)" strokeWidth={0.7} opacity={0.8} />
              <path d={`M${x + 4} ${48 - h * 0.7} L${x + 9} ${48 - h * 0.7}`} stroke="#ffffff" strokeWidth={0.5} opacity={0.5} />
            </g>
          );
        })}
        {/* «хрустальные» грани */}
        {[[128, 34], [146, 28], [164, 34]].map(([x, y], i) => (
          <g key={`gem-${i}`}>
            <circle cx={x} cy={y} r={3.4} fill="#e8f4f0" stroke="rgba(120,150,145,0.7)" strokeWidth={0.6} opacity={0.85} />
            <circle cx={x - 1} cy={y - 1} r={1.2} fill="#ffffff" opacity={0.7} />
          </g>
        ))}
        {/* блики пластика */}
        <path d="M116 54 L184 54" stroke="#ffffff" strokeWidth={0.6} opacity={0.45} />
      </g>
    ),
  },

  /* ═══════════ ЛЮЦИТОВЫЕ УКРАШЕНИЯ (Франция, 40-е) ═══════════ */
  { id: 'lucite-earrings-bakelite', name: 'Серьги-круги (бакелит)', category: 'accessories', fit: 'f', z: 66, bbox: [108, 68, 84, 30],
    render: () => (
      <g>
        {[-1, 1].map((s) => (
          <g key={s} transform={`translate(${150 + s * 34} 82)`}>
            <circle cx={0} cy={0} r={5.4} fill="#d8b46a" {...outline} />
            <circle cx={0} cy={0} r={3.4} fill="none" stroke="#b8903f" strokeWidth={1.1} />
            <circle cx={-1.4} cy={-1.4} r={1.3} fill="#fff6e0" opacity={0.7} />
          </g>
        ))}
      </g>
    ),
  },
  { id: 'lucite-earrings-teardrop', name: 'Серьги-капли (люцит)', category: 'accessories', fit: 'f', z: 66, bbox: [108, 68, 84, 40],
    render: () => (
      <g>
        {[-1, 1].map((s) => (
          <g key={s} transform={`translate(${150 + s * 34} 80)`}>
            <circle cx={0} cy={0} r={1.5} fill="#c9a24b" />
            <path d="M0 2 C-4 5 -4.6 10 -2.6 13.4 C-1 15.8 1 15.8 2.6 13.4 C4.6 10 4 5 0 2Z" fill="#cfe0dc" stroke="rgba(120,150,145,0.6)" strokeWidth={0.6} opacity={0.85} />
            <path d="M-1 6 Q0 9 1.2 12" stroke="#ffffff" strokeWidth={0.55} opacity={0.55} fill="none" />
          </g>
        ))}
      </g>
    ),
  },
  { id: 'lucite-necklace-beads', name: 'Ожерелье из шариков', category: 'accessories', fit: 'f', z: 66, bbox: [118, 118, 64, 52],
    render: (_g, rig) => (
      <g>
        {Array.from({ length: 15 }, (_, i) => {
          const t = i / 14;
          const x0 = 150 - rig.neckHalf - 4;
          const x1 = 150 + rig.neckHalf + 4;
          const x = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * 150 + t ** 2 * x1;
          const y = (1 - t) ** 2 * 124 + 2 * (1 - t) * t * (rig.chest.y - 18) + t ** 2 * 124;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={3.4} fill="#d8cfa8" {...outline} />
              <circle cx={x - 0.9} cy={y - 0.9} r={1.1} fill="#fffbe8" opacity={0.6} />
            </g>
          );
        })}
      </g>
    ),
  },
  { id: 'lucite-necklace-fruit', name: 'Ожерелье «фруктовое»', category: 'accessories', fit: 'f', z: 66, bbox: [118, 118, 64, 56],
    render: (_g, rig) => (
      <g>
        {Array.from({ length: 13 }, (_, i) => {
          const t = i / 12;
          const x0 = 150 - rig.neckHalf - 3;
          const x1 = 150 + rig.neckHalf + 3;
          const x = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * 150 + t ** 2 * x1;
          const y = (1 - t) ** 2 * 124 + 2 * (1 - t) * t * (rig.chest.y - 14) + t ** 2 * 124;
          const hue = [200, 340, 120, 45, 280][i % 5];
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={3.8} fill={`hsl(${hue} 45% 62%)`} {...outline} />
              <circle cx={x - 1} cy={y - 1} r={1.2} fill="#fff" opacity={0.5} />
              <path d={`M${x} ${y - 3.8} l1.2 -2`} stroke="#5a4a2a" strokeWidth={0.6} />
            </g>
          );
        })}
      </g>
    ),
  },
  { id: 'lucite-brooch-flower', name: 'Брошь-камея из люцита', category: 'accessories', fit: 'f', z: 66, bbox: [124, 144, 52, 40],
    render: (_g, rig) => (
      <g>
        <ellipse cx={rig.chest.x - 16} cy={rig.chest.y - 12} rx={7.5} ry={9} fill="#cfe0dc" stroke="rgba(120,150,145,0.6)" strokeWidth={0.7} opacity={0.85} />
        <ellipse cx={rig.chest.x - 16} cy={rig.chest.y - 12} rx={4.8} ry={6.2} fill="#f0e6d0" opacity={0.9} />
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <ellipse key={a} cx={rig.chest.x - 16 + Math.cos((a * Math.PI) / 180) * 3} cy={rig.chest.y - 15 + Math.sin((a * Math.PI) / 180) * 3} rx={1.8} ry={1.2} fill="#d8c8e0" opacity={0.85} transform={`rotate(${a} ${rig.chest.x - 16} ${rig.chest.y - 15})`} />
        ))}
        <circle cx={rig.chest.x - 16} cy={rig.chest.y - 15} r={1.6} fill="#c9a24b" />
      </g>
    ),
  },
  { id: 'lucite-brooch-bow', name: 'Брошь-бант (люцит)', category: 'accessories', fit: 'f', z: 66, bbox: [124, 144, 52, 36],
    render: (_g, rig) => (
      <g>
        <path d={`M${rig.chest.x - 14} ${rig.chest.y - 10} L${rig.chest.x - 24} ${rig.chest.y - 17} L${rig.chest.x - 23} ${rig.chest.y - 5} Z M${rig.chest.x - 14} ${rig.chest.y - 10} L${rig.chest.x - 4} ${rig.chest.y - 18} L${rig.chest.x - 4} ${rig.chest.y - 6} Z`} fill="#d8e8e4" stroke="rgba(120,150,145,0.6)" strokeWidth={0.7} opacity={0.85} />
        <circle cx={rig.chest.x - 14} cy={rig.chest.y - 10} r={2.6} fill="#cfe0dc" stroke="rgba(120,150,145,0.7)" strokeWidth={0.6} />
        <circle cx={rig.chest.x - 15} cy={rig.chest.y - 11} r={0.9} fill="#fff" opacity={0.65} />
      </g>
    ),
  },
  { id: 'lucite-brooch-star', name: 'Брошь-звезда (люцит)', category: 'accessories', fit: 'both', z: 66, bbox: [124, 144, 52, 40],
    render: (_g, rig) => {
      const cx = rig.chest.x - 16;
      const cy = rig.chest.y - 12;
      return (
        <g>
          {[0, 72, 144, 216, 288].map((a) => (
            <path key={a} d={`M${cx} ${cy} L${cx + Math.cos(((a - 36) * Math.PI) / 180) * 3.4} ${cy + Math.sin(((a - 36) * Math.PI) / 180) * 3.4} L${cx + Math.cos((a * Math.PI) / 180) * 7.6} ${cy + Math.sin((a * Math.PI) / 180) * 7.6} Z`} fill="#dcebe7" stroke="rgba(120,150,145,0.6)" strokeWidth={0.5} opacity={0.88} />
          ))}
          <circle cx={cx} cy={cy} r={2.2} fill="#e8f4f0" opacity={0.9} />
          <circle cx={cx - 0.7} cy={cy - 0.7} r={0.8} fill="#fff" opacity={0.75} />
        </g>
      );
    },
  },
  { id: 'lucite-brooch-leaf', name: 'Брошь-лист (люцит)', category: 'accessories', fit: 'both', z: 66, bbox: [124, 144, 52, 40],
    render: (_g, rig) => (
      <g>
        <path d={`M${rig.chest.x - 16} ${rig.chest.y - 18} Q${rig.chest.x - 22} ${rig.chest.y - 12} ${rig.chest.x - 16} ${rig.chest.y - 5} Q${rig.chest.x - 10} ${rig.chest.y - 12} ${rig.chest.x - 16} ${rig.chest.y - 18} Z`} fill="#cfe0d4" stroke="rgba(110,145,130,0.6)" strokeWidth={0.7} opacity={0.88} />
        <path d={`M${rig.chest.x - 16} ${rig.chest.y - 17} L${rig.chest.x - 16} ${rig.chest.y - 6}`} stroke="#8aa894" strokeWidth={0.6} />
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M${rig.chest.x - 16} ${rig.chest.y - 15 + i * 3.2} L${rig.chest.x - 20 + i * 1.5} ${rig.chest.y - 16 + i * 3.2} M${rig.chest.x - 16} ${rig.chest.y - 15 + i * 3.2} L${rig.chest.x - 12 - i * 1.5} ${rig.chest.y - 16 + i * 3.2}`} stroke="#8aa894" strokeWidth={0.4} opacity={0.7} />
        ))}
      </g>
    ),
  },
  { id: 'lucite-brooch-bird', name: 'Брошь-птица (люцит)', category: 'accessories', fit: 'both', z: 66, bbox: [124, 144, 52, 38],
    render: (_g, rig) => (
      <g>
        <path d={`M${rig.chest.x - 22} ${rig.chest.y - 8} Q${rig.chest.x - 18} ${rig.chest.y - 16} ${rig.chest.x - 10} ${rig.chest.y - 13} Q${rig.chest.x - 8} ${rig.chest.y - 9} ${rig.chest.x - 12} ${rig.chest.y - 6} Q${rig.chest.x - 17} ${rig.chest.y - 3} ${rig.chest.x - 22} ${rig.chest.y - 8} Z`} fill="#dcebe7" stroke="rgba(120,150,145,0.6)" strokeWidth={0.7} opacity={0.88} />
        <circle cx={rig.chest.x - 19} cy={rig.chest.y - 12} r={1.1} fill="#4a4a42" />
        <path d={`M${rig.chest.x - 22} ${rig.chest.y - 8} L${rig.chest.x - 26} ${rig.chest.y - 6}`} stroke="#c9a24b" strokeWidth={1} />
        <path d={`M${rig.chest.x - 14} ${rig.chest.y - 7} L${rig.chest.x - 11} ${rig.chest.y - 3}`} stroke="#d9c39a" strokeWidth={0.8} />
      </g>
    ),
  },
  { id: 'lucite-bracelet-bangle', name: 'Браслет-кольцо (люцит)', category: 'accessories', fit: 'both', z: 56, bbox: [60, 290, 180, 70],
    render: (_g, rig) => rig.arms.map((arm, i) => (
      <g key={i} transform={arm.handTransform}>
        <rect x={-8.5} y={-19} width={17} height={11} rx={5.5} fill="#cfe0dc" stroke="rgba(120,150,145,0.6)" strokeWidth={0.7} opacity={0.85} />
        <path d="M-7 -14.5 L7 -14.5" stroke="#ffffff" strokeWidth={0.6} opacity={0.5} />
        <circle cx={-2} cy={-13} r={1.4} fill="#c9a24b" opacity={0.8} />
      </g>
    )),
  },
  { id: 'lucite-bracelet-cuff', name: 'Браслет-обруч (бакелит)', category: 'accessories', fit: 'both', z: 56, bbox: [60, 290, 180, 70],
    render: (_g, rig) => rig.arms.map((arm, i) => (
      <g key={i} transform={arm.handTransform}>
        <rect x={-9} y={-21} width={18} height={13} rx={4} fill="#d8b46a" stroke="rgba(140,110,50,0.6)" strokeWidth={0.7} />
        <rect x={-9} y={-18.5} width={18} height={2.4} fill="#b8903f" opacity={0.7} />
        <path d="M-7 -14 L7 -14" stroke="#fff6e0" strokeWidth={0.5} opacity={0.5} />
      </g>
    )),
  },
  { id: 'lucite-clutch', name: 'Сумочка-клатч (люцит)', category: 'accessories', fit: 'f', z: 56, bbox: [170, 300, 70, 80],
    render: (_g, rig) => {
      const h = rig.arms[1].hand;
      return (
        <g>
          <path d={`M${h.x - 15},${h.y + 16} L${h.x + 15},${h.y + 16} L${h.x + 18},${h.y + 50} L${h.x - 18},${h.y + 50} Z`} fill="#cfe0dc" opacity={0.85} {...outline} />
          <path d={`M${h.x - 15},${h.y + 16} L${h.x + 15},${h.y + 16} L${h.x + 13},${h.y + 30} L${h.x - 13},${h.y + 30} Z`} fill="#b8cec8" opacity={0.5} />
          <rect x={h.x - 5} y={h.y + 18} width={10} height={4} rx={1.5} fill="#c9a24b" stroke="rgba(0,0,0,0.3)" strokeWidth={0.5} />
          <path d={`M${h.x - 14},${h.y + 40} L${h.x + 14},${h.y + 40}`} stroke="#ffffff" strokeWidth={0.6} opacity={0.4} />
          <path d={`M${h.x - 6},${h.y + 14} Q${h.x},${h.y + 22} ${h.x + 6},${h.y + 14}`} fill="none" stroke="#c9a24b" strokeWidth={1.4} />
        </g>
      );
    },
  },
  { id: 'lucite-hairpin', name: 'Шпилька с шаром (люцит)', category: 'accessories', fit: 'f', z: 68, bbox: [108, 26, 84, 34],
    render: () => (
      <g>
        <circle cx={172} cy={34} r={5.2} fill="#dcebe7" stroke="rgba(120,150,145,0.7)" strokeWidth={0.7} opacity={0.88} />
        <circle cx={172} cy={34} r={2.8} fill="none" stroke="#9ab8b0" strokeWidth={0.7} opacity={0.6} />
        <circle cx={170.6} cy={32.6} r={1.2} fill="#ffffff" opacity={0.7} />
        <path d="M172 39 L172 50" stroke="#c9a24b" strokeWidth={1.5} />
      </g>
    ),
  },
  { id: 'lucite-ring', name: 'Кольцо с камнем (люцит)', category: 'accessories', fit: 'both', z: 57, bbox: [60, 300, 50, 44],
    render: (_g, rig) => rig.arms[1] ? (
      <g transform={rig.arms[1].handTransform}>
        <circle cx={3} cy={6} r={4} fill="#cfe0dc" stroke="rgba(120,150,145,0.7)" strokeWidth={0.6} opacity={0.9} />
        <circle cx={3} cy={6} r={1.8} fill="#d8b0c0" opacity={0.75} />
        <circle cx={2.2} cy={5} r={0.7} fill="#fff" opacity={0.7} />
      </g>
    ) : null,
  },
  { id: 'lucite-scarf-clip', name: 'Зажим для шарфа (люцит)', category: 'accessories', fit: 'both', z: 66, bbox: [130, 130, 40, 34],
    render: (_g, rig) => (
      <g>
        <rect x={rig.chest.x - 8} y={rig.chest.y - 22} width={16} height={12} rx={3} fill="#cfe0dc" stroke="rgba(120,150,145,0.7)" strokeWidth={0.7} opacity={0.88} />
        <circle cx={rig.chest.x} cy={rig.chest.y - 16} r={3.6} fill="#dcebe7" stroke="rgba(120,150,145,0.6)" strokeWidth={0.6} opacity={0.9} />
        <circle cx={rig.chest.x - 1} cy={rig.chest.y - 17} r={1.1} fill="#fff" opacity={0.7} />
      </g>
    ),
  },
  { id: 'lucite-buttons-set', name: 'Пуговицы из люцита', category: 'accessories', fit: 'both', z: 66, bbox: [130, 140, 40, 60],
    render: (_g, rig) => (
      <g>
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <circle cx={rig.chest.x} cy={rig.chest.y + 6 + i * 14} r={3.2} fill="#dcebe7" stroke="rgba(120,150,145,0.7)" strokeWidth={0.6} opacity={0.9} />
            <circle cx={rig.chest.x} cy={rig.chest.y + 6 + i * 14} r={1.4} fill="none" stroke="#9ab8b0" strokeWidth={0.5} opacity={0.6} />
            <circle cx={rig.chest.x - 0.8} cy={rig.chest.y + 5.2 + i * 14} r={0.7} fill="#fff" opacity={0.65} />
          </g>
        ))}
      </g>
    ),
  },
  { id: 'lucite-watch-band', name: 'Часы с люцитовым ремешком', category: 'accessories', fit: 'both', z: 57, bbox: [60, 300, 50, 50],
    render: (_g, rig) => rig.arms[1] ? (
      <g transform={rig.arms[1].handTransform}>
        <rect x={-8} y={-20} width={16} height={6} rx={2} fill="#cfe0dc" stroke="rgba(120,150,145,0.7)" strokeWidth={0.6} opacity={0.85} />
        <circle cx={0} cy={-14} r={4.2} fill="#e8e2d0" stroke="#c9a24b" strokeWidth={1} />
        <path d="M0 -16.6 L0 -14 L1.6 -13" stroke="#4a3a1a" strokeWidth={0.6} fill="none" />
        <rect x={-8} y={-12} width={16} height={6} rx={2} fill="#cfe0dc" stroke="rgba(120,150,145,0.7)" strokeWidth={0.6} opacity={0.85} />
      </g>
    ) : null,
  },

  /* ===== ФРАНЦУЗСКИЕ ЛЮЦИТОВЫЕ УКРАШЕНИЯ 40-х (прозрачный пластик) ===== */
  {
    id: 'acc-lucite-necklace-clear', name: 'Люцит: бусы прозрачные', category: 'accessories', fit: 'f', z: 66, bbox: [120, 118, 60, 56],
    render: (_g, rig) => (
      <g>
        {Array.from({ length: 11 }).map((_, i) => {
          const t = i / 10;
          const x0 = 150 - rig.neckHalf - 6;
          const x1 = 150 + rig.neckHalf + 6;
          const x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * 150 + t * t * x1;
          const y = (1 - t) * (1 - t) * 124 + 2 * (1 - t) * t * (rig.chest.y - 20) + t * t * 124;
          const r = 2.6 + Math.sin(t * Math.PI) * 1.4;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={r} fill="rgba(215,232,242,0.55)" stroke="rgba(140,170,185,0.9)" strokeWidth={0.7} />
              <circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.3} fill="rgba(255,255,255,0.9)" />
            </g>
          );
        })}
      </g>
    ),
  },
  {
    id: 'acc-lucite-necklace-amber', name: 'Люцит: бусы янтарные', category: 'accessories', fit: 'f', z: 66, bbox: [120, 118, 60, 56],
    render: (_g, rig) => (
      <g>
        {Array.from({ length: 9 }).map((_, i) => {
          const t = i / 8;
          const x0 = 150 - rig.neckHalf - 6;
          const x1 = 150 + rig.neckHalf + 6;
          const x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * 150 + t * t * x1;
          const y = (1 - t) * (1 - t) * 124 + 2 * (1 - t) * t * (rig.chest.y - 18) + t * t * 124;
          const r = 2.8 + Math.sin(t * Math.PI) * 1.6;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={r} fill="rgba(201,138,58,0.6)" stroke="rgba(122,82,26,0.9)" strokeWidth={0.7} />
              <circle cx={x - r * 0.3} cy={y - r * 0.35} r={r * 0.32} fill="rgba(255,240,210,0.9)" />
            </g>
          );
        })}
      </g>
    ),
  },
  {
    id: 'acc-lucite-necklace-rose', name: 'Люцит: колье розовое с подвеской', category: 'accessories', fit: 'f', z: 66, bbox: [118, 118, 64, 66],
    render: (_g, rig) => (
      <g>
        {Array.from({ length: 9 }).map((_, i) => {
          const t = i / 8;
          const x0 = 150 - rig.neckHalf - 6;
          const x1 = 150 + rig.neckHalf + 6;
          const x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * 150 + t * t * x1;
          const y = (1 - t) * (1 - t) * 124 + 2 * (1 - t) * t * (rig.chest.y - 22) + t * t * 124;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={2.4} fill="rgba(232,150,170,0.6)" stroke="rgba(150,80,100,0.9)" strokeWidth={0.7} />
              <circle cx={x - 0.7} cy={y - 0.8} r={0.7} fill="rgba(255,255,255,0.9)" />
            </g>
          );
        })}
        {/* каплевидная подвеска */}
        <path d={`M150,${rig.chest.y - 14} Q156,${rig.chest.y - 4} 150,${rig.chest.y + 4} Q144,${rig.chest.y - 4} 150,${rig.chest.y - 14} Z`} fill="rgba(222,110,140,0.55)" stroke="rgba(150,80,100,0.9)" strokeWidth={0.9} />
        <path d={`M148,${rig.chest.y - 8} Q150,${rig.chest.y - 2} 148,${rig.chest.y + 1}`} stroke="rgba(255,255,255,0.85)" strokeWidth={1} fill="none" />
      </g>
    ),
  },
  {
    id: 'acc-lucite-choker', name: 'Люцит: чокер с кабошоном', category: 'accessories', fit: 'f', z: 66, bbox: [122, 116, 56, 36],
    render: (_g, rig) => (
      <g>
        <path d={`M${150 - rig.neckHalf - 4} 126 Q150 132 ${150 + rig.neckHalf + 4} 126`} fill="none" stroke="#3a2c20" strokeWidth={2.2} />
        <ellipse cx={150} cy={131} rx={5.5} ry={6.5} fill="rgba(150,190,210,0.6)" stroke="rgba(90,130,150,0.95)" strokeWidth={0.9} />
        <ellipse cx={150} cy={131} rx={3} ry={3.8} fill="rgba(220,240,248,0.55)" />
        <circle cx={148.4} cy={129} r={1} fill="rgba(255,255,255,0.95)" />
      </g>
    ),
  },
  {
    id: 'acc-lucite-brooch-flower', name: 'Люцит: брошь-цветок', category: 'accessories', fit: 'f', z: 66, bbox: [120, 140, 48, 40],
    render: (_g, rig) => {
      const cx = rig.chest.x - 16;
      const cy = rig.chest.y - 14;
      return (
        <g>
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <ellipse key={a} cx={cx} cy={cy - 6} rx={3.2} ry={6} fill="rgba(235,200,215,0.55)" stroke="rgba(160,90,115,0.9)" strokeWidth={0.8} transform={`rotate(${a} ${cx} ${cy})`} />
          ))}
          <circle cx={cx} cy={cy} r={3.2} fill="rgba(201,162,75,0.75)" stroke="rgba(122,90,30,0.9)" strokeWidth={0.8} />
          <circle cx={cx - 1} cy={cy - 1} r={0.9} fill="#fff" />
        </g>
      );
    },
  },
  {
    id: 'acc-lucite-brooch-bow', name: 'Люцит: брошь-бант', category: 'accessories', fit: 'f', z: 66, bbox: [120, 140, 48, 36],
    render: (_g, rig) => {
      const cx = rig.chest.x + 16;
      const cy = rig.chest.y - 14;
      return (
        <g>
          <path d={`M${cx},${cy} Q${cx - 12},${cy - 9} ${cx - 13},${cy} Q${cx - 12},${cy + 9} ${cx},${cy} Z`} fill="rgba(170,200,225,0.55)" stroke="rgba(90,130,155,0.9)" strokeWidth={0.9} />
          <path d={`M${cx},${cy} Q${cx + 12},${cy - 9} ${cx + 13},${cy} Q${cx + 12},${cy + 9} ${cx},${cy} Z`} fill="rgba(170,200,225,0.55)" stroke="rgba(90,130,155,0.9)" strokeWidth={0.9} />
          <path d={`M${cx - 9},${cy - 5} L${cx - 5},${cy + 4} M${cx + 9},${cy - 5} L${cx + 5},${cy + 4}`} stroke="rgba(255,255,255,0.7)" strokeWidth={0.9} />
          <circle cx={cx} cy={cy} r={2.6} fill="rgba(230,242,248,0.85)" stroke="rgba(90,130,155,0.9)" strokeWidth={0.8} />
        </g>
      );
    },
  },
  {
    id: 'acc-lucite-brooch-star', name: 'Люцит: брошь-звезда', category: 'accessories', fit: 'f', z: 66, bbox: [120, 140, 48, 40],
    render: (_g, rig) => {
      const cx = rig.chest.x - 16;
      const cy = rig.chest.y - 14;
      const pts = Array.from({ length: 10 }).map((_, i) => {
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        const r = i % 2 === 0 ? 9 : 3.8;
        return `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`;
      }).join(' ');
      return (
        <g>
          <polygon points={pts} fill="rgba(255,214,150,0.55)" stroke="rgba(150,110,40,0.95)" strokeWidth={0.9} />
          <circle cx={cx} cy={cy} r={2.4} fill="rgba(255,245,225,0.9)" stroke="rgba(150,110,40,0.9)" strokeWidth={0.7} />
        </g>
      );
    },
  },
  {
    id: 'acc-lucite-brooch-disc', name: 'Люцит: брошь-диск резной', category: 'accessories', fit: 'f', z: 66, bbox: [120, 140, 48, 40],
    render: (_g, rig) => {
      const cx = rig.chest.x + 16;
      const cy = rig.chest.y - 14;
      return (
        <g>
          <circle cx={cx} cy={cy} r={8.5} fill="rgba(190,220,200,0.5)" stroke="rgba(80,130,100,0.95)" strokeWidth={1} />
          <circle cx={cx} cy={cy} r={6} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={0.8} strokeDasharray="2 1.6" />
          <circle cx={cx} cy={cy} r={2.6} fill="rgba(240,250,244,0.85)" stroke="rgba(80,130,100,0.9)" strokeWidth={0.7} />
        </g>
      );
    },
  },
  {
    id: 'acc-lucite-brooch-leaf', name: 'Люцит: брошь-веточка', category: 'accessories', fit: 'f', z: 66, bbox: [118, 140, 52, 40],
    render: (_g, rig) => {
      const cx = rig.chest.x - 14;
      const cy = rig.chest.y - 12;
      return (
        <g>
          <path d={`M${cx - 12},${cy + 8} Q${cx},${cy - 2} ${cx + 12},${cy - 8}`} fill="none" stroke="rgba(110,140,90,0.95)" strokeWidth={1.2} />
          {[0, 1, 2, 3].map((i) => {
            const x = cx - 8 + i * 5.5;
            const y = cy + 4 - i * 3.6;
            return <ellipse key={i} cx={x} cy={y - 3} rx={2.2} ry={4} fill="rgba(170,210,160,0.55)" stroke="rgba(90,130,80,0.9)" strokeWidth={0.7} transform={`rotate(${-30 + i * 6} ${x} ${y - 3})`} />;
          })}
          <circle cx={cx + 12} cy={cy - 8} r={2} fill="rgba(230,150,170,0.7)" stroke="rgba(150,80,100,0.9)" strokeWidth={0.7} />
        </g>
      );
    },
  },
  {
    id: 'acc-lucite-earrings-drop', name: 'Люцит: серьги-капли', category: 'accessories', fit: 'f', z: 66, bbox: [104, 66, 92, 48],
    render: () => (
      <g>
        {[-1, 1].map((s) => {
          const x = 150 + s * 36;
          return (
            <g key={s}>
              <circle cx={x} cy={84} r={1.8} fill="rgba(201,162,75,0.9)" />
              <path d={`M${x},86 L${x},90`} stroke="rgba(150,120,60,0.9)" strokeWidth={0.9} />
              <path d={`M${x},90 Q${x + 4},96 ${x},102 Q${x - 4},96 ${x},90 Z`} fill="rgba(215,232,242,0.55)" stroke="rgba(120,150,165,0.95)" strokeWidth={0.9} />
              <path d={`M${x - 1.5},93 Q${x},96 ${x - 1},99`} stroke="rgba(255,255,255,0.9)" strokeWidth={0.9} fill="none" />
            </g>
          );
        })}
      </g>
    ),
  },
  {
    id: 'acc-lucite-earrings-hoop', name: 'Люцит: серьги-кольца', category: 'accessories', fit: 'f', z: 66, bbox: [104, 66, 92, 46],
    render: () => (
      <g>
        {[-1, 1].map((s) => {
          const x = 150 + s * 36;
          return (
            <g key={s}>
              <circle cx={x} cy={84} r={1.6} fill="rgba(201,162,75,0.9)" />
              <circle cx={x} cy={94} r={6.5} fill="none" stroke="rgba(232,170,185,0.75)" strokeWidth={2.6} />
              <circle cx={x} cy={94} r={6.5} fill="none" stroke="rgba(150,80,100,0.7)" strokeWidth={0.6} />
              <path d={`M${x - 4},89 Q${x - 1},87 ${x + 2},88.5`} stroke="rgba(255,255,255,0.9)" strokeWidth={1.1} fill="none" />
            </g>
          );
        })}
      </g>
    ),
  },
  {
    id: 'acc-lucite-bangle-clear', name: 'Люцит: браслеты прозрачные', category: 'accessories', fit: 'f', z: 56, bbox: [60, 290, 180, 60],
    render: (_g, rig) => (
      <g>
        {rig.arms.map((arm) => {
          const w = between(arm.elbow, arm.hand, 0.86);
          return (
            <g key={arm.side}>
              <ellipse cx={w.x} cy={w.y - 3} rx={7.5} ry={3} fill="none" stroke="rgba(215,232,242,0.7)" strokeWidth={2.6} />
              <ellipse cx={w.x} cy={w.y + 2} rx={7.5} ry={3} fill="none" stroke="rgba(215,232,242,0.5)" strokeWidth={2.2} />
              <ellipse cx={w.x} cy={w.y - 3} rx={7.5} ry={3} fill="none" stroke="rgba(120,150,165,0.8)" strokeWidth={0.6} />
            </g>
          );
        })}
      </g>
    ),
  },
  {
    id: 'acc-lucite-bangle-tortoise', name: 'Люцит: браслеты «черепаха»', category: 'accessories', fit: 'f', z: 56, bbox: [60, 290, 180, 60],
    render: (_g, rig) => (
      <g>
        {rig.arms.map((arm) => {
          const w = between(arm.elbow, arm.hand, 0.86);
          return (
            <g key={arm.side}>
              <ellipse cx={w.x} cy={w.y} rx={7.5} ry={3.2} fill="none" stroke="rgba(150,100,50,0.8)" strokeWidth={3} />
              <path d={`M${w.x - 6},${w.y - 1} Q${w.x - 2},${w.y - 3} ${w.x + 2},${w.y - 1} Q${w.x + 5},${w.y + 1} ${w.x + 1},${w.y + 2}`} fill="none" stroke="rgba(60,30,10,0.7)" strokeWidth={1.1} />
              <path d={`M${w.x - 5},${w.y + 1} Q${w.x},${w.y - 1} ${w.x + 5},${w.y}`} fill="none" stroke="rgba(255,230,180,0.7)" strokeWidth={0.9} />
            </g>
          );
        })}
      </g>
    ),
  },
  {
    id: 'acc-lucite-ring', name: 'Люцит: кольцо-кабошон', category: 'accessories', fit: 'f', z: 57, bbox: [186, 306, 44, 44],
    render: (_g, rig) => {
      const arm = rig.arms[1];
      return (
        <g transform={arm.handTransform}>
          <ellipse cx={1.6} cy={21} rx={3.4} ry={1.6} fill="none" stroke="rgba(201,162,75,0.95)" strokeWidth={1.1} />
          <ellipse cx={1.6} cy={19.4} rx={2.6} ry={2.8} fill="rgba(190,215,235,0.65)" stroke="rgba(120,150,165,0.95)" strokeWidth={0.8} />
          <circle cx={0.9} cy={18.6} r={0.8} fill="rgba(255,255,255,0.95)" />
        </g>
      );
    },
  },
  {
    id: 'acc-lucite-haircomb', name: 'Люцит: гребень в волосы', category: 'accessories', fit: 'f', z: 68, bbox: [140, 12, 60, 44],
    render: () => (
      <g>
        <path d="M150,34 Q168,24 186,32 L184,38 Q167,31 151,40 Z" fill="rgba(215,190,160,0.6)" stroke="rgba(130,100,60,0.9)" strokeWidth={0.9} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path key={i} d={`M${154 + i * 5.5},36 L${152 + i * 5.5},46`} stroke="rgba(150,120,80,0.9)" strokeWidth={1.2} strokeLinecap="round" />
        ))}
        <circle cx={168} cy={31} r={4} fill="rgba(232,170,185,0.6)" stroke="rgba(150,80,100,0.9)" strokeWidth={0.8} />
        <circle cx={166.8} cy={29.8} r={1.1} fill="rgba(255,255,255,0.95)" />
      </g>
    ),
  },

  /* ═══════════ МЕХОВЫЕ АКСЕССУАРЫ (натуральный мех с ворсом) ═══════════ */
  {
    id: 'acc-muff-fur', name: 'Муфта меховая', category: 'accessories', fit: 'f', z: 58, bbox: [104, 250, 96, 90],
    render: (_g, rig) => {
      const cy = rig.waist.y + 34;
      const p = FUR_PALETTE.rabbit;
      return (
        <g>
          {/* шнурок на шею */}
          <path d={`M${150 - rig.neckHalf - 2} 128 Q150 ${cy - 22} 150 ${cy - 19}`} stroke="#c9a24b" strokeWidth={1.2} fill="none" />
          <path d={`M${150 + rig.neckHalf + 2} 128 Q150 ${cy - 22} 150 ${cy - 19}`} stroke="#c9a24b" strokeWidth={1.2} fill="none" />
          {/* корпус муфты */}
          <ellipse cx={150} cy={cy + 2} rx={28} ry={20} fill={p.dark} {...outline} />
          <ellipse cx={150} cy={cy} rx={26} ry={18} fill={p.fur} />
          {furHair(150, cy, 25, 17, p, 30, 7)}
          {/* проём для рук */}
          <ellipse cx={150} cy={cy - 3} rx={17} ry={8} fill={p.dark} opacity={0.8} />
          <ellipse cx={150} cy={cy - 4} rx={14} ry={6} fill="#2a1e18" opacity={0.7} />
          {/* атласная отделка торцов */}
          <path d={`M${150 - 26} ${cy + 12} Q150 ${cy + 22} ${150 + 26} ${cy + 12}`} stroke="#3a2c22" strokeWidth={3} fill="none" />
          <circle cx={150} cy={cy + 17} r={1.8} fill="#c9a24b" />
        </g>
      );
    },
  },
  {
    id: 'acc-fur-mittens', name: 'Меховые рукавицы', category: 'accessories', fit: 'both', z: 56, bbox: [56, 286, 190, 80],
    render: (_g, rig) => {
      const p = FUR_PALETTE.rabbit;
      return rig.arms.map((arm, i) => (
        <g key={i} transform={arm.handTransform}>
          <path d={HAND_OUTLINE} fill={p.dark} {...outline} />
          <path d="M-6.4 -8 C-6.4 -2 -7.4 4 -7 10 L-7.4 20 Q-7.4 22.6 -6.2 22.6 Q-5 22.6 -4.8 20.6 L-3.4 14.2 L-3.8 25.6 Q-3.8 27.8 -2.4 27.8 Q-1 27.8 -0.9 25.4 L0 15 L0.4 27.8 Q0.6 30.4 2 30.2 Q3.4 30 3.2 27.6 L3.4 14.4 L5 24.4 Q5.4 26.8 6.8 26.2 Q7.8 25.6 7.3 23.4 L6.4 10 C7.2 10.6 8 12.4 8.8 13.4" fill={p.fur} stroke={p.dark} strokeWidth={0.7} strokeLinejoin="round" />
          {furHair(0, 10, 7, 16, p, 12, i + 3)}
          {/* отворот */}
          <rect x={-8} y={-20} width={16} height={11} rx={5} fill={p.fur} stroke={p.dark} strokeWidth={0.7} />
          {furHair(0, -15, 7, 4, p, 8, i + 9)}
        </g>
      ));
    },
  },
  {
    id: 'acc-fur-trim-gloves', name: 'Перчатки с меховой оторочкой', category: 'accessories', fit: 'both', z: 55, bbox: [56, 286, 190, 76],
    render: (_g, rig) => {
      const p = FUR_PALETTE.mink;
      return rig.arms.map((arm, i) => (
        <g key={i} transform={arm.handTransform}>
          <rect x={-8} y={-22} width={16} height={12} rx={5} fill="#3a2418" {...outline} />
          {/* меховая оторочка по краю манжеты */}
          <ellipse cx={0} cy={-10} rx={9.5} ry={4} fill={p.fur} stroke={p.dark} strokeWidth={0.6} />
          {furHair(0, -10, 9, 3.4, p, 10, i + 13)}
          <path d={HAND_OUTLINE} fill="#2c1c12" {...outline} />
          <path d="M-4 -2 L-5 12 M0 -3 L0 14 M4 -2 L5 12" stroke="rgba(255,235,210,0.16)" strokeWidth={0.9} fill="none" />
        </g>
      ));
    },
  },
  {
    id: 'acc-fur-bag', name: 'Меховая сумочка', category: 'accessories', fit: 'f', z: 56, bbox: [166, 290, 80, 100],
    render: (_g, rig) => {
      const h = rig.arms[1].hand;
      const p = FUR_PALETTE.lynx;
      return (
        <g>
          <path d={`M${h.x - 6},${h.y + 8} Q${h.x},${h.y + 20} ${h.x + 6},${h.y + 8}`} stroke="#c9a24b" strokeWidth={1.6} fill="none" />
          <ellipse cx={h.x} cy={h.y + 34} rx={19} ry={17} fill={p.dark} {...outline} />
          <ellipse cx={h.x} cy={h.y + 33} rx={17} ry={15} fill={p.fur} />
          {furHair(h.x, h.y + 33, 16, 14, p, 22, 23)}
          {/* застёжка */}
          <circle cx={h.x} cy={h.y + 24} r={2.4} fill="#c9a24b" stroke="#8a6a25" strokeWidth={0.6} />
          {/* кисточка */}
          <path d={`M${h.x + 14},${h.y + 46} l3 8 M${h.x + 16},${h.y + 45} l5 7 M${h.x + 12},${h.y + 47} l1 9`} stroke={p.light} strokeWidth={1.1} strokeLinecap="round" />
        </g>
      );
    },
  },
  {
    id: 'acc-fur-boot-cuffs', name: 'Меховые обманки на ботинки', category: 'accessories', fit: 'both', z: 51, bbox: [84, 520, 132, 76],
    render: (_g, rig) => {
      const p = FUR_PALETTE.fox;
      return rig.legs.map((leg) => (
        <g key={leg.side}>
          {/* манжета над щиколоткой */}
          <path d={`M${leg.ankle.x - leg.side * (leg.ankleWidth + 7)} ${leg.ankle.y - 12} Q${leg.ankle.x} ${leg.ankle.y - 4} ${leg.ankle.x + leg.side * (leg.ankleWidth + 7)} ${leg.ankle.y - 12} L${leg.ankle.x + leg.side * (leg.ankleWidth + 5)} ${leg.ankle.y - 1} Q${leg.ankle.x} ${leg.ankle.y + 7} ${leg.ankle.x - leg.side * (leg.ankleWidth + 5)} ${leg.ankle.y - 1} Z`} fill={p.fur} stroke={p.dark} strokeWidth={0.8} strokeLinejoin="round" />
          {furHair(leg.ankle.x, leg.ankle.y - 6, leg.ankleWidth + 5, 7, p, 12, leg.side + 27)}
          {/* завязки */}
          <path d={`M${leg.ankle.x - leg.side * (leg.ankleWidth + 6)} ${leg.ankle.y - 11} q${leg.side * 3} 8 ${leg.side * -1} 14`} stroke="#4a2c1a" strokeWidth={1.2} fill="none" />
        </g>
      ));
    },
  },
  {
    id: 'acc-fur-headband', name: 'Меховая повязка на голову', category: 'headgear', fit: 'f', z: 70, bbox: [100, 24, 100, 46],
    render: () => {
      const p = FUR_PALETTE.mink;
      const tw = 36; // полуширина головы в области висков
      return (
        <g>
          <path d={`M${150 - tw - 4} 60 Q150 34 ${150 + tw + 4} 60`} stroke={p.dark} strokeWidth={15} fill="none" strokeLinecap="round" />
          <path d={`M${150 - tw - 4} 60 Q150 34 ${150 + tw + 4} 60`} stroke={p.fur} strokeWidth={12} fill="none" strokeLinecap="round" />
          <path d={`M${150 - tw - 4} 60 Q150 34 ${150 + tw + 4} 60`} stroke={p.light} strokeWidth={8} fill="none" strokeLinecap="round" strokeDasharray="1.5 7" opacity={0.45} />
          {/* бант сбоку */}
          <ellipse cx={150 + tw - 2} cy={54} rx={7} ry={5} fill={p.fur} stroke={p.dark} strokeWidth={0.7} />
          <ellipse cx={150 + tw + 6} cy={58} rx={6} ry={4.4} fill={p.fur} stroke={p.dark} strokeWidth={0.7} />
          <circle cx={150 + tw + 2} cy={56} r={2} fill="#c9a24b" />
          {furHair(150, 48, tw, 12, p, 18, 31)}
        </g>
      );
    },
  },
  {
    id: 'hat-fur-pillbox', name: 'Меховая шапка-таблетка', category: 'headgear', fit: 'f', z: 72, bbox: [100, 8, 100, 66],
    render: () => {
      const p = FUR_PALETTE.sable;
      return (
        <g>
          <ellipse cx={150} cy={44} rx={40} ry={16} fill={p.dark} {...outline} />
          <ellipse cx={150} cy={41} rx={38} ry={14} fill={p.fur} />
          <ellipse cx={150} cy={38} rx={38} ry={13} fill={p.fur} stroke={p.dark} strokeWidth={0.8} />
          {furHair(150, 38, 37, 12, p, 30, 37)}
          {/* вуаль-сетка */}
          <path d={`M${150 - 38} 46 Q150 60 ${150 + 38} 46 L${150 + 34} 82 Q150 94 ${150 - 34} 82 Z`} fill="rgba(40,28,26,0.2)" />
          {/* жемчужная булавка */}
          <circle cx={150 + 16} cy={36} r={3} fill="#f6f0e6" stroke="#c8bfae" strokeWidth={0.7} />
          <circle cx={150 + 15} cy={35} r={1} fill="#fff" />
        </g>
      );
    },
  },

  /* ═══════════ ОРТОПЕДИЧЕСКАЯ ОБУВЬ И АППАРАТЫ ═══════════ */
  {
    id: 'shoe-ortho-raise', name: 'Ортопедический ботинок (подошва-компенсатор)', category: 'shoes', fit: 'both', z: 50, bbox: [86, 508, 128, 96],
    render: (_g, rig) => rig.legs.map((leg) => (
      <g key={leg.side} transform={leg.footTransform}>
        {/* высокий жёсткий берц */}
        <path d="M-9 -36 L10 -33 L10 6 L-10 6 Z" fill="#4a3320" {...outline} strokeLinejoin="round" />
        <path d="M-9 -36 L10 -33 L10 6 L-10 6 Z" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
        {/* шнуровка с металлическими крючками */}
        <g stroke="#d9c39a" strokeWidth={0.9} fill="none">
          {[-32, -27, -22, -17, -12, -7, -2].map((y) => (
            <path key={y} d={`M-7 ${y} L8 ${y + 2.4}`} />
          ))}
        </g>
        {[-32, -27, -22, -17, -12, -7, -2].map((y) => (
          <g key={`h${y}`}>
            <circle cx={-7.4} cy={y} r={1} fill="#b9bec4" />
            <circle cx={8.4} cy={y + 2.4} r={1} fill="#b9bec4" />
          </g>
        ))}
        {/* боковая металлическая шина */}
        <path d="M-10 -34 L-10 18" stroke="#b9bec4" strokeWidth={2.4} strokeLinecap="round" />
        <path d="M-10 -34 L-10 18" stroke="#fff" strokeWidth={0.7} strokeLinecap="round" opacity={0.6} />
        {/* стопа */}
        <path d={FOOT_OUTLINE} fill="#54381f" {...outline} />
        {/* утолщённая подошва-компенсатор */}
        <path d="M-11 17.6 L-11 26.5 Q-11 28.6 -8.4 28.6 L31 28.6 Q33.4 28.6 33.4 26 L33.4 17.6 Z" fill="#5a4a34" {...outline} />
        <path d="M-11 22 L33 22" stroke="rgba(0,0,0,0.3)" strokeWidth={0.8} />
        {/* пробковый клин под пяткой */}
        <path d="M-10.5 17.8 L-10.5 26 L2 26 L2 17.8 Z" fill="#b08a4e" opacity={0.7} />
        {/* ремни-фиксаторы */}
        {[0, 1].map((i) => (
          <path key={i} d={`M-10 ${-30 + i * 20} q10 5 20 0`} stroke="#3a2418" strokeWidth={4.4} fill="none" strokeLinecap="round" />
        ))}
      </g>
    )),
  },
  {
    id: 'shoe-ortho-boot', name: 'Ортопедический ботинок с высокой шнуровкой', category: 'shoes', fit: 'both', z: 50, bbox: [86, 486, 128, 118],
    render: (_g, rig) => rig.legs.map((leg) => (
      <g key={leg.side} transform={leg.footTransform}>
        {/* высокий кожаный берц до середины голени */}
        <path d="M-11 -58 L12 -55 L11 6 L-11 6 Z" fill="#3f2b1c" {...outline} strokeLinejoin="round" />
        <path d="M-11 -58 L-11 6" stroke="rgba(255,255,255,0.14)" strokeWidth={1.4} />
        {/* двойная шнуровка */}
        <g stroke="#d9c39a" strokeWidth={0.85} fill="none">
          {Array.from({ length: 11 }, (_, i) => -54 + i * 5.4).map((y) => (
            <path key={y} d={`M-8 ${y} L9 ${y + 2.6}`} />
          ))}
        </g>
        {Array.from({ length: 11 }, (_, i) => -54 + i * 5.4).map((y) => (
          <g key={`e${y}`}>
            <circle cx={-8.4} cy={y} r={1.1} fill="#b9bec4" />
            <circle cx={9.4} cy={y + 2.6} r={1.1} fill="#b9bec4" />
          </g>
        ))}
        {/* шарнир сбоку */}
        <circle cx={-12} cy={-18} r={3.4} fill="#cfd4d9" stroke="#4a4e54" strokeWidth={0.8} />
        <circle cx={-12} cy={-18} r={1.2} fill="#4a4e54" />
        {/* шина вниз к подошве */}
        <path d="M-12 -18 L-12 20" stroke="#b9bec4" strokeWidth={2.6} strokeLinecap="round" />
        {/* стопа и толстая подошва */}
        <path d={FOOT_OUTLINE} fill="#4a3320" {...outline} />
        <path d="M-12 17.6 L-12 27 Q-12 29 -9 29 L31 29 Q33.4 29 33.4 26.4 L33.4 17.6 Z" fill="#2a1c12" {...outline} />
        {/* металлический подковообразный протектор */}
        <path d="M-9 29 L-9 31 M6 29 L6 31 M22 29 L22 31" stroke="#8a8f96" strokeWidth={2} strokeLinecap="round" />
      </g>
    )),
  },
  {
    id: 'acc-legbrace-iron', name: 'Аппарат на голень (стальная шина)', category: 'accessories', fit: 'both', z: 53, bbox: [56, 372, 188, 224],
    render: (_g, rig) => rig.legs.map((leg) => {
      const sd = leg.side;
      const top = { x: leg.knee.x + sd * (leg.kneeWidth + 3), y: leg.knee.y - 8 };
      const bot = { x: leg.ankle.x + sd * (leg.ankleWidth + 4), y: leg.ankle.y - 2 };
      const bar = `M${top.x} ${top.y} L${bot.x} ${bot.y}`;
      return (
        <g key={leg.side}>
          {/* стальная шина по наружной стороне голени */}
          <path d={bar} stroke="#7a8088" strokeWidth={4.2} strokeLinecap="round" fill="none" />
          <path d={bar} stroke="#cfd4d9" strokeWidth={2.2} strokeLinecap="round" fill="none" />
          <path d={bar} stroke="#fff" strokeWidth={0.7} strokeLinecap="round" fill="none" opacity={0.7} transform="translate(0 -0.6)" />
          {/* коленный шарнир */}
          <circle cx={top.x} cy={top.y} r={3.6} fill="#dfe4e8" stroke="#4a4e54" strokeWidth={0.9} />
          <circle cx={top.x} cy={top.y} r={1.3} fill="#4a4e54" />
          {/* стремя под пятку */}
          <path d={`M${bot.x} ${bot.y} L${leg.ankle.x} ${leg.ankle.y + 14}`} stroke="#9aa0a8" strokeWidth={3.4} strokeLinecap="round" fill="none" />
          <path d={`M${leg.ankle.x - sd * 6} ${leg.ankle.y + 14} L${leg.ankle.x + sd * 8} ${leg.ankle.y + 14}`} stroke="#9aa0a8" strokeWidth={3.4} strokeLinecap="round" />
          {/* кожаные ремешки вокруг голени */}
          {[0.16, 0.5, 0.84].map((t) => {
            const pt = between(top, bot, t);
            const w = (leg.calfWidth * 2 * (1 - t * 0.4)) + 8;
            const inner = { x: pt.x - sd * w, y: pt.y + 2 };
            return (
              <g key={t}>
                <path d={`M${pt.x - sd * 3} ${pt.y - 2} Q${(pt.x + inner.x) / 2} ${pt.y + 5} ${inner.x} ${inner.y}`} stroke="#3a2418" strokeWidth={5.4} fill="none" strokeLinecap="round" />
                <path d={`M${pt.x - sd * 3} ${pt.y - 3.2} Q${(pt.x + inner.x) / 2} ${pt.y + 3.8} ${inner.x} ${inner.y - 1}`} stroke="rgba(255,220,190,0.22)" strokeWidth={1.2} fill="none" strokeLinecap="round" />
                {/* пряжка */}
                <rect x={pt.x - sd * 5.5} y={pt.y - 4} width={11} height={7} rx={1} fill="#c9a24b" stroke="rgba(0,0,0,0.45)" strokeWidth={0.55} />
                <rect x={pt.x - sd * 3.4} y={pt.y - 2.4} width={7} height={4} rx={0.8} fill="none" stroke="rgba(60,40,20,0.7)" strokeWidth={0.7} />
              </g>
            );
          })}
        </g>
      );
    }),
  },
  {
    id: 'acc-legbrace-double', name: 'Двусторонний аппарат с тазовым поясом', category: 'accessories', fit: 'both', z: 54, bbox: [56, 268, 188, 330],
    render: (_g, rig) => {
      const wy = rig.waist.y + 6;
      const hy = rig.hips[0].y - 4;
      return (
        <g>
          {/* тазовый пояс */}
          <path d={`M${rig.waist.x - rig.waistHalf - 5} ${wy} L${rig.waist.x + rig.waistHalf + 5} ${wy} L${rig.waist.x + rig.waistHalf + 4} ${wy + 13} L${rig.waist.x - rig.waistHalf - 4} ${wy + 13} Z`} fill="#3a2418" {...outline} />
          <rect x={rig.waist.x - 7} y={wy + 1} width={14} height={11} rx={1.5} fill="#c9a24b" stroke="rgba(0,0,0,0.5)" strokeWidth={0.7} />
          {/* ремни от пояса к бёдрам */}
          {rig.legs.map((leg) => (
            <path key={`b${leg.side}`} d={`M${rig.waist.x + leg.side * (rig.waistHalf - 2)} ${wy + 12} L${leg.hip.x + leg.side * 4} ${hy + 14}`} stroke="#3a2418" strokeWidth={4.6} fill="none" strokeLinecap="round" />
          ))}
          {/* боковые шины от бедра до пятки */}
          {rig.legs.map((leg) => {
            const sd = leg.side;
            const top = { x: leg.hip.x + sd * 6, y: hy + 12 };
            const mid = { x: leg.knee.x + sd * (leg.kneeWidth + 3.5), y: leg.knee.y - 6 };
            const bot = { x: leg.ankle.x + sd * (leg.ankleWidth + 4), y: leg.ankle.y - 2 };
            return (
              <g key={leg.side}>
                <path d={`M${top.x} ${top.y} L${mid.x} ${mid.y} L${bot.x} ${bot.y}`} stroke="#7a8088" strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <path d={`M${top.x} ${top.y} L${mid.x} ${mid.y} L${bot.x} ${bot.y}`} stroke="#cfd4d9" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                {/* шарниры: бедро и колено */}
                {[top, mid].map((h, i) => (
                  <g key={i}>
                    <circle cx={h.x} cy={h.y} r={3.4} fill="#dfe4e8" stroke="#4a4e54" strokeWidth={0.9} />
                    <circle cx={h.x} cy={h.y} r={1.2} fill="#4a4e54" />
                  </g>
                ))}
                {/* стремя */}
                <path d={`M${bot.x} ${bot.y} L${leg.ankle.x} ${leg.ankle.y + 15}`} stroke="#9aa0a8" strokeWidth={3.2} strokeLinecap="round" fill="none" />
                {/* ремешки на бедре и голени */}
                {[{ p: between(top, mid, 0.5), w: 15 }, { p: between(mid, bot, 0.45), w: 12 }].map((s, i) => (
                  <path key={i} d={`M${s.p.x - sd * 2} ${s.p.y - 2} Q${s.p.x - sd * 2} ${s.p.y + 6} ${s.p.x - sd * s.w} ${s.p.y + 1}`} stroke="#3a2418" strokeWidth={5} fill="none" strokeLinecap="round" />
                ))}
              </g>
            );
          })}
        </g>
      );
    },
  },
  {
    id: 'acc-leg-harness', name: 'Подтяжки на ногах с поясом', category: 'accessories', fit: 'both', z: 46, bbox: [70, 250, 160, 220],
    render: (_g, rig) => {
      const wy = rig.waist.y + 2;
      return (
        <g>
          {/* пояс */}
          <rect x={rig.waist.x - rig.waistHalf - 5} y={wy} width={(rig.waistHalf + 5) * 2} height={10} rx={2} fill="#4a3220" {...outline} />
          <rect x={rig.waist.x - 6} y={wy + 1} width={12} height={8} rx={1} fill="#c9a24b" stroke="rgba(0,0,0,0.45)" strokeWidth={0.6} />
          {/* эластичные подтяжки вниз к манжетам */}
          {rig.legs.map((leg) => {
            const cuffY = leg.knee.y - 26;
            const cx = leg.knee.x + leg.side * 2;
            return (
              <g key={leg.side}>
                <path d={`M${rig.waist.x + leg.side * (rig.waistHalf - 6)} ${wy + 9} L${cx} ${cuffY}`} stroke="#5a4a3a" strokeWidth={4} fill="none" strokeLinecap="round" />
                <path d={`M${rig.waist.x + leg.side * (rig.waistHalf - 6)} ${wy + 9} L${cx} ${cuffY}`} stroke="rgba(255,255,255,0.12)" strokeWidth={1.2} fill="none" />
                {/* манжета под коленом */}
                <path d={`M${cx - 15} ${cuffY} Q${cx} ${cuffY + 8} ${cx + 15} ${cuffY}`} stroke="#3a2418" strokeWidth={6} fill="none" strokeLinecap="round" />
                <rect x={cx + leg.side * 11 - 3} y={cuffY - 1} width={6} height={6} rx={1} fill="#c9a24b" stroke="rgba(0,0,0,0.45)" strokeWidth={0.5} />
                {/* пряжка-регулятор на подтяжке */}
                <rect x={cx - 3} y={(wy + 9 + cuffY) / 2 - 4} width={6} height={9} rx={1} fill="#b9bec4" stroke="rgba(0,0,0,0.4)" strokeWidth={0.5} />
              </g>
            );
          })}
        </g>
      );
    },
  },

  /* ═══════════ ОРТОПЕДИЧЕСКИЙ КОМПЛЕКС «АТЕЛЬЕ ЛИНДЕН» ═══════════ */
  {
    id: 'ortho-full-leg', name: 'Полный ортопедический комплект (аппарат + ботинок)', category: 'accessories', fit: 'both', z: 54, bbox: [56, 268, 188, 360],
    back: (_g, rig) => {
      const shL = rig.shoulders[0];
      const shR = rig.shoulders[1];
      // лямки аппарата уходят за спину к поясу
      return (
        <g>
          <path d={`M${shL.x + 6} ${shL.y + 6} Q150 ${shL.y - 12} ${shR.x - 6} ${shR.y + 6}`} stroke="#3a2418" strokeWidth={5} fill="none" strokeLinecap="round" />
          {rig.legs.map((leg) => (
            <path key={leg.side} d={`M${rig.waist.x + leg.side * 6} ${rig.hips[0].y - 14} L${leg.hip.x + leg.side * 8} ${leg.hip.y + 6}`} stroke="#2a1a10" strokeWidth={5} fill="none" strokeLinecap="round" />
          ))}
        </g>
      );
    },
    render: (_g, rig) => {
      const wy = rig.waist.y + 4;
      const hy = rig.hips[0].y - 6;
      return (
        <g>
          {/* пояс с боковыми ложементами */}
          <path d={`M${rig.waist.x - rig.waistHalf - 6} ${wy} L${rig.waist.x + rig.waistHalf + 6} ${wy} L${rig.waist.x + rig.waistHalf + 5} ${wy + 15} L${rig.waist.x - rig.waistHalf - 5} ${wy + 15} Z`} fill="#2f1f14" {...outline} />
          <rect x={rig.waist.x - 8} y={wy + 1} width={16} height={13} rx={2} fill="#c9a24b" stroke="rgba(0,0,0,0.5)" strokeWidth={0.7} />
          <rect x={rig.waist.x - 5} y={wy + 4} width={10} height={7} rx={1} fill="none" stroke="rgba(60,40,20,0.7)" strokeWidth={1} />
          {/* ремни к бёдрам */}
          {rig.legs.map((leg) => (
            <g key={`s${leg.side}`}>
              <path d={`M${rig.waist.x + leg.side * (rig.waistHalf - 3)} ${wy + 14} L${leg.hip.x + leg.side * 5} ${hy + 16}`} stroke="#3a2418" strokeWidth={5} fill="none" strokeLinecap="round" />
              <rect x={leg.hip.x + leg.side * 5 - 3.5} y={hy + 13} width={7} height={7} rx={1} fill="#c9a24b" stroke="rgba(0,0,0,0.45)" strokeWidth={0.55} />
            </g>
          ))}
          {/* шины и стремена */}
          {rig.legs.map((leg) => {
            const sd = leg.side;
            const top = { x: leg.hip.x + sd * 7, y: hy + 14 };
            const knee = { x: leg.knee.x + sd * (leg.kneeWidth + 4), y: leg.knee.y - 4 };
            const bot = { x: leg.ankle.x + sd * (leg.ankleWidth + 4), y: leg.ankle.y - 2 };
            const rail = `M${top.x} ${top.y} L${knee.x} ${knee.y} L${bot.x} ${bot.y}`;
            return (
              <g key={leg.side}>
                <path d={rail} stroke="#6f757d" strokeWidth={4.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <path d={rail} stroke="#cfd4d9" strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <path d={rail} stroke="#fff" strokeWidth={0.7} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.65} transform="translate(0 -0.6)" />
                {[top, knee].map((h, i) => (
                  <g key={i}>
                    <circle cx={h.x} cy={h.y} r={3.6} fill="#dfe4e8" stroke="#4a4e54" strokeWidth={0.9} />
                    <circle cx={h.x} cy={h.y} r={1.3} fill="#4a4e54" />
                  </g>
                ))}
                {/* стремя под пятку */}
                <path d={`M${bot.x} ${bot.y} L${leg.ankle.x} ${leg.ankle.y + 16}`} stroke="#9aa0a8" strokeWidth={3.4} strokeLinecap="round" fill="none" />
                <path d={`M${leg.ankle.x - sd * 7} ${leg.ankle.y + 16} L${leg.ankle.x + sd * 9} ${leg.ankle.y + 16}`} stroke="#9aa0a8" strokeWidth={3.4} strokeLinecap="round" />
                {/* ремешки на бедре и голени */}
                {[{ p: between(top, knee, 0.45), w: leg.kneeWidth * 2 + 6 }, { p: between(knee, bot, 0.42), w: leg.calfWidth * 1.5 + 4 }].map((s, i) => (
                  <g key={i}>
                    <path d={`M${s.p.x - sd * 3} ${s.p.y - 3} Q${s.p.x - sd * 3} ${s.p.y + 6} ${s.p.x - sd * s.w} ${s.p.y + 1}`} stroke="#3a2418" strokeWidth={5.4} fill="none" strokeLinecap="round" />
                    <rect x={s.p.x - sd * 6} y={s.p.y - 5} width={12} height={8} rx={1.2} fill="#c9a24b" stroke="rgba(0,0,0,0.45)" strokeWidth={0.55} />
                  </g>
                ))}
                {/* ортопедический ботинок с утолщённой подошвой */}
                <g transform={leg.footTransform}>
                  <path d={FOOT_OUTLINE} fill="#4a3320" {...outline} />
                  <path d="M-10 -30 L11 -27 L10 6 L-10 6 Z" fill="#3f2b1c" {...outline} strokeLinejoin="round" />
                  <g stroke="#d9c39a" strokeWidth={0.85} fill="none">
                    {[-26, -20, -14, -8, -2].map((y) => <path key={y} d={`M-7 ${y} L8 ${y + 2.4}`} />)}
                  </g>
                  <path d="M-11 17.6 L-11 27 Q-11 29 -8.4 29 L31 29 Q33.4 29 33.4 26.4 L33.4 17.6 Z" fill="#2a1c12" {...outline} />
                </g>
              </g>
            );
          })}
        </g>
      );
    },
  },

  /* ═══════════ ПРЕДМЕТЫ ОРАТОРА (радиоречи, тезисы, перо) ═══════════ */
  {
    id: 'acc-speech-notes', name: 'Карточки с тезисами речи', category: 'accessories', fit: 'both', z: 57, bbox: [58, 288, 62, 62],
    render: (_g, rig) => {
      const h = rig.arms[0].hand;
      return (
        <g transform={`translate(${h.x - 4} ${h.y - 16}) rotate(-8)`}>
          {/* стопка карточек */}
          <rect x={-8} y={-4} width={17} height={23} rx={0.8} fill="#e8e2d0" stroke="rgba(0,0,0,0.35)" strokeWidth={0.6} />
          <rect x={-6.4} y={-6} width={17} height={23} rx={0.8} fill="#f2ecda" stroke="rgba(0,0,0,0.3)" strokeWidth={0.6} />
          {/* рукописные строки */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <path key={i} d={`M${-4.4} ${-1 + i * 3.4} L${i % 3 === 2 ? 6 : 8.6} ${-1 + i * 3.4}`} stroke="#4a4a42" strokeWidth={0.7} opacity={0.75} />
          ))}
          {/* подчёркивания-акценты */}
          <path d="M-4.4 3.6 L8.6 3.6" stroke="#8b2635" strokeWidth={1} opacity={0.8} />
          {/* зажим */}
          <rect x={-2} y={-8.4} width={5} height={4} rx={0.8} fill="#b9bec4" stroke="rgba(0,0,0,0.35)" strokeWidth={0.4} />
        </g>
      );
    },
  },
  {
    id: 'acc-microphone', name: 'Студийный микрофон радиовышки', category: 'accessories', fit: 'both', z: 57, bbox: [168, 236, 76, 130],
    render: (_g, rig) => {
      const h = rig.arms[1].hand;
      const bx = h.x + 16;
      const by = h.y + 4;
      return (
        <g>
          {/* стойка-тренога */}
          <path d={`M${bx} ${by + 4} L${bx} ${by + 96}`} stroke="#3a3a3e" strokeWidth={3.4} strokeLinecap="round" />
          <path d={`M${bx} ${by + 92} l-11 12 M${bx} ${by + 92} l11 12 M${bx} ${by + 92} l0 13`} stroke="#3a3a3e" strokeWidth={2.2} strokeLinecap="round" />
          {/* телескопическая муфта */}
          <path d={`M${bx - 4} ${by + 40} L${bx + 4} ${by + 40}`} stroke="#6a6f76" strokeWidth={2} />
          <circle cx={bx} cy={by + 40} r={2.6} fill="#9aa0a8" />
          {/* корпус микрофона */}
          <g transform={`translate(${bx} ${by - 4}) rotate(-16)`}>
            {/* капсюль-лента в круглой рамке */}
            <ellipse cx={0} cy={-16} rx={11} ry={12} fill="#2a2a2e" stroke="#5a5f66" strokeWidth={1.2} />
            <ellipse cx={0} cy={-16} rx={8.4} ry={9.4} fill="none" stroke="#8a8f96" strokeWidth={1} />
            {/* рифлёная лента */}
            {Array.from({ length: 7 }, (_, i) => -13 + i * 3.2).map((y) => (
              <path key={y} d={`M${-8} ${y} Q0 ${y + 1.6} 8 ${y}`} stroke="rgba(200,205,212,0.55)" strokeWidth={0.7} fill="none" />
            ))}
            {/* гофрированный корпус */}
            <path d="M-8.5 -5 L-7 10 L7 10 L8.5 -5 Z" fill="#3a3a3e" {...outline} />
            {[-3, 0, 3, 6].map((y) => (
              <path key={y} d={`M-7.6 ${y} L7.6 ${y}`} stroke="rgba(255,255,255,0.16)" strokeWidth={0.8} />
            ))}
            {/* кабель */}
            <path d="M0 10 q2 10 -1 18" stroke="#1c1d1f" strokeWidth={1.6} fill="none" />
          </g>
          {/* провод к стойке */}
          <path d={`M${bx - 2} ${by + 6} q8 14 2 34`} stroke="#1c1d1f" strokeWidth={1.4} fill="none" />
        </g>
      );
    },
  },
  {
    id: 'acc-fountain-pen', name: 'Перьевая ручка', category: 'accessories', fit: 'both', z: 57, bbox: [176, 300, 54, 52],
    render: (_g, rig) => {
      const h = rig.arms[1].hand;
      return (
        <g transform={`translate(${h.x - 2} ${h.y - 6}) rotate(-30)`}>
          {/* корпус */}
          <rect x={-3} y={-22} width={6} height={20} rx={2.6} fill="#1c1a22" stroke="rgba(0,0,0,0.4)" strokeWidth={0.5} />
          {/* золотое кольцо */}
          <rect x={-3.2} y={-3.4} width={6.4} height={2.6} fill="#c9a24b" />
          {/* перо */}
          <path d="M-2.6 -0.8 L2.6 -0.8 L1.6 8.4 Q0 10.4 -1.6 8.4 Z" fill="#c9a24b" stroke="#8a6a25" strokeWidth={0.5} />
          <path d="M0 0 L0 8.6" stroke="#6a4a14" strokeWidth={0.6} />
          <circle cx={0} cy={1.6} r={0.7} fill="#3a2a0e" />
          {/* колпачок с клипсой */}
          <g transform="translate(0 -34)">
            <rect x={-3.4} y={0} width={6.8} height={12} rx={2.8} fill="#26242e" stroke="rgba(0,0,0,0.4)" strokeWidth={0.5} />
            <rect x={2.6} y={1.4} width={1.6} height={8} rx={0.8} fill="#c9a24b" />
          </g>
        </g>
      );
    },
  },
  {
    id: 'acc-press-card', name: 'Пресс-карта в футляре', category: 'accessories', fit: 'both', z: 57, bbox: [58, 292, 56, 58],
    render: (_g, rig) => {
      const h = rig.arms[0].hand;
      return (
        <g transform={`translate(${h.x - 5} ${h.y - 14}) rotate(6)`}>
          {/* кожаный футляр */}
          <rect x={-9} y={-6} width={19} height={26} rx={1.6} fill="#4a2c1a" {...outline} />
          <rect x={-7} y={-4} width={15} height={22} rx={1} fill="#5c3a22" />
          {/* карточка */}
          <rect x={-5.6} y={-2.4} width={12.4} height={18} rx={0.6} fill="#e8e2d0" />
          <path d="M-3.6 1 L3.6 1 M-3.6 4 L3.6 4 M-3.6 7 L1 7" stroke="#4a4a42" strokeWidth={0.6} />
          {/* портрет-овал */}
          <ellipse cx={0} cy={11} rx={2.6} ry={3.2} fill="#b8a888" />
          {/* тесёмка */}
          <path d="M-5 -4 q5 -6 10 0" stroke="#3a2418" strokeWidth={1.6} fill="none" />
        </g>
      );
    },
  },
  {
    id: 'acc-diary', name: 'Дневник в кожаном переплёте', category: 'accessories', fit: 'both', z: 57, bbox: [52, 292, 58, 56],
    render: (_g, rig) => {
      const h = rig.arms[0].hand;
      return (
        <g transform={`translate(${h.x - 6} ${h.y - 12}) rotate(-11)`}>
          <rect x={-9} y={-7} width={20} height={26} rx={1.2} fill="#2f2418" {...outline} />
          {/* тиснёный корешок */}
          <rect x={-9} y={-7} width={4} height={26} fill="#241a10" />
          <path d="M-7.4 -4 L-7.4 16" stroke="rgba(201,162,75,0.5)" strokeWidth={0.7} />
          {/* золотое тиснение */}
          <rect x={-2.4} y={-3} width={11} height={18} rx={0.8} fill="none" stroke="#c9a24b" strokeWidth={0.7} opacity={0.75} />
          <path d="M0.4 2 L3.4 2 M0.4 5 L3.4 5 M0.4 8 L2 8" stroke="#c9a24b" strokeWidth={0.6} opacity={0.7} />
          {/* закладка */}
          <path d="M6.4 -6 l0 12 l-2.4 -2.6 l-2.4 2.6 l0 -12 Z" fill="#8b2635" />
        </g>
      );
    },
  },
  {
    id: 'acc-cane-ebony', name: 'Трость с наборной ручкой', category: 'accessories', fit: 'both', z: 56, bbox: [176, 276, 74, 326],
    render: (_g, rig) => {
      const h = rig.arms[1].hand;
      return (
        <g>
          {/* г-образная ручка из чёрного дерева */}
          <path d={`M${h.x - 12},${h.y - 10} q${14} ${-9} ${18} ${4}`} stroke="#1c1410" strokeWidth={7} fill="none" strokeLinecap="round" />
          {/* наборные кольца на ручке */}
          <path d={`M${h.x - 8},${h.y - 8} q${6} ${-4} ${9} ${-1}`} stroke="#c9a24b" strokeWidth={1.2} fill="none" />
          <path d={`M${h.x - 6},${h.y - 6} q${5} ${-3} ${8} ${0}`} stroke="#c9a24b" strokeWidth={1} fill="none" />
          {/* ствол */}
          <path d={`M${h.x + 6},${h.y - 6} L${h.x + 8},${h.y + 258}`} stroke="#241a12" strokeWidth={5} strokeLinecap="round" />
          <path d={`M${h.x + 5},${h.y + 4} L${h.x + 7},${h.y + 252}`} stroke="rgba(255,235,200,0.14)" strokeWidth={1.2} strokeLinecap="round" />
          {/* стальной наконечник */}
          <path d={`M${h.x + 8},${h.y + 256} L${h.x + 8},${h.y + 268}`} stroke="#8a8f96" strokeWidth={4.4} strokeLinecap="round" />
          {/* резиновый башмак */}
          <path d={`M${h.x + 8},${h.y + 268} L${h.x + 8},${h.y + 272}`} stroke="#1a1a1a" strokeWidth={5.4} strokeLinecap="round" />
        </g>
      );
    },
  },
  {
    id: 'acc-round-thin-glasses', name: 'Круглые очки в тонкой оправе', category: 'accessories', fit: 'both', z: 65, bbox: [112, 62, 76, 30],
    render: () => (
      <g fill="rgba(255,255,255,0.07)" stroke="#3a2c20" strokeWidth={1.1}>
        <circle cx={135.5} cy={79} r={10} />
        <circle cx={164.5} cy={79} r={10} />
        <path d="M145.5,78 Q150,74.5 154.5,78" fill="none" strokeWidth={1} />
        <path d="M125.5,77.6 L115,79.4 M174.5,77.6 L185,79.4" fill="none" strokeWidth={1} />
        {/* дужки-петли */}
        <circle cx={125.5} cy={78} r={0.9} fill="#c9a24b" stroke="none" />
        <circle cx={174.5} cy={78} r={0.9} fill="#c9a24b" stroke="none" />
      </g>
    ),
  },
  {
    id: 'acc-legbrace-shoe-set', name: 'Комплект Геббельса: аппарат и ботинок с подошвой', category: 'accessories', fit: 'm', z: 55, bbox: [56, 300, 188, 320],
    mirrorable: true,
    render: (_g, rig, context) => {
      const leg = rig.legs[context?.mirrored ? 0 : 1];
      const sd = leg.side;
      const top = { x: leg.knee.x + sd * (leg.kneeWidth + 3), y: leg.knee.y - 6 };
      const bot = { x: leg.ankle.x + sd * (leg.ankleWidth + 4), y: leg.ankle.y - 2 };
      const rail = `M${top.x} ${top.y} L${bot.x} ${bot.y}`;
      return (
        <g>
          {/* шина на одной ноге */}
          <path d={rail} stroke="#7a8088" strokeWidth={4.4} strokeLinecap="round" fill="none" />
          <path d={rail} stroke="#dfe4e8" strokeWidth={2.2} strokeLinecap="round" fill="none" />
          <circle cx={top.x} cy={top.y} r={3.6} fill="#dfe4e8" stroke="#4a4e54" strokeWidth={0.9} />
          <circle cx={top.x} cy={top.y} r={1.3} fill="#4a4e54" />
          {/* ремешки */}
          {[0.2, 0.55, 0.86].map((t) => {
            const pt = between(top, bot, t);
            const w = (leg.calfWidth * 2 * (1 - t * 0.4)) + 8;
            return <path key={t} d={`M${pt.x - sd * 3} ${pt.y - 2} Q${pt.x - sd * 3} ${pt.y + 6} ${pt.x - sd * w} ${pt.y + 1}`} stroke="#3a2418" strokeWidth={5.2} fill="none" strokeLinecap="round" />;
          })}
          {/* стремя */}
          <path d={`M${bot.x} ${bot.y} L${leg.ankle.x} ${leg.ankle.y + 15}`} stroke="#9aa0a8" strokeWidth={3.4} strokeLinecap="round" fill="none" />
          {/* утолщённая подошва только на этой ноге */}
          <g transform={leg.footTransform}>
            <path d={FOOT_OUTLINE} fill="#3f2b1c" {...outline} />
            <path d="M-11 17.6 L-11 28.5 Q-11 30.6 -8.4 30.6 L31 30.6 Q33.4 30.6 33.4 28 L33.4 17.6 Z" fill="#2a1c12" {...outline} />
            <path d="M-10.5 17.8 L-10.5 28 L2 28 L2 17.8 Z" fill="#b08a4e" opacity={0.65} />
          </g>
          {/* вторая нога — обычная подошва */}
          <g transform={rig.legs[context?.mirrored ? 1 : 0].footTransform}>
            <path d={FOOT_OUTLINE} fill="#3f2b1c" {...outline} />
            <path d="M-10 17.6 L-10 22.5 Q-10 24 -8 24 L30 24 Q32 24 32 22 L32 17.6 Z" fill="#2a1c12" {...outline} />
          </g>
        </g>
      );
    },
  },
];

export const itemById = (id: string) => ITEMS.find((i) => i.id === id);
