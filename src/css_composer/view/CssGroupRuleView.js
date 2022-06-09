import CssRuleView from './CssRuleView';

export default class CssGroupRuleView extends CssRuleView {
  _createElement() {
    return document.createTextNode('');
  }

  render() {
    const model = this.model;
    const important = model.get('important');
    this.el.textContent = model.getDeclaration({ important });
    return this;
  }
}
