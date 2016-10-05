define(['backbone'], function (Backbone) {

	return Backbone.View.extend({

		className: 'test-traits',

		initialize: function(o) {
			console.log(o);
			this.config = o.config || {};
			this.pfx = this.config.stylePrefix || '';
			// listen selected component change
			/*
			if target not empty refresh
			 */
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

		render: function() {
      var frag = document.createDocumentFragment();
      this.$el.empty();

      this.collection.each(function(model){
        this.add(model, frag);
      }, this);

      this.$el.append(frag);
      this.$el.addClass(this.ppfx + 'blocks-c');
      return this;
    },

	});

});
