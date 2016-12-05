define(['backbone', 'text!./../templates/propertyLabel.html', 'text!./../templates/propertyInput.html'],
	function (Backbone, propertyLabel, propertyTemplate) {
	/**
	 * @class PropertyView
	 * */
	return Backbone.View.extend({

		template: _.template(propertyTemplate),
		templateLabel: _.template(propertyLabel),

		events: {'change': 'valueUpdated'},

		initialize: function(o) {
			this.config = o.config || {};
			this.pfx = this.config.stylePrefix || '';
			this.ppfx = this.config.pStylePrefix || '';
			this.target = o.target || {};
			this.propTarget = o.propTarget || {};
			this.onChange = o.onChange || {};
			this.onInputRender = o.onInputRender	|| {};
			this.customValue	= o.customValue	|| {};
			this.defaultValue = this.model.get('defaults');
			this.property = this.model.get('property');
			this.input = this.$input = null;
			this.className = this.pfx  + 'property';
			this.inputHolderId = '#' + this.pfx + 'input-holder';

			if(!this.model.get('value'))
				this.model.set('value', this.model.get('defaults'));

			this.listenTo(this.model, 'destroy remove', this.remove);
			this.listenTo( this.propTarget, 'update', this.targetUpdated);
			this.listenTo( this.model ,'change:value', this.valueChanged);
			this.listenTo( this.model ,'targetUpdated', this.targetUpdated);
		},

		/**
		 * Returns selected target which should have 'style' property
		 * @return {Model|null}
		 */
		getTarget: function(){
			if(this.selectedComponent)
				return this.selectedComponent;
			return this.propTarget ? this.propTarget.model : null;
		},

		/**
		 * Fired when the input value is updated
		 */
		valueUpdated: function(){
			if(this.$input)
				this.model.set('value', this.getInputValue());
		},

		/**
		 * Fired when the target is updated
		 * */
		targetUpdated: function(){
			this.selectedComponent = this.propTarget.model;
			this.helperComponent = this.propTarget.helper;
			if(this.getTarget()){
				if(!this.sameValue()){
					this.renderInputRequest();
				}
			}
		},

		/**
		 * Checks if the value from selected component is the
		 * same of the value of the model
		 *
		 * @return {Boolean}
		 * */
		sameValue: function(){
			return this.getComponentValue() == (this.model.get('value') + this.model.get('unit'));
		},


		/**
		 * Get the value from the selected component of this property
		 *
		 * @return {String}
		 * */
		getComponentValue: function(){
			var target = this.getTarget();

			if(!target)
				return;

			var targetProp = target.get('style')[this.property];
			if(targetProp)
				this.componentValue = targetProp;
			else
				this.componentValue = this.defaultValue + (this.unit || ''); // todo model

			// Check if wrap inside function is required
			if(this.model.get('functionName')){
				var v = this.fetchFromFunction(this.componentValue);
				if(v)
					this.componentValue = v;
			}

			// This allow to ovveride the normal flow of selecting component value,
			// useful in composite properties
			if(this.customValue && typeof this.customValue === "function"){
				var index = this.model.collection.indexOf(this.model);
				var t = this.customValue(this, index);
				if(t)
					this.componentValue = t;
			}

			return this.componentValue;
		},

		/**
		 * Fetch the string from function type value
		 * @param {String} v Function type value
		 *
		 * @return {String}
		 * */
		fetchFromFunction: function(v){
			return v.substring(v.indexOf("(") + 1, v.lastIndexOf(")"));
		},

		/**
		 * Returns value from inputs
		 * @return {string}
		 */
		getValueForTarget: function(){
			return this.model.getValue();
		},

		/**
		 * Returns value from input
		 * @return {string}
		 */
		getInputValue: function(){
			return this.$input ? this.$input.val() : '';
		},

		/**
		 * Property was changed, so I need to update the component too
		 * @param 	{Object}	e	Events
		 * @param		{Mixed}		val	Value
		 * @param		{Object}	opt	Options
		 * */
		valueChanged: function(e, val, opt){
			var mVal = this.getValueForTarget();

			if(this.$input)
				this.setValue(mVal);

			if(!this.getTarget())
				return;

			// Check if component is allowed to be styled
			if(!this.isTargetStylable())
				return;

			value = this.getValueForTarget();

			var func = this.model.get('functionName');
			if(func)
				value =  func + '(' + value + ')';

			var target = this.getTarget();
			var onChange = this.onChange;

			if(onChange && typeof onChange === "function"){
				onChange(target, this, opt);
			}else
				this.updateTargetStyle(value, null, opt);
		},

		/**
		 * Update target style
		 * @param  {string} propertyValue
		 * @param  {string} propertyName
		 * @param  {Object} opts
		 */
		updateTargetStyle: function(propertyValue, propertyName, opts){
			var propName = propertyName || this.property;
			var value = propertyValue || '';
			var avSt = opts ? opts.avoidStore : 0;
			var target = this.getTarget();
			var targetStyle = _.clone(target.get('style'));

			if(value)
				targetStyle[propName] = value;
			else
				delete targetStyle[propName];

			target.set('style', targetStyle, { avoidStore : avSt});

			if(this.helperComponent)
				this.helperComponent.set('style', targetStyle, { avoidStore : avSt});
		},

		/**
		 * Check if target is stylable with this property
		 * @return {Boolean}
		 */
		isTargetStylable: function(){
			var stylable = this.getTarget().get('stylable');
			// Stylable could also be an array indicating with which property
			// the target could be styled
			if(stylable instanceof Array)
				stylable = _.indexOf(stylable, this.property) >= 0;
			return stylable;
		},

		/**
		 * Set value to the input
		 * @param 	{String}	value
		 * @param 	{Boolean}	force
		 * */
		setValue: function(value, force){
			var f = force === 0 ? 0 : 1;
			var def = this.model.get('defaults');
			var v = this.model.get('value') || def;
			if(value || f){
				v = value;
			}
			if(this.$input)
				this.$input.val(v);
			this.model.set({value: v}, {silent: true});
		},

		/**
		 * Render label
		 * */
		renderLabel: function(){
			this.$el.html( this.templateLabel({
				pfx		: this.pfx,
				ppfx	: this.ppfx,
				icon	: this.model.get('icon'),
				info	: this.model.get('info'),
				label	: this.model.get('name'),
			}));
		},

		/**
		 * Render field property
		 * */
		renderField : function() {
			this.renderTemplate();
			this.renderInput();
			delete this.componentValue;
		},

		/**
		 * Render loaded template
		 * */
		renderTemplate: function(){
			this.$el.append( this.template({
				pfx		: this.pfx,
				ppfx	: this.ppfx,
				icon	: this.model.get('icon'),
				info	: this.model.get('info'),
				label	: this.model.get('name'),
			}));
		},

		/**
		 * Renders input, to override
		 * */
		renderInput: function(){
			if(!this.$input){
				this.$input = $('<input>', {
					placeholder: this.model.get('defaults'),
					type: 'text'
				});
				this.$el.find(this.inputHolderId).html(this.$input);
			}
			this.setValue(this.componentValue, 0);
		},

		/**
		 * Request to render input of the property
		 * */
		renderInputRequest: function(){
			this.renderInput();
		},

		/**
		 * Clean input
		 * */
		cleanValue: function(){
			this.setValue('');
		},

		render : function(){
			this.renderLabel();
			this.renderField();
			this.$el.attr('class', this.className);
			return this;
		},

	});
});
