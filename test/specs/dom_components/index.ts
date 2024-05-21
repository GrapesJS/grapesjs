import Components from '../../../src/dom_components/model/Components';
import EditorModel from '../../../src/editor/model/Editor';
import Editor from '../../../src/editor';
import utils from './../../test_utils.js';
import { Component } from '../../../src';
import ComponentWrapper from '../../../src/dom_components/model/ComponentWrapper';

describe('DOM Components', () => {
  describe('Main', () => {
    var em: EditorModel;
    var obj: EditorModel['Components'];
    var config: any;
    var storagMock = utils.storageMock();
    var editorModel = {
      config: {
        loadCompsOnRender: 0,
      },
      get() {
        return {};
      },
      on() {
        return this;
      },
      listenTo() {
        return this;
      },
      getHtml() {
        return 'testHtml';
      },
      getComponents() {
        return { test: 1 };
      },
      getCacheLoad() {
        return storagMock.load();
      },
    };
    // Methods
    var setSmConfig = () => {
      config.stm = storagMock;
      config.stm.getConfig = () => ({
        storeHtml: 1,
        storeComponents: 1,
      });
    };
    var setEm = () => {
      config.em = editorModel;
    };

    beforeEach(() => {
      const editor = new Editor({
        avoidInlineStyle: true,
      });
      em = editor.getModel();
      em.loadOnStart();
      config = {
        em,
        storeWrapper: 1,
      };
      obj = em.Components;
    });

    afterEach(() => {
      em.destroy();
    });

    test.skip('Store and load data', () => {
      setSmConfig();
      setEm();
      // @ts-ignore
      const comps = new Components({}, {});
      obj.getWrapper()?.set('components', comps);
      obj.store();
      expect(obj.load({})).toEqual([{ test: 1 }]);
    });

    test('Load data with components as a string', () => {
      const result = [{}, {}];
      expect(
        obj.load({
          components: '[{}, {}]',
        })
      ).toEqual(result);
    });

    test('Load data with components as an array', () => {
      const result = [{}, {}];
      expect(
        obj.load({
          components: result,
        })
      ).toEqual(result);
    });

    test('Load data with components as an object', () => {
      const result = {};
      expect(
        obj.load({
          components: result,
        })
      ).toEqual(result);
    });

    test('Wrapper exists', () => {
      expect(obj.getWrapper()).toBeTruthy();
    });

    test('No components inside', () => {
      expect(obj.getComponents().length).toEqual(0);
    });

    test('Add new component', () => {
      obj.addComponent({});
      expect(obj.getComponents().length).toEqual(1);
    });

    test('Add more components at once', () => {
      obj.addComponent([{}, {}]);
      expect(obj.getComponents().length).toEqual(2);
    });

    test('Import propertly components and styles with the same ids', () => {
      obj = em.Components;
      const cc = em.Css;
      const id = 'idtest';
      const component = obj.addComponent(`
      <div id="${id}" style="color:red; padding: 50px 100px">Text</div>
      <style>
        #${id} { background-color: red }
      </style>`) as Component;
      expect(em.getHtml({ component })).toEqual(`<div id="${id}">Text</div>`);
      expect(obj.getComponents().length).toEqual(1);
      const firstComp = obj.getComponents().first();
      firstComp.addStyle({ margin: '10px' });
      firstComp.addStyle('width', '100px');
      expect(cc.getAll().length).toEqual(1);
      expect(cc.getIdRule(id)!.getStyle()).toEqual({
        color: 'red',
        'background-color': 'red',
        padding: '50px 100px',
        margin: '10px',
        width: '100px',
      });
    });

    test('Add new component type with simple model', () => {
      const id = 'test-type';
      const testProp = 'testValue';
      const initialTypes = obj.componentTypes.length;
      obj.addType(id, {
        model: {
          defaults: {
            testProp,
          },
        },
      });
      expect(obj.componentTypes.length).toEqual(initialTypes + 1);
      obj.addComponent(`<div data-gjs-type="${id}"></div>`);
      const comp = obj.getComponents().at(0);
      expect(comp.get('type')).toEqual(id);
      expect(comp.get('testProp')).toEqual(testProp);
    });

    test('Add new component type with custom isComponent', () => {
      const id = 'test-type';
      const testProp = 'testValue';
      obj.addType(id, {
        isComponent: el => {
          return el.getAttribute('test-prop') === testProp;
        },
      });
      expect(obj.componentTypes[0].id).toEqual(id);
      obj.addComponent(`<div test-prop="${testProp}"></div>`);
      const comp = obj.getComponents().at(0);
      expect(comp.get('type')).toEqual(id);
      expect(comp.getAttributes()['test-prop']).toEqual(testProp);
    });

    test('Extend component type with custom model and view', () => {
      const id = 'image';
      const testProp = 'testValue';
      const initialTypes = obj.getTypes().length;
      obj.addType(id, {
        model: {
          defaults: () => ({
            testProp,
          }),
        },
        view: {
          onRender() {
            this.el.style.backgroundColor = 'red';
          },
        },
      });
      expect(obj.getTypes().length).toBe(initialTypes);
      obj.addComponent('<img src="##"/>');
      const comp = obj.getComponents().at(0);
      expect(comp.get('type')).toBe(id);
      expect(comp.get('testProp')).toBe(testProp);
      expect(comp.get('editable')).toBe(1);
    });

    test('Add new component type by extending another one, without isComponent', () => {
      const id = 'test-type';
      const testProp = 'testValue';
      obj.addType(id, {
        extend: 'image',
        model: {
          defaults: {
            testProp,
          },
        },
      });
      obj.addComponent('<img src="##"/>');
      expect(obj.getTypes()[0].id).toEqual(id);
      const comp = obj.getComponents().at(0);
      // I'm not specifying the isComponent
      expect(comp.get('type')).toBe('image');
      expect(comp.get('editable')).toBe(1);
      expect(comp.get('testProp')).toBeFalsy();
    });

    test('Add new component type by extending another one, with custom isComponent', () => {
      const id = 'test-type';
      const testProp = 'testValue';
      obj.addType(id, {
        extend: 'image',
        isComponent: el => el.getAttribute('test-prop') === testProp,
      });
      obj.addComponent(`<img src="##" test-prop="${testProp}"/>`);
      expect(obj.getTypes()[0].id).toEqual(id);
      const comp = obj.getComponents().at(0);
      expect(comp.get('type')).toBe(id);
      expect(comp.get('editable')).toBe(1);
    });

    test('Remove and undo component with styles', done => {
      const id = 'idtest2';
      const um = em.UndoManager;
      const cc = em.Css;
      const component = obj.addComponent(`
      <div id="${id}" style="color:red; padding: 50px 100px">Text</div>
      <style>
        #${id} { background-color: red }
      </style>`) as Component;
      obj.getComponents().first().addStyle({ margin: '10px' });
      const rule = cc.getAll().at(0);
      const css = `#${id}{background-color:red;margin:10px;color:red;padding:50px 100px;}`;
      expect(rule.toCSS()).toEqual(css);

      setTimeout(() => {
        // Undo is committed now
        component.remove();
        expect(obj.getComponents().length).toBe(0);
        expect(cc.getAll().length).toBe(0);
        um.undo();

        expect(obj.getComponents().length).toBe(1);
        expect(cc.getAll().length).toBe(1);
        expect(obj.getComponents().at(0)).toBe(component);
        expect(cc.getAll().at(0)).toBe(rule);

        expect(em.getHtml({ component })).toEqual(`<div id="${id}">Text</div>`);
        expect(rule.toCSS()).toEqual(css);

        done();
      }, 20);
    });

    describe('Custom components with styles', () => {
      const cmpId = 'cmp-with-style';

      beforeEach(() => {
        obj.addType(cmpId, {
          model: {
            defaults: {
              attributes: { class: cmpId },
              styles: `
                .${cmpId} {
                  color: red;
                }
              `,
            },
          },
        });
      });

      test('Custom style properly added', () => {
        const cmp = obj.addComponent({ type: cmpId }) as Component;
        expect(cmp.is(cmpId)).toBe(true);
        const rule = em.Css.getRule(`.${cmpId}`);
        expect(rule?.getStyle()).toEqual({ color: 'red' });
      });

      test('Clean custom style when the related component is removed', () => {
        const cmp = obj.addComponent({ type: cmpId }) as Component;
        expect(obj.getComponents().length).toBe(1);
        expect(em.Css.getAll().length).toBe(1);
        cmp.remove();
        expect(obj.getComponents().length).toBe(0);
        expect(em.Css.getAll().length).toBe(0);
      });

      test('Custom style is not updated if already exists', () => {
        obj.addComponent({ type: cmpId });
        const rule = em.Css.getRule(`.${cmpId}`)!;
        const newStyle = { color: 'blue', 'font-size': '20px' };
        rule.addStyle(newStyle);
        expect(rule.getStyle()).toEqual(newStyle);
        obj.addComponent({ type: cmpId });
        expect(obj.getComponents().length).toBe(2);
        expect(em.Css.getAll().length).toBe(1);
        expect(rule.getStyle()).toEqual(newStyle);
      });
    });
  });

  describe('Rendered components', () => {
    let editor: Editor;
    let em: EditorModel;
    let fxt: HTMLElement;
    let root: ComponentWrapper;

    beforeEach(done => {
      fxt = document.createElement('div');
      document.body.appendChild(fxt);
      editor = new Editor({
        el: fxt,
        avoidInlineStyle: true,
        storageManager: false,
      });
      em = editor.getModel();
      fxt.appendChild(em.Canvas.render());
      em.loadOnStart();
      editor.on('change:ready', () => {
        root = editor.Components.getWrapper()!;
        done();
      });
    });

    afterEach(() => {
      editor.destroy();
    });

    describe('render components with asDocument', () => {
      const docHtml = `
        <!DOCTYPE html>
        <html lang="en" class="cls-html" data-gjs-htmlp="true">
          <head class="cls-head" data-gjs-headp="true">
            <meta charset="utf-8">
            <title>Test</title>
            <link rel="stylesheet" href="/noop.css">
            <!-- comment -->
          </head>
          <body class="cls-body" data-gjs-bodyp="true">
            <h1>H1</h1>
          </body>
        </html>
      `;

      test('initial setup', () => {
        expect(root.head.components().length).toBe(0);
        expect(root.get('doctype')).toBe('');
      });

      test('import HTML document without option', () => {
        root.components(docHtml);
        expect(root.head.components().length).toBe(0);
        expect(root.get('doctype')).toBe('');
      });

      test('import HTML document with asDocument', () => {
        root.components(docHtml, { asDocument: true });
        const { head, docEl } = root;
        expect(head.components().length).toBe(4);
        expect(head.get('headp')).toBe(true);
        expect(docEl.get('htmlp')).toBe(true);
        expect(root.get('bodyp')).toBe(true);
        expect(root.doctype).toBe('<!DOCTYPE html>');

        const outputHtml = `
          <!DOCTYPE html>
          <html lang="en" class="cls-html">
            <head class="cls-head">
              <meta charset="utf-8"/>
              <title>Test</title>
              <link rel="stylesheet" href="/noop.css"/>
              <!-- comment -->
            </head>
            <body class="cls-body">
              <h1>H1</h1>
            </body>
          </html>
          `.replace(/>\s+|\s+</g, m => m.trim());
        expect(root.toHTML()).toBe(outputHtml);
      });
    });
  });
});
