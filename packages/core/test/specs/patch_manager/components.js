import { applyPatches } from 'immer';
import Component from 'dom_components/model/Component';
import Editor from 'editor/model/Editor';
import PatchManager from 'patch_manager';
import { generateKeyBetween, generateNKeysBetween } from 'utils/fractionalIndex';
import { serialize } from 'utils/mixins';

const flush = () => Promise.resolve();

const getUpdatePatches = (events) => events.filter((e) => e.event === 'patch:update').map((e) => e.payload);

const initState = (models) => ({
  components: Object.fromEntries(
    models.map((model) => {
      const attributes = serialize(model.toJSON());
      delete attributes.components;
      return [model.get('uid'), { attributes }];
    }),
  ),
});

describe('Patch tracking: nested Components order', () => {
  let em;
  let compOpts;

  beforeEach(() => {
    em = new Editor({ avoidDefaults: true, avoidInlineStyle: true });
    em.Pages.onLoad();
    const domc = em.Components;
    compOpts = { em, componentTypes: domc.componentTypes, domc };
  });

  afterEach(() => {
    em.destroyAll();
  });

  test('Does not create patches for non-storable props (toolbar/traits/status)', async () => {
    const events = [];
    const pm = new PatchManager({
      enabled: true,
      emitter: { trigger: (event, payload) => events.push({ event, payload }) },
    });
    const cmp = new Component({}, compOpts);
    em.set('Patches', pm);
    events.length = 0;

    cmp.set('toolbar', [{ command: 'tlb-move' }]);
    cmp.set('traits', [{ type: 'text', name: 'title' }]);
    cmp.set('status', 'selected');

    await flush();

    expect(getUpdatePatches(events)).toHaveLength(0);
  });

  test('Add child: records component add + order-map add patches', async () => {
    const events = [];
    const pm = new PatchManager({
      enabled: true,
      emitter: { trigger: (event, payload) => events.push({ event, payload }) },
    });
    pm.createId = () => 'child-1';

    const parent = new Component({}, compOpts);
    parent.set('uid', 'parent');
    em.set('Patches', pm);
    parent.components().setParent(parent);
    events.length = 0;

    parent.append({ tagName: 'div' });
    await flush();

    const patches = getUpdatePatches(events);
    expect(patches).toHaveLength(1);

    const patch = patches[0];
    expect(patch.changes).toHaveLength(2);
    expect(patch.reverseChanges).toHaveLength(2);

    expect(patch.changes[0]).toMatchObject({
      op: 'add',
      path: ['components', 'child-1'],
    });
    expect(patch.changes[0].value.attributes.uid).toBe('child-1');

    expect(patch.changes[1]).toEqual({
      op: 'add',
      path: ['components', 'parent', 'attributes', 'componentsOrder', generateKeyBetween(null, null)],
      value: 'child-1',
    });

    // Undo order must remove map entry first, then the component object.
    expect(patch.reverseChanges[0]).toEqual({
      op: 'remove',
      path: ['components', 'parent', 'attributes', 'componentsOrder', generateKeyBetween(null, null)],
    });
    expect(patch.reverseChanges[1]).toEqual({
      op: 'remove',
      path: ['components', 'child-1'],
    });
  });

  test('Remove child: records order-map remove + component remove patches', async () => {
    const events = [];
    const pm = new PatchManager({
      enabled: true,
      emitter: { trigger: (event, payload) => events.push({ event, payload }) },
    });
    pm.createId = () => 'child-1';

    const parent = new Component({}, compOpts);
    parent.set('uid', 'parent');
    em.set('Patches', pm);
    parent.components().setParent(parent);

    const [child] = parent.append({ tagName: 'div' });
    await flush();
    events.length = 0;

    parent.components().remove(child);
    await flush();

    const patches = getUpdatePatches(events);
    expect(patches).toHaveLength(1);

    const patch = patches[0];
    expect(patch.changes).toHaveLength(2);
    expect(patch.reverseChanges).toHaveLength(2);

    const orderKey = generateKeyBetween(null, null);
    expect(patch.changes[0]).toEqual({
      op: 'remove',
      path: ['components', 'parent', 'attributes', 'componentsOrder', orderKey],
    });
    expect(patch.changes[1]).toEqual({
      op: 'remove',
      path: ['components', 'child-1'],
    });

    // Undo order must re-add the component object first, then restore the order map.
    expect(patch.reverseChanges[0]).toMatchObject({
      op: 'add',
      path: ['components', 'child-1'],
    });
    expect(patch.reverseChanges[0].value.attributes.uid).toBe('child-1');
    expect(patch.reverseChanges[1]).toEqual({
      op: 'add',
      path: ['components', 'parent', 'attributes', 'componentsOrder', orderKey],
      value: 'child-1',
    });
  });

  test('Reorder within same parent updates only componentsOrder (no array index moves)', async () => {
    const events = [];
    const pm = new PatchManager({
      enabled: true,
      emitter: { trigger: (event, payload) => events.push({ event, payload }) },
    });

    const parent = new Component({}, compOpts);
    parent.set('uid', 'parent');

    const [c1, c2, c3] = parent.append([{ tagName: 'div' }, { tagName: 'span' }, { tagName: 'p' }]);
    c1.set('uid', 'c1');
    c2.set('uid', 'c2');
    c3.set('uid', 'c3');

    em.set('Patches', pm);
    parent.components().setParent(parent);
    events.length = 0;

    // Move c1 to the end (temporary remove + re-add).
    parent.components().remove(c1, { temporary: true });
    parent.components().add(c1, { at: 2 });
    await flush();

    const patches = getUpdatePatches(events);
    expect(patches).toHaveLength(1);

    const patch = patches[0];
    expect(patch.changes).toHaveLength(2);
    expect(patch.reverseChanges).toHaveLength(2);

    const [k1, k2, k3] = generateNKeysBetween(null, null, 3);
    const newKey = generateKeyBetween(k3, null);

    expect(patch.changes[0]).toEqual({
      op: 'remove',
      path: ['components', 'parent', 'attributes', 'componentsOrder', k1],
    });
    expect(patch.changes[1]).toEqual({
      op: 'add',
      path: ['components', 'parent', 'attributes', 'componentsOrder', newKey],
      value: 'c1',
    });

    // Regression: no patches for `attributes.components` array indices.
    const hasComponentsArrayPatch = patch.changes.some((ch) => {
      const p = ch.path || [];
      for (let i = 0; i < p.length - 1; i++) {
        if (p[i] === 'attributes' && p[i + 1] === 'components') return true;
      }
      return false;
    });
    expect(hasComponentsArrayPatch).toBe(false);
  });

  test('Move between parents updates order maps and is undo/redo deterministic', async () => {
    const events = [];
    let state;
    const pm = new PatchManager({
      enabled: true,
      emitter: { trigger: (event, payload) => events.push({ event, payload }) },
      applyPatch: (changes) => {
        state = applyPatches(state, changes);
      },
    });

    const parentA = new Component({}, compOpts);
    const parentB = new Component({}, compOpts);
    parentA.set('uid', 'parentA');
    parentB.set('uid', 'parentB');

    const [child] = parentA.append({ tagName: 'div' });
    child.set('uid', 'c1');

    em.set('Patches', pm);
    parentA.components().setParent(parentA);
    parentB.components().setParent(parentB);

    state = initState([parentA, parentB, child]);
    const before = JSON.parse(JSON.stringify(state));
    events.length = 0;

    parentA.components().remove(child, { temporary: true });
    parentB.components().add(child, { at: 0 });
    await flush();

    const patches = getUpdatePatches(events);
    expect(patches).toHaveLength(1);

    const patch = patches[0];
    state = applyPatches(state, patch.changes);
    const after = JSON.parse(JSON.stringify(state));

    pm.undo();
    expect(state).toEqual(before);

    pm.redo();
    expect(state).toEqual(after);
  });
});
