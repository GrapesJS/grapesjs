import Editor from 'editor/index';
import Keymaps from 'keymaps';

describe('Keymaps', () => {
  describe('Main', () => {
    let em;
    let obj;
    let editor;

    beforeEach(() => {
      editor = Editor({ keymaps: { defaults: [] } }).init();
      em = editor.getModel();
      em.loadOnStart();
      obj = editor.Keymaps;
    });

    test('Object exists', () => {
      expect(obj).toBeTruthy();
    });

    test('No keymaps inside', () => {
      var coll = obj.getAll();
      expect(coll).toEqual({});
    });

    test('Add new keymap', () => {
      const id = 'test';
      const keys = 'ctrl+a';
      const handler = () => {};
      const model = obj.add(id, 'ctrl+a', handler);
      expect(obj.get(id)).toEqual({ id, keys, handler });
    });

    test('Add keymap event triggers', () => {
      let called = 0;
      em.on('keymap:add', () => (called = 1));
      const model = obj.add('tes', 'ctrl+a');
      expect(called).toEqual(1);
    });

    test('Remove keymap', () => {
      const id = 'test';
      const keys = 'ctrl+a';
      const handler = () => {};
      const model = obj.add(id, keys, handler);
      const removed = obj.remove(id);
      expect(obj.get(id)).toEqual(undefined);
      expect(obj.getAll()).toEqual({});
      expect(removed).toEqual({ id, keys, handler });
    });

    test('Remove keymap event triggers', () => {
      let called = 0;
      em.on('keymap:remove', () => (called = 1));
      const model = obj.add('tes', 'ctrl+a');
      const removed = obj.remove('tes');
      expect(called).toEqual(1);
    });

    describe('Given the edit is not on edit mode', () => {
      beforeEach(() => {
        em.setEditing(0);
      });

      it('Should run the handler', () => {
        const handler = {
          run: jest.fn(),
          callRun: jest.fn()
        };
        obj.add('test', 'ctrl+a', handler);
        const keyboardEvent = new KeyboardEvent('keydown', {
          keyCode: 65,
          which: 65,
          ctrlKey: true
        });
        document.dispatchEvent(keyboardEvent);

        expect(handler.callRun).toBeCalled();
      });
    });

    describe('Given the edit is on edit mode', () => {
      beforeEach(() => {
        em.setEditing(1);
      });

      it('Should not run the handler', () => {
        const handler = {
          run: jest.fn(),
          callRun: jest.fn()
        };
        obj.add('test', 'ctrl+a', handler);
        const keyboardEvent = new KeyboardEvent('keydown', {
          keyCode: 65,
          which: 65,
          ctrlKey: true
        });
        document.dispatchEvent(keyboardEvent);

        expect(handler.callRun).toBeCalledTimes(0);
      });

      it('Should run the handler if checked as force', () => {
        const handler = {
          run: jest.fn(),
          callRun: jest.fn()
        };
        obj.add('test', 'ctrl+a', handler, { force: true });
        const keyboardEvent = new KeyboardEvent('keydown', {
          keyCode: 65,
          which: 65,
          ctrlKey: true
        });
        document.dispatchEvent(keyboardEvent);

        expect(handler.callRun).toBeCalled();
      });
    });
  });
});
