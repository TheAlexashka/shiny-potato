import type { ReactNode } from 'react';

export interface SkinEffect {
  id: string;
  name: string;
  /** вклад в морфологию (полнота щёк): −100 худоба … +100 полнота */
  volume?: number;
  /** рисуется поверх кожи, внутри контура лица */
  art: (p: { skin: string; spread: number; soft: string }) => ReactNode;
}

/** координаты щеки с учётом «ближе / дальше» */
const cheek = (side: number, dx: number, spread: number) => 150 + side * dx * spread;

export const SKIN_EFFECTS: SkinEffect[] = [
  {
    id: 'cheekbone',
    name: 'Скулы (свет и тень)',
    art: ({ spread, soft }) => (
      <g filter={soft}>
        {[-1, 1].map((side) => (
          <g key={side}>
            <ellipse cx={cheek(side, 21, spread)} cy={84.5} rx={11} ry={4.4} transform={`rotate(${side * -9} ${cheek(side, 21, spread)} 84.5)`} fill="#ffdda8" opacity={0.5} />
            <ellipse cx={cheek(side, 23, spread)} cy={93} rx={11.5} ry={7.5} transform={`rotate(${side * 11} ${cheek(side, 23, spread)} 93)`} fill="#4c2a19" opacity={0.34} />
          </g>
        ))}
      </g>
    ),
  },
  {
    id: 'hollow',
    name: 'Худоба (впалые щёки)',
    volume: -55,
    art: ({ spread, soft }) => (
      <g filter={soft}>
        {[-1, 1].map((side) => (
          <ellipse key={side} cx={cheek(side, 24, spread)} cy={99} rx={9.5} ry={11.5} transform={`rotate(${side * 8} ${cheek(side, 24, spread)} 99)`} fill="#4a281a" opacity={0.42} />
        ))}
      </g>
    ),
  },
  {
    id: 'plump',
    name: 'Полнота щёк',
    volume: 52,
    art: ({ spread, soft }) => (
      <g filter={soft}>
        {[-1, 1].map((side) => (
          <g key={side}>
            <ellipse cx={cheek(side, 21, spread)} cy={93} rx={12.5} ry={10} fill="#fff0d8" opacity={0.36} />
            <ellipse cx={cheek(side, 19, spread)} cy={88} rx={7} ry={4} fill="#ffd9b0" opacity={0.3} />
          </g>
        ))}
      </g>
    ),
  },
  {
    id: 'fullface',
    name: 'Полное лицо',
    volume: 82,
    art: ({ soft }) => (
      <g filter={soft}>
        {[-1, 1].map((side) => (
          <ellipse key={side} cx={150 + side * 23} cy={95} rx={15} ry={14} fill="#ffe9cc" opacity={0.3} />
        ))}
        <ellipse cx={150} cy={113} rx={11} ry={8} fill="#ffe4c0" opacity={0.24} />
      </g>
    ),
  },
  {
    id: 'dimples',
    name: 'Ямочки на щеках',
    art: ({ spread, soft }) => (
      <g filter={soft}>
        {[-1, 1].map((side) => (
          <ellipse key={side} cx={cheek(side, 25, spread)} cy={99} rx={2.4} ry={3.6} transform={`rotate(${side * 16} ${cheek(side, 25, spread)} 99)`} fill="#6b3c27" opacity={0.55} />
        ))}
      </g>
    ),
  },
  {
    id: 'chinDimple',
    name: 'Ямочка на подбородке',
    art: ({ soft }) => (
      <g filter={soft}>
        <ellipse cx={150} cy={118} rx={3} ry={2.2} fill="#6b3c27" opacity={0.45} />
      </g>
    ),
  },
  {
    id: 'freckles',
    name: 'Веснушки',
    art: ({ spread }) => (
      <g>
        {[-1, 1].map((side) => (
          <g key={side} opacity={0.85}>
            {[
              [16, 88], [20, 85], [24, 89], [18, 93], [23, 95], [27, 92],
              [14, 84], [21, 99], [26, 84], [17, 97],
            ].map(([dx, dy], i) => (
              <circle key={i} cx={cheek(side, dx, spread)} cy={dy} r={0.42 + (i % 3) * 0.11} fill="#8a5734" opacity={0.35 + (i % 4) * 0.12} />
            ))}
          </g>
        ))}
        {[-4, -2, 0, 2, 4].map((dx, i) => (
          <circle key={'n' + i} cx={150 + dx} cy={91.5} r={0.4 + (i % 2) * 0.1} fill="#8a5734" opacity={0.4} />
        ))}
      </g>
    ),
  },
  {
    id: 'underEye',
    name: 'Тени под глазами',
    art: ({ soft }) => (
      <g filter={soft}>
        {[-1, 1].map((side) => (
          <ellipse key={side} cx={150 + side * 15.6} cy={82.5} rx={9} ry={3.4} fill="#5b4a55" opacity={0.4} />
        ))}
      </g>
    ),
  },
  {
    id: 'cheekCrease',
    name: 'Складка на щеке',
    art: ({ spread }) => (
      <g fill="none" strokeLinecap="round">
        {[-1, 1].map((side) => (
          <path key={side} d={`M${cheek(side, 13, spread)} 96 Q${cheek(side, 20, spread)} 101 ${cheek(side, 17, spread)} 108`} stroke="#7a4a30" strokeWidth={0.75} opacity={0.42} />
        ))}
      </g>
    ),
  },
  {
    id: 'smileLines',
    name: 'Лучики у глаз',
    art: ({ spread }) => (
      <g fill="none" strokeLinecap="round">
        {[-1, 1].map((side) => (
          <g key={side} stroke="#8a5a3d" strokeWidth={0.5} opacity={0.4}>
            <path d={`M${cheek(side, 30, spread)} 72 q2.6 -1.4 4.6 -3.4`} />
            <path d={`M${cheek(side, 31, spread)} 76 q3 -0.4 5.4 -1.8`} />
            <path d={`M${cheek(side, 30, spread)} 80 q2.8 0.8 5.2 0.4`} />
          </g>
        ))}
      </g>
    ),
  },
  {
    id: 'sunburn',
    name: 'Загар и обветренность',
    art: () => (
      <g>
        <ellipse cx={150} cy={92} rx={38} ry={30} fill="#c07a3c" opacity={0.16} />
        {Array.from({ length: 60 }, (_, i) => {
          const a = i * 2.399;
          const r = 6 + (i % 9) * 3.4;
          return <circle key={i} cx={150 + Math.cos(a) * r * 1.25} cy={92 + Math.sin(a) * r} r={0.34} fill="#8a5526" opacity={0.22} />;
        })}
      </g>
    ),
  },
  {
    id: 'temples',
    name: 'Запавшие виски',
    volume: -22,
    art: ({ soft }) => (
      <g filter={soft}>
        {[-1, 1].map((side) => (
          <ellipse key={side} cx={150 + side * 30} cy={80} rx={6.5} ry={11} fill="#5a3220" opacity={0.34} />
        ))}
      </g>
    ),
  },
  {
    id: 'fatigue',
    name: 'Усталость: тени и круги',
    art: ({ soft }) => (
      <g filter={soft}>
        {/* глубокая тень в глазных впадинах */}
        {[-1, 1].map((side) => (
          <g key={side}>
            <ellipse cx={150 + side * 15.6} cy={72.5} rx={11.5} ry={6.4} fill="#4a2a1e" opacity={0.4} />
            <ellipse cx={150 + side * 15.6} cy={84} rx={9.4} ry={4.2} fill="#4d3a44" opacity={0.46} />
            <ellipse cx={150 + side * 15.6} cy={86.4} rx={7} ry={2.6} fill="#6a4a4a" opacity={0.32} />
          </g>
        ))}
        {/* лёгкая землистость по щекам и переносице */}
        <ellipse cx={150} cy={86} rx={6} ry={16} fill="#6b4a36" opacity={0.2} />
        {[-1, 1].map((side) => (
          <ellipse key={`c${side}`} cx={150 + side * 24} cy={98} rx={10} ry={12} fill="#5e3a28" opacity={0.22} />
        ))}
      </g>
    ),
  },
  {
    id: 'sunkenEyes',
    name: 'Запавшие глаза',
    volume: -14,
    art: ({ soft }) => (
      <g filter={soft}>
        {[-1, 1].map((side) => (
          <g key={side}>
            <ellipse cx={150 + side * 15.6} cy={70.5} rx={10.6} ry={5.6} fill="#53301f" opacity={0.44} />
            <path
              d={`M${150 + side * 26} 72 Q${150 + side * 15.6} 66 ${150 + side * 5} 72`}
              fill="none"
              stroke="#7a5038"
              strokeWidth={1.1}
              opacity={0.4}
              strokeLinecap="round"
            />
          </g>
        ))}
      </g>
    ),
  },
];

export const skinEffectById = (id: string) => SKIN_EFFECTS.find((e) => e.id === id);

/** суммарная полнота щёк от выбранных эффектов */
export function effectsVolume(effects: Record<string, number> = {}): number {
  return Object.entries(effects).reduce((sum, [id, op]) => {
    const effect = skinEffectById(id);
    if (!effect?.volume) return sum;
    return sum + (effect.volume * Math.min(100, Math.max(0, op))) / 100;
  }, 0);
}
