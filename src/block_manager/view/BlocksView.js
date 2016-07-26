define(['backbone', './BlockView'],
function(Backbone, BlockView) {

  return Backbone.View.extend({

    initialize: function(opts, config) {
      this.config = config || {};
      this.ppfx = this.config.pStylePrefix || '';
      this.listenTo(this.collection, 'add', this.addTo);
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
     * */
    add: function(model, fragment){
      var frag = fragment || null;
      var view = new BlockView({
        model: model,
        attributes: model.get('attributes'),
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
      this.$el.addClass(this.ppfx + 'blocks-c');
      return this;
    },

  });
});