var ComponentTableBody = require('./ComponentTableBody');

module.exports = ComponentTableBody.extend({

  defaults: _.extend({}, ComponentTableBody.prototype.defaults, {
    type: 'tfoot',
    tagName: 'tfoot',
    droppable: ['tr']
  }),

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
    if(el.tagName == 'TFOOT'){
      result = {type: 'tfoot'};
    }
    return result;
  },

});
