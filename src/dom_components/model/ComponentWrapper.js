// We need this one just to identify better the wrapper type
import Component from './Component';

export default Component.extend(
  {},
  {
    isComponent() {
      return false;
    }
  }
);
