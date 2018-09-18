// We need this one just to identify better the wrapper type
import Component from './Component';

module.exports = Component.extend(
  {},
  {
    isComponent() {
      return false;
    }
  }
);
