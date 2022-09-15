/*
  This class makes the canvas droppable
 */

import { bindAll, indexOf } from 'underscore';
import { on, off } from './mixins';

export default class Droppable {
  constructor(em, rootEl) {
    this.em = em;
    const el =
      rootEl ||
      em
        .get('Canvas')
        .getFrames()
        .map(frame => frame.getComponent().getEl());
    const els = Array.isArray(el) ? el : [el];
    this.el = el;
    this.counter = 0;
    bindAll(this, 'handleDragEnter', 'handleDragOver', 'handleDrop', 'handleDragLeave');
    els.forEach(el => this.toggleEffects(el, 1));

    return this;
  }

  toggleEffects(el, enable) {
    const methods = { on, off };
    const method = enable ? 'on' : 'off';
    methods[method](el, 'dragenter', this.handleDragEnter);
    methods[method](el, 'dragover', this.handleDragOver);
    methods[method](el, 'drop', this.handleDrop);
    methods[method](el, 'dragleave', this.handleDragLeave);
  }

  __customTglEff(enable) {
    const method = enable ? on : off;
    const doc = this.el.ownerDocument;
    const frameEl = doc.defaultView.frameElement;
    this.sortOpts = enable
      ? {
          onStart({ sorter }) {
            on(frameEl, 'pointermove', sorter.onMove);
          },
          onEnd({ sorter }) {
            off(frameEl, 'pointermove', sorter.onMove);
          },
          customTarget({ event }) {
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

  endCustom(cancel) {
    this.over ? this.endDrop(cancel) : this.__customTglEff(false);
  }

  endDrop(cancel, ev) {
    const { em, dragStop } = this;
    this.counter = 0;
    dragStop && dragStop(cancel);
    this.__customTglEff(false);
    em.trigger('canvas:dragend', ev);
  }

  handleDragLeave(ev) {
    this.updateCounter(-1, ev);
  }

  updateCounter(value, ev) {
    this.counter += value;
    this.counter === 0 && this.endDrop(1, ev);
  }

  handleDragEnter(ev) {
    const { em } = this;
    const dt = ev.dataTransfer;
    this.updateCounter(1, ev);
    if (this.over) return;
    this.over = 1;
    const utils = em.get('Utils');
    const canvas = em.get('Canvas');
    // For security reason I can't read the drag data on dragenter, but
    // as I need it for the Sorter context I will use `dragContent` or just
    // any not empty element
    let content = em.get('dragContent') || '<br>';
    let dragStop, dragContent;
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
        onEnd: (ev, dragger, { cancelled }) => {
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
      dragStop = cancel => dragger.stop(ev, { cancel });
      dragContent = cnt => (content = cnt);
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
        onEndMove: model => this.handleDragEnd(model, dt),
        document: this.el.ownerDocument,
        ...(this.sortOpts || {}),
      });
      sorter.setDropContent(content);
      sorter.startSort();
      this.sorter = sorter;
      dragStop = cancel => {
        cancel && (sorter.moved = 0);
        sorter.endMove();
      };
      dragContent = content => sorter.setDropContent(content);
    }

    this.dragStop = dragStop;
    this.dragContent = dragContent;
    em.trigger('canvas:dragenter', dt, content);
  }

  handleDragEnd(model, dt) {
    const { em } = this;
    this.over = 0;
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
  handleDragOver(ev) {
    ev.preventDefault();
    this.em.trigger('canvas:dragover', ev);
  }

  /**
   * WARNING: This function might fail to run on drop, for example, when the
   * drop, accidentally, happens on some external element (DOM not inside the iframe)
   */
  handleDrop(ev) {
    ev.preventDefault();
    const { dragContent } = this;
    const dt = ev.dataTransfer;
    const content = this.getContentByData(dt).content;
    ev.target.style.border = '';
    content && dragContent && dragContent(content);
    this.endDrop(!content, ev);
  }

  getContentByData(dt) {
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
