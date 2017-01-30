define(['backbone','./PropertyView', 'text!./../templates/propertyRadio.html'],
	function (Backbone, PropertyView, propertyTemplate) {
	/**
	 * @class PropertyRadioView
	 * */
	return PropertyView.extend({

		template: _.template(propertyTemplate),

		initialize: function(options) {
			PropertyView.prototype.initialize.apply(this, arguments);
			this.list = this.model.get('list') || [];
			this.className = this.className + ' '+ this.pfx +'list';
		},

		/** @inheritdoc */
		renderInput: function() {
			var pfx	= this.pfx;
			var ppfx	= this.ppfx;
			var itemCls = ppfx + 'radio-item-label';
			if(!this.$input){
				if(this.list && this.list.length){
					this.input = '';
					_.each(this.list,function(el){
						var cl = el.className ? el.className + ' ' + pfx + 'icon ' + itemCls : '',
							id = this.property + '-' + el.value,
							labelTxt = el.name ? el.name : el.value;
							titleAttr = el.title ? 'title="' + el.title + '"': '';
						this.input += '<div class="' + ppfx + 'radio-item">'+
							'<input class="'+pfx+'radio" type="radio" id="'+ id +'" name="'+this.property+'" value="'+el.value+'" />'+
							'<label class="'+(cl ? cl : itemCls)+'" ' + titleAttr + ' for="'+ id +'">' + (cl ? '' : labelTxt) + '</label></div>';
					},this);
					this.$inputEl = $(this.input);
					this.$el.find('#'+ pfx +'input-holder').html(this.$inputEl);
					this.$input = this.$inputEl.find('input[name="'+this.property+'"]');
				}
			}
			this.setValue(this.componentValue);
		},

		/**
		 * Returns value from input
		 * @return {string}
		 */
		getInputValue: function(){
			return this.$input ? this.$el.find('input:checked').val() : '';
		},

		/** @inheritdoc */
		setValue: function(value){
			var v = this.model.get('value') || this.defaultValue;

			if(value)
				v	= value;

			if(this.$input)
				this.$input.filter('[value="'+v+'"]').prop('checked', true);

			this.model.set({value: v},{silent: true});
		},

	});
});
