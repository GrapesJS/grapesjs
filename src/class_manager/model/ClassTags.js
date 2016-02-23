define(['backbone','./ClassTag'],
  function (Backbone, ClassTag) {
    /**
     * @class ClassTags
     * */
    return Backbone.Collection.extend({

      model:  ClassTag,

    });
});
