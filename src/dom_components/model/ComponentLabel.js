import ComponentText from './ComponentText';
import { toLowerCase } from 'utils/mixins';

const type = 'label';

export default class ComponentLabel extends ComponentText {
  get defaults() {
    return {
      ...super.defaults,
      type,
      tagName: type,
      traits: ['id', 'title', 'for'],
    };
  }
}

ComponentLabel.isComponent = el => toLowerCase(el.tagName) === type;
