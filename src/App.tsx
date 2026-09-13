import { useCallback, useMemo, useState } from 'react';
import { DEFAULT_FACE, FACE_OPTIONS } from './components/Face';
import { Stage } from './components/Stage';
import { Wardrobe } from './components/Wardrobe';
import { ITEMS, itemById } from './data/items';
import { SKIN_EFFECTS } from './data/skinEffects';
import {
  BODY_MARKS,
  CATEGORIES,
  DEFAULT_BODY,
  HAIR_COLORS,
  IRIS_COLORS,
  POSES,
  SKINS,
  isVitiligo,
  type BodySel,
  type Category,
  type FacePart,
  type FaceSel,
  type Gender,
  type Item,
  type Pos,
  type PoseId,
} from './data/types';
import { cn } from './utils/cn';

const DEFAULT_F: string[] = ['hair-waves', 'und-slip', 'top-bowblouse', 'bot-aline', 'shoe-maryjane', 'acc-pearls'];
const DEFAULT_M: string[] = ['hair-part', 'und-tank', 'top-waistcoat', 'bot-wool', 'shoe-oxford', 'acc-watch'];

/** верхняя одежда из раздела «Платья», которую носят поверх брюк/юбки: шинель и резиновые плащи */
const OUTERWEAR_OVER_BOTTOM = new Set(['top-overcoat', 'top-rubber-cape', 'top-rubber-cape-m']);

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function omit(p: Record<string, Pos>, id: string): Record<string, Pos> {
  if (!(id in p)) return p;
  const rest = { ...p };
  delete rest[id];
  return rest;
}

function randomFace(g: Gender): FaceSel {
  const part = (p: Exclude<FacePart, 'bones' | 'moles'>) => {
    const list = FACE_OPTIONS.filter((o) => o.part === p && (o.fit === 'both' || o.fit === g));
    return pick(list).id;
  };
  const iris = pick(IRIS_COLORS).color;
  return {
    shape: part('shape'),
    ears: part('ears'),
    eyes: part('eyes'),
    brows: part('brows'),
    nose: part('nose'),
    lips: part('lips'),
    wrinkles: part('wrinkles'),
    wrinkleIntensity: 65,
    makeup: part('makeup'),
    makeupIntensity: 80,
    facialHair: g === 'm' ? part('facialHair') : 'clean',
    facialHairIntensity: 65 + Math.round(Math.random() * 30),
    facialHairWidth: 90 + Math.round(Math.random() * 25),
    facialHairY: Math.round((Math.random() - 0.5) * 4 * 2) / 2,
    iris,
    eyeY: Math.round((Math.random() - 0.35) * 6) / 2,
    lashDensity: Math.random() < 0.3 ? 40 : 85 + Math.round(Math.random() * 80),
    eyeWidth: 72 + Math.round(Math.random() * 24),
    eyeHeight: 72 + Math.round(Math.random() * 24),
    irisSize: 78 + Math.round(Math.random() * 14),
    eyeSpacing: Math.round((Math.random() - 0.5) * 6),
    eyeTilt: Math.round((Math.random() - 0.5) * 6),
    lipWidth: 88 + Math.round(Math.random() * 28),
    lipFullness: 85 + Math.round(Math.random() * 45),
    upperFullness: 80 + Math.round(Math.random() * 55),
    lowerFullness: 80 + Math.round(Math.random() * 55),
    browCurve: Math.round((Math.random() - 0.5) * 26),
    browHeight: Math.round((Math.random() - 0.7) * 3),
    browThickness: 78 + Math.round(Math.random() * 60),
    skinEffects: Object.fromEntries(
      SKIN_EFFECTS.filter(() => Math.random() < 0.4).map((e) => [e.id, 35 + Math.round(Math.random() * 45)]),
    ),
    effectSpread: 88 + Math.round(Math.random() * 26),
    hairFrontWidth: 92 + Math.round(Math.random() * 18),
    hairBackWidth: 92 + Math.round(Math.random() * 18),
    ...(Math.random() < 0.09 ? { irisRight: pick(IRIS_COLORS).color } : {}),
  };
}

