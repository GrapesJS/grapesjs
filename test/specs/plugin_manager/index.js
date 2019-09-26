import PluginManager from 'plugin_manager';

describe('PluginManager', () => {
  describe('Main', () => {
    var obj;
    var val;
    var testPlugin = e => {
      val = e;
    };

    beforeEach(() => {
      obj = new PluginManager();
    });

    afterEach(() => {
      obj = null;
    });

    test('Object exists', () => {
      expect(obj).toBeTruthy();
    });

    test('No plugins inside', () => {
      expect(obj.getAll()).toEqual({});
    });

    test('Add new plugin', () => {
      obj.add('test', testPlugin);
      expect(obj.get('test')).toBeTruthy();
    });

    test('Added plugin is working', () => {
      obj.add('test', testPlugin);
      var plugin = obj.get('test');
      plugin('tval');
      expect(val).toEqual('tval');
    });
  });
});
