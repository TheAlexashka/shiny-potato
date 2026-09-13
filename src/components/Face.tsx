import { memo, useId } from 'react';
import type { BodySel, FacePart, FaceSel, Fit, Gender } from '../data/types';
import { getFaceGeometry } from '../data/faceGeometry';
import { browOutline, browThicknessAt, createBrowSpine } from '../data/browGeometry';
import { getMakeupStyle } from '../data/makeup';
import { effectsVolume, skinEffectById } from '../data/skinEffects';
import { Wrinkles } from './Wrinkles';
import { Ear } from './Ear';
import { FaceMoles } from './FaceMoles';
import { FaceMarksLayer } from './FaceMarks';
import { ProstheticsLayer } from './Prosthetics';
import { FacialPigmentation } from './BodyMarks';

export interface FaceOption {
  id: string;
  part: Exclude<FacePart, 'bones' | 'moles' | 'marks' | 'prosthetics'>;
  name: string;
  fit: Fit;
}

export const FACE_OPTIONS: FaceOption[] = [
  { id: 'oval', part: 'shape', name: 'Овальное', fit: 'both' },
  { id: 'round', part: 'shape', name: 'Круглое', fit: 'both' },
  { id: 'square', part: 'shape', name: 'Квадратное', fit: 'both' },
  { id: 'heart', part: 'shape', name: 'Сердцевидное', fit: 'both' },
  { id: 'diamond', part: 'shape', name: 'Ромбовидное', fit: 'both' },
  { id: 'oblong', part: 'shape', name: 'Удлинённое', fit: 'both' },
  { id: 'pear', part: 'shape', name: 'Грушевидное', fit: 'both' },
  { id: 'angular', part: 'shape', name: 'Выраженные скулы', fit: 'both' },
  { id: 'narrow', part: 'shape', name: 'Узкое', fit: 'both' },
  { id: 'rectangle', part: 'shape', name: 'Прямоугольное', fit: 'both' },
  { id: 'triangle', part: 'shape', name: 'Треугольное', fit: 'both' },
  { id: 'soft-square', part: 'shape', name: 'Мягкий квадрат', fit: 'both' },
  { id: 'full-oval', part: 'shape', name: 'Полное овальное', fit: 'both' },
  { id: 'standard', part: 'ears', name: 'Классические', fit: 'both' },
  { id: 'small', part: 'ears', name: 'Небольшие', fit: 'both' },
  { id: 'close', part: 'ears', name: 'Прижатые', fit: 'both' },
  { id: 'protruding', part: 'ears', name: 'Оттопыренные', fit: 'both' },
  { id: 'long-lobe', part: 'ears', name: 'Свободная мочка', fit: 'both' },
  { id: 'attached', part: 'ears', name: 'Приросшая мочка', fit: 'both' },
  { id: 'long', part: 'ears', name: 'Вытянутые', fit: 'both' },
  { id: 'pointed', part: 'ears', name: 'Заострённые', fit: 'both' },
  { id: 'notched', part: 'ears', name: 'Надорванный верхний край', fit: 'both' },
  { id: 'torn-rim', part: 'ears', name: 'Рваный наружный край', fit: 'both' },
  { id: 'split-lobe', part: 'ears', name: 'Раздвоенная мочка', fit: 'both' },
  { id: 'missing-lobe', part: 'ears', name: 'Утраченная мочка', fit: 'both' },
  { id: 'cauliflower', part: 'ears', name: 'Деформированное ухо', fit: 'both' },
  { id: 'scarred-ear', part: 'ears', name: 'Ухо со шрамами', fit: 'both' },
  { id: 'burned-ear', part: 'ears', name: 'Ожоговая деформация', fit: 'both' },
  { id: 'partial-ear', part: 'ears', name: 'Частично утраченное ухо', fit: 'both' },
  { id: 'almond', part: 'eyes', name: 'Миндалевидные', fit: 'both' },
  { id: 'round', part: 'eyes', name: 'Круглые', fit: 'both' },
  { id: 'narrow', part: 'eyes', name: 'Узкие', fit: 'both' },
  { id: 'hooded', part: 'eyes', name: 'Нависшие веки', fit: 'both' },
  { id: 'upturn', part: 'eyes', name: 'Приподнятый угол', fit: 'both' },
  { id: 'downturn', part: 'eyes', name: 'Опущенный угол', fit: 'both' },
  { id: 'deep-set', part: 'eyes', name: 'Запавшие, под нависшим веком', fit: 'both' },
  { id: 'prominent', part: 'eyes', name: 'Выпуклые, с мешками', fit: 'both' },
  { id: 'arch', part: 'brows', name: 'Изящный изгиб', fit: 'both' },
  { id: 'thin', part: 'brows', name: 'Тонкие, 1930-е', fit: 'both' },
  { id: 'straight', part: 'brows', name: 'Прямые', fit: 'both' },
  { id: 'thick', part: 'brows', name: 'Густые', fit: 'both' },
  { id: 'soft', part: 'brows', name: 'Мягкие дуги', fit: 'both' },
  { id: 'raised', part: 'brows', name: 'Высокие', fit: 'both' },
  { id: 'low', part: 'brows', name: 'Низкие, широкие', fit: 'both' },
  { id: 'house', part: 'brows', name: 'Домиком', fit: 'both' },
  { id: 'sad', part: 'brows', name: 'Печальный изгиб', fit: 'both' },
  { id: 's-curve', part: 'brows', name: 'S-образные', fit: 'both' },
  { id: 'feathered', part: 'brows', name: 'Перьевые', fit: 'both' },
  { id: 'short', part: 'brows', name: 'Короткие', fit: 'both' },
  { id: 'orator', part: 'brows', name: 'Ораторские: тонкие с изломом', fit: 'both' },
  { id: 'orator-uneven', part: 'brows', name: 'Ораторские: неровные, живые', fit: 'both' },
  { id: 'orator-raised', part: 'brows', name: 'Ораторские: приподнятая середина', fit: 'both' },
  { id: 'miranda', part: 'brows', name: 'Кармен Миранда: тонкая дуга', fit: 'both' },
  { id: 'swanson', part: 'brows', name: 'Глория Свенсон: ниточка вверх', fit: 'both' },
  { id: 'lamarr', part: 'brows', name: 'Хеди Ламарр: высокая арка', fit: 'both' },
  { id: 'dietrich', part: 'brows', name: 'Марлен Дитрих: сбритая линия', fit: 'both' },
  { id: 'crawford', part: 'brows', name: 'Джоан Кроуфорд: густая арка', fit: 'both' },
  { id: 'hayworth', part: 'brows', name: 'Рита Хейворт: мягкий подъём', fit: 'both' },
  { id: 'taylor', part: 'brows', name: 'Элизабет Тейлор: тёмная тяжёлая', fit: 'both' },
  { id: 'hepburn', part: 'brows', name: 'Одри Хепбёрн: прямая густая', fit: 'both' },
  { id: 'bacall', part: 'brows', name: 'Лорен Бэколл: излом к виску', fit: 'both' },
  { id: 'garbo', part: 'brows', name: 'Грета Гарбо: полумесяц', fit: 'both' },
  { id: 'monroe', part: 'brows', name: 'Мэрилин Монро: острый пик', fit: 'both' },
  { id: 'davis', part: 'brows', name: 'Бетт Дэвис: длинная дуга', fit: 'both' },
  { id: 'angular', part: 'brows', name: 'Угловатые, с изломом', fit: 'both' },
  { id: 'rounded', part: 'brows', name: 'Круглые, кукольные', fit: 'both' },
  { id: 'flat-thick', part: 'brows', name: 'Плоские широкие', fit: 'both' },
  { id: 'tapered', part: 'brows', name: 'Сужающиеся к виску', fit: 'both' },
  { id: 'wide-set', part: 'brows', name: 'Разведённые в стороны', fit: 'both' },
  { id: 'close-set', part: 'brows', name: 'Сведённые к переносице', fit: 'both' },
  { id: 'stern', part: 'brows', name: 'Суровые, нависшие', fit: 'both' },
  { id: 'surprised', part: 'brows', name: 'Удивлённые, вздёрнутые', fit: 'both' },
  { id: 'brooding', part: 'brows', name: 'Хмурые, опущенные внутрь', fit: 'both' },
  { id: 'bushy', part: 'brows', name: 'Кустистые, растрёпанные', fit: 'both' },
  { id: 'wiry', part: 'brows', name: 'Жёсткие, торчащие волоски', fit: 'both' },
  { id: 'sparse', part: 'brows', name: 'Редкие, выцветшие', fit: 'both' },
  { id: 'grey-aged', part: 'brows', name: 'Седеющие, длинные волоски', fit: 'both' },
  { id: 'scarred', part: 'brows', name: 'С проплешиной от шрама', fit: 'both' },
  { id: 'drawn-pencil', part: 'brows', name: 'Нарисованные карандашом', fit: 'both' },
  { id: 'tattooed', part: 'brows', name: 'Татуаж: ровная тонкая линия', fit: 'both' },
  { id: 'asymmetric', part: 'brows', name: 'Одна бровь выше', fit: 'both' },
  { id: 'bleached', part: 'brows', name: 'Обесцвеченные', fit: 'both' },
  { id: 'monobrow-full', part: 'brows', name: 'Полная монобровь', fit: 'both' },
  { id: 'monobrow-hair', part: 'brows', name: 'Монобровь волосками', fit: 'both' },
  { id: 'monobrow-heavy', part: 'brows', name: 'Тяжёлая сросшаяся', fit: 'both' },
  { id: 'straight', part: 'nose', name: 'Прямой', fit: 'both' },
  { id: 'aquiline', part: 'nose', name: 'С горбинкой', fit: 'both' },
  { id: 'hooked', part: 'nose', name: 'Орлиный, кончик опущен', fit: 'both' },
  { id: 'high-bridge', part: 'nose', name: 'Высокая узкая переносица', fit: 'both' },
  { id: 'button', part: 'nose', name: 'Курносый', fit: 'both' },
  { id: 'wide', part: 'nose', name: 'Широкий', fit: 'both' },
  { id: 'long', part: 'nose', name: 'Длинный', fit: 'both' },
  { id: 'narrow', part: 'nose', name: 'Узкий', fit: 'both' },
  { id: 'thin', part: 'lips', name: 'Тонкие', fit: 'both' },
  { id: 'natural', part: 'lips', name: 'Натуральные', fit: 'both' },
  { id: 'full', part: 'lips', name: 'Полные', fit: 'both' },
  { id: 'cupid', part: 'lips', name: 'Бантик', fit: 'both' },
  { id: 'wide', part: 'lips', name: 'Широкие', fit: 'both' },
  { id: 'bow', part: 'lips', name: 'Лук Амура', fit: 'both' },
  { id: 'thin-wide', part: 'lips', name: 'Тонкий широкий рот', fit: 'both' },
  { id: 'corners-down', part: 'lips', name: 'Сжатый, уголки вниз', fit: 'both' },
  { id: 'clean', part: 'facialHair', name: 'Без растительности', fit: 'm' },
  { id: 'stubble-light', part: 'facialHair', name: 'Лёгкая щетина', fit: 'm' },
  { id: 'stubble-heavy', part: 'facialHair', name: 'Густая щетина', fit: 'm' },
  { id: 'pencil', part: 'facialHair', name: 'Тонкие усы', fit: 'm' },
  { id: 'chevron', part: 'facialHair', name: 'Усы шеврон', fit: 'm' },
  { id: 'handlebar', part: 'facialHair', name: 'Усы с завитком', fit: 'm' },
  { id: 'walrus', part: 'facialHair', name: 'Пышные усы', fit: 'm' },
  { id: 'toothbrush', part: 'facialHair', name: 'Усы щёточкой, а-ля Чаплин', fit: 'm' },
  { id: 'goatee', part: 'facialHair', name: 'Эспаньолка', fit: 'm' },
  { id: 'short-beard', part: 'facialHair', name: 'Короткая борода', fit: 'm' },
  { id: 'full-beard', part: 'facialHair', name: 'Полная борода', fit: 'm' },
  { id: 'sideburns', part: 'facialHair', name: 'Бакенбарды', fit: 'm' },
  { id: 'none', part: 'wrinkles', name: 'Гладкая кожа', fit: 'both' },
  { id: 'light', part: 'wrinkles', name: 'Лёгкие складки', fit: 'both' },
  { id: 'forehead', part: 'wrinkles', name: 'Лобные', fit: 'both' },
  { id: 'frown', part: 'wrinkles', name: 'Межбровные', fit: 'both' },
  { id: 'crows', part: 'wrinkles', name: 'Гусиные лапки', fit: 'both' },
  { id: 'undereye', part: 'wrinkles', name: 'Под глазами', fit: 'both' },
  { id: 'smile', part: 'wrinkles', name: 'Носогубные', fit: 'both' },
  { id: 'cheek', part: 'wrinkles', name: 'На щеках', fit: 'both' },
  { id: 'lipline', part: 'wrinkles', name: 'Вокруг губ', fit: 'both' },
  { id: 'marionette', part: 'wrinkles', name: 'У уголков рта', fit: 'both' },
  { id: 'chin', part: 'wrinkles', name: 'На подбородке', fit: 'both' },
  { id: 'mature', part: 'wrinkles', name: 'Зрелое лицо', fit: 'both' },
  { id: 'aged', part: 'wrinkles', name: 'Возрастные', fit: 'both' },
  { id: 'deep', part: 'wrinkles', name: 'Глубокие складки', fit: 'both' },
  { id: 'nasolabialDeep', part: 'wrinkles', name: 'Глубокие носогубные', fit: 'both' },
  { id: 'marionetteDeep', part: 'wrinkles', name: 'Морщины у уголков рта', fit: 'both' },
  { id: 'chinCrease', part: 'wrinkles', name: 'Складки на подбородке', fit: 'both' },
  { id: 'temple', part: 'wrinkles', name: 'Лучи у висков', fit: 'both' },
  { id: 'megaphone', part: 'wrinkles', name: '«Рот-рупор»: складки от речи', fit: 'both' },
  { id: 'orator', part: 'wrinkles', name: 'Ораторское лицо', fit: 'both' },
  { id: 'none', part: 'makeup', name: 'Без макияжа', fit: 'both' },
  { id: 'natural', part: 'makeup', name: 'Естественный тон', fit: 'both' },
  { id: 'red', part: 'makeup', name: 'Голливудский красный', fit: 'both' },
  { id: 'rose', part: 'makeup', name: 'Нежная роза', fit: 'both' },
  { id: 'smoky', part: 'makeup', name: 'Вечерний смоки', fit: 'both' },
  { id: 'porcelain', part: 'makeup', name: 'Фарфоровый', fit: 'both' },
  { id: 'mark', part: 'makeup', name: 'Мушка и красный', fit: 'both' },
  { id: 'copper', part: 'makeup', name: 'Тёплая медь', fit: 'both' },
  { id: 'burgundy', part: 'makeup', name: 'Бархатное бордо', fit: 'both' },
  { id: 'peach', part: 'makeup', name: 'Персиковый', fit: 'both' },
  { id: 'plum', part: 'makeup', name: 'Сливовый', fit: 'both' },
  { id: 'champagne', part: 'makeup', name: 'Шампань', fit: 'both' },
  { id: 'liner', part: 'makeup', name: 'Только стрелки', fit: 'both' },
  { id: 'cherry', part: 'makeup', name: 'Спелая вишня', fit: 'both' },
  { id: 'sepia', part: 'makeup', name: 'Мягкая сепия', fit: 'both' },
  { id: 'powder', part: 'makeup', name: 'Матовая пудра', fit: 'both' },
  { id: 'sculpted', part: 'makeup', name: 'Скульптурный тон', fit: 'both' },
  { id: 'stage', part: 'makeup', name: 'Сценический грим', fit: 'both' },
  { id: 'geisha', part: 'makeup', name: 'Гейша (осирой)', fit: 'both' },
  { id: 'maiko', part: 'makeup', name: 'Майко', fit: 'f' },
];

