import { View } from '../../common';
import html from '../../utils/html';

export default class EditorView extends View {
  template({ pfx, codeName, label }) {
    return html`
      <div class="${pfx}editor" id="${pfx}${codeName}">
        <div id="${pfx}title">${label}</div>
        <div id="${pfx}code"></div>
      </div>
    `;
  }

  initialize(o) {
    this.config = o.config || {};
    this.pfx = this.config.stylePrefix;
  }

  render() {
    const { model, pfx, $el } = this;
    const obj = model.toJSON();
    obj.pfx = pfx;
    $el.html(this.template(obj));
    $el.attr('class', `${pfx}editor-c`);
    $el.find(`#${pfx}code`).append(model.get('input'));
    return this;
  }
}
