const PluginManager = require('plugin_manager');

describe('GrapesJS', () => {

  describe('Main', () => {

    var obj;
    var fixtures;
    var fixture;
    var editorName;
    var htmlString;
    var config;
    var cssString;
    var documentEl;

    var storage;
    var storageId = 'testStorage';
    var storageMock = {
      store(data, clb) {
        storage = data;
        clb();
      },
      load(keys, clb) {
        return clb(storage);
      },
    };

    before(() => {
      editorName = 'editor-fixture';
    });

    beforeEach(() => {
      htmlString =  '<div class="test1"></div><div class="test2"></div>';
      cssString =  '.test2{color:red}.test3{color:blue}';
      documentEl = '<style>' + cssString + '</style>' + htmlString;
      config = {
        container: '#' + editorName,
        storageManager: {
          autoload: 0,
          autosave: 0,
          type: ''
        },
      }
      obj = grapesjs;
      //fixture = $('<div id="' + editorName + '"></div>');
      //fixture.empty().appendTo(fixtures);

      document.body.innerHTML = `<div id="fixtures"><div id="${editorName}"></div></div>`;
      fixtures = document.body.querySelector('#fixtures');
    });

    it('Main object should be loaded', () => {
      expect(obj).toExist();
    });

    it('Init new editor', () => {
      var editor = obj.init(config);
      expect(editor).toExist();
    });

    it('Init new editor with node for container', () => {
      var configAlt = {
        container: document.createElement('div'),
        storageManager: {
          autoload: 0,
          type:'none'
        },
      }
      var editor = obj.init(configAlt);
      expect(editor).toExist();
    });

    it('New editor is empty', () => {
      var editor = obj.init(config);
      var html = editor.getHtml();
      //var css = editor.getCss();
      var protCss = editor.getConfig().protectedCss;
      expect((html ? html : '')).toNotExist();
      //expect((css ? css : '')).toEqual(protCss);
      expect(editor.getComponents().length).toEqual(0);
      expect(editor.getStyle().length).toEqual(0);
    });

    it('Init editor with html', () => {
      config.components = htmlString;
      var editor = obj.init(config);
      var comps = editor.DomComponents.getComponents();
      expect(comps.length).toEqual(2);
      expect(comps.at(0).get('classes').at(0).get('name')).toEqual('test1');
    });

    it('Init editor with css', () => {
      config.style = cssString;
      var editor = obj.init(config);
      var rules = editor.CssComposer.getAll();
      expect(rules.length).toEqual(2);
      expect(rules.at(0).get('selectors').at(0).get('name')).toEqual('test2');
    });

    it.skip('Init editor from element', () => {
      config.fromElement = 1;
      fixtures.innerHTML = documentEl;
      var editor = obj.init(config);
      var html = editor.getHtml();
      var css = editor.getCss();
      var protCss = editor.getConfig().protectedCss;
      /*
      (html ? html : '').should.equal(htmlString);
      (css ? css : '').should.equal(protCss + '.test2{color:red;}');// .test3 is discarded in css
      editor.getComponents().length.should.equal(2);
      editor.getStyle().length.should.equal(2);
      */

      expect((html ? html : '')).toEqual(htmlString);
      expect(editor.getComponents().length).toEqual(2);
      // .test3 is discarded in css
      expect((css ? css : '')).toEqual(protCss + '.test2{color:red;}');
      // bust is still here
      expect(editor.getStyle().length).toEqual(2);
    });

    it('Set components as HTML', () => {
      var editor = obj.init(config);
      editor.setComponents(htmlString);
      expect(editor.getComponents().length).toEqual(2);
    });

    it('Set components as array of objects', () => {
      var editor = obj.init(config);
      editor.setComponents([{}, {}, {}]);
      expect(editor.getComponents().length).toEqual(3);
    });

    it('Set style as CSS', () => {
      var editor = obj.init(config);
      editor.setStyle(cssString);
      editor.setStyle(cssString);
      var styles = editor.getStyle();
      expect(styles.length).toEqual(2);
      expect(styles.at(1).get('selectors').at(0).get('name')).toEqual('test3');
    });

    it('Set style as as array of objects', () => {
      var editor = obj.init(config);
      editor.setStyle([
        {selectors: ['test4']},
        {selectors: ['test5']}
      ]);
      var styles = editor.getStyle();
      expect(styles.length).toEqual(2);
      expect(styles.at(1).get('selectors').at(0).get('name')).toEqual('test5');
    });

    it.skip('Adds new storage as plugin and store data there', done => {
      var pluginName = storageId + '-plugin';
      obj.plugins.add(pluginName, edt => {
        edt.StorageManager.add(storageId, storageMock);
      });
      config.storageManager.type = storageId;
      config.plugins = [pluginName];
      var editor = obj.init(config);
      editor.setComponents(htmlString);
      editor.store(() => {
        editor.load((data) => {
          expect(data.html).toEqual(htmlString);
          done();
        });
      });
    });

    it('Execute plugins with custom options', () => {
      var pluginName = storageId + '-plugin-opts';
      obj.plugins.add(pluginName, (edt, opts) => {
        var opts = opts || {};
        edt.customValue = opts.cVal || '';
      });
      config.plugins = [pluginName];
      config.pluginsOpts = {};
      config.pluginsOpts[pluginName] = {cVal: 'TEST'};
      var editor = obj.init(config);
      expect(editor.customValue).toEqual('TEST');
    });

    it('Execute custom command', () => {
      var editor = obj.init(config);
      editor.testVal = '';
      editor.setComponents(htmlString);
      editor.Commands.add('test-command', {
        run(ed, caller, opts) {
          ed.testVal = ed.getHtml() + opts.val;
        },
      });
      editor.runCommand('test-command', {val: 5});
      expect(editor.testVal).toEqual(htmlString + '5');
    });

    it('Stop custom command', () => {
      var editor = obj.init(config);
      editor.testVal = '';
      editor.setComponents(htmlString);
      editor.Commands.add('test-command', {
        stop(ed, caller, opts) {
          ed.testVal = ed.getHtml() + opts.val;
        },
      });
      editor.stopCommand('test-command', {val: 5});
      expect(editor.testVal).toEqual(htmlString + '5');
    });

    it('Set default devices', () => {
      config.deviceManager = {};
      config.deviceManager.devices = [
        {name:'1', width: '2'},
        {name:'3', width: '4'},
      ];
      var editor = obj.init(config);
      expect(editor.DeviceManager.getAll().length).toEqual(2);
    });

    it('There is no active device', () => {
      var editor = obj.init(config);
      expect(editor.getDevice()).toNotExist();
    });

    it('Active another device', () => {
      var editor = obj.init(config);
      editor.setDevice('Tablet');
      expect(editor.getDevice()).toEqual('Tablet');
    });

    // Problems with iframe loading
    it('Init new editor with custom plugin overrides default commands', () => {
      var editor,
          pluginName = 'test-plugin-opts';

      obj.plugins.add(pluginName, (edt, opts) => {
        let cmdm = edt.Commands;
        // Overwrite export template
        cmdm.add('export-template', {test: 1});
      });
      config.plugins = [pluginName];

      editor = obj.init(config);
      expect(editor.Commands.get('export-template').test).toEqual(1);
    });

  });

});
