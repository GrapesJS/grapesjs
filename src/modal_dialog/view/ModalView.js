define(['backbone', 'text!./../template/modal.html'],
	function (Backbone, modalTemplate) {
		return Backbone.View.extend({

			template: _.template(modalTemplate),

			events: {},

			initialize: function(o){
				this.config = o.config || {};
				this.pfx = this.config.stylePrefix || '';
				this.listenTo(this.model, 'change:open', this.updateOpen);
				this.listenTo(this.model, 'change:title', this.updateTitle);
				this.listenTo(this.model, 'change:content', this.updateContent);
				this.events['click .'+this.pfx+'btn-close']	= 'hide';

				if(this.config.backdrop)
					this.events['click .'+this.pfx+'backlayer'] = 'hide';

				this.delegateEvents();
			},

			/**
			 * Returns content element
			 * @return {HTMLElement}
			 * @private
			 */
			getContent: function(){
				if(!this.$content)
					this.$content	= this.$el.find('.'+this.pfx+'content #'+this.pfx+'c');
				return this.$content;
			},

			/**
			 * Returns title element
			 * @return {HTMLElement}
			 * @private
			 */
			getTitle: function(){
				if(!this.$title)
					this.$title	= this.$el.find('.'+this.pfx+'title');
				return this.$title.get(0);
			},

			/**
			 * Update content
			 * @private
			 * */
			updateContent: function(){
				var content = this.getContent();
				if(content)
					content.html(this.model.get('content'));
			},

			/**
			 * Update title
			 * @private
			 * */
			updateTitle: function(){
				var title = this.getTitle();
				if(title)
					title.innerHTML = this.model.get('title');
			},

			/**
			 * Update open
			 * @private
			 * */
			updateOpen: function(){
				if(this.model.get('open'))
					this.$el.show();
				else
					this.$el.hide();
			},

			/**
			 * Hide modal
			 * @private
			 * */
			hide: function(){
				this.model.set('open', 0);
			},

			/**
			 * Show modal
			 * @private
			 * */
			show: function(){
				this.model.set('open', 1);
			},

			render: function(){
				var	obj = this.model.toJSON();
				obj.pfx = this.pfx;
				this.$el.html( this.template(obj) );
				this.$el.attr('class', this.pfx + 'container');
				this.updateOpen();
				return this;
			},

		});
});
