import Backbone from 'backbone';
import { extend } from 'underscore';
import Properties from './Properties';
import PropertyFactory from './PropertyFactory';

export default Backbone.Model.extend({
  defaults: {
    id: '',
    name: '',
    open: true,
    buildProps: '',
    extendBuilded: 1,
    properties: []
  },

  initialize(opts) {
    const o = opts || {};
    const builded = this.buildProperties(o.buildProps);
    const name = this.get('name') || '';
    let props = [];
    !this.get('id') && this.set('id', name.replace(/ /g, '_').toLowerCase());

    if (!builded) props = this.get('properties');
    else props = this.extendProperties(builded);

    const propsModel = new Properties(props);
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

    for (var i = 0, len = mProps.length; i < len; i++) {
      var mProp = mProps[i];
      var found = 0;

      for (var j = 0; j < pLen; j++) {
        var prop = props[j];
        if (mProp.property == prop.property || mProp.id == prop.property) {
          // Check for nested properties
          var mPProps = mProp.properties;
          if (mPProps && mPProps.length) {
            mProp.properties = this.extendProperties(
              prop.properties || [],
              mPProps,
              1
            );
          }
          props[j] = ext ? extend(prop, mProp) : mProp;
          isolated[j] = props[j];
          found = 1;
          continue;
        }
      }

      if (!found) {
        props.push(mProp);
        isolated.push(mProp);
      }
    }

    return ex ? isolated.filter(i => i) : props;
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

    if (!buildP.length) return;

    if (!this.propFactory) this.propFactory = new PropertyFactory();

    r = this.propFactory.build(buildP);

    return r;
  }
});
