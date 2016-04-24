var modulePath = './../../../test/specs/commands';

define([
        'Commands'],
  function(
          Commands
          ) {

    describe('Commands', function() {

      describe('Main', function() {

        var obj;

        beforeEach(function () {
          obj = new Commands();
        });

        afterEach(function () {
          delete obj;
        });

        it('Object exists', function() {
          obj.should.be.exist;
        });

      });

    });
});