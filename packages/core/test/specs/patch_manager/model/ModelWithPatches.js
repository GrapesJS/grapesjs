import PatchManager, { PatchManagerEvents } from 'patch_manager';
import ModelWithPatches from 'patch_manager/ModelWithPatches';

describe('ModelWithPatches', () => {
  test('set records patch with normalized path', async () => {
    const events = [];
    const pm = new PatchManager({
      enabled: true,
      emitter: {
        trigger: (event, payload) => events.push({ event, payload }),
      },
    });

    const model = new ModelWithPatches({ id: 'model-1', foo: 'bar' });
    model.em = { Patches: pm };
    model.patchObjectType = 'model';

    model.set('foo', 'baz');

    await Promise.resolve();

    expect(events).toHaveLength(1);
    expect(events[0].event).toBe(PatchManagerEvents.update);

    const patch = events[0].payload;
    expect(patch.changes).toHaveLength(1);
    expect(patch.reverseChanges).toHaveLength(1);
    expect(patch.changes[0]).toMatchObject({
      op: 'replace',
      path: ['model', 'model-1', 'attributes', 'foo'],
      value: 'baz',
    });
    expect(patch.reverseChanges[0]).toMatchObject({
      op: 'replace',
      path: ['model', 'model-1', 'attributes', 'foo'],
      value: 'bar',
    });
  });

  test('set skips patch recording without a patch object type', async () => {
    const events = [];
    const pm = new PatchManager({
      enabled: true,
      emitter: {
        trigger: (event, payload) => events.push({ event, payload }),
      },
    });

    const model = new ModelWithPatches({ id: 'model-2', foo: 'bar' });
    model.em = { Patches: pm };

    model.set('foo', 'baz');

    await Promise.resolve();

    expect(model.get('foo')).toBe('baz');
    expect(events).toHaveLength(0);
  });

  test('apply handler changes do not create patches while tracking is suppressed', async () => {
    const events = [];
    let model;

    const pm = new PatchManager({
      enabled: true,
      emitter: {
        trigger: (event, payload) => events.push({ event, payload }),
      },
      applyPatch: () => {
        model.set('foo', 'applied');
      },
    });

    model = new ModelWithPatches({ id: 'model-3', foo: 'bar' });
    model.em = { Patches: pm };
    model.patchObjectType = 'model';

    pm.apply(
      {
        id: 'patch-3',
        changes: [{ op: 'replace', path: ['model', 'model-3', 'attributes', 'foo'], value: 'applied' }],
        reverseChanges: [{ op: 'replace', path: ['model', 'model-3', 'attributes', 'foo'], value: 'bar' }],
      },
      { external: true },
    );

    await Promise.resolve();

    expect(model.get('foo')).toBe('applied');
    expect(events).toHaveLength(0);
  });

  test('apply(external) updates tracked model without custom applyPatch', async () => {
    const events = [];
    const pm = new PatchManager({
      enabled: true,
      emitter: {
        trigger: (event, payload) => events.push({ event, payload }),
      },
    });

    class TrackedModel extends ModelWithPatches {
      patchObjectType = 'model';
    }

    const model = new TrackedModel({ id: 'model-4', foo: 'bar' }, { em: { Patches: pm } });

    expect(model.patchObjectType).toBe('model');
    expect(model.id || model.get('id')).toBe('model-4');

    pm.trackModel(model);

    pm.apply(
      {
        id: 'patch-4',
        changes: [{ op: 'replace', path: ['model', 'model-4', 'attributes', 'foo'], value: 'baz' }],
        reverseChanges: [{ op: 'replace', path: ['model', 'model-4', 'attributes', 'foo'], value: 'bar' }],
      },
      { external: true },
    );

    expect(model.get('foo')).toBe('baz');
    expect(events).toHaveLength(0);
  });
});
