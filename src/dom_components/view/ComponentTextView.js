define(['backbone', './ComponentView'],
	function (Backbone, ComponentView) {

	return ComponentView.extend({

		events: {
			'dblclick' 	: 'enableEditing',
		},

		initialize: function(o){
			ComponentView.prototype.initialize.apply(this, arguments);
			_.bindAll(this,'disableEditing');
			this.listenTo( this.model, 'focus', this.enableEditing);
			if(this.config.rte){
				this.rte	= this.config.rte;
			}
		},

		/**
		 * Enable this component to be editable,
		 * load also the mini toolbar for quick editing
		 * @param Event
		 * @private
		 * */
		enableEditing: function(e){
			if(this.rte){
				var $e	= this.config.em.get('$editor');
				if(!this.$wrapper && $e.length)
					this.$wrapper	= $e.find('#'+this.config.wrapperId);
				this.rte.bind(this, this.$wrapper);
			}
			$(document).on('mousedown', this.disableEditing);									//Close edit mode
			this.$el.on('mousedown', this.disablePropagation);								//Avoid closing edit mode on component click
		},

		/**
		 * Disable this component to be editable
		 * @param Event
		 * @private
		 * */
		disableEditing: function(e){
			if(this.rte){
				this.rte.unbind(this);
			}
			$(document).off('mousedown', this.disableEditing);
			this.$el.off('mousedown',this.disablePropagation);
			this.updateContents();
		},

		/** Isolate disable propagation method
		 * @param Event
		 * @private
		 * */
		disablePropagation: function(e){
			e.stopPropagation();
		},

		/**
		 * Update contents of the element
		 *
		 * @return void
		 * @private
		 **/
		updateContents : function(){
			this.model.set('content', this.$el.html());
		},

		render: function() {
			this.updateAttributes();
			this.updateClasses();
			this.$el.html(this.model.get('content'));
			return this;
		},
	});
});
