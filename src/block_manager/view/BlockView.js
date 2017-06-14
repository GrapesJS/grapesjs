var Backbone = require('backbone');

module.exports = Backbone.View.extend({

  events: {
    mousedown: 'onDrag'
  },

  initialize(o, config) {
    _.bindAll(this, 'onDrop');
    this.config = config || {};
    this.ppfx = this.config.pStylePrefix || '';
    this.listenTo(this.model, 'destroy', this.remove);
    this.doc = $(document);
  },

  /**
   * Start block dragging
   * @private
   */
  onDrag(e) {
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
    this.doc.on('mouseup', this.onDrop);
  },

  /**
   * Drop block
   * @private
   */
  onDrop() {
    this.doc.off('mouseup', this.onDrop);
    this.config.getSorter().endMove();
  },

  render() {
    var className = this.ppfx + 'block';
    this.$el.addClass(className);
    this.el.innerHTML = '<div class="' + className + '-label">' + this.model.get('label') + '</div>';
    return this;
  },

});
