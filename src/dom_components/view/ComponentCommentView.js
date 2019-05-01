const ComponentView = require('./ComponentTextNodeView');

module.exports = ComponentView.extend({
  _createElement() {
    return document.createComment(this.model.get('content'));
  }
});
