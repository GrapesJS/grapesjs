define(['backbone', 'text!./templates/inputColor.html'],
	function (Backbone, inputTemplate) {

	return Backbone.View.extend({

		events: {},

		template: _.template(inputTemplate),

		initialize: function(opts) {
      var ppfx = opts.ppfx || '';
			this.ppfx = ppfx;
			this.inputCls = ppfx + 'input-number';
			this.colorCls = ppfx + 'field-color-picker';
      this.events['change .' + this.inputCls] = 'handleChange';
      this.events['change .' + this.unitCls] = 'handleUnitChange';

			this.listenTo(this.model, 'change:value', this.handleModelChange);
			this.delegateEvents();
		},

		/**
		 * Set value to the model
		 * @param {string} value
		 * @param {Object} opts
		 */
		setValue: function(value, opts) {
			var opt = opts || {};
			var model = this.model;
			var val = value || model.get('defaults');

			var valid = this.validateInputValue(value, {deepCheck: 1});
			var validObj = {value: valid.value};

			this.model.set(val, opt);

			if(opt.silent) {
				this.handleModelChange();
			}
		},

    /**
     * Handled when the view is changed
     */
    handleChange: function (e) {
			e.stopPropagation();
      this.setValue(this.getInputEl().value);
    },

    /**
     * Handled when the view is changed
     */
    handleUnitChange: function (e) {
			e.stopPropagation();
      var value = this.getUnitEl().value;
      this.model.set('unit', value);
    },

    /**
		 * Updates the view when the model is changed
		 * */
		handleModelChange: function() {
      var m = this.model;
			var value = m.get('value');
      this.getInputEl().value = value;

			var colorEl = this.getColorEl();
			colorEl.spectrum('set', value);
			colorEl.get(0).style.backgroundColor = value;
		},

		/**
		 * Get the input element
		 * @return {HTMLElement}
		 */
    getInputEl: function() {
      if(!this.inputEl) {
        this.inputEl = $('<input>', {
					type: 'text',
					class: this.inputCls,
					placeholder: this.model.get('defaults')
				});
      }
      return this.inputEl.get(0);
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
				var elToAppend = this.target.config ? this.target.config.el : '';
				colorEl.spectrum({
					appendTo: el || 'body',
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
      return this.colorEl && this.colorEl.get(0);
    },

		render: function() {
			var ppfx = this.ppfx;
			var el = this.$el;
			el.html(this.template({ppfx: ppfx}));
			el.find('.' + ppfx +'input-holder').html(this.getInputEl());
			el.find('.' + ppfx + 'field-colorp-c').html(this.getColorEl());
			el.addClass(ppfx + 'field ' + ppfx + 'field-color');
			return this;
		}

	});
});
