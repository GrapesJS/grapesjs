import Backbone from 'backbone';

export default Backbone.View.extend({
  initialize() {
    const { $el, model } = this;
    $el.data('model', model);
    model.view = this;
  },
  _createElement() {
    return document.createTextNode('');
  },
  render() {
    const { model, el } = this;
    if (model.opt.temporary) return this;
    el.textContent = model.get('content');
    return this;
  }
});
