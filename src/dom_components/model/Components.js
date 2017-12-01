import { isEmpty } from 'underscore';

const Backbone = require('backbone');

module.exports = Backbone.Collection.extend({

  initialize(models, opt) {

    this.on('add', this.onAdd);

    this.config = opt && opt.config ? opt.config : null;

    // Inject editor
    if(opt && (opt.sm || opt.em))
      this.editor = opt.sm || opt.em;

    this.model  = (attrs, options) => {
      var model;

      if(!options.sm && opt && opt.sm)
        options.sm = opt.sm;

      if(!options.em && opt && opt.em)
        options.em = opt.em;

      if(opt && opt.config)
        options.config = opt.config;

      if(opt && opt.componentTypes)
          options.componentTypes = opt.componentTypes;

      var df = opt.componentTypes;

      for (var it = 0; it < df.length; it++) {
        var dfId = df[it].id;
        if(dfId == attrs.type) {
          model = df[it].model;
          break;
        }
      }

      if(!model) {
        // get the last one
        model = df[df.length - 1].model;
      }

      return new model(attrs, options);
    };

  },

  add(models, opt = {}) {
    if (typeof models === 'string') {
      var parsed = this.editor.get('Parser').parseHtml(models);
      models = parsed.html;

      var cssc = this.editor.get('CssComposer');

      if (parsed.css && cssc) {
        var {avoidUpdateStyle} = opt;
        var added = cssc.addCollection(parsed.css, {
          extend: 1,
          avoidUpdateStyle
        });
      }
    }

    return Backbone.Collection.prototype.add.apply(this, [models, opt]);
  },

  onAdd(model, c, opts) {
    const em = this.editor;
    const style = model.get('style');
    const avoidInline = em && em.getConfig('avoidInlineStyle');

    if (!isEmpty(style) && !avoidInline &&
      em && em.get && em.get('Config').forceClass) {
        var cssC = this.editor.get('CssComposer');
        var newClass = this.editor.get('SelectorManager').add(model.cid);
        model.set({style:{}});
        model.get('classes').add(newClass);
        var rule = cssC.add(newClass);
        rule.set('style', style);
    }
  },

});
