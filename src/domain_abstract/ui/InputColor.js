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
  handleModelChange() {
    Input.prototype.handleModelChange.apply(this, arguments);

    var value = this.model.get('value');
    var colorEl = this.getColorEl();

    // If no color selected I will set white for the picker
    value = value === 'none' ? '#fff' : value;
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

      if (typeof colorEl.spectrum == 'undefined') {
        throw 'Spectrum missing, probably you load jQuery twice';
      }

      const getColor = color => {
        let cl = color.getAlpha() == 1 ? color.toHexString() : color.toRgbString();
        return cl.replace(/ /g, '');
      }

      let changed = 0;
      let previousСolor;
      colorEl.spectrum({
        appendTo: elToAppend || 'body',
        maxSelectionSize: 8,
        showPalette: true,
        showAlpha:   true,
        chooseText: 'Ok',
        cancelText: '⨯',
        palette: [],
        move(color) {
          const cl = getColor(color);
          cpStyle.backgroundColor = cl;
          model.set('value', cl, {avoidStore: 1});
        },
        change(color) {
          changed = 1;
          const cl = getColor(color);
          cpStyle.backgroundColor = cl;
          model.set('value', '', {avoidStore: 1});
          model.set('value', cl);
          colorEl.spectrum('set', cl);
        },
        show(color) {
          changed = 0;
          console.log('Show color', color, getColor(color));
          previousСolor = getColor(color);
        },
        hide(color) {
           if (!changed && previousСolor) {
             cpStyle.backgroundColor = previousСolor;
             colorEl.spectrum('set', previousСolor);
             model.set('value', previousСolor, {avoidStore: 1});
           }
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
