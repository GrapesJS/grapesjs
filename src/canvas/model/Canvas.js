import { Model } from 'backbone';
import { evPageSelect } from 'pages';

export default class Canvas extends Model {
  defaults() {
    return {
      frame: '',
      frames: '',
      rulers: false,
      zoom: 100,
      x: 0,
      y: 0,
      // Scripts to apply on all frames
      scripts: [],
      // Styles to apply on all frames
      styles: []
    };
  }

  initialize(props, config = {}) {
    const { em } = config;
    this.config = config;
    this.em = em;
    this.listenTo(this, 'change:zoom', this.onZoomChange);
    this.listenTo(em, 'change:device', this.updateDevice);
    this.listenTo(em, evPageSelect, this._pageUpdated);
  }

  init() {
    const { em } = this;
    this.set(
      'frames',
      em
        .get('PageManager')
        .getMain()
        .getFrames()
    );
  }

  _pageUpdated(page, prev) {
    const { em } = this;
    em.setSelected();
    em.get('readyCanvas') && em.stopDefault(); // We have to stop before changing current frames
    prev && prev.getFrames().map(frame => frame.disable());
    this.set('frames', page.getFrames());
  }

  updateDevice() {
    const { em } = this;
    const device = em.getDeviceModel();
    const model = em.getCurrentFrameModel();

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
