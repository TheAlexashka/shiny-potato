import type { FaceSel } from '../data/types';

const ZONES: Record<string, string[]> = {
  forehead: [
    'M130 50.5 C140 48.2 160 48.2 170 50.5',
    'M128 55 C139 52.5 162 52.8 172 55.5',
    'M135 59 C144 57.4 158 57.8 166 59.3',
  ],
  frown: ['M147 59 Q145.8 63 147.1 67', 'M153 59.5 Q154.3 63.8 152.8 67.4', 'M149 57.5 Q150 59 151 57.5'],
  crows: [
    'M123.2 74 Q120.5 73.1 118.7 71.7', 'M122.6 76.3 Q119.5 76.1 117.5 76.8',
    'M123.3 78 Q120.7 79.3 119.2 81.3', 'M125 79.4 Q122.6 81.5 122.1 83.5',
    'M176.8 74 Q179.5 73.1 181.3 71.7', 'M177.4 76.3 Q180.5 76.1 182.5 76.8',
    'M176.7 78 Q179.3 79.3 180.8 81.3', 'M175 79.4 Q177.4 81.5 177.9 83.5',
  ],
  undereye: [
    'M126 82 Q133 86 141 82.5', 'M127.5 85 Q133.5 87.5 138 85.5',
    'M159 82.5 Q167 86 174 82', 'M162 85.5 Q166.5 87.5 172.5 85',
  ],
  smile: ['M141 94.5 C137 96 134.2 101.3 135.5 106.3', 'M159 94.5 C163 96 165.8 101.3 164.5 106.3'],
  cheek: [
    'M124.5 92 C121.7 98 124 102.5 127 104', 'M128 94 Q125.5 99 129 102.5',
    'M175.5 92 C178.3 98 176 102.5 173 104', 'M172 94 Q174.5 99 171 102.5',
  ],
  lipline: [
    'M142 98.6 L143 100.7', 'M146 98.1 L146.5 100', 'M153.7 98.1 L153.3 100', 'M157.8 98.7 L157 100.8',
    'M143.3 109.5 L143 111.5', 'M147.5 110.2 L147.2 112.3', 'M152.3 110.2 L152.6 112.3', 'M156.7 109.5 L157 111.5',
  ],
  marionette: ['M138 106.3 Q136.5 111 140 114.7', 'M162 106.3 Q163.5 111 160 114.7'],
  chin: ['M141.5 115 Q150 118 158.5 115', 'M146 118.4 Q150 119.5 154 118.4'],
  dimple: ['M133.5 98.6 q2 2.6 0.4 4.8', 'M166.5 98.6 q-2 2.6 -0.4 4.8'],
  /* глубокие носогубные складки до углов челюсти */
  nasolabialDeep: [
    'M141 94 C136.4 96.5 132.4 102 131.6 108.6 C131.1 113.4 130 117.2 128.2 120.4',
    'M159 94 C163.6 96.5 167.6 102 168.4 108.6 C168.9 113.4 170 117.2 171.8 120.4',
    'M140.4 96.4 C136.6 99 133.4 103.6 132.8 109.4',
    'M159.6 96.4 C163.4 99 166.6 103.6 167.2 109.4',
  ],
  /* морщины у уголков рта и под ними («рот-рупор») */
  marionetteDeep: [
    'M138 105.6 Q136 111 138.6 115.8 Q140 118.4 139.4 121',
    'M162 105.6 Q164 111 161.4 115.8 Q160 118.4 160.6 121',
    'M136.6 108 Q135.4 112.6 137.4 116.4',
    'M163.4 108 Q164.6 112.6 162.6 116.4',
    'M144 112 Q143 116 144.6 119.4', 'M156 112 Q157 116 155.4 119.4',
  ],
  /* морщины и складки на подбородке */
  chinCrease: [
    'M141.5 114.6 Q150 117.6 158.5 114.6', 'M146 118 Q150 119.4 154 118',
    'M143.5 121.6 Q150 123.4 156.5 121.6', 'M148 124.4 L152 124.4',
    'M144.6 112.4 q1.4 2.2 0 4.4', 'M155.4 112.4 q-1.4 2.2 0 4.4',
  ],
  /* морщины у висков: лучи от внешних уголков глаз к вискам */
  templeCrease: [
    'M124.4 72.6 Q118.6 70.6 114.6 67.4', 'M123.8 76.2 Q117.4 75 113.4 73',
    'M124.8 79.6 Q118.8 80.6 115.2 82.6', 'M126.4 82.6 Q121.6 85.4 118.6 88.6',
    'M175.6 72.6 Q181.4 70.6 185.4 67.4', 'M176.2 76.2 Q182.6 75 186.6 73',
    'M175.2 79.6 Q181.2 80.6 184.8 82.6', 'M173.6 82.6 Q178.4 85.4 181.4 88.6',
    'M112.4 66.4 q3.2 -2.4 6.4 -3.4', 'M187.6 66.4 q-3.2 -2.4 -6.4 -3.4',
  ],
};

const PRESETS: Record<string, string[]> = {
  light: ['undereye', 'smile'],
  forehead: ['forehead'], frown: ['frown'], crows: ['crows'], undereye: ['undereye'],
  smile: ['smile'], cheek: ['cheek'], lipline: ['lipline'], marionette: ['marionette'], chin: ['chin'], dimple: ['dimple'],
  mature: ['forehead', 'crows', 'smile'],
  aged: ['forehead', 'frown', 'crows', 'undereye', 'smile', 'marionette', 'chin'],
  nasolabialDeep: ['nasolabialDeep'], marionetteDeep: ['marionetteDeep'],
  chinCrease: ['chinCrease'], temple: ['templeCrease'],
  /* «рот-рупор»: глубокие складки вокруг работающего рта */
  megaphone: ['nasolabialDeep', 'marionetteDeep', 'lipline', 'chinCrease'],
  /* ораторское лицо: мимика + возраст + лучи у висков */
  orator: ['forehead', 'frown', 'nasolabialDeep', 'marionetteDeep', 'chinCrease', 'templeCrease', 'undereye', 'lipline'],
  deep: Object.keys(ZONES),
};

export function Wrinkles({ face, skin }: { face: FaceSel; skin: string }) {
  const zones = PRESETS[face.wrinkles];
  if (!zones || face.wrinkleIntensity <= 0) return null;
  const strength = Math.min(100, Math.max(0, face.wrinkleIntensity)) / 100;
  const light = face.wrinkles === 'light';
  const deep = face.wrinkles === 'deep';
  const lines = zones.flatMap((zone) => ZONES[zone]);

  return (
    <g data-wrinkle-style={face.wrinkles} opacity={strength * (light ? 0.54 : 0.92)}>
      {(face.wrinkles === 'aged' || deep) && (
        <g fill="#65412f" opacity={0.07}>
          <ellipse cx={133.5} cy={84} rx={7.8} ry={2.8} />
          <ellipse cx={166.5} cy={84} rx={7.8} ry={2.8} />
        </g>
      )}
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {lines.map((d, i) => (
          <g key={d}>
            <path d={d} stroke="#fff0dc" strokeWidth={0.56} opacity={0.24} transform="translate(0 0.46)" />
            <path d={d} stroke={`color-mix(in srgb, ${skin} 26%, #563629)`} strokeWidth={(deep ? 0.65 : 0.4) + (i % 3) * 0.08} opacity={0.42 + (i % 4) * 0.09} />
          </g>
        ))}
      </g>
    </g>
  );
}
