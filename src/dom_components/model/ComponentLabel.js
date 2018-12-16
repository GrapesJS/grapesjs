const Component = require('./ComponentText');

module.exports = Component.extend(
  {
    defaults: {
      ...Component.prototype.defaults,
      tagName: 'label',
      traits: ['id', 'title', 'for']
    }
  },
  {
    isComponent(el) {
      if (el.tagName == 'LABEL') {
        return { type: 'label' };
      }
    }
  }
);
