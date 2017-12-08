var ComponentTableBody = require('./ComponentTableBody');

module.exports = ComponentTableBody.extend({

  defaults: _.extend({}, ComponentTableBody.prototype.defaults, {
    type: 'thead',
    tagName: 'thead',
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
    if(el.tagName == 'THEAD'){
      result = {type: 'thead'};
    }
    return result;
  },

});
