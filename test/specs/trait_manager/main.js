define(function(require, exports, module){
  'use strict';
  var TraitManager = require('TraitManager');
  var TraitsView = require('undefined');

    describe('TraitManager', function() {

      describe('Main', function() {

        var obj;

        beforeEach(function () {
          obj = new TraitManager().init();
        });

        afterEach(function () {
          delete obj;
        });

      });

      TraitsModel.run();
      TraitsView.run();
    });
});