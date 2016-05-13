define(['backbone','./PropertyView', 'text!./../templates/propertyComposite.html','require'],
	function (Backbone, PropertyView, propertyTemplate, require) {
	/**
	 * @class PropertyCompositeView
	 * */
	return PropertyView.extend({

		template: _.template(propertyTemplate),

		initialize: function(o) {
			PropertyView.prototype.initialize.apply(this, arguments);
			_.bindAll(this, 'build');
			this.config = o.config || {};
			this.className = this.className + ' '+ this.pfx +'composite';
		},

		/**
		 * Fired when the input value is updated
		 */
		valueUpdated: function(){
			if(!this.model.get('detached'))
				PropertyView.prototype.valueUpdated.apply(this, arguments);
		},

		/**
		 * Renders input
		 * */
		renderInput: function() {
			var props	= this.model.get('properties');
			var detached = this.model.get('detached');
			if(props && props.length){
				if(!this.$input)
					this.$input = $('<input>', {value: 0, type: 'hidden' });

				if(!this.props){
					var Properties = require('./../model/Properties');
					this.props = new Properties(props);
					this.model.set('properties', this.props);
				}

				if(!this.$props){
					//Not yet supported nested composite
					this.props.each(function(prop, index){
						if(prop && prop.get('type') == 'composite'){
							this.props.remove(prop);
							console.warn('Nested composite types not yet allowed.');
						}
					}, this);

					var PropertiesView = require('./PropertiesView');
					var that = this;

					var propsViewOpts = {
						config: this.config,
						collection: this.props,
						target: this.target,
						propTarget: this.propTarget,
						// Each child property will receive a full composite string, eg. '0px 0px 10px 0px'
						// I need to extract from that string the corresponding one to that property.
						customValue: function(property, mIndex){
							return that.valueOnIndex(mIndex, property.model);
						},
					};

					// On any change made to children I need to update composite value
					if(!detached)
						propsViewOpts.onChange = function(el, model){
							var result = that.build(el, model);
							that.model.set('value', result);
						};

					var propsView = new PropertiesView(propsViewOpts);
					this.$props = propsView.render().$el;
					this.$el.find('#'+ this.pfx +'input-holder').html(this.$props);
				}
			}
		},

		/**
		 * Get default value of the property
		 * @return {string}
		 * */
		getDefaultValue: function(){
			var str = '';
			this.props.each(function(prop, index){
				str += prop.get('defaults') + prop.get('unit') + ' ';
			});
			return str.replace(/ +$/,'');
		},

		/**
		 * Extract string from composite value
		 * @param {number} index Index
		 * @param {Object} model Property model
		 * @return {string}
		 * */
		valueOnIndex: function(index, model){
			var result = null;
			var a = this.getComponentValue().split(' ');
			if(a.length && a[index]){
				result = a[index];
				if(model && model.get('functionName')){
					var v = this.fetchFromFunction(result);
					if(v)
						result = v;
				}
			}
			return result;
		},

		/**
		 * Build composite value
		 * @param {Object} selectedEl Selected element
		 * @param {Object} propertyModel Property model
		 * @return {string}
		 * */
		build: function(selectedEl, propertyModel){
			var result 	= '';
			this.model.get('properties').each(function(prop){
				var v		= prop.getValue();
					func	= prop.get('functionName');

				if(func)
					v =  func + '(' + v + ')';

				result 	+= v + ' ';
			});
			return result.replace(/ +$/,'');
		},

	});
});
