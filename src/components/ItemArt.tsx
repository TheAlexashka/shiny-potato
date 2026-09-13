import type { FigureGeometry } from '../data/figureGeometry';
import type { FaceSel, Gender, Item } from '../data/types';
import { hatFitTransform } from '../utils/hatFit';

interface Props {
  item: Item;
  gender: Gender;
  rig: FigureGeometry;
  face: FaceSel;
  mirrored?: boolean;
  layer?: 'front' | 'back';
}

// The stage and thumbnails share the same fit, reflection and rendering context.
export function ItemArt({ item, gender, rig, face, mirrored = false, layer = 'front' }: Props) {
  const draw = layer === 'back' ? item.back : item.render;
  if (!draw) return null;
  const isHat = item.category === 'headgear';
  const reflectAccessory = Boolean(item.mirrorable && mirrored);
  return (
    <g
      data-item-art={item.id}
      data-item-layer={layer}
      data-item-mirrored={isHat ? Boolean(face.hatMirrored) : reflectAccessory}
      transform={isHat ? hatFitTransform(face) : undefined}
    >
      {draw(gender, rig, { face, mirrored: reflectAccessory })}
    </g>
  );
}
