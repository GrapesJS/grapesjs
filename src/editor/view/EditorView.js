define(['backbone'],
function(Backbone){

	return Backbone.View.extend({

		initialize: function() {
			this.cv = this.model.get('Canvas');
			this.pn = this.model.get('Panels');
			this.className = this.model.config.stylePrefix + 'editor';
			this.model.on('loaded', function(){
				this.pn.active();
			});
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

			this.$cont.html(this.$el);

			// Canvas
			if(this.cv)
				this.$el.append(this.cv.render());

			// Panels
			if(this.pn)
				this.$el.append(this.pn.render());

			this.$el.attr('class', this.className);

			return this;
		}
	});
});