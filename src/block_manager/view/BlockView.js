import { on, off } from 'utils/mixins';

module.exports = Backbone.View.extend({
  events: {
    mousedown: 'startDrag',
    dragstart: 'handleDragStart'
  },

  initialize(o, config = {}) {
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
    // Can't put the content in dataTransfer as it will not be available
    // on `dragenter` event for security reason
    this.config.em.set('dragContent', content);
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
    el.className += ` ${className} ${pfx}one-bg ${pfx}four-color-h`;
    el.innerHTML = `<div class="${className}-label">${this.model.get(
      'label'
    )}</div>`;
    el.setAttribute('draggable', true);
    return this;
  }
});
