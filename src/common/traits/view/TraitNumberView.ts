import { bindAll, indexOf, isUndefined } from 'underscore';
import { Model, $ } from '../..';
import EditorModel from '../../../editor/model/Editor';
import { off, on } from '../../../utils/dom';
import TraitView, { TraitViewOpts } from './TraitView';

export interface TraitNumberViewOpts extends TraitViewOpts {
  step?: number;
  min?: number;
  max?: number;
  fixedValues?: string[];
}

abstract class TraitNumberViewAbstract<TModel extends Model, TraitValueType> extends TraitView<TModel, TraitValueType> {
  protected type = 'number';
  moved?: boolean;
  prValue?: number;
  private current?: { y: number; val: string };
  step: number;
  fixedValues: string[];
  min?: number;
  max?: number;

  events() {
    return {
      'change input': 'handleChange',
      'change select': 'handleUnitChange',
      'click [data-arrow-up]': 'upArrowClick',
      'click [data-arrow-down]': 'downArrowClick',
      'mousedown [data-arrows]': 'downIncrement',
      keydown: 'handleKeyDown',
    };
  }

  constructor(em: EditorModel, opts: TraitNumberViewOpts) {
    super(em, opts);
    bindAll(this, 'moveIncrement', 'upIncrement');
    this.step = opts.step ?? 1;
    this.min = opts.min;
    this.max = opts.max;
    this.fixedValues = opts.fixedValues ?? [];
  }

  get inputNumberValue(): number {
    const el = this.$input?.get(0);
    return el?.value ? (parseFloat(el.value) as any) : this.target.value;
  }

  set inputNumberValue(value: number) {
    const el = this.$input?.get(0);
    el && (el.value = value as any);
  }

  /**
   * Returns input element
   * @return {HTMLElement}
   * @private
   */
  getInputEl() {
    const { ppfx, target, type, paceholder } = this;
    const value = this.target.value;
    console.log(this.$el.get(0));

    const el = $(document.createElement('div'));
    el.addClass(this.inputClass());
    el.html(this.template());
    const plh = paceholder || target.value;
    const inputEl = $(`<input type="${type}" placeholder="${plh}">`);
    el.find(`.${`${this.ppfx}input-holder`}`).append(inputEl);

    console.log(el.get(0));
    //   model.set('value', value, { fromTarget: true });
    inputEl.val(value);
    //   this.$el.find('[data-input]').append(el)
    console.log(this.$el.get(0));
    this.$input = inputEl;
    return el.get(0) as HTMLInputElement;
  }

  template() {
    const ppfx = this.ppfx;
    return `
        <span class="${ppfx}input-holder"></span>
        <span class="${ppfx}field-units"></span>
        <div class="${ppfx}field-arrows" data-arrows>
          <div class="${ppfx}field-arrow-u" data-arrow-up></div>
          <div class="${ppfx}field-arrow-d" data-arrow-down></div>
        </div>
      `;
  }

  inputClass() {
    const ppfx = this.ppfx;
    return `${ppfx}field-int` || `${ppfx}field ${ppfx}field-integer`;
  }

  /**
   * Set value to the model
   * @param {string} value
   * @param {Object} opts
   */
  setValue(value: string) {
    const valid = this.validateInputValue(value, { deepCheck: 1 });

    this.inputNumberValue = valid;
    console.log('SetValue' + this.inputValue);
    this.target.value = this.inputValue;
  }

  /**
   * Handled when the view is changed
   */
  handleChange(e: Event) {
    e.stopPropagation();
    this.setValue(this.inputNumberValue as any);
  }

