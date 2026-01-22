import PatchManager, { PatchObjectsRegistry, createRegistryApplyPatchHandler } from 'patch_manager';
import ModelWithPatches from 'patch_manager/ModelWithPatches';

describe('PatchObjectsRegistry', () => {
  test('apply handler resolves models by uid and applies forward/backward changes', () => {
    const registry = new PatchObjectsRegistry();
    const pm = new PatchManager({
      enabled: true,
      applyPatch: createRegistryApplyPatchHandler(registry),
    });

    const model = new ModelWithPatches({ uid: 'uid-1', foo: 'bar' });
    model.em = { Patches: pm };
    model.patchObjectType = 'model';
    registry.register('model', 'uid-1', model);

    const patch = {
      id: 'patch-1',
      changes: [{ op: 'replace', path: ['model', 'uid-1', 'attributes', 'foo'], value: 'baz' }],
      reverseChanges: [{ op: 'replace', path: ['model', 'uid-1', 'attributes', 'foo'], value: 'bar' }],
    };

    pm.apply(patch);
    expect(model.get('foo')).toBe('baz');

    pm.undo();
    expect(model.get('foo')).toBe('bar');

    pm.redo();
    expect(model.get('foo')).toBe('baz');
  });
});

