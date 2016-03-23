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
      this.coll = o.coll || null;
      this.pfx = this.config.stylePrefix || '';
      this.target = this.config.target;
      this.className = this.pfx + 'tag';
      this.closeId = this.pfx + 'close';
      this.chkId = this.pfx + 'checkbox';
      this.labelId = this.pfx + 'tag-label';
      this.events['click #' + this.closeId ] = 'removeTag';
      this.events['click #' + this.chkId ] = 'changeStatus';
      this.events['click #' + this.labelId ] = 'changeStatus';

      this.listenTo( this.model, 'change:active', this.updateStatus);

      this.delegateEvents();
    },

    changeStatus: function(){
      this.model.set('active', !this.model.get('active'));
      this.target.trigger('targetClassUpdated');
    },

    /**
     * Remove tag from the selected component
     * @param {Object} e
     */
    removeTag: function(e){
      var comp = this.target.get('selectedComponent');

      if(comp)
        comp.get('classes').remove(this.model);

      if(this.coll){
        this.coll.remove(this.model);
        this.target.trigger('targetClassRemoved');
      }

      this.remove();
    },

    /**
     * Update status of the checkbox
     */
    updateStatus: function(){
      if(!this.$chk)
        this.$chk = this.$el.find('#' + this.pfx + 'checkbox');

      if(this.model.get('active')){
        this.$chk.removeClass('fa-circle-o').addClass('fa-dot-circle-o');
        this.$el.removeClass('opac50');
      }else{
        this.$chk.removeClass('fa-dot-circle-o').addClass('fa-circle-o');
        this.$el.addClass('opac50');
      }
    },

    /** @inheritdoc */
    render : function(){
      this.$el.html( this.template({
        label: this.model.get('label'),
        pfx: this.pfx,
      }));
      this.updateStatus();
      this.$el.attr('class', this.className);
      return this;
    },

  });
});
