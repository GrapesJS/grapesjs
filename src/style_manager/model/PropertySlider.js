const Property = require('./PropertyInteger');

export default Property.extend({
  defaults: {
    ...Property.prototype.defaults,
    showInput: 1
  }
});
