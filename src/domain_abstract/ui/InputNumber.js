define(['backbone', 'text!./templates/inputNumber.html'],
	function (Backbone, inputTemplate) {

	return Backbone.View.extend({

		events: {},

		template: _.template(inputTemplate),

		initialize: function(opts) {
			_.bindAll(this, 'moveIncrement', 'upIncrement');
      var ppfx = opts.ppfx || '';
			this.ppfx = ppfx;
			this.docEl = $(document);
			this.inputCls = ppfx + 'input-number';
			this.unitCls = ppfx + 'input-unit';
			this.events['click .' + ppfx + 'field-arrow-u'] = 'upArrowClick';
			this.events['click .' + ppfx + 'field-arrow-d'] = 'downArrowClick';
			this.events['mousedown .' + ppfx + 'field-arrows'] = 'downIncrement';
      this.events['change .' + this.inputCls] = 'handleChange';
      this.events['change .' + this.unitCls] = 'handleUnitChange';

			this.listenTo(this.model, 'change:unit change:value', this.handleModelChange);
			this.delegateEvents();
		},

		/**
		 * Set value to the model
		 * @param {string} value
		 * @param {Object} opts
		 */
		setValue: function(value, opts) {
			var opt = opts || {};
			var valid = this.validateInputValue(value, {deepCheck: 1});
			var validObj = {value: valid.value};

			// If found some unit value
      if(valid.unit || valid.force) {
        validObj.unit = valid.unit;
      }

			this.model.set(validObj, opt);

			// Generally I get silent when I need to reflect data to view without
			// reupdating the target
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
      this.getInputEl().value = m.get('value');
			var unit = this.getUnitEl();

			if (unit) {
				unit.value = m.get('unit');
			}
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
		 * Get the unit element
		 * @return {HTMLElement}
		 */
    getUnitEl: function() {
      if(!this.unitEl) {
				var model = this.model;
				var units = model.get('units') || [];
				if(units.length){
					var unitStr = '<select class="' + this.unitCls + '">';
					_.each(units, function(unit){
						var selected = unit == model.get('unit') ? 'selected': '';
						unitStr += '<option ' + selected + ' >' + unit + '</option>';
					});
					unitStr += '</select>';
					this.unitEl = $(unitStr);
				}
      }
      return this.unitEl && this.unitEl.get(0);
    },

		/**
		 * Invoked when the up arrow is clicked
		 * */
		upArrowClick: function() {
			var value	= this.model.get('value');
			value = isNaN(value) ? 1 : parseInt(value, 10) + 1;
			var valid = this.validateInputValue(value);
			this.model.set('value', valid.value);
		},

		/**
		 * Invoked when the down arrow is clicked
		 * */
		downArrowClick: function(){
			var value	= this.model.get('value');
			value = isNaN(value) ? 0 : parseInt(value, 10) - 1;
			var valid = this.validateInputValue(value);
			this.model.set('value', valid.value);
		},

		/**
		 * Change easily integer input value with click&drag method
		 * @param Event
		 *
		 * @return void
		 * */
		downIncrement: function(e) {
			e.preventDefault();
			this.moved = 0;
			var value = this.model.get('value');
			value = isNaN(value) ? 0 : parseInt(value, 10);
			var current = {y: e.pageY, val: value };
			this.docEl.mouseup(current, this.upIncrement);
			this.docEl.mousemove(current, this.moveIncrement);
		},

		/** While the increment is clicked, moving the mouse will update input value
		 * @param Object
		 *
		 * @return bool
		 * */
		moveIncrement: function (ev) {
			this.moved = 1;
			var pos = parseInt(ev.data.val - ev.pageY + ev.data.y, 10);
			this.prValue = this.validateInputValue(pos).value;//Math.max(this.min, Math.min(this.max, pos) );
			this.model.set('value', this.prValue, {avoidStore: 1});
			return false;
		},

		/**
		 * Stop moveIncrement method
		 * @param Object
		 *
		 * @return void
		 * */
		upIncrement: function (e) {
			this.docEl.off('mouseup', this.upIncrement);
			this.docEl.off('mousemove', this.moveIncrement);

			if(this.prValue && this.moved)
				this.model.set('value', this.prValue - 1, {silent:1}).set('value', this.prValue + 1);
		},

		/**
		 * Validate input value
		 * @param {String} value Raw value
		 * @param {Object} opts Options
		 * @return {Object} Validated string
		 */
		validateInputValue: function(value, opts) {
			var force = 0;
      var opt = opts || {};
			var model = this.model;
			var val = value || model.get('defaults');
			var units = model.get('units') || [];
      var unit = model.get('unit') || (units.length && units[0]) || '';
      var max = model.get('max');
      var min = model.get('min');

      if(opt.deepCheck) {
				var fixed = model.get('fixedValues') || [];

				if (val) {
					// If the value is one of the fixed values I leave it as it is
					var regFixed = new RegExp('^' + fixed.join('|'), 'g');
					if (fixed.length && regFixed.test(val)) {
						val = val.match(regFixed)[0];
						unit = '';
						force = 1;
					} else {
						var valCopy = val + '';
						val += ''; // Make it suitable for replace
						val = parseFloat(val.replace(',', '.'));
						val = !isNaN(val) ? val : model.get('defaults');
						var uN = valCopy.replace(val, '');
						// Check if exists as unit
						if(_.indexOf(units, uN) >= 0)
							unit = uN;
					}
				}
      }

      if(typeof max !== 'undefined')
				val = val > max ? max : val;

      if(typeof min !== 'undefined')
				val = val < min ? min : val;

			return {
				force: force,
        value: val,
        unit: unit
      };
		},

		render: function() {
			var ppfx = this.ppfx;
			this.$el.html(this.template({ppfx: ppfx}));
			this.$el.find('.'+ ppfx +'input-holder').html(this.getInputEl());
			this.$el.find('.' + ppfx + 'field-units').html(this.getUnitEl());
			this.$el.addClass(ppfx + 'field');
			return this;
		}

	});
});