  /**
   * Handled when user uses keyboard
   */
  handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.upArrowClick();
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.downArrowClick();
    }
  }

  /**
   * Invoked when the up arrow is clicked
   * */
  upArrowClick() {
    const { step, inputNumberValue } = this;
    this.setValue(this.normalizeValue(inputNumberValue + step));
  }

  /**
   * Invoked when the down arrow is clicked
   * */
  downArrowClick() {
    const { step, inputNumberValue } = this;
    this.setValue(this.normalizeValue(inputNumberValue - step));
  }

  /**
   * Change easily integer input value with click&drag method
   * @param Event
   *
   * @return void
   * */
  downIncrement(e: MouseEvent) {
    e.preventDefault();
    console.log('downIncrement');
    this.moved = false;
    this.inputNumberValue = this.inputNumberValue || 0;
    var value = this.normalizeValue(this.inputNumberValue);
    this.setValue(value as any);
    this.current = { y: e.pageY, val: value };
    on(document, 'mousemove', this.moveIncrement);
    on(document, 'mouseup', this.upIncrement);
  }

  /** While the increment is clicked, moving the mouse will update input value
   * @param Object
   *
   * @return bool
   * */
  moveIncrement(ev: MouseEvent) {
    this.moved = true;
    console.log('moveIncrement');
    const { step } = this;
    const data = this.current!;
    var pos = this.normalizeValue(data.val + (data.y - ev.pageY) * step);
    const value = this.validateInputValue(pos);
    this.prValue = value;
    this.inputNumberValue = value;
    return false;
  }

  /**
   * Stop moveIncrement method
   * */
  upIncrement() {
    console.log('upIncrement');
    off(document, 'mouseup', this.upIncrement);
    off(document, 'mousemove', this.moveIncrement);

    if (this.prValue && this.moved) {
      var value = this.prValue;
      this.setValue(value as any);
    }
  }

  normalizeValue(value: any, defValue = 0) {
    const { step } = this;
    let stepDecimals = 0;

    if (isNaN(value)) {
      return defValue;
    }

    value = parseFloat(value);

    if (Math.floor(value) !== value) {
      const side = step.toString().split('.')[1];
      stepDecimals = side ? side.length : 0;
    }

    return stepDecimals ? parseFloat(value.toFixed(stepDecimals)) : value;
  }

  /**
   * Validate input value
   * @param {String} value Raw value
   * @param {Object} opts Options
   * @return {Object} Validated string
   */
  validateInputValue(value?: any, opts: any = {}) {
    const { min, max, fixedValues } = this;
    var opt = opts || {};
    const defValue = ''; //model.get('defaults');
    var val = !isUndefined(value) ? value : defValue;

    if (opt.deepCheck) {
      if (val) {
        // If the value is one of the fixed values I leave it as it is
        var regFixed = new RegExp('^' + fixedValues.join('|'), 'g');
        if (fixedValues.length && regFixed.test(val)) {
          val = val.match(regFixed)[0];
        } else {
          val += ''; // Make it suitable for replace
          val = parseFloat(val.replace(',', '.'));
          val = !isNaN(val) ? val : defValue;
        }
      }
    }

    if (!isUndefined(max)) val = val > max ? max : val;
    if (!isUndefined(min)) val = val < min ? min : val;

    return val;
  }
}

export class TraitNumberView<TModel extends Model> extends TraitNumberViewAbstract<TModel, number> {
  unitEl?: any;

  constructor(em: EditorModel, opts: TraitNumberViewOpts) {
    super(em, opts);
  }

  get inputValue(): number {
    return this.inputNumberValue;
  }

  set inputValue(value: number) {
    this.inputNumberValue = value;
  }
}

export interface TraitNumberUnitViewOpts extends TraitNumberViewOpts {
  units: string[];
}

export class TraitNumberUnitView<TModel extends Model> extends TraitNumberViewAbstract<TModel, string> {
  unitEl?: HTMLSelectElement;
  units: string[];

  constructor(em: EditorModel, opts: TraitNumberUnitViewOpts) {
    super(em, opts);
    this.units = opts.units;
  }

  get inputValue(): string {
    let unit = this.inputUnitValue;
    if ((this.inputNumberValue as any) === '') unit = '';
    return this.inputNumberValue + unit;
  }

  set inputValue(value: string) {
    const valueString = value + '';
    const numberRegexp = valueString.match(/^\d*\.?\d*/);
    const number = numberRegexp ? numberRegexp[0] : '';
    this.inputNumberValue = parseFloat(number);
    const unit = valueString.slice(number.length);
    this.inputUnitValue = unit;
  }

  get inputUnitValue(): string {
    const { units } = this;
    const el = this.unitEl;
    return el?.value ?? ((units.length && units[0]) || '');
  }

  set inputUnitValue(value: string) {
    const { unitEl, units } = this;
    // Check if exists as unit
    let unit = '';
    if (indexOf(units, value) >= 0) unit = value;
    unitEl && (unitEl.value = unit);
  }
  /**
   * Returns input element
   * @return {HTMLElement}
   * @private
   */
  getInputEl() {
    const el = super.getInputEl();
    this.unitEl = undefined;
    const unit = this.getUnitEl();
    unit && $(el).find(`.${this.ppfx}field-units`).get(0)!.appendChild(unit);
    return el;
  }

  /**
   * Handled when the view is changed
   */
  handleUnitChange(e: Event) {
    e.stopPropagation();
    console.log('Unit changed');
    this.target.value = this.inputValue;
  }

  /**
   * Get the unit element
   * @return {HTMLElement}
   */
  getUnitEl() {
    if (!this.unitEl) {
      const { units } = this;
      if (units.length) {
        const options = ['<option value="" disabled hidden>-</option>'];

        units.forEach((unit: string) => {
          const selected = unit == this.inputUnitValue ? 'selected' : '';
          options.push(`<option ${selected}>${unit}</option>`);
        });

        const temp = document.createElement('div');
        temp.innerHTML = `<select class="${this.ppfx}input-unit">${options.join('')}</select>`;
        this.unitEl = temp.firstChild as any;
      }
    }

    return this.unitEl;
  }
}
