define(function(require) {
	/**
	 * @class 	RichTextEditor
	 * @param 	{Object} Configurations
	 * 
	 * @return	{Object}
 	 * */
	function RichTextEditor(config)
	{
		var c					= config || {},
			rte					= require('rte'),
			defaults			= require('./config/config'),
			CommandButtons		= require('./model/CommandButtons'),
			CommandButtonsView	= require('./view/CommandButtonsView');

		for (var name in defaults) {
			if (!(name in c))
				c[name] = defaults[name];
		}
		
		this.tlbPfx			= c.stylePrefix;
		this.commands		= new CommandButtons(c.commands);
		var obj				= {
				collection	: this.commands,
		    	config		: c,
		};
		
		this.toolbar 		= new CommandButtonsView(obj);
		this.$toolbar 		= this.toolbar.render().$el;
	}
	
	RichTextEditor.prototype	= {
			
			/**
			 * Bind rich text editor to element
			 * @param	{Object}	view
			 * @param	{Object}	container
			 * 
			 * @return 	void
			 * */
			bind		: function(view, container){
				if(!this.$contaniner){
					this.$container		= container;
					this.$toolbar.appendTo(this.$container);
				}
				view.$el.wysiwyg({hotKeys: {}}).focus();
				this.updatePosition(view.$el);
				this.bindToolbar(view).show();
				//Avoid closing edit mode clicking on toolbar
				this.$toolbar.on('mousedown', this.disableProp);
			},
			
			/**
			 * Unbind rich text editor from element
			 * @param	{Object}	view
			 * 
			 * @return 	void
			 * */
			unbind		: function(view){
				view.$el.wysiwyg('destroy');
				this.hide();
				this.$toolbar.off('mousedown', this.disableProp);
			},
			
			/**
			 * Bind toolbar to element
			 * @param	{Object}	view
			 * 
			 * @return 	this
			 * */
			bindToolbar	: function(view){
				var	id	= this.tlbPfx + view.model.cid,
					dId	= this.tlbPfx + 'inited';
				if(!view.$el.data(dId)){
					view.$el.data(dId, 1);
					view.$el.attr('id',id);
				}
				this.toolbar.updateTarget('#' + id);
				return this;
			},
			
			/**
			 * Update toolbar position
			 * @param	{Object}	$el	Element
			 * 
			 * @return 	void
			 */
			updatePosition: function($el){
				var	cOffset	= this.$container.offset(),
					cTop 	= cOffset ? cOffset.top : 0,
					cLeft	= cOffset ? cOffset.left : 0,
					eOffset	= $el.offset(),
					rTop	= eOffset.top  - cTop + this.$container.scrollTop(),
					rLeft	= eOffset.left - cLeft + this.$container.scrollLeft();
				if(!this.tlbH)
					this.tlbH	= this.$toolbar.outerHeight();
				this.$toolbar.css({
					top		: (rTop - this.tlbH - 5), 
					left	: rLeft 
				});
			},
			
			/**
			 * Show toolbar
			 * 
			 * @return void
			 * */
			show	: function(){
				this.$toolbar.show();
			},
			
			/**
			 * Hide toolbar
			 * 
			 * @return void
			 * */
			hide	: function(){
				this.$toolbar.hide();
			},
			
			/** 
			 * Isolate disable propagation method
			 * @param Event
			 * */
			disableProp: function(e){
				e.stopPropagation();
			},
	};
	
	return RichTextEditor;
});