const Property = require('./PropertyComposite');

module.exports = Property.extend({

  defaults: Object.assign({}, Property.prototype.defaults, {
    // Array of layers (which contain properties)
    layers: [],
    // Layer preview
    preview: 0,
  }),

});
