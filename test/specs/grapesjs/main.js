define(['GrapesJS', 'PluginManager', 'chai'],
 function(GrapesJS, PluginManager, chai) {

  describe('GrapesJS', function() {

    describe('Main', function() {

      var obj;
      var fixtures;
      var fixture;
      var editorName;
      var htmlString;
      var config;

      var storage;
      var storageId = 'testStorage';
      var storageMock = {
        store: function(data){
          storage = data;
        },
        load: function(keys){
          return storage;
        },
      };

      before(function () {
        editorName = 'editor-fixture';
        fixtures = $("#fixtures");
      });

      beforeEach(function () {
        htmlString =  '<div class="test1"></div><div class="test2"></div>';
        cssString =  '.test2{color:red}.test3{color:blue}';
        documentEl = '<style>' + cssString + '</style>' + htmlString;
        config = {
          container: '#' + editorName,
          storageManager: {
            autoload: 0,
            type:'none'
          },
        }
        obj = GrapesJS;
        fixture = $('<div id="' + editorName + '"></div>');
        fixture.empty().appendTo(fixtures);
      });

      afterEach(function () {
        config = {};
        delete obj;
        delete config;
        fixture.remove();
      });

      it('main object should be loaded', function() {
        obj.should.be.exist;
      });

      it('Init new editor', function() {
        var editor = obj.init(config);
        editor.should.not.be.empty;
      });

      it('New editor is empty', function() {
        var editor = obj.init(config);
        var html = editor.getHtml();
        var css = editor.getCss();
        (html ? html : '').should.be.empty;
        (css ? css : '').should.be.empty;
        editor.getComponents().length.should.equal(0);
        editor.getStyle().length.should.equal(0);
      });

      it('Init editor with html', function() {
        config.components = htmlString;
        var editor = obj.init(config);
        var comps = editor.DomComponents.getComponents();
        comps.length.should.equal(2);
        comps.at(0).get('classes').at(0).get('name').should.equal('test1');
      });

      it('Init editor with css', function() {
        config.style = cssString;
        var editor = obj.init(config);
        var rules = editor.CssComposer.getAll();
        rules.length.should.equal(2);
        rules.at(0).get('selectors').at(0).get('name').should.equal('test2');
      });

      it('Init editor from element', function() {
        config.fromElement = 1;
        fixture.html(documentEl);
        var editor = obj.init(config);
        var html = editor.getHtml();
        var css = editor.getCss();
        (html ? html : '').should.equal(htmlString);
        (css ? css : '').should.equal('.test2{color:red;}');// .test3 is discarded in css
        editor.getComponents().length.should.equal(2);
        editor.getStyle().length.should.equal(2);// .test3 is still here
      });

      it('Set components as HTML', function() {
        var editor = obj.init(config);
        editor.setComponents(htmlString);
        editor.getComponents().length.should.equal(2);
      });

      it('Set components as array of objects', function() {
        var editor = obj.init(config);
        editor.setComponents([{}, {}, {}]);
        editor.getComponents().length.should.equal(3);
      });

      it('Set style as CSS', function() {
        var editor = obj.init(config);
        editor.setStyle(cssString);
        editor.setStyle(cssString);
        var styles = editor.getStyle();
        styles.length.should.equal(2);
        styles.at(1).get('selectors').at(0).get('name').should.equal('test3');
      });

      it('Set style as as array of objects', function() {
        var editor = obj.init(config);
        editor.setStyle([
          {selectors: ['test4']},
          {selectors: ['test5']}
        ]);
        var styles = editor.getStyle();
        styles.length.should.equal(2);
        styles.at(1).get('selectors').at(0).get('name').should.equal('test5');
      });

      it('Adds new storage as plugin and store data there', function() {
        var pluginName = storageId + '-plugin';
        obj.plugins.add(pluginName, function(edt){
          edt.StorageManager.add(storageId, storageMock);
        });
        config.storageManager.type = storageId;
        config.plugins = [pluginName];
        var editor = obj.init(config);
        editor.setComponents(htmlString);
        editor.store();
        var data = editor.load();
        data.html.should.equal(htmlString);
      });

      it('Execute plugins with custom options', function() {
        var pluginName = storageId + '-plugin-opts';
        obj.plugins.add(pluginName, function(edt, opts){
          var opts = opts || {};
          edt.customValue = opts.cVal || '';
        });
        config.plugins = [pluginName];
        config.pluginsOpts = {};
        config.pluginsOpts[pluginName] = {cVal: 'TEST'};
        var editor = obj.init(config);
        editor.customValue.should.equal('TEST');
      });

      it('Execute custom command', function() {
        var editor = obj.init(config);
        editor.testVal = '';
        editor.setComponents(htmlString);
        editor.Commands.add('test-command', {
          run: function(ed, caller, opts){
            ed.testVal = ed.getHtml() + opts.val;
          },
        });
        editor.runCommand('test-command', {val: 5});
        editor.testVal.should.equal(htmlString + '5');
      });

      it('Stop custom command', function() {
        var editor = obj.init(config);
        editor.testVal = '';
        editor.setComponents(htmlString);
        editor.Commands.add('test-command', {
          stop: function(ed, caller, opts){
            ed.testVal = ed.getHtml() + opts.val;
          },
        });
        editor.stopCommand('test-command', {val: 5});
        editor.testVal.should.equal(htmlString + '5');
      });

      it('Set default devices', function() {
        config.deviceManager = {};
        config.deviceManager.devices = [
          {name:'1', width: '2'},
          {name:'3', width: '4'},
        ];
        var editor = obj.init(config);
        editor.DeviceManager.getAll().length.should.equal(2);
      });

      it('There is no active device', function() {
        var editor = obj.init(config);
        editor.getDevice().should.be.empty;
      });

      it('Active another device', function() {
        var editor = obj.init(config);
        editor.setDevice('Tablet');
        editor.getDevice().should.equal('Tablet');
      });


    });

  });

});