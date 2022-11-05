import Backbone from 'backbone';
import { View } from '../../common';
import { appendStyles } from '../../utils/mixins';
import EditorModel from '../model/Editor';

const $ = Backbone.$;

export default class EditorView extends View<EditorModel> {
  constructor(model: EditorModel) {
    super({ model });
    //const { model } = this;
    const { Panels, UndoManager } = model.attributes;
    model.view = this;
    model.once('change:ready', () => {
      Panels.active();
      Panels.disableButtons();
      UndoManager.clear();
      setTimeout(() => {
        model.trigger('load', model.get('Editor'));
        model.clearDirtyCount();
      });
    });
  }

  render() {
    const { $el, model } = this;
    const { Panels, Canvas } = model.attributes;
    const { config, modules } = model;
    const pfx = config.stylePrefix;
    const classNames = [`${pfx}editor`];
    !config.customUI && classNames.push(`${pfx}one-bg ${pfx}two-color`);

    // @ts-ignore
    const contEl = $(config.el || `body ${config.container}`);
    config.cssIcons && appendStyles(config.cssIcons, { unique: true, prepand: true });
    $el.empty();

    // @ts-ignore
    if (config.width) contEl.css('width', config.width);
    // @ts-ignore
    if (config.height) contEl.css('height', config.height);

    $el.append(Canvas.render());
    $el.append(Panels.render());

    // Load shallow editor
    const shallow = model.get('shallow');
    const shallowCanvasEl = shallow.get('Canvas').render();
    shallowCanvasEl.style.display = 'none';
    $el.append(shallowCanvasEl);

    $el.attr('class', classNames.join(' '));
    // @ts-ignore
    contEl.addClass(`${pfx}editor-cont`).empty().append($el);
    modules.forEach(md => md.postRender && md.postRender(this));

    return this;
  }
}
