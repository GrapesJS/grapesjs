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
          blocks: [],
        },
      });

      idTest = 'h1-block';
      optsTest = {
        label: 'Heading',
        content: '<h1>Test</h1>',
      };

      obj = editor.Blocks;
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

    test('Render blocks', () => {
      obj.postRender();
      obj.render();
      expect(obj.getContainer()).toBeTruthy();
    });

    describe('Events', () => {
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
        obj.add(idTest, optsTest);
        editor.on(obj.events.removeBefore, eventBfRm);
        editor.on(obj.events.remove, eventRm);
        editor.on(obj.events.all, eventAll);
        const removed = obj.remove(idTest);
        expect(obj.getAll().length).toBe(0);
        expect(eventBfRm).toBeCalledTimes(1);
        expect(eventRm).toBeCalledTimes(1);
        expect(eventRm).toBeCalledWith(removed, expect.anything());
        expect(eventAll).toBeCalled();
      });

      test('Update triggers proper events', () => {
        const eventUp = jest.fn();
        const eventAll = jest.fn();
        const added = obj.add(idTest, optsTest);
        const newProps = { label: 'Heading 2' };
        editor.on(obj.events.update, eventUp);
        editor.on(obj.events.all, eventAll);
        added.set(newProps);
        expect(eventUp).toBeCalledTimes(1);
        expect(eventUp).toBeCalledWith(added, newProps, expect.anything());
        expect(eventAll).toBeCalled();
      });
    });
  });
});
