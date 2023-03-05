import PropertySelectView from './PropertySelectView';
import PropertyRadio from '../model/PropertyRadio';

export default class PropertyRadioView extends PropertySelectView {
  templateInput() {
    const { ppfx } = this;
    return `<div class="${ppfx}field ${ppfx}field-radio"></div>`;
  }

  onRender() {
    const { pfx, ppfx } = this;
    const model = this.model as PropertyRadio;
    const itemCls = `${ppfx}radio-item-label`;
    const prop = model.getName();
    const options = model.getOptions();
    const clsInput = `${pfx}radio ${pfx}radio-${prop}`;
    const { cid } = model;

    if (!this.input) {
      const optionsRes: string[] = [];

      options.forEach(opt => {
        const cls = opt.className ? `${opt.className} ${pfx}icon ${itemCls}` : '';
        const id = model.getOptionId(opt);
        const elId = `${prop}-${id}-${cid}`;
        const labelEl = cls ? '' : model.getOptionLabel(id);
        const titleAttr = opt.title ? `title="${opt.title}"` : '';
        const checked = model.getValue() === id ? 'checked' : '';
        optionsRes.push(`
          <div class="${ppfx}radio-item">
            <input type="radio" class="${clsInput}" id="${elId}" name="${prop}-${cid}" value="${id}" ${checked}/>
            <label class="${cls || itemCls}" ${titleAttr} for="${elId}">${labelEl}</label>
          </div>
        `);
      });

      const inputHld = this.el.querySelector(`.${ppfx}field`)!;
      inputHld.innerHTML = `<div class="${ppfx}radio-items">${optionsRes.join('')}</div>`;
      this.input = inputHld.firstChild as HTMLInputElement;
    }
  }

  __setValueInput(value: string) {
    const { model } = this;
    const id = value || model.getDefaultValue();
    const inputIn = this.getInputEl()?.querySelector(`[value="${id}"]`) as HTMLInputElement;
    inputIn && (inputIn.checked = true);
  }
}
