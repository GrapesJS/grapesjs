import ModalView from 'modal_dialog/view/ModalView';
import Modal from 'modal_dialog/model/Modal';
import Editor from 'editor';

describe('ModalView', () => {
  var model;
  var view;
  var em;

  beforeEach(() => {
    em = new Editor({});
    model = new Modal(em);
    view = new ModalView({
      model,
    });
    document.body.innerHTML = '<div id="fixtures"></div>';
    document.body.querySelector('#fixtures').appendChild(view.render().el);
  });

  afterEach(() => {
    view = null;
    model = null;
  });

  test('The content is not empty', () => {
    expect(view.el.innerHTML).toBeTruthy();
  });

  test('Get content', () => {
    expect(view.getContent()).toBeTruthy();
  });

  test('Update content', () => {
    model.set('content', 'test');
    expect(view.getContent().get(0).innerHTML).toEqual('test');
  });

  test('Get title', () => {
    expect(view.getTitle()).toBeTruthy();
  });

  test('Update title', () => {
    model.set('title', 'test');
    expect(view.getTitle().innerHTML).toEqual('test');
  });

  test('Close by default', () => {
    view.updateOpen();
    expect(view.el.style.display).toEqual('none');
  });

  test('Open dialog', () => {
    model.set('open', 1);
    expect(view.el.style.display).toEqual('');
  });
});
