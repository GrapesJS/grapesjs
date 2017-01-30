define(['backbone','./CommandButtonView', './CommandButtonSelectView'],
	function (Backbone, CommandButtonView, CommandButtonSelectView) {
	return Backbone.View.extend({

		attributes : {
			'data-role':	'editor-toolbar',
		},

		initialize: function(o){
			this.config = o.config || {};
			var pfx = this.config.stylePrefix || '';
			this.id = pfx + this.config.toolbarId;
			this.listenTo(this.collection, 'add', this.addTo);
			this.$el.data('helper', 1);
		},

		/**
     * Add new model to the collection
     * @param {Model} model
     * @private
     * */
    addTo: function(model){
      this.add(model);
    },

		/**
     * Render new model inside the view
     * @param {Model} model
     * @param {Object} fragment Fragment collection
     * @private
     * */
    add: function(model, fragment) {
      var frag = fragment || null;
      var viewObj = CommandButtonView;

      switch (model.get('type')) {
      	case 'select':
      		viewObj = CommandButtonSelectView;
      		break;
      }
			var args = model.get('args');
			var attrs = {
				'title': model.get('title'),
				'data-edit': model.get('command'),
			};
			if(args)
				attrs['data-args'] = args;
      var view = new viewObj({
        model: model,
        attributes: attrs,
      }, this.config);

      var rendered = view.render().el;

      if(frag)
        frag.appendChild(rendered);
      else
        this.$el.append(rendered);
    },

		render: function() {
			var frag = document.createDocumentFragment();
			this.$el.empty();

			this.collection.each(function(model){
				this.add(model, frag);
			}, this);

			this.$el.append(frag);
			this.$el.attr('id',  this.id );
			return this;
		}

	});
});
