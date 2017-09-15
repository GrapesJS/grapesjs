var Backbone = require('backbone');

module.exports = Backbone.View.extend({

  events: {
    mousedown: 'startDrag'
  },

  initialize(o, config) {
    _.bindAll(this, 'endDrag');
    this.config = config || {};
    this.ppfx = this.config.pStylePrefix || '';
    this.listenTo(this.model, 'destroy remove', this.remove);
    this.doc = $(document);
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
    sorter.startSort(this.el);
    sorter.setDropContent(this.model.get('content'));
    this.doc.on('mouseup', this.endDrag);
  },

  /**
   * Drop block
   * @private
   */
  endDrag(e) {
    this.doc.off('mouseup', this.endDrag);
    const sorter = this.config.getSorter();

    // After dropping the block in the canvas the mouseup event is not yet
    // triggerd on 'this.doc' and so clicking outside, the sorter, tries to move
    // things (throws false positives). As this method just need to drop away
    // the block helper I use the trick of 'moved = 0' to void those errors.
    sorter.moved = 0;
    sorter.endMove();
  },

  render() {
    var className = this.ppfx + 'block';
    this.$el.addClass(className);
    this.el.innerHTML = '<div class="' + className + '-label">' + this.model.get('label') + '</div>';
    return this;
  },

});