export const DEFAULT_FACE: Record<Gender, FaceSel> = {
  f: {
    shape: 'oval', ears: 'standard', moles: {}, moleColor: '#704632', moleSize: 100,
    eyes: 'almond', brows: 'thin', nose: 'straight', lips: 'cupid',
    browPresence: 'both', browInnerThickness: 100, browOuterThickness: 100, browArchOffset: 0,
    wrinkles: 'none', wrinkleIntensity: 65, makeup: 'red', makeupIntensity: 80,
    iris: '#4a7eab', irisY: -0.55, eyeY: 1.5,
    eyeWidth: 86, eyeHeight: 86, irisSize: 84,
    skinEffects: { cheekbone: 45 }, facialHair: 'clean', facialHairIntensity: 80,
  },
  m: {
    shape: 'square', ears: 'standard', moles: {}, moleColor: '#704632', moleSize: 100,
    eyes: 'narrow', brows: 'straight', nose: 'aquiline', lips: 'thin',
    browPresence: 'both', browInnerThickness: 100, browOuterThickness: 100, browArchOffset: 0,
    wrinkles: 'light', wrinkleIntensity: 60, makeup: 'none', makeupIntensity: 75,
    iris: '#5c351c', irisY: -0.55, eyeY: 1.5,
    eyeWidth: 86, eyeHeight: 86, irisSize: 84,
    skinEffects: { cheekbone: 30 }, facialHair: 'clean', facialHairIntensity: 80,
  },
};

