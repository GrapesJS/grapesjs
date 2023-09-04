import ClassTagsView from '../../../../src/selector_manager/view/ClassTagsView';
import Selectors from '../../../../src/selector_manager/model/Selectors';
import Component from '../../../../src/dom_components/model/Component';
import Rule from '../../../../src/css_composer/model/CssRule';
import Editor from '../../../../src/editor/model/Editor';
import { Selector } from '../../../../src';
import { createEl } from '../../../../src/utils/dom';

describe('ClassTagsView', () => {
  let testContext: any;
  let view: ClassTagsView;
  let fixture: HTMLElement;
  let fixtures: HTMLElement;
  let coll: Selectors;
  let target: Editor;
  let em: Editor;
  let compTest: Component;
  const getSelectorNames = (arr: Selector[] | Selectors) => arr.map(item => item.getFullName());
  const newComponent = (obj: any) => new Component(obj, { em });
  const newRule = (obj: any) => new Rule(obj, { em });

  beforeAll(() => {
    document.body.innerHTML = '<div id="fixtures"></div>';
    fixtures = document.body.querySelector('#fixtures')!;
    testContext = {};
  });

  afterAll(() => {
    fixture.remove();
  });

  beforeEach(() => {
    target = new Editor();
    em = target;
    coll = new Selectors();
    view = new ClassTagsView({
      config: { em },
      collection: coll,
      module: em.Selectors,
    });

    testContext.targetStub = {
      add(v: any) {
        return { name: v };
      },
    };

    compTest = new Component();
    testContext.compTargetStub = compTest;

    fixtures.innerHTML = '';
    fixture = createEl('div', { class: 'classtag-fixture' });
    fixtures.appendChild(fixture);
    // fixture.empty().appendTo(fixtures);
    fixture.appendChild(view.render().el);
    testContext.btnAdd = view.$addBtn;
    testContext.input = view.$el.find('[data-input]');
    testContext.$tags = view.$el.find('[data-selectors]');
    testContext.$statesC = view.$el.find('[data-states-c]');
  });

  afterEach(() => {
    target.destroy();
    fixture.remove();
  });

  test('Object exists', () => {
    expect(ClassTagsView).toBeTruthy();
  });

  test('Not tags inside', () => {
    expect(testContext.$tags.html()).toEqual('');
  });

  test('Add new tag triggers correct method', () => {
    const spy = jest.spyOn(view, 'addToClasses');
    coll.add({ name: 'test' });
    expect(spy).toBeCalledTimes(1);
  });

  test('Start new tag creation', () => {
    testContext.btnAdd.trigger('click');
    expect(testContext.btnAdd.css('display')).toEqual('none');
    expect(testContext.input.css('display')).not.toEqual('none');
  });

  test('Stop tag creation', () => {
    testContext.btnAdd.trigger('click');
    testContext.input.val('test');
    testContext.input.trigger('focusout');
    expect(testContext.btnAdd.css('display')).not.toEqual('none');
    expect(testContext.input.css('display')).toEqual('none');
    expect(testContext.input.val()).toBeFalsy();
  });

  test.skip('Check keyup of ESC on input', function () {
    // this.btnAdd.click();
    // sinon.stub(view, 'addNewTag');
    // this.input.trigger({
    //   type: 'keyup',
    //   keyCode: 13,
    // });
    // expect(view.addNewTag.calledOnce).toEqual(true);
  });

  test.skip('Check keyup on ENTER on input', function () {
    // this.btnAdd.click();
    // sinon.stub(view, 'endNewTag');
    // this.input.trigger({
    //   type: 'keyup',
    //   keyCode: 27,
    // });
    // expect(view.endNewTag.calledOnce).toEqual(true);
  });

  test('Collection changes on update of target', done => {
    coll.add({ name: 'test' });
    target.trigger('component:toggled');
    setTimeout(() => {
      expect(coll.length).toEqual(0);
      done();
    });
  });

  test('Collection reacts on reset', () => {
    coll.add([{ name: 'test1' }, { name: 'test2' }]);
    const spy = jest.spyOn(view, 'addToClasses');
    coll.trigger('reset');
    expect(spy).toBeCalledTimes(2);
  });

  test("Don't accept empty tags", () => {
    view.addNewTag('');
    expect(testContext.$tags.html()).toEqual('');
  });

  test('Accept new tags', done => {
    em.setSelected(compTest);
    view.addNewTag('test');
    view.addNewTag('test2');
    setTimeout(() => {
      expect(testContext.$tags.children().length).toEqual(2);
      done();
    });
  });

  test('New tag correctly added', () => {
    coll.add({ label: 'test' });
    expect(testContext.$tags.children().first().find('[data-tag-name]').text()).toEqual('test');
  });

  test('States are hidden in case no tags', () => {
    view.updateStateVis();
    expect(testContext.$statesC.css('display')).toEqual('none');
  });

  test('States are visible in case of more tags inside', () => {
    coll.add({ label: 'test' });
    view.updateStateVis();
    expect(testContext.$statesC.css('display')).toEqual('');
  });

  test('Update state visibility on new tag', done => {
    const spy = jest.spyOn(view, 'updateStateVis');
    em.setSelected(compTest);
    view.addNewTag('test');
    setTimeout(() => {
      expect(spy).toBeCalledTimes(1);
      done();
    });
  });

  test('Update state visibility on removing of the tag', done => {
    em.setSelected(compTest);
    view.addNewTag('test');
    const spy = jest.spyOn(view, 'updateStateVis');
    coll.remove(coll.at(0));
    setTimeout(() => {
      expect(spy).toBeCalledTimes(1);
      done();
    });
  });

  test('Output correctly state options', done => {
    target.get('SelectorManager').setStates([{ name: 'testName', label: 'testLabel' }]);
    setTimeout(() => {
      const res = '<option value="">- State -</option><option value="testName">testLabel</option>';
      expect(view.getStates()[0].innerHTML).toEqual(res);
      done();
    });
  });

  describe('_commonSelectors', () => {
    test('Returns empty array with no arguments', () => {
      expect(view._commonSelectors()).toEqual([]);
    });

    test('Returns the first item if only one argument is passed', () => {
      const item = [1, 2];
      expect(view._commonSelectors(item)).toEqual(item);
    });

    test('Returns corret output with 2 arrays', () => {
      const item1 = [1, 2, 3, 4];
      const item2 = [3, 4, 5, 6];
      expect(view._commonSelectors(item1, item2)).toEqual([3, 4]);
    });

    test('Returns corret output with more arrays', () => {
      const item1 = [1, 2, 3, 4, 5];
      const item2 = [3, 4, 5, 6];
      const item3 = [30, 5, 6];
      expect(view._commonSelectors(item1, item2, item3)).toEqual([5]);
    });
  });

  describe('getCommonSelectors', () => {
    test('Returns empty array with no targets', () => {
      expect(view.getCommonSelectors({ targets: [] })).toEqual([]);
    });

    test('Returns the selectors of a single component', () => {
      const cmp = newComponent({ classes: 'test1 test2 test3' });
      const selectors = cmp.getSelectors();
      const result = view.getCommonSelectors({ targets: [cmp] });
      expect(getSelectorNames(result)).toEqual(getSelectorNames(selectors));
    });

    test('Returns common selectors of two components', () => {
      const cmp1 = newComponent({ classes: 'test1 test2 test3' });
      const cmp2 = newComponent({ classes: 'test1 test2' });
      const result = view.getCommonSelectors({ targets: [cmp1, cmp2] });
      expect(getSelectorNames(result)).toEqual(['.test1', '.test2']);
    });

    test('Returns common selectors of more components', () => {
      const cmp1 = newComponent({ classes: 'test1 test2 test3' });
      const cmp2 = newComponent({ classes: 'test1 test2' });
      const cmp3 = newComponent({ classes: 'test2 test3' });
      const result = view.getCommonSelectors({ targets: [cmp1, cmp2, cmp3] });
      expect(getSelectorNames(result)).toEqual(['.test2']);
    });

    test('Returns empty array with components without common selectors', () => {
      const cmp1 = newComponent({ classes: 'test1 test2 test3' });
      const cmp2 = newComponent({ classes: 'test1 test2' });
      const cmp3 = newComponent({ classes: 'test4' });
      const result = view.getCommonSelectors({ targets: [cmp1, cmp2, cmp3] });
      expect(getSelectorNames(result)).toEqual([]);
    });
  });

  describe('updateSelection', () => {
    test('Returns empty array without targets', () => {
      expect(view.updateSelection([])).toEqual([]);
    });

    test('Returns empty array with invalid selectors', () => {
      expect(view.updateSelection('body .test' as any)).toEqual([]);
    });

    test('Returns array with common selectors from Components', () => {
      const cmp1 = newComponent({ classes: 'test1 test2 test3' });
      const cmp2 = newComponent({ classes: 'test1 test2' });
      const cmp3 = newComponent({ classes: 'test2 test3' });
      const result = view.updateSelection([cmp1, cmp2, cmp3]);
      expect(getSelectorNames(result)).toEqual(['.test2']);
    });

    test('Returns array with common selectors from CssRule', () => {
      const rule1 = newRule({ selectors: 'test1 test2 test3'.split(' ') });
      const rule2 = newRule({ selectors: 'test1 test2'.split(' ') });
      const rule3 = newRule({ selectors: 'test2 test3'.split(' ') });
      const result = view.updateSelection([rule1, rule2, rule3] as any);
      expect(getSelectorNames(result)).toEqual(['.test2']);
    });

    test('Returns array with common selectors from CssRule and Components', () => {
      const rule1 = newRule({ selectors: 'test1 test2 test3'.split(' ') });
      const rule2 = newRule({ selectors: 'test1 test2'.split(' ') });
      const cmp1 = newComponent({ classes: 'test2 test3' });
      const result = view.updateSelection([rule1, rule2, cmp1] as any);
      expect(getSelectorNames(result)).toEqual(['.test2']);
    });
  });

  describe('Should be rendered correctly', () => {
    test('Has label', () => {
      expect(view.$el.find('#label')[0]).toBeTruthy();
    });
    test('Has tags container', () => {
      expect(view.$el.find('#tags-c')[0]).toBeTruthy();
    });
    test('Has add button', () => {
      expect(view.$el.find('#add-tag')[0]).toBeTruthy();
    });
    test('Has states input', () => {
      expect(view.$el.find('#states')[0]).toBeTruthy();
    });
  });
});
