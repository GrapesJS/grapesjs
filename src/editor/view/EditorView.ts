import { View, $ } from '../../common';
import { appendStyles } from '../../utils/mixins';
import EditorModel from '../model/Editor';

export default class EditorView extends View<EditorModel> {
  constructor(model: EditorModel) {
    super({ model });
    const { Panels, UndoManager } = model;
    model.view = this;
    model.once('change:ready', () => {
      Panels.active();
      Panels.disableButtons();
      UndoManager.clear();
      setTimeout(() => {
        model.trigger('load', model.Editor);
        model.clearDirtyCount();
      });
    });
  }

  render() {
    const { $el, model } = this;
    const { Panels, Canvas, config, modules } = model;
    const pfx = config.stylePrefix;
    const classNames = [`${pfx}editor`];
    !config.customUI && classNames.push(`${pfx}one-bg ${pfx}two-color`);

    const contEl = $(config.el || `body ${config.container}`);
    config.cssIcons && appendStyles(config.cssIcons, { unique: true, prepand: true });
    $el.empty();

    config.width && contEl.css('width', config.width);
    config.height && contEl.css('height', config.height);

    $el.append(Canvas.render());
    $el.append(Panels.render());

    // Load shallow editor
    const { shallow } = model;
    const shallowCanvasEl = shallow.Canvas.render();
    shallowCanvasEl.style.display = 'none';
    $el.append(shallowCanvasEl);

    $el.attr('class', classNames.join(' '));
    contEl.addClass(`${pfx}editor-cont`).empty().append($el);
    modules.forEach((md) => md.postRender?.(this));

    return this;
  }
}
