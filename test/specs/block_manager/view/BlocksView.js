import Backbone from 'backbone';
import BlocksView from 'block_manager/view/BlocksView';
import Blocks from 'block_manager/model/Blocks';

describe('BlocksView', () => {
  var $fixtures;
  var $fixture;
  var model;
  var view;
  var editorModel;
  var ppfx;

  beforeEach(() => {
    model = new Blocks([]);
    view = new BlocksView({ collection: model });
    document.body.innerHTML = '<div id="fixtures"></div>';
    document.body.querySelector('#fixtures').appendChild(view.render().el);
  });

  afterEach(() => {
    view.collection.reset();
  });

  test('The container is not empty', () => {
    expect(view.el.outerHTML).toBeTruthy();
  });

  test('No children inside', () => {
    expect(view.getBlocksEl().children.length).toEqual(0);
  });

  test('Render children on add', () => {
    model.add({});
    expect(view.getBlocksEl().children.length).toEqual(1);
    model.add([{}, {}]);
    expect(view.getBlocksEl().children.length).toEqual(3);
  });

  test('Destroy children on remove', () => {
    model.add([{}, {}]);
    expect(view.getBlocksEl().children.length).toEqual(2);
    model.at(0).destroy();
    expect(view.getBlocksEl().children.length).toEqual(1);
  });

  describe('With configs', () => {
    beforeEach(() => {
      ppfx = 'pfx-t-';
      editorModel = new Backbone.Model();
      model = new Blocks([{ name: 'test1' }, { name: 'test2' }]);
      view = new BlocksView(
        {
          collection: model
        },
        {
          pStylePrefix: ppfx
        }
      );
      document.body.innerHTML = '<div id="fixtures"></div>';
      document.body.querySelector('#fixtures').appendChild(view.render().el);
    });

    test('Render children', () => {
      expect(view.getBlocksEl().children.length).toEqual(2);
    });

    test('Render container', () => {
      expect(view.getBlocksEl().getAttribute('class')).toEqual(
        ppfx + 'blocks-c'
      );
    });
  });
});
