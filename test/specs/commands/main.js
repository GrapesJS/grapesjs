define(function(require, exports, module){
  'use strict';
  var Commands = require('Commands');
  var Models = require('undefined');

    describe('Commands', function() {

      describe('Main', function() {

        var obj;

        beforeEach(function () {
          obj = new Commands().init();
        });

        afterEach(function () {
          delete obj;
        });

        it('No commands inside', function() {
          (obj.get('test') == null).should.equal(true);
        });

        it('Push new command', function() {
          var comm = { test: 'test'};
          obj.add('test', comm);
          (obj.get('test').test == 'test').should.equal(true);
        });

        it('No default commands at init', function() {
          (obj.get('select-comp') == null).should.equal(true);
        });

        it('Default commands after loadDefaultCommands', function() {
          obj.loadDefaultCommands();
          (obj.get('select-comp') == null).should.equal(false);
        });

      });

    });

    Models.run();
});