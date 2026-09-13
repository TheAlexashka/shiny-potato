import { useEffect, useRef, useState } from 'react';
import type { BodySel, FaceSel, Gender, Item, Pos, PoseId } from '../data/types';
import { DEFAULT_BODY, STAGE_H, STAGE_W } from '../data/types';
import { getFigureGeometry } from '../data/figureGeometry';
import { Body } from './Body';
import { Head } from './Face';
import { ItemArt } from './ItemArt';

/** Порог слоя головы: всё с z ниже — под головой (одежда), с z выше — над (волосы z=60, шляпы, очки) */
const HEAD_Z = 60;

interface Props {
  gender: Gender;
  skin: string;
  hairColor: string;
  face: FaceSel;
  body?: BodySel;
  pose?: PoseId;
  items: Item[];
  positions: Record<string, Pos>;
  mirroredItems?: Record<string, boolean>;
  onMove: (id: string, pos: Pos) => void;
  onResetOne: (id: string) => void;
  focusFace: boolean;
  focusHair: boolean;
}

interface DragState {
  id: string;
  startX: number;
  startY: number;
  origin: Pos;
  scale: number;
  pointerId: number;
  moved: boolean;
}

const FACE_BOX = { x: 86, y: 0, w: 128, h: 148 };
const HAIR_BOX = { x: 82, y: 0, w: 136, h: 184 };

