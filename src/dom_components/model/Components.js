var Backbone = require('backbone');

module.exports = Backbone.Collection.extend({

  initialize(models, opt) {

    this.on('add', this.onAdd);

    this.config = opt && opt.config ? opt.config : null;

    // Inject editor
    if(opt && opt.sm)
      this.editor = opt.sm;

    this.model  = (attrs, options) => {
      var model;

      if(!options.sm && opt && opt.sm)
        options.sm = opt.sm;

      if(opt && opt.config)
        options.config = opt.config;

      if(opt && opt.defaultTypes)
          options.defaultTypes = opt.defaultTypes;

      if(opt && opt.componentTypes)
          options.componentTypes = opt.componentTypes;

      var df = opt.defaultTypes;

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
    var style = model.get('style');
    var em = this.editor;

    if(!_.isEmpty(style) && em && em.get('Config').forceClass){
      var cssC = this.editor.get('CssComposer');
      var newClass = this.editor.get('SelectorManager').add(model.cid);
      model.set({style:{}});
      model.get('classes').add(newClass);
      var rule = cssC.add(newClass);
      rule.set('style', style);
    }
  },

});
