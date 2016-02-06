define(['backbone', './ComponentView'],
	function (Backbone, ComponentView) {
	/**
	 * @class ComponentImageView
	 * */

	return ComponentView.extend({

		tagName		: 'img',

		events		: {
				'dblclick' 	: 'openModal',
		},

		initialize: function(o){
			ComponentView.prototype.initialize.apply(this, arguments);
			this.listenTo( this.model, 'change:src', 	this.updateSrc);
			this.listenTo( this.model, 'dblclick', 		this.openModal);
			this.classEmpty		= this.config.stylePrefix + 'image-placeholder ' + this.config.imageCompClass;

			if(!this.model.get('src'))
				this.$el.attr('class', this.classEmpty);

			if(this.config.modal)
				this.modal		= this.config.modal;

			if(this.config.am)
				this.am			= this.config.am;
		},

		/**
		 * Update src attribute
		 *
		 * @return void
		 * */
		updateSrc: function(){
			this.$el.attr('src',this.model.get("src"));
		},

		/**
		 * Open dialog for image changing
		 * @param	{Object}	e	Event
		 *
		 * @return void
		 * */
		openModal: function(e){
			var that	= this;
			if(this.modal && this.am){
				this.modal.setTitle('Select image');
				this.modal.setContent(this.am.render(1));
				this.am.setTarget(this.model);
				this.modal.show();
				this.am.onSelect(function(){
					that.modal.hide();
					that.am.setTarget(null);
				});
			}
		},

		render: function() {
			this.updateAttributes();
			return this;
		},
	});
});
