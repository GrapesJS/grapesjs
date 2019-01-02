// We need this one just to identify better the wrapper type
module.exports = require('./Component').extend(
  {},
  {
    isComponent() {
      return false;
    }
  }
);
