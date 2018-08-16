const DomComponents = require('dom_components');
const Components = require('dom_components/model/Components');
const ComponentModels = require('./model/Component');
const ComponentView = require('./view/ComponentV');
const ComponentsView = require('./view/ComponentsView');
const ComponentTextView = require('./view/ComponentTextView');
const ComponentImageView = require('./view/ComponentImageView');
const Editor = require('editor/model/Editor');
const utils = require('./../test_utils.js');

describe('DOM Components', () => {
  describe('Main', () => {
    var em;
    var obj;
    var config;
    var storagMock = utils.storageMock();
    var editorModel = {
      config: {
        loadCompsOnRender: 0
      },
      get() {
        return;
      },
      getHtml() {
        return 'testHtml';
      },
      getComponents() {
        return { test: 1 };
      },
      getCacheLoad() {
        return storagMock.load();
      }
    };
    // Methods
    var setSmConfig = () => {
      config.stm = storagMock;
      config.stm.getConfig = () => ({
        storeHtml: 1,
        storeComponents: 1
      });
    };
    var setEm = () => {
      config.em = editorModel;
    };

    beforeEach(() => {
      em = new Editor({
        avoidInlineStyle: 1
      });
      config = {
        em,
        storeWrapper: 1
      };
      obj = new DomComponents().init(config);
    });

    afterEach(() => {
      obj = null;
    });

    test('Object exists', () => {
      expect(DomComponents).toBeTruthy();
    });

    test('storageKey returns array', () => {
      expect(obj.storageKey() instanceof Array).toEqual(true);
    });

    test('storageKey returns correct composition', () => {
      config.stm = {
        getConfig() {
          return {
            storeHtml: 1,
            storeComponents: 1
          };
        }
      };
      expect(obj.storageKey()).toEqual(['html', 'components']);
    });

    test('Store data', () => {
      setSmConfig();
      setEm();
      //obj.getWrapper().get('components').add({});
      var expected = {
        html: 'testHtml',
        components: JSON.stringify(obj.getWrapper())
      };
      expect(obj.store(1)).toEqual(expected);
    });

    test.skip('Store and load data', () => {
      setSmConfig();
      setEm();
      const comps = new Components({}, {});
      obj.getWrapper().set('components', comps);
      obj.store();
      expect(obj.load()).toEqual([{ test: 1 }]);
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

    test('Render wrapper', () => {
      expect(obj.render()).toBeTruthy();
    });

    test('Import propertly components and styles with the same ids', () => {
      obj = em.get('DomComponents');
      const cc = em.get('CssComposer');
      const id = 'idtest';
      const comp = obj.addComponent(`
      <div id="${id}" style="color:red; padding: 50px 100px">Text</div>
      <style>
        #${id} { background-color: red }
      </style>`);
      expect(em.getHtml()).toEqual(`<div id="${id}">Text</div>`);
      expect(obj.getComponents().length).toEqual(1);
      obj
        .getComponents()
        .first()
        .addStyle({ margin: '10px' });
      expect(cc.getAll().length).toEqual(1);
      expect(cc.getIdRule(id).getStyle()).toEqual({
        color: 'red',
        'background-color': 'red',
        padding: '50px 100px',
        margin: '10px'
      });
    });
  });

  ComponentModels.run();

  describe('Views', () => {
    ComponentView.run();
    ComponentsView.run();
    ComponentTextView.run();
    ComponentImageView.run();
  });
});
