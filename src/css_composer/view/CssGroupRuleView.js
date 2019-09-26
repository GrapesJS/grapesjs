import CssRuleView from './CssRuleView';

export default CssRuleView.extend({
  _createElement: function(tagName) {
    return document.createTextNode('');
  },

  render() {
    const model = this.model;
    const important = model.get('important');
    this.el.textContent = model.getDeclaration({ important });
    return this;
  }
});
