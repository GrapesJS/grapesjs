export default (config = {}) => ({
  /**
   * Build props object by their name
   * @param  {Array<string>|string} props Array of properties name
   * @return {Array<Object>}
   */
  build(props) {
    var objs = [];

    if (typeof props === 'string') props = [props];

    for (var i = 0; i < props.length; i++) {
      var obj = {};
      var prop = props[i];
      obj.name = prop;

      // Define type
      switch (prop) {
        case 'target':
          obj.type = 'select';
          break;
      }

      // Define options
      switch (prop) {
        case 'target':
          obj.options = config.optionsTarget;
          break;
      }

      objs.push(obj);
    }

    return objs;
  }
});
