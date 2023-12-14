import TraitView from './TraitView';
import { Model, $ } from '../..';
import { isUndefined } from 'underscore';
import ColorPicker from '../../../utils/ColorPicker';

$ && ColorPicker($);

const getColor = (color: any) => {
  const name = color.getFormat() === 'name' && color.toName();
  const cl = color.getAlpha() == 1 ? color.toHexString() : color.toRgbString();
  return name || cl.replace(/ /g, '');
};

export default class TraitColorView<TModel extends Model> extends TraitView<TModel, any> {
  type = 'text';
  colorPicker?: any;
  templateInput() {
    return '';
  }

  get inputValue(): any {
    const el = this.$input?.get(0);
    return el?.value ? (el.value as any) : this.target.value;
  }

  set inputValue(value: any) {
    const colorEl = this.getColorEl();

    // Check the color by using the ColorPicker's parser
    if (colorEl) {
      const valueClr = value != 'none' ? value : '';
      colorEl.spectrum('set', valueClr);
      const tc = colorEl.spectrum('get');
      const color = valueClr && getColor(tc);

      colorEl.get(0).style.backgroundColor = valueClr;
      this.noneColor = value == 'none';
      this.movedColor = valueClr;

      const el = this.$input?.get(0);
      el && (el.value = color as any);
    }
  }
  /**
   * Returns input element
   * @return {HTMLElement}
   * @private
   */
  getInputEl() {
    if (!this.input) {
      const value = this.target.value;
      const { ppfx, target, type, paceholder } = this;

      console.log(this.$el.get(0));

      const el = $(document.createElement('div'));
      el.addClass(this.inputClass());
      el.html(this.template());
      const plh = paceholder || target.value;
      const inputEl = $(`<input type="${type}" placeholder="${plh}">`);
      el.find(`.${this.holderClass()}`).append(inputEl);

      // This will make the color input available on render
      const colorEl = this.getColorEl();
      el.find('[data-colorp-c]').append(colorEl);
      inputEl.val(value);
      this.$input = inputEl;
      return el.get(0) as HTMLInputElement;
    }

    return this.input;
  }

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
      const { em, colorPicker } = this;
      const ppfx = this.ppfx;

      var colorEl = $(`<div class="${this.ppfx}field-color-picker"></div>`);
      var cpStyle = colorEl.get(0)!.style;
      var elToAppend = em && em.config ? em.config.el : '';
      var colorPickerConfig = (em && em.getConfig && em.getConfig().colorPicker) || {};

      this.movedColor = '';
      let changed = false;
      let previousColor: string;

      const handleChange = (value: string) => {
        this.inputValue = value;
      };

      colorEl.spectrum({
        color: this.target.value || false,
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
        ...(colorPicker || {}),

        move: (color: any) => {
          const cl = getColor(color);
          this.movedColor = cl;
          cpStyle.backgroundColor = cl;
          handleChange(cl);
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
          previousColor = getColor(color);
        },
        hide: () => {
          if (!changed && previousColor) {
            if (this.noneColor) {
              previousColor = '';
            }
            cpStyle.backgroundColor = previousColor;
            colorEl.spectrum('set', previousColor);
            handleChange(previousColor);
          }
        },
      });

      this.colorEl = colorEl;
    }
    return this.colorEl;
  }
}
