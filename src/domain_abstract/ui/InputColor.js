define(['backbone', './Input', 'Spectrum', 'text!./templates/inputColor.html'],
	function (Backbone, Input, Spectrum, inputTemplate) {

	return Input.extend({

		template: _.template(inputTemplate),

		initialize: function(opts) {
			Input.prototype.initialize.apply(this, arguments);
			var ppfx = this.ppfx;
			this.colorCls = ppfx + 'field-color-picker';
			this.inputClass = ppfx + 'field ' + ppfx + 'field-color';
			this.colorHolderClass = ppfx + 'field-colorp-c';

			this.listenTo(this.model, 'change:value', this.handleModelChange);
		},

    /**
		 * Updates the view when the model is changed
		 * */
		handleModelChange: function() {
			Input.prototype.handleModelChange.apply(this, arguments);

			var value = this.model.get('value');
			var colorEl = this.getColorEl();

			// If no color selected I will set white for the picker
			value = value === 'none' ? '#fff' : value;
			colorEl.spectrum('set', value);
			colorEl.get(0).style.backgroundColor = value;
		},

		/**
		 * Get the color input element
		 * @return {HTMLElement}
		 */
    getColorEl: function() {
      if(!this.colorEl) {
				var model = this.model;
				var colorEl = $('<div>', {class: this.colorCls});
				var cpStyle = colorEl.get(0).style;
				var elToAppend = this.target && this.target.config ? this.target.config.el : '';
				colorEl.spectrum({
					appendTo: elToAppend || 'body',
					maxSelectionSize: 8,
					showPalette: true,
					showAlpha: 	true,
					chooseText: 'Ok',
					cancelText: '⨯',
					palette: [],
					move: function(color) {
						var c	= color.getAlpha() == 1 ? color.toHexString() : color.toRgbString();
						cpStyle.backgroundColor = c;
					},
					change: function(color) {
						var c	= color.getAlpha() == 1 ? color.toHexString() : color.toRgbString();
						c = c.replace(/ /g,'');
						cpStyle.backgroundColor = c;
						model.set('value', c);
					}
				});
				this.colorEl = colorEl;
      }
      return this.colorEl;
    },

		render: function() {
			Input.prototype.render.apply(this, arguments);
			this.$el.find('.' + this.colorHolderClass).html(this.getColorEl());
			return this;
		}

	});
});
