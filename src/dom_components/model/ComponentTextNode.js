import Component from './Component';

export default Component.extend(
  {
    defaults: {
      ...Component.prototype.defaults,
      tagName: '',
      droppable: false,
      layerable: false,
      selectable: false,
      editable: true
    },

    toHTML() {
      return this.get('content')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
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
