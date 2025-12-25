import PatchManager, { PatchManagerEvents } from 'patch_manager';

describe('PatchManager', () => {
  test('Records a patch during update and emits update event', () => {
    const events = [];
    const pm = new PatchManager({
      enabled: true,
      emitter: {
        trigger: (event, payload) => events.push({ event, payload }),
      },
    });

    pm.update(() => {
      const patch = pm.createOrGetCurrentPatch();
      patch.changes.push({ op: 'replace', path: ['value'], value: 1 });
      patch.reverseChanges.push({ op: 'replace', path: ['value'], value: 0 });
    });

    expect(events).toHaveLength(1);
    expect(events[0].event).toBe(PatchManagerEvents.update);
    expect(events[0].payload.changes).toHaveLength(1);
    expect(events[0].payload.reverseChanges).toHaveLength(1);
  });

  test('Applies patches and respects the external flag', () => {
    const calls = [];
    const events = [];
    const pm = new PatchManager({
      enabled: true,
      applyPatch: (changes, options) => calls.push({ changes, options }),
      emitter: {
        trigger: (event) => events.push(event),
      },
    });

    const patch = {
      id: 'patch-1',
      changes: [{ op: 'add', path: ['value'], value: 1 }],
      reverseChanges: [{ op: 'remove', path: ['value'] }],
    };

    pm.apply(patch);

    expect(calls).toHaveLength(1);
    expect(calls[0]).toEqual({
      changes: patch.changes,
      options: { external: false, direction: 'forward' },
    });
    expect(events).toEqual([PatchManagerEvents.update]);

    calls.length = 0;
    events.length = 0;

    pm.apply(patch, { external: true });

    expect(calls).toHaveLength(1);
    expect(calls[0]).toEqual({
      changes: patch.changes,
      options: { external: true, direction: 'forward' },
    });
    expect(events).toHaveLength(0);
  });

  test('Undo and redo apply reverse/forward changes', () => {
    const calls = [];
    const events = [];
    const pm = new PatchManager({
      enabled: true,
      applyPatch: (changes, options) => calls.push({ changes, options }),
      emitter: {
        trigger: (event) => events.push(event),
      },
    });

    const patch = {
      id: 'patch-2',
      changes: [{ op: 'replace', path: ['value'], value: 2 }],
      reverseChanges: [{ op: 'replace', path: ['value'], value: 1 }],
    };

    pm.add(patch);

    const undoPatch = pm.undo();
    const redoPatch = pm.redo();

    expect(undoPatch).toBe(patch);
    expect(redoPatch).toBe(patch);
    expect(calls[0]).toEqual({ changes: patch.reverseChanges, options: { direction: 'backward' } });
    expect(calls[1]).toEqual({ changes: patch.changes, options: { direction: 'forward' } });
    expect(events).toEqual([PatchManagerEvents.update, PatchManagerEvents.undo, PatchManagerEvents.redo]);
  });
});
