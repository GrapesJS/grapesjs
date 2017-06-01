var Backbone = require('backbone');
var CssRule = require('./CssRule');

module.exports = Backbone.Collection.extend({

  initialize(models, opt) {

    // Inject editor
    if(opt && opt.sm)
      this.editor = opt.sm;

    this.model  = (attrs, options) => {
      var model;

      if(!options.sm && opt && opt.sm)
        options.sm = opt.sm;

      switch(1){
        default:
          model = new CssRule(attrs, options);
      }

      return  model;
    };

  },

  add(models, opt) {
    if(typeof models === 'string')
      models = this.editor.get('Parser').parseCss(models);
    return Backbone.Collection.prototype.add.apply(this, [models, opt]);
  },

});
