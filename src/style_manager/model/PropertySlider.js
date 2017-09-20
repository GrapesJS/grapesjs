const Property = require('./PropertyInteger');

module.exports = Property.extend({

  defaults: Object.assign({}, Property.prototype.defaults, {
    showInput: 1,
  }),

});
