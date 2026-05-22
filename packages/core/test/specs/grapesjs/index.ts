import grapesjs, { Component, Editor, usePlugin } from '../../../src';
import CssRule from '../../../src/css_composer/model/CssRule';
import ComponentWrapper from '../../../src/dom_components/model/ComponentWrapper';
import { EditorConfig } from '../../../src/editor/config/config';
import PluginsEvents, { Plugin } from '../../../src/plugin_manager/types';
import { StorageManagerConfig } from '../../../src/storage_manager/config/config';
import { fixJsDom, fixJsDomIframe, waitEditorEvent } from '../../common';

type TestPlugin = Plugin<{ cVal: string }>;

describe('GrapesJS', () => {
  describe('Main', () => {
    let fixture: HTMLElement;
    let editorName = '';
    let htmlString = '';
    let config: Partial<EditorConfig>;
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

    const initTestEditor = (config: Partial<EditorConfig>) => {
      const editor = grapesjs.init({
        ...config,
        plugins: [fixJsDom, ...(config.plugins || [])],
      });
      fixJsDomIframe(editor.getModel().shallow);

      return editor;
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
          autoload: false,
          autosave: false,
          type: '',
        },
      };
      document.body.innerHTML = `<div id="fixtures"><div id="${editorName}"></div></div>`;
      fixture = document.body.querySelector(`#${editorName}`)!;
    });

    afterEach(() => {
      grapesjs.plugins.clear();
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

    test('Editor canvas baseCSS can be overwritten', (done) => {
      config.components = htmlString;
      config.baseCss = '#wrapper { background-color: #eee; }';
      config.protectedCss = '';
      const editor = initTestEditor({
        ...config,
        components: htmlString,
        baseCss: '#wrapper { background-color: #eee; }',
        protectedCss: '',
      });
      editor.onReady(() => {
        const body = editor.Canvas.getBody();
        expect(body.outerHTML).toContain(config.baseCss);
        expect(body.outerHTML.replace(/\s+/g, ' ')).not.toContain('body { margin: 0;');
        done();
      });
    });

    test('Editor canvas baseCSS defaults to sensible values if not defined', (done) => {
      config.components = htmlString;
      config.protectedCss = '';
      const editor = initTestEditor(config);
      editor.onReady(() => {
        const htmlEl = editor.Canvas.getDocument()?.documentElement;
        expect(htmlEl?.outerHTML.replace(/\s+/g, ' ')).toContain('body { background-color: #fff');
        done();
      });
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
      config.fromElement = true;
      config.storageManager = false;
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
      config.fromElement = true;
      config.storageManager = false;
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
      const events = editor.Commands.events;
      editor.on(`${events.run}:${id}`, () => {
        expect(editor.Commands.isActive(id)).toBe(true);
        result.run = 1;
      });
      editor.on(`${events.runBeforeCommand}${id}`, () => (result.runBefore = 1));
      editor.on(`${events.stop}:${id}`, () => {
        expect(editor.Commands.isActive(id)).toBe(false);
        result.stop = 1;
      });
      editor.on(`${events.stopBeforeCommand}${id}`, () => (result.stopBefore = 1));
      editor.on(`${events.abort}${id}`, () => (result.abort = 1));
      editor.Commands.add(id, {
        run() {},
        stop() {},
      });
      editor.runCommand(id);
      editor.stopCommand(id);
      editor.on(`${events.runBeforeCommand}${id}`, ({ options }) => (options.abort = 1));
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
      config.fromElement = true;
      config.storageManager = false;
      fixture.innerHTML = documentEl;
      const editor = grapesjs.init(config);
      const css = editor.getCss({ keepUnusedStyles: true });
      const protCss = editor.getConfig().protectedCss;
      expect(editor.getStyle().length).toEqual(2);
      expect(css).toEqual(`${protCss}.test2{color:red;}.test3{color:blue;}`);
    });

    test('Allow empty css rules option for getCSS method', () => {
      config.components = '<div class="test-empty"></div>';
      config.style = '.test-empty{}';
      const editor = grapesjs.init(config);
      const protCss = editor.getConfig().protectedCss;

      expect(editor.getStyle().length).toEqual(1);
      expect(editor.getCss()).toEqual(protCss);
      expect(editor.getCss({ allowEmpty: true })).toEqual(`${protCss}.test-empty{}`);
    });

    test('Allow empty css rules option for media rules', () => {
      config.components = '<div class="test-empty"></div>';
      config.style = '@media (max-width: 992px){.test-empty{}}';
      const editor = grapesjs.init(config);
      const protCss = editor.getConfig().protectedCss;

      expect(editor.getStyle().length).toEqual(1);
      expect(editor.getCss({ allowEmpty: true })).toEqual(`${protCss}@media (max-width: 992px){.test-empty{}}`);
    });

    test('Allow empty css rules option with keepUnusedStyles', () => {
      config.components = '<div></div>';
      config.style = '.test-empty{}';
      const editor = grapesjs.init(config);
      const protCss = editor.getConfig().protectedCss;

      expect(editor.getStyle().length).toEqual(1);
      expect(editor.getCss({ allowEmpty: true })).toEqual(protCss);
      expect(editor.getCss({ allowEmpty: true, keepUnusedStyles: true })).toEqual(`${protCss}.test-empty{}`);
    });

    test('Allow nested css rules option for getCSS method', () => {
      config.components = '<div class="foo"></div><div class="baz"></div>';
      const editor = grapesjs.init(config);
      const rule = editor.Css.setRule('.foo', {
        color: 'green',
        '.bar': {
          color: 'red',
        },
      });
      const rule2 = editor.Css.setRule('.baz', {
        color: 'blue',
        '.bar': {
          color: 'yellow',
        },
      });
      const nested = rule.getStyle('.bar', { withNested: true }) as CssRule;
      const nested2 = rule2.getStyle('.bar', { withNested: true }) as CssRule;
      const protCss = editor.getConfig().protectedCss;

      expect(editor.Css.getAll().length).toEqual(4);
      expect(nested.isNested()).toBe(true);
      expect(nested2.isNested()).toBe(true);
      expect(nested).not.toBe(nested2);
      expect(editor.getCss()).toEqual(`${protCss}.foo{color:green;}.baz{color:blue;}`);
      expect(editor.getCss({ withNested: true })).toEqual(
        `${protCss}.foo{color:green;.bar{color:red;}}.baz{color:blue;.bar{color:yellow;}}`,
      );
    });

    test('Nested css rules option from config optsCss', () => {
      config.components = '<div class="foo"></div>';
      config.optsCss = { withNested: true };
      const editor = grapesjs.init(config);
      editor.Css.setRule('.foo', {
        color: 'green',
        '.bar': {
          color: 'red',
        },
      });
      const protCss = editor.getConfig().protectedCss;

      expect(editor.getCss()).toEqual(`${protCss}.foo{color:green;.bar{color:red;}}`);
    });

    test('Allow multiple nested css rules for the same parent rule', () => {
      config.components = '<div class="foo"></div>';
      const editor = grapesjs.init(config);
      const rule = editor.Css.setRule('.foo', {
        color: 'green',
        '.bar': {
          color: 'red',
        },
        '.baz': {
          color: 'blue',
        },
      });
      const nestedBar = rule.getStyle('.bar', { withNested: true }) as CssRule;
      const nestedBaz = rule.getStyle('.baz', { withNested: true }) as CssRule;
      const protCss = editor.getConfig().protectedCss;

      expect(editor.Css.getAll().length).toEqual(3);
      expect(nestedBar.isNested()).toBe(true);
      expect(nestedBaz.isNested()).toBe(true);
      expect(nestedBar).not.toBe(nestedBaz);
      expect(editor.getCss({ withNested: true })).toEqual(
        `${protCss}.foo{color:green;.bar{color:red;}.baz{color:blue;}}`,
      );
    });

    test('Allow deep nested css rules', () => {
      config.components = '<div class="foo"></div>';
      const editor = grapesjs.init(config);
      const rule = editor.Css.setRule('.foo', {
        color: 'green',
        '.bar': {
          color: 'red',
          '.baz': {
            color: 'blue',
          },
        },
      });
      const nestedBar = rule.getStyle('.bar', { withNested: true }) as CssRule;
      const nestedBaz = nestedBar.getStyle('.baz', { withNested: true }) as CssRule;
      const protCss = editor.getConfig().protectedCss;

      expect(editor.Css.getAll().length).toEqual(3);
      expect(nestedBar.isNested()).toBe(true);
      expect(nestedBaz.isNested()).toBe(true);
      expect(nestedBaz.parentRule).toBe(nestedBar);
      expect(editor.getCss({ withNested: true })).toEqual(
        `${protCss}.foo{color:green;.bar{color:red;.baz{color:blue;}}}`,
      );
    });

    test('Nested css rules are stored under parent style', () => {
      config.components = '<div class="foo"></div>';
      const editor = grapesjs.init(config);
      editor.Css.setRule('.foo', {
        color: 'green',
        '.bar': {
          color: 'red',
        },
      });
      const projectData = editor.getProjectData();

      expect(projectData.styles).toHaveLength(1);
      expect(projectData.styles[0].style).toEqual({
        color: 'green',
        '.bar': {
          color: 'red',
        },
      });

      const reloaded = grapesjs.init({ ...config, container: document.createElement('div') });
      reloaded.loadProjectData(projectData);
      expect(reloaded.Css.getAll().length).toEqual(2);
      expect(reloaded.getCss({ withNested: true })).toEqual(
        `${reloaded.getConfig().protectedCss}.foo{color:green;.bar{color:red;}}`,
      );
    });

    test('Nested css rules are removed when parent style is replaced', () => {
      config.components = '<div class="foo"></div>';
      const editor = grapesjs.init(config);
      const rule = editor.Css.setRule('.foo', {
        color: 'green',
        '.bar': {
          color: 'red',
        },
      });
      const protCss = editor.getConfig().protectedCss;

      rule.setStyle({ color: 'blue' });

      expect(editor.Css.getAll().length).toEqual(1);
      expect(editor.getCss({ withNested: true })).toEqual(`${protCss}.foo{color:blue;}`);
    });

    test('Keep unused css classes/selectors option for media rules', () => {
      cssString =
        '.test2{color:red}.test3{color:blue} @media only screen and (max-width: 620px) { .notused { color: red; } } ';
      documentEl = '<style>' + cssString + '</style>' + htmlString;
      config.fromElement = true;
      config.storageManager = false;
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
      config.fromElement = true;
      config.storageManager = false;
      fixture.innerHTML = documentEl;
      const editor = grapesjs.init({ ...config, keepUnusedStyles: true });
      const css = editor.getCss();
      const protCss = editor.getConfig().protectedCss;
      expect(editor.getStyle().length).toEqual(2);
      expect(css).toEqual(`${protCss}.test2{color:red;}.test3{color:blue;}`);
    });

    describe('Plugins', () => {
      let consoleErrorSpy: jest.SpyInstance;

      beforeEach(() => {
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      });

      afterEach(() => {
        consoleErrorSpy.mockRestore();
      });

      test('Adds new storage as plugin and store data there', async () => {
        (config.storageManager as StorageManagerConfig).type = storageId;
        config.plugins = [(e) => e.StorageManager.add(storageId, storageMock)];
        const editor = initTestEditor(config);
        editor.setComponents(htmlString);
        const projectData = editor.getProjectData();
        await editor.store();
        const data = await editor.load();
        expect(data).toEqual(projectData);
      });

      test('Adds a new storage and fetch correctly data from it', async () => {
        fixture.innerHTML = documentEl;
        const styleResult = { color: 'white', display: 'block' };
        const styles = [
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
          styles,
          pages: [{}],
        };
        config.fromElement = true;
        config.plugins = [(e) => e.StorageManager.add(storageId, storageMock)];
        const configStorage = config.storageManager as StorageManagerConfig;
        configStorage.type = storageId;
        configStorage.autoload = true;
        const editor = initTestEditor(config);
        await waitEditorEvent(editor, 'load');
        const { Css } = editor;
        expect(Css.getAll().length).toEqual(styles.length);
        expect(Css.getClassRule('test2')!.getStyle()).toEqual(styleResult);
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

      test('Descriptor plugin requires explicit id and accepts wrapped plugin', () => {
        const inlinePlugin: TestPlugin = (edt, opts) => {
          edt.getModel().set('customValue', opts.cVal);
        };
        const editor = grapesjs.init({
          ...config,
          plugins: [{ id: 'descriptor-plugin', plugin: usePlugin(inlinePlugin, { cVal: 'DESC' }) }],
        });
        const plugin = editor.Plugins.get('descriptor-plugin')!;
        expect(editor.getModel().get('customValue')).toEqual('DESC');
        expect(plugin.get('options')).toEqual({ cVal: 'DESC' });
      });

      test('Plugin id is resolved from __gjsPluginId', () => {
        const inlinePlugin: TestPlugin = () => {};
        inlinePlugin.__gjsPluginId = 'inline-plugin-id';
        const editor = grapesjs.init({
          ...config,
          plugins: [inlinePlugin],
        });

        expect(editor.Plugins.get('inline-plugin-id')).toBeTruthy();
      });

      test('Legacy plugin collector prints deprecation error on add', () => {
        grapesjs.plugins.add('legacy-plugin', () => {});
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      test('Editor-scoped plugin manager stores plugins in the all collection', () => {
        const editor = grapesjs.init({
          ...config,
          plugins: [{ id: 'scoped-plugin', plugin: () => {} }],
        });

        expect(editor.Plugins.all.length).toBe(1);
        expect(editor.Plugins.get('scoped-plugin')).toBe(editor.Plugins.all.at(0));
      });

      test('Editor-scoped plugin manager triggers plugin events', () => {
        const result: string[] = [];
        const editor = grapesjs.init(config);
        editor.on(PluginsEvents.add, (plugin) => result.push(`add:${plugin.id}`));
        editor.on(PluginsEvents.remove, (plugin) => result.push(`remove:${plugin.id}`));
        editor.Plugins.add({ id: 'evt-plugin', plugin: () => {} });
        editor.Plugins.remove('evt-plugin');
        expect(result).toEqual(['add:evt-plugin', 'remove:evt-plugin']);
      });

      test('Plugin manager removes tracked entities on cleanup', () => {
        const editor = grapesjs.init({
          ...config,
          plugins: [
            {
              id: 'cleanup-plugin',
              plugin: (edt) => {
                edt.Blocks.add('cleanup-block', { label: 'Cleanup', content: '<div>cleanup</div>' });
                edt.Components.addType('cleanup-type', { model: { defaults: { tagName: 'div' } } });
              },
            },
          ],
        });

        expect(editor.Blocks.get('cleanup-block')).toBeTruthy();
        expect(editor.Components.getType('cleanup-type')).toBeTruthy();

        editor.Plugins.remove('cleanup-plugin');

        expect(editor.Blocks.get('cleanup-block')).toBeFalsy();
        expect(editor.Components.getType('cleanup-type')).toBeFalsy();
      });

      test('Plugin manager runs custom cleanup once', () => {
        const cleanupSpy = jest.fn();
        const editor = grapesjs.init({
          ...config,
          plugins: [
            {
              id: 'custom-cleanup-plugin',
              plugin: (edt) => {
                edt.Blocks.add('custom-cleanup-block', { label: 'Cleanup', content: '<div>cleanup</div>' });
                return ({ cleanup }) => {
                  cleanup();
                  cleanupSpy();
                };
              },
            },
          ],
        });

        editor.Plugins.remove('custom-cleanup-plugin');

        expect(cleanupSpy).toHaveBeenCalledTimes(1);
        expect(editor.Blocks.get('custom-cleanup-block')).toBeFalsy();
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
        expect((editor.Commands.get('export-template') as any).test).toEqual(1);
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

        test('Execute named plugin from plugin descriptor', () => {
          let varToTest = '';
          const optionValue = 'TEST-DESC';
          const pluginName = 'descriptor-plugin-name';
          grapesjs.plugins.add(pluginName, (edt, opts = {}) => {
            varToTest = opts.cVal || '';
          });
          grapesjs.init({
            ...config,
            plugins: [{ id: pluginName, plugin: usePlugin(pluginName, { cVal: optionValue }) }],
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

    describe('Component selection', () => {
      let editor: Editor;
      let wrapper: ComponentWrapper;
      let el1: Component;
      let el2: Component;
      let el3: Component;

      beforeEach((done) => {
        editor = grapesjs.init({
          container: `#${editorName}`,
          storageManager: false,
          plugins: [fixJsDom],
          components: `<div>
            <div id="el1"></div>
            <div id="el2"></div>
            <div id="el3"></div>
          </div>`,
        });
        fixJsDomIframe(editor.getModel().shallow);
        wrapper = editor.DomComponents.getWrapper()!;
        editor.onReady(() => {
          el1 = wrapper.find('#el1')[0];
          el2 = wrapper.find('#el2')[0];
          el3 = wrapper.find('#el3')[0];
          done();
        });
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
