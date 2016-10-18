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
					this.props = this.model.get('properties');
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
					var propsView = new PropertiesView(this.getPropsConfig());
					this.$props = propsView.render().$el;
					this.$el.find('#'+ this.pfx +'input-holder').html(this.$props);
				}
			}
		},

		/**
		 * Returns configurations that should be past to properties
		 * @param {Object} opts
		 * @return {Object}
		 */
		getPropsConfig: function(opts){
			var that = this;

			result = {
				config: this.config,
				collection: this.props,
				target: this.target,
				propTarget: this.propTarget,
				// On any change made to children I need to update composite value
				onChange: function(el, view, opts){
					var result = that.build();
					that.model.set('value', result, opts);
				},
				// Each child property will receive a full composite string, eg. '0px 0px 10px 0px'
				// I need to extract from that string the corresponding one to that property.
				customValue: function(property, mIndex){
					return that.valueOnIndex(mIndex, property);
				},
			};

			// If detached let follow its standard flow
			if(this.model.get('detached'))
				delete result.onChange;

			return result;
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
		 * @param {Object} view Property view
		 * @return {string}
		 * */
		valueOnIndex: function(index, view){
			var result = null;
			var a = this.getComponentValue().split(' ');
			if(a.length && a[index]){
				result = a[index];
				if(view && view.model && view.model.get('functionName')){
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
		 * @param {Object} propertyView Property view
		 * @param {Object} opts Options
		 * @return {string}
		 * */
		build: function(selectedEl, propertyView, opts){
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
