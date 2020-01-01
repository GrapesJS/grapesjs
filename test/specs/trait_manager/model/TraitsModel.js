import Trait from 'trait_manager/model/Trait';
import Component from 'dom_components/model/Component';

describe('TraitModels', () => {
  var obj;
  var target;
  var modelName = 'title';

  beforeEach(() => {
    target = new Component();
    obj = new Trait({
      name: modelName,
      target
    });
  });

  afterEach(() => {
    obj = null;
  });

  test('Object exists', () => {
    expect(Trait).toBeTruthy();
  });
});
