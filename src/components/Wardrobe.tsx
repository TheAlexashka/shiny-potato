import { memo, useEffect, useMemo, useRef } from 'react';
import type { BodySel, Category, FacePart, FaceSel, Gender, Item, PoseId } from '../data/types';
import {
  BODY_MARKS,
  CATEGORIES,
  DEFAULT_BODY,
  DEFAULT_GLASS_EYE_COLOR,
  EYESHADOW_COLORS,
  EYESHADOW_COLOR_NAMES,
  FACE_PARTS,
  GLASS_EYE_COLORS,
  HAIR_COLOR_NAMES,
  LIPSTICK_COLORS,
  LIPSTICK_COLOR_NAMES,
  MAKEUP_HARMONIES,
  RIBBON_COLORS,
  RIBBON_COLOR_NAMES,
  RIBBON_HAIRSTYLES,
  VITILIGO_COLORS,
  VITILIGO_COLOR_NAMES,
  VITILIGO_DEFAULT_COLOR,
  isVitiligo,
} from '../data/types';
import { FACE_MARK_GROUPS, FACE_MARKS, SCAR_TONES } from '../data/faceMarks';
import { MOLE_COLORS, MOLE_OPTIONS } from '../data/moles';
import { FACE_PROSTHETICS } from '../data/prosthetics';
import { SKIN_EFFECTS } from '../data/skinEffects';
import { getFigureGeometry } from '../data/figureGeometry';
import { cn } from '../utils/cn';
import { hatPreviewViewBox } from '../utils/hatFit';
import { DEFAULT_FACE, FACE_OPTIONS, FacePreview, Head } from './Face';
import { EarPreview } from './Ear';
import { IrisPicker } from './IrisPicker';
import { ItemArt } from './ItemArt';

interface Props {
  gender: Gender;
  category: Category;
  onCategory: (category: Category) => void;
  items: Item[];
  selectedIds: string[];
  onToggle: (item: Item) => void;
  mirroredItems: Record<string, boolean>;
  onToggleMirror: (id: string) => void;
  hairColor: string;
  onHairColor: (color: string) => void;
  hairColors: string[];
  skin: string;
  onSkin: (color: string) => void;
  skins: string[];
  face: FaceSel;
  onFace: (patch: Partial<FaceSel>) => void;
  facePart: FacePart;
  onFacePart: (part: FacePart) => void;
  body: BodySel;
  onBody: (patch: Partial<BodySel>) => void;
  pose: PoseId;
  tuckShoes?: boolean;
  onToggleTuckShoes?: () => void;
  tuckTop?: boolean;
  onToggleTuckTop?: () => void;
}

const FACE_CONTROL_PARTS = new Set<FacePart>(['bones', 'moles', 'marks', 'prosthetics']);

