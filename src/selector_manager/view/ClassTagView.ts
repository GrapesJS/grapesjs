import { View } from '../../common';
import Selector from '../model/Selector';
import html from '../../utils/html';
import EditorModel from '../../editor/model/Editor';
import SelectorManager from '..';
import { SelectorManagerConfig } from '../config/config';

const inputProp = 'contentEditable';

export default class ClassTagView extends View<Selector> {
  template() {
    const { pfx, model, config } = this;
    const label = model.get('label') || '';

    return html`
      <span id="${pfx}checkbox" class="${pfx}tag-status" data-tag-status></span>
      <span id="${pfx}tag-label" data-tag-name>${label}</span>
      <span id="${pfx}close" class="${pfx}tag-close" data-tag-remove> $${config.iconTagRemove!} </span>
    `;
  }

  events() {
    return {
      'click [data-tag-remove]': 'removeTag',
      'click [data-tag-status]': 'changeStatus',
      'dblclick [data-tag-name]': 'startEditTag',
      'focusout [data-tag-name]': 'endEditTag',
    };
  }
  config: SelectorManagerConfig;
  module: SelectorManager;
  coll: any;
  pfx: string;
  ppfx: string;
  em: EditorModel;
  inputEl?: HTMLElement;

  constructor(o: any = {}) {
    super(o);
    const config = o.config || {};
    this.config = config;
    this.module = o.module;
    this.coll = o.coll || null;
    this.pfx = config.stylePrefix || '';
    this.ppfx = config.pStylePrefix || '';
    this.em = config.em;
    this.listenTo(this.model, 'change:active', this.updateStatus);
  }

  /**
   * Returns the element which containes the anme of the tag
   * @return {HTMLElement}
   */
  getInputEl() {
    if (!this.inputEl) {
      this.inputEl = this.el.querySelector('[data-tag-name]') as HTMLElement;
    }

    return this.inputEl;
  }

  /**
   * Start editing tag
   * @private
   */
  startEditTag() {
    const { em } = this;
    const inputEl = this.getInputEl();
    inputEl[inputProp] = 'true';
    inputEl.focus();
    em?.setEditing(true);
  }

  /**
   * End editing tag. If the class typed already exists the
   * old one will be restored otherwise will be changed
   * @private
   */
  endEditTag() {
    const { model, em } = this;
    const inputEl = this.getInputEl();
    const label = inputEl.textContent || '';
    const sm = em?.Selectors;
    inputEl[inputProp] = 'false';
    em?.setEditing(false);

    if (sm && sm.rename(model, label) !== model) {
      inputEl.innerText = model.getLabel();
    }
  }

  /**
   * Update status of the tag
   * @private
   */
  changeStatus() {
    const { model } = this;
    model.set('active', !model.getActive());
  }

  /**
   * Remove tag from the selected component
   * @param {Object} e
   * @private
   */
  removeTag() {
    this.module.removeSelected(this.model);
  }

  /**
   * Update status of the checkbox
   * @private
   */
  updateStatus() {
    const { model, $el, config } = this;
    const { iconTagOn, iconTagOff } = config;
    const $chk = $el.find('[data-tag-status]');

    if (model.get('active')) {
      $chk.html(iconTagOn!);
      $el.removeClass('opac50');
    } else {
      $chk.html(iconTagOff!);
      $el.addClass('opac50');
    }
  }

  render() {
    const { pfx, ppfx, $el, model } = this;
    const mainCls = `${pfx}tag`;
    const classes = [`${mainCls} ${ppfx}three-bg`];
    model.get('protected') && classes.push(`${mainCls}-protected`);
    $el.html(this.template());
    $el.attr('class', classes.join(' '));
    this.updateStatus();
    return this;
  }
}
