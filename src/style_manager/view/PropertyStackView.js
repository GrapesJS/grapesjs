define(['backbone','./PropertyCompositeView', 'text!./../templates/propertyStack.html','./../model/Layers','./LayersView'],
	function (Backbone, PropertyCompositeView, propertyTemplate, Layers, LayersView) {
	/**
	 * @class PropertyStackView
	 * */
	return PropertyCompositeView.extend({

		template: _.template(propertyTemplate),

		initialize: function(o) {
			PropertyCompositeView.prototype.initialize.apply(this, arguments);
			this.model.set('stackIndex', null);
			this.listenTo( this.model ,'change:stackIndex', this.indexChanged);
			this.listenTo( this.model ,'updateValue', this.valueUpdated);
			this.className 	= this.pfx  + 'property '+ this.pfx +'stack';
			this.events['click #'+this.pfx+'add']	= 'addLayer';

			this.delegateEvents();
		},

		/**
		 * Returns the collection of layers
		 * @return {Collection}
		 */
		getLayers: function(){
			return this.model.get('layers');
		},

		/**
		 * Triggered when another layer has been selected.
		 * This allow to move all rendered properties to a new
		 * selected layer
		 * @param {Event}
		 *
		 * @return {Object}
		 * */
		indexChanged: function(e){
			var layer	= this.getLayers().at(this.model.get('stackIndex'));
			layer.set('props', this.$props);
		},

		/**
		 * Get array of values from layers
		 * @return Array
		 * */
		getStackValues: function(){
			return this.getLayers().pluck('value');
		},

		/** @inheritDoc */
		getPropsConfig: function(opts){
			var that = this;
			var result = PropertyCompositeView.prototype.getPropsConfig.apply(this, arguments);
			result.onChange = function(el, view, opt){
				var model = view.model;
				// This will update the layer value
				var result = that.build(el, model);

				if(that.model.get('detached')){
					var propVal = '';
					var index = model.collection.indexOf(model);
					that.getLayers().each(function(layer){
						var vals = layer.get('value').split(' ');
						if(vals.length && vals[index])
							propVal += (propVal ? ',' : '') + vals[index];
					});
					view.updateTargetStyle(propVal, null, opt);
				}else
					that.model.set('value', result);
			};
			return result;
		},

		/**
		 * Extract string from composite value
		 * @param integer	Index
		 * @return string
		 * */
		valueOnIndex: function(index){
			var result 	= null;
			var aStack	= this.getStackValues();
			var strVar	= aStack[this.model.get('stackIndex')];

			if(!strVar)
				return;
			var a		= strVar.split(' ');
			if(a.length && a[index]){
				result = a[index];
			}
			return result;
		},

		/** @inheritdoc */
		build: function(){
			var stackIndex = this.model.get('stackIndex');
			if(stackIndex === null)
				return;
			var result = PropertyCompositeView.prototype.build.apply(this, arguments);
			var model = this.getLayers().at(stackIndex);
			if(!model)
				return;
			model.set('value',result);
			return this.createValue();
		},

		/**
		 * Add layer
		 * @param Event
		 *
		 * @return Object
		 * */
		addLayer: function(e){
			if(this.getTarget()){
				var layers = this.getLayers();
				var layer	= layers.add({ name : 'test' });
				var index	= layers.indexOf(layer);
				layer.set('value', this.getDefaultValue());
				this.valueUpdated();
				this.model.set('stackIndex', index);
				return layer;
			}
		},

		/**
		 * Fired when the input value is updated
		 */
		valueUpdated: function(){
			if(!this.model.get('detached'))
				this.model.set('value', this.createValue());
			else{
				this.model.get('properties').each(function(prop){
					prop.trigger('change:value');
				});
			}
		},

		/**
		 * Create value by layers
		 * @return string
		 * */
		createValue: function(){
			return this.getStackValues().join(', ');
		},

		/**
		 * Render layers
		 * @return self
		 * */
		renderLayers: function() {
			if(!this.$field)
				this.$field = this.$el.find('> .' + this.pfx + 'field');

			if(!this.$layers)
				this.$layers = new LayersView({
					collection: this.getLayers(),
					stackModel: this.model,
					preview: this.model.get('preview'),
					config: this.config
				});

			this.$field.append(this.$layers.render().el);
			this.$props.hide();
			return this;
		},

		/** @inheritdoc */
		renderInput: function() {
			PropertyCompositeView.prototype.renderInput.apply(this, arguments);
			this.refreshLayers();
		},

		/**
		 * Refresh layers
		 * */
		refreshLayers: function(){
			var v	= this.getComponentValue();
			var n = [];
			if(v){
				var a = v.split(', ');
				_.each(a,function(e){
					n.push({
						value: e,
						valuePreview: e,
						propertyPreview: this.property,
						patternPreview:	this.props
					});
				},this);
			}
			this.$props.detach();
			var layers = this.getLayers();
			layers.reset();
			layers.add(n);
			this.valueUpdated();
			this.model.set({stackIndex: null}, {silent: true});
		},

		render : function(){
			this.renderLabel();
			this.renderField();
			this.renderLayers();
			this.$el.attr('class', this.className);
			return this;
		},

	});
});
