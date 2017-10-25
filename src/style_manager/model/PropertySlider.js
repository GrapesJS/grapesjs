const Property = require('./PropertyInteger');

module.exports = Property.extend({

  defaults: { ...Property.prototype.defaults,
      showInput: 1,
  },

});
