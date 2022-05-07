import ComponentView from './ComponentView';

export default class ComponentSvgView extends ComponentView {
  _createElement(tagName) {
    return document.createElementNS('http://www.w3.org/2000/svg', tagName);
  }
}
