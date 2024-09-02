import Component from './Component';
import { toLowerCase } from '../../utils/mixins';

const type = 'svg';

export default class ComponentSvg extends Component {
  get defaults() {
    return {
      // @ts-ignore
      ...super.defaults,
      type,
      tagName: type,
      highlightable: false,
      resizable: { ratioDefault: true },
    };
  }

  getName() {
    let name = this.get('tagName')!;
    const customName = this.get('custom-name');
    name = name.charAt(0).toUpperCase() + name.slice(1);
    return customName || name;
  }

  static isComponent(el: HTMLElement) {
    return toLowerCase(el.tagName) === type;
  }
}
