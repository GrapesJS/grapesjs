import Editor from '../../../src/editor';
import PatchManager from '../../../src/patch_manager';
import { PatchAdapter, PatchProps } from '../../../src/patch_manager/types';
import Component from '../../../src/dom_components/model/Component';
import EditorModel from '../../../src/editor/model/Editor';
import { Model } from '../../../src/common';
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

  test('collects css rule changes with adapter', () => {
    const updates: PatchProps[] = [];
    editor.on('patch:update', ({ patch }) => updates.push(patch));

    const rule = editor.Css.addRules('.test { color: red; }')[0];
    updates.length = 0;

    rule.setStyle({ color: 'blue' });

    expect(updates.length).toBeGreaterThanOrEqual(1);
    const patch = updates[updates.length - 1];
    const ruleId = (rule as any).id || rule.get('id');
    expect(ruleId).toBeTruthy();
    expect(patch.changes[0]).toMatchObject({
      op: 'replace',
      path: `/cssRule/${ruleId}/style`,
    });
    expect((patch.changes[0] as any).value?.color).toBe('blue');
    expect(patch.reverseChanges[0]).toMatchObject({
      op: 'replace',
      path: `/cssRule/${ruleId}/style`,
    });
    expect((patch.reverseChanges[0] as any).value?.color).toBe('red');

    patches.undo();
    expect(rule.getStyle().color).toBe('red');

    patches.redo();
    expect(rule.getStyle().color).toBe('blue');
  });

  test('allows registering custom adapters without touching core', () => {
    const updates: PatchProps[] = [];
    editor.on('patch:update', ({ patch }) => updates.push(patch));

    const custom = new Model({ id: 'custom-1', value: 'one' });
    const adapter: PatchAdapter<Model> = {
      type: 'custom',
      sourceKeys: ['custom'],
      getId: (model) => model.get('id') as string,
      resolve: (_em: EditorModel, id: string) => (id === custom.get('id') ? custom : null),
    };

    patches.registerAdapter(adapter);

    custom.set('value', 'two');
    const changed = custom.changedAttributes() || {};
    em.changesUp({}, { custom, changed });

    expect(updates).toHaveLength(1);
    const changePatch = updates[0];
    expect(changePatch.changes[0]).toMatchObject({
      op: 'replace',
      path: `/custom/${custom.get('id')}/value`,
      value: 'two',
    });
    expect(changePatch.reverseChanges[0]).toMatchObject({
      op: 'replace',
      path: `/custom/${custom.get('id')}/value`,
      value: 'one',
    });
  });
});
