import { bindAll, indexOf } from 'underscore';
import CanvasModule from '../canvas';
import EditorModel from '../editor/model/Editor';
import { on, off } from './mixins';

// TODO move in sorter
type SorterOptions = {
  sorter: any;
  event: any;
};

type DragStop = (cancel?: boolean) => void;

type DragContent = (content: any) => void;

/**
 * This class makes the canvas droppable
 */
export default class Droppable {
  em: EditorModel;
  canvas: CanvasModule;
  el: HTMLElement;
  counter: number;
  sortOpts?: Record<string, any> | null;
  over?: boolean;
  dragStop?: DragStop;
  dragContent?: DragContent;
  sorter?: any;

  constructor(em: EditorModel, rootEl?: HTMLElement) {
    this.em = em;
    this.canvas = em.get('Canvas');
    const el = rootEl || this.canvas.getFrames().map(frame => frame.getComponent().getEl());
    const els = Array.isArray(el) ? el : [el];
    this.el = els[0];
    this.counter = 0;
    bindAll(this, 'handleDragEnter', 'handleDragOver', 'handleDrop', 'handleDragLeave');
    els.forEach(el => this.toggleEffects(el, true));
  }

  toggleEffects(el: HTMLElement, enable: boolean) {
    const methods = { on, off };
    const method = enable ? 'on' : 'off';
    methods[method](el, 'dragenter', this.handleDragEnter);
    methods[method](el, 'dragover', this.handleDragOver);
    methods[method](el, 'drop', this.handleDrop);
    methods[method](el, 'dragleave', this.handleDragLeave);
  }

  __customTglEff(enable: boolean) {
    const method = enable ? on : off;
    const doc = this.el.ownerDocument;
    const frameEl = doc.defaultView?.frameElement as HTMLIFrameElement;
    this.sortOpts = enable
      ? {
          onStart({ sorter }: SorterOptions) {
            on(frameEl, 'pointermove', sorter.onMove);
          },
          onEnd({ sorter }: SorterOptions) {
            off(frameEl, 'pointermove', sorter.onMove);
          },
          customTarget({ event }: SorterOptions) {
            return doc.elementFromPoint(event.clientX, event.clientY);
          },
        }
      : null;
    method(frameEl, 'pointerenter', this.handleDragEnter);
    method(frameEl, 'pointermove', this.handleDragOver);
    method(document, 'pointerup', this.handleDrop);
    method(frameEl, 'pointerout', this.handleDragLeave);

    // Test with touch devices (seems like frameEl is not capturing pointer events).
    // on/off(document, 'pointermove', sorter.onMove); // for the sorter
    // enable && this.handleDragEnter({}); // no way to use pointerenter/pointerout
  }

  startCustom() {
    this.__customTglEff(true);
  }

  endCustom(cancel?: boolean) {
    this.over ? this.endDrop(cancel) : this.__customTglEff(false);
  }

  endDrop(cancel?: boolean, ev?: Event) {
    const { em, dragStop } = this;
    this.counter = 0;
    dragStop && dragStop(cancel);
    this.__customTglEff(false);
    em.trigger('canvas:dragend', ev);
  }

  handleDragLeave(ev: Event) {
    this.updateCounter(-1, ev);
  }

  updateCounter(value: number, ev: Event) {
    this.counter += value;
    this.counter === 0 && this.endDrop(true, ev);
  }

