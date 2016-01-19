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
			
			if(!this.layers){
				this.layers		= new Layers();
				this.model.set('layers', this.layers);
				this.$layers	= new LayersView({ 
					collection	: this.layers,
					stackModel	: this.model,
					preview		: this.model.get('preview'),
					config		: o.config
				});
			}
		},
		
		/**
		 * Triggered when another layer has been selected
		 * @param Event
		 * 
		 * @return Object
		 * */
		indexChanged: function(e){
			var layer	= this.layers.at(this.model.get('stackIndex'));
			layer.set('props', this.$props);
			this.target.trigger('change:selectedComponent');
		},
		
		/**
		 * Get array of values from layers
		 * 
		 * @return Array
		 * */
		getStackValues: function(){
			var a = [];
			this.layers.each(function(layer){
				a.push( layer.get('value') );
			});
			return a;
		},
		
		/**
		 * Extract string from composite value
		 * @param integer	Index
		 * 
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
			var model = this.layers.at(this.model.get('stackIndex'));
			if(!model)
				return;
			model.set('value',result);
			// Update data for preview
			if(this.onPreview && typeof this.onPreview === "function"){
				var v	= this.onPreview(this.model.get('properties'));
				if(v)
					result = v;
				model.set('propertyPreview', this.property);
				model.set('valuePreview',result);
			}
			
			return this.createValue();
		},
		
		/**
		 * Change preview value. Limited integer values
		 * @param Models
		 * 
		 * @return string
		 * */
		onPreview: function(properties){
			var str = '',
				lim	= 3;
			properties.each(function(p){
				var v = p.get('value');
				if(p.get('type') == 'integer'){
					if(v > lim)		v = lim;
					if(v < -lim) 	v = -lim;
				}
				str	+= v + p.get('unit')+' ';
			});
			
			return str;
		},
		
		/**
		 * Add layer
		 * @param Event
		 * 
		 * @return Object
		 * */
		addLayer: function(e){
			if(this.selectedComponent){
				var layer	= this.layers.add({ name : 'test' });
				var index	= this.layers.indexOf(layer);
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
		 * 
		 * @return self
		 * */
		renderLayers: function() {
			this.$el.find('> .'+this.pfx+'field').append(this.$layers.render().el);
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
		 * 
		 * @return void
		 * */
		refreshLayers: function(){
			var v	= this.getComponentValue();
			var n = [];
			if(v){
				var a = v.split(', ');
				_.each(a,function(e){
					n.push({ 	value: e, 
								valuePreview: e, 
								propertyPreview: this.property,
								patternPreview:	this.props		
							});
				},this);
			}
			this.$props.detach();
			this.layers.reset(n);
			this.refreshValue();
			this.model.set({stackIndex: null},{silent: true});
		},
		
		/** @inheritdoc */
		render : function(){
			this.renderLabel();
			this.renderField();
			this.renderLayers();
			this.$el.attr('class', this.className);
			return this;
		},

	});
});
