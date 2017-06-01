var Backbone = require('backbone');

module.exports = Backbone.View.extend({

  events:{
    'change': 'onChange'
  },

  initialize(o) {
    var md = this.model;
    this.config = o.config || {};
    this.pfx = this.config.stylePrefix || '';
    this.ppfx = this.config.pStylePrefix || '';
    this.target = md.target;
    this.className = this.pfx + 'trait';
    this.labelClass = this.ppfx + 'label';
    this.fieldClass = this.ppfx + 'field ' + this.ppfx + 'field-' + md.get('type');
    this.inputhClass = this.ppfx + 'input-holder';
    md.off('change:value', this.onValueChange);
    this.listenTo(md, 'change:value', this.onValueChange);
    this.tmpl = '<div class="' + this.fieldClass +'"><div class="' + this.inputhClass +'"></div></div>';
  },

  /**
   * Fires when the input is changed
   * @private
   */
  onChange() {
    this.model.set('value', this.getInputEl().value);
  },

  getValueForTarget() {
    return this.model.get('value');
  },

  /**
   * On change callback
   * @private
   */
  onValueChange() {
    var m = this.model;
    var trg = this.target;
    var name = m.get('name');
    var value = this.getValueForTarget();
    // Chabge property if requested otherwise attributes
    if(m.get('changeProp')){
      trg.set(name, value);
    }else{
      var attrs = _.clone(trg.get('attributes'));
      attrs[name] = value;
      trg.set('attributes', attrs);
    }
  },

  /**
   * Render label
   * @private
   */
  renderLabel() {
    this.$el.html('<div class="' + this.labelClass + '">' + this.getLabel() + '</div>');
  },

  /**
   * Returns label for the input
   * @return {string}
   * @private
   */
  getLabel() {
    var model = this.model;
    var label = model.get('label') || model.get('name');
    return label.charAt(0).toUpperCase() + label.slice(1).replace(/-/g,' ');
  },

  /**
   * Returns input element
   * @return {HTMLElement}
   * @private
   */
  getInputEl() {
    if(!this.$input) {
      var md = this.model;
      var trg = this.target;
      var name = md.get('name');
      var opts = {
        placeholder: md.get('placeholder') || md.get('default'),
        type: md.get('type') || 'text'
      };
      if(md.get('changeProp')){
        opts.value = trg.get(name);
      }else{
        var attrs = trg.get('attributes');
        opts.value = md.get('value') || attrs[name];
      }
      if(md.get('min'))
        opts.min = md.get('min');
      if(md.get('max'))
        opts.max = md.get('max');
      this.$input = $('<input>', opts);
    }
    return this.$input.get(0);
  },

  getModelValue() {
    var value;
    var model = this.model;
    var target = this.target;
    var name = model.get('name');

    if (model.get('changeProp')) {
      value = target.get(name);
    } else {
      var attrs = target.get('attributes');
      value = model.get('value') || attrs[name];
    }

    return value;
  },

  /**
   * Renders input
   * @private
   * */
  renderField() {
    if(!this.$input){
      this.$el.append(this.tmpl);
      var el = this.getInputEl();
      this.$el.find('.' + this.inputhClass).prepend(el);
    }
  },

  render() {
    this.renderLabel();
    this.renderField();
    this.el.className = this.className;
    return this;
  },

});
