import { isEmpty } from 'underscore';

const Backbone = require('backbone');

module.exports = Backbone.Collection.extend({
  initialize(models, opt = {}) {
    this.listenTo(this, 'add', this.onAdd);
    this.config = opt.config;
    this.em = opt.em;

    this.model = (attrs, options) => {
      var model;
      var df = opt.componentTypes;
      options.em = opt.em;
      options.config = opt.config;
      options.componentTypes = df;

      for (var it = 0; it < df.length; it++) {
        var dfId = df[it].id;
        if (dfId == attrs.type) {
          model = df[it].model;
          break;
        }
      }

      if (!model) {
        // get the last one
        model = df[df.length - 1].model;
      }

      return new model(attrs, options);
    };
  },

  add(models, opt = {}) {
    if (typeof models === 'string') {
      const cssc = this.em.get('CssComposer');
      const parsed = this.em.get('Parser').parseHtml(models);
      models = parsed.html;

      if (parsed.css && cssc) {
        const { avoidUpdateStyle } = opt;
        const added = cssc.addCollection(parsed.css, {
          extend: 1,
          avoidUpdateStyle
        });
      }
    }

    return Backbone.Collection.prototype.add.apply(this, [models, opt]);
  },

  onAdd(model, c, opts) {
    const em = this.em;
    const style = model.getStyle();
    const avoidInline = em && em.getConfig('avoidInlineStyle');

    if (
      !isEmpty(style) &&
      !avoidInline &&
      em &&
      em.get &&
      em.getConfig('forceClass')
    ) {
      const name = model.cid;
      const rule = em.get('CssComposer').setClassRule(name, style);
      model.setStyle({});
      model.addClass(name);
    }
  }
});
