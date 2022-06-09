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
      em.destroy();
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
        selectors: ['test1', 'test2', 'test3'],
      });
      expect(cm.getAll().length).toEqual(3);
    });

    test('Add new selector', () => {
      obj.add('test');
      expect(obj.getAll().length).toEqual(1);
    });

    test('Default new selector is a class type', () => {
      const added = obj.add('test');
      expect(obj.get('test').get('type')).toEqual(obj.Selector.TYPE_CLASS);
      expect(added.getFullName()).toBe('.test');
    });

    test('Add a selector as an id', () => {
      const name = 'test';
      var sel = obj.add(`#${name}`);
      expect(sel.get('name')).toEqual(name);
      expect(sel.get('label')).toEqual(name);
      expect(obj.get(`#${name}`).get('type')).toEqual(obj.Selector.TYPE_ID);
      expect(sel.getFullName()).toBe('#test');
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
      const add1 = obj.add('test');
      const add2 = obj.add('test');
      expect(obj.getAll().length).toEqual(1);
      expect(add1).toBe(add2);
    });

    test('Add multiple selectors', () => {
      const cls = ['.test1', 'test1', '.test2', '.test2', '#test3', 'test3', 'test3', '#test3'];
      const result = obj.add(cls);
      expect(Array.isArray(result)).toEqual(true);
      const concat = obj
        .getAll()
        .map(item => item.getFullName())
        .join('');
      expect(concat).toEqual('.test1.test2#test3.test3');
      expect(obj.getAll().length).toEqual(4);
      expect(obj.getAll().at(0).getFullName()).toEqual('.test1');
      expect(obj.getAll().at(1).getFullName()).toEqual('.test2');
      expect(obj.getAll().at(2).getFullName()).toEqual('#test3');
      expect(obj.getAll().at(3).getFullName()).toEqual('.test3');

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
      expect(obj.get('test')).toEqual(null);
    });

    test('Get id selector', () => {
      const name = 'my-id';
      const type = Selector.TYPE_ID;
      const added = obj.add({ name, type });
      expect(obj.get(name)).toEqual(null);
      expect(obj.get(name, type)).toBe(added);
    });

    test('Add selectors as string identifiers', () => {
      const cls = '.my-class';
      const id = '#my-id';
      const addedCls = obj.add(cls);
      const addedId = obj.add(id);
      expect(addedCls.toString()).toBe(cls);
      expect(addedId.toString()).toBe(id);
    });

    test('Get selectors as string identifiers', () => {
      const cls = '.my-class';
      const id = '#my-id';
      const addedCls = obj.add(cls);
      const addedId = obj.add(id);
      expect(obj.get(cls)).toBe(addedCls);
      expect(obj.get(id)).toBe(addedId);
    });

    test('Remove selectors as string identifiers', () => {
      const cls = '.my-class';
      const id = '#my-id';
      const addedCls = obj.add(cls);
      const addedId = obj.add(id);
      expect(obj.getAll().length).toBe(2);
      expect(obj.remove(cls)).toBe(addedCls);
      expect(obj.remove(id)).toBe(addedId);
      expect(obj.getAll().length).toBe(0);
    });

    test('Remove selector as instance', () => {
      const addedCls = obj.add('.my-class');
      expect(obj.getAll().length).toBe(1);
      expect(obj.remove(addedCls)).toBe(addedCls);
      expect(obj.getAll().length).toBe(0);
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

    describe('Events', () => {
      test('Add triggers proper events', () => {
        const itemTest = 'sel';
        const eventAdd = jest.fn();
        const eventAll = jest.fn();
        em.on(obj.events.add, eventAdd);
        em.on(obj.events.all, eventAll);
        const added = obj.add(itemTest);
        expect(eventAdd).toBeCalledTimes(1);
        expect(eventAdd).toBeCalledWith(added, expect.anything());
        expect(eventAll).toBeCalled();
      });

      test('Remove triggers proper events', () => {
        const itemTest = 'sel';
        const eventBfRm = jest.fn();
        const eventRm = jest.fn();
        const eventAll = jest.fn();
        obj.add(itemTest);
        em.on(obj.events.removeBefore, eventBfRm);
        em.on(obj.events.remove, eventRm);
        em.on(obj.events.all, eventAll);
        const removed = obj.remove(itemTest);
        expect(obj.getAll().length).toBe(0);
        expect(eventBfRm).toBeCalledTimes(1);
        expect(eventRm).toBeCalledTimes(1);
        expect(eventRm).toBeCalledWith(removed, expect.anything());
        expect(eventAll).toBeCalled();
      });

      test('Update triggers proper events', () => {
        const itemTest = 'sel';
        const eventUp = jest.fn();
        const eventAll = jest.fn();
        const added = obj.add(itemTest);
        const newProps = { label: 'Heading 2' };
        em.on(obj.events.update, eventUp);
        em.on(obj.events.all, eventAll);
        added.set(newProps);
        expect(eventUp).toBeCalledTimes(1);
        expect(eventUp).toBeCalledWith(added, newProps, expect.anything());
        expect(eventAll).toBeCalled();
      });
    });
  });
});
