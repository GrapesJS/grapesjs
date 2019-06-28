const ComponentView = require('./ComponentTextNodeView');

export default ComponentView.extend({
  _createElement() {
    return document.createComment(this.model.get('content'));
  }
});
