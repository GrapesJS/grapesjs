import Editor from 'editor';

describe('BlockManager', () => {
  describe('Main', () => {
    let obj;
    let idTest;
    let optsTest;
    let editor;

    beforeEach(() => {
      editor = new Editor({
        blockManager: {
          blocks: []
        }
      }).init();

      idTest = 'h1-block';
      optsTest = {
        label: 'Heading',
        content: '<h1>Test</h1>'
      };

      obj = editor.Blocks;

      // obj = new BlockManager().init();
      // obj.postRender();
      // obj.render();
    });

    afterEach(() => {
      editor.destroy();
      obj = null;
    });

    test('Object exists', () => {
      expect(obj).toBeTruthy();
    });

    test('No blocks inside', () => {
      expect(obj.getAll().length).toEqual(0);
    });

    test('No categories inside', () => {
      expect(obj.getCategories().length).toEqual(0);
    });

    test('Add new block', () => {
      obj.add(idTest, optsTest);
      expect(obj.getAll().length).toEqual(1);
    });

    test('Added block has correct data', () => {
      var model = obj.add(idTest, optsTest);
      expect(model.get('label')).toEqual(optsTest.label);
      expect(model.get('content')).toEqual(optsTest.content);
    });

    test('Add block with attributes', () => {
      optsTest.attributes = { class: 'test' };
      var model = obj.add(idTest, optsTest);
      expect(model.get('attributes').class).toEqual('test');
    });

    test('The id of the block is unique', () => {
      var model = obj.add(idTest, optsTest);
      var model2 = obj.add(idTest, { other: 'test' });
      expect(model).toEqual(model2);
    });

    test('Get block by id', () => {
      var model = obj.add(idTest, optsTest);
      var model2 = obj.get(idTest);
      expect(model).toEqual(model2);
    });

    test.skip('Render blocks', () => {
      obj.render();
      expect(obj.getContainer()).toBeTruthy();
    });

    describe.only('Events', () => {
      test('Add triggers proper events', () => {
        const eventAdd = jest.fn();
        const eventAll = jest.fn();
        editor.on(obj.events.add, eventAdd);
        editor.on(obj.events.all, eventAll);
        const added = obj.add(idTest, optsTest);
        expect(eventAdd).toBeCalledTimes(1);
        expect(eventAdd).toBeCalledWith(added, expect.anything());
        expect(eventAll).toBeCalled();
      });

      test('Remove triggers proper events', () => {
        const eventBfRm = jest.fn();
        const eventRm = jest.fn();
        const eventAll = jest.fn();
        editor.on(obj.events.removeBefore, eventBfRm);
        editor.on(obj.events.remove, eventRm);
        editor.on(obj.events.all, eventAll);
        obj.add(idTest, optsTest);
        const removed = obj.remove(idTest);
        expect(obj.getAll().length).toBe(0);
        expect(eventBfRm).toBeCalledTimes(1);
        expect(eventRm).toBeCalledTimes(1);
        expect(eventRm).toBeCalledWith(removed, expect.anything());
        expect(eventAll).toBeCalled();
      });
    });
  });
});
