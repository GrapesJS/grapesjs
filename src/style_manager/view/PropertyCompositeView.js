var Backbone = require('backbone');
var PropertyView = require('./PropertyView');

module.exports = PropertyView.extend({

  template: _.template(`
  <div class="<%= pfx %>field <%= pfx %>composite">
  	<span id='<%= pfx %>input-holder'></span>
  </div>
  <div style="clear:both"></div>`),

  initialize(o) {
    PropertyView.prototype.initialize.apply(this, arguments);
    this.config = o.config || {};
    this.className = this.className + ' '+ this.pfx +'composite';
  },

  /**
   * Fired when the input value is updated
   */
  valueUpdated(...args) {
    if(!this.model.get('detached'))
      PropertyView.prototype.valueUpdated.apply(this, args);
  },

  /**
   * Renders input
   * */
  renderInput() {
    var model = this.model;
    var props = model.get('properties') || [];
    var self = this;

    if (props.length) {
      if(!this.$input)
        this.$input = $('<input>', {value: 0, type: 'hidden' });

      if (!this.props) {
        this.props = model.get('properties');
      }

      if (!this.$props) {
        //Not yet supported nested composite
        this.props.each(function(prop, index) {
          if(prop && prop.get('type') == 'composite') {
            this.props.remove(prop);
            console.warn('Nested composite types not yet allowed.');
          }
          prop.parent = model;
        }, this);

        var PropertiesView = require('./PropertiesView');
        var propsView = new PropertiesView(this.getPropsConfig());
        this.$props = propsView.render().$el;
        this.$el.find('#'+ this.pfx +'input-holder').html(this.$props);
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
      },
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
    const targetValue = this.getTargetValue({ignoreDefault: 1});

    // If the target value of the composite is not empty I'll fetch
    // the corresponding value from the requested index, otherwise try
    // to get the value of the sub-property
    if (targetValue) {
      const values = targetValue.split(' ');
      value = view ? view.model.parseValue(values[index]) : values[index];
    } else {
      value = view.getTargetValue({ignoreCustomValue: 1});
    }

    return value;
  },

});
