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
      const canvasModel = cv.getModel();
      cv.getFrames().forEach(frame => this._upFrame(frame, active));
      canvasModel[mth]('change:frames', this._onFramesChange);
    }
  },

  _onFramesChange(m: any, frames: Frame[]) {
    frames.forEach(frame => {
      const load = () => this._upFrame(frame, true);
      frame.view?.loaded ? load() : frame.once('loaded', load);
    });
  },

  _upFrame(frame: Frame, active: boolean) {
    const method = active ? 'add' : 'remove';
    const cls = `${this.ppfx}dashed`;
    frame.view?.getBody().classList[method](cls);
  },
} as CommandObject<
  {},
  {
    [key: string]: any;
  }
>;
