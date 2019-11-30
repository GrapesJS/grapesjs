import ComponentImageView from 'dom_components/view/ComponentImageView';
import Component from 'dom_components/model/ComponentImage';

describe('ComponentImageView', () => {
  var model;
  var view;

  beforeEach(() => {
    model = new Component();
    view = new ComponentImageView({
      model
    });
    document.body.innerHTML = '<div id="fixtures"></div>';
    document.body.querySelector('#fixtures').appendChild(view.render().el);
  });

  afterEach(() => {
    view.remove();
  });

  test('Component empty', () => {
    expect(view.el.getAttribute('class')).toEqual(view.classEmpty);
  });

  test('TagName is <img>', () => {
    expect(view.el.tagName).toEqual('IMG');
  });

  test('Update src attribute', () => {
    model.set('src', './');
    expect(view.el.getAttribute('src')).toEqual('./');
  });

  test('Renders correctly', () => {
    expect(view.render()).toBeTruthy();
  });
});
