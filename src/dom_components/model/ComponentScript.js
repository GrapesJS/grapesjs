var Component = require('./Component');

module.exports = Component.extend({

  defaults: _.extend({}, Component.prototype.defaults, {
    type: 'script',
    droppable: false,
    draggable: false,
    hiddenLayer: true,
  }),

}, {

  isComponent(el) {
    if (el.tagName == 'SCRIPT') {
      var result = {type: 'script'};

      if (el.src) {
        result.src = el.src;
        result.onload = el.onload;
      }

      return result;
    }
  },

});
