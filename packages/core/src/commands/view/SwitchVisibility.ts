import { bindAll } from 'underscore';
import Frame from '../../canvas/model/Frame';
import Editor from '../../editor';
import { isDef } from '../../utils/mixins';
import type { CommandPublicFnFromHandler } from '../registryHelpers';
import CommandAbstract from './CommandAbstract';

export interface SwitchVisibilityCommandRegistryRun {
  'core:component-outline': CommandPublicFnFromHandler<CommandSwitchVisibility['run']>;
  'sw-visibility': CommandPublicFnFromHandler<CommandSwitchVisibility['run']>;
}

export interface SwitchVisibilityCommandRegistryStop {
  'core:component-outline': CommandPublicFnFromHandler<CommandSwitchVisibility['stop']>;
  'sw-visibility': CommandPublicFnFromHandler<CommandSwitchVisibility['stop']>;
}

export default class CommandSwitchVisibility extends CommandAbstract {
  init() {
    bindAll(this, '_onFramesChange');
  }

  run(ed: Editor) {
    this.toggleVis(ed, true);
  }

  stop(ed: Editor) {
    this.toggleVis(ed, false);
  }

  toggleVis(ed: Editor, active = true) {
    if (!ed.Commands.isActive('preview')) {
      const cv = ed.Canvas;
      const mth = active ? 'on' : 'off';
      const canvasModel = cv.getModel();
      canvasModel[mth]('change:frames', this._onFramesChange);
      this.handleFrames(cv.getFrames(), active);
    }
  }

  handleFrames(frames: Frame[], active?: boolean) {
    frames.forEach((frame: Frame & { __ol?: boolean }) => {
      frame.view?.loaded && this._upFrame(frame, active);

      if (!frame.__ol) {
        frame.on('loaded', () => this._upFrame(frame));
        frame.__ol = true;
      }
    });
  }

  _onFramesChange(_: any, frames: Frame[]) {
    this.handleFrames(frames);
  }

  _upFrame(frame: Frame, active?: boolean) {
    const { ppfx, em, id } = this;
    const isActive = isDef(active) ? active : em.Commands.isActive(id as string);
    const method = isActive ? 'add' : 'remove';
    const cls = `${ppfx}dashed`;
    frame.view?.getBody().classList[method](cls);
  }
}
