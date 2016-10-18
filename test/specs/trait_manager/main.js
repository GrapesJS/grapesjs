var modulePath = './../../../test/specs/trait_manager';

define([ 'TraitManager',
        modulePath + '/model/TraitsModel',
        modulePath + '/view/TraitsView',
         ],
  function(TraitManager, TraitsModel, TraitsView) {

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
