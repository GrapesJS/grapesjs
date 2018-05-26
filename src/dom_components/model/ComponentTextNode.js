const Component = require('./Component');

module.exports = Component.extend(
  {
    defaults: {
      ...Component.prototype.defaults,
      droppable: false,
      editable: true
    },

    toHTML() {
      return this.get('content');
    }
  },
  {
    isComponent(el) {
      var result = '';
      if (el.nodeType === 3) {
        result = {
          type: 'textnode',
          content: el.textContent
        };
      }
      return result;
    }
  }
);
