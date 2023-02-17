import Trait from '../../../../src/trait_manager/model/Trait';
import Component from '../../../../src/dom_components/model/Component';

describe('TraitModels', () => {
  var trait: Trait;
  var target: Component;
  var modelName = 'title';

  beforeEach(() => {
    target = new Component();
    trait = new Trait({
      name: modelName,
      target,
    });
  });

  afterEach(() => {});

  test('Object exists', () => {
    expect(trait).toBeTruthy();
  });
});
