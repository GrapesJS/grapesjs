import Component from './Component';
import { toLowerCase } from 'utils/mixins';

const type = 'iframe';

export default class ComponentFrame extends Component {
  get defaults() {
    return {
      ...super.defaults,
      type,
      tagName: type,
      droppable: false,
      resizable: true,
      traits: ['id', 'title', 'src'],
      attributes: { frameborder: '0' },
    };
  }
}

ComponentFrame.isComponent = el => toLowerCase(el.tagName) === type;
