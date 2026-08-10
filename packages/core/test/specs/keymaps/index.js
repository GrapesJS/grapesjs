import Editor from 'editor';

describe('Keymaps', () => {
  describe('Main', () => {
    let em;
    let obj;
    let editor;

    beforeEach(() => {
      editor = new Editor({ keymaps: { defaults: [] } });
      em = editor.getModel();
      em.loadOnStart();
      obj = editor.Keymaps;
    });

    afterEach(() => {
      // Bindings are kept in a module-level registry, shared between editors
      obj.removeAll();
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

    describe('Prevent option', () => {
      const dispatchKey = (props = {}) => {
        const keyboardEvent = new KeyboardEvent('keydown', {
          keyCode: 83,
          which: 83,
          ctrlKey: true,
          cancelable: true,
          bubbles: true,
        });
        Object.assign(keyboardEvent, props);
        document.dispatchEvent(keyboardEvent);
        return keyboardEvent;
      };

      beforeEach(() => {
        em.setEditing(0);
      });

      it('Should prevent the default action', () => {
        const handler = jest.fn();
        obj.add('test', 'ctrl+s', handler, { prevent: true });
        const event = dispatchKey();

        expect(handler).toHaveBeenCalled();
        expect(event.defaultPrevented).toBe(true);
      });

      it('Should prevent the default action of the event coming from the frame', () => {
        obj.add('test', 'ctrl+s', () => {}, { prevent: true });
        // Events triggered inside the canvas frame are re-dispatched on the main
        // document, the original one is kept in `_parentEvent`.
        const parentEvent = new KeyboardEvent('keydown', { cancelable: true });
        dispatchKey({ _parentEvent: parentEvent });

        expect(parentEvent.defaultPrevented).toBe(true);
      });

      it('Should not prevent the default action without the option', () => {
        obj.add('test', 'ctrl+s', () => {});
        const event = dispatchKey();

        expect(event.defaultPrevented).toBe(false);
      });
    });

    describe('Given the edit is not on edit mode', () => {
      beforeEach(() => {
        em.setEditing(0);
      });

      it('Should run the handler', () => {
        const handler = {
          run: jest.fn(),
          callRun: jest.fn(),
        };
        obj.add('test', 'ctrl+a', handler);
        const keyboardEvent = new KeyboardEvent('keydown', {
          keyCode: 65,
          which: 65,
          ctrlKey: true,
        });
        document.dispatchEvent(keyboardEvent);

        expect(handler.callRun).toHaveBeenCalled();
      });
    });

    describe('Given the edit is on edit mode', () => {
      beforeEach(() => {
        em.setEditing(1);
      });

      it('Should not run the handler', () => {
        const handler = {
          run: jest.fn(),
          callRun: jest.fn(),
        };
        obj.add('test', 'ctrl+a', handler);
        const keyboardEvent = new KeyboardEvent('keydown', {
          keyCode: 65,
          which: 65,
          ctrlKey: true,
        });
        document.dispatchEvent(keyboardEvent);

        expect(handler.callRun).toHaveBeenCalledTimes(0);
      });

      it('Should run the handler if checked as force', () => {
        const handler = {
          run: jest.fn(),
          callRun: jest.fn(),
        };
        obj.add('test', 'ctrl+a', handler, { force: true });
        const keyboardEvent = new KeyboardEvent('keydown', {
          keyCode: 65,
          which: 65,
          ctrlKey: true,
        });
        document.dispatchEvent(keyboardEvent);

        expect(handler.callRun).toHaveBeenCalled();
      });
    });
  });
});
