define(['backbone'],
function(Backbone) {

  return Backbone.View.extend({

    // Default view
    itemView: '',

    // Defines the View per type
    itemsView: '',

    itemType: 'type',

    initialize: function(opts, config) {
      this.config = config || {};
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
    add: function(model, fragment){
      var frag = fragment || null;
      var itemView = this.itemView;
      var typeField = model.get(this.itemType);
      if(this.itemsView && this.itemsView[typeField]){
        itemView = this.itemsView[typeField];
      }
      var view = new itemView({
        model: model,
        config: this.config
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

      if(this.collection.length)
        this.collection.each(function(model){
          this.add(model, frag);
        }, this);

      this.$el.append(frag);
      return this;
    },

  });
});
