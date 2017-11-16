const Editor = require('editor/model/Editor');
const Keymaps = require('keymaps');

describe('Keymaps', () => {

  describe('Main', () => {

    let em;
    let obj;

    beforeEach(() => {
      em = new Editor();
      obj = new Keymaps().init({em});
    });

    it('Object exists', () => {
      expect(obj).toExist();
    });

    it('No keymaps inside', () => {
      var coll = obj.getAll();
      expect(coll).toEqual({});
    });

    it('Add new keymap', () => {
      const id = 'test';
      const keys = 'ctrl+a';
      const handler = () => {};
      const model = obj.add(id, 'ctrl+a', handler);
      expect(obj.get(id)).toEqual({id, keys, handler});
    });

    it('Add keymap event triggers', () => {
      let called = 0;
      em.on('keymap:add', () => called = 1);
      const model = obj.add('tes', 'ctrl+a');
      expect(called).toEqual(1);
    });

    it('Remove keymap', () => {
      const id = 'test';
      const keys = 'ctrl+a';
      const handler = () => {};
      const model = obj.add(id, 'ctrl+a', handler);
      const removed = obj.remove(id);
      expect(obj.get(id)).toEqual(undefined);
      expect(obj.getAll()).toEqual({});
      expect(removed).toEqual({id, keys, handler});
    });

    it('Remove keymap event triggers', () => {
      let called = 0;
      em.on('keymap:remove', () => called = 1);
      const model = obj.add('tes', 'ctrl+a');
      const removed = obj.remove('tes');
      expect(called).toEqual(1);
    });
  });

});
