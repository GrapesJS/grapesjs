import EditorModel from '../../../../src/editor/model/Editor';
import ClassTagView from '../../../../src/selector_manager/view/ClassTagView';
import Selectors from '../../../../src/selector_manager/model/Selectors';

describe('ClassTagView', () => {
  let obj: ClassTagView;
  let fixtures: HTMLElement;
  let coll: Selectors;
  let em: EditorModel;
  const testLabel = 'TestLabel';

  beforeEach(() => {
    coll = new Selectors();
    em = new EditorModel();
    const model = coll.add({
      name: 'test',
      label: testLabel,
    });
    obj = new ClassTagView({
      config: { em },
      model,
      coll,
    });
    document.body.innerHTML = '<div id="fixtures"></div>';
    fixtures = document.body.querySelector('#fixtures')!;
    fixtures.appendChild(obj.render().el);
  });

  test('Object exists', () => {
    expect(ClassTagView).toBeTruthy();
  });

  test('Not empty', () => {
    const $el = obj.$el;
    expect($el.html()).toBeTruthy();
  });

  test('Not empty', () => {
    const $el = obj.$el;
    expect($el.html()).toContain(testLabel);
  });

  describe('Should be rendered correctly', () => {
    test('Has close button', () => {
      const $el = obj.$el;
      expect($el.find('#close')[0]).toBeTruthy();
    });
    test('Has checkbox', () => {
      const $el = obj.$el;
      expect($el.find('#checkbox')[0]).toBeTruthy();
    });
    test('Has label', () => {
      const $el = obj.$el;
      expect($el.find('#tag-label')[0]).toBeTruthy();
    });
  });
  // To refactor.. the remove method relies on selected component...
  test.skip('Could be removed', () => {
    obj.$el.find('#close').trigger('click');
    expect(fixtures.innerHTML).toBeFalsy();
  });

  test('Checkbox toggles status', () => {
    const spy = jest.fn();
    obj.model.on('change:active', spy);
    obj.model.set('active', true);
    obj.$el.find('#checkbox').trigger('click');
    expect(obj.model.get('active')).toEqual(false);
    // expect(spy.called).toEqual(true);
    expect(spy).toBeCalledTimes(1);
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
