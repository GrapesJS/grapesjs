define(['backbone','require'],
function(Backbone, require) {
	/** 
	 * @class ComponentsView
	 * */
	return Backbone.View.extend({
		
		initialize: function(o) {
			this.config			= o.config;
			this.listenTo( this.collection, 'add', this.addTo );
			this.listenTo( this.collection, 'reset', this.render );
		},
		
		/**
		 * Add to collection
		 * @param	{Object} Model
		 * 
		 * @return	void
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
		 * */
		addToCollection: function(model, fragmentEl, index){
			if(!this.compView)
				this.compView	=	require('./ComponentView');
			var fragment	= fragmentEl || null,
				viewObject	= this.compView;
			
			switch(model.get('type')){
				case 'text':
					if(!this.compViewText)
						this.compViewText	=	require('./ComponentTextView');
					viewObject	= this.compViewText;
					break;
				case 'image':
					if(!this.compViewImage)
						this.compViewImage	=	require('./ComponentImageView');
					viewObject	= this.compViewImage;
					break;
			}
			
			var view 		= new viewObject({ 
				model 	: model, 
				config	: this.config,
			});
			var rendered	= view.render().el;
			
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