import type { BodySel } from './types';
import type { FigureGeometry, Side } from './figureGeometry';

type LimbSide = NonNullable<BodySel['armAmputationSide']>;

export function sideIsSelected(selection: LimbSide | undefined, side: Side): boolean {
  return selection === 'both' || selection === (side === -1 ? 'left' : 'right');
}

export function armAmputation(rig: FigureGeometry, side: Side) {
  return sideIsSelected(rig.armAmputationSide, side) ? rig.armAmputationLevel : null;
}

export function legAmputation(rig: FigureGeometry, side: Side) {
  return sideIsSelected(rig.legAmputationSide, side) ? rig.legAmputationLevel : null;
}
