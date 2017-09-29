var PropertyCompositeView = require('./PropertyCompositeView');
var Layers = require('./../model/Layers');
var LayersView = require('./LayersView');

module.exports = PropertyCompositeView.extend({

  templateInput() {
    const pfx = this.pfx;
    const ppfx = this.ppfx;
    return `
      <div class="${pfx}field ${pfx}stack">
        <button type="button" id="${pfx}add" data-add-layer>+</button>
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
    console.log('New layer index', model.get('stackIndex'));
    /*

    var layer  = this.getLayers().at(model.get('stackIndex'));
    layer.set('props', this.$props);
    model.get('properties').each(prop => prop.trigger('targetUpdated'));
    */
  },

  /** @inheritDoc */
  getPropsConfig(opts) {
    const model = this.model;
    const detached = model.get('detached');
    var result = PropertyCompositeView.prototype.getPropsConfig.apply(this, arguments);

    result.onChange = (el, view, opt) => {
      const subModel = view.model;
      const subProperty = subModel.get('property');
      this.build();

      if (detached) {
        var propVal = '';
        var index = subModel.collection.indexOf(subModel);

        this.getLayers().each(layer => {
          var val = layer.get('values')[subProperty];
          if (val) {
            propVal += (propVal ? ',' : '') + val;
          }
        });

        view.updateTargetStyle(propVal, null, opt);
      } else {
        model.set('value', model.getFullValue(), opt);
      }
    };

    return result;
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

  /**
   * Build composite value
   * @private
   * */
  build(...args) {
    let value = '';
    let values = {};
    const model = this.model;
    const stackIndex = model.get('stackIndex');
    const properties = model.get('properties');

    if (stackIndex === null) {
      return;
    }

    // Store properties values inside layer, in this way it's more reliable
    // to fetch them later
    properties.each(prop => {
      const propValue = prop.getFullValue();
      values[prop.get('property')] = propValue;
      value += `${propValue} `;
    });

    const layerModel = this.getLayers().at(stackIndex);
    layerModel && layerModel.set({values, value});
  },


  addLayer(e) {
    const model = this.model;
    const layers = this.getLayers();
    const layer = layers.add({
      name: 'New',
      properties: model.get('properties')
    });
    console.log('Props ', model.get('properties'), 'layer props', layer.get('properties'));
    const index = layers.indexOf(layer);
    //layer.set('value', model.getDefaultValue(1));

    // In detached mode inputValueChanged will add new 'layer value'
    // to all subprops
    this.inputValueChanged();

    // This will set subprops with a new default values
    model.set('stackIndex', index);
  },


  inputValueChanged() {
    const model = this.model;
    this.elementUpdated();

    // If not detached I'll just put all the values from layers to property
    // eg.
    // background: layer1Value, layer2Value, layer3Value, ...
    if (!model.get('detached')) {
      model.set('value', this.getLayerValues());
    } else {
      model.get('properties').each(prop => {
        prop.trigger('change:value');
      });
    }
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
    const fieldEl = this.el.querySelector(`.${this.pfx}field`);
    const layers = new LayersView({
      collection: this.getLayers(),
      stackModel: this.model,
      preview: this.model.get('preview'),
      config: this.config
    }).render().el;
    fieldEl.appendChild(layers);
    this.$props.hide();
  },

  /**
   * Returns array suitale for layers from target style
   * Only for detached stacks
   * @return {Array<string>}
   */
  getLayersFromTarget() {
    var arr = [];
    var target = this.getTarget();
    if(!target)
      return arr;
    var trgStyle = target.get('style');

    this.model.get('properties').each(prop => {
      var style = trgStyle[prop.get('property')];

      if (style) {
        var list =  style.split(',');
        for(var i = 0, len = list.length; i < len; i++){
          var val = list[i].trim();

          if(arr[i]){
            arr[i][prop.get('property')] = val;
          }else{
            var vals = {};
            vals[prop.get('property')] = val;
            arr[i] = vals;
          }
        }
      }
    });

    return arr;
  },

  /**
   * Refresh layers
   * */
  refreshLayers() {
    var n = [];
    var a = [];
    var fieldName = 'value';
    const model = this.model;
    const detached = model.get('detached');

    // With detached layers values will be assigned to their properties
    if (detached) {
      fieldName = 'values';
      a = this.getLayersFromTarget();
    } else {
      var v = this.getTargetValue();
      var vDef = model.getDefaultValue();
      v = v == vDef ? '' : v;
      if (v) {
        // Remove spaces inside functions:
        // eg:
        // From: 1px 1px rgba(2px, 2px, 2px), 2px 2px rgba(3px, 3px, 3px)
        // To: 1px 1px rgba(2px,2px,2px), 2px 2px rgba(3px,3px,3px)
        v.replace(/\(([\w\s,.]*)\)/g, match => {
          var cleaned = match.replace(/,\s*/g, ',');
          v = v.replace(match, cleaned);
        });
        a = v.split(', ');
      }
    }

    _.each(a, e => {
      var o = {};
      o[fieldName] = e;
      n.push(o);
    },this);

    //this.$props.detach();
    var layers = this.getLayers();
    layers.reset();
    layers.add(n);

    // Avoid updating with detached as it will cause issues on next change
    if (!detached) {
      this.inputValueChanged();
    }

    model.set({stackIndex: null}, {silent: true});
  },

  onRender(...args) {
    PropertyCompositeView.prototype.onRender.apply(this, args);
    //this.refreshLayers();
    this.renderLayers();
  },

});
