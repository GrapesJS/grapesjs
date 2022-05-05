import EditorModel from 'editor/model/Editor';
import ClassTagView from 'selector_manager/view/ClassTagView';
import Selectors from 'selector_manager/model/Selectors';

describe('ClassTagView', () => {
  var obj;
  var fixtures;
  var testLabel;
  var coll;
  var em;

  beforeEach(() => {
    coll = new Selectors();
    testLabel = 'TestLabel';
    em = new EditorModel();
    var model = coll.add({
      name: 'test',
      label: testLabel,
    });
    obj = new ClassTagView({
      config: { em },
      model,
      coll,
    });
    //obj.target = { get() {} };
    //_.extend(obj.target, Backbone.Events);
    document.body.innerHTML = '<div id="fixtures"></div>';
    fixtures = document.body.querySelector('#fixtures');
    fixtures.appendChild(obj.render().el);
  });

  afterEach(() => {
    obj.model = null;
  });

  test('Object exists', () => {
    expect(ClassTagView).toBeTruthy();
  });

  test('Not empty', () => {
    var $el = obj.$el;
    expect($el.html()).toBeTruthy();
  });

  test('Not empty', () => {
    var $el = obj.$el;
    expect($el.html()).toContain(testLabel);
  });

  describe('Should be rendered correctly', () => {
    test('Has close button', () => {
      var $el = obj.$el;
      expect($el.find('#close')[0]).toBeTruthy();
    });
    test('Has checkbox', () => {
      var $el = obj.$el;
      expect($el.find('#checkbox')[0]).toBeTruthy();
    });
    test('Has label', () => {
      var $el = obj.$el;
      expect($el.find('#tag-label')[0]).toBeTruthy();
    });
  });
  // To refactor.. the remove method relies on selected component...
  test.skip('Could be removed', () => {
    obj.$el.find('#close').trigger('click');
    expect(fixtures.innerHTML).toBeFalsy();
  });

  test('Checkbox toggles status', () => {
    var spy = sinon.spy();
    obj.model.on('change:active', spy);
    obj.model.set('active', true);
    obj.$el.find('#checkbox').trigger('click');
    expect(obj.model.get('active')).toEqual(false);
    expect(spy.called).toEqual(true);
  });

  test('Label input is disabled', () => {
    expect(obj.getInputEl().contentEditable).toBeFalsy();
  });

  test('On double click label input is enable', () => {
    obj.$el.find('#tag-label').trigger('dblclick');
    expect(obj.getInputEl().contentEditable).toEqual('true');
  });

  test('On blur label input turns back disabled', () => {
    obj.$el.find('#tag-label').trigger('dblclick');
    obj.endEditTag();
    expect(obj.getInputEl().contentEditable).toEqual('false');
  });
});
