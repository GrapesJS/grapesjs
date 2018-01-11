/*
  This class makes the canvas droppable
 */

import { on } from 'utils/mixins';
import { bindAll } from 'underscore';

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
    em.set('dragContent', '');
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
      onEndMove: () => em.runDefault(),
      document: canvas.getFrameEl().contentDocument
    });
    const content = this.getContentByData(dt).content || '<br>';
    this.sorter.setDropContent(content); // should not be empty
    this.sorter.startSort(this.el);
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
    this.em.trigger('canvas:drop', dt, content);
  }

  getContentByData(dataTransfer) {
    const em = this.em;
    const types = dataTransfer.types;
    const files = dataTransfer.files;
    const dragContent = em.get('dragContent'); // Used by blocks
    let content = dataTransfer.getData('text');

    if (files.length) {
      content = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        content.push({
          type: 'image',
          attributes: { alt: file.name }
        });
      }
      const fu = em.get('AssetManager').FileUploader();
      fu.uploadFile({ dataTransfer }, res => console.log('RES upload', res));
    } else if (types.indexOf('text/html') >= 0) {
      content = dataTransfer
        .getData('text/html')
        .replace(/<\/?meta[^>]*>/g, '');
    } else if (types.indexOf('text/uri-list') >= 0) {
      content = {
        type: 'link',
        attributes: { href: content },
        content: content
      };
    } else if (dragContent) {
      content = dragContent;
    } else {
      content = content && `<div>${content}</div>`;
    }

    const result = { content, dragContent };
    em.trigger('canvas:dragdata', dataTransfer, result);

    return result;
  }
}
