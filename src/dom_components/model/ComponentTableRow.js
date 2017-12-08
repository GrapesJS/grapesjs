const Component = require('./Component');

module.exports = Component.extend({

  defaults: { ...Component.prototype.defaults,
      type: 'row',
      tagName: 'tr',
      draggable: ['thead', 'tbody', 'tfoot'],
      droppable: ['th', 'td']
  },

  initialize(o, opt) {
    Component.prototype.initialize.apply(this, arguments);

    // Clean the row from non cell components
    const cells = [];
    const components = this.get('components');
    components.each(model => {
      if (model.get('type') == 'cell') {
        cells.push(model);
      }
    });
    components.reset(cells);
  }

}, {
  isComponent(el) {
    let result = '';

    if (el.tagName == 'TR') {
      result = { type: 'row' };
    }

    return result;
  },

});
