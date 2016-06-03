define(['GrapesJS', 'PluginManager'],
 function(GrapesJS, PluginManager) {

  describe('GrapesJS', function() {

    describe('Main', function() {

      var obj;

      beforeEach(function () {
        obj = new GrapesJS();
      });

      afterEach(function () {
        delete obj;
      });

      it('main object should be loaded', function() {
        obj.should.be.exist;
      });

      it('Init new editor', function() {
        var editor = obj.init();
        editor.should.not.be.empty;
      });

    });

  });

});