import PatchManager from 'patch_manager';
import CollectionWithPatches from 'patch_manager/CollectionWithPatches';
import { Model } from 'common';

class TestModel extends Model {
  getId() {
    return this.get('id');
  }
}

class TestCollection extends CollectionWithPatches {
  patchObjectType = 'test-collection';
}

describe('CollectionWithPatches', () => {
  test('records order changes and sorts models after inserts', async () => {
    const events = [];
    const pm = new PatchManager({
      enabled: true,
      emitter: {
        trigger: (event, payload) => events.push({ event, payload }),
      },
    });
    const em = { Patches: pm };
    const coll = new TestCollection([], { em, collectionId: 'root' });

    coll.add(new TestModel({ id: 'a' }));
    coll.add(new TestModel({ id: 'b' }));
    coll.add(new TestModel({ id: 'c' }), { at: 1 });

    await Promise.resolve();
    await Promise.resolve();

    const sortedIds = coll.getAndSortFractionalMap().map((entry) => entry.id);
    expect(sortedIds).toEqual(['a', 'c', 'b']);

    const updateEvents = events.filter((item) => item.event === 'patch:update');
    expect(updateEvents).toHaveLength(1);
    const payload = updateEvents[updateEvents.length - 1].payload;
    const prefix = ['test-collection', 'root'];
    const matchesPrefix = payload.changes.every((change) =>
      prefix.every((segment, index) => change.path[index] === segment),
    );
    expect(matchesPrefix).toBe(true);
  });

  test('move within the same collection generates replace and supports undo/redo', async () => {
    const events = [];
    const pm = new PatchManager({
      enabled: true,
      emitter: {
        trigger: (event, payload) => events.push({ event, payload }),
      },
    });
    const em = { Patches: pm };
    const coll = new TestCollection([], { em, collectionId: 'root' });

    coll.add(new TestModel({ id: 'a' }));
    coll.add(new TestModel({ id: 'b' }));
    coll.add(new TestModel({ id: 'c' }));

    await Promise.resolve();
    await Promise.resolve();
    events.length = 0;

    const modelC = coll.get('c');
    coll.remove(modelC);
    coll.add(modelC, { at: 1 });

    await Promise.resolve();
    await Promise.resolve();

    const movedIds = coll.getAndSortFractionalMap().map((entry) => entry.id);
    expect(movedIds).toEqual(['a', 'c', 'b']);

    const updateEvents = events.filter((item) => item.event === 'patch:update');
    expect(updateEvents).toHaveLength(1);
    const patch = updateEvents[0].payload;

    const moveChanges = patch.changes.filter((c) => c.path[3] === 'c');
    expect(moveChanges).toHaveLength(1);
    expect(moveChanges[0].op).toBe('replace');

    pm.undo();
    const undoIds = coll.getAndSortFractionalMap().map((entry) => entry.id);
    expect(undoIds).toEqual(['a', 'b', 'c']);

    pm.redo();
    const redoIds = coll.getAndSortFractionalMap().map((entry) => entry.id);
    expect(redoIds).toEqual(['a', 'c', 'b']);
  });

  test('apply(external) applies order patches without re-logging', async () => {
    const pmAEvents = [];
    const pmA = new PatchManager({
      enabled: true,
      emitter: { trigger: (event, payload) => pmAEvents.push({ event, payload }) },
    });
    const pmBEvents = [];
    const pmB = new PatchManager({
      enabled: true,
      emitter: { trigger: (event, payload) => pmBEvents.push({ event, payload }) },
    });

    const emA = { Patches: pmA };
    const emB = { Patches: pmB };
    const collA = new TestCollection([], { em: emA, collectionId: 'root' });
    const collB = new TestCollection([], { em: emB, collectionId: 'root' });

    ['a', 'b', 'c'].forEach((id) => {
      collA.add(new TestModel({ id }));
      collB.add(new TestModel({ id }));
    });

    await Promise.resolve();
    await Promise.resolve();
    pmAEvents.length = 0;
    pmBEvents.length = 0;

    // Produce a patch on A
    const modelC = collA.get('c');
    collA.remove(modelC);
    collA.add(modelC, { at: 1 });
    await Promise.resolve();
    await Promise.resolve();

    const patch = pmAEvents.find((e) => e.event === 'patch:update')?.payload;
    expect(patch).toBeTruthy();

    // Apply patch to B as external (no patch:update expected)
    pmB.apply(patch, { external: true });

    const idsB = collB.getAndSortFractionalMap().map((entry) => entry.id);
    expect(idsB).toEqual(['a', 'c', 'b']);
    expect(pmBEvents).toHaveLength(0);
  });

  test('fractional order is deterministic under key collisions (concurrent ops)', async () => {
    const pm = new PatchManager({ enabled: true });
    const em = { Patches: pm };
    const coll = new TestCollection([], { em, collectionId: 'root' });

    ['a', 'b', 'c', 'd'].forEach((id) => coll.add(new TestModel({ id })));
    await Promise.resolve();
    await Promise.resolve();

    const conflictKey = coll.getOrderKey('b');
    expect(conflictKey).toBeTruthy();

    const patch1 = {
      id: 'p1',
      changes: [{ op: 'replace', path: ['test-collection', 'root', 'order', 'c'], value: conflictKey }],
      reverseChanges: [],
    };
    const patch2 = {
      id: 'p2',
      changes: [{ op: 'replace', path: ['test-collection', 'root', 'order', 'd'], value: conflictKey }],
      reverseChanges: [],
    };

    pm.apply(patch1, { external: true });
    pm.apply(patch2, { external: true });

    const ids1 = coll.getAndSortFractionalMap().map((e) => e.id);

    // Reset and apply in reverse order
    const coll2 = new TestCollection([], { em, collectionId: 'root-2' });
    ['a', 'b', 'c', 'd'].forEach((id) => coll2.add(new TestModel({ id })));
    await Promise.resolve();
    await Promise.resolve();
    pm.trackCollection(coll2);

    const patch1b = {
      ...patch1,
      changes: [{ ...patch1.changes[0], path: ['test-collection', 'root-2', 'order', 'c'] }],
    };
    const patch2b = {
      ...patch2,
      changes: [{ ...patch2.changes[0], path: ['test-collection', 'root-2', 'order', 'd'] }],
    };
    pm.apply(patch2b, { external: true });
    pm.apply(patch1b, { external: true });

    const ids2 = coll2.getAndSortFractionalMap().map((e) => e.id);
    expect(ids2).toEqual(ids1);
  });

  test('skips patch recording when disabled', async () => {
    const events = [];
    const pm = new PatchManager({
      enabled: false,
      emitter: {
        trigger: (event, payload) => events.push({ event, payload }),
      },
    });
    const em = { Patches: pm };
    const coll = new TestCollection([], { em, collectionId: 'root' });

    coll.add(new TestModel({ id: 'x' }));
    await Promise.resolve();

    expect(events).toHaveLength(0);
  });
});
