define([ 'backbone', './Layer'],
	function (Backbone, Layer) {

		return Backbone.Collection.extend({

			model: Layer,

      initialize: function(){
        this.idx = 1;
        this.on('add', this.onAdd);
        this.on('reset', this.onReset);
      },

      onAdd: function(model, c, opts){
        if(!opts.noIncrement)
          model.set('index', this.idx++);
      },

      onReset: function(){
        this.idx = 1;
      },

		});
});
