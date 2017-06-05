const DomComponents = require('dom_components');
const ComponentModels = require('./model/Component');
const ComponentView = require('./view/ComponentV');
const ComponentsView = require('./view/ComponentsView');
const ComponentTextView = require('./view/ComponentTextView');
const ComponentImageView = require('./view/ComponentImageView');
const utils = require('./../test_utils.js');

describe('DOM Components', function() {

  describe('Main', function() {

    var obj;
    var config;
    var storagMock = utils.storageMock();
    var editorModel = {
      config: {
        loadCompsOnRender: 0,
      },
      get: function(){return;},
      getHtml: function(){return 'testHtml';},
      getComponents: function(){return {test: 1};},
      getCacheLoad: function(){
        return storagMock.load();
      }
    };
    // Methods
    var setSmConfig = function(){
      config.stm = storagMock;
      config.stm.getConfig =  function(){
        return {
          storeHtml: 1,
          storeComponents: 1,
        }
      };
    };
    var setEm = function(){
      config.em = editorModel;
    }


    beforeEach(function () {
      config = {};
      obj = new DomComponents().init(config);
    });

    afterEach(function () {
      obj = null;
    });

    it('Object exists', function() {
      expect(DomComponents).toExist();
    });

    it('storageKey returns array', function() {
      expect(obj.storageKey() instanceof Array).toEqual(true);
    });

    it('storageKey returns correct composition', function() {
      config.stm = {
        getConfig: function(){
          return {
            storeHtml: 1,
            storeComponents: 1,
          }
        }
      };
      expect(obj.storageKey()).toEqual(['html', 'components']);
    });

    it('Store data', function() {
      setSmConfig();
      setEm();
      var expected = {
        html: 'testHtml',
        components: '{"test":1}',
      };
      expect(obj.store(1)).toEqual(expected);
    });

    it('Store and load data', function() {
      setSmConfig();
      setEm();
      obj.store();
      expect(obj.load()).toEqual({test: 1});
    });

    it('Wrapper exists', function() {
      expect(obj.getWrapper()).toExist();
    });

    it('No components inside', function() {
      expect(obj.getComponents().length).toEqual(0);
    });

    it('Add new component', function() {
      var comp = obj.addComponent({});
      expect(obj.getComponents().length).toEqual(1);
    });

    it('Add more components at once', function() {
      var comp = obj.addComponent([{},{}]);
      expect(obj.getComponents().length).toEqual(2);
    });

    it('Render wrapper', function() {
      expect(obj.render()).toExist();
    });
  });

  ComponentModels.run();
  ComponentView.run();
  ComponentsView.run();
  ComponentTextView.run();
  ComponentImageView.run();

});
