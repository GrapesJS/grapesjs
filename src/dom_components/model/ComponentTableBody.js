import Component from './Component';

export default Component.extend(
  {
    defaults: {
      ...Component.prototype.defaults,
      type: 'tbody',
      tagName: 'tbody',
      draggable: ['table'],
      droppable: ['tr'],
      columns: 1,
      rows: 1
    },

    initialize(o, opt) {
      Component.prototype.initialize.apply(this, arguments);
      const components = this.get('components');
      let columns = this.get('columns');
      let rows = this.get('rows');

      // Init components if empty
      if (!components.length) {
        const rowsToAdd = [];

        while (rows--) {
          const columnsToAdd = [];
          let clm = columns;

          while (clm--) {
            columnsToAdd.push({
              type: 'cell',
              classes: ['cell']
            });
          }

          rowsToAdd.push({
            type: 'row',
            classes: ['row'],
            components: columnsToAdd
          });
        }

        components.add(rowsToAdd);
      }
    }
  },
  {
    isComponent(el) {
      let result = '';

      if (el.tagName == 'TBODY') {
        result = { type: 'tbody' };
      }

      return result;
    }
  }
);
