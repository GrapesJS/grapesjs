import grapesjs, { Component, Editor, usePlugin } from '../../../src';
import ComponentWrapper from '../../../src/dom_components/model/ComponentWrapper';
import type { Plugin } from '../../../src/plugin_manager';

type TestPlugin = Plugin<{ cVal: string }>;

describe('GrapesJS', () => {
  describe('Main', () => {
    let fixture: HTMLElement;
    let editorName = '';
    let htmlString = '';
    let config: any;
    let cssString = '';
    let documentEl = '';

    let storage: any;
    let storageId = 'testStorage';
    let storageMock = {
      async store(data: any) {
        storage = data;
      },
      load() {
        return storage;
      },
    };

    beforeAll(() => {
      editorName = 'editor-fixture';
    });

    beforeEach(() => {
      storage = {};
      const initHtml = '<div class="test1"></div><div class="test2"></div>';
      htmlString = `<body>${initHtml}</body>`;
      cssString = '.test2{color:red}.test3{color:blue}';
      documentEl = '<style>' + cssString + '</style>' + initHtml;
      config = {
        container: '#' + editorName,
        storageManager: {
          autoload: 0,
          autosave: 0,
          type: 0,
        },
      };
      document.body.innerHTML = `<div id="fixtures"><div id="${editorName}"></div></div>`;
      fixture = document.body.querySelector(`#${editorName}`)!;
    });

    afterEach(() => {
      var plugins = grapesjs.plugins.getAll();
      for (let id in plugins) {
        if (plugins.hasOwnProperty(id)) {
          delete plugins[id];
        }
      }
    });

    test('Main object should be loaded', () => {
      expect(grapesjs).toBeTruthy();
    });

    test('Init new editor', () => {
      var editor = grapesjs.init(config);
      expect(editor).toBeTruthy();
    });

    test('Init new editor with node for container', () => {
      const editor = grapesjs.init({
        container: document.createElement('div'),
        storageManager: {
          autoload: false,
          type: 'none',
        },
      });
      expect(editor).toBeTruthy();
    });

    test('New editor is empty', () => {
      const editor = grapesjs.init(config);
      const html = editor.getHtml();
      //const css = editor.getCss();
      const protCss = editor.getConfig().protectedCss;
      expect(html).toBe('<body></body>');
      //expect((css ? css : '')).toEqual(protCss);
      expect(editor.getComponents().length).toEqual(0);
      expect(editor.getStyle().length).toEqual(0);
    });

    test.skip('Editor canvas baseCSS can be overwritten', () => {
      config.components = htmlString;
      config.baseCss = '#wrapper { background-color: #eee; }';
      config.protectedCss = '';
      const editor = grapesjs.init(config);
      const body = editor.Canvas.getBody();
      expect(body.outerHTML).toContain(config.baseCss);
      expect(body.outerHTML.replace(/\s+/g, ' ')).not.toContain('body { margin: 0;');
    });

    test.skip('Editor canvas baseCSS defaults to sensible values if not defined', () => {
      config.components = htmlString;
      config.protectedCss = '';
      grapesjs.init(config);
      expect(window.frames[0].document.documentElement.outerHTML.replace(/\s+/g, ' ')).toContain(
        'body { background-color: #fff',
      );
    });

    test('Init editor with html', () => {
      config.components = htmlString;
      var editor = grapesjs.init(config);
      var comps = editor.DomComponents.getComponents();
      expect(comps.length).toEqual(2);
      expect(comps.at(0).get('classes')?.at(0).get('name')).toEqual('test1');
    });

    test('Init editor with css', () => {
      config.style = cssString;
      var editor = grapesjs.init(config);
      var rules = editor.CssComposer.getAll();
      expect(rules.length).toEqual(2);
      expect(rules.at(0).get('selectors')?.at(0)?.get('name')).toEqual('test2');
    });

    test('Init editor from element', () => {
      config.fromElement = 1;
      config.storageManager = { type: 0 };
      fixture.innerHTML = documentEl;
      const editor = grapesjs.init(config);
      const html = editor.getHtml();
      const css = editor.getCss();
      const protCss = editor.getConfig().protectedCss;
      expect(html).toEqual(htmlString);
      expect(editor.getComponents().length).toEqual(2);
      // .test3 is discarded in CSS
      expect(css).toEqual(`${protCss}.test2{color:red;}`);
      // but it's still there
      expect(editor.getStyle().length).toEqual(2);
    });

    test('Init editor from element with multiple font-face at-rules', () => {
      config.fromElement = 1;
      config.storageManager = { type: 0 };
      fixture.innerHTML =
        `
      <style>
        @font-face {
          font-family: 'A';
          src: url('http://a.link') format('woff2');
        }
        @font-face {
          font-family: 'B';
          src: url('http://b.link') format('woff2');
        }
      </style>` + htmlString;
      const editor = grapesjs.init(config);
      const css = editor.getCss()!;
      const styles = editor.getStyle();
      expect(styles.length).toEqual(2);
      expect((css.match(/@font-face/g) || []).length).toEqual(2);
    });

    test('Set components as HTML', () => {
      var editor = grapesjs.init(config);
      editor.setComponents(htmlString);
      expect(editor.getComponents().length).toEqual(2);
    });

    test('Set components as array of objects', () => {
      var editor = grapesjs.init(config);
      editor.setComponents([{}, {}, {}]);
      expect(editor.getComponents().length).toEqual(3);
    });

    test('Set style as CSS', () => {
      var editor = grapesjs.init(config);
      editor.setStyle(cssString);
      editor.setStyle(cssString);
      var styles = editor.getStyle();
      expect(styles.length).toEqual(2);
      expect(styles.at(1).get('selectors')?.at(0)?.get('name')).toEqual('test3');
    });

    test('Set style as as array of objects', () => {
      var editor = grapesjs.init(config);
      editor.setStyle([{ selectors: ['test4'] }, { selectors: ['test5'] }]);
      var styles = editor.getStyle();
      expect(styles.length).toEqual(2);
      expect(styles.at(1).get('selectors')?.at(0)?.get('name')).toEqual('test5');
    });

    test('Execute custom command', () => {
      var editor = grapesjs.init(config);
      let testValue = '';
      editor.setComponents(htmlString);
      editor.Commands.add('test-command', {
        run(ed, caller, opts) {
          testValue = ed.getHtml() + opts.val;
        },
      });
      editor.runCommand('test-command', { val: 5 });
      expect(testValue).toEqual(htmlString + '5');
    });

    test('Stop custom command', () => {
      var editor = grapesjs.init(config);
      let testValue = '';
      editor.setComponents(htmlString);
      editor.Commands.add('test-command', {
        stop(ed, caller, opts) {
          testValue = ed.getHtml() + opts.val;
        },
      });
      editor.stopCommand('test-command', { val: 5, force: 1 });
      expect(testValue).toEqual(htmlString + '5');
    });

    test('Trigger custom command events', () => {
      const id = 'test-command';
      const editor = grapesjs.init(config);
      const result: Record<string, any> = {};
      editor.on(`run:${id}`, () => (result.run = 1));
      editor.on(`run:${id}:before`, () => (result.runBefore = 1));
      editor.on(`stop:${id}`, () => (result.stop = 1));
      editor.on(`stop:${id}:before`, () => (result.stopBefore = 1));
      editor.on(`abort:${id}`, () => (result.abort = 1));
      editor.Commands.add(id, {
        run() {},
        stop() {},
      });
      editor.runCommand(id);
      editor.stopCommand(id);
      editor.on(`run:${id}:before`, (opts) => (opts.abort = 1));
      editor.runCommand(id);
      expect(result).toEqual({
        run: 1,
        runBefore: 1,
        stop: 1,
        stopBefore: 1,
        abort: 1,
      });
    });

    test('Set default devices', () => {
      config.deviceManager = {};
      config.deviceManager.devices = [
        { name: '1', width: '2' },
        { name: '3', width: '4' },
      ];
      var editor = grapesjs.init(config);
      expect(editor.DeviceManager.getAll().length).toEqual(2);
    });

    test('There is no active device', () => {
      var editor = grapesjs.init(config);
      expect(editor.getDevice()).toBe('desktop');
    });

    test('Active another device', () => {
      var editor = grapesjs.init(config);
      editor.setDevice('Tablet');
      expect(editor.getDevice()).toEqual('Tablet');
    });

    test('Keep unused css classes/selectors option for getCSS method', () => {
      config.fromElement = 1;
      config.storageManager = { type: 0 };
      fixture.innerHTML = documentEl;
      const editor = grapesjs.init(config);
      const css = editor.getCss({ keepUnusedStyles: true });
      const protCss = editor.getConfig().protectedCss;
      expect(editor.getStyle().length).toEqual(2);
      expect(css).toEqual(`${protCss}.test2{color:red;}.test3{color:blue;}`);
    });

    test('Keep unused css classes/selectors option for media rules', () => {
      cssString =
        '.test2{color:red}.test3{color:blue} @media only screen and (max-width: 620px) { .notused { color: red; } } ';
      documentEl = '<style>' + cssString + '</style>' + htmlString;
      config.fromElement = 1;
      config.storageManager = { type: 0 };
      fixture.innerHTML = documentEl;
      const editor = grapesjs.init(config);
      const css = editor.getCss({ keepUnusedStyles: true });
      const protCss = editor.getConfig().protectedCss;
      expect(editor.getStyle().length).toEqual(3);
      expect(css).toEqual(
        `${protCss}.test2{color:red;}.test3{color:blue;}@media only screen and (max-width: 620px){.notused{color:red;}}`,
      );
    });

    test('Keep unused css classes/selectors option for init method', () => {
      config.fromElement = 1;
      config.storageManager = { type: 0 };
      fixture.innerHTML = documentEl;
      const editor = grapesjs.init({ ...config, keepUnusedStyles: 1 });
      const css = editor.getCss();
      const protCss = editor.getConfig().protectedCss;
      expect(editor.getStyle().length).toEqual(2);
      expect(css).toEqual(`${protCss}.test2{color:red;}.test3{color:blue;}`);
    });

    describe('Plugins', () => {
      test.skip('Adds new storage as plugin and store data there', (done) => {
        const pluginName = storageId + '-p2';
        grapesjs.plugins.add(pluginName, (e) => e.StorageManager.add(storageId, storageMock));
        config.storageManager.type = storageId;
        config.plugins = [pluginName];
        const editor = grapesjs.init(config);
        editor.setComponents(htmlString);
        editor.store(() => {
          editor.load((data: any) => {
            expect(data.html).toEqual(htmlString);
            done();
          });
        });
      });

      test.skip('Adds a new storage and fetch correctly data from it', async () => {
        fixture.innerHTML = documentEl;
        const styleResult = { color: 'white', display: 'block' };
        const style = [
          {
            selectors: [{ name: 'sclass1' }],
            style: { color: 'green' },
          },
          {
            selectors: [{ name: 'test2' }],
            style: styleResult,
          },
          {
            selectors: [{ name: 'test3' }],
            style: { color: 'black', display: 'block' },
          },
        ];
        storage = {
          css: '* { box-sizing: border-box; } body {margin: 0;}',
          styles: JSON.stringify(style),
          pages: [{}],
        };

        const pluginName = storageId + '-p';
        grapesjs.plugins.add(pluginName, (e) => e.StorageManager.add(storageId, storageMock));
        config.fromElement = true;
        config.storageManager.type = storageId;
        config.plugins = [pluginName];
        config.storageManager.autoload = 1;
        const editor = grapesjs.init(config);
        const cc = editor.CssComposer;
        expect(cc.getAll().length).toEqual(style.length);
        expect(cc.getClassRule('test2')!.getStyle()).toEqual(styleResult);
      });

      test('Execute plugins with custom options', () => {
        const pluginName = storageId + '-plugin-opts';
        grapesjs.plugins.add(pluginName, (edt, opts) => {
          var opts = opts || {};
          edt.getModel().set('customValue', opts.cVal || '');
        });
        config.plugins = [pluginName];
        config.pluginsOpts = {};
        config.pluginsOpts[pluginName] = { cVal: 'TEST' };
        const editor = grapesjs.init(config);
        expect(editor.getModel().get('customValue')).toEqual('TEST');
      });

      test('Execute inline plugins with custom options', () => {
        const inlinePlugin: Plugin<any> = (edt, opts) => {
          var opts = opts || {};
          edt.getModel().set('customValue', opts.cVal || '');
        };
        config.plugins = [inlinePlugin];
        config.pluginsOpts = {};
        config.pluginsOpts[inlinePlugin.toString()] = { cVal: 'TEST' };
        var editor = grapesjs.init(config);
        expect(editor.getModel().get('customValue')).toEqual('TEST');
      });

      test('Execute inline plugins without any options', () => {
        const inlinePlugin: Plugin = (edt) => {
          edt.getModel().set('customValue', 'TEST');
        };
        config.plugins = [inlinePlugin];
        config.pluginsOpts = {};
        var editor = grapesjs.init(config);
        expect(editor.getModel().get('customValue')).toEqual('TEST');
      });

      test('Use plugins defined on window, with custom options', () => {
        const plg: Plugin<any> = (edt, opts) => {
          var opts = opts || {};
          edt.getModel().set('customValue', opts.cVal || '');
        };
        (window as any).globalPlugin = plg;
        config.plugins = ['globalPlugin'];
        config.pluginsOpts = {};
        config.pluginsOpts['globalPlugin'] = { cVal: 'TEST' };
        var editor = grapesjs.init(config);
        expect(editor.getModel().get('customValue')).toEqual('TEST');
      });

      // Problems with iframe loading
      test('Init new editor with custom plugin overrides default commands', () => {
        var editor,
          pluginName = 'test-plugin-opts';

        grapesjs.plugins.add(pluginName, (edt, opts) => {
          let cmdm = edt.Commands;
          // Overwrite export template
          cmdm.add('export-template', { test: 1 });
        });
        config.plugins = [pluginName];

        editor = grapesjs.init(config);
        expect(editor.Commands.get('export-template')!.test).toEqual(1);
      });

      describe('usePlugin', () => {
        test('Execute named plugin from PluginManager', () => {
          let varToTest = '';
          const optionValue = 'TEST-PM';
          const pluginName = 'testplugin';
          grapesjs.plugins.add(pluginName, (edt, opts = {}) => {
            varToTest = opts.cVal || '';
          });
          grapesjs.init({
            ...config,
            plugins: [usePlugin(pluginName, { cVal: optionValue })],
          });
          expect(varToTest).toEqual(optionValue);
        });

        test('Execute inline plugin', () => {
          let varToTest = '';
          const optionValue = 'TEST-inline';
          const inlinePlugin: TestPlugin = (edt, opts) => {
            varToTest = opts.cVal;
          };
          grapesjs.init({
            ...config,
            plugins: [usePlugin(inlinePlugin, { cVal: optionValue })],
          });
          expect(varToTest).toEqual(optionValue);
        });

        test('Execute global plugin', () => {
          let varToTest = '';
          const optionValue = 'TEST-global';
          const pluginName = 'globalPlugin';
          const plg: Plugin<any> = (edt, opts) => {
            varToTest = opts.cVal;
          };
          (window as any)[pluginName] = plg;
          grapesjs.init({
            ...config,
            plugins: [usePlugin(pluginName, { cVal: optionValue })],
          });
          expect(varToTest).toEqual(optionValue);
        });
      });
    });

    describe.skip('Component selection', () => {
      let editor: Editor;
      let wrapper: ComponentWrapper;
      let el1: Component;
      let el2: Component;
      let el3: Component;

      beforeEach(() => {
        config.storageManager = { type: 0 };
        config.components = `<div>
          <div id="el1"></div>
          <div id="el2"></div>
          <div id="el3"></div>
        </div>`;
        editor = grapesjs.init(config);
        wrapper = editor.DomComponents.getWrapper()!;
        el1 = wrapper.find('#el1')[0];
        el2 = wrapper.find('#el2')[0];
        el3 = wrapper.find('#el3')[0];
      });

      test('Select a single component', () => {
        expect(editor.getSelected()).toBeFalsy();
        expect(editor.getSelectedAll().length).toBe(0);
        // Select via component
        editor.select(el1);
        expect(editor.getSelected()).toBe(el1);
        expect(editor.getSelectedAll().length).toBe(1);
        editor.select(el2);
        expect(editor.getSelected()).toBe(el2);
        expect(editor.getSelectedAll().length).toBe(1);
        // Deselect via empty array
        editor.select([]);
        expect(editor.getSelected()).toBeFalsy();
        expect(editor.getSelectedAll().length).toBe(0);
      });

      test('Deselect component', () => {
        editor.select(el1);
        expect(editor.getSelected()).toBe(el1);
        expect(editor.getSelectedAll().length).toBe(1);
        // Deselect with undefined
        editor.select();
        expect(editor.getSelected()).toBe(undefined);
        expect(editor.getSelectedAll().length).toBe(0);
      });

      test('Select multiple components', () => {
        // Select at first el1 and el3
        editor.select([el1, el3]);
        expect(editor.getSelected()).toBe(el3);
        expect(editor.getSelectedAll().length).toBe(2);
        // Add el2
        editor.selectAdd(el2);
        expect(editor.getSelected()).toBe(el2);
        expect(editor.getSelectedAll().length).toBe(3);
        // Remove el1
        editor.selectRemove(el1);
        expect(editor.getSelected()).toBe(el2);
        expect(editor.getSelectedAll().length).toBe(2);
        // Add el1 via toggle
        editor.selectToggle(el1);
        expect(editor.getSelected()).toBe(el1);
        expect(editor.getSelectedAll().length).toBe(3);
        // Leave selected only el3
        editor.selectRemove([el1, el2]);
        expect(editor.getSelected()).toBe(el3);
        expect(editor.getSelectedAll().length).toBe(1);
        // Toggle all
        editor.selectToggle([el1, el2, el3]);
        expect(editor.getSelected()).toBe(el2);
        expect(editor.getSelectedAll().length).toBe(2);
        // Add multiple
        editor.selectAdd([el2, el3]);
        expect(editor.getSelected()).toBe(el3);
        expect(editor.getSelectedAll().length).toBe(3);
      });

      test('Selection events', () => {
        const toSpy = {
          selected() {},
          deselected() {},
          toggled() {},
        };
        const selected = jest.spyOn(toSpy, 'selected');
        const deselected = jest.spyOn(toSpy, 'deselected');
        const toggled = jest.spyOn(toSpy, 'toggled');
        editor.on('component:selected', selected as any);
        editor.on('component:deselected', deselected as any);
        editor.on('component:toggled', toggled as any);

        editor.select(el1); // selected=1
        editor.selectAdd(el1); // selected=1
        editor.selectAdd([el2, el3]); // selected=3
        editor.selectToggle([el1, el3]); // deselected=2
        editor.selectRemove(el2); // deselected=3
        editor.select(el1); // selected=4

        expect(selected).toHaveBeenCalledTimes(4);
        expect(deselected).toHaveBeenCalledTimes(3);
        expect(toggled).toHaveBeenCalledTimes(7);
      });
    });
  });
});
