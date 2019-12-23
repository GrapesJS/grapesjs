import ClassTagsView from 'selector_manager/view/ClassTagsView';
import Selectors from 'selector_manager/model/Selectors';
import Component from 'dom_components/model/Component';
import Editor from 'editor/model/Editor';

describe('ClassTagsView', () => {
  let testContext;

  beforeEach(() => {
    testContext = {};
  });

  var view;
  var fixture;
  var fixtures;
  var testLabel;
  var coll;
  var target;
  var em;
  let compTest;

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