export interface FaceProps {
  gender: Gender;
  skin: string;
  hairColor: string;
  face: FaceSel;
  uid: string;
  pigmentation?: BodySel;
}

const mix = (a: string, b: string, percent = 50) => `color-mix(in srgb, ${a} ${percent}%, ${b})`;
const darken = (base: string, amount: number) => `color-mix(in srgb, #000000 ${amount}%, ${base})`;
const makeupStrength = (face: FaceSel) => face.makeup === 'none' ? 0 : Math.max(0, Math.min(100, face.makeupIntensity)) / 100;

function eyeGeometry(cx: number, side: number, shape: string, cy = 75) {
  const h = shape === 'round' ? 5.5 : shape === 'narrow' ? 2.8 : shape === 'hooded' ? 3.2
    : shape === 'deep-set' ? 3.4 : shape === 'prominent' ? 5.1 : 4.4;
  const lift = shape === 'upturn' ? 2.2 : shape === 'downturn' ? -1.3 : shape === 'deep-set' ? -1.1
    : shape === 'prominent' ? 0.5 : shape === 'almond' ? 0.9 : 0.3;
  const start = { x: cx - side * 7.5, y: cy + 0.4 };
  const c1 = { x: cx - side * 4.8, y: cy - h };
  const c2 = { x: cx + side * 5.5, y: cy - h - lift * 0.2 };
  const end = { x: cx + side * 8.8, y: cy - lift };
  const upper = `M${start.x} ${start.y} C${c1.x} ${c1.y} ${c2.x} ${c2.y} ${end.x} ${end.y}`;
  const lower = `C${cx + side * 5.5} ${cy + h * 0.78} ${cx - side * 4.5} ${cy + h * 0.76} ${start.x} ${start.y}`;
  const point = (t: number) => {
    const u = 1 - t;
    return {
      x: u ** 3 * start.x + 3 * u ** 2 * t * c1.x + 3 * u * t ** 2 * c2.x + t ** 3 * end.x,
      y: u ** 3 * start.y + 3 * u ** 2 * t * c1.y + 3 * u * t ** 2 * c2.y + t ** 3 * end.y,
    };
  };
  return { upper, outline: `${upper} ${lower}Z`, end, point, h };
}

function skinModeOf(face: FaceSel): 'new' | 'classic' | 'soft' {
  return face.faceSkinMode ?? (face.faceDebug ? 'classic' : 'new');
}

function lidCoverCalc(lid: number, h: number) {
  return Math.min(lid * h * 2.12, h * 2.12 + 1.1);
}

