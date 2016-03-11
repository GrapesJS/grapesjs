define(['backbone','./CssRule'],
  function (Backbone, CssRule) {
    /**
     * @class CssRules
     * */
    return Backbone.Collection.extend({

      initialize: function(models, opt){

        this.model  = function(attrs, options) {
          var model;

          if(!options.sm && opt && opt.sm)
            options.sm = opt.sm;

          switch(1){
            default:
              model = new CssRule(attrs, options);
          }

          return  model;
        };

      },

    });
});
