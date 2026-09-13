import type { ReactNode } from 'react';
import type { BodySel } from '../data/types';
import { VITILIGO_DEFAULT_COLOR } from '../data/types';
import type { FigureGeometry, Point } from '../data/figureGeometry';
import { organicPatch } from '../data/skinGeometry';
import { armAmputation, legAmputation } from '../data/limbs';

const opacityOf = (body: BodySel, id: string) => Math.max(0, Math.min(100, body.marks?.[id] ?? 0)) / 100;
const segmentTransform = (a: Point, b: Point) => `translate(${a.x} ${a.y}) rotate(${Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI - 90})`;

function Freckles({ x, y, rx, ry, seed, count = 32 }: { x: number; y: number; rx: number; ry: number; seed: number; count?: number }) {
  return (
    <g fill="#7c4a32">
      {Array.from({ length: count }, (_, i) => {
        const a = i * 2.399 + seed;
        const r = Math.sqrt(((i * 37 + seed * 13) % 101) / 101);
        return <circle key={i} cx={x + Math.cos(a) * rx * r} cy={y + Math.sin(a) * ry * r} r={0.42 + (i % 3) * 0.12} opacity={0.32 + (i % 4) * 0.1} />;
      })}
    </g>
  );
}

function Scar({ d, width = 1.3, skin }: { d: string; width?: number; skin: string }) {
  const mid = `color-mix(in srgb, ${skin} 55%, #8d5a4e)`;
  const deep = `color-mix(in srgb, ${skin} 40%, #4a2a24)`;
  const light = `color-mix(in srgb, ${skin} 65%, #f6e3d8)`;
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={deep} strokeWidth={width + 1.1} opacity={0.25} />
      <path d={d} stroke={mid} strokeWidth={width} opacity={0.82} />
      <path d={d} stroke={light} strokeWidth={0.45} opacity={0.6} transform="translate(0 -0.45)" />
    </g>
  );
}