export function Stage({
  gender,
  skin,
  hairColor,
  face,
  body,
  pose = 'standard',
  items,
  positions,
  mirroredItems = {},
  onMove,
  onResetOne,
  focusFace,
  focusHair,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<DragState | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const lastTap = useRef<{ id: string; t: number } | null>(null);

  const vb = focusFace ? (focusHair ? HAIR_BOX : FACE_BOX) : { x: 0, y: 0, w: STAGE_W, h: STAGE_H };
  const viewBox = `${vb.x} ${vb.y} ${vb.w} ${vb.h}`;

  const startDrag = (e: React.PointerEvent, id: string) => {
    const el = ref.current;
    if (!el || !e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0)) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = el.getBoundingClientRect();
    const scale = Math.min(rect.width / vb.w, rect.height / vb.h);
    const origin = positions[id] ?? { x: 0, y: 0 };
    drag.current = { id, startX: e.clientX, startY: e.clientY, origin, scale, pointerId: e.pointerId, moved: false };
    el.setPointerCapture(e.pointerId);
    setActive(id);
  };

  useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = drag.current;
      if (!d || e.pointerId !== d.pointerId) return;
      e.preventDefault();
      const dx = (e.clientX - d.startX) / d.scale;
      const dy = (e.clientY - d.startY) / d.scale;
      if (Math.abs(e.clientX - d.startX) + Math.abs(e.clientY - d.startY) > 4) d.moved = true;
      if (d.moved) {
        lastTap.current = null;
        onMove(d.id, { x: d.origin.x + dx, y: d.origin.y + dy });
      }
    };
    const up = (e: PointerEvent) => {
      const d = drag.current;
      if (!d || e.pointerId !== d.pointerId) return;
      if (!d.moved && e.type !== 'pointercancel') {
        const now = Date.now();
        if (lastTap.current?.id === d.id && now - lastTap.current.t < 350) {
          onResetOne(d.id);
          lastTap.current = null;
        } else {
          lastTap.current = { id: d.id, t: now };
        }
      }
      if (ref.current?.hasPointerCapture(d.pointerId)) ref.current.releasePointerCapture(d.pointerId);
      drag.current = null;
      setActive(null);
    };
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, [onMove, onResetOne]);

  const rig = getFigureGeometry(gender, body ?? DEFAULT_BODY, pose);
  const sorted = [...items].sort((a, b) => a.z - b.z);
  const backs = sorted.filter((i) => i.back);

  const layer = (item: Item, part: 'front' | 'back' = 'front') => {
    const p = positions[item.id] ?? { x: 0, y: 0 };
    const isActive = active === item.id;
    return (
      <svg key={`${part}-${item.id}`} viewBox={viewBox} className="absolute inset-0 h-full w-full overflow-visible" style={{ pointerEvents: 'none' }}>
        <g
          transform={`translate(${p.x} ${p.y})`}
          style={{
            pointerEvents: 'visiblePainted',
            cursor: isActive ? 'grabbing' : 'grab',
            filter: isActive ? 'drop-shadow(0 6px 6px rgba(0,0,0,0.35))' : undefined,
          }}
          onPointerDown={(e) => startDrag(e, item.id)}
        >
          <title>{item.name}</title>
          <ItemArt item={item} gender={gender} rig={rig} face={face} mirrored={mirroredItems[item.id]} layer={part} />
        </g>
      </svg>
    );
  };

  return (
    <div
      ref={ref}
      className="stage-art relative mx-auto h-full w-full select-none"
      style={{
        touchAction: 'none',
        ['--hair' as string]: hairColor,
        ['--hairFront' as string]: String((face.hairFrontWidth ?? 100) / 100),
        ['--hairBack' as string]: String((face.hairBackWidth ?? 100) / 100),
        ['--hairFrontH' as string]: String((face.hairFrontHeight ?? 100) / 100),
        ['--hairBackH' as string]: String((face.hairBackHeight ?? 100) / 100),
        ['--ribbon' as string]: face.ribbonColor ?? '#8b2635',
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <svg viewBox={viewBox} className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#efe4cc" />
            <stop offset="1" stopColor="#d9c9a6" />
          </linearGradient>
          <pattern id="deco" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M15,0 L30,15 L15,30 L0,15 Z" fill="none" stroke="rgba(120,90,40,0.10)" strokeWidth="1" />
          </pattern>
          <radialGradient id="spot" cx="0.5" cy="0.35" r="0.7">
            <stop offset="0" stopColor="rgba(255,250,235,0.9)" />
            <stop offset="1" stopColor="rgba(255,250,235,0)" />
          </radialGradient>
        </defs>
        <rect x={0} y={0} width={STAGE_W} height={STAGE_H} fill="url(#wall)" />
        <rect x={0} y={0} width={STAGE_W} height={STAGE_H} fill="url(#deco)" />
        <rect x={0} y={0} width={STAGE_W} height={STAGE_H} fill="url(#spot)" />
        <rect y={596} width={STAGE_W} height={24} fill="#6b4a2e" />
        <rect y={596} width={STAGE_W} height={3} fill="#4a321e" />
        <ellipse cx={150} cy={594} rx={80} ry={8} fill="rgba(0,0,0,0.18)" />
      </svg>

      {backs.map((i) => layer(i, 'back'))}

      {/* Тело без головы: одежда ложится на торс и шею */}
      <svg viewBox={viewBox} className="absolute inset-0 h-full w-full" style={{ pointerEvents: 'none' }}>
        <g style={{ pointerEvents: 'visiblePainted' }} onPointerDown={(e) => e.stopPropagation()}>
          <Body gender={gender} skin={skin} hairColor={hairColor} face={face} body={body} pose={pose} uid="main" withHead={false} />
        </g>
      </svg>

      {/* Одежда и всё ниже уровня головы (z < HEAD_Z) */}
      {sorted.filter((i) => i.z < HEAD_Z).map((i) => layer(i))}

      {/* Голова — поверх воротников и горловин, но под волосами и шляпами */}
      <svg viewBox={viewBox} className="absolute inset-0 h-full w-full" style={{ pointerEvents: 'none' }}>
        <g style={{ pointerEvents: 'visiblePainted' }} onPointerDown={(e) => e.stopPropagation()}>
          <Head gender={gender} skin={skin} hairColor={hairColor} face={face} pigmentation={body} uid="main-head" />
        </g>
      </svg>

      {/* Волосы (передний слой), головные уборы, очки и прочее с z >= HEAD_Z */}
      {sorted.filter((i) => i.z >= HEAD_Z).map((i) => layer(i))}
    </div>
  );
}
