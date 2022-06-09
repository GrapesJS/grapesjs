import { View } from '../../common';

export default class CssRuleView extends View {
  tagName() {
    return 'style';
  }

  initialize(o = {}) {
    this.config = o.config || {};
    const { model } = this;
    this.listenTo(model, 'change', this.render);
    this.listenTo(model, 'destroy remove', this.remove);
    this.listenTo(model.get('selectors'), 'change', this.render);
  }

  render() {
    const { model, el } = this;
    const important = model.get('important');
    el.innerHTML = model.toCSS({ important });
    return this;
  }
}
