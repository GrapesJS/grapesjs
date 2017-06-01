var Component = require('./ComponentText');

module.exports = Component.extend({

  defaults: _.extend({}, Component.prototype.defaults, {
      type: 'link',
      tagName: 'a',
      traits: ['title', 'href', 'target'],
  }),

  /**
   * Returns object of attributes for HTML
   * @return {Object}
   * @private
   */
  getAttrToHTML(...args) {
    var attr = Component.prototype.getAttrToHTML.apply(this, args);
    delete attr.onmousedown;
    return attr;
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
    if(el.tagName == 'A'){
      result = {type: 'link'};
    }
    return result;
  },

});
