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
			this.listenTo( this.model ,'refreshValue', this.refreshValue);
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
		 * Triggered when another layer has been selected
		 * @param {Event}
		 *
		 * @return {Object}
		 * */
		indexChanged: function(e){
			var layer	= this.getLayers().at(this.model.get('stackIndex'));
			layer.set('props', this.$props);
			this.target.trigger('change:selectedComponent');//TODO replace with getTarget
		},

		/**
		 * Get array of values from layers
		 * TODO replace with pluck
		 * @return Array
		 * */
		getStackValues: function(){
			var a = [];
			this.getLayers().each(function(layer){
				a.push( layer.get('value') );
			});
			return a;
		},

		/**
		 * Extract string from composite value
		 * @param integer	Index
		 * TODO missing valueOnIndex
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
		build: function(selectedEl, propertyModel){
			if(this.model.get('stackIndex') === null)
				return;
			var result = PropertyCompositeView.prototype.build.apply(this, arguments);
			var model = this.getLayers().at(this.model.get('stackIndex'));
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
			if(this.selectedComponent){
				var layers = this.getLayers();
				var layer	= layers.add({ name : 'test' });
				var index	= layers.indexOf(layer);
				layer.set('value', this.getDefaultValue());
				this.refreshValue();
				this.model.set('stackIndex', index);
				return layer;
			}
		},

		/**
		 * Refresh value
		 *
		 * @return void
		 * */
		refreshValue: function(){
			this.model.set('value', this.createValue());
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
			this.getLayers().reset(n);
			this.refreshValue();
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
