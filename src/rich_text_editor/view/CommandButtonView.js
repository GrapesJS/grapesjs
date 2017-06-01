var Backbone = require('backbone');

module.exports = Backbone.View.extend({
  tagName: 'a',

  initialize(o, config) {
    this.config = config || {};
    this.ppfx = this.config.pStylePrefix || '';
    this.className = this.config.stylePrefix + 'btn ' + this.model.get('class');
  },

  render() {
    this.$el.addClass(this.className);
    return this;
  }
});
