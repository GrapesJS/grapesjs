import ComponentLink from '../model/ComponentLink';
import ComponentTextView from './ComponentTextView';

export default class ComponentLinkView<TComp extends ComponentLink = ComponentLink> extends ComponentTextView<TComp> {
  render() {
    super.render();
    // I need capturing instead of bubbling as bubbled clicks from other
    // children will execute the link event
    this.el.addEventListener('click', this.prevDef, true);

    return this;
  }
}
