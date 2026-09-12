import ModalView from 'modal_dialog/view/ModalView';
import Modal from 'modal_dialog/model/Modal';
import Editor from 'editor';

describe('ModalView', () => {
  var model;
  var view;
  var em;

  beforeEach(() => {
    em = new Editor({});
    model = new Modal(em.Modal);
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

  const clickBetween = (start, end) => {
    start.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    end.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    view.el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  };

  test('Closes on a complete backdrop click', () => {
    model.open();
    clickBetween(view.el, view.el);
    expect(model.get('open')).toBeFalsy();
  });

  test('Does not close when dragging from the dialog to the backdrop', () => {
    model.open();
    clickBetween(view.getContent().get(0), view.el);
    expect(model.get('open')).toBeTruthy();
    clickBetween(view.el, view.el);
    expect(model.get('open')).toBeFalsy();
  });

  test('Does not close when dragging from the backdrop into the dialog', () => {
    model.open();
    clickBetween(view.el, view.getContent().get(0));
    expect(model.get('open')).toBeTruthy();
  });

  test('Respects the disabled backdrop setting', () => {
    view.config.backdrop = false;
    model.open();
    clickBetween(view.el, view.el);
    expect(model.get('open')).toBeTruthy();
  });

  test('The close button still closes after interacting with the dialog', () => {
    model.open();
    const close = view.el.querySelector('[data-close-modal]');
    close.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    close.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    close.click();
    expect(model.get('open')).toBeFalsy();
  });
});
