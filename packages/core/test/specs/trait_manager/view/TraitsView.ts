import Trait from '../../../../src/trait_manager/model/Trait';
import TraitView from '../../../../src/trait_manager/view/TraitView';
import Component from '../../../../src/dom_components/model/Component';
import EditorModel from '../../../../src/editor/model/Editor';
import Editor from '../../../../src/editor';
import { ComponentOptions } from '../../../../src/dom_components/model/types';

describe('TraitView', () => {
  let obj: TraitView;
  let trait: Trait;
  let modelName = 'title';
  let target: Component;
  let em: EditorModel;
  let config: ComponentOptions;

  beforeEach(() => {
    em = new Editor().getModel();
    config = { em, config: em.Components.config };
    target = new Component({}, config);
    trait = new Trait(
      {
        name: modelName,
        target,
      },
      em,
    );
    obj = new TraitView({
      model: trait,
      config,
    });
  });

  afterEach(() => {});

  test('Target has no attributes on init', () => {
    expect(target.get('attributes')).toEqual({});
  });

  test('On update of the value updates the target attributes', () => {
    trait.set('value', 'test');
    const eq = { [modelName]: 'test' };
    expect(target.get('attributes')).toEqual(eq);
  });

  test('Updates on different models do not alter other targets', () => {
    const target1 = new Component({}, config);
    const target2 = new Component({}, config);
    const trait1 = new Trait(
      {
        name: modelName,
        target: target1,
      },
      em,
    );
    const trait2 = new Trait(
      {
        name: modelName,
        target: target2,
      },
      em,
    );
    const obj1 = new TraitView({ model: trait1 });
    const obj2 = new TraitView({ model: trait2 });

    trait1.set('value', 'test1');
    trait2.set('value', 'test2');
    const eq1 = { [modelName]: 'test1' };
    const eq2 = { [modelName]: 'test2' };
    expect(target1.get('attributes')).toEqual(eq1);
    expect(target2.get('attributes')).toEqual(eq2);
  });
});
