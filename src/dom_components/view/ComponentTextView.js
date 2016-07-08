define(['backbone', './ComponentView'],
	function (Backbone, ComponentView) {

	return ComponentView.extend({

		events: {
			'dblclick' 	: 'enableEditing',
		},

		initialize: function(o){
			ComponentView.prototype.initialize.apply(this, arguments);
			_.bindAll(this,'disableEditing');
			this.listenTo(this.model, 'focus', this.enableEditing);
			this.rte = this.config.rte || '';
		},

		/**
		 * Enable the component to be editable
		 * @param {Event} e
		 * @private
		 * */
		enableEditing: function(e){
			if(this.rte)
				this.rte.attach(this);
			this.toggleEvents(1);
		},

		/**
		 * Disable this component to be editable
		 * @param {Event}
		 * @private
		 * */
		disableEditing: function(e){
			if(this.rte)
				this.rte.detach(this);
			this.toggleEvents();
			this.updateContents();
		},

		/**
		 * Isolate disable propagation method
		 * @param {Event}
		 * @private
		 * */
		disablePropagation: function(e){
			e.stopPropagation();
		},

		/**
		 * Update contents of the element
		 * @private
		 **/
		updateContents: function(){
			this.model.set('content', this.el.innerHTML);
		},

		/**
		 * Enable/Disable events
		 * @param {Boolean} enable
		 */
		toggleEvents: function(enable) {
			var method = enable ? 'on' : 'off';
			// The ownerDocument is from the frame
			var elDocs = [this.el.ownerDocument, document, this.rte];
			$(elDocs)[method]('mousedown', this.disableEditing);
			// Avoid closing edit mode on component click
			this.$el[method]('mousedown', this.disablePropagation);
		},

		render: function() {
			this.updateAttributes();
			this.updateClasses();
			this.el.innerHTML = this.model.get('content');
			return this;
		},
	});
});
