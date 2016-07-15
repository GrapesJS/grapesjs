define(['backbone'],
function(Backbone) {
  /**
   * @class CanvasView
   * */
  return Backbone.View.extend({

    tagName: 'iframe',

    attributes: {
      src: 'about:blank'
    },

    initialize: function(o) {
      this.config = o.config || {};
      this.ppfx = this.config.pStylePrefix || '';
      this.em = this.config.em;
      this.listenTo(this.em, 'change:device', this.updateWidth);
    },

    /**
     * Update width of the frame
     * @private
     */
    updateWidth: function(model){
      var device = this.em.getDeviceModel();
      this.el.style.width = device ? device.get('width') : '';
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