  handleDragEnter(ev: DragEvent | Event) {
    const { em, canvas } = this;
    const dt = (ev as DragEvent).dataTransfer;
    this.updateCounter(1, ev);
    if (this.over) return;
    this.over = true;
    const utils = em.get('Utils');
    // For security reason I can't read the drag data on dragenter, but
    // as I need it for the Sorter context I will use `dragContent` or just
    // any not empty element
    let content = em.get('dragContent') || '<br>';
    let dragStop: DragStop;
    let dragContent;
    em.stopDefault();

    // Select the right drag provider
    if (em.inAbsoluteMode()) {
      const wrapper = em.get('DomComponents').getWrapper();
      const target = wrapper.append({})[0];
      const dragger = em.get('Commands').run('core:component-drag', {
        event: ev,
        guidesInfo: 1,
        center: 1,
        target,
        onEnd: (ev: any, dragger: any, { cancelled }: any) => {
          let comp;
          if (!cancelled) {
            comp = wrapper.append(content)[0];
            const canvasOffset = canvas.getOffset();
            const { top, left, position } = target.getStyle();
            comp.addStyle({
              left: parseFloat(left) - canvasOffset.left + 'px',
              top: parseFloat(top) - canvasOffset.top + 'px',
              position,
            });
          }
          this.handleDragEnd(comp, dt);
          target.remove();
        },
      });
      dragStop = (cancel?: boolean) => dragger.stop(ev, { cancel });
      dragContent = (cnt: any) => (content = cnt);
    } else {
      const sorter = new utils.Sorter({
        em,
        wmargin: 1,
        nested: 1,
        canvasRelative: 1,
        direction: 'a',
        container: this.el,
        placer: canvas.getPlacerEl(),
        containerSel: '*',
        itemSel: '*',
        pfx: 'gjs-',
        onEndMove: (model: any) => this.handleDragEnd(model, dt),
        document: this.el.ownerDocument,
        ...(this.sortOpts || {}),
      });
      sorter.setDropContent(content);
      sorter.startSort();
      this.sorter = sorter;
      dragStop = (cancel?: boolean) => {
        cancel && (sorter.moved = 0);
        sorter.endMove();
      };
      dragContent = (content: any) => sorter.setDropContent(content);
    }

    this.dragStop = dragStop;
    this.dragContent = dragContent;
    em.trigger('canvas:dragenter', dt, content);
  }

  handleDragEnd(model: any, dt: any) {
    const { em } = this;
    this.over = false;
    if (model) {
      em.set('dragResult', model);
      em.trigger('canvas:drop', dt, model);
    }
    em.runDefault({ preserveSelected: 1 });
  }

  /**
   * Always need to have this handler active for enabling the drop
   * @param {Event} ev
   */
  handleDragOver(ev: Event) {
    ev.preventDefault();
    this.em.trigger('canvas:dragover', ev);
  }

  /**
   * WARNING: This function might fail to run on drop, for example, when the
   * drop, accidentally, happens on some external element (DOM not inside the iframe)
   */
  handleDrop(ev: Event | DragEvent) {
    ev.preventDefault();
    const { dragContent } = this;
    const dt = (ev as DragEvent).dataTransfer;
    const content = this.getContentByData(dt).content;
    (ev.target as HTMLElement).style.border = '';
    content && dragContent && dragContent(content);
    this.endDrop(!content, ev);
  }

  getContentByData(dt: any) {
    const em = this.em;
    const types = dt && dt.types;
    const files = (dt && dt.files) || [];
    const dragContent = em.get('dragContent');
    let content = dt && dt.getData('text');

    if (files.length) {
      content = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const type = file.type.split('/')[0];

        if (type == 'image') {
          content.push({
            type,
            file,
            attributes: { alt: file.name },
          });
        }
      }
    } else if (dragContent) {
      content = dragContent;
    } else if (indexOf(types, 'text/html') >= 0) {
      content = dt && dt.getData('text/html').replace(/<\/?meta[^>]*>/g, '');
    } else if (indexOf(types, 'text/uri-list') >= 0) {
      content = {
        type: 'link',
        attributes: { href: content },
        content: content,
      };
    } else if (indexOf(types, 'text/json') >= 0) {
      const json = dt && dt.getData('text/json');
      json && (content = JSON.parse(json));
    } else if (types.length === 1 && types[0] === 'text/plain') {
      // Avoid dropping non-selectable and non-editable text nodes inside the editor
      content = `<div>${content}</div>`;
    }

    const result = { content };
    em.trigger('canvas:dragdata', dt, result);

    return result;
  }
}
