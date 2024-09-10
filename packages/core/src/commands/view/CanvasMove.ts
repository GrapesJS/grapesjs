import { bindAll } from 'underscore';
import Dragger from '../../utils/Dragger';
import { getKeyChar, off, on } from '../../utils/dom';
import { CommandObject } from './CommandAbstract';

export default {
  run(ed) {
    bindAll(this, 'onKeyUp', 'enableDragger', 'disableDragger');
    this.editor = ed;
    this.canvasModel = this.canvas.getCanvasView().model;
    this.toggleMove(1);
  },
  stop(ed) {
    this.toggleMove();
    this.disableDragger();
  },

  onKeyUp(ev: KeyboardEvent) {
    if (getKeyChar(ev) === ' ') {
      this.editor.stopCommand(this.id);
    }
  },

  enableDragger(ev: Event) {
    this.toggleDragger(1, ev);
  },

  disableDragger(ev: Event) {
    this.toggleDragger(0, ev);
  },

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
        onStart(ev, dragger) {
          em.trigger('canvas:move:start', dragger);
        },
        onDrag(ev, dragger) {
          em.trigger('canvas:move', dragger);
        },
        onEnd(ev, dragger) {
          em.trigger('canvas:move:end', dragger);
        },
      });
      this.dragger = dragger;
    }

    enable ? dragger.start(ev) : dragger.stop();
  },

  toggleMove(enable: boolean) {
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
  },
} as CommandObject<
  any,
  {
    [key: string]: any;
  }
>;
