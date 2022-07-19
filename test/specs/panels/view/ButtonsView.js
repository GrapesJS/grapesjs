import ButtonsView from 'panels/view/ButtonsView';
import Buttons from 'panels/model/Buttons';
import Editor from 'editor';

describe('ButtonsView', () => {
  var fixtures;
  var em;
  var model;
  var view;

  beforeEach(() => {
    em = new Editor({});
    model = new Buttons(em.Panels, []);
    view = new ButtonsView(model);
    document.body.innerHTML = '<div id="fixtures"></div>';
    fixtures = document.body.querySelector('#fixtures');
    fixtures.appendChild(view.render().el);
  });

  afterEach(() => {
    view.collection.reset();
  });

  test('Collection is empty', () => {
    expect(view.$el.html()).toEqual('');
  });

  test('Add new button', () => {
    sinon.stub(view, 'addToCollection');
    view.collection.add({});
    expect(view.addToCollection.calledOnce).toEqual(true);
  });

  test('Render new button', () => {
    view.collection.add({});
    expect(view.$el.html()).toBeTruthy();
  });
});
