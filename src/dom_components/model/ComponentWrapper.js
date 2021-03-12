// We need this one just to identify better the wrapper type
import Component from './Component';

export default Component.extend(
  {
    defaults: () => ({
      ...Component.prototype.defaults,
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
    })
  },
  {
    isComponent() {
      return false;
    }
  }
);
