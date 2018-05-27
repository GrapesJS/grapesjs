import Backbone from 'backbone';
const $ = Backbone.$;

module.exports = require('./PropertyView').extend({
  templateInput() {
    const pfx = this.pfx;
    const ppfx = this.ppfx;
    return `
      <div class="${ppfx}field ${ppfx}select">
        <span id="${pfx}input-holder"></span>
        <div class="${ppfx}sel-arrow">
          <div class="${ppfx}d-s-arrow"></div>
        </div>
      </div>
    `;
  },

  onRender() {
    var pfx = this.pfx;
    const model = this.model;
    const options = model.get('list') || model.get('options') || [];

    if (!this.input) {
      let optionsStr = '';

      options.forEach(option => {
        let name = option.name || option.value;
        let style = option.style ? option.style.replace(/"/g, '&quot;') : '';
        let styleAttr = style ? `style="${style}"` : '';
        let value = option.value.replace(/"/g, '&quot;');
        optionsStr += `<option value="${value}" ${styleAttr}>${name}</option>`;
      });

      const inputH = this.el.querySelector(`#${pfx}input-holder`);
      inputH.innerHTML = `<select>${optionsStr}</select>`;
      this.input = inputH.firstChild;
    }
  }
});
