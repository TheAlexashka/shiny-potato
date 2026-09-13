import type { FaceSel, Item } from '../data/types';

const PIVOT_X = 150;
const PIVOT_Y = 44;

function bounded(value: number | undefined, fallback: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value! : fallback));
}

function hatFit(face: FaceSel) {
  const size = bounded(face.hatScale, 100, 55, 165) / 100;
  const width = bounded(face.hatWidth, 100, 55, 165) / 100;
  return {
    rotation: bounded(face.hatRotation, 0, 0, 360),
    scaleX: width * size,
    scaleY: size,
    mirror: face.hatMirrored ? -1 : 1,
  };
}

// Uniform size affects both axes; width remains an independent local adjustment.
export function hatFitTransform(face: FaceSel): string {
  const { rotation, scaleX, scaleY, mirror } = hatFit(face);
  return `translate(${PIVOT_X} ${PIVOT_Y}) scale(${mirror} 1) rotate(${rotation}) scale(${scaleX} ${scaleY}) translate(${-PIVOT_X} ${-PIVOT_Y})`;
}

export function hatPreviewViewBox(bbox: Item['bbox'], face: FaceSel): string {
  const [x, y, width, height] = bbox;
  const { rotation, scaleX, scaleY, mirror } = hatFit(face);
  const radians = rotation * Math.PI / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const points = [
    [x, y], [x + width, y], [x, y + height], [x + width, y + height],
  ].map(([px, py]) => {
    const dx = (px - PIVOT_X) * scaleX;
    const dy = (py - PIVOT_Y) * scaleY;
    return {
      x: PIVOT_X + mirror * (dx * cos - dy * sin),
      y: PIVOT_Y + dx * sin + dy * cos,
    };
  });

  // Keep the original framing when shrinking, but never crop a rotated or reflected hat.
  const left = Math.min(x, ...points.map((p) => p.x));
  const right = Math.max(x + width, ...points.map((p) => p.x));
  const top = Math.min(y, ...points.map((p) => p.y));
  const bottom = Math.max(y + height, ...points.map((p) => p.y));
  const pad = Math.max(right - left, bottom - top) * 0.1;
  return `${left - pad} ${top - pad} ${right - left + pad * 2} ${bottom - top + pad * 2}`;
}
