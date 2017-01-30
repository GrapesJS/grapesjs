define(['backbone','./PropertyView', 'Abstract/ui/InputColor'],
	function (Backbone, PropertyView, InputColor) {

	return PropertyView.extend({

		renderTemplate: function(){},

		renderInput: function() {
			if (!this.input) {
				var inputColor = new InputColor({
					target: this.target,
					model: this.model,
					ppfx: this.ppfx
				});
				this.input = inputColor.render();
				this.$el.append(this.input.$el);
				this.$input = this.input.inputEl;
				this.$color = this.input.colorEl;
			}
			this.setValue(this.componentValue);
		},

		setValue: function(value){
			this.input.setValue(value, {silent: 1});
		},

	});
});
