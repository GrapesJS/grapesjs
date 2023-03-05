import { bindAll } from 'underscore';
import Frame from '../../canvas/model/Frame';
import Editor from '../../editor';
import { CommandObject } from './CommandAbstract';

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

  toggleVis(ed: Editor, active = 1) {
    if (!ed.Commands.isActive('preview')) {
      const cv = ed.Canvas;
      const mth = active ? 'on' : 'off';
      cv.getFrames().forEach(frame => this._upFrame(frame, active));
      cv.getModel()[mth]('change:frames', this._onFramesChange);
    }
  },

  _onFramesChange(m: any, frames: Frame[]) {
    frames.forEach(frame => frame.once('loaded', () => this._upFrame(frame, true)));
  },

  _upFrame(frame: Frame, active: boolean) {
    const method = active ? 'add' : 'remove';
    frame.view?.getBody().classList[method](`${this.ppfx}dashed`);
  },
} as CommandObject<
  {},
  {
    [key: string]: any;
  }
>;
