import Editor from '../../../src/editor';
import PatchManager from '../../../src/patch_manager';
import { PatchProps } from '../../../src/patch_manager/types';
import Component from '../../../src/dom_components/model/Component';
import EditorModel from '../../../src/editor/model/Editor';
import { setupTestEditor } from '../../common';

describe('Patch Manager', () => {
  let editor: Editor;
  let em: EditorModel;
  let patches: PatchManager;
  let wrapper: Component;

  beforeEach(() => {
    ({ editor, em } = setupTestEditor({ withCanvas: true }));
    em.initModules();
    patches = editor.Patches;
    wrapper = em.getWrapper()!;
  });

  afterEach(() => {
    editor.destroy();
  });

  test('collects component changes and supports undo/redo', () => {
    const updates: PatchProps[] = [];
    editor.on('patch:update', ({ patch }) => updates.push(patch));

    const cmp = wrapper.append({ tagName: 'div', content: 'first' })[0];

    expect(patches.canTrack()).toBe(true);
    expect(updates).toHaveLength(1);
    expect(updates[0].changes[0]).toMatchObject({
      op: 'add',
      path: `/component/${wrapper.getId()}/components/0`,
    });

    cmp.set('content', 'second');
    expect(updates).toHaveLength(2);

    const changePatch = updates[1];
    expect(changePatch.changes[0]).toMatchObject({
      op: 'replace',
      path: `/component/${cmp.getId()}/content`,
      value: 'second',
    });
    expect(changePatch.reverseChanges[0]).toMatchObject({
      op: 'replace',
      path: `/component/${cmp.getId()}/content`,
      value: 'first',
    });

    patches.undo();
    expect(cmp.get('content')).toBe('first');

    patches.redo();
    expect(cmp.get('content')).toBe('second');
  });

  test('applies external component patches without re-tracking', () => {
    const updates: PatchProps[] = [];
    const applied: PatchProps[] = [];
    editor.on('patch:update', ({ patch }) => updates.push(patch));
    editor.on('patch:applied:external', ({ patch }) => applied.push(patch));

    const wrapperId = wrapper.getId();
    const externalPatch: PatchProps = {
      id: 'ext',
      ts: Date.now(),
      changes: [
        {
          op: 'add',
          path: `/component/${wrapperId}/components/0`,
          value: { type: 'default', tagName: 'div', content: 'from patch' },
        },
      ],
      reverseChanges: [],
    };

    patches.apply(externalPatch);

    expect(applied).toContain(externalPatch);
    expect(updates).toHaveLength(0);
    expect(wrapper.components()).toHaveLength(1);
    expect(wrapper.components().at(0).get('content')).toBe('from patch');
  });
});
