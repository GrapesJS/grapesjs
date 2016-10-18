var modulePath = './../../../test/specs/utils';

define([
        'Utils',
        modulePath + '/Sorter'
         ],
  function(
          Utils,
          Sorter
          ) {

    describe('Utils', function() {

      Sorter.run();

    });
});