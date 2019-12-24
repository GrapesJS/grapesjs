import ClassTagsView from 'selector_manager/view/ClassTagsView';
import Selectors from 'selector_manager/model/Selectors';
import Component from 'dom_components/model/Component';
import Rule from 'css_composer/model/CssRule';
import Editor from 'editor/model/Editor';

describe('ClassTagsView', () => {
  let testContext;

  beforeEach(() => {
    testContext = {};
  });

  let view;
  let fixture;
  let fixtures;
  let coll;
  let target;
  let em;
  let compTest;
  const getSelectorNames = arr => arr.map(item => item.getFullName());
  const newComponent = obj => new Component(obj, { em });
  const newRule = obj => new Rule(obj, { em });

  beforeAll(() => {
    document.body.innerHTML = '<div id="fixtures"></div>';
    fixtures = document.body.querySelector('#fixtures');
    fixture = $('<div class="classtag-fixture"></div>');
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
      collection: coll
    });

    testContext.targetStub = {
      add(v) {
        return { name: v };
      }
    };

    compTest = new Component();
    testContext.compTargetStub = compTest;

    fixtures.innerHTML = '';
    fixture.empty().appendTo(fixtures);
    fixture.append(view.render().el);
    testContext.btnAdd = view.$addBtn;
    testContext.input = view.$el.find('[data-input]');
    testContext.$tags = fixture.find('[data-selectors]');
    testContext.$statesC = fixture.find('[data-states-c]');
  });

  afterEach(() => {
    delete view.collection;
  });

  test('Object exists', () => {
    expect(ClassTagsView).toBeTruthy();
  });

  test('Not tags inside', () => {
    expect(testContext.$tags.html()).toEqual('');
  });

  test('Add new tag triggers correct method', () => {
    sinon.stub(view, 'addToClasses');
    coll.add({ name: 'test' });
    expect(view.addToClasses.calledOnce).toEqual(true);
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
    expect(testContext.input.val()).toEqual(null);
  });

  test.skip('Check keyup of ESC on input', function() {
    this.btnAdd.click();
    sinon.stub(view, 'addNewTag');
    this.input.trigger({
      type: 'keyup',
      keyCode: 13
    });
    expect(view.addNewTag.calledOnce).toEqual(true);
  });

  test.skip('Check keyup on ENTER on input', function() {
    this.btnAdd.click();
    sinon.stub(view, 'endNewTag');
    this.input.trigger({
      type: 'keyup',
      keyCode: 27
    });
    expect(view.endNewTag.calledOnce).toEqual(true);
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
    sinon.stub(view, 'addToClasses');
    coll.trigger('reset');
    expect(view.addToClasses.calledTwice).toEqual(true);
  });

  test("Don't accept empty tags", () => {
    view.addNewTag('');
    expect(testContext.$tags.html()).toEqual('');
  });

  test('Accept new tags', () => {
    em.setSelected(compTest);
    view.addNewTag('test');
    view.addNewTag('test2');
    expect(testContext.$tags.children().length).toEqual(2);
  });

  test('New tag correctly added', () => {
    coll.add({ label: 'test' });
    expect(
      testContext.$tags
        .children()
        .first()
        .find('[data-tag-name]')
        .text()
    ).toEqual('test');
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

  test('Update state visibility on new tag', () => {
    sinon.stub(view, 'updateStateVis');
    em.setSelected(compTest);
    view.addNewTag('test');
    expect(view.updateStateVis.called).toEqual(true);
  });

  test('Update state visibility on removing of the tag', () => {
    em.setSelected(compTest);
    view.addNewTag('test');
    sinon.stub(view, 'updateStateVis');
    coll.remove(coll.at(0));
    expect(view.updateStateVis.calledOnce).toEqual(true);
  });

  test('Output correctly state options', () => {
    var view = new ClassTagsView({
      config: {
        em: target,
        states: [{ name: 'testName', label: 'testLabel' }]
      },
      collection: coll
    });
    expect(view.getStateOptions()).toEqual(
      '<option value="testName">testLabel</option>'
    );
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
      expect(view.updateSelection('body .test')).toEqual([]);
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
      const result = view.updateSelection([rule1, rule2, rule3]);
      expect(getSelectorNames(result)).toEqual(['.test2']);
    });

    test('Returns array with common selectors from CssRule and Components', () => {
      const rule1 = newRule({ selectors: 'test1 test2 test3'.split(' ') });
      const rule2 = newRule({ selectors: 'test1 test2'.split(' ') });
      const cmp1 = newComponent({ classes: 'test2 test3' });
      const result = view.updateSelection([rule1, rule2, cmp1]);
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
