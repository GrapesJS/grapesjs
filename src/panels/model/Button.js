var Backbone = require('backbone');

module.exports = Backbone.Model.extend({

  defaults :{
    id: '',
    className: '',
    command: '',
    context: '',
    buttons: [],
    attributes: {},
    options: {},
    active: false,
    dragDrop: false,
    runDefaultCommand: true,
    stopDefaultCommand: false,
  },

  initialize(options) {
    if(this.get('buttons').length){
      var Buttons  = require('./Buttons');
      this.set('buttons', new Buttons(this.get('buttons')) );
    }
  },

});
