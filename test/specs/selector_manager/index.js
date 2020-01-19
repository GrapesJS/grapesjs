import SelectorManager from 'selector_manager';
import Selector from 'selector_manager/model/Selector';
import Editor from 'editor/model/Editor';

describe('SelectorManager', () => {
  describe('Main', () => {
    var obj;
    let em;

    beforeEach(() => {
      em = new Editor({});
      obj = new SelectorManager().init({ em });
    });

    afterEach(() => {
      obj = null;
    });

    test('Object exists', () => {
      expect(obj).toBeTruthy();
    });

    test('No selectors inside', () => {
      expect(obj.getAll().length).toEqual(0);
    });

    test('Able to add default selectors', () => {
      var cm = new SelectorManager().init({
        em,
        selectors: ['test1', 'test2', 'test3']
      });
      expect(cm.getAll().length).toEqual(3);
    });

    test('Add new selector', () => {
      obj.add('test');
      expect(obj.getAll().length).toEqual(1);
    });

    test('Default new selector is a class type', () => {
      obj.add('test');
      expect(obj.get('test').get('type')).toEqual(obj.Selector.TYPE_CLASS);
    });

    test('Add a selector as an id', () => {
      const name = 'test';
      var sel = obj.add(`#${name}`);
      expect(sel.get('name')).toEqual(name);
      expect(sel.get('label')).toEqual(name);
      expect(obj.get(`#${name}`).get('type')).toEqual(obj.Selector.TYPE_ID);
    });

    test('Check name property', () => {
      var name = 'test';
      var sel = obj.add(name);
      expect(sel.get('name')).toEqual(name);
      expect(sel.get('label')).toEqual(name);
    });

    test('Check name property by adding as class', () => {
      var name = 'test';
      var sel = obj.add(`.${name}`);
      expect(sel.get('name')).toEqual(name);
      expect(sel.get('label')).toEqual(name);
    });

    test('Add 2 selectors', () => {
      obj.add('test');
      obj.add('test2');
      expect(obj.getAll().length).toEqual(2);
    });

    test('Adding 2 selectors with the same name is not possible', () => {
      obj.add('test');
      obj.add('test');
      expect(obj.getAll().length).toEqual(1);
    });

    test('Add multiple selectors', () => {
      const cls = [
        '.test1',
        'test1',
        '.test2',
        '.test2',
        '#test3',
        'test3',
        'test3',
        '#test3'
      ];
      const result = obj.add(cls);
      expect(Array.isArray(result)).toEqual(true);
      const concat = obj
        .getAll()
        .map(item => item.getFullName())
        .join('');
      expect(concat).toEqual('.test1.test2#test3.test3');
      expect(obj.getAll().length).toEqual(4);
      expect(
        obj
          .getAll()
          .at(0)
          .getFullName()
      ).toEqual('.test1');
      expect(
        obj
          .getAll()
          .at(1)
          .getFullName()
      ).toEqual('.test2');
      expect(
        obj
          .getAll()
          .at(2)
          .getFullName()
      ).toEqual('#test3');
      expect(
        obj
          .getAll()
          .at(3)
          .getFullName()
      ).toEqual('.test3');

      expect(obj.get(cls).length).toEqual(4);
      expect(
        obj
          .get(cls)
          .map(item => item.getFullName())
          .join('')
      ).toEqual(concat);
    });

    test('Get selector', () => {
      var name = 'test';
      var sel = obj.add(name);
      expect(obj.get(name)).toEqual(sel);
    });

    test('Get empty class', () => {
      expect(obj.get('test')).toEqual(undefined);
    });

    test('addClass single class string', () => {
      const result = obj.addClass('class1');
      expect(result.length).toEqual(1);
      expect(result[0] instanceof Selector).toEqual(true);
      expect(result[0].get('name')).toEqual('class1');
    });

    test('addClass multiple class string', () => {
      const result = obj.addClass('class1 class2');
      expect(result.length).toEqual(2);
      expect(obj.getAll().length).toEqual(2);
    });

    test('addClass single class array', () => {
      const result = obj.addClass(['class1']);
      expect(result.length).toEqual(1);
    });

    test('addClass multiple class array', () => {
      const result = obj.addClass(['class1', 'class2']);
      expect(result.length).toEqual(2);
    });

    test('addClass Avoid same name classes', () => {
      obj.addClass('class1');
      const result = obj.addClass('class1');
      expect(obj.getAll().length).toEqual(1);
      expect(result.length).toEqual(1);
    });
  });
});
