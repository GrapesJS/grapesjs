import BlocksView from '../../../../src/block_manager/view/BlocksView';
import Blocks from '../../../../src/block_manager/model/Blocks';
import EditorModel from '../../../../src/editor/model/Editor';

describe('BlocksView', () => {
  let model: Blocks;
  let view: BlocksView;
  let em: EditorModel;

  beforeEach(() => {
    em = new EditorModel();
    model = em.Blocks.blocks;
    view = new BlocksView({ collection: model }, { em });
    document.body.innerHTML = '<div id="fixtures"></div>';
    document.body.querySelector('#fixtures')!.appendChild(view.render().el);
  });

  afterEach(() => {
    view.collection.reset();
    em.destroy();
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
      em = new EditorModel({
        blockManager: {
          blocks: [
            { label: 'test1', content: '1' },
            { label: 'test2', content: '2' },
          ],
        },
      });
      model = em.Blocks.blocks;
      view = new BlocksView({ collection: model }, { em });
      document.body.innerHTML = '<div id="fixtures"></div>';
      document.body.querySelector('#fixtures')!.appendChild(view.render().el);
    });

    test('Render children', () => {
      expect(view.getBlocksEl().children.length).toEqual(2);
    });

    test('Render container', () => {
      expect(view.getBlocksEl().getAttribute('class')).toEqual('blocks-c');
    });
  });
});
