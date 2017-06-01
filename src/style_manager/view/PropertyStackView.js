var Backbone = require('backbone');
var PropertyCompositeView = require('./PropertyCompositeView');
var Layers = require('./../model/Layers');
var LayersView = require('./LayersView');

module.exports = PropertyCompositeView.extend({

  template: _.template(`
  <div class="<%= pfx %>field <%= pfx %>stack">
    <button id='<%= pfx %>add'>+</button>
    <span id='<%= pfx %>input-holder'></span>
  </div>
  <div style="clear:both"></div>`),

  initialize(o) {
    PropertyCompositeView.prototype.initialize.apply(this, arguments);
    this.model.set('stackIndex', null);
    this.className   = this.pfx  + 'property '+ this.pfx +'stack';
    this.events['click #'+this.pfx+'add']  = 'addLayer';
    this.listenTo( this.model ,'change:stackIndex', this.indexChanged);
    this.listenTo( this.model ,'updateValue', this.valueUpdated);
    this.delegateEvents();
  },

  /**
   * Fired when the target is updated.
   * With detached mode the component will be always empty as its value
   * so we gonna check all props and fine if there is some differences.
   * */
  targetUpdated(...args) {
    if(!this.model.get('detached'))
      PropertyCompositeView.prototype.targetUpdated.apply(this, args);
    else {
      this.checkVisibility();
      this.refreshLayers();

      /*
      this.model.get('properties').each(function(prop) {
        console.log(prop.get('property'), ' - ', prop.get('value'));
      });
      */
    }
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
    var model = this.model;
    var layer  = this.getLayers().at(model.get('stackIndex'));
    layer.set('props', this.$props);
    model.get('properties').each(prop => {
      prop.trigger('targetUpdated');
    });
  },

  /**
   * Get array of values from layers
   * @return Array
   * */
  getStackValues() {
    return this.getLayers().pluck('value');
  },

  /** @inheritDoc */
  getPropsConfig(opts) {
    var that = this;
    var result = PropertyCompositeView.prototype.getPropsConfig.apply(this, arguments);

    result.onChange = (el, view, opt) => {
      var model = view.model;
      var result = that.build();

      if(that.model.get('detached')){
        var propVal = '';
        var index = model.collection.indexOf(model);

        that.getLayers().each(layer => {
          var val = layer.get('values')[model.get('property')];
          if(val)
            propVal += (propVal ? ',' : '') + val;
        });

        view.updateTargetStyle(propVal, null, opt);
      }else
        that.model.set('value', result, opt);
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
    var result = null;
    var layerIndex = this.model.get('stackIndex');

    // If detached the value in this case is stacked, eg. substack-prop: 1px, 2px, 3px...
    if (this.model.get('detached')) {
      var targetValue = propView.getTargetValue();
      var valist = (targetValue + '').split(',');
      result = valist[layerIndex];
      result = result ? result.trim() : propView.getDefaultValue();
      result = propView.tryFetchFromFunction(result);
    } else {
      var aStack = this.getStackValues();
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
    var stackIndex = this.model.get('stackIndex');
    if(stackIndex === null)
      return;
    var result = PropertyCompositeView.prototype.build.apply(this, args);
    var model = this.getLayers().at(stackIndex);
    if(!model)
      return;

    // Store properties values inside layer, in this way it's more reliable
    //  to fetch them later
    var valObj = {};
    this.model.get('properties').each(prop => {
      var v    = prop.getValue(),
        func  = prop.get('functionName');
      if(func)
        v =  func + '(' + v + ')';
      valObj[prop.get('property')] = v;
    });
    model.set('values', valObj);

    model.set('value', result);
    return this.createValue();
  },

  /**
   * Add layer
   * @param Event
   *
   * @return Object
   * */
  addLayer(e) {
    if(this.getTarget()){
      var layers = this.getLayers();
      var layer  = layers.add({ name : 'test' });
      var index  = layers.indexOf(layer);
      layer.set('value', this.getDefaultValue());

      // In detached mode valueUpdated will add new 'layer value'
      // to all subprops
      this.valueUpdated();

      // This will set subprops with a new default values
      this.model.set('stackIndex', index);
      return layer;
    }
  },

  /**
   * Fired when the input value is updated
   */
  valueUpdated() {
    var model = this.model;

    if (!model.get('detached')) {
      model.set('value', this.createValue());
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
  createValue() {
    return this.getStackValues().join(', ');
  },

  /**
   * Render layers
   * @return self
   * */
  renderLayers() {
    if(!this.$field)
      this.$field = this.$el.find('> .' + this.pfx + 'field');

    if(!this.$layers)
      this.$layers = new LayersView({
        collection: this.getLayers(),
        stackModel: this.model,
        preview: this.model.get('preview'),
        config: this.config
      });

    this.$field.append(this.$layers.render().el);
    this.$props.hide();
    return this;
  },

  /** @inheritdoc */
  renderInput(...args) {
    PropertyCompositeView.prototype.renderInput.apply(this, args);
    this.refreshLayers();
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
    var detached = this.model.get('detached');

    if (detached) {
      fieldName = 'values';
      a = this.getLayersFromTarget();
    } else {
      var v  = this.getComponentValue();
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

    this.$props.detach();
    var layers = this.getLayers();
    layers.reset();
    layers.add(n);

    // Avoid updating with detached as it will cause issues on next change
    if (!detached) {
      this.valueUpdated();
    }

    this.model.set({stackIndex: null}, {silent: true});
  },

  render() {
    this.renderLabel();
    this.renderField();
    this.renderLayers();
    this.$el.attr('class', this.className);
    return this;
  },

});
