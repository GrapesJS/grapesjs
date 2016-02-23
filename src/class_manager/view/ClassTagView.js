define(['backbone'],
  function (Backbone) {
  /**
   * @class ClassTagView
   * */
  return Backbone.View.extend({

    initialize: function(o) {
      this.config = o.config || {};
      this.pfx = this.config.stylePrefix;
      this.className = this.pfx + 'tag';
    },

    /** @inheritdoc */
    render : function(){
      this.$el.html(this.model.get('name')+': ' + this.model.get('label'));
      this.$el.attr('class', this.className);
      return this;
    },

  });
});
