var Backbone = require('backbone');
var Input = require('./Input');
var Spectrum = require('spectrum-colorpicker');

module.exports = Input.extend({

  template: _.template(`
  <div class='<%= ppfx %>input-holder'></div>
  <div class="<%= ppfx %>field-colorp">
    <div class="<%= ppfx %>field-colorp-c">
      <div class="<%= ppfx %>checker-bg"></div>
    </div>
  </div>`),

  initialize(opts) {
    Input.prototype.initialize.apply(this, arguments);
    var ppfx = this.ppfx;
    this.colorCls = ppfx + 'field-color-picker';
    this.inputClass = ppfx + 'field ' + ppfx + 'field-color';
    this.colorHolderClass = ppfx + 'field-colorp-c';

    this.listenTo(this.model, 'change:value', this.handleModelChange);
  },

  /**
   * Updates the view when the model is changed
   * */
  handleModelChange(...args) {
    Input.prototype.handleModelChange.apply(this, args);

    var value = this.model.get('value');
    var colorEl = this.getColorEl();

    // If no color selected I will set white for the picker
    value = value === 'none' ? '#fff' : value;
    colorEl.spectrum('set', value);
    colorEl.get(0).style.backgroundColor = value;
  },

  /**
   * Get the color input element
   * @return {HTMLElement}
   */
  getColorEl() {
    if(!this.colorEl) {
      var model = this.model;
      var colorEl = $('<div>', {class: this.colorCls});
      var cpStyle = colorEl.get(0).style;
      var elToAppend = this.target && this.target.config ? this.target.config.el : '';
      colorEl.spectrum({
        appendTo: elToAppend || 'body',
        maxSelectionSize: 8,
        showPalette: true,
        showAlpha:   true,
        chooseText: 'Ok',
        cancelText: '⨯',
        palette: [],
        move(color) {
          var c  = color.getAlpha() == 1 ? color.toHexString() : color.toRgbString();
          cpStyle.backgroundColor = c;
        },
        change(color) {
          var c  = color.getAlpha() == 1 ? color.toHexString() : color.toRgbString();
          c = c.replace(/ /g,'');
          cpStyle.backgroundColor = c;
          model.set('value', c);
        }
      });
      this.colorEl = colorEl;
    }
    return this.colorEl;
  },

  render(...args) {
    Input.prototype.render.apply(this, args);
    this.$el.find('.' + this.colorHolderClass).html(this.getColorEl());
    return this;
  }

});
