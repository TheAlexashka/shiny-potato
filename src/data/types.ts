import type { ReactNode } from 'react';

export type Gender = 'f' | 'm';
export type Fit = Gender | 'both';
export type PoseId = 'standard' | 'confident' | 'graceful' | 'pensive';

export interface PoseOption {
  id: PoseId;
  name: string;
}

export const POSES: PoseOption[] = [
  { id: 'standard', name: 'Классическая' },
  { id: 'confident', name: 'Уверенная' },
  { id: 'graceful', name: 'Изящная' },
  { id: 'pensive', name: 'Задумчивая (рука у лица)' },
];

export type Category =
  | 'face'
  | 'body'
  | 'hair'
  | 'underwear'
  | 'dress'
  | 'top'
  | 'bottom'
  | 'shoes'
  | 'uniform'
  | 'headgear'
  | 'decor'
  | 'accessories';

/** Параметры телосложения */
export interface BodySel {
  shoulders: number; // % ширины плеч, 100 = базовая
  hips: number;      // % ширины бёдер
  chest: number;     // % ширины груди
  belly: number;     // % ширины живота
  waistY?: number;   // vertical offset of the waist, positive is lower
  neckWidth?: number; // independent neck thickness, 100 = default
  /** ляжки: расстояние между ногами (-30 .. +30) */
  thighGap?: number;
  /** полнота ляжек: толщина бедра, % (70 = худые, 100 = базовая, 150 = полные) */
  thighFullness?: number;
  /** очерченность мышц 0..250 (рельеф пресса, груди, рук и ног) */
  muscle?: number;
  /** объём груди, % (женский бюст / мужская грудная мышца), отдельно от ширины грудной клетки */
  bust?: number;
  /** расстояние / расставленность груди от центра (-30 .. +30, 0 = базовая) */
  bustSpacing?: number;
  /** вертикальная высота бюста/грудных мышц (-30 .. +30, 0 = базовая) */
  bustY?: number;
  /** особенности тела: id → прозрачность 0..100 */
  marks: Record<string, number>;
  /** выбранный цвет витилиго */
  vitiligoColor?: string;
  /** классическая (винтажная) отделка кожи вместо нового реалистичного шейдинга */
  legacySkin?: boolean;
  /** сторона ампутации рук; left/right указаны со стороны зрителя */
  armAmputationSide?: 'none' | 'left' | 'right' | 'both';
  /** уровень культи руки */
  armAmputationLevel?: 'hand' | 'elbow' | 'shoulder';
  /** сторона ампутации ног; left/right указаны со стороны зрителя */
  legAmputationSide?: 'none' | 'left' | 'right' | 'both';
  /** уровень культи ноги */
  legAmputationLevel?: 'foot' | 'knee' | 'hip';
}

export const DEFAULT_BODY: BodySel = { shoulders: 100, hips: 100, chest: 100, belly: 100, waistY: 0, neckWidth: 100, thighGap: 0, thighFullness: 100, muscle: 20, bust: 100, bustSpacing: 0, bustY: 0, marks: {}, vitiligoColor: '#f0dcd2', legacySkin: false, armAmputationSide: 'none', armAmputationLevel: 'hand', legAmputationSide: 'none', legAmputationLevel: 'foot' };

export interface BodyMark {
  id: string;
  name: string;
}

const VITILIGO: BodyMark[] = [
  { id: 'vit-face-hands', name: 'Витилиго: лицо и кисти' },
  { id: 'vit-patches', name: 'Витилиго: пятна на теле' },
  { id: 'vit-limbs', name: 'Витилиго: руки и ноги' },
  { id: 'vit-hands', name: 'Витилиго: только кисти' },
  { id: 'vit-universal', name: 'Витилиго: повсеместно' },
];

