import { isUndefined } from 'underscore';
import PropertyCompositeView from './PropertyCompositeView';
import LayersView from './LayersView';

export default PropertyCompositeView.extend({
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

  addLayer() {
    const model = this.model;
    const layers = this.getLayers();
    const properties = model.get('properties').deepClone();
    properties.each(property => property.set('value', ''));
    const layer = layers.add({ properties });

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
      model.get('properties').each(prop => prop.trigger('change:value'));
    }
  },

  /**
   * There is no need to handle input update by the property itself,
   * this will be done by layers
   * @private
   */
  setValue() {},

  /**
   * Create value by layers
   * @return string
   * */
  getLayerValues() {
    return this.getLayers().getFullValue();
  },

  /**
   * Refresh layers
   * */
  refreshLayers() {
    let layersObj = [];
    const model = this.model;
    const layers = this.getLayers();
    const detached = model.get('detached');
    const target = this.getTarget();

    // With detached layers values will be assigned to their properties
    if (detached) {
      const style = target ? target.getStyle() : {};
      layersObj = layers.getLayersFromStyle(style);
    } else {
      let value = this.getTargetValue({ ignoreDefault: 1 });

      if (!value) value = this.getComputedValue();

      value = value == model.getDefaultValue() ? '' : value;
      layersObj = layers.getLayersFromValue(value);
    }

    const toAdd = model.getLayersFromTarget(target) || layersObj;
    layers.reset();
    layers.add(toAdd);
    model.set({ stackIndex: null }, { silent: true });
  },

  getTargetValue(opts = {}) {
    let result = PropertyCompositeView.prototype.getTargetValue.call(
      this,
      opts
    );
    const { detached } = this.model.attributes;

    // It might happen that the browser split properties on CSSOM parse
    if (isUndefined(result) && !detached) {
      result = this.model.getValueFromStyle(this.getTarget().getStyle());
    }

    return result;
  },

  onRender() {
    const self = this;
    const model = this.model;
    const fieldEl = this.el.querySelector('[data-layers-wrapper]');
    const PropertiesView = require('./PropertiesView').default;
    const propsConfig = {
      target: this.target,
      propTarget: this.propTarget,

      // Things to do when a single sub-property is changed
      onChange(el, view, opt) {
        const subModel = view.model;

        if (model.get('detached')) {
          const subProp = subModel.get('property');
          const values = self.getLayers().getPropertyValues(subProp);
          view.updateTargetStyle(values, null, opt);
        } else {
          // Update only if there is an actual update (to avoid changes for computed styles)
          // ps: status is calculated in `targetUpdated` method
          if (model.get('status') == 'updated') {
            const value = model.getFullValue();
            model.set('value', value, opt);
            // Try to remove detached properties
            !value && view.updateTargetStyle(value, null, opt);
          }
        }
      }
    };
    const layers = new LayersView({
      collection: this.getLayers(),
      stackModel: model,
      preview: model.get('preview'),
      config: this.config,
      propsConfig
    }).render().el;

    // Will use it to propogate changes
    new PropertiesView({
      target: this.target,
      collection: this.model.get('properties'),
      stackModel: model,
      config: this.config,
      onChange: propsConfig.onChange,
      propTarget: propsConfig.propTarget
    }).render();

    //model.get('properties')
    fieldEl.appendChild(layers);
  }
});
