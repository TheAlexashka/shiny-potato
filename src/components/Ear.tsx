import { useId } from 'react';
import type { FaceSel } from '../data/types';
import type { getFaceGeometry } from '../data/faceGeometry';

type EarDamage = 'notched' | 'torn-rim' | 'split-lobe' | 'missing-lobe' | 'cauliflower' | 'scarred' | 'burned' | 'partial';

const PROFILES: Record<string, { width: number; height: number; lobe: number; attached?: boolean; pointed?: boolean; damage?: EarDamage }> = {
  standard: { width: 1, height: 1, lobe: 0 },
  small: { width: 0.82, height: 0.84, lobe: -0.4 },
  close: { width: 0.64, height: 0.97, lobe: 0, attached: true },
  protruding: { width: 1.36, height: 1.03, lobe: 0.4 },
  'long-lobe': { width: 0.98, height: 1.01, lobe: 3.4 },
  attached: { width: 1.02, height: 0.98, lobe: -0.7, attached: true },
  long: { width: 0.94, height: 1.18, lobe: 1.2 },
  pointed: { width: 1, height: 1.03, lobe: 0, pointed: true },
  notched: { width: 1, height: 1, lobe: 0, damage: 'notched' },
  'torn-rim': { width: 1.02, height: 0.98, lobe: 0, damage: 'torn-rim' },
  'split-lobe': { width: 1, height: 1, lobe: 2.2, damage: 'split-lobe' },
  'missing-lobe': { width: 0.98, height: 0.9, lobe: -2, attached: true, damage: 'missing-lobe' },
  cauliflower: { width: 1.16, height: 0.98, lobe: 0, damage: 'cauliflower' },
  'scarred-ear': { width: 1, height: 1, lobe: 0, damage: 'scarred' },
  'burned-ear': { width: 0.9, height: 0.94, lobe: -0.8, attached: true, damage: 'burned' },
  'partial-ear': { width: 0.78, height: 0.78, lobe: -1.8, attached: true, damage: 'partial' },
};

