var Component = require('./Component');

module.exports = Component.extend({

  defaults: _.extend({}, Component.prototype.defaults, {
    type: 'tbody',
    tagName: 'tbody',
    droppable: ['tr'],
    columns: 1,
    rows: 1,
  }),

  initialize(o, opt) {
    Component.prototype.initialize.apply(this, arguments);
    var components = this.get('components');
    var rows = this.get('rows');
    var columns = this.get('columns');

    // Init components if empty
    if(!components.length){
      var rowsToAdd = [];

      while(rows--){
        var columnsToAdd = [];
        var clm = columns;

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
  },

},{

  /**
   * Detect if the passed element is a valid component.
   * In case the element is valid an object abstracted
   * from the element will be returned
   * @param {HTMLElement}
   * @return {Object}
   * @private
   */
  isComponent(el) {
    var result = '';
    if(el.tagName == 'TBODY'){
      result = {type: 'tbody'};
    }
    return result;
  },

});
