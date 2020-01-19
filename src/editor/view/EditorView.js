import Backbone from 'backbone';
import { appendStyles } from 'utils/mixins';

const $ = Backbone.$;

export default Backbone.View.extend({
  initialize() {
    const { model } = this;
    model.view = this;
    this.conf = model.config;
    this.pn = model.get('Panels');
    model.on('loaded', () => {
      this.pn.active();
      this.pn.disableButtons();
      model.runDefault();
      setTimeout(() => model.trigger('load', model.get('Editor')));
    });
  },

  render() {
    const { model, $el, conf } = this;
    const pfx = conf.stylePrefix;
    const contEl = $(conf.el || `body ${conf.container}`);
    appendStyles(conf.cssIcons, { unique: 1, prepand: 1 });
    $el.empty();

    if (conf.width) contEl.css('width', conf.width);
    if (conf.height) contEl.css('height', conf.height);

    $el.append(model.get('Canvas').render());
    $el.append(this.pn.render());
    $el.attr('class', `${pfx}editor ${pfx}one-bg ${pfx}two-color`);
    contEl
      .addClass(`${pfx}editor-cont`)
      .empty()
      .append($el);

    return this;
  }
});
