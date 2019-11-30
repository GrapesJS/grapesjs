import ComponentTextView from 'dom_components/view/ComponentTextView';
import Component from 'dom_components/model/Component';

describe('ComponentTextView', () => {
  var fixtures;
  var model;
  var view;

  beforeEach(() => {
    model = new Component();
    view = new ComponentTextView({
      model
    });
    document.body.innerHTML = '<div id="fixtures"></div>';
    fixtures = document.body.querySelector('#fixtures');
    fixtures.appendChild(view.render().el);
  });

  afterEach(() => {
    view.remove();
  });

  test('Component empty', () => {
    expect(fixtures.innerHTML).toEqual(
      '<div data-gjs-type="default" data-highlightable="1"></div>'
    );
  });

  test('Input content is stored in model', () => {
    //view.enableEditing();
    view.el.innerHTML = 'test';
    //view.disableEditing();
    //model.get('content').should.equal('test');
  });

  test('Init with content', () => {
    model = new Component({ content: 'test' });
    view = new ComponentTextView({ model });
    fixtures.appendChild(view.render().el);
    expect(view.el.innerHTML).toEqual('test');
  });
});
