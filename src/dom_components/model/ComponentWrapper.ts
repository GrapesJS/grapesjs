import Component from './Component';
import ComponentHead, { type as typeHead } from './ComponentHead';

export default class ComponentWrapper extends Component {
  get defaults() {
    return {
      // @ts-ignore
      ...super.defaults,
      tagName: 'body',
      removable: false,
      copyable: false,
      draggable: false,
      components: [],
      traits: [],
      head: null,
      stylable: [
        'background',
        'background-color',
        'background-image',
        'background-repeat',
        'background-attachment',
        'background-position',
        'background-size',
      ],
    };
  }

  constructor(...args: ConstructorParameters<typeof Component>) {
    super(...args);
    const opts = args[1];
    const CmpHead = opts?.em?.Components.getType(typeHead)?.model;
    if (CmpHead) {
      this.set({
        head: new CmpHead({}, opts),
      });
    }
  }

  get head(): ComponentHead {
    return this.get('head');
  }

  __postAdd() {
    const um = this.em?.UndoManager;
    !this.__hasUm && um?.add(this);
    return super.__postAdd();
  }

  __postRemove() {
    const um = this.em?.UndoManager;
    um?.remove(this);
    return super.__postRemove();
  }

  static isComponent() {
    return false;
  }
}
