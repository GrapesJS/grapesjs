define(['backbone', 'text!./../template/classTag.html'],
  function (Backbone, tagTemplate) {
  return Backbone.View.extend({

    template: _.template(tagTemplate),

    events: {},

    initialize: function(o) {
      this.config = o.config || {};
      this.coll = o.coll || null;
      this.pfx = this.config.stylePrefix || '';
      this.ppfx = this.config.pStylePrefix || '';
      this.inputProp = 'readonly';
      this.target = this.config.em;
      this.className = this.pfx + 'tag';
      this.closeId = this.pfx + 'close';
      this.chkId = this.pfx + 'checkbox';
      this.labelId = this.pfx + 'tag-label';
      this.events['click #' + this.closeId ] = 'removeTag';
      this.events['click #' + this.chkId ] = 'changeStatus';
      this.events['dblclick #' + this.labelId ] = 'startEditTag';
      this.events['keypress #' + this.labelId + ' input'] = 'updateInputLabel';
      this.events['blur #' + this.labelId + ' input'] = 'endEditTag';

      this.listenTo( this.model, 'change:active', this.updateStatus);
      this.delegateEvents();
    },

    /**
     * Start editing tag
     * @private
     */
    startEditTag: function(){
      this.$labelInput.prop(this.inputProp, false);
    },

    /**
     * End editing tag. If the class typed already exists the
     * old one will be restored otherwise will be changed
     * @private
     */
    endEditTag: function(){
      var value = this.$labelInput.val();
      var next = this.model.escapeName(value);

      if(this.target){
        var clsm = this.target.get('SelectorManager');

        if(clsm){
          if(clsm.get(next))
            this.$labelInput.val(this.model.get('label'));
          else
            this.model.set({ name: next, label: value});
        }
      }
      this.$labelInput.prop(this.inputProp, true);
    },

    /**
     * Update status of the tag
     * @private
     */
    changeStatus: function(){
      this.model.set('active', !this.model.get('active'));
      this.target.trigger('targetClassUpdated');
    },

    /**
     * Remove tag from the selected component
     * @param {Object} e
     * @private
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
     * @private
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

    /**
     * Update label's input
     * @private
     */
    updateInputLabel: function(){
      if(!this.$labelInput)
        this.$labelInput = this.$el.find('input');
      var size = this.$labelInput.val().length - 1;
      size = size < 1 ? 1 : size;
      this.$labelInput.attr('size', size);
    },


    render : function(){
      this.$el.html( this.template({
        label: this.model.get('label'),
        pfx: this.pfx,
        ppfx: this.ppfx,
        inputProp: this.inputProp,
      }));
      this.updateStatus();
      this.$el.attr('class', this.className);
      this.updateInputLabel();
      return this;
    },

  });
});
