import { memo, useId } from 'react';
import type { FaceSel, Gender } from '../data/types';
import { effectsVolume } from '../data/skinEffects';
import { getFaceGeometry } from '../data/faceGeometry';
import { FACE_PROSTHETICS } from '../data/prosthetics';

/** Протезы: нос/челюсть привязаны к чертам, маски обрезаются по контуру лица.
 *  Стеклянные глаза здесь не рисуем — они внутри век в Face.tsx. */
export const ProstheticsLayer = memo(function ProstheticsLayer({
  face,
  skin,
  gender,
}: {
  face: FaceSel;
  skin: string;
  gender: Gender;
}) {
  const clipId = `pm-${useId().replace(/:/g, '')}`;
  const prosthetics = face.prosthetics ?? {};
  const entries = Object.entries(prosthetics).filter(
    ([id, v]) => v > 0 && !id.startsWith('glass-eye'),
  );
  if (!entries.length) return null;

  const morph = {
    chinWidth: face.chinWidth,
    chinLength: face.chinLength,
    jawWidth: face.jawWidth,
    cheekVolume: Math.round(effectsVolume(face.skinEffects)),
  };
  const geometry = getFaceGeometry(gender, face.shape, morph);

  const spacing = face.eyeSpacing ?? 0;
  const eyeY = face.eyeY ?? 1.5;
  const eyeL = { x: 150 - (15.6 + spacing / 2), y: 75 + eyeY };
  const eyeR = { x: 150 + (15.6 + spacing / 2), y: 75 + eyeY };
  const eyeRX = 9.2 * ((face.eyeWidth ?? 100) / 100);
  const eyeRY = 4.6 * ((face.eyeHeight ?? 100) / 100) + 1.2;

  const noseTip = face.nose === 'long' ? 98
    : face.nose === 'hooked' ? 101
    : face.nose === 'button' ? 91.5
    : face.nose === 'aquiline' ? 96
    : face.nose === 'high-bridge' ? 95.2
    : 94.2;

  const lips = face.lips;
  const baseW = lips === 'wide' ? 13.4 : lips === 'thin-wide' ? 14.6 : lips === 'corners-down' ? 12.2 : lips === 'thin' ? 9 : lips === 'bow' ? 9.6 : lips === 'full' ? 11.6 : 10.4;
  const baseTop = lips === 'thin' ? 1.2 : lips === 'thin-wide' ? 0.85 : lips === 'corners-down' ? 1.1 : lips === 'full' ? 3.9 : lips === 'bow' ? 4.3 : 2.7;
  const baseBottom = lips === 'thin' ? 1.8 : lips === 'thin-wide' ? 1.5 : lips === 'corners-down' ? 2.1 : lips === 'full' ? 4.6 : 3.2;
  const fullness = (face.lipFullness ?? 100) / 100;
  const mouthY = 104 + (face.lipY ?? 0);
  const upper = baseTop * fullness * ((face.upperFullness ?? 100) / 100);
  const lower = baseBottom * fullness * ((face.lowerFullness ?? 100) / 100);
  const gap = Math.min(1, Math.max(0, (face.lipOpenness ?? 0) / 100)) * 4.6;
  const mouthHalfW = baseW * ((face.lipWidth ?? 100) / 100);
  const mouthTop = mouthY - upper - 1.2;
  const mouthBottom = mouthY + lower * 1.4 + gap + 1.6;

  const chinY = 76 + (geometry.chinY - 76) / geometry.featureScaleY;

  const ctxBase = {
    skin,
    iris: face.iris,
    face,
    eyeL,
    eyeR,
    eyeRX,
    eyeRY,
    noseTip,
    mouthY,
    mouthHalfW,
    mouthTop,
    mouthBottom,
    chinY,
    templeHalf: geometry.temple / geometry.featureScaleX,
    idPrefix: clipId,
    sheen: `url(#${clipId}-sheen)`,
  };

  return (
    <g data-prosthetics>
      <defs>
        <clipPath id={clipId}>
          <path d={geometry.path} transform={geometry.inverseFeatureTransform} />
        </clipPath>
        <linearGradient id={`${clipId}-sheen`} x1="0" y1="0" x2="0.85" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.42} />
          <stop offset="0.38" stopColor="#ffffff" stopOpacity={0.08} />
          <stop offset="0.62" stopColor="#3a332b" stopOpacity={0.12} />
          <stop offset="1" stopColor="#241f1a" stopOpacity={0.3} />
        </linearGradient>
      </defs>
      {entries.map(([prostheticId, value]) => {
        const option = FACE_PROSTHETICS.find((p) => p.id === prostheticId);
        if (!option) return null;
        const opacity = Math.max(0, Math.min(100, value)) / 100;
        const art = option.art({ ...ctxBase, side: -1 });
        if (!art) return null;
        return (
          <g key={prostheticId} data-prosthetic={prostheticId} opacity={opacity}>
            {option.clipToFace ? <g clipPath={`url(#${clipId})`}>{art}</g> : art}
          </g>
        );
      })}
    </g>
  );
});
