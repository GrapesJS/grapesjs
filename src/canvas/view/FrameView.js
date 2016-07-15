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
     */
    updateWidth: function(model){
      // Refactor: maybe its better put it inside EditorModel
      // as I will use it also inside Style Manager
      // editor.getMediaWidth();
      var value = model.get('device');
      var media = em.get('Devices').get(value);
      if(!media)
        return;
      this.el.style.width = media.get('width');
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