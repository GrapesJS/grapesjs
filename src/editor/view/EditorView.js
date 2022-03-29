import Backbone from 'backbone';
import { View } from 'common';
import { appendStyles } from 'utils/mixins';

const $ = Backbone.$;

export default class EditorView extends View {
  initialize() {
    const { model } = this;
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
    const { Panels, Canvas, modules } = model.attributes;
    const conf = model.getConfig();
    const pfx = conf.stylePrefix;
    const contEl = $(conf.el || `body ${conf.container}`);
    appendStyles(conf.cssIcons, { unique: 1, prepand: 1 });
    $el.empty();

    if (conf.width) contEl.css('width', conf.width);
    if (conf.height) contEl.css('height', conf.height);

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
