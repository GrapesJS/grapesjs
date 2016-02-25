define(['backbone', 'text!./../template/classTag.html'],
  function (Backbone, tagTemplate) {
  /**
   * @class ClassTagView
   * */
  return Backbone.View.extend({

    template: _.template(tagTemplate),

    events: {},

    initialize: function(o) {
      this.config = o.config || {};
      this.pfx = this.config.stylePrefix;
      this.className = this.pfx + 'tag';
      this.closeId = this.pfx + 'close';
      this.events['click #' + this.closeId ] = 'removeTag';

      this.delegateEvents();
    },

    /**
     * Remove tag from the selected component
     * @param {Object} e
     */
    removeTag: function(e){
      var comp = this.config.target.get('selectedComponent');

      if(comp)
        comp.get('classes').remove(this.model);

      this.remove();
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
