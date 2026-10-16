import { setStyleText } from '../../utils/dom';
import PropertySelect from '../model/PropertySelect';
import PropertyView from './PropertyView';

export default class PropertySelectView extends PropertyView {
  templateInput() {
    const { pfx, ppfx } = this;
    return `
      <div class="${ppfx}field ${ppfx}select">
        <span id="${pfx}input-holder"></span>
        <div class="${ppfx}sel-arrow">
          <div class="${ppfx}d-s-arrow"></div>
        </div>
      </div>
    `;
  }

  constructor(o: any) {
    super(o);
    this.listenTo(this.model, 'change:options', this.updateOptions);
  }

  updateOptions() {
    delete this.input;
    this.onRender();
  }

  onRender() {
    const { pfx } = this;
    const model = this.model as PropertySelect;
    const options = model.getOptions();

    if (!this.input) {
      const optionsRes: string[] = [];
      const optionsStyle: string[] = [];

      options.forEach((option) => {
        const id = model.getOptionId(option);
        const name = model.getOptionLabel(id);
        const value = id.replace(/"/g, '&quot;');
        optionsStyle.push(option.style || '');
        optionsRes.push(`<option value="${value}">${name}</option>`);
      });

      const inputH = this.el.querySelector(`#${pfx}input-holder`)!;
      inputH.innerHTML = `<select>${optionsRes.join('')}</select>`;
      this.input = inputH.firstChild as HTMLInputElement;
      // Option styles are applied through the CSSOM, a `style` attribute would
      // be blocked by a strict `style-src-attr` policy
      const optionEls = this.input.querySelectorAll('option');
      optionsStyle.forEach((style, i) => style && setStyleText(optionEls[i] as HTMLElement, style));
    }
  }

  __setValueInput(value: string) {
    const model = this.model as PropertySelect;
    const input = this.getInputEl();
    const firstOpt = model.getOptions()[0];
    const firstId = firstOpt ? model.getOptionId(firstOpt) : '';
    input && (input.value = value || firstId);
  }
}
