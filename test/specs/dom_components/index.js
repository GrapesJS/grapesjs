import DomComponents from 'dom_components';
import Components from 'dom_components/model/Components';
import Editor from 'editor/model/Editor';
import utils from './../../test_utils.js';

describe('DOM Components', () => {
  describe('Main', () => {
    var em;
    var obj;
    var config;
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
      em = new Editor({
        avoidInlineStyle: 1,
      });
      em.loadOnStart();
      config = {
        em,
        storeWrapper: 1,
      };
      obj = em.get('DomComponents');
      // obj = new DomComponents(em).init(config);
    });
    afterEach(() => {
      obj = null;
    });

    test('Object exists', () => {
      expect(DomComponents).toBeTruthy();
    });

    test.skip('Store and load data', () => {
      setSmConfig();
      setEm();
      const comps = new Components({}, {});
      obj.getWrapper().set('components', comps);
      obj.store();
      expect(obj.load()).toEqual([{ test: 1 }]);
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
      var comp = obj.addComponent({});
      expect(obj.getComponents().length).toEqual(1);
    });

    test('Add more components at once', () => {
      var comp = obj.addComponent([{}, {}]);
      expect(obj.getComponents().length).toEqual(2);
    });

    test('Import propertly components and styles with the same ids', () => {
      obj = em.get('DomComponents');
      const cc = em.get('CssComposer');
      const id = 'idtest';
      const component = obj.addComponent(`
      <div id="${id}" style="color:red; padding: 50px 100px">Text</div>
      <style>
        #${id} { background-color: red }
      </style>`);
      expect(em.getHtml({ component })).toEqual(`<div id="${id}">Text</div>`);
      expect(obj.getComponents().length).toEqual(1);
      obj.getComponents().first().addStyle({ margin: '10px' });
      expect(cc.getAll().length).toEqual(1);
      expect(cc.getIdRule(id).getStyle()).toEqual({
        color: 'red',
        'background-color': 'red',
        padding: '50px 100px',
        margin: '10px',
      });
    });

    test('Add new component type with simple model', () => {
      obj = em.get('DomComponents');
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
      obj = em.get('DomComponents');
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
      obj = em.get('DomComponents');
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
      obj = em.get('DomComponents');
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
      obj = em.get('DomComponents');
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
      const um = em.get('UndoManager');
      const cc = em.get('CssComposer');
      const component = obj.addComponent(`
      <div id="${id}" style="color:red; padding: 50px 100px">Text</div>
      <style>
        #${id} { background-color: red }
      </style>`);
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
      });
    });
  });
});
