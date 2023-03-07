import ButtonView from 'panels/view/ButtonView';
import Button from 'panels/model/Button';
import Editor from 'editor';

describe('ButtonView', () => {
  var fixtures;
  var em;
  var model;
  var view;
  var btnClass = 'gjs-pn-btn';

  beforeEach(() => {
    em = new Editor({});
    model = new Button(em.Panels, { command: 'fake-command' });
    view = new ButtonView({
      model: model,
    });
    document.body.innerHTML = '<div id="fixtures"></div>';
    fixtures = document.body.querySelector('#fixtures');
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
    expect(view.el.getAttribute('class')).toContain(btnClass + ' gjs-pn-active');
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
    expect(view.el.getAttribute('class')).toEqual(btnClass + ' gjs-disabled');
  });

  test('Enable the disabled button', () => {
    model.set('disable', true, { silent: true });
    view.updateDisable();
    model.set('disable', false, { silent: true });
    view.updateDisable();
    expect(view.el.getAttribute('class')).toEqual(btnClass);
  });

  test('Cancels the click action when button is disabled', () => {
    const stub = sinon.stub(view, 'toggleActive');
    model.set('disable', true, { silent: true });
    view.clicked();
    expect(stub.called).toEqual(false);
  });

  test('Enable the click action when button is enable', () => {
    const stub = sinon.stub(view, 'toggleActive');
    model.set('disable', false, { silent: true });
    view.clicked();
    expect(stub.called).toEqual(true);
  });

  test('Renders correctly', () => {
    expect(view.render()).toBeTruthy();
  });
});
