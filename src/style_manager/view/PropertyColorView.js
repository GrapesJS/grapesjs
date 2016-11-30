define(['backbone','./PropertyView', 'Spectrum', 'text!./../templates/propertyColor.html'],
	function (Backbone, PropertyView, Spectrum, propertyTemplate) {
	/**
	 * @class PropertyColorView
	 * */
	return PropertyView.extend({

		template: _.template(propertyTemplate),

		/** @inheritdoc */
		renderInput: function() {
			if(!this.$input){
				this.$input = $('<input>', {placeholder: this.defaultValue, type: 'text' });
				this.$el.find('#' + this.pfx + 'input-holder').html(this.$input);
			}
			if(!this.$colorPicker){
				this.$colorPicker = $('<div>', {class: this.ppfx + "field-color-picker"});
				cpStyle = this.$colorPicker.get(0).style;
				var that = this;
				var el = this.target.config ? this.target.config.el : '';
				this.$colorPicker.spectrum({
					appendTo: el || 'body',
					showPalette: true,
					maxSelectionSize: 8,
					palette: [],
					showAlpha: 	true,
					chooseText: 'Ok',
					cancelText: '⨯',
					move: function(color) {
						var c	= color.getAlpha() == 1 ? color.toHexString() : color.toRgbString();
						cpStyle.backgroundColor = c;
					},
					change: function(color) {
						var c	= color.getAlpha() == 1 ? color.toHexString() : color.toRgbString();
						c = c.replace(/ /g,'');
						cpStyle.backgroundColor = c;
						that.model.set('value', c);
					}
				});
				this.$el.find('.' + this.ppfx + 'field-colorp-c').append(this.$colorPicker);
			}
			this.setValue(this.componentValue, 0);
		},

		/** @inheritdoc */
		setValue: function(value, f){
			PropertyView.prototype.setValue.apply(this, arguments);
			var v = this.model.get('value') || this.defaultValue;
			v = value || v;
			if(this.$colorPicker){
				v = v === 'none' ? '#fff' : v;
				this.$colorPicker.spectrum("set", v);
				this.$colorPicker.get(0).style.backgroundColor = v;
			}
		},

	});
});
