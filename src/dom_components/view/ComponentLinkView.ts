import ComponentLink from '../model/ComponentLink';
import ComponentView from './ComponentView';

export default class ComponentLinkView extends ComponentView<ComponentLink> {
  render() {
    super.render();
    // I need capturing instead of bubbling as bubbled clicks from other
    // children will execute the link event
    this.el.addEventListener('click', this.prevDef, true);

    return this;
  }
}
