import Trait from '../../../../src/trait_manager/model/Trait';
import Traits from '../../../../src/trait_manager/model/Traits';
import Component from '../../../../src/dom_components/model/Component';
import Editor from '../../../../src/editor';
import EditorModel from '../../../../src/editor/model/Editor';

describe('TraitModels', () => {
  var trait: Trait;
  var target: Component;
  var modelName = 'title';
  var em: EditorModel;

  beforeEach(() => {
    em = new Editor().getModel();
    target = new Component({}, { em });
    trait = new Trait(
      {
        name: modelName,
        target,
      },
      em
    );
  });

  afterEach(() => {});

  test('Object exists', () => {
    expect(trait).toBeTruthy();
  });
  test('Traits undo property', () => {
    em.loadOnStart();
    const wrapper = em.Components.getWrapper();
    wrapper!.append(target);
    const traits = new Traits([], { em });
    traits.add(modelName);
    traits.setTarget(target);
    const trait = traits.models[0];
    trait.setTargetValue('TitleValue');

    expect(target.getAttributes()[modelName]).toBe('TitleValue');
    em.UndoManager.undo();
    expect(target.getAttributes()[modelName]).toBeUndefined;
  });
});
