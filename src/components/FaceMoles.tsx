import { memo } from 'react';
import type { FaceSel } from '../data/types';
import { MOLE_OPTIONS } from '../data/moles';

export const FaceMoles = memo(function FaceMoles({ face }: { face: FaceSel }) {
  const color = face.moleColor ?? '#704632';
  const size = Math.max(0.5, Math.min(1.8, (face.moleSize ?? 100) / 100));
  return (
    <g data-face-moles>
      {MOLE_OPTIONS.map((option) => {
        const opacity = Math.max(0, Math.min(100, face.moles?.[option.id] ?? 0)) / 100;
        if (!opacity) return null;
        const saturation = Math.max(0, Math.min(100, face.moleSaturation ?? 85)) / 100;
        return (
          <g key={option.id} data-mole-style={option.id} opacity={opacity * saturation}>
            {option.dots.map((dot, i) => {
              const r = dot.radius * size;
              return (
                <g key={i}>
                  {dot.raised && <ellipse cx={dot.x + 0.2} cy={dot.y + r * 0.4} rx={r * 1.08} ry={r * 0.86} fill="#463129" opacity={0.25} />}
                  <ellipse cx={dot.x} cy={dot.y} rx={r} ry={r * 0.9} fill={color} opacity={dot.light ? 0.46 : 0.9} />
                  {dot.raised && <ellipse cx={dot.x - r * 0.2} cy={dot.y - r * 0.32} rx={r * 0.36} ry={r * 0.24} fill="#fff0dc" opacity={0.22} />}
                </g>
              );
            })}
          </g>
        );
      })}
    </g>
  );
});
