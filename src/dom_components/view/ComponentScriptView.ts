import ComponentScript from '../model/ComponentScript';
import ComponentView from './ComponentView';

export default class ComponentScriptView extends ComponentView<ComponentScript> {
  tagName() {
    return 'script';
  }

  events() {
    return {};
  }
}
