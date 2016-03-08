define(['backbone','./CssRule'],
  function (Backbone, CssRule) {
    /**
     * @class CssRules
     * */
    return Backbone.Collection.extend({

      model:  CssRule,

    });
});
