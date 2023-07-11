import ComponentView from './ComponentView';

export default class ComponentTextNodeView extends ComponentView {
  // Clear methods used on Nodes with attributes
  _setAttributes() {}
  renderAttributes() {}
  updateStatus() {}
  updateClasses() {}
  setAttribute() {}
  updateAttributes() {}
  initClasses() {}
  initComponents() {}
  delegateEvents() {
    return this;
  }

  _createElement() {
    return document.createTextNode('');
  }

  render() {
    const { model, el } = this;
    if (model.opt.temporary) return this;
    el.textContent = model.content;
    return this;
  }
}
