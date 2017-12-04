var Component = require('./Component');

module.exports = Component.extend({

  defaults: _.extend({}, Component.prototype.defaults, {
      type: 'table',
      tagName: 'table',
      droppable: ['tbody', 'thead', 'tfoot'],
  }),

  initialize(o, opt) {
    Component.prototype.initialize.apply(this, arguments);
    var components = this.get('components');
    var rows = this.get('rows');
    var columns = this.get('columns');

    // Init components if empty
    if(!components.length){
      components.add({type: 'tbody'});
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
    if(el.tagName == 'TABLE'){
      result = {type: 'table'};
    }
    return result;
  },

});
