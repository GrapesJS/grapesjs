import Trait from '../../../../src/trait_manager/model/Trait';
import TraitView from '../../../../src/trait_manager/view/TraitView';
import Component from '../../../../src/dom_components/model/Component';
import EditorModel from '../../../../src/editor/model/Editor';
import Editor from '../../../../src/editor';

describe('TraitView', () => {
  var obj: TraitView;
  var trait: Trait;
  var modelName = 'title';
  var target: Component;
  var em: EditorModel;

  beforeEach(() => {
    em = new Editor().getModel();
    target = new Component();
    trait = new Trait(
      {
        name: modelName,
        target,
      },
      em
    );
    obj = new TraitView({
      model: trait,
    });
  });

  afterEach(() => {});

  test('Target has no attributes on init', () => {
    expect(target.get('attributes')).toEqual({});
  });

  test('On update of the value updates the target attributes', () => {
    trait.set('value', 'test');
    var eq = { [modelName]: 'test' };
    expect(target.get('attributes')).toEqual(eq);
  });

  test('Updates on different models do not alter other targets', () => {
    var target1 = new Component();
    var target2 = new Component();
    var trait1 = new Trait(
      {
        name: modelName,
        target: target1,
      },
      em
    );
    var trait2 = new Trait(
      {
        name: modelName,
        target: target2,
      },
      em
    );
    var obj1 = new TraitView({ model: trait1 });
    var obj2 = new TraitView({ model: trait2 });

    trait1.set('value', 'test1');
    trait2.set('value', 'test2');
    var eq1 = { [modelName]: 'test1' };
    var eq2 = { [modelName]: 'test2' };
    expect(target1.get('attributes')).toEqual(eq1);
    expect(target2.get('attributes')).toEqual(eq2);
  });
});
