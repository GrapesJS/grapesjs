import { bindAll } from 'underscore';
import { CanvasEvents } from '../../canvas/types';
import Editor from '../../editor';
import Dragger from '../../utils/Dragger';
import { getKeyChar, off, on } from '../../utils/dom';
import type { CommandPublicFnFromHandler } from '../registryHelpers';
import CommandAbstract from './CommandAbstract';

export interface CanvasMoveCommandRegistryRun {
  'core:canvas-move': CommandPublicFnFromHandler<CommandCanvasMove['run']>;
}

export interface CanvasMoveCommandRegistryStop {
  'core:canvas-move': CommandPublicFnFromHandler<CommandCanvasMove['stop']>;
}

export default class CommandCanvasMove extends CommandAbstract {
  editor!: Editor;
  canvasModel: any;
  dragger?: Dragger;

  run(ed: Editor) {
    bindAll(this, 'onKeyUp', 'enableDragger', 'disableDragger');
    this.editor = ed;
    this.canvasModel = this.canvas.getCanvasView().model;
    this.toggleMove(true);
  }

  stop() {
    this.toggleMove();
    this.disableDragger(new MouseEvent('mouseup'));
  }

  onKeyUp(ev: KeyboardEvent) {
    if (getKeyChar(ev) === ' ') {
      this.editor.stopCommand(this.id as string);
    }
  }

  enableDragger(ev: Event) {
    this.toggleDragger(true, ev);
  }

  disableDragger(ev?: Event) {
    this.toggleDragger(false, ev as Event);
  }

  toggleDragger(enable: boolean, ev: Event) {
    const { canvasModel, em } = this;
    let { dragger } = this;
    const methodCls = enable ? 'add' : 'remove';
    this.getCanvas().classList[methodCls](`${this.ppfx}is__grabbing`);

    if (!dragger) {
      dragger = new Dragger({
        getPosition() {
          return {
            x: canvasModel.get('x'),
            y: canvasModel.get('y'),
          };
        },
        setPosition({ x, y }) {
          canvasModel.set({ x, y });
        },
        onStart(_ev, dragger) {
          em.trigger(CanvasEvents.moveStart, dragger);
        },
        onDrag(_ev, dragger) {
          em.trigger(CanvasEvents.move, dragger);
        },
        onEnd(_ev, dragger) {
          em.trigger(CanvasEvents.moveEnd, dragger);
        },
      });
      this.dragger = dragger;
    }

    enable ? dragger!.start(ev) : dragger!.stop(ev);
  }

  toggleMove(enable = false) {
    const { ppfx } = this;
    const methodCls = enable ? 'add' : 'remove';
    const methodEv = enable ? 'on' : 'off';
    const methodsEv = { on, off };
    const canvas = this.getCanvas();
    const classes = [`${ppfx}is__grab`];
    !enable && classes.push(`${ppfx}is__grabbing`);
    classes.forEach((cls) => canvas.classList[methodCls](cls));
    methodsEv[methodEv](document, 'keyup', this.onKeyUp);
    methodsEv[methodEv](canvas, 'mousedown', this.enableDragger);
    methodsEv[methodEv](document, 'mouseup', this.disableDragger);
  }
}
