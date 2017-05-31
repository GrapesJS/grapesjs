define(function(require, exports, module){
  'use strict';
  var Backbone = require('backbone');
  var ToolbarButton = require('./ToolbarButton');

    module.exports = Backbone.Collection.extend({model: ToolbarButton});

});