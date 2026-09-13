import type { Gender } from './types';

interface Profile {
  cheek: number;
  cheekY: number;
  jaw: number;
  jawY: number;
  chin: number;
  chinY: number;
  softness: number;
  featureWidth: number;
  featureHeight: number;
}

/** настройки морфологии (все параметры опциональны) */
export interface Morph {
  chinWidth?: number;
  chinLength?: number;
  /** ширина челюсти (углы нижней челюсти), % */
  jawWidth?: number;
  cheekbone?: number;
  cheekVolume?: number;
  /** высота линии челюсти перед подбородком, 100 = базовая */
  jawHeight?: number;
  cheekHeight?: number;
  foreheadHeight?: number;
}

const PROFILES: Record<string, Profile> = {
  oval:     { cheek: 33, cheekY: 86, jaw: 23, jawY: 105, chin: 11, chinY: 122, softness: 7, featureWidth: 1,    featureHeight: 1 },
  round:    { cheek: 37, cheekY: 84, jaw: 29, jawY: 103, chin: 18, chinY: 119, softness: 10, featureWidth: 1.02, featureHeight: 0.94 },
  square:   { cheek: 34, cheekY: 87, jaw: 31, jawY: 110, chin: 21, chinY: 121, softness: 3, featureWidth: 1.01,  featureHeight: 1 },
  heart:    { cheek: 33, cheekY: 83, jaw: 18, jawY: 105, chin: 6,  chinY: 123, softness: 6, featureWidth: 0.98,  featureHeight: 0.97 },
  diamond:  { cheek: 38, cheekY: 84, jaw: 21, jawY: 106, chin: 8,  chinY: 125, softness: 3, featureWidth: 0.99,  featureHeight: 1 },
  oblong:   { cheek: 31, cheekY: 87, jaw: 25, jawY: 116, chin: 13, chinY: 132, softness: 5, featureWidth: 0.97,  featureHeight: 1.13 },
  pear:     { cheek: 34, cheekY: 90, jaw: 33, jawY: 106, chin: 20, chinY: 124, softness: 8, featureWidth: 0.97,  featureHeight: 1.01 },
  angular:  { cheek: 36, cheekY: 83, jaw: 28, jawY: 108, chin: 11, chinY: 126, softness: 2, featureWidth: 1,     featureHeight: 1.02 },
  narrow:   { cheek: 29, cheekY: 85, jaw: 19, jawY: 108, chin: 9,  chinY: 125, softness: 6, featureWidth: 0.92,  featureHeight: 1.03 },
  rectangle:{ cheek: 31, cheekY: 86, jaw: 29, jawY: 116, chin: 16, chinY: 131, softness: 3, featureWidth: 0.98,  featureHeight: 1.11 },
  triangle: { cheek: 28, cheekY: 84, jaw: 36, jawY: 110, chin: 18, chinY: 124, softness: 5, featureWidth: 0.98,  featureHeight: 1.02 },
  'soft-square': { cheek: 34, cheekY: 86, jaw: 30, jawY: 109, chin: 17, chinY: 123, softness: 7, featureWidth: 1.0, featureHeight: 1.0 },
  'full-oval': { cheek: 36, cheekY: 87, jaw: 26, jawY: 107, chin: 14, chinY: 123, softness: 10, featureWidth: 1.01, featureHeight: 1.0 },
};

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

// All shapes share a scalp anchor, so a hairstyle still fits after changing the jaw.
export function getFaceGeometry(gender: Gender, shape: string, morph: Morph = {}) {
  const p = PROFILES[shape] ?? PROFILES.oval;
  const male = gender === 'm';
  const vol = clamp(morph.cheekVolume ?? 0, -100, 100); // − худоба, + полнота
  const temple = male ? 37 : 35;
  const cheekW = clamp((p.cheek + (male ? 1.5 : 0)) * ((morph.cheekbone ?? 100) / 100) + vol * 0.045, 24, 46);
  const cheekY = clamp(p.cheekY + ((morph.cheekHeight ?? 100) - 100) * 0.08 + (100 - (morph.cheekbone ?? 100)) * 0.02 + vol * 0.03, 78, 96);
  const forehead = clamp(((morph.foreheadHeight ?? 100) - 100) * 0.07, -6, 8);
  // Ширина челюсти: аддитивный сдвиг (±22 px на краях слайдера), чтобы эффект был явным на любой форме лица
  const jawW = clamp(((morph.jawWidth ?? 100) - 100) * 0.34, -14, 22);
  const jaw = clamp(p.jaw + (male ? 2 : 0) + jawW + vol * 0.075, 10, 46);
  const chin = clamp((p.chin + (male ? 1.5 : 0)) * ((morph.chinWidth ?? 100) / 100), 4, 26);
  const chinY = clamp((p.chinY + (male ? 1 : 0)) * ((morph.chinLength ?? 100) / 100), 114, 140);
  // линия челюсти перед подбородком: слайдер сдвигает её вверх/вниз, не трогая кончик подбородка
  const jawY = clamp(p.jawY + ((morph.jawHeight ?? 100) - 100) * 0.16, 92, 128);
  // худоба — более острые переходы; полнота — мягче
  const s = clamp(p.softness + vol * 0.035, 1.5, 13);

  const path = [
    'M150 34',
    `C${150 + temple * 0.7} 34 ${150 + temple} 49 ${150 + temple} 69`,
    `C${150 + temple} 76 ${150 + cheekW} ${cheekY - 5} ${150 + cheekW} ${cheekY}`,
    `C${150 + cheekW} ${cheekY + s} ${150 + jaw * 0.4 + cheekW * 0.6} ${jawY - 4} ${150 + jaw} ${jawY}`,
    // подбородок: меньше сегмент — более «острый» носок при высоком chinY
    `C${150 + jaw - s * 0.3} ${jawY + 5} ${150 + chin} ${chinY} 150 ${chinY}`,
    `C${150 - chin} ${chinY} ${150 - jaw + s * 0.3} ${jawY + 5} ${150 - jaw} ${jawY}`,
    `C${150 - jaw * 0.4 - cheekW * 0.6} ${jawY - 4} ${150 - cheekW} ${cheekY + s} ${150 - cheekW} ${cheekY}`,
    `C${150 - cheekW} ${cheekY - 5} ${150 - temple} 76 ${150 - temple} 69`,
    `C${150 - temple} 49 ${150 - temple * 0.7} 34 150 34Z`,
  ].join(' ');

  return {
    path,
    chinY,
    jawY,
    temple,
    cheek: cheekW,
    /** положение яблока щеки для румян/ямочек */
    cheekApple: { x: 126 - vol * 0.02, y: 92 + vol * 0.025 },
    earOffset: Math.min(temple + 1, cheekW + 3.5),
    featureScaleX: p.featureWidth,
    featureScaleY: p.featureHeight,
    featureTransform: `translate(150 ${76 + forehead}) scale(${p.featureWidth} ${p.featureHeight}) translate(-150 -76)`,
    inverseFeatureTransform: `translate(150 76) scale(${1 / p.featureWidth} ${1 / p.featureHeight}) translate(-150 ${-76 - forehead})`,
    detailInset: 'translate(150 80) scale(0.972 0.976) translate(-150 -80)',
  };
}
