import Backbone from 'backbone';
import Layer from './Layer';

export default Backbone.Collection.extend({
  model: Layer,

  initialize() {
    this.idx = 1;
    this.on('add', this.onAdd);
    this.on('reset', this.onReset);
  },

  onAdd(model, c, opts) {
    if (!opts.noIncrement) model.set('index', this.idx++);
  },

  onReset() {
    this.idx = 1;
  },

  getSeparator() {
    const { property } = this;
    return property ? property.get('layerSeparator') : ', ';
  },

  /**
   * Get layers from a value string (for not detached properties),
   * example of input:
   * `layer1Value, layer2Value, layer3Value, ...`
   * @param  {string} value
   * @return {Array}
   * @private
   */
  getLayersFromValue(value) {
    const layers = [];
    // Remove spaces inside functions, eg:
    // From: 1px 1px rgba(2px, 2px, 2px), 2px 2px rgba(3px, 3px, 3px)
    // To: 1px 1px rgba(2px,2px,2px), 2px 2px rgba(3px,3px,3px)
    value.replace(/\(([\w\s,.]*)\)/g, match => {
      var cleaned = match.replace(/,\s*/g, ',');
      value = value.replace(match, cleaned);
    });
    const layerValues = value ? value.split(this.getSeparator()) : [];
    layerValues.forEach(layerValue => {
      layers.push({ properties: this.properties.parseValue(layerValue) });
    });
    return layers;
  },

  /**
   * Get layers from a style object (for detached properties),
   * example of input:
   * {
   *  subPropname1: sub-propvalue11, sub-propvalue12, sub-propvalue13, ...
   *  subPropname2: sub-propvalue21, sub-propvalue22, sub-propvalue23, ...
   *  subPropname3: sub-propvalue31, sub-propvalue32, sub-propvalue33, ...
   * }
   * @param  {Object} styleObj
   * @return {Array}
   * @private
   */
  getLayersFromStyle(styleObj) {
    const layers = [];
    const properties = this.properties;
    const propNames = properties.pluck('property');

    properties.each(propModel => {
      const style = styleObj[propModel.get('property')];
      const values = style ? style.split(', ') : [];
      values.forEach((value, i) => {
        value = propModel.parseValue(value.trim()).value;
        const layer = layers[i];
        const propertyObj = { ...propModel.attributes, ...{ value } };

        if (layer) {
          layer.properties.push(propertyObj);
        } else {
          layers[i] = {
            properties: [propertyObj]
          };
        }
      });
    });

    // Now whit all layers in, will check missing properties
    layers.forEach(layer => {
      const layerProprs = layer.properties.map(prop => prop.property);
      properties.each(propModel => {
        const propertyName = propModel.get('property');

        if (layerProprs.indexOf(propertyName) < 0) {
          layer.properties.push({ ...propModel.attributes });
        }
      });
    });

    return layers;
  },

  active(index) {
    this.each(layer => layer.set('active', 0));
    const layer = this.at(index);
    layer && layer.set('active', 1);
  },

  getFullValue() {
    let result = [];
    this.each(layer => result.push(layer.getFullValue()));
    return result.join(this.getSeparator());
  },

  getPropertyValues(property) {
    const result = [];
    this.each(layer => {
      const value = layer.getPropertyValue(property);
      value && result.push(value);
    });
    return result.join(', ');
  }
});
