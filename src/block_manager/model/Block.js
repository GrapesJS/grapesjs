var Categorizable = require('domain_abstract/model/Categorizable');

module.exports = Categorizable.extend({

  defaults: { ...Categorizable.prototype.defaults, 
    categoryOpen: true,
    categoryType: 'block'
  },

  initialize(opts = {}) {
    Categorizable.prototype.initialize.apply(this, arguments);
  },

});
