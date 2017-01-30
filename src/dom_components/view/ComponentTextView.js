define(['backbone', './ComponentView'],
	function (Backbone, ComponentView) {

	return ComponentView.extend({

		events: {
			'dblclick': 'enableEditing',
			'change': 'parseRender',
		},

		initialize: function(o){
			ComponentView.prototype.initialize.apply(this, arguments);
			_.bindAll(this,'disableEditing');
			this.listenTo(this.model, 'focus active', this.enableEditing);
			this.rte = this.config.rte || '';
		},

		/**
		 * Parse content and re-render it
		 * @private
		 */
		parseRender: function(){
			var comps = this.model.get('components');
			var opts = {silent: true};

			// Avoid re-render on reset with silent option
			comps.reset(null, opts);
			comps.add(this.$el.html(), opts);
			this.model.set('content', '');
			this.render();

			// As the reset was in silent mode I need to notify
			// the navigator about the change
			comps.trigger('resetNavigator');
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
			this.parseRender();
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
		 * Enable/Disable events
		 * @param {Boolean} enable
		 */
		toggleEvents: function(enable) {
			var method = enable ? 'on' : 'off';

			// The ownerDocument is from the frame
			var elDocs = [this.el.ownerDocument, document, this.rte];
			$(elDocs).off('mousedown', this.disableEditing);
			$(elDocs)[method]('mousedown', this.disableEditing);

			// Avoid closing edit mode on component click
			this.$el.off('mousedown', this.disablePropagation);
			this.$el[method]('mousedown', this.disablePropagation);
		},

	});
});
