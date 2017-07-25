var Component = require('./Component');

module.exports = Component.extend({

  getName() {
    let name = this.get('tagName');
    let customName = this.get('custom-name');
    name = name.charAt(0).toUpperCase() + name.slice(1);
    return customName || name;
  },

}, {

  isComponent(el) {
    if (SVGElement && el instanceof SVGElement) {
      return {type: 'svg'};
    }
  },

});
