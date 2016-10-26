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
      //this.config.dragHelper(this.el.cloneNode(1));
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
      var className = this.ppfx + 'block';
      this.$el.addClass(className);
      this.el.innerHTML = '<div class="' + className + '-label">' + this.model.get('label') + '</div>';
      return this;
    },

  });
});