function Eyes({ face, gender, skin, uid }: { face: FaceSel; gender: Gender; skin: string; uid: string }) {
  const makeup = getMakeupStyle(face.makeup);
  const strength = makeupStrength(face);
  const sclW = (face.eyeWidth ?? 100) / 100;
  const sclH = (face.eyeHeight ?? 100) / 100;
  const irisScale = (face.irisSize ?? 100) / 100;
  const irisDY = face.irisY ?? -0.55;
  const tilt = face.eyeTilt ?? 0;
  const spacing = face.eyeSpacing ?? 0;
  const strab = ((face.strabismus ?? 0) / 100) * 2.7;
  const lazyWhich = face.lazyEye ?? 'none';
  const lazyAmt = ((face.lazyAmount ?? 0) / 100) * 2.7;
  const lid = Math.min(1, Math.max(0, (face.eyelid ?? 0) / 100));
  const lidCurve = Math.min(1, Math.max(0, (face.eyelidCurve ?? 0) / 100));
  const lidPos = Math.min(1, Math.max(-1, (face.eyelidPos ?? 0) / 100));
  const creaseY = face.epicanthus ?? 0;
  const presence = face.eyePresence ?? 'both';
  const blindness = face.blindness ?? 'none';
  const cy = 75 + (face.eyeY ?? 1.5);
  const lash = (face.lashDensity ?? 100) / 100;
  const lashCount = Math.max(0, Math.round(7 * Math.min(1.6, lash)));

  return (
    <g>
      {[-1, 1].map((side) => {
        const isLeft = side === -1;
        const cx = 150 + side * (15.6 + spacing / 2);
        const rotation = `rotate(${(-side * tilt).toFixed(2)} ${cx} ${cy})`;
        const present = presence === 'both' || (presence === 'left' && isLeft) || (presence === 'right' && !isLeft);
        if (!present) {
          return (
            <g key={side} transform={rotation}>
              <ellipse cx={cx} cy={cy} rx={9.4} ry={6.4} fill={`url(#${uid}-socket)`} opacity={0.65} />
              <path d={`M${cx - 7.5} ${cy - 0.4} Q${cx} ${cy + 2.5} ${cx + 7.5} ${cy - 0.4}`} fill="none" stroke="#8a5c48" strokeWidth={0.7} opacity={0.6} strokeLinecap="round" />
            </g>
          );
        }
        const eye = eyeGeometry(cx, side, face.eyes, cy);
        const clip = `${uid}-eye-${side}`;
        const blindHere = blindness === 'both' || (blindness === 'left' && isLeft) || (blindness === 'right' && !isLeft);
        const irisColor = blindHere ? '#b9c2c0' : (isLeft ? (face.customIrisLeft ?? face.irisLeft ?? face.iris) : (face.customIrisRight ?? face.irisRight ?? face.iris));
        const glassKey = isLeft ? 'glass-eye-left' : 'glass-eye-right';
        const glassHere = Math.max(0, Math.min(100, face.prosthetics?.[glassKey] ?? 0)) / 100;
        const glassColor = (isLeft ? face.glassIrisLeft : face.glassIrisRight) ?? '#9aa3a8';
        const ptosisKey = isLeft ? 'ptosis-left' : 'ptosis-right';
        const ptosis = Math.max(0, Math.min(100, face.faceMarks?.[ptosisKey] ?? 0)) / 100;
        const lazyHere = (lazyWhich === 'left' && isLeft) || (lazyWhich === 'right' && !isLeft) ? lazyAmt : 0;
        const irx = cx - side * (strab + lazyHere);
        const ir = 3.55 * irisScale;
        const iry = cy + 0.3 + irisDY;
        const lidCover = lidCoverCalc(lid, eye.h);
        const lidBottom = cy - eye.h + lidCover;
        const lidTop = cy - eye.h - 5.4;
        const lidLeft = cx - 10.8;
        const lidRight = cx + 10.8;
        const bendX = cx + side * lidPos * 7.6;
        const bendDepth = lidCurve * eye.h * 1.25;
        const bendAt = 0.5 + lidPos * 0.3;
        const foldedPoint = (t: number) => {
          const point = eye.point(t);
          const distance = Math.abs(t - bendAt) / 0.52;
          const bump = distance >= 1 ? 0 : (1 - distance * distance) ** 2;
          return { x: point.x, y: point.y + bendDepth * bump };
        };
        // Квадратичные сегменты через средние точки дают мягкую дугу без острого уголка.
        const foldPoints = Array.from({ length: 13 }, (_, index) => foldedPoint(index / 12));
        const foldUpper = foldPoints.slice(1, -2).reduce((path, point, index) => {
          const next = foldPoints[index + 2];
          return `${path} Q${point.x} ${point.y} ${(point.x + next.x) / 2} ${(point.y + next.y) / 2}`;
        }, `M${foldPoints[0].x} ${foldPoints[0].y}`) + ` Q${foldPoints[11].x} ${foldPoints[11].y} ${foldPoints[12].x} ${foldPoints[12].y}`;
        const outlineFolded = `${foldUpper} C${cx + side * 5.5} ${cy + eye.h * 0.78} ${cx - side * 4.5} ${cy + eye.h * 0.76} ${cx - side * 7.5} ${cy + 0.4}Z`;
        const lidPath = `M${lidLeft} ${lidTop - 0.6} H${lidRight} V${lidBottom} Q${(lidRight + bendX) / 2} ${lidBottom} ${bendX} ${lidBottom + bendDepth} Q${(lidLeft + bendX) / 2} ${lidBottom} ${lidLeft} ${lidBottom} Z`;
        const lidEdge = lidCurve > 0
          ? `M${lidLeft + 2} ${lidBottom + 0.15} Q${(lidLeft + bendX) / 2} ${lidBottom} ${bendX} ${lidBottom + bendDepth} Q${(lidRight + bendX) / 2} ${lidBottom} ${lidRight - 2} ${lidBottom + 0.15}`
          : `M${lidLeft + 2} ${lidBottom + 0.15} Q${cx} ${lidBottom + 0.4} ${lidRight - 2} ${lidBottom + 0.15}`;
        const ptosisCover = lidCoverCalc(ptosis * 0.72, eye.h);
        const ptosisBottom = cy - eye.h + ptosisCover;
        const ptosisPath = `M${cx - 11} ${cy - eye.h - 6} H${cx + 11} V${ptosisBottom} Q${cx} ${ptosisBottom + 1.8} ${cx - 11} ${ptosisBottom} Z`;
        return (
          <g key={side} transform={rotation}>
            <g transform={`translate(${cx} ${cy}) scale(${sclW.toFixed(3)} ${sclH.toFixed(3)}) translate(${-cx} ${-cy})`}>
              <defs><clipPath id={clip}><path d={outlineFolded} /></clipPath></defs>
              <ellipse cx={cx} cy={cy - 1} rx={10.8} ry={7} fill={`url(#${uid}-socket)`} />
              <ellipse cx={cx + side * 0.4} cy={cy - 4.3} rx={10.7} ry={6.5} fill={`url(#${uid}-shadow)`} opacity={makeup.shadowOpacity * strength} />
              <path d={eye.upper} transform={`translate(0 ${(face.eyes === 'hooded' ? -1.5 : -2.4) + creaseY})`} fill="none" stroke="#79533e" strokeWidth={0.55} opacity={0.52} />
              <g clipPath={`url(#${clip})`}>
                <path d={eye.outline} fill="#f2eee8" />
                {glassHere > 0 ? (
                  <g data-glass-eye={isLeft ? 'left' : 'right'}>
                    <circle cx={cx} cy={cy + 0.2} r={3.35} fill={glassColor} stroke={darken(glassColor, 42)} strokeWidth={0.55} />
                    <circle cx={cx} cy={cy + 0.2} r={1.4} fill="#1c1d1f" />
                    <circle cx={cx - 0.9} cy={cy - 0.8} r={0.7} fill="#fff" opacity={0.88} />
                  </g>
                ) : (
                  <>
                    <circle cx={irx} cy={iry} r={ir} fill={irisColor} stroke="#302b24" strokeWidth={0.6} />
                    {!blindHere && <circle cx={irx} cy={iry} r={ir} fill={isLeft ? `url(#${uid}-irisL)` : `url(#${uid}-irisR)`} />}
                    {blindHere && <circle cx={irx} cy={iry} r={ir + 0.5} fill={`url(#${uid}-milky)`} />}
                    <circle cx={irx} cy={iry} r={1.6 * irisScale} fill="#151310" opacity={blindHere ? 0.35 : 1} />
                    {!blindHere && <><circle cx={irx - 0.9} cy={iry - 1} r={0.76} fill="#fffdf6" /><circle cx={irx + 1.1} cy={iry + 1.2} r={0.27} fill="#fffdf6" opacity={0.7} /></>}
                  </>
                )}
                {ptosis > 0 && <><path d={ptosisPath} fill={darken(skin, 24)} /><path d={`M${cx - 8.6} ${ptosisBottom + 0.15} Q${cx} ${ptosisBottom + 1.7} ${cx + 8.6} ${ptosisBottom + 0.15}`} fill="none" stroke="#54321f" strokeWidth={0.7} opacity={0.7} /></>}
                <><path d={lidPath} fill={darken(skin, 18)} /><path d={lidEdge} fill="none" stroke="#54321f" strokeWidth={0.75} opacity={0.75} /></>
              </g>
              <path d={outlineFolded} fill="none" stroke="#8e5c4b" strokeWidth={0.45} opacity={0.64} />
              <path d={foldUpper} fill="none" stroke="#37271f" strokeWidth={0.67 + makeup.liner * strength * 0.45} strokeLinecap="round" opacity={lid > 0.45 || ptosis > 0.35 ? 0.25 : 1} />
              {lid < 0.85 && lashCount > 0 && Array.from({ length: lashCount }, (_, index) => {
                const t = 0.16 + (index / Math.max(1, lashCount - 1)) * 0.72;
                const point = foldedPoint(t);
                const before = foldedPoint(Math.max(0, t - 0.015));
                const after = foldedPoint(Math.min(1, t + 0.015));
                const dx = after.x - before.x;
                const dy = after.y - before.y;
                const length = Math.hypot(dx, dy) || 1;
                // Левый и правый глаз обходятся в противоположные стороны, поэтому
                // нормаль на одном из них смотрела вниз. Разворачиваем её всегда вверх
                // (в SVG ось Y растёт вниз, «вверх» — это отрицательный ny).
                const flip = (-dx / length) > 0 ? -1 : 1;
                let nx = (dy / length) * flip;
                let ny = (-dx / length) * flip;
                // Наклон ресниц: вращаем нормаль вокруг основания, знак зависит от стороны,
                // чтобы «+» всегда уводил ресницы к виску, а «−» — к носу.
                const tiltAngle = ((face.lashTilt ?? 0) / 100) * 0.95 * -side;
                if (tiltAngle) {
                  const ca = Math.cos(tiltAngle);
                  const sa = Math.sin(tiltAngle);
                  const rx = nx * ca - ny * sa;
                  const ry = nx * sa + ny * ca;
                  nx = rx; ny = ry;
                }
                const lashLength = (gender === 'f' ? 1.6 : 0.9) * (0.55 + lash * 0.75);
                return <path key={`lash-${index}`} d={`M${point.x} ${point.y} Q${point.x + nx * lashLength * 0.55} ${point.y + ny * lashLength * 0.55} ${point.x + nx * lashLength} ${point.y + ny * lashLength}`} fill="none" stroke="#2c1d18" strokeWidth={0.24 + lash * 0.16} strokeLinecap="round" opacity={0.82} />;
              })}
              {makeup.wing > 0 && lid < 0.35 && <path d={`M${eye.end.x - side} ${eye.end.y + 0.1} Q${eye.end.x + side * makeup.wing * 0.55} ${eye.end.y - 0.5} ${eye.end.x + side * makeup.wing} ${eye.end.y - 2}`} fill="none" stroke="#281b1b" strokeWidth={0.95} strokeLinecap="round" opacity={makeup.liner * strength} />}
            </g>
          </g>
        );
      })}
    </g>
  );
}

interface BrowProfile {
  y: number; curve: number; thick: number; half: number; tail: number;
  peakAt?: number; shape?: 'round' | 'kink' | 'flat'; innerDy?: number; outerDy?: number;
  taper?: number; fibers?: number; fiberLen?: number; fuzz?: number; opacity?: number;
  spread?: number; drawn?: boolean; bleach?: number; asym?: number; gap?: [number, number];
  mono?: 'full' | 'hair' | 'heavy';
}

