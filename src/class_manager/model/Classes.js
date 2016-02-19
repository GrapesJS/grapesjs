define(['backbone','./Class'],
  function (Backbone, Class) {
    /**
     * @class Classes
     * */
    return Backbone.Collection.extend({

      model:  Class,

    });
});
