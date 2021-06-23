import ComponentView from './ComponentView';

export default ComponentView.extend({
  initialize() {
    ComponentView.prototype.initialize.apply(this, arguments);
  },

  // Clear methods used on Nodes with attributes
  _setAttributes() {},
  renderAttributes() {},
  updateStatus() {},
  updateClasses() {},
  setAttribute() {},
  updateAttributes() {},
  initClasses() {},
  initComponents() {},
  delegateEvents() {},

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
