const $ = Backbone.$;

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
      const plh = md.get('placeholder') || md.get('default') || '';
      const type = md.get('type') || 'text';
      const attrs = trg.get('attributes');
      const min = md.get('min');
      const max = md.get('max');
      const value = md.get('changeProp') ?
        trg.get(name) : md.get('value') || attrs[name];
      const input = $(`<input type="${type}" placeholder="${plh}">`);

      if (value) {
        input.prop('value', value);
      }

      if (min) {
        input.prop('min', min);
      }

      if (max) {
        input.prop('max', max);
      }

      this.$input = input;
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
      const el = this.getInputEl();
      // I use prepand expecially for checkbox traits
      const inputWrap = this.el.querySelector(`.${this.inputhClass}`);
      inputWrap.insertBefore(el, inputWrap.childNodes[0]);
    }
  },

  render() {
    this.renderLabel();
    this.renderField();
    this.el.className = this.className;
    return this;
  },

});
