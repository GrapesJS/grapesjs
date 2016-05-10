define(['backbone', 'text!./../templates/layer.html'],
	function (Backbone, layerTemplate) {
	/**
	 * @class LayerView
	 * */
	return Backbone.View.extend({

		events:{
			'click': 'updateIndex',
		},

		template: _.template(layerTemplate),

		initialize: function(o) {
			this.stackModel = o.stackModel || {};
			this.config = o.config || {};
			this.pfx = this.config.stylePrefix || '';
			this.className = this.pfx + 'layer';
			this.listenTo(this.model, 'destroy remove', this.remove);
			this.listenTo(this.model, 'change:valuePreview', this.previewChanged);
			this.listenTo(this.model, 'change:props', this.showProps);
			this.events['click #' + this.pfx + 'close-layer'] = 'remove';

			if( !this.model.get('preview') ){
				this.$el.addClass(this.pfx + 'no-preview');
			}

			// Parse preview value if requested
			var pPattern = this.model.get('patternPreview');
			if(this.model.get('valuePreview') && pPattern){
				this.model.set('preview', true);
				var nV = this.formatPreviewValue(pPattern);
				this.model.set({valuePreview: nV}, {silent: true});
			}

			this.delegateEvents();
		},

		/**
		 * Format preview value by pattern of property models
		 * Need only for initial render, DRY
		 * @param Objects Property models
		 * @return {string}
		 * */
		formatPreviewValue: function(props){
			/*
			var	aV	= this.model.get('valuePreview').split(' '),
				lim = 3,
				nV	= '';
			props.each(function(p, index){
				var v = aV[index];
				if(v){
					if(p.get('type') == 'integer'){
						var vI	= parseInt(v, 10),
						u	= v.replace(vI,'');
						vI	= !isNaN(vI) ? vI : 0;
						if(vI > lim)
							vI = lim;
						if(vI < -lim)
							vI = -lim;
						v = vI + u;
					}
				}
				nV	+= v + ' ';
			});
			return nV;*/
		},

		/**
		 * Show inputs on this layer
		 * */
		showProps:function(){
			this.$props = this.model.get('props');
			this.$el.find('#' + this.pfx + 'inputs').html(this.$props.show());
			this.model.set({props: null }, {silent: true });
		},

		/**
		 * Triggered when the value for the preview is changed
		 * */
		previewChanged: function(){
			if( this.model.get('preview') ){
				if(!this.$preview)
					this.$preview = this.$el.find('#'+ this.pfx + 'preview');
				var property = this.model.get('propertyPreview');
				if(property)
					this.$preview.css(property, this.model.get('valuePreview'));
			}
		},

		/** @inheritdoc */
		remove: function(e){
			// Prevent from revoming all events on props
			if(this.$props)
				this.$props.detach();

			if(e && e.stopPropagation)
				e.stopPropagation();

			Backbone.View.prototype.remove.apply(this, arguments);

			if(this.model.collection)
				this.model.collection.remove(this.model);

			if(this.stackModel && this.stackModel.set){
				this.stackModel.trigger('refreshValue');
				this.stackModel.set({stackIndex: null},{silent: true});
			}
		},

		/**
		 * Update index
		 * @param Event
		 *
		 * @return void
		 * */
		updateIndex: function(e){
			var i = this.getIndex();
			this.stackModel.set('stackIndex', i);

			if(this.model.collection)
				this.model.collection.trigger('deselectAll');

			this.$el.addClass(this.pfx + 'active');
		},

		/**
		 * Fetch model index
		 * @return {number} Index
		 */
		getIndex: function(){
			var index = 0;

			if(this.model.collection)
				index = this.model.collection.indexOf(this.model);

			return index;
		},

		render : function(){
			var i = this.getIndex();
			this.$el.html( this.template({
				label: 'Layer ' + i,
				name: this.model.get('name'),
				vPreview: this.model.get('valuePreview'),
				pPreview: this.model.get('propertyPreview'),
				pfx: this.pfx,
			}));
			this.$el.attr('class', this.className);
			return this;
		},

	});
});
