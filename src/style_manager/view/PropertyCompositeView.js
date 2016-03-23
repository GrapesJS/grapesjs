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
			this.config		= o.config;
			this.className 	= this.className + ' '+ this.pfx +'composite';
		},

		/**
		 * Renders input
		 *
		 * @return void
		 * */
		renderInput: function() {
			var props	= this.model.get('properties');
			if(props && props.length){
				if(!this.$input)
					this.$input = $('<input>', {value: 0, type: 'hidden' });

				if(!this.props){
					var Properties 	= require('./../model/Properties');
					this.props		= new Properties(props);
					this.model.set('properties', this.props);
				}

				if(!this.$props){
					//Avoid style for children
					this.props.each(function(prop, index){
						prop.set('doNotStyle', true);
					});
					//Not yet supported nested composite
					this.props.each(function(prop, index){
						if(prop && prop.get('type') == 'composite'){
							this.props.remove(prop);
							console.warn(prop.get('property')+' of type composite not yet allowed.');
						}
					},this);

					var PropertiesView 	= require('./PropertiesView');
					var that 			= this;
					var propsView = new PropertiesView({
						config			: this.config,
						collection	: this.props,
						target			: this.target,
						propTarget	: this.propTarget,
						onChange		: function(el, model){
							var result = that.build(el, model);
							that.model.set('value', result);
						},
						onInputRender	: function(property, mIndex){
							var value = that.valueOnIndex(mIndex, property.model);
							property.setValue(value);
						},
						customValue		: function(property, mIndex){
							return that.valueOnIndex(mIndex, property.model);
						},
					});
					this.$props = propsView.render().$el;
					this.$el.find('#'+ this.pfx +'input-holder').html(this.$props);
				}
			}
		},

		/**
		 * Get default value of the property
		 *
		 * @return string
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
		 * @param integer	Index
		 * @param object 	Property model
		 *
		 * @return string
		 * */
		valueOnIndex: function(index, model){
			var result 	= null;
			var a		= this.getComponentValue().split(' ');
			if(a.length && a[index]){
				result = a[index];
				//Check for function type values
				if(model && model.get('functionName')){
					var v = this.fetchFromFunction(result);
					if(v)
						result	= v;
				}
			}
			return result;
		},

		/**
		 * Build composite value
		 * @param Object Selected element
		 * @param Object Property model
		 *
		 * @return string
		 * */
		build: function(selectedEl, propertyModel){
			var result 	= '';
			this.model.get('properties').each(function(prop){
				var v		= (prop.get('value') || prop.get('defaults')) + prop.get('unit'),
					func	= prop.get('functionName');
				if(func)
					v =  func + '(' + v + ')';
				result 	+= v + ' ';
			});
			//Remove also the last white space
			return result.replace(/ +$/,'');
		},

	});
});
