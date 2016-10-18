var modulePath = './../../../test/specs/plugin_manager';

define(['PluginManager'], function(PluginManager) {

    describe('PluginManager', function() {

      describe('Main', function() {

        var obj;
        var val;
        var testPlugin = function(e){
          val = e;
        };

        beforeEach(function () {
          obj = new PluginManager();
        });

        afterEach(function () {
          delete obj;
        });

        it('Object exists', function() {
          obj.should.be.exist;
        });

        it('No plugins inside', function() {
          obj.getAll().should.be.empty;
        });

        it('Add new plugin', function() {
          obj.add('test', testPlugin);
          obj.get('test').should.not.be.empty;
        });

        it('Added plugin is working', function() {
          obj.add('test', testPlugin);
          var plugin = obj.get('test');
          plugin('tval');
          val.should.equal('tval');
        });

      });

    });
});