define(['backbone'],
function(Backbone) {
	/**
	 * @class CanvasView
	 * */
	return Backbone.View.extend({
		
		id: 'canvas',
		
		initialize: function(o) {
			this.config		= o.config;
			this.className	= this.config.stylePrefix + 'canvas';
		},
		
		render: function() {
			this.wrapper	= this.model.get('wrapper');
			if(this.wrapper && typeof this.wrapper.render == 'function'){
				this.$el.append( this.wrapper.render() );
			}
			this.$el.attr('class', this.className);
			return this;
		},
	
	});
});