define(['backbone', './ComponentView'],
	function (Backbone, ComponentView) {

	return ComponentView.extend({

		tagName		: 'img',

		events		: {
				'dblclick' 	: 'openModal',
		},

		initialize: function(o){
			ComponentView.prototype.initialize.apply(this, arguments);
			this.listenTo( this.model, 'change:src', 	this.updateSrc);
			this.listenTo( this.model, 'dblclick', 		this.openModal);
			var compCls = this.config.imageCompClass || '';
			this.classEmpty = this.pfx + 'image-placeholder' + (compCls ? ' ' + compCls : '');

			if(this.config.modal)
				this.modal = this.config.modal;

			if(this.config.am)
				this.am = this.config.am;
		},

		/**
		 * Update src attribute
		 * @private
		 * */
		updateSrc: function(){
			this.$el.attr('src',this.model.get("src"));
		},

		/**
		 * Open dialog for image changing
		 * @param	{Object}	e	Event
		 * @private
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
			this.updateClasses();

			if(!this.model.get('src'))
				this.$el.attr('class', this.classEmpty);

			return this;
		},
	});
});
