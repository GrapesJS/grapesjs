define(['backbone', 'text!./../template/classTag.html'],
  function (Backbone, tagTemplate) {
  /**
   * @class ClassTagView
   * */
  return Backbone.View.extend({

    template: _.template(tagTemplate),

    initialize: function(o) {
      this.config = o.config || {};
      this.pfx = this.config.stylePrefix;
      this.className = this.pfx + 'tag';
    },

    /** @inheritdoc */
    render : function(){
      this.$el.html( this.template({
        label: this.model.get('label'),
        pfx: this.pfx,
      }));
      this.$el.attr('class', this.className);
      return this;
    },

  });
});
