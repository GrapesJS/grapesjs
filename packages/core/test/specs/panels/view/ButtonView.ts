import ButtonView from '../../../../src/panels/view/ButtonView';
import Button from '../../../../src/panels/model/Button';
import EditorModel from '../../../../src/editor/model/Editor';

describe('ButtonView', () => {
  let fixtures: HTMLElement;
  let em: EditorModel;
  let model: Button;
  let view: ButtonView;
  let btnClass = 'pn-btn';

  beforeEach(() => {
    em = new EditorModel({});
    model = new Button(em.Panels, { command: 'fake-command' });
    view = new ButtonView({
      model: model,
    });
    document.body.innerHTML = '<div id="fixtures"></div>';
    fixtures = document.body.querySelector('#fixtures')!;
    fixtures.appendChild(view.render().el);
  });

  afterEach(() => {
    view.remove();
  });

  test('Button empty', () => {
    expect(fixtures.innerHTML).toEqual('<span class="' + btnClass + '"></span>');
  });

  test('Update class', () => {
    model.set('className', 'test');
    expect(view.el.getAttribute('class')).toEqual(btnClass + ' test');
  });

  test('Update attributes', () => {
    model.set('attributes', {
      'data-test': 'test-value',
    });
    expect(view.el.getAttribute('data-test')).toEqual('test-value');
  });

  test('Check enable active', () => {
    model.set('active', true, { silent: true });
    view.checkActive();
    expect(view.el.getAttribute('class')).toContain(btnClass + ' pn-active');
  });

  test('Check disable active', () => {
    model.set('active', true, { silent: true });
    view.checkActive();
    model.set('active', false, { silent: true });
    view.checkActive();
    expect(view.el.getAttribute('class')).toEqual(btnClass);
  });

  test('Disable the button', () => {
    model.set('disable', true, { silent: true });
    view.updateDisable();
    expect(view.el.getAttribute('class')).toEqual(btnClass + ' disabled');
  });

  test('Enable the disabled button', () => {
    model.set('disable', true, { silent: true });
    view.updateDisable();
    model.set('disable', false, { silent: true });
    view.updateDisable();
    expect(view.el.getAttribute('class')).toEqual(btnClass);
  });

  test('Cancels the click action when button is disabled', () => {
    const spy = jest.spyOn(view, 'toggleActive' as any);
    model.set('disable', true, { silent: true });
    view.clicked();
    expect(spy).toBeCalledTimes(0);
  });

  test('Enable the click action when button is enable', () => {
    const spy = jest.spyOn(view, 'toggleActive' as any);
    model.set('disable', false, { silent: true });
    view.clicked();
    expect(spy).toBeCalledTimes(1);
  });

  test('Renders correctly', () => {
    expect(view.render()).toBeTruthy();
  });
});
