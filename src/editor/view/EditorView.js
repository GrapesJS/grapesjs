const $ = Backbone.$;

module.exports = Backbone.View.extend({
  initialize() {
    const model = this.model;
    model.view = this;
    this.conf = model.config;
    this.pn = model.get('Panels');
    model.on('loaded', () => {
      this.pn.active();
      this.pn.disableButtons();
      model.runDefault();
      setTimeout(() => model.trigger('load'), 0);
    });
  },

  render() {
    const model = this.model;
    const el = this.$el;
    const conf = this.conf;
    const contEl = $(conf.el || `body ${conf.container}`);
    const pfx = conf.stylePrefix;
    el.empty();

    if (conf.width) contEl.css('width', conf.width);

    if (conf.height) contEl.css('height', conf.height);

    el.append(model.get('Canvas').render());
    el.append(this.pn.render());
    el.attr('class', `${pfx}editor ${pfx}one-bg ${pfx}two-color`);
    contEl
      .addClass(`${pfx}editor-cont`)
      .empty()
      .append(el);

    return this;
  }
});
