define(['backbone','./Device'],
  function (Backbone, Device) {

    return Backbone.Collection.extend({

      model:  Device,

    });
});
