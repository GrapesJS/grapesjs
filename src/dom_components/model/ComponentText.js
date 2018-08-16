const Component = require('./Component');

module.exports = Component.extend({
  defaults: {
    ...Component.prototype.defaults,
    type: 'text',
    droppable: false,
    editable: true
  }
});
