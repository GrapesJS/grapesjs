export default (config = {}) => ({
  /**
   * Build props object by their name
   * @param  {Array<string>|string} props Array of properties name
   * @return {Array<Object>}
   */
  build(props) {
    const objs = [];

    if (typeof props === 'string') props = [props];

    for (let i = 0; i < props.length; i++) {
      const obj = {};
      const prop = props[i];
      obj.name = prop;

      switch (prop) {
        case 'target':
          obj.type = 'select';
          obj.default = false;
          obj.options = config.optionsTarget;
          break;
      }

      objs.push(obj);
    }

    return objs;
  },
});