const BROW_PROFILES: Record<string, BrowProfile> = {
  arch: { y: 64, curve: 5, thick: 1.65, half: 8, tail: 9, peakAt: 0.5 },
  thin: { y: 63.5, curve: 4.2, thick: 0.95, half: 8, tail: 9.5, peakAt: 0.55, fibers: 14 },
  straight: { y: 64, curve: 0.6, thick: 1.65, half: 8, tail: 9 },
  thick: { y: 64, curve: 3.3, thick: 2.45, half: 8, tail: 9 },
  soft: { y: 64, curve: 3.3, thick: 1.65, half: 8, tail: 9 },
  raised: { y: 61.5, curve: 5, thick: 1.65, half: 8, tail: 9, peakAt: 0.5 },
  low: { y: 66.4, curve: 0.6, thick: 2.45, half: 8, tail: 9 },
  house: { y: 64, curve: 5.8, thick: 1.65, half: 8, tail: 9, peakAt: 0.55, shape: 'kink' },
  sad: { y: 64, curve: -3.6, thick: 1.65, half: 8, tail: 9, innerDy: -1.5, outerDy: 3.2 },
  's-curve': { y: 64, curve: 3.5, thick: 1.65, half: 8, tail: 9, peakAt: 0.35, outerDy: 1.2 },
  feathered: { y: 64, curve: 3.3, thick: 2, half: 8, tail: 9, fibers: 26, fiberLen: 1.8 },
  short: { y: 64, curve: 3.3, thick: 1.65, half: 6.2, tail: 6.5 },
  miranda: { y: 62.5, curve: 5.2, thick: 0.85, half: 7.5, tail: 10, peakAt: 0.5, taper: 0.5, fibers: 10 },
  swanson: { y: 61, curve: 6, thick: 0.7, half: 7, tail: 11, peakAt: 0.42, taper: 0.4, outerDy: -1.2, fibers: 8, drawn: true },
  lamarr: { y: 62, curve: 6.4, thick: 1.4, half: 8, tail: 10, peakAt: 0.58, taper: 0.55, fibers: 18 },
  dietrich: { y: 60.5, curve: 5.6, thick: 0.6, half: 7, tail: 11.5, peakAt: 0.5, taper: 0.35, outerDy: -0.8, fibers: 0, drawn: true },
  crawford: { y: 63, curve: 6.2, thick: 2.6, half: 8.5, tail: 9.5, peakAt: 0.6, taper: 0.6, fibers: 24 },
  hayworth: { y: 63.5, curve: 4.4, thick: 1.8, half: 8, tail: 10, peakAt: 0.62, taper: 0.7, fibers: 20 },
  taylor: { y: 64.5, curve: 4.6, thick: 2.9, half: 8.5, tail: 9, peakAt: 0.55, taper: 0.75, fibers: 26 },
  hepburn: { y: 63.5, curve: 1.6, thick: 2.7, half: 9, tail: 8.5, peakAt: 0.6, taper: 0.85, fibers: 24 },
  bacall: { y: 63, curve: 4.8, thick: 2, half: 8, tail: 10.5, peakAt: 0.68, shape: 'kink', taper: 0.55, fibers: 20 },
  garbo: { y: 62, curve: 6.8, thick: 1.1, half: 8, tail: 9.5, peakAt: 0.5, taper: 0.5, fibers: 12 },
  monroe: { y: 62.5, curve: 5.6, thick: 1.6, half: 8, tail: 10, peakAt: 0.64, shape: 'kink', taper: 0.45, outerDy: 0.8, fibers: 16 },
  davis: { y: 63, curve: 4.2, thick: 1.5, half: 9, tail: 11.5, peakAt: 0.5, taper: 0.6, fibers: 18 },
  angular: { y: 64, curve: 5, thick: 2, half: 8, tail: 9.5, peakAt: 0.62, shape: 'kink', taper: 0.7 },
  rounded: { y: 63, curve: 5.6, thick: 1.9, half: 7.5, tail: 7.5, peakAt: 0.5, shape: 'round', taper: 0.9 },
  'flat-thick': { y: 64.5, curve: 0.8, thick: 2.9, half: 8.5, tail: 9, shape: 'flat' },
  tapered: { y: 64, curve: 3.6, thick: 2.4, half: 8, tail: 10.5, peakAt: 0.45, taper: 0.3 },
  'wide-set': { y: 64, curve: 3.3, thick: 1.7, half: 7, tail: 9.5, spread: 3.2 },
  'close-set': { y: 64, curve: 3.3, thick: 1.8, half: 9.5, tail: 8, spread: -3 },
  stern: { y: 66, curve: 2.4, thick: 2.6, half: 9, tail: 9, peakAt: 0.7, innerDy: 2.2, taper: 0.8, fuzz: 0.5 },
  surprised: { y: 60, curve: 6.6, thick: 1.5, half: 8, tail: 9, peakAt: 0.5, innerDy: -1.2 },
  brooding: { y: 65.5, curve: 3.4, thick: 2.2, half: 9, tail: 9, peakAt: 0.72, innerDy: 3, outerDy: -1 },
  bushy: { y: 64, curve: 3, thick: 2.9, half: 8.5, tail: 9.5, fibers: 34, fiberLen: 2.2, fuzz: 1.4 },
  wiry: { y: 64, curve: 3, thick: 2, half: 8.5, tail: 9.5, fibers: 30, fiberLen: 2.6, fuzz: 2.2 },
  sparse: { y: 64, curve: 3.3, thick: 1.4, half: 8, tail: 9, fibers: 9, opacity: 0.5 },
  'grey-aged': { y: 64.5, curve: 2.6, thick: 2.1, half: 8.5, tail: 9.5, fibers: 28, fiberLen: 2.8, fuzz: 1.8, bleach: 55 },
  scarred: { y: 64, curve: 3.3, thick: 1.9, half: 8, tail: 9, gap: [0.58, 0.74] },
  'drawn-pencil': { y: 63, curve: 4.8, thick: 1.1, half: 8, tail: 10, peakAt: 0.55, taper: 0.4, fibers: 0, drawn: true },
  tattooed: { y: 63.5, curve: 4, thick: 0.75, half: 8, tail: 9.5, peakAt: 0.55, taper: 0.9, fibers: 0, drawn: true },
  asymmetric: { y: 64, curve: 3.8, thick: 1.7, half: 8, tail: 9, peakAt: 0.55, asym: 2.4 },
  bleached: { y: 64, curve: 3.3, thick: 1.6, half: 8, tail: 9, bleach: 78, opacity: 0.75 },
  orator: { y: 62.8, curve: 4.8, thick: 1.15, half: 8.5, tail: 10.5, peakAt: 0.7, shape: 'kink', taper: 0.42, innerDy: -0.6, fibers: 14, spread: -1.2 },
  'orator-uneven': { y: 62.4, curve: 4.4, thick: 1.35, half: 8, tail: 10, peakAt: 0.66, shape: 'kink', taper: 0.5, innerDy: -0.4, asym: 1.2, fibers: 17, fiberLen: 1.5, opacity: 0.88, spread: -1 },
  'orator-raised': { y: 62.6, curve: 5.4, thick: 1.2, half: 8, tail: 10, peakAt: 0.52, shape: 'round', taper: 0.45, innerDy: -1, fibers: 15, spread: -1.4 },
  'monobrow-full': { y: 64, curve: 3.3, thick: 2.45, half: 8, tail: 9, mono: 'full' },
  'monobrow-hair': { y: 64, curve: 3.3, thick: 1.65, half: 8, tail: 9, mono: 'hair' },
  'monobrow-heavy': { y: 64.5, curve: 2.6, thick: 3.1, half: 9.5, tail: 9, fibers: 30, fiberLen: 2, fuzz: 1, mono: 'heavy' },
};

const DEFAULT_BROW: BrowProfile = BROW_PROFILES.soft;
const lighten = (base: string, amount: number) => `color-mix(in srgb, #f4efe6 ${amount}%, ${base})`;

