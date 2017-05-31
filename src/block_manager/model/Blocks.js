define(function(require, exports, module){
  'use strict';
  var Backbone = require('backbone');
  var Block = require('./Block');

    module.exports = Backbone.Collection.extend({

      model: Block,

    });
});