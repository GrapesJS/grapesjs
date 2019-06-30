import Component from './ComponentTextNode';

export default Component.extend(
  {
    defaults: {
      ...Component.prototype.defaults
    },

    toHTML() {
      return `<!--${this.get('content')}-->`;
    }
  },
  {
    isComponent(el) {
      if (el.nodeType == 8) {
        return {
          tagName: 'NULL',
          type: 'comment',
          content: el.textContent
        };
      }
    }
  }
);