function Brows({ face, hairColor }: { face: FaceSel; hairColor: string }) {
  const presence = face.browPresence ?? 'both';
  if (presence === 'none') return null;
  const chosenHair = (!(face.syncHairColors ?? true) && face.browColor) ? face.browColor : hairColor;
  const p = BROW_PROFILES[face.brows] ?? DEFAULT_BROW;
  const actualHair = p.bleach ? lighten(chosenHair, p.bleach) : chosenHair;
  const tilt = face.browTilt ?? 0;
  const spacing = (face.browSpacing ?? 0) + (p.spread ?? 0);
  const follow = (face.eyeY ?? 1.5) * 0.6;
  const y = Math.min(70.5, Math.max(57, p.y - (face.browHeight ?? 0) - tilt * 0.12 + follow));
  const curve = Math.min(9, Math.max(-6, p.curve + (face.browCurve ?? 0) / 10 + Math.sign(p.curve || 1) * Math.abs(tilt) * 0.06));
  const thickness = Math.min(3.6, Math.max(0.3, p.thick * ((face.browThickness ?? 100) / 100)));
  const under = darken(actualHair, 16);
  const edge = darken(actualHair, 30);
  const fiberCount = p.fibers ?? 20;
  const fiberLen = p.fiberLen ?? 1.2;
  const taper = p.taper ?? 1;
  const opacity = p.opacity ?? 1;
  const innerPercent = Math.min(200, Math.max(0, face.browInnerThickness ?? 100));
  const outerPercent = Math.min(200, Math.max(0, face.browOuterThickness ?? 100));
  const archOffset = Math.min(40, Math.max(-40, face.browArchOffset ?? 0)) / 100;
  const peakAt = Math.min(0.9, Math.max(0.1, (p.peakAt ?? 0.5) + archOffset));
  const shape = p.shape ?? 'round';
  const bridgeScale = innerPercent / 100;
  const showBridge = presence === 'both' && bridgeScale > 0;

  return (
    <g data-brow-style={face.brows} strokeLinecap="round" fill="none" opacity={opacity}>
      {[-1, 1].map((side) => {
        if ((presence === 'left' && side === 1) || (presence === 'right' && side === -1)) return null;
        const cx = 150 + side * (15.6 + spacing / 2);
        const lift = side === 1 && p.asym ? -p.asym : 0;
        const by = y + lift;
        const innerDy = (p.innerDy ?? 0) - tilt * 0.22;
        const outerDy = (p.outerDy ?? 0) + tilt * 0.45;
        const innerX = cx - side * p.half;
        const outerX = cx + side * p.tail;
        const start = { x: innerX, y: by + 0.6 + innerDy };
        const end = { x: outerX, y: by + 0.2 + outerDy };
        const peakY = by - curve - tilt * 0.15;
        const spine = createBrowSpine(start, end, peakY, peakAt, shape);
        const widthAt = (t: number) => browThicknessAt(t, thickness, taper, innerPercent, outerPercent);
        const inGap = (t: number) => !!p.gap && t >= p.gap[0] && t <= p.gap[1];
        const ranges: [number, number][] = p.gap ? [[0, p.gap[0]], [p.gap[1], 1]] : [[0, 1]];
        const bodyArt = ranges.map(([from, to], i) => {
          const silhouette = browOutline(spine, widthAt, from, to);
          return (
            <g key={i}>
              {!p.drawn && <path d={browOutline(spine, (t) => widthAt(t) * (1 + 0.7 / thickness), from, to)} fill={edge} opacity={0.35} />}
              <path d={silhouette} fill={p.drawn ? darken(actualHair, 24) : under} opacity={p.drawn ? 0.92 : 0.96} />
            </g>
          );
        });
        const fibers = Array.from({ length: fiberCount }, (_, i) => {
          const t = i / Math.max(1, fiberCount - 1);
          if (inGap(t)) return null;
          const pt = spine.at(t);
          const w = widthAt(t);
          if (w <= 0.01) return null;
          const strandScale = Math.min(1, w / thickness);
          const fuzz = (p.fuzz ?? 0) * strandScale;
          const jitter = fuzz ? Math.sin(i * 12.9898 + t * 78.233) * fuzz : 0;
          const len = (fiberLen + Math.abs(jitter) * 0.6) * strandScale;
          const upward = -w * 0.8 - Math.max(0, jitter) * 1.4;
          return <path key={i} d={`M${pt.x} ${pt.y + w * 0.3} q${side * 0.55 * strandScale + jitter * 0.3} ${-w * 0.7} ${side * len} ${upward}`} stroke={actualHair} strokeWidth={(fuzz > 1.5 ? 0.42 : fiberLen > 1.5 ? 0.38 : 0.3) * strandScale} opacity={0.85} />;
        });
        return (
          <g key={side} data-brow-side={side === -1 ? 'left' : 'right'}>
            {bodyArt}
            {fibers}
          </g>
        );
      })}
      {showBridge && p.mono === 'full' && <path d={`M${150 - 9.5 - spacing / 2} ${y + 0.2} Q150 ${y - 1.1} ${150 + 9.5 + spacing / 2} ${y + 0.2}`} stroke={under} strokeWidth={thickness * 0.9 * bridgeScale} opacity={0.96} />}
      {showBridge && p.mono === 'heavy' && (
        <g>
          <path d={`M${150 - 10.5 - spacing / 2} ${y + 0.6} Q150 ${y - 1.6} ${150 + 10.5 + spacing / 2} ${y + 0.6}`} stroke={edge} strokeWidth={(thickness + 0.6) * bridgeScale} opacity={0.35} />
          <path d={`M${150 - 10.5 - spacing / 2} ${y + 0.6} Q150 ${y - 1.6} ${150 + 10.5 + spacing / 2} ${y + 0.6}`} stroke={under} strokeWidth={thickness * bridgeScale} opacity={0.96} />
        </g>
      )}
      {showBridge && p.mono === 'hair' && <path d={`M${150 - 9.5 - spacing / 2} ${y + 0.2} Q150 ${y - 0.8} ${150 + 9.5 + spacing / 2} ${y + 0.2}`} stroke={actualHair} strokeWidth={0.55 * bridgeScale} opacity={0.5} />}
    </g>
  );
}

function FacialHair({ face, hairColor }: { face: FaceSel; hairColor: string }) {
  const style = face.facialHair ?? 'clean';
  const density = Math.max(0, Math.min(1, (face.facialHairIntensity ?? 80) / 100));
  if (style === 'clean' || density === 0) return null;
  const actualHair = (!face.syncHairColors && face.facialHairColor) ? face.facialHairColor : hairColor;
  const color = darken(actualHair, 20);
  const dark = darken(actualHair, 38);
  const wScale = (face.facialHairWidth ?? 100) / 100;
  const dy = face.facialHairY ?? 0;
  const strokes = Array.from({ length: 125 }, (_, i) => {
    const row = Math.floor(i / 17);
    const col = i % 17;
    const x = 127 + col * 2.85 + (row % 2) * 1.2;
    const y = 92 + row * 3.35;
    const center = Math.abs(x - 150);
    if (center < 8 && y < 111) return null;
    if (center > 25 - (y - 92) * 0.35) return null;
    return <path key={i} d={`M${x} ${y} l${i % 3 === 0 ? -0.45 : 0.35} ${1.1 + (i % 4) * 0.2}`} stroke={color} strokeWidth={0.35} strokeLinecap="round" opacity={0.45 + (i % 5) * 0.09} />;
  });
  return (
    <g transform={`translate(150 ${104 + dy}) scale(${wScale} 1) translate(-150 -104)`} strokeLinecap="round">
      {(style === 'stubble-light' || style === 'stubble-heavy') && <g opacity={density * (style === 'stubble-light' ? 0.55 : 1)}>{strokes}</g>}
      {style === 'pencil' && <g opacity={0.35 + density * 0.65}><path d="M139 100.2 Q145 98.4 149.3 100 M150.7 100 Q155 98.4 161 100.2" fill="none" stroke={dark} strokeWidth={1.7} opacity={0.4} /><path d="M139 100.2 Q145 98.4 149.3 100 M150.7 100 Q155 98.4 161 100.2" fill="none" stroke={color} strokeWidth={1.1} /></g>}
      {style === 'goatee' && <g><path d="M143.5 108 Q150 112 156.5 108 L158.5 119 Q150 126 141.5 119Z" fill={color} /></g>}
      {style === 'short-beard' && <g><path d="M121 91 Q124 113 137 120 Q150 129 163 120 Q176 113 179 91 L173 100 Q170 116 158 121 Q150 125 142 121 Q130 116 127 100Z" fill={color} /><g opacity={density}>{strokes}</g></g>}
      {style === 'full-beard' && <g><path d="M119 88 Q118 112 130 124 Q141 137 150 139 Q159 137 170 124 Q182 112 181 88 L174 96 Q172 116 160 126 Q150 134 140 126 Q128 116 126 96Z" fill={color} /><g opacity={density}>{strokes}</g></g>}
      {style === 'sideburns' && <g><path d="M118 72 Q117 92 122 104 L128 101 Q125 89 127 74Z M182 72 Q183 92 178 104 L172 101 Q175 89 173 74Z" fill={color} /></g>}
    </g>
  );
}

