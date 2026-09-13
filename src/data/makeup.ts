interface MakeupStyle {
  lip: string | null;
  shadow: string;
  shadowOpacity: number;
  blush: string;
  blushOpacity: number;
  liner: number;
  wing: number;
  gloss: number;
  powder?: number;
  contour?: number;
  highlight?: number;
  beautyMark?: boolean;
}

const BARE: MakeupStyle = {
  lip: null, shadow: '#927263', shadowOpacity: 0, blush: '#b56767',
  blushOpacity: 0, liner: 0, wing: 0, gloss: 0,
};

export const MAKEUP_STYLES: Record<string, MakeupStyle> = {
  none: BARE,
  natural: { ...BARE, lip: '#b67e72', blushOpacity: 0.12, powder: 0.045, highlight: 0.09 },
  red: { ...BARE, lip: '#a82332', shadowOpacity: 0.26, blushOpacity: 0.42, liner: 0.75, wing: 3.2, gloss: 0.25 },
  rose: { ...BARE, lip: '#c06f82', shadow: '#a77b87', shadowOpacity: 0.28, blush: '#c68088', blushOpacity: 0.34, liner: 0.35, wing: 0.8, gloss: 0.25 },
  smoky: { ...BARE, lip: '#783a4b', shadow: '#473c4a', shadowOpacity: 0.68, blushOpacity: 0.21, liner: 1, wing: 3.6, gloss: 0.14, contour: 0.13 },
  porcelain: { ...BARE, lip: '#c68487', shadow: '#b4969e', shadowOpacity: 0.2, blush: '#e2a0a4', blushOpacity: 0.38, liner: 0.28, wing: 0.5, gloss: 0.12, powder: 0.15 },
  mark: { ...BARE, lip: '#962334', shadowOpacity: 0.3, blushOpacity: 0.3, liner: 0.85, wing: 3.3, gloss: 0.25, beautyMark: true },
  copper: { ...BARE, lip: '#b06449', shadow: '#aa633c', shadowOpacity: 0.52, blush: '#ca8b69', blushOpacity: 0.34, liner: 0.6, wing: 2, gloss: 0.18, highlight: 0.2 },
  burgundy: { ...BARE, lip: '#651f34', shadow: '#765167', shadowOpacity: 0.48, blush: '#a76275', blushOpacity: 0.27, liner: 0.8, wing: 2.5, gloss: 0.24 },
  peach: { ...BARE, lip: '#cb856e', shadow: '#bf997d', shadowOpacity: 0.22, blush: '#dc977c', blushOpacity: 0.5, liner: 0.15, wing: 0.4, gloss: 0.25, highlight: 0.15 },
  plum: { ...BARE, lip: '#844663', shadow: '#856781', shadowOpacity: 0.56, blush: '#bc809d', blushOpacity: 0.31, liner: 0.65, wing: 2.2, gloss: 0.22 },
  champagne: { ...BARE, lip: '#b77871', shadow: '#c0a376', shadowOpacity: 0.52, blushOpacity: 0.2, liner: 0.35, wing: 1.1, gloss: 0.38, highlight: 0.26 },
  liner: { ...BARE, liner: 1, wing: 4.2, shadowOpacity: 0.06 },
  cherry: { ...BARE, lip: '#bc233e', shadow: '#78585b', shadowOpacity: 0.2, blushOpacity: 0.38, liner: 0.48, wing: 1.6, gloss: 0.4 },
  sepia: { ...BARE, lip: '#9a6254', shadow: '#81614d', shadowOpacity: 0.55, blush: '#bd896e', blushOpacity: 0.28, liner: 0.52, wing: 1.5, gloss: 0.08, contour: 0.16 },
  powder: { ...BARE, powder: 0.12, highlight: 0.08 },
  sculpted: { ...BARE, lip: '#b08078', contour: 0.4, highlight: 0.22, shadowOpacity: 0.13, blushOpacity: 0.14 },
  stage: { ...BARE, lip: '#aa575a', shadow: '#725748', shadowOpacity: 0.35, blushOpacity: 0.3, liner: 0.42, wing: 0.6, gloss: 0.07, contour: 0.3, powder: 0.065 },
  geisha: { ...BARE, lip: '#a01828', shadow: '#3a3a44', shadowOpacity: 0.35, blush: '#e08090', blushOpacity: 0.3, liner: 0.9, wing: 1.5, gloss: 0.2, powder: 0.3, highlight: 0.1, contour: 0.08 },
  maiko: { ...BARE, lip: '#c02030', shadow: '#5a4a52', shadowOpacity: 0.22, blush: '#ef8fa0', blushOpacity: 0.45, liner: 0.6, wing: 0.8, gloss: 0.3, powder: 0.2, highlight: 0.14 },
};

export function getMakeupStyle(id: string): MakeupStyle {
  return MAKEUP_STYLES[id] ?? BARE;
}
