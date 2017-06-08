const PluginManager = require('plugin_manager');

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

    it('Object exists', () => {
      expect(obj).toExist();
    });

    it('No plugins inside', () => {
      expect(obj.getAll()).toEqual({});
    });

    it('Add new plugin', () => {
      obj.add('test', testPlugin);
      expect(obj.get('test')).toExist();
    });

    it('Added plugin is working', () => {
      obj.add('test', testPlugin);
      var plugin = obj.get('test');
      plugin('tval');
      expect(val).toEqual('tval');
    });

  });

});
