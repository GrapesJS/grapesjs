define(['./AssetView','text!./../template/assetImage.html'],
	function (AssetView, assetTemplate) {
	return AssetView.extend({

		events:{
			'click': 'handleClick',
			'dblclick': 'handleDblClick',
		},

		template: _.template(assetTemplate),

		initialize: function(o) {
			AssetView.prototype.initialize.apply(this, arguments);
			this.className	+= ' ' + this.pfx + 'asset-image';
			this.events['click #' + this.pfx + 'close']	= 'removeItem';
			this.delegateEvents();
		},

		/**
		 * Trigger when the asset is clicked
		 * @private
		 * */
		handleClick: function() {
			var onClick = this.config.onClick;
			var model = this.model;
			model.collection.trigger('deselectAll');
			this.$el.addClass(this.pfx + 'highlight');

			if (typeof onClick === 'function') {
				onClick(model);
			} else {
				this.updateTarget(model.get('src'));
			}
		},

		/**
		 * Trigger when the asset is double clicked
		 * @private
		 * */
		handleDblClick: function() {
			var onDblClick = this.config.onDblClick;
			var model = this.model;

			if (typeof onDblClick === 'function') {
				onDblClick(model);
			} else {
				this.updateTarget(model.get('src'));
			}

			var onSelect = model.collection.onSelect;
			if(typeof onSelect == 'function'){
				onSelect(this.model);
			}
		},

		/**
		 * Update target if exists
		 * @param	{String}	v 	Value
		 * @private
		 * */
		updateTarget: function(v){
			var target = this.model.collection.target;
			if(target && target.set) {
				var attr = _.clone( target.get('attributes') );
				target.set('attributes', attr );
				target.set('src', v );
			}
		},

		/**
		 * Remove asset from collection
		 * @private
		 * */
		removeItem: function(e){
			e.stopPropagation();
			this.model.collection.remove(this.model);
		},

		render : function(){
			var name = this.model.get('name'),
				dim = this.model.get('width') && this.model.get('height') ?
							this.model.get('width')+' x '+this.model.get('height') : '';
			name = name ? name : this.model.get('src').split("/").pop();
			name = name && name.length > 30 ? name.substring(0, 30)+'...' : name;
			dim = dim ? dim + (this.model.get('unitDim') ? this.model.get('unitDim') : ' px' ) : '';
			this.$el.html( this.template({
				name: name,
				src: this.model.get('src'),
				dim: dim,
				pfx: this.pfx,
				ppfx: this.ppfx
			}));
			this.$el.attr('class', this.className);
			return this;
		},
	});
});
