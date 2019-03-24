module.exports = require('backbone').View.extend({
  initialize() {
    this.model.view = this;
  },
  _createElement() {
    return document.createTextNode(this.model.get('content'));
  }
});
