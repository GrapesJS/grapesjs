// We need this one just to identify better the wrapper type
import Component from './Component';

export default Component.extend(
  {
    defaults: {
      ...Component.prototype.defaults,
      __wrapper: 1,
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
        'background-size'
      ]
    },
    __postAdd() {
      const um = this.em && this.em.get('UndoManager');
      um && !this.__hasUm && um.add(this);
      return Component.prototype.__postAdd.call(this, arguments);
    },
    __postRemove() {
      const um = this.em && this.em.get('UndoManager');
      um && um.remove(this);
      return Component.prototype.__postRemove.call(this, arguments);
    }
  },
  {
    isComponent() {
      return false;
    }
  }
);
