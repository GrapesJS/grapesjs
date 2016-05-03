define(['backbone','./PropertyView', 'text!./../templates/propertySelect.html'],
	function (Backbone, PropertyView, propertyTemplate) {
	/**
	 * @class PropertySelectView
	 * */
	return PropertyView.extend({

		template: _.template(propertyTemplate),

		initialize: function(options) {
			PropertyView.prototype.initialize.apply(this, arguments);
			this.list = this.model.get('list') || [];
		},

		/** @inheritdoc */
		renderInput: function() {
			var pfx	= this.pfx;
			if(!this.$input){
				this.input = '<select>';

				if(this.list && this.list.length){
					_.each(this.list,function(el){
						var name = el.name ? el.name : el.value;
						var style = el.style ? el.style.replace(/"/g,'&quot;') : '';
						var styleAttr = style ? 'style="' + style + '"' : '';
						this.input += '<option value="'+el.value.replace(/"/g,'&quot;')+'" ' + styleAttr + '>'+name+'</option>';
					}, this);
				}

				this.input 	+= '</select>';
				this.$input = $(this.input);
				this.$el.find('#'+ pfx +'input-holder').html(this.$input);
			}
			this.setValue(this.componentValue, 0);
		},

	});
});
