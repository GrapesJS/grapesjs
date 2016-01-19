define(['backbone', 'text!./../template/item.html','require'], 
	function (Backbone, ItemTemplate, require) {
	/** 
	 * @class ItemView
	 * */
	
	return Backbone.View.extend({
		
		template: _.template(ItemTemplate), 
		
		initialize: function(o){
			this.opt 		= o;
			this.config		= o.config;
			this.sorter		= o.sorter || {};
			this.pfx		= this.config.stylePrefix;
			if(typeof this.model.get('open') == 'undefined')
				this.model.set('open',false);
			this.listenTo(this.model.components, 'remove add change reset', this.checkChildren);
			this.listenTo(this.model, 'destroy remove', this.remove);
			//this.listenTo(this.model, 'change:status', this.updateStatus);
			this.listenTo(this.model, 'change:open', this.updateOpening);
			this.className	= this.pfx + 'item no-select';
			this.events		= {};
			this.events['click > #'+this.pfx+'btn-eye']	= 'toggleVisibility';
			this.events['click .'+this.pfx+'title']		= 'toggleOpening';
			this.$el.data("model", this.model);
			if(o.config.sortable)
				this.events['mousedown > #'+this.pfx+'move']	= 'startSort';						
		},
		
		/**
		 * Update item opening
		 * 
		 * @return void
		 * */
		updateOpening: function (){
			if(this.model.get('open')){
				this.$el.addClass("open");
				this.$caret.addClass('fa-chevron-down');
			}else{
				this.$el.removeClass("open");
				this.$caret.removeClass('fa-chevron-down');
			}
		},
		
		/**
		 * Toggle item opening
		 * @param {Object}	e
		 * 
		 * @return void
		 * */
		toggleOpening: function(e){
			e.stopPropagation();
			if(!this.model.components.length)
				return;
			this.model.set('open', !this.model.get('open') );
		},
		
		/**
		 * Delegate to sorter
		 * @param	Event
		 * */
		startSort: function(e){
			if(this.sorter)
				this.sorter.startMove(this, e);
		},
		
		/**
		 * Freeze item
		 * @return	void
		 * */
		freeze: function(){
			this.$el.addClass(this.pfx + 'opac50');
			this.model.set('open',0);
		},
		
		/**
		 * Unfreeze item
		 * @return	void
		 * */
		unfreeze: function(){
			this.$el.removeClass(this.pfx + 'opac50');
		},
		
		/**
		 * Update item on status change
		 * @param	Event
		 * 
		 * @return void
		 * */
		updateStatus: function(e){
			var s	= this.model.get('status'),
				pr	= this.model.get('previousModel'),
				pfx	= this.pfx;
			switch(s) {
			    case 'selected':
			    	this.$el.addClass(pfx + 'selected');
			        break;
			    case 'moving':
			        break;
			    default:
			    	this.$el.removeClass(pfx + 'selected');
			}
			if(pr){
				pr.set('previousModel','');
				pr.set('status','');
			}
		},
		
		/**
		 * Toggle visibility
		 * @param	Event
		 * 
		 * @return 	void
		 * */
		toggleVisibility: function(e){
			if(!this.$eye)
				this.$eye	= this.$el.find('> #'+this.pfx+'btn-eye');
			
			var cCss		= _.clone(this.model.get('style')),
				hClass		= this.pfx + 'hide';
			if(this.isVisible()){
				this.$el.addClass(hClass);
				this.$eye.addClass('fa-eye-slash');
				cCss.display	= 'none';
			}else{
				this.$el.removeClass(hClass);
				this.$eye.removeClass('fa-eye-slash');
				delete cCss.display;
			}
			this.model.set('style', cCss);
		},
		
		/**
		 * Check if component is visible
		 * 
		 * @return bool
		 * */
		isVisible: function(){
			var css	= this.model.get('style'),
				pr	= css.display;
			if(pr && pr == 'none' )
				return;
			return 1;
		},
		
		/**
		 * Update item aspect after children changes
		 * 
		 * @return void
		 * */
		checkChildren: function(){
			var c	= this.model.components.length,
				pfx	= this.pfx;
			if(!this.$counter)
				this.$counter	= this.$el.find('> #' + pfx + 'counter');
			if(c){
				this.$el.find('> .' + pfx + 'title').removeClass(pfx + 'no-chld');
				this.$counter.html(c);
			}else{
				this.$el.find('> .' + pfx + 'title').addClass(pfx + 'no-chld');
				this.$counter.empty();
				this.model.set('open',0);
			}
		},
		
		render : function(){
			var pfx	= this.pfx,
				vis	= this.isVisible();
			this.$el.html( this.template({
				title		: this.model.getName(),
				addClass	: (this.model.components.length ? '' : pfx+'no-chld'),
				count		: this.model.components.length,
				visible		: vis,
				hidable		: this.config.hidable,
				prefix		: pfx
			}));
			if(typeof ItemsView == 'undefined')
				ItemsView = require('./ItemsView');
			this.$components	= new ItemsView({ 
				collection 	: this.model.components,
				config		: this.config,
				sorter		: this.sorter,
				parent		: this.model
			}).render().$el;
			this.$el.find('.'+ pfx +'children').html(this.$components);
			this.$caret			= this.$el.find('> .' + pfx + 'title > #' + pfx + 'caret');
			if(!this.model.get('movable') || !this.config.sortable){
				this.$el.find('> #' + pfx + 'move').detach();
			}
			if(!vis)
				this.className += ' ' + pfx + 'hide';
			this.$el.attr('class', _.result(this, 'className'));
			return this;
		},
		
	});
});
