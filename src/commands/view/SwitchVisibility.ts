import { bindAll } from 'underscore';
import Frame from '../../canvas/model/Frame';
import Editor from '../../editor';
import { CommandObject } from './CommandAbstract';
import { isDef } from '../../utils/mixins';

export default {
  init() {
    bindAll(this, '_onFramesChange');
  },

  run(ed) {
    this.toggleVis(ed, true);
  },

  stop(ed) {
    this.toggleVis(ed, false);
  },

  toggleVis(ed: Editor, active = true) {
    if (!ed.Commands.isActive('preview')) {
      const cv = ed.Canvas;
      const mth = active ? 'on' : 'off';
      const canvasModel = cv.getModel();
      canvasModel[mth]('change:frames', this._onFramesChange);
      this.handleFrames(cv.getFrames(), active);
    }
  },

  handleFrames(frames: Frame[], active?: boolean) {
    frames.forEach((frame: Frame & { __ol?: boolean }) => {
      frame.view?.loaded && this._upFrame(frame, active);

      if (!frame.__ol) {
        frame.on('loaded', () => this._upFrame(frame));
        frame.__ol = true;
      }
    });
  },

  _onFramesChange(_: any, frames: Frame[]) {
    this.handleFrames(frames);
  },

  _upFrame(frame: Frame, active?: boolean) {
    const { ppfx, em, id } = this;
    const isActive = isDef(active) ? active : em.Commands.isActive(id as string);
    const method = isActive ? 'add' : 'remove';
    const cls = `${ppfx}dashed`;
    frame.view?.getBody().classList[method](cls);
  },
} as CommandObject<
  {},
  {
    [key: string]: any;
  }
>;