function Nose({ face, skin, uid }: { face: FaceSel; skin: string; uid: string }) {
  const s = face.nose;
  const tip = (s === 'long' ? 98 : s === 'hooked' ? 101 : s === 'button' ? 91.5 : s === 'aquiline' ? 96 : s === 'high-bridge' ? 95.2 : 94.2) + ((face.noseLength ?? 100) - 100) * 0.06;
  const width = (s === 'wide' ? 6.8 : s === 'narrow' ? 3 : s === 'hooked' ? 3.7 : s === 'button' ? 4 : s === 'high-bridge' ? 4.1 : 4.8) * ((face.noseWidth ?? 100) / 100);
  const bridge = s === 'aquiline' ? 'M148 76 C144.5 82 148.8 85 147 90'
    : s === 'hooked' ? 'M148.2 73 C145.4 79 149.6 83.5 147.6 88.5 C146.4 91.6 147.8 95 149.2 97.6'
    : s === 'high-bridge' ? 'M148.4 72 C147.6 79 148.4 85 148.6 91'
    : `M148 77 Q147.2 86 ${149 - width * 0.25} ${tip - 3}`;
  return (
    <g>
      <path d={`${bridge} Q${150 - width - 1} ${tip} 150 ${tip + 2} Q${150 + width + 1} ${tip} 152 ${tip - 3} L152 77Z`} fill={`url(#${uid}-nose)`} opacity={0.32} />
      <path d={bridge} fill="none" stroke={darken(skin, 22)} strokeWidth={0.62} opacity={0.38} />
      <ellipse cx={150} cy={tip - 1.6} rx={width * 0.66} ry={2.5} fill={`url(#${uid}-light)`} opacity={0.12} />
      {[-1, 1].map((side) => (
        <g key={side}>
          <path d={`M${150 + side * width * 0.8} ${tip - 2.2} Q${150 + side * (width + 1)} ${tip + 0.8} ${150 + side * width * 0.62} ${tip + 1.1}`} stroke={darken(skin, 28)} strokeWidth={0.55} opacity={0.7} fill="none" strokeLinecap="round" />
          <ellipse cx={150 + side * width * 0.55} cy={tip + 0.8} rx={width * 0.19} ry={0.49} fill={darken(skin, 42)} opacity={0.8} />
        </g>
      ))}
      <path d={`M148.7 ${tip + 2} Q150 ${tip + 2.8} 151.3 ${tip + 2}`} stroke={darken(skin, 30)} strokeWidth={0.43} fill="none" opacity={0.7} />
    </g>
  );
}

