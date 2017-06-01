var Backbone = require('backbone');
var Trait = require('./Trait');
var TraitFactory = require('./TraitFactory');

module.exports = Backbone.Collection.extend({

  model: Trait,

  setTarget(target) {
    this.target = target;
  },

  add(models, opt) {
    // Use TraitFactory if necessary
    if(typeof models === 'string' || models instanceof Array) {
      if(typeof models === 'string')
        models = [models];
      for(var i = 0, len = models.length; i < len; i++) {
        var str = models[i];
        var model = typeof str === 'string' ? TraitFactory.build(str)[0] : str;
        model.target = this.target;
        models[i] = model;
      }
    }
    return Backbone.Collection.prototype.add.apply(this, [models, opt]);
  },

});