export function BodyMarks({ body, rig, skin = '#e9c19c' }: { body: BodySel; rig: FigureGeometry; skin?: string }) {
  const { arms, legs, waist, chest, hips, female } = rig;
  const color = body.vitiligoColor ?? VITILIGO_DEFAULT_COLOR;
  const mark = (id: string, children: ReactNode) => opacityOf(body, id) > 0 ? <g data-body-mark={id} opacity={opacityOf(body, id)}>{children}</g> : null;

  const hands = (seed: number) => arms.filter((arm) => !armAmputation(rig, arm.side)).map((arm, i) => (
    <g key={`hand-${i}`} transform={arm.handTransform} fill={color}>
      <path d={organicPatch(-0.2, 7, 7.5, 10, seed + i)} />
      <path d={organicPatch(1.8, 20, 3, 6.5, seed + i + 4)} />
      <path d={organicPatch(5.4, 15, 2.4, 5, seed + i + 8)} />
    </g>
  ));

  const limbs = (seed: number) => (
    <g fill={color}>
      {arms.map((arm, i) => {
        const loss = armAmputation(rig, arm.side);
        if (loss === 'shoulder') return null;
        return (
          <g key={`arm-${i}`}>
            <g transform={segmentTransform(arm.shoulder, arm.elbow)}>
              <path d={organicPatch(0, 36, 8, 18, seed + i)} />
              {loss !== 'elbow' && <path d={organicPatch(arm.side * 2.2, 58, 6.5, 13, seed + i + 3)} />}
            </g>
            {loss !== 'elbow' && (
              <g transform={segmentTransform(arm.elbow, arm.hand)}>
                <path d={organicPatch(0, 34, 6.5, 16, seed + i + 7)} />
                <path d={organicPatch(-arm.side * 2, 56, 5.5, 12, seed + i + 10)} />
              </g>
            )}
          </g>
        );
      })}
      {legs.map((leg, i) => {
        const loss = legAmputation(rig, leg.side);
        if (loss === 'hip') return null;
        return (
          <g key={`leg-${i}`}>
            <g transform={segmentTransform(leg.hip, leg.knee)}>
              <path d={organicPatch(0, 50, 10, 26, seed + 8 + i)} />
              <path d={organicPatch(leg.side * 3, 85, 8.5, 18, seed + 12 + i)} />
            </g>
            {loss !== 'knee' && (
              <g transform={segmentTransform(leg.knee, leg.ankle)}>
                <path d={organicPatch(0, 42, 7.5, 22, seed + 16 + i)} />
                <path d={organicPatch(-leg.side * 2, 78, 6.5, 14, seed + 20 + i)} />
              </g>
            )}
          </g>
        );
      })}
    </g>
  );

  const torso = (seed: number) => (
    <g fill={color}>
      <path d={organicPatch(chest.x - 14, chest.y - 12, 16 * rig.chestScale, 14, seed)} />
      <path d={organicPatch(chest.x + 15, chest.y + 7, 12 * rig.chestScale, 10, seed + 1)} />
      <path d={organicPatch(waist.x - 2, waist.y + 8, 15 * rig.bellyScale, 13, seed + 2)} />
      <path d={organicPatch(hips[0].x + 10, hips[0].y + 6, 14, 12, seed + 3)} />
      <path d={organicPatch(hips[1].x - 8, hips[1].y + 14, 12, 15, seed + 4)} />
    </g>
  );

  return (
    <g>
      {mark('vit-face-hands', hands(5))}
      {mark('vit-hands', hands(19))}
      {mark('vit-limbs', <>{limbs(11)}{hands(14)}</>)}
      {mark('vit-patches', <>{torso(3)}{legAmputation(rig, legs[0].side) !== 'hip' && <path d={organicPatch(legs[0].knee.x - 3, legs[0].knee.y - 34, 9, 16, 27)} fill={color} />}{armAmputation(rig, arms[0].side) !== 'shoulder' && <path d={organicPatch(arms[0].elbow.x, arms[0].elbow.y + 10, 7, 12, 31)} fill={color} />}</>)}
      {mark('vit-universal', <>{torso(35)}{limbs(41)}{hands(45)}</>)}

      {mark('freckles-shoulders', arms.filter((arm) => armAmputation(rig, arm.side) !== 'shoulder').map((arm, i) => <Freckles key={i} x={arm.shoulder.x - arm.side * 8} y={arm.shoulder.y} rx={17} ry={9} seed={i + 2} />))}
      {mark('freckles-chest', <Freckles x={chest.x} y={chest.y - 18} rx={25 * rig.chestScale} ry={14} seed={7} count={46} />)}
      {mark('freckles-arms', arms.filter((arm) => armAmputation(rig, arm.side) !== 'shoulder').map((arm, i) => <g key={i} transform={segmentTransform(arm.shoulder, arm.elbow)}><Freckles x={0} y={38} rx={8} ry={25} seed={i + 9} /></g>))}
      {mark('moles', <g fill="#634333"><circle cx={chest.x - 16} cy={166} r={0.9} /><circle cx={chest.x + 18} cy={204} r={1.1} /><circle cx={waist.x + 11} cy={waist.y + 1} r={1.15} /><circle cx={legs[0].knee.x - 4} cy={392} r={0.9} /></g>)}
      {mark('scar-collarbone', <Scar skin={skin} d={`M${chest.x - 22} 154 Q${chest.x - 15} 150 ${chest.x - 7} 156`} />)}
      {armAmputation(rig, arms[0].side) !== 'elbow' && armAmputation(rig, arms[0].side) !== 'shoulder' && mark('scar-arm', <g transform={segmentTransform(arms[0].elbow, arms[0].hand)}><Scar skin={skin} d="M-2 13 Q1 26 -1 38" /></g>)}
      {mark('scar-belly', <><Scar skin={skin} d={`M${waist.x - 12} ${waist.y + 18} Q${waist.x} ${waist.y + 14} ${waist.x + 12} ${waist.y + 19}`} />{[-8, -3, 3, 8].map((x) => <path key={x} d={`M${waist.x + x} ${waist.y + 16} l-.4 3.2`} stroke={`color-mix(in srgb, ${skin} 45%, #6e4438)`} opacity={0.46} strokeWidth={0.45} />)}</>)}
      {legAmputation(rig, legs[1].side) !== 'hip' && mark('scar-thigh', <g transform={segmentTransform(legs[1].hip, legs[1].knee)}><Scar skin={skin} d="M-6 48 Q-3 59 -5 78" /></g>)}
      {legAmputation(rig, legs[0].side) !== 'hip' && mark('scar-knee', <><path d={organicPatch(legs[0].knee.x, legs[0].knee.y - 2, 5.5, 4.5, 12)} fill={`color-mix(in srgb, ${skin} 45%, #a85a50)`} opacity={0.58} /><path d={`M${legs[0].knee.x - 3} ${legs[0].knee.y - 2} l1 3 m1-4 l.8 3 m1-2 l.7 2`} stroke={`color-mix(in srgb, ${skin} 40%, #5a2e28)`} opacity={0.58} strokeWidth={0.6} /></>)}
      {armAmputation(rig, arms[1].side) !== 'shoulder' && mark('birthmark', <g transform={segmentTransform(arms[1].shoulder, arms[1].elbow)}><path d={organicPatch(2, 29, 6, 7, 32)} fill={`color-mix(in srgb, ${skin} 55%, #5a3a26)`} opacity={0.55} /></g>)}
      {mark('tan-lines', <g fill="none" strokeLinecap="round"><path d={female ? `M${chest.x - 26} 146 L${chest.x - 17} 184 M${chest.x + 26} 146 L${chest.x + 17} 184` : `M${chest.x - 26} 149 Q${chest.x} 173 ${chest.x + 26} 149`} stroke="#fff3e4" strokeWidth={4} opacity={0.25} /></g>)}
      {mark('stretch', <g fill="none" stroke="#d6a6a0" strokeWidth={0.6} opacity={0.7}>{hips.map((hip, i) => <g key={i}>{[0, 1, 2].map((j) => <path key={j} d={`M${hip.x + (i ? -1 : 1) * (8 + j * 4)} ${hip.y - 16 + j * 3} q${i ? -3 : 3} 7 ${i ? -1 : 1} 14`} />)}</g>)}</g>)}
    </g>
  );
}

export function FacialPigmentation({ body }: { body?: BodySel }) {
  if (!body) return null;
  const color = body.vitiligoColor ?? VITILIGO_DEFAULT_COLOR;
  return (
    <g fill={color}>
      {opacityOf(body, 'vit-face-hands') > 0 && (
        <g opacity={opacityOf(body, 'vit-face-hands')}>
          <path d={organicPatch(133, 82, 11, 10, 8)} />
          <path d={organicPatch(166, 79, 10, 11, 13)} />
          <path d={organicPatch(147, 102, 11, 9, 5)} />
        </g>
      )}
      {opacityOf(body, 'vit-universal') > 0 && (
        <g opacity={opacityOf(body, 'vit-universal')}>
          <path d={organicPatch(128, 83, 12, 19, 18)} />
          <path d={organicPatch(166, 66, 12, 13, 23)} />
          <path d={organicPatch(159, 109, 14, 12, 31)} />
        </g>
      )}
    </g>
  );
}
