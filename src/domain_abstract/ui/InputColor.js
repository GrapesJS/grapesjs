import Backbone from 'backbone';
import { isUndefined } from 'underscore';
import ColorPicker from '../../utils/ColorPicker';
import Input from './Input';

const { $ } = Backbone;
$ && ColorPicker($);

const getColor = color => {
  const name = color.getFormat() === 'name' && color.toName();
  const cl = color.getAlpha() == 1 ? color.toHexString() : color.toRgbString();
  return name || cl.replace(/ /g, '');
};

export default class InputColor extends Input {
  template() {
    const ppfx = this.ppfx;
    return `
      <div class="${this.holderClass()}"></div>
      <div class="${ppfx}field-colorp">
        <div class="${ppfx}field-colorp-c" data-colorp-c>
          <div class="${ppfx}checker-bg"></div>
        </div>
      </div>
    `;
  }

  inputClass() {
    const ppfx = this.ppfx;
    return `${ppfx}field ${ppfx}field-color`;
  }

  holderClass() {
    return `${this.ppfx}input-holder`;
  }

  remove() {
    Input.prototype.remove.apply(this, arguments);
    this.colorEl.spectrum('destroy');
  }

  handleChange(e) {
    e.stopPropagation();
    const { value } = e.target;
    if (isUndefined(value)) return;
    this.__onInputChange(value);
  }

  __onInputChange(val) {
    const { model, opts } = this;
    const { onChange } = opts;
    let value = val;
    const colorEl = this.getColorEl();

    // Check the color by using the ColorPicker's parser
    if (colorEl) {
      colorEl.spectrum('set', value);
      const tc = colorEl.spectrum('get');
      const color = value && getColor(tc);
      color && (value = color);
    }

    onChange ? onChange(value) : model.set({ value }, { fromInput: 1 });
  }

  /**
   * Set value to the model
   * @param {string} val
   * @param {Object} opts
   */
  setValue(val, opts = {}) {
    const { model } = this;
    const def = !isUndefined(opts.def) ? opts.def : model.get('defaults');
    const value = !isUndefined(val) ? val : !isUndefined(def) ? def : '';
    const inputEl = this.getInputEl();
    const colorEl = this.getColorEl();
    const valueClr = value != 'none' ? value : '';
    inputEl.value = value;
    colorEl.get(0).style.backgroundColor = valueClr;

    // This prevents from adding multiple thumbs in spectrum
    if (opts.fromTarget || (opts.fromInput && !opts.avoidStore)) {
      colorEl.spectrum('set', valueClr);
      this.noneColor = value == 'none';
    }
  }

  /**
   * Get the color input element
   * @return {HTMLElement}
   */
  getColorEl() {
    if (!this.colorEl) {
      const { em, model, opts } = this;
      const self = this;
      const ppfx = this.ppfx;
      const { onChange } = opts;

      var colorEl = $(`<div class="${this.ppfx}field-color-picker"></div>`);
      var cpStyle = colorEl.get(0).style;
      var elToAppend = em && em.config ? em.config.el : '';
      var colorPickerConfig = (em && em.getConfig && em.getConfig().colorPicker) || {};

      let changed = false;
      let movedColor = '';
      let previousColor;
      this.$el.find('[data-colorp-c]').append(colorEl);

      const handleChange = (value, complete = true) => {
        if (onChange) {
          onChange(value, !complete);
        } else {
          complete && model.setValueFromInput(0, false); // for UndoManager
          model.setValueFromInput(value, complete);
        }
      };

      colorEl.spectrum({
        color: model.getValue() || false,
        containerClassName: `${ppfx}one-bg ${ppfx}two-color`,
        appendTo: elToAppend || 'body',
        maxSelectionSize: 8,
        showPalette: true,
        showAlpha: true,
        chooseText: 'Ok',
        cancelText: '⨯',
        palette: [],

        // config expanded here so that the functions below are not overridden
        ...colorPickerConfig,
        ...(model.get('colorPicker') || {}),

        move(color) {
          const cl = getColor(color);
          movedColor = cl;
          cpStyle.backgroundColor = cl;
          handleChange(cl, false);
        },
        change(color) {
          changed = true;
          const cl = getColor(color);
          cpStyle.backgroundColor = cl;
          handleChange(cl);
          self.noneColor = 0;
        },
        show(color) {
          changed = false;
          movedColor = '';
          previousColor = onChange ? model.getValue({ noDefault: true }) : getColor(color);
        },
        hide() {
          if (!changed && (previousColor || onChange)) {
            if (self.noneColor) {
              previousColor = '';
            }
            cpStyle.backgroundColor = previousColor;
            colorEl.spectrum('set', previousColor);
            handleChange(previousColor, false);
          }
        },
      });

      if (em && em.on) {
        this.listenTo(em, 'component:selected', () => {
          movedColor && handleChange(movedColor);
          changed = true;
          movedColor = '';
          colorEl.spectrum('hide');
        });
      }

      this.colorEl = colorEl;
    }
    return this.colorEl;
  }

  render() {
    Input.prototype.render.call(this);
    // This will make the color input available on render
    this.getColorEl();
    return this;
  }
}
