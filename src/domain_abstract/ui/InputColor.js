const Input = require('./Input');
//require('spectrum-colorpicker');
require('utils/ColorPicker');
const $ = Backbone.$;

module.exports = Input.extend({

  template() {
    const ppfx = this.ppfx;
    return `
      <div class="${ppfx}input-holder"></div>
      <div class="${ppfx}field-colorp">
        <div class="${ppfx}field-colorp-c">
          <div class="${ppfx}checker-bg"></div>
        </div>
      </div>
    `;
  },

  initialize(opts) {
    Input.prototype.initialize.apply(this, arguments);
    const ppfx = this.ppfx;
    this.colorCls = `${ppfx}field-color-picker`;
    this.inputClass = `${ppfx}field ${ppfx}field-color`;
    this.colorHolderClass = `${ppfx}field-colorp-c`;
  },

  /**
   * Set value to the model
   * @param {string} val
   * @param {Object} opts
   */
  setValue(val, opts = {}) {
    const model = this.model;
    const value = val || model.get('defaults');
    const inputEl = this.getInputEl();
    const colorEl = this.getColorEl();
    const valueClr = value != 'none' ? value : '';
    inputEl.value = value;
    colorEl.get(0).style.backgroundColor = valueClr;

    if (opts.targetUpdate) {
      colorEl.spectrum('set', valueClr);
      this.noneColor = value == 'none';
    }
  },

  /**
   * Updates the view when the model is changed
   * */
  handleModelChange(model, value, opts) {
    this.setValue(value, opts);
  },

  /**
   * Get the color input element
   * @return {HTMLElement}
   */
  getColorEl() {
    if (!this.colorEl) {
      const self = this;
      var model = this.model;

      var colorEl = $(`<div class="${this.colorCls}"></div>`);
      var cpStyle = colorEl.get(0).style;
      var elToAppend = this.target && this.target.config ? this.target.config.el : '';
      const getColor = color => {
        let cl = color.getAlpha() == 1 ? color.toHexString() : color.toRgbString();
        return cl.replace(/ /g, '');
      }

      let changed = 0;
      let previousСolor;
      this.$el.find(`.${this.colorHolderClass}`).append(colorEl);

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
          self.noneColor = 0;
        },
        show(color) {
          changed = 0;
          previousСolor = getColor(color);
        },
        hide(color) {
           if (!changed && previousСolor) {
             if (self.noneColor) {
               previousСolor = '';
             }
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

  render() {
    Input.prototype.render.call(this);
    // This will make the color input available on render
    this.getColorEl();
    return this;
  }

});
