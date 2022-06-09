import Backbone from 'backbone';
import { View } from '../../common';
import { appendStyles } from '../../utils/mixins';
import EditorModel from '../model/Editor';

const $ = Backbone.$;

export default class EditorView extends View<EditorModel> {
  constructor(model: EditorModel) {
    super({model})
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
    const contEl = $(config.el || `body ${config.container}`);
    appendStyles(config.cssIcons, { unique: true, prepand: true });
    $el.empty();

    if (config.width) contEl.css('width', config.width);
    if (config.height) contEl.css('height', config.height);

    $el.append(Canvas.render());
    $el.append(Panels.render());

    // Load shallow editor
    const shallow = model.get('shallow');
    const shallowCanvasEl = shallow.get('Canvas').render();
    shallowCanvasEl.style.display = 'none';
    $el.append(shallowCanvasEl);

    $el.attr('class', `${pfx}editor ${pfx}one-bg ${pfx}two-color`);
    contEl.addClass(`${pfx}editor-cont`).empty().append($el);
    modules.forEach(md => md.postRender && md.postRender(this));

    return this;
  }
}
