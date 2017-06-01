var Backbone = require('backbone');
var Properties = require('./Properties');
var PropertyFactory = require('./PropertyFactory');

module.exports = Backbone.Model.extend({

  defaults: {
    id: '',
    name: '',
    open: true,
    buildProps: '',
    extendBuilded: 1,
    properties : [],
  },

  initialize(opts) {
    var o = opts || {};
    var props = [];
    var builded = this.buildProperties(o.buildProps);

    if(!builded)
      props = this.get('properties');
    else
      props = this.extendProperties(builded);

    var propsModel = new Properties(props);
    propsModel.sector = this;
    this.set('properties', propsModel);
  },

  /**
   * Extend properties
   * @param {Array<Object>} props Start properties
   * @param {Array<Object>} moProps Model props
   * @param {Boolean} ex Returns the same amount of passed model props
   * @return {Array<Object>} Final props
   * @private
   */
  extendProperties(props, moProps, ex) {
    var pLen = props.length;
    var mProps = moProps || this.get('properties');
    var ext = this.get('extendBuilded');
    var isolated = [];

    for (var i = 0, len = mProps.length; i < len; i++){
      var mProp = mProps[i];
      var found = 0;

      for(var j = 0; j < pLen; j++){
        var prop = props[j];
        if(mProp.property == prop.property){
          // Check for nested properties
          var mPProps = mProp.properties;
          if(mPProps && mPProps.length){
            mProp.properties = this.extendProperties(prop.properties, mPProps, 1);
          }
          props[j] = ext ? _.extend(prop, mProp) : mProp;
          isolated[j] = props[j];
          found = 1;
          continue;
        }
      }

      if(!found){
        props.push(mProp);
        isolated.push(mProp);
      }
    }

    return ex ? isolated : props;
  },

  /**
   * Build properties
   * @param {Array<string>} propr Array of props as sting
   * @return {Array<Object>}
   * @private
   */
  buildProperties(props) {
    var r;
    var buildP = props || [];

    if(!buildP.length)
      return;

    if(!this.propFactory)
     this.propFactory = new PropertyFactory();

    r = this.propFactory.build(buildP);

    return r;
  },

});
