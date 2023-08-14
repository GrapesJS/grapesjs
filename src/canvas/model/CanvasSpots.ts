import CanvasModule from '..';
import { ModuleCollection } from '../../abstract';
import CanvasSpot, { CanvasSpotProps } from './CanvasSpot';

export default class CanvasSpots extends ModuleCollection<CanvasSpot> {
  constructor(module: CanvasModule, models: CanvasSpot[] | CanvasSpotProps[] = []) {
    super(module, models, CanvasSpot);
    // bindAll(this, 'itemLoaded');
    // this.on('reset', this.onReset);
    // this.on('remove', this.onRemove);
  }
}
