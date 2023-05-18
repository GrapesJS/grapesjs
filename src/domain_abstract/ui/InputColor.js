import Backbone from 'backbone';
import { isUndefined } from 'underscore';
import ColorPicker from 'utils/ColorPicker';
import Input from './Input';

const $ = Backbone.$;
ColorPicker($);

export default Input.extend({
  events: {
    'change input': 'onInputColorChange',
    'change select': 'onColorUnitChange',
    change: 'onColorChange'
  },

  template() {
    const ppfx = this.ppfx;
    return `
      <div class="${this.holderClass()}"></div>
      <span class="${ppfx}field-units"></span>
      <div class="${ppfx}field-colorp">
        <div class="${ppfx}field-colorp-c" data-colorp-c>
          <div class="${ppfx}checker-bg"></div>
        </div>
      </div>
    `;
  },

  onColorChange(e) {
    if (this.updateFromInputColor) {
      this.updateFromInputColor = false;
      return;
    }

    //On refocus the currentcolorValues object has to revalidate
    this.revalidateColorObjectOnFocus(this.getInputEl().value);
    this.processSelectedColor();
  },

  onInputColorChange(e) {
    this.updateFromInputColor = true;
    if (
      this.getInputEl().value == '#' ||
      this.getInputEl().value == 'RGB' ||
      this.getInputEl().value == 'rgb'
    ) {
      this.refreshUnitsDropdown(
        this.getUnitEl().value,
        this.currentColorValues
      );
      return;
    } else {
      //On refocus the currentcolorValues object has to revalidate
      this.revalidateColorObjectOnFocus(this.getInputEl().value);
      this.processSelectedColor();
    }
  },

  /**
   * Handled when the view is changed
   */
  onColorUnitChange(e) {
    this.updateFromInputColor = true;
    const inputVal = this.getInputEl().value;

    if (inputVal == 'none' || inputVal == 'None') {
      this.initializeColors();
      return;
    }

    //On refocus the currentcolorValues object has to revalidate
    this.revalidateColorObjectOnFocus(inputVal);

    if (
      JSON.stringify(this.currentColorValues) ==
      JSON.stringify({ Name: '', Hex: '', RGB: '' })
    ) {
      this.processSelectedColor(inputVal);
    }

    this.processSelectedUnit();
    const unit = this.getUnitEl().value;
    this.refreshUnitsDropdown(unit, this.currentColorValues);
    this.setSelectedColor(unit, this.currentColorValues);
  },

  processSelectedUnit() {
    const inputVal = this.getInputEl().value;

    if (this.isHex(inputVal)) {
      if (this.currentColorValues.Hex != inputVal) {
        this.setColor(
          this.getColorName(inputVal),
          this.getRGBValue(inputVal),
          inputVal
        );
      }
      return;
    } else if (this.isRGB(inputVal)) {
      if (this.currentColorValues.RGB != inputVal) {
        const hexVal = '#' + this.getColorHexByRGB(inputVal);
        this.setColor(this.getColorName(hexVal), inputVal, hexVal);
      }
      return;
    } else if (this.isName(inputVal)) {
      if (this.currentColorValues.Name != inputVal) {
        const hexVal = '#' + this.getHexValue(inputVal);
        this.setColor(inputVal, this.getRGBValue(hexVal), hexVal);
      }
      return;
    }
  },

  processSelectedColor() {
    const inputVal = this.getInputEl().value;

    if (!this.updateFromInputColor) {
      if (this.isHex(inputVal)) {
        this.getUnitEl().value = 'Hex';
      } else if (this.isRGB(inputVal)) {
        this.getUnitEl().value = 'RGB';
      } else if (this.getHexValue(inputVal) != undefined) {
        this.getUnitEl().value = 'Name';
      }
    }

    const unit = this.getUnitEl().value;

    switch (unit) {
      case 'Hex': {
        if (!this.isValidHexInput(inputVal)) {
          this.resetInput();
        } else {
          let hexVal = '';
          if (!inputVal.startsWith('#')) {
            hexVal = '#' + inputVal;
          } else {
            hexVal = inputVal;
          }

          this.setColor(
            this.getColorName(inputVal),
            this.getRGBValue(hexVal),
            hexVal
          );
        }
        break;
      }
      case 'RGB': {
        if (!this.isValidRGBInput(inputVal)) {
          this.resetInput();
        } else {
          const hexVal = '#' + this.getColorHexByRGB(inputVal);
          this.setColor(this.getColorName(hexVal), inputVal, hexVal);
        }
        break;
      }
      case 'Name': {
        if (
          this.isHex(inputVal) ||
          this.isRGB(inputVal) ||
          /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/i.test(inputVal)
        ) {
          this.resetInput();
        } else {
          //Check for invalid name or random input
          if (this.getHexValue(inputVal) == undefined) {
            this.setSelectedColor(unit, this.currentColorValues);
            return;
          }

          const hexVal = '#' + this.getHexValue(inputVal);
          this.setColor(inputVal, this.getRGBValue(hexVal), hexVal);
        }
        break;
      }
      default: {
        break;
      }
    }

    this.refreshUnitsDropdown(unit, this.currentColorValues);
    this.setSelectedColor(unit, this.currentColorValues);
  },

  revalidateColorObjectOnFocus(inputVal) {
    if (
      JSON.stringify(this.currentColorValues) ==
      JSON.stringify({ Name: '', Hex: '', RGB: '' })
    ) {
      if (this.isHex(inputVal)) {
        this.currentColorValues.Name = this.getColorName(inputVal);
        this.currentColorValues.Hex = inputVal;
        this.currentColorValues.RGB = this.getRGBValue(inputVal);
        return;
      }

      if (this.isRGB(inputVal)) {
        const hexVal = '#' + this.getColorHexByRGB(inputVal);
        this.currentColorValues.RGB = inputVal;
        this.currentColorValues.Name = this.getColorName(hexVal);
        this.currentColorValues.Hex = hexVal;
        return;
      }

      if (!this.isHex(inputVal) && !this.isRGB(inputVal)) {
        const hexVal = '#' + this.getHexValue(inputVal);
        this.currentColorValues.Name = inputVal;
        this.currentColorValues.RGB = this.getRGBValue(hexVal);
        this.currentColorValues.Hex = hexVal;
        return;
      }
    }
  },

  setColor(name, rgb, hex) {
    if (this.currentColorValues == null || this.currentColorValues == undefined)
      this.currentColorValues = { Name: '', Hex: '', RGB: '' };

    this.currentColorValues.RGB = rgb;
    this.currentColorValues.Hex = hex;
    this.currentColorValues.Name = name;
  },

  refreshUnitsDropdown(selectedUnit, colorObj) {
    if (!colorObj || !selectedUnit) return;

    const units = ['Hex', 'RGB', 'Name'];

    if (units.length) {
      var options = [];

      units.forEach(unit => {
        if (unit === 'Name') {
          if (
            colorObj.Name != '' &&
            colorObj.Name != undefined &&
            selectedUnit == 'Name'
          ) {
            options.push(`<option selected>${unit}</option>`);
          } else if (colorObj.Name == '' || colorObj.Name == undefined) {
            options.push(`<option disabled>${unit}</option>`);
          } else if (colorObj.Name != '') {
            options.push(`<option>${unit}</option>`);
          }
        }

        if (unit === 'RGB') {
          if (
            colorObj.RGB != '' &&
            colorObj.RGB != undefined &&
            selectedUnit == 'RGB'
          ) {
            options.push(`<option selected>${unit}</option>`);
          } else if (colorObj.RGB == '' || colorObj.RGB == undefined) {
            options.push(`<option disabled>${unit}</option>`);
          } else if (colorObj.RGB != '' || colorObj.RGB != undefined) {
            options.push(`<option>${unit}</option>`);
          }
        }

        if (unit === 'Hex') {
          if (
            colorObj.Hex != '' &&
            colorObj.Hex != undefined &&
            selectedUnit == 'Hex'
          ) {
            options.push(`<option selected>${unit}</option>`);
          } else if (colorObj.Hex == '' || colorObj.RGB == undefined) {
            options.push(`<option disabled>${unit}</option>`);
          } else if (colorObj.Hex != '' || colorObj.RGB != undefined) {
            options.push(`<option>${unit}</option>`);
          }
        }
      });

      this.unitEl.innerHTML = `<select class="${
        this.ppfx
      }input-unit">${options.join('')}</select>`;
    }
  },

  setSelectedColor(selectedUnit, currentColorValues) {
    switch (selectedUnit) {
      case 'Name': {
        this.setValue(currentColorValues.Name + 'Name');
        this.getInputEl().value = currentColorValues.Name;
        break;
      }
      case 'RGB': {
        this.setValue(currentColorValues.RGB + 'RGB');
        this.getInputEl().value = currentColorValues.RGB;
        break;
      }
      case 'Hex': {
        this.setValue(currentColorValues.Hex + 'Hex');
        this.getInputEl().value = currentColorValues.Hex;
        break;
      }
      default:
        break;
    }
  },

  getHexValue(colorName) {
    if (this.isHex(colorName)) {
      colorName = colorName.substring(1);
    }
    colorName = colorName.toLowerCase();
    const tinyColor = window.tinycolor;
    const hexVal = tinyColor.names[colorName];
    return hexVal;
  },

  getRGBValue(colorHex) {
    const tinyColor = window.tinycolor;
    const rgb = tinyColor(colorHex).toRgbString();
    return rgb;
  },

  getColorName(colorHex) {
    if (this.isHex(colorHex)) {
      colorHex = colorHex.substring(1);
    }
    colorHex = colorHex.toLowerCase();
    const tinyColor = window.tinycolor;
    const name = tinyColor.hexNames[colorHex];
    return name != 'undefined' ? name : '';
  },

  getColorHexByRGB(rgb) {
    const tinyColor = window.tinycolor;
    //
    let hexValue = tinyColor(rgb).toHex8();
    let alpha = tinyColor(rgb).getCurrentAlpha();
    if (rgb == 'rgb(0, 0, 0)' || alpha == 1) {
      hexValue = tinyColor(rgb).toHex();
    }

    return hexValue;
  },

  inputClass() {
    const ppfx = this.ppfx;
    return `${ppfx}field ${ppfx}field-color`;
  },

  holderClass() {
    return `${this.ppfx}input-holder`;
  },

  remove() {
    Input.prototype.remove.apply(this, arguments);
    this.colorEl.spectrum('destroy');
  },

  /**
   * Set value to the model
   * @param {string} val
   * @param {Object} opts
   */
  setValue(val, opts = {}) {
    if (this.isSettingValue) {
      return;
    }
    this.isSettingValue = true;
    const model = this.model;
    const def = model.get('defaults');
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

    //On refocusing the control, based on the color value we need to set the unit
    if (valueClr) {
      const selectedUnit = this.getUnitEl().value;
      if (this.isHex(valueClr) && selectedUnit != 'Hex') {
        this.getUnitEl().value = 'Hex';
        this.onColorUnitChange(null);
      } else if (this.isRGB(valueClr) && selectedUnit != 'RGB') {
        this.getUnitEl().value = 'RGB';
        this.onColorUnitChange(null);
      } else if (
        this.isName(valueClr) &&
        this.getHexValue(valueClr) != undefined &&
        selectedUnit != 'Name'
      ) {
        this.getUnitEl().value = 'Name';
        this.onColorUnitChange(null);
      } else {
        this.initializeColors();
        this.revalidateColorObjectOnFocus(valueClr);
        this.refreshUnitsDropdown(selectedUnit, this.currentColorValues);
      }
    }
    this.isSettingValue = false;
  },

  /**
   * Get the color input element
   * @return {HTMLElement}
   */
  getColorEl() {
    if (!this.colorEl) {
      const { em } = this;
      const self = this;
      const ppfx = this.ppfx;
      var model = this.model;

      var colorEl = $(`<div class="${this.ppfx}field-color-picker"></div>`);
      var cpStyle = colorEl.get(0).style;
      var elToAppend = em && em.config ? em.config.el : '';
      var colorPickerConfig =
        (em && em.getConfig && em.getConfig('colorPicker')) || {};
      const getColor = color => {
        let cl =
          color.getAlpha() == 1 ? color.toHexString() : color.toRgbString();
        return cl.replace(/ /g, '');
      };

      let changed = 0;
      let previousColor;
      let isHideOnSelection = false;
      this.$el.find(`[data-colorp-c]`).append(colorEl);
      colorEl.spectrum({
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
          changed = 0;
          const cl = getColor(color);
          cpStyle.backgroundColor = cl;
          model.setValueFromInput(cl, 0);
        },
        change(color) {
          changed = 1;
          const cl = getColor(color);
          cpStyle.backgroundColor = cl;
          model.setValueFromInput(cl);
          self.noneColor = 0;
        },
        show(color) {
          changed = 0;
          previousColor = getColor(color);
          isHideOnSelection = false;
          const propertyId = model.attributes.property;
          em.trigger('inputcolor:show', this, propertyId, previousColor); // this event is not a native GrapesJS event, it was added for CCIDE
        },
        hide(color) {
          if (!changed && previousColor) {
            if (self.noneColor) {
              previousColor = '';
            }
            // if coming from hide due to a selection event then use the color which was set
            if (isHideOnSelection) {
              previousColor = getColor(color);
            }
            cpStyle.backgroundColor = previousColor;
            colorEl.spectrum('set', previousColor);
            model.setValueFromInput(previousColor, 0);
          }
        }
      });

      em &&
        em.on &&
        em.on('component:selected', model => {
          changed = 0;
          self.noneColor = false;
          isHideOnSelection = true;
          colorEl.spectrum('hide');
        });

      this.colorEl = colorEl;
    }
    return this.colorEl;
  },

  getUnitEl() {
    if (!this.unitEl) {
      const units = ['Hex', 'RGB', 'Name'];

      if (units.length) {
        const options = [];

        units.forEach(unit => {
          options.push(`<option >${unit}</option>`);
        });

        const temp = document.createElement('div');
        temp.innerHTML = `<select class="${this.ppfx}input-unit">${options.join(
          ''
        )}</select>`;
        this.unitEl = temp.firstChild;
      }
    }

    return this.unitEl;
  },

  initializeColors() {
    this.currentColorValues = { Name: '', Hex: '', RGB: '' };
    this.getUnitEl();
  },

  resetInput() {
    let val = '';
    if (this.model && this.model.attributes && this.model.attributes.value) {
      val = this.model.attributes.value;
      this.currentColorValues = { Name: '', Hex: '', RGB: '' };
      this.revalidateColorObjectOnFocus(val);
    } else {
      this.getInputEl().value = '';
      this.getUnitEl();
    }
  },

  isRGB(inputVal) {
    return inputVal.startsWith('RGB') || inputVal.startsWith('rgb');
  },

  isHex(inputVal) {
    return inputVal.startsWith('#');
  },

  isName(inputVal) {
    return !this.isRGB(inputVal) && !this.isHex(inputVal);
  },

  isValidRGBInput(inputVal) {
    let range = '(\\d|[1-9]\\d|1\\d{2}|2[0-4]\\d|2[0-5]{2})';
    let rgb = new RegExp(
      '^rgb\\(\\s*' +
        range +
        '\\s*,\\s*' +
        range +
        '\\s*,\\s*' +
        range +
        '\\s*\\)$'
    );
    return rgb.test(inputVal);
  },

  isValidHexInput(inputVal) {
    return this.isHex(inputVal) && inputVal.match(/[0-9A-Fa-f]{6}/g);
  },

  render() {
    Input.prototype.render.call(this);
    this.unitEl = null;
    this.updateFromInputColor = false;
    this.isSettingValue = false;
    this.getColorEl();
    const unit = this.getUnitEl();
    this.initializeColors();
    // This will make the color input available on render
    unit &&
      this.$el
        .find(`.${this.ppfx}field-units`)
        .get(0)
        .appendChild(unit);
    return this;
  }
});
