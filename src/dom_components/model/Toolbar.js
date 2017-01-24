define(['backbone','./ToolbarButton'],
  function (Backbone, ToolbarButton) {

    return Backbone.Collection.extend({model: ToolbarButton});

});
