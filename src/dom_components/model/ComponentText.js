import Component from './Component';

export default Component.extend({
  defaults: {
    ...Component.prototype.defaults,
    type: 'text',
    droppable: false,
    editable: true
  },

  toHTML() {
    return Component.prototype.toHTML.apply(this, arguments);
  }
});
