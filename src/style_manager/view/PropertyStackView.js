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

    const propsConfig = this.getPropsConfig();
    this.layers = new LayersView({
      collection: this.getLayers(),
      stackModel: model,
      preview: model.get('preview'),
      config: this.config,
      propsConfig
    });
    // For detached properties, used in inputValueChanged (eg. clear all)
    const PropertiesView = require('./PropertiesView').default;
    this.propsView = new PropertiesView({
      target: this.target,
      collection: model.get('properties'),
      stackModel: model,
      config: this.config,
      onChange: propsConfig.onChange,
      propTarget: propsConfig.propTarget
    });
  },

  /**
   * Fired when the target is updated.
   * With detached mode the component will be always empty as its value
   * so we gonna check all props and find if it has any difference
   * */
  targetUpdated(...args) {
    let data;
    if (!this.model.get('detached')) {
      data = PropertyCompositeView.prototype.targetUpdated.apply(this, args);
    } else {
      data = this._getTargetData();
      this.setStatus(data.status);
      this.checkVisibility();
    }

    // I have to wait the update of inner properites (like visibility)
    // before render layers
    setTimeout(() => this.refreshLayers(data));
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
    this.inputValueChanged({ up: 1 });

    // This will set subprops with a new default values
    model.set('stackIndex', layers.indexOf(layer));
  },

  inputValueChanged(opts = {}) {
    const model = this.model;
    opts.up && this.elementUpdated();

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
  refreshLayers(opts = {}) {
    let layersObj = [];
    const { model, em } = this;
    const layers = this.getLayers();
    const detached = model.get('detached');
    const property = model.get('property');
    const target = this.getFirstTarget();
    const valueComput = this.getComputedValue();
    const selected = em.getSelected();
    const updateOpts = { fromTarget: 1 };
    let resultValue,
      style,
      targetAlt,
      targetAltDevice,
      valueTargetAlt,
      valueTrgAltDvc;

    // With detached layers values will be assigned to their properties
    if (detached) {
      style = opts.targetValue || {};
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
    layers.reset(null, updateOpts);
    layers.add(toAdd, updateOpts);
    model.set({ stackIndex: null }, { silent: true });
  },

  getTargetValue(opts = {}) {
    const { model } = this;
    const { detached } = model.attributes;
    const target = this.getFirstTarget();
    let result = PropertyCompositeView.prototype.getTargetValue.call(
      this,
      opts
    );

    // It might happen that the browser split properties on CSSOM parse
    if (isUndefined(result) && !detached) {
      result = model.getValueFromStyle(target.getStyle());
    } else if (detached) {
      result = model.getValueFromTarget(target);
    }

    return result;
  },

  getPropsConfig() {
    const self = this;
    const { model } = self;

    return {
      target: self.target,
      propTarget: self.propTarget,

      // Things to do when a single sub-property is changed
      onChange(el, view, opt) {
        const subModel = view.model;
        const status = model.get('status');

        if (model.get('detached')) {
          const subProp = subModel.get('property');
          const defVal = subModel.getDefaultValue();
          const layers = self.getLayers();
          const values = layers.getPropertyValues(subProp, defVal);
          view.updateTargetStyle(values, null, opt);
          // Update also the target with values of special hidden properties.
          // This fixes the case of update with computed layers
          if (
            subProp == 'background-image' &&
            !opt.avoidStore &&
            status == 'computed'
          ) {
            model
              .get('properties')
              .filter(prop => prop.get('property').substr(0, 2) == '__')
              .forEach(prop => {
                const name = prop.get('property');
                const value = layers.getPropertyValues(
                  name,
                  prop.getDefaultValue()
                );
                self
                  .getTargets()
                  .forEach(tr => tr.addStyle({ [name]: value }, opt));
              });
          }
        } else {
          // Update only if there is an actual update (to avoid changes for computed styles)
          // ps: status is calculated in `targetUpdated` method
          if (status == 'updated') {
            const value = model.getFullValue();
            model.set('value', value, opt);
            // Try to remove detached properties
            !value && view.updateTargetStyle(value, null, opt);
          }
        }
      }
    };
  },

  onRender() {
    const { el, layers, propsView } = this;
    const fieldEl = el.querySelector('[data-layers-wrapper]');
    propsView.render(); // Will use it to propogate changes
    fieldEl.appendChild(layers.render().el);
  }
});
