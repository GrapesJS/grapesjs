define(['backbone','./PropertyView', 'text!./../templates/propertyRadio.html'], 
	function (Backbone, PropertyView, propertyTemplate) {
	/** 
	 * @class PropertyRadioView
	 * */
	return PropertyView.extend({
		
		template: _.template(propertyTemplate),
		
		initialize: function(options) {
			PropertyView.prototype.initialize.apply(this, arguments);
			this.className 	= this.className + ' '+ this.pfx +'list';
		},
		
		/** @inheritdoc */
		renderInput: function() {
			var pfx	= this.pfx;
			if(!this.$input){
				if(this.list && this.list.length){
					this.input = '';
					_.each(this.list,function(el){
						var icon 		= el.icon ? el.icon+' '+ pfx + 'icon' : '',
							title 		= el.info ? el.info : '',
							id			= this.property+'-'+el.value;
						this.input 		+= '<div class="' + pfx + 'el">'+
							'<input class="'+pfx+'radio" type="radio" id="'+ id +'" name="'+this.property+'" value="'+el.value+'" />'+
							'<label class="'+icon+'" title="'+title+'" for="'+ id +'">' + (icon?'':el.value) + '</label></div>';
					},this);
					this.$input 		= $(this.input);
					this.$el.find('#'+ pfx +'input-holder').html(this.$input);
					this.$inputRadio 	= this.$input.find('input[name="'+this.property+'"]');
				}
			}
			this.setValue(this.componentValue);
		},
		
		/** @inheritdoc */
		setValue: function(value){
			var v 	= this.model.get('value') || this.defaultValue;
			if(value){
				v	= value;
			}
			if(this.$inputRadio){
				this.$inputRadio.filter('[value="'+v+'"]').prop('checked', true);
			}
			this.model.set({value: v},{silent: true});
		},

	});
});
