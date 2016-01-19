define(['backbone'],
function(Backbone){
	/**
	 * @class EditorView
	 * */
	return Backbone.View.extend({
		
		initialize: function() {
			this.cv				= this.model.get('Canvas');
			this.pn				= this.model.get('Panels');
			this.className		= this.model.config.stylePrefix + 'editor';
		},

		render: function(){
			this.$el.empty();
			
			this.$cont	= $('body ' + this.model.config.container);
			
			this.model.set('$editor', this.$el);
			
			if(this.cv)
				this.$el.append(this.cv.render());
			
			if(this.pn)
				this.$el.append(this.pn.render());
			
			this.$el.attr('class', this.className);
			
			this.$cont.html(this.$el);
			
			if(this.pn)
				this.pn.active();

			return this;
		}
	});
});