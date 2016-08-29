define(['backbone'],
	function (Backbone) {
	return Backbone.View.extend({

		initialize: function(o, config){
			this.config = config || {};
			this.className = this.config.stylePrefix + 'btn ' + this.model.get('class');
		},

		getInput: function(){
			var m = this.model;
			if(!this.input){
				var cmd = m.get('command');
				var input = '<select data-edit="' + cmd +'">';
				var opts = m.get('options');
				for(var i = 0, len = opts.length; i < len; i++){
					var opt = opts[i];
					var value = opt.value;
					var name = opt.name || value;
					input += '<option value="' + value + '">' + name + '</option>';
				}
				input += '</select>';
				this.input = $(input);
			}
			return this.input;
		},

		render: function() {
			this.$el.addClass(this.className);
			this.$el.html(this.getInput());
			return this;
		}
	});
});
