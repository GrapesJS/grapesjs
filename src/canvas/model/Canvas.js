import Backbone from 'backbone';
import Frame from './Frame';
import Frames from './Frames';

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
    const root = em && em.getWrapper();
    const css = em && em.getStyle();
    const mainPage = em.get('Pages').getMain();
    let frames = mainPage.getFrames();
    let frame = mainPage.getMainFrame();

    if (!frame) {
      frame = new Frame({ root, styles: css }, config);
      frames.add(frame);
    }

    styles.forEach(style => frame.addLink(style));
    scripts.forEach(script => frame.addScript(script));
    this.em = em;
    this.set('frame', frame);
    this.set('frames', frames);
    this.listenTo(this, 'change:zoom', this.onZoomChange);
    this.listenTo(em, 'change:device', this.updateDevice);
    // TODO this.listenTo(em, 'page:select', this.updateFrames);
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
