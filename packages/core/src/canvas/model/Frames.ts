import { bindAll } from 'underscore';
import CanvasModule from '..';
import { ModuleCollection } from '../../abstract';
import type { AddOptions, RemoveOptions, SetOptions } from '../../common';
import type EditorModel from '../../editor/model/Editor';
import type Page from '../../pages/model/Page';
import Frame from './Frame';

interface FramesOptions {
  page?: Page;
}

export default class Frames extends ModuleCollection<Frame> {
  loadedItems = 0;
  itemsToLoad = 0;
  page?: Page;

  constructor(module: CanvasModule, models: Frame[] | Array<Record<string, any>> = [], options: FramesOptions = {}) {
    super(module, models, Frame);
    this.page = options.page;
    bindAll(this, 'itemLoaded');
    this.on('add', this.onAdd);
    this.on('reset', this.onReset);
    this.on('remove', this.onRemove);
    this.on('change', this.onUpdate);
    this.forEach((frame) => this.registerFrame(frame));
  }

  private get pageEvents() {
    return this.module.em.Pages.events;
  }

  get em(): EditorModel {
    return this.module.em;
  }

  registerFrame(frame: Frame) {
    const { module, page } = this;
    page && (frame.page = page);
    module.framesById[frame.id] = frame;
  }

  onAdd(frame: Frame, _collection: Frames, options: AddOptions = {}) {
    this.registerFrame(frame);
    const { page, em, pageEvents } = this;
    page &&
      em.Pages.__emitAll({
        event: pageEvents.frameAdd,
        data: { page, frame, options },
        before: ({ emit, data }) => emit(pageEvents.frameAdd, data.frame, data.options),
      });
  }

  onReset(_collection: Frames, options: RemoveOptions & { previousModels?: Frame[] } = {}) {
    const prev = options.previousModels || [];
    prev.map((frame) => this.onRemove(frame, this, options));
  }

  onRemove(frame: Frame, _collection: Frames, options: RemoveOptions = {}) {
    const { page, em, pageEvents, module } = this;
    frame.onRemove();
    delete module.framesById[frame.id];
    page &&
      em.Pages.__emitAll({
        event: pageEvents.frameRemove,
        data: { page, frame, options },
        before: ({ emit, data }) => emit(pageEvents.frameRemove, data.frame, data.options),
      });
  }

  onUpdate(frame: Frame, options: SetOptions = {}) {
    const { page, em, pageEvents } = this;
    page &&
      em.Pages.__emitAll({
        event: pageEvents.frameUpdate,
        data: { page, frame, changes: frame.changedAttributes() || {}, options },
        before: ({ emit, data }) => emit(pageEvents.frameUpdate, data.frame, data.changes, data.options),
      });
  }

  initRefs() {
    this.forEach((frame) => frame.initRefs());
  }

  toJSON(opts?: Parameters<Frame['toJSON']>[0]) {
    return this.filter((frame) => !frame.get('skipFromStorage')).map((frame) => frame.toJSON(opts));
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
    this.forEach((item) => item[on ? 'on' : 'off']('loaded', this.itemLoaded));
  }
}
