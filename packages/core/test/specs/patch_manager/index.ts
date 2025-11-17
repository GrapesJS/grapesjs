import Editor from '../../../src/editor';
import type { PatchProps } from '../../../src/patch_manager/types';

describe('PatchManager', () => {
  let editor: Editor;

  beforeEach(async () => {
    editor = new Editor();
    const ready = new Promise<void>((resolve) =>
      editor.getModel().once('change:readyLoad', () => resolve()),
    );
    editor.getModel().initModules();
    editor.getModel().loadOnStart();
    await ready;
    const pm = editor.Patches as any;
    pm.history = [];
    pm.index = -1;
    pm.active = null;
  });

  afterEach(() => {
    editor.destroy();
  });

  test('records JSON patches for component updates', () => {
    const patches: PatchProps[] = [];
    editor.on('patch:update', ({ patch }) => {
      patches.push(patch);
    });
    const wrapper = editor.getWrapper()!;
    const id = wrapper.getId();
    wrapper.set('tagName', 'section');
    expect(patches).toHaveLength(1);
    expect(patches[0].changes[0].path).toBe(`/component/${id}/tagName`);
  });

  test('update() batches multiple mutations into a single patch', () => {
    const updates: PatchProps[] = [];
    editor.on('patch:update', ({ patch }) => updates.push(patch));
    const wrapper = editor.getWrapper()!;
    editor.Patches.update(() => {
      wrapper.set('tagName', 'section');
      wrapper.set('attributes', { 'data-test': 'updated' });
    });
    expect(updates).toHaveLength(1);
    expect(updates[0].changes.length).toBeGreaterThanOrEqual(2);
  });

  test('apply() restores recorded patch data', () => {
    let recorded: PatchProps | undefined;
    editor.once('patch:update', ({ patch }) => {
      recorded = patch;
    });
    const wrapper = editor.getWrapper()!;
    wrapper.set('tagName', 'section');
    expect(recorded).toBeDefined();
    wrapper.set('tagName', 'span');
    editor.Patches.apply(recorded!);
    expect(wrapper.get('tagName')).toBe('section');
  });

    test('undo/redo emit patch events and rollback state', () => {
      const undo: PatchProps[] = [];
      const redo: PatchProps[] = [];
      editor.on('patch:undo', ({ patch }) => {
        undo.push(patch);
      });
      editor.on('patch:redo', ({ patch }) => {
        redo.push(patch);
      });
      const wrapper = editor.getWrapper()!;
      const original = wrapper.get('tagName');
      wrapper.set('tagName', 'section');
      expect(wrapper.get('tagName')).toBe('section');
      editor.Patches.undo();
      expect(wrapper.get('tagName')).toBe(original);
      expect(undo).toHaveLength(1);
      editor.Patches.redo();
      expect(wrapper.get('tagName')).toBe('section');
      expect(redo).toHaveLength(1);
    });
});
