var Backbone = require('backbone');
var ButtonsView = require('./ButtonsView');

module.exports = Backbone.View.extend({

  initialize(o) {
    const config = o.config || {};
    this.config = config;
    this.pfx = config.stylePrefix || '';
    this.ppfx = config.pStylePrefix || '';
    this.buttons = this.model.get('buttons');
    this.className = this.pfx + 'panel';
    this.id = this.pfx + this.model.get('id');
    this.listenTo(this.model, 'change:appendContent', this.appendContent);
    this.listenTo(this.model, 'change:content', this.updateContent);
  },

  /**
   * Append content of the panel
   * */
  appendContent() {
    this.$el.append(this.model.get('appendContent'));
  },

  /**
   * Update content
   * */
  updateContent() {
    this.$el.html(this.model.get('content'));
  },

  initResize() {
    const em = this.config.em;
    const editor = em ? em.get('Editor') : '';
    const resizable = this.model.get('resizable');

    if (editor && resizable) {
      var resz = resizable === true ? [1, 1, 1, 1] : resizable;
      var resLen = resz.length;
      var tc, cr, bc, cl = 0;

      // Choose which sides of the panel are resizable
      if (resLen == 2) {
        tc = resz[0];
        bc = resz[0];
        cr = resz[1];
        cl = resz[1];
      } else if (resLen == 4) {
        tc = resz[0];
        cr = resz[1];
        bc = resz[2];
        cl = resz[3];
      }

      var resizer = editor.Utils.Resizer.init({
        tc,
        cr,
        bc,
        cl,
        tl: 0,
        tr: 0,
        bl: 0,
        br: 0,
        appendTo: this.el,
        prefix: editor.getConfig().stylePrefix,
        posFetcher: (el) => {
          var rect = el.getBoundingClientRect();
          return {
            left: 0, top: 0,
            width: rect.width,
            height: rect.height
          };
        }
      });
      resizer.blur = () => {};
      resizer.focus(this.el);
    }
  },

  render() {
    const el = this.$el;
    const pfx = this.ppfx;
    el.attr('class', `${this.className} ${pfx}one-bg`);
    this.id && el.attr('id', this.id);

    if (this.buttons.length) {
      var buttons  = new ButtonsView({
        collection: this.buttons,
        config: this.config,
      });
      el.append(buttons.render().el);
    }

    el.append(this.model.get('content'));
    return this;
  },

});