export const BODY_MARKS: BodyMark[] = [
  ...VITILIGO,
  { id: 'freckles-shoulders', name: 'Веснушки на плечах' },
  { id: 'freckles-chest', name: 'Веснушки на груди' },
  { id: 'freckles-arms', name: 'Веснушки на руках' },
  { id: 'moles', name: 'Родинки' },
  { id: 'scar-collarbone', name: 'Шрам у ключицы' },
  { id: 'scar-arm', name: 'Шрам на предплечье' },
  { id: 'scar-belly', name: 'Шрам на животе' },
  { id: 'scar-thigh', name: 'Шрам на бедре' },
  { id: 'scar-knee', name: 'Ссадина на колене' },
  { id: 'birthmark', name: 'Родимое пятно' },
  { id: 'tan-lines', name: 'Следы загара' },
  { id: 'stretch', name: 'Растяжки' },
];

export const VITILIGO_COLORS = ['#f6e7dc', '#f0dcd2', '#ecd4c8', '#fbf2ea', '#e4c2b4', '#c49c7f', '#a8795b', '#815439', '#5c3828', '#36241d'];
export const VITILIGO_COLOR_NAMES = ['Слоновая кость', 'Светлый персик', 'Песочный', 'Молочный', 'Розовый беж', 'Карамельный', 'Ореховый', 'Каштановый', 'Шоколадный', 'Тёмный шоколад'];
export const VITILIGO_DEFAULT_COLOR = VITILIGO_COLORS[1];
export const isVitiligo = (id: string) => id.startsWith('vit-');

export type FacePart = 'shape' | 'ears' | 'bones' | 'moles' | 'marks' | 'prosthetics' | 'eyes' | 'brows' | 'nose' | 'lips' | 'facialHair' | 'wrinkles' | 'makeup';

import type { FigureGeometry } from './figureGeometry';

export interface ItemRenderContext {
  face: FaceSel;
  mirrored: boolean;
}

/** настраиваемый цвет ткани у предмета */
export interface GarmentColorSlot {
  slot: string;
  label: string;
  note?: string;
  colors: string[];
  names: string[];
  /** общий ключ хранения: несколько предметов делят один цвет */
  storageKey?: string;
}

export interface Item {
  id: string;
  name: string;
  category: Exclude<Category, 'face' | 'body'>;
  fit: Fit;
  /** The renderer can move an asymmetric accessory to the opposite limb. */
  mirrorable?: boolean;
  /** порядок наложения слоёв (больше — выше) */
  z: number;
  /** область для миниатюры: x, y, w, h */
  bbox: [number, number, number, number];
  render: (g: Gender, rig: FigureGeometry, context?: ItemRenderContext) => ReactNode;
  /** слой, рисуемый позади тела (например, длинные волосы) */
  back?: (g: Gender, rig: FigureGeometry, context?: ItemRenderContext) => ReactNode;
  /** какие цвета ткани можно поменять у этого предмета */
  colorable?: GarmentColorSlot[];
}

export interface Pos {
  x: number;
  y: number;
}

export interface FaceSel {
  shape: string;
  eyes: string;
  brows: string;
  nose: string;
  lips: string;
  wrinkles: string;
  wrinkleIntensity: number;
  makeup: string;
  makeupIntensity: number;
  /** свой цвет помады поверх пресета макияжа */
  lipColor?: string;
  /** свой цвет теней поверх пресета макияжа */
  shadowColor?: string;
  facialHair?: string;
  facialHairIntensity?: number;
  /** ширина бороды/усов, % */
  facialHairWidth?: number;
  /** вертикальное положение бороды/усов: + ниже, − выше */
  facialHairY?: number;
  /** базовый цвет радужки */
  iris: string;
  /** если заданы — разный цвет глаз (гетерохромия) */
  irisLeft?: string;
  irisRight?: string;
  /** произвольный цвет: левый/правый глаз через input[type=color] */
  customIrisLeft?: string;
  customIrisRight?: string;
  // Prosthetic pigments are independent of the living irises and gaze controls.
  glassIrisLeft?: string;
  glassIrisRight?: string;

