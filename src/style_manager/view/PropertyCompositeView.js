import Backbone from 'backbone';
import PropertyView from './PropertyView';

const $ = Backbone.$;

export default PropertyView.extend({
  templateInput() {
    const pfx = this.pfx;
    return `
      <div class="${pfx}field ${pfx}composite">
        <span id="${pfx}input-holder"></span>
      </div>
    `;
  },

  inputValueChanged(...args) {
    // If it's not detached (eg. 'padding: 1px 2px 3px 4px;') it will follow
    // the same flow of PropertyView
    if (!this.model.get('detached')) {
      PropertyView.prototype.inputValueChanged.apply(this, args);
    }
  },

  clear(e) {
    const props = this.properties;
    props && props.forEach(propView => propView.clear());
    PropertyView.prototype.clear.apply(this, arguments);
  },

  /**
   * Renders input
   * */
  onRender() {
    var model = this.model;
    var props = model.get('properties') || [];
    var self = this;
    this.properties = [];

    if (props.length) {
      if (!this.$input) {
        this.$input = $('<input type="hidden" value="0">');
        this.input = this.$input.get(0);
      }

      if (!this.props) {
        this.props = model.get('properties');
      }

      if (!this.$props) {
        //Not yet supported nested composite
        this.props.each(function(prop, index) {
          if (prop && prop.get('type') == 'composite') {
            this.props.remove(prop);
            console.warn('Nested composite types not yet allowed.');
          }
          prop.parent = model;
        }, this);

        var PropertiesView = require('./PropertiesView').default;
        var propsView = new PropertiesView(this.getPropsConfig());
        this.$props = propsView.render().$el;
        this.properties = propsView.properties;
        this.$el.find(`#${this.pfx}input-holder`).append(this.$props);
      }
    }
  },

  /**
   * Returns configurations that should be past to properties
   * @param {Object} opts
   * @return {Object}
   */
  getPropsConfig(opts) {
    var that = this;
    const model = this.model;

    var result = {
      config: this.config,
      collection: this.props,
      target: this.target,
      propTarget: this.propTarget,
      // On any change made to children I need to update composite value
      onChange(el, view, opts) {
        model.set('value', model.getFullValue(), opts);
      },
      // Each child property will receive a full composite string, eg. '0px 0px 10px 0px'
      // I need to extract from that string the corresponding one to that property.
      customValue(property, mIndex) {
        return that.valueOnIndex(mIndex, property);
      }
    };

    // If detached let follow its standard flow
    if (model.get('detached')) {
      delete result.onChange;
    }

    return result;
  },

  /**
   * Extract string from composite value
   * @param {number} index Index
   * @param {Object} view Property view
   * @return {string}
   * */
  valueOnIndex(index, view) {
    let value;
    const targetValue = this.getTargetValue({ ignoreDefault: 1 });

    // If the target value of the composite is not empty I'll fetch
    // the corresponding value from the requested index, otherwise try
    // to get the value of the sub-property
    if (targetValue) {
      const values = targetValue.split(this.model.getSplitSeparator());
      value = values[index];
    } else {
      value =
        view && view.getTargetValue({ ignoreCustomValue: 1, ignoreDefault: 1 });
    }

    return value;
  },

  clearCached() {
    PropertyView.prototype.clearCached.apply(this, arguments);
    this.$input = null;
    this.props = null;
    this.$props = null;
  }
});
