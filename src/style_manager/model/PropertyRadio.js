const Property = require('./Property');

module.exports = Property.extend({
  defaults: {
    ...Property.prototype.defaults,
    // Array of options, eg. [{name: 'Label ', value: '100'}]
    options: []
  }
});
