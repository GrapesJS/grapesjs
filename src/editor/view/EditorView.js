define(['backbone'],
function(Backbone){

	return Backbone.View.extend({

		initialize: function() {
			this.cv = this.model.get('Canvas');
			this.pn = this.model.get('Panels');
			this.css = this.model.get('CssComposer');
			this.className = this.model.config.stylePrefix + 'editor';
		},

		render: function(){
			this.$el.empty();
			var conf = this.model.config;
			this.$cont	= $(conf.el || ('body ' + conf.container));

			if(conf.width)
				this.$cont.css('width', conf.width);

			if(conf.height)
				this.$cont.css('height', conf.height);

			this.model.set('$editor', this.$el);

			// Canvas
			if(this.cv)
				this.$el.append(this.cv.render());

			// Panels
			if(this.pn)
				this.$el.append(this.pn.render());

			// CSS Rules
			if(this.css)
				this.$el.append(this.css.render());

			this.$el.attr('class', this.className);

			this.$cont.html(this.$el);

			if(this.pn)
				this.pn.active();

			return this;
		}
	});
});