import { Model } from 'backbone';
import Frames from 'canvas/model/Frames';

export default Model.extend({
  defaults: () => ({
    frames: [],
    _undo: true
  }),

  initialize(props, opts = {}) {
    const { config = {} } = opts;
    const { em } = config;
    this.em = em;
    const frames = new Frames(this.get('frames'), config);
    this.set('frames', frames);
    const um = em && em.get('UndoManager');
    um && um.add(frames);
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
