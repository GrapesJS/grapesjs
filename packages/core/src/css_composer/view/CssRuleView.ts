import FrameView from '../../canvas/view/FrameView';
import { View } from '../../common';
import EditorModel from '../../editor/model/Editor';
import CssRule from '../model/CssRule';
import { CssEvents } from '../types';

export default class CssRuleView extends View<CssRule> {
  config: any;

  constructor(o: any = {}) {
    super(o);
    this.config = o.config || {};
    const { model } = this;
    this.listenTo(model, 'change', this.render);
    this.listenTo(model, 'destroy remove', this.remove);
    this.listenTo(model.get('selectors'), 'change', this.render);
    model.setView(this);
  }

  get frameView(): FrameView {
    return this.config.frameView;
  }

  get em(): EditorModel {
    return this.model.em!;
  }

  remove() {
    super.remove();
    this.model.removeView(this);
    return this;
  }

  updateStyles() {
    this.render();
  }

  /** @ts-ignore */
  tagName() {
    return 'style';
  }

  render() {
    const { model, el, em } = this;
    const important = model.get('important');
    const css = model.toCSS({ important });
    const mountProps = { rule: model, ruleView: this, css };
    em?.trigger(CssEvents.mountBefore, mountProps);
    el.innerHTML = mountProps.css;
    em?.trigger(CssEvents.mount, mountProps);
    return this;
  }
}
