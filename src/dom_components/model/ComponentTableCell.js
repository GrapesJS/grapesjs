var Component = require('./Component');

module.exports = Component.extend({

  defaults: _.extend({}, Component.prototype.defaults, {
      type: 'cell',
      tagName: 'td',
      draggable: ['tr'],
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
    var tag = el.tagName;
    if(tag == 'TD' || tag == 'TH'){
      result = {
        type: 'cell',
        tagName: tag.toLowerCase()
      };
    }
    return result;
  },

});
