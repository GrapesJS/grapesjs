import ComponentView from './ComponentView';

export default class ComponentScriptView extends ComponentView {
  tagName() {
    return 'script';
  }

  events() {
    return {};
  }
}
