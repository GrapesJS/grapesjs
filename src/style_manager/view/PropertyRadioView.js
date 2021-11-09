import PropertyView from './PropertyView';

export default PropertyView.extend({
  templateInput() {
    const ppfx = this.ppfx;
    return `
      <div class="${ppfx}field ${ppfx}field-radio">
      </div>
    `;
  },

  onRender() {
    const { pfx, ppfx, model } = this;
    const itemCls = `${ppfx}radio-item-label`;
    const prop = model.get('property');
    const options = model.get('list') || model.get('options') || [];
    const clsInput = `${pfx}radio ${pfx}radio-${prop}`;
    const { cid } = model;

    if (!this.input) {
      if (options && options.length) {
        let inputStr = '';

        options.forEach(opt => {
          const cls = opt.className
            ? `${opt.className} ${pfx}icon ${itemCls}`
            : '';
          const id = model.getOptionId(opt);
          const elId = `${prop}-${id}-${cid}`;
          const labelEl = cls ? '' : model.getOptionLabel(id);
          const titleAttr = opt.title ? `title="${opt.title}"` : '';
          inputStr += `
            <div class="${ppfx}radio-item">
              <input type="radio" class="${clsInput}" id="${elId}" name="${prop}-${cid}" value="${id}"/>
              <label class="${cls ||
                itemCls}" ${titleAttr} for="${elId}">${labelEl}</label>
            </div>
          `;
        });

        const inputHld = this.el.querySelector(`.${ppfx}field`);
        inputHld.innerHTML = `<div class="${ppfx}radio-items">${inputStr}</div>`;
        this.input = inputHld.firstChild;
      }
    }
  },

  getInputValue() {
    const inputChk = this.getCheckedEl();
    return inputChk ? inputChk.value : '';
  },

  getCheckedEl() {
    const input = this.getInputEl();
    return input ? input.querySelector('input:checked') : '';
  },

  setValue(value) {
    const model = this.model;
    let val = value || model.get('value') || model.getDefaultValue();
    const input = this.getInputEl();
    const inputIn = input ? input.querySelector(`[value="${val}"]`) : '';

    if (inputIn) {
      inputIn.checked = true;
    } else {
      const inputChk = this.getCheckedEl();
      inputChk && (inputChk.checked = false);
    }
  }
});
