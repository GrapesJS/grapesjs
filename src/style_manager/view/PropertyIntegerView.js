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
			this.min = this.model.get('min') || this.model.get('min')===0 ? this.model.get('min') : -5000;
			this.max = this.model.get('max') || this.model.get('max')===0 ? this.model.get('max') : 5000;
			this.units = this.model.get('units');
			this.unit = this.model.get('unit') ? this.model.get('unit') : (this.units.length ? this.units[0] : '');
			this.events['click .'+this.pfx+'u-arrow'] = 'upArrowClick';
			this.events['click .'+this.pfx+'d-arrow'] = 'downArrowClick';
			this.events['mousedown .'+this.pfx+'int-arrows'] = 'downIncrement';
			this.listenTo( this.model ,'change:unit', this.valueChanged);
			this.delegateEvents();
		},

		/**
		 * Fired when the input value is updated
		 */
		valueUpdated: function(){
			if(this.$input && this.$unit)
				this.model.set({
					value: this.$input.val(),
					unit: this.$unit.val()
				});
		},

		/**
		 * Invoked when the up arrow is clicked
		 * @param Event
		 *
		 * @return void
		 * */
		upArrowClick: function(e){
			var value	= this.model.get('value');
			value 		= isNaN(value) ? 1 : parseInt(value,10) + 1;
			value 		= value > this.max ? this.max : value;
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
			value 		= isNaN(value) ? 0 : parseInt(value,10) - 1;
			value 		= value < this.min ? this.min : value;
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
			this.moved	= 0;
			var value	= this.model.get('value');
			value 		= isNaN(value) ? 0 : parseInt(value,10);
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
			this.moved	= 1;
			this.prValue	= Math.max(this.min, Math.min(this.max, parseInt(ev.data.val - ev.pageY + ev.data.y, 10) ) );
			this.model.set( 'value', this.prValue, { avoidStore: 1 });
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
			if(!this.$input){
				this.$input = $('<input>', {placeholder: 'auto', type: 'text' });
				this.$el.find('#'+ pfx +'input-holder').html(this.$input);
			}
			if(!this.$unit){
				if(this.units && this.units.length){
					this.unitS = '<select class="' + pfx + 'unit">';
					_.each(this.units,function(unit){
						var selected = unit == this.selectedUnit ? 'selected': '';
						this.unitS += '<option ' + selected + ' >' + unit + '</option>';
					},this);
					this.unitS += '</select>';
					this.$unit = $(this.unitS);
					this.$el.find('#' + pfx + 'units-holder').html(this.$unit);
				}
			}
			this.setValue(this.componentValue);
		},

		/** @inheritdoc */
		setValue: function(value)
		{
			var u	= this.unit,
					v	= this.model.get('value') || this.defaultValue;

			if(value){
				// Make it suitable for replace
				value += '';
				v		= parseFloat(value.replace(',', '.'));
				v		= !isNaN(v) ? v : this.defaultValue;
				var uN	= value.replace(v,'');
				// Check if exists as unit
				if(_.indexOf(this.units, uN) > -1)
					u = uN;
			}

			if(this.$input)
				this.$input.val(v);

			if(this.$unit)
				this.$unit.val(u);

			this.model.set({value: v, unit: u,}, {silent: true});
		},

	});
});