export const Wardrobe = memo(function Wardrobe({
  gender,
  category,
  onCategory,
  items,
  selectedIds,
  onToggle,
  mirroredItems,
  onToggleMirror,
  hairColor,
  onHairColor,
  hairColors,
  skin,
  onSkin,
  skins,
  face,
  onFace,
  facePart,
  onFacePart,
  body,
  onBody,
  pose,
  tuckShoes = false,
  onToggleTuckShoes,
  tuckTop = true,
  onToggleTuckTop,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const categoryInfo = CATEGORIES.find((entry) => entry.id === category)!;
  const list = useMemo(
    () => items.filter((item) => item.category === category && (item.fit === 'both' || item.fit === gender)),
    [category, gender, items],
  );
  const faceList = useMemo(
    () => FACE_OPTIONS.filter((option) => option.part === facePart && (option.fit === 'both' || option.fit === gender)),
    [facePart, gender],
  );
  const previewRig = useMemo(() => getFigureGeometry(gender, DEFAULT_BODY, 'standard'), [gender]);
  const mirrorableItems = list.filter((item) => item.mirrorable && selectedIds.includes(item.id));
  const colorableItems = list.filter((item) => (item.colorable?.length ?? 0) > 0 && selectedIds.includes(item.id));

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [category, facePart, gender]);

  const selectFaceOption = (id: string) => {
    if (FACE_CONTROL_PARTS.has(facePart)) return;
    const patch = { [facePart]: id } as Partial<FaceSel>;
    if (facePart === 'wrinkles' && id !== 'none' && !face.wrinkleIntensity) patch.wrinkleIntensity = 65;
    if (facePart === 'makeup' && id !== 'none' && !face.makeupIntensity) patch.makeupIntensity = 80;
    onFace(patch);
  };

  const toggleFaceMap = (key: 'moles' | 'faceMarks' | 'prosthetics', id: string, initial: number) => {
    const collection = { ...(face[key] ?? {}) };
    if (Object.prototype.hasOwnProperty.call(collection, id)) delete collection[id];
    else collection[id] = initial;
    onFace({ [key]: collection } as Partial<FaceSel>);
  };

  const updateFaceMap = (key: 'moles' | 'faceMarks' | 'prosthetics', id: string, value: number) => {
    onFace({ [key]: { ...(face[key] ?? {}), [id]: value } } as Partial<FaceSel>);
  };

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col">
      <nav aria-label="Разделы ателье" className="flex shrink-0 gap-1 overflow-x-auto border-b border-[#c9a24b]/30 pb-1.5 [scrollbar-width:none]">
        {CATEGORIES.map((entry) => (
          <button
            key={entry.id}
            type="button"
            title={entry.label}
            aria-pressed={category === entry.id}
            onClick={(event) => {
              onCategory(entry.id);
              event.currentTarget.scrollIntoView({ block: 'nearest', inline: 'nearest' });
            }}
            className={cn(
              'min-h-10 shrink-0 rounded-sm px-2.5 py-1.5 text-[13px] tracking-wide uppercase transition sm:px-3 sm:text-sm',
              category === entry.id ? 'bg-[#c9a24b] text-[#1c1a17] shadow' : 'text-[#e8dcc0]/80 hover:bg-white/5 hover:text-[#f3ecdc]',
            )}
          >
            <span className="sm:hidden">{entry.short}</span>
            <span className="hidden sm:inline">{entry.label}</span>
          </button>
        ))}
      </nav>

      {category === 'face' && (
        <div aria-label="Параметры лица" className="mt-1.5 flex shrink-0 gap-1 overflow-x-auto [scrollbar-width:none]">
          {FACE_PARTS.filter((part) => part.id !== 'facialHair' || gender === 'm').map((part) => (
            <button
              key={part.id}
              type="button"
              aria-pressed={facePart === part.id}
              onClick={(event) => {
                onFacePart(part.id);
                event.currentTarget.scrollIntoView({ block: 'nearest', inline: 'nearest' });
              }}
              className={cn(
                'min-h-10 shrink-0 rounded-sm border px-2.5 py-1 text-[12px] tracking-wide uppercase transition-colors',
                facePart === part.id ? 'border-[#c9a24b] bg-[#c9a24b]/20 text-[#c9a24b]' : 'border-white/10 text-[#e8dcc0]/70',
              )}
            >
              {part.label}
            </button>
          ))}
        </div>
      )}

      <div className="mt-2 flex shrink-0 items-center justify-between gap-2">
        <h2 className="text-sm tracking-wide text-[#e6c884]">
          {category === 'face' ? FACE_PARTS.find((part) => part.id === facePart)?.label : categoryInfo.label}
          {categoryInfo.multi && <span className="ml-2 text-xs text-[#e8dcc0]/60">можно несколько</span>}
          {category === 'dress' && <span className="ml-2 text-xs text-[#e8dcc0]/60">шинель и плащи из резины — поверх брюк</span>}
        </h2>
        {category === 'face' && (
          <button type="button" onClick={() => onFace({ ...DEFAULT_FACE[gender] })} className="text-xs text-[#e8dcc0]/65 underline decoration-[#c9a24b]/35 underline-offset-4 hover:text-[#e6c884]">
            Сбросить лицо
          </button>
        )}
      </div>

      <div ref={scrollRef} className="mt-2 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-0.5 pb-2">
        {category === 'face' ? (
          <FaceControls
            gender={gender}
            skin={skin}
            skins={skins}
            onSkin={onSkin}
            hairColor={hairColor}
            hairColors={hairColors}
            face={face}
            body={body}
            facePart={facePart}
            faceList={faceList}
            onFace={onFace}
            onSelect={selectFaceOption}
            onToggleMap={toggleFaceMap}
            onUpdateMap={updateFaceMap}
          />
        ) : category === 'body' ? (
          <BodyControls gender={gender} skin={skin} skins={skins} onSkin={onSkin} body={body} onBody={onBody} pose={pose} />
        ) : (
          <>
            {category === 'shoes' && onToggleTuckShoes && (
              <div className="mb-3 flex items-center justify-between gap-3 border-b border-[#c9a24b]/20 pb-3">
                <div>
                  <p className="text-sm text-[#e8dcc0]">Посадка брюк и подола</p>
                  <p className="text-[11px] text-[#e8dcc0]/60">{tuckShoes ? 'Обувь находится поверх брюк.' : 'Брюки и подол закрывают обувь.'}</p>
                </div>
                <button type="button" role="switch" aria-checked={tuckShoes} onClick={onToggleTuckShoes} className={cn('shrink-0 rounded-sm border px-3 py-1.5 text-xs tracking-widest uppercase', tuckShoes ? 'border-[#c9a24b] bg-[#c9a24b] text-[#1c1a17]' : 'border-white/20 text-[#e8dcc0]/80')}>
                  {tuckShoes ? 'Заправить' : 'Навыпуск'}
                </button>
              </div>
            )}
            {category === 'headgear' && (
              <div className="mb-3 space-y-1 border-b border-[#c9a24b]/15 pb-3">
                <Slider
                  label="Поворот"
                  note="набекрень 0–360°"
                  value={face.hatRotation ?? 0}
                  min={0}
                  max={360}
                  step={5}
                  format={(value) => `${value}°`}
                  onChange={(value) => onFace({ hatRotation: value })}
                />
                <Slider label="Ширина" note="уже ← → шире" value={face.hatWidth ?? 100} min={55} max={165} onChange={(value) => onFace({ hatWidth: value })} />
                <Slider label="Размер" note="меньше ← → больше" value={face.hatScale ?? 100} min={55} max={165} onChange={(value) => onFace({ hatScale: value })} />
                <MirrorSwitch label="Отзеркалить шапку" checked={face.hatMirrored ?? false} onToggle={() => onFace({ hatMirrored: !face.hatMirrored })} />
                <div className="flex flex-wrap gap-1 pt-1">
                  {([[0, 'Прямо'], [15, 'Чуть набок'], [30, 'Набекрень'], [50, 'Кокетливо']] as [number, string][]).map(([deg, label]) => (
                    <button
                      key={label}
                      type="button"
                      aria-pressed={(face.hatRotation ?? 0) === deg}
                      onClick={() => onFace({ hatRotation: deg })}
                      className={cn(
                        'rounded-sm border px-2 py-1 text-[11px] transition',
                        (face.hatRotation ?? 0) === deg ? 'border-[#c9a24b] bg-[#c9a24b] text-[#1c1a17]' : 'border-white/15 text-[#e8dcc0]/75 hover:border-[#c9a24b]/60',
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <ResetButton label="Сброс посадки головного убора" onClick={() => onFace({ hatRotation: undefined, hatWidth: undefined, hatScale: undefined, hatMirrored: undefined })} />
              </div>
            )}
            {category === 'accessories' && mirrorableItems.length > 0 && (
              <div className="mb-3 space-y-2 border-b border-[#c9a24b]/15 pb-3">
                <p className="text-xs text-[#e8dcc0]/65">Отражение переносит аксессуар на другую ногу.</p>
                {mirrorableItems.map((item) => (
                  <MirrorSwitch
                    key={item.id}
                    label={`Отзеркалить: ${item.name}`}
                    checked={mirroredItems[item.id] ?? false}
                    onToggle={() => onToggleMirror(item.id)}
                  />
                ))}
              </div>
            )}
            {colorableItems.map((item) => (
              <div key={item.id} className="mb-3 space-y-1 border-b border-[#c9a24b]/15 pb-3">
                {item.colorable!.map((slot) => {
                  const storageKey = slot.storageKey ?? item.id;
                  const hasOverride = !!face.garmentColors?.[storageKey]?.[slot.slot];
                  return (
                    <div key={slot.slot} className="flex flex-col gap-0.5">
                      <Palette
                        label={slot.label}
                        colors={slot.colors}
                        names={slot.names}
                        value={face.garmentColors?.[storageKey]?.[slot.slot] ?? slot.colors[0]}
                        onChange={(value) => onFace({
                          garmentColors: {
                            ...(face.garmentColors ?? {}),
                            [storageKey]: { ...(face.garmentColors?.[storageKey] ?? {}), [slot.slot]: value },
                          },
                        })}
                        note={slot.note}
                      />
                      {hasOverride && (
                        <button
                          type="button"
                          onClick={() => {
                            const slots = { ...(face.garmentColors?.[storageKey] ?? {}) };
                            delete slots[slot.slot];
                            onFace({
                              garmentColors: {
                                ...(face.garmentColors ?? {}),
                                [storageKey]: slots,
                              },
                            });
                          }}
                          className="self-start text-[10px] text-[#e8dcc0]/60 underline decoration-[#c9a24b]/35 underline-offset-2 hover:text-[#e6c884]"
                        >
                          вернуть оригинальный цвет
                        </button>
                      )}
                    </div>
                  );
                })}
                <p className="text-[11px] text-[#e8dcc0]/55">Цвет применяется к «{item.name}».</p>
              </div>
            ))}
            {category === 'bottom' && onToggleTuckTop && (
              <div className="mb-3 flex items-center justify-between gap-3 border-b border-[#c9a24b]/20 pb-3">
                <div>
                  <p className="text-sm text-[#e8dcc0]">Посадка верха</p>
                  <p className="text-[11px] text-[#e8dcc0]/60">{tuckTop ? 'Верх заправлен внутрь.' : 'Верх выпущен поверх низа.'}</p>
                </div>
                <button type="button" role="switch" aria-checked={tuckTop} onClick={onToggleTuckTop} className={cn('shrink-0 rounded-sm border px-3 py-1.5 text-xs tracking-widest uppercase', tuckTop ? 'border-[#c9a24b] bg-[#c9a24b] text-[#1c1a17]' : 'border-white/20 text-[#e8dcc0]/80')}>
                  {tuckTop ? 'Заправить' : 'Навыпуск'}
                </button>
              </div>
            )}
            {category === 'hair' && (
              <div className="mb-3 space-y-1 border-b border-[#c9a24b]/15 pb-3">
                <Palette label="Цвет волос" colors={hairColors} names={HAIR_COLOR_NAMES} value={hairColor} onChange={onHairColor} />
                {selectedIds.some((id) => RIBBON_HAIRSTYLES.includes(id)) && <Palette label="Цвет ленты" colors={RIBBON_COLORS} names={RIBBON_COLOR_NAMES} value={face.ribbonColor ?? RIBBON_COLORS[0]} onChange={(value) => onFace({ ribbonColor: value })} />}
                <Slider label="Волосы спереди" note="ширина" value={face.hairFrontWidth ?? 100} min={72} max={128} onChange={(value) => onFace({ hairFrontWidth: value })} />
                <Slider label="Волосы спереди" note="высота" value={face.hairFrontHeight ?? 100} min={72} max={128} onChange={(value) => onFace({ hairFrontHeight: value })} />
                <Slider label="Волосы сзади" note="ширина" value={face.hairBackWidth ?? 100} min={72} max={128} onChange={(value) => onFace({ hairBackWidth: value })} />
                <Slider label="Волосы сзади" note="высота" value={face.hairBackHeight ?? 100} min={72} max={128} onChange={(value) => onFace({ hairBackHeight: value })} />
                <ResetButton label="Сброс размеров волос" onClick={() => onFace({ hairFrontWidth: undefined, hairFrontHeight: undefined, hairBackWidth: undefined, hairBackHeight: undefined })} />
              </div>
            )}
            <ItemGrid items={list} selectedIds={selectedIds} gender={gender} skin={skin} hairColor={hairColor} face={face} rig={previewRig} onToggle={onToggle} mirroredItems={mirroredItems} />
          </>
        )}
      </div>
    </div>
  );
});

function FaceControls({
  gender,
  skin,
  skins,
  onSkin,
  hairColor,
  hairColors,
  face,
  body,
  facePart,
  faceList,
  onFace,
  onSelect,
  onToggleMap,
  onUpdateMap,
}: {
  gender: Gender;
  skin: string;
  skins: string[];
  onSkin: (value: string) => void;
  hairColor: string;
  hairColors: string[];
  face: FaceSel;
  body: BodySel;
  facePart: FacePart;
  faceList: typeof FACE_OPTIONS;
  onFace: (patch: Partial<FaceSel>) => void;
  onSelect: (id: string) => void;
  onToggleMap: (key: 'moles' | 'faceMarks' | 'prosthetics', id: string, initial: number) => void;
  onUpdateMap: (key: 'moles' | 'faceMarks' | 'prosthetics', id: string, value: number) => void;
}) {
  const featureGrid = faceList.length > 0 && <FaceOptionGrid faceList={faceList} gender={gender} skin={skin} hairColor={hairColor} face={face} body={body} facePart={facePart} onSelect={onSelect} />;

  if (facePart === 'shape') {
    return <><Palette label="Кожа" colors={skins} value={skin} onChange={onSkin} /><Segment label="Тон лица" value={face.faceSkinMode ?? 'new'} options={[['new', 'Новая'], ['classic', 'Отладка 1'], ['soft', 'Отладка 2']]} onChange={(value) => onFace({ faceSkinMode: value as FaceSel['faceSkinMode'], faceDebug: value === 'classic' })} />{featureGrid}</>;
  }

  if (facePart === 'bones') {
    return (
      <div className="space-y-1.5">
        <Palette label="Кожа" colors={skins} value={skin} onChange={onSkin} />
        <Slider label="Подбородок" note="ширина" value={face.chinWidth ?? 100} min={45} max={175} onChange={(value) => onFace({ chinWidth: value })} />
        <Slider label="Подбородок" note="длина" value={face.chinLength ?? 100} min={88} max={113} onChange={(value) => onFace({ chinLength: value })} />
        <Slider label="Челюсть" note="ширина" value={face.jawWidth ?? 100} min={55} max={160} onChange={(value) => onFace({ jawWidth: value })} />
        <Slider label="Челюсть" note="высота" value={face.jawHeight ?? 100} min={70} max={140} onChange={(value) => onFace({ jawHeight: value })} />
        <Slider label="Скулы" note="ширина" value={face.cheekbone ?? 100} min={70} max={140} onChange={(value) => onFace({ cheekbone: value })} />
        <Slider label="Скулы" note="высота" value={face.cheekHeight ?? 100} min={70} max={130} onChange={(value) => onFace({ cheekHeight: value })} />
        <Slider label="Лоб" note="высота" value={face.foreheadHeight ?? 100} min={70} max={140} onChange={(value) => onFace({ foreheadHeight: value })} />
        <Slider label="Эффекты" note="расположение" value={face.effectSpread ?? 100} min={70} max={130} onChange={(value) => onFace({ effectSpread: value })} />
        <ToggleList title="Эффекты кожи" entries={SKIN_EFFECTS} values={face.skinEffects ?? {}} onChange={(id, value) => onFace({ skinEffects: { ...(face.skinEffects ?? {}), [id]: value } })} />
        <ResetButton label="Сброс параметров лица" onClick={() => onFace({ chinWidth: undefined, chinLength: undefined, jawWidth: undefined, jawHeight: undefined, cheekbone: undefined, cheekHeight: undefined, foreheadHeight: undefined, effectSpread: undefined, skinEffects: undefined })} />
      </div>
    );
  }

  if (facePart === 'ears') {
    return (
      <div className="space-y-1.5">
        <p className="text-xs text-[#e8dcc0]/65">Форма ушей настраивается независимо от овала лица.</p>
        <Slider label="Уши" note="ширина" value={face.earWidth ?? 100} min={60} max={170} onChange={(value) => onFace({ earWidth: value })} />
        <Slider label="Уши" note="высота" value={face.earHeight ?? 100} min={60} max={170} onChange={(value) => onFace({ earHeight: value })} />
        <Slider label="Уши" note="размер" value={face.earSize ?? 100} min={60} max={170} onChange={(value) => onFace({ earSize: value })} />
        <Slider label="Наклон" value={face.earTilt ?? 0} min={-30} max={30} step={2} format={(value) => `${value} deg`} onChange={(value) => onFace({ earTilt: value })} />
        <Slider label="Положение" note="по высоте" value={face.earY ?? 0} min={-12} max={12} format={signed} onChange={(value) => onFace({ earY: value })} />
        <ResetButton label="Сброс ушей" onClick={() => onFace({ earWidth: undefined, earHeight: undefined, earSize: undefined, earTilt: undefined, earY: undefined })} />
        {featureGrid}
      </div>
    );
  }

  if (facePart === 'moles') {
    return (
      <div className="space-y-2">
        <p className="text-xs text-[#e8dcc0]/65">Можно сочетать несколько видов. У каждого — своя непрозрачность.</p>
        <Palette label="Цвет родинок" colors={MOLE_COLORS} value={face.moleColor ?? MOLE_COLORS[2]} onChange={(value) => onFace({ moleColor: value })} />
        <Slider label="Размер" value={face.moleSize ?? 100} min={50} max={180} onChange={(value) => onFace({ moleSize: value })} />
        <Slider label="Насыщенность" value={face.moleSaturation ?? 85} min={0} max={100} onChange={(value) => onFace({ moleSaturation: value })} />
        <PreviewIntensityGrid
          entries={MOLE_OPTIONS}
          values={face.moles ?? {}}
          defaultValue={85}
          previewFace={(id, value) => ({ ...face, moles: { [id]: value } })}
          gender={gender}
          skin={skin}
          hairColor={hairColor}
          body={body}
          uidPrefix="mole"
          onToggle={(id) => onToggleMap('moles', id, 85)}
          onChange={(id, value) => onUpdateMap('moles', id, value)}
        />
        <ResetButton label="Убрать все родинки" onClick={() => onFace({ moles: {}, moleSize: 100, moleColor: MOLE_COLORS[2] })} />
      </div>
    );
  }

  if (facePart === 'marks') {
    return (
      <div className="space-y-3">
        <p className="text-xs text-[#e8dcc0]/65">Можно сочетать несколько. Каждая особенность имеет свою непрозрачность.</p>
        <Segment label="Рубцы" value={face.scarTone ?? 'auto'} options={SCAR_TONES.map((tone) => [tone.id, tone.name])} onChange={(value) => onFace({ scarTone: value })} />
        {FACE_MARK_GROUPS.map((group) => (
          <div key={group.id} className="space-y-1.5">
            <p className="text-[11px] tracking-widest text-[#c9a24b]/80 uppercase">{group.label}</p>
            <PreviewIntensityGrid
              entries={FACE_MARKS.filter((item) => item.group === group.id)}
              values={face.faceMarks ?? {}}
              defaultValue={90}
              previewFace={(id, value) => ({ ...face, faceMarks: { [id]: value } })}
              gender={gender}
              skin={skin}
              hairColor={hairColor}
              body={body}
              uidPrefix={`mark-${group.id}`}
              onToggle={(id) => onToggleMap('faceMarks', id, 90)}
              onChange={(id, value) => onUpdateMap('faceMarks', id, value)}
            />
          </div>
        ))}
        <ResetButton label="Убрать все особенности" onClick={() => onFace({ faceMarks: {} })} />
      </div>
    );
  }

  if (facePart === 'prosthetics') {
    const leftGlass = !!face.prosthetics?.['glass-eye-left'];
    const rightGlass = !!face.prosthetics?.['glass-eye-right'];
    return (
      <div className="space-y-3">
        <p className="text-xs text-[#e8dcc0]/65">Маски надеваются поверх лица, стеклянные глаза — под веками. Цвет каждого стеклянного глаза настраивается отдельно.</p>
        {(leftGlass || rightGlass) && <GlassEyeControls face={face} onFace={onFace} left={leftGlass} right={rightGlass} />}
        <PreviewIntensityGrid
          entries={FACE_PROSTHETICS}
          values={face.prosthetics ?? {}}
          defaultValue={100}
          previewFace={(id, value) => ({ ...face, prosthetics: { [id]: value } })}
          gender={gender}
          skin={skin}
          hairColor={hairColor}
          body={body}
          uidPrefix="prosth"
          onToggle={(id) => onToggleMap('prosthetics', id, 100)}
          onChange={(id, value) => onUpdateMap('prosthetics', id, value)}
        />
        <ResetButton label="Снять все протезы" onClick={() => onFace({ prosthetics: {} })} />
      </div>
    );
  }

  if (facePart === 'eyes') {
    return (
      <div className="space-y-1.5">
        <Segment label="Видимость" value={face.eyePresence ?? 'both'} options={[['both', 'Оба'], ['left', 'Левый'], ['right', 'Правый'], ['none', 'Нет']]} onChange={(value) => onFace({ eyePresence: value })} />
        <Segment label="Слепота" value={face.blindness ?? 'none'} options={[['none', 'Нет'], ['left', 'Левый'], ['right', 'Правый'], ['both', 'Оба']]} onChange={(value) => onFace({ blindness: value })} />
        <IrisPicker
          side="left"
          value={face.irisLeft ?? face.iris}
          customColor={face.customIrisLeft ?? ''}
          onChange={(c) => onFace({ irisLeft: c, customIrisLeft: undefined })}
          onCustomChange={(c) => onFace(c ? { customIrisLeft: c } : { customIrisLeft: undefined })}
        />
        <IrisPicker
          side="right"
          value={face.irisRight ?? face.iris}
          customColor={face.customIrisRight ?? ''}
          onChange={(c) => onFace({ irisRight: c, customIrisRight: undefined })}
          onCustomChange={(c) => onFace(c ? { customIrisRight: c } : { customIrisRight: undefined })}
        />
        <Slider label="Расположение глаз" note="выше / ниже" value={face.eyeY ?? 1.5} min={-4} max={4.5} step={0.25} format={signed} onChange={(value) => onFace({ eyeY: value })} />
        <Slider label="Ресницы" note="полнота" value={face.lashDensity ?? 100} min={0} max={200} onChange={(value) => onFace({ lashDensity: value })} />
        <Slider label="Наклон ресниц" note="к носу ← → от глаза" value={face.lashTilt ?? 0} min={-100} max={100} format={signed} onChange={(value) => onFace({ lashTilt: value })} />
        <Slider label="Глаза" note="ширина" value={face.eyeWidth ?? 100} min={62} max={145} onChange={(value) => onFace({ eyeWidth: value })} />
        <Slider label="Глаза" note="высота" value={face.eyeHeight ?? 100} min={42} max={175} onChange={(value) => onFace({ eyeHeight: value })} />
        <Slider label="Радужка" note="размер" value={face.irisSize ?? 100} min={52} max={185} onChange={(value) => onFace({ irisSize: value })} />
        <Slider label="Радужка" note="высота" value={face.irisY ?? -0.55} min={-2.8} max={2.8} step={0.2} format={signed} onChange={(value) => onFace({ irisY: value })} />
        <Slider label="Наклон" value={face.eyeTilt ?? 0} min={-9} max={9} format={signed} onChange={(value) => onFace({ eyeTilt: value })} />
        <Slider label="Дистанция" value={face.eyeSpacing ?? 0} min={-7} max={7} format={signed} onChange={(value) => onFace({ eyeSpacing: value })} />
        <Slider label="Косоглазие" value={face.strabismus ?? 0} min={-100} max={100} format={signed} onChange={(value) => onFace({ strabismus: value })} />
        <Segment label="Ленивый" value={face.lazyEye ?? 'none'} options={[['none', 'Нет'], ['left', 'Левый'], ['right', 'Правый']]} onChange={(value) => onFace({ lazyEye: value })} />
        {(face.lazyEye ?? 'none') !== 'none' && <Slider label="Смещение" value={face.lazyAmount ?? 0} min={-100} max={100} format={signed} onChange={(value) => onFace({ lazyAmount: value })} />}
        <Slider label="Верхнее веко" note="сколько прикрывает" value={face.eyelid ?? 0} min={0} max={100} onChange={(value) => onFace({ eyelid: value })} />
        <Slider label="Прогиб века" note="0% — без прогиба" value={face.eyelidCurve ?? 0} min={0} max={100} onChange={(value) => onFace({ eyelidCurve: value })} />
        <Slider label="Положение прогиба" note="к носу ← → к виску" value={face.eyelidPos ?? 0} min={-100} max={100} format={signed} disabled={(face.eyelidCurve ?? 0) === 0} onChange={(value) => onFace({ eyelidPos: value })} />
        <Slider label="Складка века" value={face.epicanthus ?? 0} min={-4} max={4} step={0.25} format={signed} onChange={(value) => onFace({ epicanthus: value })} />
        <ResetButton label="Сброс параметров глаз" onClick={() => onFace({ eyeY: undefined, lashDensity: undefined, eyeWidth: undefined, eyeHeight: undefined, irisSize: undefined, irisY: undefined, eyeTilt: undefined, eyeSpacing: undefined, strabismus: undefined, lazyEye: undefined, lazyAmount: undefined, eyelid: undefined, eyelidCurve: undefined, eyelidPos: undefined, epicanthus: undefined, eyePresence: undefined, blindness: undefined, irisLeft: undefined, irisRight: undefined })} />
        <p className="text-[11px] text-[#e8dcc0]/55">Ресницы автоматически следуют за формой века и его прогибом.</p>
        {featureGrid}
      </div>
    );
  }

  if (facePart === 'brows') {
    const presence = face.browPresence ?? 'both';
    const noBrows = presence === 'none';
    return (
      <div className="space-y-1.5">
        <Segment
          label="Наличие бровей"
          value={presence}
          options={[['both', 'Обе'], ['none', 'Без бровей'], ['left', 'Без правой'], ['right', 'Без левой']]}
          onChange={(value) => onFace({ browPresence: value as FaceSel['browPresence'] })}
        />
        <p className="text-xs text-[#e8dcc0]/65">Стороны указаны как на экране. При скрытии выбранная форма сохраняется.</p>
        <fieldset disabled={noBrows} className={cn('space-y-1.5', noBrows && 'opacity-40')}>
          <ColorSync label="Синхронизация" synced={face.syncHairColors ?? true} onToggle={() => onFace({ syncHairColors: !(face.syncHairColors ?? true) })} />
          {!(face.syncHairColors ?? true) && <Palette label="Цвет бровей" colors={hairColors} names={HAIR_COLOR_NAMES} value={face.browColor ?? hairColor} onChange={(value) => onFace({ browColor: value })} />}
          <Slider label="Изгиб" value={face.browCurve ?? 0} min={-45} max={45} format={signed} onChange={(value) => onFace({ browCurve: value })} />
          <Slider label="Положение арки" note="к носу / к виску" value={face.browArchOffset ?? 0} min={-40} max={40} format={signed} onChange={(value) => onFace({ browArchOffset: value })} />
          <Slider label="Высота" value={face.browHeight ?? 0} min={-5.5} max={5.5} step={0.5} format={signed} onChange={(value) => onFace({ browHeight: value })} />
          <Slider label="Густота" value={face.browThickness ?? 100} min={32} max={235} onChange={(value) => onFace({ browThickness: value })} />
          <Slider label="Внешний кончик" note="у виска: тоньше / толще" value={face.browOuterThickness ?? 100} min={0} max={200} onChange={(value) => onFace({ browOuterThickness: value })} />
          <Slider label="Внутренний кончик" note="у носа: тоньше / толще" value={face.browInnerThickness ?? 100} min={0} max={200} onChange={(value) => onFace({ browInnerThickness: value })} />
          <p className="text-[11px] text-[#e8dcc0]/55">100% соответствует толщине кончика выбранной формы; 0% сужает его до точки. Арка перемещается зеркально вдоль обеих бровей.</p>
          <Slider label="Наклон" value={face.browTilt ?? 0} min={-12} max={12} format={signed} onChange={(value) => onFace({ browTilt: value })} />
          <Slider label="Дистанция" value={face.browSpacing ?? 0} min={-6} max={6} format={signed} onChange={(value) => onFace({ browSpacing: value })} />
        </fieldset>
        <ResetButton label="Сброс параметров бровей" onClick={() => onFace({ browCurve: undefined, browHeight: undefined, browThickness: undefined, browTilt: undefined, browSpacing: undefined, browColor: undefined, syncHairColors: undefined, browPresence: 'both', browOuterThickness: undefined, browInnerThickness: undefined, browArchOffset: undefined })} />
        {noBrows ? <p className="py-3 text-sm text-[#e8dcc0]/65">Выберите «Обе», «Без правой» или «Без левой», чтобы настроить форму.</p> : featureGrid}
      </div>
    );
  }

  if (facePart === 'nose') {
    return <div className="space-y-1.5"><Slider label="Ширина" value={face.noseWidth ?? 100} min={60} max={160} onChange={(value) => onFace({ noseWidth: value })} /><Slider label="Длина" value={face.noseLength ?? 100} min={20} max={140} onChange={(value) => onFace({ noseLength: value })} /><ResetButton label="Сброс параметров носа" onClick={() => onFace({ noseWidth: undefined, noseLength: undefined })} />{featureGrid}</div>;
  }

  if (facePart === 'lips') {
    return <div className="space-y-1.5"><Slider label="Ширина" value={face.lipWidth ?? 100} min={52} max={158} onChange={(value) => onFace({ lipWidth: value })} /><Slider label="Полнота" value={face.lipFullness ?? 100} min={35} max={230} onChange={(value) => onFace({ lipFullness: value })} /><Slider label="Высота рта" value={face.lipY ?? 0} min={-4.5} max={5} step={0.5} format={signed} onChange={(value) => onFace({ lipY: value })} /><Slider label="Верхняя" value={face.upperFullness ?? 100} min={30} max={260} onChange={(value) => onFace({ upperFullness: value })} /><Slider label="Пики купидона" note="ближе / дальше друг к другу" value={face.cupidBow ?? 50} min={0} max={100} onChange={(value) => onFace({ cupidBow: value })} /><Slider label="Острота пиков" note="мягче ← → острее" value={face.upperPeak ?? 50} min={0} max={100} onChange={(value) => onFace({ upperPeak: value })} /><Slider label="Нижняя" value={face.lowerFullness ?? 100} min={30} max={260} onChange={(value) => onFace({ lowerFullness: value })} /><Slider label="Открытость" value={face.lipOpenness ?? 0} min={0} max={108} onChange={(value) => onFace({ lipOpenness: value })} /><ResetButton label="Сброс параметров губ" onClick={() => onFace({ lipWidth: undefined, lipFullness: undefined, lipY: undefined, upperFullness: undefined, lowerFullness: undefined, lipOpenness: undefined, cupidBow: undefined, upperPeak: undefined })} />{featureGrid}</div>;
  }

  if (facePart === 'facialHair') {
    return (
      <div className="space-y-1.5">
        <ColorSync label="Синхронизация" synced={face.syncHairColors ?? true} onToggle={() => onFace({ syncHairColors: !(face.syncHairColors ?? true) })} />
        {!(face.syncHairColors ?? true) && <Palette label="Цвет" colors={hairColors} names={HAIR_COLOR_NAMES} value={face.facialHairColor ?? hairColor} onChange={(value) => onFace({ facialHairColor: value })} />}
        <Slider label="Густота" value={face.facialHair === 'clean' ? 0 : face.facialHairIntensity ?? 80} min={0} max={100} onChange={(value) => onFace({ facialHairIntensity: value })} />
        <Slider label="Ширина" value={face.facialHairWidth ?? 100} min={70} max={135} onChange={(value) => onFace({ facialHairWidth: value })} />
        <Slider label="Положение" value={face.facialHairY ?? 0} min={-5} max={6} step={0.5} format={signed} onChange={(value) => onFace({ facialHairY: value })} />
        <ResetButton label="Сброс растительности" onClick={() => onFace({ facialHairWidth: undefined, facialHairY: undefined, facialHairIntensity: undefined, facialHairColor: undefined, syncHairColors: undefined })} />
        {featureGrid}
      </div>
    );
  }

  if (facePart === 'wrinkles' || facePart === 'makeup') {
    const isWrinkles = facePart === 'wrinkles';
    const none = isWrinkles ? face.wrinkles === 'none' : face.makeup === 'none';
    const value = isWrinkles ? face.wrinkleIntensity : face.makeupIntensity;
    return (
      <div className="space-y-2">
        <Slider label={isWrinkles ? 'Выраженность' : 'Насыщенность'} value={none ? 0 : value} min={0} max={100} disabled={none} onChange={(next) => onFace(isWrinkles ? { wrinkleIntensity: next } : { makeupIntensity: next })} />
        {!isWrinkles && (
          <fieldset disabled={none} className={cn('space-y-1.5', none && 'opacity-40')}>
            <div>
              <p className="mb-1 text-[11px] tracking-widest text-[#c9a24b]/80 uppercase">Гармонии по цвету волос</p>
              <div className="flex flex-wrap gap-1">
                {MAKEUP_HARMONIES.map((harmony) => (
                  <button
                    key={harmony.id}
                    type="button"
                    title={`Тени «${EYESHADOW_COLOR_NAMES[EYESHADOW_COLORS.indexOf(harmony.shadow)]}» + помада «${LIPSTICK_COLOR_NAMES[LIPSTICK_COLORS.indexOf(harmony.lip)]}»`}
                    onClick={() => onFace({ lipColor: harmony.lip, shadowColor: harmony.shadow })}
                    className="flex items-center gap-1 rounded-sm border border-white/15 px-1.5 py-1 text-[11px] text-[#e8dcc0]/80 transition hover:border-[#c9a24b]/60"
                  >
                    <span className="h-3.5 w-3.5 rounded-full border border-white/25" style={{ background: harmony.shadow }} />
                    <span className="h-3.5 w-3.5 rounded-full border border-white/25" style={{ background: harmony.lip }} />
                    {harmony.name}
                  </button>
                ))}
              </div>
            </div>
            <Palette label="Помада" colors={LIPSTICK_COLORS} names={LIPSTICK_COLOR_NAMES} value={face.lipColor ?? ''} onChange={(color) => onFace({ lipColor: color })} />
            <Palette label="Тени" colors={EYESHADOW_COLORS} names={EYESHADOW_COLOR_NAMES} value={face.shadowColor ?? ''} onChange={(color) => onFace({ shadowColor: color })} />
            {(face.lipColor || face.shadowColor) && (
              <ResetButton label="Вернуть цвета выбранного макияжа" onClick={() => onFace({ lipColor: undefined, shadowColor: undefined })} />
            )}
          </fieldset>
        )}
        {featureGrid}
      </div>
    );
  }

  return <>{featureGrid}</>;
}

function BodyControls({ gender, skin, skins, onSkin, body, onBody }: {
  gender: Gender;
  skin: string;
  skins: string[];
  onSkin: (value: string) => void;
  body: BodySel;
  onBody: (patch: Partial<BodySel>) => void;
  pose?: PoseId;
}) {
  return (
    <div className="space-y-1.5">
      <Palette label="Кожа" colors={skins} value={skin} onChange={onSkin} />

      <div className="my-1.5 flex items-center justify-between rounded-sm border border-[#c9a24b]/20 bg-[#15130f]/60 px-2.5 py-1.5">
        <div>
          <span className="font-serif text-xs tracking-wider text-[#e8dcc0] uppercase">Отделка кожи</span>
          <p className="text-[10px] text-[#e8dcc0]/55">
            {body.legacySkin ? 'Классическая отделка (винтажные цвета)' : 'Реалистичный единый тон (лицо + тело + руки)'}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={body.legacySkin ?? false}
          onClick={() => onBody({ legacySkin: !(body.legacySkin ?? false) })}
          className={cn(
            'shrink-0 rounded-sm border px-2.5 py-1 font-serif text-[11px] tracking-wider uppercase transition shadow-sm',
            body.legacySkin
              ? 'border-[#c9a24b] bg-[#c9a24b] text-[#1c1a17]'
              : 'border-white/20 text-[#e8dcc0]/80 hover:border-[#c9a24b]/50',
          )}
        >
          {body.legacySkin ? 'Винтаж (ст.)' : 'Реализм (новый)'}
        </button>
      </div>

      <div className="space-y-1 rounded-sm border border-[#c9a24b]/20 bg-[#15130f]/45 p-2">
        <p className="text-[11px] tracking-widest text-[#c9a24b]/80 uppercase">Культи конечностей</p>
        <p className="text-[10px] text-[#e8dcc0]/55">Левая и правая стороны указаны со стороны зрителя.</p>
        <Segment
          label="Руки"
          value={body.armAmputationSide ?? 'none'}
          options={[['none', 'Все'], ['left', 'Нет левой'], ['right', 'Нет правой'], ['both', 'Нет обеих']]}
          onChange={(value) => onBody({ armAmputationSide: value as BodySel['armAmputationSide'] })}
        />
        {(body.armAmputationSide ?? 'none') !== 'none' && (
          <Segment
            label="Уровень рук"
            value={body.armAmputationLevel ?? 'hand'}
            options={[['hand', 'По кисть'], ['elbow', 'По локоть'], ['shoulder', 'По плечо']]}
            onChange={(value) => onBody({ armAmputationLevel: value as BodySel['armAmputationLevel'] })}
          />
        )}
        <Segment
          label="Ноги"
          value={body.legAmputationSide ?? 'none'}
          options={[['none', 'Все'], ['left', 'Нет левой'], ['right', 'Нет правой'], ['both', 'Нет обеих']]}
          onChange={(value) => onBody({ legAmputationSide: value as BodySel['legAmputationSide'] })}
        />
        {(body.legAmputationSide ?? 'none') !== 'none' && (
          <Segment
            label="Уровень ног"
            value={body.legAmputationLevel ?? 'foot'}
            options={[['foot', 'По стопу'], ['knee', 'По колено'], ['hip', 'По таз']]}
            onChange={(value) => onBody({ legAmputationLevel: value as BodySel['legAmputationLevel'] })}
          />
        )}
      </div>

      <fieldset className="space-y-1.5">
        <Slider label="Шея" note="толщина" value={body.neckWidth ?? 100} min={60} max={150} onChange={(value) => onBody({ neckWidth: value })} />
        <Slider label="Плечи" note="ширина" value={body.shoulders} min={70} max={140} onChange={(value) => onBody({ shoulders: value })} />
        <Slider label="Грудная клетка" note="ширина" value={body.chest} min={70} max={140} onChange={(value) => onBody({ chest: value })} />
        <Slider label={gender === 'f' ? 'Бюст: объем' : 'Грудные мышцы'} note="объем" value={body.bust ?? 100} min={gender === 'm' ? 100 : 50} max={gender === 'm' ? 300 : 180} onChange={(value) => onBody({ bust: value })} />
        <Slider
          label={gender === 'f' ? 'Бюст: расстояние' : 'Мышцы: разведение'}
          note="ближе ← → шире"
          value={body.bustSpacing ?? 0}
          min={-20}
          max={25}
          step={1}
          format={signed}
          onChange={(value) => onBody({ bustSpacing: value })}
        />
        <Slider
          label={gender === 'f' ? 'Бюст: высота' : 'Мышцы: высота'}
          note="− выше · + ниже"
          value={body.bustY ?? 0}
          min={-30}
          max={30}
          step={1}
          format={signed}
          onChange={(value) => onBody({ bustY: value })}
        />
        <Slider label="Живот" note="ширина" value={body.belly} min={70} max={140} onChange={(value) => onBody({ belly: value })} />
        <Slider label="Талия" note="высота" value={body.waistY ?? 0} min={-22} max={22} format={signed} onChange={(value) => onBody({ waistY: value })} />
        <Slider label="Бедра" note="ширина" value={body.hips} min={70} max={140} onChange={(value) => onBody({ hips: value })} />
        <Slider label="Ляжки" note="просвет" value={body.thighGap ?? 0} min={-30} max={30} format={signed} onChange={(value) => onBody({ thighGap: value })} />
        <Slider label="Ляжки" note="полнота" value={body.thighFullness ?? 100} min={70} max={150} onChange={(value) => onBody({ thighFullness: value })} />
        <Slider label="Мышцы" note="рельеф" value={body.muscle ?? 20} min={0} max={250} accent={skin} onChange={(value) => onBody({ muscle: value })} />
        {Object.entries(body.marks ?? {}).some(([id, value]) => isVitiligo(id) && value > 0) && <Palette label="Цвет пятен" colors={VITILIGO_COLORS} names={VITILIGO_COLOR_NAMES} value={body.vitiligoColor ?? VITILIGO_DEFAULT_COLOR} onChange={(value) => onBody({ vitiligoColor: value })} />}
        <ToggleList title="Особенности тела" entries={BODY_MARKS} values={body.marks ?? {}} onChange={(id, value) => onBody({ marks: { ...(body.marks ?? {}), [id]: value } })} />
        <ResetButton label="Сброс фигуры" onClick={() => onBody({ ...DEFAULT_BODY, muscle: gender === 'm' ? 180 : 20, bust: gender === 'm' ? 180 : 100, marks: {} })} />
      </fieldset>
    </div>
  );
}

function FaceOptionGrid({ faceList, gender, skin, hairColor, face, body, facePart, onSelect }: {
  faceList: typeof FACE_OPTIONS;
  gender: Gender;
  skin: string;
  hairColor: string;
  face: FaceSel;
  body: BodySel;
  facePart: FacePart;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="option-grid mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
      {faceList.map((option) => {
        const current = option.part === 'ears' ? face.ears ?? 'standard' : (face as unknown as Record<string, unknown>)[option.part];
        const selected = current === option.id;
        const preview = { ...face, [option.part]: option.id } as FaceSel;
        return (
          <button key={option.id} type="button" aria-pressed={selected} onClick={() => onSelect(option.id)} className={cn('option-button flex min-w-0 flex-col overflow-hidden rounded-sm border text-left transition', selected ? 'border-[#c9a24b] bg-[#f3ecdc] shadow-[0_0_0_2px_rgba(201,162,75,0.35)]' : 'border-white/10 bg-[#e9dfc8] hover:border-[#c9a24b]/60')}>
            <div className="option-preview flex h-24 items-center justify-center p-1 sm:h-32">
              {facePart === 'ears' ? <EarPreview skin={skin} style={option.id} face={face} /> : <FacePreview gender={gender} skin={skin} hairColor={hairColor} face={preview} pigmentation={body} uid={`face-preview-${option.part}-${option.id}`} />}
            </div>
            <OptionLabel selected={selected}>{option.name}</OptionLabel>
          </button>
        );
      })}
    </div>
  );
}

function ItemGrid({ items, selectedIds, gender, skin, hairColor, face, rig, onToggle, mirroredItems }: {
  items: Item[];
  selectedIds: string[];
  gender: Gender;
  skin: string;
  hairColor: string;
  face: FaceSel;
  rig: ReturnType<typeof getFigureGeometry>;
  onToggle: (item: Item) => void;
  mirroredItems: Record<string, boolean>;
}) {
  if (!items.length) return <p className="py-8 text-center text-sm text-[#e8dcc0]/55">В этом разделе пока нет подходящих предметов.</p>;
  const isHair = items[0].category === 'hair';
  const isDress = items[0].category === 'dress';
  const gridClass = isHair
    ? 'hair-option-grid'
    : isDress
      ? 'grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3'
      : 'grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4';
  return (
    <div className={cn('option-grid', gridClass)}>
      {items.map((item) => {
        const selected = selectedIds.includes(item.id);
        const [bx, by, bw, bh] = item.bbox;
        const left = item.mirrorable ? Math.min(bx, 300 - bx - bw) : bx;
        const right = item.mirrorable ? Math.max(bx + bw, 300 - bx) : bx + bw;
        const pad = Math.max(right - left, bh) * 0.1;
        const previewBox = item.category === 'headgear'
          ? hatPreviewViewBox(item.bbox, face)
          : `${left - pad} ${by - pad} ${right - left + pad * 2} ${bh + pad * 2}`;
        return (
          <button key={item.id} type="button" aria-pressed={selected} onClick={() => onToggle(item)} className={cn('option-button flex min-w-0 flex-col overflow-hidden rounded-sm border text-left transition', isHair && 'hair-option-card', selected ? 'border-[#c9a24b] bg-[#f3ecdc] shadow-[0_0_0_2px_rgba(201,162,75,0.35)]' : 'border-white/10 bg-[#e9dfc8] hover:border-[#c9a24b]/60')}>
            <div className={cn('option-preview relative flex items-center justify-center p-1.5', isHair ? 'h-36 sm:h-40' : isDress ? 'h-56 sm:h-64' : 'h-24 sm:h-32')} style={{ ['--hair' as string]: hairColor, ['--hairFront' as string]: String((face.hairFrontWidth ?? 100) / 100), ['--hairBack' as string]: String((face.hairBackWidth ?? 100) / 100), ['--hairFrontH' as string]: String((face.hairFrontHeight ?? 100) / 100), ['--hairBackH' as string]: String((face.hairBackHeight ?? 100) / 100), ['--ribbon' as string]: face.ribbonColor ?? RIBBON_COLORS[0] }}>
              <svg viewBox={previewBox} className="h-full w-full overflow-hidden" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
                <ItemArt item={item} gender={gender} rig={rig} face={face} mirrored={mirroredItems[item.id]} layer="back" />
                {isHair && <Head gender={gender} skin={skin} hairColor={hairColor} face={face} uid={`hair-preview-${item.id}`} />}
                <ItemArt item={item} gender={gender} rig={rig} face={face} mirrored={mirroredItems[item.id]} />
              </svg>
            </div>
            <OptionLabel selected={selected}>{item.name}</OptionLabel>
          </button>
        );
      })}
    </div>
  );
}

function GlassEyeControls({ face, onFace, left, right }: { face: FaceSel; onFace: (patch: Partial<FaceSel>) => void; left: boolean; right: boolean }) {
  return (
    <div className="space-y-2 border-b border-[#c9a24b]/20 pb-2">
      {left && (
        <IrisPicker
          side="left"
          title="Левый стеклянный"
          colors={GLASS_EYE_COLORS}
          value={face.glassIrisLeft ?? DEFAULT_GLASS_EYE_COLOR}
          customColor=""
          onChange={(c) => onFace({ glassIrisLeft: c })}
          onCustomChange={(c) => c && onFace({ glassIrisLeft: c })}
        />
      )}
      {right && (
        <IrisPicker
          side="right"
          title="Правый стеклянный"
          colors={GLASS_EYE_COLORS}
          value={face.glassIrisRight ?? DEFAULT_GLASS_EYE_COLOR}
          customColor=""
          onChange={(c) => onFace({ glassIrisRight: c })}
          onCustomChange={(c) => c && onFace({ glassIrisRight: c })}
        />
      )}
    </div>
  );
}

function PreviewIntensityGrid({ entries, values, defaultValue, previewFace, gender, skin, hairColor, body, uidPrefix, onToggle, onChange }: {
  entries: Array<{ id: string; name: string }>;
  values: Record<string, number>;
  defaultValue: number;
  previewFace: (id: string, value: number) => FaceSel;
  gender: Gender;
  skin: string;
  hairColor: string;
  body: BodySel;
  uidPrefix: string;
  onToggle: (id: string) => void;
  onChange: (id: string, value: number) => void;
}) {
  return (
    <div className="option-grid grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
      {entries.map((entry) => {
        const selected = Object.prototype.hasOwnProperty.call(values, entry.id);
        const intensity = values[entry.id] ?? defaultValue;
        return (
          <div key={entry.id} className={cn('flex min-w-0 flex-col overflow-hidden rounded-sm border transition', selected ? 'border-[#c9a24b] shadow-[0_0_0_2px_rgba(201,162,75,0.35)]' : 'border-white/10 hover:border-[#c9a24b]/60')}>
            <button type="button" onClick={() => onToggle(entry.id)} aria-pressed={selected} className={cn('option-button flex w-full flex-col text-left', selected ? 'bg-[#f3ecdc]' : 'bg-[#e9dfc8]')}>
              <div className="option-preview flex h-28 w-full items-center justify-center p-1.5 sm:h-32">
                <FacePreview gender={gender} skin={skin} hairColor={hairColor} face={previewFace(entry.id, selected ? intensity : defaultValue)} pigmentation={body} uid={`${uidPrefix}-preview-${entry.id}`} />
              </div>
              <OptionLabel selected={selected}>{entry.name}</OptionLabel>
            </button>
            {selected && (
              <label className="intensity-control block bg-[#1c1a17] px-2 pt-1 pb-1.5">
                <span className="flex items-center justify-between gap-1 text-[11px] text-[#e8dcc0]"><span>Непрозрачность</span><output className="tabular-nums text-[#e6c884]">{intensity}%</output></span>
                <input type="range" min={5} max={100} step={5} value={intensity} onChange={(event) => onChange(entry.id, Number(event.target.value))} aria-label={`${entry.name}: непрозрачность`} className="w-full accent-[#d4b56f]" />
              </label>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ToggleList({ title, entries, values, onChange }: { title: string; entries: Array<{ id: string; name: string }>; values: Record<string, number>; onChange: (id: string, value: number) => void }) {
  return (
    <section className="pt-2">
      <p className="mb-1 text-[11px] tracking-widest text-[#c9a24b]/80 uppercase">{title}</p>
      <div className="space-y-0.5">
        {entries.map((entry) => {
          const value = values[entry.id] ?? 0;
          const selected = value > 0;
          return (
            <div key={entry.id} className="flex min-h-9 items-center gap-2">
              <button type="button" aria-pressed={selected} onClick={() => onChange(entry.id, selected ? 0 : 70)} className={cn('w-[7rem] shrink-0 rounded-sm border px-1.5 py-1 text-left text-[11px] leading-tight transition', selected ? 'border-[#c9a24b] bg-[#c9a24b] text-[#1c1a17]' : 'border-white/15 text-[#e8dcc0]/80 hover:border-[#c9a24b]/60')}>
                {entry.name}
              </button>
              <input type="range" min={5} max={100} step={5} disabled={!selected} value={value || 70} aria-label={`${entry.name}: прозрачность`} onChange={(event) => onChange(entry.id, Number(event.target.value))} className="intensity-control min-w-0 flex-1" />
              <output className="w-9 text-right text-[11px] text-[#e6c884]">{selected ? `${value}%` : ''}</output>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Palette({ label, note, colors, names, value, onChange }: { label: string; note?: string; colors: string[]; names?: string[]; value: string; onChange: (color: string) => void }) {
  return (
    <div className="flex min-h-10 items-center gap-1.5" title={note}>
      <span className="w-[6.6rem] shrink-0 text-[11px] tracking-widest text-[#c9a24b]/80 uppercase">{label}</span>
      <div className="flex min-w-0 flex-1 flex-wrap gap-0.5">
        {colors.map((color, index) => (
          <button key={color} type="button" title={names?.[index] ?? `${label}: оттенок ${index + 1}`} aria-label={names?.[index] ?? `${label}: оттенок ${index + 1}`} aria-pressed={value === color} onClick={() => onChange(color)} className="flex h-8 w-8 items-center justify-center rounded-full">
            <span className={cn('h-5 w-5 rounded-full border-2 transition-transform', value === color ? 'scale-110 border-[#e6c884] ring-1 ring-[#c9a24b]/40 ring-offset-1 ring-offset-[#23201b]' : 'border-white/25')} style={{ background: color }} />
          </button>
        ))}
      </div>
    </div>
  );
}

function Slider({ label, note, value, min, max, step = 1, format, disabled = false, accent, onChange }: { label: string; note?: string; value: number; min: number; max: number; step?: number; format?: (value: number) => string; disabled?: boolean; accent?: string; onChange: (value: number) => void }) {
  return (
    <label className={cn('intensity-control flex min-h-9 items-center gap-2', disabled && 'opacity-40')}>
      <span className="w-[6.6rem] shrink-0 text-[11px] leading-tight text-[#e8dcc0]/90">{label}{note && <small className="block text-[#e8dcc0]/50">{note}</small>}</span>
      <input type="range" min={min} max={max} step={step} value={value} disabled={disabled} onChange={(event) => onChange(Number(event.target.value))} className="min-w-0 flex-1 accent-[#d4b56f]" style={accent ? { accentColor: accent } : undefined} />
      <output className="w-10 shrink-0 text-right text-[11px] tabular-nums text-[#e6c884]">{format ? format(value) : `${value}%`}</output>
    </label>
  );
}

function Segment({ label, value, options, onChange }: { label: string; value: string; options: Array<[string, string]>; onChange: (value: string) => void }) {
  return (
    <div className="flex items-start gap-1.5 py-1">
      <span className="w-[6.6rem] shrink-0 pt-1 text-[11px] leading-tight text-[#e8dcc0]/90">{label}</span>
      <div className="flex flex-1 flex-wrap gap-1" role="radiogroup" aria-label={label}>
        {options.map(([id, text]) => <button key={id} type="button" role="radio" aria-checked={value === id} onClick={() => onChange(id)} className={cn('rounded-sm border px-2 py-0.5 text-[11px] transition', value === id ? 'border-[#c9a24b] bg-[#c9a24b] text-[#1c1a17]' : 'border-white/15 text-[#e8dcc0]/75 hover:border-[#c9a24b]/60')}>{text}</button>)}
      </div>
    </div>
  );
}

function ColorSync({ label, synced, onToggle }: { label: string; synced: boolean; onToggle: () => void }) {
  return <div className="flex items-center justify-between gap-2"><span className="text-[11px] text-[#e8dcc0]/80">{label} с цветом волос</span><button type="button" role="switch" aria-checked={synced} onClick={onToggle} className={cn('rounded-sm border px-2 py-1 text-[11px]', synced ? 'border-[#c9a24b] bg-[#c9a24b] text-[#1c1a17]' : 'border-white/20 text-[#e8dcc0]/70')}>{synced ? 'Вкл.' : 'Выкл.'}</button></div>;
}

function MirrorSwitch({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) {
  return (
    <div className="flex min-h-9 items-center justify-between gap-3">
      <span className="min-w-0 text-xs text-[#e8dcc0]/85">{label}</span>
      <button
        type="button"
        role="switch"
        aria-label={label}
        aria-checked={checked}
        onClick={onToggle}
        className={cn(
          'min-h-9 min-w-16 shrink-0 rounded-sm border px-2.5 py-1 text-xs transition-colors',
          checked ? 'border-[#c9a24b] bg-[#c9a24b] text-[#1c1a17]' : 'border-white/20 text-[#e8dcc0]/75 hover:border-[#c9a24b]/60',
        )}
      >
        {checked ? 'Вкл.' : 'Выкл.'}
      </button>
    </div>
  );
}

function OptionLabel({ selected, children }: { selected: boolean; children: React.ReactNode }) {
  return <span className={cn('item-caption flex min-h-11 w-full flex-1 items-center justify-center px-1.5 py-1.5 text-center text-xs leading-snug break-words sm:min-h-12', selected ? 'bg-[#c9a24b] text-[#1c1a17]' : 'bg-[#1c1a17] text-[#f3ecdc]')}>{children}</span>;
}

function ResetButton({ label, onClick }: { label: string; onClick: () => void }) {
  return <div className="pt-1 text-right"><button type="button" onClick={onClick} className="text-[11px] text-[#e8dcc0]/60 underline decoration-[#c9a24b]/35 underline-offset-4 hover:text-[#e6c884]">{label}</button></div>;
}

const signed = (value: number) => value === 0 ? '0' : `${value > 0 ? '+' : ''}${value}`;