function EarArt({ skin, style, width = 1, height = 1 }: { skin: string; style: string; width?: number; height?: number }) {
  const id = `ear-${useId().replace(/:/g, '')}`;
  const p = PROFILES[style] ?? PROFILES.standard;
  const tip = p.damage === 'notched'
    ? 'C-2-14 2-16.3 5.9-14.5 C9.4-12.7 9.9-10.7 9.5-8 L6.1-5.4 L9.8-2.8'
    : p.damage === 'partial'
      ? 'C-2-12 1-13.2 3.6-11.5 L2.5-8 L6-6'
      : p.pointed ? 'C-2-13 3-18 7.2-17 C8.6-13 9.3-11 9.5-8' : 'C-2-14 2-16.3 5.9-14.5 C9.4-12.7 9.9-10.7 9.5-8';
  const rim = p.damage === 'torn-rim'
    ? 'L7.2-5.5 L10-2.2 L7.1 0.6 L8.4 4.8'
    : p.damage === 'burned'
      ? 'C8.2-3 6.8-.8 7.4 2.2 L5.8 5.2'
      : p.damage === 'partial'
        ? 'L5.5-2 L4.5 3.5'
        : 'C10.5 -3 9 2 7.5 5.7';
  const lobe = p.damage === 'split-lobe'
    ? `C7 10.5 7.1 ${14.5 + p.lobe} 3.8 ${15 + p.lobe} C2 ${15.7 + p.lobe} 1.2 ${13 + p.lobe} 0.2 ${11 + p.lobe} C-0.6 ${13 + p.lobe} -1.5 ${14 + p.lobe} -2 ${12 + p.lobe} L-2 9`
    : p.damage === 'missing-lobe' || p.damage === 'partial'
      ? 'C5.2 7.4 2.8 9 -0.2 8 L-2 5.6'
      : p.attached
    ? 'C6.8 10.5 3.6 13.4 0 12.3 L-2 9.3'
    : `C7 10.5 7.1 ${14.5 + p.lobe} 3.8 ${15 + p.lobe} C0.7 ${15.7 + p.lobe} -1.5 ${13 + p.lobe} -1.2 10`;
  const outline = `M-2 -10 ${tip} ${rim} ${lobe} C-1.3 6.2 -2 3.2 -1.4 0 C-2.7-3.5 -2.8-7.4 -2-10Z`;
  const shade = `color-mix(in srgb, ${skin} 68%, #553c32)`;
  const deep = `color-mix(in srgb, ${skin} 32%, #493026)`;
  const light = `color-mix(in srgb, ${skin} 64%, white)`;
  return (
    <g transform={`scale(${p.width * width} ${p.height * height})`} data-ear-style={style}>
      <defs>
        <clipPath id={`${id}-clip`}><path d={outline} /></clipPath>
        <linearGradient id={`${id}-volume`} x1="0" y1="0" x2="1" y2="0.35">
          <stop stopColor={shade} /><stop offset="0.43" stopColor={skin} /><stop offset="0.78" stopColor={light} /><stop offset="1" stopColor={shade} />
        </linearGradient>
        <radialGradient id={`${id}-concha`}>
          <stop stopColor={deep} stopOpacity={0.6} /><stop offset="1" stopColor={shade} stopOpacity={0} />
        </radialGradient>
      </defs>
      <path d={outline} fill={`url(#${id}-volume)`} stroke={shade} strokeWidth={0.38} />
      <g clipPath={`url(#${id}-clip)`}>
        <path d="M0-9 C1-13 6-13.8 7.6-9.3 C9.3-4.5 6.6 1.5 5.8 6.2" fill="none" stroke={shade} strokeWidth={1.4} strokeLinecap="round" />
        <path d="M0-9 C1-13 6-13.8 7.6-9.3 C9.3-4.5 6.6 1.5 5.8 6.2" fill="none" stroke={light} strokeWidth={0.65} transform="translate(0.55 -0.2)" strokeLinecap="round" />
        <ellipse cx={2.6} cy={1.7} rx={4.4} ry={7} fill={`url(#${id}-concha)`} />
        <path d="M4.2 6.4 C5.9 1.2 5.5-3 3.3-6.3 M3.3-6.3 Q1.6-6.8 0.6-5.2 M3.3-6.3 Q5-8 5.6-10" stroke={shade} strokeWidth={0.95} fill="none" strokeLinecap="round" />
        <path d="M4.7 5.7 C6.3 1.1 6-3 3.8-6.1" stroke={light} strokeWidth={0.55} fill="none" strokeLinecap="round" opacity={0.8} />
        <path d="M-0.7-1.8 C1.5-3 3.2-1.1 2.7 1.4 Q1.5 3.6 -0.4 3.2" stroke={deep} strokeWidth={0.52} fill="none" opacity={0.7} />
        <path d="M-1 0.8 Q2.3 0 1.5 3.6 L-0.8 4" fill={skin} stroke={shade} strokeWidth={0.48} />
        <path d="M0.1 7 Q2.1 5.4 3.9 6.4" fill="none" stroke={shade} strokeWidth={0.48} />
        <ellipse cx={3.1} cy={10.9 + p.lobe * 0.5} rx={2.2} ry={2.4 + p.lobe * 0.25} fill={light} opacity={0.24} />
        {p.damage === 'cauliflower' && (
          <g>
            <ellipse cx={4} cy={-5.8} rx={4.2} ry={4.8} fill={shade} opacity={0.58} />
            <ellipse cx={2} cy={0.8} rx={4.6} ry={5.2} fill={shade} opacity={0.52} />
            <ellipse cx={4.6} cy={5.2} rx={3.2} ry={3.8} fill={deep} opacity={0.38} />
            <path d="M1-8 Q7-4 2 0 Q7 4 2 8" stroke={light} strokeWidth={0.8} fill="none" opacity={0.5} />
          </g>
        )}
        {(p.damage === 'scarred' || p.damage === 'burned') && (
          <g fill="none" strokeLinecap="round">
            <path d="M0-10 Q7-4 1 2 Q6 7 1 12" stroke={`color-mix(in srgb, ${skin} 45%, #8d5a4e)`} strokeWidth={1.2} opacity={0.75} />
            <path d="M0-10 Q7-4 1 2 Q6 7 1 12" stroke={light} strokeWidth={0.34} opacity={0.55} transform="translate(-0.5 -0.3)" />
            {p.damage === 'burned' && <path d="M-1-6 L3-3 M0 1 L4 4 M0 7 L3 10" stroke={deep} strokeWidth={0.55} opacity={0.48} />}
          </g>
        )}
      </g>
    </g>
  );
}

export function Ear({ side, skin, geometry, face }: { side: -1 | 1; skin: string; geometry: ReturnType<typeof getFaceGeometry>; face: FaceSel }) {
  const width = Math.max(0.5, Math.min(1.8, (face.earWidth ?? 100) / 100));
  const height = Math.max(0.5, Math.min(1.8, (face.earHeight ?? 100) / 100));
  const size = Math.max(0.5, Math.min(1.8, (face.earSize ?? 100) / 100));
  const tilt = Math.max(-30, Math.min(30, face.earTilt ?? 0));
  const dy = Math.max(-14, Math.min(14, face.earY ?? 0));
  return (
    <g transform={`translate(${150 + side * (geometry.earOffset - 1.5)} ${81 + dy}) scale(${side} 1) rotate(${tilt})`}>
      <EarArt skin={skin} style={face.ears ?? 'standard'} width={width * size} height={height * size} />
    </g>
  );
}

export function EarPreview({ skin, style, face }: { skin: string; style: string; face?: FaceSel }) {
  const width = ((face?.earWidth ?? 100) / 100) * ((face?.earSize ?? 100) / 100);
  const height = ((face?.earHeight ?? 100) / 100) * ((face?.earSize ?? 100) / 100);
  return (
    <svg viewBox="-10 -21 31 45" className="h-full w-full" aria-hidden="true">
      <g transform={`rotate(${face?.earTilt ?? 0})`}>
        <EarArt skin={skin} style={style} width={width} height={height} />
      </g>
    </svg>
  );
}
