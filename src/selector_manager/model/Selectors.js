define(['backbone','./Selector'],
  function (Backbone, Selector) {

    return Backbone.Collection.extend({

      model:  Selector,

    });
});
