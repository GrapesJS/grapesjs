import { bindAll } from 'underscore';
import CanvasModule from '..';
import { ModuleCollection } from '../../abstract';
import Page from '../../pages/model/Page';
import Frame from './Frame';

export default class Frames extends ModuleCollection<Frame> {
  loadedItems = 0;
  itemsToLoad = 0;
  page?: Page;

  constructor(module: CanvasModule, models: Frame[] | Array<Record<string, any>> = []) {
    super(module, models, Frame);
    bindAll(this, 'itemLoaded');
    this.on('add', this.onAdd);
    this.on('reset', this.onReset);
    this.on('remove', this.onRemove);
    this.forEach(frame => this.onAdd(frame));
  }

  onAdd(frame: Frame) {
    this.module.framesById[frame.id] = frame;
  }

  onReset(m: Frame, opts?: { previousModels?: Frame[] }) {
    const prev = opts?.previousModels || [];
    prev.map(p => this.onRemove(p));
  }

  onRemove(frame: Frame) {
    frame.onRemove();
    delete this.module.framesById[frame.id];
  }

  initRefs() {
    this.forEach(frame => frame.initRefs());
  }

  itemLoaded() {
    this.loadedItems++;

    if (this.loadedItems >= this.itemsToLoad) {
      this.trigger('loaded:all');
      this.listenToLoadItems(false);
    }
  }

  listenToLoad() {
    this.loadedItems = 0;
    this.itemsToLoad = this.length;
    this.listenToLoadItems(true);
  }

  listenToLoadItems(on: boolean) {
    this.forEach(item => item[on ? 'on' : 'off']('loaded', this.itemLoaded));
  }
}
