import { on, off } from 'utils/mixins';
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

  endDrop(cancel) {
    this.counter = 0;
    this.over = 0;
    console.log('DROP END');
    // force out like in BlockView
    const sorter = this.sorter;
    cancel && (sorter.moved = 0);
    this.em.set('dragContent', '');
    sorter.endMove();
  }

  handleDragLeave(ev) {
    this.updateCounter(-1);
  }

  updateCounter(value) {
    this.counter += value;
    if (this.counter === 0) {
      this.endDrop(1);
    }
  }

  handleDragEnter(ev) {
    const em = this.em;
    this.updateCounter(1);
    if (this.over) return;
    this.over = 1;
    console.log('IM IN');

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
    const content = this.getContentByData(ev.dataTransfer) || '<br>';
    this.sorter.setDropContent(content); // should not be empty
    this.sorter.startSort(this.el);
  }

  /**
   * Always need to have this handler active for enabling the drop
   * @param {Event} ev
   */
  handleDragOver(ev) {
    ev.preventDefault();
  }

  handleDrop(ev) {
    ev.preventDefault();
    var content = this.getContentByData(ev.dataTransfer);
    ev.target.style.border = '';
    if (content) {
      this.sorter.setDropContent(content);
    } else {
      this.sorter.moved = 0;
    }
    this.endDrop();
  }

  getContentByData(dataTransfer) {
    let result = dataTransfer.getData('text');
    let dragContent = this.em.get('dragContent');
    const types = dataTransfer.types;
    const files = dataTransfer.files;
    console.log('Files', files);

    const items = dataTransfer.items;
    for (var i = 0; i < items.length; i++) console.log('DataType', items[i]);

    if (files.length) {
      result = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        result.push({
          type: 'image',
          attributes: { alt: file.name }
        });
      }
      const fu = this.em.get('AssetManager').FileUploader();
      fu.uploadFile({ dataTransfer }, res => console.log('RES upload', res));
    } else if (types.indexOf('text/html') >= 0) {
      result = dataTransfer.getData('text/html').replace(/<\/?meta[^>]*>/g, '');
    } else if (types.indexOf('text/uri-list') >= 0) {
      result = {
        type: 'link',
        attributes: { href: result },
        content: result
      };
    } else if (dragContent) {
      result = dragContent;
    } else {
      result = result && `<div>${result}</div>`;
    }

    //this.uploadFile(e);
    console.log('CONTENT', result);
    // TODO result = clbContent(result);
    return result;
  }
}
