import Component from './Component';

export default class ComponentWrapper extends Component {
  defaults() {
    return {
      ...super.defaults,
      tagName: 'body',
      removable: false,
      copyable: false,
      draggable: false,
      components: [],
      traits: [],
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

  __postAdd() {
    const um = this.em && this.em.get('UndoManager');
    um && !this.__hasUm && um.add(this);
    return Component.prototype.__postAdd.call(this, arguments);
  }

  __postRemove() {
    const um = this.em && this.em.get('UndoManager');
    um && um.remove(this);
    return Component.prototype.__postRemove.call(this, arguments);
  }
}

ComponentWrapper.isComponent = () => false;
