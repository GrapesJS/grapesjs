import { isUndefined, keys } from 'underscore';
import PropertyCompositeView from './PropertyCompositeView';
import LayersView from './LayersView';
import CssGenerator from 'code_manager/model/CssGenerator';

const cssGen = new CssGenerator();

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
      const { status } = this._getTargetData();
      this.setStatus(status);
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
    const prepend = model.get('prepend');
    const properties = model.get('properties').deepClone();
    properties.each(property => property.set('value', ''));
    const layer = layers.add(
      { properties },
      {
        active: 1,
        ...(prepend && { at: 0 })
      }
    );

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

  _getClassRule(opts = {}) {
    const { em } = this;
    const { skipAdd = 1 } = opts;
    const selected = em.getSelected();
    const targetAlt = em.get('StyleManager').getModelToStyle(selected, {
      skipAdd,
      useClasses: 1
    });
    return targetAlt !== selected && targetAlt;
  },

  /**
   * Return the parent style rule of the passed one
   * @private
   */
  _getParentTarget(target, opts = {}) {
    const { em, model } = this;
    const property = model.get('property');
    const isValid = opts.isValid || (rule => rule.getStyle()[property]);
    const targetsDevice = em
      .get('CssComposer')
      .getAll()
      .filter(rule => rule.selectorsToString() === target.getSelectorsString());
    const map = targetsDevice.reduce((acc, rule) => {
      acc[rule.getAtRule()] = rule;
      return acc;
    }, {});
    const mapSorted = cssGen.sortMediaObject(map);
    const sortedRules = mapSorted.map(item => item.value);
    const currIndex = sortedRules.indexOf(target);
    const rulesToCheck = sortedRules.splice(0, currIndex);
    let result;

    for (let i = rulesToCheck.length - 1; i > -1; i--) {
      const rule = rulesToCheck[i];
      if (isValid(rule)) {
        // only for not detached
        result = rule;
        break;
      }
    }

    return result;
  },

  /**
   * Refresh layers
   * */
  refreshLayers() {
    let layersObj = [];
    const { model, em } = this;
    const layers = this.getLayers();
    const detached = model.get('detached');
    const property = model.get('property');
    const target = this.getTarget();
    const valueComput = this.getComputedValue();
    const selected = em.getSelected();
    let resultValue,
      style,
      targetAlt,
      targetAltDevice,
      valueTargetAlt,
      valueTrgAltDvc;

    // With detached layers values will be assigned to their properties
    if (detached) {
      style = target ? target.getStyle() : {};
      const hasDetachedStyle = rule => {
        const name = model
          .get('properties')
          .at(0)
          .get('property');
        return rule && !isUndefined(rule.getStyle()[name]);
      };

      // If the style object is empty but the target has a computed value,
      // that means the style might exist in some other place
      if (!keys(style).length && valueComput && selected) {
        // Styles of the same target but with a higher rule
        const parentOpts = { isValid: rule => hasDetachedStyle(rule) };
        targetAltDevice = this._getParentTarget(target, parentOpts);

        if (targetAltDevice) {
          style = targetAltDevice.getStyle();
        } else {
          // The target is a component but the style is in the class rules
          targetAlt = this._getClassRule();
          valueTargetAlt = hasDetachedStyle(targetAlt) && targetAlt.getStyle();
          targetAltDevice =
            !valueTargetAlt &&
            this._getParentTarget(
              this._getClassRule({ skipAdd: 0 }),
              parentOpts
            );
          valueTrgAltDvc =
            hasDetachedStyle(targetAltDevice) && targetAltDevice.getStyle();
          style = valueTargetAlt || valueTrgAltDvc || {};
        }
      }

      resultValue = style;
      layersObj = layers.getLayersFromStyle(style);
    } else {
      const valueTrg = this.getTargetValue({ ignoreDefault: 1 });
      let value = valueTrg;

      // Try to check if the style is in another rule
      if (!value && valueComput) {
        // Styles of the same target but with a higher rule
        targetAltDevice = this._getParentTarget(target);

        if (targetAltDevice) {
          value = targetAltDevice.getStyle()[property];
        } else {
          // Computed value is not always reliable due to the browser's CSSOM parser
          // here we try to look for the style in class rules
          targetAlt = this._getClassRule();
          valueTargetAlt = targetAlt && targetAlt.getStyle()[property];
          targetAltDevice =
            !valueTargetAlt &&
            this._getParentTarget(this._getClassRule({ skipAdd: 0 }));
          valueTrgAltDvc =
            targetAltDevice && targetAltDevice.getStyle()[property];
          value = valueTargetAlt || valueTrgAltDvc || valueComput;
        }
      }

      value = value == model.getDefaultValue() ? '' : value;
      resultValue = value;
      layersObj = layers.getLayersFromValue(value);
    }

    const toAdd =
      model.getLayersFromTarget(target, { resultValue, layersObj }) ||
      layersObj;
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
          const defVal = subModel.getDefaultValue();
          const values = self.getLayers().getPropertyValues(subProp, defVal);
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
