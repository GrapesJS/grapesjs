define(['backbone', 'text!./../template/modal.html'],
	function (Backbone, modalTemplate) {
		/**
		 * @class ModalView
		 * */
		return Backbone.View.extend({

			template: _.template(modalTemplate),

			events	: {},

			initialize: function(o){
				this.config		= o.config || {};
				this.pfx		= this.config.stylePrefix;
				this.listenTo( this.model, 'change:open', 	this.updateOpen);
				this.listenTo( this.model, 'change:title', 	this.updateTitle);
				this.listenTo( this.model, 'change:content',this.updateContent);
				this.events['click .'+this.pfx+'btn-close']	= 'hide';

				if(this.config.backdrop)
					this.events['click .'+this.pfx+'backlayer'] = 'hide';

				this.delegateEvents();
			},

			/**
			 * Returns content element
			 * @return {HTMLElement}
			 */
			getContent:function(){
				if(!this.$content)
					this.$content	= this.$el.find('.'+this.pfx+'content #'+this.pfx+'c');
				return this.$content.get(0);
			},

			/**
			 * Update content
			 *
			 * @return	void
			 * */
			updateContent: function(){
				if(!this.$content)
					this.$content	= this.$el.find('.'+this.pfx+'content #'+this.pfx+'c');
				this.$content.html(this.model.get('content'));
			},

			/**
			 * Update title
			 *
			 * @return	void
			 * */
			updateTitle: function(){
				if(!this.$title)
					this.$title	= this.$el.find('.'+this.pfx+'title');
				this.$title.html(this.model.get('title'));
			},

			/**
			 * Update open
			 *
			 * @return	void
			 * */
			updateOpen: function(){
				if(this.model.get('open'))
					this.$el.show();
				else
					this.$el.hide();
			},

			/**
			 * Hide modal
			 *
			 * @return void
			 * */
			hide: function(){
				this.model.set('open', 0);
			},

			/**
			 * Show modal
			 *
			 * @return void
			 * */
			show: function(){
				this.model.set('open', 1);
			},

			/**
			 * Set title
			 * @param	{String}	v Title
			 *
			 * @return 	this
			 * */
			setTitle: function(v){
				this.model.set('title',v);
				return this;
			},

			/**
			 * Set content
			 * @param	{String}	v Title
			 *
			 * @return 	this
			 * */
			setContent: function(v){
				this.model.set('content',v);
				return this;
			},

			render : function(){
				var	obj		= this.model.toJSON();
				obj.pfx		= this.pfx;
				this.$el.html( this.template(obj) );
				this.$el.attr('class', this.pfx + 'container');
				this.updateOpen();

				return this;
			},

		});
});
