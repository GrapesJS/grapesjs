var Backbone = require('backbone');

module.exports = Backbone.Model.extend({

  idAttribute: 'name',

  defaults :{
    name: '',
    width: '',
  },

});
