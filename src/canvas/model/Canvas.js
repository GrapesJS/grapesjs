import Backbone from 'backbone';
import { evPageSelect } from 'pages';

export default Backbone.Model.extend({
  defaults: {
    frame: '',
    frames: '',
    rulers: false,
    zoom: 100,
    x: 0,
    y: 0
  },

  initialize(config = {}) {
    const { em } = config;
    const { styles = [], scripts = [] } = config;
    const mainPage = em.get('PageManager').getMain();
    const frames = mainPage.getFrames();
    const frame =
      mainPage.getMainFrame() ||
      frames.add({
        components: em.getWrapper(),
        styles: em.getStyle()
      });
    styles.forEach(style => frame.addLink(style));
    scripts.forEach(script => frame.addScript(script));
    this.em = em;
    this.set('frame', frame);
    this.set('frames', frames);
    this.listenTo(this, 'change:zoom', this.onZoomChange);
    this.listenTo(em, 'change:device', this.updateDevice);
    this.listenTo(em, evPageSelect, this._pageUpdated);
  },

  _pageUpdated(page, prev) {
    const { em } = this;
    em.setSelected();
    em.stopDefault(); // We have to stop before changing current frames
    prev && prev.getFrames().map(frame => frame.disable());
    this.set('frames', page.getFrames());
  },

  updateDevice() {
    const { em } = this;
    const device = em.getDeviceModel();
    const model = em.getCurrentFrameModel();

    if (model && device) {
      const { width, height } = device.attributes;
      model.set({ width, height });
    }
  },

  onZoomChange() {
    const zoom = this.get('zoom');
    zoom < 1 && this.set('zoom', 1);
  }
});
