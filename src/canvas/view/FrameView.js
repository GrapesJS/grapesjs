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

    getBody: function(){
      this.$el.contents().find('body');
    },

    getWrapper: function(){
      return this.$el.contents().find('body div');
    },

    render: function() {
      this.$el.attr({
        class: 'testframe',
        style: 'width: 50%; display: block; height: 80%; border: medium none; margin: 50px auto 0; background-color: white',
      });
      return this;
    },

  });
});