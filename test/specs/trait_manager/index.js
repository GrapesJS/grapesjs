const TraitManager = require('trait_manager');
const TraitsModel = require('./model/TraitsModel');
const TraitsView = require('./view/TraitsView');

describe('TraitManager', () => {
  describe('Main', () => {
    var obj;

    beforeEach(() => {
      obj = new TraitManager().init();
    });

    afterEach(() => {
      obj = null;
    });
  });

  TraitsModel.run();
  TraitsView.run();
});
