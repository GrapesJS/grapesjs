define([ 'backbone', 'require'],
  function (Backbone, require) {
    /**
     * @class Selectors
     * */

    return Backbone.Collection.extend({

      initialize: function(models, opt){

        this.model  = function(attrs, opts) {
          var model;

          switch(1){

            default:
              if(!this.ClassTag)
                this.ClassTag = require("ClassManager/model/ClassTag");
              model = new this.ClassTag(attrs, opts);

          }

          return  model;
        };

      },

    });
});
