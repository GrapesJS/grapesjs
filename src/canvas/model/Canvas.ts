import { Model } from '../../common';
import Backbone from 'backbone';
import { evPageSelect } from '../../pages';
import Frames from './Frames';
import EditorModel from '../../editor/model/Editor';
import Page from '../../pages/model/Page';

export default class Canvas extends Backbone.Model {
  defaults() {
    return {
      frame: '',
      frames: new Frames(),
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
  em: EditorModel;
  config: any;

  constructor(props: any, config: any = {}) {
    super(props);
    const { em } = config;
    this.config = config;
    this.em = em;
    this.listenTo(this, 'change:zoom', this.onZoomChange);
    this.listenTo(em, 'change:device', this.updateDevice);
    this.listenTo(em, evPageSelect, this._pageUpdated);
  }
  get frames(): Frames {
    return this.get('frames');
  }

  init() {
    const { em } = this;
    const mainPage = em.get('PageManager').getMain();
    const frame = mainPage.getMainFrame();
    this.set('frames', mainPage.getFrames());
    this.updateDevice({ frame });
  }

  _pageUpdated(page: Page, prev?: Page) {
    const { em } = this;
    em.setSelected();
    em.get('readyCanvas') && em.stopDefault(); // We have to stop before changing current frames
    //@ts-ignore
    prev?.getFrames().map((frame) => frame.disable());
    this.set('frames', page.getFrames());
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