  /** вертикальная позиция рта: + ниже, − выше */
  lipY?: number;
  /** вертикальная позиция радужки: + ниже */
  irisY?: number;
  /** вертикальная позиция глаз на лице: + ниже */
  eyeY?: number;
  /** общая полнота губ (масштаб обеих губ) */
  lipFullness?: number;
  /** полнота ресниц: длина/густота, 0..200 */
  lashDensity?: number;
  /** наклон ресниц: − к носу, + от глаза к виску */
  lashTilt?: number;
  /** вертикальное смещение существующей складки над глазом */
  epicanthus?: number;

  /** морфология головы */
  chinWidth?: number;   // % ширины подбородка
  chinLength?: number;  // % длины подбородка
  /** ширина челюсти (углы нижней челюсти), % */
  jawWidth?: number;
  /** высота челюсти (перед подбородком): + ниже, − выше */
  jawHeight?: number;
  /** ширина скул, % */
  cheekbone?: number;
  /** вертикаль скул: + ниже */
  cheekHeight?: number;
  /** высота лба: + выше линия волос относительно черт */
  foreheadHeight?: number;
  /** ширина носа поверх пресета, % */
  noseWidth?: number;
  /** длина носа поверх пресета, % */
  noseLength?: number;
  /** длина фильтра (нос → рот) */
  philtrum?: number;
  /** старый вид кожи и складок лица */
  faceDebug?: boolean;
  /** режим кожи лица: новая реалистичная / отладка 1 (классическая) / отладка 2 (прежняя мягкая) */
  faceSkinMode?: 'new' | 'classic' | 'soft';
  /** Independent ear preset, not a face shape. */
  ears?: string;
  /** размеры и поворот ушной раковины */
  earWidth?: number;
  earHeight?: number;
  earTilt?: number;
  earSize?: number;
  /** вертикальное положение ушей: + ниже, − выше */
  earY?: number;
  moles?: Record<string, number>;
  moleColor?: string;
  moleSize?: number;
  moleSaturation?: number;

  /** выбранные эффекты кожи: id → прозрачность 0..100 */
  skinEffects?: Record<string, number>;
  /** расположение эффектов на щеках: ближе друг к другу / дальше */
  effectSpread?: number;

  /** ширина волос: передний слой, % */
  hairFrontWidth?: number;
  /** ширина волос: задний слой, % */
  hairBackWidth?: number;
  /** высота волос: передний слой, % */
  hairFrontHeight?: number;
  /** высота волос: задний слой, % */
  hairBackHeight?: number;
  /** цвет ленты/банта в причёсках с аксессуаром */
  ribbonColor?: string;

  /** поворот головного убора вокруг оси головы, градусы 0..360 */
  hatRotation?: number;
  /** ширина головного убора (сужение/расширение), % */
  hatWidth?: number;
  /** общий размер головного убора (меньше/больше), % */
  hatScale?: number;
  /** Horizontal reflection of the fitted hat, including its tilt. */
  hatMirrored?: boolean;
  /** цвет ленты на федорах и других шляпах с околышем */
  hatBandColor?: string;

  /** выбранные цвета ткани: [id предмета][слот] = hex */
  garmentColors?: Record<string, Record<string, string>>;

  /** особенности лица (шрамы, ранения, врождённые): id → непрозрачность 0..100 */
  faceMarks?: Record<string, number>;
  /** расцветка рубцов: 'auto' под кожу, либо фиксированная (см. SCAR_TONES) */
  scarTone?: string;
  /** протезы (нос, челюсть, стеклянный глаз, повязки): id → непрозрачность 0..100 */
  prosthetics?: Record<string, number>;

  /** индивидуальный цвет бровей */
  browColor?: string;
  /** индивидуальный цвет растительности */
  facialHairColor?: string;
  /** синхронизировать цвета бровей и бороды с волосами */
  syncHairColors?: boolean;

