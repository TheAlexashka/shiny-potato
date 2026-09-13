import { useState } from 'react';
import { IRIS_COLORS } from '../data/types';
import { cn } from '../utils/cn';

export interface IrisColorOption {
  id?: string;
  name: string;
  color: string;
}

interface IrisPickerProps {
  side: 'left' | 'right';
  value: string;
  customColor: string;
  onChange: (preset: string) => void;
  onCustomChange: (color: string) => void;
  disabled?: boolean;
  /** свои пресеты (по умолчанию — палитра радужки) */
  colors?: IrisColorOption[];
  /** подпись вместо «Левый/Правый глаз» */
  title?: string;
}

export function IrisPicker({ side, value, customColor, onChange, onCustomChange, disabled, colors, title }: IrisPickerProps) {
  const [open, setOpen] = useState(false);
  const palette = colors ?? IRIS_COLORS;
  const colorNames = Object.fromEntries(palette.map((c) => [c.color, c.name]));
  const label = title ?? (side === 'left' ? 'Левый глаз' : 'Правый глаз');
  const hasCustom = !!customColor;
  const display = hasCustom ? 'Свой цвет' : (colorNames[value] ?? '...');
  return (
    <fieldset disabled={disabled} className={cn('mb-2 min-w-0', disabled && 'opacity-40')}>
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex min-h-9 w-full items-center justify-between gap-2 text-left">
        <span className="font-serif text-[11px] tracking-widest text-[#c9a24b]/80 uppercase">{label}</span>
        <span className="flex items-center gap-1.5 text-xs text-[#e8dcc0]/70">
          {hasCustom ? <span className="inline-block h-3 w-3 rounded-full border border-white/20" style={{ background: customColor }} /> : <span className="inline-block h-3 w-3 rounded-full border border-white/20" style={{ background: value }} />}
          {display}
        </span>
      </button>
      {open && (
        <div className="space-y-2 pt-1">
          <div className="flex flex-wrap gap-0.5">
            {palette.map((c) => (
              <button
                key={c.id ?? c.color}
                title={c.name}
                onClick={() => { onCustomChange(''); onChange(c.color); }}
                className="flex h-8 w-8 items-center justify-center rounded-full"
              >
                <span className={cn('h-5 w-5 rounded-full border-2 transition-transform', !hasCustom && value === c.color ? 'scale-110 border-[#e6c884] ring-1 ring-[#c9a24b]/40 ring-offset-1 ring-offset-[#23201b]' : 'border-white/25')} style={{ background: c.color }} />
              </button>
            ))}
          </div>
          <label className="flex min-h-9 w-fit items-center gap-2 text-xs text-[#e8dcc0]/80">
            <span>Свой цвет</span>
            <input
              type="color"
              value={customColor || value}
              aria-label={`Свой цвет: ${label}`}
              onChange={(e) => onCustomChange(e.target.value)}
              className="h-8 w-10 cursor-pointer rounded-sm border border-[#c9a24b]/40 bg-transparent p-0.5"
            />
            {hasCustom && (
              <button
                type="button"
                onClick={() => onCustomChange('')}
                className="text-[11px] text-[#c9a24b] underline underline-offset-2"
              >
                ↩ к пресету
              </button>
            )}
          </label>
        </div>
      )}
    </fieldset>
  );
}
