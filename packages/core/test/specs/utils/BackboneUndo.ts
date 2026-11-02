// Adapted from Backbone.Undo.js's QUnit suite (MIT, Copyright (c) 2013 Oliver Sartun).
// https://github.com/osartun/Backbone.Undo.js/blob/master/Tests/Backbone.Undo.Tests.js
import Backbone from 'backbone';
import UndoManager from '../../../src/utils/backbone-undo';

describe('Backbone Undo', () => {
  let managers: InstanceType<typeof UndoManager>[];

  const createManager = (options = {}) => {
    const manager = new UndoManager(options);
    managers.push(manager);
    return manager;
  };

  beforeEach(() => {
    jest.useFakeTimers();
    managers = [];
  });

  afterEach(() => {
    managers.forEach((manager) => manager.unregisterAll());
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('registers and unregisters objects', () => {
    const manager = createManager();
    const model = new Backbone.Model();
    const collection = new Backbone.Collection();

    manager.register(model, collection);
    expect(manager.objectRegistry.get()).toEqual([model, collection]);

    manager.unregister(model);
    expect(manager.objectRegistry.get()).toEqual([collection]);

    manager.register(model);
    manager.unregisterAll();
    expect(manager.objectRegistry.get()).toEqual([]);
  });

  test.each(['model', 'collection', 'both'] as const)('registers %s through constructor options', (type) => {
    const model = new Backbone.Model();
    const collection = new Backbone.Collection();
    const register = { model, collection, both: [model, collection] }[type];
    const manager = createManager({ register });

    expect(manager.objectRegistry.get()).toEqual(Array.isArray(register) ? register : [register]);
  });

  test('starts and stops tracking model and collection changes', () => {
    const model = new Backbone.Model<{ foo: string; hello?: string }>({ foo: 'bar' });
    const collection = new Backbone.Collection([{ a: 'b' }, { c: 'd' }]);
    const manager = createManager({ register: [model, collection] });

    model.set('hello', 'world');
    collection.add({ e: 'f' });
    expect(manager.stack).toHaveLength(0);
    expect(manager.isTracking()).toBe(false);

    manager.startTracking();
    expect(manager.isTracking()).toBe(true);
    model.set('hello', 'you');
    collection.remove(collection.last());
    expect(manager.stack).toHaveLength(2);

    manager.stopTracking();
    expect(manager.isTracking()).toBe(false);
    model.set('hello', 'kitty');
    collection.add({ e: 'f' });
    model.set('hello', 'you');
    collection.remove(collection.last());
    manager.startTracking();
    expect(manager.stack).toHaveLength(2);

    manager.unregisterAll();
    const activeManager = createManager({ track: true, register: [model, collection] });
    model.set('hello', 'hello');
    collection.add({ g: 'h' });
    expect(activeManager.isTracking()).toBe(true);
    expect(activeManager.stack).toHaveLength(2);
  });

  test('undoes and redoes model changes, including added attributes and history boundaries', () => {
    const model = new Backbone.Model<{ t: number; x?: number; y?: number }>({ t: 1 });
    const manager = createManager({ track: true, register: model });

    model.set('t', 2);
    manager.undo();
    expect(model.toJSON()).toEqual({ t: 1 });
    manager.redo();
    expect(model.toJSON()).toEqual({ t: 2 });

    model.set('x', 1);
    manager.undo();
    expect(model.toJSON()).toEqual({ t: 2 });
    manager.redo();
    expect(model.toJSON()).toEqual({ t: 2, x: 1 });

    model.set({ y: 1, x: 2 });
    manager.undo();
    expect(model.toJSON()).toEqual({ t: 2, x: 1 });
    manager.redo();
    expect(model.toJSON()).toEqual({ t: 2, x: 2, y: 1 });

    manager.undo();
    manager.undo();
    manager.undo();
    expect(model.toJSON()).toEqual({ t: 1 });
    expect(manager.isAvailable('undo')).toBe(false);
    manager.undo();
    expect(model.toJSON()).toEqual({ t: 1 });

    manager.redo();
    manager.redo();
    manager.redo();
    expect(model.toJSON()).toEqual({ t: 2, x: 2, y: 1 });
    expect(manager.isAvailable('redo')).toBe(false);
    manager.redo();
    expect(model.toJSON()).toEqual({ t: 2, x: 2, y: 1 });
  });

  test('undoes and redoes collection additions, removals, resets, and model destruction', () => {
    const collection = new Backbone.Collection([{ t: 1 }, { t: 2 }, { t: 3 }]);
    const manager = createManager({ track: true, register: collection });

    collection.add({ t: 4 });
    manager.undo();
    expect(collection.toJSON()).toEqual([{ t: 1 }, { t: 2 }, { t: 3 }]);
    manager.redo();
    expect(collection.toJSON()).toEqual([{ t: 1 }, { t: 2 }, { t: 3 }, { t: 4 }]);

    collection.remove(collection.first());
    manager.undo();
    expect(collection.toJSON()).toEqual([{ t: 1 }, { t: 2 }, { t: 3 }, { t: 4 }]);
    manager.redo();
    expect(collection.toJSON()).toEqual([{ t: 2 }, { t: 3 }, { t: 4 }]);

    collection.reset([{ a: 1 }, { a: 2 }, { a: 3 }]);
    manager.undo();
    expect(collection.toJSON()).toEqual([{ t: 2 }, { t: 3 }, { t: 4 }]);
    manager.redo();
    expect(collection.toJSON()).toEqual([{ a: 1 }, { a: 2 }, { a: 3 }]);

    collection.first().destroy();
    manager.undo();
    expect(collection.toJSON()).toEqual([{ a: 1 }, { a: 2 }, { a: 3 }]);
    manager.redo();
    expect(collection.toJSON()).toEqual([{ a: 2 }, { a: 3 }]);
  });

  test('registers Backbone and plain objects without duplicates', () => {
    const manager = createManager();
    const registry = manager.objectRegistry;
    const model = new Backbone.Model();
    const collection = new Backbone.Collection();
    const plainObject = { something: 'else' };

    registry.register(model);
    expect(registry.isRegistered(model)).toBeTruthy();
    registry.register(collection);
    expect(registry.get()).toEqual([model, collection]);

    registry.register(model);
    registry.register(collection);
    expect(registry.get()).toHaveLength(2);

    registry.register(plainObject);
    expect(registry.get()).toEqual([model, collection, plainObject]);

    registry.unregister(model);
    registry.unregister(collection);
    registry.unregister(plainObject);
    expect(registry.get()).toEqual([]);
  });

  test('merges managers into one stack while retaining instance-specific undo handlers', () => {
    const main = createManager({ track: true });
    const special = createManager({ track: true });
    const model1 = new Backbone.Model({ t: 1 });
    const model2 = new Backbone.Model();
    special.changeUndoType('change', {
      on: () => ({ object: model1, before: { a: 1 }, after: { b: 1 } }),
    });
    special.register(model1);
    main.register(model2);

    main.merge(special);
    expect(special.stack).toBe(main.stack);

    model1.set('t', 2);
    expect(main.stack).toHaveLength(1);
    expect(main.stack.at(0).get('object')).toBe(model1);
    expect(main.stack.at(0).get('before')).toEqual({ a: 1 });
    expect(main.stack.at(0).get('after')).toEqual({ b: 1 });

    model2.set('t', 2);
    expect(main.stack).toHaveLength(2);
    expect(main.stack.at(1).get('after')).toEqual({ t: 2 });
  });

  test('clears undo and redo history', () => {
    const model = new Backbone.Model({ t: 1 });
    const manager = createManager({ track: true, register: model });
    model.set('t', 2);
    model.set('t', 3);
    model.set('t', 4);

    manager.clear();
    manager.undo();
    expect(model.toJSON()).toEqual({ t: 4 });
    expect(manager.stack).toHaveLength(0);
    expect(manager.isAvailable('undo')).toBe(false);

    model.set('t', 2);
    model.set('t', 3);
    model.set('t', 4);
    manager.undo();
    manager.undo();
    manager.clear();
    manager.redo();
    expect(model.toJSON()).toEqual({ t: 2 });
    expect(manager.stack).toHaveLength(0);
    expect(manager.isAvailable('redo')).toBe(false);
  });

  test('undoes and redoes all changes alongside individual and grouped operations', () => {
    const model = new Backbone.Model({ t: 1 });
    const manager = createManager({ track: true, register: model });
    model.set('t', 2);
    model.set('t', 3);
    model.set('t', 4);

    manager.undoAll();
    expect(model.toJSON()).toEqual({ t: 1 });
    manager.redoAll();
    expect(model.toJSON()).toEqual({ t: 4 });

    manager.undo();
    manager.undoAll();
    manager.undo(true);
    expect(model.toJSON()).toEqual({ t: 1 });

    manager.undoAll();
    manager.redo();
    manager.redoAll();
    manager.redo(true);
    expect(model.toJSON()).toEqual({ t: 4 });

    manager.undoAll();
    manager.undoAll();
    manager.redoAll();
    manager.redoAll();
    expect(model.toJSON()).toEqual({ t: 4 });
  });

  test('groups changes within one turn and keeps changes in later turns separate', () => {
    const model = new Backbone.Model({ t: 1 });
    const collection = new Backbone.Collection([{ a: 3 }]);
    const manager = createManager({ track: true, register: [model, collection] });

    for (let value = 3; value < 10; value++) {
      model.set('t', value);
    }
    manager.undo(true);
    expect(model.get('t')).toBe(1);
    manager.redo(true);
    expect(model.get('t')).toBe(9);
    const modelGroup = manager.stack.last().get('magicFusionIndex');

    jest.runOnlyPendingTimers();
    collection.add([{ a: 4 }, { a: 5 }]);
    expect(manager.stack.last().get('magicFusionIndex')).not.toBe(modelGroup);
    manager.undo(true);
    expect(collection).toHaveLength(1);
    expect(model.get('t')).toBe(9);
    manager.redo(true);
    expect(collection).toHaveLength(3);
  });
});
