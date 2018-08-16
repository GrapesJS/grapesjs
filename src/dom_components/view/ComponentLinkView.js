var Backbone = require('backbone');
var ComponentView = require('./ComponentTextView');

module.exports = ComponentView.extend({
  render(...args) {
    ComponentView.prototype.render.apply(this, args);

    // I need capturing instead of bubbling as bubbled clicks from other
    // children will execute the link event
    this.el.addEventListener('click', this.prevDef, true);

    return this;
  }
});
