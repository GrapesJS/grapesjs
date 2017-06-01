var Backbone = require('backbone');

module.exports = Backbone.Collection.extend({

  initialize(models, opt) {

    this.model  = function(attrs, opts) {
      var model;

      switch(1){

        default:
          if(!this.ClassTag)
            this.ClassTag = require("selector_manager/model/Selector");
          model = new this.ClassTag(attrs, opts);

      }

      return  model;
    };

  },

});
