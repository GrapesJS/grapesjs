define(['backbone'], function (Backbone) {

	return Backbone.View.extend({

		events:{
			'change': 'onChange'
		},

		initialize: function(o) {
			this.config = o.config || {};
			this.pfx = this.config.stylePrefix || '';
		},

		/**
		 * On change callback
		 * @param {Object} el Test
		 * @private
		 */
		onChange: function(elView) { //<-- TraitRenderer
			var m = this.model;
			var attrs = elView.model.get('attributes');
			attrs[m.get('name')] = m.get('value');
			elView.model.set('attributes', attrs);
		},

		/**
		 * Render label
		 * @private
		 */
		renderLabel: function() {
			this.$el.html(this.templateLabel({
				pfx		: this.pfx,
				ppfx	: this.ppfx,
				icon	: this.model.get('icon'),
				info	: this.model.get('info'),
				label	: this.model.get('name'),
			}));
		},

		render : function() {
			this.renderLabel();
			this.renderField();
			return this;
		},

	});

});
