define(['backbone', './BlockView'],
function(Backbone, BlockView) {

  return Backbone.View.extend({

    initialize: function(opts, config) {
      _.bindAll(this, 'getSorter', 'onDrag', 'onDrop');
      this.config = config || {};
      this.ppfx = this.config.pStylePrefix || '';
      this.listenTo(this.collection, 'add', this.addTo);
      this.em = this.config.em;
      this.tac = 'test-tac';
      this.config.getSorter = this.getSorter;
    },

    /**
     * Get sorter
     * @private
     */
    getSorter: function(){
      if(!this.em)
        return;
      if(!this.sorter){
        var utils = this.em.get('Utils');
        var canvas = this.em.get('Canvas');
        var sorter = new utils.Sorter({
          container: canvas.getBody(),
          placer: canvas.getPlacerEl(),
          containerSel: '*',
          itemSel: '*',
          pfx: this.ppfx,
          onStart: this.onDrag,
          onEndMove: this.onDrop,
          document: canvas.getFrameEl().contentDocument,
          direction: 'a',
          wmargin: 1,
          nested: 1,
        });
        var offDim = canvas.getOffset();
        sorter.offTop = offDim.top;
        sorter.offLeft = offDim.left;
        this.sorter = sorter;
      }
      return this.sorter;
    },

    /**
     * Callback when block is on drag
     * @private
     */
    onDrag: function(){
      this.em.get('Canvas').getBody().style.cursor = 'grabbing';
      document.body.style.cursor = 'grabbing';
    },

    /**
     * Callback when block is dropped
     * @private
     */
    onDrop: function(){
      this.em.get('Canvas').getBody().style.cursor = '';
      document.body.style.cursor = '';
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