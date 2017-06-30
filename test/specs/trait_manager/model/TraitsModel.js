const Trait = require('trait_manager/model/Trait');
const Component = require('dom_components/model/Component');

module.exports = {
  run() {

    describe('TraitModels', () => {

      var obj;
      var target;
      var modelName = 'title';

      beforeEach(() => {
        target = new Component();
        obj = new Trait({
          name: modelName,
          target,
        });
      });

      afterEach(() => {
        obj = null;
      });

      it('Object exists', () => {
        expect(Trait).toExist();
      });

    });
  }
}
