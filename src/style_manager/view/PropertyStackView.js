const PropertyCompositeView = require('./PropertyCompositeView');
const LayersView = require('./LayersView');

module.exports = PropertyCompositeView.extend({

  templateInput() {
    const pfx = this.pfx;
    const ppfx = this.ppfx;
    return `
      <div class="${pfx}field ${pfx}stack">
        <button type="button" id="${pfx}add" data-add-layer>+</button>
        <div data-layers-wrapper></div>
      </div>
    `;
  },

  init() {
    const model = this.model;
    const pfx = this.pfx;
    model.set('stackIndex', null);
    this.events[`click [data-add-layer]`] = 'addLayer';
    this.listenTo(model, 'change:stackIndex', this.indexChanged);
    this.listenTo(model, 'updateValue', this.inputValueChanged);
    this.delegateEvents();
  },

  /**
   * Fired when the target is updated.
   * With detached mode the component will be always empty as its value
   * so we gonna check all props and find if it has any difference
   * */
  targetUpdated(...args) {
    if (!this.model.get('detached')) {
      PropertyCompositeView.prototype.targetUpdated.apply(this, args);
    } else {
      this.checkVisibility();
    }

    this.refreshLayers();
  },

  /**
   * Returns the collection of layers
   * @return {Collection}
   */
  getLayers() {
    return this.model.get('layers');
  },

  /**
   * Triggered when another layer has been selected.
   * This allow to move all rendered properties to a new
   * selected layer
   * @param {Event}
   *
   * @return {Object}
   * */
  indexChanged(e) {
    const model = this.model;
    this.getLayers().active(model.get('stackIndex'));
  },

  /**
   * Extract string from the composite value of the target
   * @param {integer} index Property index
   * @param {View} propView Property view
   * @return string
   * @private
   * */
  valueOnIndex(index, propView) {
    let result;
    const model = this.model;
    const propModel = propView && propView.model;
    const layerIndex = model.get('stackIndex');

    // If detached the value in this case is stacked, eg. substack-prop: 1px, 2px, 3px...
    if (model.get('detached')) {
      var targetValue = propView.getTargetValue({ignoreCustomValue: 1});
      var valist = (targetValue + '').split(',');
      result = valist[layerIndex];
      result = result ? result.trim() : propModel.getDefaultValue();
      result = propModel.parseValue(result);
    } else {
      var aStack = this.getLayerValues();
      var strVar = aStack[layerIndex];
      if(!strVar)
        return;
      var a    = strVar.split(' ');
      if(a.length && a[index]){
        result = a[index];
      }
    }

    return result;
  },

  addLayer() {
    const model = this.model;
    const layers = this.getLayers();
    const layer = layers.add({
      name: 'New',
      properties: model.get('properties').deepClone(),
    });

    // In detached mode inputValueChanged will add new 'layer value'
    // to all subprops
    this.inputValueChanged();

    // This will set subprops with a new default values
    model.set('stackIndex', layers.indexOf(layer));
  },


  inputValueChanged() {
    const model = this.model;
    this.elementUpdated();

    // If not detached I'll just put all the values from layers to property
    // eg. background: layer1Value, layer2Value, layer3Value, ...
    if (!model.get('detached')) {
      model.set('value', this.getLayerValues());
    } else {
      /*
      const layer = model.get('layers').at(0);
      layer && layer.get('properties').each(prop => prop.trigger('change:value'));
      !layer && this.model.get('properties').each(prop => {
        console.log('Prop', prop);
        prop.trigger('change:value')
      })
      */
      model.get('properties').each(prop => prop.trigger('change:value'))
    }
  },

  /**
   * The value that should update view inputs.
   * In case of a detached property the value might something like this
   * @param {string} value
   * @param {Object} [opts={}]
   * @private
   */
  setValue(value, opts = {}) {
    const model = this.model;
    let val = value || model.get('value') || model.getDefaultValue();
    //const input = this.getInputEl();
    //input && (input.value = val);
  },

  /**
   * Create value by layers
   * @return string
   * */
  getLayerValues() {
    return this.getLayers().getFullValue();
  },

  /**
   * Render layers
   * @return self
   * */
  renderLayers() {
    const self = this;
    const model = this.model;
    const fieldEl = this.el.querySelector('[data-layers-wrapper]');
    const PropertiesView = require('./PropertiesView');
    const propsConfig = {
      propTarget: this.propTarget,

      // Things to do when a single sub-property is changed
      onChange(el, view, opt) {
        const subModel = view.model;

        if (model.get('detached')) {
          const subProp = subModel.get('property');
          const values = self.getLayers().getPropertyValues(subProp);
          view.updateTargetStyle(values, null, opt);
        } else {
          model.set('value', model.getFullValue(), opt);
        }
      },

      // How to get a value on a single sub-property.
      // eg. When the target is updated
      customValue(property, mIndex) {
        return self.valueOnIndex(mIndex, property);
      }
    };
    const layers = new LayersView({
      collection: this.getLayers(),
      stackModel: model,
      preview: model.get('preview'),
      config: this.config,
      propsConfig,
    }).render().el;

    // Will use it to propogate changes
    new PropertiesView({
      collection: this.model.get('properties'),
      stackModel: model,
      config: this.config,
      onChange: propsConfig.onChange,
      propTarget: propsConfig.propTarget,
      customValue: propsConfig.customValue,
    }).render().el;

    //model.get('properties')
    fieldEl.appendChild(layers);
  },

  /**
   * Refresh layers
   * */
  refreshLayers() {
    let layersObj = [];
    const model = this.model;
    const layers = this.getLayers();
    const detached = model.get('detached');

    // With detached layers values will be assigned to their properties
    if (detached) {
      const target = this.getTarget();
      const style = target ? target.getStyle() : {};
      layersObj = layers.getLayersFromStyle(style);
    } else {
      let value = this.getTargetValue();
      value = value == model.getDefaultValue() ? '' : value;
      layersObj = layers.getLayersFromValue(value);
    }

    layers.reset();
    layers.add(layersObj);

    // Avoid updating with detached as it will cause issues on next change
    if (!detached) {
      this.inputValueChanged();
    }

    model.set({stackIndex: null}, {silent: true});
  },

  onRender(...args) {
    //PropertyCompositeView.prototype.onRender.apply(this, args);
    this.renderLayers();
  },

});
