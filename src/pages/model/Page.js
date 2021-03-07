import { Model } from 'backbone';
import Frames from 'canvas/model/Frames';

export default Model.extend({
  defaults: () => ({
    frames: []
  }),

  initialize(props, opts = {}) {
    this.set('frames', new Frames(this.get('frames'), opts.config));
  },

  getFrames() {
    return this.get('frames');
  },

  getMainFrame() {
    return this.getFrames().at(0);
  },

  getMainComponent() {
    const frame = this.getMainFrame();
    return frame && frame.getComponent();
  }
});