  // --- глаза (слайдеры, пресеты формы — в поле eyes) ---
  eyeWidth?: number;    // % ширины глаза, 100 = базовая
  eyeHeight?: number;   // % высоты разреза
  irisSize?: number;    // % размера радужки
  eyeTilt?: number;     // градусы, + — внешний угол вверх
  eyeSpacing?: number;  // сдвиг глаз друг к другу / друг от друга
  strabismus?: number;  // -100 (к вискам) .. +100 (к носу)
  /** какой глаз ленивый: 'none' | 'left' | 'right' */
  lazyEye?: string;
  /** смещение ленивого глаза: − к виску, + к носу */
  lazyAmount?: number;
  eyelid?: number;      // 0..100 опущение верхнего века
  /** глубина мягкого прогиба верхней линии века, 0..100 */
  eyelidCurve?: number;
  /** положение максимального прогиба века: −100 у носа, 0 по центру, +100 у виска */
  eyelidPos?: number;
  eyePresence?: string; // 'both' | 'left' | 'right' | 'none'
  blindness?: string;   // 'none' | 'left' | 'right' | 'both'


  // --- губы (слайдеры поверх пресета формы) ---
  lipWidth?: number;      // % ширины губ
  lipHeight?: number;     // % общей высоты губ
  upperFullness?: number; // % полноты верхней губы
  lowerFullness?: number; // % полноты нижней губы
  lipOpenness?: number;   // 0..100 насколько рот раскрыт (зубы)
  /** расстояние между двумя холмиками купидонова лука, % (0 = слиты, 100 = далеко) */
  cupidBow?: number;
  /** острота/мягкость пиков верхней губы: 0 = плоская дуга, 100 = острый угол */
  upperPeak?: number;

  // --- брови ---
  browCurve?: number;     // добавка к изгибу пресета
  browHeight?: number;    // + выше, − ниже
  browThickness?: number; // % густоты
  browTilt?: number;      // + лоб дружелюбнее вверх / − хмуро к переносице
  browSpacing?: number;   // дистанция между бровями
  /** Visible eyebrows; left/right follow the viewer-side convention used for eyes. */
  browPresence?: 'both' | 'left' | 'right' | 'none';
  /** Thickness of the temple-side tip, 0..200% of the selected preset. */
  browOuterThickness?: number;
  /** Thickness of the nose-side tip, 0..200% of the selected preset. */
  browInnerThickness?: number;
  /** Apex offset along each brow, -40..40 percentage points; positive is temple-ward. */
  browArchOffset?: number;
}

export const CATEGORIES: { id: Category; label: string; short: string; multi: boolean }[] = [
  { id: 'face', label: 'Лицо', short: 'Лицо', multi: false },
  { id: 'body', label: 'Фигура', short: 'Фигура', multi: false },
  { id: 'hair', label: 'Волосы', short: 'Волосы', multi: false },
  { id: 'underwear', label: 'Исподнее', short: 'Бельё', multi: false },
  { id: 'dress', label: 'Платья', short: 'Платья', multi: false },
  { id: 'top', label: 'Верх', short: 'Верх', multi: false },
  { id: 'bottom', label: 'Низ', short: 'Низ', multi: false },
  { id: 'shoes', label: 'Обувь', short: 'Обувь', multi: false },
  { id: 'uniform', label: 'Униформа', short: 'Форма', multi: false },
  { id: 'headgear', label: 'Головные уборы', short: 'Шапки', multi: false },
  { id: 'decor', label: 'Награды и знаки', short: 'Награды', multi: true },
  { id: 'accessories', label: 'Аксессуары', short: 'Аксессуары', multi: true },
];

