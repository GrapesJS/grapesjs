import Trait from 'trait_manager/model/Trait';
import TraitView from 'trait_manager/view/TraitView';
import Component from 'dom_components/model/Component';

describe('TraitView', () => {
  var obj;
  var model;
  var modelName = 'title';
  var target;

  beforeEach(() => {
    target = new Component();
    model = new Trait({
      name: modelName,
      target,
    });
    obj = new TraitView({
      model,
    });
  });

  afterEach(() => {
    obj = null;
    model = null;
    target = null;
  });

  test('Object exists', () => {
    expect(Trait).toBeTruthy();
  });

  test('Target has no attributes on init', () => {
    expect(target.get('attributes')).toEqual({});
  });

  test('On update of the value updates the target attributes', () => {
    model.set('value', 'test');
    var eq = {};
    eq[modelName] = 'test';
    expect(target.get('attributes')).toEqual(eq);
  });

  test('Updates on different models do not alter other targets', () => {
    var target1 = new Component();
    var target2 = new Component();
    var model1 = new Trait({
      name: modelName,
      target: target1,
    });
    var model2 = new Trait({
      name: modelName,
      target: target2,
    });
    var obj1 = new TraitView({ model: model1 });
    var obj2 = new TraitView({ model: model2 });

    model1.set('value', 'test1');
    model2.set('value', 'test2');
    var eq1 = {};
    eq1[modelName] = 'test1';
    var eq2 = {};
    eq2[modelName] = 'test2';
    expect(target1.get('attributes')).toEqual(eq1);
    expect(target2.get('attributes')).toEqual(eq2);
  });
});
