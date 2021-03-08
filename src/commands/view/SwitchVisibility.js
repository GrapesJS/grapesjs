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
      const cvModel = ed.Canvas.getCanvasView().model;
      ed.Canvas.getFrames().forEach(frame => this._upFrame(frame, active));
      cvModel[active ? 'on' : 'off']('change:frames', this._onFramesChange);
    }
  },

  _onFramesChange(m, frames) {
    frames.forEach(frame => this._upFrame(frame, 1));
  },

  _upFrame(frame, active) {
    const method = active ? 'add' : 'remove';
    frame.view.getBody().classList[method](`${this.ppfx}dashed`);
  }
};
