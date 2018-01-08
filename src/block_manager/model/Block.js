var Categorizable = require('domain_abstract/model/Categorizable');

module.exports = Categorizable.extend({

  defaults: { ...Categorizable.prototype.defaults, 
    //categorizableType: 'block'
  },

  initialize(opts = {}) {
    Categorizable.prototype.initialize.apply(this, arguments);
  },

});
