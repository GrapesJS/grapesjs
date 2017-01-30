define(['backbone','require'],
function(Backbone, require) {

	return Backbone.View.extend({

		initialize: function(o) {
			this.opts = o || {};
			this.config = o.config;
			this.listenTo( this.collection, 'add', this.addTo );
			this.listenTo( this.collection, 'reset', this.render );
		},

		/**
		 * Add to collection
		 * @param	{Object} Model
		 *
		 * @return	void
		 * @private
		 * */
		addTo: function(model){
			var i	= this.collection.indexOf(model);
			this.addToCollection(model, null, i);
		},

		/**
		 * Add new object to collection
		 * @param	{Object}	Model
		 * @param	{Object} 	Fragment collection
		 * @param	{Integer}	Index of append
		 *
		 * @return 	{Object} 	Object rendered
		 * @private
		 * */
		addToCollection: function(model, fragmentEl, index){
			if(!this.compView)
				this.compView	=	require('./ComponentView');
			var fragment	= fragmentEl || null,
			viewObject	= this.compView;
			//console.log('Add to collection', model, 'Index',i);

			var dt = this.opts.defaultTypes;
			var ct = this.opts.componentTypes;

			var type = model.get('type');
			viewObject = dt[type] ? dt[type].view : dt.default.view;

			var view = new viewObject({
				model: model,
				config: this.config,
				defaultTypes: dt,
				componentTypes: ct,
			});
			var rendered	= view.render().el;
			if(view.model.get('type') == 'textnode')
				rendered =  document.createTextNode(view.model.get('content'));

			if(fragment){
				fragment.appendChild(rendered);
			}else{
				var p	= this.$parent;
				if(typeof index != 'undefined'){
					var method	= 'before';
					// If the added model is the last of collection
					// need to change the logic of append
					if(p.children().length == index){
						index--;
						method	= 'after';
					}
					// In case the added is new in the collection index will be -1
					if(index < 0){
						p.append(rendered);
					}else
						p.children().eq(index)[method](rendered);
				}else{
					p.append(rendered);
				}
			}

			return rendered;
		},

		render: function($p) {
			var fragment 	= document.createDocumentFragment();
			this.$parent	= $p || this.$el;
			this.$el.empty();
			this.collection.each(function(model){
				this.addToCollection(model, fragment);
			},this);
			this.$el.append(fragment);

			return this;
		}

	});
});
