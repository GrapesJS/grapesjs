import { isUndefined } from 'underscore';
import ColorPicker from '../../utils/ColorPicker';
import $ from '../../utils/cash-dom';
import Input from './Input';

$ && ColorPicker($);

const getColor = (color: any) => {
  const name = color.getFormat() === 'name' && color.toName();
  const cl = color.getAlpha() == 1 ? color.toHexString() : color.toRgbString();
  return name || cl.replace(/ /g, '');
};

export default class InputColor extends Input {
  colorEl?: any;
  movedColor?: string;
  noneColor?: boolean;
  model!: any;

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
    super.remove();
    this.colorEl.spectrum('destroy');
    return this;
  }

  handleChange(e: any) {
    e.stopPropagation();
    const { value } = e.target;
    if (isUndefined(value)) return;
    this.__onInputChange(value);
  }

  __onInputChange(val: string) {
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
  setValue(val: string, opts: any = {}) {
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
      this.movedColor = valueClr;
    }
  }

  /**
   * Get the color input element
   * @return {HTMLElement}
   */
  getColorEl() {
    if (!this.colorEl) {
      const { em, model, opts } = this;
      const ppfx = this.ppfx;
      const { onChange } = opts;

      const colorEl = $(`<div class="${this.ppfx}field-color-picker"></div>`);
      const cpStyle = colorEl.get(0)!.style;
      const colorPickerConfig = (em && em.getConfig && em.getConfig().colorPicker) || {};

      this.movedColor = '';
      let changed = false;
      let previousColor: string;
      this.$el.find('[data-colorp-c]').append(colorEl);

      const handleChange = (value: string, complete = true) => {
        if (onChange) {
          onChange(value, !complete);
        } else {
          complete && model.setValueFromInput(0, false); // for UndoManager
          model.setValueFromInput(value, complete);
        }
      };

      // @ts-ignore
      colorEl.spectrum({
        color: model.getValue() || false,
        containerClassName: `${ppfx}one-bg ${ppfx}two-color ${ppfx}editor-sp`,
        maxSelectionSize: 8,
        showPalette: true,
        showAlpha: true,
        chooseText: 'Ok',
        cancelText: '⨯',
        palette: [],

        // config expanded here so that the functions below are not overridden
        ...colorPickerConfig,
        ...(model.get('colorPicker') || {}),

        move: (color: any) => {
          const cl = getColor(color);
          this.movedColor = cl;
          cpStyle.backgroundColor = cl;
          handleChange(cl, false);
        },
        change: (color: any) => {
          changed = true;
          const cl = getColor(color);
          cpStyle.backgroundColor = cl;
          handleChange(cl);
          this.noneColor = false;
        },
        show: (color: any) => {
          changed = false;
          this.movedColor = '';
          previousColor = onChange ? model.getValue({ noDefault: true }) : getColor(color);
        },
        hide: () => {
          if (!changed && (previousColor || onChange)) {
            if (this.noneColor) {
              previousColor = '';
            }
            cpStyle.backgroundColor = previousColor;
            // @ts-ignore
            colorEl.spectrum('set', previousColor);
            handleChange(previousColor, false);
          }
        },
      });

      if (em && em.on!) {
        this.listenTo(em, 'component:selected', () => {
          this.movedColor && handleChange(this.movedColor);
          changed = true;
          this.movedColor = '';
          // @ts-ignore
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
