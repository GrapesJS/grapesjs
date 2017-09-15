const Property = require('./Property');

module.exports = Property.extend({

  defaults: Object.assign({}, Property.prototype.defaults, {
    // Array of options, eg. [{name: 'Label ', value: '100'}]
    options: [],
  }),

});
