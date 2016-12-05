define(['backbone','./PropertyView', 'text!./../templates/propertyInteger.html'],
	function (Backbone, PropertyView, propertyTemplate) {
	/**
	 * @class PropertyIntegerView
	 * */
	return PropertyView.extend({

		template: _.template(propertyTemplate),

		initialize: function(options) {
			PropertyView.prototype.initialize.apply(this, arguments);
			_.bindAll(this, 'moveIncrement', 'upIncrement');
			this.min = this.model.get('min') || this.model.get('min')===0 ? this.model.get('min') : null;
			this.max = this.model.get('max') || this.model.get('max')===0 ? this.model.get('max') : null;
			this.units = this.model.get('units');
			this.unit = this.model.get('unit') ? this.model.get('unit') : (this.units.length ? this.units[0] : '');
			this.events['click .'+this.ppfx+'field-arrow-u'] = 'upArrowClick';
			this.events['click .'+this.ppfx+'field-arrow-d'] = 'downArrowClick';
			this.events['mousedown .'+this.ppfx+'field-arrows'] = 'downIncrement';
			this.listenTo( this.model ,'change:unit', this.valueChanged);
			this.delegateEvents();
		},

		/**
		 * Fired when the input value is updated
		 */
		valueUpdated: function(){
			if(this.$input && this.$unit)
				this.model.set({
					value: this.validateValue(this.$input.val()),
					unit: this.$unit.val()
				});
		},

		/**
		 * Validate input value
		 * @param {integer|float} value Raw value
		 * @return {string} Validated string
		 */
		validateValue: function(value){
			var val = value;
			if(this.max !== null)
				val = val > this.max ? this.max : val;
			if(this.min !== null)
				val = val < this.min ? this.min : val;
			return val;
		},

		/**
		 * Returns value from inputs
		 * @return {string}
		 */
		getValueForTarget: function(){
			return this.model.get('value') + this.model.get('unit');
		},

		/**
		 * Invoked when the up arrow is clicked
		 * @param Event
		 *
		 * @return void
		 * */
		upArrowClick: function(e){
			var value	= this.model.get('value');
			value = isNaN(value) ? 1 : parseInt(value,10) + 1;
			if(this.max !== null)
				value = value > this.max ? this.max : value;
			this.model.set('value',value);
		},

		/**
		 * Invoked when the down arrow is clicked
		 * @param Event
		 *
		 * @return void
		 * */
		downArrowClick: function(e){
			var value	= this.model.get('value');
			value = isNaN(value) ? 0 : parseInt(value,10) - 1;
			if(this.min !== null)
				value = value < this.min ? this.min : value;
			this.model.set('value',value);
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
			value = isNaN(value) ? 0 : parseInt(value,10);
			var current = {y: e.pageY, val: value };
			$(document).mouseup(current, this.upIncrement);
			$(document).mousemove(current, this.moveIncrement);
		},

		/** While the increment is clicked, moving the mouse will update input value
		 * @param Object
		 *
		 * @return bool
		 * */
		moveIncrement: function (ev) {
			this.moved = 1;
			var pos = parseInt(ev.data.val - ev.pageY + ev.data.y, 10);
			this.prValue = this.validateValue(pos);//Math.max(this.min, Math.min(this.max, pos) );
			this.model.set('value', this.prValue, { avoidStore: 1 });
			return false;
		},

		/**
		 * Stop moveIncrement method
		 * @param Object
		 *
		 * @return void
		 * */
		upIncrement: function (e) {
			$(document).off('mouseup', this.upIncrement);
			$(document).off('mousemove', this.moveIncrement);

			if(this.prValue && this.moved)
				this.model.set('value', this.prValue - 1, {silent:1}).set('value', this.prValue + 1);
		},

		/** @inheritdoc */
		renderInput: function() {
			var pfx	= this.pfx;
			var ppfx	= this.ppfx;
			if(!this.$input){
				this.$input = $('<input>', {placeholder: 'auto', type: 'text' });
				this.$el.find('#'+ pfx +'input-holder').html(this.$input);
			}
			if(!this.$unit){
				if(this.units && this.units.length){
					this.unitS = '<select>';
					_.each(this.units,function(unit){
						var selected = unit == this.selectedUnit ? 'selected': '';
						this.unitS += '<option ' + selected + ' >' + unit + '</option>';
					},this);
					this.unitS += '</select>';
					this.$unit = $(this.unitS);
					this.$el.find('.' + ppfx + 'field-units').html(this.$unit);
				}
			}
			this.setValue(this.componentValue);
		},

		/** @inheritdoc */
		setValue: function(value){
			var model = this.model;
			var u	= this.unit;
			var v	= model.get('value') || this.defaultValue;
			var fixed = model.get('fixedValues') || [];

			if (value) {
				// If the value is one of the fixed values I leave it as it is
				var regFixed = new RegExp('^' + fixed.join('|'), 'g');
				if (fixed.length && regFixed.test(value)) {
					v = value.match(regFixed)[0];
					u = '';
				} else {
					// Make it suitable for replace
					value += '';
					v = parseFloat(value.replace(',', '.'));
					v = !isNaN(v) ? v : this.defaultValue;
					var uN	= value.replace(v, '');
					// Check if exists as unit
					if(_.indexOf(this.units, uN) > -1)
						u = uN;
				}
			}

			if(this.$input)
				this.$input.val(v);

			if(this.$unit)
				this.$unit.val(u);
			model.set({value: v, unit: u,}, {silent: true});
		},

	});
});
