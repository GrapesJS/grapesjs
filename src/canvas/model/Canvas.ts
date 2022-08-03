import { Model } from '../../abstract';
import { evPageSelect } from '../../pages';
import { evUpdate as evDeviceUpdate } from '../../device_manager';
import Frames from './Frames';
import Page from '../../pages/model/Page';
import CanvasModule from '..';

export default class Canvas extends Model<CanvasModule> {
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
    };
  }

  constructor(module: CanvasModule) {
    const { em, config } = module;
    const { scripts, styles } = config;
    super(module, { scripts, styles });
    this.set('frames', new Frames(module));
    this.listenTo(this, 'change:zoom', this.onZoomChange);
    this.listenTo(em, `change:device ${evDeviceUpdate}`, this.updateDevice);
    this.listenTo(em, evPageSelect, this._pageUpdated);
  }

  get frames(): Frames {
    return this.get('frames');
  }

  init() {
    const { em } = this;
    const mainPage = em.get('PageManager').getMain();
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
    const zoom = this.get('zoom');
    zoom < 1 && this.set('zoom', 1);
  }
}
