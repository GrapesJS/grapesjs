import {on, off} from 'utils/mixins';

module.exports = Backbone.View.extend({

  events: {
    mousedown: 'startDrag'
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
    //Right or middel click
    if (e.button !== 0) {
      return;
    }

    if(!this.config.getSorter) {
      return;
    }

    this.config.em.refreshCanvas();
    var sorter = this.config.getSorter();
    sorter.setDragHelper(this.el, e);
    sorter.setDropContent(this.model.get('content'));
    sorter.startSort(this.el);
    on(document, 'mouseup', this.endDrag);
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
    el.innerHTML = `<div class="${className}-label">${this.model.get('label')}</div>`;
    return this;
  },

});
