import Component from './Component';

export default Component.extend(
  {
    defaults: {
      ...Component.prototype.defaults,
      type: 'table',
      tagName: 'table',
      droppable: ['tbody', 'thead', 'tfoot']
    },

    initialize(o, opt) {
      Component.prototype.initialize.apply(this, arguments);
      const components = this.get('components');
      !components.length && components.add({ type: 'tbody' });
    }
  },
  {
    isComponent(el) {
      let result = '';

      if (el.tagName == 'TABLE') {
        result = { type: 'table' };
      }

      return result;
    }
  }
);
