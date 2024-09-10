import { View } from '../../common';
import html from '../../utils/html';

export default class CodeEditorView extends View {
  pfx?: string;
  config!: Record<string, any>;

  template({ pfx, codeName, label }: { pfx: string; codeName: string; label: string }) {
    return html`
      <div class="${pfx}editor" id="${pfx}${codeName}">
        <div id="${pfx}title">${label}</div>
        <div id="${pfx}code"></div>
      </div>
    `;
  }

  initialize(o: any) {
    this.config = o.config || {};
    this.pfx = this.config.stylePrefix;
  }

  render() {
    const { model, pfx, $el } = this;
    const obj = model.toJSON();
    const toAppend = model.get('input') || (model as any).getElement?.();
    obj.pfx = pfx;
    $el.html(this.template(obj));
    $el.attr('class', `${pfx}editor-c`);
    $el.find(`#${pfx}code`).append(toAppend);
    return this;
  }
}
