define(['backbone'],
	function (Backbone) {
	return Backbone.View.extend({

		tagName: 'a',

		initialize: function(o){
			this.config		= o.config || {};
			this.className	= this.config.stylePrefix + 'btn ' + this.model.get('class');
		},

		render: function() {
			this.$el.attr('class',  _.result( this, 'className' ) );
			return this;
		}
	});
});
