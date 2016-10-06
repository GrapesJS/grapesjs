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
			/*
			this.$el.html(this.templateLabel({
				pfx		: this.pfx,
				ppfx	: this.ppfx,
				icon	: this.model.get('icon'),
				info	: this.model.get('info'),
				label	: this.model.get('name'),
			}));
			*/
		console.log(this.model);
			this.$el.html('<div class="label"><div>' + this.getLabel() + '</div></div>');
		},

		/**
		 * Returns label for the input
		 * @return {string}
		 * @private
		 */
		getLabel: function() {
			var model = this.model;
			return model.get('label') || model.get('name');
		},

		/**
		 * Renders input
		 * */
		renderField: function(){
			if(!this.$input){
				this.$el.append('<div class="input-h"></div>');
				this.$input = $('<input>', {
					placeholder: this.model.get('defaults'),
					type: 'text'
				});
				this.$el.find('.input-h').html(this.$input);
			}
			//this.setValue(this.componentValue, 0);
		},

		render : function() {
			this.renderLabel();
			this.renderField();
			return this;
		},

	});

});
