define(['backbone'],
function(Backbone){

	return Backbone.View.extend({

		initialize: function() {
			this.pn = this.model.get('Panels');
			this.conf = this.model.config;
			this.className = this.conf.stylePrefix + 'editor';
			this.model.on('loaded', function(){
				this.pn.active();
				this.model.runDefault();
				this.model.trigger('load');
			}, this);
		},

		render: function() {
			var conf = this.conf;
			var contEl = $(conf.el || ('body ' + conf.container));
			this.$el.empty();

			if(conf.width)
				contEl.css('width', conf.width);

			if(conf.height)
				contEl.css('height', conf.height);

			// Canvas
			this.$el.append(this.model.get('Canvas').render());

			// Panels
			this.$el.append(this.pn.render());
			this.$el.attr('class', this.className);

			contEl.addClass(conf.stylePrefix + 'editor-cont');
			contEl.html(this.$el);

			return this;
		}
	});
});
