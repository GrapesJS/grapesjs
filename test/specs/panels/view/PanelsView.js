import PanelsView from 'panels/view/PanelsView';
import Panels from 'panels/model/Panels';

describe('PanelsView', () => {
  var fixtures;
  var $fixture;
  var model;
  var view;

  beforeEach(() => {
    model = new Panels([]);
    view = new PanelsView({
      collection: model
    });
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

  test('Add new panel', () => {
    sinon.stub(view, 'addToCollection');
    view.collection.add({});
    expect(view.addToCollection.calledOnce).toEqual(true);
  });

  test('Render new panel', () => {
    view.collection.add({});
    expect(view.$el.html()).toBeTruthy();
  });
});
