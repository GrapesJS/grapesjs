define(['backbone'], function (Backbone) {

	return Backbone.View.extend({

		events:{
			'change': 'onChange'
		},

		initialize: function(o) {
			this.config = o.config || {};
			this.pfx = this.config.stylePrefix || '';
		},

		onChange: function() {
			//change model value
		},

		/**
		 * On change callback
		 * @private
		 */
		onValuesChange: function() {
			var m = this.model;
			var trg = m.target;
			var attrs = trg.get('attributes');
			attrs[m.get('name')] = m.get('value');
			trg.set('attributes', attrs);
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
