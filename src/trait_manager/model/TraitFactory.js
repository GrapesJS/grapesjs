var Backbone = require('backbone');

module.exports = (() => ({
  /**
   * Build props object by their name
   * @param  {Array<string>|string} props Array of properties name
   * @return {Array<Object>}
   */
  build(props) {
    var objs = [];

    if(typeof props === 'string')
      props = [props];

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

      // Define placeholder
      switch (prop) {
        case 'title': case 'alt': case 'id':
          obj.placeholder = 'eg. Text here';
          break;
        case 'href':
          obj.placeholder = 'eg. https://google.com';
          break;
      }


      // Define options
      switch (prop) {
        case 'target':
          obj.options = [
            {value: '', name: 'This window'},
            {value: '_blank', name: 'New window'}
          ];
          break;
      }

      objs.push(obj);
    }

    return objs;
  }
}))();
