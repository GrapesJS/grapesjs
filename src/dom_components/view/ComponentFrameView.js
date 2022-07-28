import ComponentView from './ComponentView';
import { createEl, find, attrUp } from 'utils/dom';

export default class ComponentFrameView extends ComponentView {
  tagName() {
    return 'div';
  }

  initialize(...args) {
    ComponentView.prototype.initialize.apply(this, args);
    this.listenTo(this.model, 'change:attributes:src', this.updateSrc);
  }

  updateSrc() {
    const frame = find(this.el, 'iframe')[0];
    frame && attrUp(frame, { src: this.__getSrc() });
  }

  render(...args) {
    ComponentView.prototype.render.apply(this, args);
    const frame = createEl('iframe', {
      class: `${this.ppfx}no-pointer`,
      style: 'width: 100%; height: 100%; border: none',
      src: this.__getSrc(),
    });
    this.el.appendChild(frame);
    return this;
  }

  __getSrc() {
    return this.model.getAttributes().src || '';
  }
}
