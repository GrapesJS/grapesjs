import Backbone from 'backbone';
import { isObject } from 'underscore';
import { on, off, hasDnd } from 'utils/mixins';

module.exports = Backbone.View.extend({
  events: {
    mousedown: 'startDrag',
    dragstart: 'handleDragStart',
    dragend: 'handleDragEnd'
  },

  initialize(o, config = {}) {
    this.em = config.em;
    this.config = config;
    this.endDrag = this.endDrag.bind(this);
    this.ppfx = config.pStylePrefix || '';
    this.listenTo(this.model, 'destroy remove', this.remove);
  },

  /**
   * Start block dragging
   * @private
   */
  startDrag(e) {
    const config = this.config;
    //Right or middel click
    if (e.button !== 0 || !config.getSorter || this.el.draggable) return;
    config.em.refreshCanvas();
    const sorter = config.getSorter();
    sorter.setDragHelper(this.el, e);
    sorter.setDropContent(this.model.get('content'));
    sorter.startSort(this.el);
    on(document, 'mouseup', this.endDrag);
  },

  handleDragStart(ev) {
    const content = this.model.get('content');
    const isObj = isObject(content);
    const type = isObj ? 'text/json' : 'text';
    const data = isObj ? JSON.stringify(content) : content;

    // Note: data are not available on dragenter for security reason,
    // but will use dragContent as I need it for the Sorter context
    // IE11 supports only 'text' data type
    ev.dataTransfer.setData('text', data);
    this.em.set('dragContent', content);
  },

  handleDragEnd() {
    this.em.set('dragContent', '');
  },

  /**
   * Drop block
   * @private
   */
  endDrag(e) {
    off(document, 'mouseup', this.endDrag);
    const sorter = this.config.getSorter();

    // After dropping the block in the canvas the mouseup event is not yet
    // triggerd on 'this.doc' and so clicking outside, the sorter, tries to move
    // things (throws false positives). As this method just need to drop away
    // the block helper I use the trick of 'moved = 0' to void those errors.
    sorter.moved = 0;
    sorter.endMove();
  },

  render() {
    const el = this.el;
    const pfx = this.ppfx;
    const className = `${pfx}block`;
    const label = this.model.get('label');
    el.className += ` ${className} ${pfx}one-bg ${pfx}four-color-h`;
    el.innerHTML = `<div class="${className}-label">${label}</div>`;
    el.title = el.textContent.trim();
    hasDnd(this.em) && el.setAttribute('draggable', true);
    return this;
  }
});
