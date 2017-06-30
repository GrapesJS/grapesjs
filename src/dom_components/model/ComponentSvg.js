var Component = require('./Component');

module.exports = Component.extend({

  getName() {
    let name = this.get('tagName');
    return name.charAt(0).toUpperCase() + name.slice(1);
  },

}, {

  isComponent(el) {
    if (SVGElement && el instanceof SVGElement) {
      return {type: 'svg'};
    }
  },

});
