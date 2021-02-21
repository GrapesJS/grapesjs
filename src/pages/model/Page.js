import { Model } from 'backbone';
import Frames from 'canvas/model/Frames';

export default Model.extend({
  defaults: () => ({
    frames: []
  }),

  initialize(props = {}) {
    this.set('frames', new Frames(this.get('frames')));
  },

  getFrames() {
    return this.get('frames');
  },

  getMainFrame() {
    return this.getFrames().at(0);
  }
});
