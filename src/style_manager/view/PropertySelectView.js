import PropertyView from './PropertyView';

export default class PropertySelectView extends PropertyView {
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
  }

  initialize(...args) {
    PropertyView.prototype.initialize.apply(this, args);
    this.listenTo(this.model, 'change:options', this.updateOptions);
  }

  updateOptions() {
    this.input = null;
    this.onRender();
  }

  onRender() {
    const { model, pfx } = this;
    const options = model.getOptions();

    if (!this.input) {
      const optionsRes = [];

      options.forEach(option => {
        const id = model.getOptionId(option);
        const name = model.getOptionLabel(id);
        const style = option.style ? option.style.replace(/"/g, '&quot;') : '';
        const styleAttr = style ? `style="${style}"` : '';
        const value = id.replace(/"/g, '&quot;');
        optionsRes.push(`<option value="${value}" ${styleAttr}>${name}</option>`);
      });

      const inputH = this.el.querySelector(`#${pfx}input-holder`);
      inputH.innerHTML = `<select>${optionsRes.join('')}</select>`;
      this.input = inputH.firstChild;
    }
  }

  __setValueInput(value) {
    const { model } = this;
    const input = this.getInputEl();
    const firstOpt = model.getOptions()[0];
    const firstId = firstOpt ? model.getOptionId(firstOpt) : '';
    input && (input.value = value || firstId);
  }
}
