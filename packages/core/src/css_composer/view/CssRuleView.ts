import FrameView from '../../canvas/view/FrameView';
import { View } from '../../common';
import EditorModel from '../../editor/model/Editor';
import CssRule from '../model/CssRule';
import { CssEvents } from '../types';

export default class CssRuleView extends View<CssRule> {
  config: any;
  private cachedCss = '';
  private rafId: number | null = null;
  private isDirty = false;

  constructor(o: any = {}) {
    super(o);
    this.config = o.config || {};
    const { model } = this;

    this.listenTo(model, 'change', this.requestRender);
    this.listenTo(model, 'destroy remove', this.remove);
    this.listenTo(model.get('selectors'), 'change', this.requestRender);

    model.setView(this);
  }

  get frameView(): FrameView {
    return this.config.frameView;
  }

  get em(): EditorModel {
    return this.model.em!;
  }

  remove() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    super.remove();
    this.model.removeView(this);
    return this;
  }

  /** @ts-ignore */
  tagName() {
    return 'style';
  }

  private requestRender = () => {
    if (this.isDirty) return;
    this.isDirty = true;

    this.rafId = requestAnimationFrame(() => {
      this.isDirty = false;
      this.render();
    });
  };

  updateStyles() {
    this.requestRender();
  }

  render() {
    const { model, el, em } = this;
    const important = model.get('important');
    const css = model.toCSS({ important });

    if (css === this.cachedCss) return this;
    this.cachedCss = css;

    const mountProps = { rule: model, ruleView: this, css };
    em?.trigger(CssEvents.mountBefore, mountProps);

    el.textContent = mountProps.css;

    em?.trigger(CssEvents.mount, mountProps);
    return this;
  }
}