function Lips({ face, gender, skin, uid }: { face: FaceSel; gender: Gender; skin: string; uid: string }) {
  const s = face.lips;
  const style = getMakeupStyle(face.makeup);
  const strength = makeupStrength(face);
  const natural = mix(gender === 'f' ? '#b27473' : '#a5786e', skin, 72);
  const lipTone = face.lipColor ?? style.lip;
  const color = lipTone ? mix(lipTone, natural, strength * 100) : natural;
  const compressed = s === 'thin-wide' || s === 'corners-down';
  const baseW = s === 'wide' ? 13.4 : s === 'thin-wide' ? 14.6 : s === 'corners-down' ? 12.2 : s === 'thin' ? 9 : s === 'bow' ? 9.6 : s === 'full' ? 11.6 : 10.4;
  const baseTop = s === 'thin' ? 1.2 : s === 'thin-wide' ? 0.85 : s === 'corners-down' ? 1.1 : s === 'full' ? 3.9 : s === 'bow' ? 4.3 : 2.7;
  const baseBottom = s === 'thin' ? 1.8 : s === 'thin-wide' ? 1.5 : s === 'corners-down' ? 2.1 : s === 'full' ? 4.6 : 3.2;
  const cupid = (s === 'cupid' || s === 'bow' ? 1.6 : compressed ? 0.3 : 0.8) + ((face.cupidBow ?? 50) / 100) * 2.2;
  const peakSharp = (face.upperPeak ?? 50) / 100;
  const w = baseW * ((face.lipWidth ?? 100) / 100);
  const full = (face.lipFullness ?? 100) / 100;
  const top = baseTop * full * ((face.upperFullness ?? 100) / 100);
  const bottom = baseBottom * full * ((face.lowerFullness ?? 100) / 100);
  const my = 104 + (face.lipY ?? 0) + ((face.philtrum ?? 100) - 100) * 0.06;
  const gap = Math.min(1, Math.max(0, (face.lipOpenness ?? 0) / 100)) * 5.2;
  const open = gap > 0.3;
  const upperSeamY = my + 0.2;
  const lowerTopY = my + gap;
  const lowerMidY = my + gap * 0.7;
  const upperKinkY = my - 0.2 - top;
  const upperPeakY = my - top * 0.48 - 0.3;
  const cpY = upperKinkY + (upperPeakY - upperKinkY) * peakSharp * 0.72;
  const upper = `M${150 - w} ${my + 0.5} C${150 - w * 0.58} ${my - 0.5} ${147 - cupid} ${cpY} 150 ${upperPeakY} C${153 + cupid} ${cpY} ${150 + w * 0.58} ${my - 0.5} ${150 + w} ${my + 0.5} Q155 ${upperSeamY + (open ? 0.1 : -0.2)} 150 ${upperSeamY + 0.4} Q145 ${upperSeamY + (open ? 0.1 : -0.2)} ${150 - w} ${my + 0.5}Z`;
  const lower = `M${150 - w} ${my + 0.5} Q145 ${lowerTopY - 0.6} 150 ${lowerTopY} Q155 ${lowerTopY - 0.6} ${150 + w} ${my + 0.5} C${150 + w * 0.58} ${lowerMidY + bottom} ${150 - w * 0.58} ${lowerMidY + bottom} ${150 - w} ${my + 0.5}Z`;
  const cavityH = Math.max(0.4, gap * 0.95);
  const cavity = `M${150 - w + 0.9} ${my + 0.5} C${150 - w * 0.32} ${my - 0.2} ${150 + w * 0.32} ${my - 0.2} ${150 + w - 0.9} ${my + 0.5} C${150 + w * 0.3} ${my + cavityH + 0.8} ${150 - w * 0.3} ${my + cavityH + 0.8} ${150 - w + 0.9} ${my + 0.5}Z`;
  return (
    <g>
      <defs>
        <clipPath id={`${uid}-mouth`}><path d={cavity} /></clipPath>
        <linearGradient id={`${uid}-mouthFill`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#3f1218" /><stop offset="0.6" stopColor="#5c1f22" /><stop offset="1" stopColor="#39111a" />
        </linearGradient>
      </defs>
      {open && (
        <>
          <path d={cavity} fill={`url(#${uid}-mouthFill)`} />
          <g clipPath={`url(#${uid}-mouth)`}>
            <rect x={150 - (w - 1.8)} y={my - 0.4} width={(w - 1.8) * 2} height={Math.max(2.8, cavityH + 1.2)} rx={0.9} fill="#f1ead9" />
          </g>
        </>
      )}
      <path d={upper} fill={mix(color, '#4f2630', 83)} />
      <path d={lower} fill={color} />
      <path d={lower} fill={`url(#${uid}-lip-light)`} opacity={0.23 + style.gloss * strength} />
      {!open && <path d={`M${150 - w} ${my + 0.5} Q145 ${my + 0.1} 150 ${my + 0.9} Q155 ${my + 0.1} ${150 + w} ${my + 0.5}`} fill="none" stroke={mix(color, '#381f22', 36)} strokeWidth={0.48} opacity={0.76} />}
      <path d={`M${150 - w * 0.37} ${lowerTopY + bottom * 0.62} Q150 ${lowerTopY + 1 + bottom * 0.62} ${150 + w * 0.36} ${lowerTopY + bottom * 0.62}`} stroke="#fff3e7" strokeWidth={0.55} opacity={style.gloss * strength} fill="none" strokeLinecap="round" />
    </g>
  );
}

function Makeup({ face, uid }: { face: FaceSel; uid: string }) {
  const style = getMakeupStyle(face.makeup);
  const strength = makeupStrength(face);
  if (!strength) return null;
  return (
    <g opacity={strength}>
      <rect x={110} y={32} width={80} height={105} fill="#fff4e6" opacity={style.powder ?? 0} />
      {[-1, 1].map((side) => (
        <g key={side}>
          <ellipse cx={150 + side * 20} cy={92} rx={12} ry={7} transform={`rotate(${side * -18} ${150 + side * 20} 92)`} fill={`url(#${uid}-blush)`} opacity={style.blushOpacity} />
          <ellipse cx={150 + side * 23} cy={98} rx={7} ry={11} transform={`rotate(${side * 25} ${150 + side * 23} 98)`} fill={`url(#${uid}-socket)`} opacity={(style.contour ?? 0) * 2} />
          <ellipse cx={150 + side * 22} cy={88.5} rx={7} ry={3} fill={`url(#${uid}-light)`} opacity={style.highlight ?? 0} />
        </g>
      ))}
      {style.beautyMark && <circle cx={162.7} cy={98.2} r={0.75} fill="#4a2921" />}
    </g>
  );
}

function SkinFeatures({ face, uid, skin }: { face: FaceSel; uid: string; skin: string }) {
  const effects = face.skinEffects ?? {};
  const entries = Object.entries(effects).filter(([, op]) => op > 0);
  if (!entries.length) return null;
  const spread = (face.effectSpread ?? 100) / 100;
  const soft = `url(#${uid}-soft)`;
  return (
    <g clipPath={`url(#${uid}-boundary)`}>
      {entries.map(([id, op]) => {
        const effect = skinEffectById(id);
        if (!effect) return null;
        return (
          <g key={id} data-skin-effect={id} opacity={Math.min(1, Math.max(0, op / 100))}>
            {effect.art({ skin, spread, soft })}
          </g>
        );
      })}
    </g>
  );
}

export function Face({ gender, skin, hairColor, face, pigmentation, uid: namespace }: FaceProps) {
  const instance = useId().replace(/:/g, '');
  const uid = `${namespace}-${instance}`;
  const morph = {
    chinWidth: face.chinWidth,
    chinLength: face.chinLength,
    jawWidth: face.jawWidth,
    jawHeight: face.jawHeight,
    cheekbone: face.cheekbone,
    cheekHeight: face.cheekHeight,
    foreheadHeight: face.foreheadHeight,
    cheekVolume: Math.round(effectsVolume(face.skinEffects)),
  };
  const geometry = getFaceGeometry(gender, face.shape, morph);
  const makeup = getMakeupStyle(face.makeup);
  const shadowTone = face.shadowColor ?? makeup.shadow;
  const skinMode = skinModeOf(face);
  const classic = skinMode === 'classic';
  const soft = skinMode === 'soft';
  const hiC = classic || soft ? '#fff5df' : `color-mix(in srgb, ${skin} 76%, #fffaf2)`;
  const shC = classic || soft ? '#5b3522' : `color-mix(in srgb, ${skin} 68%, #36160e)`;
  const socketC = classic || soft ? '#79503c' : `color-mix(in srgb, ${skin} 68%, #36160e)`;
  const lightC = classic || soft ? '#fff5e1' : `color-mix(in srgb, ${skin} 76%, #fffaf2)`;
  return (
    <g data-face-shape={face.shape} data-face-skin={skinMode}>
      <defs>
        <clipPath id={`${uid}-boundary`}><path d={geometry.path} /></clipPath>
        <clipPath id={`${uid}-detail-boundary`}><path d={geometry.path} transform={geometry.detailInset} /></clipPath>
        <radialGradient id={`${uid}-skin`} cx="43%" cy="34%" r="67%">
          <stop offset="0" stopColor={hiC} stopOpacity={classic ? 0.34 : 0.22} />
          <stop offset="0.5" stopColor={hiC} stopOpacity={classic ? 0.04 : 0.03} />
          <stop offset="1" stopColor={shC} stopOpacity={classic ? 0.32 : 0.16} />
        </radialGradient>
        <radialGradient id={`${uid}-socket`}><stop stopColor={socketC} stopOpacity={0.55} /><stop offset="1" stopColor={socketC} stopOpacity={0} /></radialGradient>
        <radialGradient id={`${uid}-light`}><stop stopColor={lightC} /><stop offset="1" stopColor={lightC} stopOpacity={0} /></radialGradient>
        <radialGradient id={`${uid}-blush`}><stop stopColor={makeup.blush} /><stop offset="1" stopColor={makeup.blush} stopOpacity={0} /></radialGradient>
        <radialGradient id={`${uid}-shadow`}><stop stopColor={shadowTone} /><stop offset="1" stopColor={shadowTone} stopOpacity={0} /></radialGradient>
        <radialGradient id={`${uid}-irisL`} cx="35%" cy="70%"><stop stopColor="#f4ce8d" stopOpacity={0.16} /><stop offset="1" stopColor="#0e1717" stopOpacity={0.35} /></radialGradient>
        <radialGradient id={`${uid}-irisR`} cx="35%" cy="70%"><stop stopColor="#f4ce8d" stopOpacity={0.16} /><stop offset="1" stopColor="#0e1717" stopOpacity={0.35} /></radialGradient>
        <radialGradient id={`${uid}-milky`} cx="50%" cy="48%" r="55%"><stop stopColor="rgba(228,233,231,0.55)" /><stop offset="0.72" stopColor="rgba(226,231,230,0.8)" /><stop offset="1" stopColor="rgba(214,222,221,0.95)" /></radialGradient>
        <linearGradient id={`${uid}-nose`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor={`color-mix(in srgb, ${skin} 86%, black)`} stopOpacity={0.28} />
          <stop offset="0.5" stopColor={`color-mix(in srgb, ${skin} 92%, white)`} stopOpacity={0.22} />
          <stop offset="1" stopColor={`color-mix(in srgb, ${skin} 84%, black)`} stopOpacity={0.26} />
        </linearGradient>
        <linearGradient id={`${uid}-lip-light`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#351721" stopOpacity={0.16} /><stop offset="0.55" stopColor="#fff0d9" stopOpacity={0.75} /><stop offset="1" stopColor="#fff0d9" stopOpacity={0} /></linearGradient>
        <filter id={`${uid}-soft`} x="-45%" y="-45%" width="190%" height="190%"><feGaussianBlur stdDeviation="1.7" /></filter>
      </defs>
      <SkinFeatures face={face} uid={uid} skin={skin} />
      <g clipPath={`url(#${uid}-boundary)`}>
        <path d={geometry.path} fill={`url(#${uid}-skin)`} />
        <ellipse cx={126} cy={98} rx={8} ry={15} fill={`url(#${uid}-socket)`} opacity={classic ? 0.3 : 0.12} />
        <ellipse cx={174} cy={98} rx={8} ry={15} fill={`url(#${uid}-socket)`} opacity={classic ? 0.3 : 0.12} />
        <ellipse cx={150} cy={geometry.chinY - 6} rx={10} ry={5} fill={`url(#${uid}-light)`} opacity={classic ? 0.12 : 0.08} />
      </g>
      <g clipPath={`url(#${uid}-detail-boundary)`}>
        <g transform={geometry.featureTransform}>
          <Makeup face={face} uid={uid} />
          <FacialPigmentation body={pigmentation} />
          <Wrinkles face={face} skin={skin} />
          <FaceMarksLayer face={face} skin={skin} />
          <Eyes face={face} gender={gender} skin={skin} uid={uid} />
          <Brows face={face} hairColor={hairColor} />
          <Nose face={face} skin={skin} uid={uid} />
          <Lips face={face} gender={gender} skin={skin} uid={uid} />
          {gender === 'm' && <FacialHair face={face} hairColor={hairColor} />}
          <FaceMoles face={face} />
          <ProstheticsLayer face={face} skin={skin} gender={gender} />
        </g>
      </g>
    </g>
  );
}

export const Head = memo(function Head(props: FaceProps) {
  const { gender, skin, face } = props;
  const geometry = getFaceGeometry(gender, face.shape, {
    chinWidth: face.chinWidth,
    chinLength: face.chinLength,
    jawWidth: face.jawWidth,
    jawHeight: face.jawHeight,
    cheekbone: face.cheekbone,
    cheekHeight: face.cheekHeight,
    foreheadHeight: face.foreheadHeight,
    cheekVolume: Math.round(effectsVolume(face.skinEffects)),
  });
  return (
    <g>
      {([-1, 1] as const).map((side) => (
        <Ear key={side} side={side} skin={skin} geometry={geometry} face={face} />
      ))}
      <path d={geometry.path} fill={skin} />
      <Face {...props} />
    </g>
  );
});

export function FacePreview(props: FaceProps) {
  return (
    <svg viewBox="101 27 98 112" className="h-full w-full" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <Head {...props} />
    </svg>
  );
}
