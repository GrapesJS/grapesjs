var Backbone = require('backbone');

module.exports = Backbone.Model.extend({

  /** @inheritdoc */
  build(model, cssc) {
    var coll = model.get('components') || model,
      code = '';

    coll.each(m => {
      code += m.toHTML({
        cssc
      });
    }, this);

    return code;
  },

});
