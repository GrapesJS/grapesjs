const DomComponents = require('dom_components');
const ComponentModels = require('./model/Component');
const ComponentView = require('./view/ComponentV');
const ComponentsView = require('./view/ComponentsView');
const ComponentTextView = require('./view/ComponentTextView');
const ComponentImageView = require('./view/ComponentImageView');
const utils = require('./../test_utils.js');

describe('DOM Components', () => {

  describe('Main', () => {

    var obj;
    var config;
    var storagMock = utils.storageMock();
    var editorModel = {
      config: {
        loadCompsOnRender: 0,
      },
      get() {return;},
      getHtml() {return 'testHtml';},
      getComponents() {return {test: 1};},
      getCacheLoad() {
        return storagMock.load();
      }
    };
    // Methods
    var setSmConfig = () => {
      config.stm = storagMock;
      config.stm.getConfig =  () => ({
        storeHtml: 1,
        storeComponents: 1
      });
    };
    var setEm = () => {
      config.em = editorModel;
    }


    beforeEach(() => {
      config = {};
      obj = new DomComponents().init(config);
    });

    afterEach(() => {
      obj = null;
    });

    it('Object exists', () => {
      expect(DomComponents).toExist();
    });

    it('storageKey returns array', () => {
      expect(obj.storageKey() instanceof Array).toEqual(true);
    });

    it('storageKey returns correct composition', () => {
      config.stm = {
        getConfig() {
          return {
            storeHtml: 1,
            storeComponents: 1,
          }
        }
      };
      expect(obj.storageKey()).toEqual(['html', 'components']);
    });

    it('Store data', () => {
      setSmConfig();
      setEm();
      var expected = {
        html: 'testHtml',
        components: '{"test":1}',
      };
      expect(obj.store(1)).toEqual(expected);
    });

    it('Store and load data', () => {
      setSmConfig();
      setEm();
      obj.store();
      expect(obj.load()).toEqual({test: 1});
    });

    it('Wrapper exists', () => {
      expect(obj.getWrapper()).toExist();
    });

    it('No components inside', () => {
      expect(obj.getComponents().length).toEqual(0);
    });

    it('Add new component', () => {
      var comp = obj.addComponent({});
      expect(obj.getComponents().length).toEqual(1);
    });

    it('Add more components at once', () => {
      var comp = obj.addComponent([{},{}]);
      expect(obj.getComponents().length).toEqual(2);
    });

    it('Render wrapper', () => {
      expect(obj.render()).toExist();
    });
  });

  ComponentModels.run();
  ComponentView.run();
  ComponentsView.run();
  ComponentTextView.run();
  ComponentImageView.run();

});
