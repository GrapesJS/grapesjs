import { isEmpty, isArray, isString } from 'underscore';

const Backbone = require('backbone');
let Component;

module.exports = Backbone.Collection.extend({
  initialize(models, opt = {}) {
    this.opt = opt;
    this.listenTo(this, 'add', this.onAdd);
    this.config = opt.config;
    this.em = opt.em;
    const { em } = this;

    this.model = (attrs, options) => {
      var model;
      var df = opt.componentTypes;
      options.em = opt.em;
      options.config = opt.config;
      options.componentTypes = df;
      options.domc = opt.domc;

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
        em &&
          attrs.type &&
          em.logWarning(`Component type '${attrs.type}' not found`, {
            attrs,
            options
          });
      }

      return new model(attrs, options);
    };
  },

  parseString(value, opt = {}) {
    const { em } = this;
    const cssc = em.get('CssComposer');
    const parsed = em.get('Parser').parseHtml(value);
    // We need this to avoid duplicate IDs
    if (!Component) Component = require('./Component');
    Component.checkId(parsed.html, parsed.css, this.opt.domc.componentsById);

    if (parsed.css && cssc && !opt.temporary) {
      cssc.addCollection(parsed.css, {
        ...opt,
        extend: 1
      });
    }

    return parsed.html;
  },

  add(models, opt = {}) {
    if (isString(models)) {
      models = this.parseString(models, opt);
    } else if (isArray(models)) {
      models.forEach((item, index) => {
        if (isString(item)) {
          models[index] = this.parseString(item, opt);
        }
      });
    }

    return Backbone.Collection.prototype.add.apply(this, [models, opt]);
  },

  onAdd(model, c, opts = {}) {
    const em = this.em;
    const style = model.getStyle();
    const avoidInline = em && em.getConfig('avoidInlineStyle');

    if (
      !isEmpty(style) &&
      !avoidInline &&
      em &&
      em.get &&
      em.getConfig('forceClass') &&
      !opts.temporary
    ) {
      const name = model.cid;
      const rule = em.get('CssComposer').setClassRule(name, style);
      model.setStyle({});
      model.addClass(name);
    }
  }
});
