define(['backbone'],
function(Backbone) {
  /**
   * @class CanvasView
   * */
  return Backbone.View.extend({

    tagName: 'iframe',

    attributes: {
      src: 'about:blank',
      allowfullscreen: 'allowfullscreen'
    },

    initialize: function(o) {
      _.bindAll(this, 'udpateOffset');
      this.config = o.config || {};
      this.ppfx = this.config.pStylePrefix || '';
      this.em = this.config.em;
      this.motionsEv = 'transitionend oTransitionEnd transitionend webkitTransitionEnd';
      this.listenTo(this.em, 'change:device', this.updateWidth);
    },

    /**
     * Update width of the frame
     * @private
     */
    updateWidth: function(model){
      var device = this.em.getDeviceModel();
      this.el.style.width = device ? device.get('width') : '';
      this.udpateOffset();
      this.$el.on(this.motionsEv, this.udpateOffset);
    },

    udpateOffset: function(){
      var offset = this.em.get('Canvas').getOffset();
      this.em.set('canvasOffset', offset);
      this.$el.off(this.motionsEv, this.udpateOffset);
    },

    getBody: function(){
      this.$el.contents().find('body');
    },

    getWrapper: function(){
      return this.$el.contents().find('body > div');
    },

    render: function() {
      this.$el.attr({class: this.ppfx + 'frame'});
      return this;
    },

  });
});
