import { memo } from 'react';
import type { FaceSel } from '../data/types';
import { FACE_MARKS } from '../data/faceMarks';

/** Шрамы, ранения и врождённые особенности лица. Рисуются поверх черт, внутри контура лица. */
export const FaceMarksLayer = memo(function FaceMarksLayer({ face, skin }: { face: FaceSel; skin: string }) {
  const marks = face.faceMarks ?? {};
  const entries = Object.entries(marks).filter(([, v]) => v > 0);
  if (!entries.length) return null;
  return (
    <g data-face-marks>
      {entries.map(([id, value]) => {
        const option = FACE_MARKS.find((m) => m.id === id);
        if (!option) return null;
        return (
          <g key={id} data-face-mark={id} opacity={Math.max(0, Math.min(100, value)) / 100}>
            {option.art({ skin, scarTone: face.scarTone })}
          </g>
        );
      })}
    </g>
  );
});
