import CanvasModule from '..';
import { ModuleModel } from '../../abstract';
import { Coordinates, CoordinatesTypes, DEFAULT_COORDS } from '../../common';
import { evUpdate as evDeviceUpdate } from '../../device_manager';
import Page from '../../pages/model/Page';
import PagesEvents from '../../pages/types';
import Frames from './Frames';

export default class Canvas extends ModuleModel<CanvasModule> {
  defaults() {
    return {
      frame: '',
      frames: [],
      rulers: false,
      zoom: 100,
      x: 0,
      y: 0,
      // Scripts to apply on all frames
      scripts: [],
      // Styles to apply on all frames
      styles: [],
      pointer: DEFAULT_COORDS,
      pointerScreen: DEFAULT_COORDS,
    };
  }

  constructor(module: CanvasModule) {
    const { em, config } = module;
    const { scripts, styles } = config;
    super(module, { scripts, styles });
    this.set('frames', new Frames(module));
    this.on('change:zoom', this.onZoomChange);
    this.on('change:x change:y', this.onCoordsChange);
    this.on('change:pointer change:pointerScreen', this.onPointerChange);
    this.listenTo(em, `change:device ${evDeviceUpdate}`, this.updateDevice);
    this.listenTo(em, PagesEvents.select, this._pageUpdated);
  }

  get frames(): Frames {
    return this.get('frames');
  }

  init() {
    const { em } = this;
    const mainPage = em.Pages._initPage();
    this.set('frames', mainPage.getFrames());
    this.updateDevice({ frame: mainPage.getMainFrame() });
  }

  _pageUpdated(page: Page, prev?: Page) {
    const { em } = this;
    em.setSelected();
    em.get('readyCanvas') && em.stopDefault(); // We have to stop before changing current frames
    prev?.getFrames().map(frame => frame.disable());
    this.set('frames', page.getFrames());
    this.updateDevice({ frame: page.getMainFrame() });
  }

  updateDevice(opts: any = {}) {
    const { em } = this;
    const device = em.getDeviceModel();
    const model = opts.frame || em.getCurrentFrameModel();

    if (model && device) {
      const { width, height } = device.attributes;
      model.set({ width, height }, { noUndo: 1 });
    }
  }

  onZoomChange() {
    const { em, module } = this;
    const zoom = this.get('zoom');
    zoom < 1 && this.set('zoom', 1);
    em.trigger(module.events.zoom);
  }

  onCoordsChange() {
    const { em, module } = this;
    em.trigger(module.events.coords);
  }

  onPointerChange() {
    const { em, module } = this;
    em.trigger(module.events.pointer);
  }

  getPointerCoords(type: CoordinatesTypes = CoordinatesTypes.World): Coordinates {
    const { pointer, pointerScreen } = this.attributes;
    return type === CoordinatesTypes.World ? pointer : pointerScreen;
  }
}
