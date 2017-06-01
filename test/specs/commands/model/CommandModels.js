define(function(require, exports, module){
  'use strict';
  var Commands = require('undefined');

    module.exports = {
      run : function(){
        describe('Command', function() {
          var obj;

          beforeEach(function () {
            obj = new Command();
          });

          afterEach(function () {
            delete obj;
          });

          it('Has id property', function() {
            obj.has('id').should.equal(true);
          });

        });

        describe('Commands', function() {
          var obj;

          beforeEach(function () {
            obj = new Commands();
          });

          afterEach(function () {
            delete obj;
          });

          it('Object is ok', function() {
            obj.should.be.ok;
          });

        });

      }
    };

});