export default function App() {
  const [gender, setGender] = useState<Gender>('f');
  const [pose, setPose] = useState<PoseId>('standard');
  const [skin, setSkin] = useState(SKINS[1]);
  const [hairColor, setHairColor] = useState(HAIR_COLORS[2]);
  const [category, setCategory] = useState<Category>('top');
  const [facePart, setFacePart] = useState<FacePart>('shape');
  const [face, setFace] = useState<Record<Gender, FaceSel>>({ f: DEFAULT_FACE.f, m: DEFAULT_FACE.m });
  const [bodySel, setBodySel] = useState<Record<Gender, BodySel>>({ f: { ...DEFAULT_BODY }, m: { ...DEFAULT_BODY, bust: 180 } });
  const [selected, setSelected] = useState<Record<Gender, string[]>>({ f: DEFAULT_F, m: DEFAULT_M });
  const [positions, setPositions] = useState<Record<string, Pos>>({});
  const [itemMirrors, setItemMirrors] = useState<Record<Gender, Record<string, boolean>>>({ f: {}, m: {} });
  const [help, setHelp] = useState(true);
  const [zoomFace, setZoomFace] = useState(false);
  const [inspectFigure, setInspectFigure] = useState(false);
  const [viewMode, setViewMode] = useState<'figure' | 'split' | 'panel'>('split');
  const [tuckShoes, setTuckShoes] = useState(false); // тоггл заправки брюк в обувь
  const [tuckTop, setTuckTop] = useState(true); // тоггл: верх заправлен в низ или выпущен поверх

  const selectedIds = selected[gender];
  const placed = useMemo(() => selectedIds.map(itemById).filter((i): i is Item => Boolean(i)), [selectedIds]);
  const hideClothes = inspectFigure && (category === 'body' || category === 'face' || category === 'hair');
  const stageItems = useMemo(() => {
    const list = hideClothes ? placed.filter((item) => item.category === 'hair') : placed;
    return list.map((item) => {
      if (item.category === 'shoes') {
        // Если заправлено: z=52 (над штанами z=30 и формой z=45). Если навыпуск: z=25 (под штанами)
        return { ...item, z: tuckShoes ? 52 : 25 };
      }
      if (item.category === 'top') {
        // Выпущенный верх (z=33) лежит поверх низа (z=30), но под верхней одеждой (z≥40).
        // Заправленный верх (z=24) прячется под низ.
        return { ...item, z: tuckTop ? 24 : 33 };
      }
      return item;
    });
  }, [placed, hideClothes, tuckShoes, tuckTop]);
  const focusFace = zoomFace;

  const patchFace = useCallback((p: Partial<FaceSel>) => {
    setFace((prev) => ({ ...prev, [gender]: { ...prev[gender], ...p } }));
  }, [gender]);

  const patchBody = useCallback((p: Partial<BodySel>) => {
    setBodySel((prev) => ({ ...prev, [gender]: { ...prev[gender], ...p } }));
  }, [gender]);

  const selectCategory = useCallback((c: Category) => {
    setCategory(c);
    setZoomFace(c === 'face' || c === 'hair');
  }, []);

  const toggle = useCallback((item: Item) => {
    const cat = CATEGORIES.find((c) => c.id === item.category)!;
    setSelected((prev) => {
      const cur = prev[gender];
      if (cur.includes(item.id)) return { ...prev, [gender]: cur.filter((id) => id !== item.id) };
      // взаимоисключение: платье заменяет верх и низ, верх/низ/униформа снимают платье
      // исключение: шинель и резиновые плащи носятся поверх штанов
      const conflicts = new Set<string>();
      if (item.category === 'dress') {
        conflicts.add('top');
        if (!OUTERWEAR_OVER_BOTTOM.has(item.id)) conflicts.add('bottom');
        conflicts.add('uniform');
      } else if (item.category === 'top' || item.category === 'bottom' || item.category === 'uniform') {
        conflicts.add('dress');
      }
      const next = cat.multi
        ? cur
        : cur.filter((id) => {
            const c = itemById(id)?.category;
            if (c === item.category) return false;
            if (c && conflicts.has(c)) {
              if (item.category === 'bottom' && OUTERWEAR_OVER_BOTTOM.has(id)) return true;
              return false;
            }
            return true;
          });
      return { ...prev, [gender]: [...next, item.id] };
    });
    setPositions((p) => omit(p, item.id));
  }, [gender]);

  const onMove = useCallback((id: string, pos: Pos) => {
    setPositions((p) => ({ ...p, [id]: pos }));
  }, []);

  const resetOne = useCallback((id: string) => {
    setPositions((p) => omit(p, id));
  }, []);

  const toggleItemMirror = useCallback((id: string) => {
    if (!itemById(id)?.mirrorable) return;
    setItemMirrors((prev) => {
      const next = { ...prev[gender] };
      if (next[id]) delete next[id];
      else next[id] = true;
      return { ...prev, [gender]: next };
    });
  }, [gender]);

  const randomize = () => {
    const pool = ITEMS.filter((i) => i.fit === 'both' || i.fit === gender);
    const military = Math.random() < 0.45 && pool.some((i) => i.category === 'uniform');
    // Платье полностью заменяет верх и низ (у дамы — часто, у мужчины — редкая верхняя одежда)
    // исключение: под шинель штаны надеваются
    const dressList = pool.filter((i) => i.category === 'dress');
    const withDress = !military && dressList.length > 0 && Math.random() < (gender === 'f' ? 0.45 : 0.25);
    const chosenDress = withDress ? pick(dressList).id : null;
    const overcoatDress = chosenDress !== null && OUTERWEAR_OVER_BOTTOM.has(chosenDress);
    const ids: string[] = [];
    for (const c of CATEGORIES) {
      if (c.id === 'face' || c.id === 'body') continue;
      // военный комплект: мундир вместо гражданской одежды; гражданский — без наград
      if (military && (c.id === 'top' || c.id === 'bottom' || c.id === 'dress' || c.id === 'shoes' || c.id === 'underwear')) continue;
      if (!military && (c.id === 'uniform' || c.id === 'decor')) continue;
      // платье заменяет верх и низ
      if (withDress && c.id === 'top') continue;
      if (withDress && c.id === 'bottom' && !overcoatDress) continue;
      if (c.id === 'dress') {
        if (chosenDress) ids.push(chosenDress);
        continue;
      }
      const list = pool.filter((i) => i.category === c.id);
      if (!list.length) continue;
      if (c.multi) {
        const n = c.id === 'decor' ? 1 + Math.floor(Math.random() * 3) : Math.random() < 0.75 ? 1 + Math.floor(Math.random() * 2) : 0;
        if (n > 0) {
          ids.push(
            ...[...list]
              .sort(() => Math.random() - 0.5)
              .slice(0, n)
              .map((i) => i.id),
          );
        }
      } else if (c.id === 'headgear' && !military && Math.random() < 0.4) {
        continue; // гражданские часто без шляпы
      } else {
        ids.push(pick(list).id);
      }
    }

    setSelected((prev) => ({ ...prev, [gender]: ids }));
    setItemMirrors((prev) => ({ ...prev, [gender]: {} }));
    setFace((prev) => ({ ...prev, [gender]: randomFace(gender) }));
    setBodySel((prev) => ({
      ...prev,
      [gender]: {
        ...DEFAULT_BODY,
        shoulders: 90 + Math.round(Math.random() * 25),
        hips: 88 + Math.round(Math.random() * 28),
        chest: 90 + Math.round(Math.random() * 20),
        belly: 90 + Math.round(Math.random() * 20),
        waistY: Math.round(Math.random() * 16) - 8,
        thighGap: Math.round((Math.random() - 0.5) * 20),
        thighFullness: 88 + Math.round(Math.random() * 34),
        muscle: gender === 'm' ? 140 + Math.round(Math.random() * 60) : 5 + Math.round(Math.random() * 70),
        bust: 80 + Math.round(Math.random() * 55),
        marks: Object.fromEntries(
          BODY_MARKS.filter((m) => !isVitiligo(m.id)).filter(() => Math.random() < 0.22).map((m) => [m.id, 40 + Math.round(Math.random() * 50)]),
        ),
      },
    }));
    setPositions({});
    setHairColor(pick(HAIR_COLORS));
    setSkin(pick(SKINS));
  };

  const undressClothes = useCallback(() => {
    setSelected((prev) => ({
      ...prev,
      [gender]: prev[gender].filter((id) => {
        const it = itemById(id);
        return it?.category === 'hair';
      }),
    }));
    setPositions({});
    setItemMirrors((prev) => ({ ...prev, [gender]: {} }));
  }, [gender]);



  return (
    <div
      className="flex h-dvh max-h-dvh flex-col overflow-hidden bg-[#1c1a17] text-[#f3ecdc]"
      style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <header className="shrink-0 border-b border-[#c9a24b]/30 bg-[#15130f]">
        <div className="studio-header mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-1.5 sm:px-4 sm:py-2.5">
          <div className="hidden min-w-0 sm:block">
            <h1
              className="truncate text-lg leading-none tracking-wide text-[#c9a24b] sm:text-3xl"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Ателье «Линден»
            </h1>
            <p className="mt-0.5 hidden text-[10px] tracking-[0.25em] text-[#e8dcc0]/60 uppercase sm:block">
              Берлин · мода 1930–40-х годов
            </p>
          </div>

          <div className="studio-controls flex min-w-0 items-center gap-1.5 overflow-x-auto [scrollbar-width:none] lg:gap-2">
            <button
              onClick={() => setZoomFace((z) => !z)}
              aria-label={focusFace ? 'Показать фигуру целиком' : 'Приблизить лицо'}
              className={cn(
                'rounded-sm border px-2 py-1 text-[11px] tracking-widest uppercase sm:px-3',
                focusFace ? 'border-[#c9a24b] bg-[#c9a24b] text-[#1c1a17]' : 'border-[#c9a24b]/50 text-[#c9a24b]',
              )}
            >
              {focusFace ? 'Фигура' : 'Лицо'}
            </button>
            <select
              value={pose}
              onChange={(e) => setPose(e.target.value as PoseId)}
              className="min-w-0 max-w-48 rounded-sm border border-[#c9a24b]/50 bg-[#15130f] px-2 py-1 text-[11px] tracking-wide text-[#e8dcc0] transition focus:border-[#c9a24b] focus:outline-none sm:text-xs"
              title="Вариант позы фигуры"
              aria-label="Поза фигуры"
            >
              {POSES.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#1c1a17]">
                  Поза: {p.name}
                </option>
              ))}
            </select>

            <div className="flex rounded-sm border border-[#c9a24b]/50 p-0.5">
              {(['f', 'm'] as Gender[]).map((g) => (
                <button
                  key={g}
                  onClick={() => {
                    setGender(g);
                    if (g === 'f' && facePart === 'facialHair') setFacePart('shape');
                    setPositions({});
                  }}
                  className={cn(
                    'px-2.5 py-1 text-[12px] tracking-widest uppercase transition sm:px-4 sm:py-1.5 sm:text-sm',
                    gender === g ? 'bg-[#c9a24b] text-[#1c1a17]' : 'text-[#e8dcc0]/80',
                  )}
                >
                  {g === 'f' ? 'Дама' : 'Господин'}
                </button>
              ))}
            </div>

            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as 'figure' | 'split' | 'panel')}
              className="min-w-0 max-w-44 shrink-0 rounded-sm border border-[#c9a24b]/50 bg-[#15130f] px-2 py-1 text-[11px] tracking-wide text-[#e8dcc0] transition focus:border-[#c9a24b] focus:outline-none sm:text-xs"
              title="Что показывать на экране"
              aria-label="Режим обзора"
            >
              <option value="figure" className="bg-[#1c1a17]">Обзор: персонаж</option>
              <option value="split" className="bg-[#1c1a17]">Обзор: вместе</option>
              <option value="panel" className="bg-[#1c1a17]">Обзор: параметры</option>
            </select>

            <div className="flex shrink-0 items-center gap-1.5 lg:hidden">
              <ActionBtn onClick={randomize}>Случ.</ActionBtn>
              <ActionBtn onClick={() => setPositions({})}>Место</ActionBtn>
              {(category === 'body' || category === 'face' || category === 'hair') ? (
                <ActionBtn pressed={inspectFigure} onClick={() => setInspectFigure((value) => !value)}>
                  {inspectFigure ? 'Одежда' : 'Без одежды'}
                </ActionBtn>
              ) : (
                <ActionBtn onClick={undressClothes} danger>
                  Раздеть
                </ActionBtn>
              )}
            </div>
          </div>
        </div>
      </header>

      <main
        className={cn(
          'app-main mx-auto flex min-h-0 min-w-0 w-full max-w-7xl flex-1 flex-col lg:items-stretch lg:gap-5 lg:px-4 lg:py-4',
          viewMode === 'split' && 'lg:grid lg:grid-cols-[minmax(280px,400px)_1fr]',
        )}
      >
        <section
          className={cn(
            'stage-section flex min-h-0 min-w-0 flex-col px-2 pt-2 lg:px-0 lg:pt-0',
            viewMode === 'panel' && 'hidden',
            viewMode === 'figure' ? 'flex-1 lg:flex-1' : 'flex-1 lg:flex-none lg:shrink-0',
          )}
        >
          <div
            className="stage-shell relative flex items-center justify-center overflow-hidden rounded-sm border-[4px] border-[#3a2c1a] bg-[#2a2016] shadow-[0_12px_40px_rgba(0,0,0,0.55)] sm:border-[6px]"
            style={{ ['--frame-ratio' as string]: focusFace ? (category === 'hair' ? 136 / 184 : 128 / 148) : 300 / 620 }}
          >
            <div className="pointer-events-none absolute inset-0 rounded-sm border border-[#c9a24b]/50" />
            <div className="stage-frame">
              <Stage
                key={`${focusFace ? category === 'hair' ? 'hair' : 'face' : 'full'}-${gender}-${pose}`}
                gender={gender}
                skin={skin}
                hairColor={hairColor}
                face={face[gender]}
                body={bodySel[gender]}
                pose={pose}
                items={stageItems}
                positions={positions}
                mirroredItems={itemMirrors[gender]}
                onMove={onMove}
                onResetOne={resetOne}
                focusFace={focusFace}
                focusHair={category === 'hair'}
              />
            </div>
          </div>

          {help && (
            <p className="mobile-hint mt-1.5 px-1 text-center text-[11px] leading-snug text-[#e8dcc0]/70 sm:text-sm">
              Перетаскивайте вещи пальцем.{' '}
              <span className="text-[#c9a24b]">Двойной тап</span>: на место.{' '}
              <button onClick={() => setHelp(false)} className="text-[#c9a24b] underline">
                скрыть
              </button>
            </p>
          )}

          <div className="mt-1.5 hidden grid-cols-3 gap-1.5 pb-2 sm:gap-2 lg:grid">
            <ActionBtn onClick={randomize}>Случайно</ActionBtn>
            <ActionBtn onClick={() => setPositions({})}>На место</ActionBtn>
            {(category === 'body' || category === 'face' || category === 'hair') ? (
              <ActionBtn pressed={inspectFigure} onClick={() => setInspectFigure((value) => !value)}>
                {inspectFigure ? 'Одежда' : 'Без одежды'}
              </ActionBtn>
            ) : (
              <ActionBtn onClick={undressClothes} danger>
                Раздеть
              </ActionBtn>
            )}
          </div>
        </section>

        <section
          className={cn(
            'min-h-0 min-w-0 flex-1 overflow-hidden border-t border-[#c9a24b]/20 bg-[#23201b] px-2 py-2 lg:rounded-sm lg:border lg:border-[#c9a24b]/25 lg:px-3 lg:py-3',
            viewMode === 'figure' && 'hidden',
          )}
        >
          <Wardrobe
            gender={gender}
            category={category}
            onCategory={selectCategory}
            items={ITEMS}
            selectedIds={selectedIds}
            onToggle={toggle}
            mirroredItems={itemMirrors[gender]}
            onToggleMirror={toggleItemMirror}
            hairColor={hairColor}
            onHairColor={setHairColor}
            hairColors={HAIR_COLORS}
            skin={skin}
            onSkin={setSkin}
            skins={SKINS}
            face={face[gender]}
            onFace={patchFace}
            facePart={facePart}
            onFacePart={setFacePart}
            body={bodySel[gender]}
            onBody={patchBody}
            pose={pose}
            tuckShoes={tuckShoes}
            onToggleTuckShoes={() => setTuckShoes((prev) => !prev)}
            tuckTop={tuckTop}
            onToggleTuckTop={() => setTuckTop((prev) => !prev)}
          />
        </section>
      </main>
    </div>
  );
}

function ActionBtn({ children, onClick, danger, pressed }: { children: React.ReactNode; onClick: () => void; danger?: boolean; pressed?: boolean }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={pressed}
      className={cn(
        'min-h-9 rounded-sm border px-1 py-1.5 text-[11px] tracking-widest uppercase transition sm:px-2 sm:py-2 sm:text-xs',
        danger
          ? 'border-[#8b2635]/60 text-[#e8a0a8] active:bg-[#8b2635]/30'
          : 'border-[#c9a24b]/50 text-[#c9a24b] active:bg-[#c9a24b] active:text-[#1c1a17]',
      )}
    >
      {children}
    </button>
  );
}
