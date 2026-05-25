import { setupTestEditor } from '../../common';

describe('PluginManager', () => {
  describe('Main', () => {
    let editor;
    let obj;
    let val;
    const testPlugin = (ed) => {
      val = ed;
    };

    beforeEach(() => {
      val = null;
      ({ editor } = setupTestEditor());
      obj = editor.Plugins;
    });

    afterEach(() => {
      editor?.destroy();
      editor = null;
      obj = null;
    });

    test('Object exists', () => {
      expect(obj).toBeTruthy();
    });

    test('No plugins inside', () => {
      expect(obj.getAll()).toEqual([]);
    });

    test('Add new plugin', () => {
      obj.add({ id: 'test', plugin: testPlugin });
      expect(obj.get('test')).toBeTruthy();
    });

    test('Added plugin is working', () => {
      obj.add({ id: 'test', plugin: testPlugin });
      expect(val).toBe(editor);
    });
  });
});
