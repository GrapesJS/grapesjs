import TraitManager from 'trait_manager';
import TraitsModel from './model/TraitsModel';
import TraitsView from './view/TraitsView';

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
