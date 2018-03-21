/*
  This class makes the canvas droppable
 */

import { on } from 'utils/mixins';
import { bindAll, indexOf } from 'underscore';

export default class Droppable {
  constructor(em) {
    this.em = em;
    const el = em
      .get('DomComponents')
      .getWrapper()
      .getEl();
    this.el = el;
    this.counter = 0;
    bindAll(
      this,
      'handleDragEnter',
      'handleDragOver',
      'handleDrop',
      'handleDragLeave'
    );
    on(el, 'dragenter', this.handleDragEnter);
    on(el, 'dragover', this.handleDragOver);
    on(el, 'drop', this.handleDrop);
    on(el, 'dragleave', this.handleDragLeave);

    return this;
  }

  endDrop(cancel, ev) {
    const em = this.em;
    this.counter = 0;
    this.over = 0;
    // force out like in BlockView
    const sorter = this.sorter;
    cancel && (sorter.moved = 0);
    sorter.endMove();
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
    const em = this.em;
    const dt = ev.dataTransfer;
    this.updateCounter(1, ev);
    if (this.over) return;
    this.over = 1;
    const utils = em.get('Utils');
    const canvas = em.get('Canvas');
    this.sorter = new utils.Sorter({
      em,
      wmargin: 1,
      nested: 1,
      canvasRelative: 1,
      direction: 'a',
      container: canvas.getBody(),
      placer: canvas.getPlacerEl(),
      eventMoving: 'mousemove dragover',
      containerSel: '*',
      itemSel: '*',
      pfx: 'gjs-',
      onStart: () => em.stopDefault(),
      onEndMove: model => {
        em.runDefault();

        if (model && model.get && model.get('activeOnRender')) {
          model.trigger('active');
          model.set('activeOnRender', 0);
        }

        model && em.trigger('canvas:drop', dt, model);
      },
      document: canvas.getFrameEl().contentDocument
    });
    // For security reason I can't read the drag data on dragenter, but
    // as I need it for the Sorter context I will use `dragContent` or just
    // any not empty element
    const content = em.get('dragContent') || '<br>';
    this.sorter.setDropContent(content);
    this.sorter.startSort();
    em.trigger('canvas:dragenter', dt, content);
  }

  /**
   * Always need to have this handler active for enabling the drop
   * @param {Event} ev
   */
  handleDragOver(ev) {
    ev.preventDefault();
    this.em.trigger('canvas:dragover', ev);
  }

  handleDrop(ev) {
    ev.preventDefault();
    const dt = ev.dataTransfer;
    const content = this.getContentByData(dt).content;
    ev.target.style.border = '';

    if (content) {
      this.sorter.setDropContent(content);
    } else {
      this.sorter.moved = 0;
    }

    this.endDrop(0, ev);
  }

  getContentByData(dataTransfer) {
    const em = this.em;
    const types = dataTransfer.types;
    const files = dataTransfer.files;
    const dragContent = em.get('dragContent');
    let content = dataTransfer.getData('text');

    if (files.length) {
      content = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const type = file.type.split('/')[0];

        if (type == 'image') {
          content.push({
            type,
            file,
            attributes: { alt: file.name }
          });
        }
      }
    } else if (dragContent) {
      content = dragContent;
    } else if (indexOf(types, 'text/html') >= 0) {
      content = dataTransfer
        .getData('text/html')
        .replace(/<\/?meta[^>]*>/g, '');
    } else if (indexOf(types, 'text/uri-list') >= 0) {
      content = {
        type: 'link',
        attributes: { href: content },
        content: content
      };
    } else if (indexOf(types, 'text/json') >= 0) {
      const json = dataTransfer.getData('text/json');
      json && (content = JSON.parse(json));
    }

    const result = { content };
    em.trigger('canvas:dragdata', dataTransfer, result);

    return result;
  }
}
