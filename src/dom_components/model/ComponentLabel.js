import Component from './ComponentText';

export default Component.extend(
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
