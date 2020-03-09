import Backbone from 'backbone';
import Frame from './Frame';
import Frames from './Frames';

export default Backbone.Model.extend({
  defaults: {
    frame: '',
    frames: '',
    wrapper: '',
    rulers: false,
    zoom: 100,
    x: 0,
    y: 0
  },

  initialize(config = {}) {
    const { em } = config;
    const { styles = [], scripts = [] } = config;
    const frame = new Frame({}, config);
    styles.forEach(style => frame.addLink(style));
    scripts.forEach(script => frame.addScript(script));
    this.em = em;
    this.set('frame', frame);
    this.set('frames', new Frames([frame], config));
    this.listenTo(this, 'change:zoom', this.onZoomChange);
    this.listenTo(em, 'change:device', this.updateDevice);
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
