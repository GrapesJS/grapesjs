const Layer = require('./Layer');

module.exports = Backbone.Collection.extend({

  model: Layer,

  initialize() {
    this.idx = 1;
    this.on('add', this.onAdd);
    this.on('reset', this.onReset);
  },

  onAdd(model, c, opts) {
    if(!opts.noIncrement)
      model.set('index', this.idx++);
  },

  onReset() {
    this.idx = 1;
  },

  /**
   * Get layers from a value string (for not detached properties),
   * eg: propertyName: layer1Value, layer2Value, layer3Value, ...;
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
    const layerValues = value ? value.split(', ') : [];
    layerValues.forEach(layerValue => {
      layers.push({properties: this.properties.parseValue(layerValue)});
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
    return result.join(', ');
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
