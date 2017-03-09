define([ 'backbone', 'require'],
  function (Backbone, require) {

    return Backbone.Collection.extend({

      initialize: function(models, opt){

        this.on('add', this.onAdd);

        this.config = opt && opt.config ? opt.config : null;

        // Inject editor
        if(opt && opt.sm)
          this.editor = opt.sm;

        this.model  = function(attrs, options) {
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

      add: function(models, opt){
        if(typeof models === 'string'){
          var parsed = this.editor.get('Parser').parseHtml(models);
          models = parsed.html;

          var cssc = this.editor.get('CssComposer');
          if(parsed.css && cssc){
            var added = cssc.addCollection(parsed.css, {extend: 1});
          }
        }

        return Backbone.Collection.prototype.add.apply(this, [models, opt]);
      },

      onAdd: function(model, c, opts){
        var style = model.get('style');

        if(!_.isEmpty(style) && this.editor){
          var cssC = this.editor.get('CssComposer');
          var newClass = this.editor.get('SelectorManager').add(model.cid);
          model.set({style:{}});
          model.get('classes').add(newClass);
          var rule = cssC.add(newClass);
          rule.set('style', style);
        }
      },

    });
});
