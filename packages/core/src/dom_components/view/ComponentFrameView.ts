import ComponentView from './ComponentView';
import { createEl, find, attrUp, setStyleText } from '../../utils/dom';
import ComponentFrame from '../model/ComponentFrame';

export default class ComponentFrameView extends ComponentView<ComponentFrame> {
  tagName() {
    return 'div';
  }

  initialize(props: any) {
    super.initialize(props);
    this.listenTo(this.model, 'change:attributes:src', this.updateSrc);
  }

  updateSrc() {
    const frame = find(this.el, 'iframe')[0] as HTMLElement;
    frame && attrUp(frame, { src: this.__getSrc() });
  }

  render() {
    super.render();
    const frame = createEl('iframe', {
      class: `${this.ppfx}no-pointer`,
      src: this.__getSrc(),
    });
    // Set through the CSSOM, a `style` attribute would be blocked by a strict
    // `style-src-attr` policy
    setStyleText(frame, 'width: 100%; height: 100%; border: none');
    this.el.appendChild(frame);
    return this;
  }

  __getSrc() {
    return this.model.getAttributes().src || '';
  }
}