export const FACE_PARTS: { id: FacePart; label: string }[] = [
  { id: 'shape', label: 'Форма лица' },
  { id: 'ears', label: 'Уши' },
  { id: 'bones', label: 'Кожа и скулы' },
  { id: 'moles', label: 'Родинки' },
  { id: 'marks', label: 'Шрамы и особенности' },
  { id: 'prosthetics', label: 'Протезы' },
  { id: 'eyes', label: 'Глаза' },
  { id: 'brows', label: 'Брови' },
  { id: 'nose', label: 'Нос' },
  { id: 'lips', label: 'Губы' },
  { id: 'facialHair', label: 'Растительность' },
  { id: 'wrinkles', label: 'Морщины' },
  { id: 'makeup', label: 'Макияж' },
];

export const STAGE_W = 300;
export const STAGE_H = 620;

/** позиции кистей рук по полу: [левая, правая] */
export const HANDS: Record<Gender, [Pos, Pos]> = {
  f: [
    { x: 90, y: 326 },
    { x: 210, y: 326 },
  ],
  m: [
    { x: 84, y: 326 },
    { x: 216, y: 326 },
  ],
};

export const SKINS = ['#f6d7c3', '#e9c19c', '#d9a77c', '#b9805a', '#8a5a3c'];
export const HAIR_COLORS = [
  '#1c1410',
  '#2b2118',
  '#4a3222',
  '#5e3a22',
  '#7b4a2a',
  '#8a5a30',
  '#a5693a',
  '#a5492a',
  '#c98a4a',
  '#c9a25a',
  '#d9b878',
  '#e6c98f',
  '#efe0b8',
  '#9a9a9a',
  '#f7f5ef',
];
export const HAIR_COLOR_NAMES = [
  'Чёрно-коричневый',
  'Тёмный каштан',
  'Каштан',
  'Тёмно-русый',
  'Русый',
  'Средне-русый',
  'Светло-русый',
  'Медный',
  'Медовый',
  'Тёмный блонд',
  'Золотистый блонд',
  'Светлый блонд',
  'Льняной блонд',
  'Седой',
  'Белый',
];
export const RIBBON_COLORS = ['#8b2635', '#2f5d3a', '#2c3a5c', '#c9a24b', '#f3ecdc', '#1c1a17', '#7a3b4f', '#b8452f'];
export const RIBBON_COLOR_NAMES = ['Бордо', 'Тёмно-зелёный', 'Тёмно-синий', 'Золото', 'Слоновая кость', 'Чёрный', 'Сливовый', 'Терракота'];
/** причёски, в которых есть окрашиваемая лента */
export const RIBBON_HAIRSTYLES = ['hair-spike-braid', 'hair-jp-shimada'];

/** палитра лент на федорах */
export const HAT_BAND_COLORS = ['#1c1a17', '#2c3a5c', '#5a1e2a', '#8b2635', '#2f5d3a', '#4a3220', '#7a5c3a', '#9a9a94', '#f3ecdc', '#c9a24b'];
export const HAT_BAND_COLOR_NAMES = ['Чёрный', 'Тёмно-синий', 'Сливовый', 'Бордо', 'Тёмно-зелёный', 'Шоколад', 'Табак', 'Серый', 'Слоновая кость', 'Золото'];

/** универсальная палитра тканей */
export const CLOTH_COLORS = ['#2b2b33', '#3d3d46', '#5c5c66', '#82828c', '#b8b0a2', '#d9cfc0', '#efe8dc', '#c8a05a', '#a86a3a', '#b8452f', '#8b2635', '#5c2030', '#2f5d3a', '#2c3a5c', '#5c3a4a', '#7a5c3a'];
export const CLOTH_COLOR_NAMES = ['Угольный', 'Тёмно-серый', 'Серый', 'Светло-серый', 'Серо-бежевый', 'Бежевый', 'Молочный', 'Горчичный', 'Коньяк', 'Терракота', 'Бордо', 'Сливовый', 'Тёмно-зелёный', 'Тёмно-синий', 'Пыльная роза', 'Табак'];

