module.exports = require('./PropertyView').extend({

  templateInput() {
    const pfx = this.pfx;
    const ppfx = this.ppfx;
    return `
      <div class="${ppfx}field ${ppfx}field-radio">
        <span id="${pfx}input-holder"></span>
      </div>
    `;
  },

  onRender() {
    const pfx = this.pfx;
    const ppfx = this.ppfx;
    const itemCls = `${ppfx}radio-item-label`;
    const model = this.model;
    const prop = model.get('property');
    const options = model.get('list') || model.get('options') || [];

    if (!this.input) {
      if(options && options.length) {
        let inputStr = '';

        options.forEach(el => {
          let cl = el.className ?  `${el.className} ${pfx}icon ${itemCls}` : '';
          let id = `${prop}-${el.value}`;
          let labelTxt = el.name || el.value;
          let titleAttr = el.title ? `title="${el.title}"` : '';
          inputStr += `
            <div class="${ppfx}radio-item">
              <input type="radio" class="${pfx}radio" id="${id}" name="${prop}" value="${el.value}"/>
              <label class="${cl || itemCls}" ${titleAttr} for="${id}">${cl ? '' : labelTxt}</label>
            </div>
          `;
        });

        const inputHld = this.el.querySelector(`#${pfx}input-holder`);
        inputHld.innerHTML = `<div>${inputStr}</div>`;
        this.input = inputHld.firstChild;
      }
    }
  },
  /*
  getInputValue() {
    return this.$input ? this.$el.find('input:checked').val() : '';
  },
*/
  getInputValue() {
    const input = this.getInputEl();
    const inputIn = input ? input.querySelector('input:checked') : '';
    return inputIn ? inputIn.value : '';
  },

  setValue(value) {
    const model = this.model;
    let val = value || model.get('value') || model.getDefaultValue();
    const input = this.getInputEl();
    const inputIn = input ? input.querySelector(`[value="${val}"]`) : '';
    inputIn && (inputIn.checked = true);
  },

});
