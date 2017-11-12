var SelectorManager = require('selector_manager');
var Selector = require('selector_manager/model/Selector');
var Models = require('./model/SelectorModels');
var ClassTagView = require('./view/ClassTagView');
var ClassTagsView = require('./view/ClassTagsView');
var e2e = require('./e2e/ClassManager');
var Editor = require('editor/model/Editor');

describe('SelectorManager', () => {

  describe('Main', () => {

    var obj;
    let em;

    beforeEach(() => {
      em = new Editor({});
      obj = new SelectorManager().init({em});
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
      expect(obj.get('test').get('type')).toEqual(obj.Selector.TYPE_CLASS);
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

    it('addClass single class string', () => {
      const result = obj.addClass('class1');
      expect(result.length).toEqual(1);
      expect(result[0] instanceof Selector).toEqual(true);
      expect(result[0].get('name')).toEqual('class1');
    });

    it('addClass multiple class string', () => {
      const result = obj.addClass('class1 class2');
      expect(result.length).toEqual(2);
      expect(obj.getAll().length).toEqual(2);
    });

    it('addClass single class array', () => {
      const result = obj.addClass(['class1']);
      expect(result.length).toEqual(1);
    });

    it('addClass multiple class array', () => {
      const result = obj.addClass(['class1', 'class2']);
      expect(result.length).toEqual(2);
    });

    it('addClass Avoid same name classes', () => {
      obj.addClass('class1');
      const result = obj.addClass('class1');
      expect(obj.getAll().length).toEqual(1);
      expect(result.length).toEqual(1);
    });

  });

  Models.run();

  describe('Views', () => {
    ClassTagView.run();
    ClassTagsView.run();
    e2e.run();
  });

});
