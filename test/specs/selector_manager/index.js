var SelectorManager = require('selector_manager');
var Models = require('./model/SelectorModels');
var ClassTagView = require('./view/ClassTagView');
var ClassTagsView = require('./view/ClassTagsView');
var e2e = require('./e2e/ClassManager');

describe('SelectorManager', () => {

  describe('Main', () => {

    var obj;

    beforeEach(() => {
      obj = new SelectorManager().init();
    });

    afterEach(() => {
      obj = null;
    });

    it('Object exists', () => {
      expect(obj).toExist();
    });

    it('No selectors inside', () => {
      expect(obj.getAll().length).toEqual(0);
    });

    it('Able to add default selectors', () => {
      var cm = new SelectorManager().init({
        selectors: ['test1', 'test2', 'test3'],
      });
      expect(cm.getAll().length).toEqual(3);
    });

    it('Add new selector', () => {
      obj.add('test');
      expect(obj.getAll().length).toEqual(1);
    });

    it('Default new selector is a class type', () => {
      obj.add('test');
      expect(obj.get('test').get('type')).toEqual('class');
    });

    it('Check name property', () => {
      var name = 'test';
      var sel = obj.add(name);
      expect(sel.get('name')).toEqual(name);
      expect(sel.get('label')).toEqual(name);
    });

    it('Add 2 selectors', () => {
      obj.add('test');
      obj.add('test2');
      expect(obj.getAll().length).toEqual(2);
    });

    it('Adding 2 selectors with the same name is not possible', () => {
      obj.add('test');
      obj.add('test');
      expect(obj.getAll().length).toEqual(1);
    });

    it('Get selector', () => {
      var name = 'test';
      var sel = obj.add(name);
      expect(obj.get(name)).toEqual(sel);
    });

    it('Get empty class', () => {
      expect(obj.get('test')).toEqual(undefined);
    });

  });

  Models.run();
  ClassTagView.run();
  ClassTagsView.run();
  e2e.run();

});
