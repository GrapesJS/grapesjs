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