define(['backbone','./Block'],
  function (Backbone, Block) {

    return Backbone.Collection.extend({

      model: Block,

    });
});