export const DEFAULT_GLASS_EYE_COLOR = '#9aa3a8';
export const GLASS_EYE_COLORS = [
  { color: DEFAULT_GLASS_EYE_COLOR, name: 'Серый' },
  { color: '#567d9b', name: 'Голубой' },
  { color: '#354f70', name: 'Синий' },
  { color: '#7996a5', name: 'Серо-голубой' },
  { color: '#647a54', name: 'Зелёный' },
  { color: '#9b7b46', name: 'Ореховый' },
  { color: '#6f4933', name: 'Карий' },
  { color: '#332b27', name: 'Тёмно-карий' },
];

export const IRIS_COLORS: { id: string; name: string; color: string }[] = [
  { id: 'blue', name: 'Голубые', color: '#4a7eab' },
  { id: 'grey', name: 'Серые', color: '#7a8694' },
  { id: 'green', name: 'Зелёные', color: '#4e7a4c' },
  { id: 'hazel', name: 'Ореховые', color: '#8a6a2f' },
  { id: 'brown', name: 'Карие', color: '#5c351c' },
  { id: 'dark', name: 'Тёмные', color: '#2a1810' },
  { id: 'albino-blue', name: 'Альбинизм: голубой', color: '#9fc2d8' },
  { id: 'albino-grey', name: 'Альбинизм: лилово-серый', color: '#b7b2c4' },
  { id: 'albino-pink', name: 'Альбинизм: розовый', color: '#cf9da4' },
  { id: 'blind', name: 'Бельмо (слепой глаз)', color: '#cfd5d2' },
];

/** палитра помад 1933–1945: от тёмной сливы до томатного и лососевого */
export const LIPSTICK_COLORS = [
  '#4a1f28',
  '#5c2030',
  '#6e2430',
  '#822a2c',
  '#96302a',
  '#a83428',
  '#b8382c',
  '#c43c30',
  '#d0453a',
  '#c95a44',
  '#d97a62',
  '#a02c48',
  '#7c2040',
  '#8a3550',
];
export const LIPSTICK_COLOR_NAMES = [
  'Тёмная слива',
  'Спелая вишня',
  'Винный',
  'Кирпичный',
  'Терракотовый',
  'Коралловый красный',
  'Кармин',
  'Алый',
  'Томатный',
  'Коралл',
  'Лососевый',
  'Малиновый',
  'Бургунди',
  'Пыльная роза',
];

/** палитра теней эпохи: дымчатые, тёплые таупы, слива, оливка */
export const EYESHADOW_COLORS = [
  '#3a3f45',
  '#4a5a5c',
  '#2c3a3c',
  '#5a4a3a',
  '#6a5a4a',
  '#7a6a5a',
  '#8a7a6a',
  '#5a3a4a',
  '#6a4a5a',
  '#4a4a5c',
  '#3a4a3a',
  '#6a6a4a',
];
export const EYESHADOW_COLOR_NAMES = [
  'Дымчатый графит',
  'Морская волна',
  'Тёмный изумруд',
  'Тёплый тауп',
  'Какао',
  'Песочный',
  'Тёплый беж',
  'Сливовый',
  'Пыльная роза',
  'Аметист',
  'Оливковый',
  'Хаки',
];

/** готовые сочетания «цвет волос → помада + тени» по таблице эпохи */
export const MAKEUP_HARMONIES: { id: string; name: string; lip: string; shadow: string }[] = [
  { id: 'brune', name: 'Брюнетка', lip: '#822a2c', shadow: '#3a4a4a' },
  { id: 'blond-cendre', name: 'Пепельная блондинка', lip: '#c03a30', shadow: '#4a5a5c' },
  { id: 'chatain-clair', name: 'Светлый шатен', lip: '#a83428', shadow: '#5a4a3a' },
  { id: 'platinum', name: 'Платиновая блондинка', lip: '#d0453a', shadow: '#3a4a3a' },
  { id: 'chatain-fonce', name: 'Тёмный шатен', lip: '#96302a', shadow: '#5a3a4a' },
  { id: 'roux', name: 'Рыжая', lip: '#b8382c', shadow: '#6a5a4a' },
];
