define(['backbone'],
function(Backbone) {

  return Backbone.View.extend({

    events: {
      mousedown: 'onDrag'
    },

    initialize: function(o, config) {
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
    onDrag: function(){
      if(!this.config.getSorter)
        return;
      var sorter = this.config.getSorter();
      sorter.startSort(this.el);
      sorter.setDropContent(this.model.get('content'));
      this.doc.on('mouseup', this.onDrop);
    },

    /**
     * Drop block
     * @private
     */
    onDrop: function(){
      this.doc.off('mouseup', this.onDrop);
      this.config.getSorter().endMove();
    },

    render: function() {
      this.el.innerHTML = this.model.get('label');
      this.$el.addClass(this.ppfx + 'block');
      return this;
    },

  });
});