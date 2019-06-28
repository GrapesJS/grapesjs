// We need this one just to identify better the wrapper type
export default require('./Component').extend(
  {},
  {
    isComponent() {
      return false;
    }
  }
);
