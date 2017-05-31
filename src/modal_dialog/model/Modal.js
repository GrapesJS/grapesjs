define(function(require, exports, module){
  'use strict';
  var Backbone = require('backbone');
    module.exports = Backbone.Model.extend({
      defaults: {
        title: '',
        content: '',
        open: false,
      }
    });
});