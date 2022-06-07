import { bindAll } from 'underscore';

export default {
  init() {
    bindAll(this, '_onFramesChange');
  },

  run(ed) {
    this.toggleVis(ed);
  },

  stop(ed) {
    this.toggleVis(ed, 0);
  },

  toggleVis(ed, active = 1) {
    if (!ed.Commands.isActive('preview')) {
      const cv = ed.Canvas;
      const mth = active ? 'on' : 'off';
      cv.getFrames().forEach(frame => this._upFrame(frame, active));
      cv.getModel()[mth]('change:frames', this._onFramesChange);
    }
  },

  _onFramesChange(m, frames) {
    frames.forEach(frame => frame.once('loaded', () => this._upFrame(frame, true)));
  },

  _upFrame(frame, active) {
    const method = active ? 'add' : 'remove';
    frame.view.getBody().classList[method](`${this.ppfx}dashed`);
  },
};
